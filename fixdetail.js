const fs = require('fs');
let d = fs.readFileSync('src/lib/firms-data.ts', 'utf8');
d = d.replace("slug: 'detail-solicitors',", "slug: 'detail-solicitors',\n    logoFile: 'Detail solicitors.jpg',");
fs.writeFileSync('src/lib/firms-data.ts', d);
console.log('done');