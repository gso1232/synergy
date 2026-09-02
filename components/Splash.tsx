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
 * It is decorative: aria-hidden with no focusable children, so it cannot take
 * focus or be announced while it covers the page, and it is unmounted (not
 * merely hidden) once lifted.
 *
 * =============================================================================
 * 🔴 IT REPLAYED ON SOME INTERNAL NAVIGATIONS, AND THE OLD DOCBLOCK HERE SAID
 * IT DID NOT. That claim — "mounted in the layout, so it runs once per real
 * document load" — was true only WITHIN one layout.
 *
 * `Splash` is mounted in `(site)/layout.tsx`. `(portal)/` is a SEPARATE ROUTE
 * GROUP with its own layout, so moving between the two tears the site layout
 * down and builds it back up:
 *
 *     /en → /en/about        same layout, Splash persists     no replay
 *     /en → /en/login        (site) layout UNMOUNTS
 *     /en/login → /en        (site) layout REMOUNTS  ->  useState(true)  REPLAY
 *
 * A remounted component gets fresh state, so `useState(true)` made the panel
 * visible again and it played over a client-side navigation. That is what the
 * client was seeing. Adding the login link to the header made it easy to hit.
 *
 * 🔴 THE FIX IS A MODULE-SCOPE FLAG, NOT sessionStorage, AND THE DISTINCTION IS
 * THE WHOLE REQUIREMENT. The brief is: play on first visit AND on manual
 * refresh, never on internal navigation. Those three cases are exactly
 * distinguished by JS MODULE LIFETIME:
 *
 *     first visit      new document -> new JS context -> flag false -> PLAYS
 *     manual refresh   new document -> new JS context -> flag false -> PLAYS
 *     internal nav     SAME document, same context     -> flag true  -> silent
 *
 * A module-level variable is created once per document and survives every
 * client-side navigation, including across route groups, because the module is
 * not re-evaluated. It dies with the document, which is precisely what a
 * refresh produces.
 *
 * `sessionStorage` would be WRONG here: it persists ACROSS refreshes for the
 * whole tab session, so the splash would never play on refresh — the opposite
 * of what was asked. `performance.navigation.type` alone is also insufficient:
 * a soft navigation does not create a new navigation entry, so after
 * /login → / it still reports whatever loaded /login.
 *
 * ⚠️ THE FLAG IS SET WHEN THE PANEL LIFTS, NOT WHEN IT MOUNTS, AND THAT IS FOR
 * REACT STRICT MODE. Strict Mode mounts every component twice in development
 * (mount, unmount, remount). Setting the flag on mount would have the second
 * mount read `true` and skip, so the splash would flash and vanish in dev and
 * be untestable. The lift happens ~1.6s later, long after the double-mount, so
 * both environments behave identically.
 *
 * 🟡 ONE ACCEPTED EDGE CASE: navigating away DURING the splash and returning
 * within the same document replays it, because it never reached the lift that
 * sets the flag. It is a ~1.6s window on a decorative panel; setting the flag on
 * unmount instead would reintroduce the Strict Mode problem above. Left as is,
 * deliberately.
 *
 * Under prefers-reduced-motion nothing is drawn or animated — the panel never
 * renders and the site is visible immediately.
 */
const HOLD_AFTER_DRAW = 400; // ms
const MEDIA_WAIT_CAP = 2500; // ms — never hang the splash on a slow network
const FAILSAFE = 5000; // ms — lift regardless, so a blocked font or a stalled
//                        animation frame can never leave the panel covering
//                        the site

/**
 * THE SIGNATURE'S COLOUR. Two approved options, both measured on the splash's
 * own cream #F8F4EE. Swap the pair to compare; nothing else changes.
 *
 *   #7D641F  gold-deep   5.16 : 1   ← CURRENT. Warm, brand gold, legible.
 *   #0D1B2A  navy       15.87 : 1     Maximum legibility, no warmth.
 *
 * 🔴 PLAIN GOLD #C9A84C IS NOT AN OPTION AND MUST NOT BE PUT BACK. It is
 * 2.09:1 on this surface — the same figure that bans gold as type on every
 * light surface in this codebase (token table at the head of globals.css). It
 * was legal on the OLD navy splash panel at 7.61:1; that panel is gone.
 *
 * WHAT THE RATIO DOES NOT TELL YOU, AND WHY BOTH ARE KEPT. Contrast here is
 * colour-only, so it is IDENTICAL at every viewport — 5.16 at 1536 and 5.16 at
 * 390. What actually changes with viewport is STROKE WEIGHT, and this is a thin
 * cursive script, not a block of text.
 *
 * Rasterised at the three real rendered widths and measured as horizontal ink
 * runs (a diagonal stroke reads wider than its true perpendicular width, so
 * these are upper bounds, not the thinnest the stroke gets):
 *
 *   760 x 283  (1536)   p05  8px   p25  9px   median 12px   n=1516
 *   553 x 206  ( 768)   p05  6px   p25  7px   median  9px   n=1100
 *   281 x 104  ( 390)   p05  3px   p25  4px   median  4px   n= 552
 *
 * At 390 the thin end of the stroke is 3px BY THAT UPPER-BOUND MEASURE, so the
 * true perpendicular minimum is under it. That is the viewport where the 3x
 * gap between 5.16 and 15.87 stops being academic — not because gold-deep
 * fails a bar, but because a hairline at 5:1 and a hairline at 16:1 are
 * different objects to the eye. If the splash ever renders smaller than it does
 * today, re-measure before assuming gold-deep still holds.
 *
 * ONLY THE COLOUR CHANGES. `color` feeds the glyph FILL; the reveal is a
 * separate mask (a hand-authored centreline stroked with round caps), so the
 * .otf fetch, the opentype.js path, the viewBox, the group timings and the
 * `useReducedMotion` fallback are all untouched by either value.
 */
const SIGNATURE_INK = "#0066CC";
/** const SIGNATURE_INK = "#0D1B2A"; // navy — the 15.87:1 alternative */

/**
 * 🔴 MODULE SCOPE IS THE MECHANISM — see the docblock at the top of this file.
 * Created once per DOCUMENT, survives every client-side navigation, dies on a
 * real page load. Do not move this inside the component (it would reset on every
 * remount, which is the bug) and do not swap it for sessionStorage (that
 * survives refreshes, which the brief requires it not to).
 */
let playedInThisDocument = false;

export default function Splash() {
  const reduce = useReducedMotion();
  /* Decided ONCE, on first render, from the module flag. A lazy initialiser so
     the module value is read at mount rather than on every render. */
  const [shouldPlay] = useState(() => !playedInThisDocument);
  const [visible, setVisible] = useState(shouldPlay);
  const [mounted, setMounted] = useState(false);
  // Hard kill — bypasses AnimatePresence. If the exit animation never
  // completes (no animation frames, interrupted tab, framer stalled), the
  // panel is still torn out of the DOM rather than covering the site forever.
  const [killed, setKilled] = useState(false);

  useEffect(() => setMounted(true), []);

  /** The single place the panel comes down. Marks the document as having seen
   *  the splash, so any later client-side navigation finds the flag set. */
  const lift = useCallback(() => {
    playedInThisDocument = true;
    setVisible(false);
  }, []);

  // Hard failsafe — the panel always lifts, whatever happens upstream, and is
  // force-unmounted shortly after in case the exit animation never resolves.
  // Skipped entirely when this document has already played: there is no panel
  // to lift and no reason to hold two timers open.
  useEffect(() => {
    if (!shouldPlay) return;
    const liftTimer = setTimeout(lift, FAILSAFE);
    const kill = setTimeout(() => setKilled(true), FAILSAFE + 1600);
    return () => {
      clearTimeout(liftTimer);
      clearTimeout(kill);
    };
  }, [shouldPlay, lift]);

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
      lift();
    }, HOLD_AFTER_DRAW);
    return () => clearTimeout(t);
  }, [lift]);

  // Already played in this document (an internal navigation remounted us), or
  // torn down by the failsafe: render nothing at all.
  if (!shouldPlay || !mounted || killed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          /* 🔴 CREAM, NOT NAVY — AND #F8F4EE IS NOT AN APPROXIMATION.
             The page surface is now `linear-gradient(180deg,#F8F4EE,#F4EFE4)`
             on <body>. This overlay covers the viewport at the TOP of the
             document, where that gradient is at its first stop — exactly
             #F8F4EE. So `bg-cream` is not "close to" the site behind it, it is
             the identical value, and the clip-path lift reveals a surface of
             the same colour rather than cutting from dark to light. */
          className="fixed inset-0 z-[100] flex items-center justify-center bg-cream"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1] }}
        >
          <Signature
            text="Synergy"
            fontUrl="/LastoriaBoldRegular.otf"
            color={SIGNATURE_INK}
            onDone={handleDrawn}
            className="w-[min(72vw,760px)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
