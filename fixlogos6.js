const fs = require('fs');

// Fix Detail Solicitors filename
let data = fs.readFileSync('src/lib/firms-data.ts', 'utf8');
data = data.replace("logoFile: 'Detail.jpg'", "logoFile: 'detail solicitors.jpg'");
fs.writeFileSync('src/lib/firms-data.ts', data);
console.log('filename fixed');

// Fix zoom - use 100% for most, 110% is a good middle ground
let page = fs.readFileSync('src/app/firms/page.tsx', 'utf8');
page = page.replace(
  "style={{ objectFit: 'contain', width: '120%', height: '120%', maxWidth: '120%' }}",
  "style={{ objectFit: 'contain', width: '100%', height: '100%' }}"
);
fs.writeFileSync('src/app/firms/page.tsx', page);
console.log('done');