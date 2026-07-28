"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useParallax } from "./useParallax";

/**
 * A contained image with the site's shared scroll parallax.
 *
 * THE NUMBERS ARE NOT NEW. This is the TESTIMONIALS pairing exactly — a 130%
 * travelling layer starting 15% high, driven ±10 by the shared
 * components/useParallax.ts. Nothing here invents a value:
 *
 *   wrapper 160% / travel 16   ->  safe band 34.8-65.3%  (30.5% of height)
 *   wrapper 130% / travel 10   ->  safe band 21.5-78.5%  (56.9%)  <- this one
 *
 * THE SAFE BAND IS WHY IT IS THIS PAIRING AND NOT COVERAGE'S. The band is the
 * part of the source visible at EVERY scroll position — the only region where
 * a face is guaranteed never to be bisected by the frame edge. At 160/16 that
 * band is 30.5%, narrower than almost any photograph of people; 23 human
 * frames were tested against it during the homepage build and every one
 * cropped a head at one extreme or the other. 130/10 opens it to 56.9%, which
 * is what allows people in a parallax section at all.
 *
 * The travelling layer is 130% of the box starting at -15%, so ±10% of travel
 * still never exposes an edge: the top reaches -5% at worst and the bottom
 * +105%. That is checked by construction here and verified by rendering the
 * composited extremes at all three widths.
 *
 * The box is always TALLER IN ASPECT than any 2:3 source (2:3 x 1.3 = 0.513
 * against the source's 0.667), so `cover` fits by HEIGHT and crops width. The
 * full source height always maps to the wrapper, which is exactly why the
 * vertical band arithmetic above governs whether a face survives and why
 * object-position cannot rescue a bad frame.
 *
 * REDUCED MOTION: useParallax returns before importing GSAP, so no tween is
 * created and the layer sits static at its CSS position. Not a slower
 * parallax — no parallax.
 */
export default function AboutParallaxImage({
  src,
  alt,
  sizes,
  /** Tailwind aspect utility for the visible box, e.g. "aspect-[2/3]". */
  aspect = "aspect-[2/3]",
  className = "",
  quality = 78,
}: {
  src: string;
  alt: string;
  sizes: string;
  aspect?: string;
  className?: string;
  quality?: number;
}) {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // scrub 0.5 rather than the default `true`: the reference's own grid
  // parallax is a Webflow continuous action with `smoothing: 50`, a damped
  // follow. Half a second of catch-up is the closest GSAP equivalent, and it
  // is the difference between tracking the scroll rigidly and easing toward
  // it. Only the About page passes this; Coverage and Testimonials keep the
  // locked scrub they were tuned to.
  useParallax(boxRef, layerRef, { from: -10, to: 10, reduce, scrub: 0.5 });

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden ${aspect} ${className}`}
    >
      <div
        ref={layerRef}
        className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}
