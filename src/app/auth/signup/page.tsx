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

  if (success) return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap" style={{ textAlign: 'center' }}>
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
      <AuthStyles />
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">

          <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '2.5rem' }}>
            <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.35rem', color: '#1A1A1A' }}>Esquirely.</span>
          </Link>

          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B3A3A', marginBottom: '0.6rem' }}>
            Get started
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A1A', marginBottom: '2rem', lineHeight: 1.15 }}>
            Join Esquirely.
          </h1>

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

          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#4A4A4A', marginTop: '1.75rem' }}>
            Already have an account?{' '}<Link href="/auth/login" style={{ color: '#8B3A3A', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-panel-col">
        <div className="auth-panel-inner">
          <span className="auth-panel-mark">"</span>
          <div className="auth-panel-content">
            <p className="auth-panel-headline">Every opportunity.<br/>One platform.</p>
            <p className="auth-panel-copy">Jobs, vacation schemes, pupillages, and scholarships for Nigerian legal professionals, in one place.</p>
          </div>
          <p className="auth-panel-foot">Esquirely.</p>
        </div>
      </div>

      <AuthStyles />
    </div>
  )
}

function AuthStyles() {
  return (
    <style>{`
      *,*::before,*::after{box-sizing:border-box}
      body{margin:0}

      .auth-page{
        min-height:100vh;
        display:flex;
        background:#FAF6F0;
        position:relative;
      }
      .auth-form-col{
        flex:1;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:3rem 1.5rem;
        min-width:0;
      }
      .auth-form-wrap{
        width:100%;
        max-width:380px;
      }

.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
        clip-path: polygon(40px 0, 100% 0, 100% 100%, 0 100%);
      }
      .auth-panel-inner{
        position:absolute;
        inset:0;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        padding:4rem 3rem;
      }
      .auth-panel-mark{
        position:absolute;
        top:8%;
        left:10%;
        font-family:'Playfair Display', Georgia, serif;
        font-size:5rem;
        font-weight:700;
        color:rgba(250,246,240,0.18);
        line-height:1;
        user-select:none;
        pointer-events:none;
      }
      .auth-panel-content{
        position:relative;
        z-index:1;
        max-width:340px;
        text-align:center;
      }
      .auth-panel-headline{
        font-family:'Playfair Display', Georgia, serif;
        font-size:clamp(1.9rem, 3.2vw, 2.5rem);
        font-weight:700;
        color:#FAF6F0;
        line-height:1.22;
        margin-bottom:1.25rem;
      }
      .auth-panel-copy{
        font-family:'DM Sans', sans-serif;
        font-size:0.92rem;
        color:rgba(250,246,240,0.7);
        line-height:1.8;
      }
      .auth-panel-foot{
        position:absolute;
        bottom:2.5rem;
        z-index:1;
        font-family:'Playfair Display', Georgia, serif;
        font-weight:700;
        font-size:1rem;
        color:rgba(250,246,240,0.45);
      }

      .auth-input{width:100%;padding:0.75rem 1rem;background:#fff;border:0.5px solid #E8E0D5;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.875rem;color:#1A1A1A;outline:none;transition:border-color 0.2s ease}
      .auth-input:focus{border-color:#8B3A3A}
      .auth-btn-primary{width:100%;padding:0.875rem;background:#8B3A3A;color:#FAF6F0;border:none;border-radius:2px;font-family:'DM Sans',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:background-color 0.2s ease}
      .auth-btn-primary:disabled{background:#C47070;cursor:not-allowed}
      .auth-btn-primary:hover:not(:disabled){background:#7A2E2E}

      @media (min-width: 880px){
        .auth-panel-col{ display:block; }
      }
      @media (min-width: 1600px){
        .auth-form-col{ flex:0.85; }
        .auth-panel-col{ flex:1.15; }
      }
    `}</style>
  )
}
