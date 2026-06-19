const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

// "Featured Opportunities" - keep serif but give it more presence, italic accent on subtext
c = c.replace(
  `<h2 className="font-display text-3xl font-bold text-charcoal mb-1">Featured Opportunities</h2>`,
  `<h2 className="font-serif text-4xl font-bold text-charcoal mb-1 tracking-tight">Featured Opportunities</h2>`
);

// "Everything you need" - make this one feel distinct, lighter weight, larger, centered context already
c = c.replace(
  `<h2 className="font-display text-3xl font-bold text-charcoal mb-2">Everything you need</h2>`,
  `<h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-3 tracking-tight">Everything you need</h2>`
);

fs.writeFileSync('src/app/page.tsx', c);
console.log('done');