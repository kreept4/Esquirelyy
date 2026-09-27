# Esquirely: One Shape

A 14-second looping motion piece for Esquirely, made entirely in code. There is no After Effects and no stock music.

One shape morphs through twelve product states over 7 bars at 120 BPM, and something happens on every beat. A cursor drives the changes with real clicks and drags.

There are two cuts:

- **`esquirely-motion.mp4`** (17 s) is the one to post. The piece plays once, then ends: the click lands on bar 8's downbeat, the headline scrolls away, the shape turns into the amber E mark, builds its bars and the wordmark slides out beside it, with esquirely.com.ng beneath, and the music resolves on the Fm9 and rings out to silence.
- **`esquirely-motion-loop.mp4`** (14 s) is the seamless loop, for anywhere that repeats it. Its last frame runs straight into its first, so it stops half a beat before a downbeat by design. Played once without repeating, that reads as cut off, which is why the posting cut has an ending.

| Bar | What the shape becomes |
|---|---|
| 1 | **Browse roles** → BrandLoader → check → the board's filter bar |
| 2 | Filter chips *Law firm · Dispute Resolution · Abuja* (24 → 22 → 7 → 2 roles) → Olajide Oyewole LLP role card |
| 3 | **Apply** → *Tracked* → tracker pipeline; the card is dragged Applied → Interview |
| 4 | *Interview in 3 days* (stopwatch); the **Remind me** switch flips; its knob becomes the tab indicator |
| 5 | Scholarships list → the firms directory, scrolled through thirteen firms, coming to rest on Olajide Oyewole LLP |
| 6 | CV dropped in → GET MY REVIEW → *What you wrote / What we'd send* → interview prep |
| 7 | Bell rings → job-alert toast for the same role → back to the pill (loop) or on to the wordmark end card (posting cut) |

## Built from the site's own parts

Nothing in the video is a stock UI kit or a generic accent. Everything comes from the live `redesign/ink-grotesk` code:

- **The colour scroll** from the homepage's *Everything you need* section (`EverythingYouNeed.tsx`). Its stops (ink, sky, orange, red, green, violet, teal) run one per bar and return to ink, so the loop closes.
- **The layout** is the desktop section: two columns, the block's copy (title, description, mint call to action, all verbatim) on one side and the panel on the other, alternating block by block. The copy glides in from its side and scrolls up and out; the panel is the one morphing shape, and it crosses to the other column when the block changes.
- **The connector** is the section's dotted spiral: the same path, round dots and marker arrowhead. Whenever the panel changes sides, it draws itself in the band below the panels, from the column the panel leaves to the one it lands in, then scrolls up and away. It is drawn in place rather than flown through the frame, because at that speed the motion blur smeared the dots into streaks behind the panel.
- **The logo** is the site's own. The amber E square uses the four measured bars and sampled colours from `src/app/icon.svg`, and the wordmark is the navbar's (Hanken Grotesk 900, -0.045em). A navbar-style lockup sits top-left for the whole piece. In the ending, the shape becomes the E square, builds its bars one by one, and the wordmark slides out beside it.
- **The previews** match the homepage's: the tracker's columns and firms (Banwo & Ighodalo, Detail Solicitors, Templars, Flutterwave, Olaniwun Ajayi LP, with their logos from `public/`) and the scholarships list (Chevening, Commonwealth Shared, Fordham), row for row.
- **Components** follow the site's rules: carton `#FFF8E5` panels with a hard black rule and a 6×8 offset shadow, 2px tags ("a tag, not a pill"), round buttons, landscape logo plates, Hanken Grotesk 600 headings and Schibsted Grotesk text.
- **Icons** are only ones the site ships: the lucide-react 0.400 icons it imports (Search, ArrowRight, Check, Bookmark, ExternalLink, Upload, FileText, Loader2, X, ChevronRight), the `NotificationBell` SVG with its `notifRing` keyframes, and `public/icons/stopwatch.svg`.
- **Tool UI and copy** are real: the BrandLoader "Esquirely." pulse, "Added to your tracker.", the CV drop zone ("Drop your CV here, or click to upload"), the GET MY REVIEW button and its "Reading your CV" state, the homepage's own *What you wrote / What we'd send* example, and the interview-prep persona "Nigerian firm partner".
- **Mint** appears only where the site uses it: the Browse roles and Apply buttons, the tracker note and the CV tool's submit.

## Real data, real logos

No invented firms or figures appear in the video:

- **Filter counts** (24 → 22 → 5 → 3) are live counts from the `jobs` table on 26 Sep 2026: all open roles, then law firms, then Banking & Finance, then Lagos.
- **The role** is Olajide Oyewole LLP's *Associate, Dispute Resolution* (Abuja, closes 13 Nov), a live listing, with its description condensed from the posting. The job alert at the end is Babalakin & Co's live *Senior Associate, Energy & Extractive Industries*.
- **The directory** is the firms directory's list view with thirteen real entries: Templars, G Elias, Udo Udoma & Belo-Osagie, Banwo & Ighodalo, Aluko & Oyebode, Olaniwun Ajayi, AELEX, Kenna Partners, Perchstone & Graeys, Babalakin, Olajide Oyewole, Advocaat and Detail Solicitors. Each has its logo from `public/firm-logos`, its tier and offices from `lib/firms-data.ts`, and the directory's own pin and briefcase icons. Open-role counts come from the board (Aluko 12, Babalakin 1, Olajide Oyewole 1) and appear only where there are any, as on the site. The scroll comes to rest on the firm the viewer just applied to, with the directory's hover tint.
- **The scholarship** is the Chevening entry from `lib/scholarships-data.ts`.
- **The CV before/after** is the homepage preview's own example. The interview question is illustrative and names no one.

If the board changes, update the counts in `index.html` (the `.cnt` spans and the `FIRMS` open-role column).

## Files

| File | Role |
|---|---|
| `index.html` | The whole animation. Every style is computed from time inside `seek(t)`. Open it and click to play with sound, or add `?t=3.5` to freeze a frame. |
| `audio/compose.py` | Synthesizes the track "Pipeline" in numpy: F minor deep house, 7 bars, written onto a circular buffer so the tails wrap and the loop point is inaudible. |
| `audio/analyze.py` | Measures the beat grid from the audio and writes `beats.js`, which the page reads. Tempo comes from onset autocorrelation, phase from the kick band refined to its attack, and the downbeat from clap parity plus bass-root change. |
| `audio/mix.py` | Synthesizes the UI sounds (click, tick, whoosh, drop, toggle, bell) in key and places each one by its measured peak at the cue times the page exports. |
| `render.mjs` | Renders with Playwright. `beats` gives one frame per beat for review. `full` renders 60 fps with 12 subframes per frame across a 180° shutter, blended by ffmpeg `tmix` for motion blur. The template's 4 subframes strobed on the fastest moves (the panel crossing columns travels about 45 px a frame), showing four copies instead of a blur. |
| `build.sh` | Runs every step above and writes both cuts. The ending is the page's `?outro` mode: the same score with everything from the loop point to 3.6 s replaced, so it continues exactly from the last lap. |

## How it works

- **Springs are closed-form step responses.** A value that changes target several times is the sum of one spring per change. The previous lap's springs are summed in too, so the value is a pure function of time and wraps seamlessly at t = 14 s.
- **Liquid indicators.** The two edges of the tracker stage indicator and the toggle knob / tab indicator ride different springs. The leading edge is stiff and the trailing edge is soft, so the shape stretches as it travels.
- **Direct manipulation.** While the cursor holds the tracker card or the CV file, its position is the cursor's. On release it springs home from wherever it was dropped.
- **Text swaps** get their own enter and exit timing. The outgoing text leaves fast and the incoming text arrives slightly later, so nothing overlaps inside the morphing container.
- **No `will-change`** on anything the camera scales, so text stays crisp.

## Rebuild

```bash
pip install numpy scipy
npm i -g playwright   # uses the preinstalled Chromium
./build.sh            # WORKERS=8 ./build.sh on a bigger machine
```

Schibsted Grotesk and Hanken Grotesk are included under the SIL Open Font License (`fonts/OFL-*.txt`). The music and sound effects are original, generated by the scripts here.
