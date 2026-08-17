"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useParallax } from "./useParallax";

/**
 * The full-bleed break band between §2 and §4 — restaurantsem.com/mindset's
 * `.section_fw-parralax`, re-measured live.
 *
 * THEIRS: a fixed **460.312px** band, `padding: 0`, **zero children and no
 * text**, carrying a `background-image` at `cover` / `50% center` /
 * `no-repeat` with 🔴 **`background-attachment: fixed`**.
 *
 * 🔴 WE DO NOT REPRODUCE `background-attachment: fixed`. Three reasons, and
 * none of them is taste:
 *
 *   1. It repaints the whole band on every scroll frame. The project has a
 *      standing rule that nothing in the scroll path forces layout or paint
 *      work it can avoid — see the note in useParallax.ts.
 *   2. iOS Safari ignores it outright. Their own page concedes this: the
 *      <=991 rule on their food-drink variant swaps the attachment back.
 *   3. It is not tunable. The travel is whatever the viewport height happens
 *      to make it, so the effect cannot be matched to the rest of the site.
 *
 * Instead this uses `components/useParallax.ts` on the **Testimonials
 * pairing** — a 130% layer starting at -15%, travelling ±10 — which is the
 * same pairing `AboutParallaxImage` runs. No new values, and one parallax
 * system on the site rather than two.
 *
 * NO TEXT SITS ON THIS BAND, in theirs or ours, so there is no contrast
 * threshold to meet. The only accessibility obligation is a real alt and a
 * still under reduced motion.
 *
 * REDUCED MOTION: useParallax returns before importing GSAP, so no tween is
 * created and the layer sits static at its CSS position. Not a slower
 * parallax — none.
 */
export default function ServicesBreak({ alt }: { alt: string }) {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useParallax(boxRef, layerRef, { from: -10, to: 10, reduce, scrub: 0.5 });

  return (
    // A plain div, not a <section>: it has no heading and no copy, so a
    // section element would add an unnamed landmark-shaped node to the
    // outline. Same reasoning as AboutZoom.
    <div
      ref={boxRef}
      className="services-break relative w-full overflow-hidden"
    >
      <div
        ref={layerRef}
        className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
      >
        <Image
          src="/synergy/services-break-dusk.jpg"
          alt={alt}
          fill
          /* Measured at 375: the box is 375x442 (0.85:1) against a 1.50:1
             source, so the image renders 663 CSS px wide while `100vw` asked
             for 375. 160vw lands on w=1200 at DPR 2 — 90% of 1:1. See
             components/Hero.tsx for the derivation. */
          sizes="(max-width: 640px) 160vw, (max-width: 1024px) 110vw, 100vw"
          quality={72}
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}
