const fs = require('fs');
let c = fs.readFileSync('src/app/tracker/page.tsx', 'utf8');

c = c.replace('placeholder="30 Jun 2025 or Rolling"', 'placeholder="e.g. 30 Sep or Rolling"');
c = c.replace('placeholder="e.g. Templars"', 'placeholder="e.g. Banwo & Ighodalo"');

fs.writeFileSync('src/app/tracker/page.tsx', c);
console.log('done');