const fs = require('fs');
let c = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

const logoMap = {
  'olaniwun-ajayi': 'olaniwun-ajayi.jpg',
  'banwo-ighodalo': 'banwo-ighodalo.jpg',
  'aluko-oyebode': 'aluko-oyebode.jpg',
  'kenna-partners': 'kenna-partners.png',
  'templars': 'templars.jpg',
  'aelex': 'aelex.jpg',
  'udo-udoma': 'udo-udoma.webp',
  'streamsowers': 'streamsowers.jpg',
  'detail-solicitors': 'Detail.jpg',
  'perchstone-graeys': 'perchstone.jpg',
  'g-elias': 'G elias.jpg',
  'jackson-etti': 'Jackson etti.png',
  'olajide-oyewole': 'olajide oyewole.jpg',
  'punuka': 'punuka.png',
  'aina-blankson': 'aina blankson.jpg',
  'ajumogobia-okeke': 'ajumogbia.jpg',
  'streamsowers-kohn': 'streamsowers.jpg',
};

Object.entries(logoMap).forEach(([slug, file]) => {
  c = c.replace(
    new RegExp(`(slug: '${slug}',[\\s\\S]*?)(,\\n\\s*email:)`),
    `$1,\n    logoFile: '${file}'$2`
  );
});

fs.writeFileSync('src/lib/firms-data.ts', c);
console.log('done');