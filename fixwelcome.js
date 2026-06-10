const fs = require('fs');
let c = fs.readFileSync('src/app/auth/welcome/page.tsx', 'utf8');
c = c.replace(
  "await supabase.from('profiles').upsert({",
  "await (supabase as any).from('profiles').upsert({"
);
fs.writeFileSync('src/app/auth/welcome/page.tsx', c);
console.log('done');