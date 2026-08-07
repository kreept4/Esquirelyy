const fs = require('fs');
const path = 'src/app/globals.css';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

const anchor = `  .animate-ticker span {
    font-size: 0.75rem !important;
  }`;

const replacement = `  .animate-ticker span {
    font-size: 0.75rem !important;
  }

  .animate-ticker {
    animation-duration: 16s !important;
  }`;

if (!content.includes(anchor)) throw new Error('mobile ticker block not matched');
content = content.replace(anchor, replacement);

if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('✓ globals.css: mobile ticker speed set to 16s (was inheriting 35s)');