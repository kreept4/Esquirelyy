import JsonLd, { SITE_URL, breadcrumb, openGraph } from '@/components/seo/JsonLd'
import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ',
  description:
    'Straight answers about how Esquirely works: what happens to your CV, where the listings come from, what it costs, and what we cannot do for you.',
  alternates: { canonical: '/faq' },
  openGraph: openGraph({ path: '/faq' }),
}

/* THE `short` FIELD, WHICH IS WHY THIS TYPE HAS TWO ANSWERS IN IT.
 *
 * `a` is a React node and schema needs text, so every question carries a
 * plain-text answer of under about forty five words that the FAQPage block is
 * generated from. Stringifying the nodes was the obvious alternative and is
 * worse: it would emit three paragraphs of qualification into a field a
 * consumer shows as one, and it would silently change the markup every time
 * somebody edited a sentence of prose.
 *
 * Writing them separately is not a workaround, it is the discipline the format
 * rewards. Extraction takes the first coherent span it finds, so the sentence
 * that answers the question has to come before the sentence that qualifies it.
 * "Not the file" leads; what we do keep follows. Read the shorts in order and
 * they are also the best summary of the product that exists anywhere in this
 * repo, which is a fair test of whether they are honest.
 *
 * ⚠ A `short` MAY NEVER CLAIM MORE THAN ITS `a` DOES. Same rule as the firm
 * schema: the gap between markup and page is what Google issues manual actions
 * for, and here it would also be a promise to a reader that the page then
 * breaks. If you edit an answer, edit its short in the same commit.
 *
 * THREE QUESTIONS WERE REWORDED TO STAND ALONE. "Are these checked?", "How
 * current are they?" and "My question is not here." all read fine under a
 * heading and mean nothing extracted on their own, which is the state a
 * question in this block is served in. They now name their subject. */

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
 *
 * "Do you keep my CV?" used to be a flat no. It is now a qualified no, because
 * the generator saves a finished CV against the account and a review already
 * quotes the original bullets back. The honest answer is longer than the
 * comfortable one, and it leads the page anyway. If the storage model changes
 * again, this answer and clause 2 of the privacy notice move together.
 */

type QA = { q: string; a: React.ReactNode; short: string }
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
        short:
          'Not the file. It is read in memory and then discarded, never written to disk. We do ' +
          'save what the tools write: your review, and any CV generated for you. Both sit against ' +
          'your account, are private, and can be deleted.',
        a: (
          <>
            <p>
              Not the file. When you upload a CV, it is read in memory to pull out the text, the text
              is sent for review, and the file is discarded. It is never written to disk and never
              stored in our database. We keep the file name so your history is recognisable, and
              nothing else of the document itself.
            </p>
            <p>
              We do save what the tools write. That means the review, and any CV you generate. It is
              worth being blunt about what that contains: a review quotes your own bullets back at
              you so you can see the rewrite, so your employers and dates are in it, and a generated
              CV is a full CV with your name, phone number and email on it. Saying we do not have
              your CV would be too neat. We do not have your <em>file</em>, and we do have what we
              made from it.
            </p>
            <p>
              All of it sits against your account, none of it is shown to anyone else, and you can
              have any of it deleted. The <Link href="/privacy">privacy policy</Link> sets out the
              detail in clause 2.
            </p>
          </>
        ),
      },
      {
        q: 'What happens to a CV the generator writes for me?',
        short:
          'It is saved against your account so you can download it again, and it appears in your ' +
          'history. Nobody else sees it and it is never sent to employers. It is also yours ' +
          'outright: we claim no ownership and no licence over it.',
        a: (
          <>
            <p>
              It is saved against your account so you can download it again instead of regenerating
              it, and it appears in your history alongside your reviews. Nobody else sees it. We do
              not send it to employers, and there is no version of Esquirely where a firm browses
              candidate CVs.
            </p>
            <p>
              It is also yours outright. We claim no ownership and no licence over it, so edit it,
              rename it and send it wherever you like without crediting us.
            </p>
          </>
        ),
      },
      {
        q: 'Can I delete a saved review or a generated CV without deleting my account?',
        short:
          'Yes, and no reason is needed. There is no delete button in the history drawer yet, so ' +
          'for now it takes an email rather than a click. That is slower than it should be and ' +
          'is on the list to fix.',
        a: (
          <p>
            Yes. Tell us which one and it goes, and you do not have to give a reason. There is no
            delete button in the history drawer yet, so for now it is an email rather than a click,
            which is slower than it should be and is on the list to fix.
          </p>
        ),
      },
      {
        q: 'Is my CV used to train an AI model?',
        short:
          'No. Your CV goes to Anthropic’s API to produce your review or to write your new ' +
          'CV, and is not used to train any model. We do not sell, share or license anything you ' +
          'upload, or anything the tools write for you.',
        a: (
          <p>
            No. Your CV goes to Anthropic&rsquo;s API to produce your review or to write your new
            CV, and is not used to train any model. We do not sell, share, or license anything you
            upload or anything the tools write for you.
          </p>
        ),
      },
      {
        q: 'Can I delete my account and everything in it?',
        short:
          'Yes, from a button on your account page, without asking us. It takes every review, ' +
          'generated CV, cover letter, interview session and tracker entry with it. Deletion runs ' +
          '30 days later rather than straight away, and signing in during those 30 days cancels it.',
        a: (
          <>
            <p>
              Yes, and you do not have to ask us. There is a button on your{' '}
              <Link href="/dashboard">account page</Link>. It takes your account and every review,
              generated CV, cover letter, interview session and tracker entry attached to it. Under
              the Nigeria Data Protection Act 2023 that is your right, not a favour.
            </p>
            <p>
              One thing worth knowing before you press it. Deletion runs 30 days later rather than
              straight away, and signing in during those 30 days cancels it. That is deliberate:
              people delete accounts at 2am after a bad rejection, and coming back should be enough
              to undo it. But it does mean that if you want to be gone, stay gone. Do not sign in to
              check whether it worked.
            </p>
          </>
        ),
      },
    ],
  },
  {
    heading: 'Jobs and firms',
    items: [
      {
        q: 'Where do the listings come from?',
        short:
          'From the firms and employers themselves, and from the recruiters they use. We link ' +
          'straight to the original posting or application address, so you apply to the employer ' +
          'rather than to us. We do not repost adverts in full.',
        a: (
          <p>
            From the firms and employers themselves, and from the recruiters they use. We link
            straight to the original posting or application address, so you apply to the employer,
            not to us. We do not repost adverts in full.
          </p>
        ),
      },
      {
        q: 'How current are the listings?',
        short:
          'Roles come off the board once their deadline passes. Anything marked rolling has no ' +
          'stated deadline and is reviewed as it arrives. If you find something stale, tell us ' +
          'and it goes.',
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
        short:
          'Because Nigerian firms almost never advertise them. Placements and attachments here ' +
          'are arranged by writing to the firm directly, and a good speculative letter is how ' +
          'most students get in. Every profile in the firms directory carries an address for that.',
        a: (
          <p>
            Because Nigerian firms almost never advertise them. Placements and attachments here are
            arranged by writing to the firm directly, and a good speculative letter is how most
            students get in. Every profile in the{' '}
            <Link href="/firms">firms directory</Link> carries an address for exactly that.
          </p>
        ),
      },
      {
        q: 'How does a firm get into the directory?',
        short:
          'On merit and on demand, never for payment. Nobody has paid to appear and nobody can ' +
          'pay to rank higher. Details come from each firm’s own site where it is reachable, ' +
          'and from published legal directories where it is not.',
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
        short:
          'Send it to us and we will list it. There is no charge, and no account is needed at ' +
          'the moment.',
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
        short:
          'They read what you give them and write back something specific: a scored CV review ' +
          'with your own bullets rewritten, a cover letter for a named role at a named employer, ' +
          'and interview questions with a critique of your answers. All are tuned to Nigeria.',
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
              All of them are tuned to the Nigerian market, so they understand LL.B, B.L, call to bar
              and NYSC rather than treating them as noise.
            </p>
          </>
        ),
      },
      {
        q: 'What is the difference between reviewing a CV and generating one?',
        short:
          'A review tells you what is wrong and shows you stronger versions of your own lines, ' +
          'and you edit your CV yourself. Generating writes the whole document for you, formatted ' +
          'to survive an applicant tracking system, and hands you a Word file and a PDF.',
        a: (
          <>
            <p>
              A review tells you what is wrong and shows you stronger versions of your own lines. You
              then go and edit your CV yourself. Generating takes the same findings and writes the
              whole document for you, formatted to survive an applicant tracking system, and hands
              you a Word file and a PDF.
            </p>
            <p>
              They are separate choices. Reviewing does not generate anything, and you can generate
              without reviewing first. Nothing gets rewritten unless you press the button.
            </p>
          </>
        ),
      },
      {
        q: 'Will a generated CV get me past the ATS?',
        short:
          'It is built to: standard headings, clean dates, no tables, no columns, no graphics and ' +
          'a real text layer. But those systems are numerous, private and change without notice, ' +
          'so nobody can honestly guarantee a given employer’s software will parse a given file.',
        a: (
          <p>
            It is built to. Standard headings, clean dates, no tables, no columns, no graphics, and a
            real text layer, which is most of what those systems trip over. But they are numerous,
            private, and change without telling anyone, so nobody can honestly guarantee a given
            employer&rsquo;s software will parse a given file. Anyone promising you a score is
            guessing.
          </p>
        ),
      },
      {
        q: 'Why does the CV review take so long?',
        short:
          'Because it reads the whole document and writes several hundred words back. Expect ' +
          'somewhere under a minute. If it fails, it will tell you why rather than spinning.',
        a: (
          <p>
            Because it reads the whole document and writes several hundred words back. Expect
            somewhere under a minute. If it fails, it will tell you why rather than spinning.
          </p>
        ),
      },
      {
        q: 'Do I need an account?',
        short:
          'Yes, for almost everything. The jobs board, scholarships, the news page and all three ' +
          'tools sit behind sign-in. The firms directory, the home page, this page, about, contact ' +
          'and the legal pages stay open. An account is free and takes an email address.',
        a: (
          <>
            {/* The firms directory used to be named in this list, and it stopped
                being true when /firms came out from behind the gate. A FAQ that
                tells a reader they need an account for the page they are one
                click from reading for free is worse than no FAQ, because it is
                the answer they will believe. If PUBLIC_PATHS in middleware.ts
                changes again, this sentence and its short change with it. */}
            <p>
              Yes, for almost everything. The jobs board, scholarships, the news page and all three
              tools sit behind sign-in. What stays open is the{' '}
              <Link href="/firms">firms directory</Link>, this page, the home page, about, contact,
              the ambassador terms, the page for employers who want to list a role, and the privacy
              and terms pages.
            </p>
            <p>
              It is free, it takes an email address, and it is there so your tracker, your saved
              roles and everything the tools write stay attached to you and come back when you do.
            </p>
          </>
        ),
      },
      {
        q: 'Should I send what the tool writes without reading it?',
        short:
          'No. It is a draft and a second opinion, not a signature. Read it, cut what is not true ' +
          'of you, and keep your own voice. Anything you send goes out under your name.',
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
        q: 'Are the scholarships checked?',
        short:
          'Yes. Each one was verified against the provider’s own page, and every entry has to be ' +
          'open to law. That last requirement rules out most of what the general “scholarships ' +
          'for African students” lists carry, because they restrict by subject and fund STEM.',
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
        q: 'A scholarship deadline looks wrong.',
        short:
          'Cycles move every year. We recheck each term and mark entries open, upcoming or closed, ' +
          'but the provider’s own page is always the authority. Tell us when you spot a change.',
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
        short:
          'Nothing. Everything on Esquirely is free to use right now. If that ever changes, it ' +
          'will change with notice, and anything you have already saved stays yours.',
        a: (
          <p>
            Nothing. Everything on Esquirely is free to use right now. If that ever changes, it will
            change with notice, and anything you have already saved stays yours.
          </p>
        ),
      },
      {
        q: 'Can you get me a job?',
        short:
          'No, and be wary of anyone who says otherwise. We can put the openings in one place, ' +
          'tell you what a firm does before you apply, and make your application read better. ' +
          'The application is still yours to make, the decision still theirs.',
        a: (
          <p>
            No, and be wary of anyone who says otherwise. We can put the openings in one place, tell
            you what a firm does before you apply, and make your application read better than it did
            an hour ago. The application is still yours to make and the decision is still theirs.
          </p>
        ),
      },
      {
        q: 'Who is behind Esquirely?',
        short:
          'Esquirely is built in Abuja by Nigerian lawyers. The people behind it are named on the ' +
          'about page.',
        a: (
          <p>
            Esquirely is built in Abuja by Nigerian lawyers. The people behind it are named on
            the <a href="/about">about page</a>.
          </p>
        ),
      },
      {
        q: 'What if my question is not answered here?',
        short:
          'Then ask it. We would rather answer it once here than have fifty people wonder the ' +
          'same thing.',
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

/**
 * The FAQ, stated for machines.
 *
 * WHAT THIS IS AND IS NOT WORTH. It will almost certainly not draw an expanding
 * FAQ block in a Google result: that treatment was restricted in August 2023 to
 * well-known government and health sites, and a legal careers directory in
 * Nigeria is not getting it. Anyone selling FAQ schema on the promise of rich
 * results is selling a 2022 product.
 *
 * It is here for the other consumer. Twenty two question-and-answer pairs in a
 * declared format is the single most retrievable shape a page can have, and the
 * questions are the literal sentences somebody types into an assistant: what
 * does it cost, do you keep my CV, can you get me a job. An assistant answering
 * one of those about Esquirely either quotes this block or invents something.
 * Given the third question is whether we are a job guarantee, the difference
 * between those two outcomes is worth a JSON blob.
 *
 * Built from `short`, never from `a`. See the note above the QA type.
 *
 * The answers sit inside collapsed <details>, which is allowed: the requirement
 * is that the text is in the HTML, not that it is visible without a click, and
 * <details> ships its content either way. That is the same property that made
 * the element the right choice for readers, and it is why this page could carry
 * schema at all without being rebuilt.
 */
function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq#faq`,
    url: `${SITE_URL}/faq`,
    name: 'Esquirely FAQ',
    inLanguage: 'en-NG',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: GROUPS.flatMap(group =>
      group.items.map(item => ({
        '@type': 'Question',
        name: item.q,
        answerCount: 1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.short,
          /* The section anchor rather than the bare page, so a consumer that
             cites one answer links a reader to the part of the page it came
             from. Only the five group headings are anchored, which is why this
             is the group's id and not the question's: pointing at an id the
             page does not have would be worse than pointing at the page. */
          url: `${SITE_URL}/faq#${slug(group.heading)}`,
        },
      }))
    ),
  }
}

export default function FAQPage() {
  return (
    <>
      <JsonLd
        data={[
          faqSchema(),
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ]}
      />
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
            <a href="mailto:hello@esquirely.com.ng" className="grotesk-bold faq-tail-cta">
              hello@esquirely.com.ng
            </a>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
