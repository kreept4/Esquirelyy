const fs = require('fs');
let d = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');

// Fix View open roles link color
d = d.replace(
  `style={{ display: 'block', textAlign: 'center' as const, padding: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FAF7F2', backgroundColor: '#8B3A3A', textDecoration: 'none', borderRadius: '2px' }}>`,
  `style={{ display: 'block', textAlign: 'center' as const, padding: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#FAF7F2', backgroundColor: '#8B3A3A', textDecoration: 'none', borderRadius: '2px' }}>`
);

// Fix Set firm alert link color
d = d.replace(
  `style={{ display: 'block', textAlign: 'center' as const, padding: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B3A3A', backgroundColor: 'transparent', border: '0.5px solid #8B3A3A', textDecoration: 'none', borderRadius: '2px' }}>`,
  `style={{ display: 'block', textAlign: 'center' as const, padding: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#8B3A3A', backgroundColor: 'transparent', border: '0.5px solid #8B3A3A', textDecoration: 'none', borderRadius: '2px' }}>`
);

fs.writeFileSync('src/app/firms/[slug]/page.tsx', d);
console.log('done');