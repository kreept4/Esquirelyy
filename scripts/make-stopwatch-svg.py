#!/usr/bin/env python3
"""
Draw the deadline stopwatch, and write it into the repository as an SVG.

WHY THIS REPLACED A RED PILL. The countdown badge was a solid #B3261E lozenge
with white type. It was doing its job and it was the loudest object on a page
otherwise built from cream, ink, amber and mint, so it read as an alert box
bolted onto the design rather than as part of it. A mark is quieter than a
filled block at the same size and says "time" without having to shout it.

WHY PYTHON. The ship plan puts Python in the toolchain for repeatable site work
rather than one-off hand editing, and this is that: the geometry below is
computed, not typed. The tick ring in particular is thirty six rotated marks,
and hand-authoring those coordinates is how an SVG ends up with a tick two
degrees out that nobody ever notices or fixes.

⚠ THE OUTPUT IS COMMITTED, NOT GENERATED AT BUILD TIME. Next never runs Python,
so this writes a real file into public/ and the app imports that. Re-run it when
the design changes; do not wire it into the build.

Run: python scripts/make-stopwatch-svg.py
Idempotent. Writing the same inputs produces byte-identical output.
"""

from __future__ import annotations

import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icons" / "stopwatch.svg"

# The tracker already uses this for an overdue application (see .trk-next-days in
# globals.css). Reusing it means urgency is one colour across the product rather
# than a new red per surface. #B3261E, which this replaces, was a fourth.
RED = "#A3341F"
RED_DEEP = "#7E2415"
FACE = "#FFF4EF"

# ⚠ EVERY NUMBER BELOW IS SET FOR 16px, NOT FOR THE 24px VIEWBOX.
#
# The first version of this drew a properly divided dial: thirty six ticks, the
# minor ones at 0.6 stroke and half opacity. On a 24 unit grid rendered into 14
# CSS pixels that is a 0.35px line at 50% alpha, which is below what a display
# can resolve. The icon was technically correct and effectively invisible, which
# is the more common way an icon fails.
#
# So the rules here are legibility rules rather than drawing rules:
#   nothing thinner than 1 unit, which is ~0.7px at render size
#   no opacity below 1 on a structural line
#   twelve divisions, not thirty six
#   the case fills more of the box, so the silhouette carries at a glance
SIZE = 24
CX = CY = 12.0
R_BODY = 8.6          # the case, filling more of the box than before
R_FACE = 7.0          # inner dial, opened up so the hand has somewhere to live
R_TICK_OUT = 6.4      # outer end of a tick, sitting just inside the bezel
R_TICK_IN_MINOR = 5.5
R_TICK_IN_MAJOR = 5.3


def polar(cx: float, cy: float, r: float, deg: float) -> tuple[float, float]:
    """Screen coordinates for an angle measured clockwise from twelve o'clock."""
    rad = math.radians(deg - 90.0)
    return cx + r * math.cos(rad), cy + r * math.sin(rad)


def f(v: float) -> str:
    """Trim floats so the file is stable and small. 1.0 -> '1', 1.500 -> '1.5'."""
    return f"{v:.2f}".rstrip("0").rstrip(".")


def ticks() -> str:
    """Four quarter marks, and nothing else.

    Thirty six was right for a stopwatch and wrong for an icon; twelve was still
    wrong. Rendered at 16px and magnified, the twelve-tick ring filled the dial
    edge to edge and the whole mark came back as a brown blob with no clock in
    it at all. Four marks make the cross that reads as a clock face, and they
    leave the dial open enough for the hand to be seen against it.
    """
    out = []
    for i in range(4):
        deg = i * 90.0
        x1, y1 = polar(CX, CY, R_TICK_IN_MAJOR, deg)
        x2, y2 = polar(CX, CY, R_TICK_OUT, deg)
        out.append(
            f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke-width="1.5"/>'
        )
    return "\n      ".join(out)


def build() -> str:
    # The hand points to roughly ten seconds past. Not straight up: a vertical
    # hand sits exactly under the crown and the two merge into one stroke at
    # 16px, which is the size this is actually used at.
    hx, hy = polar(CX, CY, 4.2, 62.0)

    crown_top = CY - R_BODY - 1.9
    bx1, by1 = polar(CX, CY, R_BODY - 0.3, 48)
    bx2, by2 = polar(CX, CY, R_BODY + 1.3, 48)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" fill="none" role="img" aria-hidden="true">
  <title>Deadline approaching</title>

  <!-- ⚠ FLAT FILL, NOT A GRADIENT. The first version ran {RED} to {RED_DEEP}
       vertically down the case. At 16px that spans about eleven pixels, so the
       ramp was invisible as a gradient and only had the effect of lightening
       the top half against the page, which cost contrast for nothing. A solid
       case reads harder and is one less thing to render. -->
  <circle cx="{f(CX)}" cy="{f(CY)}" r="{f(R_BODY)}" fill="{RED_DEEP}"/>
  <circle cx="{f(CX)}" cy="{f(CY)}" r="{f(R_BODY - 0.9)}" fill="{RED}"/>
  <circle cx="{f(CX)}" cy="{f(CY)}" r="{f(R_FACE)}" fill="{FACE}"/>

  <!-- Crown at twelve and the start button at one o'clock. These two are what
       separate a stopwatch from a plain clock at any size, so they are drawn
       heavier than scale strictly wants. -->
  <g stroke="{RED_DEEP}" stroke-linecap="round">
    <line x1="{f(CX)}" y1="{f(crown_top)}" x2="{f(CX)}" y2="{f(CY - R_BODY + 0.8)}" stroke-width="3"/>
    <line x1="{f(CX - 2.1)}" y1="{f(crown_top + 0.1)}" x2="{f(CX + 2.1)}" y2="{f(crown_top + 0.1)}" stroke-width="2"/>
    <line x1="{f(bx1)}" y1="{f(by1)}" x2="{f(bx2)}" y2="{f(by2)}" stroke-width="2.2"/>
  </g>

  <!-- The dial. -->
  <g stroke="{RED_DEEP}" stroke-linecap="round">
      {ticks()}
  </g>

  <!-- Hand and pinion. -->
  <line x1="{f(CX)}" y1="{f(CY)}" x2="{f(hx)}" y2="{f(hy)}"
        stroke="{RED_DEEP}" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="{f(CX)}" cy="{f(CY)}" r="1.15" fill="{RED_DEEP}"/>
</svg>
"""


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    svg = build()
    OUT.write_text(svg, encoding="utf-8", newline="\n")
    print(f"wrote {OUT.relative_to(OUT.parents[2])}  ({len(svg)} bytes)")
    print(f"  colour   {RED} -> {RED_DEEP}, matching .trk-next-days in globals.css")
    print("  ticks    4 quarter marks, sized for a 16px render")


if __name__ == "__main__":
    main()
