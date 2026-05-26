'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  MapPin, Clock, ExternalLink, BookmarkPlus, Share2,
  ArrowLeft, CheckCircle2, AlertCircle, Building2, Globe, ChevronRight
} from 'lucide-react'

// ─── Full listing data (replace with Supabase query in production) ────────────
// Each listing has a real apply_url pointing directly to the firm's careers page
const LISTINGS: Record<string, any> = {
  'aluko-associate-banking': {
    id: '1',
    slug: 'aluko-associate-banking',
    title: 'Associate, Banking & Finance',
    type: 'job',
    level: 'junior',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: false,
    deadline: '2025-06-30',
    isRolling: false,
    isVerified: true,
    isClosingSoon: false,
    salary: '₦8,000,000 – ₦12,000,000 per annum',
    salaryDisclosed: true,
    practiceAreas: ['Banking & Finance', 'Capital Markets'],
    tags: ['Associate', 'Lagos', 'Finance'],

    // The actual application URL — goes directly to firm's careers page
    applyUrl: 'https://www.aukoyebode.com/careers',
    applyEmail: null,
    howToApply: 'Submit your CV and a covering letter via the firm\'s careers portal linked above. Applications submitted by email will not be considered.',

    description: `Aluko & Oyebode invites applications from suitably qualified candidates for the position of Associate in its Banking & Finance practice group.

The successful candidate will work alongside senior associates and partners to advise leading Nigerian and international financial institutions, corporates, and government entities on a broad range of financing transactions, including structured finance, project finance, acquisition finance, and debt capital markets.

This is an excellent opportunity for a driven junior lawyer to build a substantive practice at one of Nigeria's foremost commercial law firms.`,

    responsibilities: [
      'Advising lenders and borrowers on the full range of domestic and cross-border financing transactions',
      'Drafting and negotiating facility agreements, security documentation, and ancillary finance documents',
      'Conducting legal due diligence and preparing due diligence reports for transaction teams',
      'Advising on regulatory requirements under CBN and SEC frameworks applicable to financial transactions',
      'Liaising with foreign counsel on cross-border deals and coordinating multi-jurisdictional closings',
      'Supporting partners in business development and client relationship management',
    ],

    requirements: [
      'LLB (Second Class Upper or above) from an accredited Nigerian university',
      'BL from the Nigerian Law School (Second Class Upper or above)',
      'Minimum of 1 year post-call experience in a commercial law firm',
      'Strong academic record and demonstrable interest in banking and finance law',
      'Excellent drafting, research, and analytical skills',
      'Ability to manage competing priorities under time pressure',
    ],

    firm: {
      slug: 'aluko-oyebode',
      name: 'Aluko & Oyebode',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: '1 Murtala Muhammed Drive, Ikoyi, Lagos 101233',
      website: 'https://www.aukoyebode.com',
      verified: true,
      practiceAreas: ['Corporate', 'Banking & Finance', 'Energy', 'Dispute Resolution', 'Capital Markets'],
      description: 'One of Nigeria\'s most prestigious full-service law firms, with a market-leading Banking & Finance practice advising on the most complex transactions in the country.',
    },

    relatedSlugs: ['banwo-capital-markets', 'olajide-tax-associate', 'g-elias-telecoms'],
    postedAt: '2025-05-10',
  },

  'templars-vacation-2025': {
    id: '2',
    slug: 'templars-vacation-2025',
    title: '2025 Vacation Scheme',
    type: 'vacation_scheme',
    level: 'student',
    location: 'Lagos & Abuja',
    isRemote: false,
    isHybrid: false,
    deadline: '2025-06-15',
    isRolling: false,
    isVerified: true,
    isClosingSoon: true,
    salary: 'Competitive daily stipend provided',
    salaryDisclosed: true,
    practiceAreas: ['Corporate', 'Energy', 'Projects'],
    tags: ['Vacation Scheme', 'Student', 'Lagos', 'Abuja'],

    applyUrl: 'https://www.templars-law.com/careers/vacation-scheme',
    applyEmail: 'graduates@templars-law.com',
    howToApply: 'Apply through the Templars careers portal. You will be required to submit a CV, covering letter, and academic transcripts. Shortlisted candidates will be invited for a virtual interview before being offered a place on the scheme.',

    description: `Templars' Vacation Scheme offers penultimate and final year law students, as well as recent graduates awaiting Law School admission, an immersive two-week experience inside one of Nigeria's top-tier commercial law firms.

Participants rotate across two practice groups of their choosing, work on live transactions, attend client meetings, and receive structured mentoring from senior associates and partners. The scheme is a primary pipeline into Templars' graduate recruitment programme.`,

    responsibilities: [
      'Rotating across two practice groups over the two-week programme',
      'Assisting associates and partners on live deals and advisory mandates',
      'Attending client meetings, court sessions, or transaction closings where appropriate',
      'Completing a group project and presenting findings to a partner panel',
      'Participating in social and networking events with the firm\'s lawyers',
    ],

    requirements: [
      'Penultimate or final year law student, or graduate awaiting Nigerian Law School admission',
      'Minimum of Second Class Upper standing (or equivalent)',
      'Genuine interest in commercial law practice',
      'Strong written and verbal communication skills',
      'Ability to work collaboratively in a fast-paced environment',
    ],

    firm: {
      slug: 'templars',
      name: 'Templars',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: '13A Idowu Taylor Street, Victoria Island, Lagos 101241',
      website: 'https://www.templars-law.com',
      verified: true,
      practiceAreas: ['Corporate', 'Energy', 'Projects', 'Capital Markets', 'Dispute Resolution'],
      description: 'A leading full-service law firm with offices in Lagos and Abuja, widely regarded as one of the best places for junior lawyers to build a commercial practice in Nigeria.',
    },

    relatedSlugs: ['aelex-dispute-pupil', 'streamsowers-arbitration-intern', 'olaniwun-nysc-trainee'],
    postedAt: '2025-05-15',
  },

  'aelex-dispute-pupil': {
    id: '3',
    slug: 'aelex-dispute-pupil',
    title: 'Dispute Resolution Pupil',
    type: 'pupillage',
    level: 'junior',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: false,
    deadline: null,
    isRolling: true,
    isVerified: true,
    isClosingSoon: false,
    salary: null,
    salaryDisclosed: false,
    practiceAreas: ['Dispute Resolution', 'Arbitration', 'Litigation'],
    tags: ['Pupillage', 'Dispute Resolution', 'Lagos'],

    applyUrl: 'https://www.aelex.com/careers',
    applyEmail: 'recruitment@aelex.com',
    howToApply: 'Send a CV and covering letter to recruitment@aelex.com with the subject line "Dispute Resolution Pupil — [Your Name]". Applications are reviewed on a rolling basis.',

    description: `AELEX is accepting applications for pupillage in its Dispute Resolution practice group on a rolling basis. The group handles high-value commercial litigation, international arbitration, and regulatory disputes for leading corporates, financial institutions, and government bodies.

Pupils work directly with partners and senior associates on active matters, gaining early exposure to courtroom advocacy, arbitration proceedings, and the full lifecycle of complex commercial disputes.`,

    responsibilities: [
      'Assisting on commercial litigation matters before the Federal High Court, Court of Appeal, and Supreme Court',
      'Supporting the team on domestic and international arbitration proceedings (ICC, LCIA, ICSID)',
      'Legal research, drafting of pleadings, briefs, and legal opinions',
      'Attending court sessions, case management conferences, and arbitration hearings',
      'Reviewing and summarising documentary evidence for ongoing matters',
    ],

    requirements: [
      'LLB and BL with strong academic results',
      'Up to 2 years post-call experience (fresh calls welcome)',
      'Demonstrable interest in litigation and dispute resolution',
      'Excellent legal research and writing ability',
      'Composure and professionalism under pressure',
    ],

    firm: {
      slug: 'aelex',
      name: 'AELEX',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: 'St. Nicholas House (10th Floor), Catholic Mission Street, Lagos Island, Lagos 102273',
      website: 'https://www.aelex.com',
      verified: true,
      practiceAreas: ['Dispute Resolution', 'Corporate', 'Energy', 'Shipping', 'Arbitration'],
      description: 'AELEX is a leading full-service commercial law firm with a pre-eminent Dispute Resolution practice, consistently ranked among Nigeria\'s top litigation shops.',
    },

    relatedSlugs: ['streamsowers-arbitration-intern', 'stl-public-law-abuja', 'templars-vacation-2025'],
    postedAt: '2025-04-28',
  },

  'banwo-capital-markets': {
    id: '6',
    slug: 'banwo-capital-markets',
    title: 'Capital Markets Associate',
    type: 'job',
    level: 'mid',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: true,
    deadline: '2025-07-05',
    isRolling: false,
    isVerified: true,
    isClosingSoon: false,
    salary: '₦10,000,000 – ₦15,000,000 per annum',
    salaryDisclosed: true,
    practiceAreas: ['Capital Markets', 'Corporate Finance', 'Debt Finance'],
    tags: ['Associate', 'Capital Markets', 'Lagos', 'Hybrid'],

    applyUrl: 'https://www.banwo-ighodalo.com/careers',
    applyEmail: 'careers@banwo-ighodalo.com',
    howToApply: 'Apply via the firm\'s careers page or send a CV and covering letter to careers@banwo-ighodalo.com. Please include "Capital Markets Associate Application" in your subject line.',

    description: `Banwo & Ighodalo is seeking a Capital Markets Associate to join its highly regarded Securities & Capital Markets practice. The firm advises issuers, arrangers, trustees, and regulators on the full spectrum of capital markets transactions in Nigeria.

The role offers exceptional deal flow across equity offerings, debt securities, infrastructure bonds, and SEC-regulated transactions. The successful candidate will work closely with partners on landmark transactions shaping Nigeria's capital markets landscape.`,

    responsibilities: [
      'Advising on IPOs, rights issues, private placements, and other equity capital markets transactions',
      'Drafting and reviewing offer documents, trust deeds, and subscription agreements',
      'Advising on debt securities including corporate bonds, commercial paper, and sukuk',
      'Liaising with the SEC, NSE, and FMDQ on regulatory approvals and compliance',
      'Conducting due diligence on issuers and coordinating with auditors and financial advisers',
      'Mentoring junior associates and reviewing their work product',
    ],

    requirements: [
      'LLB and BL (minimum Second Class Upper at each stage)',
      '3–6 years post-call experience, with meaningful capital markets exposure',
      'Solid understanding of SEC Rules, ISA, and CAMA 2020',
      'Strong drafting and negotiation skills',
      'Experience managing client relationships independently',
    ],

    firm: {
      slug: 'banwo-ighodalo',
      name: 'Banwo & Ighodalo',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: '98 Awolowo Road, Ikoyi, Lagos 101233',
      website: 'https://www.banwo-ighodalo.com',
      verified: true,
      practiceAreas: ['Capital Markets', 'Corporate', 'Debt Finance', 'Projects', 'Banking & Finance'],
      description: 'Banwo & Ighodalo is widely recognised as having the leading Capital Markets practice in Nigeria, having advised on more securities transactions than any other firm in the country.',
    },

    relatedSlugs: ['aluko-associate-banking', 'olajide-tax-associate', 'g-elias-telecoms'],
    postedAt: '2025-05-20',
  },

  'g-elias-telecoms': {
    id: '7',
    slug: 'g-elias-telecoms',
    title: 'Associate, Technology & Telecoms',
    type: 'job',
    level: 'junior',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: false,
    deadline: '2025-07-20',
    isRolling: false,
    isVerified: true,
    isClosingSoon: false,
    salary: null,
    salaryDisclosed: false,
    practiceAreas: ['Telecommunications', 'Technology', 'Corporate'],
    tags: ['Associate', 'Tech', 'Telecoms', 'Lagos'],

    applyUrl: 'https://www.g-elias.com/careers',
    applyEmail: 'hr@g-elias.com',
    howToApply: 'Send your CV, covering letter, and academic transcripts to hr@g-elias.com with the subject line "Associate Application — Technology & Telecoms".',

    description: `G. Elias & Co is seeking a junior Associate to join its Technology, Media & Telecommunications (TMT) practice. The group advises the country's leading telecoms operators, technology companies, and regulators on licensing, transactions, and regulatory compliance.

This is a specialist role offering direct exposure to one of the fastest-growing practice areas in Nigerian commercial law. The successful candidate will develop expertise at the intersection of law, regulation, and technology.`,

    responsibilities: [
      'Advising telecoms operators and technology companies on NCC licensing and regulatory compliance',
      'Assisting on M&A transactions involving technology and telecoms businesses',
      'Advising on data protection compliance under the NDPA 2023 and NDPC regulations',
      'Drafting commercial contracts including SaaS agreements, MSAs, and technology licences',
      'Monitoring and analysing legislative and regulatory developments in the TMT space',
    ],

    requirements: [
      'LLB and BL (Second Class Upper at each stage)',
      '1–3 years post-call experience in a commercial law environment',
      'Genuine interest in technology law, telecoms regulation, or data protection',
      'Strong research, drafting, and analytical skills',
      'Intellectually curious and commercially minded',
    ],

    firm: {
      slug: 'g-elias',
      name: 'G. Elias & Co',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: '4 Saka Tinubu Street, Victoria Island, Lagos 101241',
      website: 'https://www.g-elias.com',
      verified: true,
      practiceAreas: ['Corporate', 'Telecommunications', 'Real Estate', 'Finance', 'Tax'],
      description: 'G. Elias & Co is a long-established full-service firm with particular strength in corporate commercial work, real estate, and a growing technology and telecoms practice.',
    },

    relatedSlugs: ['aluko-associate-banking', 'banwo-capital-markets', 'stl-public-law-abuja'],
    postedAt: '2025-05-18',
  },

  'streamsowers-arbitration-intern': {
    id: '8',
    slug: 'streamsowers-arbitration-intern',
    title: 'Arbitration Intern',
    type: 'internship',
    level: 'student',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: false,
    deadline: '2025-06-25',
    isRolling: false,
    isVerified: true,
    isClosingSoon: false,
    salary: null,
    salaryDisclosed: false,
    practiceAreas: ['Arbitration', 'Dispute Resolution'],
    tags: ['Internship', 'Arbitration', 'Student', 'Lagos'],

    applyUrl: 'https://www.streamsowers.com/careers',
    applyEmail: 'info@streamsowers.com',
    howToApply: 'Send a CV and a brief statement of interest (no more than one page) to info@streamsowers.com with the subject "Arbitration Internship Application".',

    description: `Streamsowers & Köhn offers a structured internship in its internationally recognised Arbitration practice. Interns work alongside one of West Africa's leading arbitration teams on ICC, LCIA, and ad hoc proceedings, as well as investment treaty disputes.

The internship runs for four to eight weeks and is designed for law students or recent graduates with a strong interest in international dispute resolution. Alumni of the internship have gone on to careers at leading arbitration practices and international institutions.`,

    responsibilities: [
      'Legal research on procedural and substantive issues arising in ongoing arbitrations',
      'Assisting with document review and preparation of chronologies and case summaries',
      'Attending procedural hearings, witness conferences, and case team meetings',
      'Drafting research memos and contributing to the preparation of written submissions',
    ],

    requirements: [
      'Final year law student or recent graduate (BL preferred but not required)',
      'Demonstrable interest in arbitration and international dispute resolution',
      'Strong research and writing skills',
      'Ability to work independently and manage time effectively',
    ],

    firm: {
      slug: 'streamsowers-kohn',
      name: 'Streamsowers & Köhn',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: '12 Adetokunbo Ademola Street, Victoria Island, Lagos 101241',
      website: 'https://www.streamsowers.com',
      verified: true,
      practiceAreas: ['Dispute Resolution', 'Arbitration', 'Corporate', 'Shipping'],
      description: 'Streamsowers & Köhn is Nigeria\'s foremost arbitration boutique, with an unmatched record in high-value international commercial and investment treaty arbitrations.',
    },

    relatedSlugs: ['aelex-dispute-pupil', 'templars-vacation-2025', 'olaniwun-nysc-trainee'],
    postedAt: '2025-05-05',
  },

  'olaniwun-nysc-trainee': {
    id: '4',
    slug: 'olaniwun-nysc-trainee',
    title: 'Legal Trainee (NYSC)',
    type: 'internship',
    level: 'nysc',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: false,
    deadline: '2025-06-20',
    isRolling: false,
    isVerified: false,
    isClosingSoon: false,
    salary: 'NYSC statutory allowance',
    salaryDisclosed: true,
    practiceAreas: ['Corporate', 'Tax', 'Finance'],
    tags: ['NYSC', 'Trainee', 'Corporate', 'Lagos'],

    applyUrl: 'https://www.olaniwunajayi.net/careers',
    applyEmail: 'hr@olaniwunajayi.net',
    howToApply: 'Submit your CV, NYSC call-up letter, and a covering letter to hr@olaniwunajayi.net. Only NYSC members deployed to Lagos are eligible.',

    description: `Olaniwun Ajayi LP accepts a small number of NYSC members into its legal trainee programme each year. Trainees are embedded within practice groups and work on substantive matters rather than administrative tasks, giving them real exposure to commercial law practice from day one.

The firm has a strong track record of retaining high-performing NYSC trainees as junior associates upon qualification.`,

    responsibilities: [
      'Assisting associates on corporate and commercial transactions',
      'Legal research and preparation of research memoranda',
      'Drafting and reviewing routine commercial documents under supervision',
      'Attending client meetings and internal training sessions',
    ],

    requirements: [
      'Currently serving NYSC member deployed to Lagos State',
      'LLB and BL with strong academic credentials',
      'Genuine interest in corporate commercial law practice',
      'Professional disposition and strong work ethic',
    ],

    firm: {
      slug: 'olaniwun-ajayi',
      name: 'Olaniwun Ajayi LP',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: 'The Adunola, Plot L2, 401 Close, Banana Island, Ikoyi, Lagos',
      website: 'https://www.olaniwunajayi.net',
      verified: true,
      practiceAreas: ['Corporate', 'Energy', 'Finance', 'Tax', 'Real Estate'],
      description: 'Olaniwun Ajayi LP is a leading corporate law firm advising on Nigeria\'s most significant commercial, energy, and infrastructure transactions.',
    },

    relatedSlugs: ['templars-vacation-2025', 'streamsowers-arbitration-intern', 'aelex-dispute-pupil'],
    postedAt: '2025-05-12',
  },

  'stl-public-law-abuja': {
    id: '9',
    slug: 'stl-public-law-abuja',
    title: 'Public Law Associate',
    type: 'job',
    level: 'junior',
    location: 'Abuja',
    isRemote: false,
    isHybrid: false,
    deadline: '2025-07-15',
    isRolling: false,
    isVerified: false,
    isClosingSoon: false,
    salary: null,
    salaryDisclosed: false,
    practiceAreas: ['Public Law & Regulatory', 'Corporate'],
    tags: ['Associate', 'Abuja', 'Public Law', 'Regulatory'],

    applyUrl: 'https://www.stlattorneys.com/careers',
    applyEmail: 'careers@stlattorneys.com',
    howToApply: 'Submit a CV and covering letter to careers@stlattorneys.com with the subject line "Public Law Associate — Abuja".',

    description: `STL Attorneys is seeking a Public Law Associate for its Abuja office. The role sits within the firm's Public Law & Regulatory practice, which advises government ministries, agencies, corporates, and NGOs on constitutional and administrative law, public procurement, and regulatory compliance.

Based in Abuja, the successful candidate will be well-positioned to build a practice at the centre of Nigeria's regulatory and legislative environment.`,

    responsibilities: [
      'Advising on constitutional law, administrative law, and public procurement matters',
      'Assisting on regulatory compliance work for corporate clients dealing with government agencies',
      'Legal research and drafting of opinions, briefs, and regulatory submissions',
      'Attending hearings before tribunals, regulatory bodies, and the Federal High Court in Abuja',
    ],

    requirements: [
      'LLB and BL (Second Class Upper)',
      '1–3 years post-call experience',
      'Interest in public law, regulatory work, or government advisory',
      'Based in or willing to relocate to Abuja',
    ],

    firm: {
      slug: 'stl-attorneys',
      name: 'STL Attorneys',
      tier: 'Tier 2',
      type: 'law_firm',
      city: 'Abuja',
      address: 'Plot 1266, Cadastral Zone A0, Central Business District, Abuja 900211',
      website: 'https://www.stlattorneys.com',
      verified: false,
      practiceAreas: ['Public Law & Regulatory', 'Corporate', 'Energy', 'Employment'],
      description: 'STL Attorneys is a full-service commercial law firm with a strong presence in Abuja and a well-regarded Public Law & Regulatory practice.',
    },

    relatedSlugs: ['g-elias-telecoms', 'aelex-dispute-pupil', 'aluko-associate-banking'],
    postedAt: '2025-05-22',
  },

  'olajide-tax-associate': {
    id: '10',
    slug: 'olajide-tax-associate',
    title: 'Tax Associate',
    type: 'job',
    level: 'mid',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: true,
    deadline: null,
    isRolling: true,
    isVerified: true,
    isClosingSoon: false,
    salary: null,
    salaryDisclosed: false,
    practiceAreas: ['Tax', 'Banking & Finance', 'Corporate'],
    tags: ['Associate', 'Tax', 'Lagos', 'Hybrid'],

    applyUrl: 'https://www.olajideoyewole.com/careers',
    applyEmail: 'recruitment@olajideoyewole.com',
    howToApply: 'Send a CV and covering letter to recruitment@olajideoyewole.com. Applications are reviewed on a rolling basis and strong candidates contacted promptly.',

    description: `Olajide Oyewole LLP is seeking a mid-level Tax Associate to join its growing Tax practice. The group advises leading Nigerian and multinational corporations, financial institutions, and high-net-worth individuals on a full range of direct and indirect tax matters.

The role offers meaningful exposure to transaction tax (M&A, structured finance), tax controversy and dispute resolution with the FIRS, and tax policy advisory. The firm has a hybrid working policy.`,

    responsibilities: [
      'Advising on corporate income tax, VAT, withholding tax, and transfer pricing',
      'Transaction tax due diligence and structuring advice on M&A and financing transactions',
      'Representing clients in tax audits, objections, and appeals before the FIRS and Tax Appeal Tribunal',
      'Advising on FIRS regulations, Finance Act changes, and emerging tax policy',
      'Drafting tax opinions, advisory memoranda, and client alerts',
    ],

    requirements: [
      'LLB and BL (Second Class Upper at each stage)',
      '3–5 years post-call experience with a focus on tax law',
      'CITN membership or progress towards it is an advantage',
      'Solid understanding of the CITA, CGIT, VAT Act, and Finance Acts',
      'Sharp analytical mind and excellent written communication skills',
    ],

    firm: {
      slug: 'olajide-oyewole',
      name: 'Olajide Oyewole LLP',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: 'UBA House (14th Floor), 57 Marina, Lagos Island, Lagos 102273',
      website: 'https://www.olajideoyewole.com',
      verified: true,
      practiceAreas: ['Banking & Finance', 'Tax', 'Corporate', 'Capital Markets'],
      description: 'Olajide Oyewole LLP is a leading commercial law firm with a particularly strong Banking & Finance and Tax practice, advising on Nigeria\'s most significant financial transactions.',
    },

    relatedSlugs: ['aluko-associate-banking', 'banwo-capital-markets', 'g-elias-telecoms'],
    postedAt: '2025-05-08',
  },

  'aelex-energy-associate': {
    id: '5',
    slug: 'aelex-energy-associate',
    title: 'Junior Associate — Energy',
    type: 'job',
    level: 'junior',
    location: 'Victoria Island, Lagos',
    isRemote: false,
    isHybrid: false,
    deadline: '2025-07-10',
    isRolling: false,
    isVerified: true,
    isClosingSoon: false,
    salary: null,
    salaryDisclosed: false,
    practiceAreas: ['Energy', 'Dispute Resolution', 'Natural Resources'],
    tags: ['Associate', 'Energy', 'Oil & Gas', 'Lagos'],

    applyUrl: 'https://www.aelex.com/careers',
    applyEmail: 'recruitment@aelex.com',
    howToApply: 'Send your CV and covering letter to recruitment@aelex.com with the subject line "Junior Associate — Energy". Only applications with a covering letter will be considered.',

    description: `AELEX is looking for a Junior Associate to join its Energy & Natural Resources practice — one of the most active in Nigeria, advising on upstream, midstream, and downstream oil and gas transactions, energy regulatory matters, and the fast-growing renewables sector.

The successful candidate will work closely with senior lawyers on high-profile transactions and disputes, gaining exposure to the full spectrum of Nigerian energy law.`,

    responsibilities: [
      'Assisting on upstream oil and gas transactions including PSCs, JOAs, and farm-in/farm-out agreements',
      'Advising on NUPRC, NMDPRA, and other energy regulatory compliance matters',
      'Supporting the team on energy-related dispute resolution and litigation',
      'Legal research on developments under the Petroleum Industry Act 2021 and ancillary regulations',
      'Drafting transaction documents, regulatory submissions, and legal opinions',
    ],

    requirements: [
      'LLB and BL (Second Class Upper)',
      '1–2 years post-call experience in a commercial law environment',
      'Interest in energy law and the Nigerian oil and gas industry',
      'Strong research, drafting, and analytical skills',
    ],

    firm: {
      slug: 'aelex',
      name: 'AELEX',
      tier: 'Tier 1',
      type: 'law_firm',
      city: 'Lagos',
      address: 'St. Nicholas House (10th Floor), Catholic Mission Street, Lagos Island, Lagos 102273',
      website: 'https://www.aelex.com',
      verified: true,
      practiceAreas: ['Dispute Resolution', 'Corporate', 'Energy', 'Shipping', 'Arbitration'],
      description: 'AELEX is a leading full-service commercial law firm with a pre-eminent Dispute Resolution practice and a highly active Energy & Natural Resources group.',
    },

    relatedSlugs: ['aluko-associate-banking', 'stl-public-law-abuja', 'aelex-dispute-pupil'],
    postedAt: '2025-05-14',
  },

  // ── Banking & Financial Services ─────────────────────────────────────────────
  'access-bank-legal-counsel': {
    id: '20', slug: 'access-bank-legal-counsel',
    title: 'Legal Counsel — Retail Banking',
    type: 'job', level: 'junior',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: false,
    deadline: '2026-07-31', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: '₦7,000,000 – ₦10,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Banking & Finance', 'Regulatory'],
    tags: ['In-house', 'Banking', 'Lagos'],
    applyUrl: 'https://www.accessbankplc.com/careers',
    applyEmail: null,
    howToApply: 'Apply via the Access Bank careers portal. Include your CV, a short covering note, and copies of your academic and professional certificates.',
    description: `Access Bank Plc is seeking a Legal Counsel to join its Group Legal division, supporting the Retail Banking business across a wide range of legal and regulatory matters.\n\nThe successful candidate will provide in-house legal advisory services on retail banking products, consumer contracts, and regulatory compliance, working closely with the business to structure transactions and manage legal risk.`,
    responsibilities: [
      'Providing legal advice on retail banking products, customer agreements, and lending documentation',
      'Reviewing and negotiating contracts with vendors, partners, and service providers',
      'Supporting compliance with CBN consumer protection regulations and banking codes',
      'Assisting in managing litigation and disputes involving retail customers',
      'Preparing legal opinions and internal advisory notes for business teams',
      'Monitoring regulatory developments affecting retail banking operations',
    ],
    requirements: [
      'LLB and BL (minimum Second Class Lower)',
      '1–3 years post-call experience, preferably in a bank or financial institution',
      'Sound knowledge of Nigerian banking law and CBN regulations',
      'Strong drafting and analytical skills',
      'Ability to communicate legal issues clearly to non-lawyers',
    ],
    firm: {
      slug: null, name: 'Access Bank Plc', tier: null, type: 'banking',
      city: 'Lagos', address: 'Plot 999C, Danmole Street, Victoria Island, Lagos',
      website: 'https://www.accessbankplc.com', verified: true,
      practiceAreas: ['Banking & Finance', 'Regulatory', 'Corporate'],
      description: 'Access Bank is one of Nigeria\'s largest commercial banks and Africa\'s largest bank by total assets, operating across 18 African countries and 3 continents.',
    },
    relatedSlugs: ['zenith-bank-compliance-counsel', 'stanbic-ibtc-legal-analyst', 'flutterwave-legal-counsel'],
    postedAt: '2026-05-01',
  },

  'zenith-bank-compliance-counsel': {
    id: '21', slug: 'zenith-bank-compliance-counsel',
    title: 'Compliance & Legal Officer',
    type: 'job', level: 'mid',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: false,
    deadline: null, isRolling: true,
    isVerified: true, isClosingSoon: false,
    salary: '₦12,000,000 – ₦18,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Regulatory', 'Banking & Finance'],
    tags: ['In-house', 'Compliance', 'Banking'],
    applyUrl: 'https://www.zenithbank.com/careers',
    applyEmail: 'careers@zenithbank.com',
    howToApply: 'Send your application to careers@zenithbank.com with the subject "Compliance & Legal Officer Application". Rolling intake — apply as soon as possible.',
    description: `Zenith Bank Plc is seeking an experienced Compliance & Legal Officer to strengthen its Group Compliance and Legal Services division.\n\nThe role sits at the intersection of legal advisory and regulatory compliance, requiring a candidate who can translate complex regulatory requirements into practical business guidance while managing legal risk across the Bank's operations.`,
    responsibilities: [
      'Ensuring the Bank\'s operations comply with CBN, NDIC, FCCPC, and all applicable financial sector regulations',
      'Reviewing internal policies, procedures, and product documentation for legal and regulatory compliance',
      'Monitoring regulatory changes and briefing senior management on implications for the business',
      'Advising on AML/CFT obligations and supporting the MLRO on compliance matters',
      'Drafting and reviewing commercial contracts, NDAs, and third-party agreements',
      'Liaising with external regulators and managing regulatory correspondence',
    ],
    requirements: [
      'LLB and BL (Second Class Upper preferred)',
      'Minimum 3 years post-call experience in banking, financial services, or a regulatory body',
      'Deep knowledge of CBN regulations, BOFIA 2020, and financial services compliance frameworks',
      'Experience in AML/CFT compliance is a strong advantage',
      'Excellent written communication and stakeholder management skills',
    ],
    firm: {
      slug: null, name: 'Zenith Bank Plc', tier: null, type: 'banking',
      city: 'Lagos', address: 'Plot 87, Ajose Adeogun Street, Victoria Island, Lagos',
      website: 'https://www.zenithbank.com', verified: true,
      practiceAreas: ['Banking & Finance', 'Regulatory', 'Corporate'],
      description: 'Zenith Bank is one of Nigeria\'s top-tier banks and a market leader in corporate and retail banking, consistently ranked among the most profitable banks in sub-Saharan Africa.',
    },
    relatedSlugs: ['access-bank-legal-counsel', 'gtb-corporate-counsel', 'cbn-legal-officer'],
    postedAt: '2026-04-20',
  },

  'gtb-corporate-counsel': {
    id: '22', slug: 'gtb-corporate-counsel',
    title: 'Corporate Affairs Counsel',
    type: 'job', level: 'mid',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: true,
    deadline: '2026-08-15', isRolling: false,
    isVerified: false, isClosingSoon: false,
    salary: null, salaryDisclosed: false,
    practiceAreas: ['Corporate', 'Regulatory'],
    tags: ['In-house', 'Corporate', 'Banking'],
    applyUrl: 'https://jobs.gtbank.com',
    applyEmail: null,
    howToApply: 'Apply through the Guaranty Trust Bank careers portal. Shortlisted candidates will be contacted for an initial screening call.',
    description: `Guaranty Trust Bank is recruiting a Corporate Affairs Counsel to join its in-house legal team. This hybrid role provides legal support to the Bank\'s corporate affairs, investor relations, and governance functions.\n\nThe successful candidate will advise on corporate law matters, regulatory filings, and shareholder relations, working closely with the Company Secretary and senior management.`,
    responsibilities: [
      'Advising on corporate governance, board secretarial matters, and Companies and Allied Matters Act compliance',
      'Preparing and reviewing regulatory filings with the SEC, CAC, and NGX Exchange',
      'Supporting investor relations and advising on capital market disclosure obligations',
      'Drafting board resolutions, shareholder circulars, and governance documentation',
      'Advising on corporate restructuring, mergers, and acquisitions involving the Bank',
      'Maintaining the Bank\'s statutory registers and corporate records',
    ],
    requirements: [
      'LLB and BL (Second Class Upper)',
      '3–5 years post-call experience, with exposure to corporate law or company secretarial work',
      'Knowledge of CAMA 2020, SEC Rules, and NGX Listing Rules',
      'ICSA/ACIS qualification is a strong advantage',
      'Detail-oriented with strong drafting and organisational skills',
    ],
    firm: {
      slug: null, name: 'Guaranty Trust Bank', tier: null, type: 'banking',
      city: 'Lagos', address: 'Plot 635, Akin Adesola Street, Victoria Island, Lagos',
      website: 'https://jobs.gtbank.com', verified: false,
      practiceAreas: ['Corporate', 'Banking & Finance', 'Capital Markets'],
      description: 'Guaranty Trust Bank (now GTCo) is one of Nigeria\'s most respected financial institutions, known for innovation, strong governance, and a market-leading digital banking platform.',
    },
    relatedSlugs: ['zenith-bank-compliance-counsel', 'stanbic-ibtc-legal-analyst', 'banwo-capital-markets'],
    postedAt: '2026-05-05',
  },

  'stanbic-ibtc-legal-analyst': {
    id: '23', slug: 'stanbic-ibtc-legal-analyst',
    title: 'Legal & Compliance Analyst',
    type: 'job', level: 'junior',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: false,
    deadline: '2026-07-20', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: '₦8,000,000 – ₦11,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Banking & Finance', 'Regulatory'],
    tags: ['In-house', 'Compliance', 'Banking'],
    applyUrl: 'https://www.stanbicibtc.com/careers',
    applyEmail: null,
    howToApply: 'Apply online via the Stanbic IBTC careers portal. All applications must be submitted online — walk-in or emailed CVs will not be accepted.',
    description: `Stanbic IBTC Bank is seeking a Legal & Compliance Analyst to support its Group Legal team across banking, insurance, pensions, and asset management business lines.\n\nThis is an excellent entry point for a commercially minded junior lawyer seeking broad exposure to financial services law within one of Nigeria\'s largest financial groups.`,
    responsibilities: [
      'Providing legal research support and preparing advisory notes for business units',
      'Reviewing standard contracts, vendor agreements, and service level arrangements',
      'Tracking regulatory developments and preparing regulatory change summaries',
      'Supporting the compliance team on CBN, PENCOM, NAICOM, and SEC compliance matters',
      'Assisting with litigation management and coordination with external counsel',
      'Maintaining the department\'s contract management and regulatory correspondence systems',
    ],
    requirements: [
      'LLB and BL (minimum Second Class Lower)',
      '1–2 years post-call experience',
      'Interest in financial services regulation and compliance',
      'Strong research, writing, and organisational skills',
      'Proficient in Microsoft Office suite',
    ],
    firm: {
      slug: null, name: 'Stanbic IBTC Bank', tier: null, type: 'banking',
      city: 'Lagos', address: 'Walter Carrington Crescent, Victoria Island, Lagos',
      website: 'https://www.stanbicibtc.com', verified: true,
      practiceAreas: ['Banking & Finance', 'Regulatory', 'Capital Markets'],
      description: 'Stanbic IBTC is a subsidiary of Standard Bank Group, one of Africa\'s largest banking groups. Its Nigerian operations span banking, pensions, insurance, and asset management.',
    },
    relatedSlugs: ['access-bank-legal-counsel', 'paystack-compliance-counsel', 'olajide-tax-associate'],
    postedAt: '2026-05-08',
  },

  'cbn-legal-officer': {
    id: '24', slug: 'cbn-legal-officer',
    title: 'Legal Officer',
    type: 'job', level: 'junior',
    location: 'Central Business District, Abuja',
    isRemote: false, isHybrid: false,
    deadline: null, isRolling: true,
    isVerified: true, isClosingSoon: false,
    salary: 'Competitive (CONPASS Grade Level)', salaryDisclosed: false,
    practiceAreas: ['Regulatory', 'Public Law & Regulatory'],
    tags: ['Government', 'Regulatory', 'Abuja'],
    applyUrl: 'https://www.cbn.gov.ng/careers',
    applyEmail: null,
    howToApply: 'Applications are submitted through the CBN\'s online portal. Shortlisted candidates will complete a written assessment followed by an oral interview.',
    description: `The Central Bank of Nigeria is recruiting Legal Officers to join its Legal Services Department. This is a prestigious opportunity to work at the apex regulatory institution of Nigeria\'s financial system.\n\nLegal Officers at the CBN provide legal advisory services to the Bank and its departments, support the development of financial sector legislation and regulations, and represent the Bank in legal proceedings.`,
    responsibilities: [
      'Providing legal advice and opinions to CBN departments on statutory and regulatory matters',
      'Reviewing and drafting regulations, guidelines, circulars, and other regulatory instruments',
      'Representing the CBN in legal proceedings before courts and tribunals',
      'Conducting legal research on financial regulation, monetary policy, and banking law',
      'Supporting the review and negotiation of contracts and agreements entered into by the Bank',
      'Liaising with the Attorney General\'s office and other government legal departments',
    ],
    requirements: [
      'LLB and BL (Second Class Upper minimum)',
      '1–3 years post-call experience',
      'Strong interest in financial sector regulation and public law',
      'Excellent research, drafting, and analytical skills',
      'Nigerian citizenship required',
    ],
    firm: {
      slug: null, name: 'Central Bank of Nigeria', tier: null, type: 'banking',
      city: 'Abuja', address: 'Central Business District, Abuja, FCT',
      website: 'https://www.cbn.gov.ng', verified: true,
      practiceAreas: ['Regulatory', 'Public Law & Regulatory', 'Banking & Finance'],
      description: 'The Central Bank of Nigeria is the apex monetary authority and financial sector regulator, responsible for monetary policy, financial system stability, and oversight of all banks and financial institutions in Nigeria.',
    },
    relatedSlugs: ['stl-public-law-abuja', 'sec-ng-legal-officer', 'zenith-bank-compliance-counsel'],
    postedAt: '2026-04-15',
  },

  // ── Energy & Extractives ─────────────────────────────────────────────────────
  'seplat-energy-legal-counsel': {
    id: '30', slug: 'seplat-energy-legal-counsel',
    title: 'Counsel — Upstream Operations',
    type: 'job', level: 'mid',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: false,
    deadline: '2026-08-30', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: '₦20,000,000 – ₦30,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Energy', 'Corporate'],
    tags: ['In-house', 'Energy', 'Oil & Gas', 'Lagos'],
    applyUrl: 'https://www.seplatenergy.com/careers',
    applyEmail: 'careers@seplatnig.com',
    howToApply: 'Send a detailed CV and covering letter to careers@seplatnig.com with the subject "Counsel — Upstream Operations". Applications without a covering letter will not be considered.',
    description: `Seplat Energy Plc, Nigeria\'s leading indigenous energy company listed on both the NSE and LSE, is seeking a Counsel to support its upstream operations legal team.\n\nThe successful candidate will provide legal advice on exploration and production matters, joint venture arrangements, and regulatory compliance under the Petroleum Industry Act 2021 — working at the forefront of Nigeria\'s energy transition.`,
    responsibilities: [
      'Advising on upstream oil and gas contracts including JOAs, PSCs, and service agreements',
      'Supporting the Petroleum Industry Act compliance programme across field operations',
      'Reviewing and negotiating agreements with NNPC Limited, co-venturers, and contractors',
      'Providing legal support on NUPRC and NMDPRA regulatory filings and interactions',
      'Advising on land acquisition, community relations, and host community agreements',
      'Supporting dispute resolution and claims management arising from upstream operations',
    ],
    requirements: [
      'LLB and BL (Second Class Upper)',
      'Minimum 3 years post-call experience in energy law, upstream oil and gas, or a major commercial law firm with energy practice',
      'Working knowledge of the Petroleum Industry Act 2021 and upstream regulatory framework',
      'Strong commercial acumen and ability to operate in a fast-paced operational environment',
    ],
    firm: {
      slug: null, name: 'Seplat Energy Plc', tier: null, type: 'energy',
      city: 'Lagos', address: '16A Temple Road (off Bourdillon Road), Ikoyi, Lagos',
      website: 'https://www.seplatenergy.com', verified: true,
      practiceAreas: ['Energy', 'Corporate', 'Regulatory'],
      description: 'Seplat Energy is Nigeria\'s premier indigenous energy company, with interests in upstream oil and gas assets across the Niger Delta and a growing gas processing and power business. Dual-listed on the NGX and London Stock Exchange.',
    },
    relatedSlugs: ['totalenergies-legal-ng', 'chevron-contract-counsel', 'aelex-energy-associate'],
    postedAt: '2026-05-10',
  },

  'totalenergies-legal-ng': {
    id: '31', slug: 'totalenergies-legal-ng',
    title: 'Junior Legal Counsel — Exploration',
    type: 'job', level: 'junior',
    location: 'Lagos / Port Harcourt',
    isRemote: false, isHybrid: false,
    deadline: '2026-07-10', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: null, salaryDisclosed: false,
    practiceAreas: ['Energy', 'Arbitration'],
    tags: ['In-house', 'Energy', 'Multinational'],
    applyUrl: 'https://careers.totalenergies.com',
    applyEmail: null,
    howToApply: 'Apply via the TotalEnergies global careers portal. Search for Nigeria in the location filter. Applications must be submitted in English.',
    description: `TotalEnergies EP Nigeria is seeking a Junior Legal Counsel to support the Exploration & Production legal department in Lagos and Port Harcourt.\n\nThis is a rare opportunity to work within a major international oil company\'s in-house legal team, with exposure to large-scale upstream projects, international contracts, and cross-border regulatory matters.`,
    responsibilities: [
      'Providing legal support on exploration and production contracts, farm-out agreements, and joint operating agreements',
      'Advising on NUPRC licensing, work programme obligations, and production sharing contracts',
      'Reviewing drilling contracts, EPIC agreements, and technical service agreements',
      'Supporting the team on international arbitration matters and dispute prevention',
      'Conducting research on Nigerian, OHADA, and international energy law developments',
      'Liaising with NNPC Limited on joint venture matters and government correspondence',
    ],
    requirements: [
      'LLB and BL (Second Class Upper)',
      '1–3 years post-call experience in energy law or upstream practice',
      'Working knowledge of Nigerian petroleum law and the PIA 2021',
      'Fluency in English required; French language skills are an advantage',
      'Willingness to work between Lagos and Port Harcourt offices',
    ],
    firm: {
      slug: null, name: 'TotalEnergies EP Nigeria', tier: null, type: 'energy',
      city: 'Lagos', address: 'Churchgate Towers, PC 30 Afribank Street, Victoria Island, Lagos',
      website: 'https://www.totalenergies.com.ng', verified: true,
      practiceAreas: ['Energy', 'Arbitration', 'Corporate'],
      description: 'TotalEnergies is one of the world\'s major integrated energy companies, with significant upstream operations in Nigeria including deep-water assets and major LNG projects.',
    },
    relatedSlugs: ['seplat-energy-legal-counsel', 'chevron-contract-counsel', 'aelex-energy-associate'],
    postedAt: '2026-05-02',
  },

  'chevron-contract-counsel': {
    id: '33', slug: 'chevron-contract-counsel',
    title: 'Contracts & Commercial Counsel',
    type: 'job', level: 'senior',
    location: 'Lekki, Lagos',
    isRemote: false, isHybrid: false,
    deadline: '2026-09-01', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: '₦35,000,000+ per annum', salaryDisclosed: true,
    practiceAreas: ['Energy', 'Arbitration', 'Corporate'],
    tags: ['In-house', 'Senior', 'Energy', 'Contracts'],
    applyUrl: 'https://chevron.apply2jobs.com',
    applyEmail: null,
    howToApply: 'Apply via the Chevron recruitment portal. Chevron Nigeria operates a structured recruitment process with multiple interview stages.',
    description: `Chevron Nigeria Limited is seeking an experienced Contracts & Commercial Counsel for its Legal & Contracts division in Lagos.\n\nThe successful candidate will manage high-value contracts for upstream and downstream operations, lead commercial negotiations, and advise on complex contractual disputes — operating as a senior legal business partner to the commercial and operations teams.`,
    responsibilities: [
      'Leading the drafting, review, and negotiation of high-value upstream contracts including drilling, EPIC, and services agreements',
      'Providing senior legal and commercial advice on JOA interpretation, co-venturer disputes, and NNPC relationships',
      'Managing complex commercial disputes and pre-arbitration negotiations',
      'Advising on Nigerian content compliance and local content obligations under the NCDMB framework',
      'Mentoring junior counsel and supervising the contracts team\'s day-to-day work',
      'Engaging external legal counsel on major litigation and arbitration proceedings',
    ],
    requirements: [
      'LLB and BL (Second Class Upper)',
      'Minimum 6 years post-call experience, with significant in-house or law firm experience in upstream energy contracts',
      'Proven track record in commercial contract negotiation and dispute management',
      'Deep knowledge of the Nigerian upstream regulatory framework and PIA 2021',
      'International arbitration experience (ICSID, ICC, LCIA) is a strong advantage',
    ],
    firm: {
      slug: null, name: 'Chevron Nigeria Limited', tier: null, type: 'energy',
      city: 'Lagos', address: '2 Chevron Drive, Lekki Peninsula, Lagos',
      website: 'https://www.chevron.com/nigeria', verified: true,
      practiceAreas: ['Energy', 'Arbitration', 'Corporate'],
      description: 'Chevron Nigeria Limited is a major international oil company with significant interests in the Nigerian upstream sector, including operated and non-operated joint ventures with NNPC Limited.',
    },
    relatedSlugs: ['seplat-energy-legal-counsel', 'totalenergies-legal-ng', 'dangote-group-legal-counsel'],
    postedAt: '2026-05-12',
  },

  // ── Technology & Fintech ─────────────────────────────────────────────────────
  'flutterwave-legal-counsel': {
    id: '40', slug: 'flutterwave-legal-counsel',
    title: 'Legal Counsel — Payments',
    type: 'job', level: 'mid',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: true,
    deadline: '2026-07-15', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: '₦18,000,000 – ₦26,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Regulatory', 'Banking & Finance'],
    tags: ['In-house', 'Fintech', 'Payments', 'Hybrid'],
    applyUrl: 'https://flutterwave.com/careers',
    applyEmail: null,
    howToApply: 'Apply through the Flutterwave careers page. Applications are reviewed on a rolling basis — early applications are encouraged.',
    description: `Flutterwave is seeking a Legal Counsel to support its payments and financial services operations across Nigeria and sub-Saharan Africa.\n\nThis is a high-impact in-house role at one of Africa\'s most prominent fintechs, covering regulatory compliance, product structuring, and commercial contracting in a fast-moving, high-growth environment.`,
    responsibilities: [
      'Advising on CBN payment system licensing, e-money regulations, and PSSP/PTSP compliance',
      'Reviewing and negotiating commercial agreements with merchants, partners, and financial institutions',
      'Providing legal support on new product launches and payment infrastructure projects',
      'Monitoring fintech regulatory developments across Nigeria and other African markets',
      'Managing relationships with external counsel on regulatory and litigation matters',
      'Supporting the compliance team on AML/CFT obligations applicable to payment service providers',
    ],
    requirements: [
      'LLB and BL (Second Class Upper preferred)',
      '3–5 years post-call experience in fintech, financial services, or a regulatory-focused practice',
      'Knowledge of CBN payment system regulations and FCCPC consumer protection rules',
      'Commercially minded, with strong contracts and negotiation experience',
      'Ability to work fast and communicate clearly under pressure',
    ],
    firm: {
      slug: null, name: 'Flutterwave', tier: null, type: 'fintech',
      city: 'Lagos', address: '30b Adeola Odeku Street, Victoria Island, Lagos',
      website: 'https://flutterwave.com', verified: true,
      practiceAreas: ['Regulatory', 'Banking & Finance', 'Corporate'],
      description: 'Flutterwave is Africa\'s leading payments technology company, enabling global businesses and individuals to transact across the continent. Headquartered in San Francisco with major operations across Lagos and Nairobi.',
    },
    relatedSlugs: ['paystack-compliance-counsel', 'moniepoint-legal-ops', 'zenith-bank-compliance-counsel'],
    postedAt: '2026-05-03',
  },

  'paystack-compliance-counsel': {
    id: '41', slug: 'paystack-compliance-counsel',
    title: 'Compliance Counsel',
    type: 'job', level: 'junior',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: true,
    deadline: null, isRolling: true,
    isVerified: true, isClosingSoon: false,
    salary: '₦10,000,000 – ₦15,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Regulatory', 'Banking & Finance'],
    tags: ['In-house', 'Fintech', 'Compliance', 'Hybrid'],
    applyUrl: 'https://paystack.com/careers',
    applyEmail: null,
    howToApply: 'Apply through the Paystack careers page. Paystack reviews applications on a rolling basis and moves quickly — expect a response within two weeks of applying.',
    description: `Paystack, a Stripe company, is looking for a Compliance Counsel to support its regulatory and legal operations in Nigeria.\n\nYou will be part of a small, high-calibre legal team working closely with the Head of Legal and the compliance function to ensure Paystack operates within its regulatory perimeter as it continues to grow.`,
    responsibilities: [
      'Supporting CBN payment system compliance, licence conditions, and regulatory reporting obligations',
      'Reviewing and advising on merchant agreements, terms of service, and consumer-facing contracts',
      'Assisting with regulatory examinations, FCCPC inquiries, and third-party audits',
      'Monitoring regulatory changes and preparing concise briefings for the legal and product teams',
      'Advising on AML/KYC requirements for merchant onboarding and transaction monitoring',
      'Supporting cross-functional teams on new product launches with legal and compliance review',
    ],
    requirements: [
      'LLB and BL (minimum Second Class Lower)',
      '1–3 years post-call experience, ideally with exposure to fintech or payments regulation',
      'Strong understanding of CBN payment system regulations',
      'Excellent written communication skills — you will write clear, actionable legal guidance regularly',
      'Comfortable working in a fast-paced startup-adjacent environment',
    ],
    firm: {
      slug: null, name: 'Paystack', tier: null, type: 'fintech',
      city: 'Lagos', address: 'Plot 1261C Tiamiyu Savage Street, Victoria Island, Lagos',
      website: 'https://paystack.com', verified: true,
      practiceAreas: ['Regulatory', 'Banking & Finance'],
      description: 'Paystack is Nigeria\'s leading online payments company, enabling businesses to accept payments via cards, transfers, USSD, and mobile money. Acquired by Stripe in 2020, Paystack continues to operate independently and expand across Africa.',
    },
    relatedSlugs: ['flutterwave-legal-counsel', 'moniepoint-legal-ops', 'stanbic-ibtc-legal-analyst'],
    postedAt: '2026-04-28',
  },

  'moniepoint-legal-ops': {
    id: '42', slug: 'moniepoint-legal-ops',
    title: 'Legal Operations Specialist',
    type: 'job', level: 'junior',
    location: 'Lagos (Hybrid / Remote-friendly)',
    isRemote: false, isHybrid: true,
    deadline: '2026-07-30', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: '₦9,000,000 – ₦13,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Regulatory', 'Corporate'],
    tags: ['In-house', 'Fintech', 'Legal Ops', 'Remote-friendly'],
    applyUrl: 'https://moniepoint.com/careers',
    applyEmail: null,
    howToApply: 'Apply via the Moniepoint careers page. The process includes a CV review, a short written task, and two interview rounds.',
    description: `Moniepoint is hiring a Legal Operations Specialist to help scale its legal function as it grows across Nigeria and into new markets.\n\nThis is not a traditional legal advisory role — it sits at the intersection of law, process design, and technology. The successful candidate will build and run systems that make the legal team more efficient, from contract management to regulatory tracking to vendor coordination.`,
    responsibilities: [
      'Building and managing the legal team\'s contract management system and document repositories',
      'Coordinating with external counsel on regulatory filings, litigation updates, and advisory projects',
      'Tracking CBN, FCCPC, and other regulatory compliance deadlines and submissions',
      'Supporting the contracting process for vendors, partners, and service providers',
      'Preparing legal briefings, regulatory summaries, and board-level legal reports',
      'Identifying workflow inefficiencies and recommending legal tech solutions',
    ],
    requirements: [
      'LLB and BL (any class accepted — this role values aptitude over grades)',
      '1–2 years post-call experience',
      'Strong interest in legal operations, legal technology, or process improvement',
      'Highly organised, with excellent written communication skills',
      'Familiarity with tools like Notion, Airtable, or contract management platforms is a plus',
    ],
    firm: {
      slug: null, name: 'Moniepoint', tier: null, type: 'fintech',
      city: 'Lagos', address: 'Landmark Towers, 5B Water Corporation Road, Victoria Island, Lagos',
      website: 'https://moniepoint.com', verified: true,
      practiceAreas: ['Regulatory', 'Corporate'],
      description: 'Moniepoint is Africa\'s largest rural payments infrastructure provider and one of Nigeria\'s fastest-growing fintech companies, processing millions of transactions daily for businesses across the country.',
    },
    relatedSlugs: ['paystack-compliance-counsel', 'flutterwave-legal-counsel', 'interswitch-ip-counsel'],
    postedAt: '2026-05-06',
  },

  'mtn-ng-legal-regulatory': {
    id: '44', slug: 'mtn-ng-legal-regulatory',
    title: 'Legal & Regulatory Affairs Manager',
    type: 'job', level: 'senior',
    location: 'Ikoyi, Lagos',
    isRemote: false, isHybrid: false,
    deadline: null, isRolling: true,
    isVerified: true, isClosingSoon: false,
    salary: '₦30,000,000 – ₦45,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Regulatory', 'Telecommunications', 'Public Law & Regulatory'],
    tags: ['In-house', 'Senior', 'Telecoms', 'Regulatory'],
    applyUrl: 'https://www.mtnonline.com/careers',
    applyEmail: null,
    howToApply: 'Apply through the MTN Nigeria careers portal. Senior-level applications are reviewed directly by the Legal & Regulatory Affairs Director.',
    description: `MTN Nigeria is seeking a Legal & Regulatory Affairs Manager to lead regulatory engagement and provide senior legal counsel on telecoms, spectrum, and competition law matters.\n\nThe role sits within a high-performing in-house team managing MTN\'s legal and regulatory relationships with the NCC, FCCPC, and other federal agencies — a genuinely senior position with significant influence on the company\'s regulatory strategy.`,
    responsibilities: [
      'Leading MTN\'s engagement with the Nigerian Communications Commission on licensing, spectrum, and quality of service matters',
      'Advising on competition law issues, regulatory inquiries, and FCCPC investigations',
      'Representing MTN in regulatory proceedings, NCC hearings, and industry working groups',
      'Managing external counsel relationships on regulatory litigation and judicial review proceedings',
      'Advising the board and senior management on regulatory risk and telecom policy developments',
      'Reviewing and influencing proposed regulatory instruments affecting MTN\'s operations',
    ],
    requirements: [
      'LLB and BL (Second Class Upper)',
      'Minimum 6 years post-call experience, with significant telecoms, regulatory, or public law experience',
      'Deep understanding of the Nigerian Communications Act and NCC regulatory framework',
      'Track record of engaging directly with regulators and senior government officials',
      'Strong advocacy, negotiation, and stakeholder management skills',
    ],
    firm: {
      slug: null, name: 'MTN Nigeria', tier: null, type: 'fintech',
      city: 'Lagos', address: 'MTN Plaza, 30 Afribank Street, Victoria Island, Lagos',
      website: 'https://www.mtnonline.com', verified: true,
      practiceAreas: ['Regulatory', 'Telecommunications', 'Public Law & Regulatory'],
      description: 'MTN Nigeria is the country\'s largest telecoms operator by subscriber base, listed on the NGX Exchange and a subsidiary of MTN Group, Africa\'s largest mobile network operator.',
    },
    relatedSlugs: ['airtel-ng-regulatory-counsel', 'cbn-legal-officer', 'chevron-contract-counsel'],
    postedAt: '2026-04-22',
  },

  // ── Multinationals & Other ───────────────────────────────────────────────────
  'dangote-group-legal-counsel': {
    id: '50', slug: 'dangote-group-legal-counsel',
    title: 'Group Legal Counsel',
    type: 'job', level: 'senior',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: false,
    deadline: null, isRolling: true,
    isVerified: true, isClosingSoon: false,
    salary: '₦40,000,000+ per annum', salaryDisclosed: true,
    practiceAreas: ['Corporate', 'M&A', 'Energy'],
    tags: ['In-house', 'Senior', 'Conglomerate', 'Lagos'],
    applyUrl: 'https://www.dangote.com/careers',
    applyEmail: 'legalrecruitment@dangote.com',
    howToApply: 'Send your CV and a detailed covering letter to legalrecruitment@dangote.com. Only shortlisted candidates will be contacted. Applications are reviewed on a rolling basis.',
    description: `Dangote Industries Limited is seeking a Group Legal Counsel to provide senior in-house legal support across its diversified business portfolio — spanning cement, petrochemicals, refinery operations, fertiliser, and sugar.\n\nThis is one of the most senior in-house legal roles in the Nigerian private sector, requiring a seasoned lawyer capable of advising on complex M&A transactions, project finance, and multi-jurisdictional regulatory matters.`,
    responsibilities: [
      'Providing senior legal counsel to the board and executive management on M&A, joint ventures, and major transactions',
      'Leading the legal due diligence and documentation on acquisitions and disposals',
      'Advising on project finance and infrastructure transactions across multiple sectors',
      'Overseeing the Group\'s corporate governance and company secretarial functions',
      'Managing a team of in-house lawyers and coordinating external counsel across African jurisdictions',
      'Advising on regulatory compliance across CAMA, SEC, FCCPC, and sector-specific regulatory frameworks',
    ],
    requirements: [
      'LLB and BL (Second Class Upper)',
      'Minimum 8–10 years post-call experience, with significant M&A, corporate finance, or in-house experience at a major institution',
      'Proven track record advising on complex commercial transactions',
      'Multi-jurisdictional experience across Africa is a strong advantage',
      'Exceptional leadership, drafting, and negotiation skills',
    ],
    firm: {
      slug: null, name: 'Dangote Industries Limited', tier: null, type: 'other',
      city: 'Lagos', address: 'Union Marble House, 1 Alfred Rewane Road, Ikoyi, Lagos',
      website: 'https://www.dangote.com', verified: true,
      practiceAreas: ['Corporate', 'M&A', 'Energy', 'Regulatory'],
      description: 'Dangote Industries is Nigeria\'s largest conglomerate and Africa\'s largest cement producer, with interests spanning cement, refining, petrochemicals, fertiliser, sugar, and real estate. The Dangote Refinery is the world\'s largest single-train refinery.',
    },
    relatedSlugs: ['chevron-contract-counsel', 'seplat-energy-legal-counsel', 'mtn-ng-legal-regulatory'],
    postedAt: '2026-04-10',
  },

  'airtel-ng-regulatory-counsel': {
    id: '52', slug: 'airtel-ng-regulatory-counsel',
    title: 'Regulatory Counsel',
    type: 'job', level: 'mid',
    location: 'Victoria Island, Lagos',
    isRemote: false, isHybrid: false,
    deadline: '2026-07-25', isRolling: false,
    isVerified: true, isClosingSoon: false,
    salary: '₦16,000,000 – ₦22,000,000 per annum', salaryDisclosed: true,
    practiceAreas: ['Regulatory', 'Telecommunications'],
    tags: ['In-house', 'Telecoms', 'Regulatory'],
    applyUrl: 'https://www.airtel.com.ng/careers',
    applyEmail: null,
    howToApply: 'Apply via the Airtel Nigeria careers portal. Include your CV and a covering letter explaining your regulatory experience.',
    description: `Airtel Nigeria is recruiting a Regulatory Counsel to support its Legal & Regulatory Affairs team in managing the company\'s engagement with the Nigerian Communications Commission and other federal regulators.\n\nThe successful candidate will provide legal advice on telecoms regulation, spectrum management, and competition law — working closely with the regulatory affairs and public policy teams.`,
    responsibilities: [
      'Advising on NCC licensing, regulatory compliance, and quality of service obligations',
      'Supporting engagement with the NCC, FCCPC, and other regulatory bodies',
      'Reviewing and advising on regulatory determinations, directives, and proposed instruments',
      'Assisting with regulatory litigation and judicial review of regulatory decisions',
      'Monitoring legislative and regulatory developments affecting Airtel\'s operations',
      'Advising on mobile money, fintech, and digital services regulatory requirements',
    ],
    requirements: [
      'LLB and BL (Second Class Upper)',
      '3–5 years post-call experience in regulatory, telecoms, or public law',
      'Working knowledge of the Nigerian Communications Act and NCC regulatory framework',
      'Experience engaging with regulators is a significant advantage',
      'Strong analytical and written communication skills',
    ],
    firm: {
      slug: null, name: 'Airtel Nigeria', tier: null, type: 'other',
      city: 'Lagos', address: 'Plot 1, Waterfront Plaza, Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
      website: 'https://www.airtel.com.ng', verified: true,
      practiceAreas: ['Regulatory', 'Telecommunications'],
      description: 'Airtel Nigeria is the second-largest telecoms operator in Nigeria, a subsidiary of Bharti Airtel Limited, one of the world\'s largest mobile network operators by subscriber base.',
    },
    relatedSlugs: ['mtn-ng-legal-regulatory', 'cbn-legal-officer', 'flutterwave-legal-counsel'],
    postedAt: '2026-05-07',
  },

  'sec-ng-legal-officer': {
    id: '53', slug: 'sec-ng-legal-officer',
    title: 'Legal Officer II',
    type: 'job', level: 'junior',
    location: 'Central Business District, Abuja',
    isRemote: false, isHybrid: false,
    deadline: null, isRolling: true,
    isVerified: true, isClosingSoon: false,
    salary: 'Competitive (CONPASS Grade Level)', salaryDisclosed: false,
    practiceAreas: ['Capital Markets', 'Regulatory', 'Public Law & Regulatory'],
    tags: ['Government', 'Regulatory', 'Capital Markets', 'Abuja'],
    applyUrl: 'https://www.sec.gov.ng/careers',
    applyEmail: null,
    howToApply: 'Applications are submitted through the SEC Nigeria recruitment portal. Candidates must complete an online application form and upload required documents. Shortlisted candidates will be invited for written and oral assessments.',
    description: `The Securities and Exchange Commission (SEC) Nigeria invites applications from qualified candidates for the position of Legal Officer II within its Legal & Enforcement Department.\n\nThis is an opportunity to work at the apex capital market regulator, advising on securities regulation, enforcement proceedings, and investor protection — gaining rare exposure to the full breadth of Nigerian capital markets law.`,
    responsibilities: [
      'Providing legal advice on securities laws, SEC Rules, and capital market regulations',
      'Supporting enforcement investigations, administrative proceedings, and sanctions against market participants',
      'Reviewing and advising on applications for registration, approvals, and exemptions under the ISA',
      'Drafting legal opinions, enforcement notices, and regulatory instruments',
      'Monitoring developments in international securities regulation and advising on harmonisation',
      'Supporting litigation management and liaising with the AGF office on judicial proceedings',
    ],
    requirements: [
      'LLB and BL (Second Class Upper minimum)',
      '1–3 years post-call experience',
      'Interest in securities regulation, capital markets, or financial law',
      'Strong research, drafting, and analytical skills',
      'Nigerian citizenship required',
    ],
    firm: {
      slug: null, name: 'Securities & Exchange Commission Nigeria', tier: null, type: 'other',
      city: 'Abuja', address: 'Sir Ademola Adesola Street, Victoria Island, Lagos / Plot 272, Samuel Ladoke Akintola Boulevard, Garki II, Abuja',
      website: 'https://www.sec.gov.ng', verified: true,
      practiceAreas: ['Capital Markets', 'Regulatory', 'Public Law & Regulatory'],
      description: 'The Securities and Exchange Commission (SEC) is the apex regulator of the Nigerian capital market, responsible for regulating investments and securities in Nigeria and protecting the interests of all capital market stakeholders.',
    },
    relatedSlugs: ['cbn-legal-officer', 'stl-public-law-abuja', 'banwo-capital-markets'],
    postedAt: '2026-04-18',
  },
}

// Related listings lookup
const RELATED_PREVIEWS: Record<string, { title: string; firm: string; type: string; deadline: string | null; isRolling: boolean }> = {
  'aluko-associate-banking': { title: 'Associate, Banking & Finance', firm: 'Aluko & Oyebode', type: 'Full-time', deadline: '2025-06-30', isRolling: false },
  'banwo-capital-markets': { title: 'Capital Markets Associate', firm: 'Banwo & Ighodalo', type: 'Full-time', deadline: '2025-07-05', isRolling: false },
  'olajide-tax-associate': { title: 'Tax Associate', firm: 'Olajide Oyewole LLP', type: 'Full-time', deadline: null, isRolling: true },
  'g-elias-telecoms': { title: 'Associate, Technology & Telecoms', firm: 'G. Elias & Co', type: 'Full-time', deadline: '2025-07-20', isRolling: false },
  'aelex-dispute-pupil': { title: 'Dispute Resolution Pupil', firm: 'AELEX', type: 'Pupillage', deadline: null, isRolling: true },
  'streamsowers-arbitration-intern': { title: 'Arbitration Intern', firm: 'Streamsowers & Köhn', type: 'Internship', deadline: '2025-06-25', isRolling: false },
  'templars-vacation-2025': { title: '2025 Vacation Scheme', firm: 'Templars', type: 'Vacation Scheme', deadline: '2025-06-15', isRolling: false },
  'olaniwun-nysc-trainee': { title: 'Legal Trainee (NYSC)', firm: 'Olaniwun Ajayi LP', type: 'Internship', deadline: '2025-06-20', isRolling: false },
  'stl-public-law-abuja': { title: 'Public Law Associate', firm: 'STL Attorneys', type: 'Full-time', deadline: '2026-07-15', isRolling: false },
  'aelex-energy-associate': { title: 'Junior Associate — Energy', firm: 'AELEX', type: 'Full-time', deadline: '2026-07-10', isRolling: false },
  'access-bank-legal-counsel': { title: 'Legal Counsel — Retail Banking', firm: 'Access Bank', type: 'Full-time', deadline: '2026-07-31', isRolling: false },
  'zenith-bank-compliance-counsel': { title: 'Compliance & Legal Officer', firm: 'Zenith Bank', type: 'Full-time', deadline: null, isRolling: true },
  'gtb-corporate-counsel': { title: 'Corporate Affairs Counsel', firm: 'Guaranty Trust Bank', type: 'Full-time', deadline: '2026-08-15', isRolling: false },
  'stanbic-ibtc-legal-analyst': { title: 'Legal & Compliance Analyst', firm: 'Stanbic IBTC', type: 'Full-time', deadline: '2026-07-20', isRolling: false },
  'cbn-legal-officer': { title: 'Legal Officer', firm: 'Central Bank of Nigeria', type: 'Full-time', deadline: null, isRolling: true },
  'seplat-energy-legal-counsel': { title: 'Counsel — Upstream Operations', firm: 'Seplat Energy', type: 'Full-time', deadline: '2026-08-30', isRolling: false },
  'totalenergies-legal-ng': { title: 'Junior Legal Counsel — Exploration', firm: 'TotalEnergies Nigeria', type: 'Full-time', deadline: '2026-07-10', isRolling: false },
  'chevron-contract-counsel': { title: 'Contracts & Commercial Counsel', firm: 'Chevron Nigeria', type: 'Full-time', deadline: '2026-09-01', isRolling: false },
  'flutterwave-legal-counsel': { title: 'Legal Counsel — Payments', firm: 'Flutterwave', type: 'Full-time', deadline: '2026-07-15', isRolling: false },
  'paystack-compliance-counsel': { title: 'Compliance Counsel', firm: 'Paystack', type: 'Full-time', deadline: null, isRolling: true },
  'moniepoint-legal-ops': { title: 'Legal Operations Specialist', firm: 'Moniepoint', type: 'Full-time', deadline: '2026-07-30', isRolling: false },
  'mtn-ng-legal-regulatory': { title: 'Legal & Regulatory Affairs Manager', firm: 'MTN Nigeria', type: 'Full-time', deadline: null, isRolling: true },
  'dangote-group-legal-counsel': { title: 'Group Legal Counsel', firm: 'Dangote Industries', type: 'Full-time', deadline: null, isRolling: true },
  'airtel-ng-regulatory-counsel': { title: 'Regulatory Counsel', firm: 'Airtel Nigeria', type: 'Full-time', deadline: '2026-07-25', isRolling: false },
  'sec-ng-legal-officer': { title: 'Legal Officer II', firm: 'Securities & Exchange Commission', type: 'Full-time', deadline: null, isRolling: true },
}

const TYPE_LABELS: Record<string, string> = {
  job: 'Full-time', internship: 'Internship', vacation_scheme: 'Vacation Scheme',
  pupillage: 'Pupillage', clerkship: 'Clerkship', fellowship: 'Fellowship',
}

function formatDeadline(deadline: string | null, isRolling: boolean): string {
  if (isRolling) return 'Rolling applications'
  if (!deadline) return 'No deadline specified'
  return new Date(deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ListingPage({ params }: { params: { slug: string } }) {
  const listing = LISTINGS[params.slug]
  if (!listing) notFound()

  const days = daysUntil(listing.deadline)
  const isUrgent = days !== null && days <= 7 && days >= 0
  const hasClosed = days !== null && days < 0

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '64px', minHeight: '100vh' }}>

        {/* Breadcrumb */}
        <div style={{ borderBottom: '0.5px solid #E8E0D5', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/jobs" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#4A4A4A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={12} /> Opportunities
            </Link>
            <ChevronRight size={11} color="#4A4A4A" />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#1A1A1A' }}>
              {listing.title}
            </span>
          </div>
        </div>

        {/* Closed banner */}
        {hasClosed && (
          <div style={{ backgroundColor: 'rgba(181,69,27,0.06)', borderBottom: '0.5px solid rgba(181,69,27,0.2)', padding: '0.75rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#B5451B' }}>
              <AlertCircle size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              This listing has closed. The information below is for reference only.
            </p>
          </div>
        )}

        {/* Urgent banner */}
        {isUrgent && (
          <div style={{ backgroundColor: 'rgba(181,69,27,0.06)', borderBottom: '0.5px solid rgba(181,69,27,0.2)', padding: '0.75rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#B5451B', fontWeight: 600 }}>
              <Clock size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Closing in {days} day{days !== 1 ? 's' : ''} — apply promptly.
            </p>
          </div>
        )}

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'start' }}>

          {/* ── MAIN CONTENT ── */}
          <div>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '0.5px solid #E8E0D5' }}>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="label-caps badge-new" style={{ padding: '3px 8px', borderRadius: '2px' }}>
                  {TYPE_LABELS[listing.type] || listing.type}
                </span>
                <span className="label-caps" style={{
                  padding: '3px 8px', borderRadius: '2px', fontSize: '0.6rem',
                  fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: '#4A4A4A', backgroundColor: '#F0EBE3',
                }}>
                  {listing.level.replace('_', ' ')}
                </span>
                {listing.isVerified && (
                  <span className="label-caps badge-verified" style={{ padding: '3px 8px', borderRadius: '2px' }}>
                    ✓ Verified listing
                  </span>
                )}
                {listing.isHybrid && (
                  <span className="label-caps" style={{ padding: '3px 8px', borderRadius: '2px', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2D6A4F', backgroundColor: 'rgba(45,106,79,0.07)', border: '0.5px solid rgba(45,106,79,0.2)' }}>
                    Hybrid
                  </span>
                )}
              </div>

              <h1 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1.15,
                marginBottom: '0.5rem',
              }}>
                {listing.title}
              </h1>

              <Link href={listing.firm.slug ? `/firms/${listing.firm.slug}` : listing.firm.website || '#'} style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1rem',
                color: '#0A2342',
                textDecoration: 'none',
                fontWeight: 500,
              }}>
                {listing.firm.name}
                {listing.firm.tier && <span style={{ color: '#4A4A4A', fontWeight: 400 }}> · {listing.firm.tier}</span>}
              </Link>

              {/* Meta row */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#4A4A4A' }}>
                  <MapPin size={13} /> {listing.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: isUrgent ? '#B5451B' : '#4A4A4A', fontWeight: isUrgent ? 600 : 400 }}>
                  <Clock size={13} /> {formatDeadline(listing.deadline, listing.isRolling)}
                </span>
                {listing.salaryDisclosed && listing.salary && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#2D6A4F' }}>
                    {listing.salary}
                  </span>
                )}
              </div>

              {/* Practice areas */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {listing.practiceAreas.map((area: string) => (
                  <span key={area} style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem',
                    color: '#0A2342', backgroundColor: 'rgba(10,35,66,0.06)',
                    border: '0.5px solid rgba(10,35,66,0.12)',
                    padding: '3px 9px', borderRadius: '2px',
                  }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.2rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '1rem' }}>
                About the role
              </h2>
              {listing.description.split('\n\n').map((para: string, i: number) => (
                <p key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#2C2C2C', lineHeight: 1.8, marginBottom: '1rem' }}>
                  {para}
                </p>
              ))}
            </section>

            {/* Responsibilities */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.2rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '1rem' }}>
                Key responsibilities
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listing.responsibilities.map((item: string, i: number) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <CheckCircle2 size={15} color="#2D6A4F" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#2C2C2C', lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Requirements */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.2rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '1rem' }}>
                Requirements
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listing.requirements.map((item: string, i: number) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <span style={{ width: '5px', height: '5px', backgroundColor: '#0A2342', borderRadius: '50%', flexShrink: 0, marginTop: '8px' }} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#2C2C2C', lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* How to apply */}
            <section style={{
              backgroundColor: '#F0EBE3',
              border: '0.5px solid #E8E0D5',
              padding: '1.5rem',
              borderRadius: '2px',
              marginBottom: '2.5rem',
            }}>
              <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.1rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem' }}>
                How to apply
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#2C2C2C', lineHeight: 1.75, marginBottom: '1.25rem' }}>
                {listing.howToApply}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={listing.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  Apply on website <ExternalLink size={13} />
                </a>
                {listing.applyEmail && (
                  <a
                    href={`mailto:${listing.applyEmail}?subject=${encodeURIComponent(`Application — ${listing.title}`)}`}
                    className="btn-outline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    Apply by email
                  </a>
                )}
              </div>
              {listing.applyUrl && (
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#4A4A4A', marginTop: '0.75rem' }}>
                  → {listing.applyUrl}
                </p>
              )}
            </section>

            {/* Posted date */}
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A' }}>
              Posted {new Date(listing.postedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              {listing.isVerified && ' · Verified by Esquirely'}
            </p>
          </div>

          {/* ── SIDEBAR ── */}
          <aside style={{ position: 'sticky', top: '84px' }}>

            {/* Quick apply card */}
            <div style={{
              backgroundColor: '#FAF7F2',
              border: '0.5px solid #E8E0D5',
              padding: '1.5rem',
              marginBottom: '1rem',
              borderRadius: '2px',
            }}>
              <p className="label-caps" style={{ color: '#4A4A4A', marginBottom: '0.75rem', fontSize: '0.58rem' }}>
                Application
              </p>
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '0.5px solid #E8E0D5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A' }}>Deadline</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: isUrgent ? '#B5451B' : '#1A1A1A', fontWeight: isUrgent ? 600 : 400 }}>
                    {listing.isRolling ? 'Rolling' : listing.deadline ? new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'TBC'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A' }}>Location</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#1A1A1A' }}>{listing.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A' }}>Type</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#1A1A1A' }}>{TYPE_LABELS[listing.type]}</span>
                </div>
                {listing.salaryDisclosed && listing.salary && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A' }}>Salary</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#2D6A4F' }}>{listing.salary}</span>
                  </div>
                )}
              </div>

              <a
                href={listing.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  textDecoration: 'none',
                  marginBottom: '0.5rem',
                  opacity: hasClosed ? 0.5 : 1,
                  pointerEvents: hasClosed ? 'none' : 'auto',
                }}
              >
                Apply Now <ExternalLink size={13} />
              </a>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  padding: '0.55rem', background: 'none', border: '0.5px solid #E8E0D5',
                  borderRadius: '2px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.72rem', color: '#4A4A4A',
                }}>
                  <BookmarkPlus size={13} /> Save
                </button>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  padding: '0.55rem', background: 'none', border: '0.5px solid #E8E0D5',
                  borderRadius: '2px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.72rem', color: '#4A4A4A',
                }}>
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>

            {/* Firm info card */}
            <div style={{
              backgroundColor: '#FAF7F2',
              border: '0.5px solid #E8E0D5',
              padding: '1.5rem',
              marginBottom: '1rem',
              borderRadius: '2px',
            }}>
              <p className="label-caps" style={{ color: '#4A4A4A', marginBottom: '0.75rem', fontSize: '0.58rem' }}>
                About the employer
              </p>

              {/* Monogram */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '40px', height: '40px', backgroundColor: '#0A2342', color: '#FAF7F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '0.85rem',
                  borderRadius: '2px', flexShrink: 0,
                }}>
                  {listing.firm.name.split(' ').filter((w: string) => w.length > 2 && !['&', 'and', 'LLP', 'LP'].includes(w)).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </div>
                <div>
                  {listing.firm.slug ? (
                    <Link href={`/firms/${listing.firm.slug}`} style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                      color: '#1A1A1A', textDecoration: 'none', display: 'block', lineHeight: 1.3,
                    }}>
                      {listing.firm.name}
                    </Link>
                  ) : (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#1A1A1A', display: 'block', lineHeight: 1.3 }}>
                      {listing.firm.name}
                    </span>
                  )}
                  {listing.firm.tier && (
                    <span className="label-caps" style={{ fontSize: '0.58rem', color: '#0A2342', opacity: 0.7 }}>
                      {listing.firm.tier}
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A', lineHeight: 1.65, marginBottom: '0.75rem' }}>
                {listing.firm.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '0.5rem' }}>
                <MapPin size={12} color="#4A4A4A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#4A4A4A', lineHeight: 1.5 }}>
                  {listing.firm.address}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {listing.firm.slug ? (
                  <Link href={`/firms/${listing.firm.slug}`} className="btn-outline" style={{ flex: 1, textAlign: 'center', padding: '0.5rem', fontSize: '0.7rem', textDecoration: 'none' }}>
                    Firm profile
                  </Link>
                ) : (
                  <a href={listing.firm.website} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ flex: 1, textAlign: 'center', padding: '0.5rem', fontSize: '0.7rem', textDecoration: 'none' }}>
                    Employer website
                  </a>
                )}
                {listing.firm.website && (
                  <a href={listing.firm.website} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.5rem 0.75rem', border: '0.5px solid #E8E0D5',
                    borderRadius: '2px', color: '#4A4A4A',
                  }}>
                    <Globe size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Track this application */}
            <div style={{
              backgroundColor: '#0A2342',
              padding: '1.25rem',
              borderRadius: '2px',
            }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#FAF7F2', marginBottom: '0.35rem' }}>
                Track your application
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'rgba(250,247,242,0.6)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                Forward your confirmation email to your Esquirely address and we'll log it automatically.
              </p>
              <Link href="/tracker" style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600,
                color: '#FAF7F2', textDecoration: 'none',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                borderBottom: '0.5px solid rgba(250,247,242,0.4)',
                paddingBottom: '1px',
              }}>
                Set up tracker →
              </Link>
            </div>
          </aside>
        </div>

        {/* Related listings */}
        <div style={{ borderTop: '0.5px solid #E8E0D5', backgroundColor: '#F0EBE3', padding: '3rem 2rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <p className="label-caps" style={{ color: '#0A2342', opacity: 0.7, marginBottom: '1.5rem' }}>
              Similar opportunities
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1px',
              backgroundColor: '#E8E0D5',
              border: '0.5px solid #E8E0D5',
            }}>
              {listing.relatedSlugs
                .filter((s: string) => RELATED_PREVIEWS[s])
                .map((slug: string) => {
                  const rel = RELATED_PREVIEWS[slug]
                  return (
                    <Link key={slug} href={`/jobs/${slug}`} style={{
                      backgroundColor: '#FAF7F2',
                      padding: '1.25rem 1.5rem',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                    >
                      <span className="label-caps badge-new" style={{ padding: '2px 6px', borderRadius: '2px', fontSize: '0.56rem', display: 'inline-block', marginBottom: '0.4rem' }}>
                        {rel.type}
                      </span>
                      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '0.95rem', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                        {rel.title}
                      </p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#0A2342' }}>
                        {rel.firm}
                      </p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: '#4A4A4A', marginTop: '0.35rem' }}>
                        {rel.isRolling ? 'Rolling' : rel.deadline ? `Closes ${new Date(rel.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}` : ''}
                      </p>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>

      </main>
      <Footer />

      {/* Responsive sidebar collapse */}
      <style>{`
        @media (max-width: 900px) {
          main > div:last-of-type > div:first-child {
            grid-template-columns: 1fr !important;
          }
          aside {
            position: static !important;
          }
        }
      `}</style>
    </>
  )
}
