-- ============================================================
-- Per-user daily quota on the AI routes. Run in: Supabase → SQL Editor.
-- Written 2026-08-15. Safe to re-run.
-- ============================================================
--
-- ⚠ RUN THE GRANT AT THE BOTTOM. On this project a newly created table does
-- NOT inherit a privilege for service_role, and the symptom is a PostgREST 403
-- with code 42501 that reads like an RLS problem and is not one. This has now
-- caught three tables — see scripts/2026-08-05-grant-service-role-minimal.sql
-- and the note in the 15 August agent schema.
--
-- ------------------------------------------------------------
-- WHY THIS EXISTS
-- ------------------------------------------------------------
--
-- src/lib/api-auth.ts already said it, before any of this happened:
--
--   "⚠ THIS IS AUTHENTICATION, NOT A RATE LIMIT. It means an attacker needs an
--    account... It does NOT stop a signed-in user looping the expensive routes.
--    A per-user quota on the AI endpoints is the next piece of this and is not
--    in here."
--
-- This is that piece. Five routes call Claude, the most expensive of them at
-- 16,000 output tokens on Opus, and until now a free account was the only thing
-- between a loop and the bill. On 15 August the opportunities agent spent about
-- $47 in a night through a different hole; the tools have the same shape of
-- exposure and none of the excuse, because the warning was already written down.
--
-- ------------------------------------------------------------
-- WHY A ROW PER CALL RATHER THAN A COUNTER
-- ------------------------------------------------------------
--
-- A counter needs read-modify-write, which over PostgREST means either a
-- database function or a race. A row per call is a plain INSERT — atomic on its
-- own, no function to maintain, and it keeps WHEN each call happened, which is
-- what you actually want when working out where a bill came from.
--
-- The volume is trivial: a few hundred rows a day at the very most. Prune with
--   delete from public.ai_usage where created_at < now() - interval '90 days';

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),

  /**
   * Deliberately NOT a foreign key to auth.users.
   *
   * This is a billing ledger, and it has to survive the thing it describes. If
   * a member deletes their account, the record that their calls happened is
   * exactly what you still need when reconciling a month's spend — a cascade
   * would erase the evidence along with the user.
   */
  user_id uuid not null,

  /** 'cv-generate', 'cv-review', 'cover-letter', … — matches AI_LIMITS in
   *  src/lib/ai-quota.ts. Text rather than an enum so adding a route is a code
   *  change and not a migration. */
  route text not null,

  created_at timestamptz not null default now()
);

/* The only query this table serves: how many calls has this user made to this
   route since midnight. Ordered by time so the count is an index scan. */
create index if not exists ai_usage_user_route_time_idx
  on public.ai_usage (user_id, route, created_at desc);

/* Unreachable with the anon key, which ships in the browser bundle. A member
   must not be able to read — or delete — their own usage rows. */
alter table public.ai_usage enable row level security;

grant select, insert, delete on public.ai_usage to service_role;
