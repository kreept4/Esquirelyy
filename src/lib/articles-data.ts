/**
 * Articles, written by people who are not us.
 *
 * ============================================================
 * WHY THIS IS A FILE AND NOT A TABLE
 * ============================================================
 *
 * Every other reader-facing surface on this site splits the same way: jobs and
 * opportunities live in Supabase because they arrive constantly and expire;
 * firms, scholarships and news live in TypeScript because they are researched,
 * edited, and change when somebody decides they should.
 *
 * An article is the second kind, and the file buys the editorial gate for free.
 * Contributions are invited rather than submitted, so there is no queue to
 * moderate, no admin screen to build, no row-level policy to get wrong, and no
 * route that accepts prose from the internet. Approval IS the commit: nothing
 * reaches a reader that nobody read first.
 *
 * ⚠ WHEN TO MOVE IT. The moment articles arrive faster than they can be pasted
 * in, or somebody other than the founders needs to publish one. Not before. A
 * submissions table with a moderation queue is a genuinely large amount of
 * surface, and most of it exists to solve a problem an invite list does not
 * have.
 *
 * ============================================================
 * ⚠ THE BODY IS PARAGRAPHS, NOT MARKUP, AND THAT IS A SECURITY DECISION
 * ============================================================
 *
 * `body` is an array of plain strings, rendered one per <p>. There is no
 * markdown parser and nothing anywhere near dangerouslySetInnerHTML.
 *
 * This is contributor-written text. The whole point of the section is that
 * people outside the company write it, so the one thing the renderer must not
 * do is execute what they send. Paragraphs of plain text cannot carry a script
 * tag, an onerror attribute or an iframe, because React escapes every string it
 * renders. The cost is that an author cannot bold a word, and that is a very
 * cheap price for removing an entire class of vulnerability from a surface
 * built to accept outside writing.
 *
 * If formatting is ever genuinely needed, the answer is a small allow-list of
 * structural fields, not raw HTML.
 *
 * ============================================================
 * WHAT BELONGS HERE
 * ============================================================
 *
 * Substantive writing about Nigerian law. An area that is not getting enough
 * attention, a change most people have not caught up with, a subject the writer
 * knows well set out plainly for somebody who does not.
 *
 * ⚠ THIS REPLACES AN EARLIER RULE THAT SAID THE OPPOSITE, so ignore any copy
 * still written to it. The section was first built for first-hand careers
 * accounts, how a firm's assessment centre runs and what a Law School term
 * costs, with general legal commentary explicitly excluded. Bolu overruled that
 * on 2026-09-23: this is for lawyers and law students writing about the areas of
 * law that need to be talked about. A careers account is not banned, but it is
 * no longer the brief.
 *
 * The test that survives the change is the reader's. Could somebody who is not
 * a specialist in the subject come away understanding it. A piece written for
 * the approval of people who already agree fails that however correct it is.
 *
 * ⚠ AND NOTHING THAT READS AS LEGAL ADVICE, WHICH MATTERS MORE UNDER THIS
 * BRIEF THAN THE OLD ONE. An account of what a process felt like could hardly
 * be mistaken for advice. Writing about what the law is can be, and it goes up
 * under Esquirely's masthead written by law students and junior lawyers.
 * Explaining a rule is commentary. Telling a reader what to do about their own
 * situation is not, and does not publish whatever else is good about it.
 */

export type ArticleAuthor = {
  /** As they want to be credited. Natural case, not the shouting on /about. */
  name: string
  /**
   * What they were when they wrote it: "Final year, University of Benin",
   * "Associate, Dispute Resolution". This is the byline's whole value to the
   * reader and to the writer, so it is required rather than optional.
   */
  affiliation: string
  /** Optional, and only ever a URL the author supplied themselves. */
  linkedin?: string
  /**
   * The writer's photograph, served from our own domain.
   *
   * ⚠ NOT A LINKEDIN URL, for the reason recorded on the same field in
   * about/people.ts: LinkedIn answers automated requests with 999 so the image
   * address cannot be read off a profile, and the CDN URLs it hands a browser
   * are signed and expire. A photograph on a page about a real person that
   * works today and breaks in a month is worse than none. Save it, put it in
   * public/writers/, point at it here.
   */
  image?: string
  /**
   * Where they work, as free text, matched against the directory.
   *
   * ⚠ THE FIRM'S OWN MARK IS THE POINT OF THIS FIELD. A piece by an associate
   * at a firm in our directory carries that firm's logo beside the byline, and
   * that is worth more to both sides than the firm name in text: the reader
   * places the writer instantly, and the writer's employer is visibly attached
   * to something they wrote well.
   *
   * ⚠ RESOLVED THROUGH firmForEmployer, NOT STORED AS A SLUG OR A PATH. That
   * is the same matcher the logo lookup, the job board and the firm pages use,
   * so a writer's firm resolves exactly as an employer on a listing does and
   * the two cannot disagree. A firm outside the directory simply gets no mark,
   * which is the honest outcome rather than a broken image.
   */
  firm?: string
}

export type Article = {
  slug: string
  title: string
  /** One sentence for the index and the meta description. */
  summary: string
  author: ArticleAuthor
  /** ISO date. What the reader sees and what sorts the list. */
  publishedOn: string
  /**
   * Plain paragraphs. See the note above on why there is no markup here.
   * Empty or absent means the piece is not finished, and it does not publish.
   */
  body: string[]
  /**
   * ⚠ DRAFTS LIVE IN THIS FILE AND DO NOT REACH A READER. A piece can sit here
   * being edited without anybody seeing it, which is the point of an editorial
   * gate: the alternative is a separate place for unfinished work, and work in
   * two places is work that gets lost.
   */
  status: 'draft' | 'published'
}

/**
 * Every article, in no particular order. `publishedArticles` sorts them.
 *
 * ⚠ EMPTY ON PURPOSE AS THIS SHIPS. The section is built and renders nothing
 * until a real piece is in it, which is the same rule /about/[person] follows
 * and for the same reason: a section opening with placeholder writing announces
 * that nobody is writing. Paste a real article in and it appears.
 */
export const ARTICLES: Article[] = []

/** Published pieces, newest first. The only list any page should render. */
export function publishedArticles(): Article[] {
  return ARTICLES.filter(a => a.status === 'published' && a.body.some(p => p.trim()))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
}

export function articleBySlug(slug: string): Article | undefined {
  return publishedArticles().find(a => a.slug === slug)
}

/** "23 September 2026", the format the rest of the site uses for a long date. */
export function articleDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/**
 * Roughly how long it takes to read, in minutes.
 *
 * 200 words a minute, rounded up, floor of one. Not precision, and it does not
 * pretend to be: it exists so a reader can tell a two-minute note from a ten
 * minute piece before committing, which is the only question the number
 * answers.
 */
export function readingMinutes(a: Article): number {
  const words = a.body.join(' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
