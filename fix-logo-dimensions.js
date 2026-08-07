const fs = require('fs');
const path = 'src/app/page.tsx';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

const old = `                <img
                  src={src}
                  alt={firm.shortName}
                  className="h-[42px] w-auto object-contain"
                />`;

const replacement = `                <img
                  src={src}
                  alt={firm.shortName}
                  width={140}
                  height={42}
                  className="h-[42px] w-auto object-contain"
                />`;

if (!content.includes(old)) throw new Error('logo img block not matched');
content = content.replace(old, replacement);

if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('✓ page.tsx: logo images now reserve layout space (width/height attrs)');