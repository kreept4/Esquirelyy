const fs = require('fs');
const path = 'src/app/page.tsx';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

const old = `        <div className="flex animate-ticker whitespace-nowrap py-6 items-center">`;
const replacement = `        <div className="flex animate-ticker whitespace-nowrap py-6 items-center" style={{ width: 'max-content' }}>`;

if (!content.includes(old)) throw new Error('ticker div not matched');
content = content.replace(old, replacement);

if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('✓ page.tsx: ticker row now sized to content, not viewport');