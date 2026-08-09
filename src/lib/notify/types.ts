/**
 * The shape of a message from an agent, and what a sender has to accept.
 *
 * ⚠ THE `template` FIELD IS NOT OPTIONAL DECORATION, AND THE REASON IS A
 * WHATSAPP RULE RATHER THAN A DESIGN PREFERENCE. A business may send free
 * text to a person only inside a 24 hour window that the PERSON opens by
 * messaging first. Outside it, the only thing that will deliver is a template
 * approved by Meta in advance, with variables slotted into fixed positions.
 *
 * Every message these agents send is business-initiated and lands outside that
 * window by definition: they run on a schedule, at night, when nobody has
 * messaged anything. So a Notification carries both forms. `text` is the full
 * message, which is what the file log writes and what a driver sends when the
 * window happens to be open. `template` is the same news compressed into an
 * approved shell, which is what actually delivers the rest of the time.
 *
 * Building this in now costs one field. Discovering it after picking a sender
 * would mean rewriting every call site, because the template variables have to
 * be decided per message type and cannot be derived from a finished string.
 */

/**
 * The recipient. One number, hardcoded, because there is one.
 *
 * It is here rather than in an env var on purpose: an environment variable
 * implies it varies per deployment, and a wrong value would send Esquirely's
 * internal operations reporting to a stranger. When there is a second
 * recipient this becomes a list in a table, not a longer string.
 *
 * It lives in this file rather than beside `notify()` so the drivers can read
 * it without importing the module that constructs them. That would be a cycle,
 * and an import cycle whose only symptom is one `undefined` at module-init time
 * is the kind of bug that survives a typecheck and a code review.
 */
export const BOSS_NUMBER = '+2348148541770'

/** Which agent, and how much attention it wants. */
export type NotificationKind =
  /** Routine run, something was found and shipped. */
  | 'report'
  /** Routine run, nothing worth shipping. Still worth saying so. */
  | 'quiet'
  /** The agent could not finish. Needs a person. */
  | 'problem'

export interface Notification {
  /** `news` or `jobs`. Prefixes the log line and picks the template. */
  source: 'news' | 'jobs' | 'analytics'
  kind: NotificationKind
  /** One line, no trailing full stop. Used as the log summary. */
  subject: string
  /**
   * The whole message, already in Bolu's voice and already chunked to fit.
   * Build it with `brief()` from ./compose rather than by hand, so every
   * agent sounds like the same project manager.
   */
  text: string
  /**
   * The approved-template form, for sending outside the 24 hour window.
   *
   * `name` is whatever the template is called in the Meta or Twilio console.
   * `variables` are positional, because that is how both APIs take them.
   * Absent means "this message has no template yet", which a real sender
   * treats as a reason to log loudly rather than to drop the message.
   */
  template?: { name: string; variables: string[] }
  /** Optional deep link, e.g. the preview URL for the push this reports on. */
  url?: string
}

export interface SendResult {
  ok: boolean
  driver: string
  /** Provider message id when there is one, for chasing a delivery later. */
  id?: string
  error?: string
}

/**
 * What every sender implements.
 *
 * One method. Anything a driver needs beyond the notification (an account SID,
 * a phone number id, a file path) it reads for itself at construction, so the
 * agents never hold a credential and never branch on which sender is live.
 */
export interface Notifier {
  readonly name: string
  send(n: Notification): Promise<SendResult>
}
