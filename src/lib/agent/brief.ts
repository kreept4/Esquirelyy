/**
 * What the agent is looking for, and where.
 *
 * This file is the agent's judgement, written down. Everything else in
 * lib/agent is plumbing; this is the part that decides whether a role belongs
 * on Esquirely, and it is the file to edit when the agent brings back the wrong
 * things. Do not tune the research prompt in research.ts — tune this.
 */

/**
 * ⚠ THE DEFINITION OF "APPLICABLE", AND WHY IT IS STRICTER THAN "LEGAL".
 *
 * The Adzuna crawler in scripts/fetch-jobs.js searches nine phrases — 'legal
 * counsel', 'lawyer', 'legal officer' and so on — and takes whatever comes back.
 * That is a keyword match, not a judgement, and it is why the board has carried
 * rows like a compliance role at a bank that wanted an accountant, or a "legal
 * officer" post open only to someone with ten years post-call.
 *
 * A listing belongs here if a Nigerian law student or a lawyer within a few
 * years of call could actually apply to it and be considered. That is a single
 * test and it excludes three things that a keyword search will always let in:
 *
 *   Roles that mention law but are not for lawyers. Legal secretary, paralegal
 *   where a degree is explicitly not required, compliance analyst asking for
 *   ACCA. The word "legal" in a title is not evidence.
 *
 *   Roles for lawyers far past our readers. Partner, General Counsel, Head of
 *   Legal at a bank asking for fifteen years. These are real legal jobs and the
 *   wrong ones. The board's readers are students, NYSC, and the first several
 *   years after call.
 *
 *   Roles nobody here can apply to. Requires qualification in another
 *   jurisdiction with no Nigerian route, requires an existing work visa, or is
 *   posted in a country with no remote option.
 *
 * A partner-level seat at a Nigerian firm is a judgement call rather than an
 * automatic no — it is the kind of thing worth proposing with a caveat, because
 * the board does carry senior associate roles. Say so in the caveats field
 * rather than silently dropping it.
 */
export const APPLICABILITY = `
THE TEST, and everything below is a working-out of this one sentence: could a
Nigerian law student, NYSC participant, or lawyer within roughly seven years of
call actually apply to this and be seriously considered?

⚠ "IN NIGERIA" IS NOT THE TEST. "OPEN TO NIGERIANS" IS. An opportunity based in
Geneva that accepts Nigerian nationals belongs here. A role in Lagos that
requires a New York bar admission does not. Location is evidence about
eligibility, never a substitute for it — the board already carries an ECOWAS
programme for exactly this reason.

INCLUDE — LOCAL:
- Associate, junior associate and senior associate seats at law firms and
  chambers
- In-house counsel and legal officer roles where a law degree and call to the
  Nigerian Bar are required or preferred
- NYSC placements, internships, clerkships, pupillage and vacation schemes
- Graduate and trainee programmes open to law graduates
- Judicial clerkships, and roles at courts, commissions and regulators

INCLUDE — INTERNATIONAL FIRM PROGRAMMES FOR AFRICANS. Treat this as a category
to hunt for deliberately, not something to stumble on. Global firms run schemes
aimed specifically at African students and African-qualified lawyers — the
Linklaters Africa Clerkship Programme is the shape of the thing — and they are
among the most valuable openings this board can carry, because almost nobody
finds them. They include Africa clerkships and vacation schemes, Africa-specific
scholarships and bursaries, secondments into an African office, and training
contracts explicitly open to African-qualified applicants.

Do NOT confuse one of these with the firm's ordinary London or New York
graduate scheme. The general scheme almost always requires a right to work
nobody is offering a Nigerian applicant; the Africa programme is the one where
being Nigerian is the point. If you cannot tell which you are reading, quote the
eligibility section and flag it in caveats.

INCLUDE — INTERNATIONAL, where a Nigerian is eligible. Eligibility has to be
something the posting says, not something you assume:
- International organisations and development bodies: the UN and its agencies,
  the World Bank, the African Development Bank, ECOWAS, the African Union, the
  ICC, regional human-rights courts
- International NGOs and legal-aid organisations recruiting from Africa
- Programmes explicitly open to African, Commonwealth, ECOWAS or
  developing-country nationals
- Roles outside Nigeria that state visa sponsorship, or that are remote and do
  not restrict the applicant's country
- Fellowships, secondments and exchange programmes open to Nigerian-qualified
  lawyers
- International firms' graduate schemes that accept a Nigerian law degree or
  Nigerian call

EXCLUDE:
- Roles where a law degree is not required: legal secretary, litigation clerk,
  paralegal advertised as non-graduate, records officer
- Compliance, risk or company-secretarial roles asking for an accounting or
  finance qualification rather than a law degree
- Roles requiring more than about ten years post-call, or titled Partner,
  General Counsel, Chief Legal Officer, Head of Legal at a large institution
- Roles requiring citizenship, permanent residence, or a right to work that a
  Nigerian applicant would not have, where the posting offers no sponsorship
- Roles requiring admission in another jurisdiction with no stated route for a
  foreign-qualified lawyer
- Anything with no way to apply: no application URL, no email, no address

DO NOT PROPOSE VIRTUAL WORK EXPERIENCE — Forage, and anything like it. These
are genuinely valuable to this audience and they are not board listings. Say so
in your notes if you find a new one; do not return it as a candidate.

⚠ THE COMMONEST MISTAKE ON THE INTERNATIONAL SIDE is proposing a role at an
impressive institution that quietly requires a right to work the reader does not
have. Before proposing anything based outside Nigeria, find the sentence that
says who may apply, and quote it. If the posting is silent on nationality and
work authorisation, that silence is a caveat, not a green light.

BORDERLINE — propose it, and say why in caveats:
- Partner or head-of-practice seats at small Nigerian firms
- Roles that would suit a lawyer but do not say a law degree is required
- International roles that are silent on sponsorship but do not exclude
  non-nationals either
- Postings with no closing date and no way to tell how old they are
`.trim()

/**
 * Where to look.
 *
 * ⚠ THESE ARE HINTS, NOT A CRAWL LIST. The agent searches the open web and
 * follows what it finds; this list exists because an unguided search for
 * "legal jobs Nigeria" returns aggregator spam and expired listing farms, and
 * naming the places that actually carry real postings raises the hit rate
 * enormously. An employer's own careers page is always worth more than an
 * aggregator's copy of it, which is why firms come first.
 *
 * WHY THE FIRM LIST IS NOT HERE. src/lib/firms-data.ts already holds sixty-odd
 * Nigerian firms with their websites, and it is maintained. The sweep reads it
 * rather than keeping a second, staler copy — see research.ts. A firm list in
 * two files is a firm list that will disagree with itself.
 */
export const JOB_SOURCES = [
  { name: 'MyJobMag Nigeria — law', url: 'https://www.myjobmag.com/jobs-by-field/law-legal' },
  { name: 'Jobberman Nigeria — legal', url: 'https://www.jobberman.com/jobs/legal-services' },
  { name: 'HotNigerianJobs — legal', url: 'https://www.hotnigerianjobs.com/' },
  { name: 'NGCareers', url: 'https://ngcareers.com/' },
  { name: 'Nigerian Bar Association', url: 'https://nigerianbar.org.ng/' },
  { name: 'LinkedIn Jobs — public postings', url: 'https://www.linkedin.com/jobs/search?keywords=lawyer&location=Nigeria' },
] as const

/**
 * The international side.
 *
 * ⚠ THESE ARE NOT "JOBS ABROAD". Every one is an employer that recruits
 * internationally and states its eligibility rules, which is what makes them
 * checkable — the test in APPLICABILITY is whether a Nigerian may apply, and
 * these are the places where that question has a published answer rather than
 * an assumed one. A vacancy at a London firm is not here, because whether a
 * Nigerian can take it is a question about that specific posting's sponsorship.
 *
 * The board already carries an ECOWAS programme, sourced by hand from the
 * Young Professional portal. This list is the rest of that same category.
 */
/**
 * International firms running Africa-specific programmes.
 *
 * ⚠ A CATEGORY OF ITS OWN, BECAUSE NOTHING ELSE FINDS IT. A search for "legal
 * jobs Nigeria" will never surface the Linklaters Africa Clerkship Programme,
 * and a search of a global firm's careers page returns its London training
 * contract — which a Nigerian student cannot take without a visa nobody is
 * offering. The thing worth finding is the narrow band in between: schemes these
 * firms run SPECIFICALLY for African students and African-qualified lawyers,
 * where eligibility is the point rather than an obstacle.
 *
 * These are the firms known to run something in that band. The list is a
 * starting point for searching, NOT a set of claims — a programme named here may
 * have been discontinued, renamed, or had its eligibility narrowed since anyone
 * last looked. The agent must find the current page and quote it, exactly as for
 * any other source. An entry that turns out to be dead costs one search; an
 * entry we never thought to look for costs the opportunity.
 *
 * WHAT TO SEARCH FOR alongside the firm name: "Africa clerkship", "Africa
 * programme", "Africa scholarship", "Africa academy", "Africa internship",
 * "secondment", "vacation scheme Africa".
 */
export const AFRICA_PROGRAMME_FIRMS = [
  'Linklaters',
  'Clifford Chance',
  'A&O Shearman',
  'Freshfields',
  'Slaughter and May',
  'Herbert Smith Freehills',
  'White & Case',
  'Baker McKenzie',
  'Hogan Lovells',
  'Norton Rose Fulbright',
  'DLA Piper',
  'Dentons',
  'Bowmans',
  'ENSafrica',
  'Webber Wentzel',
] as const

export const INTERNATIONAL_SOURCES = [
  { name: 'UN Careers', url: 'https://careers.un.org/' },
  { name: 'World Bank Group careers', url: 'https://www.worldbank.org/en/about/careers' },
  { name: 'African Development Bank', url: 'https://www.afdb.org/en/about-us/careers' },
  { name: 'ECOWAS recruitment', url: 'https://www.ecowas.int/' },
  { name: 'African Union careers', url: 'https://au.int/en/carrers' },
  { name: 'International Criminal Court', url: 'https://www.icc-cpi.int/about/careers' },
  { name: 'ReliefWeb — legal jobs', url: 'https://reliefweb.int/jobs' },
  { name: 'UNjobs', url: 'https://unjobs.org/' },
  { name: 'Impactpool', url: 'https://www.impactpool.org/' },
] as const

export const SCHOLARSHIP_SOURCES = [
  { name: 'Chevening', url: 'https://www.chevening.org/scholarships/' },
  { name: 'Commonwealth Scholarships', url: 'https://cscuk.fcdo.gov.uk/scholarships/' },
  { name: 'DAAD', url: 'https://www.daad.de/en/studying-in-germany/scholarships/' },
  { name: 'Mandela Rhodes Foundation', url: 'https://www.mandelarhodes.org/scholarship/' },
  { name: 'Opportunity Desk', url: 'https://opportunitydesk.org/' },
  { name: 'After School Africa', url: 'https://www.afterschoolafrica.com/' },
  { name: 'Scholarship Region', url: 'https://scholarshipregion.com/' },
] as const

/**
 * ⚠ LINKEDIN IS READ AS A LOGGED-OUT STRANGER AND IN NO OTHER WAY.
 *
 * It is in JOB_SOURCES because LinkedIn publishes job postings with JobPosting
 * schema markup so that Google can index them, which means a public job URL
 * returns the role, the employer and the description to an ordinary HTTP GET
 * with no cookies. That is the same thing a search engine does and it involves
 * no account.
 *
 * WHAT THIS MUST NEVER BECOME. There are tools that reach LinkedIn by driving a
 * real logged-in browser session or by replaying exported cookies. Those work,
 * and they put the account whose session is being used at risk of being banned —
 * the projects that offer them say so themselves and recommend burner accounts.
 * No part of this agent holds a LinkedIn credential, and none should be added.
 * If LinkedIn blocks the fetcher, the correct response is to lose LinkedIn, not
 * to log in.
 *
 * The practical consequence: the agent can read a LinkedIn job page it has the
 * URL for, and cannot search LinkedIn or read the feed. It finds those URLs the
 * way anyone without an account does — through a web search.
 */
export const LINKEDIN_POLICY = 'public-pages-only'

/**
 * ⚠ FORAGE AND VIRTUAL WORK EXPERIENCE ARE OUT OF SCOPE, AND THE REASON IS NOT
 * THAT THEY ARE UNSUITABLE.
 *
 * They are among the few international opportunities with no barrier at all for
 * a Nigerian student — free, remote, no visa, no nationality rule, which is
 * exactly the wall that kills most international listings for this audience.
 * They belong on Esquirely. They do not belong in the jobs table, for three
 * reasons that all point the same way:
 *
 *   They never close. The board's promise is that a listing is open right now,
 *   and the delisting checks in obsolete.ts exist to keep that true. A
 *   programme with no deadline and no closing date would sit there permanently
 *   and could never be checked against anything.
 *
 *   They are a catalogue, not a stream. There are on the order of thirty legal
 *   simulations in total and the set changes a few times a year. An agent that
 *   searches nightly would rediscover the same thirty forever and spend its
 *   search budget doing it.
 *
 *   They are not applications. Every other listing on the board is something
 *   you apply to and can be turned down for. Filing a self-paced simulation as
 *   `type: 'internship'` would tell a student they had an internship.
 *
 * The right home is a seeded list of their own, like scholarships-data.ts. Until
 * that exists, the research prompt tells the model to mention new ones in its
 * notes and not to propose them — the finding is worth having even when the
 * listing is not.
 */
export const VIRTUAL_EXPERIENCE_POLICY = 'mention-in-notes-never-propose'

/**
 * How old is too old for an undated posting.
 *
 * Six weeks, and the number comes from the listings that had to be removed by
 * hand on 14 August: bridgegap-legal-officer-lekki and
 * castlefield-attorneys-associate-lagos were both ten weeks old, undated, with
 * an email address and nothing else, and the note written at the time is the
 * rule this encodes — "a listing we cannot verify is one we should not be
 * asking students to act on".
 *
 * Applied only to postings with NO deadline and NO live source to re-check. A
 * dated role is judged on its date; a role whose posting page still lists it is
 * judged on that.
 */
export const UNDATED_STALE_DAYS = 42
