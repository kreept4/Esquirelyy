import Anthropic from '@anthropic-ai/sdk'
import { parseJSON } from '@/lib/ai'
import {
  AFRICA_PROGRAMME_FIRMS,
  APPLICABILITY,
  INTERNATIONAL_SOURCES,
  JOB_SOURCES,
  SCHOLARSHIP_SOURCES,
} from './brief'
import type { Candidate, ScholarshipCandidate, Source } from './types'

/**
 * Going and looking.
 *
 * Claude does the searching itself, through Anthropic's server-side `web_search`
 * and `web_fetch` tools. Nothing here holds a search API key, drives a browser,
 * or maintains a scraper — the model issues the queries, opens what looks
 * promising, and reads it, all inside the one request.
 *
 * ⚠ WHY THIS IS NOT A CRAWLER, WHICH IS THE POINT OF THE WHOLE FILE.
 * scripts/fetch-jobs.js already does the crawler version: nine fixed phrases at
 * Adzuna, take whatever comes back, upsert it. That is cheap and it is why the
 * board has carried a "legal officer" post that wanted an accountant. The
 * expensive part of finding a job for a Nigerian law student is not fetching —
 * it is deciding whether the thing you fetched is one, and that judgement is
 * what a model is for and a keyword match will never be. The Adzuna feed stays;
 * this sits next to it and does the part it cannot.
 *
 * COST. Web search is billed per search, so a sweep is not free and the number
 * of searches is capped per call below. A daily sweep at these caps is a few
 * dollars a month, which is the right order of magnitude next to the thing it
 * replaces — an hour of somebody reading careers pages.
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 4,
})

/**
 * Just inside Vercel's 300-second function ceiling, so an overrun surfaces as
 * our own error rather than as a killed function with no explanation. Matches
 * the reasoning in lib/ai.ts, which found this the hard way on CV review.
 */
const REQUEST_TIMEOUT_MS = 290_000

/**
 * ⚠ THE MODEL IS OPUS 5 HERE AND SONNET IN lib/ai.ts, DELIBERATELY.
 *
 * The tool routes are interactive — somebody is watching a spinner, and Sonnet
 * turns a cover letter around in thirteen seconds against Opus's twenty-four.
 * Nobody is watching this. It runs at 6am, it takes minutes, and what it costs
 * in latency it buys back in the judgement that this whole file exists for:
 * deciding whether a posting is genuinely open to a Nigerian law student is
 * exactly the kind of call where the better model is worth the wait.
 */
const MODEL = 'claude-opus-5'

/**
 * The server-tool loop.
 *
 * ⚠ `pause_turn` IS NOT AN ERROR AND MUST BE RESUMED, and getting this wrong is
 * silent. Anthropic runs its own sampling loop for server-side tools and stops
 * at ten iterations, handing back `stop_reason: "pause_turn"` with whatever it
 * has so far. A caller that treats that as the end gets a half-finished search
 * that looks like a complete answer with no results — no error, no warning,
 * just an agent that quietly reports "nothing found today" forever.
 *
 * Resuming is re-sending the conversation with the assistant's partial turn
 * appended and NO new user message; the API sees the trailing server_tool_use
 * block and picks up where it stopped.
 */
/**
 * ⚠ THIS NUMBER COST $47 ON THE FIRST DAY. Read the whole note before raising it.
 *
 * Resuming a paused turn means re-sending the ENTIRE conversation, and by the
 * time the server-tool loop pauses, that conversation contains every page
 * web_fetch has pulled in, in full. Each resume therefore re-bills everything
 * accumulated so far. It is quadratic, it is silent, and it does not look
 * expensive when you write it.
 *
 * Measured on 15 August 2026, from the account's own usage export: four sweeps,
 * 64 web searches, and 9,513,634 input tokens with zero cache reads —
 * approximately 2.4 MILLION input tokens per sweep, or about $12 each at Opus
 * rates. The searches themselves were $0.64 of it. Essentially all of the cost
 * was re-sending fetched pages.
 *
 * Three things now hold it down, and all three matter:
 *
 *   max_content_tokens on web_fetch, so one enormous page cannot dominate the
 *   context. This is the single biggest lever — it is the absence of this that
 *   turned "read some careers pages" into millions of tokens.
 *
 *   cache_control on the system prompt, so the stable prefix is billed at 0.1x
 *   on every resume instead of full price. The usage export showed
 *   cache_read = 0, meaning every resend paid full freight.
 *
 *   Two resumes instead of six. A sweep that has not finished after three
 *   passes is wandering, and the marginal find is not worth the marginal
 *   re-send.
 */
const MAX_RESUMES = 2

/**
 * How much of any one fetched page may enter the context.
 *
 * A Nigerian job board's listing page runs to tens of thousands of tokens of
 * navigation, related-jobs rails and footer. The part that decides whether a
 * role belongs on the board is a few hundred words. Capping this costs almost
 * no signal and removes almost all of the bill.
 */
const MAX_PAGE_TOKENS = 6_000

/** Hard ceiling per sweep. Nothing about a legal-jobs search justifies more. */
const INPUT_TOKEN_CEILING = 400_000

async function runResearch(system: string, prompt: string, maxSearches: number): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }]
  let inputTokensSoFar = 0

  for (let resume = 0; resume <= MAX_RESUMES; resume++) {
    const stream = anthropic.messages.stream(
      {
        model: MODEL,
        /* Streaming, and generous. A sweep reads a dozen pages and writes a
           structured answer about each; a tight ceiling truncates the JSON and
           the whole run is wasted at the parse. */
        max_tokens: 32_000,
        /* Cached, so a resume re-reads the stable prefix at a tenth of the
           price rather than paying for it again. The system prompt is the same
           bytes on every call by construction — nothing interpolated, no
           timestamp — which is exactly what makes it cacheable. */
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] as any,
        messages,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        tools: [
          {
            type: 'web_search_20260209',
            name: 'web_search',
            /* The cost ceiling for one sweep. Also a quality control: an
               unbounded search wanders into aggregator spam, and the useful
               findings are almost always in the first several queries. */
            max_uses: maxSearches,
          },
          {
            type: 'web_fetch_20260209',
            name: 'web_fetch',
            max_uses: maxSearches,
            /* See MAX_PAGE_TOKENS. Without this a single bloated careers page
               can put six figures of navigation markup into a context that then
               gets re-sent on every resume. */
            max_content_tokens: MAX_PAGE_TOKENS,
          },
        ] as any,
      },
      { timeout: REQUEST_TIMEOUT_MS }
    )

    const message = await stream.finalMessage()

    /* Counted across resumes, because that is where the money went. Cache
       reads are billed at a tenth, so they are counted at a tenth. */
    const u: any = message.usage ?? {}
    inputTokensSoFar +=
      (u.input_tokens ?? 0) +
      (u.cache_creation_input_tokens ?? 0) +
      Math.round((u.cache_read_input_tokens ?? 0) / 10)

    if (message.stop_reason === 'pause_turn') {
      /* ⚠ THE STOP THAT WAS MISSING. Without a ceiling here, a run that keeps
         pausing keeps re-sending a context that only grows, and nothing in the
         loop notices. Better a truncated sweep than a four-figure month. */
      if (inputTokensSoFar > INPUT_TOKEN_CEILING) {
        throw new Error(
          `research stopped at the token ceiling (${inputTokensSoFar.toLocaleString()} input tokens). ` +
            `The sweep was still paused; nothing was lost but nothing was found.`
        )
      }
      messages.push({ role: 'assistant', content: message.content as any })
      continue
    }

    if (message.stop_reason === 'refusal') {
      throw new Error('the research request was declined by the safety classifier')
    }
    if (message.stop_reason === 'max_tokens') {
      throw new Error('the research answer was cut off before it finished')
    }

    console.log(`[agent] research finished — ~${inputTokensSoFar.toLocaleString()} billable input tokens`)
    return message.content.map(b => (b.type === 'text' ? b.text : '')).join('\n')
  }

  throw new Error(
    `research did not finish after ${MAX_RESUMES} resumes ` +
      `(~${inputTokensSoFar.toLocaleString()} input tokens spent)`
  )
}

/**
 * The rules every research call shares.
 *
 * ⚠ THE FABRICATION RULES ARE THE LOAD-BEARING PART. A model asked to find jobs
 * will, on a thin day, produce a plausible listing at a real firm with an
 * invented closing date — and that failure is invisible, because the output is
 * correctly shaped and the firm exists. What makes it a caught error rather
 * than a published one is the demand that every field be traceable to a quoted
 * line from a fetched page, and that a missing fact be returned as null rather
 * than as a reasonable guess. A null deadline costs a proposal one line of
 * detail. An invented one sends a student to a closed application.
 */
const SYSTEM = `
You research legal-career opportunities for Esquirely, a Nigerian legal careers
platform. Its readers are Nigerian law students, NYSC participants, and lawyers
in their first several years after call to the Nigerian Bar.

${APPLICABILITY}

HOW TO WORK

Search, then OPEN the postings you find. A search result snippet is not enough
to propose a listing — fetch the page and read it. Prefer the employer's own
careers page over an aggregator's copy of the same vacancy: the aggregator is
often weeks stale and its closing dates are frequently wrong.

EVIDENCE RULES — these are not style preferences.

1. Every fact you report must come from a page you actually fetched in this
   session. Not from what you remember about the employer, and not from a search
   snippet.
2. If a page does not state something, return null for it. Do NOT infer a
   closing date, a practice area, a seniority level, or an application address.
   A null field is correct and useful. A guessed field is a student sent to a
   closed application, and neither you nor anyone reading your output can tell
   the two apart afterwards.
3. Quote the line you relied on, verbatim, in the source's "quote" field.
4. If you cannot find an application route — a URL or an email — do not propose
   the listing at all. A listing nobody can apply to is noise on the board.
5. If a page is dated, say how you know. If you cannot tell how old a posting is,
   say so in "caveats" rather than assuming it is current.

Report honestly when a sweep finds little. An empty array is a valid and
frequently correct answer, and is far better than a thin one padded out with
roles that do not meet the bar above.

OUTPUT
Reply with a single JSON object and nothing else — no prose before it, no code
fence around it.
`.trim()

export type JobResearchResult = {
  candidates: Array<Candidate & { confidence: number; caveats: string | null; sources: Source[] }>
  notes: string
}

/**
 * Find roles.
 *
 * @param existing Slugs and employer/title pairs already on the board. Passed in
 *   so the model can skip what we have rather than spending its search budget
 *   rediscovering the board and its output on things that will be thrown away by
 *   the fingerprint check anyway.
 */
export async function researchJobs(existing: {
  slugs: string[]
  roles: Array<{ employer: string; title: string }>
}): Promise<JobResearchResult> {
  const today = new Date().toISOString().slice(0, 10)

  const prompt = `
Today is ${today}.

Find legal-career openings that are OPEN NOW and that meet the bar in your
instructions — roles, internships and programmes alike. Aim for quality over
quantity: five well-verified openings is a good sweep, and zero is an acceptable
one.

COVER BOTH SIDES. Spend roughly two thirds of your searches on Nigerian
employers and one third on international openings a Nigerian may apply for. Do
not return an all-Nigeria sweep on a day when there are live international
programmes, and do not pad with international roles when you cannot establish
that a Nigerian is eligible.

Nigerian sources worth trying — hints, not a list to work through. Follow
whatever looks live, and prefer employers' own careers pages:
${JOB_SOURCES.map(s => `- ${s.name}: ${s.url}`).join('\n')}

International sources, where eligibility rules are published and checkable:
${INTERNATIONAL_SOURCES.map(s => `- ${s.name}: ${s.url}`).join('\n')}

⚠ SPEND AT LEAST TWO SEARCHES ON AFRICA-SPECIFIC PROGRAMMES AT INTERNATIONAL
FIRMS, every sweep. These are the highest-value openings on this board and the
hardest for a reader to find alone — a generic search will not surface them, so
they have to be looked for by name. Rotate through these firms rather than
checking the same one every time:
${AFRICA_PROGRAMME_FIRMS.join(', ')}

Search each with terms like "Africa clerkship", "Africa programme", "Africa
scholarship", "Africa vacation scheme". Check whether applications are open now
and quote the eligibility line. If a programme exists but is between cycles, do
not propose it — say so in your notes so it is not searched for again this week.

For anything based outside Nigeria, quote the sentence that says who may apply.
If you cannot find one, say so in caveats rather than assuming.

You may also read individual LinkedIn job pages you find through search. Read
them as an anonymous visitor; do not attempt to log in to anything.

ALREADY ON THE BOARD — do not propose these again:
${existing.roles.map(r => `- ${r.employer}: ${r.title}`).join('\n') || '(the board is empty)'}

Reply with exactly this shape:

{
  "candidates": [
    {
      "slug": "kebab-case-employer-role-city, unique, no dates",
      "title": "the role as the employer writes it",
      "employer": "the employer as it signs the vacancy",
      "location": "city, or 'Remote' / 'Lagos (hybrid)'",
      "deadline": "YYYY-MM-DD or null",
      "type": "job | internship | clerkship | fellowship | pupillage",
      "level": "student | nysc | junior | mid | senior | partner",
      "sector": "law_firm | banking | energy | fintech | government | ngo | other",
      "practice_areas": ["dispute resolution"],
      "about": "two sentences on the employer, from their own page, or null",
      "role_desc": "what the role involves, in your own words, under 120 words",
      "requirements": ["each requirement the posting states"],
      "apply_url": "the application URL, or null",
      "apply_email": "the application address, or null",
      "source": "web",
      "confidence": 0.0,
      "caveats": "what you are unsure of, or null",
      "sources": [
        { "url": "...", "title": "...", "readAt": "${today}", "quote": "the line you relied on" }
      ]
    }
  ],
  "notes": "one paragraph: what you searched, what was dead, what you deliberately left out and why"
}
`.trim()

  /* Ten. It was sixteen, and sixteen was chosen when a search looked like it
     cost $0.01 — which it does. What it actually costs is the pages the search
     leads the model to fetch, and those get re-sent on every resume; the
     15 August usage export put a sweep at roughly $12, of which $0.16 was
     searching. Cutting the fetch budget with it is the point, not the search
     count itself. Raise this only alongside the caps in runResearch. */
  const raw = await runResearch(SYSTEM, prompt, 10)
  const parsed = parseJSON<JobResearchResult>(raw)

  return {
    candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
    notes: parsed.notes || '',
  }
}

export type ScholarshipResearchResult = {
  candidates: Array<
    ScholarshipCandidate & { confidence: number; caveats: string | null; sources: Source[] }
  >
  notes: string
}

/**
 * Find scholarships and funding calls.
 *
 * ⚠ NOTHING THIS RETURNS CAN REACH THE SITE AUTOMATICALLY, and it is worth
 * knowing that before reading the output. Scholarships are TypeScript, in
 * lib/scholarships-data.ts, so an approved one is delivered to Telegram as a
 * paste-ready block and waits for a deploy. See the note at the foot of the
 * 15 August migration.
 *
 * A DEADLINE IS MANDATORY HERE, unlike a job. A scholarship without a closing
 * date is almost always an aggregator's copy of a call that closed last year —
 * that is the single most common failure on the sites in SCHOLARSHIP_SOURCES,
 * and it is why the requirement is stated in the prompt rather than left to
 * judgement.
 */
export async function researchScholarships(existingTitles: string[]): Promise<ScholarshipResearchResult> {
  const today = new Date().toISOString().slice(0, 10)

  const prompt = `
Today is ${today}.

Find scholarships, fellowships and funding calls that a Nigerian law student or
Nigerian-qualified lawyer can apply for, and whose deadline has NOT passed.

Include: LL.M and postgraduate funding, Nigerian Law School and Bar Part fee
support, essay prizes and moot funding, and fellowships open to early-career
Nigerian lawyers.

Exclude: anything closed, anything with no stated deadline, anything not open to
Nigerians, and general scholarships with no connection to law unless they
explicitly welcome law applicants.

Worth trying:
${SCHOLARSHIP_SOURCES.map(s => `- ${s.name}: ${s.url}`).join('\n')}

ALREADY LISTED — skip these:
${existingTitles.map(t => `- ${t}`).join('\n') || '(none)'}

A CLOSING DATE IS REQUIRED. If the provider's own page does not state one, do
not propose it. Aggregator sites routinely republish last year's call with no
date, and that is the single most common way a dead scholarship reaches a
student.

Reply with exactly this shape:

{
  "candidates": [
    {
      "slug": "kebab-case",
      "title": "...",
      "provider": "...",
      "provider_url": "...",
      "type": "full | partial | bursary | prize | grant",
      "level": "undergraduate | postgraduate | llm | phd | bar_course | all",
      "location": "where it is tenable, or null",
      "is_international": true,
      "amount_description": "what it covers, in the provider's terms, or null",
      "description": "two or three sentences",
      "eligibility": "who can apply, from the provider's page",
      "apply_url": "...",
      "deadline": "YYYY-MM-DD",
      "confidence": 0.0,
      "caveats": "or null",
      "sources": [
        { "url": "...", "title": "...", "readAt": "${today}", "quote": "the line stating the deadline" }
      ]
    }
  ],
  "notes": "what you searched and what you rejected"
}
`.trim()

  const raw = await runResearch(SYSTEM, prompt, 8)
  const parsed = parseJSON<ScholarshipResearchResult>(raw)

  return {
    candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
    notes: parsed.notes || '',
  }
}

/**
 * A logo URL for an employer nobody has drawn a mark for yet.
 *
 * Clearbit takes a domain and returns that company's logo, and next.config.js
 * already whitelists the host — it is the only remote image origin the app
 * allows, so this is the one place a logo can come from without a repository
 * write.
 *
 * THE DOMAIN COMES FROM THE APPLICATION ROUTE, not from a search, because that
 * is a fact we already hold rather than another thing to be wrong about. A role
 * whose apply_url is on the firm's own site gives its domain directly; one that
 * applies by email gives it in the address.
 *
 * ⚠ NOT VERIFIED HERE, ON PURPOSE. Clearbit answers 404 for a domain it does not
 * have, and checking would mean a network round trip per candidate during a
 * sweep that is already slow. next/image simply fails to render a 404 and the
 * existing initials fallback shows, which is the same outcome as having no logo
 * at all — so the check would buy nothing but latency.
 */
export function clearbitLogo(c: Pick<Candidate, 'apply_url' | 'apply_email'>): string | null {
  let domain: string | null = null

  if (c.apply_url) {
    try {
      domain = new URL(c.apply_url).hostname.replace(/^www\./, '')
    } catch {
      /* an unparseable URL is not worth a proposal-blocking error */
    }
  }

  if (!domain && c.apply_email?.includes('@')) {
    domain = c.apply_email.split('@')[1]?.trim().toLowerCase() || null
  }

  if (!domain) return null

  /* An aggregator's domain is not the employer's, and a Clearbit logo for
     "myjobmag.com" on a listing is worse than no logo — it looks like the firm
     is called MyJobMag. Free mail hosts have the same problem in reverse. */
  const NOT_AN_EMPLOYER = [
    'myjobmag.com', 'jobberman.com', 'hotnigerianjobs.com', 'ngcareers.com',
    'linkedin.com', 'indeed.com', 'glassdoor.com', 'adzuna.com',
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'googlemail.com',
  ]
  if (NOT_AN_EMPLOYER.some(d => domain!.endsWith(d))) return null

  return `https://logo.clearbit.com/${domain}`
}
