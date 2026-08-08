export type FirmTier = 'Tier 1' | 'Tier 2' | 'Boutique' | 'International'

export interface FirmOffice {
  city: string
  address: string
}

/**
 * Independent directory rankings.
 *
 * WHAT THESE ARE
 *
 *   chambers  Chambers and Partners, Global guide, Nigeria section
 *   iflr      IFLR1000, financial and corporate, Nigeria
 *   emea      The Legal 500 EMEA, Nigeria
 *
 * All three are researched by interviewing the firm's own clients and opposing
 * counsel, which is why a student should care: unlike a firm's own website, no
 * firm can put itself in one. Three are listed rather than one because they do
 * not agree — each weights different work — and a firm ranked by all three is
 * saying something a firm ranked by one is not.
 *
 * WHAT `tier` IS NOT
 *
 * The `tier` field on the record below is Esquirely's own rough size band and
 * is not a ranking. These are. Keeping them in separate fields stops the
 * directory implying that our banding carries a researcher's authority.
 *
 * HOW TO MAINTAIN THIS
 *
 * A band, never a numeric rank, and never a practice area. The guides re-rank
 * annually and per-practice, so "Band 1 for Corporate/M&A, 2025" would be stale
 * within a year and wrong the moment the firm's other practices moved. The
 * coarse band survives an edition; the detail does not. `year` records the
 * edition the band was read from, and the UI shows it, so an unmaintained badge
 * dates itself in public rather than quietly ageing into a lie.
 *
 * Absent means unverified, NOT unranked. A firm with no entry here is one
 * nobody has checked; do not render anything that says otherwise.
 */
/* Band 4 and Tier 4 are real bands in these guides, not padding — Chambers runs
   to Band 4 in Corporate/Commercial, Dispute Resolution, IP & TMT and Projects
   & Energy for Nigeria. They are listed here so a fourth-band firm can be
   recorded as what it is. Collapsing it to 'Ranked' would have been the only
   alternative, and that reads as "band unclear", which would be false. */
export type RankingBand =
  | 'Band 1' | 'Band 2' | 'Band 3' | 'Band 4'
  | 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'
  | 'Ranked'

export interface FirmRankings {
  chambers?: { band: RankingBand; year: number }
  iflr?: { band: RankingBand; year: number }
  emea?: { band: RankingBand; year: number }
}

/** The three directories, in the order they are shown. Kept here so the badge
 *  row, the filter and the profile page cannot drift apart. */
export const RANKING_SOURCES = [
  { key: 'chambers', label: 'Chambers', full: 'Chambers and Partners, Global' },
  { key: 'iflr', label: 'IFLR1000', full: 'IFLR1000, Financial & Corporate' },
  { key: 'emea', label: 'EMEA', full: 'The Legal 500 EMEA' },
] as const

export type RankingKey = (typeof RANKING_SOURCES)[number]['key']

export function rankingsOf(firm: Pick<Firm, 'rankings'>) {
  return RANKING_SOURCES.flatMap(source => {
    const entry = firm.rankings?.[source.key]
    return entry ? [{ ...source, ...entry }] : []
  })
}

export interface Firm {
  slug: string
  logoFile?: string | null
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
  /** Absent means nobody has checked this firm yet, not that it is unranked. */
  rankings?: FirmRankings
}

const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/'

export function logoUrl(file?: string | null): string | null {
  if (!file) return null
  return STORAGE + file.replace(/ /g, '%20')
}

/** Firms whose bucket file could not be converted to a transparent PNG, so they
 *  still serve the original. Only bloomfield-law, which is a .ico that the
 *  image pipeline cannot read; it needs re-sourcing as PNG or SVG. */
const NO_LOCAL_LOGO = new Set(['bloomfield-law'])

/** Firms whose art was pulled straight from their own site and never existed in
 *  the Supabase bucket, so `logoFile` is null but a local PNG does exist.
 *  Without this they would fall through to the monogram tile despite having a
 *  perfectly good mark sitting in /public/firm-logos. */
const LOCAL_ONLY_LOGO = new Set([
  'platinum-taylor-hill',
  'tope-adebayo',
  // Added 2026-08-05 with the twelve new firms. Art pulled straight from each
  // firm's own site by scripts/fetch-new-firm-logos.mjs, so there is no bucket
  // file and logoFile stays null.
  //
  // All twelve now carry a mark. lekan-bamidele came from the firm's own art
  // supplied by hand, because lbandcolaw.com returns 403 to every automated
  // request; it is cropped to its content box rather than trimmed, since trim
  // keys off the corner colour and clipped the asymmetric lockup unevenly.
  //
  // giwa-osagie and ikeyi-shittu were recovered by scripts/repair-firm-logos.mjs
  // rather than by finding a better download. Ikeyi Shittu publish only a white
  // variant for their dark header, so the colour channels are inverted to
  // reconstruct the dark version of the same monochrome mark; Giwa-Osagie's
  // header logo is not in their served HTML, so it comes from an uploaded copy
  // elsewhere on the site.
  // Added with CLP and ALP. CLP's source carries a white frame around a maroon
  // banner with the lettering pushed to the right third, so it is cropped to
  // the lettering and the maroon padded back evenly; ALP's is cropped out of a
  // ruled box that also held 'An SGRB firm' and the site URL.
  'alp-ng',
  'clp-legal',
  'alliance-law-firm',
  'dd-dodo',
  'doa-law',
  'giwa-osagie',
  'ikeyi-shittu',
  'lekan-bamidele',
  'odujinrin-adefulu',
  'omaplex',
  'paul-usoro',
  'pavestones',
  'sofunde-osakwe',
  'the-new-practice',
  // abe-asotie: re-sourced 2026-08-08 from the firm's own site, replacing the
  // opaque crop taken off a hiring flier when abeandasotie.com was unreachable.
  // The download is already RGBA, and it is trimmed to its content box rather
  // than keyed to transparent: this mark is DRAWN on a two-tone plate — a navy
  // block behind the monogram, a pale field behind the lettering — so keying
  // the field would cut the design in half. It goes on the cream plate as the
  // firm supplies it.
  'abe-asotie',
])

/** Preferred source for a firm mark.
 *
 *  These are the transparent PNGs written by scripts/normalise-logos.mjs into
 *  /public/firm-logos, cropped to their own ink and keyed off their background
 *  so they can sit on any ground without dragging a plate behind them. The
 *  bucket originals are opaque (24 of 30 are JPEG/ICO, which cannot hold
 *  alpha at all) and are only used where conversion failed. */
export function firmLogo(firm: Pick<Firm, 'slug' | 'logoFile'>): string | null {
  if (LOCAL_ONLY_LOGO.has(firm.slug)) return `/firm-logos/${firm.slug}.png`
  if (!firm.logoFile) return null
  if (NO_LOCAL_LOGO.has(firm.slug)) return logoUrl(firm.logoFile)
  return `/firm-logos/${firm.slug}.png`
}

const FIRMS_UNSORTED: Firm[] = [
  {
    slug: 'clp-legal',
    logoFile: null,
    name: 'CLP Legal',
    shortName: 'CLP',
    tier: 'Tier 2',
    email: 'info@clplegal.com.ng',
    website: 'https://clplegal.com.ng',
    offices: [
      { city: 'Lagos', address: '62 Awolowo Road, Ikoyi, Lagos' },
      { city: 'Abuja', address: '6th Floor Right Wing, NICON Plaza, Plot 242, Muhammadu Buhari Way, Central Business District, Abuja' },
      { city: 'Port Harcourt', address: '60 Mbonu Street, D-Line, Port Harcourt, Rivers State' },
      { city: 'Uyo', address: 'Second Floor, Right Wing, Suite 201, Peace Plaza, 300 Oron Road, Uyo, Akwa Ibom State' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Banking & Finance', 'Dispute Resolution', 'Energy & Natural Resources', 'Intellectual Property', 'Tax', 'Shipping & Maritime'],
    description: 'A commercial firm founded in 1990, acting for multinationals, Nigerian corporates, family businesses and government ministries. Four offices, with corporate, finance, litigation and energy at the core of the practice.',
    foundedYear: 1990,
    openRoles: 0,
  },
  {
    slug: 'alp-ng',
    logoFile: null,
    name: 'ALP NG & Co',
    shortName: 'ALP',
    tier: 'Tier 2',
    email: 'info@alp.company',
    website: 'https://alp.company',
    offices: [
      { city: 'Lagos', address: '15 Military Street, Onikan, Lagos' },
      { city: 'Abuja', address: '3 Lobito Crescent, Wuse II, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Arbitration', 'Banking & Finance', 'Energy & Natural Resources', 'Intellectual Property', 'Public Law & Regulatory'],
    description: 'Africa Law Practice NG & Co, formed by a merger of Nigerian practices and built as a pan-African firm. Strong in commercial dispute resolution, appearing before the Nigerian courts and in ICSID and ICC arbitrations.',
    foundedYear: 2011,
    openRoles: 0,
  },
  {
    slug: 'abe-asotie',
    // logoFile stays null on purpose: the mark came from the firm's own site
    // rather than the Supabase bucket, so it is picked up through
    // LOCAL_ONLY_LOGO above instead.
    logoFile: null,
    name: 'Abe & Asotie LP',
    shortName: 'Abe & Asotie',
    tier: 'Boutique',
    email: 'info@abeandasotie.com',
    website: 'https://abeandasotie.com',
    // Read off the firm's own contact block at abeandasotie.com. The earlier
    // 'Lagos' / 'Lagos' placeholder was written when the site was unreachable;
    // it is published, so it is recorded rather than left as the city twice.
    offices: [
      { city: 'Lagos', address: '2nd Floor, Left Wing, LCA Building, 1a Remi Olowude Street, 2nd Roundabout, Lekki-Epe Expressway, Lagos' },
    ],
    // Mapped onto this directory's shared vocabulary, not copied verbatim from
    // the firm's own list. 'Oil & Gas', 'Employment Law' and 'Real Estate' are
    // things this firm genuinely does, but none of them is a PRACTICE_OPTIONS
    // value, so no filter on /firms could ever select them — a practice area no
    // filter reaches is dead text on the card.
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Banking & Finance', 'Energy & Natural Resources', 'Intellectual Property', 'Tax', 'Shipping & Maritime'],
    // The firm, not the people who started it. Every other entry in this
    // directory describes what the firm does and who it acts for; a profile
    // that opens on two names reads as a founder story rather than as an answer
    // to "would I want to work here".
    description: 'A full-service Lagos firm working across corporate and commercial practice, dispute resolution, banking and finance, energy and oil and gas, aviation, shipping and admiralty, tax, intellectual property, immigration, employment, data protection and ESG. Acts for individuals, companies and not-for-profits, with company secretarial and business advisory work alongside the contentious practice. Founded in 2025 and growing quickly, from an office in the Lagos Court of Arbitration building at Lekki.',
    // 2025, not 2024. Africa Legal's launch report dates it to June 2025, and
    // the firm was still announcing its first associate hires through that
    // autumn.
    foundedYear: 2025,
    // Hand-kept, not derived from the jobs table: the Lawyer (Legal Aid and
    // Prison Decongestion) row seeded by scripts/seed-abe-asotie-role.mjs.
    // Return this to 0 when that role closes.
    openRoles: 1,
  },
  {
    slug: 'acas-law',
    logoFile: 'ACAS.jpg',
    name: 'ACAS-Law',
    shortName: 'ACAS',
    tier: 'Tier 1',
    email: 'recruit@acas-law.com',
    website: 'https://acas-law.com',
    offices: [{ city: 'Lagos', address: '9th Floor, St. Nicholas House, Catholic Mission Street, Lagos Island, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Banking & Finance', 'Dispute Resolution'],
    description: 'A leading Nigerian commercial law firm with particular strength in energy, corporate transactions, and dispute resolution. Combined with Dentons in 2021 and now practises as Dentons ACAS-Law.',
    foundedYear: 2000,
    openRoles: 0,
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
      { city: 'Lagos', address: '4th Floor, Marble House, 1 Kingsway Road, Falomo, Ikoyi, Lagos' },
      { city: 'Abuja', address: '4th Floor, Adamawa Plaza, Off Shehu Shagari Way, Central Business District, Abuja' },
      { city: 'Port Harcourt', address: '2nd Floor, Right Wing, UPDC Building, 26 Aba Road, Port Harcourt' },
      { city: 'Accra', address: 'Suite C, Casa Maria, 28 Angola Road, Kuku Hill, Cantonments, Accra, Ghana' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Dispute Resolution', 'Arbitration', 'Shipping & Maritime', 'Corporate & Commercial'],
    description: 'A leading full-service West African law firm with exceptional expertise in energy, dispute resolution, and maritime law.',
    foundedYear: 2004,
    openRoles: 4,
  },
  {
    slug: 'aina-blankson',
    logoFile: 'aina blankson.jpg',
    name: 'Aina Blankson LP',
    shortName: 'Aina Blankson',
    tier: 'Tier 2',
    email: 'info@ainablankson.com',
    website: 'https://ainablankson.com',
    offices: [
      { city: 'Lagos', address: '5/7 Ademola Street, Off Awolowo Road, South West Ikoyi, Lagos' },
      { city: 'London', address: '85 Great Portland Street, London W1W 7LT' },
    ],
    practiceAreas: ['Shipping & Maritime', 'Corporate & Commercial', 'Energy & Natural Resources', 'Dispute Resolution'],
    description: 'A leading maritime and shipping law firm in Nigeria, with additional expertise in corporate, energy, and commercial law.',
    foundedYear: 1994,
    openRoles: 0,
  },
  {
    slug: 'ajumogobia-okeke',
    logoFile: 'ajumogbia.jpg',
    name: 'Ajumogobia & Okeke',
    shortName: 'A&O Nigeria',
    tier: 'Tier 2',
    email: 'ao@ajumogobiaokeke.com',
    website: 'https://ajumogobiaokeke.com',
    offices: [
      { city: 'Lagos', address: '2nd Floor, Sterling Towers, 20 Marina, Lagos' },
      { city: 'Abuja', address: '84 Kwame Nkrumah Crescent, Asokoro District, Abuja' },
      { city: 'Port Harcourt', address: '1st Floor, Sapphire House, 39 Wogu Street, D/Line, Port Harcourt' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Corporate & Commercial', 'Dispute Resolution', 'Shipping & Maritime'],
    description: 'A boutique firm with deep expertise in energy, maritime, and natural resources law.',
    openRoles: 0,
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
      { city: 'Abuja', address: 'Plot 1384A Agulu Lake Street, Maitama, Abuja' },
      { city: 'Port Harcourt', address: '3rd Floor, Plot 173, Sani Abacha Road, GRA Phase III, Port Harcourt' },
    ],
    practiceAreas: ['Banking & Finance', 'Capital Markets', 'Corporate & Commercial', 'Energy & Natural Resources', 'Dispute Resolution'],
    description: "Nigeria's largest law firm by headcount, offering a full range of corporate and commercial legal services with offices across the country.",
    foundedYear: 1993,
    openRoles: 4,
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
      { city: 'Lagos', address: '48 Awolowo Road, South West Ikoyi, Lagos' },
      { city: 'Abuja', address: '14 Negro Crescent, Maitama, Abuja' },
      { city: 'Port Harcourt', address: '3 Woke-Koro Street, Old GRA, Port Harcourt' },
    ],
    practiceAreas: ['Capital Markets', 'Corporate & Commercial', 'Banking & Finance', 'Dispute Resolution', 'Tax'],
    description: 'A leading Nigerian law firm with particular strength in capital markets, banking and finance, and corporate transactions.',
    foundedYear: 1991,
    openRoles: 2,
  },
  {
    slug: 'blackfriars-law',
    logoFile: 'blackfriars-law.jpg',
    name: 'Blackfriars Law',
    shortName: 'Blackfriars',
    tier: 'Boutique',
    email: 'recruitment@blackfriars-law.com',
    website: 'https://blackfriars-law.com',
    offices: [{ city: 'Lagos', address: '28 McCarthy Street, Onikan, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Banking & Finance'],
    description: 'A boutique commercial law firm offering focused expertise in corporate transactions and dispute resolution.',
    foundedYear: 2008,
    openRoles: 0,
  },
  {
    slug: 'bloomfield-law',
    logoFile: 'bloomfield-law.ico',
    name: 'Bloomfield Law Practice',
    shortName: 'Bloomfield',
    tier: 'Tier 2',
    email: 'employment@bloomfield-law.com',
    website: 'https://bloomfield-law.com',
    offices: [{ city: 'Lagos', address: '15 Agodogba Avenue, Parkview, Ikoyi, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Banking & Finance', 'Intellectual Property', 'Dispute Resolution'],
    description: 'A commercial law firm offering expertise across corporate transactions, banking, intellectual property, and dispute resolution.',
    foundedYear: 2005,
    openRoles: 0,
  },
  {
    slug: 'dealhq-partners',
    logoFile: 'Deal Hq.jpg',
    name: 'DealHQ Partners',
    shortName: 'DealHQ',
    tier: 'Boutique',
    email: 'info@dealhqpartner.com',
    website: 'https://dealhqpartner.com',
    offices: [{ city: 'Lagos', address: '3B Dr. Omon Ebhomenye Street, Lekki Phase 1, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Banking & Finance', 'Capital Markets'],
    description: 'A transactions-focused boutique law firm specialising in corporate finance, capital markets, and commercial advisory.',
    foundedYear: 2015,
    openRoles: 0,
  },
  {
    slug: 'detail-solicitors',
    logoFile: 'Detail solicitors.jpg',
    name: 'Detail Solicitors',
    shortName: 'Detail',
    tier: 'Tier 1',
    email: 'nysc@detailsolicitors.com',
    website: 'https://detailsolicitors.com',
    offices: [{ city: 'Lagos', address: 'DCS Place, 8 DCS Street, Off Remi Olowude Way, Lekki Phase 1, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Intellectual Property', 'Tax', 'Banking & Finance'],
    description: 'A specialist commercial firm with a formidable reputation in intellectual property, corporate advisory, and tax matters.',
    openRoles: 2,
  },
  {
    slug: 'famsville-solicitors',
    logoFile: 'Famsville.jpg',
    name: 'Famsville Solicitors',
    shortName: 'Famsville',
    tier: 'Boutique',
    email: 'info@famsvillesolicitors.com',
    website: 'https://famsvillesolicitors.com',
    offices: [{ city: 'Lagos', address: '28B Association Way, Dolphin Estate, Ikoyi, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Banking & Finance'],
    description: 'A boutique commercial law firm providing focused legal services across corporate, finance, and dispute resolution.',
    foundedYear: 2012,
    openRoles: 0,
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
      { city: 'Lagos', address: '6 Broad Street, Lagos Island, Lagos' },
      { city: 'Abuja', address: '30 Mediterranean Street, Maitama, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Telecommunications', 'Dispute Resolution', 'Tax', 'Capital Markets'],
    description: 'A renowned commercial law firm with a distinguished heritage and leading practice in telecommunications and corporate law.',
    foundedYear: 1944,
    openRoles: 1,
  },
  {
    slug: 'george-etomi',
    logoFile: 'george-etomi.jpg',
    name: 'George Etomi & Partners',
    shortName: 'George Etomi',
    tier: 'Tier 2',
    email: 'info@geplaw.com',
    website: 'https://geplaw.com',
    offices: [
      { city: 'Lagos', address: '1B Tiramiyu Belo-Osagie Street, Parkview Estate, Ikoyi, Lagos' },
      { city: 'Port Harcourt', address: '11 Finima Street, Old GRA, Port Harcourt' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Dispute Resolution', 'Banking & Finance'],
    description: 'A full-service commercial law firm with deep expertise in energy, corporate transactions, and dispute resolution.',
    foundedYear: 1994,
    openRoles: 0,
  },
  {
    slug: 'jackson-etti-edu',
    logoFile: 'Jackson etti.png',
    name: 'Jackson, Etti & Edu',
    shortName: 'JEE',
    tier: 'Tier 1',
    email: 'jee@jee.africa',
    website: 'https://jee.africa',
    offices: [
      { city: 'Lagos', address: '3-5 Sinari Daranijo Street, Off Ajose Adeogun, Victoria Island, Lagos' },
      { city: 'Lagos', address: '1st Floor, Ereke House, Plot 15 CIPM Avenue, CBD Alausa, Ikeja, Lagos' },
      { city: 'Abuja', address: '42 Moses Majekodunmi Crescent, Utako, Abuja' },
      { city: 'Accra', address: '3 Emmause, 2nd Close, Akosombo House, Labone, Accra, Ghana' },
      { city: 'Yaoundé', address: '3rd Floor, Viccui Building, Apartment 15-16, Carr Street, New Town, Yaoundé, Cameroon' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Employment', 'Intellectual Property', 'Real Estate'],
    description: 'A well-established firm with broad commercial expertise, particularly recognised for its employment law and intellectual property practice.',
    openRoles: 1,
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
      { city: 'Lagos', address: '8 Ogunyemi Road, Palace Way, Oniru, Lagos' },
      { city: 'Abuja', address: 'C3 Bensima House, 3rd Floor, Plot 2942, Cadastral Zone A6, Aguiyi Ironsi Street, Maitama, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Tax', 'Banking & Finance', 'Real Estate', 'Employment'],
    description: 'A full-service commercial law firm with deep expertise in corporate transactions, tax advisory, and real estate.',
    openRoles: 1,
  },
  {
    slug: 'mike-igbokwe',
    logoFile: 'mike-igbokwe.jpg',
    name: 'Mike Igbokwe & Co',
    shortName: 'Mike Igbokwe',
    tier: 'Boutique',
    email: 'mike@mikeigbokwe.com',
    website: 'https://mikeigbokwe.com',
    offices: [
      { city: 'Lagos', address: '28A Mainland Way, Dolphin Estate, Ikoyi, Lagos' },
      { city: 'Abuja', address: 'A1 Nelson Mandela Street, Palma Royale Estate, Plot 304 Ameh Ebute Street, Wuye, Abuja' },
    ],
    practiceAreas: ['Arbitration', 'Dispute Resolution', 'Shipping & Maritime'],
    description: "A specialist dispute resolution and arbitration practice led by one of Nigeria's foremost arbitration practitioners.",
    foundedYear: 1995,
    openRoles: 0,
  },
  {
    slug: 'olajide-oyewole',
    logoFile: 'olajide oyewole.jpg',
    name: 'Olajide Oyewole LLP',
    shortName: 'Olajide Oyewole',
    tier: 'Tier 1',
    email: 'careers@olajide-oyewole.com',
    website: 'https://olajide-oyewole.com',
    offices: [{ city: 'Lagos', address: 'Plot 5 Block 14, Bashorun Okusanya Avenue, Lekki Peninsula Scheme 1, Lagos' }],
    practiceAreas: ['Banking & Finance', 'Tax', 'Corporate & Commercial', 'Capital Markets', 'Real Estate'],
    description: 'A full-service commercial law firm known for innovative legal solutions in banking, finance, and tax advisory.',
    openRoles: 2,
  },
  {
    slug: 'olaniwun-ajayi',
    logoFile: 'olaniwun-ajayi.jpg',
    name: 'Olaniwun Ajayi LP',
    shortName: 'Olaniwun Ajayi',
    tier: 'Tier 1',
    email: 'recruitment@olaniwunajayi.net',
    website: 'https://olaniwunajayi.net',
    offices: [
      { city: 'Lagos', address: 'The Adunola, Plot L2, 401 Close, Banana Island, Ikoyi, Lagos' },
      { city: 'Abuja', address: '4th Floor, Leadway House, Plot 1061, Cadastral Avenue, Central Business District, Abuja' },
      { city: 'Port Harcourt', address: 'House 17, Road 315, Trans Amadi Gardens, Peter Odili Road, Port Harcourt' },
      { city: 'London', address: '29th Floor, 30 St Mary Axe, London EC3A 8AF' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Banking & Finance', 'Tax', 'Capital Markets'],
    description: "One of Nigeria's foremost full-service commercial law firms, widely recognised for its leading corporate and energy practice.",
    foundedYear: 1978,
    openRoles: 3,
  },
  {
    slug: 'platinum-taylor-hill',
    logoFile: null,
    name: 'Platinum & Taylor Hill LP',
    shortName: 'Platinum & Taylor Hill',
    tier: 'Boutique',
    email: 'info@pthlp.com',
    website: 'https://pthlp.com',
    offices: [
      { city: 'Lagos', address: '7th Floor, Mulliner Towers, 39 Alfred Rewane Road, Ikoyi, Lagos' },
      { city: 'Abuja', address: '4th Floor, Church Gate Plaza, Plot 473 Constitution Avenue, Central Business District, Abuja' },
    ],
    practiceAreas: ['Tax', 'Corporate & Commercial', 'Banking & Finance', 'Energy & Natural Resources', 'Dispute Resolution', 'Capital Markets', 'Real Estate'],
    description:
      'A commercial firm advising on taxation, corporate transactions, banking and energy, with a technology practice serving startups on incorporation, structuring and funding. Correspondent relationships across West and East Africa.',
    openRoles: 0,
  },
  {
    slug: 'tope-adebayo',
    logoFile: null,
    name: 'Tope Adebayo LP',
    shortName: 'Tope Adebayo',
    tier: 'Boutique',
    email: 'info@topeadebayolp.com',
    website: 'https://topeadebayolp.com',
    offices: [{ city: 'Lagos', address: 'The Phoenix, 3rd Floor, 31 Mobolaji Bank Anthony Way, Ikeja, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Energy & Natural Resources', 'Intellectual Property', 'Shipping & Maritime', 'Banking & Finance'],
    description:
      'A Lagos commercial firm with practice groups across corporate transactions, dispute resolution and energy, plus a technology, media and intellectual property team. Known for asset tracing and project finance work.',
    openRoles: 0,
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
      { city: 'Lagos', address: '1 Perchstone & Graeys Close, Off Adekola Balogun Street, Off Remi Olowude Way, Lekki, Lagos' },
      { city: 'Abuja', address: 'D3 Jima Plaza, Plot 1267 Ahmadu Bello Way, Area 11, Garki, Abuja' },
      { city: 'Benin City', address: '40 Adesogbe Road, Benin City, Edo State' },
      { city: 'London', address: '107 Kingston Hill, Kingston-upon-Thames, London' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Banking & Finance', 'Capital Markets', 'Dispute Resolution', 'Real Estate'],
    description: 'A full-service law firm providing comprehensive corporate and commercial legal services to domestic and international clients.',
    openRoles: 1,
  },
  {
    slug: 'primera-africa',
    logoFile: 'Primera.jpg',
    name: 'Primera Africa Legal',
    shortName: 'Primera Africa',
    tier: 'Tier 2',
    email: 'info@primeraal.com',
    website: 'https://primeraal.com',
    offices: [{ city: 'Lagos', address: '1B Utomi Aire Avenue, Off Fola Osibo, Lekki Phase 1, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Banking & Finance', 'Capital Markets', 'Energy & Natural Resources'],
    description: 'A leading commercial law firm with a strong focus on banking, finance, capital markets, and energy transactions.',
    foundedYear: 2008,
    openRoles: 0,
  },
  {
    slug: 'punuka',
    logoFile: 'punuka.png',
    name: 'Punuka Attorneys & Solicitors',
    shortName: 'Punuka',
    tier: 'Tier 2',
    email: 'careers@punuka.com',
    website: 'https://punuka.com',
    offices: [
      { city: 'Lagos', address: 'PAS World Centre, Plot 7 Block A10, Layi Yusuf Street, Off Admiralty Way, Lekki Phase 1, Lagos' },
      { city: 'Abuja', address: '9 Freetown Street, Behind Rockview Hotel, Wuse 2, Abuja' },
      { city: 'Asaba', address: '7 B.R.O Uzoegbu Street, Off Okpanam Road, Asaba, Delta State' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Energy & Natural Resources', 'Tax'],
    description: 'A commercial law firm with strong expertise in corporate transactions, dispute resolution, and energy law.',
    foundedYear: 1993,
    openRoles: 0,
  },
  {
    slug: 'resolution-law',
    logoFile: 'resolution.jpg',
    name: 'Resolution Law Firm',
    shortName: 'Resolution Law',
    tier: 'Boutique',
    email: 'info@resolutionlawng.com',
    website: 'https://resolutionlawng.com',
    offices: [{ city: 'Lagos', address: '50/52 Toyin Street, Ikeja, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Intellectual Property'],
    description: 'A boutique commercial law firm offering expertise in corporate advisory, dispute resolution, and intellectual property.',
    foundedYear: 2010,
    openRoles: 0,
  },
  {
    slug: 'simmons-cooper',
    logoFile: 'simmons-cooper.png',
    name: 'Simmons Cooper Partners',
    shortName: 'Simmons Cooper',
    tier: 'Tier 2',
    email: 'careers@scp-law.com',
    website: 'https://scp-law.com',
    offices: [
      { city: 'Lagos', address: '9th Floor, Fortune Towers, 27/29 Adeyemo Alakija Street, Victoria Island, Lagos' },
      { city: 'Abuja', address: '9 Rima Street, Maitama, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Banking & Finance', 'Dispute Resolution'],
    description: 'A full-service commercial law firm with strong expertise in energy, corporate, and finance transactions.',
    foundedYear: 2003,
    openRoles: 0,
  },
  {
    slug: 'spa-ajibade',
    logoFile: 'SPA ajibade.jpg',
    name: 'SPA Ajibade & Co',
    shortName: 'SPA Ajibade',
    tier: 'Tier 1',
    email: 'hr@spaajibade.com',
    website: 'https://spaajibade.com',
    offices: [
      { city: 'Lagos', address: 'Suite 201, SPAACO House, 27A Macarthy Street, Onikan, Lagos' },
      { city: 'Abuja', address: 'Suite A312, Garki Mall, Plot 1580 Damaturu Crescent, Garki II, Abuja' },
      { city: 'Ibadan', address: 'Top Floor Suite, SPAACO House, 138 Liberty Stadium Road, Ibadan' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Banking & Finance', 'Dispute Resolution', 'Capital Markets'],
    description: "One of Nigeria's leading full-service commercial law firms, widely recognised for its energy, corporate and finance practice.",
    foundedYear: 1994,
    openRoles: 0,
  },
  {
    slug: 'stren-blan-partners',
    logoFile: 'StrenBlanPartners.png',
    name: 'Stren & Blan Partners',
    shortName: 'Stren & Blan',
    tier: 'Tier 2',
    email: 'Careers@strenandblan.com',
    website: 'https://strenandblan.com',
    offices: [
      { city: 'Lagos', address: '3 Theophilus Orji Street, Off Fola Osibo Road, Lekki Phase 1, Lagos' },
      { city: 'Abuja', address: 'House 22, 21 Road Kado Estate Phase 1, Abuja' },
      { city: 'Enugu', address: 'Plot 30 Republic Estate Independence Layout, Enugu' },
    ],
    practiceAreas: ['Arbitration', 'Banking & Finance', 'Capital Markets', 'Energy & Natural Resources', 'Intellectual Property', 'Shipping & Maritime', 'Real Estate', 'Tax', 'Employment'],
    description: 'A full-service commercial law firm with offices in Lagos, Abuja, and Enugu, offering broad expertise across transactions, disputes, and regulatory matters.',
    openRoles: 0,
  },
  {
    slug: 'streamsowers-kohn',
    logoFile: 'streamsowers.jpg',
    name: 'Streamsowers & Kohn',
    shortName: 'Streamsowers',
    tier: 'Tier 1',
    email: 'info@streamsowers.com',
    website: 'https://streamsowers.com',
    offices: [
      { city: 'Lagos', address: '852B Bishop Aboyade Cole Street, Victoria Island, Lagos' },
      { city: 'Abuja', address: 'Block C Terrace 3, CT3 Lobito Crescent, Stallion Estate, Wuse II, Abuja' },
      { city: 'Port Harcourt', address: '77B Woji Road, GRA Phase II, Port Harcourt' },
    ],
    practiceAreas: ['Dispute Resolution', 'Arbitration', 'Corporate & Commercial', 'Banking & Finance'],
    description: "Nigeria's pre-eminent dispute resolution firm, with unrivalled expertise in commercial arbitration and litigation.",
    foundedYear: 1993,
    openRoles: 2,
  },
  {
    slug: 'tayo-oyetibo',
    logoFile: 'TayoOyetibo.jpg',
    name: 'Tayo Oyetibo LP',
    shortName: 'Tayo Oyetibo',
    tier: 'Tier 2',
    email: 'reception@tayooyetibolaw.com',
    website: 'https://tayooyetibolaw.com',
    offices: [{ city: 'Lagos', address: 'Faith House, Plot 6 Block 113, Lekki-Epe Expressway, Lekki Phase 1, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Banking & Finance', 'Energy & Natural Resources'],
    description: 'A full-service commercial law firm with expertise in corporate transactions, energy, and dispute resolution.',
    foundedYear: 1996,
    openRoles: 0,
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
      { city: 'Lagos', address: 'The Octagon, 13A A. J. Marinho Drive, Victoria Island, Lagos' },
      { city: 'Abuja', address: '6 Usuma Close, Off Gana Street, Maitama, Abuja' },
      { city: 'Port Harcourt', address: '28 Tombia Street, GRA Phase 2, Port Harcourt' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Corporate & Commercial', 'Dispute Resolution', 'Capital Markets', 'Banking & Finance'],
    description: 'A top-tier commercial law firm known for its strong energy and corporate practice, serving multinationals and major Nigerian businesses.',
    foundedYear: 2009,
    openRoles: 3,
  },
  {
    slug: 'udo-udoma-bello-osagie',
    logoFile: 'udo-udoma.webp',
    name: 'Udo Udoma & Bello-Osagie',
    shortName: 'UUBO',
    tier: 'Tier 1',
    email: 'careers@uubo.org',
    website: 'https://uubo.org',
    offices: [
      { city: 'Lagos', address: 'St Nicholas House, 10th, 12th & 13th Floors, Catholic Mission Street, Lagos Island, Lagos' },
      { city: 'Abuja', address: 'Abia House, 2nd Floor, Michika Street, Ahmadu Bello Way, Central Business District, Abuja' },
      { city: 'Port Harcourt', address: '16 Khana Street, D-Line, Port Harcourt' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Capital Markets', 'Banking & Finance', 'Dispute Resolution', 'Tax'],
    description: "One of Nigeria's foremost law firms, offering exceptional legal services across corporate, finance, and dispute resolution practice areas.",
    foundedYear: 1996,
    openRoles: 2,
  },
  {
    slug: 'wole-olanipekun',
    logoFile: 'wole olanipekun.jpg',
    name: 'Wole Olanipekun & Co',
    shortName: 'Wole Olanipekun',
    tier: 'Tier 1',
    email: 'info@woleolanipekun.com',
    website: 'https://woleolanipekun.com',
    offices: [
      { city: 'Lagos', address: "God's Grace House, 5 Maple Close, Osborne Foreshore Estate Phase 2, Ikoyi, Lagos" },
      { city: 'Abuja', address: "God's Grace House, 6 Oshakati Close, Off Constantine Street, Wuse Zone 4, Abuja" },
    ],
    practiceAreas: ['Dispute Resolution', 'Corporate & Commercial', 'Public Law & Regulatory'],
    description: 'A distinguished Nigerian law firm with a strong reputation in litigation, arbitration, and corporate advisory.',
    foundedYear: 1988,
    openRoles: 0,
  },

  /* Added 2026-08-05. Every address below was taken from the firm's own contact
   * page where that page was reachable, and from a ranking directory listing
   * (Legal 500, Chambers, IFLR1000) where it was not. Nothing here is inferred:
   * where a firm publishes offices we could not confirm street-level, only the
   * confirmed ones are listed rather than a guess at the rest.
   *
   * `logoFile` is null throughout. These marks are not in the Supabase bucket
   * and have no local PNG yet, so firmLogo returns null and the cards fall back
   * to the monogram tile. They stay out of the home page logo loop until the
   * art is sourced, which is correct: a blank slot there would break the
   * marquee's exact 50% translate. */

  {
    slug: 'alliance-law-firm',
    logoFile: null,
    name: 'Alliance Law Firm',
    shortName: 'Alliance',
    tier: 'Tier 2',
    email: 'info@alliancelf.com',
    website: 'https://alliancelawfirm.ng',
    offices: [
      { city: 'Lagos', address: 'Alliance House, 71 Ademola Street, Off Awolowo Road, South-West Ikoyi, Lagos' },
      { city: 'Abuja', address: '63 Mississippi Street, Off Alvan Ikoku Way, Maitama, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Capital Markets', 'Dispute Resolution', 'Telecommunications & ICT'],
    description: 'A full service commercial firm founded by Uche Val Obi SAN and Olusoji Toki, working across energy, capital markets, infrastructure and technology from three offices.',
    foundedYear: 2002,
    openRoles: 0,
  },
  {
    slug: 'dd-dodo',
    logoFile: null,
    name: 'D.D. Dodo & Co',
    shortName: 'D.D. Dodo',
    tier: 'Tier 2',
    email: 'info@dddodo.com',
    website: 'https://dddodo.com',
    // The firm names Abuja, Lagos, Kano and Jos, but publishes a street address
    // only for Abuja. The other three are described rather than invented.
    offices: [
      { city: 'Abuja', address: '10 Atbara Street, Off Cairo Street, Wuse II, Abuja' },
    ],
    practiceAreas: ['Dispute Resolution', 'Constitutional & Electoral Law', 'Energy & Natural Resources', 'Corporate & Commercial', 'Telecommunications & ICT'],
    description: 'A litigation and arbitration heavyweight led by D.D. Dodo SAN, regularly instructed in constitutional, election and high value commercial disputes. Also keeps offices in Lagos, Kano and Jos.',
    foundedYear: 1990,
    openRoles: 0,
  },
  {
    slug: 'doa-law',
    logoFile: null,
    name: 'Duale, Ovia & Alex-Adedipe',
    shortName: 'DOA',
    tier: 'Tier 1',
    email: 'info@doa-law.com',
    website: 'https://www.doa-law.com',
    offices: [
      { city: 'Lagos', address: 'Plot 1b, Block 129, Jide Sawyerr Drive, Lekki Phase 1, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Technology & Fintech', 'Private Equity & Venture Capital', 'Banking & Finance', 'Mergers & Acquisitions'],
    description: 'The firm most closely associated with Nigerian venture capital and startup work. Its corporate practice is co-led by Adeniyi Duale and Adeleke Alex-Adedipe and is ranked by both Legal 500 and IFLR1000.',
    openRoles: 0,
  },
  {
    slug: 'giwa-osagie',
    logoFile: null,
    name: 'Giwa-Osagie & Co',
    shortName: 'Giwa-Osagie',
    tier: 'Tier 2',
    email: 'giwa-osagie@giwa-osagie.com',
    website: 'https://www.giwa-osagie.com',
    offices: [
      { city: 'Lagos', address: '2nd Floor, Wing A, Sapetro Towers, 1 Adeola Odeku Street, Victoria Island, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Shipping & Maritime', 'Foreign Investment'],
    description: 'A long established Victoria Island commercial practice known for foreign investment, energy and maritime work, and a member of the Primerus international network.',
    openRoles: 0,
  },
  {
    slug: 'ikeyi-shittu',
    logoFile: null,
    name: 'Ikeyi Shittu & Co',
    shortName: 'Ikeyi Shittu',
    tier: 'Tier 2',
    email: 'info@ikeyishittuco.com',
    website: 'https://isc.ng',
    offices: [
      { city: 'Lagos', address: '1st Floor, 21 Boyle Street, Onikan, Lagos Island, Lagos' },
      { city: 'Abuja', address: 'Suite 7, Moz Mall, 19 Durban Street, Off Ademola Adetokunbo Crescent, Wuse II, Abuja' },
      { city: 'Enugu', address: 'Plot 50, Liberty Estate, Independence Layout, Enugu' },
    ],
    practiceAreas: ['Taxation', 'Corporate & Commercial', 'Labour & Employment', 'Intellectual Property', 'Dispute Resolution', 'Data Protection'],
    description: 'A corporate and commercial firm rated for tax, infrastructure and employment work, acting for indigenous conglomerates, multinationals and several of Nigeria’s largest banks. Founded as Ikeyi Egudu & Co and renamed in 2019.',
    foundedYear: 2005,
    openRoles: 0,
  },
  {
    slug: 'lekan-bamidele',
    logoFile: null,
    name: 'Lekan Bamidele & Co',
    shortName: 'Lekan Bamidele',
    tier: 'Boutique',
    email: 'info@lbandcolaw.com',
    website: 'https://lbandcolaw.com',
    offices: [
      { city: 'Lagos', address: '10 Oluwole Omole Street, Ikeja, Lagos' },
    ],
    practiceAreas: ['Intellectual Property', 'Media & Entertainment', 'Taxation', 'Corporate Compliance', 'Start-up Advisory', 'Dispute Resolution'],
    description: 'A boutique practice trading as The Bohemian Firm, built around entertainment, intellectual property and tax work for creators, start-ups and rights holders.',
    foundedYear: 2018,
    openRoles: 0,
  },
  {
    slug: 'odujinrin-adefulu',
    logoFile: null,
    name: 'Odujinrin & Adefulu',
    shortName: 'Odujinrin & Adefulu',
    tier: 'Tier 2',
    email: 'info@odujinrinadefulu.com',
    website: 'https://odujinrinadefulu.com',
    offices: [
      { city: 'Lagos', address: '1 Ademola Street, South West Ikoyi, Lagos' },
      { city: 'Abuja', address: '3rd Floor, WAEC Complex, 10 Zambezi Crescent, Maitama, Abuja' },
      { city: 'Port Harcourt', address: "16A Manilla Pepple Street, D'Line, Port Harcourt, Rivers State" },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Corporate & Commercial', 'Banking & Finance', 'Dispute Resolution', 'Real Estate & Construction'],
    description: 'An established commercial firm with a strong energy and natural resources practice, and one of the few in the directory with a genuine three city footprint including Port Harcourt.',
    openRoles: 0,
  },
  {
    slug: 'omaplex',
    logoFile: null,
    name: 'Omaplex Law Firm',
    shortName: 'Omaplex',
    tier: 'Tier 2',
    // The firm publishes a dedicated applications address, so use it rather
    // than the general legal@ inbox: it is the one a candidate should write to.
    email: 'applications@omaplex.com.ng',
    website: 'https://omaplex.com.ng',
    offices: [
      { city: 'Abuja', address: 'Plot 994, Edwin Ume Ezeoke Street, Off Ahmeh, Wuye District, Abuja' },
    ],
    practiceAreas: ['Dispute Resolution', 'Corporate & Commercial', 'Constitutional & Electoral Law', 'Taxation', 'Energy & Environment', 'Real Estate & Construction'],
    description: 'An Abuja headquartered full service practice with associate offices across Nigeria, notable for constitutional and electoral work alongside its commercial and regulatory advisory.',
    openRoles: 0,
  },
  {
    slug: 'paul-usoro',
    logoFile: null,
    name: 'Paul Usoro & Co',
    shortName: 'Paul Usoro',
    tier: 'Tier 1',
    email: 'info@paulusoro.com',
    website: 'https://paulusoro.com',
    offices: [
      { city: 'Lagos', address: '7th Floor, 999c Danmole Street, Victoria Island, Lagos' },
    ],
    practiceAreas: ['Telecommunications & ICT', 'Dispute Resolution', 'Corporate & Commercial', 'Banking & Finance', 'Public Law & Regulatory'],
    description: 'A full service firm long identified with telecommunications and regulatory litigation, founded by Paul Usoro SAN, a past President of the Nigerian Bar Association. Established in Kaduna and headquartered in Lagos since 1992.',
    foundedYear: 1985,
    openRoles: 0,
  },
  {
    slug: 'pavestones',
    logoFile: null,
    name: 'Pavestones Legal',
    shortName: 'Pavestones',
    tier: 'Boutique',
    email: 'info@pavestoneslegal.com',
    website: 'https://pavestoneslegal.com',
    offices: [
      { city: 'Lagos', address: '3A Gbenga Ademulegun Street, Parkview Estate, Ikoyi, Lagos' },
    ],
    practiceAreas: ['Technology & Innovation', 'Data Protection', 'Corporate & Commercial', 'Banking & Finance', 'Energy & Natural Resources'],
    description: 'A female led practice focused on technology and innovation, ranked by Chambers for fintech and among the most visible Nigerian firms advising start-ups on data protection and compliance.',
    openRoles: 0,
  },
  {
    slug: 'sofunde-osakwe',
    logoFile: null,
    name: 'Sofunde, Osakwe, Ogundipe & Belgore',
    shortName: 'SOOB',
    tier: 'Tier 1',
    email: 'info@sooblaw.com',
    website: 'https://sooblaw.com',
    offices: [
      { city: 'Lagos', address: '23/25 Catholic Mission Street, Lagos Island, Lagos' },
    ],
    practiceAreas: ['Dispute Resolution', 'Corporate & Commercial', 'Money & Capital Markets', 'Regulatory & Compliance', 'Asset Recovery', 'Insolvency'],
    description: 'One of the country’s most respected disputes practices, close to four decades old, handling complex commercial litigation, arbitration, insolvency and asset recovery.',
    openRoles: 0,
  },
  {
    slug: 'the-new-practice',
    logoFile: null,
    name: 'The New Practice',
    shortName: 'TNP',
    tier: 'Tier 2',
    email: 'tnp@tnp.com.ng',
    website: 'https://tnp.com.ng',
    offices: [
      { city: 'Lagos', address: '50 Raymond Njoku Street, Ikoyi, Lagos' },
    ],
    practiceAreas: ['Technology & Fintech', 'Corporate & Commercial', 'Private Equity & Venture Capital', 'Banking & Finance', 'Intellectual Property'],
    description: 'An IFLR1000 ranked corporate practice known for technology, venture financing and cross border transaction work for founders and investors.',
    openRoles: 0,
  },
]

export function getMonogram(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 2 && !['and', 'LLP', 'LP', 'Co', 'the'].includes(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}


/** Sort key: ignore a leading initial ('G. Elias' -> 'Elias') and the '&'/'and'
 *  noise so the directory and the logo loop read in true alphabetical order. */
function sortKey(name: string): string {
  return name
    .replace(/^[A-Z].s+/, '')
    .replace(/^(The|A)s+/i, '')
    .toLowerCase()
}

/**
 * Directory rankings, by firm slug.
 *
 * Kept out of the firm records on purpose. These change once a year, all at
 * once, from three sources — so they are edited as one table on one afternoon,
 * not by hunting through forty-seven object literals. A slug here that is not a
 * firm is ignored rather than throwing, so a typo costs a missing badge and not
 * a build.
 *
 * ————————————————————————————————————————————————————————————————
 * DO NOT FILL THIS FROM MEMORY. EVERY LINE IS READ OFF THE GUIDE.
 * ————————————————————————————————————————————————————————————————
 *
 * Every entry is a factual claim about a real firm made by a named third party,
 * and the whole value of the badge is that it was not written by us or by the
 * firm. A plausible-looking band typed in from recollection is indistinguishable
 * on the page from a checked one, and it would put an invented Chambers band
 * next to a real firm's name in public. That is not a cosmetic error.
 *
 * So each line is read off the guide itself and nowhere else:
 *
 *   Chambers   chambers.com/downloads/rankings/1190/nigeria.pdf → the band
 *   IFLR1000   iflr1000.com/Jurisdiction/Nigeria                → the tier
 *   EMEA       legal500.com/c/nigeria                           → the tier
 *
 * Record the coarse band and the edition year, nothing finer — see the note on
 * FirmRankings for why per-practice detail cannot be maintained. When a firm is
 * listed but the band is unclear, use 'Ranked': it claims only presence in the
 * guide, which is both true and worth showing.
 *
 * ———————————————————————————————————————————————————————————————————————
 * PROVENANCE OF WHAT IS BELOW
 * ———————————————————————————————————————————————————————————————————————
 *
 * `chambers` — read on 2026-08-08 from Chambers Global 2026, the Nigeria
 * section, published by Chambers as a PDF at the URL above. Every band below
 * was taken from the "Leading Firms" table of a named practice area in that
 * document. Nothing here is inferred, and no firm absent from those tables has
 * an entry.
 *
 * HOW A PER-PRACTICE BAND BECAME ONE BAND. Chambers does not band a firm as a
 * whole; it bands it once per practice area, and the good firms sit in several.
 * This table holds one band per guide, so the rule applied is *the highest band
 * the firm holds in any Nigeria practice area*. That is the reading a badge
 * conventionally carries — "Band 1 in Chambers" is understood as "Band 1 in
 * something", not "Band 1 in everything" — and it is the only rule that is
 * stable as the practice mix changes. It is recorded here because it is a
 * choice, and a reader auditing a badge is entitled to know which one was made.
 *
 * The source practice area for each firm's best band is named in the comment
 * beside it, so any single line can be checked against the PDF without
 * re-reading all seven tables.
 *
 * `iflr` and `emea` — NOT YET READ. Absent, which the type and the UI already
 * treat as "nobody has checked", not "unranked". IFLR1000 and Legal 500 both
 * put their Nigeria tables behind client-side rendering that could not be read
 * reliably, and a tier taken from a search-result summary is exactly the
 * secondhand claim the warning above exists to prevent. They stay empty until
 * someone reads them. The badge row already handles one-of-three.
 */
export const FIRM_RANKINGS: Record<string, FirmRankings> = {
  /* Band 1 — each is Band 1 in at least one Nigeria practice area. */
  'aluko-oyebode':          { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in Banking, Capital Markets, Corporate, Dispute Res, IP & TMT, Projects
  'olaniwun-ajayi':         { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in Banking, Corporate, Dispute Res, Projects, Tax
  'templars':               { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in Banking, Corporate, Dispute Res, Projects
  'udo-udoma-bello-osagie': { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in Banking, Capital Markets, Corporate
  'banwo-ighodalo':         { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in Capital Markets, Corporate, Projects
  'g-elias':                { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in Corporate, Dispute Res, Tax
  'aelex':                  { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in Tax
  'jackson-etti-edu':       { chambers: { band: 'Band 1', year: 2026 } }, // Band 1 in IP & TMT

  /* Band 2 */
  'acas-law':               { chambers: { band: 'Band 2', year: 2026 } }, // Band 2 in Projects & Energy (listed as Dentons ACAS-Law)
  'olajide-oyewole':        { chambers: { band: 'Band 2', year: 2026 } }, // Band 2 in IP & TMT (listed as Olajide Oyewole LLP)

  /* Band 3 */
  'bloomfield-law':         { chambers: { band: 'Band 3', year: 2026 } }, // Band 3 in Corporate, Projects
  'detail-solicitors':      { chambers: { band: 'Band 3', year: 2026 } }, // Band 3 in Banking & Finance
  'odujinrin-adefulu':      { chambers: { band: 'Band 3', year: 2026 } }, // Band 3 in Banking & Finance
  'streamsowers-kohn':      { chambers: { band: 'Band 3', year: 2026 } }, // Band 3 in Projects & Energy
  'spa-ajibade':            { chambers: { band: 'Band 3', year: 2026 } }, // Band 3 in Dispute Resolution
  'wole-olanipekun':        { chambers: { band: 'Band 3', year: 2026 } }, // Band 3 in Dispute Resolution
  'sofunde-osakwe':         { chambers: { band: 'Band 3', year: 2026 } }, // Band 3 in Dispute Resolution

  /* Band 4 */
  'doa-law':                { chambers: { band: 'Band 4', year: 2026 } }, // Band 4 in Corporate (listed as Duale, Ovia & Alex-Adedipe)
  'stren-blan-partners':    { chambers: { band: 'Band 4', year: 2026 } }, // Band 4 in Corporate, IP & TMT
  'the-new-practice':       { chambers: { band: 'Band 4', year: 2026 } }, // Band 4 in Corporate (listed as TNP – The New Practice)
  'perchstone-graeys':      { chambers: { band: 'Band 4', year: 2026 } }, // Band 4 in Dispute Resolution
  'tayo-oyetibo':           { chambers: { band: 'Band 4', year: 2026 } }, // Band 4 in Dispute Resolution (listed as Tayo Oyetibo LP)
}

/** Alphabetical by firm name. Every consumer reads from here.
 *
 *  Rankings are merged in here rather than stored on the literals, so
 *  FIRM_RANKINGS stays the single place they are edited. */
export const ALL_FIRMS: Firm[] = [...FIRMS_UNSORTED]
  .map(f => (FIRM_RANKINGS[f.slug] ? { ...f, rankings: FIRM_RANKINGS[f.slug] } : f))
  .sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), 'en'))

/** Firms that actually have a logo asset — used by the home page logo loop so
 *  the marquee has no empty slots and its 50% translate stays exact. */
export const FIRMS_WITH_LOGOS: Firm[] = ALL_FIRMS.filter(f => !!firmLogo(f))

/** Best-effort logo for a free-text employer name coming from Supabase.
 *  Matches on name, shortName, or slug shape so 'Aluko & Oyebode', 'Aluko and
 *  Oyebode' and 'aluko-oyebode' all resolve. Returns null when the employer is
 *  not a firm in the directory (banks, fintechs, corporates). */
/** Employer names arrive as free text from Supabase, so every lookup keys off
 *  the same normalisation: lowercased, '&' spelled out, punctuation stripped. */
const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '')

export function logoForEmployer(employer?: string | null): string | null {
  if (!employer) return null
  const target = norm(employer)
  if (!target) return null
  // Exact only. A startsWith fallback here once matched the string
  // 'aluko-oyebode.jpg' to a firm, so a passed-in filename silently rendered as
  // a logo; prefix matching is too loose to be worth the extra hits.
  const hit = ALL_FIRMS.find(
    f => norm(f.name) === target || norm(f.shortName) === target || norm(f.slug) === target
  )
  // Route through firmLogo, not logoUrl. Going straight to the bucket served the
  // untrimmed original, so a mark with heavy baked-in padding rendered a third
  // of the size it should on the job board and in the ball pit, while the same
  // firm looked correct in the directory. Every surface reads the same art now.
  if (hit) return firmLogo(hit)
  return EMPLOYER_LOGOS[target] || null
}

/** Non-firm employers (banks, fintechs, corporates) are not in the directory,
 *  so their marks live in /public/employer-logos. Drop a file in that folder
 *  and add the key here; the key is the normalised employer name. */
const EMPLOYER_LOGOS: Record<string, string> = {
  zenithbankplc: '/employer-logos/zenith-bank.png',
  zenithbank: '/employer-logos/zenith-bank.png',
  mtnnigeria: '/employer-logos/mtn.png',
  flutterwave: '/employer-logos/flutterwave.jpg',
  moniepointinc: '/employer-logos/moniepoint.jpg',
  moniepoint: '/employer-logos/moniepoint.jpg',
  accessbank: '/employer-logos/access-bank.png',
  accessbankplc: '/employer-logos/access-bank.png',
  // Keys must match norm() in logoForEmployer: lowercased, '&' spelled out, all
  // other punctuation and spaces stripped. The first key in each group is the
  // exact employer string as it is stored in Supabase today; the rest cover the
  // spellings a new listing is likely to arrive with.
  firstbankofnigeria: '/employer-logos/first-bank.png',
  firstbank: '/employer-logos/first-bank.png',
  firstbanknigeria: '/employer-logos/first-bank.png',
  firstbankofnigerialimited: '/employer-logos/first-bank.png',
  fbn: '/employer-logos/first-bank.png',
  unionbanknigeria: '/employer-logos/union-bank.png',
  unionbank: '/employer-logos/union-bank.png',
  unionbankofnigeria: '/employer-logos/union-bank.png',
  unionbankofnigeriaplc: '/employer-logos/union-bank.png',
  // The official emblem from ecowas.int, not an aggregator's own branding: the
  // employer here is the Commission itself, and the site that happened to
  // surface the listing has no claim to the slot.
  ecowascommission: '/employer-logos/ecowas.png',
  ecowas: '/employer-logos/ecowas.png',
  ecowassecretariat: '/employer-logos/ecowas.png',
  economiccommunityofwestafricanstates: '/employer-logos/ecowas.png',
  // The globe alone, not the full lockup. 'WORLD BANK GROUP' set beside the
  // globe is a 5.1:1 mark, and BallMark clamps anything that wide to about 14%
  // of the ball's height, so the wordmark would be a smear. The globe is the
  // Bank's own standalone identifier and it is square, so it fills the ball.
  worldbankgroup: '/employer-logos/world-bank.png',
  worldbank: '/employer-logos/world-bank.png',
  wbg: '/employer-logos/world-bank.png',
  theworldbank: '/employer-logos/world-bank.png',
  // Supabase stores this employer with the '(Client)' suffix, which norm()
  // strips to nothing useful, so both spellings are mapped.
  bridgegapconsultsclient: '/employer-logos/bridgegap.png',
  bridgegapconsults: '/employer-logos/bridgegap.png',
  bridgegap: '/employer-logos/bridgegap.png',
  castlefieldattorneys: '/employer-logos/castlefield.png',
  castlefield: '/employer-logos/castlefield.png',
}

/** Ball ground for employers whose mark is drawn on a solid brand colour.
 *
 *  Both of these ship their artwork on a filled field: First Bank's elephant
 *  sits on a gold parallelogram, Union Bank's horse on a blue rectangle. On the
 *  default white ball that field reads as a coloured box floating inside a white
 *  disc. Matching the ball to the field dissolves that edge, so the mark appears
 *  to sit directly on the ball.
 *
 *  Values are sampled from the logo files themselves (the modal opaque colour),
 *  not eyeballed, so the two grounds are the same colour and leave no seam. */
const EMPLOYER_BALL_BG: Record<string, string> = {
  firstbankofnigeria: '#F0C030',
  firstbank: '#F0C030',
  firstbanknigeria: '#F0C030',
  firstbankofnigerialimited: '#F0C030',
  fbn: '#F0C030',
  unionbanknigeria: '#00A0E0',
  unionbank: '#00A0E0',
  unionbankofnigeria: '#00A0E0',
  unionbankofnigeriaplc: '#00A0E0',
  castlefieldattorneys: '#1E4E72',
  castlefield: '#1E4E72',
}

/** Brand ground for an employer's ball, or null to use the default white. */
export function ballBgForEmployer(employer?: string | null): string | null {
  if (!employer) return null
  return EMPLOYER_BALL_BG[norm(employer)] || null
}
