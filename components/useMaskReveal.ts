"use client";

import { useEffect, type RefObject } from "react";

/**
 * MASKED WORD SLIDE-UP — a measured twin of beetogreen.com/en's scroll reveal.
 *
 * ✅ SHIPPED 2026-08-03, site-wide, via `components/RevealText.tsx` — the
 * headings on the homepage's WhatWeCover, /about, /blog, /blog/[slug] and
 * /contact. (It was proposed from a `_reveal-lab` demo route, which has since
 * been deleted; references to that URL elsewhere in the codebase are historical.)
 *
 * It does NOT replace `useWordReveal` — that hook still owns the About
 * pull-quotes and is a different effect (scrubbed opacity, not a played
 * transform). `useParallax`, `useStickyZoom` and `useSequenceSwap` are
 * untouched.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THIS IS A NEW HOOK AND NOT A TUNE OF AN EXISTING ONE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `useWordReveal` is the closest thing we have and it is still the wrong
 * mechanism, on three counts that no amount of parameter tuning reaches:
 *
 *   1. IT ANIMATES OPACITY; THIS ANIMATES TRANSFORM. beetogreen never touches
 *      opacity — measured 1 at every frame on every word. Ours fades 0.55 -> 1.
 *   2. IT IS SCRUBBED; THIS IS PLAYED. `useWordReveal` binds progress to scroll
 *      position (ScrollTrigger `scrub: true`), so scrolling back un-reveals.
 *      beetogreen fires a CSS transition once and never touches it again.
 *   3. IT EMITS ONE SPAN PER WORD; THIS NEEDS TWO, NESTED. The mask IS the
 *      outer span (`overflow: hidden`); the travel is the inner one. A
 *      single-span structure cannot clip its own transform.
 *
 * So the split is re-implemented rather than shared: the DOM SHAPE differs, and
 * a "shared" splitter parameterised over one-vs-two nested spans would be more
 * confusing than two explicit ones. `useWordReveal` is untouched and still owns
 * the About pull-quotes.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE MEASURED NUMBERS — read off beetogreen.com/en live in Chrome, 2026-08-03
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Read two independent ways and they agree exactly:
 *   (a) the inline styles their own JS writes at trigger time, e.g.
 *       `transform: translateY(0px); transition: transform 1.2s
 *        cubic-bezier(0.77, 0, 0.175, 1) 0.05s;`
 *   (b) their Nuxt bundle's `AnimationParagraph` component, chunk CeKTuLxs.js:
 *       `props: { replay: default true, delay: default .05,
 *                 stagger: default .01, duration: default 1.2 }`
 *       and the applier
 *       `l.style.transition = `transform ${s}s ${a}`;
 *        l.style.transitionDelay = `${n + i * t}s`;
 *        l.style.transform = "translateY(0)"`
 *
 *   property        beetogreen                        this hook
 *   ────────────────────────────────────────────────────────────────────────
 *   type            masked slide-up, WORD BY WORD     same
 *   opacity         never animated — 1 at every frame same (see AA note)
 *   travel          translateY(100%) -> 0             same
 *                   (100% = the word's own line box:
 *                    measured 66.9px on a 59.7px card
 *                    title, 131.41px on a 117.3px hero
 *                    title — proportional, not fixed px)
 *   duration        1.2s, uniform site-wide           1200ms
 *   easing          cubic-bezier(0.77, 0, 0.175, 1)   same (easeInOutQuart)
 *   stagger         0.01s = 10ms per word             10ms
 *   base delay      0.05s, but 0s on the card titles  configurable, default 0
 *   trigger         IntersectionObserver, options {}  same: threshold 0,
 *                   -> threshold 0, rootMargin 0px       no rootMargin
 *   replay          FIRES ONCE. Verified by scrolling same — `once`
 *                   a fired block fully out of view:
 *                   it stays at translateY(0px).
 *
 * 🔴 THEIR CARDS DO NOT ANIMATE AT ALL. Measured on `.avantage-card`:
 * `opacity: 1`, `transform: none`, `transition: all 0s`. Only the TEXT inside
 * the card reveals. Matching beetogreen exactly therefore means REMOVING the
 * card-box entrance we currently run in `WhatWeCover`, not restyling it. That
 * is a visible product decision. It was put to Hamza with four alternatives
 * and he chose one: our cards DO animate, via Option 4 in `WhatWeCover` and
 * `FadeUp` (transform-only rise + 0.97 scale, 900ms, same easing). So this is a
 * deliberate divergence from beetogreen, not an unmatched detail.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AA — WHY THIS REVEAL HAS NO CONTRAST FLOOR TO DERIVE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `useWordReveal` needs a 0.55 floor because it animates OPACITY: a word held
 * mid-reveal is a real, sit-on-it-indefinitely state at reduced contrast, so
 * the floor has to clear 3:1 on its own.
 *
 * This reveal never changes opacity. A word is either fully clipped by its mask
 * (zero pixels painted — nothing to measure, and nothing a reader can mistake
 * for low-contrast text) or painted at full colour. There is no intermediate
 * contrast state at any frame, so the worst frame equals the RESTING frame and
 * every pair keeps the ratio it already has — gold-deep on cream holds 5.16:1
 * throughout. That was the strongest argument for the swap: the `FadeUp` this
 * replaced sat below 4.5:1 for roughly 430ms of its 600ms on that same pair.
 *
 * ⚠️ THE REAL RISK MOVED, IT DID NOT DISAPPEAR — IT IS NOW CLIPPING, NOT
 * CONTRAST. `overflow: hidden` on a text span cuts descenders (the g/y/p in
 * "Building Futures.", "your", "goals"). beetogreen compensates with
 * `padding-bottom: 0.12em` on the word and `line-height: 1.1–1.2`. OURS USES
 * 0.2em BECAUSE OUR HEADINGS ARE TIGHTER THAN THEIRS — see the measured
 * derivation at the mask below. This is the same class of bug as the hero mask's
 * `pb-[0.14em] / -mb-[0.14em]` pair, which was tuned to one face and is not
 * guaranteed for another.
 *
 * REDUCED MOTION: returns before splitting anything. No spans, no observer, no
 * transform — the string renders exactly as React authored it, fully visible.
 * There is no "faster reveal" fallback, because text hidden behind a mask until
 * an observer fires is hidden text, not slower motion.
 *
 * LENIS: this is an IntersectionObserver and a CSS transition. It never pins,
 * never writes to the scroller, and never reads layout during scroll, so it
 * cannot judder against Lenis the way a ScrollTrigger pin does.
 */

export type MaskRevealOptions = {
  reduce?: boolean | null;
  /** ms before the first word moves. beetogreen: 50 site-wide, 0 on cards. */
  delayMs?: number;
  /** ms added per word. beetogreen: 10. */
  staggerMs?: number;
  /** ms of travel. beetogreen: 1200. */
  durationMs?: number;
  /** beetogreen's easing, and the reason the motion reads as theirs. */
  easing?: string;
};

const BTG = {
  delayMs: 0,
  staggerMs: 10,
  durationMs: 1200,
  easing: "cubic-bezier(0.77, 0, 0.175, 1)",
} as const;

export function useMaskReveal(
  ref: RefObject<HTMLElement>,
  /** The rendered string — only a re-run key, the split reads from the DOM. */
  text: string,
  {
    reduce = false,
    delayMs = BTG.delayMs,
    staggerMs = BTG.staggerMs,
    durationMs = BTG.durationMs,
    easing = BTG.easing,
  }: MaskRevealOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      reduce ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Kept so cleanup restores exactly what React rendered. Without it a locale
    // switch would split an already-split element — the same failure
    // `useWordReveal` documents.
    const original = el.textContent ?? "";
    const parts = original.split(/(\s+)/).filter((p) => p.length > 0);
    if (!parts.length) return;

    const inners: HTMLSpanElement[] = [];
    const frag = document.createDocumentFragment();

    for (const part of parts) {
      // WHITESPACE STAYS A REAL TEXT NODE, NOT PADDING INSIDE A SPAN. An
      // inline-block per word already changes what the browser may break; if
      // the space were baked into the span the line could not break there at
      // all and the measure would re-wrap. This is what keeps CLS at 0.
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }

      const mask = document.createElement("span");
      // The mask. `inline-block` is required for `overflow` to apply at all.
      //
      // THE DESCENDER ALLOWANCE IS 0.2em, NOT beetogreen's 0.12em, AND THE
      // EXTRA 0.08em IS NOT A SAFETY MARGIN — IT IS A MEASURED DEFICIT.
      // beetogreen sets its reveal words at line-height 1.1-1.2, where the line
      // box already extends below the baseline and 0.12em finishes the job.
      // `.sem-display` on our About and Blog heroes is `line-height: 1`, which
      // is tighter than anything on their site: at that ratio the glyph ink
      // falls outside the line box entirely. Measured on /en/about at the
      // shipped 86.7px, 0.12em (10.4px) left the mask clipping "Our" and
      // "Story" by exactly 2px — a visible shave across the bottom of an 87px
      // headline. 0.2em (17.3px) clears it with real margin.
      //
      // The negative margin cancels the padding's layout effect exactly, so
      // this changes the CLIP BOX and nothing else — no reflow, no CLS. It does
      // lengthen the travel slightly (translateY(100%) is 100% of a taller
      // box), which is why it is set once here rather than tuned per call site.
      mask.style.display = "inline-block";
      mask.style.overflow = "hidden";
      mask.style.verticalAlign = "bottom";
      mask.style.paddingBottom = "0.2em";
      mask.style.marginBottom = "-0.2em";

      const inner = document.createElement("span");
      inner.style.display = "inline-block";
      inner.style.transform = "translateY(100%)";
      inner.style.willChange = "transform";
      inner.textContent = part;

      mask.appendChild(inner);
      frag.appendChild(mask);
      inners.push(inner);
    }

    el.textContent = "";
    el.appendChild(frag);

    // THRESHOLD 0, NO rootMargin — beetogreen constructs its observer with a
    // bare `{}`, so it fires the instant the block's top edge crosses the
    // viewport bottom. Verified live: blocks fired with their top edge 29-96px
    // inside a 710px viewport, i.e. immediately, not at a percentage.
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        inners.forEach((inner, i) => {
          inner.style.transition = `transform ${durationMs}ms ${easing}`;
          inner.style.transitionDelay = `${delayMs + i * staggerMs}ms`;
          inner.style.transform = "translateY(0)";
        });
        // ONCE. beetogreen's reset path is dead code (`d(n, replay)` no-ops
        // when replay is true), so a fired block never returns to 100%.
        // Disconnecting is the honest way to express that, rather than
        // shipping the same accident.
        io.disconnect();
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      el.textContent = original;
    };
  }, [ref, text, reduce, delayMs, staggerMs, durationMs, easing]);
}

/** The measured beetogreen constants, exported so the demo can print them
 *  rather than restate them and drift. */
export const BEETOGREEN_REVEAL = BTG;
