import { openGraph } from '@/components/seo/JsonLd'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

/* ⚠ THE TITLE NO LONGER ASKS FOR ANYTHING, 24 August 2026. It was "Be an
   ambassador", which is an imperative, and an imperative is a call to apply —
   in the tab, in a Google result and in a shared link, all of which outlive the
   page being read. Applications are closed while we get the intake right, so
   the page describes the programme instead of recruiting for it. The
   description says so in its last clause rather than its first: what the role
   is remains the useful part, and somebody who arrives from a search for it
   should still get the answer. */
export const metadata = {
  title: 'The campus ambassador programme',
  description:
    'What an Esquirely campus ambassador does: run one session for your faculty when it suits you, pass on what is worth passing on, and leave with a signed reference. Applications are closed for now.',
  alternates: { canonical: '/ambassador' },
  openGraph: openGraph({ path: '/ambassador' }),
}

/**
 * Campus ambassador programme.
 *
 * The first version of this page was a stack of equal cards in a hairline grid,
 * which is the default shape this codebase reaches for and the wrong one here.
 * A grid of equal cards says "these are five interchangeable features". This
 * page is an argument with a sequence: here is what we ask, here is what you
 * get, here is who it is for, here is where it stands. Equal weight flattens
 * that into a menu.
 *
 * So the structure is editorial rather than modular:
 *
 * A masthead that states the terms as a specimen strip, so the commitment is
 * legible in three seconds without reading a word of body copy.
 *
 * The commitment as a numbered index, hanging display numerals against a
 * hairline rule, in the manner of a contents page. The numerals are the
 * structure; there are no boxes at all in this section.
 *
 * The return as a two-column asymmetry, borrowing the sticky-label pattern the
 * legal pages already use, so a wide screen is filled with hierarchy rather
 * than with stretched cards.
 *
 * One carton card on the whole page, at the end, because the design language
 * reserves that treatment for the single thing the page resolves to. That used
 * to be the application. Applications are closed, so it now carries the notice
 * saying so — same slot, same weight, because a reader who has read the whole
 * argument needs to be told where it stands with exactly as much emphasis as
 * they would have been asked to act.
 */

/* Three columns, not two, and the third is the change.
 *
 * This strip used to say "Paid: No" beside "You leave with: A signed
 * reference", and stopped there. That is honest and it is also the whole offer
 * read as a dead end: no money, one letter, nothing further. The route past it
 * existed and was never written down, so nobody could factor it into deciding.
 *
 * "Paid: No" stays exactly where it is. Leading with the thing a reader would
 * otherwise spend the whole page waiting to discover is what makes the rest
 * credible, and burying it under a partnership line would be the oldest trick
 * on a recruitment page. */
const TERMS = [
  { k: 'Paid', v: 'No' },
  { k: 'You leave with', v: 'A signed reference' },
  { k: 'If you go further', v: 'A partnership' },
]

const COMMITMENT = [
  {
    title: 'Get your year in one room',
    body:
      'An hour, in a lecture room or on a call, whenever the term gives you a gap. You show them how to find roles on the board, use the CV and interview tools, and write to a firm speculatively. We send the slides, the talking points and the sign-up link.',
    aside: 'You pick the date. If that week gets away from you, pick another one.',
  },
  {
    title: 'Pass on what lands',
    body:
      'Drop the openings and deadlines worth seeing into the group chats and faculty channels you are already in. No quota, no reporting, nothing to log.',
    aside: 'Only the things your year would genuinely want to see. Post everything and people stop reading you.',
  },
  {
    title: 'Tell us what is missing',
    body:
      'You are closer to what a final-year student actually needs than we are. When something here is wrong, thin or useless for your campus, we want to hear it first.',
    aside: 'This is the part we value most, and the part most programmes never actually ask for.',
  },
]

/* Partnership leads, and the reference follows it.
 *
 * The reference used to open this list, and as the best thing on offer it set
 * the ceiling of the whole programme at one letter. It is still worth having
 * and it is no longer the top of the ladder.
 *
 * WHAT THE PARTNERSHIP ENTRY DELIBERATELY DOES NOT SAY: a figure, a percentage,
 * a title or a duration. Those are terms, they differ per person and per
 * campus, and a page cannot agree them in advance. Publishing a number nobody
 * has committed to would be worse than publishing nothing, because the first
 * conversation would then start by walking it back. What is promised here is
 * that the conversation is real and the terms get agreed with you.
 */
const RETURNS = [
  {
    title: 'An invite link that is yours',
    body:
      'If you would like to represent us, you are given your own link. Everyone who joins Esquirely through it is counted to you, and we publish where that stands so nobody has to take our word for how their term went. Share it wherever it fits: a slide, a group chat, a single firm profile that answers the question somebody just asked you.',
  },
  {
    title: 'A partnership, if you earn one',
    body:
      'The ambassadors bringing the most people through their link stop being ambassadors. We back the society, the initiative or the person driving it, and the terms get agreed with you rather than handed down. If you are building an audience of Nigerian law students, we would rather partner with you than compete for their attention.',
  },
  {
    title: 'A signed reference',
    body:
      'A real one, describing what you actually did and who you did it for. It goes on a training contract application in a way that a certificate does not.',
  },
  {
    title: 'Early access',
    body:
      'You see tools before they ship, and your notes change them while changing them is still cheap. Several things on the site exist because a student said the first version was useless.',
  },
  {
    title: 'A direct line',
    body: 'A channel straight to the people building this. No support queue, no contact form, no ticket number.',
  },
  {
    title: 'Your name on it',
    body: 'Ambassadors are credited on the site. If you build something with us, that is yours to point at afterwards.',
  },
]

/* University faculties only. The Nigerian Law School year is too short and too
 * heavily examined to ask anyone to run sessions through it, so it is ruled out
 * here rather than left for someone to discover after applying. */
const FIT = [
  'An undergraduate law student at a Nigerian university',
  'Still around campus for a while yet',
  'Already the person people ask about opportunities',
]

export default function AmbassadorPage() {
  return (
    <>
      <main className="page-main amb-page">
        {/* Masthead. The terms strip sits inside the ink band rather than below
            it, so the ask and its cost arrive together instead of the cost
            being discovered three scrolls later. */}
        <header className="amb-masthead">
          <div className="shell amb-masthead-inner">
            <h1 className="display-black amb-title">
              Run Esquirely<br />where the students are.
            </h1>
            {/* The old lede explained our problem and left the reader to work
                out their own part from it. It was true and it was an argument
                about us. This one names the job, the cost and the return in
                that order, so somebody can decide before they scroll. */}
            {/* The old lede explained our problem and left the reader to work
                out their own part from it. It was true and it was an argument
                about us. This one names the job, the cost and the return in
                that order, so somebody can decide before they scroll. */}
            <p className="grotesk-regular amb-lede">
              One person carries this to a faculty. If you would like to represent us on your
              campus, that is an hour a term in front of your year, the openings worth passing on,
              and a straight answer when we get something wrong. You get an invite link that is
              yours, a signed reference at the end of it, and a partnership if what you build
              deserves one.
            </p>

            <dl className="amb-terms">
              {TERMS.map(t => (
                <div key={t.k} className="amb-term">
                  <dt className="grotesk-regular">{t.k}</dt>
                  <dd className="grotesk-bold">{t.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <div className="shell amb-body">
          {/* The commitment: a numbered index, no boxes. */}
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">What we ask</p>
              <p className="grotesk-regular doc-section-note">Three things, and none of them heavy.</p>
            </div>

            <ol className="doc-rows">
              {COMMITMENT.map((c, i) => (
                <li key={c.title} className="doc-row">
                  <span className="display-black doc-num" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="doc-row-main">
                    <h2 className="display-black doc-row-title">{c.title}</h2>
                    <p className="grotesk-regular doc-row-body">{c.body}</p>
                  </div>
                  <p className="grotesk-regular doc-aside">{c.aside}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* The return: sticky label, flowing list. */}
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">What you get</p>
              <p className="grotesk-regular doc-section-note">
                Not money. We would rather say that here than let you find out after applying.
              </p>
            </div>

            <div className="amb-returns">
              {RETURNS.map(r => (
                <div key={r.title} className="amb-return">
                  <h2 className="grotesk-bold amb-return-title">{r.title}</h2>
                  <p className="grotesk-regular amb-return-body">{r.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">Who it suits</p>
              <p className="grotesk-regular doc-section-note">
                University faculties only, no grade requirement, no CV.
              </p>
            </div>

            <div className="amb-fit-wrap">
              <ul className="amb-fit">
                {FIT.map(f => (
                  <li key={f} className="grotesk-regular">{f}</li>
                ))}
              </ul>
              <p className="grotesk-regular amb-fit-note">
                Exams come first, always. Nobody is chasing you, there is nothing to sign, and it
                ends whenever you would like it to.
              </p>
            </div>
          </section>

          {/* ⚠ THIS CARD USED TO BE THE APPLICATION AND IS NOW THE OPPOSITE OF
              ONE, 24 August 2026. It carried the heading "Put your campus on the
              map.", a paragraph explaining that an email was the whole
              application, and a mailto to ambassadors@esquirely.com.ng.

              APPLICATIONS ARE CLOSED BECAUSE WE ARE NOT READY TO RUN THE
              INTAKE, which is a different thing from the programme ending, and
              the copy has to make that difference audible. Everything above this
              card — what an ambassador does, what they get, what it costs them —
              is still true and still worth reading, so the page stays. What
              cannot stay is an invitation to apply into a queue nobody is
              reading: somebody spends an evening on it, sends it, and hears
              nothing, which costs them more than never seeing the button.

              ⚠ AND THE MAILTO IS GONE RATHER THAN DISABLED. A dead address
              styled as a button is still an address: it gets copied, it gets
              written down, and it gets mail we are not answering. The address
              itself is removed here, in app/contact and in lib/team-call, so
              there is no route left that produces an application.

              NO DATE IS PROMISED. "Back in September" is a promise made by
              whoever writes it and kept by whoever has to. This says we will
              say when, and the news carousel is where that would be said. */}
          <section className="amb-apply">
            <div className="amb-apply-copy">
              <p className="display-black amb-apply-heading">Applications are closed for now.</p>
              <p className="grotesk-regular amb-apply-body">
                We are not taking new campus ambassadors at the moment. Not because the programme
                is over, but because we would rather not have you write in and hear nothing back
                while we get the intake right. Everything above is what the role is and what it
                asks of you, and none of it changes. When we open again it will be announced on
                the site.
              </p>
              <div className="amb-apply-actions">
                <Link href="/news" className="grotesk-bold amb-apply-cta">
                  See what is new
                </Link>
                <Link href="/faq" className="grotesk-regular amb-apply-alt">
                  Read the FAQ
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
