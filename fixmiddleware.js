const fs = require('fs');
let c = fs.readFileSync('src/middleware.ts', 'utf8');
c = c.replace(
  'setAll(cookiesToSet) {',
  'setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {'
);
fs.writeFileSync('src/middleware.ts', c);
console.log('done');