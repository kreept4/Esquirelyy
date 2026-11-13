/**
 * Who runs the interview, as it actually happens in the Nigerian market.
 *
 * Replaced four invented personas on 13 November 2026 ("Senior partner",
 * "HR director", "Magic Circle associate", "Nigerian firm partner"), which
 * read as abstract, and which the API never read anyway: it guessed an
 * interviewer from the role title, so the choice on the page changed nothing.
 *
 * At a law firm the rounds are HR or recruitment, then a partner. At a
 * company or organisation they are HR, then whoever owns the technical side:
 * the Head of Legal, the compliance lead, or the manager the hire reports to.
 */
export type InterviewerId = 'law_hr' | 'law_partner' | 'org_hr' | 'org_technical'

export const INTERVIEWERS: {
  id: InterviewerId
  setting: 'Law firm' | 'Company or organisation'
  label: string
  desc: string
  /** For the model: who is asking, and what that round covers. */
  brief: string
}[] = [
  {
    id: 'law_hr',
    setting: 'Law firm',
    label: 'HR or recruitment',
    desc: 'First round: motivation, fit, availability',
    brief:
      "the HR or recruitment lead at a Nigerian law firm, running the first-round interview. This round covers motivation, why this firm and this practice, career plans, teamwork, how the candidate handles pressure and long hours, and practical points such as NYSC status, call to the Bar and availability. It does not test detailed law; that is the partner's round",
  },
  {
    id: 'law_partner',
    setting: 'Law firm',
    label: 'Partner',
    desc: 'Legal knowledge, judgement, the practice area',
    brief:
      "a partner at a Nigerian law firm interviewing for their own practice group. This round tests legal knowledge in the practice area, applying the law to a client's problem, research and drafting, commercial awareness, judgement and professional ethics. Partners often put a short hypothetical client scenario and press on the answer",
  },
  {
    id: 'org_hr',
    setting: 'Company or organisation',
    label: 'HR',
    desc: 'First round: motivation, fit, competencies',
    brief:
      "the HR manager at a Nigerian company or organisation, running the first-round interview for a legal, compliance or graduate role. This round covers motivation, why this organisation and sector, why in-house rather than a law firm where relevant, core competencies, teamwork, and practical points such as NYSC status and availability. It does not test detailed law",
  },
  {
    id: 'org_technical',
    setting: 'Company or organisation',
    label: 'Technical interviewer',
    desc: 'Head of Legal, compliance lead or hiring manager',
    brief:
      "the Head of Legal, compliance lead or hiring manager the candidate would report to at a Nigerian company or organisation, running the technical round. This round tests how the candidate handles the legal and regulatory problems the business actually faces: contracts, the sector's regulators, risk, advising non-lawyers in plain terms, and prioritising competing requests",
  },
]

/** The four ids above, plus the retired ones so old sessions still get a label. */
export function interviewerLabel(id: string): string {
  const hit = INTERVIEWERS.find(i => i.id === id)
  if (hit) return `${hit.label}, ${hit.setting.toLowerCase()}`
  const legacy: Record<string, string> = {
    senior_partner: 'Partner, law firm',
    nigerian_firm: 'Partner, law firm',
    magic_circle: 'Partner, law firm',
    hr_director: 'HR or recruitment, law firm',
  }
  return legacy[id] || id
}
