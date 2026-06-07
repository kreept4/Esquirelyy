const fs = require('fs');

// Fix wrong filenames in firms-data
let data = fs.readFileSync('src/lib/firms-data.ts', 'utf8');
data = data.replace("logoFile: 'udo-udoma.webp'", "logoFile: 'udo-udoma.webpp'");
data = data.replace("logoFile: 'Jackson etti.png'", "logoFile: 'Jackson etti.png'"); // already correct
fs.writeFileSync('src/lib/firms-data.ts', data);

// Fix logo rendering in firms page - remove padding, use cover instead of contain
let page = fs.readFileSync('src/app/firms/page.tsx', 'utf8');
page = page.replace(
  `style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '6px' }}`,
  `style={{ objectFit: 'cover', width: '100%', height: '100%' }}`
);
page = page.replace(
  `style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '3px' }}`,
  `style={{ objectFit: 'cover', width: '100%', height: '100%' }}`
);
fs.writeFileSync('src/app/firms/page.tsx', page);

// Fix logo rendering in FirmCard
let card = fs.readFileSync('src/components/features/FirmCard.tsx', 'utf8');
card = card.replace(
  `style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '6px' }}`,
  `style={{ objectFit: 'cover', width: '100%', height: '100%' }}`
);
card = card.replace(
  `style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '3px' }}`,
  `style={{ objectFit: 'cover', width: '100%', height: '100%' }}`
);
fs.writeFileSync('src/components/features/FirmCard.tsx', card);

console.log('done');