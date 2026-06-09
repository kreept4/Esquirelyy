const fs = require('fs');

// Fix 1: firms/page.tsx — objectFit contain, remove ShieldCheckIcon verified badge icon
let firms = fs.readFileSync('src/app/firms/page.tsx', 'utf8');
firms = firms.replace(
  "style={{ objectFit: 'contain', width: '100%', height: '100%' }}",
  "style={{ objectFit: 'contain', width: '80%', height: '80%' }}"
);
firms = firms.replace(
  /<span style=\{\{[\s\S]*?display: 'inline-flex'[\s\S]*?ShieldCheckIcon[\s\S]*?<\/span>/,
  `<span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D6A4F' }}>Verified</span>`
);
fs.writeFileSync('src/app/firms/page.tsx', firms);
console.log('firms/page.tsx done');

// Fix 2: firms/[slug]/page.tsx — objectFit contain, unify CTA buttons
let slug = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');
slug = slug.replace(
  "style={{ objectFit: 'cover', width: '100%', height: '100%' }}",
  "style={{ objectFit: 'contain', width: '80%', height: '80%' }}"
);
// Replace colored direct application block with plain bordered card
slug = slug.replace(
  "<div style={{ backgroundColor: '#8B3A3A', borderRadius: '3px', padding: '1.5rem' }}>",
  "<div style={{ border: '0.5px solid #E8E0D5', borderRadius: '3px', padding: '1.5rem' }}>"
);
slug = slug.replace(
  "color: 'rgba(250,247,242,0.5)', marginBottom: '0.5rem' }}>\n                  Direct Application",
  "color: '#8B3A3A', opacity: 0.6, marginBottom: '0.5rem' }}>\n                  Direct Application"
);
slug = slug.replace(
  "fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1rem', fontWeight: 600, color: '#FAF7F2'",
  "fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1rem', fontWeight: 600, color: '#1A1A1A'"
);
slug = slug.replace(
  "color: '#FAF7F2', border: '0.5px solid rgba(250,247,242,0.3)'",
  "color: '#8B3A3A', border: '0.5px solid #E8E0D5'"
);
// Replace btn-primary on View Open Roles with ink-colored inline style
slug = slug.replace(
  'className="btn-primary" style={{ display: \'block\', textAlign: \'center\' as const }}>\n                        View open roles',
  'style={{ display: \'block\', textAlign: \'center\' as const, padding: \'0.65rem\', fontFamily: \'DM Sans, sans-serif\', fontSize: \'0.75rem\', fontWeight: 700, letterSpacing: \'0.1em\', textTransform: \'uppercase\', color: \'#FAF7F2\', backgroundColor: \'#8B3A3A\', textDecoration: \'none\', borderRadius: \'2px\' }}>\n                        View open roles'
);
slug = slug.replace(
  'className="btn-outline" style={{ display: \'block\', textAlign: \'center\' as const }}>\n                        Set firm alert',
  'style={{ display: \'block\', textAlign: \'center\' as const, padding: \'0.65rem\', fontFamily: \'DM Sans, sans-serif\', fontSize: \'0.75rem\', fontWeight: 700, letterSpacing: \'0.1em\', textTransform: \'uppercase\', color: \'#8B3A3A\', backgroundColor: \'transparent\', border: \'0.5px solid #8B3A3A\', textDecoration: \'none\', borderRadius: \'2px\' }}>\n                        Set firm alert'
);
fs.writeFileSync('src/app/firms/[slug]/page.tsx', slug);
console.log('firms/[slug]/page.tsx done');