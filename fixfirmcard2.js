const fs = require('fs');
let c = fs.readFileSync('src/components/features/FirmCard.tsx', 'utf8');

// Add useState import
c = c.replace("'use client'\nimport Link", "'use client'\nimport { useState } from 'react'\nimport Link");

// Replace the logo block with a state-based version
const oldLogo = `        {/* Logo with Clearbit fallback */}
        <div style={{
          width: '48px',
          height: '48px',
          flexShrink: 0,
          borderRadius: '2px',
          overflow: 'hidden',
          border: '0.5px solid #E8E0D5',
          backgroundColor: '#FAF6F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {firm.website ? (
            <img
              src={'https://logo.clearbit.com/' + firm.website.replace('https://','').replace('http://','').replace(/\\/.*/,'')}
              alt={firm.name + ' logo'}
              width={48}
              height={48}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.style.backgroundColor = tierColor;
                  target.parentElement.style.fontFamily = 'Playfair Display, Georgia, serif';
                  target.parentElement.style.fontWeight = '700';
                  target.parentElement.style.fontSize = '1rem';
                  target.parentElement.style.color = '#FAF7F2';
                  target.parentElement.innerHTML = monogram;
                }
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: tierColor,
              color: '#FAF7F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700,
              fontSize: '1rem',
            }}>
              {monogram}
            </div>
          )}
        </div>`;

const newLogo = `        {/* Logo with Clearbit fallback */}
        <FirmLogo website={firm.website} monogram={monogram} tierColor={tierColor} />`;

c = c.replace(oldLogo, newLogo);

// Add FirmLogo component before the main export
const firmLogoComponent = `
function FirmLogo({ website, monogram, tierColor }: { website: string | null, monogram: string, tierColor: string }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const domain = website ? website.replace('https://','').replace('http://','').replace(/\\/.*/,'') : null

  return (
    <div style={{
      width: '48px',
      height: '48px',
      flexShrink: 0,
      borderRadius: '2px',
      overflow: 'hidden',
      border: '0.5px solid #E8E0D5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: (!domain || logoFailed) ? tierColor : '#FAF6F0',
    }}>
      {domain && !logoFailed ? (
        <img
          src={'https://logo.clearbit.com/' + domain}
          alt={monogram}
          width={48}
          height={48}
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700,
          fontSize: '1rem',
          color: '#FAF7F2',
        }}>
          {monogram}
        </span>
      )}
    </div>
  )
}

`;

c = c.replace("export default function FirmCard", firmLogoComponent + "export default function FirmCard");

fs.writeFileSync('src/components/features/FirmCard.tsx', c);
console.log('done');