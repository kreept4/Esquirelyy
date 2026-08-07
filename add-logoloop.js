const fs = require('fs');
const path = 'src/app/page.tsx';
let raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n'); // normalize to LF for matching

// 1. Add import
const oldImport = `import HeroSection from './HeroSection'`;
const newImport = `import HeroSection from './HeroSection'
import { ALL_FIRMS, logoUrl } from '@/lib/firms-data'`;
if (!content.includes(oldImport)) throw new Error('import anchor not found');
content = content.replace(oldImport, newImport);

// 2. Replace ticker block with LogoLoop
const oldTicker = `      <div className="border-b border-cream-border bg-cream-dark overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-3">
          {[...tickerItems, ...tickerItems].map((item: string, i: number) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-sm text-charcoal/70">
              <span className="w-1 h-1 rounded-full bg-ink inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>`;

const newLogoLoop = `      <div className="border-b border-cream-border bg-cream-dark overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-6 items-center">
          {[...ALL_FIRMS, ...ALL_FIRMS].map((firm, i) => {
            const src = logoUrl(firm.logoFile)
            if (!src) return null
            return (
              <span key={firm.slug + i} className="inline-flex items-center px-8 shrink-0">
                <img
                  src={src}
                  alt={firm.shortName}
                  className="h-7 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </span>
            )
          })}
        </div>
      </div>`;

if (!content.includes(oldTicker)) throw new Error('ticker block not matched');
content = content.replace(oldTicker, newLogoLoop);

// restore original line endings
if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(path, content, 'utf8');
console.log('✓ page.tsx: ticker replaced with LogoLoop');