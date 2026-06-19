const fs = require('fs');
const path = require('path');

function exists(p) {
  return fs.existsSync(p);
}

function checkFile(label, filePath, patterns = []) {
  if (!exists(filePath)) {
    console.log(`[MISSING] ${label} -> ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const size = content.length;
  let foundFlags = [];
  for (const p of patterns) {
    foundFlags.push(`${p.label}: ${content.includes(p.match) ? 'YES' : 'no'}`);
  }
  console.log(`[OK] ${label} (${size} chars) -> ${filePath}`);
  if (foundFlags.length) console.log('     ' + foundFlags.join(' | '));
}

console.log('=== ESQUIRELY AUDIT ===\n');

console.log('--- Core Pages ---');
checkFile('Homepage', 'src/app/page.tsx', [
  { label: 'supabase import', match: 'supabase' },
  { label: 'featured jobs query', match: 'jobs' },
]);
checkFile('Jobs listing page', 'src/app/jobs/page.tsx', [
  { label: 'supabase fetch', match: 'supabase' },
]);
checkFile('Jobs client component', 'src/app/jobs/JobsClient.tsx');
checkFile('Job detail page', 'src/app/jobs/[slug]/page.tsx', [
  { label: 'supabase fetch', match: 'supabase' },
  { label: 'ALL_LISTINGS static data', match: 'ALL_LISTINGS' },
]);
checkFile('Firms listing page', 'src/app/firms/page.tsx');
checkFile('Firm detail page', 'src/app/firms/[slug]/page.tsx', [
  { label: 'Open Roles card', match: 'Open Roles' },
  { label: 'badges above logo fix', match: 'auth-panel-mark' },
]);
checkFile('Firms data file', 'src/lib/firms-data.ts');
checkFile('Footer', 'src/components/layout/Footer.tsx', [
  { label: 'copyright encoding ok', match: '&copy;' },
  { label: 'bad encoding present', match: 'Â©' },
]);
checkFile('Scholarships page', 'src/app/scholarships/page.tsx');
checkFile('Application Tracker page', 'src/app/tracker/page.tsx');

console.log('\n--- Auth ---');
checkFile('Login page', 'src/app/auth/login/page.tsx', [
  { label: 'two-column auth-page class', match: 'auth-page' },
  { label: 'diagonal clip-path', match: 'clip-path' },
  { label: 'old AuthIllustration import', match: 'AuthIllustration' },
]);
checkFile('Signup page', 'src/app/auth/signup/page.tsx', [
  { label: 'two-column auth-page class', match: 'auth-page' },
  { label: 'diagonal clip-path', match: 'clip-path' },
]);
checkFile('Old AuthIllustration component', 'src/app/auth/AuthIllustration.tsx');
checkFile('Supabase client lib', 'src/lib/supabase/client.ts');
checkFile('Auth callback route', 'src/app/auth/callback/route.ts');
checkFile('Onboarding page', 'src/app/auth/onboarding/page.tsx');
checkFile('Forgot password page', 'src/app/auth/forgot-password/page.tsx');

console.log('\n--- Supabase / Data ---');
checkFile('Supabase server lib', 'src/lib/supabase/server.ts');
checkFile('Database types', 'src/types/database.ts');

console.log('\n--- AI / Adzuna ---');
checkFile('Adzuna fetch script', 'scripts/fetch-jobs.js');
checkFile('Adzuna GitHub Action', '.github/workflows/fetch-jobs.yml');

console.log('\n--- Env check (vercel project) ---');
checkFile('.env.local (local only, not in git)', '.env.local');

console.log('\n=== END AUDIT ===');