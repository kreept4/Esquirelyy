/**
 * The people on the about page.
 *
 * `linkedin` is optional and holds a full profile URL. A card renders the
 * LinkedIn mark and becomes clickable only when one is present.
 *
 * Only the creative designer is left empty now. The rest were supplied by the
 * founders rather than found, which is the bar this file has always set.
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
  /**
   * URL segment for this person's own page, under /about/.
   *
   * Stable and hand written rather than derived from `name`. The names here are
   * stored surname first and in capitals, so a derived slug would read
   * /about/ogunleye-boluwatife-esq, and it would change the day somebody fixes
   * a spelling. A person's URL should outlive an edit to their name.
   */
  slug?: string
  /**
   * A photograph, served from our own domain.
   *
   * ⚠ NOT A LINKEDIN URL, AND IT CANNOT BE ONE. LinkedIn answers automated
   * requests with 999, so the image address cannot be read off a profile in the
   * first place, and the CDN URLs it hands a browser are signed and expire.
   * Hotlinking one would put a photograph on the page that works the day it
   * ships and is a broken image a few weeks later, on a page about a real
   * person.
   *
   * So the file lives in public/people/ and this holds its path. Save the photo
   * from the profile, drop it in, name it for the slug.
   *
   * ⚠ AND IT IS THEIR PHOTOGRAPH. Consent to appear on the about page is not
   * the same as consent to a headshot on a page of their own, and it is cheap
   * to ask. Left empty for anyone who has not been asked.
   */
  image?: string
  /**
   * A few sentences in their own right.
   *
   * ⚠ NO BIO, NO PAGE. about/[person] builds its params from the people who
   * have one, so a person with an empty bio simply has no page and their card
   * stays a card. That is deliberate: two or three near-identical pages saying
   * only "co-founder of Esquirely" would rank worse than none and read as
   * filler on a site whose whole claim is that everything on it was checked.
   *
   * Written by or with the person. Nothing here is inferred from a profile.
   */
  bio?: string
}

export const TEAM: Person[] = [
  { name: 'OGUNLEYE BOLUWATIFE, ESQ.', role: 'Co-founder', linkedin: 'https://www.linkedin.com/in/ogunleye-boluwatife-aicmc-acarb-8437051a9/', slug: 'boluwatife-ogunleye' },
  { name: 'OGUNLEYE IPINUOLUWA', role: 'Co-founder', linkedin: 'https://www.linkedin.com/in/ipinuoluwa-ogunleye-aicmc-acarb-2064ba22b/', slug: 'ipinuoluwa-ogunleye' },
  { name: 'ADEYEMI OREOLUWA, ESQ.', role: 'Creative designer', linkedin: '', slug: 'oreoluwa-adeyemi' },
]

/**
 * ⚠ THREE OF THESE FIVE URLS MATCH THE STORED NAME EXACTLY AND TWO DO NOT.
 * All five were supplied by Bolu, which is the confirmation this file asks for,
 * so all five are in. The two variances are written down rather than quietly
 * absorbed, because the next person to notice them should not have to work out
 * whether the name or the link is the wrong half.
 *
 * OFOMIYONWON is the one worth a second look. The stored given name is
 * Ayotomide and the profile reads Oluwatimileyin. The surname is distinctive
 * and the account on the mailing list for this person is timofomiyonwon@, where
 * "tim" is Oluwatimileyin, so the profile is corroborated twice over and it is
 * the STORED NAME that is most likely wrong or incomplete. Left as supplied
 * until somebody asks them, because correcting a real person's name on their
 * own say-so is not something to guess at either.
 *
 * ADEPOYIGI is a spelling variance only: MofeYintoluwa here, mofeHintoluwa in
 * the profile slug. Same person, one letter.
 *
 * OLUWATENIOLA resolves cleanly once you know "Teni" is the short form, and the
 * mailing list carries tenioluwatumise@ for the same person.
 */
export const AMBASSADORS: Person[] = [
  { name: 'OFOMIYONWON AYOTOMIDE, ESQ.', role: 'Honorary ambassador', linkedin: 'https://www.linkedin.com/in/oluwatimileyin-ofomiyonwon-o-o-a-acarb-897165304/', slug: 'ofomiyonwon-ayotomide' },
  { name: 'ADEPOYIGI MOFEYINTOLUWA, ESQ.', role: 'Honorary ambassador', linkedin: 'https://www.linkedin.com/in/mofehintoluwaadepoyigi/', slug: 'adepoyigi-mofeyintoluwa' },
  { name: 'ENIKUOMEHIN FADERERA, ESQ.', role: 'Honorary ambassador', linkedin: 'https://www.linkedin.com/in/fadereraenikuomehin/', slug: 'enikuomehin-faderera' },
  { name: 'FOWOWE ADETOMIWA, ESQ.', role: 'Honorary ambassador', linkedin: 'https://www.linkedin.com/in/fowowe-adetomiwa/', slug: 'fowowe-adetomiwa' },
  { name: 'OLUWATENIOLA OLUWATUNMISE, ESQ.', role: 'Honorary ambassador', linkedin: 'https://www.linkedin.com/in/teni-oluwatumise-b574611a9/', slug: 'oluwateniola-oluwatunmise' },
]
