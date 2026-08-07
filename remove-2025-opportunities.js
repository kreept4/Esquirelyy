const fs = require('fs');
const path = 'src/lib/opportunities-data.ts';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

// Match each object entry block: from a 2-space-indented { to the matching 2-space-indented },
const blockPattern = /  \{\n[\s\S]*?\n  \},\n/g;
const blocks = content.match(blockPattern);

if (!blocks) throw new Error('no entry blocks matched — check file formatting');

let removed = 0;
let kept = 0;
let newContent = content;

for (const block of blocks) {
  if (/deadline: '2025-/.test(block)) {
    newContent = newContent.replace(block, '');
    removed++;
  } else {
    kept++;
  }
}

console.log(`Found ${blocks.length} entries total`);
console.log(`Removing ${removed} entries with 2025 deadlines`);
console.log(`Keeping ${kept} entries`);

if (eol === '\r\n') newContent = newContent.replace(/\n/g, '\r\n');
fs.writeFileSync(path, newContent, 'utf8');
console.log('✓ opportunities-data.ts updated');