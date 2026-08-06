import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import { ALL_FIRMS, firmLogo, getMonogram, type Firm } from '@/lib/firms-data'
import LogoFrame from '@/components/ui/LogoFrame'

/** Firm mark for the profile header.
 *
 *  This carried its own copy of the storage URL and keyed off `logoFile`
 *  directly, which broke in two ways. Firms whose art was pulled from their own
 *  site have a null `logoFile` and so rendered nothing at all here, even with a
 *  perfectly good PNG in /public. And every other firm was served the untrimmed
 *  bucket original rather than the trimmed art the rest of the site uses, so
 *  this page sized its logos unlike the directory and the ticker.
 *
 *  Going through firmLogo() and LogoFrame fixes both, and means the three
 *  surfaces stay in step from here. */
function FirmAvatar({ firm }: { firm: Firm }) {
  const url = firmLogo(firm)

  if (!url) {
    /* Matches the directory's quiet placeholder rather than a solid ink block.
     * At this size the filled version was the heaviest thing on the page,
     * outweighing the firm's own name beside it. */
    return (
      <span className="firm-monogram firm-monogram-lg">
        <span className="grotesk-bold">{getMonogram(firm.name)}</span>
      </span>
    )
  }

  return <LogoFrame src={url} alt={firm.name} capHeight={3} maxWidth={9} plate />
}

const MapPinIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>)
const GlobeIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>)
const MailIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>)
const ArrowLeftIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>)

// Next 16 made `params` a Promise. Reading params.slug directly gave undefined,
// so every firm profile fell through to notFound().
export default async function FirmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = ALL_FIRMS.find(f => f.slug === slug)
  if (!firm) return notFound()

  /* Firms a reader of this page would plausibly want next: same tier, and at
   * least one practice area in common. Ranked by how much practice overlap
   * there is, so the suggestions are about the work rather than the alphabet.
   * Falls back to tier alone for firms whose practice list is unusual, which
   * keeps the row populated instead of collapsing on the narrow cases. */
  const related = (() => {
    const overlap = (f: Firm) =>
      f.practiceAreas.filter(p => firm.practiceAreas.includes(p)).length

    const pool = ALL_FIRMS.filter(f => f.slug !== firm.slug)
    const scored = pool
      .map(f => ({ f, score: overlap(f) + (f.tier === firm.tier ? 1.5 : 0) }))
      .filter(x => x.score > 1.5)
      .sort((a, b) => b.score - a.score)

    const picked = scored.slice(0, 4).map(x => x.f)
    if (picked.length >= 3) return picked
    // Top up from the same tier so the row never renders half empty.
    const filler = pool.filter(f => f.tier === firm.tier && !picked.includes(f))
    return [...picked, ...filler].slice(0, 4)
  })()

  return (
    <>
      {/* No min-height. It was 100vh, which on a firm with one office and no
          open roles left a full screen of empty cream between the last line of
          content and the footer. The page is as long as it has things to say. */}
      <main style={{ backgroundColor: '#FAF6F0', paddingTop: '64px' }}>

        {/* Breadcrumb */}
        <div style={{ borderBottom: '0.5px solid var(--cream-border)', padding: '0.875rem 2rem', backgroundColor: '#F2EBE1' }}>
          <div style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto' }}>
            <Link href="/firms" className="back-link">
              <ArrowLeftIcon /> Firms directory
            </Link>
          </div>
        </div>

        {/* Header. The name leads. It previously sat below a row of three
            uppercase micro-labels, one of which was a green "Verified" chip
            shown on every firm in the directory and so meaningless as a
            distinction. Tier and founding year survive as a quiet meta line
            under the name, where they belong: they qualify the firm, they are
            not the headline. */}
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '0.5px solid var(--cream-border)', padding: '3rem 2rem' }}>
          <div style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ paddingTop: '6px' }}><FirmAvatar firm={firm} /></div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '0.6rem' }}>
                  {firm.name}
                </h1>
                <div className="firm-profile-meta">
                  <span>{firm.tier}</span>
                  {firm.foundedYear && (
                    <>
                      <span className="firm-profile-dot" />
                      <span>Established {firm.foundedYear}</span>
                    </>
                  )}
                  <span className="firm-profile-dot" />
                  <span>{firm.offices.length === 1 ? '1 office' : `${firm.offices.length} offices`}</span>
                </div>
                <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.7, maxWidth: '600px' }}>
                  {firm.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr min(300px, 32%)', gap: '3rem', alignItems: 'start' }}>

          {/* Left — details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <section>
              <p className="firm-profile-section-heading">Practice areas</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {firm.practiceAreas.map((area: string) => (
                  <span key={area} className="tag-chip" style={{ fontSize: '0.76rem', padding: '5px 11px' }}>
                    {area}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <p className="firm-profile-section-heading">
                {firm.offices.length === 1 ? 'Office' : 'Offices'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {firm.offices.map((office: any) => (
                  <div key={office.city} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--ink-muted)', marginTop: '3px', flexShrink: 0 }}><MapPinIcon /></span>
                    <div>
                      <p className="firm-office-city">{office.city}</p>
                      <p className="firm-office-address">{office.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right — contact card.
              Was two full-width uppercase blocks of equal weight, one solid
              black and one outlined, stacked under a 3px black rule. Three
              competing heavy elements for what is really one action. The
              application is the action; the website is a reference and now
              reads as a link. */}
          <div className="job-apply-wrap">
            {/* Same carton card the job page uses for its apply panel. The flat
                white box this replaced read as a form field rather than as the
                one thing the page is asking you to do, and it was the only
                surface in the product answering "how do I apply" in its own
                visual language. */}
            <div className="apply-card">
              <p className="grotesk-bold apply-card-title">Apply directly</p>

              {firm.email && (
                <>
                  <a href={'mailto:' + firm.email} className="grotesk-bold apply-card-cta">
                    <MailIcon /> Send your application
                  </a>
                  <p className="grotesk-regular apply-card-note">
                    Nigerian firms take speculative applications year round. Send your CV and a
                    short cover letter to{' '}
                    <a href={'mailto:' + firm.email} className="apply-card-mail">{firm.email}</a>.
                  </p>
                </>
              )}

              {firm.website && (
                <a href={firm.website} target="_blank" rel="noopener noreferrer" className="apply-card-link">
                  <GlobeIcon /> Visit website
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Somewhere to go next. Without it the page is a cul-de-sac: read the
            profile, then back-button. Uses only data already in the directory,
            so nothing here is invented. */}
        {related.length > 0 && (
          <div style={{ borderTop: '0.5px solid var(--cream-border)' }}>
            <div style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto', padding: '2.5rem 2rem 3.5rem' }}>
              <p className="firm-profile-section-heading">Similar firms</p>
              <div className="firm-related">
                {related.map(f => (
                  <Link key={f.slug} href={`/firms/${f.slug}`} className="firm-related-card">
                    <span className="grotesk-bold firm-related-name">{f.name}</span>
                    <span className="grotesk-regular firm-related-meta">
                      {f.tier} · {f.offices.map(o => o.city).join(' · ')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

