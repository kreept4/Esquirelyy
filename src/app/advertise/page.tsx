import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Post a role',
  description:
    'How to list a role on Esquirely. Free, no account, and read by Nigerian lawyers and law students who are actually looking.',
}

/**
 * Post a role.
 *
 * The footer has linked here since the footer was rebuilt and the route did not
 * exist, so this was a live 404 on every page of the site.
 *
 * Written as an offer with its limits stated rather than as a pitch. Two things
 * are deliberately said out loud: listing is free and will stay free while the
 * board is this size, and we do not have audience numbers worth quoting yet.
 * A careers platform that inflates its reach to employers ends up sending
 * students to roles that were never real.
 */

const TERMS = [
  { k: 'Cost', v: 'Free' },
  { k: 'Account needed', v: 'No' },
  { k: 'Usually live within', v: 'One working day' },
]

const STEPS = [
  {
    title: 'Send the role',
    body:
      'Email it to roles@esquirely.com. A job description as an attachment is fine, a link to your own careers page is fine, and the body of an email is fine. There is no template to fill in and no form to create an account for.',
    aside: 'One email per role keeps the thread clean when a deadline later moves.',
  },
  {
    title: 'We check it and put it up',
    body:
      'We confirm the role is real and still open, then write it into the board in the site’s own voice so it sits alongside everything else. The listing links to your application route, whether that is an address, a portal or a form.',
    aside:
      'We do not rewrite your requirements, only the framing around them. If something reads as unclear we will ask rather than guess.',
  },
  {
    title: 'Tell us when it closes',
    body:
      'Send a line when the role is filled or withdrawn and it comes down the same day. A board full of roles that quietly stopped existing is the single fastest way to lose the people you are trying to reach.',
    aside: 'If you forget, we sweep for stale listings anyway, but yours will sit closed for longer.',
  },
]

const NEEDED = [
  'The role title, and whether it is a job, an internship or a trainee position',
  'Who is hiring, and the city or cities it is based in',
  'What you actually require: years post-call, class of degree, practice area',
  'The deadline, or that it is rolling',
  'Where applications go: an address, a portal link or a form',
]

export default function AdvertisePage() {
  return (
    <>
      <main className="page-main doc-page">
        <header className="doc-masthead">
          <div className="shell doc-masthead-inner">
            <h1 className="display-black doc-title">Post a role.</h1>
            <p className="grotesk-regular doc-lede">
              Send us an opening and it goes on the board. Free, no account, and read by Nigerian
              lawyers and law students who are looking right now rather than browsing.
            </p>

            <dl className="doc-strip">
              {TERMS.map(t => (
                <div key={t.k} className="doc-strip-item">
                  <dt className="grotesk-regular">{t.k}</dt>
                  <dd className="grotesk-bold">{t.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <div className="shell doc-body">
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">How it works</p>
              <p className="grotesk-regular doc-section-note">Three steps, and two of them are ours.</p>
            </div>

            <ol className="doc-rows">
              {STEPS.map((s, i) => (
                <li key={s.title} className="doc-row">
                  <span className="display-black doc-num" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="doc-row-main">
                    <h2 className="display-black doc-row-title">{s.title}</h2>
                    <p className="grotesk-regular doc-row-body">{s.body}</p>
                  </div>
                  <p className="grotesk-regular doc-aside">{s.aside}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">What to include</p>
              <p className="grotesk-regular doc-section-note">
                Anything missing, we will come back and ask, which costs you a day.
              </p>
            </div>

            <div className="amb-fit-wrap">
              <ul className="amb-fit">
                {NEEDED.map(n => (
                  <li key={n} className="grotesk-regular">{n}</li>
                ))}
              </ul>
              <p className="grotesk-regular amb-fit-note">
                Salary is optional and we will publish it if you give it. Almost nobody in the
                Nigerian market does, which is exactly why the ones who do get more applications.
              </p>
            </div>
          </section>

          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">The straight answers</p>
              <p className="grotesk-regular doc-section-note">
                The things you would otherwise have to email to find out.
              </p>
            </div>

            <div className="amb-returns">
              <div className="amb-return">
                <h2 className="grotesk-bold amb-return-title">Is it really free?</h2>
                <p className="grotesk-regular amb-return-body">
                  Yes, and it stays free while the board is this size. If that ever changes,
                  existing listings are unaffected and it will be said here first rather than
                  discovered at checkout.
                </p>
              </div>
              <div className="amb-return">
                <h2 className="grotesk-bold amb-return-title">How many people will see it?</h2>
                <p className="grotesk-regular amb-return-body">
                  Not enough of a number yet to quote one honestly, so we are not going to. What we
                  can say is who: Nigerian law students, recent calls and associates in their first
                  few years, which for most of these roles is the whole audience that matters.
                </p>
              </div>
              <div className="amb-return">
                <h2 className="grotesk-bold amb-return-title">Do you take a fee on hires?</h2>
                <p className="grotesk-regular amb-return-body">
                  No. We are not a recruiter, we take no commission, and we have no relationship
                  with any candidate that we would need to disclose to you.
                </p>
              </div>
              <div className="amb-return">
                <h2 className="grotesk-bold amb-return-title">Can we list without a firm profile?</h2>
                <p className="grotesk-regular amb-return-body">
                  Yes. The directory and the board are separate. If you are a Nigerian firm and want
                  a profile too, say so and we will build one.
                </p>
              </div>
            </div>
          </section>

          <section className="amb-apply">
            <div className="amb-apply-copy">
              <p className="display-black amb-apply-heading">Send us the role.</p>
              <p className="grotesk-regular amb-apply-body">
                One email, no form, no account. If you are not sure whether something fits the
                board, send it anyway and we will tell you.
              </p>
              <div className="amb-apply-actions">
                <a
                  href="mailto:roles@esquirely.com?subject=Role%20for%20the%20Esquirely%20board"
                  className="grotesk-bold amb-apply-cta"
                >
                  Email roles@esquirely.com
                </a>
                <Link href="/jobs" className="grotesk-regular amb-apply-alt">
                  See what is on the board
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
