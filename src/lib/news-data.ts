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
import { CLOSING_REMINDER_HREF } from '@/lib/closing-reminder'
import { today as lagosToday, daysUntilDay } from '@/lib/day'

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
  /**
   * Optional. The last day (YYYY-MM-DD, Lagos) the slide is shown. For a slide
   * about something with a deadline, so it comes off when the thing closes
   * rather than when somebody remembers to edit this file.
   */
  until?: string
  /**
   * Optional. The first day (YYYY-MM-DD, Lagos) the slide is shown. For a
   * slide that takes over a slot when another one's `until` runs out, so the
   * swap happens on its own at midnight rather than on a deploy.
   */
  from?: string
  /**
   * Optional. For a slide about a deadline: the day it closes, and the title
   * and summary written with `{when}` where the day goes.
   *
   * `{when}` becomes "tomorrow", then "today", which a fixed string cannot do:
   * "tomorrow" typed into `title` is wrong for the whole of the closing day.
   * The carousel fills it in the reader's browser and draws a countdown to the
   * end of that day in Lagos. `title` and `summary` stay as the dated wording,
   * for /news, which is built once and cannot say "tomorrow" truthfully.
   */
  closing?: { on: string; title: string; summary: string }
}

/** "tomorrow", "today", or "on Friday 13 November" further out or after. */
export function closingWhen(on: string, now: Date = new Date()): string {
  const days = daysUntilDay(on, now)
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  const [y, m, d] = on.split('-').map(Number)
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  })
  return `on ${day}`
}

/** A closing slide's title and summary for `now`; any other slide unchanged. */
export function resolveClosing(item: NewsItem, now: Date = new Date()): NewsItem {
  if (!item.closing) return item
  const when = closingWhen(item.closing.on, now)
  return {
    ...item,
    title: item.closing.title.replace('{when}', when),
    summary: item.closing.summary.replace('{when}', when),
  }
}

/**
 * The instant a closing day ends, in milliseconds. Lagos is UTC+1 all year, so
 * the end of the day is 23:00 UTC on that date. A deadline given as a date
 * means the end of that day (see isPastDay in lib/day.ts).
 */
export function closingEndsAt(on: string): number {
  return Date.parse(`${on}T00:00:00+01:00`) + 86_400_000
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
  /* ⚠ THE LBVIP SLIDE CAME OFF ON 1 SEPTEMBER, ON THE SCHEDULE IT SET ITSELF.

     It was the only entry in this file with a hard expiry, and it said so at
     length: a slide advertising a programme that has shut is worse than one
     that never carried it, because the reader who taps it finds a closed form.
     Lekan Bamidele & Co extended it once, from 23 to 30 August, and the slide
     was redated to follow. The 30th has now passed and there is no third
     extension to follow, so it goes.

     getNewsItems() sorts and does not expire, deliberately, so nothing here
     removes a stale slide on its own. That is still true and it is still the
     thing to watch: this file expires by somebody editing it.
   */

  {
    /**
     * The 13 November closings, in the slot the 2026 SAN conferment had.
     *
     * The SAN slide was news in October and history now; its own note said to
     * pull it once something worth the slot arrived. Four openings closing on
     * one day is that: the closing reminder email reached members on 10
     * November, and this is the last nudge for anybody who lands on the
     * homepage before the forms shut. The photo stays in /public/news.
     *
     * ⚠ `until` TAKES IT OFF BY ITSELF after Friday 13 November, Lagos time,
     * so it cannot outlive the listings it points at. The home page revalidates
     * hourly, so it goes within the hour after midnight.
     */
    slug: 'closing-2026-11-13',
    kind: 'update',
    date: '2026-11-12',
    until: '2026-11-13',
    title: 'Four openings close on Friday, 13 November',
    summary:
      "Stren & Blan's 2027 NYSC trainee seat, associate roles at Ikeyi Shittu and Olajide Oyewole, and Olaniwun Ajayi's Blue Experience open day all close on Friday. If one is yours, apply now.",
    /* What the carousel shows: "close tomorrow" on the 12th and "close today"
       on the 13th, with a red countdown to the end of Friday in Lagos. */
    closing: {
      on: '2026-11-13',
      title: 'Four openings close {when}',
      summary:
        "Stren & Blan's 2027 NYSC trainee seat, associate roles at Ikeyi Shittu and Olajide Oyewole, and Olaniwun Ajayi's Blue Experience open day all close {when}. If one is yours, apply now.",
    },
    href: CLOSING_REMINDER_HREF,
    cta: 'See all four',
    media: {
      type: 'logos',
      slugs: ['Stren & Blan Partners', 'Ikeyi Shittu & Co', 'Olajide Oyewole LLP', 'Olaniwun Ajayi LP'],
    },
  },

  {
    /**
     * The scholarships added on 12 and 13 November, in the slot the 13
     * November closings slide leaves. `from` is the day after that slide's
     * `until`, so one replaces the other at midnight, Lagos time, with no
     * deploy. `until` is 17 December, the last of the December deadlines
     * (NYU); Georgetown and Edinburgh run later but are not why the slide is
     * up. PUSG leads because it is the one most members can apply for.
     */
    slug: 'new-scholarships-2026-11',
    kind: 'update',
    date: '2026-11-14',
    from: '2026-11-14',
    until: '2026-12-17',
    title: 'Six new scholarships, including Law School fees',
    summary:
      'The Prada Uzodimma grant pays Nigerian Law School tuition in full, with no first class required, and closes on 13 December. Also new: LLM funding from NYU, Georgetown, McGill and Edinburgh.',
    href: '/scholarships',
    cta: 'See the scholarships',
    media: {
      type: 'logos',
      slugs: ['Principle Legal Consult', 'NYU School of Law', 'Georgetown Law', 'McGill Faculty of Law'],
    },
  },

  {
    /**
     * Greenberg Traurig's London trainee intake, on the carousel rather than on
     * the board, and that placement is the decision worth recording.
     *
     * ⚠ IT IS DELIBERATELY NOT A LISTING. Every row on the board is something a
     * Nigerian law student or lawyer can act on with what they already hold.
     * This one is gated on ABB at A-level and runs through the SQE, so for most
     * of this audience it is not an application, it is information. Putting it
     * in the jobs table would have it counted, filtered and searched alongside
     * seats that are genuinely open to the reader, and a board that does that
     * stops meaning anything. The carousel is where something worth knowing but
     * not broadly applicable belongs.
     *
     * ⚠ THE ENTRY BAR IS IN THE SUMMARY, NOT BEHIND THE LINK, and it is there
     * on purpose. The temptation with a name like this is to lead with the
     * salary and let the reader discover the A-level requirement after they
     * have started the form. Stating it in the two sentences the carousel
     * actually shows means the readers it does not fit skip it in three
     * seconds, and the ones it does fit know they qualify before they click.
     *
     * WHY THE TIMING IS THE HOOK. The intake is 2029, so the people who should
     * apply are in university now. That is the one genuinely useful thing here
     * and it is the thing a reader is least likely to work out unaided, which
     * is why the first sentence carries it.
     *
     * ⚠ THE MARK IS `logos`, SO IT GETS THE SAME PAINT SPLASH AS EVERY OTHER
     * SLIDE, AND GETTING THERE TOOK A CROP RATHER THAN A CSS EXCEPTION.
     *
     * This was `image` first, which renders into `.news-illustration`, a 20rem
     * slot with the aspect left alone. That was the right slot for the full
     * lockup and the wrong answer for the carousel: the LBVIP slide beside it
     * uses `logos` and gets a splash, so one slide sat in a plain wide box
     * while its neighbour had artwork, and the row stopped reading as one set.
     *
     * The reason `image` was reached for is real. The splash is a 6.4rem blob
     * with 1rem of padding, so the artwork lands in roughly 70px square, and
     * the published GT lockup is the monogram plus wordmark at about 6:1. In a
     * splash that is a 70 by 11 pixel strip, technically present and entirely
     * unreadable. Both were rendered at the real size before this was decided.
     *
     * The fix is the artwork, not the rule: EMPLOYER_LOGOS carries the GT
     * monogram alone, which is square, fills the same box at full height, and
     * is legible. See the note beside that key in firms-data.ts for why a crop
     * to their own monogram is nominative use while building a new stacked
     * lockup out of their parts would not be.
     */
    slug: 'greenberg-traurig-london-trainee-2029',
    kind: 'update',
    date: '2026-09-01',
    title: 'Greenberg Traurig is taking 2029 trainees now',
    summary:
      'Their London office has opened applications for training contracts starting in 2029, so this one is aimed at students still at university. Two years, four six-month rotations, starting on 55,000 pounds. You need ABB at A-level and to be on track for a 2:1. It closes on 30 November 2026.',
    /* ⚠ POINTS AT THE LISTING, NOT AT GTLAW.COM, SINCE 1 SEPTEMBER.
       It went up linking to the firm's careers page because there was no
       listing to link to. There is now, at /jobs, with the entry requirements
       on the card and the Workday posting behind the apply button. Sending a
       reader off-site when we hold the same facts is the thing the LBVIP slide
       was careful not to do: the eligibility and the deadline are read here
       first, and the application is one tap from there. */
    href: '/jobs/greenberg-traurig-2029-training-contract',
    cta: 'See the requirements',
    media: { type: 'logos', slugs: ['greenberg-traurig'] },
  },
  /* THE TWO NBA SLIDES CAME OFF ON 1 SEPTEMBER, and both had earned it.

     nba-agc-2026-beyond-limits was written in the present tense about a
     conference that closed on 28 August, and the note that used to sit here
     said in terms that it had to be pulled or rewritten the moment the closing
     ceremony ended. It was still up four days later telling readers the
     conference "is on now", which is the failure that note predicted.

     nba-president-elect-2026 was a 6 August election result about a swearing-in
     that happened on the 21st.

     Neither was news by the time it came off, and between them they held two of
     eight slots on a carousel whose job is to show a reader something they can
     act on. Removed rather than rewritten, because the election is settled and
     the conference is over: there is no version of either that a job seeker
     does anything with.

     ⚠ THE PHOTO BRANCH IS NOW UNUSED. These were the only two `type: 'photo'`
     entries. The `.news-photo` rules in globals.css and their object-position
     values were tuned for the Badejo portrait specifically, so leave them
     alone rather than tidying them away: the next photo slide will want them,
     and rederiving those numbers costs more than the dead CSS does. */
  /* THE LAW CREST AND OMAPLEX SLIDES CAME OFF ON 13 OCTOBER, both because the
     date on them had passed: Omaplex registration closed on 5 October and the
     Law Crest internship ran on the 7th. Their notes argued each other's
     placement (the in-person exception before the remote rule), so they went
     together, and the J.O Fabunmi slide went the same day for the same reason.
     The SAN conferment slide above took the one slot that was refilled. */
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
export function getNewsItems(now: Date = new Date()): NewsItem[] {
  const today = lagosToday(now)
  return ITEMS.filter(i => (!i.until || i.until >= today) && (!i.from || i.from <= today)).sort((a, b) => {
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
