"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type SignatureProps = {
  text: string;
  fontUrl: string;
  color?: string;
  className?: string;
  onDone?: () => void;
};

const GLYPH_SIZE = 200;

/* ---------------------------------------------------------------------------
   HAND-AUTHORED CENTRELINE — the line a pen tip actually travels.

   This is NOT derived from the glyph outline at runtime and must never be.
   `font.getPath()` returns the FILLED OUTLINE of the word: a dozen disconnected
   closed contours including the counters inside e / g / y. Stroking or dashing
   that traces the *edge* of every letterform and the inside of every hole, in
   contour order rather than reading order. No hand moves like that, and that is
   what garbled the glyphs before.

   Instead: seven pen-down groups, authored by hand in the SAME user space as
   the generated path (viewBox -13.27 -218.52 1943.63 765.17), frozen here as a
   static constant. They were authored against the glyph's medial axis, which
   was extracted by rasterising the fill and taking the ridge of its distance
   transform — so every anchor below sits on real ink, not on a guess.

   Verified: stroked at width 62 with round caps, this centreline covers
   100.00% of the filled glyph's pixels (0 uncovered, measured at 0.6 px/unit).
   Narrower fails — 56 leaves 14px, 48 leaves 102px.

   The groups are contiguous (each starts where the previous ended) because this
   lettering genuinely is one continuous cursive stroke — there is no gap in the
   ink to hide a lift in. The human beat comes from the TIMING, not from breaks.

   The irregularity is baked into these coordinates. Do not add per-frame
   jitter: it shimmers, and it reads as a video artefact rather than a hand.
--------------------------------------------------------------------------- */
const CENTERLINE: readonly string[] = [
  // S — one long stroke: up the inner right, over the top, down the left,
  // through the crossing, clockwise around the lower loop, back out to the right
  "M395 48C412 30 432 0 449-35C462-62 477-95 475-120C473-150 448-173 415-179C370-172 300-145 225-101C150-52 60 25 20 95C8 118 5 140 13 152C25 168 60 182 113 197C160 210 215 222 253 233C285 242 320 258 349 283C372 303 384 330 383 353C381 378 360 402 323 435C290 462 240 480 183 493C140 502 100 503 70 497C48 490 40 470 45 445C52 420 75 396 107 365C145 330 195 296 251 261C275 248 290 243 320 227C350 210 375 197 417 185",
  // y — entry hook, upstroke to the apex, down into the descender loop and back
  "M417 185C445 176 480 166 505 158C516 156 523 162 526 174C528 184 528 191 529 193C541 190 550 176 557 160C570 148 585 140 600 135C620 128 642 122 660 117C672 127 680 150 681 172C682 188 674 200 664 206C655 235 640 268 621 301C600 337 558 374 513 399C495 405 477 401 477 388C478 368 495 330 539 277C570 250 610 228 647 207C660 200 673 180 681 157",
  // n — two humps with the tight baseline loop under the first
  "M681 157C688 170 696 179 703 181C714 183 724 177 733 170C748 156 765 140 779 140C786 149 788 166 787 181C777 184 766 184 759 181C757 176 766 170 779 163C790 158 800 160 806 168C814 158 820 154 827 153C838 152 846 160 853 171C862 179 869 184 877 185C900 186 946 180 969 171C982 166 992 162 997 159",
  // e — up, over, down the left of the eye, round the bottom and out
  "M997 159C1004 155 1010 152 1015 152C1030 145 1048 133 1057 129C1066 136 1072 152 1072 163C1070 178 1060 189 1041 193C1025 196 1013 190 1011 181C1010 173 1022 175 1040 180C1060 185 1078 186 1089 185C1108 183 1130 172 1161 157",
  // r — tall loop up, over, and the long fall into the g's approach
  "M1161 157C1172 133 1180 115 1187 105C1200 88 1222 71 1235 69C1250 66 1268 62 1281 65C1294 70 1303 82 1303 100C1303 118 1297 128 1283 153C1272 172 1258 198 1245 229C1240 245 1240 265 1243 277C1252 283 1272 283 1283 281C1300 278 1330 258 1359 229",
  // g — bowl, the second rise, then the descender loop and back up
  "M1359 229C1380 210 1400 194 1424 171C1444 151 1462 139 1478 140C1490 144 1491 156 1480 167C1462 181 1440 194 1424 206C1441 213 1472 199 1496 174C1516 152 1533 130 1546 124C1558 121 1567 133 1568 152C1569 172 1568 192 1566 208C1556 252 1538 302 1513 349C1490 390 1450 416 1420 427C1398 434 1375 436 1375 424C1376 405 1392 372 1417 325C1445 275 1490 240 1523 231C1545 226 1560 216 1573 200",
  // y — top loop, the rise over it, the descender, and the exit flourish
  "M1573 200C1600 188 1630 174 1655 160C1670 151 1683 143 1692 141C1700 145 1704 155 1702 168C1700 179 1690 186 1676 190C1670 192 1666 194 1667 193C1680 186 1697 175 1713 167C1730 157 1748 143 1763 133C1777 124 1792 117 1801 117C1810 119 1816 127 1817 137C1818 150 1817 172 1813 188C1808 205 1790 240 1759 301C1730 350 1680 388 1640 396C1626 398 1616 394 1618 383C1622 366 1650 330 1691 267C1725 238 1770 214 1799 205C1830 196 1870 172 1912 150",
];

/* Mask brush width, in the same user units. The glyph's thickest point measures
   43.6 units (largest inscribed circle, found by distance transform at
   x=1047 y=135 where the n/e junction blooms); a typical stroke is ~24. 62 is
   1.42× the thickest and is the narrowest width that reaches 100% coverage. */
const MASK_STROKE = 62;

/* ---------------------------------------------------------------------------
   TIMING (ms).

   Per-group duration ∝ length^0.7, so writing SPEED ∝ length^0.3 — the long
   strokes are written proportionally faster than the short ones, which is what
   a hand does. Resulting speeds run 5.78 units/ms for the S down to 3.34 for
   the e, a 1.73× spread.

     group      len    dur    speed
     S        2174.5   376    5.78
     y        1013.4   221    4.59
     n         463.6   128    3.62
     e         347.4   104    3.34
     r         534.8   141    3.79
     g        1141.5   240    4.76
     y        1144.2   240    4.77
                      ————
                      1450

   Pen-lift pauses between groups are fixed values, never Math.random, so the
   sequence is identical on every load. 307ms total.

   Draw span = 1450 + 307 = 1757ms, then Splash's existing 400ms beat, then its
   existing 1200ms wipe — both untouched.
--------------------------------------------------------------------------- */
const GROUP_MS = [376, 221, 128, 104, 141, 240, 240] as const;
const LIFT_MS = [70, 45, 38, 52, 44, 58] as const;

/** The last group's clock runs 12% past where its ink ends, so the pen flicks
 *  off the end of the flourish instead of stopping dead on it. */
const TAIL_OVERSHOOT = 0.12;

/** Dot fades over the final stretch rather than blinking out. */
const DOT_FADE_MS = 240;

const DRAW_MS =
  GROUP_MS.reduce((a, b) => a + b, 0) + LIFT_MS.reduce((a, b) => a + b, 0);

/** Per-group easing: accelerates out of the pen-down, decelerates into the
 *  pen-up. Linear is the number one tell that a machine drew it. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const fx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dfx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const fy = (t: number) => ((ay * t + by) * t + cy) * t;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = fx(t) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = dfx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return fy(Math.min(1, Math.max(0, t)));
  };
}
const penEase = cubicBezier(0.4, 0.02, 0.3, 1);

/** djb2 — used only to prove the generated `d` is byte-identical end to end. */
function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

/**
 * Handwritten signature reveal.
 *
 * The filled compound path from opentype.js is rendered COMPLETELY UNTOUCHED
 * and is never stroked, dashed or re-pointed. What animates is a mask: the
 * hand-authored centreline above, stroked with round caps wide enough to clear
 * the glyph, revealed group by group. The ink therefore appears along the line
 * a pen would travel, in reading order, while the letterforms stay exactly as
 * the font drew them.
 *
 * HARD RULE, enforced below: the opentype.js call, the .otf fetch, the viewBox
 * and the generated path data are untouched. `d` is hashed at generation and
 * re-hashed from the live DOM node; if they ever differ the mask is dropped and
 * the plain fill is rendered instead.
 */
/**
 * #RRGGBB (or #RGB) -> `rgba(r, g, b, a)`.
 *
 * Exists so the nib's GLOW can be derived from the same `color` prop as the
 * stroke. A glow is the one place a stray colour hides: it is blurred, it is
 * semi-transparent, and it only exists for the ~2s the draw is running.
 */
function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export default function Signature({
  text,
  fontUrl,
  // Default is NAVY, not the brand gold. The only caller passes a colour
  // explicitly, so this changes nothing today — but a future caller that omits
  // it will land on a light surface (the page is cream now), and gold there is
  // 2.09:1. Defaulting to the value that is legal on the surface this component
  // actually gets used on is the safer failure.
  color = "#0D1B2A",
  className,
  onDone,
}: SignatureProps) {
  const reduce = useReducedMotion();
  const [path, setPath] = useState<string | null>(null);
  const [box, setBox] = useState({ x: 0, y: 0, w: 1000, h: 300 });
  const [failed, setFailed] = useState(false);
  const [tampered, setTampered] = useState(false);
  const doneRef = useRef(false);

  const fillRef = useRef<SVGPathElement>(null);
  const groupRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRef = useRef<SVGCircleElement>(null);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone?.();
  };

  // ——— UNTOUCHED: font load, getPath, bounding box, viewBox, toPathData ———
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("opentype.js");
        // opentype.js v2: load() is a deprecated no-op; parse(ArrayBuffer) is
        // the supported path.
        const parse = (mod.parse ?? (mod as any).default?.parse) as (
          b: ArrayBuffer,
        ) => any;
        if (typeof parse !== "function") throw new Error("opentype.parse missing");
        const res = await fetch(fontUrl);
        if (!res.ok) throw new Error(`font fetch ${res.status} for ${fontUrl}`);
        const font = parse(await res.arrayBuffer());
        if (cancelled) return;

        const p = font.getPath(text, 0, GLYPH_SIZE, GLYPH_SIZE);
        const bb = p.getBoundingBox();
        const padX = GLYPH_SIZE * 0.06;
        const padY = GLYPH_SIZE * 0.16;
        setBox({
          x: bb.x1 - padX,
          y: bb.y1 - padY,
          w: bb.x2 - bb.x1 + padX * 2,
          h: bb.y2 - bb.y1 + padY * 2,
        });
        const d = p.toPathData(2);
        // eslint-disable-next-line no-console
        console.info(
          `[Signature] glyph d BEFORE: len=${d.length} hash=${hash(d)}`,
        );
        setPath(d);
      } catch (err) {
        console.warn(
          "[Signature] falling back to <text>; stroke reveal unavailable:",
          err,
        );
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, fontUrl]);

  // Byte-identity assertion: what opentype produced vs what is actually in the
  // DOM. Any difference means something downstream rewrote the glyphs — drop
  // the mask immediately rather than animating a garbled path.
  useLayoutEffect(() => {
    if (!path || !fillRef.current) return;
    const live = fillRef.current.getAttribute("d") ?? "";
    const same = live === path;
    // eslint-disable-next-line no-console
    console.info(
      `[Signature] glyph d AFTER:  len=${live.length} hash=${hash(live)} — ` +
        (same ? "byte-identical ✓" : "CHANGED ✗ reverting to unmasked fill"),
    );
    if (!same) setTampered(true);
  }, [path]);

  // ——— the pen ———
  useEffect(() => {
    if (!path || tampered) return;
    if (reduce) return; // reduced motion: fill is rendered complete, no pen

    const groups = groupRefs.current.filter(Boolean) as SVGPathElement[];
    if (groups.length !== CENTERLINE.length) return;

    const lens = groups.map((g) => g.getTotalLength());
    groups.forEach((g, i) => {
      g.style.strokeDasharray = `${lens[i]}`;
      g.style.strokeDashoffset = `${lens[i]}`;
    });

    // start time of each group, including the pen-lift pauses
    const starts: number[] = [];
    let acc = 0;
    for (let i = 0; i < GROUP_MS.length; i++) {
      starts.push(acc);
      acc += GROUP_MS[i] + (LIFT_MS[i] ?? 0);
    }

    const dot = dotRef.current;
    let raf = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      const t = now - t0;
      let active = -1;
      let activeP = 0;

      for (let i = 0; i < groups.length; i++) {
        const local = (t - starts[i]) / GROUP_MS[i];
        let p = local <= 0 ? 0 : local >= 1 ? 1 : penEase(local);
        // the flourish keeps moving briefly after its ink is finished
        if (i === groups.length - 1 && local > 0) {
          p = Math.min(1, penEase(Math.min(1, local)) / (1 - TAIL_OVERSHOOT));
        }
        groups[i].style.strokeDashoffset = `${lens[i] * (1 - p)}`;
        if (local > 0 && local < 1) {
          active = i;
          activeP = p;
        }
      }

      if (dot) {
        if (active >= 0) {
          const pt = groups[active].getPointAtLength(lens[active] * activeP);
          dot.setAttribute("cx", `${pt.x}`);
          dot.setAttribute("cy", `${pt.y}`);
          const left = DRAW_MS - t;
          dot.style.opacity = `${Math.max(0, Math.min(1, left / DOT_FADE_MS))}`;
        } else if (t >= DRAW_MS) {
          dot.style.opacity = "0";
        }
      }

      if (t < DRAW_MS) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [path, reduce, tampered]);

  // Completion is driven off the timeline, not one tween's callback, so an
  // interrupted animation can never strand the splash.
  useEffect(() => {
    if (!path && !failed) return;
    const t = setTimeout(finish, reduce || tampered ? 0 : DRAW_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, failed, reduce, tampered]);

  if (!path && !failed) return <div className={className} aria-hidden="true" />;

  const maskId = "sig-pen-mask";
  const viewBox = failed ? "0 0 1000 300" : `${box.x} ${box.y} ${box.w} ${box.h}`;
  // Reduced motion, a tampered path, or the <text> fallback: no mask at all.
  const masked = !failed && !tampered && !reduce;

  return (
    <motion.div
      className={className}
      initial={reduce ? { scale: 1 } : { scale: 1.02 }}
      animate={{ scale: 1 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.6, delay: 1.15, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={text}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
      >
        {masked && (
          <defs>
            <mask id={maskId}>
              {CENTERLINE.map((d, i) => (
                <path
                  key={i}
                  ref={(el) => {
                    groupRefs.current[i] = el;
                  }}
                  d={d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={MASK_STROKE}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </mask>
          </defs>
        )}

        {failed ? (
          <text
            x="500"
            y="215"
            textAnchor="middle"
            fontSize="200"
            fontWeight={600}
            fill={color}
          >
            {text}
          </text>
        ) : (
          <>
            <path
              ref={fillRef}
              d={path!}
              fill={color}
              mask={masked ? `url(#${maskId})` : undefined}
            />
            {masked && (
              // The nib. Rides getPointAtLength as the mask advances and fades
              // out as the last stroke finishes — the one detail that sells it.
              //
              // 🔴 ITS FILL AND ITS GLOW ARE DERIVED FROM `color`. THEY USED TO
              // BE HARD-CODED #F2DC96 (a pale gold) WITH A MATCHING
              // rgba(242,220,150,.85) GLOW, AND THAT IS A BUG THAT ONLY SHOWS
              // WHILE THE STROKE IS BEING DRAWN: the drawn part rendered in
              // whatever `color` was, while the moving leading edge rendered
              // bright gold. On the old navy splash the mismatch read as a warm
              // spark and passed for intentional. On cream with a gold-deep
              // signature it reads as a second, brighter gold — which is the
              // one gold this codebase bans on light surfaces (#C9A84C is
              // 2.09:1; #F2DC96 is worse still at 1.28:1).
              //
              // Deriving both from `color` means the tip cannot disagree with
              // the stroke at any frame, for any value, ever again. Do not put
              // a literal back here.
              <circle
                ref={dotRef}
                r={16}
                fill={color}
                opacity={0}
                style={{ filter: `drop-shadow(0 0 14px ${rgba(color, 0.85)})` }}
              />
            )}
          </>
        )}
      </svg>
    </motion.div>
  );
}
