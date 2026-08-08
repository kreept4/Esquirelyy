-- Profile & settings page: the columns it needs.
--
-- READ THIS BEFORE COMPARING AGAINST supabase-schema.sql. That file contains
-- TWO different CREATE TABLE profiles statements (around lines 112 and 320) and
-- the live table matches NEITHER. Live, as measured against the project on
-- 2026-08-08, is exactly:
--
--   id, full_name, email, career_stage, practice_areas, location,
--   onboarding_complete, created_at, updated_at
--
-- In particular `linkedin_url` and `notification_preferences` are described in
-- that file but do not exist in production. Everything below is written against
-- the live table, not against the file, and every statement is IF NOT EXISTS so
-- it is safe to run more than once and safe to run on a database where someone
-- has already added one of these by hand.
--
-- RLS needs no changes: the existing "Users can view/update own profile"
-- policies are row-level, so they cover new columns automatically.

-- ============================================================
-- Taking a break
-- ============================================================
-- `break_until` is the moment the break ends, so a break expires on its own
-- rather than needing anything to run to lift it: every read compares it to
-- now(). A NULL means not on a break. `break_started_at` is kept only so the
-- welcome-back note can say how long they were gone.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS break_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS break_until      TIMESTAMPTZ;

-- ============================================================
-- Notification preferences
-- ============================================================
-- Defaulted ON. Someone who signed up for a jobs board did opt into hearing
-- about jobs, and a default of OFF would quietly make the product useless for
-- everyone who never opens settings.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB
  DEFAULT '{"deadlines": true, "new_listings": true, "weekly_digest": true}'::jsonb;

-- Backfill rows that predate the column: ALTER ... DEFAULT does not touch
-- existing rows on every Postgres path, and a NULL here would read as "no
-- preferences" and be indistinguishable from "everything off".
UPDATE profiles
   SET notification_preferences = '{"deadlines": true, "new_listings": true, "weekly_digest": true}'::jsonb
 WHERE notification_preferences IS NULL;

-- ============================================================
-- LinkedIn
-- ============================================================
-- Populated from the OAuth identity when an account links LinkedIn, NOT typed
-- in by hand, so it is a verified handle rather than a claim. Nullable because
-- most accounts will never link one.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- ============================================================
-- Deletion, with a 30-day grace period
-- ============================================================
-- A stamp, not a boolean, because the deadline has to be shown to the person
-- ("your account will be deleted on the 7th") and computed from something. NULL
-- means no deletion pending. Signing in clears it — see lib/account.ts.
--
-- The grace period is deliberate. This is a job board, and the realistic moment
-- someone presses delete is straight after a rejection; an immediate irreversible
-- erase would serve that person badly. Thirty days is long enough to change your
-- mind and short enough to still be erasure under the NDPA 2023.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

-- The purge job asks exactly one question — "whose grace period has expired?" —
-- so this index is partial. It stays tiny, because the overwhelming majority of
-- rows have NULL here and are not in it at all.
CREATE INDEX IF NOT EXISTS profiles_deletion_requested_at_idx
  ON profiles (deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL;
