const fs = require('fs');
let d = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

const mappings = [
  { slug: 'spa-ajibade', file: 'SPA ajibade.jpg' },
  { slug: 'acas-law', file: 'ACAS.jpg' },
  { slug: 'wole-olanipekun', file: 'wole olanipekun.jpg' },
  { slug: 'bloomfield-law', file: 'bloomfield-law.ico' },
  { slug: 'simmons-cooper', file: 'simmons-cooper.png' },
  { slug: 'george-etomi', file: 'george-etomi.jpg' },
  { slug: 'tayo-oyetibo', file: 'Tayo Oyetibo.jpg' },
  { slug: 'primera-africa', file: 'Primera.jpg' },
  { slug: 'famsville-solicitors', file: 'Famsville.jpg' },
  { slug: 'mike-igbokwe', file: 'mike-igbokwe.jpg' },
  { slug: 'blackfriars-law', file: 'blackfriars-law.jpg' },
];

mappings.forEach(({ slug, file }) => {
  const target = `slug: '${slug}',`;
  if (d.includes(target) && !d.includes(`slug: '${slug}',\n    logoFile`)) {
    d = d.replace(target, `${target}\n    logoFile: '${file}',`);
    console.log(`wired: ${slug} -> ${file}`);
  } else if (d.includes(target)) {
    console.log(`skipped (already has logo): ${slug}`);
  } else {
    console.log(`NOT FOUND: ${slug}`);
  }
});

fs.writeFileSync('src/lib/firms-data.ts', d);
console.log('\ndone');