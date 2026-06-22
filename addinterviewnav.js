const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
c = c.replace(
  "  { href: '/tools/cover-letter', label: 'Cover Letter', description: 'Generate a cover letter that stands out' },\n]",
  "  { href: '/tools/cover-letter', label: 'Cover Letter', description: 'Generate a cover letter that stands out' },\n  { href: '/tools/interview-prep', label: 'Interview Prep', description: 'Practice answers and get honest feedback' },\n]"
);
fs.writeFileSync('src/components/layout/Navbar.tsx', c);
console.log('done');