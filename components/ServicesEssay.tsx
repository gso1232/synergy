"use client";

import { createRef, useMemo } from "react";
import Image from "next/image";
import { useSequenceSwap } from "./useSequenceSwap";

export type EssayBlock = {
  key: string;
  heading: string;
  body: string;
  src: string;
};

/**
 * §4 — restaurantsem.com/mindset's `.section_mindset-long`, MIRRORED.
 *
 * THEIRS: sticky visual on the LEFT, essay running down the RIGHT.
 * OURS: the reverse — essay LEFT, sticky visual RIGHT — so this section reads
 * as the answering half of §2 above it rather than a repeat of it. That is the
 * only intentional departure from their layout; every number below is theirs.
 *
 *   grid            1.75fr / 1fr   (theirs, column order flipped)
 *   gap             131.2px
 *   sticky top      8rem (128px)
 *   frame ratio     2 / 3
 *   frame shadow    the `.services-frame` shadow, unchanged
 *   image column    display:none at <= 991px
 *
 * 🔴 THE IMAGE COLUMN IS NOT A 4-SECOND CAROUSEL. Theirs is:
 * `data-autoplay="true"`, `data-delay="4000"`, `data-animation="cross"`,
 * verified by pinning scrollY at 0 and watching the slides advance anyway. A
 * timer is not used here. This runs `useSequenceSwap` — the same hook §2 runs
 * — so the image changes because the reader scrolled past a block, not because
 * four seconds elapsed. One scroll-linked mechanism on the page, and an image
 * that means something: it identifies the passage you are reading.
 *
 * 🔴 BELOW 991 THERE ARE NO IMAGES AT ALL. Theirs hides the column and does
 * not re-home the slides, and that instruction was explicit. Note what it
 * costs: on a phone this section is a long unbroken run of text with nothing
 * in it. §2 solved the same problem by moving each image inside its own copy
 * block. Say the word and this does the same — the markup for it is three
 * lines. See HANDOFF.
 *
 * REDUCED MOTION: as §2. The swap still happens, because which image is
 * showing is information; what drops is the 300ms crossfade, via
 * `motion-reduce:transition-none`. No `useReducedMotion` call — the behaviour
 * is a pure CSS media query, so server and client render identical markup.
 *
 * NO LIVE REGION, same reasoning as §2: the change is driven by the reader's
 * own scrolling and every block already carries its own heading in the reading
 * order beside the image.
 */
export default function ServicesEssay({
  blocks,
  headingId,
}: {
  blocks: readonly EssayBlock[];
  headingId: string;
}) {
  const refs = useMemo(
    () => blocks.map(() => createRef<HTMLLIElement>()),
    [blocks],
  );
  const active = useSequenceSwap(refs);

  return (
    <section aria-labelledby={headingId} className="sem-shell">
      <div className="sem-inner">
        <div className="essay-grid">
          {/* THE ESSAY — first in the DOM as well as first on screen, so the
              reading order and the visual order agree. */}
          <ol className="essay-copy">
            {blocks.map((b, i) => (
              <li
                key={b.key}
                ref={refs[i]}
                className="essay-block"
                data-active={i === active ? "true" : undefined}
              >
                <h3 className="sem-h3 font-display text-navy">{b.heading}</h3>
                <p className="sem-body mt-6 text-ink">{b.body}</p>
              </li>
            ))}
          </ol>

          {/* THE STICKY VISUAL.
              🔴 `alt=""` AND `aria-hidden`, DELIBERATELY, and the two are
              saying the same thing twice on purpose. These five photographs
              are DECORATIVE relative to the essay: a desk, a horizon, a
              facade, two chairs, a road. None of them carries information the
              copy does not, which is the opposite of §2, where the image tells
              you which of seven products you are reading about.

              The column is also `display:none` below 992, so there is no
              width at which this markup is reachable by assistive technology
              at all. Authoring alt here would be writing strings nobody can
              get to — see the note in the page file. If the ≤991 rule is ever
              reversed, alt has to be written before the images move. */}
          <div aria-hidden="true" className="essay-sticky">
            <div className="essay-frame relative w-full overflow-hidden">
              {blocks.map((b, i) => (
                <Image
                  key={b.key}
                  src={b.src}
                  alt=""
                  fill
                  sizes="(min-width: 992px) 31vw, 0px"
                  quality={78}
                  // 🔴 NO `priority`, AND NOT BY OVERSIGHT — it was here and it
                  // was measured doing harm. This section begins ~8,200px down
                  // the page, so it can never be the LCP element and priority
                  // buys nothing at any width. Below 992 it actively costs:
                  // the column is `display:none`, but an eager image is still
                  // fetched, and at 390 that was a measured w=256 AND w=640
                  // request for a photograph the reader can never see. Lazy is
                  // correct here; §2 is a different case because its images do
                  // render on mobile.
                  className={`object-cover object-center transition-opacity duration-300 ease-[ease] motion-reduce:transition-none ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
