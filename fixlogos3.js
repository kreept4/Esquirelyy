const fs = require('fs');
let data = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Add missing logoFile entries
const missing = [
  { slug: 'udo-udoma', file: 'udo-udoma.webp' },
  { slug: 'jackson-etti', file: 'Jackson etti.png' },
  { slug: 'aina-blankson', file: 'aina blankson.jpg' },
  { slug: 'punuka', file: 'punuka.png' },
];

missing.forEach(({ slug, file }) => {
  if (!data.includes(`logoFile`) || data.indexOf(`'${slug}'`) > -1) {
    data = data.replace(
      `slug: '${slug}',`,
      `slug: '${slug}',\n    logoFile: '${file}',`
    );
  }
});

// Fix perchstone filename
data = data.replace("logoFile: 'perchstone.jpg'", "logoFile: 'perchstone.jpg'");

fs.writeFileSync('src/lib/firms-data.ts', data);
console.log('data fixed');

// Fix padding - 0 padding, contain, white bg
let page = fs.readFileSync('src/app/firms/page.tsx', 'utf8');
page = page.replace(
  /style=\{\{ objectFit: '[^']*', width: '[^']*', height: '[^']*'(?:, padding: '[^']*')?(?:, backgroundColor: '[^']*')? \}\}/g,
  "style={{ objectFit: 'contain', width: '100%', height: '100%' }}"
);
// Set container background to white when logo loads
page = page.replace(
  "backgroundColor: url ? '#FFFFFF' : '#8B3A3A',",
  "backgroundColor: '#FFFFFF',"
);
// Use border to separate from background  
fs.writeFileSync('src/app/firms/page.tsx', page);
console.log('page fixed');