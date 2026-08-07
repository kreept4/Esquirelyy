'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Mail, Check, Undo2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * The apply button, which also files the application.
 *
 * We have no line into any firm's applicant tracking system and never will, so
 * the tracker can only ever hold what the user puts in it. A tracker filled by
 * hand is a worse spreadsheet than a spreadsheet: people log the first two
 * applications and never come back. The `applications` table having zero rows
 * while the AI tools have real ones is that pattern already visible in the data.
 *
 * So the row gets written at the one moment intent is certain, which is the
 * click that takes someone to the firm. Everything worth recording is already
 * on the page, so it costs the user nothing.
 *
 * Two details that matter:
 *
 * The navigation is not blocked on the write. The anchor keeps its default
 * behaviour and opens in a new tab, and the insert runs alongside it; making
 * someone wait on our database before they reach the firm would be the wrong
 * trade, and calling window.open after an await gets caught by popup blockers.
 *
 * The write is announced, with an undo. A silent row appearing in a tracker
 * because you clicked a link reads as surveillance. Saying so reads as a
 * service, and the undo means a misclick is not a row you have to go and
 * delete later.
 */

export type TrackTarget = {
  /** Employer or firm name, whichever the surface has. */
  firm: string
  /** Blank for a speculative letter, where there is no advertised role. */
  role: string
  type?: string
  location?: string
  /** ISO date, when the listing publishes one. */
  deadline?: string | null
}

export default function TrackOnApply({
  href,
  target,
  label,
  kind = 'external',
}: {
  href: string
  target: TrackTarget
  label: string
  kind?: 'external' | 'email'
}) {
  const [state, setState] = useState<
    'idle' | 'saved' | 'undone' | 'failed' | 'anon' | 'already' | 'confirm' | 'parked'
  >('idle')
  const [rowId, setRowId] = useState<string | null>(null)

  /**
   * Clicking Apply is not applying.
   *
   * The row is written on the click that leaves for the firm, which is the only
   * moment we can observe — but plenty of those clicks do not end in a
   * submission. The form wants a profile, or six attachments, or the posting
   * turns out to have closed, and the reader gives up. Filing all of those as
   * "applied" inflates the top of the funnel with applications that were never
   * sent, and every conversion rate underneath it is then measured against a
   * denominator that is partly fiction.
   *
   * So the claim is checked when they come back. Returning to this tab is a
   * reliable signal that the trip to the firm is over, one way or the other,
   * and it costs one tap to say which. "Not yet" demotes the row to the
   * shortlist rather than deleting it, because an application you started is
   * precisely the one you mean to come back and finish.
   *
   * Only fires for a row this component actually inserted: `rowId` is null for
   * an already-tracked role and for a failed write, and asking about those
   * would be asking about someone else's record.
   */
  useEffect(() => {
    if (state !== 'saved' || !rowId) return
    const onBack = () => {
      if (document.visibilityState === 'visible') setState('confirm')
    }
    document.addEventListener('visibilitychange', onBack)
    window.addEventListener('focus', onBack)
    return () => {
      document.removeEventListener('visibilitychange', onBack)
      window.removeEventListener('focus', onBack)
    }
  }, [state, rowId])

  /** They finished elsewhere and came back: the row stays as filed. */
  function confirmSent() {
    setState('saved')
  }

  /** They did not finish. The role goes to the shortlist with its date cleared,
   *  so the funnel stops counting it and the tracker still holds the intent. */
  async function park() {
    if (!rowId) return
    setState('parked')
    try {
      const supabase = createClient()
      await (supabase.from('applications') as any)
        .update({ status: 'saved', date_applied: null })
        .eq('id', rowId)
    } catch {
      // The row stays as applied and the tracker's own stepper can move it.
    }
  }

  async function file() {
    // Never let a tracking failure interfere with the click that matters.
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      /* Not signed in is a real outcome, not a no-op. This used to return
       * silently, which meant a signed-out reader clicked Apply, got nothing,
       * and had no way to know the application was never filed. */
      if (!user) { setState('anon'); return }

      /* File once per role, not once per click.
       *
       * This insert was unconditional, so every press of Apply added a row.
       * That is not a hypothetical: a restored tab re-firing the handler was
       * observed writing the same ECOWAS application twice within four
       * minutes, and a reader who opens a listing, applies, comes back and
       * applies again would do the same by hand. Duplicates are worse here
       * than a missing row, because the funnel counts them and every
       * conversion rate below the top is then wrong.
       *
       * It also gives saved roles the behaviour they should obviously have:
       * applying to something already on the shortlist PROMOTES it to applied
       * and stamps the date, rather than leaving a saved copy beside a new
       * applied one. Matching is the same firm+role pair `useSavedJobs` keys
       * on, so both ends agree on what "the same role" means. */
      const { data: existing } = await supabase
        .from('applications')
        .select('id, status')
        .eq('firm', target.firm)
        .eq('role', target.role)
        .limit(1)

      const prior = (existing ?? [])[0] as { id: string; status: string } | undefined
      if (prior) {
        // Already sent: say so and leave the record alone. Only a shortlisted
        // row moves, and only forwards.
        if (prior.status === 'saved') {
          await (supabase.from('applications') as any)
            .update({ status: 'applied', date_applied: new Date().toISOString() })
            .eq('id', prior.id)
        }
        /* No `rowId`, so no undo is offered: undoing here would mean deleting
           a row the user may have had for weeks, or silently demoting an
           application back to saved. Neither is what "undo" implies. */
        setState('already')
        return
      }

      const { data, error } = await (supabase.from('applications') as any).insert({
        user_id: user.id,
        firm: target.firm,
        role: target.role,
        type: target.type ?? null,
        location: target.location ?? null,
        date_applied: new Date().toISOString(),
        deadline: target.deadline ?? null,
        // A speculative letter is an application at the same stage as any
        // other: sent, and waiting.
        status: 'applied',
        notes: '',
      }).select('id').single()

      if (error || !data) {
        /* Surfaced as well as shown. A tracker that quietly drops writes is
         * worse than one that has no writes, because the reader believes it. */
        console.error('[tracker] could not file application', error)
        setState('failed')
        return
      }
      setRowId(data.id)
      setState('saved')
    } catch (err) {
      console.error('[tracker] could not file application', err)
      setState('failed')
    }
  }

  async function undo() {
    if (!rowId) return
    setState('undone')
    try {
      const supabase = createClient()
      await (supabase.from('applications') as any).delete().eq('id', rowId)
    } catch {
      // The row stays and the user can delete it in the tracker. Re-showing an
      // error here would be noise on a page they have already left.
    }
    setRowId(null)
  }

  return (
    <>
      <a
        href={href}
        target={kind === 'external' ? '_blank' : undefined}
        rel={kind === 'external' ? 'noopener noreferrer' : undefined}
        className="grotesk-bold apply-card-cta"
        onClick={file}
      >
        {label} {kind === 'email' ? <Mail size={14} aria-hidden /> : <ExternalLink size={14} aria-hidden />}
      </a>

      {state === 'saved' && (
        <p className="grotesk-regular track-note" role="status">
          <Check size={13} aria-hidden />
          <span>
            Added to your tracker.{' '}
            <button type="button" onClick={undo} className="track-undo">
              <Undo2 size={12} aria-hidden /> Undo
            </button>
          </span>
        </p>
      )}

      {state === 'undone' && (
        <p className="grotesk-regular track-note" role="status">Removed from your tracker.</p>
      )}

      {/* Asked on return, because a click through to the firm is not a
          submission and the funnel should only count what was actually sent. */}
      {state === 'confirm' && (
        <p className="grotesk-regular track-note track-note-confirm" role="status">
          <span>
            Did you finish applying?{' '}
            <button type="button" onClick={confirmSent} className="track-undo">
              <Check size={12} aria-hidden /> Yes, it is sent
            </button>
            {' · '}
            <button type="button" onClick={park} className="track-undo">
              Not yet, keep it saved
            </button>
          </span>
        </p>
      )}

      {/* The whole note is the link, not a trailing "Open your tracker".
          The sentence is already telling you where the role went, so making
          only the last three words tappable puts a small target next to a
          large piece of text that says the same thing. */}
      {state === 'parked' && (
        <a href="/tracker" className="grotesk-regular track-note track-note-link" role="status">
          <Check size={13} aria-hidden />
          <span>Kept on your shortlist, not counted as sent. Open your tracker</span>
          <ArrowRight size={12} aria-hidden className="track-note-arrow" />
        </a>
      )}

      {state === 'already' && (
        <p className="grotesk-regular track-note" role="status">
          <Check size={13} aria-hidden />
          <span>
            Already in your tracker, so nothing was filed twice.{' '}
            <a href="/tracker" className="track-undo">Open it</a>
          </span>
        </p>
      )}

      {state === 'failed' && (
        <p className="grotesk-regular track-note track-note-failed" role="status">
          We could not add this to your tracker. You can log it by hand there.
        </p>
      )}

      {state === 'anon' && (
        <p className="grotesk-regular track-note track-note-failed" role="status">
          Not tracked. <a href="/auth/login" className="track-undo">Sign in</a> and applications you
          send from here get filed on their own.
        </p>
      )}
    </>
  )
}
