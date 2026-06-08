const fs = require('fs');
let d = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');

// Add STORAGE constant and FirmAvatar after imports
const avatarCode = `
const STORAGE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/'

function FirmAvatar({ logoFile, name }: { logoFile?: string | null; name: string }) {
  const url = logoFile ? STORAGE + logoFile.replace(/ /g, '%20') : null
  if (!url) {
    return (
      <div style={{
        width: '72px', height: '72px', flexShrink: 0,
        backgroundColor: '#0A2342', color: '#FAF7F2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Playfair Display, Georgia, serif',
        fontWeight: 700, fontSize: '1.35rem', borderRadius: '3px',
      }}>
        {name.split(' ').filter(w => w.length > 2 && !['and','LLP','LP','Co','the'].includes(w)).slice(0,2).map(w => w[0]).join('').toUpperCase()}
      </div>
    )
  }
  return (
    <div style={{
      width: '72px', height: '72px', flexShrink: 0,
      backgroundColor: '#FAF7F2', border: '0.5px solid #E8E0D5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '3px', overflow: 'hidden',
    }}>
      <img src={url} alt={name} width={72} height={72}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    </div>
  )
}
`;

d = d.replace(
  "export async function generateStaticParams",
  avatarCode + "\nexport async function generateStaticParams"
);

// Replace the monogram div with FirmAvatar
d = d.replace(
  `{/* Monogram */}
              <div style={{
                width: '72px', height: '72px', flexShrink: 0,
                backgroundColor: '#8B3A3A', color: '#FAF7F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 700, fontSize: '1.35rem', borderRadius: '3px',
              }}>
                {getMonogram(firm.name)}
              </div>`,
  `{/* Logo */}
              <FirmAvatar logoFile={firm.logoFile} name={firm.name} />`
);

// Fix navbar overlap
d = d.replace("paddingTop: '64px'", "paddingTop: '80px'");

fs.writeFileSync('src/app/firms/[slug]/page.tsx', d);
console.log('done');