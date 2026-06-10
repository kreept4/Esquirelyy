const fs = require('fs');
let c = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');

// Fix header layout - logo and content side by side properly
const oldHeader = `            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' as const }}>
              <FirmAvatar logoFile={firm!.logoFile} name={firm!.name} />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' as const }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#8B3A3A', opacity: 0.6 }}>
                    {firm!.tier}
                  </span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>
                    Verified
                  </span>
                  {firm!.openRoles > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem',
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                      color: '#8B3A3A',
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
            </div>`;

const newHeader = `            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
              <div style={{ flexShrink: 0, paddingTop: '4px' }}>
                <FirmAvatar logoFile={firm!.logoFile} name={firm!.name} />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' as const }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#8B3A3A' }}>
                    {firm!.tier}
                  </span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>
                    Verified
                  </span>
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
            </div>`;

c = c.replace(oldHeader, newHeader);

// Remove the Open Roles card entirely - replace with empty fragment
const openRolesCard = `              <div style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#8B3A3A', opacity: 0.6 }}>Open Roles</p>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {firm!.openRoles > 0 ? (
                    <>
                      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1, marginBottom: '0.25rem' }}>{firm!.openRoles}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#4A4A4A', marginBottom: '1.25rem' }}>open position{firm!.openRoles !== 1 ? 's' : ''} at this firm</p>
                      <Link href={\`/jobs?firm=\${firm!.slug}\`} style={{ display: 'block', textAlign: 'center' as const, padding: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FAF7F2', backgroundColor: '#8B3A3A', textDecoration: 'none', borderRadius: '2px' }}>
                        View open roles
                      </Link>
                    </>
                  ) : (
                    <>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: '#4A4A4A', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                        No active listings right now. Set an alert to be notified when they post.
                      </p>
                      <Link href="/auth/login" style={{ display: 'block', textAlign: 'center' as const, padding: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B3A3A', backgroundColor: 'transparent', border: '0.5px solid #8B3A3A', textDecoration: 'none', borderRadius: '2px' }}>
                        Set firm alert
                      </Link>
                    </>
                  )}
                </div>
              </div>

              `;

c = c.replace(openRolesCard, '              ');

fs.writeFileSync('src/app/firms/[slug]/page.tsx', c);
console.log('done');