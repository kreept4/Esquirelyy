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

## 1. The host: Zoho Mail, Forever Free plan

Registered on 8 August 2026, after an initial attempt failed. Worth recording
why, because anyone repeating this will hit the same wall: the Forever Free plan
is not offered in the normal signup flow and is not available on every data
centre. It exists at the bottom of `zoho.com/mail/zohomail-pricing.html`, and
the account has to sit on the US, IN or EU data centre.

**This account is on the US data centre**, confirmed by its verification value
ending `.zmverify.zoho.com` rather than `.zoho.eu`. That decides every Zoho
hostname in this file: they are all the `.com` set. If a record is ever rejected
or verification hangs, a data centre mismatch is the first thing to check, and
the rule is always to use the hostnames Zoho's own screen prints rather than any
copied from a guide written for a different region.

### How the five user slots are spent

The plan allows five USERS. It does not limit ALIASES, and that distinction is
what makes six published addresses plus two personal ones fit inside five slots
with room to spare. An alias is another address delivering into an existing
mailbox; a user is a whole separate login, password and app.

| Slot | Address | What it is |
| --- | --- | --- |
| 1 | `hello@esquirely.com.ng` | The shared brand inbox. Super admin. |
| 2 | `bolu@esquirely.com.ng` | Personal, Bolu Ogunleye |
| 3 | `ipinu@esquirely.com.ng` | Personal, Ipinu Ogunleye |
| 4 | free | |
| 5 | free | |

`roles`, `corrections`, `privacy`, `ambassadors` and `legal` are **aliases on
slot 1**, not users. All five deliver into the `hello@` inbox and can be replied
from by choosing the address in the From dropdown. Six published addresses, one
inbox, one slot.

That is also the right shape regardless of the limit. Six separate logins would
be six places to forget to check, and the privacy notice promises a 30 day
answer to data requests sent to one of them.

Two things follow from having personal mailboxes as real users:

- Each is a genuine second login, with its own password, its own 2FA and its own
  copy of the Zoho app. The cost of a personal mailbox is that admin, not the
  slot.
- **Make both co-founders admins** in Mail Admin, and keep the `hello@`
  credentials somewhere both can reach. Sole control of the super admin account
  by one person is the failure that locks a company out of its own domain when
  that person is unreachable.

**What the free plan cannot do**, so it is not discovered later:

- ✅ Web at `mail.zoho.com`, and the Zoho Mail mobile app with push
  notifications. Install the app. It is how you will notice a `privacy@` request
  inside the 30 days the privacy notice promises.
- ❌ No IMAP, no POP, no ActiveSync. It will not work in Gmail, Outlook or Apple
  Mail.
- ❌ No forwarding, so it cannot be pushed into an existing Gmail either.

If living in a separate app turns out to be what stops you checking, Mail Lite
is about $1 per user per month and turns IMAP, POP and SMTP on. The rest of this
file is unchanged either way.

---

## 2. DNS records

Nameservers are `ns1.dyna-ns.net` and `ns2.dyna-ns.net`, so all of this happens
in the registrar's DNS or Zone Editor panel, not in Vercel.

⚠ **Do not touch these two.** They are what serve the site:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `588a6212a13c7dc5.vercel-dns-017.com` |

Mail records are MX and TXT and do not collide with either.

The registrar is **Dynadot**, and the domain uses Dynadot's own DNS rather than
an external provider. Everything below goes in one screen: My Domains, Manage
Domains, click the domain, DNS Settings. That page has a **Domain Record**
section, which is the root and needs no host field because the section itself is
`@`, and a **Subdomain Record** section, where you type only the prefix such as
`zoho._domainkey` or `_dmarc`. Nothing saves until **Save DNS** at the bottom.

### 2a. Domain verification

✅ Done, 8 August 2026:

| Type | Host | Value |
| --- | --- | --- |
| TXT | `@` | `zoho-verification=zb36937646.zmverify.zoho.com` |

A note for the next time a record is added here. It appeared on the
authoritative nameserver immediately but took a few more minutes to show up on
Google's and Cloudflare's public resolvers, because they were still holding a
cached "no TXT record exists" answer. That is negative caching, the TTL is 300
seconds, and it clears on its own. Check the authoritative server directly to
find out whether a record is really live:

```
nslookup -type=TXT esquirely.com.ng ns1.dyna-ns.net
```

### 2b. MX records

Three, and delete anything else in MX.

| Type | Host | Priority | Value |
| --- | --- | --- | --- |
| MX | `@` | 10 | `mx.zoho.com` |
| MX | `@` | 20 | `mx2.zoho.com` |
| MX | `@` | 50 | `mx3.zoho.com` |

In Dynadot these go in the **Domain Record** section, with the priority in the
field Dynadot labels **Distance**.

### 2c. SPF, and the one real trap

**One SPF record. Never two.** A domain with two `v=spf1` records has a broken
SPF at every receiver, which is worse than having none. Zoho will tell you to
add one and Brevo will tell you to add one. They go on the same line:

| Type | Host | Value |
| --- | --- | --- |
| TXT | `@` | `v=spf1 include:zoho.com include:spf.brevo.com ~all` |

Zoho carries the mail you type by hand. Brevo carries the welcome email and,
after section 5, the signup and reset codes. Omit either and that system's mail
starts landing in spam.

### 2d. DKIM

Two records, and they coexist because each has its own selector.

- **Zoho**: Mail Admin → Domains → DKIM. It generates a selector, usually
  `zoho`, and a long key. Host becomes `zoho._domainkey`.
- **Brevo**: Senders, Domains & Dedicated IPs → authenticate the domain. Its own
  selector and key.

### 2e. DMARC

Start permissive. `p=none` reports without touching delivery.

| Type | Host | Value |
| --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@esquirely.com.ng` |

Move to `p=quarantine` once a fortnight of reports is clean. Not before.

---

## 3. Check it, then create the addresses

From a machine that is not yours:

```
nslookup -type=MX esquirely.com.ng 8.8.8.8
nslookup -type=TXT esquirely.com.ng 8.8.8.8
```

Then in Zoho, create `hello@` as the user and add `roles`, `corrections`,
`privacy`, `ambassadors` and `legal` as aliases on it.

Send a real message from a phone to each of the six and confirm all six arrive.
Do this before section 5: an auth flow that cannot send is much harder to debug
than a mailbox that was never wired up.

---

## 4. Point Brevo at the domain

Replying by hand is already handled: Zoho webmail and the Zoho app send as
`hello@` or any of the five aliases. This section is about the mail the SITE
sends, which is a separate system.

First, the credentials, because section 5 needs them too. Brevo → **SMTP & API**
→ SMTP tab, and take the **SMTP login** and an **SMTP key**. ⚠ The key is not
the API key. They are different strings on the same page, and the API key fails
authentication with an unhelpful error.

Then:

1. In Brevo, add `hello@esquirely.com.ng` as a sender and verify it. The
   verification email lands in Zoho, which is why section 3 comes first.
2. Complete the domain authentication from 2d so Brevo signs as the domain
   rather than sending on behalf of a Gmail address.
3. Update `BREVO_SENDER_EMAIL` to `hello@esquirely.com.ng` in **both**
   `.env.local` and the Vercel project.

It is currently a personal Gmail address. That was the right call when there was
no domain, and it is the reason Brevo was chosen over Resend in the first place
(the comment at the top of `src/lib/email/send.ts` has the full argument). It is
the wrong one now: a welcome email from `hello@esquirely.com.ng` and one from a
personal Gmail read completely differently to somebody deciding whether this
site is real.

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
