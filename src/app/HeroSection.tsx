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
    <div ref={containerRef} className="vh-full" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
      {/* Held back to 70% against the black ground behind it. At full strength
          the footage competed with the headline sitting on top of it: bright
          moving detail directly behind white type, with nothing between them but
          a text shadow. Dimming the video rather than laying a scrim over it
          keeps the one element and costs no extra paint, and the black backdrop
          does the darkening for free.

          ⚠ THE POSTER IS THE VIDEO'S OWN FIRST FRAME, and that is the whole
          point of it. The file is 13.7MB from CloudFront, so on a cold load
          there were several seconds of the container's black showing through
          before the first frame arrived: the hero opened on a black rectangle
          with the headline animating over nothing. A poster fills exactly that
          gap, and taking it from frame one rather than from a nice-looking
          moment later in the clip means playback starts on the image already on
          screen instead of cutting to a different scene.

          preload="auto" because this is the first thing on the page and there
          is nothing to save bandwidth for; "metadata" would fetch the header,
          learn the dimensions, and still leave the poster sitting there.

          ⚠ THE REF IS NOT DECORATION EITHER. React does not emit a `muted`
          ATTRIBUTE into server-rendered HTML: it sets the property after
          hydration. Mobile Safari and Chrome on Android read the attribute when
          they decide whether an autoplaying video is allowed, so on a phone the
          element was, for its first moments, an unmuted autoplaying video.
          Autoplay is refused for those, and a refused autoplay is exactly what
          puts the big play button on top of it. Setting the attribute and the
          property on mount, then asking for playback and swallowing the refusal,
          is what actually gets it running.

          The catch is empty on purpose. iOS Low Power Mode blocks playback
          outright and no amount of asking changes that; the honest outcome
          there is the poster sitting still, which is a still hero rather than a
          broken one. */}
      <video
        ref={el => {
          if (!el) return
          el.setAttribute('muted', '')
          el.muted = true
          el.play().catch(() => {})
        }}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        preload="auto"
        poster="/hero-poster.jpg"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
      >
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
                Jobs, internships, and scholarships across law firms, corporates, and institutions, verified and updated daily.
              </p>
            </FadeIn>
            <FadeIn delay={1200} duration={1000}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link href="/jobs" className="grotesk-bold" style={{ background: '#14B8A6', color: '#FFFFFF', padding: '0.85rem 2rem', borderRadius: '0.5rem', fontSize: '0.85rem', textDecoration: 'none' }}>
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
