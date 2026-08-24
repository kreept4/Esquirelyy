/**
 * The call to join the team — PAUSED, 24 August 2026.
 *
 * ⚠ THIS FILE NO LONGER EXPORTS AN ADDRESS OR A MAILTO, AND THAT IS THE WHOLE
 * OF THE TAKEDOWN. It exported `TEAM_CALL.email` and `TEAM_CALL_MAILTO`, and
 * three surfaces read them: the About page's "Join us" block, the modal behind
 * the notification bell, and the bell notification that opened it. All three
 * are down. Their own files carry the reasoning at the point of removal; this
 * one carries the reason there is nothing left to import.
 *
 * WHY PAUSED AND NOT DELETED. We are not ready to run the intake. That is a
 * different thing from the programme ending, and the difference decides what
 * happens to this file: a deleted module has to be rebuilt from memory, and
 * what gets rebuilt is never quite what was there. The copy that mattered is
 * quoted in the comments at each removal site so it can be restored rather than
 * reinvented.
 *
 * ⚠ AND THE PART THAT MUST SURVIVE ANY RESTORATION: IT SAYS VOLUNTEER, IN THE
 * FIRST SENTENCE, IN EVERY PLACE IT IS SAID. The block read "We are hiring"
 * once, before anybody had said the positions were unpaid, and would have had
 * people spending an evening on an application under the wrong assumption. The
 * word does not need "unpaid" beside it and carried it for a while: volunteer
 * is the plain term, every reader knows it, and saying it twice reads as
 * bracing for an objection rather than stating the terms. What earns the
 * reader's time is where the word sits, not how many ways it is put.
 *
 * ============================================================
 * TO REOPEN
 * ============================================================
 *
 * Four edits, and they have to go together or the site contradicts itself:
 *
 *   1. Here          set `paused: false`, restore `email` and TEAM_CALL_MAILTO,
 *                    and BUMP `id` — that is what makes the note unread again
 *                    for everybody who dismissed the last one.
 *   2. notifications  restore the step 0c push (kind 'team'). The kind and its
 *                    entry in ACK_KINDS were never removed.
 *   3. NotificationBell  restore the modal, `showTeam`, and `openTeam`.
 *   4. app/about     restore the "Join us" copy and the address on it.
 *
 * ⚠ CHECK THE MAILBOX IS BEING READ BEFORE ANY OF IT. The reason the call came
 * down is that an application nobody answers costs the sender an evening and
 * costs us the goodwill. Restoring the button without restoring the reading is
 * the failure this pause exists to prevent.
 */

export const TEAM_CALL = {
  /**
   * Kept from the paused call rather than cleared.
   *
   * Two reasons. It is what identifies the note in a reader's dismissed and
   * read lists in localStorage, and those lists outlive this pause — clearing
   * it would make the OLD note unread again for everybody the moment it is
   * restored under a new id, which is the opposite of what dismissing it meant.
   * And it dates the pause: this is the call that was up when applications
   * closed.
   *
   * BUMP IT WHEN THE CALL REOPENS, for the reason it always had — a new id is
   * what makes the note unread again, and somebody who read the August note has
   * not read the next one.
   */
  id: 'team-call-2026-08-10',
  /** ISO. Sorted the notification while there was one. */
  at: '2026-08-10T17:00:00.000Z',
  /**
   * ⚠ THE FLAG NOTHING BRANCHES ON, AND IT IS DELIBERATELY NOT WIRED UP.
   *
   * The tempting version of this pause is `paused: true` plus an `if` at each
   * of the four call sites, so reopening is one boolean. That was rejected: it
   * leaves the address, the mailto and the modal copy in the shipped bundle and
   * alive behind a flag, and a flag that is flipped by accident — or read
   * wrongly at one of four sites — puts a live application form back in front
   * of members with nobody reading the replies. Removal cannot fail that way.
   *
   * So this exists to be READ BY A PERSON grepping for why the imports vanished,
   * and to make the state of the programme a fact in the codebase rather than
   * an absence somebody has to infer. See "TO REOPEN" above.
   */
  paused: true,
} as const
