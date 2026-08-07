const fs = require('fs');
const path = 'src/app/HeroSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: word spacing — move gap to margin, stop relying on trailing space char
const oldSpan = `            <span key={wordIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {word.split('').map((char) => {
                const delay = baseDelay + (lineIdx * line.length * charDelay) + (globalIndex * charDelay)
                const idx = globalIndex++
                return <AnimatedChar key={idx} char={char} delay={delay} scrollYProgress={scrollYProgress} charIndex={idx} />
              })}
              {wordIdx < wordsArr.length - 1 ? '\\u0020' : ''}
            </span>`;

const newSpan = `            <span key={wordIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: wordIdx < wordsArr.length - 1 ? '0.28em' : 0 }}>
              {word.split('').map((char) => {
                const delay = baseDelay + (lineIdx * line.length * charDelay) + (globalIndex * charDelay)
                const idx = globalIndex++
                return <AnimatedChar key={idx} char={char} delay={delay} scrollYProgress={scrollYProgress} charIndex={idx} />
              })}
            </span>`;

if (!content.includes(oldSpan)) throw new Error('word span block not matched');
content = content.replace(oldSpan, newSpan);

// Fix 2: remove "Jobs. Firms. Careers." tag block
const oldTag = `          <div className="hero-tag-col" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass" style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem' }}>
                <span className="space-mono-regular" style={{ fontSize: '1.1rem', color: '#FAF6F0', fontWeight: 300 }}>Jobs. Firms. Careers.</span>
              </div>
            </FadeIn>
          </div>
`;
if (!content.includes(oldTag)) throw new Error('tag block not matched');
content = content.replace(oldTag, '');

// Fix 3: hero-grid was 2-col to fit the now-deleted tag column — collapse to 1-col always
const oldGridStyle = `      <style>{\`
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-tag-col { justify-content: flex-end !important; }
        }
      \`}</style>`;
content = content.replace(oldGridStyle, '');

fs.writeFileSync(path, content, 'utf8');
console.log('✓ HeroSection.tsx: spacing fixed, tag block removed, grid collapsed to single column');