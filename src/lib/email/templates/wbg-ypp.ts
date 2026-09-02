/**
 * The World Bank Group Young Professionals Program, closing soon.
 *
 * Same tables and the same constraints as welcome.ts, new-roles.ts and
 * wbg-deadline.ts, for the same reasons: Outlook renders through Word, Gmail
 * strips style blocks, remote images are blocked by default. Read welcome.ts's
 * header before changing anything structural.
 *
 * ⚠ THE COUNTDOWN IS COMPUTED, NEVER WRITTEN. closing-notice.ts states the rule
 * and this template obeys it: "NEVER WRITE 'CLOSES IN 3 DAYS' INTO COPY. It is
 * true for one day." The brief for this send asked for "2 days left", which was
 * 26 days wrong on the day it was asked for. `now` is injectable, the number
 * comes from daysUntilDay and the words from daysLeftWords, so the same
 * template is correct on 28 September, on 29 September, and on the morning it
 * shuts. It also cannot disagree with the bell or the board, which read the
 * same two functions.
 *
 * ⚠ THE BUTTON GOES TO THE WORLD BANK, NOT TO US, on the same reasoning
 * wbg-deadline.ts gives: with days left, routing somebody through a login page
 * to reach a link we do not control is a way of losing them the application.
 *
 * ⚠ THE BLOCK IS HEADED "BEFORE YOU APPLY", AND IT WAS "WHO IT IS NOT FOR,
 * FIRST". That was reported as reading oddly and it does: it is a construction
 * nobody says out loud, it puts a negative in the reader's face before they
 * know what the thing is, and the block underneath it is not purely negative
 * anyway, since half of it is the age limit being LIFTED. "Before you apply"
 * covers a disqualifier and an enabler equally and sounds like a person.
 *
 * ⚠ THE DISQUALIFIER IS THE EXPERIENCE FLOOR AND IT GOES HIGH UP. The Bank
 * wants two to six years. The largest single group on this list finished Law
 * School in July and cannot apply, and they should learn that from the second
 * paragraph rather than from the form. The internship template put its own
 * disqualifier in the body for exactly this reason and the argument has not
 * changed: saying it costs us the click and is the only honest send.
 *
 * ⚠ AND IT CORRECTS THE AGE LIMIT, which is the opposite case. The YPP had one
 * for most of its history and no longer does. Nearly every Nigerian write-up
 * still repeats it, so some readers are holding a disqualifier that has stopped
 * being true and will not apply unless told.
 *
 * ⚠ PLAIN ASCII PUNCTUATION ONLY, per lib/house-style.ts, in the HTML as well
 * as the text. wbg-deadline.ts used curly quotes and &rsquo; entities; those
 * survive a well-behaved client and are exactly what arrives as a black
 * diamond when one re-encodes the body. Straight quotes cannot.
 */

import { daysUntilDay, daysLeftWords } from '@/lib/day'

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'
const CORAL = '#E5533D'
const TEAL = '#14B8A6'

const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23241F16' stroke-opacity='0.28' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

/** The listing this email is about. One copy, read by both the text and the
 *  HTML branch, so the two cannot drift apart. */
export const WBG_YPP = {
  slug: 'world-bank-group-young-professionals-programme-2027',
  employer: 'World Bank Group',
  title: 'Young Professionals Program 2027',
  /** The Legal Vice Presidency stream. See the seed script for why this one. */
  applyUrl:
    'https://worldbankgroup.csod.com/ux/ats/careersite/1/home/requisition/38204?c=worldbankgroup',
  /** ICSID, the other legal stream. */
  icsidUrl:
    'https://worldbankgroup.csod.com/ux/ats/careersite/1/home/requisition/38188?c=worldbankgroup',
  /** ISO. Drives the countdown and the refusal to send after it.
   *
   *  ⚠ 30 September, NOT 1 October, even though the Bank's cutoff of 23:59 UTC
   *  falls at 00:59 on 1 October in Lagos. This column is the last Lagos
   *  calendar day the role is open, which is what lib/day.ts counts against for
   *  the board, the bell and the expiry sweep. Storing 1 October to capture the
   *  extra fifty nine minutes would put a day the form is shut onto every
   *  countdown on the site. The Lagos time is stated in `closesLagos` instead. */
  deadline: '2026-09-30',
  /** Short form, for the bold deadline line. The Bank's own wording. */
  closes: '30 September, 23:59 UTC',
  /** The same instant for the reader this site is written for. Spelled out
   *  because a Lagos reader converting UTC in their head at speed is as likely
   *  to subtract the hour as add it, and the version where they subtract costs
   *  them the last hour of the last day. */
  closesLagos: '00:59 on 1 October in Lagos',
}

/** Days left, in Lagos calendar days. Null once it has passed, which is the
 *  send script's cue to refuse rather than this template's to improvise. */
export function wbgYppDaysLeft(now: Date = new Date()): number | null {
  const d = daysUntilDay(WBG_YPP.deadline, now)
  return d === null || d < 0 ? null : d
}

export function wbgYppEmail({
  name,
  siteUrl,
  now = new Date(),
}: {
  name?: string
  siteUrl: string
  now?: Date
}) {
  const days = wbgYppDaysLeft(now)
  if (days === null) {
    throw new Error(
      `WBG YPP closed on ${WBG_YPP.deadline}. Refusing to render a deadline email for a shut application.`
    )
  }

  /* "2 days left", "1 day left", "Closes today". One function, shared with the
     board and the bell. */
  const left = daysLeftWords(days)
  const first = (name || '').trim().split(/\s+/)[0]
  /* ⚠ THE GREETING TRACKS THE COUNT TOO, AND DID NOT USED TO.
     It was a fixed "the World Bank shuts this one soon", which is right on the
     28th and false on the 2nd: 28 days is not soon, and a headline that
     overstates urgency on the first send is how a reader learns to discount the
     one that matters. Same rule as the countdown itself, one line further up
     the page. Three bands, because the honest sentence genuinely differs:
     an opening, a warning, and a last call. */
  const headline =
    days === 0
      ? 'this one closes today.'
      : days <= 7
        ? 'the World Bank shuts this one this week.'
        : 'the World Bank has opened its 2027 intake.'
  const greeting = first
    ? `${first}, ${headline}`
    : headline.charAt(0).toUpperCase() + headline.slice(1)
  /* Names the institution and leads with the count. Whose programme it is
     decides whether this gets opened; the count decides whether it gets opened
     today. */
  const subject = `${left}: World Bank Group Young Professionals`
  const listing = `${siteUrl}/jobs/${WBG_YPP.slug}`

  const text = [
    greeting,
    '',
    `${WBG_YPP.employer}: ${WBG_YPP.title}`,
    'Two years in Washington DC on a GF term, then a five year contract if you',
    'perform. Three eight month rotations, one of them in a country office.',
    `Nigeria qualifies on nationality. ${left}, closing ${WBG_YPP.closes},`,
    `which is ${WBG_YPP.closesLagos}.`,
    '',
    'Before you apply. The Bank asks for two to six years post-call, and a',
    'graduate degree finished before the September start. That second one catches',
    'people out here: the floor is a master\'s, so an LL.B with Law School does not',
    'clear it on its own and you need an LL.M or equivalent. If you were called',
    'this year, this is not your round. A full time doctorate can stand in for the',
    'experience.',
    '',
    'And one correction, because it costs people this application every cycle:',
    'there is no age limit any more. The Bank removed it. Most Nigerian write-ups',
    'of this programme still print the old born-after rule.',
    '',
    'Thirty three streams were advertised and two of them are legal work. The',
    'Legal Vice Presidency is the Bank in-house: drafting and negotiating project',
    'loan agreements, advising country teams on legal and policy risk. ICSID is',
    'investment treaty arbitration. You do not have to choose now, since the form',
    'lets you name two alternative streams on one application.',
    '',
    `Apply, Legal Vice Presidency: ${WBG_YPP.applyUrl}`,
    `The ICSID stream: ${WBG_YPP.icsidUrl}`,
    `Full eligibility: ${listing}`,
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
  Two years in Washington DC, then five on performance. Applications close ${WBG_YPP.closes}.
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
                  <p style="margin:10px 0 0 0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:10px;line-height:1.4;letter-spacing:1.6px;text-transform:uppercase;color:${INK};">Nigeria's legal career platform</p>
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

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 14px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:#FFF8E5;border:2px solid ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">${WBG_YPP.employer}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:${INK};">${WBG_YPP.title}</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
                    Two years in Washington DC on a GF term, then a five year contract if you
                    perform. Three eight month rotations, one of them in a country office.
                    Nigeria qualifies on nationality.
                    <strong style="color:${CORAL};">${left}, closing ${WBG_YPP.closes},</strong>
                    which is ${WBG_YPP.closesLagos}.
                  </p>
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:${CREAM};border:2px solid ${CORAL};">
                  <p style="margin:0 0 6px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${CORAL};">Before you apply</p>
                  <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:${INK};">
                    The Bank asks for two to six years post-call, and a graduate degree finished
                    before the September start. That second one catches people out here:
                    <strong>the floor is a master's</strong>, so an LL.B with Law School does
                    not clear it on its own and you need an LL.M or equivalent. If you were
                    called this year, this is not your round. A full time doctorate can stand in
                    for the experience.
                  </p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
                    One correction the other way, because it costs people this application every
                    cycle: <strong>there is no age limit any more.</strong> The Bank removed it.
                    Most Nigerian write-ups of this programme still print the old rule.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:${INK};">
              Thirty three streams were advertised and two of them are legal work. The Legal
              Vice Presidency is the Bank in-house: drafting and negotiating project loan
              agreements, advising country teams on legal and policy risk.
              <a href="${WBG_YPP.icsidUrl}" style="color:${INK};text-decoration:underline;">ICSID</a>
              is investment treaty arbitration. You do not have to choose now, since the form
              lets you name two alternative streams on one application.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 14px 0;">
              <tr>
                <td bgcolor="${INK}" style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="${TEAL}" style="border-collapse:collapse;background-color:${TEAL};border:2px solid ${INK};">
                          <tr>
                            <td align="center" bgcolor="${TEAL}" style="background-color:${TEAL};padding:14px 28px;">
                              <a href="${WBG_YPP.applyUrl}" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Apply on the World Bank site</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px 0;font-size:14px;line-height:1.7;color:${MUTED};">
              Full eligibility is on
              <a href="${listing}" style="color:${INK};text-decoration:underline;">the listing</a>.
            </p>

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
                  You are getting this because you made an Esquirely account. Turn deadline
                  reminders off any time under Your account.
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

  return { subject, text, html, days }
}
