import Link from 'next/link'
import LegalPage, { Clause } from '@/components/layout/LegalPage'

export const metadata = {
  title: 'Privacy Policy',
  description: 'What Esquirely collects, why, who it is shared with, and your rights under the Nigeria Data Protection Act 2023.',
}

/**
 * Privacy notice, written against what the code actually does rather than from
 * a template. Every claim here was checked in the source:
 *
 *   - accounts and sessions run through Supabase Auth; we never see a password
 *   - profiles hold career_stage, goals and location, and nothing else
 *   - the tracker writes to the `applications` table
 *   - the quiz writes localStorage key `esquirely:prefs`
 *   - CV files are parsed in memory and NOT persisted anywhere; only extracted
 *     text is sent to Anthropic, and the buffer is discarded when the request
 *     ends. That is a genuine minimisation point and worth stating plainly.
 *
 * If any of that changes, this page has to change with it. A notice that
 * describes a system you no longer run is worse than no notice, because it is
 * evidence you were told what you were doing and said otherwise.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="5 August 2026"
      intro="What we collect, why we collect it, who else sees it, and what you can make us do about it. Written to be read, not to be survived."
      summary={{
        heading: 'Headnote',
        points: [
          'We collect your email, three optional profile preferences, and whatever you put in the tracker.',
          'Your CV is never stored. It is read, analysed, and discarded.',
          'Three processors: Supabase, Anthropic and Vercel. Nobody else.',
          'We do not sell your data or pass it to employers.',
          'You can ask us to show it, fix it or delete it, free, within 30 days.',
        ],
        footnote: 'The gist, not the grounds. The numbered clauses below are what actually govern.',
      }}
    >
      <p className="legal-lead grotesk-regular">
        Esquirely is a careers platform for Nigerian lawyers and law students. This notice explains
        how we handle personal data under the Nigeria Data Protection Act 2023. We are the data
        controller for the information described here. Creating an account confirms that you have
        read this notice and agreed to it: the sign-up form asks you to tick that you accept both
        this notice and the <Link href="/terms">Terms of Use</Link>, and will not submit until you do.
      </p>

      <Clause n={1} heading="What we collect">
        <p>Only what the service needs to work:</p>
        <ul>
          <li>
            <strong>Account details.</strong> Your email address, and a password managed by our
            authentication provider. Passwords are hashed by that provider and are never visible to
            us.
          </li>
          <li>
            <strong>Profile preferences.</strong> Your career stage, what you are looking for, and
            your preferred location. All optional. You can use most of the site without them.
          </li>
          <li>
            <strong>Application tracker entries.</strong> The roles you choose to record, and the
            stage you have reached with each.
          </li>
          <li>
            <strong>Text you submit to the career tools.</strong> Your CV, draft cover letter inputs,
            and interview practice answers.
          </li>
          <li>
            <strong>Browser storage.</strong> If you answer the questions on the home page without an
            account, your answers are kept in your own browser under the key{' '}
            <code>esquirely:prefs</code>. That never reaches us until you create an account.
          </li>
          <li>
            <strong>Technical logs.</strong> Standard server and security logs kept by our hosting
            provider, including IP address and request time.
          </li>
        </ul>
        <p>
          We do not ask for your date of birth, national identification number, bank details, or any
          special category data, and you should not send them to us.
        </p>
      </Clause>

      <Clause n={2} heading="Your CV is not stored">
        <p>
          This is worth stating on its own because it is unusual. When you use the CV review tool,
          your file is read into memory, the text is extracted, and that text is sent for analysis.
          The file itself is <strong>never written to our database, our servers, or any storage
          bucket</strong>. When the request finishes, it is gone. If you want the feedback later, save
          it yourself, because we cannot retrieve it for you.
        </p>
      </Clause>

      <Clause n={3} heading="Why we are allowed to hold it">
        <p>Our lawful bases under the Act:</p>
        <ul>
          <li>
            <strong>Performance of a contract.</strong> Account details and tracker entries, because
            the service does not function without them.
          </li>
          <li>
            <strong>Consent.</strong> Profile preferences and anything you put into the career tools.
            You give it deliberately and you can withdraw at any time.
          </li>
          <li>
            <strong>Legitimate interests.</strong> Security logging and preventing abuse, balanced
            against your interests and limited to what that purpose needs.
          </li>
        </ul>
      </Clause>

      <Clause n={4} heading="Who else processes it">
        <p>
          We use a small number of providers. They act on our instructions and may not use your data
          for their own purposes:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> for the database and authentication. Holds your account,
            profile and tracker entries.
          </li>
          <li>
            <strong>Anthropic</strong> for the AI behind CV review, cover letter drafting and
            interview preparation. Receives the text you submit to those tools, and nothing else. It
            does not receive your account details or tracker.
          </li>
          <li>
            <strong>Vercel</strong> for hosting and delivery. Handles technical logs.
          </li>
        </ul>
        <p>
          We do not sell your data. We do not share it with employers or law firms. Applying for a
          role takes you to the employer&rsquo;s own site, and anything you submit there is governed by
          their privacy notice, not this one.
        </p>
      </Clause>

      <Clause n={5} heading="Data leaving Nigeria">
        <p>
          Anthropic and Vercel process data outside Nigeria. Where the destination has not been
          recognised as providing adequate protection, we rely on the providers&rsquo; contractual data
          protection terms, which oblige them to protect your data to a comparable standard. You can
          ask us for details of those arrangements.
        </p>
      </Clause>

      <Clause n={6} heading="How long we keep it">
        <ul>
          <li>Account, profile and tracker data: for as long as your account exists.</li>
          <li>
            After you delete your account: removed within 30 days, except anything we must keep by
            law.
          </li>
          <li>CV files: not retained at all, as set out in clause 2.</li>
          <li>Technical logs: kept for a short period for security and diagnostics.</li>
        </ul>
      </Clause>

      <Clause n={7} heading="Your rights">
        <p>Under the Act you may ask us to:</p>
        <ul>
          <li>give you a copy of the data we hold about you</li>
          <li>correct it if it is wrong</li>
          <li>delete it</li>
          <li>restrict or stop a particular use</li>
          <li>hand it over in a portable format</li>
          <li>stop relying on consent you have withdrawn</li>
        </ul>
        <p>
          Write to us and we will respond within 30 days. Exercising these rights costs nothing. If
          you are not satisfied with our answer you can complain to the Nigeria Data Protection
          Commission, and you do not need our permission to do so.
        </p>
      </Clause>

      <Clause n={8} heading="Security, honestly stated">
        <p>
          Access to the database is restricted, traffic is encrypted in transit, and passwords are
          hashed by our authentication provider. No system is perfectly secure, and we are not going
          to pretend otherwise. If a breach occurs that is likely to affect your rights, we will
          notify the Commission and you as the Act requires.
        </p>
      </Clause>

      <Clause n={9} heading="Children">
        <p>
          Esquirely is intended for law students and qualified lawyers, and is not directed at
          children under 13. If you believe a child has given us personal data, tell us and we will
          delete it.
        </p>
      </Clause>

      <Clause n={10} heading="Changes">
        <p>
          If we change what we collect or who processes it, we will update this page and move the
          date at the top. Material changes will be flagged to account holders.
        </p>
      </Clause>

      <Clause n={11} heading="Contact">
        <p>
          For anything in this notice, including requests under clause 7, contact us at{' '}
          <a href="mailto:privacy@esquirely.com">privacy@esquirely.com</a>.
        </p>
      </Clause>
    </LegalPage>
  )
}
