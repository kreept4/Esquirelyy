"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_FIRMS, firmLogo, ballBgForEmployer, logoForEmployer } from '@/lib/firms-data'
import { createClient } from '@/lib/supabase/client'

/**
 * The tracker's firm field: type to search the firms directory and the
 * employers on the board, pick one and its logo comes with it. The last
 * suggestion is always "Add '...' as a new firm", which keeps the free text
 * that was there before, shown with the drawn building until we have a mark.
 *
 * Built on 13 November 2026. Matching typed names against the directory
 * guessed wrong on short or loose names ("Banwo"); picking from a list does
 * not have to guess.
 */

type Option = { name: string; logo: string | null; bg: string | null }

/** Lower case, accents off, punctuation off: "Órọrùn" finds "ororun". */
const key = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim()

/** The building drawn in ink, for a firm with no logo yet. */
export function BuildingMark() {
  return (
    <svg viewBox="0 0 32 32" width="62%" height="62%" fill="none" stroke="#241F16" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M7 28V8.5L17 4v24" />
      <path d="M17 12.5l8 2.5V28" />
      <path d="M4 28h24" />
      <path d="M10.5 11h3M10.5 15h3M10.5 19h3M20.5 18.5h1.5M20.5 22.5h1.5" />
      <path d="M11 28v-4h2.5v4" />
    </svg>
  )
}

export function Mark({ logo, bg }: { logo: string | null; bg?: string | null }) {
  return (
    <span className="trk-firm-mark trk-firm-mark-small" style={bg ? { background: bg } : undefined} aria-hidden>
      {logo ? <img src={logo} alt="" loading="lazy" decoding="async" /> : <BuildingMark />}
    </span>
  )
}

export default function FirmPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [employers, setEmployers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef<HTMLDivElement>(null)

  /* Employers on the board and in opportunities, so a bank or a regulator
     that hires lawyers can be picked as well as a firm. */
  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const db = createClient() as any
        const [jobs, opps] = await Promise.all([
          db.from('jobs').select('employer').eq('is_active', true).limit(500),
          db.from('opportunities').select('organization').eq('status', 'published').limit(500),
        ])
        const names = [
          ...(jobs.data || []).map((r: any) => r.employer),
          ...(opps.data || []).map((r: any) => r.organization),
        ].filter(Boolean) as string[]
        if (live) setEmployers(names)
      } catch {
        /* The directory alone still works. */
      }
    })()
    return () => { live = false }
  }, [])

  const options = useMemo<Option[]>(() => {
    const seen = new Set<string>()
    const out: Option[] = []
    for (const f of ALL_FIRMS) {
      const k = key(f.name)
      if (seen.has(k)) continue
      seen.add(k)
      out.push({ name: f.name, logo: firmLogo(f), bg: ballBgForEmployer(f.name) })
    }
    for (const n of employers) {
      const k = key(n)
      /* "Lekan Bamidele & Co (The Bohemian Firm)" is the directory's
         "Lekan Bamidele & Co"; offer it once, under the directory name. */
      const bare = key(n.replace(/\s*\([^)]*\)\s*$/, ''))
      if (seen.has(k) || seen.has(bare)) continue
      seen.add(k)
      out.push({ name: n, logo: logoForEmployer(n), bg: ballBgForEmployer(n) })
    }
    return out.sort((a, b) => a.name.localeCompare(b.name))
  }, [employers])

  const q = key(value)
  const matches = useMemo(() => {
    if (!q) return []
    const starts = options.filter(o => key(o.name).startsWith(q))
    const contains = options.filter(o => !key(o.name).startsWith(q) && key(o.name).includes(q))
    return [...starts, ...contains].slice(0, 6)
  }, [q, options])
  const exact = options.find(o => key(o.name) === q)
  const showAdd = value.trim().length > 0 && !exact
  const rows = matches.length + (showAdd ? 1 : 0)

  useEffect(() => { setActive(0) }, [q])
  useEffect(() => {
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  function pick(name: string) {
    onChange(name)
    setOpen(false)
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open || !rows) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % rows) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a - 1 + rows) % rows) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (active < matches.length) pick(matches[active].name)
      else pick(value.trim())
    } else if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) }
  }

  return (
    <div className="trk-picker" ref={box}>
      <div className="trk-picker-field">
        {value.trim() && <Mark logo={exact ? exact.logo : null} bg={exact?.bg} />}
        <input
          id="f-firm"
          className="tool-input"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Start typing a firm or employer"
          autoComplete="off"
          role="combobox"
          aria-expanded={open && rows > 0}
          aria-controls="f-firm-list"
          autoFocus
        />
      </div>
      {open && rows > 0 && (
        <ul id="f-firm-list" className="trk-picker-list" role="listbox">
          {matches.map((o, i) => (
            <li
              key={o.name}
              role="option"
              aria-selected={i === active}
              className="trk-picker-item"
              data-active={i === active || undefined}
              onMouseDown={e => { e.preventDefault(); pick(o.name) }}
              onMouseEnter={() => setActive(i)}
            >
              <Mark logo={o.logo} bg={o.bg} />
              <span className="grotesk-regular">{o.name}</span>
            </li>
          ))}
          {showAdd && (
            <li
              role="option"
              aria-selected={active === matches.length}
              className="trk-picker-item trk-picker-add"
              data-active={active === matches.length || undefined}
              onMouseDown={e => { e.preventDefault(); pick(value.trim()) }}
              onMouseEnter={() => setActive(matches.length)}
            >
              <Mark logo={null} />
              <span className="grotesk-regular">Add &ldquo;{value.trim()}&rdquo; as a new firm</span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
