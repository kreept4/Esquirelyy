const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Add useState for dropdown
c = c.replace(
  "  const [open, setOpen] = useState(false)",
  "  const [open, setOpen] = useState(false)\n  const [toolsOpen, setToolsOpen] = useState(false)"
);

// Add AI_TOOLS array after NAV_LINKS
c = c.replace(
  "const NAV_LINKS = [\n  { href: '/jobs', label: 'Jobs' },\n  { href: '/opportunities', label: 'Opportunities' },\n  { href: '/firms', label: 'Firms' },\n  { href: '/scholarships', label: 'Scholarships' },\n  { href: '/tracker', label: 'Tracker' },\n]",
  "const NAV_LINKS = [\n  { href: '/jobs', label: 'Jobs' },\n  { href: '/opportunities', label: 'Opportunities' },\n  { href: '/firms', label: 'Firms' },\n  { href: '/scholarships', label: 'Scholarships' },\n  { href: '/tracker', label: 'Tracker' },\n]\n\nconst AI_TOOLS = [\n  { href: '/tools/cv-review', label: 'CV Review', description: 'Get honest, specific feedback on your CV' },\n]"
);

// Insert AI Tools dropdown into desktop nav, right after the NAV_LINKS map
const oldDesktopNav = `          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: pathname === href ? '#8B3A3A' : '#4A4A4A', textDecoration: 'none', position: 'relative', display: 'inline-block', transition: 'color 0.2s ease' }}>
                {label}
                {pathname === href && (
                  <svg viewBox="0 0 60 8" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-5px', left: '-2px', width: 'calc(100% + 4px)', height: '6px' }}>
                    <path d="M2,5 Q10,1 20,4 Q35,7 45,3 Q52,1 58,4" stroke="#8B3A3A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </Link>
            ))}
          </div>`;

const newDesktopNav = `          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: pathname === href ? '#8B3A3A' : '#4A4A4A', textDecoration: 'none', position: 'relative', display: 'inline-block', transition: 'color 0.2s ease' }}>
                {label}
                {pathname === href && (
                  <svg viewBox="0 0 60 8" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-5px', left: '-2px', width: 'calc(100% + 4px)', height: '6px' }}>
                    <path d="M2,5 Q10,1 20,4 Q35,7 45,3 Q52,1 58,4" stroke="#8B3A3A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </Link>
            ))}

            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: AI_TOOLS.some(t => pathname === t.href) ? '#8B3A3A' : '#4A4A4A', cursor: 'pointer', display: 'inline-block', transition: 'color 0.2s ease' }}>
                AI Tools
              </span>
              {toolsOpen && (
                <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FAF6F0', border: '0.5px solid #E8E0D5', minWidth: '240px', padding: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                  {AI_TOOLS.map(({ href, label, description }) => (
                    <Link
                      key={href}
                      href={href}
                      style={{ display: 'block', padding: '0.65rem 0.75rem', textDecoration: 'none', borderRadius: '2px' }}
                    >
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '2px' }}>{label}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#4A4A4A', lineHeight: 1.4 }}>{description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>`;

c = c.replace(oldDesktopNav, newDesktopNav);

// Add AI Tools links to mobile menu, right after NAV_LINKS map there
const oldMobileNav = `            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: pathname === href ? '#8B3A3A' : '#1A1A1A', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '0.5px solid #E8E0D5' }} />`;

const newMobileNav = `            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: pathname === href ? '#8B3A3A' : '#1A1A1A', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            {AI_TOOLS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: pathname === href ? '#8B3A3A' : '#1A1A1A', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            <hr style={{ border: 'none', borderTop: '0.5px solid #E8E0D5' }} />`;

c = c.replace(oldMobileNav, newMobileNav);

fs.writeFileSync('src/components/layout/Navbar.tsx', c);
console.log('done');