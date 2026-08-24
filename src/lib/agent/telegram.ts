/**
 * Telegram, through the Bot API.
 *
 * `fetch`, not a library, for the same reason lib/email/send.ts uses fetch
 * rather than an SDK: the whole surface used here is four POSTs, and a
 * dependency that wraps four POSTs is a dependency that will need updating for
 * no benefit.
 *
 * SERVER ONLY. `TELEGRAM_BOT_TOKEN` has no NEXT_PUBLIC_ prefix on purpose. That
 * token can read every message in the chat and send as the bot; in a browser
 * bundle it is a total compromise of the control channel.
 *
 * Absent configuration is a no-op, not a throw, matching sendEmail. A preview
 * deployment with no bot token should not 500 on a cron tick.
 */

import { createHash, timingSafeEqual } from 'node:crypto'

const API = 'https://api.telegram.org'

/**
 * What the agent calls you.
 *
 * One constant rather than the word typed into a dozen strings, so it is one
 * edit to change and cannot drift into "Boss" in some messages and nothing in
 * others.
 *
 * ⚠ IT GOES ON THE CONVERSATIONAL MESSAGES, NOT ON THE CARDS. A proposal card
 * is read in about ten seconds and answered with one tap; every word on it that
 * is not a fact about the role is a word in the way. Greetings belong on the
 * things that top and tail a run — the sweep summary, confirmations, errors —
 * where there is a person to greet rather than a decision to make.
 */
export const ADDRESS = 'Boss'

export type TelegramResult =
  | { ok: true; messageId: number; chatId: number }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string }

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN)
}

async function call(method: string, body: any): Promise<any> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set')

  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    /* Bounded. A cron tick that hangs on Telegram holds a function open for the
       full 300s platform ceiling and achieves nothing. */
    signal: AbortSignal.timeout(15_000),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    throw new Error(`telegram ${method} ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  }
  return data.result
}

/**
 * ⚠ WHO IS ALLOWED TO COMMAND THE BOT.
 *
 * This is the entire authentication story for a channel that can take listings
 * off the board and send mail to every member, so it is worth being explicit
 * about what it does and does not prove.
 *
 * A Telegram bot has no access control of its own. Anyone who finds the bot's
 * @name can message it, and the webhook receives those messages exactly as it
 * receives yours. Without a check here, a stranger who guesses the bot name can
 * approve their own listings onto the board.
 *
 * CHAT ID IS THE GATE. It is assigned by Telegram, never changes, and cannot be
 * chosen. Set TELEGRAM_ALLOWED_CHAT_IDS and nothing else can drive the bot.
 *
 * ⚠ USERNAME IS A BOOTSTRAP AND IS DELIBERATELY WEAKER. A username can be
 * released — by you, by inactivity — and then registered by somebody else, who
 * would inherit the bot. It exists because you cannot know your own numeric chat
 * id before the first message, and /start prints it so you can move to the id
 * and drop the username. Treat leaving the username set as a temporary state.
 */
export function isAuthorised(chatId: number, username?: string | null): boolean {
  const ids = (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  if (ids.includes(String(chatId))) return true

  const names = (process.env.TELEGRAM_ALLOWED_USERNAMES || '')
    .split(',')
    .map(s => s.trim().replace(/^@/, '').toLowerCase())
    .filter(Boolean)

  if (username && names.includes(username.toLowerCase())) return true

  /* Neither list configured is a misconfiguration, not an open door. Failing
     closed here means a deployment that forgot the env var has a bot that
     answers nobody, rather than a bot that answers everybody. */
  return false
}

/**
 * The secret the webhook checks on every request.
 *
 * Telegram sends this header on every delivery when the webhook is registered
 * with a secret_token. It proves the request came from Telegram rather than
 * from anyone who found the URL — which matters because the route is public
 * (middleware.ts never gates /api) and its path is guessable.
 *
 * The chat-id check above answers "who is this person"; this answers "is this
 * really Telegram". Both are needed: without this, an attacker can POST a
 * forged update claiming to be from your chat id.
 */
export function webhookSecretMatches(headerValue: string | null): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expected) return false
  return secretEquals(headerValue, expected)
}

/**
 * Compare a presented secret against the expected one in constant time.
 *
 * ⚠ `===` ON A SECRET LEAKS ITS LENGTH AND ITS PREFIX. String comparison
 * returns as soon as two bytes differ, so a wrong guess sharing a longer prefix
 * with the real value takes measurably longer to reject. Against an endpoint
 * that can be called as often as you like — which is exactly what this webhook
 * and the cron route are — that difference is enough to recover a secret byte
 * by byte without ever guessing it whole.
 *
 * Small risk here, and not a theoretical one: both secrets guard routes that
 * middleware.ts deliberately never gates, at paths that are guessable, and
 * forging a Telegram update means driving the agent.
 *
 * ⚠ THE HASHING IS NOT DECORATION. timingSafeEqual THROWS on a length
 * mismatch rather than returning false, so calling it straight on
 * attacker-controlled input turns a wrong-length guess into a 500 — and
 * reintroduces the length oracle it was meant to remove, because a wrong length
 * now fails differently from a wrong value. Hashing both sides to a fixed 32
 * bytes first means the comparison is always equal-length and the real secret's
 * length never reaches it.
 *
 * A null header is rejected before hashing, rather than hashing the string
 * "null" and letting it fail the comparison. Both work; only one reads as
 * deliberate.
 */
function secretEquals(presented: string | null, expected: string): boolean {
  if (presented === null) return false
  const a = createHash('sha256').update(presented).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

/**
 * The same comparison, for the cron route's own shared secret.
 *
 * Exported rather than duplicated: api/agent/sweep compared its Authorization
 * header with `===` for the same reason this file used to, and two copies of a
 * security primitive is how one of them stays wrong after the other is fixed.
 */
export function bearerMatches(headerValue: string | null, expected: string): boolean {
  if (headerValue === null) return false
  return secretEquals(headerValue, `Bearer ${expected}`)
}

export type Button = { text: string; data: string }

/**
 * Send a message, optionally with a row or two of buttons.
 *
 * ⚠ CALLBACK DATA IS CAPPED AT 64 BYTES BY TELEGRAM, which is the constraint
 * that shaped the proposals table. A button cannot carry a listing, so it
 * carries a verdict and a proposal id — 'ok:<uuid>' is 39 bytes — and the row
 * in the database is what actually says what will happen. That is also the
 * safer design: the action lives server-side where it can be checked and can
 * only happen once, rather than in a payload the client hands back.
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  buttons?: Button[][]
): Promise<TelegramResult> {
  if (!telegramConfigured()) return { ok: true, skipped: true, reason: 'TELEGRAM_BOT_TOKEN not set' }

  try {
    const result = await call('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      /* Link previews turn a proposal carrying four source URLs into four
         stacked cards, and the message stops being scannable. */
      link_preview_options: { is_disabled: true },
      ...(buttons?.length
        ? {
            reply_markup: {
              inline_keyboard: buttons.map(row =>
                row.map(b => ({ text: b.text, callback_data: b.data }))
              ),
            },
          }
        : {}),
    })
    return { ok: true, messageId: result.message_id, chatId: result.chat.id }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}

/**
 * Replace a message's text and take its buttons away.
 *
 * Called the moment a proposal is decided. Without it the chat fills with live
 * Approve/Reject pairs on things already decided, and the next person to scroll
 * up and tap one gets an error — or worse, wonders whether it worked. Editing
 * in place means the history reads as a record of decisions rather than a
 * backlog of dead buttons.
 */
export async function editMessage(
  chatId: number | string,
  messageId: number,
  text: string
): Promise<TelegramResult> {
  if (!telegramConfigured()) return { ok: true, skipped: true, reason: 'TELEGRAM_BOT_TOKEN not set' }

  try {
    const result = await call('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: { inline_keyboard: [] },
    })
    return { ok: true, messageId: result.message_id, chatId: result.chat.id }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}

/**
 * Acknowledge a button press.
 *
 * Telegram shows a spinner on the button until this is called, and gives up
 * after about ten seconds. Applying a proposal can take longer than that, so
 * this is always called FIRST and the work happens after — the alternative is a
 * button that looks broken every time the work is slow.
 */
export async function answerCallback(callbackId: string, text?: string): Promise<void> {
  if (!telegramConfigured()) return
  try {
    await call('answerCallbackQuery', { callback_query_id: callbackId, text: text?.slice(0, 200) })
  } catch {
    /* An unacknowledged press is a cosmetic spinner, never a reason to abandon
       the decision the person already made. */
  }
}

/** HTML-escape. Telegram's parser rejects a message with a stray < in a title. */
export function esc(s: string | null | undefined): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
