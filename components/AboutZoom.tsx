"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useStickyZoom } from "./useStickyZoom";

/**
 * The About page's image-zoom section — restaurantsem.com's §7, and the
 * tallest block on their page by a wide margin: 1973px against a 658px
 * viewport, i.e. a runway of exactly 3x the element being pinned.
 *
 * A one-viewport element is stuck to the top of the screen for the whole
 * runway while its scale is scrubbed 0.5 -> 1.0 from centre. You watch a card
 * grow into a full-bleed frame. There is no copy on it, in theirs or in ours,
 * which is why there is no contrast threshold to meet here at all — the only
 * accessibility obligation is that the image is decorative-with-meaning and
 * carries a real alt, and that reduced motion gets a still.
 *
 * THE IMAGE — Pexels 36777966, a stone-and-shingle family house at dusk with
 * every window lit, shot through pines. Chosen over three other candidates for
 * two measured reasons:
 *
 *   1. NO PEOPLE. The scale runs 0.5 -> 1.0, so the visible crop changes
 *      continuously through the whole section. A frame with faces in it has to
 *      be verified against every intermediate scale, and any face near an edge
 *      fails at one end of the run. With no people the failure mode does not
 *      exist.
 *   2. Frame mean luminance 0.100, which sits just above the gradient's top
 *      value (#1C3A5A, L 0.0401) at the point the section appears. That is why
 *      the half-scale card reads as a LIFT out of the page rather than a hole
 *      punched in it — a darker frame at scale 0.5 would look like a gap.
 *
 * 8000x5338 at source (42.7MP), held at 3840px wide here, which is the largest
 * derivative next/image will ever request. Full-bleed at scale 1.0 on a 1920
 * viewport at 2x DPR needs exactly 3840, so nothing upscales anywhere on the
 * run — and at scale 0.5 it is being downscaled 2x, which is where the frame
 * is sharpest.
 */
export default function AboutZoom({ alt }: { alt: string }) {
  const reduce = useReducedMotion();
  const runwayRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useStickyZoom(targetRef, runwayRef, { reduce });

  return (
    // A plain div, not a <section>: this block has no heading and no copy, so
    // a section element here would only add an unnamed landmark-shaped node to
    // the outline. The photograph carries its own alt and that is the whole of
    // its accessible content.
    <div className="relative">
      {/* THE RUNWAY. 300vh, matching their 3x ratio exactly. Under reduced
          motion it collapses to one viewport — with no scrub there is nothing
          for the extra 200vh to do except make the reader scroll past a
          stationary image three times over. */}
      <div ref={runwayRef} className="relative h-[300vh] motion-reduce:h-[100svh]">
        {/* THE PIN IS `position: sticky`, NOT ScrollTrigger's pin. GSAP's pin
            rewrites the document (spacer + position:fixed), which under Lenis
            takes the pinned element out of the smoothed scroll context while
            its neighbours stay in it — the card then judders by a frame against
            the sections above and below. Sticky is composited by the browser
            and cannot desynchronise. See useStickyZoom. */}
        <div className="sticky top-0 h-[100svh] overflow-hidden motion-reduce:static">
          {/* The resting scale is a CLASS, not an inline style, and not
              derived from `reduce`. useReducedMotion resolves to null on the
              server and to a real boolean on the client, so branching the
              markup on it is a hydration mismatch waiting to happen. As a pair
              of classes the server and the client render the same string and
              the media query decides — and GSAP's inline transform outranks
              both the moment the tween starts. */}
          <div
            ref={targetRef}
            className="h-full w-full origin-center scale-50 will-change-transform motion-reduce:scale-100"
          >
            <Image
              src="/synergy/about-zoom.jpg"
              alt={alt}
              fill
              // The element is one viewport wide at scale 1.0 and never wider,
              // so the viewport width IS the layout width at every breakpoint.
              sizes="100vw"
              quality={72}
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
