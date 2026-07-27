"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index — each step adds 80ms */
  index?: number;
};

/**
 * Scroll-entry reveal: 24px travel / 600ms / cubic-bezier(0.16,1,0.3,1),
 * per Step 0 measurements (beetogreen reveals: 0.6s, staggered).
 * Under reduced motion the transform is dropped — opacity only.
 */
export default function FadeUp({ children, className, index = 0 }: FadeUpProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.08,
      }}
    >
      {children}
    </motion.div>
  );
}
