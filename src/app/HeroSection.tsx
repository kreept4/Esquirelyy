'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { AnimatedHeading, FadeIn } from '@/components/motion/AnimatedText'

const HERO_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          // Deliberately NOT a centred max-width box: the headline should sit in
          // the real bottom-left corner of the viewport, not at the left edge of
          // a centred column, which is what made it read as centred on wide screens.
          padding: '0 clamp(1.25rem, 4vw, 4rem) clamp(2rem, 5vh, 3.5rem)',
          opacity: overlayOpacity,
        }}
      >
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'end' }}>
          <div>
            <AnimatedHeading
              text={'Your legal career\nstarts here.'}
              scrollYProgress={scrollYProgress}
              color="#FAF6F0"
              fontSize="clamp(3rem, 8.5vw, 7.5rem)"
              charDelay={30}
              baseDelay={200}
              style={{ marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: 0.95, textShadow: '0 2px 40px rgba(0,0,0,0.35)' }}
            />
            <FadeIn delay={800} duration={1000}>
              <p className="grotesk-regular" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Jobs, vacation schemes, pupillages, and scholarships across law firms, corporates, and institutions, verified and updated daily.
              </p>
            </FadeIn>
            <FadeIn delay={1200} duration={1000}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link href="/jobs" className="grotesk-bold" style={{ background: '#FAF6F0', color: '#1A1A1A', padding: '0.85rem 2rem', borderRadius: '0.5rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Browse Opportunities
                </Link>
                <Link href="/tracker" className="liquid-glass grotesk-bold" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#FAF6F0', padding: '0.85rem 2rem', borderRadius: '0.5rem', fontSize: '0.85rem', textDecoration: 'none' }}>
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
