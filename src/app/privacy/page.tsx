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
 *   - accounts and sessions run through Supabase Auth; we never see a password.
 *     Google is a second sign-in path (auth/login and auth/signup both call
 *     signInWithOAuth), so Google IS a processor for anyone who uses it and has
 *     to be named. It was missing from clause 4 until the 8 August audit.
 *   - profiles hold rather more than the three fields this page used to claim.
 *     PROFILE_COLUMNS in lib/account.ts is the authority: full_name, email,
 *     career_stage, location, practice_areas, linkedin_url,
 *     notification_preferences, break_started_at, break_until,
 *     deletion_requested_at. linkedin_url is the one that matters most, because
 *     it points at a page naming the person.
 *   - the tracker writes to `applications`; USER_DATA_TABLES in lib/account.ts
 *     lists every user-keyed table, and `rejection_log` was the one this notice
 *     had never mentioned
 *   - transactional mail goes through BREVO, not Resend (lib/email/send.ts), so
 *     it is a fourth processor holding name and email. Also missing until the
 *     8 August audit, and the most serious of the omissions: an unnamed
 *     processor is the kind of gap the Commission asks about first.
 *   - the quiz writes localStorage key `esquirely:prefs`
 *   - the bell writes `esquirely:notifications-seen`, `-read` and
 *     `esquirely:welcomed-at`; all three are read markers and stay on-device
 *   - saved roles and firms write `esquirely.saved.v1`, also on-device only.
 *     Note the dot, not a colon: it does not match the `esquirely:` prefix the
 *     rest use, which is why a grep for that prefix missed it for so long.
 *   - deletion is SELF-SERVE from /dashboard and runs on a 30 day grace period
 *     that cancelPendingDeletion() clears on any sign-in. The grace period is a
 *     material fact, not an implementation detail: a person can cancel their own
 *     deletion by signing in to see whether it worked. Clause 6 says so plainly.
 *   - there is NO analytics, advertising or third-party tracking, which is why
 *     there is no cookie consent banner — see the clause on cookies below
 *   - CV files are parsed in memory and NOT persisted anywhere; only extracted
 *     text is sent to Anthropic, and the buffer is discarded when the request
 *     ends. That is a genuine minimisation point and worth stating plainly.
 *   - what the tools WRITE is persisted, and that is the part people get wrong.
 *     `cv_reviews.result.rewrites[].original` quotes your CV back verbatim, so
 *     employer names, dates and degree details are in that row. `cv_generations`
 *     holds a whole generated CV. Saying "your CV is not stored" full stop was
 *     therefore always slightly generous, and is untenable now. The line the
 *     page takes instead is the one that is actually true: we do not keep your
 *     file, we keep what the tools produce from it.
 *
 * If any of that changes, this page has to change with it. A notice that
 * describes a system you no longer run is worse than no notice, because it is
 * evidence you were told what you were doing and said otherwise.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="8 August 2026"
      intro="What we collect, why we collect it, who else sees it, and what you can make us do about it. Written to be read, not to be survived."
      summary={{
        heading: 'Headnote',
        points: [
          'We collect your email, your account profile, and whatever you put in the tracker.',
          'Your CV file is never stored. What the tools write from it is: the review, and any CV you generate.',
          'Five processors: Supabase, Anthropic, Vercel, Brevo and, if you sign in with Google, Google.',
          'We do not sell your data or pass it to employers.',
          'You can delete your account yourself from the account page. It runs 30 days later, and signing in cancels it.',
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
            us. If you sign in with Google instead, there is no password at all: Google confirms who
            you are and passes us your email address and the name on your Google account. We never
            see your Google password, and we get nothing else from your Google account.
          </li>
          <li>
            <strong>Your profile.</strong> Your name, career stage, preferred location, the practice
            areas you are interested in, and a LinkedIn address if you add one. All optional, and
            you can edit or clear any of them on your account page. Bear in mind that a LinkedIn
            address points at a page naming you, so it identifies you more directly than the rest.
          </li>
          <li>
            <strong>Account settings.</strong> Which alerts you want to receive, and whether you
            have put your alerts on a break and until when. Settings rather than preferences,
            because they change what we send you.
          </li>
          <li>
            <strong>Application tracker entries.</strong> The roles you choose to record, the stage
            you have reached with each, and anything you log about a rejection.
          </li>
          <li>
            <strong>Text you submit to the career tools.</strong> Your CV, draft cover letter inputs,
            and interview practice answers.
          </li>
          <li>
            <strong>What the tools write back.</strong> Saved against your account so you can reopen
            it: your CV reviews, your drafted cover letters, your interview question sets, and any
            CV you ask us to generate. A review quotes lines from your CV back to you so you can see
            the rewrite, and a generated CV contains your name, contact details and full history, so
            treat these as holding the same personal data your CV does.
          </li>
          {/* Named in full, and deliberately not behind a consent banner.
              Everything listed here is either strictly necessary (the sign-in
              cookie) or first-party functional state that never leaves the
              device. Neither category requires prior consent under the NDPA or
              the GDPR. That threshold is for analytics, advertising and
              cross-site tracking, and there is none of any of those on this
              site: no Google Analytics, no pixels, no third-party cookies, no
              tags of any kind. What IS owed is a plain statement of what is
              stored and why, which is this clause.
              If an analytics or advertising tool is ever added, that changes:
              it would need consent BEFORE it loads, and a banner would have to
              come with it. */}
          <li>
            <strong>Cookies and browser storage.</strong> We use no advertising cookies, no
            analytics, and no third-party trackers. What we do store is:
            {' '}a sign-in cookie, set by Supabase, which is what keeps you signed in and is deleted
            when you sign out; and a small amount of storage in your own browser that never reaches
            us. <code>esquirely:prefs</code> holds your answers to the questions on the home page
            if you answer them without an account, and{' '}
            <code>esquirely:notifications-seen</code>, <code>esquirely:notifications-read</code> and{' '}
            <code>esquirely:welcomed-at</code>, which only record which notifications you have
            already looked at so the same ones stop being flagged as new. One more,{' '}
            <code>esquirely.saved.v1</code>, holds the roles and firms you have saved. Saved items
            live in your browser and are not copied to our database, which is the trade: they cost
            us nothing and tell us nothing, and they do not follow you to another device. Clearing
            your browser data removes all of these, and what you lose is the read markers and your
            saved list.
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

      <Clause n={2} heading="Your CV file is not stored. What we write from it is.">
        <p>
          This one deserves its own clause because it is easy to state too generously, and we would
          rather draw the line in the right place than in the flattering place.
        </p>
        <p>
          <strong>The file you upload is never kept.</strong> It is read into memory, the text is
          extracted, that text is sent for analysis, and the buffer is dropped when the request ends.
          It is not written to our database, our servers, or any storage bucket. We keep the file
          name so your history is recognisable, and nothing else of the document itself.
        </p>
        <p>
          <strong>The output is kept, and the output contains your CV.</strong> A review saves the
          scores, the feedback, and the rewritten bullets, and a rewritten bullet necessarily quotes
          your original line so you can compare the two. Your employers, dates, degree and matters
          are therefore in that record. If you generate an ATS-optimised CV, we save the finished
          document against your account so you can download it again, and that document holds your
          name, phone number, email address and full career history.
        </p>
        <p>
          So the accurate summary is not that we do not have your CV. It is that we never keep the
          file you sent, and we do keep what the tools made from it, because a history you cannot
          reopen is not a history. All of it is tied to your account, none of it is shown to anyone
          else, and clause 7 tells you how to make us delete it.
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
            <strong>Consent.</strong> Profile preferences, anything you put into the career tools,
            and the reviews, letters and generated CVs we save back against your account. You give it
            deliberately, generating a CV is a separate step you have to choose, and you can withdraw
            at any time.
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
            <strong>Anthropic</strong> for the AI behind CV review, CV generation, cover letter
            drafting and interview preparation. Receives the text you submit to those tools, and
            nothing else. It does not receive your account details or tracker, and it does not use
            what you send to train its models.
          </li>
          <li>
            <strong>Vercel</strong> for hosting and delivery. Handles technical logs.
          </li>
          <li>
            <strong>Brevo</strong> for the emails we send you, such as the welcome message. Receives
            your email address and your name so the message can be addressed and delivered, and
            nothing else. It does not receive your CV, your tool output or your tracker.
          </li>
          <li>
            <strong>Google</strong>, but only if you choose to sign in with Google. It then confirms
            your identity to us and tells us your email address and account name. If you sign up
            with an email and password instead, Google is not involved at any point.
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
          Anthropic, Vercel, Brevo and Google process data outside Nigeria. Where the destination has not been
          recognised as providing adequate protection, we rely on the providers&rsquo; contractual data
          protection terms, which oblige them to protect your data to a comparable standard. You can
          ask us for details of those arrangements.
        </p>
      </Clause>

      <Clause n={6} heading="How long we keep it">
        <ul>
          <li>Account, profile and tracker data: for as long as your account exists.</li>
          <li>
            Uploaded CV files: not retained at all, as set out in clause 2. Only the file name
            survives the request.
          </li>
          <li>
            Saved tool output, meaning reviews, cover letters, interview question sets and generated
            CVs: for as long as your account exists, or until you ask us to remove it. We do not
            expire them on a timer, because the point of saving them is that they are there when you
            come back.
          </li>
          <li>
            After you delete your account: your data is removed 30 days later, except anything we
            must keep by law. The 30 days are a grace period, not a queue, and they work in a way
            you should know about before you use the button. <strong>Signing in during those 30
            days cancels the deletion</strong> and puts your account back as it was. That is there
            for the person who deletes an account in a bad moment and wants it back on Tuesday, but
            it cuts both ways: if you mean to leave, do not sign in again to check, because checking
            is what undoes it.
          </li>
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
          <strong>You can delete everything without asking us.</strong> The button is on your{' '}
          <Link href="/dashboard">account page</Link>, it takes your account and all of the data
          attached to it, and clause 6 explains the 30 day grace period and how to avoid cancelling
          your own deletion by accident. You never need our permission and you never need to give a
          reason.
        </p>
        <p>
          Deleting one item rather than everything is still a request to us. If you want a single
          review or a single generated CV gone but want to keep your account, say which one and we
          will remove it. There is no button for that yet, which is slower than it should be, and it
          is on the list.
        </p>
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
          <a href="mailto:privacy@esquirely.com.ng">privacy@esquirely.com.ng</a>.
        </p>
      </Clause>
    </LegalPage>
  )
}
