'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

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
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('onboarding_complete').eq('id', user.id).single()
      if ((profile as any)?.onboarding_complete) router.push(redirect)
      else router.push('/auth/onboarding')
    }
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
      <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '2.5rem' }}>
        <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.35rem', color: '#1A1A1A' }}>Esquirely.</span>
      </Link>

      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B3A3A', marginBottom: '0.6rem' }}>
        Welcome back
      </p>
      <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A1A', marginBottom: '2rem', lineHeight: 1.15 }}>
        Sign in to Esquirely.
      </h1>

      <button type="button" onClick={handleGoogle} className="auth-btn-google" style={{ marginBottom: '1.25rem' }}>
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

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="auth-input" />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
            <Link href="/auth/forgot-password" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#8B3A3A', textDecoration: 'none' }}>Forgot?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="auth-input" style={{ paddingRight: '2.75rem' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A9A9A', padding: 0, display: 'flex' }}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#B5451B', backgroundColor: '#FDF0EB', padding: '0.65rem 0.875rem', borderRadius: '2px', border: '0.5px solid #EDCCC2', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} className="auth-btn-primary" style={{ marginTop: '0.25rem' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#4A4A4A', marginTop: '1.75rem' }}>
        No account?{' '}<Link href="/auth/signup" style={{ color: '#8B3A3A', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
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
      }
      .auth-panel-col::before{
        content:'';
        position:absolute;
        top:0;
        left:-60px;
        width:120px;
        height:100%;
        background:#FAF6F0;
        clip-path: polygon(0 0, 50px 0, 0 100%, 0 100%);
        z-index:2;
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
        top:6%;
        left:8%;
        font-family:'Playfair Display', Georgia, serif;
        font-size:14rem;
        font-weight:700;
        color:rgba(250,246,240,0.07);
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
      .auth-btn-google{width:100%;padding:0.8rem;background:#fff;border:0.5px solid #E8E0D5;border-radius:2px;display:flex;align-items:center;justify-content:center;gap:0.75rem;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:500;color:#1A1A1A;cursor:pointer;transition:border-color 0.2s ease}
      .auth-btn-google:hover{border-color:#8B3A3A}
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
