import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { toolHref } from '@/lib/tool-links'

/**
 * The nudge towards the tools, sat beside a specific role.
 *
 * ============================================================
 * WHY IT LIVES NEXT TO THE ROLE AND NOT IN THE NAV
 * ============================================================
 *
 * The tools are linked from the header and from the tracker's "Your work"
 * grid, and both of those ask somebody to remember, mid-application, that a
 * CV review exists. The moment a member actually needs one is the moment they
 * are reading a role and deciding to go for it, and the moment they need
 * interview prep is when a tracker row moves past Applied. So the prompt goes
 * there, carrying the role and the firm so the tool opens already pointed at
 * them (see lib/tool-links.ts).
 *
 * Three kinds, one per situation, and the copy is written for each rather
 * than shared:
 *   apply      a role you are about to apply for: CV review, cover letter
 *   interview  an application in flight: interview prep
 *   event      an open day or similar: the tracker, so the date stays in view
 *
 * No 'use client': nothing here has state, so the job page renders it on the
 * server and the tracker, a client component, renders it there.
 */

export type ToolPromptKind = 'apply' | 'interview' | 'event'

export default function ToolPrompt({
  kind,
  role,
  firm,
}: {
  kind: ToolPromptKind
  role?: string | null
  firm?: string | null
}) {
  const at = firm ? ` for ${firm}` : ''

  const copy =
    kind === 'apply'
      ? {
          kicker: 'Before you apply',
          body: `A sharper CV and a cover letter written${at} are what move an application up the pile. Both tools open already set up for this role.`,
          links: [
            { href: toolHref('cv-review', { role, firm }), label: 'Review your CV' },
            { href: toolHref('cover-letter', { role, firm }), label: 'Write the cover letter' },
          ],
        }
      : kind === 'interview'
        ? {
            kicker: 'Getting ready',
            body: `See the questions${firm ? ` ${firm}` : ' the panel'} are likely to ask, and why they ask them, before you are in the room.`,
            links: [{ href: toolHref('interview-prep', { role, firm }), label: 'Prepare for the interview' }],
          }
        : {
            kicker: 'Going?',
            body: 'Add it to your tracker so the closing date stays in view, and use the notes to keep track of who you meet on the day.',
            links: [{ href: '/tracker', label: 'Open your tracker' }],
          }

  return (
    <div className="tool-prompt">
      <p className="grotesk-bold tool-prompt-kicker">{copy.kicker}</p>
      <p className="grotesk-regular tool-prompt-body">{copy.body}</p>
      <div className="tool-prompt-links">
        {copy.links.map(l => (
          <Link key={l.href} href={l.href} className="grotesk-bold tool-prompt-link">
            {l.label} <ArrowRight size={13} aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  )
}
