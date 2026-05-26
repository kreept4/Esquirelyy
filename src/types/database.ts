export type FirmTier = 'tier_1' | 'tier_2' | 'tier_3' | 'boutique' | 'court' | 'institution'
export type FirmType = 'law_firm' | 'chambers' | 'court' | 'ngo' | 'bank' | 'government' | 'academic'
export type ListingType = 'job' | 'internship' | 'vacation_scheme' | 'clerkship' | 'fellowship' | 'pupillage'
export type ListingLevel = 'student' | 'nysc' | 'junior' | 'mid' | 'senior' | 'partner'
export type ApplicationStatus =
  | 'saved' | 'applied' | 'acknowledged' | 'assessment'
  | 'interview_1' | 'interview_2' | 'offer' | 'rejected'
  | 'withdrawn' | 'accepted'

export interface Firm {
  id: string
  slug: string
  name: string
  tier: FirmTier
  type: FirmType
  city: string
  state: string
  description: string | null
  website: string | null
  logo_url: string | null
  verified: boolean
  practice_areas: string[]
  founded_year: number | null
  staff_count_range: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  slug: string
  firm_id: string | null
  firm?: Firm
  title: string
  type: ListingType
  level: ListingLevel
  location: string
  is_remote: boolean
  is_hybrid: boolean
  description: string
  requirements: string | null
  how_to_apply: string | null
  apply_url: string | null
  apply_email: string | null
  salary_min: number | null
  salary_max: number | null
  salary_disclosed: boolean
  deadline: string | null
  is_rolling: boolean
  practice_areas: string[]
  tags: string[]
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  views_count: number
  applications_count: number
  created_at: string
  updated_at: string
}

export interface Scholarship {
  id: string
  slug: string
  title: string
  provider: string
  provider_url: string | null
  type: 'full' | 'partial' | 'bursary' | 'prize' | 'grant'
  level: 'undergraduate' | 'postgraduate' | 'llm' | 'phd' | 'bar_course' | 'all'
  location: string | null
  is_international: boolean
  amount_description: string | null
  description: string
  eligibility: string | null
  how_to_apply: string | null
  apply_url: string | null
  deadline: string | null
  is_rolling: boolean
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  nickname: string | null
  university: string | null
  graduation_year: number | null
  call_year: number | null
  nysc_status: 'not_started' | 'in_progress' | 'completed' | null
  practice_areas: string[]
  current_firm: string | null
  linkedin_url: string | null
  cv_url: string | null
  tracker_email: string | null
  notification_preferences: {
    deadlines: boolean
    new_listings: boolean
    weekly_digest: boolean
  }
  created_at: string
}

export interface Application {
  id: string
  user_id: string
  listing_id: string | null
  listing?: Listing
  firm_name: string | null
  role_title: string | null
  status: ApplicationStatus
  applied_date: string | null
  deadline: string | null
  tracker_thread_id: string | null
  last_email_at: string | null
  email_count: number
  notes: string | null
  salary_offered: number | null
  offer_deadline: string | null
  created_at: string
  updated_at: string
}

// Supabase Database type — extend as needed
export interface Database {
  public: {
    Tables: {
      firms: { Row: Firm; Insert: Partial<Firm>; Update: Partial<Firm> }
      listings: { Row: Listing; Insert: Partial<Listing>; Update: Partial<Listing> }
      scholarships: { Row: Scholarship; Insert: Partial<Scholarship>; Update: Partial<Scholarship> }
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      applications: { Row: Application; Insert: Partial<Application>; Update: Partial<Application> }
    }
  }
}

// UI helpers
export const TIER_LABELS: Record<FirmTier, string> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
  boutique: 'Boutique',
  court: 'Court',
  institution: 'Institution',
}

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  job: 'Full-time',
  internship: 'Internship',
  vacation_scheme: 'Vacation Scheme',
  clerkship: 'Clerkship',
  fellowship: 'Fellowship',
  pupillage: 'Pupillage',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  acknowledged: 'Acknowledged',
  assessment: 'Assessment',
  interview_1: 'Interview I',
  interview_2: 'Interview II',
  offer: 'Offer Received',
  rejected: 'Not Progressed',
  withdrawn: 'Withdrawn',
  accepted: 'Accepted',
}

export const PRACTICE_AREAS = [
  'Corporate & Commercial',
  'Dispute Resolution',
  'Energy & Natural Resources',
  'Banking & Finance',
  'Capital Markets',
  'Tax',
  'Real Estate',
  'Employment',
  'Intellectual Property',
  'Shipping & Maritime',
  'Telecommunications',
  'Public Law & Regulatory',
  'Criminal Law',
  'Family Law',
  'Arbitration',
]
