import { BOSS_NUMBER } from '../types'
import type { Notification, Notifier, SendResult } from '../types'
import { LogNotifier } from './log'

/**
 * WhatsApp via Twilio. Stubbed, and deliberately runnable.
 *
 * ⚠ THE SEND IS COMMENTED OUT, NOT MISSING. Everything around it is real: the
 * credential read, the endpoint, the body shape, the fallback. Turning this on
 * is uncommenting one fetch and setting three environment variables, not
 * writing an integration from a blank file. That is the difference between a
 * stub that saves work and a stub that pretends to.
 *
 * WHAT IS STILL NEEDED FROM A PERSON, and none of it is code:
 *
 * A Twilio account with WhatsApp enabled, which gives TWILIO_ACCOUNT_SID and
 * TWILIO_AUTH_TOKEN. The sandbox works for testing today and sends from a
 * shared Twilio number; a production sender needs a number of your own.
 *
 * TWILIO_WHATSAPP_FROM, which is the sender in `whatsapp:+14155238886` form.
 * The `whatsapp:` prefix is part of the value and Twilio rejects the number
 * without it, which is the single most common way this fails first time.
 *
 * A registered content template for each message type, because these agents
 * message outside the 24 hour window. Twilio calls them Content Templates and
 * takes them by SID as `ContentSid`, with variables as a JSON object keyed by
 * position. Until those SIDs exist, `template` on a Notification carries the
 * name and this driver has nowhere to put it, which is why an unapproved send
 * falls through to the log rather than silently failing at Twilio.
 */
export class TwilioNotifier implements Notifier {
  readonly name = 'twilio'
  private readonly sid = process.env.TWILIO_ACCOUNT_SID
  private readonly token = process.env.TWILIO_AUTH_TOKEN
  private readonly from = process.env.TWILIO_WHATSAPP_FROM
  /** Maps a Notification.template.name to the Twilio Content SID. */
  private readonly templates: Record<string, string> = JSON.parse(
    process.env.TWILIO_TEMPLATE_SIDS || '{}'
  )
  private readonly fallback = new LogNotifier()

  private configured(): boolean {
    return Boolean(this.sid && this.token && this.from)
  }

  async send(n: Notification): Promise<SendResult> {
    if (!this.configured()) {
      console.warn(
        '[notify:twilio] NOTIFY_DRIVER is twilio but TWILIO_ACCOUNT_SID, ' +
          'TWILIO_AUTH_TOKEN or TWILIO_WHATSAPP_FROM is unset. Writing to the log instead.'
      )
      return this.fallback.send(n)
    }

    const contentSid = n.template ? this.templates[n.template.name] : undefined
    if (!contentSid) {
      /* No approved template for this message type. A free-text send would be
         accepted by Twilio and then dropped by WhatsApp outside the 24 hour
         window, which is the worst outcome: a success response and no message.
         Logging is honest. */
      console.warn(
        `[notify:twilio] No Content SID for template "${n.template?.name ?? '(none)'}". ` +
          'Outside the 24 hour window this would not deliver, so it is going to the log.'
      )
      return this.fallback.send(n)
    }

    /* The live call. Twilio's Messages endpoint is form-encoded, not JSON, and
       both the `To` and `From` carry the `whatsapp:` scheme prefix.

    const body = new URLSearchParams({
      To: `whatsapp:${BOSS_NUMBER}`,
      From: this.from!,
      ContentSid: contentSid,
      ContentVariables: JSON.stringify(
        Object.fromEntries((n.template?.variables ?? []).map((v, i) => [String(i + 1), v]))
      ),
    })

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${this.sid}:${this.token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }
    )

    const json = await res.json()
    if (!res.ok) return { ok: false, driver: this.name, error: json?.message ?? res.statusText }
    return { ok: true, driver: this.name, id: json.sid }

    */

    console.warn('[notify:twilio] Driver is stubbed. Uncomment the send in drivers/twilio.ts.')
    return this.fallback.send(n)
  }
}
