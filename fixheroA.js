const fs = require('fs');
const content = fs.readFileSync('src/app/tools/interview-prep/page.tsx', 'utf8');

const oldHero = `        {/* Dark hero header */}
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
              opacity: 0.09,
              zIndex: 0,
            }}
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,0.85) 100%)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>`;

const newHero = `        {/* Dark hero header */}
        <div style={{ position: 'relative', backgroundColor: '#0F0F0F', borderTop: '2px solid #8B3A3A' }}>
          <div>`;

const updated = content.replace(oldHero, newHero);

// Fix the extra closing div left from video wrapper
const fixClose = updated.replace(
  `          </div>
            {/* Tabs */}`,
  `            {/* Tabs */}`
);

fs.writeFileSync('src/app/tools/interview-prep/page.tsx', fixClose);
console.log('done');