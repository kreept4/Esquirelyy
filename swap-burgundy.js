const fs = require('fs');
const path = require('path');

const exts = ['.tsx', '.ts', '.css'];

// Exact string replacements — case preserved as lowercase since that's how they appear
const replacements = {
  '#8b3a3a': '#1A1A1A',   // primary accent base -> ink
  '#b5451b': '#000000',   // accent hover/active -> darker than ink
  '#9c4444': '#4D4D4D',   // gradient step 1
  '#7a2e2e': '#262626',   // gradient step 2
  '#6b2727': '#0D0D0D',   // gradient step 3
};

// Untouched on purpose — do not add these:
// #ea4335 (Google G logo, login/signup)
// #7a3b00 (jobs featured tag)
// #8b5e1f (scholarships featured/deadline tag)
// #8b1a1a (tracker danger/overdue)
// #c44040 (tracker rejected)

let filesChanged = 0;
let totalReplacements = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.includes(path.extname(entry.name))) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [oldHex, newHex] of Object.entries(replacements)) {
        const regex = new RegExp(oldHex, 'gi');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newHex);
          totalReplacements += matches.length;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        filesChanged++;
        console.log(`Updated: ${full}`);
      }
    }
  }
}

walk('src');

console.log(`\n${filesChanged} file(s) changed, ${totalReplacements} replacement(s) made.`);
console.log('Untouched (intentional): #ea4335, #7a3b00, #8b5e1f, #8b1a1a, #c44040');