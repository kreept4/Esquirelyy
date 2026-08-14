-- ============================================================
-- The agent's tables. Run in: Supabase → SQL Editor → New Query.
-- Written 2026-08-15.
-- ============================================================
--
-- Two changes, and one of them is the reason the agent can exist at all.
--
-- 1. `jobs` learns how to be closed without being deleted.
-- 2. `agent_proposals` records what the agent wants to do and what you said.
--
-- ⚠ THIS FILE IS SAFE TO RUN AGAINST PRODUCTION, unlike supabase-schema.sql,
-- which its own header tells you not to run. Every statement here is guarded
-- with IF NOT EXISTS and nothing drops or rewrites an existing column. Read
-- that warning before you go looking for the schema in the other file.
--
-- ============================================================
-- WHY is_active RATHER THAN CARRYING ON DELETING ROWS
-- ============================================================
--
-- scripts/2026-08-14-remove-stale-jobs.mjs deletes, because until now delisting
-- was something a person did five times in one sitting having checked each row
-- by hand. The header of that script is four paragraphs of reasoning about five
-- listings. That is the correct amount of care, and it does not survive being
-- run on a schedule by a program.
--
-- A mistaken DELETE is unrecoverable and leaves no trace of what was removed or
-- why. A mistaken is_active = false is one UPDATE away from being undone, and
-- the row still says who closed it and on what evidence. When the thing doing
-- the closing is an agent running at 6am, that difference is the whole safety
-- argument.
--
-- DELETE IS STILL RIGHT SOMETIMES, and the agent does not get to make that
-- call. A listing that should 404 honestly — the World Bank internship whose
-- URL went to 69 inboxes — is a human decision, made with the reasoning written
-- down, using the existing script. See the note in lib/open-jobs.ts about what a
-- removed URL must do next; nothing here changes it.
--
-- ⚠ THE READING SIDE IS NOT WIRED UP BY THIS FILE. Adding the column does not
-- hide anything: every query that lists jobs must add `.eq('is_active', true)`
-- or a closed role stays on the board looking open. The pages to change are
-- src/app/jobs/page.tsx, src/app/jobs/[slug]/page.tsx and src/app/sitemap.ts.
-- Until those are changed this column is recorded and ignored, which is a
-- deliberate ordering — the column has to exist before the code can read it —
-- but it is not a finished state.

alter table public.jobs
  add column if not exists is_active boolean not null default true;

alter table public.jobs
  add column if not exists delisted_at timestamptz;

-- Free text, and deliberately not an enum. The reason a listing closed is the
-- most useful thing in this table when somebody asks six weeks later why a role
-- went; "deadline 2026-08-12 passed" and "apply_url 404s, firm's careers page no
-- longer lists it" are both answers an enum would flatten into 'expired'.
alter table public.jobs
  add column if not exists delisted_reason text;

-- When the agent last verified this listing was still real. Null means never
-- checked. Used to spread the crawl: the agent re-checks the least recently
-- checked rows first rather than hammering every employer's site every morning.
alter table public.jobs
  add column if not exists last_checked_at timestamptz;

-- The board's default query is "active listings, newest first".
create index if not exists jobs_active_created_idx
  on public.jobs (is_active, created_at desc);

/**
 * A logo the agent can set without touching the repository.
 *
 * ⚠ THIS IS A FALLBACK AND MUST NOT BECOME THE PRIMARY. Logos on the board come
 * from logoForEmployer() in lib/firms-data.ts, which resolves a firm against the
 * directory or against EMPLOYER_LOGOS — files in public/employer-logos that have
 * been through scripts/normalise-logos.mjs and share a common cap height. That
 * treatment is why a row of marks on the board looks like a row rather than a
 * jumble, and a raw third-party PNG does not have it.
 *
 * This column exists because a serverless function cannot add a file to the
 * repository, so a brand new employer would otherwise always render as the
 * coloured ball. next.config.js already whitelists logo.clearbit.com, so the
 * agent can put a Clearbit URL here derived from the employer's own domain and
 * the listing looks finished on the day it lands.
 *
 * The precedence, implemented in JobsClient: the curated mark if we have one,
 * then this, then the ball. So dropping a proper file into public/employer-logos
 * later silently upgrades every listing for that employer, and nothing has to be
 * cleaned up here.
 */
alter table public.jobs
  add column if not exists logo_url text;

-- ============================================================
-- agent_proposals
-- ============================================================
--
-- One row per thing the agent wants to do. Nothing here is an action; it is a
-- request for one, and `status` records what happened to it.
--
-- WHY THE PROPOSAL IS STORED RATHER THAN LIVING IN THE TELEGRAM MESSAGE.
-- Telegram's callback data is limited to 64 bytes, which is not enough to carry
-- a listing, and a button whose payload IS the action can be replayed by
-- anybody who ever sees the message. Storing the proposal means the button
-- carries an id and nothing else: the row is the single source of truth for
-- what was approved, it can only be acted on once, and there is a record
-- afterwards of what the agent proposed and what you decided.

create table if not exists public.agent_proposals (
  id uuid primary key default gen_random_uuid(),

  -- 'list'       add a new listing to the jobs table
  -- 'delist'     close an existing listing (is_active = false)
  -- 'scholarship' a scholarship or funding call — see the note below
  -- 'email'      send an announcement to members
  kind text not null check (kind in ('list', 'delist', 'scholarship', 'email')),

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'applied', 'failed')),

  /**
   * What the agent wants to do, in full.
   *
   * For 'list' this is a jobs row ready to insert. For 'delist' it is the slug
   * and the current row as it was when the check ran. For 'scholarship' it is
   * the entry — see the note at the bottom of this file about why that one
   * cannot be applied automatically. For 'email' it is the drop being announced.
   */
  payload jsonb not null,

  /**
   * Why the agent believes it. URLs it read, what each one said, the date it
   * checked. This is the part you actually look at before tapping a button, and
   * it is the reason a proposal is worth more than a notification.
   */
  evidence jsonb not null default '{}'::jsonb,

  /**
   * How sure the agent is, 0 to 1, and its own words about what it is unsure of.
   *
   * Not a gate — everything needs approval regardless. It decides the order
   * things are shown in, so the marginal ones are not buried under the obvious
   * ones.
   */
  confidence real,
  caveats text,

  /**
   * A stable identity for the underlying opportunity, so the same role found
   * next Tuesday on a different site does not become a second proposal.
   *
   * ⚠ THIS IS WHAT STOPS THE AGENT NAGGING. Without it, a role you rejected on
   * Monday is rediscovered on Tuesday, proposed again, and the thing becomes
   * unusable within a week — a rejected proposal has to keep suppressing its
   * subject, not just disappear. Unique across every status for exactly that
   * reason: the constraint is doing the suppressing.
   */
  fingerprint text not null unique,

  created_at timestamptz not null default now(),
  decided_at timestamptz,
  applied_at timestamptz,

  -- The Telegram chat and message the proposal was sent as, so the agent can
  -- edit that message in place when a decision is made instead of leaving a
  -- live pair of buttons in the history that no longer do anything.
  telegram_chat_id bigint,
  telegram_message_id bigint,

  -- Whatever went wrong if status is 'failed'.
  error text
);

create index if not exists agent_proposals_status_idx
  on public.agent_proposals (status, created_at desc);

/**
 * RLS on, and NO POLICY AT ALL. This is the password_history pattern and it is
 * intentional: with RLS enabled and no policy, the table is unreachable with the
 * anon key, which ships in the browser bundle. Only the service role can read or
 * write it.
 *
 * That matters more here than it looks. A pending proposal contains a listing
 * nobody has approved yet — unverified, possibly wrong, sometimes scraped from a
 * page the agent misread. It must not be readable by the front end, or an
 * unapproved role becomes visible to members through a table nobody thought of
 * as public.
 */
alter table public.agent_proposals enable row level security;

/**
 * ⚠ AND THE GRANT, WITHOUT WHICH NONE OF THE ABOVE WORKS.
 *
 * RLS and table privileges are two different gates and this project has been
 * caught by the gap between them before — see
 * scripts/2026-08-05-grant-service-role-minimal.sql, which exists because
 * exactly this happened to `jobs`.
 *
 * Enabling RLS with no policy is what keeps the anon key out. It does NOT grant
 * anything to service_role, and on this project newly created tables do not
 * inherit a grant for it either. The symptom is a PostgREST 403 with code 42501
 * — "permission denied for table agent_proposals" — from a client holding the
 * service role key, which reads like an RLS problem and is not one.
 *
 * Running this file without the line below produces an agent that can research
 * perfectly well and cannot record a single proposal.
 */
grant select, insert, update, delete on public.agent_proposals to service_role;

-- ============================================================
-- ⚠ SCHOLARSHIPS CANNOT BE APPLIED AUTOMATICALLY, AND THIS IS NOT AN OVERSIGHT
-- ============================================================
--
-- Scholarships are not in the database. They are TypeScript, in
-- src/lib/scholarships-data.ts, the same as firms. A running Vercel function
-- cannot edit a source file in the repository, so there is no mechanism by which
-- approving a scholarship proposal could put it on the site.
--
-- So 'scholarship' proposals stop at approval. On approval the agent replies in
-- Telegram with the entry formatted as a ready-to-paste TypeScript block, and
-- the row sits at status 'approved' rather than 'applied' until somebody pastes
-- it in and deploys. The row is the record that it was accepted; the deploy is
-- what puts it on the site.
--
-- The alternative — moving scholarships into a table — is a real change to
-- ScholarshipsClient and the page that feeds it, and it is not this file's job
-- to decide it. If that happens, this proposal kind can apply itself like the
-- others and this comment should go.
