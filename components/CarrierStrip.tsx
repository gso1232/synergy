"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LOGO_FILE, LOGO_DIR } from "@/lib/carrierLogos";
import { APPOINTMENTS } from "./Carriers";

/**
 * THE CARRIER MARQUEE — all 21 appointments, scrolling right to left.
 *
 * Rendered TWICE on the homepage (directly under the hero, and again in the
 * slot TheEngine vacated). One component, so the two cannot drift in speed,
 * direction, sizing or content.
 *
 * ---------------------------------------------------------------------------
 * §MOTION — TAKEN FROM reyou.life's OWN SOURCE, NOT FROM WATCHING IT.
 *
 * Their marquee is a Webflow + GSAP build; the code is in the Slater bundle
 * `assets.slater.app/slater/19027/59810.js`, function `initMarquee()`. Read
 * verbatim, with the parts that matter unminified:
 *
 *     function initMarquee(){
 *       const t = 80;                                   // px per second
 *       ...
 *       const c = gsap.timeline({ repeat: -1, ... });
 *       c.fromTo(a, { xPercent: 0 }, {
 *           xPercent: -100,
 *           duration: Math.max(800, a[0].offsetWidth) / t,
 *           ease: "none"
 *       });
 *       ...
 *       n(reducedMotion);
 *     }
 *
 * So the whole spec is four numbers:
 *
 *   SPEED       80 px/s exactly (`const t = 80`)
 *   DURATION    max(800, panelWidth) / 80   — width-derived, not a fixed time
 *   EASING      "none" = linear. No accel, no decel, ever.
 *   REPEAT      -1 = infinite
 *   DIRECTION   xPercent 0 -> -100 = right to left
 *
 * Measured on their live DOM at 1536 to confirm the reading: panel 3182px, so
 * 3182 / 80 = 39.775s — which is the duration their timeline actually runs.
 *
 * OURS IS THE SAME VELOCITY, NOT THE SAME DURATION, AND THAT IS THE POINT.
 * Duration is derived from panel width, so a wider panel takes proportionally
 * longer and the marks pass the eye at an identical 80 px/s. Their panel holds
 * 13 marks; ours holds 21. Copying their 39.775s would have run ours ~54%
 * faster than theirs, which is the opposite of matching.
 *
 * §SEAM. Two identical panels sit side by side in one flex track. reyou moves
 * each panel by -100% of its own width; this moves the single track by -50% of
 * its two-panel width. Identical geometry, and the CSS keyframe already exists
 * (`.marquee-left` in globals.css) and is transform-only, so it composites on
 * the GPU. The gap is carried INSIDE each panel (gap + a trailing pad of the
 * same size) so it stays even across the seam rather than landing half a gap
 * short.
 *
 * §WHAT ELSE IS COPIED FROM THEM, DELIBERATELY:
 *   · 96px gap between marks, and 96px of trailing pad  (their `.marquee-4_list`
 *     is `gap: 96px; padding-right: 96px` — measured on their computed style)
 *   · FULL COLOUR. No greyscale. Theirs are full-colour and the previous build
 *     of this component desaturated ours; that is now gone.
 *   · align-items: center
 *   · No edge fade. Their `.marquee-4_component` is `overflow: visible` with the
 *     clip happening upstream at `.page_wrap { overflow: clip }` — there is no
 *     mask-image anywhere in their marquee. The 80px alpha mask this component
 *     used to carry is therefore NOT applied; the row is a hard clip like
 *     theirs. Add `.marquee-row`'s mask back if the hard edge is disliked.
 *
 * §WHERE WE DELIBERATELY DIVERGE — THREE THINGS, ALL DEFENSIBLE:
 *
 *   1. 🔴 REDUCED MOTION STOPS COMPLETELY. reyou does NOT stop: their last line
 *      is `n(reducedMotion)`, and `n(true)` sets `timeScale(0.01)` — a 100x
 *      slowdown, so at our panel width it still crawls a full lap in ~1.7
 *      hours. That is motion, and someone who set the OS flag asked for none.
 *      Ours hits `animation: none` and becomes a static, horizontally
 *      scrollable strip with the duplicate panel dropped (globals.css). This is
 *      the one place "exactly like reyou" is knowingly not followed.
 *
 *   2. COMMON 40px BAND. reyou sizes every mark individually — 32/40/48/64/80px
 *      (`is-2rem` ... `is-5rem`), hand-set per logo. That is art direction over
 *      13 known marks; we have 21 and no per-mark direction from the client, so
 *      every mark is normalised to one 40px height with width free. Because a
 *      marquee never wraps, width being free is exactly what lets a 1.00:1
 *      crest and a 5.85:1 wordmark share a row without either being squashed.
 *      Per-mark optical sizing is the obvious follow-up if it is wanted.
 *
 *   3. NO DRAG, NO PLAY/PAUSE BUTTON. Theirs has both — a GSAP Observer that
 *      scrubs timeScale from pointer velocity (clamped +/-30) and an
 *      aria-pressed toggle. Neither was asked for and both are input surfaces
 *      that need their own a11y pass. Not built rather than half-built.
 *
 * ---------------------------------------------------------------------------
 * 🔴 TWO LOGOS ARE KNOWN-BROKEN AND SHIP ANYWAY, ON INSTRUCTION.
 * `athene.png` and `national-life-group.png` are 100% opaque with 100% opaque
 * EDGES — they are not transparent marks, they are a navy box and a green box.
 * Measured, both flagged in the Part A audit, and NEITHER has a transparent
 * version anywhere on disk (all three drop folders hold the same bytes). They
 * need a transparent file from the carrier. Nothing here can fix that without
 * editing a trademark, which is not ours to do.
 */

/** reyou's `const t = 80`. Pixels per second. The one number that sets feel. */
const PX_PER_SECOND = 80;
/** reyou's `Math.max(800, ...)` floor, kept so a short panel cannot sprint. */
const MIN_PANEL_PX = 800;
/** Their `.marquee-4_list` gap AND trailing pad, both 96px. */
const GAP_PX = 96;

export default function CarrierStrip({
  /** Marquee 2 passes false: the same kicker twice on one page reads as a bug. */
  showKicker = true,
}: {
  showKicker?: boolean;
}) {
  const t = useTranslations("carriers");
  const panelRef = useRef<HTMLUListElement>(null);
  /** null until measured — the track stays still rather than running at a
   *  guessed speed for a frame. reyou measures at init for the same reason. */
  const [duration, setDuration] = useState<number | null>(null);

  const logos = APPOINTMENTS.map((a) => ({
    key: a.key,
    name: t(`names.${a.key}`),
    src: `${LOGO_DIR}/${LOGO_FILE[a.key]}`,
  }));

  /* DURATION IS MEASURED, NOT HARDCODED — this is `a[0].offsetWidth / t`.
     It has to run after the logos decode: every mark is `w-auto`, so an
     undecoded panel measures narrow and would yield a fast, wrong duration.
     Re-measured on resize because the band is the same 40px at every width but
     the browser's subpixel rounding of 21 auto widths is not. */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let alive = true;
    const measure = () => {
      if (!alive || !panel) return;
      const w = panel.getBoundingClientRect().width;
      if (w > 0) setDuration(Math.max(MIN_PANEL_PX, w) / PX_PER_SECOND);
    };

    measure();
    const imgs = Array.from(panel.querySelectorAll("img"));
    const pending = imgs.filter((i) => !i.complete);
    pending.forEach((i) => {
      i.addEventListener("load", measure, { once: true });
      i.addEventListener("error", measure, { once: true });
    });

    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, []);

  const panel = (dup: boolean) => (
    <ul
      ref={dup ? undefined : panelRef}
      key={dup ? "dup" : "base"}
      aria-hidden={dup || undefined}
      aria-label={dup ? undefined : t("ariaLabel")}
      className={`flex w-max shrink-0 list-none items-center${dup ? " marquee-dup" : ""}`}
      style={{ gap: GAP_PX, paddingRight: GAP_PX }}
    >
      {logos.map((c) => (
        <li key={c.key} className="flex h-10 shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.src}
            alt={c.name}
            decoding="async"
            /* h-10 = the 40px common band; width auto keeps native aspect, and
               NOTHING desaturates it — reyou's marks are full colour and so are
               these now. No max-width: the widest mark is 232px at this band
               and a cap would squash it below the band. */
            className="h-10 w-auto object-contain"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label={t("ariaLabel")} className="py-[var(--section-y)]">
      {showKicker && (
        <p className="px-6 text-center text-[13px] font-medium uppercase tracking-[0.16em] text-gold-deep lg:text-[14px]">
          {t("stripKicker")}
        </p>
      )}

      {/* `.marquee-row` is kept for ONE reason and it is not the mask: its
          `prefers-reduced-motion` block in globals.css is what flips this to
          `overflow-x: auto`, so a reader who stopped the animation can still
          reach the marks past the fold. Dropping the class for a bare
          `overflow-hidden` would have silently made 4000px of logos
          unreachable under reduced motion.

          THE MASK IT ALSO CARRIES IS TURNED OFF INLINE. reyou has no edge fade
          anywhere in their marquee — `.marquee-4_component` is
          `overflow: visible` and the clip happens upstream at
          `.page_wrap { overflow: clip }`. Hard edges, like theirs. Delete these
          two lines to get the 80px alpha fade back. */}
      <div
        className={`marquee-row relative ${showKicker ? "mt-10 lg:mt-12" : ""}`}
        style={{ WebkitMaskImage: "none", maskImage: "none" }}
      >
        <div
          className="marquee-track marquee-left flex w-max"
          /* Paused until measured, then linear/infinite at exactly 80 px/s.
             `animation-play-state` rather than not setting the class, so the
             element is composited from first paint and does not get promoted
             mid-animation. */
          style={{
            animationDuration: duration ? `${duration}s` : undefined,
            animationPlayState: duration ? "running" : "paused",
          }}
        >
          {panel(false)}
          {panel(true)}
        </div>
      </div>
    </section>
  );
}
