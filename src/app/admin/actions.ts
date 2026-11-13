'use server'

/**
 * Every write the /admin page makes.
 *
 * ⚠ EACH ACTION STARTS WITH requireAdmin(). A server action is reachable by a
 * POST from anybody who knows its id, whether or not they can see the page, so
 * the check lives here and not only in page.tsx.
 *
 * Writes go through the service-role client, which is why the check matters:
 * nothing in the database stops these writes once they are past it.
 *
 * Each save clears the cached pages that show the row, so a change is on the
 * site straight away rather than after the hourly regeneration.
 */

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

/* ---------- shared ---------- */

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const optional = (v: unknown) => str(v) || null
const date = (v: unknown) => {
  const s = str(v)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}
const lines = (v: unknown) =>
  (Array.isArray(v) ? v.map(String) : str(v).split('\n')).map(s => s.trim()).filter(Boolean)
const commaList = (v: unknown) =>
  (Array.isArray(v) ? v.map(String) : str(v).split(',')).map(s => s.trim()).filter(Boolean)
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s)

function fail(error: string): ActionResult {
  return { ok: false, error }
}

function refreshBoards() {
  revalidatePath('/')
  revalidatePath('/jobs')
  revalidatePath('/jobs/[slug]', 'page')
  revalidatePath('/firms')
  revalidatePath('/firms/[slug]', 'page')
}

function refreshScholarships() {
  revalidatePath('/')
  revalidatePath('/scholarships')
  revalidatePath('/scholarships/[slug]', 'page')
}

/* ---------- jobs ---------- */

export type JobInput = {
  id?: string
  slug?: string
  title: string
  employer: string
  sector: string
  type: string
  level?: string
  tier?: string
  location?: string
  deadline?: string
  practice_areas?: string
  about?: string
  role_desc?: string
  requirements?: string
  apply_email?: string
  apply_url?: string
  source?: string
  logo_url?: string
}

export async function saveJob(input: JobInput): Promise<ActionResult> {
  try {
    await requireAdmin()
    const title = str(input.title)
    const employer = str(input.employer)
    if (!title || !employer) return fail('Title and employer are required.')
    const sector = ['law_firm', 'other'].includes(str(input.sector)) ? str(input.sector) : 'law_firm'
    const type = ['job', 'internship'].includes(str(input.type)) ? str(input.type) : 'job'
    const level = ['junior', 'mid', 'senior'].includes(str(input.level)) ? str(input.level) : null
    const applyUrl = optional(input.apply_url)
    const applyEmail = optional(input.apply_email)
    if (!applyUrl && !applyEmail) return fail('Add an apply link or an apply email.')
    if (applyUrl && !isUrl(applyUrl)) return fail('The apply link must start with http:// or https://.')
    if (applyEmail && !/^\S+@\S+\.\S+$/.test(applyEmail)) return fail('The apply email does not look right.')
    const deadline = date(input.deadline)

    const row = {
      title,
      employer,
      sector,
      type,
      level,
      tier: optional(input.tier),
      location: optional(input.location),
      deadline,
      is_rolling: !deadline,
      practice_areas: commaList(input.practice_areas),
      about: optional(input.about),
      role_desc: optional(input.role_desc),
      requirements: lines(input.requirements),
      apply_email: applyEmail,
      apply_url: applyUrl,
      source: optional(input.source) ?? 'Added from admin',
      logo_url: optional(input.logo_url),
      updated_at: new Date().toISOString(),
    }

    const db = createAdminClient()
    if (input.id) {
      const { error } = await db.from('jobs').update(row).eq('id', input.id)
      if (error) return fail(error.message)
      refreshBoards()
      return { ok: true, id: input.id }
    }

    const slug = slugify(str(input.slug) || `${employer} ${title}`)
    if (!slug) return fail('Could not make a link from that title.')
    const { data: clash } = await db.from('jobs').select('id').or(`id.eq.${slug},slug.eq.${slug}`).maybeSingle()
    if (clash) return fail(`A listing with the link "${slug}" already exists. Change the link and save again.`)
    const { error } = await db.from('jobs').insert({
      ...row,
      id: slug,
      slug,
      is_active: true,
      is_verified: true,
      is_closing_soon: false,
      created_at: new Date().toISOString(),
    })
    if (error) return fail(error.message)
    refreshBoards()
    return { ok: true, id: slug }
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Something went wrong.')
  }
}

export async function setJobActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    await requireAdmin()
    const { error } = await createAdminClient()
      .from('jobs')
      .update(
        active
          ? { is_active: true, delisted_at: null, delisted_reason: null, updated_at: new Date().toISOString() }
          : { is_active: false, delisted_at: new Date().toISOString(), delisted_reason: 'Closed from admin', updated_at: new Date().toISOString() }
      )
      .eq('id', id)
    if (error) return fail(error.message)
    refreshBoards()
    return { ok: true, id }
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Something went wrong.')
  }
}

/* ---------- scholarships ---------- */

export type ScholarshipInput = {
  original_slug?: string
  slug?: string
  title: string
  provider: string
  region?: string
  level?: string
  funding?: string
  deadline?: string
  opens_on?: string
  closes_on?: string
  status?: string
  description?: string
  eligibility?: string
  link: string
  logo?: string
  logo_bg?: string
  sort_order?: string | number
}

export async function saveScholarship(input: ScholarshipInput): Promise<ActionResult> {
  try {
    await requireAdmin()
    const title = str(input.title)
    const provider = str(input.provider)
    const link = str(input.link)
    if (!title || !provider) return fail('Title and provider are required.')
    if (!isUrl(link)) return fail('The apply link must start with http:// or https://.')
    const status = ['open', 'closed', 'upcoming'].includes(str(input.status)) ? str(input.status) : 'open'
    const sort = Number(input.sort_order)

    const row = {
      title,
      provider,
      region: str(input.region),
      level: str(input.level),
      funding: str(input.funding),
      deadline: str(input.deadline),
      opens_on: date(input.opens_on),
      closes_on: date(input.closes_on),
      status,
      description: str(input.description),
      eligibility: lines(input.eligibility),
      link,
      logo: optional(input.logo),
      logo_bg: optional(input.logo_bg),
      updated_at: new Date().toISOString(),
      ...(Number.isFinite(sort) && str(String(input.sort_order ?? '')) ? { sort_order: Math.round(sort) } : {}),
    }

    const db = createAdminClient()
    if (input.original_slug) {
      const { error } = await db.from('scholarships').update(row).eq('slug', input.original_slug)
      if (error) return fail(error.message)
      refreshScholarships()
      return { ok: true, id: input.original_slug }
    }

    const slug = slugify(str(input.slug) || title)
    if (!slug) return fail('Could not make a link from that title.')
    const { data: clash } = await db.from('scholarships').select('slug').eq('slug', slug).maybeSingle()
    if (clash) return fail(`A scholarship with the link "${slug}" already exists. Change the link and save again.`)
    /* New entries go to the end of the board order unless a number was given. */
    let sortOrder = (row as { sort_order?: number }).sort_order
    if (sortOrder === undefined) {
      const { data: last } = await db.from('scholarships').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle()
      sortOrder = ((last?.sort_order as number | undefined) ?? 0) + 10
    }
    const { error } = await db.from('scholarships').insert({ ...row, slug, sort_order: sortOrder, is_published: true })
    if (error) return fail(error.message)
    refreshScholarships()
    return { ok: true, id: slug }
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Something went wrong.')
  }
}

export async function setScholarshipPublished(slug: string, published: boolean): Promise<ActionResult> {
  try {
    await requireAdmin()
    const { error } = await createAdminClient()
      .from('scholarships')
      .update({ is_published: published, updated_at: new Date().toISOString() })
      .eq('slug', slug)
    if (error) return fail(error.message)
    refreshScholarships()
    return { ok: true, id: slug }
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Something went wrong.')
  }
}

/* ---------- opportunities ---------- */

export type OpportunityInput = {
  id?: string
  title: string
  organization: string
  type: string
  target?: string
  location?: string
  deadline?: string
  link: string
  description?: string
  eligibility?: string
  logo_url?: string
  practice_areas?: string
}

const OPPORTUNITY_TYPES = ['internship', 'virtual_internship', 'event', 'competition', 'webinar', 'workshop'] as const

export async function saveOpportunity(input: OpportunityInput): Promise<ActionResult> {
  try {
    await requireAdmin()
    const title = str(input.title)
    const organization = str(input.organization)
    const link = str(input.link)
    if (!title || !organization) return fail('Title and organisation are required.')
    if (!isUrl(link)) return fail('The link must start with http:// or https://.')
    const type = (OPPORTUNITY_TYPES as readonly string[]).includes(str(input.type)) ? str(input.type) : 'internship'
    const target = ['all', 'undergraduate'].includes(str(input.target)) ? str(input.target) : 'all'

    const row = {
      title,
      organization,
      type,
      target,
      location: optional(input.location),
      deadline: date(input.deadline),
      link,
      description: optional(input.description),
      eligibility: optional(input.eligibility),
      logo_url: optional(input.logo_url),
      practice_areas: commaList(input.practice_areas),
    }

    const db = createAdminClient()
    if (input.id) {
      const { error } = await db.from('opportunities').update(row).eq('id', input.id)
      if (error) return fail(error.message)
      refreshBoards()
      return { ok: true, id: input.id }
    }
    const { data, error } = await db.from('opportunities').insert({ ...row, status: 'published' }).select('id').single()
    if (error) return fail(error.message)
    refreshBoards()
    return { ok: true, id: data.id as string }
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Something went wrong.')
  }
}

export async function setOpportunityPublished(id: string, published: boolean): Promise<ActionResult> {
  try {
    await requireAdmin()
    const { error } = await createAdminClient()
      .from('opportunities')
      .update({ status: published ? 'published' : 'closed' })
      .eq('id', id)
    if (error) return fail(error.message)
    refreshBoards()
    return { ok: true, id }
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Something went wrong.')
  }
}
