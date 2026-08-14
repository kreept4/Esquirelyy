import { NextResponse } from 'next/server'
import { applyProposal } from '@/lib/agent/apply'
import { proposalButtons, renderProposal } from '@/lib/agent/format'
import { decide, forget, listPending } from '@/lib/agent/proposals'
import { runSweep } from '@/lib/agent/sweep'
import {
  answerCallback,
  editMessage,
  esc,
  isAuthorised,
  sendMessage,
  webhookSecretMatches,
  ADDRESS,
} from '@/lib/agent/telegram'

/**
 * The control channel.
 *
 * Telegram POSTs here on every message and every button press. This is the only
 * way into the agent from outside, so its first job is refusing almost
 * everything.
 *
 * ⚠ THIS ROUTE IS PUBLIC AND ITS PATH IS GUESSABLE. middleware.ts never gates
 * /api — deliberately, see its header — so nothing upstream is checking anything
 * for us. Two independent gates therefore run before any work:
 *
 *   The secret header    proves the request came from Telegram rather than from
 *                        somebody who guessed the URL.
 *   The chat allowlist   proves the person on the other end is you rather than
 *                        anyone who found the bot's @name and said hello.
 *
 * Both are needed and neither is sufficient. Without the header, an attacker
 * POSTs a forged update claiming your chat id. Without the allowlist, any
 * stranger who messages the bot is talking to a thing that can put listings on
 * the board.
 */

/* The research call runs for minutes. Vercel's ceiling is 300s and this asks
   for it, because a sweep killed at the default is a sweep that silently did
   half its job. */
export const maxDuration = 300

/**
 * ⚠ ALWAYS ANSWER 200, EVEN ON FAILURE, AND ESPECIALLY ON REJECTION.
 *
 * Telegram retries a webhook that does not return 2xx, with increasing delays,
 * and eventually disables the webhook entirely. A route that answers 401 to an
 * unauthorised message therefore teaches Telegram to retry that message — so an
 * attacker probing the endpoint would get their forged update delivered again
 * and again, and a genuine bug would take the whole control channel offline.
 *
 * The reply is 200 with a body nobody reads. What actually happened is decided
 * by whether we send anything back to the chat.
 */
const OK = NextResponse.json({ ok: true })

export async function POST(req: Request) {
  if (!webhookSecretMatches(req.headers.get('x-telegram-bot-api-secret-token'))) {
    return OK
  }

  let update: any
  try {
    update = await req.json()
  } catch {
    return OK
  }

  try {
    if (update.callback_query) await handleCallback(update.callback_query)
    else if (update.message?.text) await handleMessage(update.message)
  } catch (err: any) {
    console.error('telegram webhook:', err)
    /* Told, not swallowed. An agent that fails quietly is one you stop
       trusting without ever knowing why. */
    const chatId = update?.message?.chat?.id ?? update?.callback_query?.message?.chat?.id
    if (chatId) {
      await sendMessage(chatId, `Something broke, ${ADDRESS}: <code>${esc(err?.message || String(err))}</code>`)
    }
  }

  return OK
}

/* ── Button presses ───────────────────────────────────────────────────── */

async function handleCallback(cb: any) {
  const chatId = cb.message?.chat?.id
  const username = cb.from?.username

  if (!chatId || !isAuthorised(chatId, username)) {
    await answerCallback(cb.id, 'Not authorised.')
    return
  }

  /* Acknowledged FIRST, before any work. Telegram shows a spinner on the button
     until this returns and gives up after about ten seconds; applying a
     proposal can take longer, and a button that looks broken every time it is
     slow is a button nobody presses twice. */
  await answerCallback(cb.id, 'Working…')

  const [verdict, id] = String(cb.data || '').split(':')
  if (!id || (verdict !== 'ok' && verdict !== 'no')) return

  const decided = await decide(id, verdict === 'ok' ? 'approved' : 'rejected')

  /* A null means somebody already answered this — a double tap, or Telegram
     redelivering the press. Say so plainly rather than acting twice. */
  if (!decided) {
    await sendMessage(chatId, 'That one was already decided.')
    return
  }

  if (verdict === 'no') {
    await editMessage(
      chatId,
      cb.message.message_id,
      `${renderProposal(decided)}\n\n<b>✕ Rejected.</b>`
    )
    return
  }

  const outcome = await applyProposal(decided)

  await editMessage(
    chatId,
    cb.message.message_id,
    `${renderProposal(decided)}\n\n<b>✓ Approved.</b> ${outcome}`
  )
}

/* ── Typed commands ───────────────────────────────────────────────────── */

const HELP = `
<b>Esquirely agent</b> — at your service, Boss.

/sweep — look for new opportunities and re-check the board
/find — new opportunities only
/check — re-check existing listings only
/scholarships — search scholarships and funding calls
/pending — re-send anything still awaiting a decision
/forget &lt;id or fingerprint&gt; — let a rejected item be found again
/whoami — your chat id, for the allowlist
/help — this
`.trim()

async function handleMessage(msg: any) {
  const chatId = msg.chat.id
  const username = msg.from?.username
  const text = String(msg.text || '').trim()

  /**
   * /whoami answers before the allowlist check, and only ever with the chat id.
   *
   * That is a deliberate and narrow exception. Before your first message you
   * cannot know your own numeric chat id, so a bot that refuses to tell you is
   * one you cannot configure. It leaks nothing — the id is already known to
   * whoever is asking, since it identifies the chat they are sitting in — and
   * it does no work and touches nothing.
   */
  if (text.startsWith('/whoami') || text.startsWith('/start')) {
    const allowed = isAuthorised(chatId, username)
    await sendMessage(
      chatId,
      [
        `Chat id: <code>${chatId}</code>`,
        username ? `Username: @${esc(username)}` : '',
        '',
        allowed
          ? '✓ You are on the allowlist.'
          : 'Not on the allowlist. Add this chat id to <code>TELEGRAM_ALLOWED_CHAT_IDS</code> and redeploy.',
      ]
        .filter(Boolean)
        .join('\n')
    )
    return
  }

  /* Silence, not a refusal. Telling a stranger they have found a real but
     restricted bot is more information than they had a moment ago, and the
     only thing it can do for them is confirm the target is worth attacking. */
  if (!isAuthorised(chatId, username)) return

  const [cmd, ...rest] = text.split(/\s+/)

  switch (cmd) {
    case '/help':
      await sendMessage(chatId, HELP)
      return

    case '/sweep':
      await sendMessage(chatId, `On it, ${ADDRESS} — searching, then re-checking the board. A few minutes.`)
      await runSweep({ chatId })
      return

    case '/find':
      await sendMessage(chatId, `Searching for new opportunities, ${ADDRESS}…`)
      await runSweep({ chatId, researchOnly: true })
      return

    case '/check':
      await sendMessage(chatId, `Re-checking existing listings, ${ADDRESS}…`)
      await runSweep({ chatId, listingsOnly: true })
      return

    case '/scholarships':
      await sendMessage(chatId, `Searching scholarships and funding calls, ${ADDRESS}…`)
      await runSweep({ chatId, researchOnly: true, includeScholarships: true })
      return

    case '/pending': {
      const pending = await listPending(10)
      if (!pending.length) {
        await sendMessage(chatId, `Nothing waiting on you, ${ADDRESS}.`)
        return
      }
      for (const p of pending) {
        await sendMessage(chatId, renderProposal(p), proposalButtons(p))
      }
      return
    }

    case '/forget': {
      const target = rest[0]
      if (!target) {
        await sendMessage(chatId, 'Give me an id or a fingerprint: <code>/forget abc123…</code>')
        return
      }
      const removed = await forget(target)
      await sendMessage(
        chatId,
        removed
          ? `Forgotten. That one can be proposed again on the next sweep.`
          : 'Nothing matched that id or fingerprint.'
      )
      return
    }

    default:
      await sendMessage(chatId, HELP)
  }
}
