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
    /* ⚠ REDATED TO 24 AUGUST BECAUSE THE FIRM EXTENDED IT, and the redate is
       the point rather than a side effect. This slide said "closes on 23 August
       2026" and, on 24 August, that made it a slide announcing something that
       was over. Lekan Bamidele & Co reopened it to the 30th, so the deadline
       here moves with theirs and the date moves with it, which is what pulls
       the slide back up the carousel to where somebody with six days left can
       see it. See scripts/2026-08-24-extend-lbvip-deadline.mjs for the source. */
    slug: 'lbvip-5-2026',
    kind: 'update',
    date: '2026-08-24',
    title: 'LBVIP 5.0 has been extended to 30 August',
    summary:
      'Lekan Bamidele & Co have reopened the fifth edition of their virtual internship after the first deadline passed. Applying still takes a two minute video on a set topic, a public post tagging the firm, and their form. It now closes on 30 August 2026.',
    href: '/jobs/lbvip-5-0-lekan-bamidele-virtual-internship-programme',
    cta: 'See the three steps',
    media: { type: 'logos', slugs: ['lekan-bamidele'] },
  },
  {
    /**
     * The 66th AGC, in progress as this goes up.
     *
     * ⚠ DATED 24 AUGUST, WHICH IS MID-CONFERENCE, AND THAT IS THE POINT.
     * It opened on Sunday the 23rd at the Yakubu Gowon Stadium and runs to the
     * 28th, so this slide is not an announcement of something coming — it is
     * telling a reader that the thing is happening now and there are days of it
     * left. A slide dated to the opening would sort below the roles drop within
     * a day and be seen by nobody while the conference was still on.
     *
     * ⚠ IT WILL BE STALE ON 29 AUGUST. Nothing in this file expires on a
     * date; every other entry here is either a standing tip or a fact that
     * stays true. This one stops being true the moment the closing ceremony
     * ends, and the summary is written in the present tense, so it must be
     * pulled or rewritten in the past tense then. That is the cost of running a
     * live slide and it is worth it for five days of relevance.
     *
     * The figure is the AGC's own identity card, from the conference site, used
     * whole rather than cut to a mark. `photo` rather than `logos` for that
     * reason: the logos branch clips each mark into a paint-splash blob, which
     * is right for a mark on transparency and would take a bite out of a
     * designed card. It is credited like any other supplied image.
     */
    slug: 'nba-agc-2026-beyond-limits',
    kind: 'news',
    date: '2026-08-24',
    title: 'Beyond Limits: the NBA conference is on now',
    summary:
      'The 66th NBA Annual General Conference opened on Sunday at the Yakubu Gowon Stadium in Port Harcourt and runs to 28 August, under the theme Beyond Limits. Plenaries, breakout sessions and the Young Lawyers’ programme run through the week, More than eighteen thousand lawyers registered during the early bird window.',
    href: 'https://agc.nigerianbar.org.ng',
    cta: 'See the programme',
    media: {
      type: 'photo',
      src: '/news/nba-agc-2026-beyond-limits.jpg',
      alt: 'NBA Annual General Conference 2026, Beyond Limits',
      credit: 'Nigerian Bar Association',
    },
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
  /* ⚠ THE CAMPUS AMBASSADOR SLIDE IS OUT, 24 August 2026, and this comment is
     here so the next person does not put it back without checking.
     It read "Campus ambassador applications are open!" and linked to
     /ambassador. Applications are closed — not because the programme ended but
     because we are not ready to run the intake, so a slide inviting people to
     apply was inviting them into a queue nobody was reading. The programme page
     stays up and still says what the role is; what came down is every route
     that asks somebody to apply for it, here and in app/about, app/contact and
     app/ambassador.
     WHEN IT REOPENS this slide comes back with a new `date`, because a slide
     restored at 2026-08-06 would reappear buried under three weeks of newer
     items and be seen by nobody. */
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
