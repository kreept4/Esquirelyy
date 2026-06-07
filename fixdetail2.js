const fs = require('fs');
let d = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Remove ALL logoFile lines near detail-solicitors, then add one clean one
const lines = d.split('\n');
let inDetailBlock = false;
let logoFileCount = 0;
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("slug: 'detail-solicitors'")) inDetailBlock = true;
  if (inDetailBlock && line.includes("slug: '") && !line.includes('detail-solicitors')) inDetailBlock = false;
  
  if (inDetailBlock && line.trim().startsWith('logoFile:')) {
    logoFileCount++;
    if (logoFileCount === 1) result.push(line); // keep only first
    // skip duplicates
  } else {
    result.push(line);
  }
}

fs.writeFileSync('src/lib/firms-data.ts', result.join('\n'));
console.log('done - removed', logoFileCount - 1, 'duplicates');