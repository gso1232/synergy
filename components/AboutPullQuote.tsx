"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useWordReveal } from "./useWordReveal";

/**
 * The About page's pull-quote section — restaurantsem.com's §3 and §6, which
 * are the only two blocks on their homepage whose type animates.
 *
 * ANATOMY, RE-MEASURED LIVE: no background of any kind (the page's single
 * gradient shows through), one block of large light type, and nothing else in
 * the section — no attribution, no rule, no quote mark as a pseudo-element.
 *
 *   .text-pullquote   75.44px / 113.16px (lh 1.5) / weight 300, white
 *                     x51, width 1424 inside a 1444 container — the FULL
 *                     measure, four lines, 30 word spans at opacity 0.2
 *   758 viewport      52.57 / 73.59
 *   390 viewport      38.14 / 57.21
 *
 * Theirs computes to `text-align: center`, but at a full-width measure the
 * first line still begins at the left gutter and the difference is invisible;
 * ours is left-aligned, which is what the brief asked for and what the section
 * actually looks like.
 *
 * OURS: the same scale via `.sem-quote`, on Kufam at weight 400 — our display
 * face tops out at 500 and this page never goes above it. The 38.14px floor is
 * load-bearing, not aesthetic: it keeps the quote LARGE TEXT at every width
 * (the threshold is 24px), which is what lets the word reveal's floor opacity
 * be judged against 3:1 rather than 4.5:1. See useWordReveal.
 *
 * The quotes are attributed to nobody and are Synergy's own published lines,
 * reproduced verbatim from fflsynergy.com — §3 from their About page, §6 from
 * their homepage. Neither is reworded.
 *
 * <blockquote> rather than a heading: this is a quotation, and it is not a
 * section title. It carries no heading level, so it cannot compete with the
 * page's single h1 or disturb the h2 outline of the sections around it.
 */
export default function AboutPullQuote({
  text,
  /** Vertical rhythm differs between the two: theirs are 715px and 705px tall
   *  on a 658px viewport, i.e. a hair over one screen each. */
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLQuoteElement>(null);

  useWordReveal(ref, text, { reduce });

  return (
    <section className={`sem-shell ${className}`}>
      <div className="sem-inner">
        {/* NO MEASURE CAP. The previous build carried `max-w-[16ch]`, which on
            a 1444px container wrapped the quote after about a third of the
            width and left it starting somewhere near the middle of the screen.
            Theirs runs the FULL container: `.text-pullquote` measured at x51,
            width 1424 of a 1444 container, four lines at 75.44/113.16. The
            container is the measure. */}
        <blockquote ref={ref} className="sem-quote font-display text-cream">
          {text}
        </blockquote>
      </div>
    </section>
  );
}
