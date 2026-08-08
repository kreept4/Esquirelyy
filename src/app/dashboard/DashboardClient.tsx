'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  { value: 'junior', label: 'Junior (0-3 yrs PQE)' },
  { value: 'mid', label: 'Mid-level (3-6 yrs PQE)' },
  { value: 'senior', label: 'Senior (6+ yrs PQE)' },
]

const NOTIFICATION_LABELS: { key: keyof NotificationPreferences; label: string; note: string }[] = [
  { key: 'deadlines', label: 'Deadline reminders', note: 'Before something you are tracking closes.' },
  { key: 'new_listings', label: 'New roles', note: 'When a listing matches what you are looking for.' },
  { key: 'weekly_digest', label: 'Weekly digest', note: 'One summary a week. Nothing in between.' },
]

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardClient({
  email,
  joinedAt,
  providers,
  state,
  readError,
}: {
  email: string
  joinedAt: string | null
  providers: string[]
  state: AccountState | null
  readError: string | null
}) {
  const router = useRouter()

  const [fullName, setFullName] = useState(state?.fullName ?? '')
  const [careerStage, setCareerStage] = useState(state?.careerStage ?? '')
  const [location, setLocation] = useState(state?.location ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(state?.linkedinUrl ?? '')
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

  const hasLinkedIn = providers.includes('linkedin_oidc')

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
      { action: 'save-profile', fullName, careerStage, location, linkedinUrl, notifications },
      'save'
    )
    setSaving(false)
    if (data) {
      setSaved(true)
      router.refresh()
    }
  }

  /**
   * Link LinkedIn to the account that is already signed in.
   *
   * linkIdentity, not signInWithOAuth. Signing in with LinkedIn on an account
   * that exists under a different provider creates a SECOND account on the same
   * address, or fails, depending on the project's settings — neither is what
   * "connect" means. Linking attaches the identity to the account already here.
   *
   * Requires manual linking to be enabled on the Supabase project; the error is
   * surfaced rather than swallowed so it says so instead of silently doing
   * nothing.
   */
  async function connectLinkedIn() {
    setBusy('linkedin')
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.linkIdentity({
      provider: 'linkedin_oidc',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
    if (error) {
      setError(
        error.message.toLowerCase().includes('manual linking')
          ? 'Account linking is turned off for this project. Enable manual linking in Supabase to use this.'
          : error.message
      )
      setBusy(null)
    }
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
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
            We could not load your saved details, so the fields below may be blank. Saving will
            still work.
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
              Everything will be permanently erased on <strong>{longDate(deletionOn)}</strong>. You
              can stop this at any point before then, and simply signing in again will also stop it.
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
              <input id="acct-name" type="text" className="auth-input" value={fullName}
                onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
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
              <input id="acct-location" type="text" className="auth-input" value={location}
                onChange={e => setLocation(e.target.value)} placeholder="e.g. Lagos" />
            </div>
            <div>
              <label className="grotesk-bold auth-label" htmlFor="acct-linkedin">LinkedIn</label>
              <input id="acct-linkedin" type="text" inputMode="url" className="auth-input"
                value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="linkedin.com/in/your-profile" />
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

        {/* Connected accounts */}
        <section className="acct-card">
          <h2 className="grotesk-bold acct-card-title">Connected accounts</h2>
          <p className="grotesk-regular acct-note">
            Sign in with {providers.includes('google') ? 'Google' : 'your password'} today.
            {hasLinkedIn ? ' LinkedIn is connected.' : ' Connect LinkedIn to sign in with it too.'}
          </p>
          {!hasLinkedIn && (
            <button type="button" className="auth-btn-google" disabled={busy === 'linkedin'}
              onClick={connectLinkedIn}>
              {busy === 'linkedin' ? 'Opening LinkedIn...' : 'Connect LinkedIn'}
            </button>
          )}
        </section>

        {/* Take a break */}
        <section className="acct-card">
          <h2 className="grotesk-bold acct-card-title">Take a break</h2>
          {breakUntil ? (
            <>
              <p className="grotesk-regular acct-note">
                You are on a break until <strong>{longDate(breakUntil)}</strong>. Nothing will be
                emailed to you before then, and everything is still here when you want it.
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
                Applying for a long time without hearing back is genuinely wearing, and there is
                nothing clever about pushing through it. Pause everything we send you for a while.
                Your applications, saved roles and tracker stay exactly as they are, and the board
                is still here if you want to look — the market does not sleep, and neither do the
                opportunities. They will still be here when you are ready.
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
                Your profile, applications, tracker and everything the tools have generated for you
                are erased. We wait {DELETION_GRACE_DAYS} days first, and signing in during that
                time cancels it — so if you change your mind, just come back.
              </p>

              {!confirmDelete ? (
                <button type="button" className="grotesk-bold acct-danger-btn"
                  onClick={() => setConfirmDelete(true)}>
                  Delete my account
                </button>
              ) : (
                <>
                  {/* Typed, not a second button. The whole point of the grace
                      period is that this is pressed in a bad moment; asking for
                      the word is a beat of friction that costs nothing to
                      someone who means it. */}
                  <label className="grotesk-bold auth-label" htmlFor="acct-confirm">
                    Type DELETE to confirm
                  </label>
                  <input id="acct-confirm" type="text" className="auth-input" value={confirmText}
                    onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" />
                  <div className="acct-actions">
                    <button type="button" className="grotesk-bold acct-danger-btn"
                      disabled={confirmText !== 'DELETE' || busy === 'delete'}
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
