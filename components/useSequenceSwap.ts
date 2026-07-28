"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Scroll-linked active index for a sticky-visual / scrolling-copy section.
 *
 * Modelled on restaurantsem.com's `/mindset` §2 (`.section_principles`), which
 * was measured live: a sticky image column on one side, a list of copy blocks
 * on the other, and a class toggle that swaps the image as each block passes.
 *
 * THEIR NUMBERS, KEPT:
 *
 *   trigger    an item becomes active when ITS TOP EDGE crosses the vertical
 *              MIDDLE of the viewport. Measured at four transitions by 10px
 *              bisection: item top minus scrollY was 324 / 320 / 327 / 323
 *              against a 658px viewport — 49.2 / 48.6 / 49.7 / 49.1%.
 *   symmetric  the same line going up. Down 820/1190/1510/1880, up
 *              810/1180/1500/1870 — a 10px spread that is my sample step, not
 *              hysteresis. There is none, and none is added here.
 *
 * 🔴 WHAT IS DELIBERATELY NOT COPIED: THEIRS IS DEAD ON A JUMP.
 *
 * Measured: scroll to 2400, then jump to 0, and the active index does not
 * change. Gradual scrolling works perfectly in both directions; an instant
 * jump does not update it at all. That signature is an IntersectionObserver
 * whose rootMargin collapses the root to a zero-height line at the viewport
 * middle — nothing is ever INSIDE a zero-height band unless it crosses during
 * a frame, so a jump fires no callback and the last index sticks. Anchor
 * links, browser scroll restoration, Cmd+Down and a hard flick all leave a
 * stale image on their page.
 *
 * This uses ONE ScrollTrigger PER ITEM instead, with `start: "top center"` and
 * `end: "bottom center"`. ScrollTrigger evaluates its state on creation, on
 * refresh and on every scroll — including a discontinuous one — so the jump
 * case resolves correctly. It also satisfies the project rule that nothing
 * reads layout in the scroll path: ScrollTrigger measures on creation and
 * refresh only, then works from cached values, so no `getBoundingClientRect`
 * runs per frame. A hand-rolled scroll handler would have to measure every
 * frame and would violate that rule to fix a bug we can fix for free.
 *
 * It is also the same GSAP + Lenis wiring `useParallax`, `useWordReveal` and
 * `useStickyZoom` already run on. No second scroll system.
 *
 * REDUCED MOTION: the sequence is INFORMATION, not decoration — the image
 * tells you which product you are reading about, so it must keep working. The
 * hook therefore still runs and still returns the right index; what changes is
 * in the markup, where the CSS crossfade is dropped so the swap is instant.
 * That is the opposite of the other hooks on this project, which switch
 * themselves off, and the reason is that this one carries meaning.
 */
export function useSequenceSwap(
  /** One ref per copy block, in document order. */
  itemRefs: RefObject<HTMLElement>[],
): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = itemRefs.map((r) => r.current).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // One trigger per item, used ONLY as a holder for its cached `start`
      // scroll position. `start: "top center"` is their measured line: the
      // item's top edge against the viewport middle.
      //
      // NOTE these carry no callbacks. Crossing callbacks (onEnter /
      // onEnterBack) are what make theirs directional and what make a jump
      // ambiguous — a scroll that skips four items fires four callbacks whose
      // order is not guaranteed to end on the right one.
      const marks = els.map((el) =>
        ScrollTrigger.create({ trigger: el, start: "top center" }),
      );

      // THE WHOLE INDEX IS DERIVED, NOT ACCUMULATED. It is a pure function of
      // the current scroll position against cached start values: the last mark
      // whose line we are past. That makes it correct by construction at any
      // scroll position, reached any way — continuous, jumped, restored on
      // load, or set by an anchor link. It cannot go stale because it holds no
      // state of its own.
      //
      // `t.start` and `t.scroll()` are both cached values ScrollTrigger
      // already maintains; nothing here measures layout, so the project's
      // "no layout reads in the scroll path" rule holds.
      const resolve = () => {
        const y = marks[0].scroll();
        let idx = 0;
        for (let i = 0; i < marks.length; i++) if (y >= marks[i].start) idx = i;
        setActive(idx);
      };

      // One container-spanning trigger drives it. `onUpdate` fires on every
      // scroll within range, including the frame a jump lands on.
      const driver = ScrollTrigger.create({
        trigger: els[0],
        endTrigger: els[els.length - 1],
        start: "top bottom",
        end: "bottom top",
        onUpdate: resolve,
        onRefresh: resolve,
      });
      resolve();

      cleanup = () => {
        driver.kill();
        marks.forEach((t) => t.kill());
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemRefs.length]);

  return active;
}
