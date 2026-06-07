const fs = require('fs');
let c = fs.readFileSync('src/app/firms/page.tsx', 'utf8');

// Add useState import
c = c.replace(
  "import { useState, useMemo } from 'react'",
  "import { useState, useMemo, useCallback } from 'react'"
);

// Replace the hardcoded monogram div with logo-aware version
const oldDiv = `                    <div style={{
                      width: '48px', height: '48px', flexShrink: 0,
                      backgroundColor: '#8B3A3A', color: '#FAF7F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontWeight: 700, fontSize: '0.9rem', borderRadius: '2px',
                    }}>
                      {getMonogram(firm.name)}
                    </div>`;

const newDiv = `                    <FirmAvatar logoFile={firm.logoFile} name={firm.name} />`;

c = c.replace(oldDiv, newDiv);

// Insert FirmAvatar component before the export default
const firmAvatar = `
const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/';

function FirmAvatar({ logoFile, name }: { logoFile?: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const url = logoFile && !failed ? STORAGE + logoFile.replace(/ /g, '%20') : null
  return (
    <div style={{
      width: '48px', height: '48px', flexShrink: 0, borderRadius: '2px',
      border: '0.5px solid #E8E0D5', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: url ? '#FFFFFF' : '#8B3A3A',
    }}>
      {url ? (
        <img src={url} alt={name} width={48} height={48}
          style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '6px' }}
          onError={() => setFailed(true)} />
      ) : (
        <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '0.9rem', color: '#FAF7F2' }}>
          {getMonogram(name)}
        </span>
      )}
    </div>
  )
}

`;

c = c.replace('export default function FirmsPage()', firmAvatar + 'export default function FirmsPage()');

fs.writeFileSync('src/app/firms/page.tsx', c);
console.log('done');