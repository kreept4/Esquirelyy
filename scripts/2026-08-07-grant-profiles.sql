-- Restore table privileges on public.profiles.
-- Run in Supabase dashboard -> SQL Editor.
--
-- WHAT IS WRONG
--
-- `profiles` is the only table in the schema with no table-level GRANTs. Every
-- role hits the same wall:
--
--   anon     profiles      42501 permission denied for table profiles
--   service  profiles      42501 permission denied for table profiles
--   anon     applications  ok
--   anon     jobs          ok
--   anon     cv_reviews    ok
--
-- This is a GRANT problem, not a row-level-security problem. RLS decides which
-- rows a role may touch; GRANTs decide whether it may touch the table at all,
-- and Postgres checks GRANTs first. A missing GRANT returns 42501 rather than
-- an empty result, which is exactly what we see.
--
-- The earlier grant script (2026-08-05-grant-service-role.sql) fixed `jobs` and
-- was never applied to `profiles`.
--
-- WHAT IT BREAKS TODAY
--
-- Three call sites write or read profiles, and all three fail silently because
-- none of them checks the returned error:
--
--   src/app/auth/callback/route.ts     reads onboarding_complete after Google
--                                      sign-in. The read always fails, so
--                                      `profile` is always null, so EVERY
--                                      returning Google user is sent back
--                                      through onboarding, every single time.
--
--   src/app/auth/onboarding/page.tsx   upserts career_stage and goals.
--   src/components/features/           upserts the same from the homepage quiz.
--     QuickQuestions.tsx
--
-- So every onboarding answer any user has ever given has been thrown away, and
-- the product has no idea, because the upserts discard their error.
--
-- Nothing here weakens security. These are the privileges Supabase grants by
-- default on project creation. RLS on profiles is untouched, and it is RLS that
-- keeps one user from reading another's row.

-- ---------------------------------------------------------------
-- STEP 1 -- look before touching anything. Changes nothing.
-- Confirms the table exists, who owns it, and whether RLS is on.
-- ---------------------------------------------------------------
SELECT
  c.relname                                    AS table_name,
  pg_get_userbyid(c.relowner)                  AS owner,
  c.relrowsecurity                             AS rls_enabled,
  has_table_privilege('anon',          'public.profiles', 'SELECT') AS anon_select,
  has_table_privilege('authenticated', 'public.profiles', 'SELECT') AS auth_select,
  has_table_privilege('authenticated', 'public.profiles', 'INSERT') AS auth_insert,
  has_table_privilege('service_role',  'public.profiles', 'SELECT') AS svc_select
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles';


-- ---------------------------------------------------------------
-- STEP 2 -- the grants. Run after step 1 returns.
--
-- `authenticated` is the one that matters for real users: it is the role the
-- browser client runs as once someone is signed in, and it is what the two
-- upserts above need. `anon` gets SELECT only, because a signed-out visitor has
-- no profile to write and RLS would reject the row anyway.
-- ---------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT                  ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;


-- ---------------------------------------------------------------
-- STEP 3 -- confirm RLS still protects the rows.
--
-- Run this and read the output. You are looking for policies that scope both
-- reads and writes to auth.uid() = id. If SELECT comes back with no policy while
-- RLS is enabled, authenticated users will read zero rows and the sign-in
-- redirect stays broken for a different reason.
-- ---------------------------------------------------------------
SELECT polname, cmd, qual, with_check
FROM (
  SELECT
    p.polname,
    CASE p.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT'
                  WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE'
                  ELSE 'ALL' END                          AS cmd,
    pg_get_expr(p.polqual,      p.polrelid)               AS qual,
    pg_get_expr(p.polwithcheck, p.polrelid)               AS with_check
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  WHERE c.relname = 'profiles'
) s;


-- ---------------------------------------------------------------
-- STEP 4 -- if step 3 shows no INSERT/UPDATE policy, the upserts will still be
-- rejected by RLS even with the grants above. This adds the standard own-row
-- policy. Safe to skip if step 3 already shows one.
--
-- WITH CHECK is what an upsert needs and is the part most often missed: USING
-- governs which existing rows are visible, WITH CHECK governs which new rows
-- may be written.
-- ---------------------------------------------------------------
-- CREATE POLICY "Users can insert own profile" ON public.profiles
--   FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
--
-- CREATE POLICY "Users can update own profile" ON public.profiles
--   FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- ---------------------------------------------------------------
-- STEP 5 -- verify. Expect true across the board.
-- ---------------------------------------------------------------
SELECT
  has_table_privilege('anon',          'public.profiles', 'SELECT') AS anon_select,
  has_table_privilege('authenticated', 'public.profiles', 'SELECT') AS auth_select,
  has_table_privilege('authenticated', 'public.profiles', 'INSERT') AS auth_insert,
  has_table_privilege('authenticated', 'public.profiles', 'UPDATE') AS auth_update,
  has_table_privilege('service_role',  'public.profiles', 'SELECT') AS svc_select;
