import {
  NEW_ROLES,
  NEW_ROLES_HREF,
  ROLE_ENTRIES,
  dropSubject,
  dropVerb,
  noticePhrase,
  roleCountLabel,
  roleSummary,
} from '@/lib/new-roles'

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
  const firms = NEW_ROLES.employersShort.join(' and ')
  /* Names the firms rather than grading them. "Two worth a look" was our
     opinion arriving before the reader had the facts to form their own. */
  const greeting = first ? `${first}, ${firms} are hiring.` : `${firms} are hiring.`
  const subject = `${roleCountLabel()}: ${firms}`
  const link = `${siteUrl}${NEW_ROLES_HREF}`

  const text = [
    greeting,
    '',
    ...ROLES.flatMap(r => [`${r.employer}: ${r.title}`, r.line, '']),
    `${dropSubject()} ${dropVerb()} read off ${NOTICE_OWNER}, so the closing dates and`,
    'the application routes above are the ones they published.',
    '',
    `See them here: ${link}`,
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
            <p style="margin:0 0 18px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-0.6px;color:${INK};">${greeting}</p>

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

            <p style="margin:14px 0 20px 0;font-size:15px;line-height:1.7;color:${INK};">
              ${dropSubject()} ${dropVerb()} read off ${NOTICE_OWNER.replace(/’/g, '&rsquo;')}, so the
              closing dates and the application routes above are the ones they published rather
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
                              <a href="${link}" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Show me the new roles</a>
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

