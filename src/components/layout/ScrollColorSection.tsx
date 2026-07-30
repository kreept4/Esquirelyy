'use client'

import { useEffect, useRef, useState } from 'react'

type RGB = [number, number, number]

const INK: RGB = [26, 26, 26]
const CREAM: RGB = [250, 246, 240]

/**
 * Full-bleed block whose background wipes from one colour to another as it
 * crosses the viewport, with the headline fading up behind it.
 *
 * Generalised out of the home page's FadeSection so inner pages can use the
 * same effect. Deliberately driven by getBoundingClientRect rather than
 * window.scrollY -- it stays correct regardless of which element is the
 * scroll container.
 */
export default function ScrollColorSection({
  children,
  from = INK,
  to = CREAM,
  textColor = INK,
  padding = '10rem 1.5rem',
}: {
  children: React.ReactNode
  from?: RGB
  to?: RGB
  textColor?: RGB
  padding?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = el.getBoundingClientRect()
        const windowH = window.innerHeight
        const start = windowH * 0.9
        const end = windowH * 0.1
        const p = (start - rect.top) / (start - end)
        setProgress(Math.min(Math.max(p, 0), 1))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const mix = (a: number, b: number) => Math.round(a + (b - a) * progress)
  const bg = `rgb(${mix(from[0], to[0])},${mix(from[1], to[1])},${mix(from[2], to[2])})`
  const textOpacity = progress > 0.3 ? Math.min((progress - 0.3) / 0.7, 1) : 0
  const color = `rgba(${textColor[0]},${textColor[1]},${textColor[2]},${textOpacity})`

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: bg,
        padding,
        textAlign: 'center',
        transition: 'background-color 0.05s linear',
      }}
    >
      <div
        className="display-black"
        style={{
          fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)',
          lineHeight: 1.1,
          color,
          maxWidth: '820px',
          margin: '0 auto',
          transition: 'color 0.05s linear',
        }}
      >
        {children}
      </div>
    </section>
  )
}
