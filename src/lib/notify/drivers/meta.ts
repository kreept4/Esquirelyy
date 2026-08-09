import { BOSS_NUMBER } from '../types'
import type { Notification, Notifier, SendResult } from '../types'
import { LogNotifier } from './log'

/**
 * WhatsApp via the Meta Cloud API. Stubbed, same shape as the Twilio driver.
 *
 * Cheaper than Twilio at volume and with no middleman, which is why it is the
 * better long-term answer if the message count grows. The cost is up front and
 * it is not code: a Meta Business account, business verification that can take
 * days, a WhatsApp Business Account, a phone number registered to it, and a
 * permanent access token from a system user rather than the 24 hour token the
 * developer console hands out first.
 *
 * ⚠ THE TOKEN YOU GET FIRST IS NOT THE ONE YOU WANT. Meta's onboarding shows a
 * temporary access token that expires in 24 hours, and it works perfectly in
 * testing, which is how people ship it. A scheduled agent using it stops
 * sending the next day with a 401 that reads like a credential typo. Generate a
 * System User token in Business Settings and give it whatsapp_business_messaging.
 *
 * Templates work the same way as on Twilio, except Meta takes the template by
 * NAME rather than by an opaque id, along with the language code it was
 * approved in. That is one fewer mapping to maintain, which is a small point in
 * this driver's favour.
 */
export class MetaCloudNotifier implements Notifier {
  readonly name = 'meta'
  private readonly token = process.env.META_WHATSAPP_TOKEN
  private readonly phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
  private readonly apiVersion = process.env.META_GRAPH_VERSION || 'v21.0'
  /** Language the templates were approved in. Meta rejects a mismatch. */
  private readonly lang = process.env.META_TEMPLATE_LANG || 'en'
  private readonly fallback = new LogNotifier()

  private configured(): boolean {
    return Boolean(this.token && this.phoneNumberId)
  }

  async send(n: Notification): Promise<SendResult> {
    if (!this.configured()) {
      console.warn(
        '[notify:meta] NOTIFY_DRIVER is meta but META_WHATSAPP_TOKEN or ' +
          'META_WHATSAPP_PHONE_NUMBER_ID is unset. Writing to the log instead.'
      )
      return this.fallback.send(n)
    }

    if (!n.template) {
      console.warn(
        '[notify:meta] This notification has no approved template. Outside the ' +
          '24 hour window a free-text send does not deliver, so it is going to the log.'
      )
      return this.fallback.send(n)
    }

    /* The live call. Meta wants the recipient in bare E.164 with no plus and
       no scheme prefix, which is the opposite of Twilio's convention and the
       usual reason a first send returns 400 with an unhelpful message.

    const to = BOSS_NUMBER.replace(/^\+/, '')

    const res = await fetch(
      `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: n.template.name,
            language: { code: this.lang },
            components: [
              {
                type: 'body',
                parameters: n.template.variables.map(text => ({ type: 'text', text })),
              },
            ],
          },
        }),
      }
    )

    const json = await res.json()
    if (!res.ok) {
      return { ok: false, driver: this.name, error: json?.error?.message ?? res.statusText }
    }
    return { ok: true, driver: this.name, id: json?.messages?.[0]?.id }

    */

    console.warn('[notify:meta] Driver is stubbed. Uncomment the send in drivers/meta.ts.')
    return this.fallback.send(n)
  }
}
