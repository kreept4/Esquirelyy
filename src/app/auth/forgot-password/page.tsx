'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#F0EBE3',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '0.75rem',
            }}>
              Check your inbox
            </h2>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.875rem',
              color: '#4A4A4A',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}>
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <Link href="/auth/login" style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#5C1A1A',
              textDecoration: 'none',
              letterSpacing: '0.06em',
            }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '0.4rem',
              lineHeight: 1.2,
            }}>
              Reset your password
            </h1>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.85rem',
              color: '#4A4A4A',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>
              Enter the email address on your account and we will send you a reset link.
            </p>

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  backgroundColor: loading ? '#6B8CAE' : '#5C1A1A',
                  color: '#FAF7F2',
                  border: 'none',
                  borderRadius: '2px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.82rem',
              color: '#4A4A4A',
              marginTop: '1.5rem',
              textAlign: 'center',
            }}>
              <Link href="/auth/login" style={{ color: '#5C1A1A', fontWeight: 600, textDecoration: 'none' }}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

