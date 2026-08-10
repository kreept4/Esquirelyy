/**
 * The nudge to change a password.
 *
 * Built from the same tables and the same constraints as welcome.ts, and for
 * the same reasons: Outlook renders through Word, Gmail strips style blocks,
 * remote images are blocked by default. Read the header of that file before
 * changing anything structural here.
 *
 * ON THE TONE. This is a security message and every instinct says to write it
 * like one, which is exactly why almost nobody acts on those. A password nag
 * that opens with "we take your security seriously" gets archived unread. This
 * one says the true and slightly embarrassing thing instead, which is that
 * everybody sets a password once and never thinks about it again, and that
 * forgetting it is normal rather than a failure. Somebody who feels caught out
 * closes the tab. Somebody who feels understood clicks the button.
 *
 * NO LINK THAT CHANGES ANYTHING. The button goes to the dashboard, which asks
 * for the current password before it will do a thing. Password mail that
 * carries a one-click credential link is the exact shape of every phishing
 * message these readers should be taught to distrust, and this one is not going
 * to teach them the opposite. The reset link exists, it is a button inside the
 * account page, and it is requested by the account holder rather than posted to
 * them unasked.
 */

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'

const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23241F16' stroke-opacity='0.28' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

export function passwordPromptEmail({ name, siteUrl }: { name?: string; siteUrl: string }) {
  const first = (name || '').trim().split(/\s+/)[0]
  const greeting = first ? `${first}, when did you last change it?` : 'When did you last change it?'

  const subject = first
    ? `${first}, your password could use a refresh`
    : 'Your password could use a refresh'

  const text = [
    greeting,
    '',
    'Nobody thinks about their password after the day they set it. That is not',
    'carelessness. It is just how passwords work.',
    '',
    'Two minutes fixes it. Open your account, enter the old one, choose a new one.',
    '',
    'Forgotten the old one? Most people have. There is a button on that page that',
    'emails you a link and skips it entirely.',
    '',
    'One rule. It has to be new. No cycling back to an old favourite.',
    '',
    `Change it here: ${siteUrl}/dashboard`,
    '',
    "Let's get back in now, shall we? ;)",
    '',
    'from Bolu & Ipinu',
    'Co-founders, Esquirely',
    '',
    'We will never email you a link that signs you in or changes your password.',
    'Anything that does is not from us.',
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
  Two minutes, and you are done.
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
            <p style="margin:0 0 14px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-0.6px;color:${INK};">${greeting}</p>

            <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:${INK};">
              Nobody thinks about their password after the day they set it. That is not
              carelessness. It is just how passwords work.
            </p>

            <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:${INK};">
              Two minutes fixes it. Open your account, enter the old one, choose a new one.
            </p>

            <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:${INK};">
              Forgotten the old one? Most people have. There is a button on that page that
              emails you a link and skips it entirely.
            </p>

            <!-- The rule, called out rather than buried, because it is the one
                 thing that stops somebody mid-flow if they meet it as an error
                 instead of as a heads up. -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 22px 0;">
              <tr>
                <td style="padding:12px 14px;border-left:3px solid ${INK};background-color:#F3EFE7;font-size:14px;line-height:1.6;color:${INK};">
                  <strong>One rule.</strong> It has to be new. No cycling back to an old favourite.
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 22px 0;">
              <tr>
                <td bgcolor="${INK}" style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#14B8A6" style="border-collapse:collapse;background-color:#14B8A6;border:2px solid ${INK};">
                          <tr>
                            <td align="center" bgcolor="#14B8A6" style="background-color:#14B8A6;padding:14px 28px;">
                              <a href="${siteUrl}/dashboard" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Change my password</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 22px 0;font-size:16px;line-height:1.6;font-weight:700;color:${INK};">
              Let&rsquo;s get back in now, shall we? &#128521;
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
              <!-- The anti-phishing line. This message is asking people to think
                   about a credential, which makes it the single best moment to
                   tell them what we will never send. -->
              <tr>
                <td style="padding:12px 0 0 0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:10px;line-height:1.6;color:${MUTED};">
                  We will never email you a link that signs you in or changes your password.
                  Anything that does is not from us.
                  You are getting this because you made an Esquirely account.
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
