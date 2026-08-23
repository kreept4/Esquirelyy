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
 *  cycle, so re-check the `status` field each term rather than trusting it. */
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
  {
    slug: 'mastercard-foundation-scholars-edinburgh',
    title: 'Mastercard Foundation Scholars Program — University of Edinburgh',
    provider: 'Mastercard Foundation, with the University of Edinburgh',
    region: 'United Kingdom (on-campus) and online distance learning',
    level: "Master's or diploma, on-campus or online",
    funding: 'Full scholarship: tuition, stipend and related costs, per the Mastercard Foundation programme terms',
    deadline:
      'Register for an information session 15–24 September 2026 for entry in September 2027 — only attendees who also meet eligibility are invited to apply',
    status: 'upcoming',
    /* ⚠ NO LAW DEGREE ON THE PUBLISHED PROGRAMME LIST, and this file's own
       header says a scholarship that welcomes Nigerians without funding legal
       study does not belong here. It is included anyway, on explicit
       instruction, and the description says so plainly rather than implying a
       law fit that is not there — the closest overlaps are development,
       governance and social-justice programmes, not a law degree. */
    description:
      'A fully-funded programme for African leaders, delivered on-campus at the University of Edinburgh or online, across development, sustainability and public-policy programmes. There is no law degree on the current list, so this is a fit for a lawyer or law graduate whose interest runs toward policy, development or governance work rather than a further legal qualification — closest overlaps are International Development, Social Justice & Community Action, and Data, Inequality & Society. Applications especially encouraged from young women, people with disabilities, and people with refugee or displaced status. Recruitment for this cycle is registration-gated: you register for an information session first, and only attendees who also meet the eligibility criteria receive an invitation to apply.',
    eligibility: [
      'No law degree currently on the programme list — check the on-campus and online lists before applying',
      'On-campus: Africa & International Development, Climate Change Finance & Investment, Data Inequality & Society, Entrepreneurship & Innovation, Environment & Development, Environmental Sustainability, Food Security, Operational Research, Planetary Health, Sustainable Energy Systems',
      'Online: Biodiversity Wildlife & Ecosystem Health, Climate Change Management, Data-Driven Breeding & Genetics, Data Science Technologies, Digital Education, Global Food Security & Nutrition, Global Health & Infectious Diseases, International Development, One Health, Social Justice & Community Action',
      'Must register for and attend an information session, 15–24 September 2026, before an application invitation is sent',
      'Applications especially encouraged from young women, people with disabilities, and people with refugee or displaced status',
    ],
    link: 'https://edinburgh-global.ed.ac.uk/mastercard-foundation',
  },
]
