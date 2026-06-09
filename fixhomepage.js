const fs = require('fs');
let d = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Job cards: rounded-xl -> rounded
d = d.replace(
  'className="group border border-cream-border rounded-xl p-5 bg-cream hover:border-ink/30 hover:shadow-md transition-all block"',
  'className="group border border-cream-border rounded p-5 bg-cream hover:border-ink/30 hover:shadow-md transition-all block"'
);

// 2. Feature cards: rounded-xl -> rounded
d = d.replace(
  'className="border border-cream-border rounded-xl p-6 bg-cream hover:border-ink/20 hover:shadow-sm transition-all"',
  'className="border border-cream-border rounded p-6 bg-cream hover:border-ink/20 hover:shadow-sm transition-all"'
);

// 3. Feature card icon container: rounded-lg -> rounded
d = d.replace(
  'className="w-10 h-10 rounded-lg bg-ink/6 flex items-center justify-center mb-4 border border-ink/8"',
  'className="w-10 h-10 rounded bg-ink/6 flex items-center justify-center mb-4 border border-ink/8"'
);

// 4. CTA buttons: rounded-lg -> rounded
d = d.replaceAll('rounded-lg font-medium text-sm', 'rounded font-medium text-sm');

// 5. Verified/Closing badges: rounded-full -> rounded-sm
d = d.replace(
  'text-xs font-medium text-verified bg-verified/10 px-2 py-0.5 rounded-full',
  'text-xs font-medium text-verified bg-verified/10 px-2 py-0.5 rounded-sm'
);
d = d.replace(
  'text-xs font-medium text-closing bg-closing/10 px-2 py-0.5 rounded-full',
  'text-xs font-medium text-closing bg-closing/10 px-2 py-0.5 rounded-sm'
);

// 6. Tier badge: rounded-md -> rounded-sm
d = d.replace(
  'text-xs border border-ink/15 px-2 py-1 rounded-md text-charcoal/50 shrink-0 ml-3 bg-ink/3 font-medium',
  'text-xs border border-ink/15 px-2 py-1 rounded-sm text-charcoal/50 shrink-0 ml-3 bg-ink/3 font-medium'
);

// 7. Practice area tags: rounded-md -> rounded-sm
d = d.replace(
  'text-xs bg-ink/5 border border-ink/10 px-2 py-0.5 rounded-md text-charcoal/70 font-medium',
  'text-xs bg-ink/5 border border-ink/10 px-2 py-0.5 rounded-sm text-charcoal/70 font-medium'
);

// 8. Secondary CTA: Track Applications -> Browse Firms
d = d.replace(
  'href="/tracker" className="inline-flex items-center justify-center gap-2 border border-cream-border text-charcoal px-6 py-3 rounded font-medium text-sm hover:border-ink/30 transition-colors">\n                Track Applications',
  'href="/firms" className="inline-flex items-center justify-center gap-2 border border-cream-border text-charcoal px-6 py-3 rounded font-medium text-sm hover:border-ink/30 transition-colors">\n                Browse Firms'
);

// 9. Ticker padding: py-2 -> py-3
d = d.replace(
  'className="flex animate-ticker whitespace-nowrap py-2"',
  'className="flex animate-ticker whitespace-nowrap py-3"'
);

fs.writeFileSync('src/app/page.tsx', d);
console.log('done');