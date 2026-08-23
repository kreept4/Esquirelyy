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
import { roleCountLabel, carouselSummary, NEW_ROLES_HREF, newRolesCta } from '@/lib/new-roles'

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
    /**
     * The current roles drop, read from lib/new-roles.ts rather than written
     * out here.
     *
     * ⚠ NOTHING IS HARDCODED BUT THE SLUG AND THE DATE. Title, summary and href
     * all call into new-roles.ts, which is the single source three other
     * surfaces (the bell, its modal, the email) already read from. Writing this
     * slide's copy by hand a fourth time is exactly the drift the header
     * comment on that file describes: a slide can promise a role count that the
     * board has already moved past. Bumping NEW_ROLES.id for the next drop is
     * the whole of updating this card too.
     *
     * `date` still has to be a literal — it sorts the carousel — so it is kept
     * in step with NEW_ROLES.at by hand. It is a duplicated fact, not a
     * duplicated sentence, and the two are not the same risk: a wrong date
     * moves a card's position, a wrong sentence tells a reader something false.
     *
     * Illustration: new-entries.svg, sitting unused in /public/illustrations
     * since before this slide existed.
     */
    slug: 'roles-drop-2026-08-23',
    kind: 'update',
    date: '2026-08-23',
    title: `${roleCountLabel()} on the board`,
    summary: carouselSummary(),
    href: NEW_ROLES_HREF,
    cta: newRolesCta(),
    media: { type: 'image', src: '/illustrations/new-entries.svg', alt: '' },
  },
  {
    /**
     * LBVIP 5.0, and the only slide here with a hard expiry.
     *
     * ⚠ THIS SLIDE HAS TO COME OUT ON 24 AUGUST 2026. Every other entry stays
     * true indefinitely: a ranking, a directory, a tip about writing early. This
     * one names a programme that shuts on the 23rd, and a carousel still
     * advertising it on the 24th is worse than one that never carried it,
     * because the reader who taps it finds a form that has closed.
     * `getNewsItems()` sorts and does not expire, deliberately, so there is no
     * mechanism to lean on here. It is a diary note, and it is written in the
     * one place somebody editing this file will read.
     *
     * THE DEADLINE IS IN THE SUMMARY RATHER THAN LEFT TO THE CARD. The carousel
     * does not render a countdown, so a slide about a closing programme that
     * does not say when it closes is asking the reader to tap to find out.
     *
     * The link goes to the opportunity on Esquirely, not to the firm's Google
     * Form, for the same reason the announcement email does: the three steps
     * and the eligibility are read on the platform first, and the form is one
     * more tap from there.
     */
    slug: 'lbvip-5-2026',
    kind: 'update',
    date: '2026-08-17',
    title: 'LBVIP 5.0 is open to students, graduates and new wigs',
    summary:
      'Lekan Bamidele & Co are running the fifth edition of their virtual internship. Applying takes a two minute video on a set topic, a public post tagging the firm, and their form. It closes on 23 August 2026.',
    href: '/jobs/lbvip-5-0-lekan-bamidele-virtual-internship-programme',
    cta: 'See the three steps',
    media: { type: 'logos', slugs: ['lekan-bamidele'] },
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
    /* The rankings sentence that used to close this summary moved to a slide of
       its own, and that slide has since been pulled from the rotation. The
       sentence is deliberately NOT folded back in here: this card is about what
       a profile carries, and rankings are a separate claim that earns its own
       card or none at all. */
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
    /* ⚠ NO LONGER SAYS "APPLICATIONS ARE OPEN", as of 23 August 2026.
       Applications are not open yet — see the note on the ambassador page's
       own apply section. This slide still points at the page, because the
       pitch itself (what the role is, what it is not, what it returns) is
       still worth reading; it just no longer promises a mailbox that isn't
       accepting mail. */
    slug: 'ambassadors-open',
    kind: 'update',
    date: '2026-08-06',
    title: 'What a campus ambassador does',
    summary:
      'Run one session for your year, whenever it suits you, and leave with a signed reference. Not paid, and we would rather say so up front. Applications are not open yet.',
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
