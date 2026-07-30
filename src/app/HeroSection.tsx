'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import Link from 'next/link'

const HERO_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'

const NAV_LINKS = [
  { href: '/jobs', label: 'Jobs' },
  { href: '/firms', label: 'Firms' },
  { href: '/tools/cv-review', label: 'Tools' },
  { href: '/opportunities', label: 'Opportunities' },
]

function FadeIn({ children, delay = 0, duration = 1000 }: { children: React.ReactNode; delay?: number; duration?: number }) {
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

function AnimatedChar({ char, delay, scrollYProgress, charIndex }: { char: string; delay: number; scrollYProgress: MotionValue<number>; charIndex: number }) {
  const waveY = useTransform(scrollYProgress, (v) => Math.sin(v * Math.PI * 2 + charIndex * 0.35) * 14 * v)
  return (
    <motion.span
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: 'easeOut' }}
      style={{ display: 'inline-block', y: waveY }}
    >
      {char}
    </motion.span>
  )
}

function AnimatedHeading({ text, scrollYProgress }: { text: string; scrollYProgress: MotionValue<number> }) {
  const lines = text.split('\n')
  const charDelay = 30
  const baseDelay = 200
  let globalIndex = 0
  return (
    <h1 className="space-mono-bold" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.02em', lineHeight: 1.05, color: '#FAF6F0', marginBottom: '1.25rem' }}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx}>
          {line.split(' ').map((word, wordIdx, wordsArr) => (
            <span key={wordIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: wordIdx < wordsArr.length - 1 ? '0.28em' : 0 }}>
              {word.split('').map((char) => {
                const delay = baseDelay + (lineIdx * line.length * charDelay) + (globalIndex * charDelay)
                const idx = globalIndex++
                return <AnimatedChar key={idx} char={char} delay={delay} scrollYProgress={scrollYProgress} charIndex={idx} />
              })}
            </span>
          ))}
        </div>
      ))}
    </h1>
  )
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <motion.div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 1.5rem 3rem', maxWidth: '1280px', margin: '0 auto', opacity: useTransform(scrollYProgress, [0, 0.35], [1, 0]) }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'end' }}>
          <div>
            <AnimatedHeading text={'Your legal career\nstarts here.'} scrollYProgress={scrollYProgress} />
            <FadeIn delay={800} duration={1000}>
              <p className="space-mono-regular" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Jobs, vacation schemes, pupillages, and scholarships across law firms, corporates, and institutions, verified and updated daily.
              </p>
            </FadeIn>
            <FadeIn delay={1200} duration={1000}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link href="/jobs" className="space-mono-bold" style={{ background: '#FAF6F0', color: '#1A1A1A', padding: '0.85rem 2rem', borderRadius: '0.5rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Browse Opportunities
                </Link>
                <Link href="/tracker" className="liquid-glass space-mono-bold" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#FAF6F0', padding: '0.85rem 2rem', borderRadius: '0.5rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Track Applications
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </motion.div>


    </div>
  )
}
