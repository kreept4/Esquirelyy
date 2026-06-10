const fs = require('fs');

const content = `'use client'

export default function HomeIcons({ type }: { type: string }) {
  if (type === 'hero') return (
    <img src='/job-hunt-hero.svg' alt='Legal career illustration' className='w-full max-w-lg' />
  )

  const S = '#8B3A3A'
  const W = '1.5'
  const props = { fill: 'none', stroke: S, strokeWidth: W, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  const icons: Record<string, JSX.Element> = {

    // Smart Job Board — document with text lines + magnifying glass
    search: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
        {/* Document */}
        <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
        <polyline points="14 2 14 8 20 8" />
        {/* Text lines */}
        <line x1="8" y1="12" x2="13" y2="12" />
        <line x1="8" y1="15" x2="11" y2="15" />
        {/* Magnifying glass */}
        <circle cx="16.5" cy="16.5" r="2.5" />
        <line x1="18.5" y1="18.5" x2="21" y2="21" />
      </svg>
    ),

    // Application Tracker — kanban columns, rightmost has a checkmark
    tracker: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
        {/* Three columns */}
        <rect x="2" y="3" width="5" height="14" rx="1" />
        <rect x="9.5" y="3" width="5" height="10" rx="1" />
        <rect x="17" y="3" width="5" height="7" rx="1" />
        {/* Check on third column */}
        <polyline points="18 12 19.5 14 22 10" />
      </svg>
    ),

    // Scholarships — mortarboard with tassel
    scholarship: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
        {/* Board top */}
        <polygon points="12 2 22 7 12 12 2 7" />
        {/* Cap rim — flat line under diamond */}
        <line x1="2" y1="7" x2="22" y2="7" strokeOpacity="0" />
        {/* Curved gown below */}
        <path d="M6 10v5a6 6 0 0 0 12 0v-5" />
        {/* Tassel string */}
        <line x1="22" y1="7" x2="22" y2="13" />
        <circle cx="22" cy="14" r="1" fill={S} stroke="none" />
      </svg>
    ),

    // Firm Directory — classical building facade with columns and steps
    firm: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
        {/* Pediment / roof */}
        <polyline points="2 9 12 3 22 9" />
        {/* Entablature */}
        <line x1="2" y1="9" x2="22" y2="9" />
        {/* Four columns */}
        <line x1="5" y1="9" x2="5" y2="18" />
        <line x1="9.5" y1="9" x2="9.5" y2="18" />
        <line x1="14.5" y1="9" x2="14.5" y2="18" />
        <line x1="19" y1="9" x2="19" y2="18" />
        {/* Steps */}
        <line x1="1" y1="18" x2="23" y2="18" />
        <line x1="3" y1="20" x2="21" y2="20" />
        <line x1="5" y1="22" x2="19" y2="22" />
      </svg>
    ),

    // Job Alerts — clean bell, filled dot top-right
    alert: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
        {/* Bell body */}
        <path d="M6 10a6 6 0 0 1 12 0c0 5 2.5 7 2.5 7H3.5S6 15 6 10z" />
        {/* Clapper */}
        <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
        {/* Notification dot — filled */}
        <circle cx="18" cy="5" r="2.5" fill={S} stroke={S} strokeWidth="1" />
      </svg>
    ),

    // AI Career Tools — two overlapping chat bubbles with a small spark
    ai: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
        {/* Primary bubble */}
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        {/* Spark / lightning inside */}
        <polyline points="13 9 11 13 13 13 11 17" strokeWidth="1.25" />
      </svg>
    ),

  }

  return icons[type] || null
}
`;

fs.writeFileSync('src/app/HomeIcons.tsx', content);
console.log('done');