const fs = require('fs');
const path = require('path');

// --- 1. Create HeroSection.tsx ---
const heroPath = path.join('src', 'app', 'HeroSection.tsx');

const heroContent = `'use client'

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
    <div className="transition-opacity" style={{ opacity: visible ? 1 : 0, transitionDuration: \`\${duration}ms\` }}>
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
      {char === ' ' ? '\\u00A0' : char}
    </motion.span>
  )
}

function AnimatedHeading({ text, scrollYProgress }: { text: string; scrollYProgress: MotionValue<number> }) {
  const lines = text.split('\\n')
  const charDelay = 30
  const baseDelay = 200
  let globalIndex = 0
  return (
    <h1 className="space-mono-bold" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.02em', lineHeight: 1.05, color: '#FAF6F0', marginBottom: '1.25rem' }}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx}>
          {line.split('').map((char, charIdx) => {
            const delay = baseDelay + (lineIdx * line.length * charDelay) + (charIdx * charDelay)
            const idx = globalIndex++
            return <AnimatedChar key={idx} char={char} delay={delay} scrollYProgress={scrollYProgress} charIndex={idx} />
          })}
        </div>
      ))}
    </h1>
  )
}

function HeroNav({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 110, opacity }}>
      <div style={{ padding: '1.5rem 1.5rem 0' }}>
        <nav className="liquid-glass" style={{ borderRadius: '0.75rem', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1280px', margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="space-mono-bold" style={{ fontSize: '1.35rem', color: '#FAF6F0', letterSpacing: '-0.02em' }}>Esquirely.</span>
          </Link>
          <div style={{ alignItems: 'center', gap: '2rem' }} className="hero-nav-links">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="space-mono-regular" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
          <Link href="/auth/signup" className="space-mono-bold" style={{ background: '#FAF6F0', color: '#1A1A1A', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.78rem', textDecoration: 'none' }}>
            Join Esquirely
          </Link>
        </nav>
      </div>
      <style>{\`
        .hero-nav-links { display: none; }
        @media (min-width: 769px) { .hero-nav-links { display: flex !important; } }
      \`}</style>
    </motion.header>
  )
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const navOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0])

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <HeroNav opacity={navOpacity} />

      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 1.5rem 3rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'end' }}>
          <div>
            <AnimatedHeading text={'Your legal career\\nstarts here.'} scrollYProgress={scrollYProgress} />
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
          <div className="hero-tag-col" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass" style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem' }}>
                <span className="space-mono-regular" style={{ fontSize: '1.1rem', color: '#FAF6F0', fontWeight: 300 }}>Jobs. Firms. Careers.</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      <style>{\`
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-tag-col { justify-content: flex-end !important; }
        }
      \`}</style>
    </div>
  )
}
`;

fs.writeFileSync(heroPath, heroContent, 'utf8');
console.log('✓ HeroSection.tsx created');

// --- 2. Patch Navbar.tsx: hide cream nav while hero is in view on homepage ---
const navPath = path.join('src', 'components', 'layout', 'Navbar.tsx');
let nav = fs.readFileSync(navPath, 'utf8');
let patched = 0;

// 2a. Add heroActive state after scrolled state
const scrolledStateRe = /const \[scrolled, setScrolled\] = useState\(false\)/;
if (scrolledStateRe.test(nav) && !nav.includes('heroActive')) {
  nav = nav.replace(scrolledStateRe, `const [scrolled, setScrolled] = useState(false)\r\n  const [heroActive, setHeroActive] = useState(false)`);
  patched++;
}

// 2b. Add useEffect for heroActive, right after the scroll-listener useEffect
const scrollEffectRe = /(const handler = \(\) => setScrolled\(window\.scrollY > 20\)[\s\S]*?return \(\) => window\.removeEventListener\('scroll', handler\)\r?\n\s*\}, \[\]\))/;
if (scrollEffectRe.test(nav) && !nav.includes('setHeroActive')) {
  nav = nav.replace(scrollEffectRe, `$1

  useEffect(() => {
    if (pathname !== '/') { setHeroActive(false); return }
    const heroHandler = () => setHeroActive(window.scrollY < window.innerHeight - 100)
    heroHandler()
    window.addEventListener('scroll', heroHandler)
    return () => window.removeEventListener('scroll', heroHandler)
  }, [pathname])`);
  patched++;
}

// 2c. Add opacity/pointerEvents to header style based on heroActive
const headerStyleRe = /(backdropFilter: scrolled \? 'blur\(12px\)' : 'none', transition: 'all 0\.3s ease')(\s*\}\}>)/;
if (headerStyleRe.test(nav) && !nav.includes('pointerEvents: heroActive')) {
  nav = nav.replace(headerStyleRe, `$1, opacity: heroActive ? 0 : 1, pointerEvents: heroActive ? 'none' : 'auto'$2`);
  patched++;
}

if (patched === 3) {
  fs.writeFileSync(navPath, nav, 'utf8');
  console.log('✓ Navbar.tsx patched (3/3 edits applied)');
} else {
  console.log(\`✗ Navbar.tsx: only \${patched}/3 edits matched — not saving, needs manual check\`);
}
