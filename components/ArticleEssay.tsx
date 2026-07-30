"use client";

import { createRef, useMemo, type ReactNode } from "react";
import Image from "next/image";
import { useSequenceSwap } from "./useSequenceSwap";

export type ArticleEssayBlock = {
  key: string;
  /** The section's prose, rendered on the SERVER and passed down as a node.
   *  `next-mdx-remote/rsc` cannot run in a client component; a server-rendered
   *  ReactNode passed as a prop can. That is the whole reason this component
   *  takes `content` instead of a source string. */
  content: ReactNode;
  /** Index into `frames`. Sections that do not qualify for a frame of their own
   *  carry the index of the nearest qualifying section — see the template. */
  frame: number;
};

/**
 * The article template's copy/sticky pairing.
 *
 * 🔴 THIS IS /services §4, NOT A NEW LAYOUT. `ServicesEssay.tsx` and this file
 * render the same three classes — `.essay-grid`, `.essay-copy`, `.essay-sticky`
 * — with the same 1.75fr / 1fr tracks, the same 131.2px gap, the same 8rem
 * sticky top, the same 2/3 frame and the same `display:none` below 992. Every
 * number lives in globals.css and is shared, so the two routes cannot drift.
 *
 * WHAT IS DIFFERENT, AND IT IS ONLY THIS: /services has one image per block by
 * construction (5 blocks, 5 images). An article has more sections than it has
 * frames, so `frame` is an explicit lookup rather than the block index. A
 * section that does not qualify for a frame does not blank the column — it
 * holds the frame of the nearest qualifying section above it, and the sections
 * ABOVE the first qualifying one hold the first frame. There is therefore no
 * scroll position at which the sticky column is empty, which is exactly the
 * failure mode that argued against this layout when the template was centred.
 *
 * REDUCED MOTION: as /services. The swap still runs; the 300ms crossfade drops
 * via `motion-reduce:transition-none`. No `useReducedMotion` call, so server and
 * client render identical markup.
 */
export default function ArticleEssay({
  header,
  blocks,
  frames,
}: {
  /** Back link, h1 and meta line. Inside the COPY COLUMN, not above the grid:
   *  above the grid the h1 would set against the full 1438.8 container and run
   *  ~600px wider than the prose it introduces — the exact defect the centring
   *  was originally introduced to fix. */
  header: ReactNode;
  blocks: readonly ArticleEssayBlock[];
  frames: readonly string[];
}) {
  const refs = useMemo(
    () => blocks.map(() => createRef<HTMLElement>()),
    [blocks],
  );
  const active = useSequenceSwap(refs);
  // 🔴 2026-08 — THE STICKY IMAGE COLUMN IS REMOVED; articles are text-only.
  // `shown` selected which frame the (now-commented) sticky column displayed:
  //   const shown = blocks[active]?.frame ?? 0;
  // `active` is still live — it drives `data-active` on the running section —
  // and `frames` is still received so the column can be restored verbatim, but
  // neither `shown` nor `frames` is read while the column is out. See the
  // commented `.essay-sticky` block below and the `.essay-grid--textonly` rule
  // in globals.css that re-centres the copy so it is not left-pinned.
  void frames;

  return (
    // `essay-grid--textonly` collapses the 1.75fr/1fr split (which would leave
    // the right half empty now the image is gone) to a single centred measure
    // at >=992, so the copy re-centres with balanced margins instead of pinning
    // left. Below 992 `.essay-grid` is already one full-width column. The
    // modifier is scoped to this component so /services §4 (ServicesEssay, which
    // keeps its images) is untouched.
    <div className="essay-grid essay-grid--textonly">
      <div className="essay-copy">
        {header}
        {/* 🔴 `<section>`, NOT the `<ol>`/`<li>` /services §4 uses, and this is
            the one deliberate divergence in the markup. There the blocks are a
            SET — five named principles — and a list is what they are. Here they
            are the running body of a single article, each already introduced by
            its own h2. Wrapping an article's prose in a list makes a screen
            reader announce "list, 6 items" and read every paragraph inside a
            list item, which is a semantics regression the layout does not need:
            `.essay-block` is a class, not an element, and it styles a section
            identically. */}
        {blocks.map((b, i) => (
          <section
            key={b.key}
            ref={refs[i] as React.RefObject<HTMLElement>}
            className="essay-block blog-prose"
            data-active={i === active ? "true" : undefined}
          >
            {b.content}
          </section>
        ))}
      </div>

      {/* 🔴 2026-08 — THE STICKY IMAGE COLUMN IS COMMENTED OUT, NOT DELETED, so
          articles render as text only. It is kept verbatim (including its
          `alt=""` / `aria-hidden` rationale) so it can be restored by deleting
          this comment wrapper and dropping the `--textonly` modifier above. It
          referenced `frames` and `shown`, both of which are still computed/received.

          {/* `alt=""` AND `aria-hidden`, the same call /services §4 records.
              These photographs are DECORATIVE relative to the article — a room
              of windows, a stair, a colonnade. None carries information the
              prose does not, and the column is `display:none` below 992.

          <div aria-hidden="true" className="essay-sticky">
            <div className="essay-frame relative w-full overflow-hidden">
              {frames.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 992px) 31vw, 0px"
                  quality={78}
                  className={`object-cover object-center transition-opacity duration-300 ease-[ease] motion-reduce:transition-none ${
                    i === shown ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
      */}
    </div>
  );
}
