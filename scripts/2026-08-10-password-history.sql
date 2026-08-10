-- Password history, so a password cannot be reused.
--
-- WHY THIS TABLE EXISTS AT ALL. Supabase Auth stores exactly one password hash
-- per user, the current one, and offers no reuse check. "You cannot use a
-- password you have used before" therefore needs its own record, because the
-- moment a password is replaced the old hash is gone.
--
-- WHAT IS STORED IS A HASH, NEVER A PASSWORD. scrypt, with a per-row random
-- salt, written by src/lib/password-history.ts. The rows are useless for
-- signing in: nothing reads this table to authenticate, only to answer "has
-- this exact string been used on this account before".
--
-- NO CLIENT MAY READ OR WRITE IT. RLS is on and there is deliberately NO
-- policy, which in Postgres means every anon and authenticated request is
-- refused. The service role bypasses RLS, and the API route is the only thing
-- holding that key. A user has no reason to read their own password hashes and
-- an attacker with a stolen session token has every reason to, so the table is
-- simply not addressable from the browser.

create table if not exists public.password_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- scrypt output, formatted "scrypt$<salt-hex>$<hash-hex>". The prefix names
  -- the algorithm so a future migration can re-hash without guessing.
  hash text not null,
  created_at timestamptz not null default now()
);

-- The only query this table serves: every hash for one user, newest first.
create index if not exists password_history_user_idx
  on public.password_history (user_id, created_at desc);

alter table public.password_history enable row level security;

-- Deliberately no policies. See the note above.

-- THE GRANT IS NOT OPTIONAL ON THIS PROJECT. Supabase normally grants the
-- built-in roles table privileges by default, and on most projects the two
-- statements above would be the whole migration. This one has had those
-- defaults revoked (see 2026-08-05-grant-service-role.sql for the episode that
-- established that), so a new table is unreachable by every role including
-- service_role until it is granted explicitly. Without this, RLS is not what
-- refuses the API route: a plain 42501 permission error is, and the password
-- change fails on the history read before RLS is ever consulted.
--
-- SELECT, INSERT and DELETE, and deliberately not UPDATE. A hash is written
-- once and either read or dropped when it falls past the depth limit. Nothing
-- in the code path edits a row in place, so the privilege to do it is not
-- given.
grant select, insert, delete on public.password_history to service_role;

-- Nothing is granted to anon or authenticated, on purpose. Those are the roles
-- a browser holds, and this table is not for them.

-- Verify. Expect true, true, true, then false.
-- select
--   has_table_privilege('service_role', 'public.password_history', 'SELECT') as svc_select,
--   has_table_privilege('service_role', 'public.password_history', 'INSERT') as svc_insert,
--   has_table_privilege('service_role', 'public.password_history', 'DELETE') as svc_delete,
--   has_table_privilege('authenticated', 'public.password_history', 'SELECT') as user_select;

-- Deleting the account takes the history with it, via the cascade above. That
-- is the same promise the deletion flow already makes about everything else.
