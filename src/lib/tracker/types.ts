export type Status = 'Applied' | 'Assessment' | 'Interview I' | 'Interview II' | 'Offer' | 'Rejected'

export type Application = {
  id: string
  firm: string
  role: string
  status: Status
}