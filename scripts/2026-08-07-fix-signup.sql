-- ============================================================================
-- FIX: "Database error saving new user" — nobody can create an account.
-- Run in Supabase dashboard -> SQL Editor. Idempotent; safe to run twice.
-- ============================================================================
--
-- THE SYMPTOM, MEASURED
--
--   POST https://<project>.supabase.co/auth/v1/signup
--   -> 500 {"code":500,"error_code":"unexpected_failure",
--           "msg":"Database error saving new user"}
--
-- GoTrue returns that message for exactly one situation: the INSERT into
-- auth.users succeeded, and something attached to it threw. The only thing
-- attached to it is our own AFTER INSERT trigger, `on_auth_user_created`, which
-- calls `public.handle_new_user()` and writes a row into `public.profiles`.
-- GoTrue wraps both in one transaction, so when the profile write throws, the
-- auth user is rolled back with it and the account is never created.
--
-- WHAT IS ACTUALLY BROKEN — two faults, either one fatal
--
-- 1. `public.profiles` has no table-level GRANTs. Proved directly:
--
--      POST /rest/v1/profiles  (as service_role)
--      -> 403 42501 "permission denied for table profiles"
--           hint: "Grant the required privileges to the current role with:
--                  GRANT SELECT, INSERT ON public.profiles TO service_role;"
--
--    Postgres checks GRANTs before RLS, so this is a privilege fault, not a
--    policy fault. scripts/2026-08-07-grant-profiles.sql diagnosed this and was
--    never applied. Everything in it is folded into step 3 below, so run this
--    file instead of that one.
--
-- 2. `set_tracker_email` is a stale trigger. supabase-schema.sql declares it
--    BEFORE INSERT OR UPDATE ON profiles, and its function reads `NEW.nickname`
--    and writes `NEW.tracker_email`. The live table has neither column:
--
--      id, full_name, email, career_stage, practice_areas,
--      location, onboarding_complete, created_at, updated_at
--
--    A plpgsql function referencing a field the row type does not have throws
--    42703 at runtime, on every single insert. The tracker-email idea was
--    dropped — src/app/tracker/page.tsx says so in as many words — but the
--    trigger was left behind.
--
-- WHY THE FIX IS NOT JUST "ADD THE GRANTS"
--
-- Repairing both faults returns signup to working, but leaves the shape that
-- caused the outage: a bookkeeping row in a public table is allowed to veto
-- account creation. A profile is derived data. It should never be able to stop
-- someone signing up. Step 4 makes the trigger swallow and log its own errors,
-- so the next stale column or missing grant costs us a warning in the Postgres
-- log instead of a total signup outage.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- STEP 1 — look first. Changes nothing. Read the output before continuing.
--
-- Expect to see `set_tracker_email` listed. That is fault 2, confirmed.
-- ---------------------------------------------------------------------------
SELECT
  t.tgname                        AS trigger_name,
  pg_get_triggerdef(t.oid)        AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles'
  AND NOT t.tgisinternal;

-- Who owns what. A SECURITY DEFINER function runs as its owner, so if
-- handle_new_user is owned by a role with no rights on profiles, it fails no
-- matter what the grants say. Both should read `postgres`.
SELECT 'function' AS kind, p.proname AS name, pg_get_userbyid(p.proowner) AS owner
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('handle_new_user', 'generate_tracker_email')
UNION ALL
SELECT 'table', c.relname, pg_get_userbyid(c.relowner)
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles';

-- Current privileges. Expect false across the board — that is fault 1.
SELECT
  has_table_privilege('anon',          'public.profiles', 'SELECT') AS anon_select,
  has_table_privilege('authenticated', 'public.profiles', 'SELECT') AS auth_select,
  has_table_privilege('authenticated', 'public.profiles', 'INSERT') AS auth_insert,
  has_table_privilege('service_role',  'public.profiles', 'INSERT') AS svc_insert;


-- ---------------------------------------------------------------------------
-- STEP 2 — remove the stale trigger.
--
-- Dropped rather than repaired. The columns it wants were never added because
-- the feature was abandoned; adding `nickname` and `tracker_email` now would be
-- reviving a dead idea to satisfy a trigger nobody wants.
-- ---------------------------------------------------------------------------
DROP TRIGGER  IF EXISTS set_tracker_email ON public.profiles;
DROP FUNCTION IF EXISTS public.generate_tracker_email();


-- ---------------------------------------------------------------------------
-- STEP 3 — the grants.
--
-- `authenticated` is the role the browser runs as once signed in; it needs
-- INSERT and UPDATE for the onboarding and QuickQuestions upserts. `anon` gets
-- SELECT only — a signed-out visitor has no profile to write and RLS would
-- reject the row regardless. These are the privileges Supabase grants by
-- default on project creation; nothing here weakens security, because it is RLS
-- (untouched, and reasserted in step 5) that stops one user reading another's
-- row.
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE         ON public.profiles TO authenticated;
GRANT SELECT                         ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;


-- ---------------------------------------------------------------------------
-- STEP 4 — make the trigger unable to break signup again.
--
-- Four changes from the version in supabase-schema.sql:
--
--   SET search_path = public
--     The trigger fires in a `supabase_auth_admin` session whose search_path is
--     not ours. Pinning it means an unqualified name can never resolve to some
--     other schema's object. Also closes the search-path hijack that makes an
--     unpinned SECURITY DEFINER function a privilege-escalation vector.
--
--   email is populated
--     The live table has an `email` column that nothing was filling, so every
--     profile row had it NULL.
--
--   ON CONFLICT (id) DO NOTHING
--     Makes a re-fired trigger harmless instead of a duplicate-key throw.
--
--   EXCEPTION WHEN OTHERS
--     The important one. A failed profile write now logs and returns, so the
--     auth user still commits and the person still gets their account. Look for
--     `handle_new_user failed` in Logs -> Postgres to catch anything that would
--     previously have been an outage.
--
-- The exception handler is deliberately last, so it cannot mask the two faults
-- this file fixes: steps 2 and 3 must actually be run. It is a floor, not a
-- substitute for the repair.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for % : % (SQLSTATE %)',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- The function must be owned by a role that can write profiles, since
-- SECURITY DEFINER runs as the owner. `postgres` owns the table.
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---------------------------------------------------------------------------
-- STEP 5 — RLS policies for the writes.
--
-- Grants let `authenticated` touch the table; policies decide which rows. The
-- original schema shipped a SELECT policy and no INSERT or UPDATE policy, so
-- the onboarding upserts would still be rejected once the grants land. WITH
-- CHECK is the half most often missed: USING governs which existing rows are
-- visible, WITH CHECK governs which rows may be written.
--
-- Dropped and recreated by name so this file is safe to re-run.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- STEP 6 — backfill. The trigger only fires on new users; anyone who signed up
-- before this file ran has no profile row, or one with a NULL email.
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email)
SELECT
  u.id,
  NULLIF(TRIM(COALESCE(u.raw_user_meta_data->>'full_name', '')), ''),
  u.email
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS DISTINCT FROM u.email;


-- ---------------------------------------------------------------------------
-- STEP 7 — verify. Every column below should read true, and the trigger list
-- should now contain only `profiles_updated_at`.
-- ---------------------------------------------------------------------------
SELECT
  has_table_privilege('anon',          'public.profiles', 'SELECT') AS anon_select,
  has_table_privilege('authenticated', 'public.profiles', 'SELECT') AS auth_select,
  has_table_privilege('authenticated', 'public.profiles', 'INSERT') AS auth_insert,
  has_table_privilege('authenticated', 'public.profiles', 'UPDATE') AS auth_update,
  has_table_privilege('service_role',  'public.profiles', 'INSERT') AS svc_insert;

SELECT t.tgname AS remaining_triggers_on_profiles
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles' AND NOT t.tgisinternal;
