const fs = require('fs');
let c = fs.readFileSync('src/components/features/FirmCard.tsx', 'utf8');

const STORAGE_BASE = 'https://ixocubhkygrnildbzluz.supabase.co/storage/v1/object/public/firm-logos/';

const oldFirmLogo = c.slice(c.indexOf('function FirmLogo'), c.indexOf('\nexport default function FirmCard'));

const newFirmLogo = `function FirmLogo({ logoFile, monogram, tierColor }: { logoFile?: string | null, monogram: string, tierColor: string }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const logoUrl = logoFile && !logoFailed
    ? '${STORAGE_BASE}' + encodeURIComponent(logoFile)
    : null

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
      backgroundColor: logoUrl ? '#FFFFFF' : tierColor,
    }}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={monogram}
          width={48}
          height={48}
          style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '4px' }}
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

c = c.slice(0, c.indexOf('function FirmLogo')) + newFirmLogo + c.slice(c.indexOf('\nexport default function FirmCard'));

// Update the usage to pass logoFile instead of website
c = c.replace(
  '<FirmLogo website={firm.website} monogram={monogram} tierColor={tierColor} />',
  '<FirmLogo logoFile={firm.logoFile} monogram={monogram} tierColor={tierColor} />'
);

fs.writeFileSync('src/components/features/FirmCard.tsx', c);
console.log('done');