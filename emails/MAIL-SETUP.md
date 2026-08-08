# Mail setup for esquirely.com.ng

Written 8 August 2026, the day the domain went live. Everything in the codebase
already points at `esquirely.com.ng`. Nothing in this file is done yet, because
all of it happens in a registrar and two dashboards rather than in the repo.

---

## 0. The thing worth knowing first

`esquirely.com` is **not ours**. It resolves to registrar parking and belongs to
somebody else. Every address on the site used to be `@esquirely.com`, which
meant the contact page, the privacy notice and the terms were all inviting
people to write to a stranger's domain. That is fixed in code; this file is how
the addresses become real.

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

## 1. Which host, and why not Zoho

**Zoho's free plan could not be signed up for from here.** It still exists in
2026 but only for accounts on the US, IN and EU data centres, and a Nigerian
signup gets steered to a region that does not offer it. If you want to try
again, the plan is never shown in the normal signup flow: it is at the very
bottom of `zoho.com/mail/zohomail-pricing.html` under "Forever Free Plan", and
you have to force the data centre by starting at `zoho.eu` rather than
`zoho.com`. It is not worth much effort, because the free plan also has no IMAP,
no POP and no forwarding, which means a separate app you have to remember to
open.

**Use Cloudflare Email Routing instead, and read the mail in the Gmail you
already have.** It is free, it has no user limit, and it removes the "will I
remember to check it" problem entirely, because there is nothing new to check.

How the two halves work:

- **Receiving** is Cloudflare Email Routing. It accepts mail for any address at
  the domain and forwards it to your existing Gmail. Free, and unlimited
  addresses, so all six cost nothing.
- **Sending** is Gmail's "Send mail as", pointed at Brevo's SMTP relay. You
  already have a Brevo account for the welcome email, so this is a credential
  you are getting anyway. Replies then leave as
  `hello@esquirely.com.ng` rather than as your personal address.

The one cost: Cloudflare Email Routing needs Cloudflare to be your DNS, so the
nameservers move. That is a free Cloudflare account and two records to recreate.
Section 2 covers it.

**If you would rather not move nameservers**, Zoho Mail Lite is about $1 per
user per month, needs no nameserver change, and gives real IMAP so it works in
Gmail or Outlook. One mailbox plus five free aliases is about $1 a month total.
That is the paid path; everything from section 4 onwards is identical either way.

---

## 2. Moving DNS to Cloudflare

⚠ Do this carefully. The site is live and these records are what serve it.

**What exists today**, and what has to still exist afterwards:

| Type | Host | Value | What it does |
| --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | Points the apex at Vercel |
| CNAME | `www` | `588a6212a13c7dc5.vercel-dns-017.com` | Points www at Vercel |

There are no MX and no TXT records at all today, which is exactly why mail to
those six addresses bounces right now.

Steps:

1. Create a free Cloudflare account and **Add a site**: `esquirely.com.ng`.
2. Cloudflare scans your existing DNS and imports what it finds. **Check that
   both records above came across** before going further. If either is missing,
   add it by hand from the table.
3. Set both records to **DNS only** (grey cloud, not orange). Proxying a Vercel
   site through Cloudflare's CDN puts two CDNs in series and causes more
   problems than it solves.
4. Cloudflare gives you two nameservers. Replace `ns1.dyna-ns.net` and
   `ns2.dyna-ns.net` with them at your registrar.
5. Wait for Cloudflare to report the domain as Active. Usually under an hour,
   occasionally longer.
6. **Check the site still loads** at `https://esquirely.com.ng` before doing
   anything else.

---

## 3. Turning on the six addresses

In Cloudflare: **Email** → **Email Routing** → Get started.

1. Cloudflare offers to add its MX and SPF records for you. Accept. That is
   three MX records pointing at `mx.cloudflare.net` and friends.
2. Add your Gmail as a **destination address** and click the verification link
   Cloudflare sends to it.
3. Create six **custom addresses**, each forwarding to that Gmail:
   `hello`, `roles`, `corrections`, `privacy`, `ambassadors`, `legal`.
4. Optionally turn on **catch-all** as well, so a message to a typo'd address
   still reaches you instead of bouncing.

### The SPF record, and the one trap here

**One SPF record. Never two.** A domain with two `v=spf1` records is treated as
having a broken SPF by every receiver, which is worse than having none.

Cloudflare will add an SPF record for its own forwarding. Brevo also needs to be
in SPF, because Brevo sends the welcome email and, after section 5, the signup
and password reset codes. So **edit** the record Cloudflare created rather than
adding a second one, and make it:

```
v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com ~all
```

### DKIM and DMARC

- **Brevo DKIM**: in Brevo, under Senders, Domains & Dedicated IPs, authenticate
  `esquirely.com.ng`. It prints its own selector and key. Add exactly as shown.
- **DMARC**: start permissive, so it reports without affecting delivery.

  | Type | Host | Value |
  | --- | --- | --- |
  | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@esquirely.com.ng` |

  Move to `p=quarantine` later, once a fortnight of reports comes back clean.

### Test it

Send a real message from a phone to each of the six addresses and confirm all
six land in Gmail. Do this before section 5: an auth flow that cannot send is
much harder to debug than a mailbox that was never wired up.

---

## 4. Replying as the address, not as your Gmail

Receiving is only half of it. Out of the box, replies leave as your personal
Gmail, which undoes the point.

First get the Brevo SMTP credentials: Brevo → **SMTP & API** → SMTP tab. You
need the **SMTP login** and an **SMTP key**. ⚠ The key is not the API key; they
are different strings on the same page and the API key fails authentication with
an unhelpful error.

Then in Gmail: **Settings** → **Accounts and Import** → **Send mail as** → **Add
another email address**.

| Field | Value |
| --- | --- |
| Name | Esquirely |
| Email address | `hello@esquirely.com.ng` |
| Treat as alias | untick |
| SMTP Server | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | your Brevo SMTP login |
| Password | your Brevo SMTP key |
| Secured connection | TLS |

Gmail sends a confirmation code to `hello@esquirely.com.ng`, which arrives back
in the same Gmail through Cloudflare. Enter it.

Repeat for any of the other five you expect to reply from. `roles@` and
`corrections@` are the two worth doing straight away.

Then set `hello@esquirely.com.ng` as the **default** send-as address, so a
reply typed in a hurry goes out as the brand rather than as you.

Finally, update `BREVO_SENDER_EMAIL` to `hello@esquirely.com.ng` in both
`.env.local` and the Vercel project. It is currently a personal Gmail address,
which was the right call when there was no domain (see the comment at the top of
`src/lib/email/send.ts` for why Brevo was chosen over Resend for exactly that
reason) and is the wrong one now.

---

## 5. Supabase custom SMTP

This is the one with a deadline attached. Supabase's built-in email sender is
**rate limited to a handful of messages per hour** and sends from a
`@mail.app.supabase.io` address. It is explicitly not for production. Every
signup confirmation code and every password reset currently goes through it, so
the first time more than a few people sign up in an hour, the rest silently get
no code and cannot create an account.

The templates are already written and in this folder:
`supabase-confirm-signup.html` and `supabase-reset-password.html`.

Supabase dashboard → Project Settings → Authentication → SMTP Settings → enable
custom SMTP:

| Field | Value |
| --- | --- |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | your Brevo SMTP login |
| Password | your Brevo SMTP key |
| Sender email | `hello@esquirely.com.ng` |
| Sender name | `Esquirely` |

Same key, same trap as section 4.

While you are in that screen, raise the limit under Auth → **Rate Limits**. The
default is tuned for the built-in sender and stays low after you replace it.

Then send yourself a real signup and a real password reset, and read both on a
phone. The subject lines live in a comment at the top of each template file and
go in Supabase's template editor, not in the HTML.

⚠ Brevo's free tier is 300 emails a day, shared between the welcome email, the
auth codes and anything you send by hand. Fine now. Worth watching once signups
pick up.

---

## 6. Two Vercel settings while you are in there

1. **`NEXT_PUBLIC_SITE_URL`** should be `https://esquirely.com.ng` in
   Production. Without it the code falls back to the same value, so nothing
   breaks, but preview deployments should be set to their own URL so a preview's
   emails and canonical tags do not point at production.

2. **Redirect `www` to the apex.** Right now `esquirely.com.ng` and
   `www.esquirely.com.ng` both answer 200 with the same page. To Google that is
   two sites with identical content and the ranking signal splits between them.
   Project → Domains → edit `www.esquirely.com.ng` → Redirect to the apex, 308.
