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
  /*  now paints amber, not ink. The prop name is kept because it
     means "the loud tone" at every call site and renaming it would touch every
     page for no gain; the class it sets, .page-header-ink, carries the control
     overrides for that ground. */
  const isInk = tone === 'ink'
  const fg = isInk ? '#241F16' : '#1A1A1A'
  const muted = isInk ? 'rgba(36,31,22,0.72)' : '#4A4A4A'

  return (
    <header
      /* The class carries the control inversion. `.field` and `.filter-pill`
         are drawn for a cream ground, so on ink they would be dark text in a
         dark box with an invisible border. Scoping the override to the header
         means any page that switches to `tone="ink"` gets legible controls
         without each one restyling its own filters. */
      className={isInk ? 'page-header page-header-ink' : 'page-header'}
      style={{
        backgroundColor: isInk ? '#FBBF24' : '#F0EBE3',
        backgroundImage: isInk ? 'var(--amber-pattern)' : undefined,
        borderBottom: isInk ? 'none' : '0.5px solid #E8E0D5',
        padding: '3.25rem 2rem 2.5rem',
      }}
    >
      <div className={isInk ? 'page-header-panel' : undefined} style={{ maxWidth: 'min(2200px, 94vw)', margin: '0 auto' }}>
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
