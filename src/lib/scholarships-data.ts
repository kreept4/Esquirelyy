export interface Scholarship {
  slug: string
  title: string
  provider: string
  region: string
  level: string
  funding: string
  deadline: string
  status: 'open' | 'closed' | 'upcoming'
  description: string
  eligibility: string[]
  link: string
}

/** Every entry here must be open to a Nigerian lawyer or law student. That is the
 *  filter, and it is stricter than it looks: most "scholarships for African
 *  students" restrict by SUBJECT, not just nationality, and the funded subjects
 *  are overwhelmingly STEM and international development. A scholarship that
 *  welcomes Nigerians but only funds an MSc in Robotics does not belong here.
 *  Check the eligible-course list before adding anything.
 *
 *  Verified 2026-08-05 against each provider's own page. Deadlines move every
 *  cycle, so re-check the `status` field each term rather than trusting it.
 *
 *  The Mastercard Foundation entry was added 2026-08-24 off the programme's own
 *  recruitment flier and has NOT been checked against the Edinburgh Global page
 *  the way the nine above were. Its funding line says so rather than itemising
 *  an award the flier does not itemise. */
export const ALL_SCHOLARSHIPS: Scholarship[] = [
  {
    slug: 'rhodes-scholarship-west-africa',
    title: 'Rhodes Scholarship for West Africa',
    provider: 'Rhodes Trust, University of Oxford',
    region: 'United Kingdom',
    level: "Master's and doctoral study at Oxford",
    funding: 'Full University and College fees, £20,400 annual stipend, flights, visa and health cover',
    deadline: 'Closes 27 August 2026 for entry in October 2027',
    status: 'open',
    description:
      'Three scholarships a year for the whole of West Africa, funding any full-time postgraduate degree at Oxford. For lawyers that usually means the BCL or the MJur, both of which sit among the most respected taught law degrees anywhere. Selection weighs academic excellence alongside character, leadership and a commitment to service.',
    eligibility: [
      'Citizen of Nigeria or another of the 20 eligible West African countries',
      'Outstanding academic record from your first degree',
      'Demonstrated leadership and commitment to public service',
      'Must secure admission to an Oxford postgraduate course',
    ],
    link: 'https://www.rhodeshouse.ox.ac.uk/scholarships/applications/west-africa/',
  },
  {
    slug: 'chevening-scholarship',
    title: 'Chevening Scholarship',
    provider: 'UK Foreign, Commonwealth and Development Office',
    region: 'United Kingdom',
    level: "One year taught Master's",
    funding: 'Full tuition, monthly stipend, flights and visa costs',
    deadline: 'Open 4 August to 6 October 2026 for 2027/2028 entry',
    status: 'open',
    description:
      'The flagship UK government scholarship, open across every subject, so an LLM is squarely eligible. Chevening has funded hundreds of Nigerian lawyers since 1983. You apply to three eligible UK courses and the award follows you to whichever accepts you.',
    eligibility: [
      'Nigerian citizen, returning to Nigeria for at least two years after the course',
      'Undergraduate degree at UK 2:1 standard or better',
      'At least two years of work experience, roughly 2,800 hours',
      'Graduated before October 2025 to be eligible for this cycle',
    ],
    link: 'https://www.chevening.org/scholarship/nigeria/',
  },
  {
    slug: 'commonwealth-masters-scholarship',
    title: "Commonwealth Master's Scholarship",
    provider: 'Commonwealth Scholarship Commission in the UK',
    region: 'United Kingdom',
    level: "Taught Master's",
    funding: 'Full tuition, return airfare, and a monthly stipend of £1,712 (£2,000 in London)',
    deadline: 'Opens 8 September, closes 20 October 2026 for 2027/2028 entry',
    status: 'upcoming',
    description:
      'Aimed at candidates who could not otherwise afford UK study. Awards sit under six development themes rather than being open to any topic, so a law application needs framing against one of them. Governance, rule of law, access to justice and human rights all fit comfortably.',
    eligibility: [
      'Nigerian citizen or refugee status in an eligible Commonwealth country',
      'Undergraduate degree at upper second class (2:1) standard or better',
      'Unable to fund UK study without the award',
      'Study proposal must map onto one of the six CSC development themes',
    ],
    link: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
  },
  {
    slug: 'gates-cambridge-scholarship',
    title: 'Gates Cambridge Scholarship',
    provider: 'Bill and Melinda Gates Foundation, University of Cambridge',
    region: 'United Kingdom',
    level: "Master's and doctoral study at Cambridge",
    funding: 'Full tuition, £21,000 annual maintenance, flights, visa and health cover',
    deadline: 'December 2026 or January 2027, set by your course',
    status: 'upcoming',
    description:
      'Open to citizens of any country outside the UK, across every full-time postgraduate course at Cambridge including the LLM. There is no separate form: you apply to Cambridge and complete the Gates funding section inside the same application, so the only real deadline is your course deadline.',
    eligibility: [
      'Citizen of any country outside the United Kingdom',
      'Applying to a full-time postgraduate course at Cambridge',
      'Outstanding academic record and capacity for leadership',
      'Commitment to improving the lives of others',
    ],
    link: 'https://www.gatescambridge.org/',
  },
  {
    slug: 'clarendon-fund-scholarship',
    title: 'Clarendon Fund Scholarship',
    provider: 'University of Oxford',
    region: 'United Kingdom',
    level: "Master's and doctoral study at Oxford",
    funding: 'Full tuition and college fees, plus at least £18,622 a year for living costs',
    deadline: 'December 2026 or January 2027, set by your course',
    status: 'upcoming',
    description:
      'Around 200 awards a year, open to all subjects and all nationalities, which puts the BCL and MJur firmly in scope. No separate application exists: apply to Oxford by your course deadline and you are considered automatically.',
    eligibility: [
      'No restriction by nationality or country of residence',
      "Applying for a new Master's or DPhil at Oxford",
      'Must apply by the December or January deadline for your course',
      'Selected on academic excellence and proven potential',
    ],
    link: 'https://www.ox.ac.uk/clarendon/information-for-applicants',
  },
  {
    slug: 'margaret-bennett-scholarship',
    title: 'Margaret Bennett Scholarship',
    provider: 'London School of Economics and Political Science',
    region: 'United Kingdom',
    level: 'LLM',
    funding: '£5,000 towards the LSE LLM',
    deadline: 'Tied to the LSE graduate financial support deadline, usually late April',
    status: 'upcoming',
    description:
      'One of the few awards written specifically for African women reading law. Endowed by Margaret Bennett, herself an LSE LLM graduate of 1968, and restricted to female students from Africa taking the LLM. Nigeria is on the eligible list, though preference goes to applicants from north Africa.',
    eligibility: [
      'Female student from Nigeria or another eligible African country',
      'Applying for the LSE LLM',
      'Assessed alongside the LSE graduate financial support application',
      'Preference given to candidates from north Africa',
    ],
    link: 'https://www.lse.ac.uk/study-at-lse/Graduate/fees-and-funding/margaret-bennett-scholarship',
  },
  {
    slug: 'queen-elizabeth-commonwealth-scholarship',
    title: 'Queen Elizabeth Commonwealth Scholarships',
    provider: 'Association of Commonwealth Universities',
    region: 'Select Commonwealth countries',
    level: "Master's degree",
    funding: 'Full tuition and living costs for two years',
    deadline: 'Two cycles yearly: November to December, and March to April',
    status: 'closed',
    description:
      'A two year fully funded master\'s programme hosted in select low and middle income Commonwealth countries, designed for students committed to driving change in their communities. Open across disciplines, law included.',
    eligibility: [
      'Citizen of an eligible Commonwealth country, including Nigeria',
      'Demonstrated commitment to community impact',
      'Strong academic record',
    ],
    link: 'https://www.acu.ac.uk/our-work/queen-elizabeth-commonwealth-scholarships/',
  },

  /**
   * ⚠ THE ONE ENTRY HERE THAT DOES NOT FUND AN LLM, AND IT IS IN ON PURPOSE.
   *
   * The rule at the top of this file is that a scholarship which welcomes
   * Nigerians but funds only an MSc in Robotics does not belong. This one is the
   * genuine edge of that rule rather than an exception to it. Every funded
   * programme is sustainability-facing and none of them is a law degree — but
   * several are degrees Nigerian law graduates actually read and are actually
   * admitted to: Africa & International Development, Data, Inequality & Society,
   * Social Justice & Community Action, and International Development. A lawyer
   * moving into policy, development or climate governance is the intended
   * candidate for those, not a stranger to them.
   *
   * So it goes in WITH THE SUBJECT LIMIT STATED IN THE FIRST LINE OF THE
   * DESCRIPTION rather than buried in the eligibility list. The failure this
   * file is guarding against is somebody spending an evening on an application
   * they were never eligible for; naming the constraint before the award does
   * more to prevent that than leaving the row out would.
   *
   * ⚠ AND THE DEADLINE IS NOT AN APPLICATION DEADLINE. The route changed this
   * cycle and the flier is emphatic about it: you register for an information
   * session, and only attendees who also meet the eligibility bar are invited
   * to apply at all. Registering is therefore the whole of what a reader can do
   * now, and missing the sessions forecloses the application entirely. That is
   * why the sessions are what the `deadline` field carries — parseDeadline in
   * lib/notifications.ts reads the last date out of this string, so the bell
   * counts down to 24 September, which is the date that actually shuts a door.
   */
  {
    slug: 'mastercard-foundation-scholars-edinburgh',
    title: 'Mastercard Foundation Scholars Program at the University of Edinburgh',
    provider: 'Mastercard Foundation and the University of Edinburgh',
    region: 'United Kingdom',
    level: "On-campus and online distance learning Master's degrees, starting September 2027",
    funding: 'Full scholarship. Check the programme page for what the award covers in this cycle',
    /* ⚠ ANCHORED ON THE FIRST SESSION, NOT THE LAST, and the wording is built
       around that. parseDeadline takes the first complete day-month-year in
       this string, so "15 September 2026" is what the bell counts down to and
       "to 24 September" carries no year precisely so it cannot be picked up
       instead. The sessions do run to the 24th and a reader can attend the last
       one — but registration closes ahead of the sessions, the exact cut-off is
       not published on the flier, and a countdown that expires nine days late is
       the one failure mode this field must not have. The earlier date is the
       one somebody can safely act on. */
    deadline: 'Register for an information session: sessions begin 15 September 2026 and run to 24 September, for 2027/2028 entry',
    status: 'open',
    description:
      'The funded degrees are not law. They are subjects like Africa & International Development, Data, Inequality & Society, Social Justice & Community Action and Global Health, studied on campus in Edinburgh or by online distance learning. That makes it a route for a lawyer moving into policy, development or climate work, and not a way to fund an LLM. The process changed this cycle: you must register for and attend an information session, and only attendees who also meet the eligibility requirements are invited to apply. Applications are especially encouraged from young women, young people with disabilities, and young people with refugee or displaced status.',
    eligibility: [
      'From Africa, so Nigerian nationality qualifies',
      'Applying for one of the listed sustainability-focused programmes, not an LLM',
      'Must register for and attend an information session between 15 and 24 September 2026',
      'Only session attendees who meet the eligibility bar receive an invitation to apply',
      'Programme list changes each cycle, so check the page before registering',
    ],
    link: 'https://edinburgh-global.ed.ac.uk/mastercard-foundation',
  },

  {
    slug: 'utrecht-leg-international-talent',
    title: 'Law, Economics and Governance International Talent Scholarship',
    provider: 'Utrecht University',
    region: 'Netherlands',
    level: "English-taught Master's at the Graduate School of Law, Economics and Governance",
    funding: 'Full tuition plus one year of living costs at the level Dutch immigration requires',
    deadline: 'Opens 1 November 2026, closes 1 February 2027 for a September 2027 start',
    status: 'upcoming',
    description:
      'A faculty scholarship rather than a general one, which is what makes it unusually relevant: it is attached to the Law, Economics and Governance graduate school, so an LL.M there is squarely in scope rather than competing against every subject in the university. About six are awarded a year.',
    eligibility: [
      'Open to non-EU applicants, so Nigerian nationality is no barrier',
      'A secondary education qualification from outside the Netherlands',
      'Admitted to an English-taught master at the Faculty of Law, Economics and Governance',
      'Judged on academic record, career achievement and community involvement',
    ],
    link: 'https://www.uu.nl/en/masters/general-information/application-and-admission/scholarships-and-grants/law-economics-and-governance-international-talent-scholarship',
  },
  {
    slug: 'maastricht-nl-high-potential',
    title: 'Maastricht University NL-High Potential Scholarship',
    provider: 'Maastricht University',
    region: 'Netherlands',
    level: "Master's at Maastricht University",
    funding: 'Around EUR 36,000: tuition waiver, a monthly stipend, visa and insurance',
    deadline: 'Closes 1 February 2027 for a September 2027 start',
    status: 'upcoming',
    description:
      'Twenty-one full awards a year, restricted to non-EU nationals, which is a far shorter queue than the open-to-all schemes. Maastricht has a substantial law faculty and a well-known set of LL.M programmes, so a Nigerian law graduate is applying into a real fit rather than an exception.',
    eligibility: [
      'Nationality outside the EU/EEA, Switzerland and Suriname, and no dual EU nationality',
      'No previous degree-seeking study in the Netherlands',
      'Aged 35 or under at the start of the programme',
      'GPA of 7.5 out of 10 or better in your prior degree',
      'Check the participating-programmes list for the cycle: not every faculty takes part every year',
    ],
    link: 'https://www.maastrichtuniversity.nl/studeren/toelating-inschrijving/financing-your-studies/scholarships/maastricht-university-nl-high',
  },

]
