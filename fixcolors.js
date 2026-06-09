const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NAVY = '#0A2342';
const RED = '#8B3A3A';
const NAVY_OPACITY = {
  '0.05': 'rgba(139,58,58,0.05)',
  '0.06': 'rgba(139,58,58,0.06)',
  '0.07': 'rgba(139,58,58,0.07)',
  '0.08': 'rgba(139,58,58,0.08)',
  '0.1': 'rgba(139,58,58,0.1)',
  '0.12': 'rgba(139,58,58,0.12)',
  '0.15': 'rgba(139,58,58,0.15)',
  '0.18': 'rgba(139,58,58,0.18)',
  '0.2': 'rgba(139,58,58,0.2)',
  '0.25': 'rgba(139,58,58,0.25)',
  '0.3': 'rgba(139,58,58,0.3)',
  '0.35': 'rgba(139,58,58,0.35)',
  '0.4': 'rgba(139,58,58,0.4)',
  '0.45': 'rgba(139,58,58,0.45)',
  '0.5': 'rgba(139,58,58,0.5)',
  '0.5)': 'rgba(139,58,58,0.5)',
  '0.55': 'rgba(139,58,58,0.55)',
  '0.6': 'rgba(139,58,58,0.6)',
  '0.65': 'rgba(139,58,58,0.65)',
  '0.7': 'rgba(139,58,58,0.7)',
  '0.75': 'rgba(139,58,58,0.75)',
  '0.8': 'rgba(139,58,58,0.8)',
  '0.85': 'rgba(139,58,58,0.85)',
  '0.9': 'rgba(139,58,58,0.9)',
  '0.96': 'rgba(139,58,58,0.96)',
};

const EXTENSIONS = ['.tsx', '.ts', '.css', '.js'];
const EXCLUDE_FILES = ['fixcolors.js', 'writefirmsdata.js', 'writeslug.js', 'writefirmspage.js', 'tailwind.config.js'];

function getAllFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (['node_modules', '.git', '.next', 'out'].includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...getAllFiles(full));
    } else if (EXTENSIONS.includes(path.extname(item)) && !EXCLUDE_FILES.includes(item)) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllFiles('.');
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace exact navy hex
  content = content.split('#0A2342').join('#8B3A3A');
  content = content.split('#0a2342').join('#8B3A3A');

  // Replace rgba navy variants
  for (const [opacity, replacement] of Object.entries(NAVY_OPACITY)) {
    content = content.split(`rgba(10, 35, 66, ${opacity}`).join(`rgba(139, 58, 58, ${opacity}`);
    content = content.split(`rgba(10,35,66,${opacity}`).join(`rgba(139,58,58,${opacity}`);
  }

  // Replace opacity/ink Tailwind classes that reference navy
  content = content.split('text-[#0A2342]').join('text-ink');
  content = content.split('bg-[#0A2342]').join('bg-ink');
  content = content.split('border-[#0A2342]').join('border-ink');

  if (content !== original) {
    fs.writeFileSync(file, content);
    const count = (original.split('#0A2342').length - 1) + (original.split('#0a2342').length - 1);
    totalReplacements += count;
    console.log(`Fixed: ${file} (${count} replacements)`);
  }
}

console.log(`\nTotal files changed. Total navy instances replaced: ${totalReplacements}`);
console.log('Navy #0A2342 -> Brand red #8B3A3A complete.');