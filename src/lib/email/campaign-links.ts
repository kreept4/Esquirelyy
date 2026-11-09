/**
 * Tags every link back to the site in an email, so a visit it produces is
 * counted as coming from that email.
 *
 * ============================================================
 * WHY THE LINKS ARE TAGGED HERE AND NOT BY THE SENDER
 * ============================================================
 *
 * Brevo can count clicks itself, and lib/email/send.ts switches that off on
 * purpose: it does it by rewriting every link through a brevo.com redirector,
 * which is a link the reader cannot read before they tap it and a pattern
 * spam filters weigh against a sender. A utm_ tag leaves every link pointing
 * straight at esquirely.com.ng and lets the site's own analytics do the
 * counting (see lib/analytics.ts). Without it, a tap in the Gmail app arrives
 * with no referrer and is filed with everybody who typed the address.
 *
 * ONLY THE SITE'S OWN LINKS. A link to a firm's careers page or an apply
 * mailbox is the firm's address, and a tag on it is noise in somebody else's
 * logs. Images are not links and are left alone too: the logo plates and the
 * texture are fetched by the mail client, not by a reader choosing to visit.
 *
 * A link that already carries utm_ tags keeps them, so a block that wants to
 * be counted separately can say so and this will not overwrite it.
 */

export type Campaign = {
  /** Which email: "roles-email". */
  source: string
  /** Which send of it: the drop id, "roles-2026-11-09". */
  campaign: string
}

function tag(url: string, siteUrl: string, c: Campaign): string {
  if (!url.startsWith(siteUrl)) return url
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return url
  }
  if ([...u.searchParams.keys()].some(k => k.startsWith('utm_'))) return url
  u.searchParams.set('utm_source', c.source)
  u.searchParams.set('utm_medium', 'email')
  u.searchParams.set('utm_campaign', c.campaign)
  return u.toString()
}

/** href attributes in the HTML part. Values arrive attribute-escaped. */
export function tagHtmlLinks(html: string, siteUrl: string, c: Campaign): string {
  return html.replace(/href="([^"]*)"/g, (whole, raw: string) => {
    const url = raw.replace(/&amp;/g, '&')
    const tagged = tag(url, siteUrl, c)
    return tagged === url ? whole : `href="${tagged.replace(/&/g, '&amp;')}"`
  })
}

/** Bare URLs in the plain-text part. Trailing punctuation stays outside. */
export function tagTextLinks(text: string, siteUrl: string, c: Campaign): string {
  const esc = siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`${esc}[^\\s]*?(?=[.,;:!?)]*(?:\\s|$))`, 'g'), url => tag(url, siteUrl, c))
}
