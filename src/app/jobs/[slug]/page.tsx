import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, MapPin, Clock, ExternalLink } from 'lucide-react'
export const revalidate = 0
const SA: Record<string,string> = { law_firm:'#5C1A1A', banking:'#0A4A8C', energy:'#7A3B00', fintech:'#0E5C3A', other:'#3B3B3B' }
const SL: Record<string,string> = { law_firm:'Law Firm', banking:'Banking', energy:'Energy', fintech:'Tech & Fintech', other:'Industry' }
const TL: Record<string,string> = { job:'Full-time', internship:'Internship', vacation_scheme:'Vacation Scheme', pupillage:'Pupillage' }
const LL: Record<string,string> = { student:'Student', nysc:'NYSC', junior:'Junior (0-3 yrs PQE)', mid:'Mid-level (3-6 yrs PQE)', senior:'Senior (6+ yrs PQE)' }
export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { data: listing } = await supabase.from('jobs').select('*').eq('slug', params.slug).single()
  if (!listing) return notFound()
  const accent = SA[listing.sector] || '#3B3B3B'
  const applyHref = listing.apply_url || (listing.apply_email ? 'mailto:' + listing.apply_email + '?subject=Application: ' + listing.title : null)
  return (
    <div>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '1rem 2rem', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Link href='/jobs' style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4A4A4A', textDecoration: 'none' }}><ArrowLeft size={13} /> Back to Listings</Link>
          </div>
        </div>
        <div style={{ borderBottom: '0.5px solid #E8E0D5', borderLeft: '4px solid ' + accent, padding: '2.5rem 2rem', backgroundColor: '#FFFFFF' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' as const }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent }}>{SL[listing.sector] || 'Industry'}</span>
              {listing.tier && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>{listing.tier}</span>}
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4A4A4A' }}>{TL[listing.type] || listing.type}</span>
              {listing.is_verified && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>Verified</span>}
              {listing.is_closing_soon && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#B5451B' }}>Closing Soon</span>}
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: '0.4rem' }}>{listing.title}</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#5C1A1A', marginBottom: '1rem' }}>{listing.employer}</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const, marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A' }}><MapPin size={12} />{listing.location}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A' }}>{LL[listing.level] || listing.level}</span>
              {listing.is_rolling ? <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#4A4A4A' }}>Rolling applications</span> : listing.deadline ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: listing.is_closing_soon ? '#B5451B' : '#4A4A4A' }}><Clock size={12} />Deadline: {new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span> : null}
            </div>
            {listing.practice_areas?.length > 0 && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>{listing.practice_areas.map((area: string) => <span key={area} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px', backgroundColor: '#F0EBE3', border: '0.5px solid #E8E0D5', borderRadius: '2px', color: '#4A4A4A' }}>{area}</span>)}</div>}
          </div>
        </div>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr min(280px, 35%)', gap: '3rem', alignItems: 'start' }}>
          <div>
            {listing.about && <section style={{ marginBottom: '2rem' }}><h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>About the Organisation</h2><p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.7 }}>{listing.about}</p></section>}
            {listing.role_desc && <section style={{ marginBottom: '2rem' }}><h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>The Role</h2><p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.7 }}>{listing.role_desc}</p></section>}
            {listing.requirements?.length > 0 && <section><h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '0.75rem' }}>Requirements</h2><ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>{listing.requirements.map((req: string, i: number) => <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1A1A1A', lineHeight: 1.5 }}><span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: accent, flexShrink: 0, marginTop: '8px' }} />{req}</li>)}</ul></section>}
          </div>
          <div style={{ position: 'sticky' as const, top: '96px' }}>
            <div style={{ border: '0.5px solid #E8E0D5', borderTop: '3px solid ' + accent, backgroundColor: '#FFFFFF', padding: '1.5rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4A4A4A', marginBottom: '1rem' }}>Apply for this role</p>
              {applyHref && <a href={applyHref} target='_blank' rel='noopener noreferrer' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '0.75rem', boxSizing: 'border-box' as const, backgroundColor: '#5C1A1A', color: '#FAF7F2', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '2px', marginBottom: '0.75rem' }}><ExternalLink size={13} />{listing.apply_url ? 'Apply Now' : 'Apply via Email'}</a>}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid #E8E0D5' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', lineHeight: 1.6 }}>
                  {listing.apply_email && <span>Send your CV to <a href={'mailto:' + listing.apply_email} style={{ color: '#5C1A1A', fontWeight: 600 }}>{listing.apply_email}</a>. </span>}
                  {listing.is_rolling ? 'Applications reviewed on a rolling basis.' : listing.deadline ? 'Deadline: ' + new Date(listing.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) + '.' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
