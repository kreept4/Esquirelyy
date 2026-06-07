'use client'

export default function HomeIcons({ type }: { type: string }) {
  if (type === 'hero') return (<img src='/job-hunt-hero.svg' alt='Legal career illustration' className='w-full max-w-lg' />)

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



