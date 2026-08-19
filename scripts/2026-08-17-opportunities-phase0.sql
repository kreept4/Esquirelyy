-- ============================================================
-- Phase 0: `opportunities` brought up to what the LBVIP card needs.
-- Run in: Supabase → SQL Editor. Written 2026-08-17.
-- ============================================================
--
-- ⚠ THIS IS NOT A CREATE TABLE, AND THE SHIP PLAN SAYS IT SHOULD BE.
--
-- The plan's Phase 0 task 1 reads "Supabase migration for a new `opportunities`
-- table". There is already one. It is in the live database, it is in no
-- migration in this repository, and `git log --all -S"create table
-- public.opportunities"` returns nothing, so it was typed into the SQL editor
-- and never written down. Its columns — qc_score, qc_notes, flag_reason,
-- source_url — are the research agent's vocabulary rather than the product's.
--
-- CREATE TABLE would therefore fail, and CREATE TABLE IF NOT EXISTS would be
-- worse: it would succeed silently, change nothing, and leave every later step
-- writing to columns that do not exist. So this file adds only what is missing
-- and touches nothing that is already there.
--
-- ⚠ SAFE TO RUN AGAINST PRODUCTION, and safe to run twice. Every statement is
-- guarded. Nothing drops, renames, or retypes a column, per pre-flight rule two.
-- Run it one block at a time and report the first error, the same way
-- 2026-08-05-grant-service-role-minimal.sql is meant to be run.
--
-- ============================================================
-- THE FOUR PLACES THIS DEPARTS FROM THE PLAN, AND WHY
-- ============================================================
--
-- 1. NO `external_link` COLUMN. The table already has `link`, which is the same
--    field under a different name. Adding `external_link` beside it would give
--    the row two places to put one URL, and within a month half the rows would
--    use one and half the other. `link` is what exists, so `link` is what the
--    seed and the card use.
--
-- 2. `deadline` STAYS `date`. The plan asks for timestamptz. Changing a live
--    column's type is exactly what pre-flight rule two forbids, and the cost of
--    obeying it is nil: LBVIP closes on 23 August 2026, which is a date. No
--    opportunity so far has needed a closing *time*. If one ever does, that is
--    a new nullable `deadline_at` column, not a retype of this one.
--
-- 3. `practice_areas`, PLURAL. The plan says `practice_area`. The `jobs` table
--    already has `practice_areas` and all twenty rows are tagged. Phase 3 adds
--    one filter UI across jobs, internships and opportunities; giving the two
--    tables different names for the same concept would mean that filter
--    carrying a per-table column map for no reason at all. Matching `jobs` is
--    worth more than matching the plan's prose.
--
-- 4. NO `active` BOOLEAN. The table already has `status`, defaulting to
--    'published'. The plan's "public read on active rows" is expressed against
--    that instead. A second flag meaning nearly the same thing is how a row
--    ends up active and unpublished at once.

-- ---------------------------------------------------------------
-- STEP 1 — look before touching. Changes nothing.
--
-- Run this alone and read it before going further. It answers the three things
-- that decide whether the rest of this file is right: whether the table holds
-- real rows or agent scratch, whether RLS is on, and whether any policy exists.
--
-- A table with RLS ON and NO POLICY is unreachable by the anon key — the
-- deliberate pattern used by agent_proposals and password_history. A table with
-- RLS OFF is readable by anyone holding the anon key, which ships in the
-- browser bundle. Those two need opposite follow-ups, and neither is visible
-- from outside the database.
-- ---------------------------------------------------------------
SELECT
  (SELECT count(*) FROM public.opportunities)                                AS total_rows,
  (SELECT count(*) FROM public.opportunities WHERE status = 'published')     AS published_rows,
  (SELECT max(created_at) FROM public.opportunities)                         AS newest_row,
  c.relrowsecurity                                                           AS rls_enabled,
  (SELECT count(*) FROM pg_policies p
     WHERE p.schemaname = 'public' AND p.tablename = 'opportunities')        AS policy_count,
  (SELECT tableowner FROM pg_tables
     WHERE schemaname = 'public' AND tablename = 'opportunities')            AS table_owner
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'opportunities';


-- ---------------------------------------------------------------
-- STEP 2 — the columns the LBVIP card needs and the table lacks.
--
-- All nullable, no defaults that rewrite existing rows, so every row already in
-- the table stays valid and every existing INSERT keeps working.
-- ---------------------------------------------------------------

-- Who may apply, as written by the source rather than as summarised by us.
-- LBVIP's is "Law Students, Law Graduates, and New Wigs", and the plan is
-- explicit that it must display as written rather than being narrowed to
-- students. Free text, not an enum, because every programme words this
-- differently and flattening it is what loses the third group.
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS eligibility text;

/*
 * The ordered steps an applicant works through.
 *
 * ⚠ THIS COLUMN IS THE REASON THE OPPORTUNITIES TABLE EXISTS AT ALL, rather
 * than LBVIP going into `jobs` as a row with a longer how_to_apply. A job has
 * one action: send a CV to an address, or open an apply_url. LBVIP has three,
 * they are ordered, two of them happen off the platform, and the second cannot
 * be started until the first is finished. Flattening that into a paragraph is
 * what produces an applicant who uploads the video and never tags the firm.
 *
 * jsonb array of objects, not a text array: a step needs more than a sentence.
 * The shape the card reads is
 *
 *   [{ "step": 1, "title": "...", "detail": "...", "off_platform": true }]
 *
 * `off_platform` is what lets the card be honest that step three leaves
 * Esquirely for a Google Form, which is also what Phase 5 has to disclose in
 * the Privacy Policy. Not a constraint, because a check constraint on jsonb
 * shape is unmaintainable; OpportunityCard validates on read.
 */
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS application_steps jsonb;

-- The firm's own handles, shown so an applicant can verify the opportunity
-- against the source before recording anything. LBVIP asks for a public post
-- tagging the firm, so getting the handle wrong is a wasted application rather
-- than a cosmetic error. Shape: {"instagram": "...", "linkedin": "...", "x": "..."}
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS firm_handles jsonb;

/*
 * A logo the row can carry without a repository deploy.
 *
 * ⚠ A FALLBACK, NOT THE PRIMARY, and the precedence is the same one
 * 2026-08-15-agent-schema.sql sets out for jobs.logo_url. Marks resolve through
 * logoForEmployer() in lib/firms-data.ts first, because those files have been
 * through normalise-logos.mjs and share a common cap height, which is why a row
 * of them reads as a row rather than a jumble. This column is for an employer
 * with no curated file yet.
 *
 * LBVIP does not need it. Lekan Bamidele & Co is already in the directory and
 * public/firm-logos/lekan-bamidele.png already exists, so the seed leaves this
 * null and the existing resolver finds the mark — which is what the plan means
 * by reusing the logo rather than uploading it again.
 */
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Phase 3's tagging, added now so Phase 3 is a backfill rather than a second
-- migration. Plural to match jobs.practice_areas — see note 3 in the header.
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS practice_areas text[];


-- ---------------------------------------------------------------
-- STEP 3 — the type vocabulary, without breaking what is already stored.
--
-- The plan wants type restricted to the five kinds it names. A plain CHECK
-- would be validated against every existing row and would fail the whole
-- migration if the agent ever wrote a sixth value — and STEP 1 is the only
-- thing that would have told us, which is why this does not depend on the
-- answer.
--
-- NOT VALID means the constraint binds every INSERT and UPDATE from now on and
-- leaves rows already present alone. That is the additive form of a constraint.
-- Once STEP 1 confirms the existing rows conform, it can be promoted with
--   ALTER TABLE public.opportunities VALIDATE CONSTRAINT opportunities_type_check;
-- which is a separate, reversible decision rather than a hidden part of this one.
-- ---------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.opportunities'::regclass
      AND conname = 'opportunities_type_check'
  ) THEN
    ALTER TABLE public.opportunities
      ADD CONSTRAINT opportunities_type_check
      CHECK (type IN ('internship', 'virtual_internship', 'webinar', 'workshop', 'event'))
      NOT VALID;
  END IF;
END $$;


-- ---------------------------------------------------------------
-- STEP 4 — row level security.
--
-- Enabling RLS on a table that already has it is a no-op, so this is safe
-- whatever STEP 1 reported. The policies are dropped and recreated rather than
-- guarded, because CREATE POLICY has no IF NOT EXISTS and a stale policy with
-- the same name is worse than a rewritten one.
--
-- ⚠ READ IS SCOPED TO status = 'published'. This is the whole security property
-- of the table. The agent writes rows it has not been approved to publish, and
-- an unscoped read policy would put an unverified opportunity — sometimes
-- scraped from a page the agent misread — in front of members. Same reasoning
-- as the note on agent_proposals.
-- ---------------------------------------------------------------
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opportunities public read published" ON public.opportunities;
CREATE POLICY "opportunities public read published"
  ON public.opportunities
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- No write policy for anon or authenticated, deliberately. Writes are the
-- service role's only, and the service role bypasses RLS, so the absence of a
-- policy here IS the write rule. Adding a FOR ALL policy scoped to service_role
-- would read as though it were doing something and would not be.


-- ---------------------------------------------------------------
-- STEP 5 — the grants, without which none of STEP 4 works.
--
-- ⚠ RLS AND TABLE PRIVILEGES ARE TWO DIFFERENT GATES and this project has now
-- been caught by the gap between them three times: `jobs` in
-- 2026-08-05-grant-service-role-minimal.sql, `agent_proposals` in
-- 2026-08-15-agent-schema.sql, and this table, which answers a PostgREST 403
-- with code 42501 to a client holding the service role key. That reads like an
-- RLS problem and is not one.
--
-- anon is listed because the public read genuinely runs as anon: jobs/page.tsx
-- builds its client with NEXT_PUBLIC_SUPABASE_ANON_KEY, and the Featured
-- Opportunities section added in Phase 0 sits on that same page. A policy
-- without a grant would leave that section empty with no error worth reading.
-- ---------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.opportunities TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO service_role;

-- Deadline first, because every surface that lists opportunities orders by it
-- and filters out what has closed.
CREATE INDEX IF NOT EXISTS opportunities_status_deadline_idx
  ON public.opportunities (status, deadline);


-- ---------------------------------------------------------------
-- STEP 6 — verify. Every column true, every privilege true.
-- ---------------------------------------------------------------
SELECT
  to_regclass('public.opportunities')                                     IS NOT NULL AS table_exists,
  has_table_privilege('anon',        'public.opportunities', 'SELECT')                AS anon_can_read,
  has_table_privilege('service_role','public.opportunities', 'SELECT')                AS svc_can_read,
  has_table_privilege('service_role','public.opportunities', 'INSERT')                AS svc_can_insert,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'opportunities')                     AS policy_count,
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'opportunities'
       AND column_name IN ('eligibility','application_steps','firm_handles',
                           'logo_url','practice_areas'))                              AS new_columns_present;
-- Expect: true, true, true, true, 1, 5
