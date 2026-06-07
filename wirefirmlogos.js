const fs = require('fs');
const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/';

// 1. Add logoFile to Firm interface in firms-data.ts
let firmData = fs.readFileSync('src/lib/firms-data.ts', 'utf8');
if (!firmData.includes('logoFile?:')) {
  firmData = firmData.replace(
    'export interface Firm {',
    'export interface Firm {\n  logoFile?: string | null'
  );
  fs.writeFileSync('src/lib/firms-data.ts', firmData);
  console.log('firms-data interface updated');
}

// 2. Rewrite FirmCard with clean logo logic
let card = fs.readFileSync('src/components/features/FirmCard.tsx', 'utf8');

// Ensure useState is imported
if (!card.includes("import { useState }")) {
  card = card.replace("'use client'", "'use client'\nimport { useState } from 'react'");
}

// Replace everything from function FirmLogo to end of that function
// Find the FirmLogo function block and replace it entirely
const logoFn = `function FirmLogo({ logoFile, monogram, tierColor }: { logoFile?: string | null; monogram: string; tierColor: string }) {
  const [failed, setFailed] = useState(false)
  const url = logoFile && !failed ? '${STORAGE}' + logoFile.replace(/ /g, '%20') : null
  return (
    <div style={{
      width: '48px', height: '48px', flexShrink: 0, borderRadius: '2px',
      border: '0.5px solid #E8E0D5', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: url ? '#FFFFFF' : tierColor,
    }}>
      {url ? (
        <img src={url} alt={monogram} width={48} height={48}
          style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '6px' }}
          onError={() => setFailed(true)} />
      ) : (
        <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: '1rem', color: '#FAF7F2' }}>
          {monogram}
        </span>
      )}
    </div>
  )
}`;

// Remove old FirmLogo function if it exists
if (card.includes('function FirmLogo')) {
  const start = card.indexOf('function FirmLogo');
  const end = card.indexOf('\nexport default function FirmCard');
  card = card.slice(0, start) + logoFn + '\n\n' + card.slice(end);
} else {
  // Insert before export default
  card = card.replace('\nexport default function FirmCard', '\n' + logoFn + '\n\nexport default function FirmCard');
}

// Fix the JSX usage — replace whatever logo/monogram div is in the card with FirmLogo component
// Find the monogram/logo div block and replace with component call
card = card.replace(
  /<FirmLogo[^/]*\/>/,
  '<FirmLogo logoFile={firm.logoFile} monogram={monogram} tierColor={tierColor} />'
);

// If FirmLogo isn't called yet at all, replace the monogram div
if (!card.includes('<FirmLogo')) {
  card = card.replace(
    /\{\/\* (Monogram avatar|Logo[^}]*) \*\/\}[\s\S]*?<\/div>/,
    '<FirmLogo logoFile={firm.logoFile} monogram={monogram} tierColor={tierColor} />'
  );
}

fs.writeFileSync('src/components/features/FirmCard.tsx', card);
console.log('FirmCard updated');