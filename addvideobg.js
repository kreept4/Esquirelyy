const fs = require('fs');
const content = fs.readFileSync('src/app/tools/interview-prep/page.tsx', 'utf8');

const oldHero = `        {/* Dark hero header */}
        <div style={{ backgroundColor: '#111111' }}>`;

const newHero = `        {/* Dark hero header */}
        <div style={{ position: 'relative', backgroundColor: '#111111', overflow: 'hidden' }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
              opacity: 0.18,
              zIndex: 0,
            }}
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'relative', zIndex: 1 }}>`;

const oldHeroClose = `            {/* Tabs */}`;
const newHeroClose = `          </div>
            {/* Tabs */}`;

let updated = content.replace(oldHero, newHero);
updated = updated.replace(oldHeroClose, newHeroClose);

fs.writeFileSync('src/app/tools/interview-prep/page.tsx', updated);
console.log('done');