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

-- Deleting the account takes the history with it, via the cascade above. That
-- is the same promise the deletion flow already makes about everything else.
