/**
 * LBVIP 5.0, the Lekan Bamidele virtual internship, closing 23 August 2026.
 *
 * Same tables and the same constraints as welcome.ts and wbg-deadline.ts, for
 * the same reasons: Outlook renders through Word, Gmail strips style blocks,
 * remote images are blocked by default. Read welcome.ts's header before changing
 * anything structural.
 *
 * ⚠ THE BUTTON GOES TO ESQUIRELY, NOT TO THE FIRM'S FORM, AND THAT IS THE
 * OPPOSITE OF wbg-deadline.ts. That email had hours left and sent people
 * straight to the World Bank, because routing somebody through a login page with
 * an afternoon to spare is how you lose them the application.
 *
 * This one has days, and the shape of the thing is different. LBVIP is not one
 * click: it is a video on a set topic, then a public post tagging the firm, then
 * a form. Somebody who lands on the Google Form first meets a field asking for a
 * link to a video they have not made, on a topic the form does not restate. The
 * steps have to be read before the form is opened, and the listing is where they
 * are. The ship plan says the same in as many words.
 *
 * ⚠ THE ELIGIBILITY IS THE HOOK, NOT THE DEADLINE. Every deadline email on this
 * platform leads with the date. This one leads with who may apply, because the
 * firm opened it to law students, law graduates AND new wigs, and a new wig
 * reading "internship" assumes it is not for them and stops. The date is in the
 * subject line and stated twice in the body; it does not need to be the first
 * thing said.
 *
 * ⚠ THE TOPIC IS REPRODUCED EXACTLY, and it is long. It is the actual prompt the
 * entry is judged on, so a shortened version in an email would have people
 * recording against wording the firm did not set. If it looks unwieldy in the
 * layout, the layout gives way, not the string.
 *
 * ⚠ NO EM DASHES ANYWHERE, per the site's copy standard.
 *
 * ⚠ STEPS ONE AND TWO NEED NO ACCOUNT, and the email says so. The form link on
 * the listing is behind sign-in like every other apply route, and a reader four
 * days out who hits that wall may simply not come back. Telling them they can
 * record and post today, and sign in when they are ready to submit, is both true
 * and the difference between a bounce and an application.
 */

const INK = '#241F16'
const AMBER = '#FBBF24'
const CREAM = '#FAF7F2'
const MUTED = '#8A8378'
const CORAL = '#E5533D'
const MINT = '#14B8A6'

const CONTOUR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%23241F16' stroke-opacity='0.28' stroke-width='1.5'%3E%3Cpath d='M0 20c26-14 54 14 80 0s54-14 80 0'/%3E%3Cpath d='M0 47c26-11 54 11 80 0s54-11 80 0'/%3E%3Cpath d='M0 74c26-16 54 16 80 0s54-16 80 0'/%3E%3Cpath d='M0 101c26-9 54 9 80 0s54-9 80 0'/%3E%3Cpath d='M0 128c26-15 54 15 80 0s54-15 80 0'/%3E%3C/g%3E%3C/svg%3E\")"

/**
 * The opportunity this email is about. One copy, read by both the text and the
 * HTML branch, so the two cannot drift apart.
 *
 * `slug` must match what `opportunitySlug()` in lib/opportunities.ts derives
 * from the title, because that is what the route resolves. It is written out
 * rather than imported so this template stays bundlable on its own, and any
 * change to the opportunity's title has to be reflected here by hand.
 */
export const LBVIP = {
  slug: 'lbvip-5-0-lekan-bamidele-virtual-internship-programme',
  firm: 'Lekan Bamidele & Co (The Bohemian Firm)',
  title: 'LBVIP 5.0, the Lekan Bamidele Virtual Internship Programme',
  eligibility: 'Law students, law graduates and new wigs',
  closes: '23 August',
  closesLong: 'Sunday, 23 August 2026',
  handle: 'thebohemianlawyers',
  hashtag: 'LBVIP26',
  topic:
    'Can Social Media Influence Justice? Exploring the Impact of Social Media Activism on ' +
    'Public Opinion, Accountability and the Justice System in Nigeria.',
}

export function lbvipEmail({ name, siteUrl }: { name?: string; siteUrl: string }) {
  const first = (name || '').trim().split(/\s+/)[0]
  /* Leads on eligibility. A new wig who reads "internship" and assumes it is a
     students-only programme is exactly the reader this send exists to reach. */
  const greeting = first
    ? `${first}, this internship is not just for students.`
    : 'This internship is not just for students.'
  const subject = `Closes ${LBVIP.closes}: a virtual internship open to new wigs too`
  const listing = `${siteUrl}/jobs/${LBVIP.slug}`

  const text = [
    greeting,
    '',
    `${LBVIP.firm} are running the fifth edition of their virtual internship.`,
    `It is open to ${LBVIP.eligibility.toLowerCase()}, and it is done entirely online.`,
    `Applications close ${LBVIP.closesLong}.`,
    '',
    'Applying takes three steps, in order:',
    '',
    `1. Record a two minute video introducing yourself and speaking on the topic:`,
    `   "${LBVIP.topic}"`,
    `2. Post it to Instagram or LinkedIn, tag the firm at ${LBVIP.handle}, and include`,
    `   the hashtag ${LBVIP.hashtag}. Copy the link to your post, because the form asks`,
    '   for it. A video on a private account cannot be opened by the firm.',
    '3. Fill in the firm’s form and paste your video link into it.',
    '',
    'You do not need to be signed in for the first two steps. Record and post today if',
    'the date is close, and sign in when you are ready to submit the form.',
    '',
    `The full details, the exact topic and the firm’s handles: ${listing}`,
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
  Open to law students, law graduates and new wigs. Three steps, all online. Closes ${LBVIP.closes}.
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

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 16px 0;">
              <tr>
                <td style="padding:14px 16px;background-color:#FFF8E5;border:2px solid ${INK};">
                  <p style="margin:0 0 2px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">${LBVIP.firm}</p>
                  <p style="margin:0 0 6px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:18px;line-height:1.25;font-weight:900;letter-spacing:-0.3px;color:${INK};">LBVIP 5.0, a virtual internship</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
                    Open to <strong>law students, law graduates and new wigs</strong>, and run
                    entirely online, so where you are does not matter.
                    <strong style="color:${CORAL};">Closes ${LBVIP.closesLong}.</strong>
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 10px 0;font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-weight:700;color:${MUTED};">Applying takes three steps, in order</p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px 0;">
              <tr>
                <td width="28" valign="top" style="padding:0 0 12px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;color:${INK};">1</td>
                <td valign="top" style="padding:0 0 12px 0;font-size:14px;line-height:1.6;color:${INK};">
                  Record a two minute video introducing yourself and speaking on the topic:
                  <span style="display:block;padding:8px 10px;margin:6px 0 0 0;background-color:#FFF8E5;border-left:3px solid ${INK};font-style:italic;">${LBVIP.topic}</span>
                </td>
              </tr>
              <tr>
                <td width="28" valign="top" style="padding:0 0 12px 0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;color:${INK};">2</td>
                <td valign="top" style="padding:0 0 12px 0;font-size:14px;line-height:1.6;color:${INK};">
                  Post it to Instagram or LinkedIn, tag the firm at <strong>${LBVIP.handle}</strong>,
                  and include the hashtag <strong>${LBVIP.hashtag}</strong>. Copy the link to your
                  post, because the form asks for it. A video on a private account cannot be
                  opened by the firm.
                </td>
              </tr>
              <tr>
                <td width="28" valign="top" style="padding:0;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;color:${INK};">3</td>
                <td valign="top" style="padding:0;font-size:14px;line-height:1.6;color:${INK};">
                  Fill in the firm&rsquo;s form and paste your video link into it.
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px 0;">
              <tr>
                <td style="padding:12px 14px;background-color:${CREAM};border:2px solid ${MINT};">
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};">
                    You do not need to be signed in for the first two steps. Record and post today
                    if the date is close, and sign in when you are ready to submit the form.
                  </p>
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 14px 0;">
              <tr>
                <td bgcolor="${INK}" style="background-color:${INK};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 3px 3px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="${MINT}" style="border-collapse:collapse;background-color:${MINT};border:2px solid ${INK};">
                          <tr>
                            <td align="center" bgcolor="${MINT}" style="background-color:${MINT};padding:14px 28px;">
                              <a href="${listing}" style="font-family:'Schibsted Grotesk',Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Read the full details</a>
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
              The exact topic, the firm&rsquo;s handles on each platform and the form link are all on
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
