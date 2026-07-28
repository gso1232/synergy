"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scroll-driven background parallax — the single implementation, shared by the
 * Coverage ("What we do") section and Testimonials.
 *
 * This was lifted verbatim out of WhatWeCover, where it was written first, so
 * both sections are driven by exactly the same tween rather than by two
 * implementations that happen to look similar. The numbers are OURS, not
 * reyou's: they run yPercent -35 -> 0 with `scrub: 2` (a two-second lag);
 * we run a symmetric ±16 with `scrub: true` (locked to the scroll position).
 * Coverage's feel is the target, so Coverage's numbers are the default.
 *
 * Lenis is already global — SmoothScroll mounts it once and drives
 * ScrollTrigger.update off the GSAP ticker — so nothing scroll-related is set
 * up here beyond the tween itself.
 *
 * GSAP does the transform writes off its own ticker. Nothing in this file reads
 * layout during scroll: no getBoundingClientRect, no offsetTop, no
 * getComputedStyle. ScrollTrigger measures the trigger once on creation and on
 * refresh (resize), then works from cached values, so the scroll path is
 * write-only and cannot force a synchronous layout.
 *
 * Under prefers-reduced-motion the effect returns before importing GSAP at all:
 * no tween is created, no ScrollTrigger is registered, and the background
 * simply sits static at its CSS position. It is not a slower parallax — there
 * is no parallax.
 */
export function useParallax(
  sectionRef: RefObject<HTMLElement>,
  bgRef: RefObject<HTMLElement>,
  {
    from = -16,
    to = 16,
    reduce = false,
    // framer-motion's useReducedMotion returns boolean | null (null until it
    // has read the media query), so accept null rather than forcing every
    // caller to coerce it.
    //
    // SCRUB MODE. `true` (the default, and what every existing call site gets)
    // locks the tween to the scroll position exactly. A NUMBER instead gives
    // GSAP that many seconds to catch up, so the layer eases toward its target
    // rather than tracking it rigidly.
    //
    // It exists because restaurantsem.com's own image-grid parallax is a
    // Webflow SCROLLING_IN_VIEW continuous action with `smoothing: 50` — a
    // damped follow, not a locked scrub, and that damping is most of what
    // reads as "smooth" on their page. Measured: scroll instantly to a new
    // position and their transform is still travelling toward it ~0.5s later.
    //
    // Added as an OPTION rather than a change of default so that Coverage and
    // Testimonials keep the exact feel they were tuned to; nothing outside the
    // About page passes it.
    scrub = true,
  }: {
    from?: number;
    to?: number;
    reduce?: boolean | null;
    scrub?: boolean | number;
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

      const el = bgRef.current;
      const sec = sectionRef.current;
      if (!el || !sec) return;

      const tween = gsap.fromTo(
        el,
        { yPercent: from },
        {
          yPercent: to,
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top bottom",
            end: "bottom top",
            scrub,
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
  }, [sectionRef, bgRef, from, to, reduce, scrub]);
}
