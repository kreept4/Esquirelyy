'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Saved roles, which are tracker rows.
 *
 * The board's bookmark used to be a bare `useState<Set<string>>` holding job
 * ids. Nothing read it, nothing wrote it anywhere, and navigating away threw it
 * out — so the button filled an icon and promised a shortlist that did not
 * exist. This is where that promise is kept: a save is an `applications` row at
 * status `saved`, which is the same table `TrackOnApply` writes to, so a saved
 * role and an applied one are the same object at different stages and the
 * tracker's existing stepper moves between them with one tap.
 *
 * Two audiences, because the board does not require an account:
 *
 * Signed in, a save is a row. Signed out, it is a localStorage entry, and the
 * moment the reader signs in the local entries are pushed up and cleared. A
 * bookmark that demands an account before it will do anything is a bookmark
 * nobody presses, and losing a shortlist at sign-in is the same broken promise
 * in a slower form.
 *
 * Identity is `firm||role`, not the job id.
 *
 * The `applications` table has no listing reference — its columns are firm,
 * role, type, location, deadline, notes and status, and nothing else. Matching
 * on the employer and title pair is what lets the board know a row it is
 * looking at is already saved, and it is the same pair `TrackOnApply` writes,
 * so applying to something you had saved is recognised as the same role rather
 * than filed twice. Two genuinely different roles sharing an employer AND an
 * exact title would collide; in practice that is the same job.
 *
 * A `job_slug` column would be strictly better and is the obvious next
 * migration — it would survive a retitled listing and let the tracker link back
 * to the role. It needs one ALTER run in the SQL editor, so it is not assumed
 * here.
 */

const LOCAL_KEY = 'esquirely.saved.v1'

export type SavedTarget = {
  firm: string
  role: string
  type?: string | null
  location?: string | null
  /** Free text is fine and expected: "Rolling" and "Open" are real values. */
  deadline?: string | null
}

/** Case- and space-insensitive, so "AELEX " and "Aelex" are one role. */
export function savedKey(firm: string, role: string) {
  return `${(firm || '').trim().toLowerCase()}||${(role || '').trim().toLowerCase()}`
}

function readLocal(): SavedTarget[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupt or unavailable storage is not worth a broken board.
    return []
  }
}

function writeLocal(list: SavedTarget[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  } catch {
    /* Private mode and full quotas both land here. The in-memory set still
       works for the session, which is what the old code offered everyone. */
  }
}

export function useSavedJobs() {
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)
  /** Row ids by key, so an unsave is a delete rather than a second lookup. */
  const rowIds = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    let cancelled = false

    async function load() {
      const local = readLocal()
      let user: { id: string } | null = null

      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        user = data.user ?? null
      } catch {
        user = null
      }

      if (cancelled) return

      if (!user) {
        setSignedIn(false)
        setKeys(new Set(local.map(t => savedKey(t.firm, t.role))))
        setReady(true)
        return
      }

      setSignedIn(true)
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('applications')
        .select('id, firm, role, status')

      if (cancelled) return

      const map = new Map<string, string>()
      const present = new Set<string>()
      for (const r of (rows ?? []) as any[]) {
        const k = savedKey(r.firm ?? '', r.role ?? '')
        // Any row at all means "already in the tracker", so the board does not
        // offer to save something that is sitting there as an application.
        present.add(k)
        if (r.status === 'saved') map.set(k, r.id)
      }

      /* Anything shortlisted while signed out follows the reader up, once. */
      const orphans = local.filter(t => !present.has(savedKey(t.firm, t.role)))
      if (orphans.length) {
        const { data: inserted } = await (supabase.from('applications') as any)
          .insert(orphans.map(t => ({
            user_id: user!.id,
            firm: t.firm,
            role: t.role,
            type: t.type ?? null,
            location: t.location ?? null,
            // Null, not now(): nothing has been sent.
            date_applied: null,
            deadline: t.deadline ?? null,
            status: 'saved',
            notes: '',
          })))
          .select('id, firm, role')
        for (const r of (inserted ?? []) as any[]) {
          map.set(savedKey(r.firm ?? '', r.role ?? ''), r.id)
        }
      }
      // Cleared whether or not the push succeeded for every row; a retry loop
      // that re-inserts on each visit is worse than losing a stale local copy.
      writeLocal([])

      if (cancelled) return
      rowIds.current = map
      setKeys(new Set(map.keys()))
      setReady(true)
    }

    load()
    return () => { cancelled = true }
  }, [])

  const isSaved = useCallback((firm: string, role: string) => keys.has(savedKey(firm, role)), [keys])

  const toggle = useCallback(async (target: SavedTarget) => {
    const key = savedKey(target.firm, target.role)
    const wasSaved = keys.has(key)

    // Optimistic: the icon must answer the tap immediately.
    setKeys(prev => {
      const next = new Set(prev)
      wasSaved ? next.delete(key) : next.add(key)
      return next
    })

    if (!signedIn) {
      const local = readLocal().filter(t => savedKey(t.firm, t.role) !== key)
      writeLocal(wasSaved ? local : [...local, target])
      return
    }

    try {
      const supabase = createClient()
      if (wasSaved) {
        const id = rowIds.current.get(key)
        if (id) {
          await (supabase.from('applications') as any).delete().eq('id', id)
          rowIds.current.delete(key)
        }
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await (supabase.from('applications') as any).insert({
        user_id: user.id,
        firm: target.firm,
        role: target.role,
        type: target.type ?? null,
        location: target.location ?? null,
        date_applied: null,
        deadline: target.deadline ?? null,
        status: 'saved',
        notes: '',
      }).select('id').single()

      if (error || !data) {
        // Put the icon back rather than leave it claiming a save that is not there.
        setKeys(prev => { const n = new Set(prev); n.delete(key); return n })
        return
      }
      rowIds.current.set(key, data.id)
    } catch {
      setKeys(prev => {
        const n = new Set(prev)
        wasSaved ? n.add(key) : n.delete(key)
        return n
      })
    }
  }, [keys, signedIn])

  return { isSaved, toggle, savedCount: keys.size, signedIn, ready }
}
