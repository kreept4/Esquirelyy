const fs = require('fs');
const path = 'src/app/globals.css';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

const old = `  .animate-ticker {
    animation-duration: 16s !important;
  }`;
const replacement = `  .animate-ticker {
    animation-duration: 12s !important;
  }`;

if (!content.includes(old)) throw new Error('16s block not matched');
content = content.replace(old, replacement);

if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('✓ globals.css: mobile ticker set to 12s');