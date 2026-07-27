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
  }: { from?: number; to?: number; reduce?: boolean | null } = {},
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
  }, [sectionRef, bgRef, from, to, reduce]);
}
