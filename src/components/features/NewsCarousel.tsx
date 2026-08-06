'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
 * Indexed by position, not by kind.
 *
 * Keying colour to the kind meant every tip was violet and every update teal,
 * so a run of three tips was three identical slides and the carousel looked
 * stuck. Cycling by position guarantees consecutive slides differ, which is the
 * whole reason to colour them at all.
 *
 * The hues are the ones the feature section already scrolls through, so the
 * page has one palette rather than two. `fg` is fixed per entry rather than
 * derived from luminance: several of these sit close enough to the light/dark
 * boundary that a threshold would flip on rounding, and contrast here should be
 * a decision. `panel` is the deep tone of the same hue for the side block.
 */
const PALETTES: Palette[] = [
  { bg: '#38BDF8', fg: '#08202B', panel: '#0C4A63', onPanel: '#EAF7FE' }, // sky
  { bg: '#F97316', fg: '#2A1103', panel: '#7C3306', onPanel: '#FFF1E6' }, // orange
  { bg: '#8B5CF6', fg: '#FBF8FF', panel: '#3A1D85', onPanel: '#EDE6FF' }, // violet
  { bg: '#22C55E', fg: '#062611', panel: '#0A5C2B', onPanel: '#E9FBEF' }, // green
  { bg: '#EF4444', fg: '#FFF4F4', panel: '#7C1B1B', onPanel: '#FFE9E9' }, // red
  { bg: '#14B8A6', fg: '#04211E', panel: '#0A4F49', onPanel: '#E6FAF7' }, // teal
  { bg: '#FBBF24', fg: '#2B1D02', panel: '#7A5606', onPanel: '#FFF8E6' }, // amber
]

const paletteFor = (i: number): Palette => PALETTES[i % PALETTES.length]

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

                const body = (
                  <>
                    <span className="news-copy">
                    <span className="grotesk-bold news-kind">{KIND_LABEL[item.kind]}</span>
                    <p className="display-black news-title">{item.title}</p>
                    <p className="grotesk-regular news-summary">{item.summary}</p>
                    {item.href && (
                      <span className="grotesk-bold news-cta">
                        {item.cta ?? 'Read more'}
                        <ArrowRight size={14} aria-hidden />
                      </span>
                    )}
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
                    {item.href ? (
                      /* An external headline leaves the site, so it gets a
                         plain anchor with a new tab and noopener. Routing it
                         through next/link would prefetch a third-party page. */
                      isExternal(item.href) ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-slide-link"
                        >
                          {body}
                        </a>
                      ) : (
                        <Link href={item.href} className="news-slide-link">
                          {body}
                        </Link>
                      )
                    ) : (
                      <div className="news-slide-link news-slide-static">{body}</div>
                    )}
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
              <button type="button" className="news-arrow" onClick={prev} aria-label="Previous slide">
                <ChevronLeft size={17} aria-hidden />
              </button>
              <button type="button" className="news-arrow" onClick={next} aria-label="Next slide">
                <ChevronRight size={17} aria-hidden />
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
