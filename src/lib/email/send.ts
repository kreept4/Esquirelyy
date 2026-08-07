/**
 * Transactional email, through Brevo's REST API.
 *
 * Brevo rather than Resend, for one hard reason: Resend's free tier will only
 * deliver to the account owner's own address until a DOMAIN is verified, and
 * there is no domain here yet. Brevo verifies a single SENDER ADDRESS instead,
 * so a plain mailbox works, at 300 messages a day free. That is the difference
 * between this shipping and not.
 *
 * `fetch`, not an SDK. The whole surface used here is one POST, and the `resend`
 * package that was in package.json was both unused and unusable for the reason
 * above, so it has gone rather than been swapped for another dependency.
 *
 * SERVER ONLY. `BREVO_API_KEY` has no NEXT_PUBLIC_ prefix on purpose — a key
 * that can send mail as Esquirely must never reach a browser bundle. Importing
 * this from a client component will fail at build, which is the intended
 * outcome.
 *
 * Absent configuration is a no-op, not a throw. Local development and preview
 * builds have no key, and a signup that 500s because nobody set an env var is a
 * worse failure than a signup that completes without a welcome message. Every
 * call reports what it did so the caller can log it.
 */

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

export type SendResult =
  | { ok: true; skipped?: false; id?: string }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string }

export type SendArgs = {
  to: string
  toName?: string
  subject: string
  html: string
  /** Always supply one. A message with no text/plain part scores as spam. */
  text: string
}

export function emailConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL)
}

export async function sendEmail({ to, toName, subject, html, text }: SendArgs): Promise<SendResult> {
  const key = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || 'Esquirely'

  if (!key || !senderEmail) {
    return {
      ok: true,
      skipped: true,
      reason: !key ? 'BREVO_API_KEY not set' : 'BREVO_SENDER_EMAIL not set',
    }
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': key,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      /* Bounded. This runs inside a request the user is waiting on, and Brevo
         occasionally hangs rather than refusing; ten seconds is far longer than
         a healthy call and far shorter than a request timeout. */
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, error: `brevo ${res.status}: ${body.slice(0, 200)}` }
    }

    const data = (await res.json().catch(() => ({}))) as { messageId?: string }
    return { ok: true, id: data.messageId }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
