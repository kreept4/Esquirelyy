import { createAdminClient } from '@/lib/supabase/admin'
import { UNDATED_STALE_DAYS } from './brief'
import { mentionsRole, readPage } from './reader'
import type { ObsolescenceVerdict, Source } from './types'

/**
 * Deciding a listing has closed.
 *
 * This is the half of the agent that can do harm. Adding a bad listing is
 * visible and embarrassing; removing a good one is invisible — the role simply
 * stops being on the board, nobody knows it was ever there, and the student who
 * would have applied never finds out. So the checks here are ordered cheapest
 * and most certain first, and anything short of certain returns "I could not
 * tell" rather than a guess.
 *
 * ⚠ THE THREE-WAY ANSWER IS THE WHOLE DESIGN. `stillOpen` is true, false, or
 * null, and null is the common case rather than an edge one. A firm's site down
 * for the afternoon, a careers page behind Cloudflare, a posting URL that
 * redirects to a listings index — none of those are evidence a role has closed,
 * and a two-valued check would read every one of them as closure and quietly
 * empty the board the first time a host had a bad day.
 *
 * MOST CHECKS COST NOTHING. A passed deadline is arithmetic and a 404 is an HTTP
 * status; neither needs a language model, and running one on them would be both
 * slower and less reliable than the thing it replaced. The model is called only
 * for the genuinely ambiguous case — the page loads, and the question is whether
 * what is on it still describes this role.
 */

export type JobRow = {
  id: string
  slug: string
  title: string
  employer: string
  deadline: string | null
  apply_url: string | null
  apply_email: string | null
  source: string | null
  is_rolling: boolean | null
  created_at: string
  last_checked_at: string | null
}

/**
 * The listings due a check.
 *
 * Ordered by least-recently-checked so the crawl spreads out: the same twenty
 * employers are not fetched every single morning, and a board of any size gets
 * worked through over days rather than hammered in one tick. Nulls first, so a
 * listing that has never been checked is checked before one that was verified
 * yesterday.
 */
export async function dueForCheck(limit = 12): Promise<JobRow[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('jobs')
    .select('id, slug, title, employer, deadline, apply_url, apply_email, source, is_rolling, created_at, last_checked_at')
    .eq('is_active', true)
    .order('last_checked_at', { ascending: true, nullsFirst: true })
    .limit(limit)

  if (error) throw new Error(`could not read jobs: ${error.message}`)
  return (data ?? []) as JobRow[]
}

export async function markChecked(slugs: string[]): Promise<void> {
  if (!slugs.length) return
  const db = createAdminClient()
  await db.from('jobs').update({ last_checked_at: new Date().toISOString() }).in('slug', slugs)
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

/**
 * Is this listing still real?
 *
 * Runs the checks in order and returns at the first one that gives a definite
 * answer.
 */
export async function checkListing(job: JobRow): Promise<ObsolescenceVerdict> {
  const sources: Source[] = []
  const now = new Date().toISOString()

  /* 1. A passed deadline. Arithmetic, certain, and the single most common
     reason a listing should come down. No network call, no model.

     The date is compared as a plain string because both sides are ISO dates and
     lexicographic order is chronological order for those — no timezone maths,
     and therefore no chance of a listing closing a few hours early for a reader
     in one place and late for another. */
  if (job.deadline) {
    const todayStr = now.slice(0, 10)
    if (job.deadline < todayStr) {
      return {
        slug: job.slug,
        stillOpen: false,
        reason: `The closing date was ${job.deadline}, which has passed.`,
        confidence: 0.99,
        sources: [],
      }
    }
    /* A deadline still in the future is strong evidence the role is open, and
       it is worth stopping here rather than fetching the page. An employer who
       published a date is telling you when it ends; second-guessing that by
       reading their careers page invites the false positive where a firm moves
       a posting and the agent calls a live, dated role closed. */
    return {
      slug: job.slug,
      stillOpen: true,
      reason: `Closes ${job.deadline}, which has not passed.`,
      confidence: 0.9,
      sources: [],
    }
  }

  /* 2. No deadline, but a posting URL we can check. This is where First Bank's
     requisition 1768 was caught: the URL was still shaped correctly, and the
     role was no longer on it. */
  if (job.apply_url) {
    const page = await readPage(job.apply_url)

    if (!page.ok && page.gone) {
      return {
        slug: job.slug,
        stillOpen: false,
        reason: `The posting URL returns ${page.status}. The page is gone.`,
        confidence: 0.95,
        sources: [{ url: job.apply_url, title: 'posting URL', readAt: now, quote: null }],
      }
    }

    if (!page.ok) {
      /* Unreachable is not closed. Said explicitly because this is the branch
         that would otherwise delist half the board on the day a host has an
         outage. */
      return {
        slug: job.slug,
        stillOpen: null,
        reason: `Could not read the posting page (${page.error}). No conclusion — this is not evidence the role has closed.`,
        confidence: 0.2,
        sources: [{ url: job.apply_url, title: 'posting URL', readAt: now, quote: null }],
      }
    }

    sources.push({
      url: job.apply_url,
      title: 'posting URL',
      readAt: now,
      quote: page.text.slice(0, 300),
    })

    const match = mentionsRole(page.text, job.title, job.employer)

    if (match.score >= 0.6) {
      return {
        slug: job.slug,
        stillOpen: true,
        reason: `The posting page still names this role (matched ${match.matched.join(', ')}).`,
        confidence: 0.85,
        sources,
      }
    }

    /* The page loads and does not obviously name the role. This is the
       ambiguous case and the only one worth a model call — a reworded title, a
       careers index that lists the role further down, a page that redirected to
       a general vacancies list. Left to a keyword score it produces exactly the
       wrong answer often enough to matter. */
    return {
      slug: job.slug,
      stillOpen: null,
      reason: `The posting page loads but does not clearly name this role — missing ${match.missing.join(', ')}. Needs a human eye or a closer read.`,
      confidence: 0.45,
      sources,
    }
  }

  /* 3. No deadline, no URL, nothing to check against. Judged on age alone, and
     the threshold comes from the two listings removed by hand on 14 August —
     both ten weeks old, both an email address and nothing else. The note
     written at the time is the rule: a listing we cannot verify is one we
     should not be asking students to act on. */
  if (job.is_rolling) {
    return {
      slug: job.slug,
      stillOpen: null,
      reason: 'Marked as a rolling application with no deadline and no posting URL. Nothing to check it against.',
      confidence: 0.3,
      sources: [],
    }
  }

  const age = daysSince(job.created_at)
  if (age > UNDATED_STALE_DAYS) {
    return {
      slug: job.slug,
      stillOpen: false,
      reason: `No closing date, no posting URL to re-check, and ${age} days old. There is no source that could confirm this is still open.`,
      confidence: 0.6,
      sources: [],
    }
  }

  return {
    slug: job.slug,
    stillOpen: null,
    reason: `No closing date and no posting URL, but only ${age} days old. Too early to call.`,
    confidence: 0.3,
    sources: [],
  }
}

/**
 * Which verdicts are worth asking about.
 *
 * ⚠ ONLY `stillOpen === false` BECOMES A PROPOSAL. A null is the agent saying it
 * does not know, and a message that says "I could not read four pages this
 * morning" every day is a message that stops being read within a week — at
 * which point the ones that matter go unread with it. Nulls are counted in the
 * sweep summary and otherwise stay quiet.
 *
 * The listing is still marked as checked either way, so an unreachable page
 * moves to the back of the queue rather than being retried every single tick.
 */
export function worthProposing(v: ObsolescenceVerdict): boolean {
  return v.stillOpen === false
}
