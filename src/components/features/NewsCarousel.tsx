'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { KIND_LABEL, type NewsItem } from '@/lib/news-data'

/**
 * Headline carousel, sitting in the dark run between the logo ticker and the
 * role pit.
 *
 * Glass rather than a solid card: the section behind it is ink, so a
 * translucent panel with a blur reads as a pane laid over the page instead of
 * another opaque block in a stack of opaque blocks. `backdrop-filter` is not
 * universal, so the panel also carries a real translucent background; where the
 * blur is unsupported it degrades to a tinted pane rather than to nothing.
 *
 * Three things an auto-advancing carousel has to get right, all of which are
 * usually skipped:
 *
 * It stops when you are reading it. Hover, focus anywhere inside, and tab
 * visibility all pause the timer. A slide that changes mid-sentence is worse
 * than no rotation at all.
 *
 * It is operable without the mouse. The arrows are real buttons, the slide is a
 * live region so a screen reader is told when the content changes, and every
 * off-screen slide is inert so Tab cannot land inside something invisible.
 *
 * It honours prefers-reduced-motion by not auto-advancing at all. Motion the
 * user did not ask for is precisely what that setting is about, and the arrows
 * still give them the whole set.
 */

const INTERVAL_MS = 6500

const isExternal = (href: string) => /^https?:\/\//i.test(href)

/**
 * A solid colour field per kind, not a tint over glass.
 *
 * Translucency and blur were the wrong instinct here: they are the default
 * look of every AI-generated hero on the web, and against an ink section a
 * frosted pane just reads as slightly lighter ink. Flat saturated colour with a
 * hard border and a hard offset shadow is the language the rest of this site
 * already speaks (the carton apply card, the ball pit), and it is what makes
 * the panel look drawn rather than generated.
 *
 * `fg` is fixed per palette rather than derived, so contrast is a decision
 * rather than the output of a luminance threshold sitting near its boundary.
 * `panel` is the deeper tone of the same hue, used for the side block.
 */
type Palette = { bg: string; fg: string; panel: string; onPanel: string }

/**
 * One ground for every slide: carton.
 *
 * This replaced a seven-hue rotation, sky through amber, that changed the
 * background every six seconds. It was doing real work — consecutive slides
 * could never look identical — but it also meant the largest block on the
 * homepage was a colour the rest of the page never uses, and it changed while
 * you were reading it. Carton is the stock the site already reserves for the
 * things it wants you to act on, and it is the exact ground the practice site's
 * primary button is drawn on, so the carousel now belongs to the same object
 * family as the ambassador card and the role detail panel.
 *
 * The variety has not gone, it has moved into the artwork: each illustration
 * keeps its own accent, so the slides still differ, they simply differ in what
 * is drawn rather than in what they are drawn on.
 *
 * Kept as an array of one so `paletteFor` and the four custom properties stay
 * exactly as they were. Restoring a rotation is a matter of adding rows back.
 */
const PALETTES: Palette[] = [
  { bg: '#FFF8E5', fg: '#241F16', panel: '#241F16', onPanel: '#FFF8E5' }, // carton
]

const paletteFor = (i: number): Palette => PALETTES[i % PALETTES.length]

/**
 * Shaft and chevron, not a bare chevron.
 *
 * A lone chevron is the default every component library ships and it reads as
 * "there is more" rather than as a control you press. Drawing the shaft turns
 * it into an arrow with a direction, and it is the same geometry as the primary
 * button on the practice site, so the two properties point the same way.
 *
 * Two of these sit in each button on a track that slides on hover: the visible
 * one leaves in the direction it points and its twin arrives behind it. The
 * whole effect is one transform on one element.
 */
const Arrow = () => (
  <svg viewBox="0 0 18 17" fill="none" className="news-arrow-glyph">
    <path d="M1.1 8.4h15.1" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.6 1.1l7.6 7.3-7.6 7.3" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function NewsCarousel({ items }: { items: NewsItem[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  const count = items.length
  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  /**
   * Auto-advance.
   *
   * The timer is torn down and rebuilt whenever `index` changes, so pressing an
   * arrow restarts the full dwell rather than leaving a partly-elapsed timer to
   * fire a moment later. That stutter is the most common carousel bug.
   */
  useEffect(() => {
    if (paused || count < 2) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setTimeout(() => setIndex(i => (i + 1) % count), INTERVAL_MS)
    return () => window.clearTimeout(id)
  }, [index, paused, count])

  /** A carousel rotating in a tab nobody is looking at is wasted work. */
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  /** Arrow keys, but only while the carousel actually has focus. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  }

  if (!count) return null

  return (
    <section
      ref={rootRef}
      className="news-carousel"
      aria-roledescription="carousel"
      aria-label="Latest from Esquirely"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={e => {
        // Only resume once focus has left the carousel entirely.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
      }}
      onKeyDown={onKeyDown}
    >
      <div className="shell news-carousel-inner">
        <div
          className="news-card"
          /* The whole card takes the active slide's palette and transitions
             between them, so advancing changes the colour of the object rather
             than sliding a new tint across a fixed one. */
          style={
            {
              '--bg': paletteFor(index).bg,
              '--fg': paletteFor(index).fg,
              '--panel': paletteFor(index).panel,
              '--on-panel': paletteFor(index).onPanel,
            } as React.CSSProperties
          }
        >
          {/* Dwell indicator. Restarted by keying on index, and frozen rather
              than reset while paused, so hovering holds the bar where it is
              instead of lying about how long is left. */}
          <div className="news-progress" aria-hidden>
            <span
              key={index}
              className="news-progress-fill"
              style={{
                animationDuration: `${INTERVAL_MS}ms`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
            />
          </div>

          <span className="display-black news-index" aria-hidden>
            {String(index + 1).padStart(2, '0')}
            <span className="news-index-total">/{String(count).padStart(2, '0')}</span>
          </span>

          <div className="news-viewport">
            <div
              className="news-track"
              style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
            >
              {items.map((item, i) => {
                const active = i === index
                /* Decorative throughout: the headline and summary beside it
                   already say everything the picture says, so a screen reader
                   gets nothing new from describing it.
                   Declared separately and rendered AFTER the copy: both are
                   grid items, and emitting the figure first put it in the wide
                   1fr track while the copy was squeezed into the narrow one. */
                const figure = item.media ? (
                      <span
                        className={[
                          'news-figure',
                          item.media.type === 'logos' ? 'news-figure-splash' : '',
                          item.media.type === 'photo' ? 'news-figure-photo' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-hidden
                      >
                        {item.media.type === 'logos' ? (
                          /* Paint splashes rather than balls. Six irregular
                             border-radius shapes cycle so no two neighbours are
                             the same blob, each rotated a little, and the deep
                             side panel is dropped so the marks land straight on
                             the slide's colour. */
                          <span className="news-splashes">
                            {item.media.slugs.map((slug, n) => (
                              <span key={slug} className="news-splash" data-n={n % 6}>
                                <img src={`/firm-logos/${slug}.png`} alt="" loading="lazy" />
                              </span>
                            ))}
                          </span>
                        ) : item.media.type === 'photo' ? (
                          /* A photograph fills the panel edge to edge. Putting
                             it on a plate would frame a picture of a person as
                             though it were a logo. */
                          <>
                            <img
                              className="news-photo"
                              src={item.media.src}
                              alt=""
                              loading="lazy"
                            />
                            <span className="grotesk-regular news-credit">{item.media.credit}</span>
                          </>
                        ) : (
                          /* The illustrations were recoloured for a cream page,
                             so on a saturated panel they sit in their own light
                             plate rather than floating on a colour they were
                             never drawn against. */
                          <span className="news-illustration-plate">
                            <img
                              className="news-illustration"
                              src={item.media.src}
                              alt=""
                              loading="lazy"
                            />
                          </span>
                        )}
                      </span>
                ) : null

                /* The CTA is the link, not the slide.
                 *
                 * The whole panel used to be one anchor, which meant a thumb
                 * resting anywhere on a card that is most of the screen wide
                 * navigated away — and on a carousel that also moves under you,
                 * that is a tap nobody intended. The pill and the arrows are
                 * now the only things that respond. */
                const cta = item.href ? (
                  isExternal(item.href) ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grotesk-bold news-cta"
                    >
                      {item.cta ?? 'Read more'}
                      <ArrowRight size={14} aria-hidden />
                    </a>
                  ) : (
                    <Link href={item.href} className="grotesk-bold news-cta">
                      {item.cta ?? 'Read more'}
                      <ArrowRight size={14} aria-hidden />
                    </Link>
                  )
                ) : null

                const body = (
                  <>
                    <span className="news-copy">
                    <span className="grotesk-bold news-kind">{KIND_LABEL[item.kind]}</span>
                    <p className="display-black news-title">{item.title}</p>
                    <p className="grotesk-regular news-summary">{item.summary}</p>
                    {cta}
                    </span>
                    {figure}
                  </>
                )

                return (
                  <div
                    key={item.slug}
                    className="news-slide"
                    /* Each slide carries its own colour, so the field travels
                       with the content. Painting the card instead meant the
                       background cross-faded on its own clock while the track
                       slid on another, and for a few hundred milliseconds the
                       incoming slide wore the outgoing slide's colour. */
                    style={
                      {
                        '--bg': paletteFor(i).bg,
                        '--fg': paletteFor(i).fg,
                        '--panel': paletteFor(i).panel,
                        '--on-panel': paletteFor(i).onPanel,
                      } as React.CSSProperties
                    }
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${count}`}
                    /* Hides off-screen slides from tab order and from assistive
                       tech. Without it Tab walks into links the eye cannot see
                       and the page scrolls sideways on its own.
                       React 19 takes `inert` as a real boolean; passing the
                       empty string it wanted in older versions is read as
                       false and warns. */
                    inert={!active}
                    aria-hidden={!active}
                  >
                    <div className="news-slide-link news-slide-static">{body}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="news-controls">
            <div className="news-dots" role="tablist" aria-label="Choose a slide">
              {items.map((item, i) => (
                <button
                  key={item.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}: ${item.title}`}
                  className="news-dot"
                  data-active={i === index}
                  onClick={() => go(i)}
                />
              ))}
            </div>

            <div className="news-arrows">
              <button type="button" className="news-arrow" data-dir="prev" onClick={prev} aria-label="Previous slide">
                <span className="news-arrow-track" aria-hidden>
                  <Arrow />
                  <Arrow />
                </span>
              </button>
              <button type="button" className="news-arrow" data-dir="next" onClick={next} aria-label="Next slide">
                <span className="news-arrow-track" aria-hidden>
                  <Arrow />
                  <Arrow />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Announced to screen readers on change; the visual slide itself is
            not a live region because that would re-read the whole panel. */}
        <p className="sr-only" aria-live="polite">
          {items[index].title}
        </p>
      </div>
    </section>
  )
}
