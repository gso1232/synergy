"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useMaskReveal, type MaskRevealOptions } from "./useMaskReveal";

/**
 * A heading or line that reveals word-by-word under a mask — the beetogreen
 * twin, approved 2026-08-03. Thin wrapper so `useMaskReveal` can be used from
 * server components without each call site owning a ref and a hook.
 *
 * 🔴 `text` MUST BE A PLAIN STRING, NOT RICH CHILDREN. The hook reads
 * `element.textContent` and REBUILDS the element's children as one masked span
 * per word. Any nested markup — a <br>, a <strong>, an <em>, a nested <span> —
 * is destroyed on the first effect run and cannot be recovered. That is also
 * why the prop is `text` rather than `children`: a string prop makes the
 * constraint impossible to violate by accident, where `children` would invite
 * exactly the JSX that breaks it.
 *
 * This is why it is applied to HEADINGS and short lines and not to body prose.
 * Beyond the markup constraint, a 47-word paragraph becomes 94 nested spans and
 * ~470ms of stagger tail, which reads as sluggish rather than deliberate.
 *
 * Reduced motion: the hook returns before splitting anything, so the string
 * renders exactly as authored with no masks in the DOM. No `data-reveal` hook
 * is needed here — there is nothing to reset. `useReducedMotion()` is still
 * passed because it also covers the case where the user's preference changes
 * after mount.
 */
export default function RevealText({
  text,
  as: Tag = "p",
  className,
  id,
  ...opts
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  id?: string;
} & MaskRevealOptions) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  useMaskReveal(ref as React.RefObject<HTMLElement>, text, { reduce, ...opts });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} id={id} className={className}>
      {text}
    </Tag>
  );
}
