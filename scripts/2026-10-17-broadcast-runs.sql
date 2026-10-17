-- Broadcast runs: a one-time approval for /api/admin/broadcast-roles, and a
-- ledger of who each send reached.
--
-- WHY THE BROADCAST MOVED INTO THE APP. scripts/send-new-roles.mjs needs the
-- Brevo key on the machine running it, and that machine was a laptop. The key
-- lives in the Vercel project as a SENSITIVE variable, which is write-only: it
-- can be used by the deployed app and read back by nobody. So the only place
-- the broadcast can run without the laptop is inside a deployment, and the
-- route that does it needs two things the script did not:
--
--   1. A way to say "this send is approved" that is not a password in the URL
--      forever. A row in broadcast_runs is that approval. Its id is a long
--      random string, the route claims it by setting started_at in a single
--      UPDATE ... WHERE started_at IS NULL, and a claimed row can never be run
--      again. A leaked URL is a URL for a send that has already happened.
--
--   2. A memory of who has already been written to, because a serverless
--      function can time out half way through a list and the script's
--      "retry these with --only" printout has nowhere to go. broadcast_sends
--      records every attempt as it happens, and a second run for the same drop
--      skips everyone the first one reached.
--
-- ⚠ RLS ON, NO POLICIES. Nothing but the service role can read or write either
-- table. A run id must never be readable by a signed-in member, or any member
-- could trigger a send to everyone.

create table if not exists public.broadcast_runs (
  id            text primary key,
  -- NEW_ROLES.id at the time of approval. The route refuses to run if the
  -- deployed drop has changed since, so an approval cannot be spent on copy
  -- nobody looked at.
  drop_id       text not null,
  -- Set for a test send: exactly this address, whether or not it is a member,
  -- the way scripts/send-test-new-roles.mjs works.
  only_email    text,
  -- Greeting name for a test send to an address with no profile.
  display_name  text,
  created_at    timestamptz not null default now(),
  started_at    timestamptz,
  finished_at   timestamptz,
  sent          integer,
  failed        integer,
  skipped       integer
);
alter table public.broadcast_runs enable row level security;

create table if not exists public.broadcast_sends (
  id       bigint generated always as identity primary key,
  run_id   text not null references public.broadcast_runs(id),
  drop_id  text not null,
  -- 'test' rows never count as "already reached" for the real broadcast.
  kind     text not null check (kind in ('test', 'broadcast')),
  email    text not null,
  ok       boolean not null,
  error    text,
  sent_at  timestamptz not null default now()
);
alter table public.broadcast_sends enable row level security;
create index if not exists broadcast_sends_drop_kind_email
  on public.broadcast_sends (drop_id, kind, email);
