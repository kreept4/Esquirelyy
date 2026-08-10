/**
 * Esquirely's own banding of a firm's standing.
 *
 * NOT "Tier 1 / Tier 2" any more, and the rename is the point. Those words are
 * what Chambers, IFLR1000 and Legal 500 use for their bands, so putting our own
 * "Tier 1" on a card three centimetres from a real Legal 500 Tier 1 badge read
 * as a fourth directory agreeing with the other three. It was not; it was us.
 * "Leading" and "Established" are plainly editorial, which is what they are.
 *
 * `Leading` is now earned rather than assigned: it means the firm holds a top
 * band — Chambers Band 1, IFLR1000 Tier 1 or Legal 500 EMEA Tier 1 — in at
 * least one directory. Nine firms clear that. Twenty two used to carry the old
 * Tier 1 label, and the thirteen that moved include four with no directory
 * entry at all; the rule is applied without exception, so a firm ranked only
 * through its named SAN rather than as a firm does not qualify.
 *
 * `Boutique` is a different axis and is left alone: it describes the kind of
 * practice, not where it places, and a boutique can hold a band. ENR Advisory
 * is Chambers Band 2 and still a boutique.
 */
export type FirmTier = 'Leading' | 'Established' | 'Boutique'

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
 * A band, never a numeric rank, plus the practice areas that band was earned in.
 *
 * The practice areas are a deliberate reversal. This table used to hold the band
 * alone, on the argument that "Band 1 for Corporate/M&A" goes stale the moment a
 * firm's other practices move, while a coarse band survives an edition. That
 * argument is still true and is the cost of what is here now. It was outweighed:
 * a student deciding where to apply cares enormously that a firm is Tier 1 FOR
 * BANKING rather than Tier 1 in the abstract, and the abstract version invites
 * the reader to assume the ranking covers everything the firm does, which is
 * the more misleading of the two failures.
 *
 * So the maintenance burden is now higher on purpose. `areas` has to be re-read
 * with the band every edition, not inferred, and a firm that picks up or loses a
 * practice ranking needs its line changed even when the top band has not moved.
 *
 * `band` stays the HIGHEST band the firm holds in any Nigeria practice area, and
 * `areas` names the practice areas it holds AT THAT BAND — not every area it is
 * ranked in. Listing lower-banded areas beside a top band would read as though
 * they shared it. Where a lower band is worth recording, the comment beside the
 * entry carries it.
 *
 * `year` records the edition the band was read from, and the UI shows it, so an
 * unmaintained badge dates itself in public rather than quietly ageing into a
 * lie.
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

/**
 * One guide's verdict on one firm.
 *
 * `areas` is optional rather than required, and that is not laziness. 'Ranked'
 * exists for a firm the guide lists without a clean tier, and a firm can be
 * ranked in a table that names no practice area at all. Forcing an array there
 * would mean inventing a label to satisfy the type, which is the failure this
 * whole file is written against. An empty or absent `areas` renders as the band
 * alone, which is the honest fallback.
 */
export interface RankingEntry {
  band: RankingBand
  year: number
  /** The practice areas held AT `band`. Read off the guide, never inferred. */
  areas?: string[]
}

export interface FirmRankings {
  chambers?: RankingEntry
  iflr?: RankingEntry
  emea?: RankingEntry
}

/**
 * A trade-body membership, which is NOT a ranking and is kept out of
 * FirmRankings for that reason.
 *
 * ISDA does not band anyone. Membership is a binary fact: the body admitted the
 * firm or it did not. Forcing it into RankingEntry would mean inventing a band
 * to satisfy the type, and it would then render under "Independent rankings"
 * beside Chambers and Legal 500, which would tell a reader that a trade body
 * had assessed the firm against its peers. It has not.
 *
 * It earns a place beside the rankings anyway because for a student choosing
 * between firms it answers a question the guides do not: who actually does the
 * derivatives work. Same maintenance rule as the ranking table — absent means
 * nobody has checked, never that the firm is not a member.
 */
/**
 * A directory ranking held by a named lawyer rather than by the firm.
 *
 * THE FIRM IS NOT THE LAWYER, which is why this is a separate type and not an
 * entry in FirmRankings. Chambers ranks some Nigerian practices only through
 * their principal — the firm carries no department ranking at all, but a named
 * SAN in it is banded. Rendering that as a firm badge would tell a student
 * something false about where they would be applying.
 *
 * Suppressing it entirely was the other error, and it is the one this fixes.
 * These are among the best known practices in the country, and a profile that
 * silently showed nothing implied the directories had passed over them. They
 * had not. It is a real distinction, it is simply a distinction about a person,
 * so it is said in those words and kept out of the ranking row.
 *
 * `band` and `year` are optional because the source table records the ranking
 * for some individuals without one, and inventing a band to fill the type is
 * the failure this whole file is written against.
 */
export interface RankedIndividual {
  /** As the guide prints it, post-nominals included. */
  name: string
  source: RankingKey
  band?: RankingBand
  year?: number
  /** The practice the individual is ranked in, never the firm's whole offering. */
  area?: string
}

export interface FirmMembership {
  /** Short form, for the badge. */
  body: string
  /** Full name, for the hover and the profile row. */
  full: string
  /** What the membership actually is. Read from the body, never inferred. */
  note: string
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
  /**
   * What the firm was called before it rebranded.
   *
   * Rendered on the profile and searchable, because a rename does not reach
   * everybody at once. A student told about "Famsville" by a lecturer, or
   * holding a two-year-old vacation scheme note, searches the old name and must
   * still land on the firm rather than on nothing. It also answers the question
   * the profile otherwise raises, which is whether this is the same firm.
   */
  formerName?: string
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
  /** Absent means nobody has checked this firm yet, not that it is not a member. */
  memberships?: FirmMembership[]
  /** Rankings held by named lawyers where the firm itself carries none. */
  rankedIndividuals?: RankedIndividual[]
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
  // Added 2026-08-08 with the nine-firm batch, same route: art pulled from each
  // firm's own site by scripts/fetch-new-firm-logos.mjs.
  //
  // Four needed more than a download. Babalakin and Kola Awodein publish JPEGs,
  // so their marks arrived on an opaque white plate and the white is keyed out.
  // F. R. A. Williams publish only a reversed mark, inverted here the same way
  // Ikeyi Shittu's was. Femi Atoyebi publish only a white SVG, so the fill is
  // swapped to ink before rasterising, which keeps the paths exact.
  //
  // Chris Ogunbanjo trips the LIGHT check at lum 186 and is deliberately kept:
  // it is a pale blue device, not reversed artwork, and it reads fine on cream.
  //
  // abdulai-taiwo was the one firm with no mark anywhere. Their own site sets
  // the name as text, their favicon.ico is a zero byte file, and every image on
  // the site is stock photography. The wordmark here was supplied by hand on
  // 2026-08-09, as lekan-bamidele's was. Processing it needed one step the
  // fetch script does not do: the file carries a thin grey rule around the art,
  // which survives white keying and then defeats a crop to the ink, since the
  // rule becomes the outermost opaque thing in the frame. Four pixels off each
  // edge first, then key, then crop to the alpha bounding box.
  'abdulai-taiwo',
  'babalakin',
  'solola-akpana',
  'advocaat',
  'kola-awodein',
  'fra-law',
  'chris-ogunbanjo',
  'femi-atoyebi',
  'idowu-sofola',
  // Third batch, same day. All three came down clean on the first attempt,
  // which is what a normal run of this script looks like when a firm publishes
  // its own mark at full size and not only as a header thumbnail.
  'olisa-agbakoba',
  'yusuf-ali',
  'ao2-law',
  // Fourth batch. The Law Crest and Matrix Solicitors publish reversed art
  // only, so both are inverted; Aekley's is an opaque JPEG with the white
  // keyed out. Pinheiro is the device on its own, because the full lockup
  // pairs it with a white wordmark that cannot be inverted without turning the
  // device's orange to blue.
  'afe-babalola',
  'oake-legal',
  'law-crest',
  'matrix-solicitors',
  'pinheiro',
  'enr-advisory',
  'mj-numa',
  'aekley',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Leading',
    email: 'recruit@acas-law.com',
    website: 'https://acas-law.com',
    /* Three offices, not one. The Abuja address was supplied by hand: the firm's
       own office-details page returns 403 to every automated request, and Legal
       500's contact listing shows only Lagos and Port Harcourt, so neither
       source could confirm it. Port Harcourt is from that Legal 500 listing. */
    offices: [
      { city: 'Lagos', address: '9th Floor, St. Nicholas House, Catholic Mission Street, Lagos Island, Lagos' },
      { city: 'Abuja', address: '2nd Floor, Abia House, Michika Street, Central Business District, Abuja' },
      { city: 'Port Harcourt', address: '10 Igboukwu Street, D-Line, Port Harcourt' },
    ],
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
    tier: 'Leading',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Leading',
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
    tier: 'Leading',
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
    tier: 'Established',
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
    tier: 'Established',
    email: 'nysc@detailsolicitors.com',
    website: 'https://detailsolicitors.com',
    offices: [{ city: 'Lagos', address: 'DCS Place, 8 DCS Street, Off Remi Olowude Way, Lekki Phase 1, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Intellectual Property', 'Tax', 'Banking & Finance'],
    description: 'A specialist commercial firm with a formidable reputation in intellectual property, corporate advisory, and tax matters.',
    openRoles: 2,
  },
  {
    /* THE SLUG STAYS 'famsville-solicitors'. The firm relaunched as Moroom
       Africa on 2 October 2025, but the slug is the live URL and the sitemap
       entry, and the old name is also what anyone who knew this firm will
       search for. Same reasoning as the Udo Udoma slug above: fix it with a
       redirect or not at all. `formerName` is what carries the old name into
       the search index and onto the page. */
    slug: 'famsville-solicitors',
    /* The Moroom mark, pulled from the firm's own site on 2026-08-10 and
       uploaded to the bucket. Their site also carries a full lockup, but its
       wordmark is set in white for a dark header and vanished on our cream
       card; this is the symbol alone on transparency, which is what the square
       logo frame wants anyway. Famsville.jpg is left in the bucket rather than
       deleted, since nothing else costs anything and a rebrand occasionally
       gets reversed. */
    logoFile: 'moroom-africa.png',
    name: 'Moroom Africa',
    shortName: 'Moroom',
    formerName: 'Famsville Solicitors',
    tier: 'Boutique',
    email: 'info@moroomafrica.com',
    website: 'https://moroomafrica.com',
    /* From the firm's own site on 2026-08-10. Note this is a different building
       from the Association Way address Famsville used. The firm now describes
       itself as distributed and says it does not rely on physical offices, so
       treat this as the registered address rather than as somewhere to turn up
       unannounced. */
    offices: [{ city: 'Lagos', address: '214B Eti Osa Way, Dolphin Estate, Ikoyi, Lagos' }],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Employment', 'Intellectual Property', 'Tax'],
    description: 'A pan-African commercial firm, relaunched from Famsville Solicitors in October 2025 as a digital-first practice built on its own cloud platform rather than on a network of offices. Corporate, employment, IP and dispute resolution across African jurisdictions.',
    foundedYear: 2012,
    openRoles: 0,
  },
  {
    slug: 'g-elias',
    logoFile: 'Elias.jpeg',
    // No full stop after the G. The firm's own wordmark and site title are
    // "G Elias"; "G. Elias" survives only in older press items.
    name: 'G Elias & Co',
    shortName: 'G Elias',
    tier: 'Leading',
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
    /* Read on 2026-08-10 from ISDA's own member showcase, which describes the
       firm in those words. "First" is what ISDA says and is therefore what is
       recorded; the firm is widely believed to be the only Nigerian law firm
       member, but ISDA publishes no Nigeria-filtered member list that could
       confirm a negative, so that claim is not made here. If another Nigerian
       firm is later confirmed as a member, add it — an absent entry on any
       other firm means unchecked, exactly as it does in the ranking table. */
    memberships: [
      {
        body: 'ISDA',
        full: 'International Swaps and Derivatives Association',
        note: 'First Nigerian law firm member',
      },
    ],
  },
  {
    slug: 'george-etomi',
    logoFile: 'george-etomi.jpg',
    name: 'George Etomi & Partners',
    shortName: 'George Etomi',
    tier: 'Established',
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
    tier: 'Leading',
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
    tier: 'Established',
    email: 'careers@kennapartners.com',
    website: 'https://kennapartners.com',
    offices: [
      { city: 'Lagos', address: '8 Ogunyemi Road, Palace Way, Oniru, Lagos' },
      { city: 'Abuja', address: 'C3 Bensima House, 3rd Floor, Plot 2942, Cadastral Zone A6, Aguiyi Ironsi Street, Maitama, Abuja' },
      { city: 'Enugu', address: '23 Umuawulu Street, Independence Layout, Enugu' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Tax', 'Banking & Finance', 'Real Estate', 'Employment'],
    description: 'A full-service commercial law firm with deep expertise in corporate transactions, tax advisory, and real estate.',
    openRoles: 1,
    /* The firm carries no Chambers department ranking; the founder does. Recorded
       from the same 2026-08-08 reading of Chambers Global 2026 as the ranking
       table, and see the FIRM IS NOT THE LAWYER note beside FIRM_RANKINGS. */
    rankedIndividuals: [
      { name: 'Fabian Ajogwu SAN', source: 'chambers', band: 'Band 3', year: 2026, area: 'Dispute Resolution' },
    ],
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
    tier: 'Established',
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
    tier: 'Leading',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
    email: 'hr@spaajibade.com',
    website: 'https://spaajibade.com',
    offices: [
      { city: 'Lagos', address: 'Suite 201, SPAACO House, 27A Macarthy Street, Onikan, Lagos' },
      /* Gudu, not Garki Mall. Reported first hand by someone who externed in
         this office, which outranks the directory listing that gave us the old
         Garki II address: a firm that has moved keeps appearing at the previous
         address in aggregators for years, and this is a page a student may walk
         to. */
      { city: 'Abuja', address: '2nd Floor, Left Wing, Commercial Plaza, Plot 1075 Joseph Gomwalk Street, Gudu, Abuja' },
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Leading',
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
    /* The slug keeps the double L. It is wrong the same way the name was, but
       it is the live URL and the sitemap entry, so correcting it would 404 every
       link anyone has already shared. Fix it with a redirect or not at all. */
    slug: 'udo-udoma-bello-osagie',
    logoFile: 'udo-udoma.webp',
    // "Belo-Osagie", one L. ISDA, IFLR1000 and the firm's own site all spell it
    // that way; this record had "Bello-Osagie".
    name: 'Udo Udoma & Belo-Osagie',
    shortName: 'UUBO',
    tier: 'Leading',
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
    /* Read on 2026-08-10 from ISDA's member showcase, which lists the firm under
       Documentation, Legal Services, and Regulation and Compliance. The same
       page credits the firm with the netting provisions in CAMA 2020. The
       "first Nigerian law firm member" line belongs to G Elias, not here. */
    memberships: [
      {
        body: 'ISDA',
        full: 'International Swaps and Derivatives Association',
        note: 'Member: documentation, legal services, regulation and compliance',
      },
    ],
  },
  {
    slug: 'wole-olanipekun',
    logoFile: 'wole olanipekun.jpg',
    name: 'Wole Olanipekun & Co',
    shortName: 'Wole Olanipekun',
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
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
    tier: 'Established',
    email: 'info@paulusoro.com',
    website: 'https://paulusoro.com',
    offices: [
      { city: 'Lagos', address: '7th Floor, 999c Danmole Street, Victoria Island, Lagos' },
    ],
    practiceAreas: ['Telecommunications & ICT', 'Dispute Resolution', 'Corporate & Commercial', 'Banking & Finance', 'Public Law & Regulatory'],
    description: 'A full service firm long identified with telecommunications and regulatory litigation, founded by Paul Usoro SAN, a past President of the Nigerian Bar Association. Established in Kaduna and headquartered in Lagos since 1992.',
    foundedYear: 1985,
    openRoles: 0,
    /* Same shape as Kenna: Chambers ranks the founder, not the firm. NO BAND
       HERE ON PURPOSE — the 2026-08-08 reading recorded that Paul Usoro SAN is
       ranked as an individual without noting which band, and a band nobody read
       off the table would be an invention. Add it when someone checks. */
    rankedIndividuals: [
      { name: 'Paul Usoro SAN', source: 'chambers', year: 2026 },
    ],
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
    tier: 'Established',
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
    tier: 'Established',
    email: 'tnp@tnp.com.ng',
    website: 'https://tnp.com.ng',
    offices: [
      { city: 'Lagos', address: '50 Raymond Njoku Street, Ikoyi, Lagos' },
    ],
    practiceAreas: ['Technology & Fintech', 'Corporate & Commercial', 'Private Equity & Venture Capital', 'Banking & Finance', 'Intellectual Property'],
    description: 'An IFLR1000 ranked corporate practice known for technology, venture financing and cross border transaction work for founders and investors.',
    openRoles: 0,
  },

  /* ———————————————————————————————————————————————————————————————————————
   * Batch added 8 August 2026. Provenance for every address below.
   *
   * The rule this file runs on is that an address is a public claim about a
   * real firm, so each one here was read off a page that firm controls, or off
   * a directory that publishes the firm's own contact record. Where a source
   * disagreed with an earlier note, the disagreement is recorded rather than
   * quietly resolved, because the next person to audit a line deserves to know
   * it was contested.
   *
   * `foundedYear` is omitted where the firm states only a duration ("over 25
   * years") rather than a year. Subtracting a vague duration from the current
   * year produces a number that looks sourced and is not.
   * ——————————————————————————————————————————————————————————————————————— */

  {
    slug: 'babalakin',
    logoFile: null,
    name: 'Babalakin & Co',
    shortName: 'Babalakin',
    tier: 'Established',
    email: 'info@babalakinandco.com',
    website: 'https://www.babalakinandco.com',
    /* All three read from babalakinandco.com on 2026-08-08. */
    offices: [
      { city: 'Lagos', address: '1261A Adeola Hopewell Street, 3rd to 6th Floors, Victoria Island, Lagos' },
      { city: 'Abuja', address: '4 River Benue Street, Off IBB Boulevard, Maitama, Abuja' },
      { city: 'Port Harcourt', address: '3 Williams Jumbo Street, Old GRA, Port Harcourt' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Dispute Resolution', 'Tax', 'Banking & Finance', 'Public Law & Regulatory'],
    description: 'One of the larger commercial practices in the country, with more than seventy lawyers across three offices and three Senior Advocates among them. Strongest in energy, tax and infrastructure, and it runs a separate company secretarial arm for regulatory and compliance work.',
    /* The site says "38 Years of Excellence" and ICLG dates the firm to July
       1988. Both point at the same year from 2026, which is why it is here as a
       number rather than as a duration. */
    foundedYear: 1988,
    openRoles: 0,
  },
  {
    slug: 'solola-akpana',
    logoFile: null,
    name: 'Solola & Akpana',
    shortName: 'Solola & Akpana',
    tier: 'Established',
    email: 'info@sololaakpana.com',
    /* The .ng, not the .com. sololaakpana.com is a stub whose entire body is a
       script that sends the browser to sololaakpana.ng, so it works for a human
       and looks like a dead end to anything that does not run JavaScript. The
       mail stays on the .com because that is the address they publish. */
    website: 'https://sololaakpana.ng',
    /* Read from the firm's contact record on Chambers Global 2026. Its own site
       renders its contact details in a way that could not be read.

       NOTE A CONFLICT ON LAGOS. An earlier pass recorded NIM House, 22 Idowu
       Taylor Street, Victoria Island. Chambers 2026 gives Plot 239 Kofo Abayomi
       Street, also Victoria Island. The Chambers record is the current and
       citable one so it is what is published here, but if someone writes to
       this address and it bounces, the Idowu Taylor address is the other
       candidate and not a typo. */
    offices: [
      { city: 'Lagos', address: 'Plot 239 Kofo Abayomi Street, Victoria Island, Lagos' },
      { city: 'Abuja', address: 'No. 1 Block 2, River Patoka Close, Off Nile Street, Maitama, Abuja' },
      { city: 'Port Harcourt', address: '12 Igbodo Street, Old GRA, Port Harcourt' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Corporate & Commercial', 'Dispute Resolution', 'Capital Markets', 'Arbitration', 'Banking & Finance'],
    description: 'An oil and gas practice first, built around upstream and downstream work in the Niger Delta, with a litigation and arbitration team that defends the same clients when the deals go wrong. Offices in all three of the cities where that work happens.',
    /* No foundedYear. The firm advertises "over 25 years" without dating the
       statement, and a year derived from that would be a guess wearing a
       source's clothes. */
    openRoles: 0,
  },
  {
    slug: 'abdulai-taiwo',
    logoFile: null,
    name: 'Abdulai, Taiwo & Co',
    shortName: 'Abdulai Taiwo',
    tier: 'Established',
    email: 'law@abdulaitaiwo.com',
    website: 'https://www.abdulaitaiwo.com',
    /* Both read from abdulaitaiwo.com/contact.html on 2026-08-08. The postal
       boxes the page also lists are dropped: a P.O. box is not somewhere a
       student can walk into, and this field is the address to write to. */
    offices: [
      { city: 'Lagos', address: 'Goodwill House, 278 Ikorodu Road, Anthony, Lagos' },
      { city: 'Abuja', address: 'Ndamella House, Suite A-11, Plot 500 Tafawa Balewa Way, Area 3, Garki, Abuja' },
    ],
    practiceAreas: ['Capital Markets', 'Banking & Finance', 'Corporate & Commercial', 'Energy & Natural Resources'],
    description: 'One of the oldest commercial firms still practising under its founding name, and known chiefly for capital markets. IFLR1000 puts its strength in debt and equity issues and project finance, and it has acted for the Debt Management Office and the Federal Government.',
    foundedYear: 1976,
    openRoles: 0,
  },
  {
    slug: 'advocaat',
    logoFile: null,
    name: 'Advocaat Law Practice',
    shortName: 'Advocaat',
    tier: 'Established',
    /* The firm publishes info@ on its contact page. careers@ came from the
       Esquirely team's own careers list, which is why it is the one printed
       here: this field exists to be written to by a student. */
    email: 'careers@advocaat-law.com',
    website: 'https://www.advocaat-law.com',
    /* Read from advocaat-law.com/contact on 2026-08-08. Calabar is the reason
       to re-read a contact page rather than trust an earlier note: an earlier
       pass had this firm at two offices, and the third is the only entry in
       this directory outside Lagos, Abuja and Port Harcourt. */
    offices: [
      { city: 'Lagos', address: '13 Norman Williams Street, Off Ribadu Road, South West Ikoyi, Lagos' },
      { city: 'Abuja', address: 'Nigerian National Merit House, 1st Floor, Plot 22 Aguiyi Ironsi Way, Maitama, Abuja' },
      { city: 'Calabar', address: 'Akom Building, 15 Murtala Muhammed Highway, Calabar, Cross River' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Energy & Natural Resources', 'Dispute Resolution', 'Capital Markets', 'Shipping & Maritime', 'Public Law & Regulatory'],
    description: 'Seven practice groups across corporate, energy, financing and regulatory work, with a shipping, aviation and trade group that few firms this size keep. The Calabar office is unusual and worth knowing about if you are in Cross River and assumed the work was all in Lagos.',
    openRoles: 0,
  },

  /* ———————————————————————————————————————————————————————————————————————
   * Second batch, 8 August 2026. Same rule: read off the firm's own contact
   * page, and where a third-party directory disagrees with it, the firm wins.
   *
   * That rule earned its keep on Kola Awodein. Search results and several legal
   * directories put its Lagos office at UBA House, 57 Marina. Its own offices
   * page says 83 Awolowo Road, Ikoyi. A stale Marina address is exactly the
   * kind of thing that gets copied between directories for years, and a student
   * posting a letter to it loses a fortnight finding out.
   * ——————————————————————————————————————————————————————————————————————— */

  {
    slug: 'kola-awodein',
    logoFile: null,
    name: 'Kola Awodein & Co',
    shortName: 'Kola Awodein',
    tier: 'Established',
    email: 'ka@kolaawodeinandco.com',
    website: 'https://kolaawodeinandco.com',
    /* All three from kolaawodeinandco.com/offices.php on 2026-08-08. Each
       office publishes its own address, so writing to the Abuja or Port
       Harcourt office directly is possible: kaabj@ and kaph@ respectively. */
    offices: [
      { city: 'Lagos', address: '2nd Floor, 83 Awolowo Road, Ikoyi, Lagos' },
      { city: 'Abuja', address: 'Plot 3671, Zone E27, Opposite FCT High Court, Apo Resettlement, Abuja' },
      { city: 'Port Harcourt', address: '93 Tombia Extension, GRA Phase II, Port Harcourt' },
    ],
    practiceAreas: ['Dispute Resolution', 'Banking & Finance', 'Capital Markets', 'Energy & Natural Resources', 'Tax', 'Public Law & Regulatory'],
    description: 'A dispute resolution practice at heart, built around Kola Awodein SAN, that also runs full commercial and infrastructure work including public private partnerships. Three offices, each with its own contact address.',
    foundedYear: 1984,
    openRoles: 0,
  },
  {
    slug: 'fra-law',
    logoFile: null,
    name: 'F. R. A. Williams & Co',
    shortName: 'FRA Law',
    tier: 'Established',
    /* The firm publishes a dedicated recruitment address, which is better than
       the general one for a field whose entire purpose is to be written to. */
    email: 'hr@frawilliams.com',
    website: 'https://frawilliams.com',
    /* Both from frawilliams.com/contact on 2026-08-08. The P.O. box the page
       also lists is dropped, as everywhere else in this file. */
    offices: [
      { city: 'Lagos', address: '3 Shagamu Avenue, Ilupeju, Lagos' },
      { city: 'Abuja', address: '17 Benghazi Street, Wuse Zone 4, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution', 'Energy & Natural Resources', 'Tax'],
    description: 'The chambers founded by Chief F. R. A. Williams SAN, the first Senior Advocate of Nigeria, still practising under his name. Litigation and corporate advisory across power, oil and gas, mining and real estate, from Lagos and Abuja.',
    /* No foundedYear. The firm is plainly old and its history is well known,
       but the contact page gives no year and a date inferred from a founder's
       career is not a source. */
    openRoles: 0,
  },
  {
    slug: 'chris-ogunbanjo',
    logoFile: null,
    name: 'Chris Ogunbanjo LP',
    shortName: 'Chris Ogunbanjo',
    tier: 'Established',
    email: 'info@chrisogunbanjo.com',
    website: 'https://chrisogunbanjo.com',
    offices: [
      { city: 'Lagos', address: '3 Hospital Road, Lagos Island, Lagos' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Banking & Finance', 'Capital Markets', 'Intellectual Property', 'Dispute Resolution', 'Tax'],
    description: 'The first indigenous commercial law firm in Nigeria, founded by Chief Chris Ogunbanjo, who is widely credited with establishing corporate practice here as a discipline. Seventeen practice areas out of one Lagos Island office.',
    /* 1960, from the firm's own history page and consistent across the
       obituaries published when the founder died in 2024. Worth noting that a
       common secondary claim of 1961 is wrong. */
    foundedYear: 1960,
    openRoles: 0,
  },
  {
    slug: 'femi-atoyebi',
    logoFile: null,
    name: 'Femi Atoyebi & Co',
    shortName: 'Femi Atoyebi',
    tier: 'Boutique',
    email: 'careers@femiatoyebi.com.ng',
    /* Was faandco.click, on the note that the .click site and the .com.ng email
       were an odd pair but both live. Rechecked later the same day and the
       .click domain no longer resolves at all: NXDOMAIN on a public resolver,
       not a timeout. The firm's site is on femiatoyebi.com.ng, which is also
       where their mail is, so the odd pair resolved itself. */
    website: 'https://femiatoyebi.com.ng',
    offices: [
      { city: 'Lagos', address: 'Sea Voyager House, 29 Norman Williams Street, Off Awolowo Road, South West Ikoyi, Lagos' },
    ],
    practiceAreas: ['Shipping & Maritime', 'Energy & Natural Resources', 'Dispute Resolution', 'Tax', 'Banking & Finance'],
    description: 'One of the few Nigerian firms where maritime and international trade is the main practice rather than a sideline, which makes it worth a letter if shipping is what you actually want to do. Finance, oil and gas and labour disputes alongside it.',
    openRoles: 0,
  },
  {
    slug: 'idowu-sofola',
    logoFile: null,
    name: 'Idowu Sofola & Co',
    shortName: 'Idowu Sofola',
    tier: 'Established',
    email: 'contact@idowusofola.com',
    /* ⚠ Serving an EXPIRED TLS certificate as of 2026-08-08. Every browser puts
       a full-page "your connection is not private" interstitial in front of it,
       so the Visit website link on this firm's profile lands a student on a
       security warning. The site itself is fine behind it and the firm is
       plainly still practising, so the link stays rather than being removed;
       the fix belongs to them, not to us. Recheck before assuming it is still
       true, since a renewal clears it in an afternoon. */
    website: 'https://idowusofola.com',
    offices: [
      { city: 'Lagos', address: 'Ereke House, 4th and 5th Floors, Plot 15 CIPM Road, Alausa, Ikeja, Lagos' },
      { city: 'Abuja', address: 'F3 ABM Plaza, Plot 23 Ekukinam Street, Utako District, Abuja' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Dispute Resolution'],
    description: 'A full service practice founded by Chief Idowu Sofola SAN, with offices in Lagos and Abuja. The Lagos office is in Alausa rather than on the island, which puts it next to the Lagos State secretariat and the courts there.',
    openRoles: 0,
  },

  /* ———————————————————————————————————————————————————————————————————————
   * Third batch, 8 August 2026. Same rule as the two above: the firm's own
   * page wins over any directory that disagrees with it.
   *
   * Two of these three widen the map. Yusuf Ali & Co is the first Ilorin entry
   * in the directory and AO2 brings Awka and Akure, so a student in Kwara,
   * Anambra or Ondo can now find a firm in their own city rather than reading
   * about Lagos. Worth keeping in mind when the next firm is added: this
   * directory has been drifting towards a list of Lagos island addresses, and
   * that is a bias in what students think their options are, not just a gap.
   * ——————————————————————————————————————————————————————————————————————— */

  {
    slug: 'olisa-agbakoba',
    logoFile: null,
    name: 'Olisa Agbakoba Legal',
    shortName: 'OAL',
    tier: 'Established',
    /* The address their live contact page publishes. It is capitalised
       Clientsupport@ there; written lowercase here because the local part is
       case insensitive in practice and a capitalised mailto looks like a typo
       to the person about to send their CV. */
    email: 'clientsupport@oal.law',
    website: 'https://oal.law',
    /* ⚠ NOT from the live site. oal.law now publishes only city names on its
       contact page: Ikoyi, Apapa, FCT Abuja, Port Harcourt. The street
       addresses below come from the firm's OWN /our-offices/ page as archived
       on 5 April 2025, which 404s today. That is a weaker source than a live
       page and it is recorded as such rather than presented as current.
       Recheck when the firm republishes an offices page.

       Their fourth location, Port Harcourt, is listed with no address anywhere,
       so it is not invented here. Three offices are recorded because three are
       sourceable. */
    offices: [
      { city: 'Lagos', address: '10A Ilabere Street, Ikoyi, Lagos' },
      { city: 'Lagos', address: '2nd Floor, Maritime Complex, 34 Creek Road, Apapa, Lagos' },
      { city: 'Abuja', address: 'Purplestone Mall, Plot 1265, Zone E27, Apo Resettlement, Apo, Abuja' },
    ],
    practiceAreas: ['Shipping & Maritime', 'Dispute Resolution', 'Corporate & Commercial', 'Energy & Natural Resources', 'Intellectual Property', 'Tax', 'Public Law & Regulatory'],
    description: 'The firm to write to if maritime is what you actually want to do. Olisa Agbakoba SAN built his name in human rights litigation and the firm still carries that public law streak, but its centre of gravity is shipping and the blue economy, alongside corporate, energy and tax work. The Apapa office sits at the port, which tells you where the maritime practice is run from.',
    /* Their own history page dates the firm to 1951, founded by Justice J. C. U.
       Agbakoba, and records a re-establishment in 1980 by Olisa Agbakoba. The
       earlier year is the one recorded because it is the one the firm claims;
       the 1980 date is the more useful fact about the practice as it exists
       now, which is why it is in this comment rather than lost. */
    foundedYear: 1951,
    openRoles: 0,
  },
  {
    slug: 'yusuf-ali',
    logoFile: null,
    name: 'Yusuf Ali & Co',
    shortName: 'Yusuf Ali',
    tier: 'Established',
    email: 'info@yusufali.net',
    website: 'https://www.yusufali.net',
    /* All three read off yusufali.net/contact on 2026-08-08. The firm practises
       as Ghalib Chambers and both of its owned buildings are called Ghalib
       House, which is not a duplication error: one is in Ilorin and one is in
       Wuse II. */
    offices: [
      { city: 'Ilorin', address: '2nd Floor, Ghalib House, 24 Abdul Wahab Folawiyo Road, Ilorin, Kwara State' },
      { city: 'Abuja', address: 'Ghalib House, 4 Sakono Street, Adjacent AP Plaza, Off Adetokunbo Ademola Crescent, Wuse II, Abuja' },
      { city: 'Lagos', address: '2nd Floor, Suite WW4, Tafawa Balewa Complex, Lagos' },
    ],
    /* The first five are the practice areas the firm itself lists. Dispute
       resolution is the sixth and is not on that list, which would make the
       record read as though this chambers does not go to court. It publishes a
       library of its own reported cases, which is a firmer source for a
       litigation practice than a practice-areas menu is. */
    practiceAreas: ['Aviation', 'Banking & Finance', 'Real Estate', 'Intellectual Property', 'Telecommunications', 'Dispute Resolution'],
    description: 'The best known chambers outside Lagos and Abuja, and the reason this directory has an Ilorin entry at all. Around seventy five lawyers under Chief Yusuf Ali SAN, with a reported case library the firm publishes itself and an aviation practice that is unusual for a firm of this size. A serious option if you are in Kwara and had assumed the work was all on the island.',
    openRoles: 0,
  },
  {
    slug: 'ao2-law',
    logoFile: null,
    name: 'AO2 Law',
    shortName: 'AO2 Law',
    tier: 'Established',
    /* They publish info@ and contact@ side by side, plus awka@ for that office
       alone. info@ is the one printed here; a student writing to the Awka
       office directly has the third address on the firm's contact page. */
    email: 'info@ao2law.com',
    website: 'https://ao2law.com',
    /* All four read off ao2law.com/contact on 2026-08-08. Lagos is the address
       the page gives under "Physical Address"; the other three sit under
       "Other Offices". */
    offices: [
      { city: 'Lagos', address: '3A Kayode Otitoju Street, Off Admiralty Road, Lekki Phase I, Lagos' },
      { city: 'Abuja', address: '47B Kumasi Crescent, Opposite SunTrust Bank, Wuse 2, Abuja' },
      { city: 'Awka', address: '207 Ziks Avenue, Awka, Anambra State' },
      { city: 'Akure', address: '1st Floor, Benin-Owena River Basin, Opposite Providus Bank, Alagbaka, Akure, Ondo State' },
    ],
    practiceAreas: ['Dispute Resolution', 'Energy & Natural Resources', 'Corporate & Commercial', 'Real Estate', 'Banking & Finance'],
    description: 'AO2 is Anaje Olumide Oke Akinkugbe, and the four offices are the point: Lagos and Abuja as you would expect, then Awka and Akure, which almost no commercial firm of this size bothers with. Dispute resolution and energy lead the practice, with real estate, corporate finance and project development beside them.',
    openRoles: 0,
  },

  /* ———————————————————————————————————————————————————————————————————————
   * Fourth batch, 8 August 2026. Eight of a list of sixteen.
   *
   * The other eight are NOT here, and that is a decision rather than an
   * unfinished job. A record in this file is a set of factual claims about a
   * real firm that a student will act on by posting a letter, so a firm nobody
   * can source an address and an address to write to for does not get a
   * plausible-looking entry. What was checked, and what stopped each one:
   *
   *   Tokunbo Orimobi      no website found on any obvious domain
   *   The Metropolitan     no website found
   *   Acuity Partners      no website found
   *   Babajide Koku        no website found
   *   Cardinal Counsel     no website found
   *   Grey Chapel          greychapellegal.com answers 403 to every automated
   *                        request, so nothing can be read off it
   *   Tsedaqah             tsedaqah.com is not the firm. It resolves to an
   *                        unrelated brand whose own title is "Faith Infused In
   *                        Elegance", which is the kind of thing that gets
   *                        copied into a directory as a firm's website and then
   *                        sits there for years
   *   Duke & Bob-Manuel    dukeandbobmanuel.com is real and current, but
   *                        publishes no address and no email anywhere. Every
   *                        route to them is a contact form, and this directory's
   *                        whole promise is an address you can write to
   *
   * Any of the eight becomes addable the moment someone finds a page that
   * publishes an address. None of them should be added from a third-party
   * aggregator.
   * ——————————————————————————————————————————————————————————————————————— */

  {
    slug: 'afe-babalola',
    logoFile: null,
    name: 'Afe Babalola & Co',
    shortName: 'Afe Babalola',
    tier: 'Established',
    email: 'info@afebabalola.com',
    website: 'https://afebabalola.com',
    /* All five read off afebabalola.com/contact on 2026-08-08. Each office
       publishes its own address, so writing to a branch directly works:
       afelagos@, afeabuja@ and afeph@ respectively.

       Ibadan is first because it is the head office, which is unusual enough to
       be worth preserving in the ordering: almost every other firm in this file
       leads with Lagos. The Ado-Ekiti entry gives a building name and a P.O.
       box and no street, and the box is dropped as everywhere else here. */
    offices: [
      { city: 'Ibadan', address: '80 Fajuyi Road, Adamasimgba, Ekotedo, Ibadan, Oyo State' },
      { city: 'Lagos', address: '85 Awolowo Road, Ikoyi, Lagos' },
      { city: 'Abuja', address: 'Emmanuel House, 24 Madeira Street, Imani Estate, Maitama, Abuja' },
      { city: 'Port Harcourt', address: '7 Aba Road, Port Harcourt' },
      { city: 'Ado-Ekiti', address: 'Salt Valley House, Ado-Ekiti, Ekiti State' },
    ],
    practiceAreas: ['Dispute Resolution', 'Constitutional & Electoral Law', 'Arbitration', 'Energy & Natural Resources', 'Labour & Employment', 'Intellectual Property', 'Asset Recovery'],
    description: 'Emmanuel Chambers, the practice of Aare Afe Babalola SAN, and one of the few firms in the country whose head office is not in Lagos or Abuja. Litigation is the whole centre of gravity here: election petitions, constitutional cases, chieftaincy matters and criminal work alongside the commercial practice. Five offices, and the Ado-Ekiti one is a rarity worth knowing about if you are in Ekiti.',
    openRoles: 0,
  },
  {
    slug: 'oake-legal',
    logoFile: null,
    name: 'OAKE Legal',
    shortName: 'OAKE Legal',
    tier: 'Established',
    email: 'info@oakelegal.com',
    website: 'https://oakelegal.com',
    /* Both from oakelegal.com/contact-us on 2026-08-08. */
    offices: [
      { city: 'Lagos', address: '5th Floor, AIICO Plaza, Plot PC 12, Churchgate Street, Victoria Island, Lagos' },
      { city: 'Abuja', address: '4th Floor, Murjanatu House, 1 Zambezi Crescent, Maitama, Abuja' },
    ],
    practiceAreas: ['Capital Markets', 'Corporate & Commercial', 'Dispute Resolution', 'Mergers & Acquisitions', 'Banking & Finance', 'Corporate Compliance'],
    description: 'A capital markets practice first: listings, secondary issues, reorganisations and delistings, with the corporate and project finance work that sits around them. Worth a letter if the transactional side is what interests you and you would rather learn it somewhere you are not one of eighty trainees.',
    openRoles: 0,
  },
  {
    slug: 'law-crest',
    logoFile: null,
    name: 'The Law Crest LLP',
    shortName: 'The Law Crest',
    tier: 'Established',
    email: 'info@thelawcrest.com',
    website: 'https://thelawcrest.com',
    /* Both from thelawcrest.com on 2026-08-08. The Lagos address is in the
       footer of every page; Abuja is on the contact page only. */
    offices: [
      { city: 'Lagos', address: 'Continental Re Centre, First Floor, 17 Olosa Street, Victoria Island, Lagos' },
      { city: 'Abuja', address: 'Suite 16 Extension, Jinifa Plaza, Central Business District, Abuja' },
    ],
    practiceAreas: ['Dispute Resolution', 'Labour & Employment', 'Corporate & Commercial', 'Tax', 'Banking & Finance', 'Insolvency'],
    description: 'Fourteen practice groups run out of two offices, which tells you it is a generalist commercial practice rather than a specialist one. Employment and industrial relations is a real strength and is a quieter route into a firm than the corporate desk everyone applies to. Debt recovery and white collar investigations sit alongside it.',
    /* "commenced business in January 2000", from the firm's own services page.
       The month is theirs; only the year is recorded, as everywhere here. */
    foundedYear: 2000,
    openRoles: 0,
  },
  {
    slug: 'matrix-solicitors',
    logoFile: null,
    name: 'Matrix Solicitors',
    shortName: 'Matrix',
    tier: 'Established',
    email: 'info@matrixsolicitors.com',
    website: 'https://matrixsolicitors.com',
    /* Both from matrixsolicitors.com/contact on 2026-08-08. The page gives the
       Abuja address twice with and without "Garki"; the fuller one is used. */
    offices: [
      { city: 'Lagos', address: '9A Kwara Street, Osborne Foreshore Estate, Ikoyi, Lagos' },
      { city: 'Abuja', address: '3rd Floor, Grand Square, Plot 270, Muhammadu Buhari Way, Central Business District, Garki, Abuja' },
    ],
    practiceAreas: ['Aviation', 'Shipping & Maritime', 'Energy & Natural Resources', 'Dispute Resolution', 'Corporate & Commercial', 'Telecommunications & ICT', 'Insolvency'],
    description: 'Aviation and maritime lead here, which is a narrow pair of specialisms for a firm this size and the reason to look at it. Capital projects and infrastructure sit beside them, along with a government relations and policy advisory group that most commercial firms do not keep as a named practice.',
    openRoles: 0,
  },
  {
    slug: 'pinheiro',
    logoFile: null,
    name: 'Pinheiro LP',
    shortName: 'Pinheiro',
    tier: 'Established',
    email: 'admin@pinheirolp.com',
    website: 'https://pinheirolp.com',
    /* All three from the footer of pinheirolp.com on 2026-08-08. */
    offices: [
      { city: 'Lagos', address: '5/7 Folayemi Street, Off Coker Road, Ilupeju, Lagos' },
      { city: 'Abuja', address: 'D5008, Brains & Hammers Estate, 5th Avenue, Gwarimpa, Abuja' },
      { city: 'Port Harcourt', address: 'Suite 201, Fleet House, Olu Obasanjo Road, Port Harcourt, Rivers State' },
    ],
    practiceAreas: ['Dispute Resolution', 'Arbitration', 'Shipping & Maritime', 'Corporate & Commercial', 'Energy & Natural Resources', 'Real Estate', 'Constitutional & Electoral Law'],
    description: 'Nine practice teams, each led by a partner, across a general practice that runs from admiralty and arbitration to family and probate. A firm that keeps criminal law and constitutional law on the same list as banking is telling you something useful about the range of work a junior would see.',
    /* No foundedYear. The footer reads "Copyright 1996-2023", which is very
       probably the founding year and is still a copyright range rather than a
       claim about when the firm started. */
    openRoles: 0,
  },
  {
    slug: 'enr-advisory',
    logoFile: null,
    name: 'ENR Advisory',
    shortName: 'ENR Advisory',
    tier: 'Boutique',
    email: 'enr@enradvisory.com',
    website: 'https://enradvisory.com',
    /* From enradvisory.com/contact-us on 2026-08-08. South Atlantic Petroleum
       Towers is the SAPETRO building, which is also where Giwa-Osagie sit, so
       the two Adeola Odeku entries in this file are the same address and not a
       duplication error. */
    offices: [
      { city: 'Lagos', address: '3rd Floor, South Atlantic Petroleum Towers, 1 Adeola Odeku Street, Victoria Island, Lagos' },
    ],
    practiceAreas: ['Energy & Natural Resources', 'Banking & Finance', 'Mergers & Acquisitions', 'Dispute Resolution', 'Public Law & Regulatory'],
    description: 'Energy and nothing else, which is the entire proposition. Petroleum operations, gas supply and processing, electricity and renewables, energy finance, energy disputes and mining. A team built out of senior in-house counsel from oil and gas companies rather than out of a general practice, so the work is closer to what a client actually does.',
    openRoles: 0,
  },
  {
    slug: 'mj-numa',
    logoFile: null,
    name: 'MJ Numa & Partners LLP',
    shortName: 'MJ Numa',
    tier: 'Boutique',
    /* The firm publishes a dedicated address for CVs and asks for them
       explicitly, including for internships. That is a better field value than
       the general info@ for a directory whose purpose is to be written to. */
    email: 'career@mjnuma.com',
    website: 'https://www.mjnuma.com',
    /* From mjnuma.com/contact on 2026-08-08. */
    offices: [
      { city: 'Abuja', address: 'Flat 1, Tripple A Villas, 495 Adegboyega Atanda Street, Mabushi, Abuja' },
    ],
    practiceAreas: ['Dispute Resolution', 'Arbitration', 'Constitutional & Electoral Law', 'Corporate & Commercial'],
    description: 'A disputes practice in Abuja that says out loud what most firms leave you to guess: send a CV to the careers address, internships included. Election petitions, public interest litigation and white collar work, plus the government and community liaison practice that comes with being based in the capital.',
    openRoles: 0,
  },
  {
    slug: 'aekley',
    logoFile: null,
    name: 'Aekley Solicitors',
    shortName: 'Aekley',
    tier: 'Boutique',
    email: 'info@aekleysolicitors.com',
    website: 'https://aekleysolicitors.com',
    /* Both from the footer of every page on aekleysolicitors.com, read
       2026-08-08. No Lagos office, which is worth noticing rather than
       assuming an omission. */
    offices: [
      { city: 'Abuja', address: 'Suite C7-C10, Second Floor, Innovation Plaza, Plot 770, Wuse, Abuja' },
      { city: 'Ibadan', address: 'First Floor, 78/80 Oyo Road, Opposite University of Ibadan Second Gate, Ibadan, Oyo State' },
    ],
    practiceAreas: ['Corporate & Commercial', 'Real Estate', 'Intellectual Property', 'Public Law & Regulatory', 'Start-up Advisory'],
    description: 'A small practice built around SMEs and the paperwork of actually starting something: company registration, industrial designs, certificates of occupancy, moneylender and FCCPC licensing. The Ibadan office is opposite the University of Ibadan second gate, which makes it one of the few firms in this directory a law student could walk to.',
    openRoles: 0,
  },
]

/**
 * Whether a signed-out reader sees the whole firm record.
 *
 * ⚠ THIS DELIBERATELY NO LONGER READS `tier`, AND MUST NOT GO BACK TO IT.
 *
 * It used to be `tier === 'Tier 1'`, back when tier was a rough SIZE band. The
 * question this gate asks is which firms a stranger is most likely to search
 * for by name — that is a question about search demand, which tracks size and
 * fame, and the old comment here said so explicitly: "not which firms are
 * best".
 *
 * `tier` now answers a different question. It means directory standing, and
 * only nine firms hold it. Leaving this pointing at the band would have taken
 * the gate from twenty two firms to nine as a silent side effect of a labelling
 * change, hiding the contact details of thirteen large, heavily searched firms
 * — Afe Babalola, Wole Olanipekun, Paul Usoro and Kenna among them — because a
 * commercial directory does not band them. That is the opposite of what the
 * gate is for.
 *
 * So the list is explicit. It is the same twenty two firms that were open
 * before the re-banding, frozen deliberately rather than derived, because the
 * next person to change how firms are banded should have to think about this
 * separately instead of moving it by accident.
 *
 * Everything the gate withholds is contact detail: street addresses and the
 * application address. What stays visible is the firm's shape, because a page
 * that shows nothing is not a preview, it is a wall with a headline on it.
 *
 * ⚠ THIS IS NOT THE INDEXING TEST EITHER. See isIndexable below.
 */
const OPEN_PROFILES = new Set([
  'acas-law', 'aelex', 'afe-babalola', 'aluko-oyebode', 'babalakin',
  'banwo-ighodalo', 'detail-solicitors', 'doa-law', 'g-elias',
  'jackson-etti-edu', 'kenna-partners', 'olajide-oyewole', 'olaniwun-ajayi',
  'olisa-agbakoba', 'paul-usoro', 'perchstone-graeys', 'sofunde-osakwe',
  'spa-ajibade', 'streamsowers-kohn', 'templars', 'udo-udoma-bello-osagie',
  'wole-olanipekun',
])

export function isPubliclyReadable(firm: Pick<Firm, 'slug'>): boolean {
  return OPEN_PROFILES.has(firm.slug)
}

/**
 * Whether a crawler may index the profile.
 *
 * ONE RULE, ONE PLACE. The profile's robots directive, the sitemap and the
 * directory's ItemList all have to agree. If the sitemap offers a page the page
 * then noindexes, Search Console reports the conflict and Google learns to
 * distrust the host, so the three must never be able to drift apart. They read
 * this function.
 *
 * WHY THIS IS A SEPARATE QUESTION FROM isPubliclyReadable, AND WHY IT IS NOW
 * TRUE FOR EVERY FIRM. Those two were one function, so marking a profile
 * "partial" also marked it noindex, and forty five profiles were withheld from
 * search to protect two fields. That trade never made sense once written down.
 * A gated profile still renders the firm's name, tier, founding year, full
 * description, independent rankings, every practice area and every office city.
 * Only the street address and the application email are held back. A page with
 * that much on it is not a sign-in prompt, and the firm-name searches it would
 * answer are the least contested queries this site has.
 *
 * The rule for a page that IS withheld stays what it was: noindex it, never
 * disallow it, because a crawler that cannot fetch the page never reads the
 * noindex. Nothing here is disallowed in robots.ts, which is what keeps that
 * true.
 *
 * It returns a constant today and is still a function on purpose. It is the one
 * place the decision is written down, it is what the three call sites read, and
 * the next person to withhold a profile has somewhere obvious to say so.
 */
export function isIndexable(_firm: Pick<Firm, 'tier'>): boolean {
  return true
}

export function getMonogram(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 2 && !['and', 'LLP', 'LP', 'Co', 'the'].includes(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}


/** Sort key: ignore a leading initial ('G Elias' -> 'Elias') and a leading
 *  article so the directory and the logo loop read in true alphabetical order.
 *
 *  Both patterns had lost their backslashes: `/^[A-Z].s+/` reads as "a capital,
 *  any character, then one or more literal s", which matches essentially no
 *  firm name, and `/^(The|A)s+/i` matched "As..." rather than "A ". So neither
 *  strip has ever run, and G Elias has been sorting under G. The full stop is
 *  optional in the first pattern because the firm dropped it from its own name. */
function sortKey(name: string): string {
  return name
    .replace(/^[A-Z]\.?\s+/, '')
    .replace(/^(The|A)\s+/i, '')
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
 * `emea` — read on 2026-08-08 from The Legal 500 EMEA 2026, Nigeria, at
 * legal500.com/c/nigeria. Four practice-area tables were read in full:
 * Commercial, corporate and M&A; Banking, finance and capital markets; Dispute
 * resolution; and Energy and natural resources. Same highest-tier rule as
 * Chambers, and the source table is named beside each entry.
 *
 * COVERAGE IS PARTIAL AND THAT IS SAFE. Legal 500 ranks Nigeria in more tables
 * than those four. A firm ranked only in, say, TMT therefore has no entry here
 * and shows no EMEA badge — which reads as "not checked", which is true. The
 * failure mode runs one way: a firm can be under-credited, never over-credited.
 *
 * `iflr` — read on 2026-08-08 from IFLR1000's own firm pages, which now live at
 * iflr.com/iflr1000/firms/<firm>-nigeria and carry a per-practice tier table.
 * Only the firms actually opened are recorded. Several firm pages 404 under
 * every slug tried, so their absence here is a URL that could not be found and
 * NOT evidence they are unranked — the same one-way failure as above.
 *
 * A NOTE ON WHY IFLR IS THINNEST. Its jurisdiction table could not be read at
 * all; the firm pages were the way in, one fetch each. It also bands below the
 * numbered tiers with words like "Notable", which is a real listing but not a
 * tier — those are recorded as 'Ranked', which claims presence and nothing
 * more, exactly as the guidance above says to.
 */
export const FIRM_RANKINGS: Record<string, FirmRankings> = {
  /* Ranked by all three. */
  'templars': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Banking & Finance', 'Corporate/Commercial', 'Dispute Resolution', 'Projects & Energy'] },
    iflr:     { band: 'Tier 1', year: 2026, areas: ['Banking', 'Capital markets: debt', 'Capital markets: equity', 'M&A', 'Projects'] },
    emea:     { band: 'Tier 1', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Dispute resolution', 'Energy and natural resources'] },
  },
  'olaniwun-ajayi': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Banking & Finance', 'Corporate/Commercial', 'Dispute Resolution', 'Projects & Energy', 'Tax'] },
    iflr:     { band: 'Tier 1', year: 2026, areas: ['Banking', 'Capital markets: debt', 'Capital markets: equity', 'M&A', 'Private equity', 'Projects'] },
    emea:     { band: 'Tier 1', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Dispute resolution', 'Energy and natural resources'] },
  },
  'udo-udoma-bello-osagie': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Banking & Finance', 'Capital Markets', 'Corporate/Commercial'] },
    // Projects is Tier 2 and so is not listed beside a Tier 1 band.
    iflr:     { band: 'Tier 1', year: 2026, areas: ['Banking', 'Capital markets: debt', 'Capital markets: equity', 'M&A', 'Private equity'] },
    emea:     { band: 'Tier 1', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Dispute resolution'] },
  },
  'banwo-ighodalo': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Capital Markets', 'Corporate/Commercial', 'Projects & Energy'] },
    iflr:     { band: 'Tier 1', year: 2026, areas: ['Banking', 'Capital markets: debt', 'Capital markets: equity', 'M&A', 'Private equity', 'Projects'] },
    emea:     { band: 'Tier 1', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Energy and natural resources'] },
  },
  'aluko-oyebode': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Banking & Finance', 'Capital Markets', 'Corporate/Commercial', 'Dispute Resolution', 'Intellectual Property & TMT', 'Projects & Energy'] },
    iflr:     { band: 'Tier 1', year: 2026, areas: ['Banking', 'Capital markets: debt', 'Capital markets: equity', 'M&A', 'Private equity', 'Projects'] },
    emea:     { band: 'Tier 1', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Dispute resolution'] },
  },
  'g-elias': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Corporate/Commercial', 'Dispute Resolution', 'Tax'] },
    iflr:     { band: 'Tier 1', year: 2026, areas: ['Banking', 'Capital markets: debt', 'Capital markets: equity', 'M&A', 'Projects'] },
    emea:     { band: 'Tier 1', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Dispute resolution', 'Energy and natural resources'] },
  },
  'aelex': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Tax'] },
    // Capital markets: equity is Tier 3 and so is not listed beside Tier 2.
    iflr:     { band: 'Tier 2', year: 2026, areas: ['Banking', 'Capital markets: debt', 'M&A', 'Projects'] },
    emea:     { band: 'Tier 2', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Dispute resolution', 'Energy and natural resources'] },
  },
  'odujinrin-adefulu': {
    chambers: { band: 'Band 3', year: 2026, areas: ['Banking & Finance'] },
    // T3 private equity, equity capital markets and projects; T4 debt and M&A.
    iflr:     { band: 'Tier 2', year: 2026, areas: ['Banking'] },
    emea:     { band: 'Tier 3', year: 2026, areas: ['Banking, finance and capital markets', 'Dispute resolution', 'Energy and natural resources'] },
  },

  /* Two guides. */
  'jackson-etti-edu': {
    chambers: { band: 'Band 1', year: 2026, areas: ['Intellectual Property & TMT'] },
    emea:     { band: 'Tier 2', year: 2026, areas: ['Banking, finance and capital markets', 'Dispute resolution'] },
  },
  'acas-law': {
    chambers: { band: 'Band 2', year: 2026, areas: ['Projects & Energy'] }, // listed as Dentons ACAS-Law
    emea:     { band: 'Tier 1', year: 2026, areas: ['Energy and natural resources'] },
  },
  'olajide-oyewole': {
    chambers: { band: 'Band 2', year: 2026, areas: ['Intellectual Property & TMT'] }, // listed as Olajide Oyewole LLP
    emea:     { band: 'Tier 2', year: 2026, areas: ['Dispute resolution'] }, // listed as DLA Piper Africa, Nigeria
  },
  'bloomfield-law': {
    chambers: { band: 'Band 3', year: 2026, areas: ['Corporate/Commercial', 'Projects & Energy'] },
    emea:     { band: 'Tier 2', year: 2026, areas: ['Commercial, corporate and M&A', 'Banking, finance and capital markets', 'Energy and natural resources'] },
  },
  'doa-law': {
    chambers: { band: 'Band 4', year: 2026, areas: ['Corporate/Commercial'] }, // listed as Duale, Ovia & Alex-Adedipe
    emea:     { band: 'Tier 2', year: 2026, areas: ['Commercial, corporate and M&A'] },
  },
  'spa-ajibade': {
    chambers: { band: 'Band 3', year: 2026, areas: ['Dispute Resolution'] },
    emea:     { band: 'Tier 3', year: 2026, areas: ['Dispute resolution'] },
  },
  'stren-blan-partners': {
    chambers: { band: 'Band 4', year: 2026, areas: ['Corporate/Commercial', 'Intellectual Property & TMT'] },
    emea:     { band: 'Tier 4', year: 2026, areas: ['Dispute resolution'] }, // listed as Stren and Blan Partners
  },

  /* Chambers only. */
  'detail-solicitors':  { chambers: { band: 'Band 3', year: 2026, areas: ['Banking & Finance'] } },
  'streamsowers-kohn':  { chambers: { band: 'Band 3', year: 2026, areas: ['Projects & Energy'] } },
  'wole-olanipekun':    { chambers: { band: 'Band 3', year: 2026, areas: ['Dispute Resolution'] } },
  'sofunde-osakwe':     { chambers: { band: 'Band 3', year: 2026, areas: ['Dispute Resolution'] } },
  'the-new-practice':   { chambers: { band: 'Band 4', year: 2026, areas: ['Corporate/Commercial'] } }, // listed as TNP, The New Practice
  'perchstone-graeys':  { chambers: { band: 'Band 4', year: 2026, areas: ['Dispute Resolution'] } },
  'tayo-oyetibo':       { chambers: { band: 'Band 4', year: 2026, areas: ['Dispute Resolution'] } }, // listed as Tayo Oyetibo LP
  /* Read 2026-08-08 from the firm's Chambers Global 2026 office record, which
     reports one Nigeria ranking and names the table. The other three firms
     added in the same batch get no entry: Babalakin, Abdulai Taiwo and Advocaat
     all have profile pages in one guide or another, but a profile page is not a
     band, and the one-way failure this table is built around says an absent
     entry means nobody has checked rather than that a firm is unranked. */
  'solola-akpana':      { chambers: { band: 'Band 4', year: 2026, areas: ['Dispute Resolution'] } },

  /* Legal 500 only. No Chambers entry here means Chambers does not rank them in
     the seven Nigeria tables, not that they went unchecked. */
  'alliance-law-firm':  { emea: { band: 'Tier 3', year: 2026, areas: ['Banking, finance and capital markets'] } },
  'dealhq-partners':    { emea: { band: 'Tier 3', year: 2026, areas: ['Commercial, corporate and M&A'] } },
  'tope-adebayo':       { emea: { band: 'Tier 4', year: 2026, areas: ['Dispute resolution'] } }, // listed as Tope Adebayo LP

  'alp-ng': {
    // IFLR lists ALP but bands it below the numbered tiers ("Notable" in
    // Banking), so 'Ranked' claims presence and nothing further. No `areas`:
    // there is no tier for them to belong to.
    iflr: { band: 'Ranked', year: 2026 },
    emea: { band: 'Tier 3', year: 2026, areas: ['Banking, finance and capital markets'] }, // listed as ALP NG & Company
  },

  /* ———————————————————————————————————————————————————————————————————————
   * Read 9 August 2026, off the guides themselves rather than from memory.
   *
   * Sources, so the next person can re-check the same way: the six Legal 500
   * EMEA Nigeria tables at legal500.com/c/nigeria (banking finance and capital
   * markets, commercial corporate and M&A, dispute resolution, energy and
   * natural resources, real estate and construction, shipping and transport),
   * and the Chambers Global 2026 Nigeria tables at chambers.com/legal-rankings.
   *
   * A warning for whoever does this next. Chambers publishes the same content
   * as a Nigeria PDF, and parsing it looked like the fast route to all of it at
   * once. It is not. The PDF is flowing profile prose rather than a table, so
   * band markers do not reliably attach to the firm beside them: a parse of it
   * put Babalakin in Band 1 for Dispute Resolution when the web table says
   * Band 2. Use the web tables. They are structured and they are right.
   * ——————————————————————————————————————————————————————————————————————— */

  /* Solola & Akpana is not repeated here. It was already recorded above at
     Band 4 for Dispute Resolution, and today's reading of the same table
     agreed with it, which is the outcome you want from a re-check. */
  'babalakin':      { chambers: { band: 'Band 2', year: 2026, areas: ['Dispute Resolution'] } },
  /* A boutique in Band 2 alongside ǼLEX, G Elias and Udo Udoma, which is the
     single most interesting fact about this firm and the reason its record
     says energy is the whole proposition. */
  'enr-advisory':   { chambers: { band: 'Band 2', year: 2026, areas: ['Projects & Energy'] } },

  /* Tier 2 in three tables and Tier 3 in two more. Only the Tier 2 areas are
     listed, per the rule at the top of this file: banking, finance and capital
     markets and energy and natural resources are both Tier 3 and would read as
     though they shared the higher band. */
  'abdulai-taiwo':  { emea: { band: 'Tier 2', year: 2026, areas: ['Commercial, corporate and M&A', 'Shipping and transport', 'Real estate and construction'] } },
  'pinheiro':       { emea: { band: 'Tier 4', year: 2026, areas: ['Dispute resolution'] } },

  /* ———————————————————————————————————————————————————————————————————————
   * CHECKED AND NOT FOUND, 9 August 2026, so nobody spends the afternoon
   * looking again. An absent entry above means one of two things and this note
   * is what separates them.
   *
   * METHOD, because the first pass overstated its own coverage. Legal 500 was
   * read as all six Nigeria tables. Chambers was read as four tables, and the
   * gap was closed by searching the full Chambers Global 2026 Nigeria document
   * for every unranked firm by name. That search answers PRESENCE only, never
   * band: the document is flowing profile prose and its band markers do not
   * attach reliably to the firm beside them, which is the trap described
   * above. A firm absent from the text is not ranked. A firm present in it has
   * its band read off the structured web table, never off the PDF.
   *
   * NOT RANKED BY CHAMBERS NIGERIA. Thirty firms, confirmed absent from the
   * whole document: CLP Legal, Abe & Asotie, Aina Blankson, Ajumogobia & Okeke,
   * Blackfriars, Famsville, George Etomi, Mike Igbokwe, Platinum & Taylor Hill,
   * Primera Africa, Resolution, D.D. Dodo, Ikeyi Shittu, Lekan Bamidele,
   * Omaplex, Pavestones, Kola Awodein, F. R. A. Williams, Chris Ogunbanjo,
   * Femi Atoyebi, Idowu Sofola, Olisa Agbakoba Legal, Yusuf Ali, AO2 Law,
   * Afe Babalola, OAKE Legal, The Law Crest, Matrix Solicitors, MJ Numa and
   * Aekley. None of them is in the six Legal 500 Nigeria tables either.
   *
   * THE FIRM IS NOT THE LAWYER, and two of these turn on it:
   *
   *   Kenna Partners      Chambers lists NO department ranking. It ranks one
   *                       individual, Fabian Ajogwu SAN, Band 3 Dispute
   *                       Resolution. IFLR1000 has a profile page carrying no
   *                       rankings at all.
   *   Paul Usoro & Co     same shape. Paul Usoro SAN is ranked as an
   *                       individual; the firm is not.
   *
   * This table records firms. A partner's personal band is a real distinction
   * and a different claim, and rendering it as a firm badge would tell a
   * student something false about where they would be applying.
   *
   * ⚠ STILL OPEN. Four firms appear somewhere in the Chambers document and
   * have not been resolved to a band or to an individual: Punuka, Simmons
   * Cooper, Giwa-Osagie and Advocaat. They are deliberately left with no entry,
   * because absent means unchecked and that is exactly what they are. Resolve
   * them from the Chambers web tables for Banking & Finance, Capital Markets,
   * Tax and Restructuring/Insolvency, which are the four Nigeria tables nobody
   * has read yet.
   * ——————————————————————————————————————————————————————————————————————— */
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
