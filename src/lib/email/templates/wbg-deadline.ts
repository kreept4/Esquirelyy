/**
 * The World Bank Group legal internship, closing today.
 *
 * Same tables and the same constraints as welcome.ts and new-roles.ts, for the
 * same reasons: Outlook renders through Word, Gmail strips style blocks, remote
 * images are blocked by default. Read welcome.ts's header before changing
 * anything structural.
 *
 * SHORT ON PURPOSE. The announcement template lists several openings and asks
 * the reader to choose. This has one job and a few hours to do it. Every extra
 * sentence competes with the deadline.
 *
 * ⚠ THE BUTTON GOES TO THE WORLD BANK, NOT TO US. Every other email here sends
 * the reader to the board, which is right when they have days. With hours left,
 * routing somebody through a login page to reach a link we do not control is a
 * way of losing them the application.
 *
 * ⚠ THE DISQUALIFIER STAYS IN THE BODY. The Bank runs this on its no-fee track:
 * it does not pay the intern, and you qualify only if your university certifies
 * the placement for academic credit or pays a stipend at the Bank's minimum.
 * That letter cannot be got in an afternoon. An email that shouts about a
 * deadline and lets the reader discover this on the application form has wasted
 * their evening. Saying it costs us the click and is the only honest send.
 *
 * ⚠ NO EM DASHES ANYWHERE, including in the role title, which carries one in
 * the database. Colons and full stops instead.
 */

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'
const CORAL = '#E5533D'

const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23241F16' stroke-opacity='0.28' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

/** The listing this email is about. One copy, read by both the text and the
 *  HTML branch, so the two cannot drift apart. */
export const WBG = {
  slug: 'world-bank-pioneers-legal-internship-2026',
  employer: 'World Bank Group',
  /** Colon, not the em dash the database holds. */
  title: 'WBG Pioneers: Legal Vice Presidency Intern',
  applyUrl:
    'https://worldbankgroup.csod.com/ux/ats/careersite/1/home/requisition/37744?c=worldbankgroup',
  closes: '12 August',
}

export function wbgDeadlineEmail({ name, siteUrl }: { name?: string; siteUrl: string }) {
  const first = (name || '').trim().split(/\s+/)[0]
  const greeting = first ? `${first}, this one closes today.` : 'This one closes today.'
  /* Names the institution. "Closing today" on its own is the shape of every
     marketing email anybody has ever ignored; whose internship it is decides
     whether this gets opened. */
  const subject = 'Closes today: World Bank Group legal internship'
  const listing = `${siteUrl}/jobs/${WBG.slug}`

  const text = [
    greeting,
    '',
    `${WBG.employer}: ${WBG.title}`,
    'Three months in the Bank’s in-house legal department. Washington DC, Nairobi,',
    'Pretoria, Singapore, New Delhi or Vienna. Final year LLB, or an LL.M, JD or PhD.',
    `Nigeria qualifies. Closes today, ${WBG.closes}.`,
    '',
    'One catch, and it is the whole thing. The Bank does not pay you on this track.',
    'You qualify only if your university certifies in writing that the placement',
    'counts for academic credit, or pays you a stipend at the Bank’s minimum. No',
    'letter, no application. It runs again next cycle, so ask your faculty now.',
    '',
    'If you have the letter: two page CV, one page cover letter, and go.',
    '',
    `Apply: ${WBG.applyUrl}`,
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
  Three months in the Legal Vice Presidency. Applications close ${WBG.closes}.
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

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 14px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:#FFF8E5;border:2px solid ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">${WBG.employer}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:${INK};">${WBG.title}</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
                    Three months in the Bank&rsquo;s in-house legal department. Washington DC,
                    Nairobi, Pretoria, Singapore, New Delhi or Vienna. Final year LLB, or an
                    LL.M, JD or PhD. Nigeria qualifies.
                    <strong style="color:${CORAL};">Closes today, ${WBG.closes}.</strong>
                  </p>
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:${CREAM};border:2px solid ${CORAL};">
                  <p style="margin:0 0 6px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${CORAL};">One catch, and it is the whole thing</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
                    The Bank does not pay you on this track. You qualify only if your university
                    certifies in writing that the placement counts for academic credit, or pays
                    you a stipend at the Bank&rsquo;s minimum. No letter, no application. It runs
                    again next cycle, so ask your faculty now.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:${INK};">
              If you have the letter: two page CV, one page cover letter, and go.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 14px 0;">
              <tr>
                <td bgcolor="${INK}" style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#14B8A6" style="border-collapse:collapse;background-color:#14B8A6;border:2px solid ${INK};">
                          <tr>
                            <td align="center" bgcolor="#14B8A6" style="background-color:#14B8A6;padding:14px 28px;">
                              <a href="${WBG.applyUrl}" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Apply on the World Bank site</a>
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

  return { subject, text, html }
}
