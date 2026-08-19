-- ============================================================
-- Phase 0, correction. Run AFTER 2026-08-17-opportunities-phase0.sql.
-- Run in: Supabase → SQL Editor. Written 2026-08-17. Applied 2026-08-17.
-- ============================================================
--
-- The first file added its columns correctly and got two things wrong. Both
-- passed its own verification query, which is the part worth keeping:
-- `policy_count = 3` and `new_columns = 5` both read as success.
--
-- ⚠ NO DO BLOCKS IN THIS FILE, DELIBERATELY. The first draft of it used
-- `DO $$ ... END $$` for the empty-table guard and to drop policies by
-- iteration. The Supabase SQL editor splits submitted SQL on semicolons, so it
-- tore both blocks apart and failed with a syntax error pointing at the
-- statement AFTER the block, which is a confusing place to be sent. Everything
-- here is plain statements for that reason. If a future migration needs
-- procedural SQL, run it one block at a time or expect the same.
--
-- ============================================================
-- FAULT ONE: AN ANON CLIENT COULD READ UNPUBLISHED ROWS
-- ============================================================
--
-- Verified against production rather than reasoned about. A row inserted with
-- status = 'flagged' by the service role came back through PostgREST to a
-- client holding only the anon key, which ships in the browser bundle.
--
-- The first file's policy is correct in isolation. It was not in isolation.
-- The table already carried two policies and POSTGRES OR'S PERMISSIVE POLICIES
-- TOGETHER — a row is visible if ANY policy admits it — so adding a scoped
-- policy beside an unscoped one does not narrow anything. It adds one more way
-- in. `policy_count` going 2 -> 3 was the only signal and it looked like
-- confirmation.
--
-- The culprit, once listed:
--
--   policyname  Service role has full access to opportunities
--   cmd         ALL
--   roles       {public}          <-- every role, anon included
--   using       true
--
-- Named for the service role, granted to `public`. In Postgres `public` is not
-- "the public read policy", it is EVERY role. And the policy was pointless even
-- on its own terms: the service role bypasses RLS, so it did nothing for its
-- namesake and everything for the anon key.
--
-- WHY IT MATTERS ON THIS TABLE SPECIFICALLY. This is the research agent's
-- output. 'flagged' and 'rejected' are rows the agent was unsure about or that
-- failed its own quality check, sometimes scraped from a page it misread. Those
-- are precisely the rows that must never reach a member.
--
-- ============================================================
-- FAULT TWO: THE TYPE CONSTRAINT WAS SILENTLY SKIPPED
-- ============================================================
--
-- The first file guarded ADD CONSTRAINT with IF NOT EXISTS on the name
-- `opportunities_type_check`. A constraint with that exact name already
-- existed, so the guard did its job, decided there was nothing to do, and left
-- the OLD vocabulary in force. Nothing failed. Nothing was logged.
--
-- The old vocabulary, discovered by probing production because no migration in
-- this repository records this table at all:
--
--   type    internship, job, scholarship
--   target  undergraduate, graduate, all
--   status  published, flagged, rejected
--
-- That is a job-board ingestion pipeline, not the product's opportunities
-- table. LBVIP is a virtual_internship, which the constraint rejected outright,
-- so Phase 0's seed could not have inserted it. The first file's verification
-- counted columns and privileges and never attempted a write, which is why it
-- missed this. A migration that adds a constraint should try to violate it.
--
-- ============================================================
-- WHY DROP AND RECREATE IS SAFE HERE, AND WOULD NOT NORMALLY BE
-- ============================================================
--
-- Pre-flight rule two forbids dropping or retyping on a table with live data.
-- This table had none: total_rows = 0, newest_row NULL, and nothing under src/
-- references it by name. The rule protects rows and there were none to protect.
-- Emptiness was re-checked against production immediately before this ran, not
-- taken from the earlier reading.
--
-- The type vocabulary is a UNION rather than a replacement: internship, job and
-- scholarship stay so the agent's own writes keep working, and the four kinds
-- Phase 0 needs are added beside them.
--
-- target and status are deliberately NOT widened. LBVIP is open to students,
-- graduates and new wigs, which is 'all', and the exact wording lives in the
-- `eligibility` column rather than in that coarse bucket. 'published' is the
-- only status the product writes.

-- ---------------------------------------------------------------
-- STEP 1 — the type vocabulary Phase 0 needs.
-- ---------------------------------------------------------------
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_type_check;

ALTER TABLE public.opportunities
  ADD CONSTRAINT opportunities_type_check
  CHECK (type IN ('internship','job','scholarship',
                  'virtual_internship','webinar','workshop','event'));

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- STEP 2 — one read policy, and only one.
--
-- Dropped by name rather than by iteration, because the DO block that would
-- have done it generically could not survive the editor. The names came from
-- listing pg_policies first, which is the step to repeat if this ever has to be
-- re-derived:
--
--   SELECT policyname, cmd, roles::text, qual FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'opportunities';
--
-- "Public can view published opportunities" was scoped identically to ours and
-- was dropped only as a duplicate, not as a fault. Ours is kept because it
-- names its roles explicitly instead of relying on `public`, which is the
-- ambiguity that produced the leak in the first place.
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Service role has full access to opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Public can view published opportunities" ON public.opportunities;

-- Recreated here so this file is complete on its own. The first migration also
-- creates it; running both in order is idempotent.
DROP POLICY IF EXISTS "opportunities public read published" ON public.opportunities;
CREATE POLICY "opportunities public read published"
  ON public.opportunities FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- No write policy, deliberately. The service role bypasses RLS, so the absence
-- of one IS the write rule. anon writes are refused by the privilege gate,
-- which the probe confirmed with a 401 rather than a policy denial.

-- ---------------------------------------------------------------
-- STEP 3 — verify. Expect exactly one row:
--   opportunities public read published | SELECT | {anon,authenticated}
-- ---------------------------------------------------------------
SELECT policyname, cmd, roles::text AS applies_to, qual AS using_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'opportunities';

-- ============================================================
-- VERIFIED AGAINST PRODUCTION AFTER RUNNING, 2026-08-17
-- ============================================================
--
-- Policy listing alone would not have proved this, so it was exercised:
--
--   service_role inserts status='flagged'   201
--   anon reads that row                     200 []        <- was 1 row before
--   anon attempts a write                   401 permission denied
--   anon reads a published row              visible       <- not over-tight
--   all seven type values                   accepted
--   an invented eighth type value           rejected
--   rows left behind                        0
--
-- The "anon reads a published row" line matters as much as the empty one. A
-- policy that blocks everything also passes a leak test, and the Featured
-- Opportunities section would have shipped empty.
