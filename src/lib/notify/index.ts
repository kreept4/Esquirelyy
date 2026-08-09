import type { Notification, Notifier, SendResult } from './types'
import { LogNotifier } from './drivers/log'
import { TwilioNotifier } from './drivers/twilio'
import { MetaCloudNotifier } from './drivers/meta'

export type { Notification, Notifier, SendResult } from './types'
export { BOSS_NUMBER } from './types'
export { brief } from './compose'

/**
 * How the agents talk to Bolu.
 *
 * WHY THIS IS AN INTERFACE AND NOT A `sendWhatsApp()` FUNCTION. WhatsApp is not
 * a thing code can just send. It needs a Business API sender, and there are two
 * of them with very different setup costs: Twilio, which works today against a
 * sandbox and costs a little more per message, and the Meta Cloud API, which is
 * cheaper at volume and needs a Meta Business verification that takes days.
 * That decision is not made yet, and it should not be the thing that stops the
 * agents from being built.
 *
 * So the sender sits behind this interface with both drivers stubbed and a
 * third that writes to a file. The agents import `notify()` and never learn
 * which one is live. Picking a sender later is one environment variable and
 * filling in one `send` method, not a search through the agent code for every
 * place a message goes out.
 *
 * THE DEFAULT IS THE FILE LOG, DELIBERATELY. An agent whose notifier is not
 * configured should still run and still leave a readable record of what it did.
 * The alternative, throwing on a missing credential, would mean the news agent
 * cannot be tested until a Meta Business verification clears, which is exactly
 * the coupling this interface exists to prevent.
 */

/**
 * Which driver is live.
 *
 * `log` is the default and the only one that works with no credentials. The
 * others read their own configuration and will say so plainly if it is absent,
 * rather than failing at the call site.
 */
export type DriverName = 'log' | 'twilio' | 'meta'

function driverFromEnv(): DriverName {
  const raw = (process.env.NOTIFY_DRIVER || 'log').toLowerCase().trim()
  if (raw === 'twilio' || raw === 'meta' || raw === 'log') return raw
  /* An unrecognised value is a typo in a deployment config, and the useful
     response is to keep working and say so once. Falling back silently would
     hide a notifier that was meant to be live and is not. */
  console.warn(`[notify] Unknown NOTIFY_DRIVER "${raw}". Falling back to the file log.`)
  return 'log'
}

let cached: Notifier | null = null

/** The live notifier. Cached, because a driver may hold a client. */
export function getNotifier(): Notifier {
  if (cached) return cached
  const name = driverFromEnv()
  cached = name === 'twilio' ? new TwilioNotifier()
    : name === 'meta' ? new MetaCloudNotifier()
    : new LogNotifier()
  return cached
}

/** Test seam. Pass null to fall back to the environment again. */
export function setNotifier(n: Notifier | null) {
  cached = n
}

/**
 * Send one notification.
 *
 * ⚠ THIS NEVER THROWS, AND THAT IS THE POINT. A notifier is a reporting
 * channel, not a step in the work. An agent that has already found four
 * relevant stories, fetched their art and pushed a preview must not lose all
 * of that because Twilio returned a 500 on the message announcing it. The
 * failure is logged and returned, and the caller decides whether it matters.
 * In practice it never does: the commit is the durable record, the message is
 * a convenience.
 */
export async function notify(n: Notification): Promise<SendResult> {
  try {
    return await getNotifier().send(n)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[notify] Send failed, continuing anyway:', message)
    return { ok: false, driver: 'unknown', error: message }
  }
}
