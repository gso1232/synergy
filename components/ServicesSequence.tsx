"use client";

import { createRef, useMemo } from "react";
import Image from "next/image";
import { useSequenceSwap } from "./useSequenceSwap";

export type SequenceItem = {
  key: string;
  heading: string;
  body: string;
  src: string;
  alt: string;
};

/**
 * The scroll-linked product sequence — restaurantsem.com's `/mindset` §2
 * (`.section_principles`), re-measured live and rebuilt in our tokens.
 *
 * THEIRS, MEASURED AT 1526 x 658:
 *
 *   section    grid `50% 50%`, gap 0, height 2070
 *   left       `.scroll-visual` — position sticky, top 0, exactly ONE
 *              VIEWPORT tall (658), holding a 492 x 576 image frame
 *   images     5, all `position:absolute; inset:0`, `object-fit: cover`
 *   crossfade  `transition: opacity 0.3s`, no timing function declared so the
 *              CSS default `ease`. A CROSSFADE, not a cut
 *   right      5 copy blocks, `padding: 49.2px 0` each
 *   trigger    item top edge crossing the viewport middle — see
 *              useSequenceSwap for the bisected numbers
 *
 * OURS: SEVEN items, not five. The mechanism does not care and fflsynergy
 * lists seven products; padding to five or cutting to five would be inventing
 * or discarding content to fit a reference's item count.
 *
 * 🔴 NO TEXT DIMMING. Theirs holds inactive copy at `opacity: 0.2`. On our
 * cream surface that measures 1.52:1 — ink at 0.2 alpha over #F8F4EE — and it
 * is a RESTING, indefinitely-readable state, so it has to clear AA on its own.
 * The body is 21.3px, so the bar is 4.5:1, which needs alpha >= 0.61. The
 * legal dim is therefore 0.65 at best, a 1.5x range against their 5x — an
 * effect too shallow to read. Dropped entirely on instruction; the image swap
 * carries the connection.
 *
 * REDUCED MOTION: the swap still happens at the same trigger points, because
 * the image identifies which product you are reading and that is information.
 * What goes is the 300ms crossfade — `motion-reduce:transition-none` makes it
 * an instant cut. See the note in useSequenceSwap. There is no `useReducedMotion`
 * call here on purpose: the behaviour is entirely a CSS media query, so the
 * server and the client render the same markup and there is nothing to hydrate.
 *
 * NO LIVE REGION. The swap is driven by the reader's own scroll position and
 * every product heading is already in the reading order beside its image;
 * announcing "image changed" on each scroll would be noise, not information.
 */
export default function ServicesSequence({
  items,
  headingId,
}: {
  items: readonly SequenceItem[];
  headingId: string;
}) {
  const refs = useMemo(
    () => items.map(() => createRef<HTMLLIElement>()),
    [items],
  );
  const active = useSequenceSwap(refs);

  return (
    // 🔴 NO `sem-pad-t`. This section CONTINUES the "Our Insurance Products"
    // heading block above it — they are one section of content split into two
    // elements so the sticky column can span the whole list. A full section
    // rhythm here landed on top of the first item's own 49.2px padding and
    // measured a 180px gap between the heading and the first product, against
    // a 130.8 rhythm. The item padding IS the gap now, and 49.2 is SEM's own
    // internal number for this section.
    <section aria-labelledby={headingId} className="sem-shell">
      <div className="sem-inner">
        <div className="grid grid-cols-1 items-start xl:grid-cols-2">
          {/* THE STICKY VISUAL.
              Theirs is one viewport tall with the frame centred in it. Ours
              matches: `h-[100svh]` with the frame vertically centred, sticky
              from the top. Below xl it is `display:none` — a sticky image
              column in a single-column layout would either pin over the copy
              or stack as a seventh orphan image. Theirs does the same thing at
              <=991 for the same reason.

              `aria-hidden` because every image here is decorative RELATIVE TO
              the copy beside it: the product name is already an <h3> in the
              list, and the alt text would announce a second time. The alt is
              still authored and present for the mobile stack below, where the
              image sits inside its own item and is the only visual. */}
          <div
            aria-hidden="true"
            className="sticky top-0 hidden h-[100svh] items-center xl:flex"
          >
            <div className="services-frame relative w-[64.5%] overflow-hidden">
              {items.map((it, i) => (
                <Image
                  key={it.key}
                  src={it.src}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 32vw, 0px"
                  quality={78}
                  priority={i === 0}
                  className={`object-cover object-center transition-opacity duration-300 ease-[ease] motion-reduce:transition-none ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* THE COPY COLUMN.
              Theirs pads each block 49.2px top and bottom, which is what sets
              the scroll distance between swaps. Ours keeps that number. */}
          <ol className="services-copy">
            {items.map((it, i) => (
              <li
                key={it.key}
                ref={refs[i]}
                className="services-copy-item"
                data-active={i === active ? "true" : undefined}
              >
                {/* BELOW xl THE IMAGE LIVES HERE, inside its own item, where
                    it is the only visual and carries a real alt. Above xl this
                    copy is hidden and the sticky column above renders instead. */}
                <div className="services-frame relative mb-8 w-full overflow-hidden xl:hidden">
                  <Image
                    src={it.src}
                    alt={it.alt}
                    fill
                    sizes="(min-width: 1280px) 0px, (min-width: 768px) 60vw, 90vw"
                    quality={78}
                    className="object-cover object-center"
                  />
                </div>
                <h3 className="sem-h3 font-display text-ink">{it.heading}</h3>
                <p className="sem-body mt-6 text-ink">{it.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
