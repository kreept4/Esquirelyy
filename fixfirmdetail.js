const fs = require('fs');
let c = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');

// 1. Fix header background to white for more presence
c = c.replace(
  "{ backgroundColor: '#F0EBE3', borderBottom: '0.5px solid #E8E0D5', padding: '3rem 2rem' }",
  "{ backgroundColor: '#FFFFFF', borderBottom: '0.5px solid #E8E0D5', padding: '3rem 2rem' }"
);

// 2. Fix logo size — bigger, better proportioned
c = c.replace(
  "width: '72px', height: '72px', flexShrink: 0,\n        backgroundColor: '#8B3A3A', color: '#FAF7F2',\n        display: 'flex', alignItems: 'center', justifyContent: 'center',\n        fontFamily: 'Playfair Display, Georgia, serif',\n        fontWeight: 700, fontSize: '1.35rem', borderRadius: '3px',",
  "width: '88px', height: '88px', flexShrink: 0,\n        backgroundColor: '#8B3A3A', color: '#FAF7F2',\n        display: 'flex', alignItems: 'center', justifyContent: 'center',\n        fontFamily: 'Playfair Display, Georgia, serif',\n        fontWeight: 700, fontSize: '1.5rem', borderRadius: '3px',"
);

c = c.replace(
  "width: '72px', height: '72px', flexShrink: 0,\n      backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',\n      display: 'flex', alignItems: 'center', justifyContent: 'center',\n      borderRadius: '3px', overflow: 'hidden',",
  "width: '88px', height: '88px', flexShrink: 0,\n      backgroundColor: '#FFFFFF', border: '0.5px solid #E8E0D5',\n      display: 'flex', alignItems: 'center', justifyContent: 'center',\n      borderRadius: '3px', overflow: 'hidden',"
);

c = c.replace(
  "style={{ objectFit: 'contain', width: '80%', height: '80%' }}",
  "style={{ objectFit: 'contain', width: '85%', height: '85%' }}"
);

// 3. Replace heavy burgundy pill badge with plain text badge
c = c.replace(
  `                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      backgroundColor: '#8B3A3A', color: '#FAF7F2',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem',
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                      padding: '2px 8px', borderRadius: '2px',`,
  `                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem',
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                      color: '#8B3A3A',`
);

// 4. Increase section label opacity in cards
c = c.replace(/color: '#8B3A3A', opacity: 0\.6/g, "color: '#8B3A3A'");

// 5. Align logo and content vertically centered in header
c = c.replace(
  "display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' as const",
  "display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' as const"
);

fs.writeFileSync('src/app/firms/[slug]/page.tsx', c);
console.log('done');