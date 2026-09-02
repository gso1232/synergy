"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { routeHref } from "@/routes";
import FadeUp from "./FadeUp";
import whyPhoto from "../public/why-advisor-family.jpg";

/**
 * Why Synergy — rebuilt on reyou.life's "Why choose us" layout, measured live
 * at a 1536 viewport.
 *
 *   container   100% - 64px (32px each side), max-width: none — no cap
 *   grid        12 cols × 93.325px, column gap 32px
 *   padding     112px top and bottom (they use spacer divs; we use padding)
 *
 *   COLUMN PLACEMENT, read off their x-positions:
 *     eyebrow    cols 1-2    218.7px
 *     heading    cols 8-12   594.7px
 *     intro      cols 8-12   594.7px
 *     cards      cols 3-7    594.7px
 *     image      cols 8-12   594.7px
 *     closing    cols 3-7    594.7px
 *   So the text and image columns are EQUAL — 5 of 12 each, 40.4% of the
 *   container — separated by exactly one 32px gap (measured 31.9px between the
 *   cards' right edge and the image's left edge). Cols 1-2 hold the eyebrow
 *   alone and push both content columns right.
 *
 *   heading     34px / weight 400 / lh 1.2, full 5-col width
 *   card        0.8px solid border, radius 4px, padding 24px, 24px between
 *   card title  20px / weight 400 / lh 29px / ls -0.324px + a 24px mark
 *   bullets     2-col grid, 16px gap, 15px / lh 21.75 / ls 0.243px
 *   image       aspect 0.798, radius 8px, overflow hidden, object-position
 *               bottom-anchored
 *   rhythm      112 → [heading] → 64 → intro → 32 → cards+image → 32 →
 *               closing → 64 → button → 112
 *
 *   MOTION: their image is a scroll-linked ZOOM-OUT, not a translate parallax.
 *   Measured across five scroll positions: scale(1.1) while the section is
 *   below the fold, scale(1.0002) as the wrapper reaches the top of the
 *   viewport, scale(1) past it. Nothing translates. Their cards have NO hover —
 *   dispatching mouseenter/mouseover changed no computed property.
 *
 * Copy is the client's own, from fflsynergy.com, rewritten where it overlapped
 * checkmatefinancialgroup.com. Their "Why Families Choose Synergy" carries three
 * points and one paragraph each — so this runs FOUR cards (the fourth sourced
 * from their ITIN FAQ) with TWO bullets each, rather than reyou's four-and-four.
 * The layout was shrunk to what the source supports; nothing is padded.
 *
 * ---------------------------------------------------------------------------
 * SUPERSEDED: the eight-row zig-zag built on reyou's "Conditions" anatomy
 * (far-left header, title + circular arrow + 16:9 image + paragraph per row,
 * 1px #252525 divider) lived here. It is commented out rather than deleted, and
 * `whySynergy.rows.r1`–`r8` are still present in messages/en.json, so reverting
 * is a single edit. The eight rows were also where the audience list repeated.
 *
 * const ROWS = [
 *   { key: "r1", src: "/synergy/why-g10.jpg", pos: "object-[center_35%]" },
 *   { key: "r2", src: "/synergy/why-g1.jpg",  pos: "object-[center_35%]" },
 *   { key: "r3", src: "/synergy/why-g12.jpg", pos: "object-[center_30%]" },
 *   { key: "r4", src: "/synergy/why-itin.jpg", pos: "object-center" },
 *   { key: "r5", src: "/synergy/why-bilingual.jpg", pos: "object-center" },
 *   { key: "r6", src: "/synergy/why-g3.jpg",  pos: "object-[center_40%]" },
 *   { key: "r7", src: "/synergy/why-overlooked.jpg", pos: "object-center" },
 *   { key: "r8", src: "/synergy/why-g11.jpg", pos: "object-[center_30%]" },
 * ] as const;
 * ---------------------------------------------------------------------------
 */
const POINTS = ["p1", "p2", "p3", "p4"] as const;
const BULLETS = ["b1", "b2"] as const;

/* Their zoom window, expressed viewport-relative so it holds at any height.
   Measured: the scale sits at 1.1 while the wrapper's top is at ~508px (59% of
   their 864px viewport), and has reached 1.0 by ~108px (12.5%). */
const ZOOM_FROM = 0.6; // of viewport height
const ZOOM_TO = 0.12;
const SCALE_MAX = 1.1;

export default function WhySynergy() {
  const t = useTranslations("whySynergy");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  // Scroll-linked zoom-out, written straight to the node so it costs no React
  // re-render.
  //
  // Driven by a rAF loop rather than a scroll listener. Lenis owns the page and
  // suppresses native scroll events — measured here as ZERO native events and
  // ZERO Lenis emissions across a programmatic scroll — so anything
  // event-driven simply never updates. An IntersectionObserver gates the loop
  // so it only runs while the section is near the viewport.
  useEffect(() => {
    const frame = frameRef.current;
    const el = frame?.querySelector<HTMLElement>("img");
    if (!frame || !el) return;

    if (reduce) {
      el.style.transform = "none";
      return;
    }

    let raf = 0;
    let running = false;
    let last = -1;

    const tick = () => {
      const top = frame.getBoundingClientRect().top;
      const vh = window.innerHeight || 1;
      const from = ZOOM_FROM * vh;
      const to = ZOOM_TO * vh;
      const p = Math.min(1, Math.max(0, (from - top) / (from - to)));
      const scale = +(SCALE_MAX - (SCALE_MAX - 1) * p).toFixed(4);
      if (scale !== last) {
        last = scale;
        el.style.transform = `scale(${scale})`;
      }
      if (running) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(frame);
    tick(); // paint the correct starting scale before any scrolling

    return () => {
      io.disconnect();
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <section
      aria-labelledby="why-heading"
      // reyou's own section padding is 112px, and matching it stacked against
      // Who We Serve's 80px bottom to produce a 232px ink-to-ink gap — the
      // loosest boundary on the page by 40px. Brought into line with every
      // other section here (80px at lg). reyou's INTERNAL rhythm (64/32/64) is
      // untouched; only the outer padding gives way, for page-level
      // consistency.
      className="px-5 py-14 md:px-8 lg:py-20"
    >
      {/* No max-width cap, matching theirs — the container is simply the
          viewport minus 32px each side at md+.
          The 12-track grid is applied ONLY from lg. Below that it is a plain
          stack: at 390 the twelve 32px gaps alone come to 352px against a
          326px container, so the tracks collapsed to zero and the row
          overflowed its own container by 26px. */}
      <div className="mx-auto flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
        {/* EYEBROW — cols 1-2, its own track at the far left */}
        <FadeUp className="lg:col-span-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep"
            />
            {t("eyebrow")}
          </p>
        </FadeUp>

        {/* HEADING + INTRO — cols 8-12, sharing the eyebrow's row */}
        <div className="lg:col-span-5 lg:col-start-8">
          <FadeUp>
            <h2
              id="why-heading"
              className="font-display font-semibold text-[clamp(26px,2.35vw,34px)] leading-[1.2] tracking-[-0.01em] text-navy"
            >
              {t("headline")}
            </h2>
            <p className="mt-16 text-[15px] leading-[1.45] tracking-[0.016em] text-ink/80">
              {t("intro")}
            </p>
          </FadeUp>
        </div>

        {/* CARDS — cols 3-7 */}
        <div className="lg:col-span-5 lg:col-start-3 lg:mt-8">
          <div className="flex flex-col gap-6">
            {POINTS.map((p, i) => (
              <FadeUp key={p} index={i}>
                <article className="rounded-[4px] border-[0.8px] border-ink/80 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-[20px] leading-[1.45] tracking-[-0.016em] text-navy">
                      {t(`points.${p}.title`)}
                    </h3>
                    {/* Their 24px mark, drawn in our tokens rather than copied */}
                    <span
                      aria-hidden="true"
                      // Ring at full gold-deep, not 50%: at half strength it
                      // measured 2.03:1 on cream, under the 3:1 non-text floor.
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-deep text-gold-deep"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path
                          d="M1 9L9 1M9 1H3M9 1v6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {BULLETS.map((b) => (
                      <li
                        key={b}
                        className="text-[15px] leading-[1.45] tracking-[0.016em] text-ink/80"
                      >
                        {t(`points.${p}.${b}`)}
                      </li>
                    ))}
                  </ul>
                </article>
              </FadeUp>
            ))}
          </div>

          {/* CLOSING — same column as the cards, 32px below them */}
          <FadeUp className="mt-8">
            <p className="max-w-[46ch] text-[15px] leading-[1.45] tracking-[0.016em] text-ink/80">
              {t("closing")}
            </p>
            {/* href="#" — REPLACED with /contact. Checked live: fflsynergy.com
                sends its own "Get a Free Quote" buttons to /contact, whose
                submit reads "Request My Free Quote". See HANDOFF §4a.
                ⚠️ The label still does not quite match the paragraph above it,
                which offers "a free, no-obligation consultation" rather than a
                quote. That is a COPY question, not a link question, and it is
                logged rather than solved with an href. */}
            <a
              href={routeHref(locale, "contact")}
              className="mt-16 inline-flex h-12 items-center rounded-full bg-navy px-7 text-[15px] font-semibold text-cream transition-colors duration-300 hover:bg-gold-deep"
            >
              {t("cta")}
            </a>
          </FadeUp>
        </div>

        {/* IMAGE — cols 8-12, aspect 0.798, clipped and rounded like theirs.
            translateZ(0) for the same Safari reason as the hero card: WebKit
            drops a rounded clip on a scaled child without its own layer. */}
        <div className="lg:col-span-5 lg:col-start-8 lg:mt-8">
          <div
            ref={frameRef}
            className="why-img relative w-full overflow-hidden rounded-[8px] bg-navy"
            style={{ aspectRatio: "0.798", transform: "translateZ(0)" }}
          >
            <Image
              src={whyPhoto}
              alt={t("imageAlt")}
              fill
              placeholder="blur"
              quality={82}
              // The slot is 5 of 12 columns inside (100vw - 64px) — ~39.3vw at
              // lg — but the image renders at up to 1.1× that during the zoom,
              // so the request is sized for the zoomed-in state (39.3 × 1.1 ≈
              // 44vw) rather than the settled one.
              sizes="(min-width: 1024px) 44vw, calc(100vw - 64px)"
              // Source is 0.667 — NARROWER than the 0.798 slot — so cover keeps
              // the full width and can only trim 16.4% of the HEIGHT. Anchored
              // to the bottom (reyou's own `50% 100%`), which spends the whole
              // of that trim on the empty ceiling and chandelier and lifts the
              // family from 0.47 to 0.41 of the frame. Faces sit at 0.51–0.61
              // of source height, so the visible band 0.164–1.0 clears every
              // head with room to spare.
              className="why-img__el object-cover [object-position:50%_100%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
