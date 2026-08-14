/**
 * Reading a web page, from a serverless function, without a browser.
 *
 * Two paths, tried in order:
 *
 *   plain fetch Our own request, straight to the origin. Raw HTML, no
 *               JavaScript, which is enough for the question this module is
 *               usually asked: is this page still there, and does it still name
 *               this role.
 *
 *   r.jina.ai   A reader service that renders JavaScript and returns markdown.
 *               Only tried when JINA_API_KEY is set, and only when the direct
 *               fetch failed.
 *
 * ⚠ DIRECT FIRST, AND THAT ORDER IS MEASURED RATHER THAN ASSUMED. Jina was
 * first in the original draft, on the reasoning that a rendered page beats raw
 * HTML. Tested against the actual source list on 15 August 2026, anonymous
 * r.jina.ai returned 403 to everything — including example.com, which is how we
 * know it was Jina refusing us and not eight different sites blocking a
 * crawler. The free unauthenticated reader that circulates in tutorials
 * (`curl https://r.jina.ai/URL`) now requires a key.
 *
 * The same test showed the direct path is in much better shape than expected:
 * MyJobMag 200 at 65KB, UN Careers 200 at 120KB, Opportunity Desk 200 at 213KB.
 * Of the sources tried, only the African Development Bank was genuinely behind
 * a Cloudflare challenge. So the cheap path is also the one that works, and
 * Jina is now what it should always have been — a fallback for the JavaScript
 * pages, switched on by setting a key.
 *
 * ⚠ NEITHER PATH SENDS A COOKIE, AND THAT IS A DESIGN CONSTRAINT RATHER THAN AN
 * OMISSION. Everything here reads as a logged-out stranger. That is what makes
 * it safe to point at LinkedIn — see LINKEDIN_POLICY in brief.ts — and it is
 * also why the agent simply cannot see anything behind a login. If a source
 * needs an account, the answer is to drop the source.
 *
 * Claude's own `web_fetch` tool is the third reader, and it is not called from
 * here. It runs server-side inside the research request, where the model decides
 * what to open. This module is for the checks that should not cost a model call
 * at all: a listing whose apply_url returns 404 does not need a language model
 * to interpret it.
 */

/** Long enough for a slow Nigerian firm's site, short enough to fail a sweep fast. */
const TIMEOUT_MS = 20_000

/**
 * A browser's User-Agent, and it is worth saying why rather than leaving it to
 * look like cargo cult. A default `node-fetch`/undici UA is refused outright by
 * a good number of hosts, including several of the job boards in brief.ts, which
 * return 403 to anything that does not look like a browser. This is not
 * pretending to be a person — the request is still anonymous and still obeys
 * whatever the server decides — it is avoiding a block that has nothing to do
 * with what we are asking for.
 */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

export type PageRead =
  | { ok: true; text: string; via: 'jina' | 'direct'; status: number }
  /**
   * `gone` is the field the delisting checks actually branch on, and it is
   * separate from `ok` on purpose. A 404 is a successful read of a definite
   * answer; a timeout is a failure to read anything. Collapsing the two would
   * mean every network wobble reads as "this role is closed".
   */
  | { ok: false; gone: boolean; status: number | null; error: string }

async function withTimeout(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
}

/**
 * Read a page, best effort.
 *
 * Returns the text on success. On failure, says whether the page is definitely
 * gone (404/410) or merely unreadable, which are different findings and lead to
 * different proposals.
 */
export async function readPage(url: string): Promise<PageRead> {
  let directStatus: number | null = null
  let directError = 'could not reach the page'

  /* Direct first — see the header. Cheap, no third party, and it worked on
     every source tried except one. */
  try {
    const res = await withTimeout(url, {
      headers: {
        'User-Agent': UA,
        /* ReliefWeb answers 406 without this — it content-negotiates and
           refuses a request that does not say what it will accept. One header
           turned a dead source into a live one, and it costs nothing on hosts
           that do not care. */
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
    })

    /* Gone is gone. No fallback can make a 404 into a page, so return the
       finding rather than spending a second request confirming it. */
    if (res.status === 404 || res.status === 410) {
      return { ok: false, gone: true, status: res.status, error: `origin returned ${res.status}` }
    }

    if (res.ok) {
      const html = await res.text()
      const text = stripHtml(html)

      /* A Cloudflare interstitial answers 200 in some configurations, and its
         body is a challenge page rather than the site. Left undetected it reads
         as a successful fetch of a page that does not mention the role — which
         is the exact input that produces a wrong delisting. */
      if (!isChallenge(text)) {
        return { ok: true, text, via: 'direct', status: res.status }
      }
      directError = 'origin served a bot challenge'
    } else {
      directStatus = res.status
      directError = `origin returned ${res.status}`
    }
  } catch (err: any) {
    directError = err?.message || directError
  }

  /**
   * Jina, only if we hold a key.
   *
   * Skipped entirely when unset, rather than attempted and failed. Anonymous
   * r.jina.ai returns 403 to everything as of 15 August 2026, so trying without
   * a key spends a 20-second timeout to learn nothing — on every unreadable
   * page, on every sweep.
   */
  const jinaKey = process.env.JINA_API_KEY
  if (jinaKey) {
    try {
      const res = await withTimeout(`https://r.jina.ai/${url}`, {
        headers: {
          Authorization: `Bearer ${jinaKey}`,
          'User-Agent': UA,
          /* Markdown rather than the default, which carries link soup and image
             references and multiplies the token count for no gain on a page we
             are scanning for one job title. */
          'X-Return-Format': 'markdown',
        },
      })

      if (res.status === 404 || res.status === 410) {
        return { ok: false, gone: true, status: res.status, error: `origin returned ${res.status}` }
      }

      if (res.ok) {
        const text = await res.text()
        /* Jina answers 200 with an error body when the ORIGIN failed, so the
           status alone does not prove the page was read. A near-empty response
           is the tell. */
        if (text.trim().length > 200 && !isChallenge(text)) {
          return { ok: true, text, via: 'jina', status: res.status }
        }
      }
    } catch {
      /* fall through to the failure below */
    }
  }

  return { ok: false, gone: false, status: directStatus, error: directError }
}

/**
 * Is this a bot challenge rather than the page?
 *
 * ⚠ THE COST OF MISSING ONE IS A WRONGLY CLOSED LISTING. A challenge page is
 * perfectly readable text that happens to contain none of the words in a job
 * title, so to everything downstream it looks exactly like a careers page that
 * no longer carries the role. That is the single most dangerous input this
 * module can hand on, which is why it is checked on both paths.
 */
function isChallenge(text: string): boolean {
  const head = text.slice(0, 2000).toLowerCase()
  return (
    head.includes('just a moment') ||
    head.includes('cf-browser-verification') ||
    head.includes('enable javascript and cookies to continue') ||
    head.includes('checking your browser before accessing') ||
    head.includes('attention required! | cloudflare')
  )
}

/**
 * HTML to something a model can read cheaply.
 *
 * Deliberately crude — this is not a parser and does not need to be. Script and
 * style contents have to go because they are most of the bytes on a modern page
 * and none of the meaning; everything after that is tag removal and whitespace
 * collapse. Anything needing better than this should be going through Jina.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Does this page still name this role?
 *
 * The cheap half of the obsolescence check, and it answers most cases without a
 * model call. A posting page that no longer contains the job title is the
 * strongest signal short of a 404 that the role has been taken down — it is
 * exactly the check that established First Bank's requisition 1768 was gone
 * while requisition 1726 was still live.
 *
 * ⚠ ABSENCE OF THE TITLE IS NOT PROOF OF CLOSURE, and the caller must treat it
 * as evidence rather than a verdict. A firm that rewords "Associate — Dispute
 * Resolution" to "Dispute Resolution Associate" has not closed anything. That
 * is why this returns a score and the words it matched, not a boolean, and why
 * anything ambiguous goes to the model in obsolete.ts.
 */
export function mentionsRole(pageText: string, title: string, employer: string) {
  const haystack = pageText.toLowerCase()

  /* Words of four letters or more, so that 'and', 'the', 'of' do not each count
     as a match and drag a total mismatch up to a passing score. */
  const words = (s: string) =>
    s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(w => w.length >= 4)

  const titleWords = [...new Set(words(title))]
  const hits = titleWords.filter(w => haystack.includes(w))

  return {
    /** 0 to 1. Above ~0.6 the role is almost certainly still named on the page. */
    score: titleWords.length ? hits.length / titleWords.length : 0,
    matched: hits,
    missing: titleWords.filter(w => !hits.includes(w)),
    employerNamed: words(employer).some(w => haystack.includes(w)),
  }
}
