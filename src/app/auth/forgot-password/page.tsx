'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/**
 * Ask for a reset link.
 *
 * REBUILT ON THE SHARED AUTH SHELL. This page was the last thing in /auth still
 * written in the pre-redesign language: its own inline styles, a white card on
 * a flat cream field with no contour behind it, a 0.5px hairline border and an
 * ink button. Every other auth page had moved to .auth-page, which carries the
 * contour ground, the carton card and the mint primary button, so the one page
 * a person reaches at their most frustrated was also the one that looked like a
 * different website. That is the worst possible page to lose someone's trust
 * on, because "this does not look right" and "this is a phishing page" are the
 * same thought.
 *
 * Nothing about the behaviour changed. resetPasswordForEmail with redirectTo
 * pointing at /auth/reset-password is what it always did, and that pairing is
 * load-bearing: see the header of reset-password/page.tsx for what happens when
 * the two disagree.
 */
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

  if (sent) return (
    <div className="auth-page">
      <div className="auth-form-col">
        <div className="auth-form-wrap">
          <h1 className="auth-title" style={{ marginBottom: '0.5rem' }}>Check your inbox.</h1>
          <p className="grotesk-regular auth-note">
            If an account exists for <strong>{email}</strong>, a reset link is on its way. It
            opens a page where you set a new password and confirm it. No old password needed.
          </p>
          {/* Said here rather than left to be discovered in the spam folder ten
              minutes later, which is where this mail lands often enough to be
              worth one line. */}
          <p className="grotesk-regular auth-note">
            Nothing after a minute or two? Check spam and promotions.
          </p>
          <p className="grotesk-regular auth-alt">
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
          <h1 className="auth-title" style={{ marginBottom: '0.5rem' }}>Reset your password.</h1>
          <p className="grotesk-regular auth-note">
            Enter the address on your account and we will send you a link to set a new one.
          </p>

          <form onSubmit={handleReset} className="auth-form">
            <div>
              <label className="grotesk-bold auth-label" htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="auth-input"
              />
            </div>

            {error && <p className="grotesk-regular auth-error">{error}</p>}

            <button type="submit" disabled={loading} className="grotesk-bold auth-btn-primary">
              {loading ? 'Sending...' : 'Send reset link'}
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
