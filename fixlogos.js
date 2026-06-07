const fs = require('fs');
let c = fs.readFileSync('src/components/features/FirmCard.tsx', 'utf8');

// Replace the entire FirmLogo component
const oldFirmLogo = c.match(/function FirmLogo[\s\S]*?^}/m);

const newFirmLogo = `function FirmLogo({ website, monogram, tierColor }: { website: string | null, monogram: string, tierColor: string }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const domain = website ? website.replace('https://','').replace('http://','').replace(/\\/.*/,'') : null
  const faviconUrl = domain ? 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64' : null

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
      backgroundColor: (!faviconUrl || logoFailed) ? tierColor : '#FAF6F0',
    }}>
      {faviconUrl && !logoFailed ? (
        <img
          src={faviconUrl}
          alt={monogram}
          width={32}
          height={32}
          style={{ objectFit: 'contain', width: '32px', height: '32px' }}
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
}`;

// Find and replace the FirmLogo function
const firmLogoStart = c.indexOf('function FirmLogo');
const firmLogoEnd = c.indexOf('\nexport default function FirmCard');
c = c.slice(0, firmLogoStart) + newFirmLogo + '\n\n' + c.slice(firmLogoEnd);

fs.writeFileSync('src/components/features/FirmCard.tsx', c);
console.log('done');