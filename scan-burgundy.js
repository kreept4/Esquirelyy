const fs = require('fs');
const path = require('path');

const exts = ['.tsx', '.ts', '.css'];
const results = {};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(full, 'utf8');
      // Match any hex resembling burgundy family + literal word "burgundy"
      const matches = content.match(/#[0-9A-Fa-f]{6}|burgundy/gi) || [];
      for (const m of matches) {
        const key = m.toLowerCase();
        if (!results[key]) results[key] = new Set();
        results[key].add(full);
      }
    }
  }
}

walk('src');

// Only show hex codes in the red/maroon range (R high, G/B low-mid) + any "burgundy" hits
const burgundyRange = [];
for (const [color, files] of Object.entries(results)) {
  if (color === 'burgundy') { burgundyRange.push([color, files]); continue; }
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0,2), 16);
  const g = parseInt(hex.slice(2,4), 16);
  const b = parseInt(hex.slice(4,6), 16);
  if (r > 100 && r > g + 30 && r > b + 20 && g < 100 && b < 100) burgundyRange.push([color, files]);
}

console.log(`Found ${burgundyRange.length} burgundy-family values:\n`);
for (const [color, files] of burgundyRange) {
  console.log(`${color} — ${files.size} file(s):`);
  for (const f of files) console.log(`  ${f}`);
}