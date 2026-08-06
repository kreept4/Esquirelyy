'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'

/**
 * Shared entrance primitives. These started life inside HeroSection; the inner
 * pages now use the same code rather than re-implementing the effect, so the
 * hero and every page header stay in step.
 */

export function FadeIn({
  children,
  delay = 0,
  duration = 1000,
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div className="transition-opacity" style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}>
      {children}
    </div>
  )
}

function AnimatedChar({
  char,
  delay,
  charIndex,
  scrollYProgress,
}: {
  char: string
  delay: number
  charIndex: number
  scrollYProgress?: MotionValue<number>
}) {
  // Hooks cannot be conditional, so always create the transform; when the caller
  // has no scroll progress to give us it tracks a motion value that never moves.
  const still = useMotionValue(0)
  const waveY = useTransform(scrollYProgress ?? still, (v: number) =>
    Math.sin(v * Math.PI * 2 + charIndex * 0.35) * 14 * v
  )
  return (
    <motion.span
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: 'easeOut' }}
      style={{ display: 'inline-block', y: scrollYProgress ? waveY : 0 }}
    >
      {char}
    </motion.span>
  )
}

export function AnimatedHeading({
  text,
  scrollYProgress,
  className = 'display-black',
  color = '#1A1A1A',
  fontSize = 'clamp(2rem, 5vw, 3.5rem)',
  charDelay = 26,
  baseDelay = 120,
  style,
}: {
  text: string
  scrollYProgress?: MotionValue<number>
  className?: string
  color?: string
  fontSize?: string
  charDelay?: number
  baseDelay?: number
  style?: React.CSSProperties
}) {
  const lines = text.split('\n')
  let globalIndex = 0

  /* The heading is rendered plain until hydration, then swapped for the
     animated version.

     It used to render the motion spans on the server, which meant the H1 —
     the page's largest element and usually its LCP — shipped in the HTML at
     `opacity: 0` and became visible only when JavaScript ran. Anyone whose JS
     failed got a page with no heading at all, a crawler got an invisible H1,
     and any context that throttles requestAnimationFrame left it stuck at
     zero. The first paint now carries real text, and the animation is an
     enhancement layered on top of it rather than the only route to legibility.

     The first client render matches the server render, so there is no
     hydration mismatch; the effect flips it on the next tick. */
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const headingStyle = { fontSize, lineHeight: 1.05, color, marginBottom: '1rem', ...style }

  if (!hydrated) {
    return (
      <h1 className={className} style={headingStyle}>
        {lines.map((line, lineIdx) => (
          <div key={lineIdx}>{line}</div>
        ))}
      </h1>
    )
  }

  return (
    <h1 className={className} style={headingStyle}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx}>
          {line.split(' ').map((word, wordIdx, wordsArr) => (
            <span
              key={wordIdx}
              style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                marginRight: wordIdx < wordsArr.length - 1 ? '0.28em' : 0,
              }}
            >
              {word.split('').map((char) => {
                const delay = baseDelay + globalIndex * charDelay
                const idx = globalIndex++
                return (
                  <AnimatedChar
                    key={idx}
                    char={char}
                    delay={delay}
                    charIndex={idx}
                    scrollYProgress={scrollYProgress}
                  />
                )
              })}
            </span>
          ))}
        </div>
      ))}
    </h1>
  )
}
