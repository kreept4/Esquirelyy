import { daysUntilDay, hasPassed } from './day'

export type ScholarshipStatus = 'open' | 'closed' | 'upcoming'

export interface Scholarship {
  slug: string
  title: string
  provider: string
  region: string
  level: string
  funding: string
  /** Free text, as the provider publishes it. What a reader sees. */
  deadline: string
  /**
   * The day the application window OPENS, as YYYY-MM-DD, when there is a
   * published one.
   *
   * ⚠ THIS IS WHY `status` STOPPED BEING THE ANSWER. `status` was typed by
   * hand, so an entry marked 'upcoming' stayed upcoming until somebody
   * remembered to edit this file and redeploy. The Commonwealth Master's opens
   * on 8 September and would have gone on saying "Upcoming" indefinitely, on a
   * page whose whole job is telling people what they can apply for today.
   *
   * Absent on purpose where no opening date is published. Gates and Clarendon
   * open "December 2026 or January 2027, set by your course", and Margaret
   * Bennett is tied to a deadline LSE describes as "usually late April". A date
   * invented for those would be worse than the editorial `status` below,
   * because it would look authoritative.
   */
  opensOn?: string
  /** The day the window CLOSES, as YYYY-MM-DD, when there is a published one. */
  closesOn?: string
  /**
   * The editorial fallback, used only when the dates above cannot answer.
   *
   * Still hand-typed and still meaningful: Queen Elizabeth Commonwealth runs
   * "two cycles yearly" with no date this file can hold, and calling it closed
   * is a judgement rather than a calculation. Where `opensOn` or `closesOn`
   * exists, they win. See `statusOf`.
   */
  status: ScholarshipStatus
  description: string
  eligibility: string[]
  link: string
  /**
   * The provider's own logo, as a path under /public. Taken from the
   * provider's own site (the University of Oxford's from Wikimedia Commons,
   * because ox.ac.uk refuses automated requests) and shown beside the title
   * on the board and on the scholarship's page.
   *
   * Optional so a new entry can go up before its mark is sourced: a row
   * without one shows the provider's initials, as a job without a logo does.
   */
  logo?: string
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
 *  12 November 2026: the Mastercard Foundation programme at Edinburgh was
 *  removed. None of its funded degrees is a law degree, and this page is for
 *  law graduates. */
const SCHOLARSHIPS: Scholarship[] = [
  {
    slug: 'rhodes-scholarship-west-africa',
    opensOn: '2026-06-01',
    closesOn: '2026-08-27',
    title: 'Rhodes Scholarship for West Africa',
    provider: 'Rhodes Trust, University of Oxford',
    logo: '/employer-logos/rhodes-trust.png',
    region: 'United Kingdom',
    level: "Master's and doctoral study at Oxford",
    funding: 'Full University and College fees, £20,400 annual stipend, flights, visa and health cover',
    /* The time is on it because the date alone is not the deadline when a
       reader is three days out. Rhodes House publishes "Closing date: 23:59 GMT
       27 August 2026", and GMT is WAT minus one, so a Nigerian applicant has
       until 00:59 on the 28th. Verified against rhodeshouse.ox.ac.uk on 24
       August 2026; the window opened on 1 June. */
    deadline: 'Closes 23:59 GMT on 27 August 2026, for entry in October 2027',
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
    opensOn: '2026-08-04',
    closesOn: '2026-10-06',
    title: 'Chevening Scholarship',
    provider: 'UK Foreign, Commonwealth and Development Office',
    logo: '/employer-logos/chevening.png',
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
    opensOn: '2026-09-08',
    closesOn: '2026-10-20',
    title: "Commonwealth Master's Scholarship",
    provider: 'Commonwealth Scholarship Commission in the UK',
    logo: '/employer-logos/commonwealth-scholarship-commission.png',
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
    logo: '/employer-logos/gates-cambridge.png',
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
    logo: '/employer-logos/university-of-oxford.png',
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
    logo: '/employer-logos/lse.png',
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
    logo: '/employer-logos/acu.png',
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
    opensOn: '2026-11-01',
    closesOn: '2027-02-01',
    title: 'Law, Economics and Governance International Talent Scholarship',
    provider: 'Utrecht University',
    logo: '/employer-logos/utrecht-university.png',
    region: 'Netherlands',
    level: "English-taught Master's at the Graduate School of Law, Economics and Governance",
    funding: 'Full tuition plus one year of living costs at the level Dutch immigration requires',
    deadline: 'Closes 1 February 2027 for a September 2027 start. Applications opened 1 November 2026',
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
    /* Corrected 12 November 2026 against Maastricht's own page: 18 awards,
       not 21, and the admission file must be complete by 10 December 2026,
       which this entry did not say. That earlier date leads the deadline line
       so the closing-soon alerts fire on the date a reader can still act on.
       The page's 2027-28 programme list includes the law LLMs (European Law
       School, Globalisation and Law, International and European Tax Law,
       Forensics, Criminology and Law). Applications opened 1 October 2026. */
    slug: 'maastricht-nl-high-potential',
    opensOn: '2026-10-01',
    closesOn: '2027-02-01',
    title: 'Maastricht University NL-High Potential Scholarship',
    provider: 'Maastricht University',
    logo: '/employer-logos/maastricht-university.png',
    region: 'Netherlands',
    level: "Master's at Maastricht University",
    funding: 'Around EUR 36,000: tuition waiver, a monthly stipend, visa and insurance',
    deadline: 'Complete your Maastricht admission application by 10 December 2026. The scholarship itself closes 1 February 2027, for a September 2027 start',
    status: 'upcoming',
    description:
      'Eighteen full awards a year, restricted to non-EU nationals, which is a far shorter queue than the open-to-all schemes. Maastricht has a substantial law faculty and a well-known set of LL.M programmes, so a Nigerian law graduate is applying into a real fit rather than an exception.',
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
    /* Added 23 September 2026.
     *
     * ⚠ THE ONLY ENTRY HERE THAT NAMES LAW DEGREES OUTRIGHT. Most schemes on
     * this list admit a lawyer as a side effect of admitting everybody; Oxford
     * Law's own page for this one lists the eligible courses as the BCL, the
     * MJur and the MSc in Law and Finance, which are precisely the three
     * degrees a Nigerian lawyer goes to Oxford to take. That makes it the
     * strongest fit on the page, and it is why it was worth verifying properly
     * rather than taking from an aggregator.
     *
     * ⚠ WHAT WAS VERIFIED, AND WHERE, BECAUSE ONE PIECE COULD NOT BE.
     *   courses + funding  law.ox.ac.uk, the faculty's own page: BCL, MJur,
     *                      MLF; 100% of course fees and a living grant of at
     *                      least GBP 20,780.
     *   deadline           ox.ac.uk and the Trust both say the same thing, and
     *                      it is not a single date: the scholarship is applied
     *                      for inside the Oxford graduate application, so the
     *                      deadline is your COURSE's deadline, which for the
     *                      law degrees falls in January. That is written as it
     *                      stands rather than flattened into one date.
     *   Nigeria            NOT confirmed on an Oxford page. ox.ac.uk answers
     *                      403 to an automated fetch, so the eligible-country
     *                      list itself could not be read. Nigeria appears on
     *                      every secondary listing of it and the programme is
     *                      for emerging economies, so this goes up, and the
     *                      eligibility line says plainly that the list is the
     *                      thing to check.
     *
     * ⚠ NO closesOn, DELIBERATELY. "The January deadline for your course" is
     * not a date this file can hold: the BCL, the MJur and the MLF do not all
     * close on the same day and the dates move each cycle. Inventing one would
     * put it in a closing-soon list on the strength of a guess, which the
     * parser note at the foot of this file exists to prevent. It falls back to
     * the hand-typed status, and that is the honest cost of a real deadline
     * nobody publishes as a single date. */
    slug: 'weidenfeld-hoffmann-scholarship',
    title: 'Weidenfeld-Hoffmann Scholarships and Leadership Programme',
    provider: 'Weidenfeld-Hoffmann Trust and the University of Oxford',
    logo: '/employer-logos/weidenfeld-hoffmann-trust.png',
    region: 'United Kingdom',
    level: 'BCL, MJur or MSc in Law and Finance at Oxford',
    funding: '100% of course fees and a living grant of at least GBP 20,780 a year, plus a leadership programme',
    deadline: 'Apply with your Oxford course application. The law deadlines fall in January for entry the following October',
    status: 'upcoming',
    description:
      'The one award on this page that names law degrees rather than admitting a lawyer by accident. Oxford Law lists the BCL, the MJur and the MSc in Law and Finance as eligible, which are the three degrees Nigerian lawyers actually go to Oxford for. It is aimed at people intending to return home and work in public life, so the selection weighs what you plan to do with it as heavily as the transcript.',
    eligibility: [
      'A national of an eligible country. Nigeria appears on the published lists, but check the Oxford page for your cycle: the list is revised and it is the only version that counts',
      'Applying to start the BCL, the MJur or the MSc in Law and Finance',
      'You intend to return to your country of ordinary residence after the course',
      'Selected inside the Oxford graduate application, so the course deadline is the real deadline. Missing it costs you the scholarship as well as the place',
    ],
    link: 'https://www.ox.ac.uk/admissions/graduate/fees-and-funding/fees-funding-and-scholarship-search/weidenfeld-hoffmann-scholarships-and-leadership-programme',
  },

  {
    /* Added 23 September 2026.
     *
     * ⚠ THE FIRST NIGERIAN-FUNDED AWARD ON THIS PAGE, and its absence was the
     * real gap rather than any particular scheme. Every other entry here is a
     * foreign government or a foreign university deciding to fund a Nigerian.
     * This is Nigerian money, with a Nigerian eligibility rule, and for a
     * reader from the nine states it is very likely the shortest queue they
     * will ever stand in: the field is not the whole country, it is the Niger
     * Delta.
     *
     * ⚠ LAW IS AN APPROVED DISCIPLINE, WHICH IS THE ONLY REASON IT QUALIFIES
     * FOR THIS FILE. The header's rule is that a scholarship welcoming
     * Nigerians while funding only STEM does not belong, and NDDC does publish
     * a closed list of disciplines: agricultural sciences, engineering,
     * environmental sciences, geosciences, IT, law, management sciences,
     * medicine, architecture and hospitality. Law is named in it.
     *
     * ⚠ AND IT IS RESTRICTED BY STATE OF ORIGIN, WHICH THE ELIGIBILITY SAYS
     * FIRST. Nine states, and a reader from the other twenty-eight cannot
     * apply at any academic standard. That is the fact that decides whether
     * this row is worth a minute, so it leads rather than sitting under the
     * funding.
     *
     * CLOSED, NOT UPCOMING. The 2026/2027 window ran 23 March to 19 April 2026
     * and shut five months ago. The Commission has run it in that part of the
     * year repeatedly, but it does not publish next cycle's dates in advance,
     * so there is no opensOn to derive from and writing one would be inventing
     * the one fact a reader would act on. It falls back to the hand-typed
     * status and wants checking each March. */
    slug: 'nddc-foreign-postgraduate-scholarship',
    title: 'NDDC Foreign Postgraduate Scholarship',
    provider: 'Niger Delta Development Commission',
    logo: '/employer-logos/nddc.png',
    region: 'Nigeria, for study abroad',
    level: "Master's abroad, in an approved discipline",
    funding: 'Tuition, air travel, a living stipend and study allowances',
    deadline: 'The 2026/2027 window ran 23 March to 19 April 2026. Next cycle unannounced; the Commission has opened in March in past years',
    status: 'closed',
    description:
      'The Commission funds Niger Delta graduates through postgraduate study abroad, and law is on its published list of approved disciplines. Because eligibility turns on state of origin rather than on nationality alone, the field is a fraction of the size of the open-to-all schemes above, which is the whole point of it for anyone who qualifies.',
    eligibility: [
      'Indigene of one of the nine Niger Delta states: Abia, Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Imo, Ondo or Rivers. Nothing else on this list is a substitute',
      'A first degree from an accredited university, Second Class Upper or better for most routes',
      'Under 40 at the time of applying',
      'Admission already held for a postgraduate programme at a foreign university in an approved discipline, law included',
      'NYSC discharge or exemption certificate, and a local government identification letter',
    ],
    link: 'https://scholarship.nddc.gov.ng/',
  },

  /* Added 12 November 2026: five LLM awards from a post on X, each checked
   * against the school's own page before it went in.
   *
   *   NYU (both)   law.nyu.edu scholarships page, and the 2027 application
   *                instructions PDF for the 17 December 2026 deadline and the
   *                Hauser essay. Podell needs a World Bank low-income or
   *                lower-middle-income country; the World Bank API lists
   *                Nigeria as "Lower middle income" as of today.
   *   Georgetown   law.georgetown.edu scholarships page. The post called these
   *                "full-tuition scholarships", which is not what the page
   *                says: the automatic awards are partial, and full tuition
   *                goes to a small number of Alumni Scholars and about eight
   *                Tax Scholars. The description leads with that.
   *   Edinburgh    law.ed.ac.uk masters funding page. The post's "full-tuition
   *                LLM scholarship" is ONE award for ONE programme, so the
   *                title and the first line say so. Edinburgh's bigger award
   *                (GBP 21,250 with a stipend) is only for its own LLB students
   *                with Scottish fee status and is left out.
   *   McGill       mcgill.ca Law funding page. It gives both "January 1" and
   *                "by the deadline for application for admission", which the
   *                same page puts at 15 December. The earlier date leads, so
   *                nobody who goes by this misses it.
   *
   * ORDERED BY RELEVANCE, not by date, because the page keeps file order
   * inside each status: Podell is written for exactly this reader (a Nigerian
   * living in Nigeria who needs the whole cost covered), then Hauser (full
   * funding, open to every non-US law graduate), then Georgetown (every
   * admitted LL.M. is considered, though mostly for partial awards), then
   * McGill (real money, but only for human rights and legal pluralism
   * research), then Edinburgh (one award, one programme, fees only).
   *
   * Left out on purpose: the LSE "Demography Studentship" from a second post.
   * It is LSE's general PhD studentship, not an LLM award, and its funding
   * deadline is 13 January 2027, not the 27 May the post gave. */
  {
    slug: 'nyu-podell-global-graduate-legal-scholarship',
    closesOn: '2026-12-17',
    title: 'Podell Global Graduate Legal Scholarship',
    provider: 'New York University School of Law',
    logo: '/employer-logos/nyu-law.png',
    region: 'United States',
    level: 'LLM at NYU Law',
    funding: 'Tuition, reasonable living costs and one return economy flight to New York',
    deadline: 'Closes 17 December 2026 for LLM entry in fall 2027. You are considered through your NYU application',
    status: 'open',
    description:
      "One award a year, for an LLM student from a lower-income country who could not otherwise afford New York. It pays tuition, reasonable living costs such as rent and books, and one return flight. The World Bank classes Nigeria as lower-middle-income, so Nigerians who live in Nigeria qualify on that count. There is no separate form: you are considered when you file the NYU application, and finalists may be asked for financial documents for themselves and their immediate family.",
    eligibility: [
      'A citizen of Nigeria, or another World Bank low-income or lower-middle-income country, and living there',
      'Able to show financial need',
      'A record of superior academic merit',
      'Applying to the NYU LLM. Finalists may need to document their family finances',
    ],
    link: 'https://www.law.nyu.edu/graduateadmissions/scholarshipprograms/hauserglobalscholarsarthurtvanderbiltscholarshipsdeansgraduateawards',
  },
  {
    slug: 'nyu-hauser-global-scholarship',
    closesOn: '2026-12-17',
    title: 'Hauser Global Scholarship',
    provider: 'New York University School of Law',
    logo: '/employer-logos/nyu-law.png',
    region: 'United States',
    level: 'LLM at NYU Law',
    funding: 'Full tuition and a stipend for living costs such as rent and books',
    deadline: 'Closes 17 December 2026 for LLM entry in fall 2027. You apply with your NYU application',
    status: 'open',
    description:
      "NYU Law's top award for LLM students. About ten are given each year, on merit, to graduates of law schools outside the United States, so a Nigerian LL.B qualifies. It covers full tuition and a stipend towards rent, books and study materials. You apply for it inside the NYU LLM application, with one extra essay of 500 to 750 words, so the admission deadline is also the scholarship deadline. Expect a very strong field.",
    eligibility: [
      'A law degree from a law school outside the United States',
      'Applying to the full-time NYU LLM starting in fall 2027',
      'A separate essay of 500 to 750 words, attached to your admission application',
      'Chosen on intellectual and leadership ability',
    ],
    link: 'https://www.law.nyu.edu/graduateadmissions/scholarshipprograms/hauserglobalscholarsarthurtvanderbiltscholarshipsdeansgraduateawards',
  },
  {
    slug: 'georgetown-llm-scholarships',
    closesOn: '2027-02-05',
    title: 'Georgetown Law LL.M. Scholarships',
    provider: 'Georgetown University Law Center',
    logo: '/employer-logos/georgetown-law.png',
    region: 'United States',
    level: 'LL.M. at Georgetown Law',
    funding: 'Partial tuition for most. Full tuition for a small number of International LL.M. Alumni Scholars',
    deadline: 'Complete your application by 5 February 2027 to be considered. Specialised awards close earlier, on 8 January 2027',
    status: 'open',
    description:
      'Most of these cover part of the tuition, not all of it, so plan with that in mind. Every admitted LL.M. student is considered automatically for a partial award. Full tuition is rarer: the new International LL.M. Alumni Scholarships go to a small number of international students with a strong academic or professional record in transnational practice, and about eight Graduate Tax Scholarships go to students on the full-time Taxation LL.M. If you want a specialised award like the tax one, have your application complete by 8 January 2027.',
    eligibility: [
      'Admitted to a Georgetown Law LL.M. There is no separate form for the general awards',
      'For full tuition: a strong academic or professional record in transnational legal practice',
      'Graduate Tax Scholarships are only for the full-time on-campus Taxation LL.M.',
      'A complete application by 5 February 2027, or by 8 January 2027 for specialised awards',
    ],
    link: 'https://www.law.georgetown.edu/admissions-aid/graduate-admissions/scholarships-fellowships/',
  },
  {
    slug: 'mcgill-obrien-graduate-fellowship',
    closesOn: '2026-12-15',
    title: "McGill O'Brien Graduate Fellowship",
    provider: 'Faculty of Law, McGill University',
    logo: '/employer-logos/mcgill.png',
    region: 'Canada',
    level: 'LLM at McGill, researching human rights and legal pluralism',
    funding: 'Up to 25,000 Canadian dollars for one year of the LLM',
    deadline: 'Send it with your LLM application by 15 December 2026. McGill also lists 1 January, so 15 December is the safe date',
    status: 'open',
    description:
      "A research fellowship rather than a fee waiver: up to 25,000 Canadian dollars for a year of the LLM, for students whose research is in human rights and legal pluralism. It is open to every nationality and has no age limit. You email a short application form to the Faculty's Graduate Studies Office along with your LLM application, and fellows join McGill's Centre for Human Rights and Legal Pluralism. Selection turns on academic excellence, how original your proposed research is, and whether the Faculty has someone to supervise it.",
    eligibility: [
      "Registered in McGill's LLM in the year of the award",
      'Research in human rights and legal pluralism',
      'An outstanding academic record. No restriction by citizenship or age',
      'Application form emailed to the Graduate Studies Office (grad.law@mcgill.ca) with your admission application',
    ],
    link: 'https://www.mcgill.ca/law/grad-studies/tuition-and-financial-support/funding-and-entrance-fellowships',
  },
  {
    slug: 'edinburgh-llm-european-transnational-law-scholarship',
    closesOn: '2027-04-30',
    title: 'Edinburgh LLM European and Transnational Law Scholarship',
    provider: 'Edinburgh Law School, University of Edinburgh',
    logo: '/employer-logos/edinburgh-law.png',
    region: 'United Kingdom',
    level: 'Full-time LLM in European Law at Edinburgh, starting 2027-28',
    funding: 'Full tuition at the Home or International rate, for one student. Fees only',
    deadline: 'Closes 30 April 2027 for the 2027-28 academic year',
    status: 'open',
    description:
      "One award, for one programme. It pays the full tuition fee, at the international rate if that is what you pay, for a student on Edinburgh's full-time LLM in European Law. It does not cover living costs. Apply to the LLM first, then apply for the scholarship with a personal statement; it is judged on that statement and your academic merit. If European law is not your field, this one is not for you.",
    eligibility: [
      'Accepted onto the full-time LLM in European Law starting in 2027-28',
      'You must apply to the LLM before applying for the scholarship',
      'Judged on academic merit and a personal statement',
      'Covers tuition only, not living costs',
    ],
    link: 'https://www.law.ed.ac.uk/study/masters-degrees/scholarships-funding',
  },

]

/**
 * The date out of a free-text deadline, or null when there is not an
 * unambiguous one.
 *
 * MOVED HERE FROM lib/notifications.ts, which is where it was written and is
 * not where it belongs: a scholarship deadline is a fact about a scholarship,
 * and the bell was simply the first thing that needed to read one. The email
 * needs the same answer now, and two parsers that disagree about what "Closes
 * 27 August 2026 for entry in October 2027" means is a worse outcome than one
 * import. notifications.ts re-exports it so nothing that used it there breaks.
 *
 * Deliberately returns null rather than guessing. "Tied to the LSE graduate
 * financial support deadline, usually late April" has no date in it, and a
 * parser that invented one would put a scholarship in a closing-soon list on
 * the strength of a guess.
 */
export function parseDeadline(text: string): Date | null {
  const m = text.match(
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
  )
  if (!m) return null
  const d = new Date(`${m[1]} ${m[2]} ${m[3]} 00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Whole days until a scholarship's deadline. Negative once it has passed.
 *  Calendar days in the site's timezone, for the reason lib/day.ts sets out. */
export function daysUntilDeadline(s: Scholarship, now = new Date()): number | null {
  const d = parseDeadline(s.deadline)
  if (!d) return null
  return daysUntilDay(d.toISOString().slice(0, 10), now)
}

/**
 * Open scholarships closing inside `withinDays`, soonest first.
 *
 * ⚠ 'open' ONLY, AND THAT IS THE WHOLE FILTER THAT MATTERS. An 'upcoming'
 * scholarship has a date in this window sometimes — the Mastercard Foundation
 * entry's first information session is one — and telling somebody it is
 * "closing in 22 days" would be false twice over: it is not closing, and they
 * could not act on it if it were. A closed one is worse still.
 *
 * Read by the bell and by the announcement email so the two cannot disagree
 * about what is closing, which is the same reason ClosingSoon.tsx exports
 * `closingSoon()` for the jobs side.
 */
export function closingScholarships(withinDays: number, now = new Date()): Scholarship[] {
  return allScholarships(now).filter(s => {
    if (s.status !== 'open') return false
    const days = daysUntilDeadline(s, now)
    return days !== null && days >= 0 && days <= withinDays
  }).sort((a, b) => (daysUntilDeadline(a, now) ?? 0) - (daysUntilDeadline(b, now) ?? 0))
}

export { closesInWords } from './day'

/**
 * The status of a scholarship right now, derived from its dates.
 *
 * ⚠ THE STORED `status` FIELD WAS A SNAPSHOT OF WHOEVER LAST EDITED THIS FILE.
 * It is typed by hand, so an entry marked 'upcoming' stayed upcoming until a
 * person remembered it and shipped a deploy. The Commonwealth Master's opens on
 * 8 September; nothing anywhere would have noticed, and the page would have
 * gone on telling people they could not yet apply for something they could.
 * That is the one thing a scholarships page must not get wrong.
 *
 * ORDER MATTERS AND CLOSED WINS. A cycle that has opened and then closed
 * satisfies both tests, so closed is checked first. Reversed, an expired award
 * would advertise itself as open for the rest of the year.
 *
 * FALLS BACK TO THE STORED VALUE RATHER THAN GUESSING. Four entries publish no
 * usable date at all: Gates and Clarendon open "December 2026 or January 2027,
 * set by your course", Margaret Bennett is tied to a deadline LSE calls "usually
 * late April", and Queen Elizabeth Commonwealth runs "two cycles yearly". For
 * those the hand-typed status is the best information there is, and inventing a
 * date to make the machinery apply would replace a known judgement with a
 * fabrication.
 *
 * The site's timezone, not the server's. See lib/day.ts: a window that opens on
 * the 8th opens on the 8th in Lagos, and for the hour before midnight UTC those
 * are different days.
 */
export function statusOf(s: Scholarship, now: Date = new Date()): ScholarshipStatus {
  if (s.closesOn && hasPassed(s.closesOn, now)) return 'closed'
  if (s.opensOn) {
    const until = daysUntilDay(s.opensOn, now)
    if (until !== null) return until > 0 ? 'upcoming' : 'open'
  }
  return s.status
}

/**
 * Every scholarship, with `status` resolved for the moment it is asked for.
 *
 * ⚠ A FUNCTION, NOT A CONSTANT, AND THAT IS THE WHOLE POINT. An exported array
 * is evaluated once when the module is first imported, so a derived status
 * baked into it would freeze at the same instant the old hand-typed one did and
 * nothing would have been fixed. Callers ask when they need to know.
 *
 * `ALL_SCHOLARSHIPS` is deliberately NOT exported any more. Anything still
 * importing it would have compiled fine and read a stale status forever, which
 * is exactly the failure being removed.
 */
export function allScholarships(now: Date = new Date()): Scholarship[] {
  return SCHOLARSHIPS.map(s => ({ ...s, status: statusOf(s, now) }))
}

/**
 * One scholarship by slug, with its status resolved for the moment it is asked
 * for.
 *
 * ⚠ GOES THROUGH allScholarships RATHER THAN READING THE ARRAY. The raw
 * SCHOLARSHIPS array still carries the hand-typed `status`, and a detail page
 * reading it directly would be the exact regression the note on allScholarships
 * describes: one page saying "Upcoming" while the board beside it says "Open",
 * for the same award on the same afternoon. Every reader of this data resolves
 * status the same way or none of them can be trusted.
 *
 * Returns undefined for an unknown slug so the caller can notFound() rather
 * than render a page about nothing.
 */
export function scholarshipBySlug(slug: string, now: Date = new Date()): Scholarship | undefined {
  return allScholarships(now).find(s => s.slug === slug)
}

/**
 * Every slug, for generateStaticParams.
 *
 * Reads the raw array deliberately: this answers "what pages exist", which is a
 * question about the file rather than about today. A closed scholarship still
 * needs its page built, because a link to it may be years old and a 404 is a
 * worse answer than "this closed".
 */
export function scholarshipSlugs(): string[] {
  return SCHOLARSHIPS.map(s => s.slug)
}

