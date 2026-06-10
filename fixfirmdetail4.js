const fs = require('fs');
let c = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');

const oldBlock = `            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' as const }}>
              <FirmAvatar logoFile={firm!.logoFile} name={firm!.name} />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' as const }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#8B3A3A' }}>
                    {firm!.tier}
                  </span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>
                    Verified
                  </span>
                </div>
                <h1 style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
                  fontWeight: 700, color: '#1A1A1A', lineHeight: 1.1, marginBottom: '0.75rem',
                }}>
                  {firm!.name}
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', lineHeight: 1.7, maxWidth: '600px' }}>
                  {firm!.description}
                </p>
              </div>
            </div>`;

const newBlock = `            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' as const }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#8B3A3A' }}>
                {firm!.tier}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#2D6A4F' }}>
                Verified
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' as const }}>
              <FirmAvatar logoFile={firm!.logoFile} name={firm!.name} />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h1 style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
                  fontWeight: 700, color: '#1A1A1A', lineHeight: 1.1, marginBottom: '0.75rem',
                }}>
                  {firm!.name}
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#4A4A4A', lineHeight: 1.7, maxWidth: '600px' }}>
                  {firm!.description}
                </p>
              </div>
            </div>`;

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  fs.writeFileSync('src/app/firms/[slug]/page.tsx', c);
  console.log('done');
} else {
  console.log('no match - printing file section for debug');
  const idx = c.indexOf('FirmAvatar logoFile');
  console.log(c.slice(idx - 300, idx + 400));
}