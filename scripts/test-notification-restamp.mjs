/**
 * Does a closing notification keep re-dating itself to the present?
 *
 * WHY THIS TEST EXISTS. Reported twice, from the outside, as two separate
 * complaints: notifications "still appear unread even after being read", and "I
 * saw a notification from the bell even if I dont have a new noti". Both are
 * the same row, and it is not the reader's browser.
 *
 * THE CLAIM UNDER TEST. buildFeed stamps a closing row with
 *
 *   at = now - (CLOSING_WINDOW_DAYS - days) * one day
 *
 * and the comment beside it says the row is "dated to the moment it entered the
 * window, so it surfaces once and then ages out of unread rather than
 * re-alerting on every panel open".
 *
 * That is true only if the expression is a fixed point, and it is not. `days`
 * comes from daysUntilDay, which counts WHOLE Lagos calendar days, so it holds
 * still for twenty-four hours at a time while `now` advances continuously. The
 * stamp therefore slides forward all day. At the boundary, where a listing
 * closes in exactly CLOSING_WINDOW_DAYS days, the offset is zero and `at` is
 * literally the current instant on every single render.
 *
 * WHY THAT BREAKS BOTH SYMPTOMS AT ONCE. Unread is `Date.parse(n.at) > seen`,
 * and opening the panel writes seen = Date.now(). A row restamped to "now" on
 * the next render is newer than the stamp that was just written, so it comes
 * back unread immediately and for ever, and it keeps announcing itself as new.
 * No amount of reading it helps, because the row is younger every time you look.
 *
 * The scholarship branch twenty lines above does the same job correctly: it
 * stamps from the parsed deadline, which does not move.
 *
 * Run: node scripts/test-notification-restamp.mjs
 * Costs nothing. buildFeed is pure and takes `now` as an argument.
 */

import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'notif-'))
const out = join(dir, 'notifications.mjs')
execSync(
  `npx --yes esbuild "src/lib/notifications.ts" --bundle --platform=node --format=esm --log-level=error "--outfile=${out}"`,
  { stdio: 'inherit' }
)
const { buildFeed, isUnread } = await import('file://' + out.replace(/\\/g, '/'))

/* A listing closing in exactly seven days, which is the boundary case. Seven is
   CLOSING_WINDOW_DAYS, so the offset applied to `now` is zero. */
const T1 = new Date('2026-09-21T15:00:00.000Z')
const T2 = new Date('2026-09-21T15:05:00.000Z') // five minutes later, same day

const job = {
  slug: 'boundary-case',
  title: 'Closes in exactly seven days',
  employer: 'Test',
  deadline: '2026-09-28',
  is_rolling: false,
  is_active: true,
  created_at: '2026-09-01T00:00:00.000Z',
}

const prefs = { roles: true, deadlines: true, tracker: true }
const feedAt = when => buildFeed([job], [], prefs, '', when)

const a = feedAt(T1).find(n => n.id === 'closing-boundary-case')
const b = feedAt(T2).find(n => n.id === 'closing-boundary-case')

if (!a || !b) {
  console.log('FAIL  the closing row was not produced at all; check prefs or the window')
  process.exit(1)
}

console.log('stamped at 15:00 ->', a.at)
console.log('stamped at 15:05 ->', b.at)

const moved = a.at !== b.at
console.log(`\n${moved ? 'FAIL' : 'PASS'}  the stamp ${moved ? 'MOVED between two renders on the same day' : 'held still across renders'}`)

/* The reader opens the bell at 15:00, which writes seen = 15:00. Then the page
   is rendered again at 15:05. Is the row they just read unread again? */
const seen = T1.getTime()
const backUnread = isUnread(b, seen, new Set(), new Set())
console.log(`${backUnread ? 'FAIL' : 'PASS'}  after reading at 15:00, the row is ${backUnread ? 'UNREAD AGAIN at 15:05' : 'still read at 15:05'}`)

/* And the control: a listing further inside the window, where the offset is a
   whole number of days and the drift is not visible within one day. */
const mid = { ...job, slug: 'mid-window', deadline: '2026-09-24' }
const m1 = buildFeed([mid], [], prefs, '', T1).find(n => n.id === 'closing-mid-window')
const m2 = buildFeed([mid], [], prefs, '', T2).find(n => n.id === 'closing-mid-window')
if (m1 && m2) {
  const midMoved = m1.at !== m2.at
  console.log(`${midMoved ? 'FAIL' : 'PASS'}  a listing three days out ${midMoved ? 'also moved' : 'held still'}`)
}

console.log(moved || backUnread ? '\nRESULT: the closing stamp is not a fixed point' : '\nRESULT: stamps are stable across renders')
process.exit(moved || backUnread ? 1 : 0)
