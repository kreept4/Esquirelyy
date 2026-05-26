'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
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

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF7F2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Wordmark */}
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '2.5rem' }}>
        <span style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
        }}>
          Esquirely
        </span>
      </Link>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#fff',
        border: '0.5px solid #E8E0D5',
        padding: '2.5rem',
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: '0.4rem',
          lineHeight: 1.2,
        }}>
          Welcome back
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.85rem',
          color: '#4A4A4A',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}>
          Sign in to your Esquirely account.
        </p>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            border: '0.5px solid #E8E0D5',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: '#1A1A1A',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
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

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ flex: 1, height: '0.5px', backgroundColor: '#E8E0D5' }} />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', letterSpacing: '0.06em' }}>
            OR
          </span>
          <div style={{ flex: 1, height: '0.5px', backgroundColor: '#E8E0D5' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#1A1A1A',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.5rem',
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.7rem 0.875rem',
                backgroundColor: '#FAF7F2',
                border: '0.5px solid #E8E0D5',
                borderRadius: '2px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.875rem',
                color: '#1A1A1A',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <label style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#1A1A1A',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}>
                Password
              </label>
              <Link href="/auth/forgot-password" style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.72rem',
                color: '#0A2342',
                textDecoration: 'none',
              }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Your password"
                style={{
                  width: '100%',
                  padding: '0.7rem 2.5rem 0.7rem 0.875rem',
                  backgroundColor: '#FAF7F2',
                  border: '0.5px solid #E8E0D5',
                  borderRadius: '2px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.875rem',
                  color: '#1A1A1A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4A4A4A',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.8rem',
              color: '#B5451B',
              backgroundColor: '#FDF0EB',
              padding: '0.6rem 0.75rem',
              borderRadius: '2px',
              border: '0.5px solid #EDCCC2',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              backgroundColor: loading ? '#6B8CAE' : '#0A2342',
              color: '#FAF7F2',
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              transition: 'background-color 0.2s ease',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '0.82rem',
        color: '#4A4A4A',
        marginTop: '1.5rem',
      }}>
        Don't have an account?{' '}
        <Link href="/auth/signup" style={{ color: '#0A2342', fontWeight: 600, textDecoration: 'none' }}>
          Create one
        </Link>
      </p>
    </div>
  )
}
