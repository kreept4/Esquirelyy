-- ============================================================
-- Atomic AI quota claim. Run in: Supabase → SQL Editor.
-- Written 2026-11-11. Safe to re-run.
-- ============================================================
--
-- ------------------------------------------------------------
-- WHY THIS EXISTS
-- ------------------------------------------------------------
--
-- src/lib/ai-quota.ts used to count a user's calls, compare, and then insert,
-- as three separate requests. Its comment called the race "one extra call at
-- the boundary". It was not. Every request that arrives before the first insert
-- lands reads the same count, so thirty requests fired together all pass the
-- daily limit, the burst gap and the platform ceiling at once. One account,
-- one Promise.all, thirty Opus calls.
--
-- This function does the three checks and the insert inside one transaction,
-- behind one advisory lock, so concurrent claims queue and each one sees the
-- row the previous one wrote.
--
-- ⚠ ONE LOCK FOR EVERYBODY, NOT ONE PER USER, ON PURPOSE. A per-user lock would
-- still let two different accounts race past the platform ceiling, which is
-- the check that exists for the many-accounts case. The lock is held for two
-- index scans and an insert, a millisecond or two, at roughly a hundred calls a
-- day. Revisit only if this ever handles hundreds of calls a minute.
--
-- ⚠ clock_timestamp(), NOT now(). now() is the time the transaction STARTED,
-- before it waited on the lock, so a claim that queued behind another would
-- measure its gap from a moment earlier than the row it is comparing against.
-- The insert stamps created_at with clock_timestamp() for the same reason.
--
-- The messages users see live in ai-quota.ts. This returns a reason and lets
-- the app word it.

create or replace function public.claim_ai_quota(
  p_user uuid,
  p_route text,
  p_limit int,
  p_min_gap_seconds int,
  p_global_cap int
) returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_now    timestamptz;
  v_since  timestamptz;
  v_count  int;
  v_last   timestamptz;
  v_global int;
  v_gap    numeric;
begin
  perform pg_advisory_xact_lock(hashtext('public.claim_ai_quota'));

  v_now   := clock_timestamp();
  /* Midnight UTC, computed here rather than passed in, so the window cannot
     be argued with by whoever calls this. */
  v_since := date_trunc('day', v_now at time zone 'utc') at time zone 'utc';

  select count(*), max(created_at)
    into v_count, v_last
    from public.ai_usage
   where user_id = p_user
     and route = p_route
     and created_at >= v_since;

  /* Burst first: a looping user should be told to slow down, not told the
     loop has spent their allowance. */
  if v_last is not null and p_min_gap_seconds > 0 then
    v_gap := extract(epoch from (v_now - v_last));
    if v_gap < p_min_gap_seconds then
      return jsonb_build_object(
        'ok', false,
        'reason', 'burst',
        'wait', greatest(1, ceil(p_min_gap_seconds - v_gap))::int
      );
    end if;
  end if;

  /* The member's own allowance before the platform ceiling, so somebody over
     their limit is told that, not told the site is busy. */
  if v_count >= p_limit then
    return jsonb_build_object('ok', false, 'reason', 'daily');
  end if;

  select count(*) into v_global
    from public.ai_usage
   where created_at >= v_since;

  if v_global >= p_global_cap then
    return jsonb_build_object('ok', false, 'reason', 'global', 'count', v_global);
  end if;

  insert into public.ai_usage (user_id, route, created_at)
  values (p_user, p_route, v_now);

  return jsonb_build_object('ok', true);
end;
$$;

/* ⚠ SERVER ONLY. Supabase grants EXECUTE on new functions to anon and
   authenticated by default, which would put this on the public REST API: any
   visitor could call it with any user id and fill a member's allowance for
   the day. Only the server, with the service role, may claim. */
revoke all on function public.claim_ai_quota(uuid, text, int, int, int) from public, anon, authenticated;
grant execute on function public.claim_ai_quota(uuid, text, int, int, int) to service_role;

/* Leftover default grants. Not reachable through PostgREST, but nothing in the
   browser has any business holding TRUNCATE on the billing ledger. */
revoke truncate, references, trigger on public.ai_usage from anon, authenticated;
