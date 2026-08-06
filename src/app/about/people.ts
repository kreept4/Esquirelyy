/**
 * The people on the about page.
 *
 * `linkedin` is optional and holds a full profile URL. A card renders the
 * LinkedIn mark and becomes clickable only when one is present.
 *
 * These are left empty deliberately rather than filled from a web search.
 * Every name here belongs to a real person, and the searches returned several
 * plausible profiles for each without a way to tell them apart — a Boluwatife
 * Ogunleye who is a student at Babcock, an Oreoluwa Adeyemi at Lagos State
 * Government, an Oreoluwa Adeyemi at Interswitch. Guessing wrong would publish
 * a stranger's profile as a co-founder or an ambassador of this company, which
 * is a worse outcome than a card with no link on it.
 *
 * Paste the real URLs in and the marks appear.
 */

export type Person = {
  name: string
  role: string
  linkedin?: string
}

export const TEAM: Person[] = [
  { name: 'OGUNLEYE BOLUWATIFE, ESQ.', role: 'Co-founder', linkedin: '' },
  { name: 'OGUNLEYE IPINUOLUWA', role: 'Co-founder', linkedin: '' },
  { name: 'ADEYEMI OREOLUWA, ESQ.', role: 'Creative designer', linkedin: '' },
]

export const AMBASSADORS: Person[] = [
  { name: 'OFOMIYONWON AYOTOMIDE, ESQ.', role: 'Honorary ambassador', linkedin: '' },
  { name: 'ADEPOYIGI MOFEYINTOLUWA, ESQ.', role: 'Honorary ambassador', linkedin: '' },
  { name: 'ENIKUOMEHIN FADERERA, ESQ.', role: 'Honorary ambassador', linkedin: '' },
  { name: 'FOWOWE ADETOMIWA, ESQ.', role: 'Honorary ambassador', linkedin: '' },
]
