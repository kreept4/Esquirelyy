import { openGraph } from '@/components/seo/JsonLd'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Contact',
  description:
    'How to reach Esquirely: corrections to a listing, questions about your data, partnership enquiries, and where to send a role.',
  alternates: { canonical: '/contact' },
  openGraph: openGraph({ path: '/contact' }),
}

/**
 * Contact.
 *
 * No form. A contact form here would be a worse version of an email client:
 * it cannot attach a CV, it gives the sender no record of what they wrote, and
 * it needs a backend, a spam defence and a privacy notice of its own for the
 * privilege. Addresses do all of it for free, and a routed address means a
 * correction to a listing does not sit behind a partnership enquiry.
 *
 * Built on the .doc-* shell so it is the same object as the ambassador and news
 * pages rather than a third layout.
 */

const ROUTES = [
  {
    what: 'Something on the site is wrong',
    who: 'corrections@esquirely.com.ng',
    body:
      'A closed role still listed as open, a deadline that has moved, a firm address that is out of date, a broken application link. These are the messages we act on fastest, because everything else here depends on the board being right. Tell us which page and what is wrong with it.',
    aside: 'Include the URL. It saves us a search and you a follow-up email.',
  },
  {
    what: 'You want a role on the board',
    who: 'roles@esquirely.com.ng',
    body:
      'Firms, in-house teams and chambers can send openings directly. Listing is free and there is no account to create. Send the role, the requirements, the deadline and where applications should go, and we will put it up.',
    aside: (
      <>
        There is more detail on <Link href="/advertise">how listing works</Link>.
      </>
    ),
  },
  {
    what: 'A question about your data',
    who: 'privacy@esquirely.com.ng',
    body:
      'Access, correction and deletion requests under the Nigeria Data Protection Act 2023. We answer within 30 days and there is no charge. You do not need to give a reason.',
    aside: (
      <>
        What we hold and why is set out in the <Link href="/privacy">privacy notice</Link>.
      </>
    ),
  },
  /* ⚠ THE CAMPUS AMBASSADOR ROW IS OUT, 24 August 2026, and taking the
     ADDRESS out is the whole point of removing it. It listed
     ambassadors@esquirely.com.ng and invited applications. Applications are
     closed while we get the intake right (see app/ambassador/page.tsx), and a
     published address is not made harmless by the page beside it saying not to
     write: this page exists to be scanned for an address, and the address is
     what gets copied.
     A faculty that genuinely wants a session run still has a route — 'Anything
     else' below is read by a person and is the correct destination for it while
     the programme is paused. Restoring this row means restoring the mailbox
     first. */
  {
    what: 'Anything else',
    who: 'hello@esquirely.com.ng',
    body:
      'Partnerships, press, a story we should be covering, or a piece of the site that is simply annoying to use. This one is read by a person, not a queue.',
    aside: 'Feedback on what is missing is genuinely the most useful thing you can send.',
  },
]

const FACTS = [
  { k: 'Where we are', v: 'Abuja, Nigeria' },
  { k: 'Replies', v: 'Within two working days' },
  { k: 'Data requests', v: 'Within 30 days' },
]

export default function ContactPage() {
  return (
    <>
      <main className="page-main doc-page">
        <header className="doc-masthead">
          <div className="shell doc-masthead-inner">
            <h1 className="display-black doc-title">Contact.</h1>
            <p className="grotesk-regular doc-lede">
              Five addresses rather than one form, so your message lands with whoever can actually
              do something about it. Every one of them is read.
            </p>

            <dl className="doc-strip">
              {FACTS.map(f => (
                <div key={f.k} className="doc-strip-item">
                  <dt className="grotesk-regular">{f.k}</dt>
                  <dd className="grotesk-bold">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <div className="shell doc-body">
          <section className="doc-section">
            <div className="doc-section-label">
              <p className="grotesk-bold doc-section-title">Who to write to</p>
              <p className="grotesk-regular doc-section-note">
                Pick the closest one. If none of them fit, the last one always does.
              </p>
            </div>

            <ol className="doc-rows">
              {ROUTES.map((r, i) => (
                <li key={r.who} className="doc-row">
                  <span className="display-black doc-num" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="doc-row-main">
                    <h2 className="display-black doc-row-title">{r.what}</h2>
                    <p className="grotesk-regular doc-row-body">{r.body}</p>
                    <a href={`mailto:${r.who}`} className="grotesk-bold contact-address">
                      {r.who}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>

                  <p className="grotesk-regular doc-aside">{r.aside}</p>
                </li>
              ))}
            </ol>
          </section>

          <p className="grotesk-regular news-note">
            We are a small team, so a considered reply sometimes takes a day longer than an instant
            one. If something is time-critical, say so in the subject line and it moves up.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
