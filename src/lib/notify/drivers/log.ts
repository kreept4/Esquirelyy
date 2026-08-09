import { appendFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Notification, Notifier, SendResult } from '../types'

/**
 * The default sender, which sends nothing and records everything.
 *
 * This exists so that "we have not picked a WhatsApp provider yet" is not a
 * reason the agents cannot run. It writes the message it would have sent to a
 * newline-delimited file and returns success, so an agent's control flow is
 * identical whether or not a real sender is configured.
 *
 * NDJSON RATHER THAN PROSE. The file is read two ways: by a person catching up
 * on what the agents did, and by whatever eventually replays or audits them.
 * One JSON object per line serves both, survives concurrent appends from two
 * agents running at once, and does not need a parser to grep.
 *
 * ⚠ IT IS ALSO WHERE THE MESSAGES GO WHEN A REAL SENDER FAILS, so it is not
 * throwaway scaffolding to delete on the day Twilio is wired up. Keep it.
 */
export class LogNotifier implements Notifier {
  readonly name = 'log'
  private readonly path: string

  constructor(path?: string) {
    /* Relative to the process working directory, which for these agents is the
       repo root. Absolute so a script that chdirs mid-run cannot split the log
       across two files. */
    this.path = resolve(path ?? process.env.NOTIFY_LOG_PATH ?? '.notify-log.ndjson')
  }

  async send(n: Notification): Promise<SendResult> {
    const line = JSON.stringify({
      at: new Date().toISOString(),
      source: n.source,
      kind: n.kind,
      subject: n.subject,
      text: n.text,
      ...(n.url ? { url: n.url } : {}),
      ...(n.template ? { template: n.template } : {}),
    })

    await mkdir(dirname(this.path), { recursive: true })
    await appendFile(this.path, line + '\n', 'utf8')

    /* Also to stdout, because these agents are run from a terminal and from
       CI, and in both cases the person watching wants the message rather than
       the reassurance that it was written to a file they would have to open. */
    console.log(`\n[notify:${n.source}] ${n.subject}\n${n.text}\n`)

    return { ok: true, driver: this.name }
  }
}
