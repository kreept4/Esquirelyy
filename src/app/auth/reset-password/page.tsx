'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Set a new password.
 *
 * THIS PAGE DID NOT EXIST.
 *
 * /auth/forgot-password has always sent its reset mail with
 * `redirectTo: '/auth/reset-password'`, and there was no route at that path.
 * So the form worked, the mail sent, the link arrived — and landed on a 404.
 * Password reset was broken end to end and looked fine at every step until the
 * last one.
 *
 * THREE WAYS IN, BECAUSE SUPABASE CAN SEND ANY OF THEM
 *
 * Which one arrives depends on the client flow and on what the Supabase "Reset
 * Password" template contains, and that template is edited in a dashboard
 * rather than in this repo. A page that handled only one of them would break
 * again the next time somebody touched it, silently, in the same way. So all
 * three are handled:
 *
 *   ?code=            PKCE. Exchanged for a session. The code verifier lives in
 *                     this browser's storage, so this only works in the browser
 *                     that asked — which is why it cannot be the only route.
 *   ?token_hash=      The link form of the recovery token, verified directly.
 *                     Works in any browser.
 *   six-digit code    What `{{ .Token }}` puts in the mail. Typed in here.
 *                     Works in any browser, and on a phone it is the only one
 *                     that reliably works at all: a link opens whatever the
 *                     default browser is, which is frequently not the one
 *                     holding this tab.
 *
 * All three end in the same place — a real session — after which
 * `updateUser({ password })` is what actually changes it.
 */

function ResetPasswordInner() {
  const router = useRouter()
  const params = useSearchParams()

  /* 'checking' while a link in the URL is being redeemed, so the page does not
     flash a code prompt at someone who followed a working link. */
  const [stage, setStage] = useState<'checking' | 'need-code' | 'ready' | 'done'>('checking')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function redeem() {
      const supabase = createClient()

      /* A session may already exist — the link was opened a moment ago, or the
         tab was reloaded after redeeming. Checked first so a refresh does not
         throw away a redemption that already worked. */
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { if (!cancelled) setStage('ready'); return }

      const codeParam = params.get('code')
      const tokenHash = params.get('token_hash')

      if (codeParam) {
        const { error } = await supabase.auth.exchangeCodeForSession(codeParam)
        if (!cancelled) {
          if (error) { setError(linkError(error.message)); setStage('need-code') }
          else setStage('ready')
        }
        return
      }

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        if (!cancelled) {
          if (error) { setError(linkError(error.message)); setStage('need-code') }
          else setStage('ready')
        }
        return
      }

      // Nothing in the URL. They either typed the address in or the mail sends
      // a code rather than a link.
      if (!cancelled) setStage('need-code')
    }

    redeem()
    return () => { cancelled = true }
  }, [params])

  /** A dead link is the common case here and deserves saying plainly, with the
   *  way out attached rather than left as an exercise. */
  function linkError(message: string) {
    if (/expired|invalid/i.test(message)) {
      return 'That reset link has expired or has already been used. Enter the six-digit code from the email instead, or request a new link.'
    }
    return message
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      // 'recovery', not 'email'. A token minted by resetPasswordForEmail is a
      // recovery token, and verifying it under another type fails with a
      // mismatch that reads to the person like a wrong code.
      type: 'recovery',
    })
    setBusy(false)
    if (error) { setError(error.message); return }
    setStage('ready')
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    /* Checked here as well as by the server. Supabase enforces the length and
       would reject the call, but making someone wait for a round trip to be
       told their two entries differ is a slow way to say something obvious. */
    if (password.length < 8) { setError('Use at least 8 characters.'); return }
    if (password !== confirm) { setError('Those two passwords do not match.'); return }

    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) { setError(error.message); return }

    setStage('done')
    /* Signed out on purpose. Changing a password is what someone does when they
       think an old one is compromised, and the useful thing afterwards is proof
       the new one works — which means using it. */
    await supabase.auth.signOut()
    setTimeout(() => router.push('/auth/login'), 2200)
  }

  if (stage === 'checking') return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <p className="grotesk-regular auth-note">Checking your link...</p>
        </div>
      </div>
    </div>
  )

  if (stage === 'done') return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <h1 className="auth-title" style={{ marginBottom: '0.5rem' }}>Password changed.</h1>
          <p className="grotesk-regular auth-note">
            Sign in with your new password. Taking you there now.
          </p>
          <p className="grotesk-regular auth-alt">
            <Link href="/auth/login">Go to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )

  if (stage === 'need-code') return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <h1 className="auth-title" style={{ marginBottom: '0.5rem' }}>Enter your code.</h1>
          <p className="grotesk-regular auth-note">
            Type the six-digit code from the reset email, along with the address you asked for it
            with.
          </p>

          <form onSubmit={handleVerify} className="auth-form">
            <div>
              <label className="grotesk-bold auth-label" htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
            <div>
              <label className="grotesk-bold auth-label" htmlFor="reset-otp">Six-digit code</label>
              <input
                id="reset-otp"
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

            <button type="submit" disabled={busy || code.length !== 6} className="grotesk-bold auth-btn-primary">
              {busy ? 'Checking...' : 'Continue'}
            </button>
          </form>

          <p className="grotesk-regular auth-alt">
            <Link href="/auth/forgot-password">Send a new link</Link>
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
          <h1 className="auth-title" style={{ marginBottom: '0.5rem' }}>Set a new password.</h1>
          <p className="grotesk-regular auth-note">
            Choose something you are not using anywhere else. At least 8 characters.
          </p>

          <form onSubmit={handleSetPassword} className="auth-form">
            <div>
              <label className="grotesk-bold auth-label" htmlFor="new-password">New password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="auth-input"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A9A9A', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="grotesk-bold auth-label" htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Type it again"
                className="auth-input"
              />
            </div>

            {error && <p className="grotesk-regular auth-error">{error}</p>}

            <button type="submit" disabled={busy} className="grotesk-bold auth-btn-primary">
              {busy ? 'Saving...' : 'Save new password'}
            </button>
          </form>

          <p className="grotesk-regular auth-alt">
            <Link href="/auth/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* useSearchParams needs a Suspense boundary or the whole route opts out of
   static rendering and the build warns. Same shape the login page uses. */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  )
}
