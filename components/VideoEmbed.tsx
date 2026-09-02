"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * THE SYNERGY FILM, EMBEDDED AS A FACADE.
 *
 * =============================================================================
 * 🔴 IT DOES NOT LOAD YOUTUBE UNTIL SOMEBODY PRESSES PLAY, AND THAT IS THE WHOLE
 * DESIGN. A plain <iframe src="youtube.com/embed/..."> costs roughly 900KB and
 * a dozen requests on EVERY page view, including the large majority who scroll
 * past without watching. It also drops YouTube's cookies on arrival, which makes
 * a marketing page into a third-party tracking surface before the visitor has
 * asked for anything.
 *
 * So what ships is a poster, a play button and nothing else. The iframe is
 * created on the first click, with `autoplay=1` so that click is the only one
 * needed. Before that press, this component makes no request to any Google
 * domain at all.
 *
 * THE POSTER IS SELF-HOSTED. `public/synergy/join-video-poster.jpg` is
 * YouTube's own 1280x720 maxres thumbnail for this video, downloaded and
 * committed rather than hotlinked from img.youtube.com. Hotlinking would mean a
 * third-party request on load, which is the exact cost this component exists to
 * avoid, and it would need next.config's remotePatterns opened for a Google
 * host.
 *
 * ⚠️ IF THE VIDEO IS EVER REPLACED, THE POSTER DOES NOT FOLLOW. It is a
 * committed file, so a new `id` here shows the old frame until the jpg is
 * replaced too. Both live in this file's props for exactly that reason.
 *
 * =============================================================================
 * ACCESSIBILITY. The facade is a real <button>, so it is reachable by keyboard
 * and announces as a button rather than as a decorative image. Its accessible
 * name says what pressing it does and how long the film runs, because "play" on
 * its own tells a screen reader user nothing about what they are committing to.
 * `youtube-nocookie.com` is used rather than `youtube.com`: same player, no
 * cookie until playback actually starts.
 */

export default function VideoEmbed({
  id,
  poster,
  className = "",
}: {
  /** YouTube video id. */
  id: string;
  /** Self-hosted still, 16:9. */
  poster: string;
  className?: string;
}) {
  const t = useTranslations("video");
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[4px] bg-navy ${className}`}
      style={{ aspectRatio: "16 / 9" }}
    >
      {playing ? (
        <iframe
          /* `title` is required: an iframe with no accessible name is announced
             as an unlabelled frame and is a straight WCAG failure. */
          title={t("title")}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={t("playAria")}
          className="group absolute inset-0 h-full w-full cursor-pointer border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          <Image
            src={poster}
            alt=""
            fill
            /* Not `priority`: this sits well below the fold on /join, and the
               hero above it is the LCP element. */
            sizes="(max-width: 900px) 100vw, 760px"
            className="object-cover"
          />
          {/* A flat scrim, not a gradient: the brief asks for minimal effects,
              and the play button needs one predictable ground rather than one
              that changes with whatever frame the thumbnail happens to be. */}
          <span aria-hidden="true" className="absolute inset-0 bg-navy/25" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-royal shadow-[0_1px_2px_rgba(0,32,80,0.05),0_10px_24px_-16px_rgba(0,32,80,0.35)] transition-transform duration-300 ease-out-expo group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            {/* Optically centred: a triangle's visual centre sits left of its
                bounding box, so it is nudged right by 3px. */}
            <svg
              viewBox="0 0 24 24"
              className="ml-[3px] h-[26px] w-[26px] fill-white"
              aria-hidden="true"
            >
              <path d="M6 3.8 20 12 6 20.2z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
