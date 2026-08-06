import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Be an ambassador',
  description:
    'Represent Esquirely inside your university law faculty. One semester, three commitments, and a signed reference at the end.',
}

/**
 * Campus ambassador programme.
 *
 * The first version of this page was a stack of equal cards in a hairline grid,
 * which is the default shape this codebase reaches for and the wrong one here.
 * A grid of equal cards says "these are five interchangeable features". This
 * page is an argument with a sequence: here is what we ask, here is what you
 * get, here is who it is for, here is how to apply. Equal weight flattens that
 * into a menu.
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
 * One carton card on the whole page, on the application, because that is the
 * single action being asked for and the design language reserves that treatment
 * for exactly that.
 */

const TERMS = [
  { k: 'Commitment', v: 'One semester' },
  { k: 'Time', v: '~3 hours a month' },
  { k: 'Paid', v: 'No' },
  { k: 'You leave with', v: 'A signed reference' },
]

const COMMITMENT = [
  {
    title: 'Host one workshop each semester',
    body:
      'A single one-hour session for students on your campus, in a lecture room or on a video call, whichever is easier to fill. You walk them through finding roles on the board, using the CV and interview tools, and writing to a firm speculatively.',
    aside: 'We send the slides, the talking points and a sign-up link. You pick the date and get people in the room.',
  },
  {
    title: 'Pass on what lands',
    body:
      'Share openings and scholarship deadlines in the group chats and faculty channels you are already part of. There is no posting quota and nothing to report.',
    aside: 'Only the things your year would genuinely want to see. An ambassador who posts everything gets muted by March.',
  },
  {
    title: 'Tell us what is missing',
    body:
      'You are closer to what a final-year student actually needs than we are. When something on Esquirely is wrong, thin, or useless for your campus, we want to hear it before anyone else does.',
    aside: 'This is the part we value most, and the part most programmes never actually ask for.',
  },
]

const RETURNS = [
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
  'Around for at least one more semester',
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
            <p className="grotesk-regular amb-lede">
              We can build the board, the tools and the directory. What we cannot do from an office
              in Lagos is stand in front of your year and tell them it exists. That part is yours.
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
          <section className="amb-part">
            <div className="amb-part-label">
              <p className="grotesk-bold amb-part-title">What we ask</p>
              <p className="grotesk-regular amb-part-note">Three things, and nothing else.</p>
            </div>

            <ol className="amb-index">
              {COMMITMENT.map((c, i) => (
                <li key={c.title} className="amb-index-item">
                  <span className="display-black amb-index-num" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="amb-index-main">
                    <h2 className="display-black amb-index-title">{c.title}</h2>
                    <p className="grotesk-regular amb-index-body">{c.body}</p>
                  </div>
                  <p className="grotesk-regular amb-index-aside">{c.aside}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* The return: sticky label, flowing list. */}
          <section className="amb-part">
            <div className="amb-part-label">
              <p className="grotesk-bold amb-part-title">What you get</p>
              <p className="grotesk-regular amb-part-note">
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

          <section className="amb-part">
            <div className="amb-part-label">
              <p className="grotesk-bold amb-part-title">Who it suits</p>
              <p className="grotesk-regular amb-part-note">
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
                If your workload turns at exam time, nobody is chasing you. It is a semester, not a
                contract, and it ends by simply ending.
              </p>
            </div>
          </section>

          {/* The one carton card on the page, on the one action. */}
          <section className="amb-apply">
            <div className="amb-apply-copy">
              <p className="display-black amb-apply-heading">Put your campus on the map.</p>
              <p className="grotesk-regular amb-apply-body">
                Send us three things: your campus and year, what you would change about Esquirely,
                and when your next semester starts. That is the whole application. We read them as
                they arrive and take a small number each intake, so every ambassador gets a person
                rather than a mailing list.
              </p>
              <div className="amb-apply-actions">
                <a
                  href="mailto:ambassadors@esquirely.com?subject=Ambassador%20application"
                  className="grotesk-bold amb-apply-cta"
                >
                  Apply to join
                </a>
                <Link href="/faq" className="grotesk-regular amb-apply-alt">
                  Read the FAQ first
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
