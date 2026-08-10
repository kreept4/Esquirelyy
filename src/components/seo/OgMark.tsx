/**
 * The Esquirely mark, for share cards.
 *
 * ONE DRAWING, NOT THREE. The mark used to be redrawn in every file that needed
 * it: icon.svg drew four rectangles, and both share cards set a capital E as
 * text inside a circle and let the renderer pick the face. The favicon and the
 * share card of the same link sit inches apart in a chat client, so the two
 * were visibly different letters in the one place a mismatch cannot be missed.
 *
 * The geometry below is icon.svg's, on its own 32 unit grid, so the two files
 * can be compared line by line. icon.svg stays hand-written rather than
 * generated from this: it is served as a static asset by the browser, not
 * rendered by Satori, and a favicon that depends on a React component to exist
 * is a favicon that can fail to exist.
 *
 * Rectangles rather than text also removes the last font dependency from the
 * cards. See the note in src/app/opengraph-image.tsx.
 */

/** Bars of the E on icon.svg's 32 unit grid. Keep in step with that file. */
const BARS = [
  { x: 7, y: 6, w: 4, h: 20 },
  { x: 7, y: 6, w: 18, h: 4 },
  { x: 7, y: 14, w: 13, h: 4 },
  { x: 7, y: 22, w: 18, h: 4 },
]

const GRID = 32

export default function OgMark({ size }: { size: number }) {
  const u = (n: number) => (n * size) / GRID

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: '#FBBF24',
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
            // Rounds away at tile sizes and is visible at card size, which is
            // what icon.svg's rx="1" does too.
            borderRadius: u(1),
            backgroundColor: '#241F16',
          }}
        />
      ))}
    </div>
  )
}
