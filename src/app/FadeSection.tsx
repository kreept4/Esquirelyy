'use client'

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

  // ink -> cream. Kept as decimal channels for interpolation: #1A1A1A -> #FAF6F0
  const r1 = 26, g1 = 26, b1 = 26
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
        fontFamily: 'Schibsted Grotesk, sans-serif',
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
