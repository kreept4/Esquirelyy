'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  /* Home, not the board.
     A `?redirect=` is still honoured, because someone sent to sign in from a
     gated page should land back on the page they wanted. What changed is the
     DEFAULT: signing in with no destination in mind used to drop people
     straight onto /jobs, which decides for them what they came for. Home lets
     them choose. */
  const redirect = searchParams.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  /* /auth/callback bounces failed OAuth attempts back here with `?error=`.
     Read it once on mount so a failed sign-in shows the actual reason
     instead of landing on a blank form with no explanation. */
  const [error, setError] = useState(() => searchParams.get('error') || '')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    /* Signing in cancels a scheduled deletion, which is the promise the account
       page makes. The OAuth path does this server side in /auth/callback; a
       password sign-in never touches that route, so it is done here instead.
       Not awaited and failure is ignored on purpose: this is a no-op for almost
       everyone, and a correct password must never fail to get someone in
       because of a write that did not concern them. Anyone it does concern is
       shown the pending-deletion banner on the account page regardless. */
    fetch('/api/account', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'cancel-deletion' }),
    }).catch(() => {})
    // Straight to wherever they were going. The onboarding step asked three
    // questions the homepage quiz already asks and put a screen between a
    // correct password and the page the visitor came for.
    router.push(redirect)
  }

  return (
    <div className="auth-form-wrap">
      <h1 className="auth-title">Sign in to Esquirely.</h1>

      {/* Two tracks, because the card is now wide enough to carry them. A wider
          card with one stacked column would have been the same height as before
          with more empty space beside it. */}
      <form onSubmit={handleLogin} className="auth-form">
        <div className="auth-fields">
          <div>
            <label className="grotesk-bold auth-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="auth-input" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="grotesk-bold auth-label">Password</label>
              <Link href="/auth/forgot-password" className="grotesk-regular auth-forgot">Forgot?</Link>
            </div>
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

        {error && <p className="grotesk-regular auth-error">{error}</p>}

        <button type="submit" disabled={loading} className="grotesk-bold auth-btn-primary" style={{ marginTop: '0.25rem' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="grotesk-regular auth-alt">
        No account?{' '}<Link href="/auth/signup">Create one</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-form-col">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
      </div>
    </div>
  )
}

