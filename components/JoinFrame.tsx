import Image from "next/image";

/**
 * /join §2's frame — STATIC, contained, Synergy's own photograph.
 *
 * 2026-07-30(2): the parallax was dropped and the box shrunk (see `.join-frame`
 * in globals.css). Reasons, in order:
 *   1. The frame moved onto Synergy's OWN material (join-opening-agents.jpg,
 *      1620x1080). Nothing Synergy owns reaches the 2908px the old full-width
 *      16:9 frame needed at 2x, so the box was capped to 760px @ 3:2 — the
 *      native aspect, so object-cover performs no crop.
 *   2. At that size the old parallax — a 130%-tall travelling layer, object-cover
 *      — would render the image into an area larger than 1620px can fill sharply
 *      at 2x DPR (an ~18% upscale). Sharpness beat the effect.
 *   3. The Nordiska reference this block twins has NO parallax anyway (measured:
 *      transition-duration 0s, animation-name none) — so dropping it is also the
 *      reference-accurate choice, not only the resolution-driven one.
 *
 * Entry is <FadeUp> from the page, like every other block on this route. No
 * client hooks remain, so this is a server component now.
 */
export default function JoinFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="join-frame">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 760px, 100vw"
        quality={82}
        className="object-cover object-center"
      />
    </div>
  );
}
