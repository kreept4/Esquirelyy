const fs = require('fs');
let c = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');

const idx = c.indexOf('FirmAvatar logoFile');
console.log('around FirmAvatar call:', c.slice(idx - 200, idx + 50));