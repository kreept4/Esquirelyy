/**
 * The people on the about page.
 *
 * `linkedin` is optional and holds a full profile URL. A card renders the
 * LinkedIn mark and becomes clickable only when one is present.
 *
 * The rest are left empty deliberately rather than filled from a web search.
 * Every name here belongs to a real person, and the searches returned several
 * plausible profiles for each without a way to tell them apart: a Boluwatife
 * Ogunleye who is a student at Babcock, an Oreoluwa Adeyemi at Lagos State
 * Government, an Oreoluwa Adeyemi at Interswitch. Guessing wrong would publish
 * a stranger's profile as a co-founder or an ambassador of this company, which
 * is a worse outcome than a card with no link on it.
 *
 * ⚠ THE TWO CO-FOUNDER URLS ARE FILLED AND THE REST ARE NOT, and the
 * difference is where they came from. These two were given by the founders.
 * Nothing here was resolved from a search, and the bar has not moved: paste a
 * real URL in and the mark appears, or leave it empty.
 *
 * They are also the same two URLs carried as `sameAs` on the Person entities in
 * components/seo/JsonLd.tsx. A visible link a reader can follow and a machine
 * readable assertion of the same fact are different jobs, and both are wanted.
 */

export type Person = {
  name: string
  role: string
  linkedin?: string
}

export const TEAM: Person[] = [
  { name: 'OGUNLEYE BOLUWATIFE, ESQ.', role: 'Co-founder', linkedin: 'https://www.linkedin.com/in/ogunleye-boluwatife-aicmc-acarb-8437051a9/' },
  { name: 'OGUNLEYE IPINUOLUWA', role: 'Co-founder', linkedin: 'https://www.linkedin.com/in/ipinuoluwa-ogunleye-aicmc-acarb-2064ba22b/' },
  { name: 'ADEYEMI OREOLUWA, ESQ.', role: 'Creative designer', linkedin: '' },
]

export const AMBASSADORS: Person[] = [
  { name: 'OFOMIYONWON AYOTOMIDE, ESQ.', role: 'Honorary ambassador', linkedin: '' },
  { name: 'ADEPOYIGI MOFEYINTOLUWA, ESQ.', role: 'Honorary ambassador', linkedin: '' },
  { name: 'ENIKUOMEHIN FADERERA, ESQ.', role: 'Honorary ambassador', linkedin: '' },
  { name: 'FOWOWE ADETOMIWA, ESQ.', role: 'Honorary ambassador', linkedin: '' },
  { name: 'OLUWATENIOLA OLUWATUNMISE, ESQ.', role: 'Honorary ambassador', linkedin: '' },
]
