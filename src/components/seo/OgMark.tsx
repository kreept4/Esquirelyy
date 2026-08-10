/**
 * The Esquirely mark, for share cards.
 *
 * ONE DRAWING, NOT THREE. icon.svg, the site share card and the firm share
 * cards all need this mark, and each of them used to draw its own: the favicon
 * as rectangles, the cards as a capital E set in whatever face the renderer
 * happened to resolve. The favicon and the share card of the same link sit
 * inches apart in a chat client, so those were visibly different letters in the
 * one place a mismatch cannot be missed.
 *
 * The geometry is the supplied logo's, measured off the file by scanning its
 * ink mask rather than redrawn by eye. Note the three arms are three different
 * lengths, 43, 34 and 46 on a 100 grid; that asymmetry is in the source and is
 * the first thing an eyeballed copy would flatten.
 *
 * icon.svg carries the same numbers and stays hand-written rather than being
 * generated from this. It is served as a static asset by the browser, not
 * rendered by Satori, and a favicon that depends on a React component in order
 * to exist is a favicon that can fail to exist. Change one, change the other.
 *
 * Rectangles rather than text also mean the cards need no font at all.
 */

/** The supplied file's own colours, sampled from it. Close to, but not the
 *  same as, --amber and --on-amber in globals.css. The logo is the reference. */
export const MARK_AMBER = '#FCB712'
export const MARK_INK = '#1D1910'

/** Bars of the E on a 100 unit grid, as measured. Keep in step with icon.svg. */
const BARS = [
  { x: 28, y: 21, w: 12, h: 59 },
  { x: 28, y: 21, w: 43, h: 11 },
  { x: 28, y: 44, w: 34, h: 12 },
  { x: 28, y: 68, w: 46, h: 12 },
]

const GRID = 100

/**
 * `size` is the side of the square tile. `bare` draws the letter alone, with no
 * amber behind it, for use where the amber is already the ground.
 */
export default function OgMark({ size, bare = false }: { size: number; bare?: boolean }) {
  const u = (n: number) => (n * size) / GRID

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: size,
        height: size,
        ...(bare ? {} : { backgroundColor: MARK_AMBER }),
      }}
    >
      {BARS.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: u(b.x),
            top: u(b.y),
            width: u(b.w),
            height: u(b.h),
            backgroundColor: MARK_INK,
          }}
        />
      ))}
    </div>
  )
}
