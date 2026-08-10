'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { readReferral } from '@/lib/referral'
import { Eye, EyeOff } from 'lucide-react'

/* Matches the Supabase project's Auth > Email OTP expiry, set to 600s there.
   That setting is server-side and can't be read from the client, so this is
   duplicated by hand — if the dashboard value changes, update this too. */
const OTP_EXPIRY_MINUTES = 10
/* A code was just sent the moment the OTP screen mounts, so resend starts
   cooled down rather than immediately available. */
const RESEND_COOLDOWN_SECONDS = 60

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resent, setResent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [existingAccount, setExistingAccount] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    /* Read at submit rather than held in state. The code was stored when this
       person first arrived, possibly days ago on another page, and reading it
       here means the signup form never has to know it exists. */
    const referral = readReferral()
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        /* `referred_by` rides in on the signup metadata rather than being
           written afterwards, because the profile row is created by a database
           trigger the instant the auth user exists. A second write from the
           browser would race that trigger, and would also be a write the
           account holder could forge into somebody else's total. Passed here it
           is set once, by the trigger, at creation. Absent when nobody sent
           them, which is the normal case. */
        data: { full_name: fullName, ...(referral ? { referred_by: referral } : {}) },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }

    /**
     * The address is already registered.
     *
     * One account per email is enforced by the database — a second signup does
     * NOT create a second user, measured directly against the project. What it
     * does instead is return 200 with a decoy user object: a random id, no
     * session, and `identities: []`. That is GoTrue refusing to confirm or deny
     * that the address is in use, and an empty identities array is the
     * documented way to tell the decoy from a real new account, which always
     * comes back with exactly one identity.
     *
     * Untreated this was the worse failure of the two: the page took the 200 as
     * success and showed the code screen, so someone who already had an account
     * sat waiting for a code that was never going to arrive.
     *
     * A NOTE ON WHAT THIS GIVES AWAY. Saying "this address already has an
     * account" is, strictly, email enumeration — someone can learn whether an
     * address is registered here. That is the exact thing GoTrue's decoy exists
     * to prevent, so overriding it is a deliberate trade, not an oversight. It
     * is made because the alternative is a dead end with no way out for a real
     * person who simply forgot they had signed up, and because membership of a
     * public careers board is not a secret worth a broken signup. If that
     * calculus ever changes, delete this block and the decoy behaviour returns
     * on its own.
     */
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setExistingAccount(true)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown(s => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  /**
   * Verify the six-digit code.
   *
   * `type: 'signup'`, not `'email'`. `'email'` is what `signInWithOtp` issues;
   * a code minted by `signUp` is a signup confirmation and verifying it under
   * the wrong type fails with a token-mismatch that reads like a wrong code.
   *
   * The welcome message is fired here and nowhere else, because this is the
   * first instant the address is known to be real.
   */
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setVerifying(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'signup',
    })
    if (error) { setError(error.message); setVerifying(false); return }

    /* Deliberately not awaited for its result: a welcome that failed to send
       must not hold up, or fail, an account that was created correctly. */
    fetch('/api/email/welcome', { method: 'POST' }).catch(() => {})

    // Home, with the welcome note on its heels. `?welcome=1` is safe to set
    // unconditionally here — unlike the OAuth callback, this function only
    // ever runs once per account, at the one moment a code has just been
    // verified for the first time. A new account has no context yet, so the
    // homepage is the honest starting point rather than a board they did not
    // ask for.
    router.push('/?welcome=1')
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError('')
    setResent(false)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) { setError(error.message); return }
    setResent(true)
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  /* Already has an account. Both routes out are offered because the one thing
     this person demonstrably does not remember is that they signed up, so they
     are unlikely to remember their password either. */
  if (existingAccount) return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>You already have an account.</h2>
          <p className="grotesk-regular auth-note">
            <strong>{email}</strong> is already registered with Esquirely, so there is nothing to
            create. Sign in instead.
          </p>

          <div className="auth-form">
            <Link
              href="/auth/login"
              className="grotesk-bold auth-btn-primary"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Go to sign in
            </Link>
          </div>

          <p className="grotesk-regular auth-alt">
            Forgotten your password? <Link href="/auth/forgot-password">Reset it</Link>
            {' · '}
            <button
              type="button"
              className="auth-linkbtn"
              onClick={() => { setExistingAccount(false); setEmail('') }}
            >
              Use a different email
            </button>
          </p>
        </div>
      </div>
    </div>
  )

  if (success) return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Enter your code.</h2>
          <p className="grotesk-regular auth-note">
            We sent a six-digit code to <strong>{email}</strong>. It expires in {OTP_EXPIRY_MINUTES} minutes.
          </p>
          {/* Said up front, not buried under a failure. Mail from a new sender
              lands in spam often enough that telling people first saves them
              deciding the code never arrived. */}
          <p className="grotesk-regular auth-note auth-note-quiet">
            If it is not in your inbox, check your spam or promotions folder. It
            sometimes lands there the first time.
          </p>

          <form onSubmit={handleVerify} className="auth-form">
            <div>
              <label className="grotesk-bold auth-label" htmlFor="otp">Six-digit code</label>
              <input
                id="otp"
                /* `text` with a numeric mode, not `type="number"`: a number
                   input strips leading zeros, and a code beginning 0 is a real
                   code. `one-time-code` is what lets iOS and Android offer the
                   code straight from the notification. */
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
                className="auth-input auth-input-otp"
              />
            </div>

            {error && <p className="grotesk-regular auth-error">{error}</p>}
            {resent && <p className="grotesk-regular auth-note auth-note-quiet">A new code is on its way.</p>}

            <button type="submit" disabled={verifying || code.length !== 6} className="grotesk-bold auth-btn-primary">
              {verifying ? 'Checking...' : 'Verify and continue'}
            </button>
          </form>

          <p className="grotesk-regular auth-alt">
            No code yet?{' '}
            <button type="button" onClick={handleResend} disabled={cooldown > 0} className="auth-linkbtn">
              {cooldown > 0 ? `Send another (${cooldown}s)` : 'Send another'}
            </button>
            {' · '}
            <Link href="/auth/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-form-col">

        <div className="auth-form-wrap">

          <h1 className="auth-title">Join Esquirely.</h1>

          {/* Name and email share a row; the password spans both so the reveal
              button keeps its room. Three stacked fields were most of this
              card's height. */}
          <form onSubmit={handleSignup} className="auth-form">
            <div className="auth-fields">
              <div>
                <label className="grotesk-bold auth-label">Full name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Your full name" className="auth-input" />
              </div>
              <div>
                <label className="grotesk-bold auth-label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="auth-input" />
              </div>
              <div className="auth-field-wide">
                <label className="grotesk-bold auth-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="auth-input" style={{ paddingRight: '2.75rem' }} />
                  {/* padding grows the tap target well past the 15px icon (a bare
                      15x15 button is a genuinely hard tap on a phone); `right` is
                      pulled in by the same amount so the icon itself doesn't move. */}
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '0.125rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A9A9A', padding: '0.75rem', display: 'flex' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Ticked, not implied.
                A line of small print saying "by continuing you agree" is a
                weaker record than an affirmative act, and given the site's
                standing posture on the NDPA and on what it does with a CV, the
                consent for terms and privacy should be something the person
                actually did. `required` means the browser blocks submission
                and says why, so it needs no error state of its own. */}
            <label className="auth-consent">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                required
              />
              <span className="grotesk-regular">
                I agree to the <Link href="/terms">Terms of Use</Link> and the{' '}
                <Link href="/privacy">Privacy Notice</Link>.
              </span>
            </label>

            {error && <p className="grotesk-regular auth-error">{error}</p>}

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="grotesk-bold auth-btn-primary"
              style={{ marginTop: '0.25rem' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="grotesk-regular auth-alt">
            Already have an account?{' '}<Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>

    </div>
  )
}

