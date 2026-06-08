const fs = require('fs');

const content = `'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ALL_FIRMS } from '@/lib/firms-data'

const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/'

function FirmAvatar({ logoFile, name }: { logoFile?: string | null; name: string }) {
  const monogram = name
    .split(' ')
    .filter((w: string) => w.length > 2 && !['and','LLP','LP','Co','the'].includes(w))
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  if (!logoFile) {
    return (
      <div style={{
        width: '72px', height: '72px', flexShrink: 0,
        backgroundColor: '#0A2342', color: '#FAF7F2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Playfair Display, Georgia, serif',
        fontWeight: 700, fontSize: '1.35rem', borderRadius: '3px',
      }}>
        {monogram}
      </div>
    )
  }

  const url = STORAGE + logoFile.replace(/ /g, '%20')
  return (
    <div style={{
      width: '72px', height: '72px', flexShrink: 0,
      backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '3px', overflow: 'hidden',
    }}>
      <img src={url} alt={name} width={72} height={72}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
    </div>
  )
}

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
)
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)

export default function FirmProfilePage({ params }: { params: { slug: string } }) {
  const firm = ALL_FIRMS.find(f => f.slug === params.slug)
  if (!firm) notFound()

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAF7F2', paddingTop: '80px', minHeight: '100vh' }}>

        <div style={{ borderBottom: '0.5px solid #E8E0D5', padding: '1rem 2rem', backgroundColor: '#F0EBE3' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Link href="/firms" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              color: '#4A4A4A', textDecoration: 'none',
            }}>
              <ArrowLeftIcon /> Firm Directory
            </Link>
          </div>
        </div>

        <div style={{ backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5', padding: '3rem 2rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' as const }}>
              <FirmAvatar logoFile={firm!.logoFile} name={firm!.name} />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' as const }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#0A2342', opacity: 0.6 }}>
                    {firm!.tier}
                  </span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>
                    Verified
                  </span>
                  {firm!.openRoles > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      backgroundColor: '#0A2342', color: '#FAF7F2',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem',
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                      padding: '2px 8px', borderRadius: '2px',
                    }}>
                      <BriefcaseIcon /> {firm!.openRoles} open role{firm!.openRoles !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <h1 style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
                  fontWeight: 700, color: '#1A1A1A', lineHeight: 1.1, marginBottom: '0.75rem',
                }}>
                  {firm!.name}
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', lineHeight: 1.7, maxWidth: '600px' }}>
                  {firm!.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>

              <div style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#0A2342', opacity: 0.6 }}>Contact</p>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' as const, gap: '0.85rem' }}>
                  <a href={\`mailto:\${firm!.email}\`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#0A2342', textDecoration: 'none' }}>
                    <span style={{ color: '#4A4A4A' }}><MailIcon /></span>{firm!.email}
                  </a>
                  <a href={firm!.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#0A2342', textDecoration: 'none' }}>
                    <span style={{ color: '#4A4A4A' }}><GlobeIcon /></span>{firm!.website.replace('https://', '')}
                  </a>
                </div>
              </div>

              <div style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#0A2342', opacity: 0.6 }}>
                    Office{firm!.offices.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
                  {firm!.offices.map((office: { city: string; address: string }) => (
                    <div key={office.city} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#4A4A4A', marginTop: '2px', flexShrink: 0 }}><MapPinIcon /></span>
                      <div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>{office.city}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#4A4A4A', lineHeight: 1.5 }}>{office.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#0A2342', opacity: 0.6 }}>Practice Areas</p>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem' }}>
                  {firm!.practiceAreas.map((area: string) => (
                    <span key={area} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', backgroundColor: '#F0EBE3', color: '#1A1A1A', padding: '4px 10px', borderRadius: '2px' }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {firm!.foundedYear && (
                <div style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#0A2342', opacity: 0.6 }}>Established</p>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#1A1A1A' }}>{firm!.foundedYear}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: '#4A4A4A' }}>{new Date().getFullYear() - firm!.foundedYear!} years of practice</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
              <div style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#0A2342', opacity: 0.6 }}>Open Roles</p>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {firm!.openRoles > 0 ? (
                    <>
                      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1, marginBottom: '0.25rem' }}>{firm!.openRoles}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A', marginBottom: '1.25rem' }}>open position{firm!.openRoles !== 1 ? 's' : ''} at this firm</p>
                      <Link href={\`/jobs?firm=\${firm!.slug}\`} className="btn-primary" style={{ display: 'block', textAlign: 'center' as const }}>
                        View open roles
                      </Link>
                    </>
                  ) : (
                    <>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#4A4A4A', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                        No active listings right now. Set an alert to be notified when they post.
                      </p>
                      <Link href="/auth/login" className="btn-outline" style={{ display: 'block', textAlign: 'center' as const }}>
                        Set firm alert
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#0A2342', borderRadius: '3px', padding: '1.5rem' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(250,247,242,0.5)', marginBottom: '0.5rem' }}>
                  Direct Application
                </p>
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1rem', fontWeight: 600, color: '#FAF7F2', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                  Apply directly to their recruitment team.
                </p>
                <a href={\`mailto:\${firm!.email}?subject=Application Enquiry\`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
                  fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  color: '#FAF7F2', border: '0.5px solid rgba(250,247,242,0.3)',
                  padding: '0.65rem 1.25rem', textDecoration: 'none', borderRadius: '2px',
                }}>
                  <MailIcon /> {firm!.email}
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
`;

fs.writeFileSync('src/app/firms/[slug]/page.tsx', content);
console.log('done');