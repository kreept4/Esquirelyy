const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

const oldDropdownBody = `              {toolsOpen && (
                <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FAF6F0', border: '0.5px solid #E8E0D5', minWidth: '240px', padding: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 200, paddingTop: '14px' }}>
                  {AI_TOOLS.map(({ href, label, description }) => (
                    <Link key={href} href={href} onClick={() => setToolsOpen(false)} style={{ display: 'block', padding: '0.65rem 0.75rem', textDecoration: 'none', borderRadius: '2px', cursor: 'pointer', pointerEvents: 'auto' }}>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '2px' }}>{label}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', lineHeight: 1.4 }}>{description}</p>
                    </Link>
                  ))}
                </div>
              )}`;

const newDropdownBody = `              {toolsOpen && (
                <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FAF6F0', border: '0.5px solid #E8E0D5', minWidth: '260px', padding: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 200, paddingTop: '20px' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A89A8A', padding: '0 0.65rem 0.5rem' }}>Career Tools</p>
                  {AI_TOOLS.map(({ href, label, description }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.65rem',
                        textDecoration: 'none',
                        borderRadius: '2px',
                        borderLeft: '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#F0EBE3'
                        e.currentTarget.style.borderLeftColor = '#8B3A3A'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderLeftColor = 'transparent'
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '1px' }}>{label}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: '#4A4A4A', lineHeight: 1.3 }}>{description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}`;

c = c.replace(oldDropdownBody, newDropdownBody);

fs.writeFileSync('src/components/layout/Navbar.tsx', c);
console.log('done');