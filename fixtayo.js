const fs = require('fs');
const lines = fs.readFileSync('src/lib/firms-data.ts', 'utf8').split('\n');
let inTayo = false, logoCount = 0;
const result = [];
for (const line of lines) {
  if (line.includes("slug: 'tayo-oyetibo'")) inTayo = true;
  if (inTayo && line.includes("slug: '") && !line.includes('tayo-oyetibo')) inTayo = false;
  if (inTayo && line.trim().startsWith('logoFile:')) {
    logoCount++;
    if (logoCount === 1) result.push("    logoFile: 'TayoOyetibo.jpg',");
    continue;
  }
  result.push(line);
}
fs.writeFileSync('src/lib/firms-data.ts', result.join('\n'));
console.log('done');