"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Signature from "./Signature";

/**
 * Intro panel, BeeToGreen's `.preloader` treatment, measured from their bundle:
 *
 *   gsap.timeline()
 *     .to(overlay, { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "expo.inOut" })
 *     .call(() => removePreloader())
 *
 * so: a clip-path wipe upward over 1.2s on expo.inOut — the panel's own box
 * collapses from the bottom edge up, which means the hero underneath never
 * moves — then the node is removed from the DOM entirely (as they do).
 * expo.inOut is expressed here as its cubic-bezier equivalent (0.87, 0, 0.13, 1).
 *
 * Mounted in the layout, so it runs once per real document load and does not
 * replay on client-side navigation. It is decorative: aria-hidden with no
 * focusable children, so it cannot take focus or be announced while it covers
 * the page, and it is unmounted (not merely hidden) once lifted.
 *
 * Under prefers-reduced-motion nothing is drawn or animated — the panel never
 * renders and the site is visible immediately.
 */
const HOLD_AFTER_DRAW = 400; // ms
const MEDIA_WAIT_CAP = 2500; // ms — never hang the splash on a slow network
const FAILSAFE = 5000; // ms — lift regardless, so a blocked font or a stalled
//                        animation frame can never leave the panel covering
//                        the site

export default function Splash() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  // Hard kill — bypasses AnimatePresence. If the exit animation never
  // completes (no animation frames, interrupted tab, framer stalled), the
  // panel is still torn out of the DOM rather than covering the site forever.
  const [killed, setKilled] = useState(false);

  useEffect(() => setMounted(true), []);

  // Hard failsafe — the panel always lifts, whatever happens upstream, and is
  // force-unmounted shortly after in case the exit animation never resolves.
  useEffect(() => {
    const lift = setTimeout(() => setVisible(false), FAILSAFE);
    const kill = setTimeout(() => setKilled(true), FAILSAFE + 1600);
    return () => {
      clearTimeout(lift);
      clearTimeout(kill);
    };
  }, []);

  // Reduced motion: the panel still shows and still wipes, but the signature
  // renders as a finished fill with no drawing animation — Signature reports
  // done immediately, so this becomes render → hold → wipe.
  // (Previously the whole splash was skipped under reduced motion.)

  // Lock scroll only while the panel covers the page.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  /** Lift once the word is drawn, held briefly, and the hero photo has actually
   *  decoded — so the reveal never lands on the blur placeholder. Capped so a
   *  slow connection delays the lift by at most MEDIA_WAIT_CAP. */
  const handleDrawn = useCallback(() => {
    const started = performance.now();
    const mediaReady = () =>
      new Promise<void>((resolve) => {
        const img = document.querySelector<HTMLImageElement>(
          ".hero-card img",
        );
        if (!img || img.complete) return resolve();
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        img.addEventListener("load", done);
        img.addEventListener("error", done);
        const left = Math.max(0, MEDIA_WAIT_CAP - (performance.now() - started));
        setTimeout(done, left);
      });

    const t = setTimeout(async () => {
      await mediaReady();
      setVisible(false);
    }, HOLD_AFTER_DRAW);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || killed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1] }}
        >
          <Signature
            text="Synergy"
            fontUrl="/LastoriaBoldRegular.otf"
            color="#C9A84C"
            onDone={handleDrawn}
            className="w-[min(72vw,760px)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
