const fs = require('fs');
let c = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

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
  // Find "slug: 'slug-value'," and insert logoFile after the website line
  c = c.replace(
    new RegExp(`(slug: '${slug}')`),
    `$1,\n    logoFile: '${file}'`
  );
  // Clean up double commas if slug line already had one
  c = c.replace(`slug: '${slug}',,`, `slug: '${slug}',`);
});

fs.writeFileSync('src/lib/firms-data.ts', c);
console.log('done - logos injected:', Object.keys(logos).length);