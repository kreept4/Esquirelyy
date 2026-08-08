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
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    // Straight to wherever they were going. The onboarding step asked three
    // questions the homepage quiz already asks and put a screen between a
    // correct password and the page the visitor came for.
    router.push(redirect)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback?next=' + redirect }
    })
  }

  return (
    <div className="auth-form-wrap">
      <h1 className="auth-title">Sign in to Esquirely.</h1>

      <button type="button" onClick={handleGoogle} className="auth-btn-google">
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

