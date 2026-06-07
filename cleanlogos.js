const fs = require('fs');
let c = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Step 1: Remove ALL logoFile lines
const lines = c.split('\n').filter(l => !l.trim().startsWith('logoFile:'));
c = lines.join('\n');

// Step 2: Insert one logoFile per firm slug
const logos = {
  'olaniwun-ajayi': 'olaniwun-ajayi.jpg',
  'banwo-ighodalo': 'banwo-ighodalo.jpg',
  'aluko-oyebode': 'aluko-oyebode.jpg',
  'kenna-partners': 'kenna-partners.png',
  'templars': 'templars.jpg',
  'aelex': 'aelex.jpg',
  'udo-udoma': 'udo-udoma.webp',
  'streamsowers': 'streamsowers.jpg',
  'streamsowers-kohn': 'streamsowers.jpg',
  'detail-solicitors': 'Detail.jpg',
  'perchstone-graeys': 'perchstone.jpg',
  'g-elias': 'G elias.jpg',
  'jackson-etti': 'Jackson etti.png',
  'olajide-oyewole': 'olajide oyewole.jpg',
  'punuka': 'punuka.png',
  'aina-blankson': 'aina blankson.jpg',
  'ajumogobia-okeke': 'ajumogbia.jpg',
};

Object.entries(logos).forEach(([slug, file]) => {
  c = c.replace(`slug: '${slug}',`, `slug: '${slug}',\n    logoFile: '${file}',`);
});

fs.writeFileSync('src/lib/firms-data.ts', c);
console.log('done');