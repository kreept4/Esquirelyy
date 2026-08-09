-- ============================================================
-- ESQUIRELY DATABASE SCHEMA
-- Run this in: Supabase → SQL Editor → New Query
-- ============================================================
--
-- ⚠ THIS FILE IS NOT THE LIVE DATABASE, AND HAS NOT BEEN FOR SOME TIME.
--
-- Verified against production on 9 August 2026 with the anon key. Of the tables
-- defined below, `firms`, `listings`, `scholarships`, `saved_listings`, `alerts`
-- and `email_events` DO NOT EXIST. The live schema is:
--
--   jobs                 public, read-only to anon (this file calls it `listings`)
--   profiles             RLS on, own-row only
--   applications         RLS on, own-row only
--   cv_reviews           RLS on, own-row only
--   cv_generations       RLS on, own-row only
--   cover_letters        RLS on, own-row only
--   interview_sessions   RLS on, own-row only
--
-- Firms and scholarships are not database tables at all. They are TypeScript,
-- in src/lib/firms-data.ts and src/lib/scholarships-data.ts, which is why
-- nothing broke when the tables went away.
--
-- ⚠ WHY THAT IS DANGEROUS TO LEAVE UNMARKED, AND THE REASON FOR THIS BLOCK.
-- Lines 266-268 create public-read policies on `firms`, `listings` and
-- `scholarships` while no ALTER TABLE ... ENABLE ROW LEVEL SECURITY is ever
-- issued for them. Read on its own, this file describes a database whose
-- directory is writable by anyone holding the anon key, which is everyone,
-- because the anon key ships in the browser bundle. That reading is alarming,
-- entirely reasonable, and wrong: there is no such table to write to.
--
-- The risk is therefore not the database. It is that someone reads this file,
-- believes it, and either panics or, worse, runs it to "restore" the schema —
-- which would create exactly the unprotected tables the file appears to warn
-- about. DO NOT RUN THIS FILE AGAINST PRODUCTION. If it is ever brought back
-- into use, enable RLS on every table in the same statement that creates it.
--
-- The honest fix is to regenerate this from the live database rather than
-- patch it. Until someone does, treat it as history.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- FIRMS
-- Law firms, chambers, courts, institutions
-- ============================================================
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('tier_1', 'tier_2', 'tier_3', 'boutique', 'court', 'institution')) DEFAULT 'tier_2',
  type TEXT CHECK (type IN ('law_firm', 'chambers', 'court', 'ngo', 'bank', 'government', 'academic')) DEFAULT 'law_firm',
  city TEXT DEFAULT 'Lagos',
  state TEXT DEFAULT 'Lagos',
  description TEXT,
  website TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  practice_areas TEXT[] DEFAULT '{}',
  founded_year INTEGER,
  staff_count_range TEXT, -- e.g. "50-100"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LISTINGS
-- Jobs, internships, vacation schemes, clerkships
-- ============================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  firm_id UUID REFERENCES firms(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('job', 'internship', 'vacation_scheme', 'clerkship', 'fellowship', 'pupillage')) DEFAULT 'job',
  level TEXT CHECK (level IN ('student', 'nysc', 'junior', 'mid', 'senior', 'partner')) DEFAULT 'junior',

  location TEXT NOT NULL,
  is_remote BOOLEAN DEFAULT false,
  is_hybrid BOOLEAN DEFAULT false,

  description TEXT NOT NULL,
  requirements TEXT,
  how_to_apply TEXT,
  apply_url TEXT,
  apply_email TEXT,

  salary_min INTEGER, -- in NGN
  salary_max INTEGER,
  salary_disclosed BOOLEAN DEFAULT false,

  deadline DATE,
  is_rolling BOOLEAN DEFAULT false,

  practice_areas TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,

  posted_by UUID, -- references auth.users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHOLARSHIPS
-- Local and international scholarships for law students
-- ============================================================
CREATE TABLE scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_url TEXT,

  type TEXT CHECK (type IN ('full', 'partial', 'bursary', 'prize', 'grant')) DEFAULT 'partial',
  level TEXT CHECK (level IN ('undergraduate', 'postgraduate', 'llm', 'phd', 'bar_course', 'all')) DEFAULT 'all',

  location TEXT, -- country or region of study
  is_international BOOLEAN DEFAULT false,

  amount_description TEXT, -- e.g. "Full tuition + £18,000 living allowance"
  description TEXT NOT NULL,
  eligibility TEXT,
  how_to_apply TEXT,
  apply_url TEXT,

  deadline DATE,
  is_rolling BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  nickname TEXT,

  university TEXT,
  graduation_year INTEGER,
  call_year INTEGER, -- year called to bar
  nysc_status TEXT CHECK (nysc_status IN ('not_started', 'in_progress', 'completed')),

  practice_areas TEXT[] DEFAULT '{}',
  current_firm TEXT,
  linkedin_url TEXT,
  cv_url TEXT, -- Supabase Storage

  -- Tracker email: generated as {nickname}@mail.esquirely.app
  tracker_email TEXT UNIQUE,

  notification_preferences JSONB DEFAULT '{"deadlines": true, "new_listings": true, "weekly_digest": true}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPLICATION TRACKER
-- Smart tracking via email forwarding
-- ============================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,

  -- If tracked via email, not directly linked to a listing
  firm_name TEXT, -- fallback if no listing_id
  role_title TEXT,

  status TEXT CHECK (status IN (
    'saved',
    'applied',
    'acknowledged',
    'assessment',
    'interview_1',
    'interview_2',
    'offer',
    'rejected',
    'withdrawn',
    'accepted'
  )) DEFAULT 'saved',

  applied_date DATE,
  deadline DATE,

  -- Email threading
  tracker_thread_id TEXT, -- unique per application, used in tracker email subject
  last_email_at TIMESTAMPTZ,
  email_count INTEGER DEFAULT 0,

  notes TEXT,
  salary_offered INTEGER,
  offer_deadline DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email events log (raw inbound emails parsed by webhook)
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT NOT NULL,
  body_preview TEXT, -- first 500 chars

  raw_payload JSONB, -- full Resend webhook payload

  -- AI-parsed fields
  detected_status TEXT, -- status inferred by AI from email content
  ai_summary TEXT,

  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED LISTINGS
-- ============================================================
CREATE TABLE saved_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================================
-- ALERTS / NOTIFICATIONS
-- User-configured job alerts
-- ============================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  label TEXT, -- user-friendly name e.g. "Litigation jobs in Lagos"
  filters JSONB NOT NULL, -- { type, level, practice_areas, location, firm_tier }
  frequency TEXT CHECK (frequency IN ('instant', 'daily', 'weekly')) DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT true,

  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_deadline ON listings(deadline);
CREATE INDEX idx_listings_is_active ON listings(is_active);
CREATE INDEX idx_listings_firm_id ON listings(firm_id);
CREATE INDEX idx_listings_practice_areas ON listings USING GIN(practice_areas);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_profiles_tracker_email ON profiles(tracker_email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Applications: private to user
CREATE POLICY "Users can manage own applications" ON applications FOR ALL USING (auth.uid() = user_id);

-- Saved listings: private to user
CREATE POLICY "Users can manage own saved listings" ON saved_listings FOR ALL USING (auth.uid() = user_id);

-- Alerts: private to user
CREATE POLICY "Users can manage own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);

-- Email events: private to user
CREATE POLICY "Users can view own email events" ON email_events FOR SELECT USING (auth.uid() = user_id);

-- Listings and firms: public read
CREATE POLICY "Listings are publicly readable" ON listings FOR SELECT USING (is_active = true);
CREATE POLICY "Firms are publicly readable" ON firms FOR SELECT USING (true);
CREATE POLICY "Scholarships are publicly readable" ON scholarships FOR SELECT USING (is_active = true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-generate tracker email on profile creation
CREATE OR REPLACE FUNCTION generate_tracker_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracker_email IS NULL AND NEW.nickname IS NOT NULL THEN
    NEW.tracker_email := LOWER(NEW.nickname) || '@mail.esquirely.app';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tracker_email
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_tracker_email();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER firms_updated_at BEFORE UPDATE ON firms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA — sample firms
-- ============================================================
INSERT INTO firms (slug, name, tier, type, city, verified, practice_areas) VALUES
  ('aluko-oyebode', 'Aluko & Oyebode', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Corporate', 'Finance', 'Energy', 'Dispute Resolution']),
  ('templars', 'Templars', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Corporate', 'Energy', 'Projects', 'Capital Markets']),
  ('aelex', 'AELEX', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Dispute Resolution', 'Corporate', 'Energy', 'Shipping']),
  ('olajide-oyewole', 'Olajide Oyewole LLP', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Banking', 'Finance', 'Corporate', 'Tax']),
  ('streamsowers-kohn', 'Streamsowers & Köhn', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Dispute Resolution', 'Arbitration', 'Corporate']),
  ('g-elias', 'G. Elias & Co', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Corporate', 'Finance', 'Telecoms', 'Real Estate']),
  ('banwo-ighodalo', 'Banwo & Ighodalo', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Capital Markets', 'Corporate', 'Debt Finance', 'Projects']),
  ('olaniwun-ajayi', 'Olaniwun Ajayi LP', 'tier_1', 'law_firm', 'Lagos', true, ARRAY['Corporate', 'Energy', 'Finance', 'Tax']),
  ('stl-attorneys', 'STL Attorneys', 'tier_2', 'law_firm', 'Abuja', true, ARRAY['Public Law', 'Corporate', 'Energy']),
  ('odujinrin-adefulu', 'Odujinrin & Adefulu', 'tier_2', 'law_firm', 'Lagos', true, ARRAY['Corporate', 'Real Estate', 'Dispute Resolution']);

-- ─── Profiles ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'graduate')),
  location TEXT,
  preferred_areas TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
