const fs = require('fs');
let c = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Remove all duplicate logoFile lines - keep only the first occurrence per firm block
const lines = c.split('\n');
const seen = new Set();
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim().startsWith('logoFile:')) {
    // Find which firm this belongs to by looking back for the slug
    let slugLine = '';
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].trim().startsWith('slug:')) {
        slugLine = lines[j];
        break;
      }
    }
    const key = slugLine + line;
    if (seen.has(key)) {
      continue; // skip duplicate
    }
    seen.add(key);
  }
  result.push(line);
}

fs.writeFileSync('src/lib/firms-data.ts', result.join('\n'));
console.log('done - lines before:', lines.length, 'after:', result.length);