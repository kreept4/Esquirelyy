# Mail setup for esquirely.com.ng

Written 8 August 2026, the day the domain went live. Everything in the codebase
already points at `esquirely.com.ng`. Nothing in this file is done yet, because
all of it happens in a registrar and two dashboards rather than in the repo.

Do the sections in order. Section 3 depends on section 2 having propagated, and
section 5 depends on section 4.

---

## 0. The thing worth knowing first

`esquirely.com` is **not ours**. It resolves to registrar parking IPs and belongs
to somebody else. Every address on the site used to be `@esquirely.com`, which
meant the contact page, the privacy notice and the terms were all inviting people
to write to a stranger's domain. That is fixed in code; this file is how the
addresses become real.

Six addresses are published on the site and all six need to exist:

| Address | Published on | Purpose |
| --- | --- | --- |
| `hello@esquirely.com.ng` | contact, FAQ, news | Anything else. Read by a person. |
| `roles@esquirely.com.ng` | contact, advertise | Employers sending a role to the board. |
| `corrections@esquirely.com.ng` | contact | A listing that is wrong. |
| `privacy@esquirely.com.ng` | contact, privacy | NDPA 2023 data requests, 30 day clock. |
| `ambassadors@esquirely.com.ng` | contact, ambassador | Campus ambassador applications. |
| `legal@esquirely.com.ng` | terms | Takedowns and IP complaints. |

The privacy notice commits to answering data requests within 30 days and the
contact page promises replies within two working days. Those are published
promises, so `privacy@` in particular has to be an inbox somebody actually opens.

---

## 1. Zoho, and what the free plan really gives you

**One mailbox, five aliases.** Not six mailboxes. The free plan allows five
users, but every address above should land in ONE inbox anyway: six separate
logins for a two person team is six places to forget to check. Create
`hello@esquirely.com.ng` as the single user and add the other five as aliases on
it. Aliases are free and unlimited enough for this, and you can still reply
*from* any of them by picking the address in the From dropdown.

**Answering the monitoring question directly:** yes, but only in two places.

- ✅ Web, at `mail.zoho.com`.
- ✅ The Zoho Mail app on Android and iOS, with push notifications. This is the
  one to install, and it is how you will actually notice a `privacy@` request
  inside the 30 days.
- ❌ **Not** Gmail, Outlook, Apple Mail or any desktop client. The free plan has
  no IMAP, no POP and no ActiveSync. That is the real cost of the free tier.
- ❌ **No forwarding either.** You cannot have Zoho push mail into your Gmail.

If living inside a separate app turns out to be the thing that makes you stop
checking, Mail Lite is about $1 per user per month and turns IMAP, POP and SMTP
back on. Worth paying the moment you notice yourself not opening the app.

One signup detail: the forever free plan is only offered in the US, IN and EU
data centres. Pick **EU** at signup unless you have a reason not to. The choice
is permanent and it decides which hostnames you use below, so write down which
one you picked.

---

## 2. DNS records

Your nameservers are `ns1.dyna-ns.net` and `ns2.dyna-ns.net`, so these go in
your registrar's DNS panel, not in Vercel.

⚠ **Do not touch the existing A record.** `esquirely.com.ng` points at
`216.198.79.1`, which is Vercel, and that is what serves the site. Mail records
are MX and TXT and do not collide with it.

### 2a. Prove you own the domain

Zoho gives you a unique verification value during setup. It looks like
`zoho-verification=zb********.zmverify.zoho.eu`.

| Type | Host | Value |
| --- | --- | --- |
| TXT | `@` | *(the exact value Zoho shows you)* |

### 2b. Route the mail

Three MX records. Use `.eu` hostnames for the EU data centre, `.com` for US.
Lower priority number wins, so `mx` is tried first.

| Type | Host | Priority | Value (EU) |
| --- | --- | --- | --- |
| MX | `@` | 10 | `mx.zoho.eu` |
| MX | `@` | 20 | `mx2.zoho.eu` |
| MX | `@` | 50 | `mx3.zoho.eu` |

Delete any other MX record on the domain. There are none today, which is why
mail to these addresses currently bounces.

### 2c. SPF, and the mistake to avoid here

**One SPF record. Never two.** A domain with two `v=spf1` records is treated as
having a broken SPF by every receiver, which is worse than having none. Two
different systems will be sending as this domain, so both go in the same line:

| Type | Host | Value |
| --- | --- | --- |
| TXT | `@` | `v=spf1 include:zoho.eu include:spf.brevo.com ~all` |

Zoho sends the mail you type by hand. Brevo sends the welcome email and, after
section 5, the signup and password reset codes. Leave either one out and that
system's mail starts landing in spam.

### 2d. DKIM

Two records, and they do not conflict because each uses its own selector.

- **Zoho**: generate it in Zoho Mail Admin under Domains → DKIM. It gives you a
  selector (usually `zoho`) and a long key. Host becomes
  `zoho._domainkey`.
- **Brevo**: in Brevo under Senders, Domains & Dedicated IPs → authenticate your
  domain. It gives you its own selector and key, plus a DMARC suggestion.

Add both exactly as each dashboard prints them.

### 2e. DMARC

Start permissive. `p=none` monitors without touching delivery, which is what you
want until you have seen a fortnight of reports and know both senders pass.

| Type | Host | Value |
| --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@esquirely.com.ng` |

Move to `p=quarantine` later, once the reports are clean. Not before.

---

## 3. After it propagates

Give it up to a few hours, then check from a machine that is not yours:

```
nslookup -type=MX esquirely.com.ng 8.8.8.8
nslookup -type=TXT esquirely.com.ng 8.8.8.8
```

Then send a real message from a Gmail account to each of the six addresses and
confirm all six arrive in the one inbox. Do this before section 5, because a
Supabase auth flow that cannot send is much harder to debug than a mailbox that
was never wired up.

---

## 4. Point Brevo at the new domain

`BREVO_SENDER_EMAIL` is currently a personal Gmail address. That was the right
call when there was no domain: Brevo verifies a single sender address, which is
why it was chosen over Resend in the first place (see the comment at the top of
`src/lib/email/send.ts`). There is a domain now, so:

1. In Brevo, add `hello@esquirely.com.ng` as a sender and verify it. The
   verification email lands in Zoho, which is why section 3 comes first.
2. Complete the domain authentication from 2d, so Brevo signs as the domain
   rather than sending on behalf of a Gmail address.
3. Update `BREVO_SENDER_EMAIL` in **both** `.env.local` and the Vercel project.

A welcome email from `hello@esquirely.com.ng` and one from a personal Gmail read
completely differently to somebody deciding whether this site is real.

---

## 5. Supabase custom SMTP

This is the one with a deadline attached. Supabase's built-in email sender is
**rate limited to a handful of messages per hour** and sends from a
`@mail.app.supabase.io` address. It is explicitly not for production. Every
signup confirmation code and every password reset currently goes through it, so
the first time more than a few people sign up in an hour, the rest silently get
no code and cannot create an account.

The templates are already written and living in this folder:
`supabase-confirm-signup.html` and `supabase-reset-password.html`.

In the Supabase dashboard, Project Settings → Authentication → SMTP Settings,
enable custom SMTP and enter:

| Field | Value |
| --- | --- |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | your Brevo **SMTP login** (from Brevo → SMTP & API) |
| Password | your Brevo **SMTP key** |
| Sender email | `hello@esquirely.com.ng` |
| Sender name | `Esquirely` |

⚠ The password is the **SMTP key**, not the API key. They are different strings
in the same Brevo dashboard and the API key fails authentication here with an
unhelpful error.

While you are in that screen, raise the rate limit under Auth → Rate Limits.
The default is tuned for the built-in sender and stays low after you replace it.

Then send yourself a real signup and a real password reset and read both on a
phone. The templates carry the subject lines they need in a comment at the top
of each file; those go in Supabase's template editor, not in the HTML.

---

## 6. Two Vercel settings while you are in there

1. **`NEXT_PUBLIC_SITE_URL`** should be `https://esquirely.com.ng` in the
   production environment. Without it the code falls back to the same value, so
   nothing breaks, but preview deployments should be set to their own URL so a
   preview's emails and canonical tags do not point at production.

2. **Redirect `www` to the apex.** Right now `https://esquirely.com.ng/` and
   `https://www.esquirely.com.ng/` both answer 200 with the same page. To Google
   that is two sites with identical content, and the ranking signal splits
   between them. In the Vercel project's Domains tab, set `www` to redirect to
   the apex.
