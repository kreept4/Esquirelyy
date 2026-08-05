/**
 * A firm mark, floating on a common optical line.
 *
 * Floating at all is only possible because the marks are transparent PNGs
 * cropped to their own ink by scripts/normalise-logos.mjs. The bucket originals
 * are opaque (24 of 30 are JPEG or ICO, which cannot hold alpha) and would each
 * drag a rectangle onto the black band.
 *
 * Sizing went through equal-AREA normalisation first, and it was wrong. Holding
 * area constant means a tall stacked lockup like DealHQ (mark above wordmark,
 * roughly 1:1) claims a large bounding box to reach the target area, so it
 * towered over a single-line wordmark like Detail sitting in the same row. Area
 * is not what the eye compares in a row of logos.
 *
 * What a logo wall actually wants is a common CAP HEIGHT, the way a typographer
 * sets a line: every mark gets the same vertical measure, and width follows from
 * its own proportions. That only works once the art is trimmed, because baked-in
 * padding would otherwise set the height instead of the ink.
 *
 * One correction on top. At an identical height, a square mark reads heavier
 * than a long thin wordmark, because it carries far more area. So the height is
 * eased down for squarer marks: full cap height for anything 3:1 or wider,
 * tapering to SQUARE_SCALE at 1:1 and below. That is the standard optical fudge,
 * and it is what makes a mixed row look level rather than lumpy.
 */

export interface LogoFrameProps {
  src: string
  alt?: string
  /** Cap height for a wide wordmark, in rem. Squarer marks sit below it. */
  capHeight?: number
  /** Ceiling on width, in rem, so a very wide lockup cannot run away. */
  maxWidth?: number
  /**
   * Draw a light chip behind the mark.
   *
   * TEMPORARY, and it should come off once the logos are re-sourced.
   *
   * Keying the white ground out of an opaque JPEG also deletes the white INSIDE
   * the logo: white text, the counters in letterforms, highlights. Nothing can
   * separate background-white from artwork-white when they are the same pixels,
   * so the keyed marks came back as thin skeletons with the life gone out of
   * them. Until each firm's real transparent art is in place, the marks render
   * from their untouched originals on a plate, which keeps every pixel.
   */
  plate?: boolean
  className?: string
}

/** The inset the mark is fitted into, as a fraction of the plate.
 *
 *  Deliberately plain `contain` within a fixed box. Two cleverer schemes came
 *  first and both made things worse. Equal-AREA normalisation let a tall stacked
 *  lockup claim a huge bounding box and tower over the wordmarks. Aspect-eased
 *  cap heights then fought this width ceiling: a 5:1 wordmark was clamped by
 *  width and ended up shorter than the square marks, which is exactly backwards.
 *
 *  Both were compensating for baked-in padding, and the trim step in
 *  scripts/normalise-logos.mjs has since removed that at the source. With every
 *  mark cropped to its own ink, the naive fit is the even one: square marks meet
 *  the height bound, wide marks meet the width bound, and the row reads level. */
const INSET_W = 0.78
const INSET_H = 0.6

export default function LogoFrame({
  src,
  alt = '',
  capHeight = 2.5,
  maxWidth = 9,
  plate = false,
  className,
}: LogoFrameProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        // The box is a fixed slot so marquee spacing never lurches, but it is
        // the mark's own height that does the visual work inside it.
        height: plate ? `${capHeight * 1.9}rem` : `${capHeight}rem`,
        width: `${maxWidth}rem`,
        backgroundColor: plate ? '#FAF7F2' : undefined,
        borderRadius: plate ? '10px' : undefined,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          maxWidth: `${INSET_W * 100}%`,
          maxHeight: `${INSET_H * 100}%`,
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </span>
  )
}
