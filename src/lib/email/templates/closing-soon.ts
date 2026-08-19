/**
 * What is closing this week, as one email.
 *
 * Same tables and the same constraints as welcome.ts and wbg-deadline.ts, for
 * the same reasons: Outlook renders through Word, Gmail strips style blocks,
 * remote images are blocked by default. Read welcome.ts's header before
 * changing anything structural.
 *
 * ⚠ THIS WAS AN LBVIP ANNOUNCEMENT AND IS NOW A DIGEST, because a single-item
 * email was the wrong unit. Zyph Legal closes tomorrow and LBVIP closes on
 * Sunday. Sending one email about the later of the two, while the sooner one
 * went unmentioned, would have been the most expensive kind of omission: the
 * member reads their mail, acts on what it says, and misses the thing that shut
 * first.
 *
 * ⚠ THE ITEMS ARE PASSED IN, NOT HARDCODED, and they come from the same
 * `closingSoon()` the board uses. An email naming two things while the site
 * shows three is a disagreement nobody catches until a member does. One rule,
 * two surfaces.
 *
 * ⚠ SOONEST FIRST, ALWAYS, even though it means the richer story is rarely at
 * the top. LBVIP has three steps, a set topic and an unusually broad
 * eligibility, and it is genuinely the more interesting item. It still goes
 * second while something closes sooner, because the order of an email about
 * deadlines is not an editorial decision.
 *
 * ⚠ THE BUTTON GOES TO ESQUIRELY, NOT TO ANY EMPLOYER'S FORM, which is the
 * opposite of wbg-deadline.ts. That email had hours left and sent people
 * straight to the World Bank, because routing somebody through a login page
 * with an afternoon to spare loses them the application. These have days, and
 * at least one of them is not a single click: somebody landing on LBVIP's
 * Google Form first meets a field asking for a link to a video they have not
 * made, on a topic the form does not restate.
 *
 * ⚠ NO EM DASHES ANYWHERE, per the site's copy standard.
 */

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'
const CORAL = '#E5533D'
const MINT = '#14B8A6'

const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23241F16' stroke-opacity='0.28' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

export type ClosingItem = {
  slug: string
  title: string
  employer: string
  deadline: string
  /** Present on opportunities, absent on jobs. Drives the steps block. */
  eligibility?: string | null
  application_steps?: Array<{ step: number; title: string; detail: string }> | null
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function daysLeft(deadline: string, now: Date) {
  return Math.ceil((new Date(deadline).getTime() - now.getTime()) / 86_400_000)
}

function whenPhrase(deadline: string, now: Date) {
  const d = daysLeft(deadline, now)
  if (d <= 0) return 'today'
  if (d === 1) return 'tomorrow'
  return new Date(deadline).toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export function closingSoonEmail({
  name,
  siteUrl,
  items,
  now = new Date(),
}: {
  name?: string
  siteUrl: string
  items: ClosingItem[]
  now?: Date
}) {
  const first = (name || '').trim().split(/\s+/)[0]
  const soonest = items[0]
  const when = soonest ? whenPhrase(soonest.deadline, now) : ''

  /* Named, not counted. "Two things closing" is the shape of every marketing
     email anybody has ever ignored; which employer and when is what decides
     whether this gets opened. */
  const subject =
    items.length === 1
      ? `Closes ${when}: ${items[0].employer}`
      : `Closes ${when}: ${soonest.employer}, and ${items.length - 1} more this week`

  const greeting = first
    ? `${first}, ${items.length === 1 ? 'one thing closes' : `${items.length} things close`} this week.`
    : `${items.length === 1 ? 'One thing closes' : `${items.length} things close`} this week.`

  const link = (it: ClosingItem) => `${siteUrl}/jobs/${it.slug}`

  /* ---------------------------------------------------------------- text */
  const textLines: string[] = [greeting, '']
  items.forEach((it, i) => {
    textLines.push(`${i + 1}. ${it.employer}: ${it.title}`)
    textLines.push(`   Closes ${whenPhrase(it.deadline, now)}.`)
    if (it.eligibility) textLines.push(`   Open to ${it.eligibility.replace(/\.$/, '')}.`)
    if (it.application_steps?.length) {
      textLines.push(`   Applying takes ${it.application_steps.length} steps, in order:`)
      for (const s of it.application_steps) {
        textLines.push(`     ${s.step}. ${s.title}`)
      }
      textLines.push('   The exact wording of each step is on the listing.')
    }
    textLines.push(`   ${link(it)}`)
    textLines.push('')
  })
  textLines.push(
    'You do not need to be signed in to read any of these. An account is only asked',
    'for at the point you apply.',
    '',
    'from Bolu & Ipinu',
    'Co-founders, Esquirely',
    '',
    `Esquirely. ${siteUrl}`
  )
  const text = textLines.join('\n')

  /* ---------------------------------------------------------------- html */
  const cards = items
    .map(it => {
      const d = daysLeft(it.deadline, now)
      const urgent = d <= 2
      const steps = it.application_steps?.length
        ? `
              <p style="margin:10px 0 6px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">Applying takes ${it.application_steps.length} steps, in order</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                ${it.application_steps
                  .map(
                    s => `<tr>
                  <td width="24" valign="top" style="padding:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:14px;font-weight:900;color:${INK};">${s.step}</td>
                  <td valign="top" style="padding:0 0 6px 0;font-size:14px;line-height:1.55;color:${INK};">${esc(s.title)}</td>
                </tr>`
                  )
                  .join('\n                ')}
              </table>`
        : ''

      return `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 14px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:#FFF8E5;border:2px solid ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">${esc(it.employer)}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:${INK};">${esc(it.title)}</p>
                  ${it.eligibility ? `<p style="margin:0 0 6px 0;font-size:14px;line-height:1.6;color:${INK};">Open to <strong>${esc(it.eligibility.replace(/\.$/, ''))}</strong>.</p>` : ''}
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${urgent ? CORAL : INK};font-weight:${urgent ? 700 : 400};">
                    Closes ${esc(whenPhrase(it.deadline, now))}.
                  </p>
                  ${steps}
                  <p style="margin:12px 0 0 0;font-size:14px;line-height:1.6;">
                    <a href="${link(it)}" style="color:${INK};text-decoration:underline;font-weight:700;">Read the full details</a>
                  </p>
                </td>
              </tr>
            </table>`
    })
    .join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};">
<div style="display:none;font-size:1px;color:${CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  ${items.map(i => esc(i.employer)).join(', ')}. Soonest closes ${esc(when)}.
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
            <p style="margin:0 0 18px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-0.6px;color:${INK};">${esc(greeting)}</p>
${cards}

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:4px 0 18px 0;">
              <tr>
                <td style="padding:12px 14px;background-color:${CREAM};border:2px solid ${MINT};">
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
                    You do not need to be signed in to read any of these. An account is only asked
                    for at the point you apply.
                  </p>
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 20px 0;">
              <tr>
                <td bgcolor="${INK}" style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="${MINT}" style="border-collapse:collapse;background-color:${MINT};border:2px solid ${INK};">
                          <tr>
                            <td align="center" bgcolor="${MINT}" style="background-color:${MINT};padding:14px 28px;">
                              <a href="${siteUrl}/jobs#closing-soon" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">See everything closing soon</a>
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
                  <a href="${siteUrl}/jobs" style="color:${INK};text-decoration:none;">Jobs</a> &nbsp;&middot;&nbsp;
                  <a href="${siteUrl}/scholarships" style="color:${INK};text-decoration:none;">Scholarships</a> &nbsp;&middot;&nbsp;
                  <a href="${siteUrl}/firms" style="color:${INK};text-decoration:none;">Firms</a> &nbsp;&middot;&nbsp;
                  <a href="${siteUrl}/tracker" style="color:${INK};text-decoration:none;">Tracker</a>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 0 0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:10px;line-height:1.6;color:${MUTED};">
                  You are getting this because you made an Esquirely account. Turn opportunity
                  emails off any time under Your account.
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
