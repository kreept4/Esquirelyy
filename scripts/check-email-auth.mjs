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

/** One DNS lookup through Google's resolver. Returns the answer strings. */
async function dns(name, type) {
  const r = await fetch(`https://dns.google/resolve?name=${name}&type=${type}`, {
    headers: { accept: 'application/dns-json' },
  })
  const j = await r.json()
  return (j.Answer || []).map(a => String(a.data).replace(/^"|"$/g, ''))
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
for (const w of WANT) {
  const answers = await dns(w.host, w.type)
  const hit = answers.some(a => a.includes(w.needle))
  if (!hit && w.label !== 'DMARC' && w.label !== 'SPF') missing++
  console.log(`  ${hit ? 'ok     ' : 'MISSING'} ${w.label.padEnd(11)} ${w.type} ${w.host}`)
  if (!hit) console.log(`          add: ${w.needle}`)
}

const before = await (await fetch(`https://api.brevo.com/v3/senders/domains/${DOMAIN}`, { headers: H })).json()
console.log(`\nBrevo: authenticated=${before.authenticated}  verified=${before.verified}`)

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
