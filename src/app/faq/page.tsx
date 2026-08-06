import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ',
  description:
    'Straight answers about how Esquirely works: what happens to your CV, where the listings come from, what it costs, and what we cannot do for you.',
}

/**
 * Frequently asked questions.
 *
 * Built on <details>/<summary> rather than a React accordion. It needs no
 * JavaScript, so the answers are in the HTML for search engines and readable if
 * the bundle fails; keyboard and screen reader behaviour come from the browser
 * rather than from ARIA we would have to maintain. The whole page is a server
 * component as a result.
 *
 * The answers are deliberately specific and occasionally unflattering. A FAQ
 * that only says yes is marketing, and the two questions people actually worry
 * about here are whether their CV is being kept and whether this is a job
 * guarantee. Both are answered first and answered honestly.
 */

type QA = { q: string; a: React.ReactNode }
type Group = { heading: string; items: QA[] }

/** Anchor id from a heading, so the index and the sections cannot drift apart. */
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const GROUPS: Group[] = [
  {
    heading: 'Your data',
    items: [
      {
        q: 'Do you keep my CV?',
        a: (
          <>
            <p>
              No. When you upload a CV for review, the file is read in memory to pull out the text,
              the text is sent for review, and the file is discarded. It is never written to disk
              and never stored in our database.
            </p>
            <p>
              What we do save is the review itself, against your account, so you can open it again
              later. You can see exactly what that covers in the{' '}
              <Link href="/privacy">privacy policy</Link>.
            </p>
          </>
        ),
      },
      {
        q: 'Is my CV used to train an AI model?',
        a: (
          <p>
            No. Your CV goes to Anthropic&rsquo;s API to generate your review and is not used to
            train any model. We do not sell, share, or license anything you upload.
          </p>
        ),
      },
      {
        q: 'Can I delete my account and everything in it?',
        a: (
          <p>
            Yes. Write to us and we will delete your account and every review, cover letter and
            interview session attached to it. Under the Nigeria Data Protection Act 2023 that is
            your right, not a favour.
          </p>
        ),
      },
    ],
  },
  {
    heading: 'Jobs and firms',
    items: [
      {
        q: 'Where do the listings come from?',
        a: (
          <p>
            From the firms and employers themselves, and from the recruiters they use. We link
            straight to the original posting or application address, so you apply to the employer,
            not to us. We do not repost adverts in full.
          </p>
        ),
      },
      {
        q: 'How current are they?',
        a: (
          <p>
            Roles come off the board once their deadline passes. Anything marked rolling has no
            stated deadline and is reviewed as it arrives. If you find something stale, tell us and
            it goes.
          </p>
        ),
      },
      {
        q: 'Why are there so few internships?',
        a: (
          <p>
            Because Nigerian firms almost never advertise them. Placements and attachments here are
            arranged by writing to the firm directly, and a good speculative letter is how most
            students get in. Every profile in the{' '}
            <Link href="/firms">firm directory</Link> carries an address for exactly that.
          </p>
        ),
      },
      {
        q: 'How does a firm get into the directory?',
        a: (
          <p>
            We add firms on merit and on demand, not for payment. Nobody has paid to appear, and
            nobody can pay to rank higher. Details come from each firm&rsquo;s own site where it is
            reachable, and from published legal directories where it is not.
          </p>
        ),
      },
      {
        q: 'I run a firm. How do I post a role?',
        a: (
          <p>
            Send it to us and we will list it. There is no charge and no account needed at the
            moment.
          </p>
        ),
      },
    ],
  },
  {
    heading: 'The tools',
    items: [
      {
        q: 'What do the CV, cover letter and interview tools actually do?',
        a: (
          <>
            <p>
              They read what you give them and write back something specific. The CV review returns
              scores, real weaknesses, and rewritten versions of your own bullets so you can see
              what stronger looks like. The cover letter tool drafts a letter for a named role at a
              named employer. Interview prep generates questions an interviewer in that seat would
              actually ask, then critiques your answers.
            </p>
            <p>
              All three are tuned to the Nigerian market, so they understand LL.B, B.L, call to bar
              and NYSC rather than treating them as noise.
            </p>
          </>
        ),
      },
      {
        q: 'Why does the CV review take so long?',
        a: (
          <p>
            Because it reads the whole document and writes several hundred words back. Expect
            somewhere under a minute. If it fails, it will tell you why rather than spinning.
          </p>
        ),
      },
      {
        q: 'Do I need an account?',
        a: (
          <p>
            For the tools, yes, so your reviews are saved and you can come back to them. Browsing
            jobs, scholarships and firms needs nothing at all.
          </p>
        ),
      },
      {
        q: 'Should I send what the tool writes without reading it?',
        a: (
          <p>
            No. It is a draft and a second opinion, not a signature. Read it, cut what is not true
            of you, and keep your own voice. Anything you send goes out under your name.
          </p>
        ),
      },
    ],
  },
  {
    heading: 'Scholarships',
    items: [
      {
        q: 'Are these checked?',
        a: (
          <p>
            Each one was verified against the provider&rsquo;s own page, and every entry has to be
            open to law. That last part rules out most of what the general &ldquo;scholarships for
            African students&rdquo; lists carry, because they restrict by subject and the funded
            subjects are overwhelmingly STEM.
          </p>
        ),
      },
      {
        q: 'A deadline looks wrong.',
        a: (
          <p>
            Cycles move every year. We recheck each term and mark entries open, upcoming or closed,
            but the provider&rsquo;s page is always the authority. Tell us when you spot a change.
          </p>
        ),
      },
    ],
  },
  {
    heading: 'The straight answers',
    items: [
      {
        q: 'What does it cost?',
        a: (
          <p>
            Nothing. Everything on Esquirely is free to use right now. If that ever changes, it will
            change with notice, and anything you have already saved stays yours.
          </p>
        ),
      },
      {
        q: 'Can you get me a job?',
        a: (
          <p>
            No, and be wary of anyone who says otherwise. We can put the openings in one place, tell
            you what a firm does before you apply, and make your application read better than it did
            an hour ago. The application is still yours to make and the decision is still theirs.
          </p>
        ),
      },
      {
        q: 'Who is behind this?',
        a: (
          <p>
            Esquirely is built in Lagos by Nigerian lawyers, for the Nigerian bar and the students
            joining it.
          </p>
        ),
      },
      {
        q: 'My question is not here.',
        a: (
          <p>
            Then ask it. We would rather answer it once here than have fifty people wonder the same
            thing.
          </p>
        ),
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <>
      <main className="page-main">
        <PageHeader
          tone="ink"
          heading="Questions, answered."
          subcopy="What happens to your CV, where the listings come from, what it costs, and what we cannot do for you."
        />

        <div className="shell faq-shell">
          {/* Sticky index, so the width is filled with navigation rather than
              with a centred column and two empty margins. A FAQ is the exact
              document type this helps most: nobody reads it top to bottom, they
              arrive with one question and want the section it lives in. */}
          <nav className="faq-index" aria-label="Sections">
            <ol>
              {GROUPS.map(group => (
                <li key={group.heading}>
                  <a href={`#${slug(group.heading)}`} className="grotesk-regular">
                    {group.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="faq-main">
          {GROUPS.map((group, i) => (
            <section key={group.heading} id={slug(group.heading)} className="faq-group">
              {/* Same hanging greyed numeral as the ambassador index and the
                  legal clauses, so a section heading is recognisably the same
                  object wherever it appears. */}
              <h2 className="grotesk-bold faq-group-heading">
                <span className="display-black doc-num faq-group-num" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {group.heading}
              </h2>

              <div className="faq-list">
                {group.items.map(item => (
                  /* No `open` on any of them. A FAQ that starts expanded is just
                     a long article with rules between the paragraphs. */
                  <details key={item.q} className="faq-item">
                    <summary className="faq-question">
                      <span className="grotesk-bold">{item.q}</span>
                      <span className="faq-marker" aria-hidden>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <div className="grotesk-regular faq-answer">{item.a}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="faq-tail">
            <p className="display-black faq-tail-heading">Still stuck?</p>
            <p className="grotesk-regular faq-tail-body">
              Ask us directly. Questions that come up more than once end up on this page.
            </p>
            <a href="mailto:hello@esquirely.com" className="grotesk-bold faq-tail-cta">
              hello@esquirely.com
            </a>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
