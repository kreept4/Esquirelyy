const fs = require('fs');
let data = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Fix wrong filenames to match exact Supabase Storage names
data = data.replace("logoFile: 'udo-udoma.webpp'", "logoFile: 'udo-udoma.webp'");
data = data.replace("logoFile: 'G elias.jpg'", "logoFile: 'Elias.jpeg'");
data = data.replace("logoFile: 'Detail.jpg'", "logoFile: 'Detail.jpg'");

fs.writeFileSync('src/lib/firms-data.ts', data);
console.log('done');