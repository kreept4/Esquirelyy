/**
 * Links into the three tools, carrying the role they are being used for.
 *
 * ============================================================
 * WHY THE LINK CARRIES THE ROLE
 * ============================================================
 *
 * The prompts that point at the tools sit beside a specific role: on its card
 * in the roles email, on its page on the board, on its row in the tracker. A
 * prompt that says "write the cover letter for this one" and then opens a
 * blank form asks the reader to type back the firm and the title they were
 * looking at a second ago, and that retyping is where people give up. So the
 * link carries both and the tool fills them in.
 *
 * Two parameters and nothing else: `role` and `firm`. The tools only ever fill
 * an EMPTY field from them, so a link can never overwrite something somebody
 * had already typed or restored from their history.
 *
 * ⚠ READ ON THE CLIENT FROM window.location, NOT WITH useSearchParams. The
 * tool pages are client components rendered statically, and useSearchParams
 * there needs a Suspense boundary or the production build fails. Reading the
 * query once, after mount, is all a prefill needs.
 */

export type ToolSlug = 'cv-review' | 'cover-letter' | 'interview-prep'

/** Long enough for any real title or firm name, short enough that a pasted
 *  essay in a crafted link cannot land in a prompt to the model. */
const MAX = 140

function clean(v?: string | null): string {
  return (v ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX)
}

/** Path and query, no origin. The email prefixes its absolute site URL. */
export function toolHref(tool: ToolSlug, prefill: { role?: string | null; firm?: string | null } = {}): string {
  const q = new URLSearchParams()
  const role = clean(prefill.role)
  const firm = clean(prefill.firm)
  if (role) q.set('role', role)
  if (firm) q.set('firm', firm)
  const qs = q.toString()
  return `/tools/${tool}${qs ? `?${qs}` : ''}`
}

/** What a tool page reads on mount. Empty strings when the link carried none. */
export function readToolPrefill(search: string): { role: string; firm: string } {
  const q = new URLSearchParams(search)
  return { role: clean(q.get('role')), firm: clean(q.get('firm')) }
}

/** "Trainee Associate at Stren & Blan Partners", for the tools that take a
 *  single target-role box rather than separate role and employer fields. */
export function roleAtFirm({ role, firm }: { role: string; firm: string }): string {
  if (role && firm) return `${role} at ${firm}`
  return role || firm
}
