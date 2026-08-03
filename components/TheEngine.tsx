"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import LogoLockup from "./LogoLockup";
import EngineNoise from "./EngineNoise";

/* 🔴 STATICALLY IMPORTED, AND THAT IS THE MEASURED CHOICE — DO NOT "OPTIMISE"
   THIS INTO next/dynamic. It was tried on 2026-08-03 and made the homepage
   BIGGER: 166 kB -> 167 kB First Load JS. EngineNoise is only 8 KB of source
   with no dependencies, so the code-split saves less than the extra chunk plus
   the dynamic() loader machinery costs. The same change on AdminSilk (15 KB,
   a much larger shader) DID pay: /admin went 112 kB -> 109 kB.
   Measure before splitting; small leaf components usually lose. */
import { APPOINTMENTS } from "./Carriers";

/**
 * THE ENGINE — the carriers, the brokerage, and what the reader gets.
 *
 * ---------------------------------------------------------------------------
 * §MOTION — RE-MEASURED ON CHECKMATE 2026-08-02, AND WE HAD THE WRONG MECHANIC
 *
 * 🔴 THE LINES STILL DO NOT ANIMATE — that part was right. What was wrong was
 * everything about the thing moving along them. Read off their live DOM:
 *
 *   ours (before)                     theirs (measured)
 *   --------------------------------- ------------------------------------
 *   a 5%-long DASH sliding the path    a round DOT on `offset-path`, r3.5
 *   on ALL 24 lines at once            on **6 of 21** in-lines + all 3 out
 *   in-lines full gold-deep, 1px       in-lines cream **@0.22**, 1px, static
 *   no march anywhere                  out-lines march, dasharray 7/11, 1.6s
 *   one halo bloom + 2 small rings     2 rings only (r68 solid, r92 dashed)
 *
 * 🔴 THE OLD 5.2s AND 1100ms WERE CORRECT NUMBERS ATTACHED TO THE WRONG THING.
 * They are the DOT's traverse and the out-dot stagger, not a dash's. The note
 * that the dash length was "measured off a screenshot" of a login-walled
 * reference is retired with the dash: there is no dash, and the real values
 * came off the real DOM rather than off a picture of one.
 *
 * 🔴 A HIGHLIGHT ON EVERY LINE IS WHY OURS READ AS BUSY. Six of twenty-one is
 * not a saving, it is the design: at any moment most of the diagram is still,
 * and the eye has somewhere to rest. Do not "complete" the set.
 *
 * The dots FADE IN AND OUT at the ends (8% / 12%) rather than popping, matching
 * their `opacity: 0` base state. Keyframes live in globals.css.
 *
 * DIRECTION: in-dots run chip to hub, out-dots run hub to card, because each
 * follows its own path's authored direction.
 *
 * 🔴 DIRECTION CHANGED ON INSTRUCTION, AND IT REVERSES AN EARLIER DECISION.
 * Left lines are now authored CHIP → HUB (they arrive), right lines stay
 * HUB → CARD (they leave). An earlier pass ran BOTH outward from the hub, on
 * the reasoning that carrier-to-hub motion could read as the carriers funding
 * or powering the brokerage — which is false; Synergy is an independent broker.
 * The left-to-right reading adopted here is a different and defensible one:
 * the market is surveyed on the left, Synergy is the hub it passes through, and
 * what reaches the reader leaves on the right. Synergy-outward is preserved
 * where it carries the claim — the right-hand side. If the inward read ever
 * becomes a concern again, reversing it is swapping the two endpoints in
 * `inPaths` and flipping the stagger order.
 *
 * REDUCED MOTION: the dots are NOT RENDERED AT ALL, so the lines simply stand
 * still — fully visible, no travelling dot, no stagger. The out-lines keep their
 * dashes but stop marching, the dashed ring does not spin (both stopped in the
 * `prefers-reduced-motion` block in globals.css), and the cards render in place.
 *
 * ---------------------------------------------------------------------------
 * §SCALE — THE STAGE IS A FIXED 3:2 BOX AGAIN, WHICH REVERSES THE PASS THAT
 * MADE IT STRETCH. That pass took the box to the row height to kill ~197px of
 * dead space, and paid for it with `preserveAspectRatio="none"`, a
 * `vector-effect` correction on every stroke, HTML circles so rings could not be
 * squashed into ellipses, and a JS ResizeObserver to keep chips aligned with
 * path ends. All four existed only to survive a non-uniform scale.
 *
 * Checkmate's stage is `aspect-ratio: 3/2` and their SVG is a plain 900x600
 * viewBox mapped onto it uniformly. Matching that deletes all four workarounds:
 * strokes are true, the rings are SVG circles that cannot distort, chips are
 * percentages that cannot desync, and nothing is measured in JS at all.
 * The dead space comes back; the alignment machinery goes away.
 *
 * ---------------------------------------------------------------------------
 * §COPY — every string is Synergy's own, already approved, already in en.json.
 *   eyebrow/heading/sub  `carriers.eyebrow` / `.headline` / `.subhead`
 *   chips                `carriers.names.*`, rendered from APPOINTMENTS
 *   the three cards      `whySynergy.rows.r1` / `r2` / `r3`
 *   card kicker          `engine.cardKicker` — an authored interface label,
 *                        the same Rule 4 basis as About §4's "Our approach"
 * Nothing from checkmatefinancialgroup.com: their section is built on "our AI
 * reads 40+ A-rated carriers" — an AI product Synergy does not have, "A-rated"
 * (BANNED, Standing Rule 6), and an unverified volume claim; their cards
 * publish premium figures and underwriting/timing claims Synergy publishes
 * nowhere. All refused rather than reworded.
 *
 * COUNT IS DATA-DRIVEN off APPOINTMENTS — one chip per real relationship,
 * 3 columns by ceil(N/3) rows. Never padded, so it cannot harden into a claim.
 *
 * §AA — every gold-deep rule sits at alpha 0.80: 3.48:1 on cream, 3.57:1 on the
 * guilloche stripe, 3.71:1 on white, against a 3:1 bar (minimum clearing alpha
 * is 0.73). The drawing lines are FULL gold-deep, 5.16:1.
 */

/**
 * §GEOMETRY — CHECKMATE'S OWN 900x600 GRID, READ OFF THEIR LIVE DOM.
 *
 * 🔴 THIS REPLACES THE MEASURED-PIXEL SCHEME, AND THE SWAP IS WHAT FIXES THE
 * LINE SHAPE. The curve FORMULA was never wrong — theirs is
 * `M sx sy C mx sy, mx ey, ex ey` with `mx = (sx+ex)/2` and so was ours, exactly.
 * What differed was the BOX the formula ran in:
 *
 *   theirs   `.engine-stage`, aspect-ratio 3/2, 666x444, ONLY the left column
 *   ours     the full 1144-wide wrapper, cards floating on top at the right
 *
 * Same construction stretched across 1.7x the width gives visibly flatter, more
 * drawn-out curves. That is the whole difference between image 1 and image 2.
 * The diagram is now a 3:2 stage in the left grid column, exactly as theirs is,
 * and every coordinate below is their viewBox unit.
 *
 * 🔴 THE HUB IS AT 68.889%, NOT 50%. Measured: `.engine-core` sits at
 * `left: 68.889%` (= x 620 of 900) and the rings are `cx="620"`. Our previous
 * build centred it on instruction from an earlier pass — that pass's note even
 * says "not 68.9% of a narrower stage", so this reverses a deliberate decision.
 * It is reversed because the brief is now to match their composition, and the
 * off-centre hub is what gives the input side room for 21 chips and the output
 * side a short, emphatic run to the cards.
 *
 * 🔴 PERCENTAGES ARE CORRECT AGAIN, AND THE ResizeObserver IS GONE. The old
 * scheme measured the box in JS because fixed-px chips had to line up with
 * viewBox-unit path ends. With the stage locked to 3:2 the viewBox maps to it
 * uniformly, so a percentage and a user unit are the same coordinate — chips
 * and path ends cannot desync by construction. That deletes the measurement
 * effect, the resize listener, the fonts hook AND the documented trap where a
 * fresh ResizeObserver never fired and rendered the whole diagram empty.
 * Chips now SCALE with the column, which is what Checkmate's do (`width: 12.9%`)
 * and which is why theirs stay aligned at every width.
 */
/** Chip centres. Their columns are x 104 / 226 / 348, half-width 58 (= 12.9%). */
const COL_CX = [104, 226, 348];
const CHIP_HALF = 58;
const CHIP_W_PCT = (CHIP_HALF * 2 * 100) / 900; // 12.889% — theirs is 12.9%
const COL_COUNT = 3;
/** Rows: y 78 then +70. Seven rows x three columns = 21, and we have 21. */
const ROW_Y0 = 78;
const ROW_PITCH = 70;
/** The hub, and the two rings the lines stop on. Theirs: r 68 solid, r 92 dashed. */
const HUB_X = 620;
const HUB_Y = 300;
const RING_INNER = 68;
const RING_OUTER = 92;
/** Output run: leaves the outer ring, lands on the three numbered endpoints. */
const OUT_START_X = HUB_X + RING_OUTER; // 712
const OUT_END_X = 868;
const OUT_Y = [128, 300, 472];
/** The endpoint discs. r 13, numeral baseline 3.5 below centre — both theirs. */
const TERM_R = 13;
const TERM_BASELINE_DY = 3.5;

const CARD_KEYS = ["r1", "r2", "r3"] as const;
/**
 * 🔴 THE CARD BADGE WAS I / II / III AND IS NOW 01 / 02 / 03, BECAUSE THE
 * ENDPOINTS FORCED IT. Adding Checkmate's numbered markers put a disc reading
 * "02" at the end of the line that points at a card stamped "II" — two indexes
 * for one thing, three inches apart. They are the same ordinal and they now
 * read the same. The passport stamp keeps its rotation, border and face; only
 * the glyphs changed. Revert by putting the roman numerals back here.
 */
const NUMERAL = ["01", "02", "03"] as const;

/**
 * The six in-lines that carry a travelling dot, and they are SIX OF TWENTY-ONE.
 * Checkmate runs dots on (col,row) 0,0 · 2,1 · 2,2 · 0,4 · 1,5 · 2,6 — a spread
 * across every column and most rows, never two adjacent. Ours uses the same
 * spread. 🔴 IT IS NOT ALL OF THEM AND MUST NOT BECOME ALL OF THEM: a highlight
 * on 21 lines at once is exactly what made our previous build read as busy.
 */
const PULSE_CELLS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [2, 1],
  [2, 2],
  [0, 4],
  [1, 5],
  [2, 6],
];

/**
 * 🔴 WHICH SURFACE. Three are built in globals.css; only C ships.
 *
 *   "engine-surface"        A — dark, one gold radial + line grid     retired
 *   "engine-surface-b"      B — dark, two radials + dot grid          retired
 *   "engine-surface-light"  C — near-white, gold centre glow,
 *                               fine 24px SQUARE grid                 LIVE
 *
 * 🔴 A AND B ARE DARK AND C IS LIGHT, SO FLIPPING THIS STRING IS NOT A LIKE-FOR
 * LIKE SWAP ANY MORE — it inverts the section and every ink in it. The JSX
 * below is authored for C (ink, gold-deep, white chips). Going back to A or B
 * means restoring cream/gold-pale on every text node too. Their derivations are
 * kept in globals.css; their AA tables are void.
 */
const SURFACE = "engine-surface-light";

/**
 * Dot timings — ALL RE-MEASURED OFF CHECKMATE'S LIVE DOM, not carried from
 * notes. Standing Rule 8, and it changed things: 5.2s was right but it is
 * `ep-travel`'s duration (a travelling DOT), not a sliding dash's.
 *
 *   in-dots   5.2s cycle, 0.85s stagger across the six lines that carry one
 *   out-dots  5.2s cycle, delays 1.4 / 2.5 / 3.6  → start 1400, stagger 1100
 *   out-march 1.6s cycle, delays 0 / 0.9 / 1.8    → stagger 900
 */
const CYCLE_MS = 5200;
const IN_STAGGER_MS = 850;
const OUT_DOT_START_MS = 1400;
const OUT_DOT_STAGGER_MS = 1100;
const OUT_MARCH_STAGGER_MS = 900;
/** Cards reveal once, on entry — unrelated to the looping highlight. */
const CARD_START_MS = 900;
const CARD_STAGGER_MS = 300;

export default function TheEngine() {
  const t = useTranslations("carriers");
  const tw = useTranslations("whySynergy");
  const te = useTranslations("engine");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduce) {
      setShown(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const carriers = APPOINTMENTS.map((a) => ({ key: a.key, name: t(`names.${a.key}`) }));

  /** Chip centre and row centre, in Checkmate's 900x600 units. */
  const rowY = (row: number) => ROW_Y0 + row * ROW_PITCH;

  /* IN: chip's right edge → the outer ring. Both control points share one x at
     the midpoint, which is Checkmate's construction exactly:
       M 162 78 C 345 78, 345 300, 528 300     (theirs, col 0 row 0)
       M 162 78 C 345 78, 345 300, 528 300     (ours) */
  const inPaths = carriers.map((c, i) => {
    const col = i % COL_COUNT;
    const row = Math.floor(i / COL_COUNT);
    const y = rowY(row);
    const sx = COL_CX[col] + CHIP_HALF;
    const ex = HUB_X - RING_OUTER;
    const mx = (sx + ex) / 2;
    return { key: c.key, col, row, d: `M ${sx} ${y} C ${mx} ${y}, ${mx} ${HUB_Y}, ${ex} ${HUB_Y}` };
  });

  /* OUT: outer ring → numbered endpoint. Same construction, mx = 790 as theirs. */
  const outPaths = OUT_Y.map((y, i) => {
    const mx = (OUT_START_X + OUT_END_X) / 2;
    return {
      i,
      y,
      d: `M ${OUT_START_X} ${HUB_Y} C ${mx} ${HUB_Y}, ${mx} ${y}, ${OUT_END_X} ${y}`,
    };
  });

  /** The six in-lines that carry a dot, paired with their even stagger. */
  const inDots = PULSE_CELLS.map(([col, row], n) => {
    const p = inPaths.find((q) => q.col === col && q.row === row);
    return p ? { key: `${col}-${row}`, d: p.d, delay: n * IN_STAGGER_MS } : null;
  }).filter(Boolean) as { key: string; d: string; delay: number }[];

  /** Per-element timing, handed to CSS as custom properties. */
  const timing = (delayMs: number, durMs = CYCLE_MS) =>
    ({
      "--engine-dur": `${durMs}ms`,
      "--engine-delay": `${delayMs}ms`,
    }) as React.CSSProperties;

  /** `offset-path` carries the dot; the geometry lives only in the path string. */
  const dotStyle = (d: string, delayMs: number) =>
    ({ ...timing(delayMs), offsetPath: `path("${d}")` }) as React.CSSProperties;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="engine-heading"
      /* 🔴 CHECKMATE'S OWN PADDING, MEASURED: 106.47 top / 53.235 bottom. It is
         asymmetric — theirs is, and the brief is to match their composition.
         (An earlier pass made it symmetric because a floating dark CARD needs
         even breathing room; a full-bleed section does not, because it has no
         edges to breathe against.)

         🔴 `.engine-surface` PAINTS THE SECTION EDGE TO EDGE. This is the one
         place on the site where a full-width section legitimately paints its
         own fill — HANDOFF (i) made eleven components STOP doing that so the
         body gradient could show, and the rule it set was "page surface stays
         transparent; anything with a genuine surface of its own still paints".
         This has a genuine surface: it is a distinct dark band by design, the
         same licence the two navy sections already hold.

         `isolate` so the grain's negative z-index cannot escape behind the
         page background. */
      className={`${SURFACE} relative isolate overflow-hidden pb-[53.235px] pt-[106.47px]`}
    >
      {/* 🔴 THE GRAIN IS A CANVAS NOW, ON INSTRUCTION — the client chose the
          reference snippet's technique over the transform-stepped CSS tile that
          shipped before. `.engine-grain` is retired from this component (the
          rule stays in globals.css; it is the cheaper approach and worth
          keeping if performance ever becomes the deciding factor again).

          Bounded to the section by `absolute inset-0`, NOT to the viewport —
          the reference sets 100vw/100vh, which here would paint grain over the
          whole page. See EngineNoise for the throttle, the off-screen pause and
          the reduced-motion path, none of which the reference has. */}
      {/* 🔴 ALPHA 4, NOT 6, AND IT IS A CONTRAST TERM NOT A TASTE ONE. On a
          light surface the worst grain pixel is a BLACK one (dark text needs
          the background light), the exact inverse of the dark build. At alpha 6
          the gold-deep eyebrow lands on 4.45 — a fail. At 4 it is 4.51 at its
          worst width. Do not raise this without re-running the eyebrow. */}
      <EngineNoise alpha={4} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      {/* 🔴 THE CARD IS GONE. This matches Checkmate's `.wrap`: `max-width:
          1200px` with 28px padding, giving a 1144px content column. There is no
          card, no inset, no radius — the gradient is the SECTION's own surface
          and runs edge to edge behind this container. */}
      <div className="mx-auto w-full max-w-[1200px] px-7">
        {/* ---------- Head — Checkmate's `.section-head` ----------
            MEASURED ON THEIRS AT 1536: block 720 wide x 233 tall, eyebrow
            11.52px / ls 1.84px / w500, h2 56px / lh 58.24 / ls -0.728, lead
            22px / lh 33, and a 24px gap from the head to the grid.

            🔴 IT IS A SINGLE STACKED COLUMN AGAIN. The previous pass split it
            into two columns to buy back height for the card; Checkmate's is one
            720px block and the brief is to match their composition.

            🔴 EVERY INK VALUE HERE IS INVERTED AGAIN — THE SURFACE IS LIGHT NOW
            AND THE ON-DARK SET IS VOID. cream and gold-pale were the tokens for
            a near-black field; on near-white they are invisible. The light set
            is ink for body and headline and **gold-deep for the eyebrow — the
            only legal gold text on light, and only away from the glow**.
            Measured at the eyebrow's actual position (615px from the glow's
            centre against a 434px reach, so glow contribution zero): 4.57 at
            1536, **4.51 at 768**, 4.57 at 390. On the glow's PEAK the same
            colour is 4.29 and would fail — full derivation, including why the
            grid is 0.045 and the grain alpha 4, on `.engine-surface-light`. */}
        <div className="max-w-[720px]">
          {/* Their eyebrow: 11.52px, letter-spacing 1.8432px = 0.16em. Ours
              already sat at 0.16em, so only the size moves. */}
          <p className="cap-trim cap-body text-[11.5px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            {t("eyebrow")}
          </p>
          {/* Their h2: 56px / lh 58.24 (1.04) / ls -0.728px (-0.013em). Ours
              was clamp(30,3.4vw,52) — the clamp stays for the small end, the
              ceiling goes to their 56. */}
          <h2
            id="engine-heading"
            className="mt-4 font-display text-[clamp(30px,3.65vw,56px)] font-normal leading-[1.04] tracking-[-0.013em] text-ink"
          >
            {t("headline")}
          </h2>
          {/* Their lead: 22px / lh 33 (1.5). Ours had come down to 19px while
              chasing a shorter card; back to their 22. ink/80 = 8.00. */}
          <p className="mt-5 text-[clamp(17px,1.43vw,22px)] leading-[1.5] text-ink/80">
            {t("subhead")}
          </p>
        </div>

        {/* ---------- Stage + cards ----------
            🔴 THE STAGE IS A GRID COLUMN AGAIN, NOT AN ABSOLUTE LAYER OVER THE
            WHOLE WRAPPER, AND THIS IS THE CHANGE THAT FIXES THE LINE SHAPE.
            Checkmate's `.engine-grid` is `1.55fr 1fr` with `align-items: center`
            and a `clamp(24px,3.2vw,48px)` gap; at our 1144 content that is
            666.2 / 429.8 — the exact split already recorded. Their
            `.engine-stage` is then `aspect-ratio: 3/2`, i.e. 666x444, and the
            SVG fills it at viewBox 900x600 (a uniform 0.74 scale).

            The previous build spread the same curve formula across the full
            1144 and floated the cards on top. Identical maths, 1.7x the width,
            visibly flatter curves. Putting the diagram back in a 3:2 column is
            what makes the curve read as theirs. */}
        <div className="relative mt-6 lg:grid lg:grid-cols-[1.55fr_1fr] lg:items-center lg:gap-12">
          {/* ===== The diagram — lg and up only. A true 3:2 box, so a viewBox
               unit and a percentage of this box are the same coordinate. ===== */}
          <div className="pointer-events-none relative hidden aspect-[3/2] lg:block">
            <svg
              viewBox="0 0 900 600"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label={te("diagramLabel")}
            >
              {/* ---- THE IN-LINES. Static, never animated, and now genuinely
                   faint — gold-deep at 0.49, which measures 1.90:1, the same
                   ratio Checkmate's own in-lines measure on their dark field.
                   Colour and opacity live in `.engine-line`. ---- */}
              {inPaths.map((p) => (
                <path key={p.key} className="engine-line" d={p.d} fill="none" strokeWidth={1} />
              ))}

              {/* ---- THE OUT-LINES. Solid gold-deep, 1.5px, marching dashes at
                   7/11 on a 1.6s loop staggered 0.9s — the one place Checkmate
                   uses marching ants, and what separates output from input. ---- */}
              {outPaths.map((p) => (
                <path
                  key={`out-${p.i}`}
                  className="engine-out"
                  d={p.d}
                  fill="none"
                  strokeWidth={1.5}
                  style={reduce ? undefined : timing(p.i * OUT_MARCH_STAGGER_MS, 1600)}
                />
              ))}

              {/* ---- THE HUB RINGS. SVG circles at 620,300 — r68 solid, r92
                   dashed 3/9 turning once a minute. Both are Checkmate's, and
                   the lines above stop exactly on r92 (in-lines end at x 528,
                   out-lines start at 712). NO BLOOM: the radial-gradient halo
                   that used to sit here is deleted, not restyled. It was the
                   "glow artifact" — a 132px gold smear that Checkmate has no
                   equivalent of, and which on a near-white surface reads as a
                   printing defect rather than light. ---- */}
              <circle className="engine-ring" cx={HUB_X} cy={HUB_Y} r={RING_INNER} />
              <circle
                className="engine-ring engine-ring--dash"
                cx={HUB_X}
                cy={HUB_Y}
                r={RING_OUTER}
              />

              {/* ---- THE NUMBERED ENDPOINTS. Checkmate's `ep-term`: r13 disc
                   with a numeral 3.5 below centre. Theirs is a 0.06 white lift
                   on black; ours is a white/60 disc, which is the same barely
                   there lift inverted AND gives the numeral a face (ink on
                   white/60 = 15.70). The numerals match the card badges. ---- */}
              {outPaths.map((p, i) => (
                <g key={`term-${p.i}`}>
                  <circle className="engine-term" cx={OUT_END_X} cy={p.y} r={TERM_R} />
                  <text
                    className="engine-term-n"
                    x={OUT_END_X}
                    y={p.y + TERM_BASELINE_DY}
                    textAnchor="middle"
                  >
                    {NUMERAL[i]}
                  </text>
                </g>
              ))}

              {/* ---- THE TRAVELLING DOTS. `offset-path` carries each one along
                   its own line; base opacity 0 so they fade in and out at the
                   ends. SIX of the twenty-one in-lines, plus all three
                   out-lines — Checkmate's own distribution. NOT RENDERED under
                   reduced motion, so the diagram simply stands still. ---- */}
              {!reduce ? (
                <>
                  {inDots.map((d) => (
                    <circle
                      key={`dot-${d.key}`}
                      className="engine-pulse"
                      r={3.5}
                      style={dotStyle(d.d, d.delay)}
                    />
                  ))}
                  {outPaths.map((p) => (
                    <circle
                      key={`dot-out-${p.i}`}
                      className="engine-pulse"
                      r={4}
                      style={dotStyle(p.d, OUT_DOT_START_MS + p.i * OUT_DOT_STAGGER_MS)}
                    />
                  ))}
                </>
              ) : null}
            </svg>

            {/* Chips — positioned and SIZED as percentages of the stage, which
                is Checkmate's scheme (`width: 12.9%`) and is safe again now the
                box is locked to 3:2. Centred on their coordinate via
                translate(-50%,-50%), so the chip's right edge lands exactly on
                its line's start. Names WRAP rather than truncate: a carrier name
                is a factual brand and an ellipsis in one is a defect. */}
            {carriers.map((c, i) => {
              const col = i % COL_COUNT;
              const row = Math.floor(i / COL_COUNT);
              return (
                <span
                  key={c.key}
                  className="engine-chip absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[8px] border px-1.5 py-[7px] text-center text-[10.5px] leading-[1.15] text-ink"
                  style={{
                    left: `${(COL_CX[col] / 900) * 100}%`,
                    top: `${(rowY(row) / 600) * 100}%`,
                    width: `${CHIP_W_PCT}%`,
                    minHeight: 32,
                  }}
                >
                  {c.name}
                </span>
              );
            })}

            {/* The hub mark, at 620,300 — 68.889% / 50%, NOT the centre. */}
            <div
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={{
                left: `${(HUB_X / 900) * 100}%`,
                top: `${(HUB_Y / 600) * 100}%`,
                width: `${((RING_INNER * 2 - 12) / 900) * 100}%`,
              }}
            >
              {/* 🔴 STILL A COMPROMISE, AND STILL FLAGGED. The lockup is 3.29:1
                  horizontal and the hub is a circle; there is no width at which
                  a horizontal lockup sits comfortably in a ring. It is now sized
                  to the INNER RING minus 6px of breathing room on each side
                  (124 of 136 viewBox units, ~92px at 1536) instead of the flat
                  150px it was, so it can no longer overrun the ring at any
                  width — but it is smaller than before and the subline suffers
                  for it. Checkmate's hub holds a TALL mark (204x320 rendered at
                  64px wide), which is why theirs fits. The real fixes remain a
                  square or stacked variant of the Synergy mark, or the crest.
                  Reported, not silently jammed in. */}
              <LogoLockup className="h-auto w-full" />
            </div>
          </div>

          {/* ===== BELOW lg: the diagram is not rendered at all. Carriers
               become an honest wrapped text list and the cards stack beneath
               it, so the two-column grid can never overflow a phone. ===== */}
          <ul aria-label={t("ariaLabel")} className="mb-8 flex flex-wrap gap-2 lg:hidden">
            {carriers.map((c) => (
              <li
                key={c.key}
                className="engine-chip rounded-lg border px-3 py-1.5 text-[13px] text-ink"
              >
                {c.name}
              </li>
            ))}
          </ul>

          {/* ===== RIGHT: the passport panels — unchanged this pass ===== */}
          <ul aria-label={te("cardsLabel")} className="flex flex-col justify-center gap-3">
            {CARD_KEYS.map((k, i) => (
              <li
                key={k}
                className="passport-guilloche relative rounded-[14px] border border-gold-deep/80 bg-white px-[15px] pb-[14px] pt-[13px]"
                style={{
                  opacity: shown ? 1 : 0,
                  transform: shown ? "none" : "translateY(16px)",
                  transition: reduce
                    ? "none"
                    : `opacity 550ms cubic-bezier(.25,.1,.25,1) ${CARD_START_MS + i * CARD_STAGGER_MS}ms, transform 550ms cubic-bezier(.22,1,.36,1) ${CARD_START_MS + i * CARD_STAGGER_MS}ms`,
                }}
              >
                <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 h-2.5 w-2.5 border-l border-t border-gold-deep/80" />
                <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 h-2.5 w-2.5 border-r border-t border-gold-deep/80" />
                <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-gold-deep/80" />
                <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r border-gold-deep/80" />

                {/* 🔴 THE CARD LAYS OUT HORIZONTALLY NOW, AND THIS IS WHAT MADE
                    THE WHOLE SECTION LANDSCAPE. It was a STACKED passport: a
                    full-width header row (numeral + kicker + a rule under both)
                    sitting ABOVE the h3 and the body. That header row cost 48px
                    of pure height per card, and with three cards stacked in the
                    right-hand column those 144px were the single largest thing
                    forcing the card portrait.

                    Now the numeral badge sits BESIDE the text column instead of
                    above it, so its 36px overlaps the copy's height rather than
                    adding to it, and the rule moved to under the kicker inside
                    the text column — the passport reading survives, the header
                    band does not. Measured: 224px -> 172px per card, 156px off
                    the section for zero copy change.

                    `items-start` not `items-center`: the badge aligns to the
                    kicker's cap-height, which is where it read as a stamp in
                    the old header row. `min-w-0` on the text column so a long
                    carrier title cannot blow the flex track out. */}
                <div className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-9 w-9 shrink-0 -rotate-6 place-items-center rounded-[6px] border border-gold-deep/80 font-display text-[13px] leading-none text-gold-deep"
                  >
                    {NUMERAL[i]}
                  </span>

                  <div className="min-w-0">
                    <span className="block border-b border-gold-deep/80 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                      {te("cardKicker")}
                    </span>
                    <h3 className="mt-2.5 font-display text-[clamp(17px,1.2vw,19px)] font-normal leading-[1.25] text-ink">
                      {tw(`rows.${k}.title`)}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-[1.5] text-ink/80">
                      {tw(`rows.${k}.body`)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
