export type FirmTier = 'Tier 1' | 'Tier 2' | 'Boutique' | 'International'

export interface FirmOffice {
  city: string
  address: string
}

export interface Firm {
  logoFile?: string | null
  slug: string
  name: string
  shortName: string
  tier: FirmTier
  email: string
  website: string
  offices: FirmOffice[]
  practiceAreas: string[]
  description: string
  foundedYear?: number
  openRoles: number
}

export const ALL_FIRMS: Firm[] = [
  {
    slug: 'olaniwun-ajayi',
    logoFile: 'olaniwun-ajayi.jpg',
    name: 'Olaniwun Ajayi LP',
    shortName: 'Olaniwun Ajayi',
    tier: 'Tier 1',
    email: 'recruitment@olaniwunajayi.net',
    website: 'https://olaniwunajayi.net',
    offices: [
      { city: 'Lagos', address: 'The Adunola, Banana Island, Ikoyi, Lagos' },
      { city: 'Abuja', address: 'Plot 1119, Cadastral Zone A00, Central Business District, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Banking & Finance', 'Tax', 'Capital Markets'],
    description: 'One of Nigeria\'s foremost full-service commercial law firms, widely recognised for its leading corporate and energy practice.',
    foundedYear: 1978,
    openRoles: 3,
  },
  {
    slug: 'banwo-ighodalo',
    logoFile: 'banwo-ighodalo.jpg',
    name: 'Banwo & Ighodalo',
    shortName: 'Banwo & Ighodalo',
    tier: 'Tier 1',
    email: 'hr@banwo-ighodalo.com',
    website: 'https://banwo-ighodalo.com',
    offices: [
      { city: 'Lagos', address: '98 Awolowo Road, Ikoyi, Lagos' },
    ],
    practiceAreas: ['Capital Markets', 'Corporate & Commercial', 'Banking & Finance', 'Dispute Resolution', 'Tax'],
    description: 'A leading Nigerian law firm with particular strength in capital markets, banking and finance, and corporate transactions.',
    foundedYear: 1991,
    openRoles: 2,
  },
  {
    slug: 'aluko-oyebode',
    logoFile: 'aluko-oyebode.jpg',
    name: 'Aluko & Oyebode',
    shortName: 'Aluko & Oyebode',
    tier: 'Tier 1',
    email: 'careers@aluko-oyebode.com',
    website: 'https://aluko-oyebode.com',
    offices: [
      { city: 'Lagos', address: '1 Murtala Muhammed Drive, Ikoyi, Lagos' },
      { city: 'Abuja', address: 'Plot 2093, Ladoke Akintola Boulevard, Garki II, Abuja' },
      { city: 'Port Harcourt', address: '4 Igbodo Street, Old GRA, Port Harcourt' },
    ],
    practiceAreas: ['Banking & Finance', 'Capital Markets', 'Corporate & Commercial', 'Energy & Natural Resources', 'Dispute Resolution'],
    description: 'Nigeria\'s largest law firm by headcount, offering a full range of corporate and commercial legal services with offices across the country.',
    foundedYear: 1993,
    openRoles: 4,
  },
  {
    slug: 'kenna-partners',
    logoFile: 'kenna-partners.png',
    name: 'Kenna Partners',
    shortName: 'Kenna Partners',
    tier: 'Tier 1',
    email: 'careers@kennapartners.com',
    website: 'https://kennapartners.com',
    offices: [
      { city: 'Lagos', address: '9 Omo-Osagie Street, Off Awolowo Road, Ikoyi, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Tax', 'Banking & Finance', 'Real Estate', 'Employment'],
    description: 'A full-service commercial law firm with deep expertise in corporate transactions, tax advisory, and real estate.',
    openRoles: 1,
  },
  {
    slug: 'templars',
    logoFile: 'templars.jpg',
    name: 'Templars',
    shortName: 'Templars',
    tier: 'Tier 1',
    email: 'careers@templars-law.com',
    website: 'https://templars-law.com',
    offices: [
      { city: 'Lagos', address: '13A Idowu Taylor Street, Victoria Island, Lagos' },
      { city: 'Abuja', address: 'Plot 1412 Tigris Crescent, Maitama, Abuja' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Corporate & Commercial', 'Dispute Resolution', 'Capital Markets', 'Banking & Finance'],
    description: 'A top-tier commercial law firm known for its strong energy and corporate practice, serving multinationals and major Nigerian businesses.',
    foundedYear: 2009,
    openRoles: 3,
  },
  {
    slug: 'detail-solicitors',
    logoFile: 'Detail.jpg',
    name: 'Detail Solicitors',
    shortName: 'Detail',
    tier: 'Tier 1',
    email: 'nysc@detailsolicitors.com',
    website: 'https://detailsolicitors.com',
    offices: [
      { city: 'Lagos', address: '235A Igbosere Road, Lagos Island, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Intellectual Property', 'Tax', 'Banking & Finance'],
    description: 'A specialist commercial firm with a formidable reputation in intellectual property, corporate advisory, and tax matters.',
    openRoles: 2,
  },
  {
    slug: 'perchstone-graeys',
    logoFile: 'perchstone.jpg',
    name: 'Perchstone & Graeys LP',
    shortName: 'Perchstone & Graeys',
    tier: 'Tier 1',
    email: 'perchstone@perchstoneandgraeys.com',
    website: 'https://perchstoneandgraeys.com',
    offices: [
      { city: 'Lagos', address: '4 Obalende Road, Ikoyi, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Banking & Finance', 'Capital Markets', 'Dispute Resolution', 'Real Estate'],
    description: 'A full-service law firm providing comprehensive corporate and commercial legal services to domestic and international clients.',
    openRoles: 1,
  },
  {
    slug: 'aelex',
    logoFile: 'aelex.jpg',
    name: 'AELEX',
    shortName: 'AELEX',
    tier: 'Tier 1',
    email: 'info@aelex.com',
    website: 'https://aelex.com',
    offices: [
      { city: 'Lagos', address: 'St. Nicholas House, Catholic Mission Street, Lagos Island, Lagos' },
      { city: 'Abuja', address: 'Plot 1254, Nnadedi Close, Off T.Y. Danjuma Street, Asokoro, Abuja' },
      { city: 'Port Harcourt', address: 'Plot 3, Aba Road, GRA Phase II, Port Harcourt' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Dispute Resolution', 'Arbitration', 'Shipping & Maritime', 'Corporate & Commercial'],
    description: 'A leading full-service West African law firm with exceptional expertise in energy, dispute resolution, and maritime law.',
    foundedYear: 2004,
    openRoles: 4,
  },
  {
    slug: 'streamsowers-kohn',
    logoFile: 'streamsowers.jpg',
    name: 'Streamsowers & Köhn',
    shortName: 'Streamsowers',
    tier: 'Tier 1',
    email: 'info@streamsowers.com',
    website: 'https://streamsowers.com',
    offices: [
      { city: 'Lagos', address: '12 Adetokunbo Ademola Street, Victoria Island, Lagos' },
    ],
    practiceAreas: ['Dispute Resolution', 'Arbitration', 'Corporate & Commercial', 'Banking & Finance'],
    description: 'Nigeria\'s pre-eminent dispute resolution firm, with unrivalled expertise in commercial arbitration and litigation.',
    foundedYear: 1993,
    openRoles: 2,
  },
  {
    slug: 'g-elias',
    logoFile: 'Elias.jpeg',
    name: 'G. Elias & Co',
    shortName: 'G. Elias',
    tier: 'Tier 1',
    email: 'info@gelias.com',
    website: 'https://gelias.com',
    offices: [
      { city: 'Lagos', address: '4 Saka Tinubu Street, Victoria Island, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Telecommunications', 'Dispute Resolution', 'Tax', 'Capital Markets'],
    description: 'A renowned commercial law firm with a distinguished heritage and leading practice in telecommunications and corporate law.',
    foundedYear: 1944,
    openRoles: 1,
  },
  {
    slug: 'olajide-oyewole',
    logoFile: 'olajide oyewole.jpg',
    name: 'Olajide Oyewole LLP',
    shortName: 'Olajide Oyewole',
    tier: 'Tier 1',
    email: 'careers@olajide-oyewole.com',
    website: 'https://olajide-oyewole.com',
    offices: [
      { city: 'Lagos', address: 'UBA House, 57 Marina, Lagos Island, Lagos' },
    ],
    practiceAreas: ['Banking & Finance', 'Tax', 'Corporate & Commercial', 'Capital Markets', 'Real Estate'],
    description: 'A full-service commercial law firm known for innovative legal solutions in banking, finance, and tax advisory.',
    openRoles: 2,
  },
  {
    slug: 'stl-attorneys',
    name: 'STL Attorneys',
    shortName: 'STL',
    tier: 'Tier 2',
    email: 'careers@stlattorneys.com',
    website: 'https://stlattorneys.com',
    offices: [
      { city: 'Abuja', address: 'Plot 1035, Cadastral Zone A0, Central Business District, Abuja' },
    ],
    practiceAreas: ['Public Law & Regulatory', 'Corporate & Commercial', 'Dispute Resolution', 'Employment'],
    description: 'An Abuja-based firm with a strong regulatory and public law practice, advising government agencies and multinationals.',
    openRoles: 1,
  },
  {
    slug: 'udo-udoma-bello-osagie',
    name: 'Udo Udoma & Bello-Osagie',
    shortName: 'UUBO',
    tier: 'Tier 1',
    email: 'careers@uubo.org',
    website: 'https://uubo.org',
    offices: [
      { city: 'Lagos', address: '10 Amodu Ojikutu Street, Victoria Island, Lagos' },
      { city: 'Abuja', address: 'Plot 1400 Shehu Shagari Way, Maitama, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Capital Markets', 'Banking & Finance', 'Dispute Resolution', 'Tax'],
    description: 'One of Nigeria\'s foremost law firms, offering exceptional legal services across corporate, finance, and dispute resolution practice areas.',
    foundedYear: 1996,
    openRoles: 2,
  },
  {
    slug: 'jackson-etti-edu',
    name: 'Jackson, Etti & Edu',
    shortName: 'JEE',
    tier: 'Tier 1',
    email: 'info@jee.com.ng',
    website: 'https://jee.com.ng',
    offices: [
      { city: 'Lagos', address: '52 Raymond Njoku Street, Ikoyi, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Employment', 'Intellectual Property', 'Real Estate'],
    description: 'A well-established firm with broad commercial expertise, particularly recognised for its employment law and intellectual property practice.',
    openRoles: 1,
  },
  {
    slug: 'ajumogobia-okeke',
    logoFile: 'ajumogbia.jpg',
    name: 'Ajumogobia & Okeke',
    shortName: 'A&O Nigeria',
    tier: 'Tier 2',
    email: 'careers@ajumogobia-okeke.com',
    website: 'https://ajumogobia-okeke.com',
    offices: [
      { city: 'Lagos', address: 'Lekki Phase 1, Lagos' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Corporate & Commercial', 'Dispute Resolution', 'Shipping & Maritime'],
    description: 'A boutique firm with deep expertise in energy, maritime, and natural resources law.',
    openRoles: 0,
  },
]

export function getMonogram(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 2 && !['&', 'and', 'LLP', 'LP', 'Co', 'the', 'and'].includes(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}
