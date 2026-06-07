const fs = require('fs');

// Soften burgundy globally
const files = require('child_process').execSync(
  'powershell -Command "Get-ChildItem -Path src -Recurse -Filter *.tsx | Select-Object -ExpandProperty FullName"',
  { encoding: 'utf8' }
).trim().split('\r\n');

files.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, content.replace(/#5C1A1A/g, '#8B3A3A'));
  } catch(e) {}
});

// Also update tailwind config
const tw = fs.readFileSync('tailwind.config.js', 'utf8');
fs.writeFileSync('tailwind.config.js', tw.replace(/#5C1A1A/g, '#8B3A3A'));

// Rewrite HomeIcons with man restored
fs.writeFileSync('src/app/HomeIcons.tsx', `'use client'

export default function HomeIcons({ type }: { type: string }) {
  if (type === 'hero') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-md" aria-hidden="true">
      <ellipse cx="250" cy="425" rx="185" ry="18" fill="#8B3A3A" opacity="0.06"/>

      {/* Tall center building */}
      <g>
        <polygon points="253,315 251,138 288,138 287,318" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        <polygon points="288,138 316,138 314,302 287,318" fill="#8B3A3A" opacity="0.15"/>
        <rect x="284" y="80" width="2.5" height="38" fill="#8B3A3A" opacity="0.4"/>
        <polygon points="269,126 269,116 300,116 300,126" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        <polygon points="285,126 285,116 300,116 300,126" fill="#8B3A3A" opacity="0.15"/>
        <polygon points="251,138 260,129 288,129 288,138" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        <polygon points="288,129 310,131 316,138 288,138" fill="#8B3A3A" opacity="0.15"/>
        <rect x="259" y="178" width="18" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="259" y="193" width="18" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="259" y="208" width="18" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="259" y="223" width="18" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="259" y="238" width="18" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="259" y="253" width="18" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="259" y="268" width="18" height="2.5" fill="#8B3A3A" opacity="0.1"/>
      </g>

      {/* Hiring building */}
      <g>
        <polygon points="310,202 370,206 390,200 328,196" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        <polygon points="370,206 369,302 388,294 390,200" fill="#8B3A3A" opacity="0.12"/>
        <polygon points="310,202 310,290 369,302 370,206" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        <rect x="316" y="207" width="44" height="22" fill="#8B3A3A" opacity="0.85" rx="1"/>
        <text x="321" y="222" fontSize="7.5" fill="#FAF6F0" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="1">HIRING</text>
        <rect x="316" y="238" width="30" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="316" y="248" width="24" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="316" y="258" width="28" height="2.5" fill="#8B3A3A" opacity="0.1"/>
        <rect x="316" y="268" width="20" height="2.5" fill="#8B3A3A" opacity="0.1"/>
      </g>

      {/* Small left building */}
      <g>
        <polygon points="158,242 208,245 222,241 170,238" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1"/>
        <polygon points="208,245 207,312 220,307 222,241" fill="#8B3A3A" opacity="0.1"/>
        <polygon points="158,242 158,308 207,312 208,245" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1"/>
      </g>

      {/* Man — standing at base, looking toward hiring building */}
      <g>
        {/* Shadow */}
        <ellipse cx="198" cy="422" rx="12" ry="3" fill="#8B3A3A" opacity="0.08"/>
        {/* Legs */}
        <line x1="193" y1="400" x2="190" y2="422" stroke="#8B3A3A" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="201" y1="400" x2="204" y2="422" stroke="#8B3A3A" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Body */}
        <rect x="188" y="375" width="18" height="27" rx="3" fill="#8B3A3A" opacity="0.75"/>
        {/* Left arm raised pointing at hiring sign */}
        <line x1="206" y1="380" x2="222" y2="368" stroke="#8B3A3A" strokeWidth="2" strokeLinecap="round"/>
        {/* Right arm down */}
        <line x1="188" y1="382" x2="183" y2="396" stroke="#8B3A3A" strokeWidth="2" strokeLinecap="round"/>
        {/* Neck */}
        <line x1="197" y1="375" x2="197" y2="368" stroke="#8B3A3A" strokeWidth="2" strokeLinecap="round"/>
        {/* Head */}
        <circle cx="197" cy="363" r="8" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.5"/>
        {/* Briefcase */}
        <rect x="178" y="396" width="10" height="8" rx="1.5" fill="#FAF6F0" stroke="#8B3A3A" strokeWidth="1.2"/>
        <line x1="181" y1="396" x2="181" y2="393" stroke="#8B3A3A" strokeWidth="1" strokeLinecap="round"/>
        <line x1="185" y1="396" x2="185" y2="393" stroke="#8B3A3A" strokeWidth="1" strokeLinecap="round"/>
        <line x1="181" y1="393" x2="185" y2="393" stroke="#8B3A3A" strokeWidth="1" strokeLinecap="round"/>
      </g>
    </svg>
  )

  const icons: Record<string, JSX.Element> = {
    search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B3A3A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    tracker: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B3A3A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    scholarship: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B3A3A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/></svg>,
    firm: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B3A3A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="8" y1="12" x2="8" y2="12.01"/><line x1="12" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="12" y1="16" x2="16" y2="16"/></svg>,
    alert: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B3A3A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="5" r="3" fill="#8B3A3A" stroke="none"/></svg>,
    ai: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B3A3A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  }
  return icons[type] || null
}
`);

console.log('done');