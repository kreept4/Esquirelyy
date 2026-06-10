import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ALL_FIRMS } from '@/lib/firms-data'

const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/'

function FirmAvatar({ logoFile, name }: { logoFile?: string | null; name: string }) {
  return (
    <div style={{
      width: '96px', height: '96px', flexShrink: 0, borderRadius: '3px',
      border: '0.5px solid #E8E0D5', backgroundColor: '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {logoFile ? (
        <img src={STORAGE + logoFile.replace(/ /g, '%20')} alt={name}
          style={{ objectFit: 'contain', width: '85%', height: '85%' }} />
      ) : (
        <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1.5rem', color: '#FAF6F0', backgroundColor: '#8B3A3A', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
        </span>
      )}
    </div>
  )
}

const MapPinIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>)
const GlobeIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>)
const MailIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>)
const ArrowLeftIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>)

export default function FirmDetailPage({ params }: { params: { slug: string } }) {
  const firm = ALL_FIRMS.find(f => f.slug === params.slug)
  if (!firm) return notFound()

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAF6F0', paddingTop: '64px', minHeight: '100vh' }}>

        {/* Breadcrumb */}
        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '0.875rem 2rem', backgroundColor: '#F2EBE1' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Link href="/firms" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A4A4A', textDecoration: 'none' }}>
              <ArrowLeftIcon /> Firm Directory
            </Link>
          </div>
        </div>

        {/* Header */}
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '0.5px solid #E8E0D5', padding: '3rem 2rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B3A3A' }}>
                {firm.tier}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#C8BEB4', display: 'inline-block' }} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D6A4F' }}>
                Verified
              </span>
              {firm.foundedYear && (
                <>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#C8BEB4', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', letterSpacing: '0.08em', color: '#4A4A4A' }}>
                    Est. {firm.foundedYear}
                  </span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ paddingTop: '6px' }}><FirmAvatar logoFile={firm.logoFile} name={firm.name} /></div>
              <div style={{ backgroundColor: '#F2EBE1', padding: '1.25rem 1.5rem', borderRadius: '2px', border: '0.5px solid #E8E0D5' }}>
                <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.1, marginBottom: '0.75rem' }}>
                  {firm.name}
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', lineHeight: 1.7, maxWidth: '600px' }}>
                  {firm.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr min(300px, 32%)', gap: '3rem', alignItems: 'start' }}>

          {/* Left — details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* Practice Areas */}
            <section>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4A4A', marginBottom: '1rem' }}>
                Practice Areas
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {firm.practiceAreas.map((area: string) => (
                  <span key={area} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', padding: '5px 12px', backgroundColor: '#F2EBE1', border: '0.5px solid #E8E0D5', borderRadius: '2px', color: '#1A1A1A' }}>
                    {area}
                  </span>
                ))}
              </div>
            </section>

            {/* Offices */}
            <section>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4A4A', marginBottom: '1rem' }}>
                Offices
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {firm.offices.map((office: any) => (
                  <div key={office.city} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#8B3A3A', marginTop: '2px', flexShrink: 0 }}><MapPinIcon /></span>
                    <div>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.15rem' }}>{office.city}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: '#4A4A4A', lineHeight: 1.5 }}>{office.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right — contact card */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div style={{ border: '0.5px solid #E8E0D5', borderTop: '3px solid #8B3A3A', backgroundColor: '#FFFFFF', padding: '1.5rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4A4A', marginBottom: '1.25rem' }}>
                Apply Directly
              </p>
              {firm.email && (
                <a href={'mailto:' + firm.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '0.75rem', backgroundColor: '#8B3A3A', color: '#FAF6F0', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px', marginBottom: '0.75rem', boxSizing: 'border-box' }}>
                  <MailIcon /> Send Application
                </a>
              )}
              {firm.website && (
                <a href={firm.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: '#8B3A3A', border: '0.5px solid #8B3A3A', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px', boxSizing: 'border-box' }}>
                  <GlobeIcon /> Visit Website
                </a>
              )}
              {firm.email && (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid #E8E0D5', lineHeight: 1.6 }}>
                  Send your CV and cover letter to <a href={'mailto:' + firm.email} style={{ color: '#8B3A3A', fontWeight: 600 }}>{firm.email}</a>
                </p>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
