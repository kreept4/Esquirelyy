const fs = require('fs');

fs.writeFileSync('src/app/FadeSection.tsx', `'use client'

import { useEffect, useRef, useState } from 'react'

export default function FadeSection() {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight
      const start = windowH * 0.9
      const end = windowH * 0.1
      const total = start - end
      const current = start - rect.top
      const p = Math.min(Math.max(current / total, 0), 1)
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const r1 = 139, g1 = 58, b1 = 58
  const r2 = 250, g2 = 246, b2 = 240
  const r = Math.round(r1 + (r2 - r1) * progress)
  const g = Math.round(g1 + (g2 - g1) * progress)
  const b = Math.round(b1 + (b2 - b1) * progress)
  const bg = 'rgb(' + r + ',' + g + ',' + b + ')'
  const textOpacity = progress > 0.3 ? Math.min((progress - 0.3) / 0.7, 1) : 0
  const textColor = 'rgba(26,26,26,' + textOpacity + ')'

  return (
    <section ref={ref} style={{
      backgroundColor: bg,
      padding: '10rem 1.5rem',
      textAlign: 'center',
      transition: 'background-color 0.05s linear',
    }}>
      <h2 style={{
        fontFamily: 'Playfair Display, Georgia, serif',
        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
        fontWeight: 900,
        lineHeight: 1.1,
        color: textColor,
        maxWidth: '800px',
        margin: '0 auto',
        transition: 'color 0.05s linear',
      }}>
        Every opportunity.<br />One platform.
      </h2>
    </section>
  )
}
`);

// Inject FadeSection into page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf8');

if (!page.includes('FadeSection')) {
  page = page.replace(
    "import HomeIcons from './HomeIcons'",
    "import HomeIcons from './HomeIcons'\nimport FadeSection from './FadeSection'"
  );
}

// Replace the old every opportunity section
page = page.replace(
  /\s*<section style=\{\{[\s\S]*?Every opportunity[\s\S]*?<\/section>/,
  '\n      <FadeSection />'
);

fs.writeFileSync('src/app/page.tsx', page);
console.log('done');