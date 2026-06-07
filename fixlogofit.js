const fs = require('fs');

let page = fs.readFileSync('src/app/firms/page.tsx', 'utf8');
page = page.replace(
  `style={{ objectFit: 'cover', width: '100%', height: '100%' }}`,
  `style={{ objectFit: 'contain', width: '80%', height: '80%' }}`
);
fs.writeFileSync('src/app/firms/page.tsx', page);

let card = fs.readFileSync('src/components/features/FirmCard.tsx', 'utf8');
card = card.replace(
  `style={{ objectFit: 'cover', width: '100%', height: '100%' }}`,
  `style={{ objectFit: 'contain', width: '80%', height: '80%' }}`
);
fs.writeFileSync('src/components/features/FirmCard.tsx', card);

console.log('done');
