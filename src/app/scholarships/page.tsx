import Footer from '@/components/layout/Footer'
import ScholarshipsClient from './ScholarshipsClient'
import { ALL_SCHOLARSHIPS } from '@/lib/scholarships-data'

export const metadata = {
  title: 'Scholarships',
  description:
    'Funding for Nigerian law students and lawyers, at home and abroad. Every entry is open to law, checked against the provider’s own eligibility rules.',
}

export default function ScholarshipsPage() {
  return (
    <div>
      <ScholarshipsClient scholarships={ALL_SCHOLARSHIPS} />
      <Footer />
    </div>
  )
}
