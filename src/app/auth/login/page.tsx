'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

function Gate({ open }: { open: boolean }) {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '2rem' }}>
      {/* Posts */}
      <rect x="2" y="10" width="8" height="80" rx="1" fill="#8B3A3A" opacity="0.9"/>
      <rect x="110" y="10" width="8" height="80" rx="1" fill="#8B3A3A" opacity="0.9"/>
      {/* Post caps */}
      <rect x="0" y="6" width="12" height="6" rx="1" fill="#8B3A3A"/>
      <rect x="108" y="6" width="12" height="6" rx="1" fill="#8B3A3A"/>

      {/* Left gate panel */}
      <g style={{ transformOrigin: '10px 50px', transform: open ? 'perspective(200px) rotateY(-70deg)' : 'rotateY(0deg)', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <rect x="10" y="20" width="48" height="60" rx="1" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        <rect x="14" y="24" width="40" height="52" rx="1" fill="none" stroke="#8B3A3A" strokeWidth="0.75" opacity="0.4"/>
        {/* Bars */}
        <line x1="22" y1="24" x2="22" y2="76" stroke="#8B3A3A" strokeWidth="1" opacity="0.5"/>
        <line x1="34" y1="24" x2="34" y2="76" stroke="#8B3A3A" strokeWidth="1" opacity="0.5"/>
        <line x1="46" y1="24" x2="46" y2="76" stroke="#8B3A3A" strokeWidth="1" opacity="0.5"/>
        {/* Handle */}
        <circle cx="54" cy="50" r="3" fill="#8B3A3A"/>
      </g>

      {/* Right gate panel */}
      <g style={{ transformOrigin: '110px 50px', transform: open ? 'perspective(200px) rotateY(70deg)' : 'rotateY(0deg)', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <rect x="62" y="20" width="48" height="60" rx="1" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        <rect x="66" y="24" width="40" height="52" rx="1" fill="none" stroke="#8B3A3A" strokeWidth="0.75" opacity="0.4"/>
        {/* Bars */}
        <line x1="74" y1="24" x2="74" y2="76" stroke="#8B3A3A" strokeWidth="1" opacity="0.5"/>
        <line x1="86" y1="24" x2="86" y2="76" stroke="#8B3A3A" strokeWidth="1" opacity="0.5"/>
        <line x1="98" y1="24" x2="98" y2="76" stroke="#8B3A3A" strokeWidth="1" opacity="0.5"/>
        {/* Handle */}
        <circle cx="66" cy="50" r="3" fill="#8B3A3A"/>
      </g>

      {/* Ground line */}
      <line x1="0" y1="92" x2="120" y2="92" stroke="#8B3A3A" strokeWidth="1" opacity="0.2"/>
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/jobs'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setGateOpen(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      setGateOpen(false)
      return
    }

    const sb = createClient()
    const { data: { user: u } } = await sb.auth.getUser()
    if (u) {
      const { data: prof } = await (sb as any).from('profiles').select('onboarding_complete').eq('id', u.id).single()
      if (!prof || !prof.onboarding_complete) {
        setTimeout(() => router.push('/auth/onboarding'), 900)
        return
      }
    }
    setTimeout(() => {
      router.push(redirect)
      router.refresh()
    }, 900)
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

      {/* Left panel */}
      <div style={{ flex: 1, backgroundColor: '#8B3A3A', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="login-left-panel">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.35rem', color: '#FAF6F0', letterSpacing: '-0.01em' }}>
            Esquirely.
          </span>
        </Link>

        <div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,246,240,0.45)', marginBottom: '1.5rem' }}>
            A note from the founders
          </p>
          <blockquote style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 400, fontStyle: 'italic', color: '#FAF6F0', lineHeight: 1.75, margin: 0, maxWidth: '480px' }}>
            "We built Esquirely because we lived the frustration. Deadlines buried in WhatsApp forwards. Firms that never announced openings publicly. A legal job market that rewarded connections over competence. That ends here."
          </blockquote>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(250,246,240,0.55)', marginTop: '1.5rem', letterSpacing: '0.04em' }}>
            Ogunleye Boluwatife & Ogunleye Ipinuoluwa, Co-founders
          </p>
        </div>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'rgba(250,246,240,0.3)', letterSpacing: '0.04em' }}>
          Nigeria's legal careers platform.
        </p>
      </div>

      {/* Right panel */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem' }}>

        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <Gate open={gateOpen} />
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.4rem', textAlign: 'center' }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#4A4A4A', textAlign: 'center', lineHeight: 1.6 }}>
              Sign in to your Esquirely account.
            </p>
          </div>

          <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '0.5px solid #E8E0D5', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#1A1A1A', cursor: 'pointer', marginBottom: '1.5rem', transition: 'background-color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F2EBE1')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', letterSpacing: '0.06em' }}>OR</span>
            <div style={{ flex: 1, height: '0.5px', backgroundColor: '#E8E0D5' }} />
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                style={{ width: '100%', padding: '0.7rem 0.875rem', backgroundColor: '#FAF6F0', border: '0.5px solid #E8E0D5', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#8B3A3A', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Your password"
                  style={{ width: '100%', padding: '0.7rem 2.5rem 0.7rem 0.875rem', backgroundColor: '#FAF6F0', border: '0.5px solid #E8E0D5', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4A4A4A', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#B5451B', backgroundColor: '#FDF0EB', padding: '0.6rem 0.75rem', borderRadius: '2px', border: '0.5px solid #EDCCC2' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', backgroundColor: loading ? '#C47070' : '#8B3A3A', color: '#FAF6F0', border: 'none', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background-color 0.2s ease' }}>
              {loading ? 'Opening the gates...' : 'Sign In'}
            </button>
          </form>

          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#4A4A4A', marginTop: '1.5rem', textAlign: 'center' }}>
            No account?{' '}
            <Link href="/auth/signup" style={{ color: '#8B3A3A', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
