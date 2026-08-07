const fs = require('fs');
const path = require('path');

const heroPath = path.join('src', 'app', 'HeroSection.tsx');
let hero = fs.readFileSync(heroPath, 'utf8');

const startMarker = 'function AnimatedChar(';
const endMarker = 'function HeroNav(';

const startIdx = hero.indexOf(startMarker);
const endIdx = hero.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('✗ Could not find AnimatedChar/HeroNav boundaries — no changes made.');
  process.exit(1);
}

const replacement = `function AnimatedChar({ char, delay, scrollYProgress, charIndex }: { char: string; delay: number; scrollYProgress: MotionValue<number>; charIndex: number }) {
  const waveY = useTransform(scrollYProgress, (v) => Math.sin(v * Math.PI * 2 + charIndex * 0.35) * 14 * v)
  return (
    <motion.span
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: 'easeOut' }}
      style={{ display: 'inline-block', y: waveY }}
    >
      {char}
    </motion.span>
  )
}

function AnimatedHeading({ text, scrollYProgress }: { text: string; scrollYProgress: MotionValue<number> }) {
  const lines = text.split('\\n')
  const charDelay = 30
  const baseDelay = 200
  let globalIndex = 0
  return (
    <h1 className="space-mono-bold" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.02em', lineHeight: 1.05, color: '#FAF6F0', marginBottom: '1.25rem' }}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx}>
          {line.split(' ').map((word, wordIdx, wordsArr) => (
            <span key={wordIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {word.split('').map((char) => {
                const delay = baseDelay + (lineIdx * line.length * charDelay) + (globalIndex * charDelay)
                const idx = globalIndex++
                return <AnimatedChar key={idx} char={char} delay={delay} scrollYProgress={scrollYProgress} charIndex={idx} />
              })}
              {wordIdx < wordsArr.length - 1 ? '\\u0020' : ''}
            </span>
          ))}
        </div>
      ))}
    </h1>
  )
}

`;

hero = hero.slice(0, startIdx) + replacement + hero.slice(endIdx);
fs.writeFileSync(heroPath, hero, 'utf8');
console.log('✓ HeroSection.tsx: word-aware wrapping applied');
