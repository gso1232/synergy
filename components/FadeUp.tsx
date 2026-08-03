"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * The site's block entrance — OPTION 4, approved 2026-08-03.
 *
 * translateY 24px -> 0 AND scale 0.97 -> 1, 900ms,
 * cubic-bezier(0.77, 0, 0.175, 1), 100ms of stagger per `index` step.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 THE OPACITY CHANNEL IS GONE, AND THAT IS THE POINT OF THE CHANGE
 * ═══════════════════════════════════════════════════════════════════════════
 * This component used to fade `opacity: 0 -> 1` over 600ms. That fade was
 * measurably below AA for most of its own duration on the palette's tightest
 * pair — gold-deep #7D641F on cream #F8F4EE composites to:
 *
 *     alpha   0.25    0.50    0.60    0.75    0.90    1.00
 *     ratio   1.40    2.05    2.42    3.16    4.24    5.16
 *
 * so every reveal spent roughly 430ms of its 600ms under the 4.5:1 bar, and
 * about 300ms under even the 3:1 large-text bar. Transient, but it was on every
 * eyebrow, heading and body block across four route groups.
 *
 * Option 4 animates TRANSFORM ONLY. A block is at full colour on its first
 * painted frame and never leaves it, so the worst frame equals the resting
 * frame — gold-deep on cream holds 5.16:1 throughout, ink on cream 15.88:1.
 * There is no floor to derive and nothing to re-measure when a colour changes,
 * which is the same reason `useMaskReveal` was chosen for the text.
 *
 * The visible cost is that a block is ALREADY VISIBLE before it reveals — 24px
 * low and 3% small, rather than invisible. That was chosen deliberately over
 * three candidates that fade. All four were rendered on real copy in a
 * `_reveal-lab` demo route, since deleted.
 *
 * ⚠️ REDUCED MOTION IS NOT HANDLED HERE, AND MUST NOT BE ADDED BACK HERE.
 * It is enforced in `globals.css` by a `@media (prefers-reduced-motion: reduce)`
 * rule targeting `[data-reveal]`. A JS gate CANNOT be correct: `useReducedMotion()`
 * resolves in an effect, AFTER first paint, so the block has already mounted in
 * its hidden state by the time the answer arrives. Two JS-gated builds of this
 * were measured leaving blocks stranded at the pre-reveal position — the
 * previous version of this file had exactly that shape. The CSS rule is
 * resolved by the engine before React hydrates and carries `!important`, which
 * outranks framer-motion's inline styles.
 * 🔴 `data-reveal` BELOW IS WHAT THAT RULE HOOKS ONTO. Removing it silently
 * breaks reduced motion with no error anywhere.
 *
 * Timing: 900ms is shorter than the 1200ms text reveal on purpose, so a block
 * settles before the words inside it finish arriving. See `useMaskReveal.ts`.
 */

const EASE = [0.77, 0, 0.175, 1] as const;

const variants: Variants = {
  hidden: { y: 24, scale: 0.97 },
  show: { y: 0, scale: 1, transition: { duration: 0.9, ease: EASE } },
};

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index — each step adds 100ms, matching Option 4's per-card offset. */
  index?: number;
};

export default function FadeUp({ children, className, index = 0 }: FadeUpProps) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-90px" }}
      transition={{ delay: index * 0.1 }}
    >
      {children}
    </motion.div>
  );
}
