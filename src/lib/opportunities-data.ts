export type OpportunityCategory = 
  | 'internship_law'
  | 'scholarship_local'
  | 'scholarship_international'
  | 'grad_trainee_banking'
  | 'grad_trainee_energy'
  | 'grad_trainee_fintech'
  | 'grad_trainee_other'

export type EligibilityLevel = 'undergraduate' | 'law_graduate' | 'experienced_lawyer'

export interface Opportunity {
  id: string
  title: string
  organisation: string
  category: OpportunityCategory
  eligibility: EligibilityLevel[]
  location: string
  isInternational: boolean
  deadline: string | null
  isRolling: boolean
  amount?: string
  duration?: string
  description: string
  applyUrl?: string
  applyEmail?: string
  isVerified: boolean
  isClosingSoon: boolean
  tags: string[]
}

export const ALL_OPPORTUNITIES: Opportunity[] = [
  // Law firm internships
  {
    id: 'aluko-intern',
    title: 'Student Attachment Programme',
    organisation: 'Aluko & Oyebode',
    category: 'internship_law',
    eligibility: ['undergraduate'],
    location: 'Lagos',
    isInternational: false,
    deadline: null,
    isRolling: true,
    duration: '4 weeks',
    description: 'Rolling placement programme for 300–500 level law students. Placements across banking, capital markets, and corporate teams.',
    applyEmail: 'careers@aluko-oyebode.com',
    isVerified: true,
    isClosingSoon: false,
    tags: ['law student', 'banking', 'capital markets'],
  },

  // Local scholarships

  // International scholarships
  {
    id: 'fordham-llm-award',
    title: 'Fordham International Law Scholarship',
    organisation: 'Fordham University School of Law',
    category: 'scholarship_international',
    eligibility: ['law_graduate', 'experienced_lawyer'],
    location: 'New York, USA',
    isInternational: true,
    deadline: '2026-02-01',
    isRolling: false,
    amount: 'Partial tuition waiver',
    description: 'Merit scholarship for international students pursuing an LLM at Fordham Law, New York. Strong preference for candidates with commercial law backgrounds.',
    applyUrl: 'https://law.fordham.edu',
    isVerified: true,
    isClosingSoon: false,
    tags: ['LLM', 'USA', 'commercial law'],
  },
  {
    id: 'leiden-advanced-llm',
    title: 'Leiden Advanced LLM in International Law',
    organisation: 'Leiden Law School',
    category: 'scholarship_international',
    eligibility: ['law_graduate', 'experienced_lawyer'],
    location: 'Netherlands',
    isInternational: true,
    deadline: '2026-01-15',
    isRolling: false,
    amount: 'Partial scholarship available',
    description: 'Advanced LLM programme at one of Europe\'s oldest universities. Specialisations in international business law, public international law, and trade law.',
    applyUrl: 'https://leidenuniv.nl',
    isVerified: true,
    isClosingSoon: false,
    tags: ['LLM', 'Netherlands', 'international law'],
  },

  // Graduate trainee — Banking
  {
    id: 'zenith-bank-legal-trainee',
    title: 'Legal Trainee — Compliance & Regulatory',
    organisation: 'Zenith Bank Plc',
    category: 'grad_trainee_banking',
    eligibility: ['law_graduate'],
    location: 'Lagos',
    isInternational: false,
    deadline: null,
    isRolling: true,
    duration: '18 months',
    description: 'Ongoing recruitment of law graduates into Zenith\'s Group Legal and Compliance division. Ideal for candidates interested in financial regulation and banking law.',
    isVerified: false,
    isClosingSoon: false,
    tags: ['banking', 'regulatory', 'compliance'],
  },

  // Graduate trainee — Energy

  // Graduate trainee — Fintech
  {
    id: 'flutterwave-legal-trainee',
    title: 'Legal & Regulatory Graduate',
    organisation: 'Flutterwave',
    category: 'grad_trainee_fintech',
    eligibility: ['law_graduate'],
    location: 'Lagos',
    isInternational: false,
    deadline: null,
    isRolling: true,
    description: 'Join Flutterwave\'s fast-growing legal and compliance team. Work on licensing, data privacy, cross-border payment regulations, and commercial contracts.',
    isVerified: true,
    isClosingSoon: false,
    tags: ['fintech', 'data privacy', 'payments', 'licensing'],
  },
  {
    id: 'moniepoint-legal-grad',
    title: 'Legal Graduate Programme',
    organisation: 'Moniepoint Inc.',
    category: 'grad_trainee_fintech',
    eligibility: ['law_graduate'],
    location: 'Lagos',
    isInternational: false,
    deadline: null,
    isRolling: true,
    description: 'Rolling recruitment for lawyers joining Moniepoint\'s legal, compliance, and regulatory affairs team. Strong focus on payments regulation and financial inclusion policy.',
    isVerified: false,
    isClosingSoon: false,
    tags: ['fintech', 'payments', 'regulatory'],
  },

  // Graduate trainee — Other
  {
    id: 'mtn-legal-associate',
    title: 'Legal & Regulatory Associate',
    organisation: 'MTN Nigeria',
    category: 'grad_trainee_other',
    eligibility: ['law_graduate', 'experienced_lawyer'],
    location: 'Lagos',
    isInternational: false,
    deadline: null,
    isRolling: true,
    description: 'Role within MTN\'s legal, regulatory, and compliance division. Work on telecoms licensing, consumer protection matters, and commercial agreements.',
    isVerified: true,
    isClosingSoon: false,
    tags: ['telecoms', 'regulatory', 'licensing'],
  },
]

export const CATEGORY_META = {
  internship_law: {
    label: 'Law Firm Internships',
    description: 'Structured placements at leading Nigerian law firms — for law undergraduates.',
    eligibility: 'Law undergraduates (300–500 level)',
    icon: 'building',
  },
  scholarship_local: {
    label: 'Local Scholarships',
    description: 'Nigerian-based funding, prizes, and bursaries for law students and graduates.',
    eligibility: 'Nigerian undergraduates and graduates',
    icon: 'award',
  },
  scholarship_international: {
    label: 'International Scholarships',
    description: 'LLM funding, postgraduate awards, and fellowships from overseas institutions.',
    eligibility: 'Law graduates and experienced lawyers',
    icon: 'globe',
  },
  grad_trainee_banking: {
    label: 'Banking & Finance',
    description: 'Graduate roles within banks\' legal, compliance, and regulatory teams.',
    eligibility: 'Fresh law graduates and junior lawyers',
    icon: 'landmark',
  },
  grad_trainee_energy: {
    label: 'Oil, Gas & Energy',
    description: 'In-house legal roles at energy companies and multinationals.',
    eligibility: 'Fresh law graduates and experienced lawyers',
    icon: 'zap',
  },
  grad_trainee_fintech: {
    label: 'Fintech & Tech',
    description: 'Legal and regulatory roles at Nigeria\'s fastest-growing tech companies.',
    eligibility: 'Fresh law graduates and junior lawyers',
    icon: 'cpu',
  },
  grad_trainee_other: {
    label: 'Other Industries',
    description: 'Legal roles at conglomerates, telecoms, and other major corporations.',
    eligibility: 'Fresh law graduates and junior lawyers',
    icon: 'briefcase',
  },
}

