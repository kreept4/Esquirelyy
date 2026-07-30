import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import PageHeader from '@/components/layout/PageHeader'
import { ALL_SCHOLARSHIPS } from '@/lib/scholarships-data'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: '#EAF2EC', color: '#2D6A4F', label: 'Open' },
  upcoming: { bg: '#F4EDE2', color: '#8B5E1F', label: 'Upcoming' },
  closed: { bg: '#F0EBE3', color: '#8A8378', label: 'Closed' },
}

export default function ScholarshipsPage() {
  return (
    <>
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>

        <PageHeader
          heading="scholarships"
          subcopy="Fully funded and partially funded opportunities for Nigerian law students and legal professionals, both at home and abroad."
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' }}>
            {ALL_SCHOLARSHIPS.map((s) => {
              const statusStyle = STATUS_STYLE[s.status]
              return (
                <div key={s.slug} style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', backgroundColor: '#fff', padding: '1.75rem', borderLeft: '3px solid #1A1A1A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' as const }}>
                    <span style={{
                      fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                      backgroundColor: statusStyle.bg, color: statusStyle.color,
                      padding: '3px 9px', borderRadius: '2px',
                    }}>
                      {statusStyle.label}
                    </span>
                    <span style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.7rem', color: '#8A8378', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                      {s.region}
                    </span>
                  </div>

                  <h2 style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.3rem' }}>
                    {s.title}
                  </h2>
                  <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#1A1A1A', marginBottom: '0.85rem' }}>
                    {s.provider}
                  </p>

                  <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', lineHeight: 1.7, marginBottom: '1.1rem', maxWidth: '720px' }}>
                    {s.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.1rem', maxWidth: '720px' }}>
                    <div>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#8A8378', marginBottom: '0.25rem' }}>Level</p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#1A1A1A' }}>{s.level}</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#8A8378', marginBottom: '0.25rem' }}>Funding</p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#1A1A1A' }}>{s.funding}</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#8A8378', marginBottom: '0.25rem' }}>Deadline</p>
                      <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.82rem', color: '#1A1A1A' }}>{s.deadline}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {s.eligibility.map((e) => (
                      <span key={e} style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.75rem', backgroundColor: '#F0EBE3', color: '#1A1A1A', padding: '4px 10px', borderRadius: '2px' }}>
                        {e}
                      </span>
                    ))}
                  </div>

                  <Link href={s.link} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.75rem', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                    color: '#FAF7F2', backgroundColor: '#1A1A1A',
                    padding: '0.65rem 1.25rem', textDecoration: 'none', borderRadius: '2px',
                  }}>
                    View details
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
