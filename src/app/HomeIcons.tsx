'use client'

export default function HomeIcons({ type }: { type: string }) {
  if (type === 'hero') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-md" aria-hidden="true">
      <ellipse cx="250" cy="420" rx="180" ry="20" fill="#5C1A1A" opacity="0.06"/>
      <g>
        <polygon points="253,310 251,140 286,140 285,314" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="286,140 314,140 312,298 285,314" fill="#5C1A1A" opacity="0.18"/>
        <rect x="282" y="82" width="2.5" height="38" fill="#5C1A1A" opacity="0.4"/>
        <polygon points="268,128 268,118 298,118 298,128" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="284,128 284,118 298,118 298,128" fill="#5C1A1A" opacity="0.18"/>
        <polygon points="251,140 259,131 286,131 286,140" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="286,131 308,133 314,140 286,140" fill="#5C1A1A" opacity="0.18"/>
        <rect x="258" y="180" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="195" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="210" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="225" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="240" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="255" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
        <rect x="258" y="270" width="20" height="3" fill="#5C1A1A" opacity="0.12"/>
      </g>
      <g>
        <polygon points="308,200 368,204 388,198 326,194" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <polygon points="368,204 367,300 386,292 388,198" fill="#5C1A1A" opacity="0.14"/>
        <polygon points="308,200 308,288 367,300 368,204" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1.5"/>
        <rect x="314" y="205" width="44" height="22" fill="#5C1A1A" opacity="0.85" rx="1"/>
        <text x="319" y="220" fontSize="7.5" fill="#FAF6F0" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="1">HIRING</text>
        <rect x="314" y="236" width="30" height="2.5" fill="#5C1A1A" opacity="0.1"/>
        <rect x="314" y="246" width="24" height="2.5" fill="#5C1A1A" opacity="0.1"/>
        <rect x="314" y="256" width="28" height="2.5" fill="#5C1A1A" opacity="0.1"/>
        <rect x="314" y="266" width="20" height="2.5" fill="#5C1A1A" opacity="0.1"/>
      </g>
      <g>
        <polygon points="160,240 210,243 224,239 172,236" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1"/>
        <polygon points="210,243 209,310 222,305 224,239" fill="#5C1A1A" opacity="0.1"/>
        <polygon points="160,240 160,306 209,310 210,243" fill="#FAF6F0" stroke="#5C1A1A" strokeWidth="1"/>
      </g>
    </svg>
  )
  const icons: Record<string, JSX.Element> = {
    search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    tracker: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    scholarship: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/></svg>,
    firm: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="8" y1="12" x2="8" y2="12.01"/><line x1="12" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="12" y1="16" x2="16" y2="16"/></svg>,
    alert: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="5" r="3" fill="#5C1A1A" stroke="none"/></svg>,
    ai: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  }
  return icons[type] || null
}
