const fs = require('fs');
const path = 'src/app/globals.css';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

const old = `  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'DM Sans', system-ui, sans-serif;`;
const replacement = `  --font-serif: 'Space Mono', monospace;
  --font-sans: 'Space Mono', monospace;`;

if (!content.includes(old)) throw new Error('font variables not matched');
content = content.replace(old, replacement);

if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('✓ globals.css: --font-serif and --font-sans now both resolve to Space Mono');