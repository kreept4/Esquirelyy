const fs = require('fs');

const files = [
  'src/app/FadeSection.tsx',
  'src/app/not-found.tsx',
  'src/app/auth/AuthIllustration.tsx',
  'src/app/auth/forgot-password/page.tsx',
  'src/app/auth/login/page.tsx',
  'src/app/auth/onboarding/page.tsx',
  'src/app/auth/signup/page.tsx',
  'src/app/firms/page.tsx',
  'src/app/firms/[slug]/page.tsx',
  'src/app/jobs/JobsClient.tsx',
  'src/app/jobs/[slug]/page.tsx',
  'src/app/opportunities/page.tsx',
  'src/app/scholarships/page.tsx',
  'src/app/tools/cover-letter/page.tsx',
  'src/app/tools/cv-review/page.tsx',
  'src/app/tools/interview-prep/page.tsx',
  'src/app/tracker/page.tsx',
  'src/components/features/FirmCard.tsx',
  'src/components/features/ListingCard.tsx',
  'src/components/layout/Footer.tsx',
];

let totalFixed = 0;

for (const p of files) {
  if (!fs.existsSync(p)) { console.log('SKIP (not found): ' + p); continue; }
  const raw = fs.readFileSync(p, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let content = raw.replace(/\r\n/g, '\n');

  const before = content;
  content = content.split(`'Space Mono', monospace`).join(`'Space Mono, monospace'`);

  if (content === before) {
    console.log('NO CHANGE: ' + p);
  } else {
    const count = (before.match(/'Space Mono', monospace/g) || []).length;
    totalFixed += count;
    if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
    fs.writeFileSync(p, content, 'utf8');
    console.log(`✓ ${p} — repaired ${count} broken reference(s)`);
  }
}

console.log('TOTAL REPAIRED: ' + totalFixed);