-- Minimal grant. Run in Supabase dashboard -> SQL Editor, ONE BLOCK AT A TIME.
--
-- The fuller script (2026-08-05-grant-service-role.sql) failed. This strips out
-- everything optional so the essential grant has the best chance of applying,
-- and separates the statements so a failure tells us exactly which one is the
-- problem rather than rolling the whole thing back.
--
-- Run step 1. If it succeeds, run step 2, and so on. Report the first error.

-- ---------------------------------------------------------------
-- STEP 1 -- who are we, and who owns the table?
-- Run this alone first. It changes nothing and tells us what we are dealing
-- with. If tableowner is not 'postgres', that is why the GRANT failed.
-- ---------------------------------------------------------------
SELECT
  current_user                       AS running_as,
  (SELECT tableowner FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'jobs') AS jobs_owner;


-- ---------------------------------------------------------------
-- STEP 2 -- the one grant that actually matters.
-- Everything the agent needs is here. If only this works, that is enough.
-- ---------------------------------------------------------------
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO service_role;


-- ---------------------------------------------------------------
-- STEP 3 -- schema access. Usually already granted; harmless if so.
-- ---------------------------------------------------------------
-- GRANT USAGE ON SCHEMA public TO service_role;


-- ---------------------------------------------------------------
-- STEP 4 -- verify. Expect true, true, true, true.
-- ---------------------------------------------------------------
-- SELECT
--   has_table_privilege('service_role', 'public.jobs', 'SELECT') AS can_select,
--   has_table_privilege('service_role', 'public.jobs', 'INSERT') AS can_insert,
--   has_table_privilege('service_role', 'public.jobs', 'UPDATE') AS can_update,
--   has_table_privilege('service_role', 'public.jobs', 'DELETE') AS can_delete;


-- ---------------------------------------------------------------
-- STEP 5 -- only if step 2 failed with "must be owner of table jobs".
-- Reassign ownership to postgres, then retry step 2.
-- ---------------------------------------------------------------
-- ALTER TABLE public.jobs OWNER TO postgres;
