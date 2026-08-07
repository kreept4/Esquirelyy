import Link from 'next/link'
import LegalPage, { Clause } from '@/components/layout/LegalPage'

export const metadata = {
  title: 'Terms of Use',
  description: 'The terms on which Esquirely is provided, including accuracy, third-party content, the career tools, and limits on liability.',
}

/**
 * Terms of use.
 *
 * The brief was "exclude us from any form of liability". That is not achievable
 * and attempting it is counterproductive: statutory data protection duties
 * cannot be contracted out of, liability for death, personal injury and fraud
 * cannot be excluded, and a blanket exclusion in a consumer-facing document
 * invites a court to strike it as unfair, potentially taking the enforceable
 * parts down with it.
 *
 * So this does the thing that actually protects the business. It limits
 * liability as far as the law allows and no further, and it does the heavier
 * lifting further up the document by defining what Esquirely IS: a signposting
 * service that indexes third-party listings and offers software suggestions. A
 * claim mostly fails because the service never promised the thing, not because
 * a clause at the bottom says it is not liable.
 *
 * Clause 8 is deliberately carved out rather than absolute. That carve-out is
 * what makes the rest of it stand up.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="7 August 2026"
      intro="What Esquirely is, what it is not, and where our responsibility begins and ends. Plain terms, because terms nobody reads protect nobody."
      summary={{
        heading: 'Headnote',
        points: [
          'We point you to opportunities other people published. We are not a recruiter and not a party to your application.',
          'Always read the employer’s own posting. Where it differs from our summary, theirs governs.',
          'The AI tools give suggestions, not advice. Check anything before you send it.',
          'A CV we generate for you is yours. We claim nothing in it, and we cannot promise any system will parse it.',
          'Firm logos identify the firm. They do not mean the firm endorses us.',
          'We limit our liability as far as the law allows, and no further.',
        ],
        footnote: 'The gist, not the grounds. The numbered clauses below are what actually govern.',
      }}
    >
      <p className="legal-lead grotesk-regular">
        By using Esquirely you agree to these terms. If you do not, please do not use the site.
        Creating an account is itself an acceptance: the sign-up form asks you to tick that you
        agree to these Terms of Use and to the{' '}
        <Link href="/privacy">Privacy Notice</Link>, and submitting it confirms that you have.
      </p>

      <Clause n={1} heading="What Esquirely is">
        <p>
          Esquirely is a signposting service. We collect and index legal opportunities, scholarships
          and firm information from employers, their recruitment systems, and public sources, and we
          present them in one place so you can find them.
        </p>
        <p>We are not any of the following, and nothing on the site should be read as suggesting otherwise:</p>
        <ul>
          <li>a recruitment agency, employment agency or employment business</li>
          <li>a party to any application, interview or offer between you and an employer</li>
          <li>a provider of legal advice, or of career advice on which you should rely alone</li>
          <li>affiliated with, endorsed by, or acting for any firm or organisation listed</li>
        </ul>
      </Clause>

      <Clause n={2} heading="Listings come from other people">
        <p>
          Employers write their own vacancies. We summarise them in our own words, quote a short
          extract, and link to the source. We do not control what an employer publishes, whether a
          role is still open, whether the stated requirements are complete, or whether the employer
          behaves properly.
        </p>
        <p>
          <strong>Always read the employer&rsquo;s own posting before you apply.</strong> Every listing
          links to it. Where our summary and the employer&rsquo;s posting differ, theirs governs.
        </p>
        <p>
          We try to keep the board current and remove roles that have closed, but we cannot promise a
          listing is open, accurate or genuine at the moment you read it.
        </p>
      </Clause>

      <Clause n={3} heading="The career tools give suggestions, not advice">
        <p>
          CV review, CV generation, cover letter drafting and interview preparation are produced by an
          AI system. Output can be wrong, incomplete or unsuitable for your situation, and it is not
          professional, legal or career advice.
        </p>
        <p>
          Read anything it produces, exercise your own judgement, and take responsibility for what you
          send to an employer. Do not submit output you have not checked.
        </p>
        <p>
          <strong>Generating a CV is something you choose, not something a review triggers.</strong>{' '}
          Reviewing a CV and generating one are separate actions, and we will not rewrite your CV
          unless you ask for it.
        </p>
        <p>
          <strong>A CV we generate for you is yours.</strong> We claim no ownership of it and no
          licence over it. Use it, edit it, send it anywhere, with no credit to us.
        </p>
        <p>
          Two things we cannot promise about it. The first is accuracy. The generator works from what
          you gave it and is instructed never to invent an employer, a qualification, a date or an
          achievement, but an AI system can still get something wrong, and a CV goes out under your
          name and not ours. <strong>Read every line before you send it, and correct anything that is
          not true of you.</strong> The second is compatibility. We build the document to be read
          cleanly by applicant tracking systems, but those systems are numerous, private and change
          without notice. We cannot guarantee any given employer&rsquo;s software will parse it, that
          a score will improve, or that you will be shortlisted.
        </p>
      </Clause>

      <Clause n={4} heading="Firm and employer marks">
        <p>
          Names, logos and trade marks belonging to firms and organisations are used only to identify
          the organisation the listing or profile refers to. We claim no rights in them and no
          association with their owners, and their appearance does not imply endorsement of Esquirely.
        </p>
        <p>
          If you own a mark or a listing and want it changed or removed, write to{' '}
          <a href="mailto:legal@esquirely.com">legal@esquirely.com</a>. We act on reasonable requests
          promptly and without argument.
        </p>
      </Clause>

      <Clause n={5} heading="Our own content">
        <p>
          The site design, our written summaries, and the way the information is organised belong to
          Esquirely. You may read, link to and share it. You may not scrape it, republish it in bulk,
          or use it to build a competing database.
        </p>
        <p>
          This clause does not reach what the tools write for you. Your reviews, cover letters and
          generated CVs are yours, as clause 3 says.
        </p>
      </Clause>

      <Clause n={6} heading="Your account">
        <p>
          Keep your login details to yourself and tell us if you think someone else has them. Give us
          accurate information. Do not use the site to harass anyone, post misleading vacancies, or
          try to break it. We may suspend an account that does.
        </p>
      </Clause>

      <Clause n={7} heading="Availability">
        <p>
          We provide Esquirely as it is and as it is available. We do not promise it will be
          uninterrupted, error free, or permanently available, and we may change or discontinue
          features. We will give notice of significant changes where we reasonably can.
        </p>
      </Clause>

      <Clause n={8} heading="Limits on our liability">
        <p>
          <strong>Nothing in these terms limits liability that cannot lawfully be limited.</strong>{' '}
          That includes death or personal injury caused by our negligence, fraud or fraudulent
          misrepresentation, and our obligations under the Nigeria Data Protection Act 2023. Any
          attempt to exclude those would be void, so we do not attempt it.
        </p>
        <p>Subject to that, and to the extent the law allows:</p>
        <ul>
          <li>
            we are not liable for the acts, omissions, decisions or conduct of any employer,
            recruiter or organisation you find through Esquirely
          </li>
          <li>
            we are not liable for a listing being inaccurate, out of date, withdrawn or not genuine,
            nor for a deadline you miss
          </li>
          <li>
            we are not liable for any outcome of an application, including a rejection or an offer
            withdrawn
          </li>
          <li>
            we are not liable for reliance on career tool output that you did not check, including
            sending a generated CV to an employer without reading it
          </li>
          <li>
            we are not liable for an applicant tracking system failing to parse, rank or accept a
            document produced by the tools
          </li>
          <li>
            we are not liable for indirect or consequential loss, or for loss of profit, opportunity,
            earnings or reputation
          </li>
        </ul>
        <p>
          Where liability cannot be excluded but can be limited, our total liability to you for all
          claims in any twelve month period is limited to the greater of the amount you paid us in
          that period, or ten thousand naira.
        </p>
        <p>
          These limits are reasonable because Esquirely is a free service that points you to
          opportunities published by others, and because you retain the decision whether to apply.
        </p>
      </Clause>

      <Clause n={9} heading="Links to other sites">
        <p>
          Applying takes you to an employer&rsquo;s own site or applicant tracking system. We do not
          control those, we are not responsible for them, and their terms and privacy notices apply
          once you arrive.
        </p>
      </Clause>

      <Clause n={10} heading="Privacy">
        <p>
          How we handle personal data is set out in our <a href="/privacy">privacy notice</a>, which
          forms part of these terms.
        </p>
      </Clause>

      <Clause n={11} heading="Changes to these terms">
        <p>
          We may update these terms. The date at the top shows when they last changed, and continuing
          to use the site after a change means you accept it. Material changes will be flagged to
          account holders.
        </p>
      </Clause>

      <Clause n={12} heading="Governing law">
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian
          courts have jurisdiction over any dispute. Nothing here removes a right you have under
          Nigerian consumer protection law.
        </p>
      </Clause>

      <Clause n={13} heading="Contact">
        <p>
          Questions, complaints and takedown requests:{' '}
          <a href="mailto:legal@esquirely.com">legal@esquirely.com</a>.
        </p>
      </Clause>
    </LegalPage>
  )
}
