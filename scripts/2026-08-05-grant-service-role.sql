-- Grant the service_role its table privileges. Run in Supabase dashboard -> SQL Editor.
--
-- Why this is needed. The service_role key authenticates fine, but every request
-- came back:
--
--   42501  permission denied for table jobs
--   hint:  GRANT SELECT ON public.jobs TO service_role;
--
-- The key is not the problem. The Postgres role behind it simply holds no
-- privileges on the tables in `public`. Supabase normally grants these when a
-- project is created, so something in how these tables were made revoked them,
-- or they were created by a role that never granted them onward. Note `anon` can
-- still SELECT, which is why the public site reads fine and only writes fail.
--
-- Nothing here weakens security. service_role is already the trusted server-side
-- role and is meant to bypass row-level security; this only restores the access
-- it is supposed to have. RLS for anon and authenticated is untouched.

-- Existing tables and sequences.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Anything created later, so a new table does not reintroduce this.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role;

-- Confirm. Expect true in every column for the jobs table.
SELECT
  has_table_privilege('service_role', 'public.jobs', 'SELECT') AS can_select,
  has_table_privilege('service_role', 'public.jobs', 'INSERT') AS can_insert,
  has_table_privilege('service_role', 'public.jobs', 'UPDATE') AS can_update,
  has_table_privilege('service_role', 'public.jobs', 'DELETE') AS can_delete;
