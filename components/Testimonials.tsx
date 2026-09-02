"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";

/**
 * TESTIMONIALS — arrangement matched from beetogreen.com/en, studied live
 * (Chrome, 2026-08-02). Their layout, our tokens.
 *
 * MEASURED FROM THE REFERENCE AND REPRODUCED:
 *   quote      37.33px / 44.8 lh (1.2) / -0.02em / weight 500
 *   lead-in    24.89px / weight 600, sitting to the RIGHT of the counter
 *   counter    16px, "01 / 05" — ours reads 01 / 03, see §COUNT
 *   arrows     44.4px circles, radius 50%, 1px border, ~8.9px apart, TOP-LEFT
 *              in their own column, labelled "Previous/Next testimonial"
 *   ring       viewBox 0 0 50 50, circle r=24, stroke-dasharray 150.8 (=2*pi*r),
 *              stroke-width 2, animation 8s linear forwards
 *   rhythm     44px between header -> quote -> author
 * Their surface is white with near-black type; ours is cream with ink, and any
 * gold is gold-deep. The arrangement is taken, the palette is not.
 *
 * ---------------------------------------------------------------------------
 * §COUNT — THREE, not five. The counter is driven off QUOTES.length, so it can
 * never drift from the data the way a hardcoded total would.
 *
 * §NO PHOTO, AND NO PLACEHOLDER FOR ONE. The reference pairs each name with a
 * 71px circular portrait. We have no photographs of these three people, and a
 * stock or invented face beside a NAMED attributed quote would be a
 * fabrication. The photo, its circle and any initial-in-a-bubble stand-in are
 * all absent — instead the closing row is rebalanced so both ends carry
 * content: NAME bottom-left, the five-star rating bottom-right. Nothing sits in
 * the space where an image would have been, so nothing reads as missing.
 *
 * 🔴 §NO ORG FIELD EXISTS. `testimonials.quotes.*` carries `name` and `quote`
 * and nothing else — there is no organisation for any of the three. The
 * reference shows "name + company"; we show the name alone rather than invent
 * an employer. If the client supplies orgs it is one key per quote and one line
 * here.
 *
 * §THE LEAD-IN IS OUR OWN HEADING. The reference's bold phrase is its copy
 * ("Don't just take our word for it…"). Ours is `testimonials.headline` —
 * "What Our Clients Say" — placed in that exact slot, so the arrangement
 * matches with ZERO new copy and the section still carries a real h2.
 *
 * §QUOTES ARE VERBATIM. Standing Rule 3: attributed quotes are never reworded.
 * The curly quote marks around them are decorative and `aria-hidden`, so the
 * accessible name of the blockquote is the client's sentence and nothing else.
 *
 * §STARS. Client-instructed, and uniform: there is no per-testimonial rating in
 * the data, so all three show five. They are gold-deep (5.16:1 on cream), well
 * clear of the 3:1 bar rather than claimed as decorative, and the group carries
 * a text alternative so the rating is not conveyed by shape alone.
 *
 * §TIMER. 8s per slide, matching the reference.
 *
 * 🔴 IT DOES NOT PAUSE ON HOVER. Removed on instruction 2026-08-02: the carousel
 * keeps advancing under the pointer, and moving the pointer on or off the
 * section neither pauses nor resets the 8s. There is no `mouseenter` /
 * `mouseleave` handler on this component any more — do not reintroduce one
 * "for polish", it is a decision.
 *
 * 🟡 IT STILL PAUSES ON FOCUS-IN, AND THAT IS A DIFFERENT THING. A keyboard
 * user who has tabbed to an arrow is reading with no pointer to move; advancing
 * them mid-sentence is the failure the pause exists to prevent, and WCAG 2.2.2
 * requires a pause mechanism for auto-updating content. Hover was never what
 * satisfied that — focus is. So the `hovered` flag is gone and `focused` is the
 * whole pause. The `t-paused` class and the ring's `animation-play-state` follow
 * `focused` alone, so the dial still never disagrees with the timer.
 *
 * `onBlurCapture` still ignores focus moving BETWEEN the two arrows, for the
 * reason recorded below — that bug was independent of hover.
 *
 * Under reduced motion the timer never starts and the ring renders complete and
 * static; the arrows still work.
 */
const QUOTES = ["q1", "q2", "q3"] as const;
const MAX_STARS = 5;
const HOLD_MS = 8000;

/** Still gated: `testimonials.eyebrow` is a literal placeholder string. */
const TESTIMONIAL_EYEBROW_READY = false;

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  /* 🔴 FOCUS IS THE WHOLE PAUSE. HOVER IS NOT TRACKED AT ALL.
     There used to be a `hovered` flag OR'd with this one, and a long note about
     why the two had to be separate — with a single boolean, moving the POINTER
     off the section fired onMouseLeave and restarted the timer under a keyboard
     user mid-read. That note is now moot rather than solved: hover no longer
     pauses anything, so there is no second flag to cancel this one out. The
     historical bug is recorded in HANDOFF; do not re-add a hover flag to "fix"
     it. */
  const [focused, setFocused] = useState(false);
  const paused = focused;

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + QUOTES.length) % QUOTES.length),
    [],
  );

  /* The auto-advance. Suppressed entirely under reduced motion and while
     paused; re-armed on every slide change so the 8s always starts fresh. */
  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setTimeout(() => go(1), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, reduce, go]);

  const q = QUOTES[active];
  const pad = (n: number) => String(n).padStart(2, "0");

  /* THE RATING IS DATA, READ PER TESTIMONIAL — not a hardcoded five.
     An earlier build rendered five stars unconditionally, which would have
     asserted a five-star rating for any future testimonial regardless of what
     it actually scored. `quotes.*.rating` now carries the real value (all three
     are 5, confirmed by the client and verified by Hamza) and the row follows
     it. A missing, non-numeric or out-of-range value renders NO stars at all
     rather than defaulting to five — an absent rating is silent, never invented.
     Mirrored EMPTY in es.json on purpose: a rating is a number, not copy, so it
     must not be translated; i18n.ts's fallback returns the English value. */
  const ratingKey = `quotes.${q}.rating`;
  const ratingNum = t.has(ratingKey) ? Number(t(ratingKey)) : NaN;
  const showStars =
    Number.isInteger(ratingNum) && ratingNum >= 1 && ratingNum <= MAX_STARS;

  const arrow =
    "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-navy text-navy transition-colors hover:bg-navy hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep";

  return (
    <section
      aria-labelledby="testimonials-heading"
      className={`py-[clamp(56px,7vw,104px)] ${paused ? "t-paused" : ""}`}
      /* No onMouseEnter / onMouseLeave — see §TIMER. The timer keeps running
         under the pointer and the pointer never resets it. */
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        // Only release when focus actually leaves the SECTION — moving between
        // the two arrows must not momentarily un-pause the timer.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      <div className="mx-auto w-full max-w-content px-5 md:px-7">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-16">
          {/* ---------- Arrows: their own column, top-left ---------- */}
          <div className="flex items-start gap-2.5">
            <button type="button" onClick={() => go(-1)} aria-label={t("prevLabel")} className={arrow}>
              <span aria-hidden="true" className="text-[15px] leading-none">&larr;</span>
            </button>

            {/* NEXT + the countdown ring. The ring is a sibling overlay sized to
                the button, exactly as the reference builds it. `key={active}`
                restarts the stroke from empty on every slide. */}
            <span className="relative inline-grid place-items-center">
              <svg
                aria-hidden="true"
                viewBox="0 0 50 50"
                className="pointer-events-none absolute h-11 w-11 -rotate-90"
              >
                <circle
                  key={active}
                  cx="25"
                  cy="25"
                  r="24"
                  fill="none"
                  stroke="#0066CC"
                  strokeWidth="2"
                  className="t-ring"
                  style={{ ["--t-dur" as string]: `${HOLD_MS}ms` }}
                />
              </svg>
              <button type="button" onClick={() => go(1)} aria-label={t("nextLabel")} className={arrow}>
                <span aria-hidden="true" className="text-[15px] leading-none">&rarr;</span>
              </button>
            </span>
          </div>

          {/* ---------- Content ---------- */}
          <div className="min-w-0">
            {/* Header row: counter left, the bold lead-in right. */}
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <p
                aria-live="polite"
                className="shrink-0 text-[16px] leading-[1.5] text-ink/70"
              >
                {pad(active + 1)} / {pad(QUOTES.length)}
              </p>
              {TESTIMONIAL_EYEBROW_READY ? (
                <p className="text-[clamp(11px,0.75vw,11.5px)] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                  {t("eyebrow")}
                </p>
              ) : null}
              <h2
                id="testimonials-heading"
                className="font-display text-[clamp(18px,1.95vw,30px)] font-semibold leading-[1.2] tracking-[-0.015em] text-navy"
              >
                {t("headline")}
              </h2>
            </div>

            {/* The quote. 44px below the header, as measured. */}
            <blockquote className="mt-11 font-display text-[clamp(24px,2.92vw,44px)] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
              <span aria-hidden="true">&ldquo;</span>
              {t(`quotes.${q}.quote`)}
              <span aria-hidden="true">&rdquo;</span>
            </blockquote>

            {/* Closing row, 44px below: name left, stars right. This is the row
                that replaces the reference's portrait — see §NO PHOTO. */}
            <div className="mt-11 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <p className="font-display text-[18px] leading-tight text-ink">
                {t(`quotes.${q}.name`)}
              </p>

              {showStars ? (
                <p
                  role="img"
                  aria-label={t("rating", { n: ratingNum })}
                  className="flex shrink-0 items-center gap-1 text-[18px] leading-none"
                >
                  {Array.from({ length: MAX_STARS }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      /* Earned stars gold-deep (5.16:1 on cream). Unearned ones
                         are a HOLLOW glyph at ink/50 (3.27:1) — they carry
                         meaning when a rating is below five, so they clear 3:1
                         rather than being claimed as decorative, and the shape
                         differs too so it is never colour alone. */
                      className={i < ratingNum ? "text-gold-deep" : "text-ink/50"}
                    >
                      {i < ratingNum ? "★" : "☆"}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
