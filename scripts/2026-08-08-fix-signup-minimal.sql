-- ===========================================================================
-- Signup fix, statements only. Paste ALL of this into:
--   Supabase dashboard -> SQL Editor -> New query -> Run
-- Idempotent; safe to run more than once.
--
-- The reasoning behind every line is in scripts/2026-08-07-fix-signup.sql,
-- which also contains the diagnostic SELECTs. This file is that file with the
-- prose and the read-only queries removed, so it runs clean and returns one
-- verification row at the end.
-- ===========================================================================

-- 1. Drop the stale trigger. Its function reads NEW.nickname and writes
--    NEW.tracker_email; the live profiles table has neither column, so it
--    throws 42703 on every insert. The tracker-email feature was abandoned.
DROP TRIGGER  IF EXISTS set_tracker_email ON public.profiles;
DROP FUNCTION IF EXISTS public.generate_tracker_email();

-- 2. The grants. public.profiles has none, and Postgres checks grants before
--    RLS, so this is a privilege fault rather than a policy one. These are the
--    privileges Supabase grants by default on project creation.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE         ON public.profiles TO authenticated;
GRANT SELECT                         ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;

-- 3. Make the trigger unable to take signup down again. A failed profile write
--    now logs a warning and returns, so the auth user still commits. Look for
--    'handle_new_user failed' in Logs -> Postgres.
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

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS policies for the writes. Grants decide who may touch the table;
--    policies decide which rows.
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

-- 5. Backfill anyone who signed up before this ran.
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

-- 6. Verify. Every column below should come back true.
SELECT
  has_table_privilege('anon',          'public.profiles', 'SELECT') AS anon_select,
  has_table_privilege('authenticated', 'public.profiles', 'SELECT') AS auth_select,
  has_table_privilege('authenticated', 'public.profiles', 'INSERT') AS auth_insert,
  has_table_privilege('authenticated', 'public.profiles', 'UPDATE') AS auth_update,
  has_table_privilege('service_role',  'public.profiles', 'INSERT') AS svc_insert;
