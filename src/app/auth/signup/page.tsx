'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'
import AuthIllustration from '../AuthIllustration'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

  async function handleGoogleSignup() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F2EBE1', border: '0.5px solid #E8D5C4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.75rem' }}>Check your email.</h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', lineHeight: 1.7, marginBottom: '2rem' }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/auth/login" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#8B3A3A', textDecoration: 'none' }}>Back to sign in</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <Link href="/" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.5rem', color: '#1A1A1A' }}>Esquirely.</span>
        </Link>

        <AuthIllustration />

        <div style={{ marginTop: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.4rem', lineHeight: 1.2 }}>Join Esquirely.</h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#4A4A4A', lineHeight: 1.6 }}>Nigeria's home for legal careers. Free to join.</p>
        </div>

        <button onClick={handleGoogleSignup} className="auth-btn-google" style={{ marginBottom: '1.25rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '0.5px', backgroundColor: '#E8E0D5' }} />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: '#9A9A9A', letterSpacing: '0.08em' }}>OR</span>
          <div style={{ flex: 1, height: '0.5px', backgroundColor: '#E8E0D5' }} />
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Your full name" className="auth-input" />
          </div>
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="auth-input" />
          </div>
          <div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="auth-input" style={{ paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A9A9A', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#B5451B', backgroundColor: '#FDF0EB', padding: '0.65rem 0.875rem', borderRadius: '2px', border: '0.5px solid #EDCCC2', margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} className="auth-btn-primary" style={{ marginTop: '0.25rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#4A4A4A', marginTop: '1.75rem', textAlign: 'center' }}>
          Already have an account?{' '}<Link href="/auth/login" style={{ color: '#8B3A3A', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>

        <style>{`
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0}
  .auth-input{width:100%;padding:0.75rem 1rem;background:#fff;border:0.5px solid #E8E0D5;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.875rem;color:#1A1A1A;outline:none;transition:border-color 0.2s ease}
  .auth-input:focus{border-color:#8B3A3A}
  .auth-btn-google{width:100%;padding:0.8rem;background:#fff;border:0.5px solid #E8E0D5;border-radius:2px;display:flex;align-items:center;justify-content:center;gap:0.75rem;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:500;color:#1A1A1A;cursor:pointer;transition:border-color 0.2s ease}
  .auth-btn-google:hover{border-color:#8B3A3A}
  .auth-btn-primary{width:100%;padding:0.875rem;background:#8B3A3A;color:#FAF6F0;border:none;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:background-color 0.2s ease}
  .auth-btn-primary:disabled{background:#C47070;cursor:not-allowed}
  .auth-btn-primary:hover:not(:disabled){background:#7A2E2E}
`}</style>
      </div>
    </div>
  )
}
