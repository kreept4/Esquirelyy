'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'
import AuthIllustration from '../AuthIllustration'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/jobs'
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
    const sb = createClient()
    const { data: { user: u } } = await sb.auth.getUser()
    if (u) {
      const { data: prof } = await (sb as any).from('profiles').select('onboarding_complete').eq('id', u.id).single()
      if (!prof || !prof.onboarding_complete) { router.push('/auth/onboarding'); return }
    }
    router.push(redirect)
    router.refresh()
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#FAF6F0' }}>
      <div style={{ flex: 1, backgroundColor: '#8B3A3A', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="auth-left-panel">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.35rem', color: '#FAF6F0' }}>Esquirely.</span>
        </Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
          <AuthIllustration />
        </div>
        <div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,246,240,0.4)', marginBottom: '1rem' }}>A note from the founders</p>
          <blockquote style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(0.9rem, 1.4vw, 1.15rem)', fontStyle: 'italic', color: '#FAF6F0', lineHeight: 1.8, margin: 0 }}>
            "We built Esquirely because we lived the frustration. Deadlines buried in WhatsApp forwards. Firms that never announced openings publicly. A legal job market that rewarded connections over competence. That ends here."
          </blockquote>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.73rem', fontWeight: 600, color: 'rgba(250,246,240,0.45)', marginTop: '1rem' }}>Ogunleye Boluwatife & Ogunleye Ipinuoluwa, Co-founders</p>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.4rem', lineHeight: 1.15 }}>Welcome back.</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', lineHeight: 1.6 }}>Sign in to continue to Esquirely.</p>
          </div>

          <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#fff', border: '0.5px solid #E8E0D5', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#1A1A1A', cursor: 'pointer', marginBottom: '1.5rem', transition: 'border-color 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#8B3A3A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E0D5'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: '#E8E0D5' }} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: '#9A9A9A', letterSpacing: '0.08em' }}>OR</span>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: '#E8E0D5' }} />
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#fff', border: '0.5px solid #E8E0D5', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = '#8B3A3A'}
                onBlur={e => e.currentTarget.style.borderColor = '#E8E0D5'}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#8B3A3A', textDecoration: 'none', fontWeight: 500 }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Your password"
                  style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem', backgroundColor: '#fff', border: '0.5px solid #E8E0D5', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#8B3A3A'}
                  onBlur={e => e.currentTarget.style.borderColor = '#E8E0D5'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A9A9A', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {error && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#B5451B', backgroundColor: '#FDF0EB', padding: '0.65rem 0.875rem', borderRadius: '2px', border: '0.5px solid #EDCCC2' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', backgroundColor: loading ? '#C47070' : '#8B3A3A', color: '#FAF6F0', border: 'none', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s ease' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#4A4A4A', marginTop: '1.75rem', textAlign: 'center' }}>
            No account?{' '}<Link href="/auth/signup" style={{ color: '#8B3A3A', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left-panel { display: none !important; } }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
