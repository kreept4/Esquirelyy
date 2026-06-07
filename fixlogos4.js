const fs = require('fs');
let data = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Check and fix all problem filenames
data = data.replace("logoFile: 'Detail.jpg'", "logoFile: 'Detail.jpg'");

// Force correct entries for the missing ones - remove then re-add
const toFix = [
  { slug: 'udo-udoma', file: 'udo-udoma.webp' },
  { slug: 'jackson-etti', file: 'Jackson etti.png' },
  { slug: 'detail-solicitors', file: 'Detail.jpg' },
];

toFix.forEach(({ slug, file }) => {
  // Remove any existing logoFile for this slug
  const slugIdx = data.indexOf(`slug: '${slug}'`);
  if (slugIdx === -1) {
    console.log('slug not found:', slug);
    return;
  }
  const nextSlugIdx = data.indexOf("slug: '", slugIdx + 10);
  const block = data.slice(slugIdx, nextSlugIdx === -1 ? slugIdx + 500 : nextSlugIdx);
  const hasLogo = block.includes('logoFile');
  console.log(slug, '- has logoFile:', hasLogo, '- block preview:', block.slice(0, 80));
  
  if (!hasLogo) {
    data = data.replace(
      `slug: '${slug}',`,
      `slug: '${slug}',\n    logoFile: '${file}',`
    );
    console.log('added logoFile for', slug);
  }
});

fs.writeFileSync('src/lib/firms-data.ts', data);
console.log('data done');

// Fix zoom - use 120% size for zoomed-out logos
let page = fs.readFileSync('src/app/firms/page.tsx', 'utf8');
page = page.replace(
  "style={{ objectFit: 'contain', width: '100%', height: '100%' }}",
  "style={{ objectFit: 'contain', width: '120%', height: '120%', maxWidth: '120%' }}"
);
fs.writeFileSync('src/app/firms/page.tsx', page);
console.log('page done');