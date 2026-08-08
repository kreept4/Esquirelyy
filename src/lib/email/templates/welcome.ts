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
 * There is no image anywhere in this message — not in the body and not in the
 * masthead. Outlook and Gmail block remote images by default, so anything
 * served over HTTP arrives as an empty box for a large share of readers. Every
 * mark here is made of table cells, background colours and type.
 */

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'

/**
 * Contour texture — INK strokes, on the cream around the amber panel.
 *
 * This used to stroke AMBER, and that was the bug behind "the header is brown,
 * not yellow". Amber lines at 0.16 alpha over cream do not read as texture;
 * they wash the ground toward a flat sand, and sitting next to the ink rule and
 * the ink offset shadow the whole band reads brown rather than as a bright
 * yellow panel on paper.
 *
 * The site does not do that. `--contour` in globals.css strokes INK because the
 * ground is cream, and the footer — which this masthead is a copy of — puts the
 * texture on the cream AROUND the amber panel, never inside it. Same colour and
 * same alpha here, so the mail and the footer are the same object.
 *
 * (The amber-stroked variant is still correct for a DARK ground and still
 * exists, as --contour-amber in globals.css and inline in the confirm-signup
 * template. It just does not belong on cream.)
 *
 * Inlined as a data URI rather than referenced by URL: a remote image is
 * blocked by default in Outlook and Gmail, and a texture that appears for only
 * some readers is worse than one that appears for none. Outlook's Word engine
 * ignores background-image on a <td> and renders the flat `bgcolor` underneath,
 * which is the intended fallback — hence the colour is set as an attribute as
 * well as in CSS.
 */
const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23241F16' stroke-opacity='0.28' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

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
    <!-- 10px of cream all round, so the contour reads as the paper the panel is
         printed on rather than as a wide margin. Any more and the amber stops
         filling the screen; any less and the texture disappears. -->
    <td style="padding:10px;">
      <!-- The offset shadow, drawn as an ink cell because Word ignores
           box-shadow. bgcolor as well as CSS: this is the layer that shows
           through if a client drops a background, so it has to be the one thing
           that never fails to be ink. -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="border-collapse:collapse;background-color:${INK};">
        <tr>
          <td style="padding:0 5px 5px 0;">
            <!-- The panel. The bgcolor ATTRIBUTE and the inline
                 background-color, always both. A table carrying the colour only
                 in CSS can have it stripped by Gmail, and what shows through is
                 the ink cell above — which is precisely how a bright yellow
                 masthead arrives brown.
                 (No backticks in these comments: this whole document is a JS
                 template literal, and one would end it.) -->
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

        <!-- Body -->
        <tr>
          <td style="padding:0;font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 14px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-0.6px;color:${INK};">${greeting}</p>

            <!-- NO ILLUSTRATION HERE, DELIBERATELY.
                 This carried a 220px PNG rendered from welcome.svg. It is gone,
                 and should not come back as an <img> of any kind.

                 A remote image in an email is blocked by default in Outlook and
                 in Gmail's default settings, so for a large share of readers it
                 was never a picture — it was a 220px empty box, or a broken-image
                 icon, sitting between the greeting and the first line. It also
                 made the message depend on siteUrl resolving to a host that
                 serves the file with the right content-type, which is exactly
                 what went wrong when the apex domain answered every path with
                 200 text/html.

                 The masthead already carries the identity, and it is drawn in
                 tables and background colours that every client renders. The
                 message reads the same for everyone now, which an image cannot
                 promise. -->
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
                 square is drawn deliberately with the site's rule and offset.
                 The mint is #14B8A6, the site's --mint, and it now carries the
                 bgcolor ATTRIBUTE as well as CSS. Without the attribute Gmail
                 could strip the background and leave the ink offset cell
                 showing through the button — which is why this arrived as a
                 dull dark green rather than mint. Same failure as the masthead,
                 same fix. -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 26px 0;">
              <tr>
                <td bgcolor="${INK}" style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#14B8A6" style="border-collapse:collapse;background-color:#14B8A6;border:2px solid ${INK};">
                          <tr>
                            <td align="center" bgcolor="#14B8A6" style="background-color:#14B8A6;padding:14px 28px;">
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
            <!-- Sign-off. The short names, and only the short names.
                 An inbox shows "Esquirely" as the sender, which is a company
                 and not a correspondent, so the message has to say who is
                 writing — and it says it the way they actually introduce
                 themselves. Full legal names under a friendly note read like a
                 letterhead. The same line appears on the welcome note in the
                 app, word for word: one greeting arriving twice, not two
                 greetings. -->
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
