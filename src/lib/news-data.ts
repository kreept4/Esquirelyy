/**
 * Headlines, product updates and tips for the homepage carousel and /news.
 *
 * Kept as a typed file in the repo rather than a Supabase table, deliberately.
 * The homepage is statically generated on an hourly revalidate, so a file is
 * baked in at build time and costs nothing at runtime, where a table would add
 * a query to a page that currently makes exactly one. Volume here is a handful
 * of items a month, which does not pay for a table plus the admin screen it
 * would need to be usable. And the tip slides state things about named firms,
 * which ought to go through a commit rather than be pasteable into a row.
 *
 * If that stops being true, `getNewsItems()` is the only thing a Supabase move
 * has to replace; nothing else imports the array.
 */

import { ALL_FIRMS } from '@/lib/firms-data'
import { NEW_ROLES, NEW_ROLES_COUNT, NEW_ROLES_HREF } from './new-roles'

export type NewsKind = 'update' | 'tip' | 'news'

/**
 * Optional artwork for a slide.
 *
 * Deliberately narrow. Press photographs of, say, an NBA election are owned by
 * the outlets that took them, and Nigeria has fair dealing on a closed list
 * rather than fair use, so lifting one for a homepage carousel is infringement
 * whatever the intent. Only two sources are allowed here:
 *
 * `logos` renders firm marks already in the directory, which is the same
 * editorial use they are shown under everywhere else on the site.
 *
 * `image` points at something in /public that we control: the recoloured
 * Storyset illustrations, or artwork we commission. It is not an escape hatch
 * for a hotlinked press photo.
 */
export type NewsMedia =
  | { type: 'logos'; slugs: string[] }
  | { type: 'image'; src: string; alt: string }
  /**
   * A photograph, bled to the edge of the panel rather than sat on a plate.
   *
   * `credit` is required, not optional, and it is rendered. A photograph of a
   * real person reporting a real event is the one case where artwork carries a
   * third party's rights, and the fair dealing that covers reporting current
   * events under the Copyright Act 2022 expects sufficient acknowledgement.
   * Making the field mandatory means a photo cannot be added without someone
   * deciding what the credit says.
   */
  | { type: 'photo'; src: string; alt: string; credit: string }

export interface NewsItem {
  slug: string
  kind: NewsKind
  /** ISO date. Sorts the list and prints on the news page. */
  date: string
  title: string
  /** One or two sentences. This is what the carousel shows. */
  summary: string
  /** Optional destination. Internal paths get a router link, external a new tab. */
  href?: string
  cta?: string
  /** Optional. A slide reads perfectly well without one. */
  media?: NewsMedia
}

/** Label shown on a slide. Kept here so the carousel and the news page agree. */
export const KIND_LABEL: Record<NewsKind, string> = {
  update: "What's new",
  tip: 'Did you know',
  news: 'In the news',
}

/**
 * Newest first is enforced by getNewsItems(), so entries can be added anywhere.
 *
 * Only put something in `news` when there is a real, checkable story behind it.
 * An invented headline on a careers platform is worse than an empty carousel:
 * students act on this.
 *
 * Order is free. Every slide is drawn on carton now, so position no longer
 * decides a palette and nothing has to be re-baked after a reorder.
 */
const ITEMS: NewsItem[] = [
  {
    /* The current drop. Slugs, count and employers all come from
       lib/new-roles.ts, which the notification bell and the announcement email
       also read, so a slide promising two roles and a board filtering to three
       is not a state this can reach.

       The artwork is reusable on purpose. It shows entries being added rather
       than anything about these two firms, so the next drop inherits it by
       changing lib/new-roles.ts and nothing else. A slide illustrated with
       something specific to Babalakin or Zyph would have to be redrawn or
       dropped the moment the roles changed. */
    slug: 'new-roles-2026-08-10d',
    kind: 'update',
    date: NEW_ROLES.at.slice(0, 10),
    title: `${NEW_ROLES_COUNT} new roles on the board`,
    summary:
      'Babalakin & Co want a senior associate for energy and extractive industries. Zyph Legal are hiring a fully remote associate, open to lawyers just called. Pentagon Partners are taking associates into governance, risk and compliance, from one to ten years post call. Ovie Obobolo & Co want an associate with one to two years post-call, in Yaba. Greenberg Traurig London have opened training contract applications for the 2029 intake. All five checked against the employer’s own notice.',
    href: NEW_ROLES_HREF,
    cta: 'Show me the new roles',
    /* Empty alt, like the rankings slide. The illustration is decoration beside
       a headline that already says everything it depicts, so describing it to a
       screen reader would only repeat the sentence next to it. */
    media: { type: 'image', src: '/illustrations/new-entries.svg', alt: '' },
  },
  {
    slug: 'firm-rankings',
    kind: 'update',
    date: '2026-08-08',
    /* Counted off the table, like the directory total below it, because this
       number moves every time someone reads another guide page.

       THE CLAIM IS DELIBERATELY NOT "WE RANK FIRMS". We do not, and a careers
       site that appeared to would be worth less, not more: the whole reason a
       band means anything is that the guides research it by interviewing a
       firm's clients and its opponents, so nobody — including us — can place
       themselves in one. The slide says whose rankings these are twice, in the
       title and again in the last line, because that is the sentence a student
       needs to weigh the badge and it is the one a skimmed slide would drop. */
    /* Counted off ALL_FIRMS, not off Object.keys(FIRM_RANKINGS).
       Those two numbers are the same today and are not guaranteed to be. The
       rankings table is keyed by slug and, by its own design, a slug in it that
       matches no firm is ignored rather than throwing, so a single typo would
       silently inflate this headline while the badge it promises appears
       nowhere. Counting the firms that actually resolve a ranking means the
       number can only ever describe badges a reader can go and find. */
    title: `Independent rankings on ${ALL_FIRMS.filter(f => f.rankings).length} firms`,
    summary:
      'Chambers, IFLR1000 and The Legal 500 EMEA, 2026 editions, read and put on the profiles: the band, the edition, and the practice areas it was earned in. We do not rank firms ourselves, and no firm can pay its way into any of the three.',
    href: '/firms',
    cta: 'See who is ranked',
    media: { type: 'image', src: '/illustrations/rankings.png', alt: '' }
  },
  {
    slug: 'nba-president-elect-2026',
    kind: 'news',
    date: '2026-08-06',
    /* Checked against Punch, Daily Post, The Nation and Tribune, which agree on
     * the name, the margin and the swearing-in date. Deliberately states the
     * result and nothing further: several outlets also report a dispute around
     * the election, and characterising that is not this carousel's job. */
    title: 'Badejo-Okusanya SAN elected NBA President',
    summary:
      'Oyinkansola Badejo-Okusanya SAN takes 47 per cent of the vote to become only the second woman to lead the Nigerian Bar Association, after Priscilla Kuye in 1991. She is sworn in as the 33rd President on 21 August for a two-year term.',
    href: 'https://punchng.com/full-list-winners-of-2026-nba-elections/',
    cta: 'Full list of winners',
    media: {
      type: 'photo',
      src: '/news/badejo-okusanya.jpg',
      alt: 'Oyinkansola Badejo-Okusanya SAN',
      credit: 'The Unknown Nigeria',
    },
  },
  {
    slug: 'virtual-internships',
    kind: 'tip',
    date: '2026-08-06',
    /* Supplied by the Esquirely team from direct knowledge of both firms. It
     * names two firms and students outside Lagos will act on it, so if either
     * arrangement changes this is the first slide to pull. */
    title: 'Distance is not a barrier',
    summary:
      'Omaplex and Lekan Bamidele & Co both run virtual internships, so you can intern from anywhere in Nigeria. If you are not in Lagos or Abuja, start there.',
    href: '/firms',
    cta: 'See both firms',
    media: { type: 'logos', slugs: ['omaplex', 'lekan-bamidele'] }
  },
  {
    /* Slug no longer carries the count. It was 'directory-at-44', which meant
       the URL went stale the moment a firm was added, and the card was still
       advertising 44 with 47 in the directory. */
    slug: 'firms-directory',
    kind: 'update',
    date: '2026-08-08',
    /* Counted, never typed. This is the only number on the site that changes
       every time someone edits a different file, so hardcoding it guarantees it
       is wrong again within a week. */
    title: `${ALL_FIRMS.length} firms in the directory`,
    /* The rankings sentence that used to close this summary has moved to the
       slide of its own above. Two cards in one rotation making the same
       announcement is how a carousel starts reading as filler. */
    summary:
      'Every profile carries the practice areas, the real office addresses and the address to write to. So you can write to a firm directly instead of waiting for it to advertise.',
    href: '/firms',
    cta: 'Browse the firms directory',
    media: {
      type: 'logos',
      slugs: [
        'doa-law',
        'paul-usoro',
        'sofunde-osakwe',
        'the-new-practice',
        'odujinrin-adefulu',
        'pavestones',
        'alliance-law-firm',
        'dd-dodo',
      ],
    }
  },
  {
    slug: 'speculative-applications',
    kind: 'tip',
    date: '2026-08-05',
    title: 'Most internships are never advertised',
    summary:
      'Nigerian firms fill them from letters students send directly. A short letter naming the practice area you want beats forty generic ones, and every profile in the directory carries the address.',
    href: '/firms',
    cta: 'Find a firm to write to',
    media: { type: 'image', src: '/illustrations/file-searching.svg', alt: '' }
  },
  {
    slug: 'ambassadors-open',
    kind: 'update',
    date: '2026-08-06',
    title: 'Campus ambassador applications are open!',
    summary:
      'Run one session for your year, whenever it suits you, and leave with a signed reference. Not paid, and we would rather say so up front.',
    href: '/ambassador',
    cta: 'Read the terms',
    media: { type: 'image', src: '/illustrations/ambassador.svg', alt: '' }
  },
  {
    slug: 'cv-tools-live',
    kind: 'update',
    date: '2026-08-05',
    title: 'CV review, cover letters and interview prep',
    summary:
      'All three are tuned to the Nigerian market and know what LL.B, B.L and call to the Bar actually mean. Your CV file is never stored, only what the tools write from it.',
    href: '/tools/cv-review',
    cta: 'Try the CV review',
    media: { type: 'image', src: '/illustrations/writing-letter.svg', alt: '' }
  },
]

/**
 * The single read point. Newest first, and tolerant of a malformed date so one
 * bad entry cannot reorder or crash the homepage.
 */
export function getNewsItems(): NewsItem[] {
  return [...ITEMS].sort((a, b) => {
    const ta = Date.parse(a.date)
    const tb = Date.parse(b.date)
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0
    if (Number.isNaN(ta)) return 1
    if (Number.isNaN(tb)) return -1
    return tb - ta
  })
}

/** Long-form date for the news page. */
export function formatNewsDate(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  return new Date(t).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
