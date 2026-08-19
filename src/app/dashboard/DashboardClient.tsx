'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { stateOptions } from '@/lib/nigeria'
import {
  BREAK_LENGTHS,
  DELETION_GRACE_DAYS,
  type AccountState,
  type NotificationPreferences,
} from '@/lib/account'

const CAREER_STAGES = [
  { value: '', label: 'Not saying' },
  { value: 'student', label: 'Law student' },
  { value: 'nysc', label: 'Entry-level' },
  { value: 'junior', label: 'Junior (0-3 years post-call)' },
  { value: 'mid', label: 'Mid-level (3-6 years post-call)' },
  { value: 'senior', label: 'Senior (6+ years post-call)' },
]

const NOTIFICATION_LABELS: { key: keyof NotificationPreferences; label: string; note: string }[] = [
  { key: 'deadlines', label: 'Deadline reminders', note: 'A nudge before anything you are tracking closes.' },
  { key: 'new_listings', label: 'New roles', note: 'When something lands that fits what you are after.' },
  { key: 'weekly_digest', label: 'Weekly digest', note: 'One roundup a week. Nothing in between.' },
]

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardClient({
  email,
  joinedAt,
  state,
  readError,
}: {
  email: string
  joinedAt: string | null
  state: AccountState | null
  readError: string | null
}) {
  const router = useRouter()

  const [fullName, setFullName] = useState(state?.fullName ?? '')
  const [careerStage, setCareerStage] = useState(state?.careerStage ?? '')
  const [location, setLocation] = useState(state?.location ?? '')
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    state?.notifications ?? { deadlines: true, new_listings: true, weekly_digest: true }
  )

  const [breakUntil, setBreakUntil] = useState(state?.breakUntil ?? null)
  const [deletionOn, setDeletionOn] = useState(state?.deletionOn ?? null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  /* Its own error, not the page-level one. The password card sits well below
     the banner at the top, and a failure reported up there is a failure nobody
     sees on a phone. */
  const [passwordError, setPasswordError] = useState('')
  const [passwordDone, setPasswordDone] = useState('')

  async function call(body: Record<string, unknown>, label: string) {
    setBusy(label)
    setError('')
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'That did not go through. Please try again.')
        return null
      }
      return data
    } catch {
      setError('That did not go through. Please try again.')
      return null
    } finally {
      setBusy(null)
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const data = await call(
      { action: 'save-profile', fullName, careerStage, location, notifications },
      'save'
    )
    setSaving(false)
    if (data) {
      setSaved(true)
      router.refresh()
    }
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordDone('')

    /* Checked here as well as on the server. The server is the authority on
       every one of these, but making somebody wait for a round trip to be told
       their two entries differ is a slow way to say something obvious. */
    if (newPassword.length < 8) { setPasswordError('Use at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Those two passwords do not match.'); return }
    if (newPassword === currentPassword) {
      setPasswordError('That is the password you are already using. Choose a different one.')
      return
    }

    setBusy('password')
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordError(data.error || 'That did not go through. Please try again.')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordDone('Password changed. Any other device you were signed in on has been signed out.')
    } catch {
      setPasswordError('That did not go through. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  /* The way out for someone who cannot fill in the first field. It is the same
     recovery mail /auth/forgot-password sends, landing on the same page, so
     there is one reset flow rather than a second one that has to be kept
     working. Offered here because the alternative for a signed-in user who has
     forgotten their password is to sign out and hunt for the link on the login
     page, which is a strange thing to ask of somebody already holding a valid
     session. */
  async function emailPasswordLink() {
    setPasswordError('')
    setPasswordDone('')
    setBusy('password-link')
    const supabase = createClient()
    const { error: linkError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setBusy(null)
    if (linkError) { setPasswordError(linkError.message); return }
    setPasswordDone(`Link sent to ${email}. It sets a new password without needing the old one.`)
  }

  return (
    <main className="jobs-page">
      <header className="jobs-header">
        <div className="shell">
          <h1 className="display-black jobs-title">Your account</h1>
          <p className="grotesk-regular jobs-sub">
            {email}
            {joinedAt ? ` · joined ${longDate(joinedAt)}` : ''}
          </p>
        </div>
      </header>

      <div className="shell acct-wrap">
        {readError && (
          <p className="grotesk-regular auth-error">
            We could not load your saved details just now, so some fields may look empty.
            Saving still works.
          </p>
        )}
        {error && <p className="grotesk-regular auth-error">{error}</p>}

        {/* Deletion pending. First thing on the page, because it is the only
            state here with a deadline attached and someone who did not mean it
            must not have to find it. */}
        {deletionOn && (
          <section className="acct-card acct-card-alert">
            <h2 className="grotesk-bold acct-card-title">This account is scheduled for deletion</h2>
            <p className="grotesk-regular acct-note">
              Everything goes for good on <strong>{longDate(deletionOn)}</strong>. Change your mind
              any time before then. Even just signing in again calls it off.
            </p>
            <button
              type="button"
              className="grotesk-bold auth-btn-primary"
              disabled={busy === 'keep'}
              onClick={async () => {
                const ok = await call({ action: 'cancel-deletion' }, 'keep')
                if (ok) { setDeletionOn(null); setConfirmDelete(false); setConfirmText('') }
              }}
            >
              {busy === 'keep' ? 'Keeping your account...' : 'Keep my account'}
            </button>
          </section>
        )}

        <form onSubmit={saveProfile} className="acct-card">
          <h2 className="grotesk-bold acct-card-title">Details</h2>

          <div className="acct-fields">
            <div>
              <label className="grotesk-bold auth-label" htmlFor="acct-name">Full name</label>
              {/* Locked. The name here is the one that goes on a CV and beside
                  an application a firm receives, so it is set once at signup and
                  left alone. `readOnly` rather than `disabled`: a disabled input
                  is skipped by keyboard navigation and read out as unavailable,
                  where read-only is still focusable and still announced, which
                  is the honest description of a value you may look at but not
                  change. */}
              <input id="acct-name" type="text" className="auth-input acct-input-locked"
                value={fullName} readOnly aria-describedby="acct-name-note" />
              <span id="acct-name-note" className="grotesk-regular acct-hint">
                Locked to keep your applications consistent. Need it changed? Just email us.
              </span>
            </div>
            <div>
              <label className="grotesk-bold auth-label" htmlFor="acct-stage">Career stage</label>
              <select id="acct-stage" className="auth-input" value={careerStage}
                onChange={e => setCareerStage(e.target.value)}>
                {CAREER_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="grotesk-bold auth-label" htmlFor="acct-location">Location</label>
              <select id="acct-location" className="auth-input" value={location}
                onChange={e => setLocation(e.target.value)}>
                {stateOptions('Pick a state').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <h3 className="grotesk-bold acct-sub">What we email you about</h3>
          <div className="acct-toggles">
            {NOTIFICATION_LABELS.map(n => (
              <label key={n.key} className="acct-toggle">
                <input
                  type="checkbox"
                  checked={notifications[n.key]}
                  onChange={e => setNotifications(p => ({ ...p, [n.key]: e.target.checked }))}
                />
                <span>
                  <span className="grotesk-bold">{n.label}</span>
                  <span className="grotesk-regular acct-note">{n.note}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="acct-actions">
            <button type="submit" disabled={saving} className="grotesk-bold auth-btn-primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            {saved && <span className="grotesk-regular acct-note">Saved.</span>}
          </div>
        </form>

        {/* Take a break */}
        <section className="acct-card">
          <h2 className="grotesk-bold acct-card-title">Take a break</h2>
          {breakUntil ? (
            <>
              <p className="grotesk-regular acct-note">
                You are on a break until <strong>{longDate(breakUntil)}</strong>. Nothing lands in
                your inbox before then, and everything is exactly where you left it.
              </p>
              <button type="button" className="grotesk-bold auth-btn-primary" disabled={busy === 'end'}
                onClick={async () => {
                  const ok = await call({ action: 'end-break' }, 'end')
                  if (ok) setBreakUntil(null)
                }}>
                {busy === 'end' ? 'Ending your break...' : 'End my break early'}
              </button>
            </>
          ) : (
            <>
              <p className="grotesk-regular acct-note">
                Applying for months without hearing back wears anyone down, and pushing through
                it is not a badge of honour. Mute everything we send you for a while. Your
                applications, saved roles and tracker stay exactly where you left them, and the
                board is here whenever you feel like looking. The market keeps moving and the
                opportunities keep coming. They will still be here when you are.
              </p>
              <div className="acct-breaks">
                {BREAK_LENGTHS.map(b => (
                  <button key={b.days} type="button" className="grotesk-bold acct-break-btn"
                    disabled={busy === 'break'}
                    onClick={async () => {
                      const data = await call({ action: 'start-break', days: b.days }, 'break')
                      if (data?.breakUntil) setBreakUntil(data.breakUntil)
                    }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Password. Above Leaving and below Take a break, because it is
            routine maintenance rather than an exit. */}
        <section className="acct-card">
          <h2 className="grotesk-bold acct-card-title">Password</h2>
          <p className="grotesk-regular acct-note">
            Worth changing every so often, and worth changing straight away if you have
            ever typed it into anything that was not us. You cannot reuse a password this
            account has had before.
          </p>

          <form onSubmit={changePassword}>
            <div className="acct-fields acct-fields-pw">
              <div>
                <label className="grotesk-bold auth-label" htmlFor="acct-pw-current">
                  Current password
                </label>
                <input
                  id="acct-pw-current"
                  type={showPasswords ? 'text' : 'password'}
                  className="auth-input"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="grotesk-bold auth-label" htmlFor="acct-pw-new">
                  New password
                </label>
                <input
                  id="acct-pw-new"
                  type={showPasswords ? 'text' : 'password'}
                  className="auth-input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="grotesk-bold auth-label" htmlFor="acct-pw-confirm">
                  Confirm new password
                </label>
                <input
                  id="acct-pw-confirm"
                  type={showPasswords ? 'text' : 'password'}
                  className="auth-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* One toggle for all three. Revealing them separately would mean
                three controls to solve one problem, which is checking that what
                was typed is what was meant. */}
            <label className="acct-toggle acct-toggle-inline">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={e => setShowPasswords(e.target.checked)}
              />
              <span className="grotesk-regular">Show passwords</span>
            </label>

            {passwordError && (
              <p className="grotesk-regular auth-error" role="alert">{passwordError}</p>
            )}
            {passwordDone && (
              <p className="grotesk-regular acct-note" role="status">{passwordDone}</p>
            )}

            <div className="acct-actions">
              <button
                type="submit"
                className="grotesk-bold auth-btn-primary"
                disabled={busy === 'password' || !currentPassword || !newPassword || !confirmPassword}
              >
                {busy === 'password' ? 'Changing...' : 'Change password'}
              </button>
              <button
                type="button"
                className="grotesk-bold acct-ghost-btn"
                disabled={busy === 'password-link'}
                onClick={emailPasswordLink}
              >
                {busy === 'password-link' ? 'Sending...' : 'Email me a link instead'}
              </button>
            </div>
            <p className="grotesk-regular acct-hint">
              Cannot remember the current one? The link sets a new password without it.
            </p>
          </form>
        </section>

        {/* Leaving */}
        <section className="acct-card acct-card-quiet">
          <h2 className="grotesk-bold acct-card-title">Leaving</h2>
          <div className="acct-actions">
            <button type="button" className="grotesk-bold acct-ghost-btn" onClick={signOut}>
              Sign out
            </button>
          </div>

          {!deletionOn && (
            <div className="acct-danger">
              <h3 className="grotesk-bold acct-sub">Delete your account</h3>
              <p className="grotesk-regular acct-note">
                Your profile, applications, tracker and everything the tools have made for you
                gets wiped. We hold off for {DELETION_GRACE_DAYS} days first, and signing in during
                that window calls it off. If you change your mind, just come back.
              </p>

              {!confirmDelete ? (
                <button type="button" className="grotesk-bold acct-danger-btn"
                  onClick={() => setConfirmDelete(true)}>
                  Delete my account
                </button>
              ) : (
                <>
                  {/* Typed, not a second button. This gets pressed in a bad
                      moment, and a beat of friction costs nothing to someone who
                      means it. The word is ESQUIRELY rather than DELETE because
                      DELETE is muscle memory from every other product, and a
                      word you have to read and think about is the point. */}
                  <label className="grotesk-bold auth-label" htmlFor="acct-confirm">
                    Type ESQUIRELY to confirm
                  </label>
                  <input id="acct-confirm" type="text" className="auth-input" value={confirmText}
                    onChange={e => setConfirmText(e.target.value)} placeholder="ESQUIRELY"
                    autoComplete="off" spellCheck={false} />
                  <div className="acct-actions">
                    <button type="button" className="grotesk-bold acct-danger-btn"
                      disabled={confirmText.trim().toUpperCase() !== 'ESQUIRELY' || busy === 'delete'}
                      onClick={async () => {
                        const data = await call({ action: 'request-deletion' }, 'delete')
                        if (data?.deletionOn) { setDeletionOn(data.deletionOn); setConfirmDelete(false); setConfirmText('') }
                      }}>
                      {busy === 'delete' ? 'Scheduling...' : `Delete in ${DELETION_GRACE_DAYS} days`}
                    </button>
                    <button type="button" className="grotesk-bold acct-ghost-btn"
                      onClick={() => { setConfirmDelete(false); setConfirmText('') }}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
