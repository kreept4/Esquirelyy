const fs = require('fs');
let data = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Correct all logoFile values to match exact Supabase Storage filenames
const fixes = {
  "'olaniwun-ajayi.jpg'": "'olaniwun-ajayi.jpg'",
  "'banwo-ighodalo.jpg'": "'banwo-ighodalo.jpg'",
  "'aluko-oyebode.jpg'": "'aluko-oyebode.jpg'",
  "'kenna-partners.png'": "'kenna-partners.png'",
  "'templars.jpg'": "'templars.jpg'",
  "'aelex.jpg'": "'aelex.jpg'",
  "'udo-udoma.webp'": "'udo-udoma.webp'",
  "'udo-udoma.webpp'": "'udo-udoma.webp'",
  "'streamsowers.jpg'": "'streamsowers.jpg'",
  "'streamsowers-kohn.jpg'": "'streamsowers.jpg'",
  "'Detail.jpg'": "'Detail.jpg'",
  "'G elias.jpg'": "'Elias.jpeg'",
  "'Jackson etti.png'": "'Jackson etti.png'",
  "'olajide oyewole.jpg'": "'olajide oyewole.jpg'",
  "'punuka.png'": "'punuka.png'",
  "'aina blankson.jpg'": "'aina blankson.jpg'",
  "'ajumogbia.jpg'": "'ajumogbia.jpg'",
};

Object.entries(fixes).forEach(([old, next]) => {
  data = data.split(old).join(next);
});

fs.writeFileSync('src/lib/firms-data.ts', data);
console.log('filenames fixed');

// Fix logo display - use contain with white bg, no padding
// This is the correct approach for logos
let page = fs.readFileSync('src/app/firms/page.tsx', 'utf8');
page = page.replace(
  /style=\{\{ objectFit: '[^']+', width: '[^']+', height: '[^']+' \}\}/g,
  "style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '8px', backgroundColor: '#FFFFFF' }}"
);
fs.writeFileSync('src/app/firms/page.tsx', page);
console.log('page fit fixed');