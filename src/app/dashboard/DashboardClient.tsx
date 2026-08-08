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
  { value: 'junior', label: 'Junior (0-3 yrs PQE)' },
  { value: 'mid', label: 'Mid-level (3-6 yrs PQE)' },
  { value: 'senior', label: 'Senior (6+ yrs PQE)' },
]

const NOTIFICATION_LABELS: { key: keyof NotificationPreferences; label: string; note: string }[] = [
  { key: 'deadlines', label: 'Deadline reminders', note: 'A nudge before anything you are tracking closes.' },
  { key: 'new_listings', label: 'New roles', note: 'When something lands that fits what you are after.' },
  { key: 'weekly_digest', label: 'Weekly digest', note: 'One roundup a week. Nothing in between.' },
]

/** Every way into the account, each with its own state. `email` is the password
 *  sign-in and cannot be linked from here, so it only ever reports. */
const CONNECTIONS: {
  provider: 'google' | 'linkedin_oidc' | 'email'
  label: string
  onNote: string
  offNote: string
}[] = [
  {
    provider: 'google',
    label: 'Google',
    onNote: 'You can sign in with Google.',
    offNote: 'One tap to sign in, nothing to remember.',
  },
  {
    provider: 'linkedin_oidc',
    label: 'LinkedIn',
    onNote: 'You can sign in with LinkedIn.',
    offNote: 'Sign in with the profile your work already lives on.',
  },
  {
    provider: 'email',
    label: 'Email and password',
    onNote: 'Your password works on this account.',
    offNote: 'No password set. You sign in through a provider above.',
  },
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
   * Attach another sign-in method to the account already signed in.
   *
   * linkIdentity, not signInWithOAuth. Signing in with a second provider on an
   * address that already has an account either makes a duplicate account or
   * fails outright, depending on project settings. Neither is what Connect
   * means. Linking attaches the identity to the account that is already here.
   *
   * Needs manual linking enabled on the Supabase project. The error is
   * translated rather than swallowed, so a switch that is off says so instead of
   * looking like a button that does nothing.
   */
  async function connect(provider: 'google' | 'linkedin_oidc') {
    setBusy(provider)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
    if (error) {
      setError(
        error.message.toLowerCase().includes('manual linking')
          ? 'Account linking is switched off for this project. Turn on manual linking in Supabase and this will work.'
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

        {/* Connected accounts.
            Every way in is listed with its real state, rather than one sentence
            describing whichever happened to be first. Someone who signed up with
            Google should see Google marked connected, not be told about it in
            passing. */}
        <section className="acct-card">
          <h2 className="grotesk-bold acct-card-title">Connected accounts</h2>
          <p className="grotesk-regular acct-note">
            The ways you can get back in. Connect more than one and you will never be
            locked out because you forgot which you used.
          </p>

          <ul className="acct-conns">
            {CONNECTIONS.map(c => {
              const connected = providers.includes(c.provider)
              return (
                <li key={c.provider} className="acct-conn">
                  <span className="acct-conn-main">
                    <span className="grotesk-bold">{c.label}</span>
                    <span className="grotesk-regular acct-hint">
                      {connected ? c.onNote : c.offNote}
                    </span>
                  </span>
                  {connected ? (
                    <span className="grotesk-bold acct-conn-on">Connected</span>
                  ) : c.provider === 'email' ? (
                    <span className="grotesk-regular acct-hint">Not set</span>
                  ) : (
                    <button type="button" className="grotesk-bold acct-ghost-btn"
                      disabled={busy === c.provider}
                      onClick={() => { if (c.provider !== 'email') connect(c.provider) }}>
                      {busy === c.provider ? 'Opening...' : 'Connect'}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

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
