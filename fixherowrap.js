const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

c = c.replace(
  'className="font-serif text-6xl lg:text-7xl font-bold text-charcoal leading-[1.05] mb-5 tracking-tight"',
  'className="font-serif text-5xl lg:text-6xl font-bold text-charcoal leading-[1.1] mb-5 tracking-tight max-w-lg"'
);

fs.writeFileSync('src/app/page.tsx', c);
console.log('done');