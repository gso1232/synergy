"use client";

import { useEffect } from "react";

/**
 * Site-wide smooth scroll (Lenis) wired into the GSAP ticker so ScrollTrigger
 * parallax stays in sync — matching the reference's feel. This is momentum
 * scrolling only: it never hijacks direction, never snaps, never pauses. Under
 * prefers-reduced-motion it does nothing at all (native scroll, no parallax).
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      (window as unknown as { lenis?: unknown }).lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <>{children}</>;
}
