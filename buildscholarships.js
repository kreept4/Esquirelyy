const fs = require('fs');

fs.mkdirSync('src/lib', { recursive: true });

fs.writeFileSync('src/lib/scholarships-data.ts', `export interface Scholarship {
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

export const ALL_SCHOLARSHIPS: Scholarship[] = [
  {
    slug: 'chevening-scholarship',
    title: 'Chevening Scholarship',
    provider: 'UK Foreign, Commonwealth and Development Office',
    region: 'United Kingdom',
    level: "Master's degree",
    funding: 'Full tuition, travel, and living expenses',
    deadline: 'Applications for 2027/2028 open August 2026',
    status: 'upcoming',
    description: 'A fully funded one year master\\'s degree at any UK university for emerging leaders. Chevening has supported hundreds of Nigerian lawyers, civil servants, and professionals since 1983.',
    eligibility: [
      'Nigerian citizen with at least two years of work experience',
      'Strong academic record and leadership potential',
      'Must apply to three eligible UK university courses',
      'Commitment to return to Nigeria for at least two years after the programme',
    ],
    link: 'https://www.chevening.org/apply/',
  },
  {
    slug: 'commonwealth-scholarship',
    title: 'Commonwealth Scholarship and Fellowship Plan',
    provider: 'Commonwealth Scholarship Commission (UK)',
    region: 'United Kingdom',
    level: "Master's and PhD",
    funding: 'Full tuition, airfare, and monthly stipend',
    deadline: 'Check cscuk.fcdo.gov.uk for current cycle dates',
    status: 'open',
    description: 'Supports outstanding students from Commonwealth countries, including Nigeria, to pursue postgraduate study in the UK. Covers tuition, travel, and a living allowance for the full duration of the programme.',
    eligibility: [
      'Citizen of Nigeria or another eligible Commonwealth country',
      'First degree of at least second class upper division for Master\\'s candidates',
      'NYSC discharge or exemption certificate',
      'At least one unconditional admission offer from a UK university',
    ],
    link: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
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
    description: 'A two year fully funded master\\'s programme hosted in select low and middle income Commonwealth countries, designed for students committed to driving change in their communities.',
    eligibility: [
      'Citizen of an eligible Commonwealth country, including Nigeria',
      'Demonstrated commitment to community impact',
      'Strong academic record',
    ],
    link: 'https://www.acu.ac.uk/our-work/queen-elizabeth-commonwealth-scholarships/',
  },
  {
    slug: 'nigerian-law-school-scholarship',
    title: 'Nigerian Law School Scholarship Programme',
    provider: 'Law Et Al, in honour of Obi Akumazi Esq',
    region: 'Nigeria',
    level: 'Nigerian Law School',
    funding: 'Tuition, materials, and accommodation support',
    deadline: 'Opens January, ahead of the academic year intake',
    status: 'open',
    description: 'Created to ease the financial pressure of Law School for Nigerian students about to take the final step before qualifying as legal practitioners. Covers core costs so candidates can focus on the bar finals.',
    eligibility: [
      'Nigerian citizen admitted into the Nigerian Law School',
      'Demonstrated financial need',
      'Strong academic standing from university',
    ],
    link: 'https://lawetal.com/',
  },
]
`);

console.log('data file done');