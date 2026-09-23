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
 * Things only the writer knows. What the NYSC posting process is actually like,
 * how a particular firm's assessment centre runs, what a Law School term really
 * costs this year, what a clerkship at a particular court involves day to day.
 *
 * NOT general legal commentary. There is a great deal of that already, it
 * competes with established Nigerian legal blogs on their own ground, and
 * nobody arrives at a careers platform looking for a case note. The test is the
 * same one the job board uses: could a reader act differently tomorrow having
 * read it.
 *
 * ⚠ AND NOTHING THAT READS AS LEGAL ADVICE. Everything here is written by law
 * students and junior lawyers under Esquirely's masthead, which is exactly the
 * combination that turns a confident paragraph into a liability. An article
 * describing what a process was like is reporting. An article telling a reader
 * what they should do about their own legal situation is not, and does not go
 * up whatever else is good about it.
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
