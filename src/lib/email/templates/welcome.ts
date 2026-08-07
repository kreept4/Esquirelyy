/**
 * The welcome message, sent once, after the address has been proved.
 *
 * Built to the footer: square corners, a heavy ink rule, a flat amber field and
 * the wordmark carrying the block. Every constraint here is an email client
 * constraint rather than a design one:
 *
 *   - TABLES, not flex or grid. Outlook 2007-2021 renders through Word, which
 *     supports neither; a flex row silently becomes a vertical stack.
 *   - The hard offset shadow is a CELL, not `box-shadow`. Word ignores
 *     box-shadow, so the offset is an ink-filled table sitting under the amber
 *     one. Same effect, made of the one thing that renders everywhere.
 *   - Fonts fall back on purpose. Hanken and Schibsted are Google-hosted and no
 *     desktop client will fetch them, so the stack ends at Arial and the sizes
 *     are chosen to hold up in Arial rather than to look right only in Hanken.
 *   - Every colour is inline and literal. `<style>` blocks are stripped by
 *     Gmail's clipper and CSS custom properties resolve nowhere.
 *
 * There is no image in the body. Outlook and Gmail block remote images by
 * default, and a welcome whose content is a picture arrives blank for a large
 * share of readers.
 */

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'

/**
 * Contour texture, drawn in amber on the ink masthead.
 *
 * The site's `--contour` strokes in INK because it goes on cream. Here the
 * ground is ink, so the same lines are drawn in amber at low opacity instead.
 * Inlined as a data URI rather than referenced by URL: a remote image would be
 * blocked by default in Outlook and Gmail, and a texture that only appears for
 * some readers is worse than one that appears for none.
 *
 * Outlook's Word engine ignores background-image on a <td> and will render the
 * flat `bgcolor` underneath. That is the intended fallback, which is why the
 * colour is set as an attribute as well as in CSS.
 */
const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23FBBF24' stroke-opacity='0.16' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

export function welcomeEmail({ name, siteUrl }: { name?: string; siteUrl: string }) {
  const first = (name || '').trim().split(/\s+/)[0]
  const greeting = first ? `Welcome, ${first}.` : 'Welcome to Esquirely.'

  const subject = first ? `Welcome to Esquirely, ${first}` : 'Welcome to Esquirely'

  const text = [
    greeting,
    '',
    'You are in.',
    '',
    'Esquirely keeps one board of what is genuinely open to Nigerian lawyers and law',
    'students. Roles at law firms, banks, energy companies, fintechs and regulators.',
    'Scholarships that actually admit law, not the ones every list repeats.',
    'Real deadlines, working apply links, nothing that closed in March.',
    '',
    'Where to start:',
    '',
    `1. The board. Filter by employer, practice area, city and how far along you are.`,
    `   ${siteUrl}/jobs`,
    `2. Save what catches you. It lands in your tracker, and applying from a listing`,
    `   files it there by itself, so you never lose track of what you sent.`,
    `   ${siteUrl}/tracker`,
    `3. Put your CV through the review. It knows what LL.B, B.L and call to the Bar`,
    `   mean, and what a Nigerian firm reads first.`,
    `   ${siteUrl}/tools/cv-review`,
    '',
    'Go and find something worth applying for.',
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
<!-- Preheader: the line inboxes show beside the subject. Hidden in the body. -->
<div style="display:none;font-size:1px;color:${CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  Your account is live. Here is where to start.
</div>

<!-- MASTHEAD, FULL BLEED.
     Edge to edge on every screen, with no media query: the band is width="100%"
     and the panel inside it is width="100%" too, so on a 393px iPhone 15 it is
     393px, on a 430px Pro Max it is 430px, and on a desktop client it stops at
     the 560px the body is capped to. Media queries are the wrong tool here
     because the Gmail app strips <style> blocks, so anything that depended on
     one would be full-bleed in Apple Mail and inset in Gmail.

     This is the site footer, rebuilt in tables: contour on the cream ground,
     an amber panel over it with a 2px ink rule and a hard offset shadow drawn
     as an ink cell, and the wordmark in ink carrying the block. The shadow is
     a cell rather than box-shadow because Outlook renders through Word and
     ignores box-shadow entirely. -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${CREAM}" style="border-collapse:collapse;background-color:${CREAM};background-image:${CONTOUR};background-repeat:repeat;">
  <tr>
    <td style="padding:14px 10px 18px 10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${INK};">
        <tr>
          <td style="padding:0 5px 5px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${AMBER}" style="border-collapse:collapse;background-color:${AMBER};border:2px solid ${INK};">
              <tr>
                <td align="center" style="padding:26px 18px;">
                  <p style="margin:0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:44px;line-height:0.92;font-weight:900;letter-spacing:-2px;color:${INK};">ESQUIRELY</p>
                  <p style="margin:8px 0 0 0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:10px;line-height:1.4;letter-spacing:1.6px;text-transform:uppercase;color:${INK};">Nigeria&rsquo;s legal career platform</p>
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

        <!-- Body -->
        <tr>
          <td style="padding:0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 14px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-0.6px;color:${INK};">${greeting}</p>

            <!-- The illustration.
                 A PNG, because Gmail strips <svg> and refuses SVG in <img src>
                 and Outlook cannot draw it. Rendered from the same
                 welcome.svg the site uses, by scripts/render-email-art.mjs.

                 It sits BELOW the greeting and carries no information, with an
                 empty alt, because Outlook and Gmail block remote images by
                 default: for a good share of readers this space is simply
                 blank, and the message has to read exactly as well when it is.
                 Width and height are set as attributes so the layout does not
                 reflow when it does load. -->
            <p style="margin:0 0 16px 0;">
              <img src="${siteUrl}/email/welcome-art.png" width="220" height="220" alt=""
                   style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;width:220px;height:auto;max-width:100%;" />
            </p>

            <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:${INK};">
              You are in.
            </p>

            <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:${INK};">
              Esquirely keeps one board of what is genuinely open to Nigerian lawyers and law
              students. Roles at law firms, banks, energy companies, fintechs and regulators.
              Scholarships that actually admit law, not the ones every list repeats. Real
              deadlines, working apply links, nothing that closed in March.
            </p>

            <p style="margin:0 0 10px 0;font-size:13px;line-height:1.5;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:${INK};">Where to start</p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 22px 0;">
              ${[
                ['The board', 'Filter by employer, practice area, city and how far along you are.', '/jobs'],
                ['Save what catches you', 'It lands in your tracker, and applying from a listing files it there by itself, so you never lose track of what you sent.', '/tracker'],
                ['Put your CV through the review', 'It knows what LL.B, B.L and call to the Bar mean, and what a Nigerian firm reads first.', '/tools/cv-review'],
              ]
                .map(
                  ([title, body, path], i) => `
              <tr>
                <td width="26" valign="top" style="padding:0 0 12px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;color:${INK};">${String(i + 1).padStart(2, '0')}</td>
                <td valign="top" style="padding:0 0 12px 0;">
                  <a href="${siteUrl}${path}" style="font-size:15px;line-height:1.45;font-weight:700;color:${INK};text-decoration:none;border-bottom:1.5px solid ${INK};">${title}</a>
                  <span style="display:block;font-size:13px;line-height:1.6;color:${MUTED};padding-top:2px;">${body}</span>
                </td>
              </tr>`
                )
                .join('')}
            </table>

            <!-- Primary action. A bordered cell, not a rounded button: Word
                 ignores border-radius and renders a square anyway, so the
                 square is drawn deliberately with the site's rule and offset. -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 26px 0;">
              <tr>
                <td style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#14B8A6;border:2px solid ${INK};">
                          <tr>
                            <td align="center" style="padding:12px 26px;">
                              <a href="${siteUrl}/jobs" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Go and find something worth applying for</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Signature -->
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
                  You are getting this because you made an Esquirely account.
                  Esquirely is a careers platform and does not provide legal advice.
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

  return { subject, html, text }
}
