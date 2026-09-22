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
     * The LGIC, in the Badejo-Okusanya swearing-in's slot.
     *
     * ⚠ WHY THAT SLIDE CAME OFF. It was a 28 August ceremony, and by now the
     * thing it reported is a month old. The note that used to sit here said the
     * slide was fair "until it is either delivered on or clearly not", and that
     * a promise with a two year term attached should be revisited rather than
     * left to sit. It was also the last `type: 'photo'` entry on the carousel,
     * so the row now reads as one set of splashes with nothing sitting in a
     * different kind of box. The `.news-photo` rules stay in globals.css for
     * the reason the note further down already gives.
     *
     * More to the point: a carousel slot is worth what a reader can do with it,
     * and this one closes in seven days.
     *
     * ⚠ IT POINTS AT THE LISTING, NOT AT THE GOOGLE FORM, which is the same
     * call the LBVIP slide made. The eligibility, the window and the three
     * steps are read here first and the form is one tap from there. Sending a
     * reader straight to forms.gle would skip the only page that tells them
     * they must be awaiting law school admission to be eligible at all.
     *
     * ⚠ AND THE SLUG IS IN lib/open-jobs.ts, which is the half of this that
     * does not look like work. Most of the people who see this carousel are
     * signed out. A card pointing at a slug outside that set sends every one of
     * them to /auth/login instead of to the listing.
     *
     * THE MARK IS `logos` AND IT IS THE MONOGRAM. The full panel is a circle
     * over a wordmark over a tagline, which is a grey smear in a 70px splash;
     * the circle alone fills it. Same decision as Greenberg Traurig above, and
     * the extractor records it.
     */
    slug: 'jo-fabunmi-internship-competition-2026',
    kind: 'update',
    date: '2026-09-21',
    title: 'A firm is putting 3 million naira behind an internship',
    summary:
      'J.O Fabunmi & Co are running the sixth edition of their internship competition, and it is open to Nigerians waiting to start law school. You need a 2:1 from an accredited university, here or abroad. Registration closes on 28 September.',
    href: '/jobs/6th-annual-professor-j-o-fabunmi-internship-competition-lgic',
    cta: 'Read the criteria',
    media: { type: 'logos', slugs: ['J.O Fabunmi & Co'] },
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
  {
    /**
     * The Omaplex internship, in the slot the general version of this point
     * used to hold.
     *
     * ⚠ WHAT CAME OFF, AND WHY IT HAD TO. The old slide was a tip titled
     * "Distance is not a barrier", naming Omaplex and Lekan Bamidele & Co as
     * two firms that run virtual internships, pointing at /firms. Its own note
     * said it named two firms students outside Lagos would act on, so if either
     * arrangement changed it was the first slide to pull. One had: LBVIP closed
     * on 30 August, so half the card was advertising something that no longer
     * existed, to exactly the readers most likely to chase it.
     *
     * ⚠ AND A TIP BECOMES AN UPDATE, which is the more useful half of this
     * change. The old card was true all year and actionable on no particular
     * day: a reader who saw it could go and look at two firm profiles. This one
     * has a form and a date on it. The carousel's job is to show somebody
     * something they can act on, and a live listing with a fortnight left beats
     * a standing observation about geography.
     *
     * The observation is not lost, it is just carried by a real example now.
     * The reason this listing is worth a slot is the same reason the old tip
     * was worth one: it is virtual, so where a reader lives does not decide
     * whether they can take it, which is not true of anything else on the
     * board.
     *
     * Points at the listing rather than at the firm's site or the form, the
     * same call the LBVIP and Greenberg slides made. The eligibility and the
     * closing date are read here first, and the form is one tap from there.
     */
    slug: 'omaplex-virtual-internship-2026',
    kind: 'update',
    date: '2026-09-22',
    title: 'Intern at Omaplex from anywhere in Nigeria',
    summary:
      'Omaplex are running the 2026 edition of their virtual internship, so where you live does not decide whether you can take it. It is open to law students and aspiring lawyers, and the firm lists seven subjects it will cover, from data protection to sport arbitration. Registration closes on 5 October.',
    href: '/jobs/omaplex-virtual-internship-2026',
    cta: 'Read the criteria',
    media: { type: 'logos', slugs: ['Omaplex Law Firm'] }
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
