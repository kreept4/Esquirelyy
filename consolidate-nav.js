const fs = require('fs');

function readNorm(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  return { content: raw.replace(/\r\n/g, '\n'), eol };
}
function writeNorm(path, content, eol) {
  fs.writeFileSync(path, eol === '\r\n' ? content.replace(/\n/g, '\r\n') : content, 'utf8');
}

// 1. Strip <Navbar /> + its import from all 11 pages
const pages = [
  'src/app/page.tsx',
  'src/app/firms/page.tsx',
  'src/app/firms/[slug]/page.tsx',
  'src/app/jobs/page.tsx',
  'src/app/jobs/[slug]/page.tsx',
  'src/app/opportunities/page.tsx',
  'src/app/scholarships/page.tsx',
  'src/app/tools/cover-letter/page.tsx',
  'src/app/tools/cv-review/page.tsx',
  'src/app/tools/interview-prep/page.tsx',
  'src/app/tracker/page.tsx',
];

for (const p of pages) {
  if (!fs.existsSync(p)) { console.log('SKIP (not found): ' + p); continue; }
  let { content, eol } = readNorm(p);
  const before = content;
  content = content.replace(/import Navbar from ['"]@\/components\/layout\/Navbar['"];?\n/g, '');
  content = content.replace(/\s*<Navbar\s*\/>\n?/g, '\n');
  if (content === before) {
    console.log('NO CHANGE (check manually): ' + p);
  } else {
    writeNorm(p, content, eol);
    console.log('✓ stripped Navbar from ' + p);
  }
}

// 2. Add Navbar to layout.tsx (global, single render point)
{
  let { content, eol } = readNorm('src/app/layout.tsx');
  if (!content.includes("import Navbar from")) {
    content = content.replace(
      "import './globals.css'",
      "import './globals.css'\nimport Navbar from '@/components/layout/Navbar'"
    );
  }
  if (!content.includes('<Navbar />')) {
    content = content.replace(
      '<body>\n        {children}',
      '<body>\n        <Navbar />\n        {children}'
    );
  }
  writeNorm('src/app/layout.tsx', content, eol);
  console.log('✓ layout.tsx wired to render Navbar globally');
}

// 3. Strip HeroNav entirely from HeroSection.tsx
{
  let { content, eol } = readNorm('src/app/HeroSection.tsx');

  // remove the HeroNav function block
  content = content.replace(
    /function HeroNav\([\s\S]*?\n}\n\n/,
    ''
  );

  // remove its usage
  content = content.replace(/\s*<HeroNav opacity={navOpacity} \/>\n/, '\n');

  // remove now-unused navOpacity line
  content = content.replace(/\s*const navOpacity = useTransform\(scrollYProgress, \[0, 0\.85, 1\], \[1, 1, 0\]\)\n/, '\n');

  writeNorm('src/app/HeroSection.tsx', content, eol);
  console.log('✓ HeroNav stripped from HeroSection.tsx');
}

console.log('DONE — now overwrite Navbar.tsx with the new version separately.');