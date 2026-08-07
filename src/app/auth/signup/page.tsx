'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

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

    // Home. A new account has no context yet, so the homepage is the honest
    // starting point rather than a board they did not ask for.
    router.push('/')
  }

  async function handleResend() {
    setError('')
    setResent(false)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) { setError(error.message); return }
    setResent(true)
  }

  async function handleGoogleSignup() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Enter your code.</h2>
          <p className="grotesk-regular auth-note">
            We sent a six-digit code to <strong>{email}</strong>. It expires in an hour.
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
            <button type="button" onClick={handleResend} className="auth-linkbtn">Send another</button>
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

          <button onClick={handleGoogleSignup} className="auth-btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <i /><span className="grotesk-regular">OR</span><i />
          </div>

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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A9A9A', padding: 0, display: 'flex' }}>
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

