"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useParallax } from "./useParallax";

/**
 * The parallax layer inside a blog card's 1.615 frame.
 *
 * PAIRING: the **Testimonials** one — `top-[-15%] h-[130%]`, ±10, `scrub: true`
 * — not the deep Coverage pairing. HANDOFF's rule is that a section is not
 * "upgraded" to ±16 without re-verifying its image, and there is no reason to:
 * the shallow pairing already fits inside the box at every width.
 *
 * THE TRAVEL WINDOW, measured on the real boxes:
 *
 *   width   frame        layer(130%)  travel(±10%)  overhang(15%)  margin
 *   1536    695 x 430    559          ±55.9         ±64.5          +8.6
 *    820    354 x 219    285          ±28.5         ±32.9          +4.4
 *    390    352 x 218    283          ±28.3         ±32.7          +4.4
 *
 * The margin stays POSITIVE at every width, so **no card uncovers an edge at
 * either extreme**. The always-visible region is the middle **56.9%** of the
 * layer, and every one of the twelve photographs was re-cropped at the LAYER
 * ratio (1.2426, not the 1.615 frame ratio) and re-audited with that band drawn
 * on — the subject of each sits inside it.
 *
 * 🔴 WHY THE FILES WERE RE-EXPORTED. A 130% layer raises the 2x DPR bar from
 * 1390 x 861 to **1390 x 1119**. The original 1600 x 991 exports were 11.4%
 * short — the same trap that killed parallax on the /about §4 pair, where the
 * images won because they were Synergy's own with no larger original. These are
 * external with sources from 2560 to 6827 px wide, so the honest fix was to
 * re-crop rather than upscale. They are now 1600 x 1288.
 *
 * 🔴 TWO TRANSFORMS, TWO ELEMENTS, ON PURPOSE. The parallax writes `yPercent`
 * on THIS wrapper; the hover writes `scale(1.02)` on the `<img>` inside it.
 * Nested, they compose. On the SAME element GSAP's transform write would
 * silently clobber the CSS hover — that is the whole reason for the extra div.
 * Scaling up can never uncover an edge, so the hover is safe against the crop.
 *
 * The two states also barely co-occur: hover needs a stationary pointer,
 * parallax needs scrolling. When stationary the layer is fixed and the 1.02
 * reads exactly as it did before parallax existed.
 *
 * REDUCED MOTION: `useParallax` returns before importing GSAP, so no tween is
 * created and the layer sits static at its CSS position — not a slower
 * parallax, none. The hover's own `motion-reduce:` rules are unchanged.
 */
export default function BlogCardImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useParallax(boxRef, layerRef, { from: -10, to: 10, reduce });

  return (
    <div
      ref={boxRef}
      className="blog-card-frame relative w-full overflow-hidden"
    >
      <div
        ref={layerRef}
        className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 46vw, 92vw"
          quality={78}
          className="blog-card-img object-cover object-center motion-reduce:transition-none"
        />
      </div>
    </div>
  );
}
