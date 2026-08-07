const fs = require('fs');
const path = 'tailwind.config.js';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

const old = `      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },`;
const replacement = `      fontFamily: {
        serif: ['Space Mono', 'monospace'],
        sans: ['Space Mono', 'monospace'],
        mono: ['Space Mono', 'monospace'],
      },`;

if (!content.includes(old)) throw new Error('fontFamily block not matched');
content = content.replace(old, replacement);

if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('✓ tailwind.config.js: font-serif/font-sans/font-mono utilities now all resolve to Space Mono');