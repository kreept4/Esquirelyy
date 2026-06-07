const fs = require('fs');
let data = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Add missing logoFiles using correct slugs
const toAdd = [
  { slug: 'udo-udoma-bello-osagie', file: 'udo-udoma.webp' },
  { slug: 'jackson-etti-edu', file: 'Jackson etti.png' },
  { slug: 'ajumogobia-okeke', file: 'ajumogbia.jpg' },
];

toAdd.forEach(({ slug, file }) => {
  const slugLine = `slug: '${slug}',`;
  if (data.includes(slugLine) && !data.includes(`slug: '${slug}',\n    logoFile`)) {
    data = data.replace(slugLine, `${slugLine}\n    logoFile: '${file}',`);
    console.log('added:', slug, '->', file);
  } else {
    console.log('skipped:', slug, '(already has logoFile or not found)');
  }
});

fs.writeFileSync('src/lib/firms-data.ts', data);
console.log('done');