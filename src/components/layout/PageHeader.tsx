'use client'

import { AnimatedHeading, FadeIn } from '@/components/motion/AnimatedText'

/**
 * The inner-page header, built on the same primitives as the home hero.
 *
 * Large display heading, supporting subcopy, then optional controls
 * (search, filters). Every inner page
 * uses this instead of hand-rolling the block, so spacing and motion stay
 * identical across the site.
 */
export default function PageHeader({
  heading,
  subcopy,
  children,
  tone = 'cream',
}: {
  heading: string
  subcopy?: string
  children?: React.ReactNode
  tone?: 'cream' | 'ink'
}) {
  const isInk = tone === 'ink'
  const fg = isInk ? '#FAF6F0' : '#1A1A1A'
  const muted = isInk ? 'rgba(250,246,240,0.7)' : '#4A4A4A'

  return (
    <header
      style={{
        backgroundColor: isInk ? '#1A1A1A' : '#F0EBE3',
        borderBottom: isInk ? 'none' : '0.5px solid #E8E0D5',
        padding: '3.25rem 2rem 2.5rem',
      }}
    >
      <div style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto' }}>
        <AnimatedHeading
          text={heading}
          color={fg}
          fontSize="clamp(2rem, 5vw, 3.25rem)"
          style={{ marginBottom: subcopy ? '0.85rem' : '1.5rem' }}
        />

        {subcopy && (
          <FadeIn delay={420} duration={900}>
            <p
              className="grotesk-regular"
              style={{
                fontSize: '0.95rem',
                color: muted,
                lineHeight: 1.7,
                maxWidth: '620px',
                marginBottom: children ? '1.75rem' : 0,
              }}
            >
              {subcopy}
            </p>
          </FadeIn>
        )}

        {children && (
          <FadeIn delay={620} duration={900}>
            {children}
          </FadeIn>
        )}
      </div>
    </header>
  )
}
