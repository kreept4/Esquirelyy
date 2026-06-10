const fs = require('fs');
let d = fs.readFileSync('src/lib/firms-data.ts', 'utf8');
d = d.replace("slug: 'tayo-oyetibo',", "slug: 'tayo-oyetibo',\n    logoFile: 'tayo-oyetibo.jpg',");
fs.writeFileSync('src/lib/firms-data.ts', d);
console.log('done');