const fs = require('fs');
let d = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

const mappings = [
  { slug: 'tayo-oyetibo', file: 'Tayo Oyetibo.jpg' },
  { slug: 'dealhq-partners', file: 'dealhq-partners.jpg' },
  { slug: 'resolution-law', file: 'resolution-law.webp' },
];

mappings.forEach(({ slug, file }) => {
  const target = `slug: '${slug}',`;
  if (!d.includes(`logoFile: '${file}'`)) {
    d = d.replace(target, `${target}\n    logoFile: '${file}',`);
    console.log(`wired: ${slug} -> ${file}`);
  }
});

fs.writeFileSync('src/lib/firms-data.ts', d);
console.log('done');