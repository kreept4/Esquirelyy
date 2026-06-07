'use client'

export default function HomeIcons({ type }: { type: string }) {
  if (type === 'hero') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-md" aria-hidden="true">
      <g><path d="M415.34,324.94s37.13-44.87,27.13-123S381.07,101.26,348.23,101,284,136.83,239.7,144.11,134,130.72,84.06,148.2,29.8,270.79,70.5,312.18,197.58,351.94,249,341.55,377.5,372.69,415.34,324.94Z" fill="#0A2342" opacity="0.05"/></g>
      <g>
        <polygon points="253,306 251,139 284,139 283,311" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
        <polygon points="284,139 310,139 308,294 283,311" fill="#1A1A1A" opacity="0.75"/>
        <rect x="280" y="84" width="2" height="35" fill="#0A2342" opacity="0.5"/>
        <polygon points="267,125 267,117 295,117 295,126" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
        <polygon points="282,125 282,117 295,117 295,126" fill="#1A1A1A" opacity="0.7"/>
        <polygon points="251,139 258,131 284,131 284,139" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
        <polygon points="284,131 304,132 310,139 284,139" fill="#1A1A1A" opacity="0.7"/>
      </g>
      <g>
        <polygon points="306,197 362,201 381,196 324,192" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
        <polygon points="362,201 361,295 379,287 381,196" fill="#1A1A1A" opacity="0.65"/>
        <polygon points="306,197 306,284 361,295 362,201" fill="#FAF7F2" stroke="#0A2342" strokeWidth="1"/>
        <rect x="311" y="202" width="42" height="21" fill="#0A2342" opacity="0.75"/>
        <text x="316" y="216" fontSize="7" fill="#FAF7F2" fontFamily="serif" fontWeight="bold">HIRING</text>
      </g>
    </svg>
  )
  const icons: Record<string, JSX.Element> = {
    search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    tracker: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    scholarship: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/></svg>,
    firm: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="8" y1="12" x2="8" y2="12.01"/><line x1="12" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="12" y1="16" x2="16" y2="16"/></svg>,
    alert: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="5" r="3" fill="#0A2342" stroke="none"/></svg>,
    ai: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A2342" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  }
  return icons[type] || null
}
