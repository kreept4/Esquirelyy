# The opportunities agent — setup

> ## ⚠ THE AGENT IS CURRENTLY DISCONNECTED
>
> Turned off on 15 August 2026 after the first day of sweeps cost about $47.
> Four runs, 9,513,634 input tokens, zero cache reads — the paused-turn resume
> loop was re-sending every fetched page on every resume. See the note on
> `MAX_RESUMES` in `research.ts` for what went wrong and what now holds it down.
>
> Two things are switched off, and **both** must be switched back on:
>
> 1. **The Telegram webhook is deleted.** No command reaches the app. Re-register
>    with the `setWebhook` call in step 5 below.
> 2. **The cron is removed from `vercel.json`.** Nothing runs on a schedule.
>    Re-add:
>    ```json
>    "crons": [{ "path": "/api/agent/sweep", "schedule": "30 6 * * *" }]
>    ```
>
> ⚠ **BEFORE RECONNECTING EITHER**, do these three, in this order:
>
> - **Set a monthly spend limit** in the Anthropic Console. It is the only
>   control that does not depend on this code being correct.
> - **Give the agent its own API key.** It currently shares one with the CV
>   tools, and the usage export groups by key — with a separate key the question
>   "which system spent this" is answered in seconds rather than argued about.
> - **Run ONE sweep and read the usage export before running a second.** A fixed
>   sweep should show roughly 100k input tokens and 10 web searches. If it shows
>   a million, stop.
>
> The cost fixes are in, and they are **estimates that have never been measured**.
> Treat the first run as a test, not as the agent working.

Finds legal roles, internships and scholarships for Nigerian law students and
lawyers, proposes them in Telegram, and changes nothing until you tap Approve.

About twenty minutes, most of it waiting on a deploy.

---

## What it does

**Every morning at 06:30 UTC** (07:30 Lagos), and on demand from Telegram:

1. **Re-checks the board.** Takes the twelve least-recently-checked listings and
   asks whether each is still open — deadline passed, posting URL 404s, page no
   longer names the role. Anything it judges closed becomes a proposal.
2. **Searches for new opportunities.** Nigerian employers, international bodies
   a Nigerian may apply to, and Africa-specific programmes at international
   firms. Reads the pages it finds and quotes what it relied on.
3. **Scholarships on Mondays.** They stay open for weeks, so daily searching
   only produces duplicates.
4. **Reports back**, even when it found nothing.

Nothing reaches the board without a tap.

---

## 1. Create the bot

Message [@BotFather](https://t.me/botfather):

```
/newbot
```

Name it, pick a username, and copy the token it gives you.

Then set the picture — there is no API for this, it is BotFather only:

```
/setuserpic
```

…and send it `scripts/telegram-bot-avatar.png` (512×512, rendered from
`src/app/icon.svg`).

Optionally `/setcommands`, pasting:

```
sweep - Look for new opportunities and re-check the board
find - New opportunities only
check - Re-check existing listings only
scholarships - Search scholarships and funding calls
pending - Re-send anything awaiting a decision
whoami - Show my chat id
help - Show commands
```

## 2. Run the migration

Supabase → SQL Editor → New Query. Paste
`scripts/2026-08-15-agent-schema.sql` and run it.

It adds `is_active`, `logo_url`, `delisted_at`, `delisted_reason` and
`last_checked_at` to `jobs`, and creates `agent_proposals`. Every statement is
guarded with `IF NOT EXISTS` and nothing is dropped, so it is safe to re-run.

> ⚠ Do **not** run `supabase-schema.sql`. Its own header explains why — it
> describes a database that no longer exists and would create unprotected
> tables.

## 3. Set the environment variables

In Vercel → Project → Settings → Environment Variables. Add to **Production**
(and Preview if you want to test there):

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | from BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | `openssl rand -hex 32` |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `TELEGRAM_ALLOWED_USERNAMES` | `ThisisKreept` — temporary, see step 6 |
| `TELEGRAM_CHAT_ID` | fill in at step 6 |
| `TELEGRAM_ALLOWED_CHAT_IDS` | fill in at step 6 |

`ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are already set.

`JINA_API_KEY` is optional and can stay empty — see the note in
`.env.local.example` about why anonymous `r.jina.ai` no longer works.

## 4. Deploy

```
git add -A && git commit -m "Add the opportunities agent" && git push
```

`vercel.json` registers the cron on deploy.

> Vercel's Hobby plan allows two cron jobs at daily granularity. This uses one.

## 5. Point Telegram at the webhook

Replace both placeholders and run it once:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "content-type: application/json" \
  -d '{
    "url": "https://esquirely.com.ng/api/telegram/webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message", "callback_query"]
  }'
```

Check it took:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

`pending_update_count` climbing, or a `last_error_message`, means the URL or the
secret is wrong.

## 6. Lock it to your chat

Message the bot `/whoami`. It replies with a number.

Put that number in `TELEGRAM_ALLOWED_CHAT_IDS` **and** `TELEGRAM_CHAT_ID`, then
**clear `TELEGRAM_ALLOWED_USERNAMES`** and redeploy.

> ⚠ Do not skip the clearing. A username can be released and re-registered by
> somebody else, who would inherit a bot that can put listings on your board and
> take them off. The chat id cannot be transferred. The username exists only
> because you cannot know your chat id before the first message.

## 7. Try it

```
/find
```

A few minutes, then proposal cards with Approve / Reject, then a summary.

Approve one and check it is on `/jobs`.

---

## Commands

| Command | What it does |
|---|---|
| `/sweep` | Full run — search, then re-check the board |
| `/find` | New opportunities only |
| `/check` | Re-check existing listings only |
| `/scholarships` | Search scholarships and funding calls |
| `/pending` | Re-send anything still awaiting a decision |
| `/forget <id>` | Let a rejected item be proposed again |
| `/whoami` | Your chat id |

---

## What it cannot do, and why

**Add a logo file.** A serverless function cannot write to the repository. New
employers get a Clearbit logo where one exists, and your initials fallback
otherwise. Dropping a proper file into `public/employer-logos` and adding the key
to `EMPLOYER_LOGOS` still wins — the curated mark always takes precedence, so a
file added later silently upgrades every listing for that employer.

**Update the carousel, the notification bell, or the announcement email.** All
three read `NEW_ROLES` from `src/lib/new-roles.ts`, which is hand-written
editorial copy. Same wall.

**Put a scholarship on the site.** Scholarships are TypeScript too. Approving one
returns a paste-ready block; it needs a deploy.

**Send email.** Deliberately. `scripts/send-new-roles.mjs` stays the way an
announcement goes out, and its own header is the argument: an email is the one
artefact that cannot be corrected after the fact.

**Delete a listing.** It sets `is_active = false`. Deleting a row remains a human
act, done with the reasoning written down, through
`scripts/2026-08-14-remove-stale-jobs.mjs`.

**Read anything behind a login.** Every fetch is anonymous — no cookies, no
session, no account. That is what makes it safe to point at LinkedIn, and it is
why the agent can read a public LinkedIn job page but cannot search LinkedIn.

---

## When something looks wrong

**It proposes irrelevant roles.** Edit `APPLICABILITY` in `brief.ts`. That file
is the agent's judgement written down — tune it there, not in the prompts in
`research.ts`.

**It proposed something you rejected, again.** It should not — the fingerprint
suppresses it. If a role genuinely recurs (a firm running the same graduate seat
each season), `/forget <fingerprint>` lets it through.

**It wants to close a listing that is open.** Reject it. Worth reading the
reason: if the posting page moved, the `apply_url` on the row is stale and worth
fixing regardless.

**It goes quiet.** Check `getWebhookInfo` first, then the Vercel logs for
`/api/agent/sweep`. A sweep that cannot start returns 500; one that fails partway
still sends a summary listing what broke.

**It closed something wrongly.** Nothing is lost. In Supabase:

```sql
update jobs set is_active = true, delisted_at = null, delisted_reason = null
where slug = 'the-slug';
```
