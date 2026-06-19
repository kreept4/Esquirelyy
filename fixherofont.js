const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

const old = `            <h1 className="font-display text-5xl lg:text-6xl font-black text-charcoal leading-tight mb-4">
              Your legal career<br />
              <span className="text-ink">starts here.</span>
            </h1>`;

const next = `            <h1 className="font-serif text-6xl lg:text-7xl font-bold text-charcoal leading-[1.05] mb-5 tracking-tight">
              Your legal career starts here.
            </h1>`;

if (c.includes(old)) {
  c = c.replace(old, next);
  fs.writeFileSync('src/app/page.tsx', c);
  console.log('hero fixed');
} else {
  console.log('not found - exact text differs');
}