const fs = require('fs');
let c = fs.readFileSync('src/app/HomeIcons.tsx', 'utf8');
const lines = c.split('\n');

// Remove all broken lines and rebuild the top cleanly
const iconsStart = lines.findIndex(l => l.includes('const icons:'));
const goodLines = lines.slice(iconsStart);

const newContent = [
  "'use client'",
  "",
  "export default function HomeIcons({ type }: { type: string }) {",
  "  if (type === 'hero') return (<img src='/job-hunt-hero.svg' alt='Legal career illustration' className='w-full max-w-lg' />)",
  "",
  ...goodLines
].join('\n');

fs.writeFileSync('src/app/HomeIcons.tsx', newContent);
console.log('done');