"use client";

import { useEffect, type RefObject } from "react";

/**
 * The pinned image-zoom section — restaurantsem.com's §7, their tallest block
 * (1973px against a 658px viewport, i.e. a runway exactly 3x the pinned
 * element).
 *
 * WHAT THEIRS DOES, measured: a one-viewport element is `position: sticky;
 * top: 0` inside that tall runway, and its scale is scrubbed 0.5 -> 1.0 with
 * `transform-origin: center`. You watch a small card grow to fill the screen
 * while the page scrolls past it, then it releases and the next section arrives.
 *
 * THE PIN IS CSS, NOT GSAP, AND THAT IS DELIBERATE.
 *
 * ScrollTrigger's own `pin: true` works by rewriting the document: it wraps the
 * element in a pin-spacer, switches it to position:fixed and injects padding to
 * hold the space. Under Lenis that means the pinned element leaves the smoothed
 * scroll context while everything around it stays in it, and the two disagree
 * by a frame — the card judders against the sections above and below it. Native
 * `position: sticky` is composited by the browser and cannot desynchronise from
 * a scroll position it is derived from. GSAP is left doing the one thing it is
 * needed for: scrubbing a single transform.
 *
 * That also keeps this hook honest about layout. It never measures, never
 * writes a height, and never touches the DOM outside the transform — the runway
 * height is a class in the markup, so a reader can see the section's real size
 * without reading this file.
 *
 * SCALE ORIGIN. Centre, so the card grows outward in both axes at once and the
 * frame's midpoint is fixed on screen for the whole run. With a top origin the
 * subject slides down as it grows and the eye tracks the motion instead of the
 * image.
 *
 * REDUCED MOTION: returns before importing GSAP. No tween and no scrub, and the
 * markup's own `motion-reduce:` classes drop the runway to one viewport and the
 * sticky to static, so the section becomes a plain full-bleed image at scale 1.
 * Not a shorter zoom — no zoom. Full-bleed rather than half-size is the right
 * resting state: 0.5 is the *start* of an effect, and freezing an effect at its
 * start ships a half-scale image nobody asked for.
 */
export function useStickyZoom(
  /** The sticky, one-viewport element whose transform is scrubbed. */
  targetRef: RefObject<HTMLElement>,
  /** The tall runway. ScrollTrigger measures this, not the sticky child —
   *  a sticky element's own rect is pinned and would give a zero-length run. */
  runwayRef: RefObject<HTMLElement>,
  { from = 0.5, to = 1, reduce = false }: {
    from?: number;
    to?: number;
    reduce?: boolean | null;
  } = {},
) {
  useEffect(() => {
    if (
      reduce ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const el = targetRef.current;
      const runway = runwayRef.current;
      if (!el || !runway) return;

      const tween = gsap.fromTo(
        el,
        { scale: from },
        {
          scale: to,
          ease: "none",
          transformOrigin: "50% 50%",
          scrollTrigger: {
            trigger: runway,
            // The sticky child is stuck to the viewport top from the moment the
            // runway's top reaches it, so the scrub has to start there — not at
            // `top bottom`, which would burn half the zoom while the card is
            // still travelling up the screen and land it at full scale before
            // it ever pins. It ends when the runway has given up all its slack,
            // i.e. its bottom reaches the viewport bottom.
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [targetRef, runwayRef, from, to, reduce]);
}
