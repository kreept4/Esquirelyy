import {
  NEW_ROLES,
  NEW_ROLES_HREF,
  ROLE_ENTRIES,
  dropPronoun,
  dropSubject,
  dropVerb,
  employerSentenceShort,
  newRolesCta,
  noticePhrase,
  publishedNouns,
  roleCountLabel,
  roleSummary,
} from '@/lib/new-roles'
import {
  closingScholarships,
  daysUntilDeadline,
  closesInWords,
} from '@/lib/scholarships-data'
import { activeStudentNotice } from '@/lib/email/student-notice'
import { activeClosingNotice } from '@/lib/email/closing-notice'

/**
 * The new roles announcement.
 *
 * Same tables and the same constraints as welcome.ts, for the same reasons:
 * Outlook renders through Word, Gmail strips style blocks, remote images are
 * blocked by default. Read that file's header before changing anything
 * structural.
 *
 * THE ROLES ARE LISTED, NOT SUMMARISED. A message that says "new roles are up,
 * come and look" asks the reader to spend a click finding out whether it is
 * relevant to them, and most will not. Naming the firm, the seat and the one
 * fact that decides it, in two lines each, means somebody knows before they
 * tap whether this is for them. The click that follows is then worth something.
 *
 * THE BUTTON GOES TO THE FILTERED BOARD, the same URL the notification and the
 * carousel use. Sending this to /jobs would be a small betrayal of the subject
 * line: the reader was told about two roles and would arrive at twenty.
 */

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'

/**
 * The closing card's accent, and the one place in this email that is red.
 *
 * ⚠ RED IS RESERVED FOR "THIS SHUTS SOON", NOTHING ELSE. The scholarship block
 * further down keeps amber, and that difference is the point rather than an
 * inconsistency: a funding deadline a week out and a role that closes in three
 * days are not the same claim on a reader's evening, and two blocks in the same
 * colour would flatten the distinction the ordering is there to make.
 *
 * Chosen for legibility on the ink ground rather than off a palette. #F0C030,
 * the amber it replaced, is a warm gold that on #241F16 reads as decoration.
 * This is bright enough to register as an alarm and still clears sensible
 * contrast against the card at 11px uppercase, which is the smallest and
 * hardest-working type in the message.
 */
const URGENT = '#FF6B5B'

const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23241F16' stroke-opacity='0.28' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

/**
 * One entry per role.
 *
 * FACTS, IN THE ORDER SOMEBODY DECIDES BY: where, what level, what work, how to
 * apply, when it closes. An earlier version of these lines editorialised
 * instead, on the theory that a description should sell the role. It said a
 * seat meant "running matters rather than supporting them", which is a
 * flourish, and it took the space where the reader was looking for a location
 * and a deadline.
 *
 * The test for anything on this list: could a reader act on it without opening
 * the board. A sentence that only makes sense once you already know the role is
 * not doing any work in an email.
 */
/* ⚠ THE ROLE LINES MOVED TO lib/new-roles.ts. This file held its own array of
 * two while that file named three slugs and NotificationBell described three
 * seats: three lists and three different answers, so the subject line would
 * have counted one number while the body listed another. The entries now live
 * beside the slug each one describes and every surface reads them from there.
 * The wording is unchanged; only its home moved. */
const ROLES = ROLE_ENTRIES

/* Shared with the notification modal rather than defined twice — the singular
   possessive ("the employer's own notice", describing two employers) was in
   both places, and fixing it in one would have left the other wrong. */
const NOTICE_OWNER = noticePhrase()

/* _RETIRED_ROLES lived here: a copy of the two roles from the drop before last,
   kept "for reference" after the entries moved to lib/new-roles.ts. It was dead
   the day it was written — nothing read it — and by the time it was deleted it
   described roles that had been off the board for a week. A stale copy of an
   announcement sitting in the file that writes announcements is a trap for
   whoever edits this next. Git has the history. */

export function newRolesEmail({ name, siteUrl }: { name?: string; siteUrl: string }) {
  const first = (name || '').trim().split(/\s+/)[0]
  /* THE SHORT FIRM NAMES, not the full ones. The headline is set at 26px and
     the subject line is cut off around 70 characters in most clients, and
     "Olajide Oyewole LLP (DLA Piper Africa)" spends 19 of those on a
     parenthetical. The network name is not lost — it is on the role card below,
     where there is room for it and where somebody reading the actual role will
     see it. */
  const firms = employerSentenceShort()
  /* Names the firms rather than grading them. "Two worth a look" was our
     opinion arriving before the reader had the facts to form their own. */
  /* ⚠ THE VOCATIVE GOES LAST, AND IT IS NOT A STYLE CHOICE.
     This headline was `${first}, ${firms} are hiring.`, which for a drop of two
     renders "Tobi, KBO and Olajide Oyewole are hiring": three names separated by
     a comma and an "and", which is a list, and the reader's own name is the
     first employer in it. Every other template here opens `${first}, …` quite
     safely because what follows is a clause ("Tobi, this one closes today."); it
     is only here that the clause is itself a list of proper nouns, so it is only
     here that the comma has two readings.

     That was solved with an em dash after the name. The copy standard for the
     site does not allow em dashes, so the fix is now structural rather than
     typographic: the name moves to the end, where nothing follows it to be
     mistaken for a continuation of a list. This holds however many firms the
     next drop names, which the comma version did not.
     Do not move the name back to the front. */
  const greeting = first ? `${firms} are hiring, ${first}.` : `${firms} are hiring.`
  const subject = `${roleCountLabel()}: ${firms}`
  const link = `${siteUrl}${NEW_ROLES_HREF}`

  /**
   * A scholarship closing this week, if there is one.
   *
   * ⚠ DERIVED, NOT WRITTEN IN. The obvious way to add Rhodes to this email was
   * to type Rhodes into it, and that would have been wrong by the next send:
   * this template is reused for every drop, so a hardcoded scholarship becomes a
   * message announcing a closing date that passed weeks ago. closingScholarships
   * reads the same array /scholarships renders and the bell notifies on, so all
   * three can only ever say the same thing.
   *
   * SEVEN DAYS, matching the bell's window and the jobs board's. A member should
   * not be told something is closing soon in one place and not in another.
   *
   * IT RENDERS NOTHING WHEN NOTHING IS CLOSING, which is the normal case. This
   * is a roles email; the scholarship block is an interruption that has to earn
   * its place, and an empty section headed "Closing soon" would be worse than no
   * section at all.
   *
   * ONE, NOT ALL. If two ever close in the same week the soonest wins, because
   * the block is a nudge rather than a digest and the button under it already
   * goes to the page that lists every one of them.
   */
  const closingScholarship = closingScholarships(7)[0] ?? null
  /* Null once the notice expires, which is what keeps a reused template from
     announcing a deadline that has passed. See lib/email/student-notice.ts. */
  const studentNotice = activeStudentNotice()
  /* Null once the deadline passes, so a reused template cannot announce a
     role that has closed. See lib/email/closing-notice.ts. */
  const closingNotice = activeClosingNotice()
  const scholarshipDays = closingScholarship ? daysUntilDeadline(closingScholarship) : null

  const text = [
    greeting,
    '',
    /* The closing card leads the plain-text part too, for the same reason it
       leads the HTML: a reader on a text-only client has the same deadline. */
    ...(closingNotice
      ? [
          `${closingNotice.label.toUpperCase()}: ${closingNotice.employer}, ${closingNotice.title}`,
          closingNotice.body,
          `${siteUrl}/jobs/${closingNotice.slug}`,
          '',
        ]
      : []),
    ...ROLES.flatMap(r => [`${r.employer}: ${r.title}`, r.line, '']),
    `${dropSubject()} ${dropVerb()} read off ${NOTICE_OWNER}, so ${publishedNouns()}`,
    'above are the ones they published.',
    '',
    /* The plain-text part gets the notice too. A recipient whose client
       blocks HTML would otherwise receive a different email from everybody
       else, and this block is the half of the message aimed at students. */
    ...(studentNotice
      ? [
          `${studentNotice.kicker.toUpperCase()}: ${studentNotice.title}`,
          studentNotice.body,
          `${studentNotice.cta}: ${studentNotice.href}`,
          '',
        ]
      : []),
    `See ${dropPronoun()} here: ${link}`,
    '',
    'from Bolu & Ipinu',
    'Co-founders, Esquirely',
    '',
    `Esquirely. ${siteUrl}`,
  ].join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};">
<div style="display:none;font-size:1px;color:${CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  ${roleSummary()}.
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${CREAM}" style="border-collapse:collapse;background-color:${CREAM};background-image:${CONTOUR};background-repeat:repeat;">
  <tr>
    <td style="padding:10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="border-collapse:collapse;background-color:${INK};">
        <tr>
          <td style="padding:0 5px 5px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${AMBER}" style="border-collapse:collapse;background-color:${AMBER};border:2px solid ${INK};">
              <tr>
                <td align="center" bgcolor="${AMBER}" style="background-color:${AMBER};padding:30px 18px;">
                  <p style="margin:0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:52px;line-height:0.9;font-weight:900;letter-spacing:-2.4px;color:${INK};">ESQUIRELY</p>
                  <p style="margin:10px 0 0 0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:10px;line-height:1.4;letter-spacing:1.6px;text-transform:uppercase;color:${INK};">Nigeria&rsquo;s legal career platform</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${CREAM};">
  <tr>
    <td align="center" style="padding:8px 14px 28px 14px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="border-collapse:collapse;width:560px;max-width:100%;">

        <tr>
          <td style="padding:0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 18px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-0.6px;color:${INK};">${greeting.replace(/—/g, '&mdash;')}</p>

            ${
              /* ⚠ ABOVE THE NEW ROLES, DELIBERATELY. See lib/email/
                 closing-notice.ts: the email is ordered by what the reader
                 stands to lose, not by what we added. This is the only block
                 permitted above the role cards.

                 Amber on ink, which is the treatment the scholarship block uses
                 for a deadline further down. Same visual language for the same
                 kind of fact, so a reader who has had one of these before knows
                 what the colour means before reading a word. */
              closingNotice
                ? `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:${INK};border:2px solid ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${URGENT};">${closingNotice.label} &middot; ${closingNotice.employer}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:#FFF8E5;">${closingNotice.title}</p>
                  <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#FFF8E5;">${closingNotice.body}</p>
                  <a href="${siteUrl}/jobs/${closingNotice.slug}" style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${URGENT};text-decoration:underline;">See the role</a>
                </td>
              </tr>
            </table>`
                : ''
            }

            ${ROLES.map(
              r => `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 14px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:#FFF8E5;border:2px solid ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">${r.employer}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:${INK};">${r.title}</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">${r.line}</p>
                </td>
              </tr>
            </table>`
            ).join('')}

            ${
              closingScholarship && scholarshipDays !== null
                ? `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:18px 0 4px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:${INK};border:2px solid ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:#F0C030;">Funding &middot; ${closesInWords(scholarshipDays)}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:#FFF8E5;">${closingScholarship.title}</p>
                  <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#FFF8E5;">${closingScholarship.funding}. ${closingScholarship.deadline}.</p>
                  <a href="${siteUrl}/scholarships" style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#F0C030;text-decoration:underline;">See the terms</a>
                </td>
              </tr>
            </table>`
                : ''
            }

            ${
              /* The student notice, on a light card rather than the ink one the
                 scholarship block uses. Two dark blocks stacked would read as a
                 second footer, and this one is an aside rather than an urgent
                 deadline: it is here for the share of the list still at
                 university, and the rest should be able to skip it at a glance.
                 Renders nothing at all when activeStudentNotice() returns null,
                 which it does once the notice expires. */
              studentNotice
                ? `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:18px 0 4px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:#FFF8E5;border:2px dashed ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">${studentNotice.kicker}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:${INK};">${studentNotice.title}</p>
                  <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:${INK};">${studentNotice.body}</p>
                  <a href="${studentNotice.href}" style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${INK};text-decoration:underline;">${studentNotice.cta}</a>
                </td>
              </tr>
            </table>`
                : ''
            }

            <p style="margin:14px 0 20px 0;font-size:15px;line-height:1.7;color:${INK};">
              ${dropSubject()} ${dropVerb()} read off ${NOTICE_OWNER.replace(/’/g, '&rsquo;')}, so
              ${publishedNouns()} above are the ones they published rather
              than an aggregator&rsquo;s guess.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 24px 0;">
              <tr>
                <td bgcolor="${INK}" style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#14B8A6" style="border-collapse:collapse;background-color:#14B8A6;border:2px solid ${INK};">
                          <tr>
                            <td align="center" bgcolor="#14B8A6" style="background-color:#14B8A6;padding:14px 28px;">
                              <a href="${link}" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${newRolesCta()}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 4px 0;">
              <tr>
                <td style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;font-weight:700;color:${INK};">
                  from Bolu &amp; Ipinu
                  <span style="display:block;font-size:11px;line-height:1.6;letter-spacing:1px;text-transform:uppercase;font-weight:400;color:${MUTED};padding-top:3px;">Co-founders, Esquirely</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding:16px 0 0 0;border-top:2px solid ${INK};font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:10px;line-height:1.7;letter-spacing:1px;text-transform:uppercase;font-weight:700;color:${INK};">
                  <a href="${siteUrl}/jobs" style="color:${INK};text-decoration:none;">Jobs board</a> &nbsp;&middot;&nbsp;
                  <a href="${siteUrl}/scholarships" style="color:${INK};text-decoration:none;">Scholarships</a> &nbsp;&middot;&nbsp;
                  <a href="${siteUrl}/firms" style="color:${INK};text-decoration:none;">Firms</a> &nbsp;&middot;&nbsp;
                  <a href="${siteUrl}/tracker" style="color:${INK};text-decoration:none;">Tracker</a>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 0 0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:10px;line-height:1.6;color:${MUTED};">
                  You are getting this because you made an Esquirely account. Turn new-role emails
                  off any time under Your account.
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  return { subject, text, html }
}

