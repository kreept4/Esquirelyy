const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

c = c.replace(
  /className="font-display text-5xl lg:text-6xl font-black text-charcoal leading-tight mb-4"/,
  'className="font-serif text-6xl lg:text-7xl font-bold text-charcoal leading-[1.05] mb-5 tracking-tight"'
);

c = c.replace(
  /Your legal career<br \/>\s*<span className="text-ink">starts here\.<\/span>/,
  'Your legal career starts here.'
);

fs.writeFileSync('src/app/page.tsx', c);
console.log('done');