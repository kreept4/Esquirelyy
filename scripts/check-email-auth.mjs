/**
 * Check whether esquirely.com.ng is authenticated for sending, and finish it.
 *
 *   node scripts/check-email-auth.mjs           report only
 *   node scripts/check-email-auth.mjs --verify  report, then ask Brevo to validate
 *
 * ============================================================
 * WHY THIS EXISTS
 * ============================================================
 *
 * Mail from hello@esquirely.com.ng goes out through Brevo, and on 2 September
 * 2026 the Brevo API reported the domain as authenticated:false, verified:false,
 * with no DKIM record present in DNS at all. Every send was therefore unsigned
 * as far as our own domain was concerned: Brevo signs with its domain, DKIM
 * alignment to esquirely.com.ng fails, and Gmail sees a bulk sender claiming a
 * domain it cannot verify. That is a Promotions placement at best.
 *
 * The fix is three DNS records at the registrar. This script exists so that
 * checking whether they have landed, and telling Brevo to look again, is one
 * command rather than a dashboard hunt.
 *
 * ⚠ IT READS DNS FROM GOOGLE'S RESOLVER, NOT FROM THIS MACHINE. A local
 * resolver may hold a negative cache entry for a name that now exists, so a
 * freshly added record can look missing for as long as the old TTL. dns.google
 * is authoritative enough for "has this propagated" and is the same thing
 * Brevo's own checker will see.
 *
 * ⚠ --verify IS SAFE TO RUN REPEATEDLY AND SAFE TO RUN EARLY. Brevo's validate
 * endpoint is a request for it to re-read DNS. If the records are not there yet
 * it reports failure and changes nothing; there is no penalty and no rate limit
 * worth worrying about at this volume.
 *
 * WHAT THIS SCRIPT DOES NOT DO. It cannot add the records. DNS for
 * esquirely.com.ng is at the registrar on ns1/ns2.dyna-ns.net, not on Vercel,
 * so the three records below are typed in by a person. It also does not touch
 * DMARC: the existing record is ours and points its reports at
 * hello@esquirely.com.ng, which is better than Brevo's suggested one that sends
 * them to Brevo. Moving p=none to p=quarantine is a separate decision to take
 * once DKIM is confirmed passing, not something to bundle in here.
 */

import { readFileSync } from 'node:fs'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const DOMAIN = 'esquirely.com.ng'
const KEY = env.BREVO_API_KEY
if (!KEY) {
  console.error('BREVO_API_KEY missing from .env.local')
  process.exit(1)
}
const H = { 'api-key': KEY, accept: 'application/json' }

/**
 * One DNS lookup through Google's resolver. Returns the answer strings.
 *
 * ⚠ RETRIED, AND CLOUDFLARE IS THE FALLBACK. This started as a bare fetch and
 * fell over with UND_ERR_CONNECT_TIMEOUT partway through a run: the script now
 * makes a dozen sequential lookups, and one flaky connection out of twelve
 * killed the whole thing after it had already printed half its findings. A
 * diagnostic that fails intermittently is worse than no diagnostic, because the
 * next person assumes the thing it was checking is broken.
 *
 * Two attempts at Google, then Cloudflare, then give up and say so rather than
 * throwing: an unreachable resolver is not the same finding as a missing
 * record, and the caller needs to be able to tell them apart.
 */
async function dns(name, type) {
  const endpoints = [
    `https://dns.google/resolve?name=${name}&type=${type}`,
    `https://dns.google/resolve?name=${name}&type=${type}`,
    `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`,
  ]
  for (const url of endpoints) {
    try {
      const r = await fetch(url, {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!r.ok) continue
      const j = await r.json()
      return (j.Answer || []).map(a => String(a.data).replace(/^"|"$/g, ''))
    } catch {
      // Next endpoint.
    }
  }
  console.error(`  (could not resolve ${name} ${type}: every resolver timed out)`)
  return null
}

const WANT = [
  { label: 'DKIM 1', type: 'CNAME', host: `brevo1._domainkey.${DOMAIN}`, needle: 'b1.esquirely-com-ng.dkim.brevo.com' },
  { label: 'DKIM 2', type: 'CNAME', host: `brevo2._domainkey.${DOMAIN}`, needle: 'b2.esquirely-com-ng.dkim.brevo.com' },
  { label: 'Brevo code', type: 'TXT', host: DOMAIN, needle: 'brevo-code:a6b74c02bc767264e8e041f2f240a7de' },
  { label: 'SPF', type: 'TXT', host: DOMAIN, needle: 'include:spf.brevo.com' },
  { label: 'DMARC', type: 'TXT', host: `_dmarc.${DOMAIN}`, needle: 'v=DMARC1' },
]

console.log(`DNS for ${DOMAIN}\n`)
let missing = 0
let unresolved = 0
for (const w of WANT) {
  const answers = await dns(w.host, w.type)
  if (answers === null) {
    /* Not the same finding as missing, and must never be counted as one: a
       resolver timeout would otherwise print "add this record" for a record
       that is already there, and somebody would add it twice. */
    unresolved++
    console.log(`  ?????? ${w.label.padEnd(11)} ${w.type} ${w.host}  (lookup failed, unknown)`)
    continue
  }
  const hit = answers.some(a => a.includes(w.needle))
  if (!hit && w.label !== 'DMARC' && w.label !== 'SPF') missing++
  console.log(`  ${hit ? 'ok     ' : 'MISSING'} ${w.label.padEnd(11)} ${w.type} ${w.host}`)
  if (!hit) console.log(`          add: ${w.needle}`)
}

/**
 * ⚠ THE DOMAIN HAS TWO SENDING PATHS AND BOTH HAVE TO BE SIGNED.
 *
 * MX points at Zoho, so mail a person types and sends as hello@esquirely.com.ng
 * leaves through Zoho. The broadcasts leave through Brevo. DMARC does not care
 * which one you were thinking of: at enforcement it judges every message
 * claiming the domain, so a policy tightened while Zoho is unsigned puts your
 * own replies in people's spam folders.
 *
 * Zoho's DKIM selector is chosen by whoever sets it up, so it cannot be looked
 * up the way Brevo's can. The common ones are probed instead, and a miss here
 * means "none of the usual names", not a certainty. If you used a custom
 * selector, check it by hand in Zoho Mail admin.
 */
const ZOHO_SELECTORS = ['zoho', 'zmail', 'default', 'selector1', 'selector2', 's1', 'zohomail']
let zohoSigned = false
for (const s of ZOHO_SELECTORS) {
  const a = await dns(`${s}._domainkey.${DOMAIN}`, 'TXT')
  if (a && a.some(x => /v=DKIM1/i.test(x))) {
    zohoSigned = true
    console.log(`\n  ok      Zoho DKIM   found on selector "${s}"`)
    break
  }
}
if (!zohoSigned) {
  console.log('\n  MISSING Zoho DKIM   none of the common selectors carry a DKIM key')
  console.log('          Zoho Mail admin > Email Authentication > DKIM, then publish the TXT it gives you')
}

/* The policy, not just the presence. p=none is a monitoring record: it asks
   receivers to report and to do nothing, so a domain on p=none is exactly as
   spoofable as a domain with no DMARC at all. Reporting the letter rather than
   a tick is the difference between "DMARC exists" and "DMARC protects you". */
const dmarcTxt = ((await dns(`_dmarc.${DOMAIN}`, 'TXT')) || []).find(x => /v=DMARC1/i.test(x)) || ''
const policy = (/[;\s]p=([a-z]+)/i.exec(dmarcTxt) || [, 'none'])[1].toLowerCase()
console.log(`\n  DMARC policy: p=${policy}` + (policy === 'none' ? '   MONITOR ONLY, the domain is spoofable' : ''))

const before = await (await fetch(`https://api.brevo.com/v3/senders/domains/${DOMAIN}`, { headers: H })).json()
console.log(`\nBrevo: authenticated=${before.authenticated}  verified=${before.verified}`)

if (policy === 'none' && missing === 0 && zohoSigned && before.authenticated) {
  console.log('\nBoth paths signed. Now is the moment to move DMARC to p=quarantine.')
} else if (policy !== 'none' && (!zohoSigned || !before.authenticated)) {
  console.log('\n⚠ DMARC IS ENFORCING WHILE A SENDING PATH IS UNSIGNED. Your own mail may be')
  console.log('  going to spam. Either finish the signing or drop back to p=none today.')
}

if (missing) {
  console.log(`\n${missing} record(s) still to add at the registrar. Nothing else to do until they are in.`)
} else if (before.authenticated && before.verified) {
  console.log('\nAlready authenticated. Nothing to do.')
} else if (!process.argv.includes('--verify')) {
  console.log('\nRecords are all present. Re-run with --verify to have Brevo validate them.')
} else {
  console.log('\nAsking Brevo to validate...')
  const res = await fetch(`https://api.brevo.com/v3/senders/domains/${DOMAIN}/authenticate`, {
    method: 'PUT',
    headers: { ...H, 'content-type': 'application/json' },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error(`  failed ${res.status}: ${JSON.stringify(body).slice(0, 300)}`)
    process.exitCode = 1
  } else {
    const after = await (await fetch(`https://api.brevo.com/v3/senders/domains/${DOMAIN}`, { headers: H })).json()
    console.log(`  now: authenticated=${after.authenticated}  verified=${after.verified}`)
    if (after.authenticated) {
      console.log('\nDone. Send yourself one and check the headers show DKIM pass for esquirely.com.ng.')
    }
  }
}
