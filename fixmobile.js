const fs = require('fs');

// Fix 1: Job detail page — responsive two-column grid
let detail = fs.readFileSync('src/app/jobs/[slug]/page.tsx', 'utf8');
detail = detail.replace(
  "display: 'grid', gridTemplateColumns: '1fr min(280px, 35%)', gap: '3rem', alignItems: 'start'",
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', alignItems: 'start'"
);
detail = detail.replace(
  "position: 'sticky' as const, top: '96px'",
  "position: 'relative' as const, top: 'auto'"
);
fs.writeFileSync('src/app/jobs/[slug]/page.tsx', detail);
console.log('job detail fixed');

// Fix 2: Homepage — paddingTop 64px -> 80px
let home = fs.readFileSync('src/app/page.tsx', 'utf8');
home = home.replace(
  "style={{ paddingTop: '64px' }}",
  "style={{ paddingTop: '80px' }}"
);
fs.writeFileSync('src/app/page.tsx', home);
console.log('homepage padding fixed');

// Fix 3: Jobs page — bookmark/chevron row on mobile
let jobs = fs.readFileSync('src/app/jobs/page.tsx', 'utf8');
jobs = jobs.replace(
  "display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0",
  "display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginTop: '0'"
);
fs.writeFileSync('src/app/jobs/page.tsx', jobs);
console.log('jobs page fixed');