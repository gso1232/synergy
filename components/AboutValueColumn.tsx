"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useParallax } from "./useParallax";

/**
 * The drift is a SIDE-BY-SIDE effect and must not run when the grid has
 * collapsed to one column.
 *
 * Measured at 390 with it running at every width: the columns are stacked with
 * a 48px row gap, and drifting the first down by 68px while the third comes up
 * by 68px made neighbouring columns OVERLAP BY 20px — the bottom of one
 * photograph sliding under the label of the next. It reads as broken, because
 * it is.
 *
 * 1280 is the same breakpoint the static stagger uses (`xl:mt-...`), so the two
 * halves of the effect switch on together: below it there is no stagger and no
 * drift, which is also what the reference does — their grid is a single column
 * below 768 and the differential has nothing to differentiate.
 */
const SIDE_BY_SIDE = "(min-width: 1280px)";

/**
 * One column of the §5 value grid, with the COLUMN ITSELF drifting on scroll.
 *
 * THIS IS A SECOND, SEPARATE EFFECT FROM THE IMAGE PARALLAX, and both are
 * deliberate:
 *
 *   AboutParallaxImage  moves the photograph INSIDE its fixed frame
 *   this component      moves the WHOLE COLUMN — label, image and body
 *                       together — against its neighbours
 *
 * The reference has only the second one. Measured on restaurantsem.com, their
 * `.grid-home-images_wrapper` elements carry a scrubbed vertical transform
 * that differs per column: the first drifts DOWN, the middle is static at 0
 * throughout, the third drifts UP. It is what makes the static stagger read as
 * alive rather than as three columns that were simply placed at different
 * heights.
 *
 * IT IS NOT AN ENTRANCE REVEAL. Their columns never change opacity — measured
 * 1/1/1 on every wrapper and image at every scroll position. The entrance
 * reveal on our page is FadeUp, which is ours and sits alongside this.
 *
 * VALUES ARE THE SHIPPED ONES. Magnitude is the ±10 that Testimonials uses,
 * out of the shared components/useParallax.ts. The only thing that varies per
 * column is DIRECTION, which is a sign, not a new number — and the middle
 * column's 0 is the reference's own measured value for it, not an invention.
 *
 * The <li> is the trigger and stays untransformed; an inner wrapper takes the
 * transform. Transforming the element ScrollTrigger measures would feed its
 * own offset back into the cached start/end on the next refresh.
 *
 * REDUCED MOTION: useParallax returns before importing GSAP, so no tween is
 * created and the column sits at its CSS position — the static stagger alone.
 */
export default function AboutValueColumn({
  from,
  to,
  className = "",
  children,
}: {
  from: number;
  to: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const colRef = useRef<HTMLLIElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);

  // Live-tracked so rotating a tablet or dragging a window across 1280 turns
  // the drift on and off rather than leaving it in whichever state the page
  // happened to load in.
  const [sideBySide, setSideBySide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(SIDE_BY_SIDE);
    const read = () => setSideBySide(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  // scrub 0.5 matches the reference's `smoothing: 50` damping — the same value
  // AboutParallaxImage uses, so the column and the photograph inside it ease
  // on the same curve instead of fighting each other.
  useParallax(colRef, driftRef, {
    from: sideBySide ? from : 0,
    to: sideBySide ? to : 0,
    reduce,
    scrub: 0.5,
  });

  return (
    <li ref={colRef} className={className}>
      <div ref={driftRef} className="will-change-transform">
        {children}
      </div>
    </li>
  );
}
