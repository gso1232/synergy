"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import step1Photo from "../public/synergy/process-01-consultation.jpg";
import step2Photo from "../public/synergy/process-02-market.jpg";
import step3Photo from "../public/synergy/process-03-explained.jpg";

/**
 * How It Works — rebuilt on reyou.life's "How to Get Started" section, measured
 * live at a 1536 viewport. Their build has THREE steps, so nothing here is
 * stretched or padded to fit; the count matches one for one.
 *
 *   container  100% - 64px, max-width: none — no cap, same as Why Synergy above
 *   grid       12 cols x 93.325px, column gap 32px, row gap 0
 *
 *   COLUMN PLACEMENT, read off their per-breakpoint span variables:
 *                    >=992      768-991          <=767
 *     eyebrow        cols 1-2   cols 1-2         full
 *     heading        cols 3-12  cols 3-12        full
 *     step 1         cols 1-4   cols 3-10        full
 *     step 2         cols 5-8   cols 3-10        full
 *     step 3         cols 9-12  cols 3-10        full
 *   So at tablet the three steps stack CENTRED at 8 of 12 columns rather than
 *   going full width.
 *
 *   ONE DELIBERATE DEVIATION: we switch to three-across at xl (1280), not at
 *   their 992. Their breakpoint is a Webflow default, and inheriting it puts
 *   the NARROWEST card (4 of 12 columns) at the width where the copy is still
 *   wrapping hardest — the card is actually smaller at 1100 (319px) than it is
 *   at 890 (530px), because 4/12 is narrower than 8/12. Measured panel coverage
 *   of the card, which is how much of the photograph the panel hides:
 *
 *     switch at 1024        switch at 1280 (shipped)
 *       1100  83%             1100  36%   (still the centred stack)
 *       1280  67%             1280  67%
 *       1536  56%             1536  56%
 *
 *   83% leaves a 17% sliver of photograph and reads as a bug. Holding the
 *   centred stack to 1280 keeps every reyou proportion intact — 4:5 card, the
 *   paddings, radii, gap, blur, spans and motion are all unchanged — and only
 *   moves where the layout changes form. Worst case is now 67% at the switch,
 *   against reyou's own 60% at their widest.
 *
 *   heading    34px / weight 400 / lh 1.2 / ls -0.0162em  (fluid 20 -> 34)
 *   step gap   64px above every step wrap (their space--8, fluid 40 -> 64);
 *              row gap is 0, so the same number sets the stacked rhythm
 *   title row  "Step" -- hairline rule -- arrowhead -- numeral, 8px gaps,
 *              11px uppercase, then 24px to the card
 *   card       aspect 4/5, radius 8, padding 32, the PHOTOGRAPH IS THE CARD
 *              (they use background-size: cover on the card itself; we use
 *              next/image + fill for the derivatives and the blur placeholder)
 *   panel      natural height, top-anchored, radius 4, padding 32, gap 48,
 *              12px backdrop blur — see .hiw-glass for the tint, which is the
 *              one place we deviate from them and why
 *   step h3    26px / weight 400 / lh 1.3 / ls -0.0162em  (fluid 18 -> 26)
 *   step body  20px / lh 1.45                             (fluid 16 -> 20)
 *
 *   MOTION: one play-once tween on the PANELS ONLY — not the cards, not the
 *   title rows. Measured off their live ScrollTrigger:
 *     gsap.from('.process_step_glass', { yPercent: 50, autoAlpha: 0,
 *       duration: 0.6, stagger: 0.2, ease: 'power2.out' })
 *     ScrollTrigger { start: 'top 75%', once: true }
 *   Reproduced below with framer-motion: y = 50% of the panel's own height,
 *   opacity 0, 0.6s, 0.2s stagger, and power2.out expressed as its cubic-bezier
 *   equivalent (easeOutCubic). `viewport.margin: "-25% 0px 0px 0px"` is their
 *   "top 75%" — the trigger fires when the grid's top reaches 75% of the
 *   viewport height — and `once: true` is their `once`.
 *
 *   Their cards have NO hover: dispatching pointerover / mouseenter / mouseover
 *   on the wrap, the card and the panel changed no computed property.
 *
 * Copy is the client's own, from fflsynergy.com. Their site publishes no
 * process section at all — the whole of it is one FAQ answer ("The first step
 * is a free ... consultation with a licensed Synergy advisor. You can call,
 * email, or book directly on the website. There is no obligation and no
 * pressure.") — so each step is assembled from their own statements across
 * Home, About, Services and Contact, and rewritten wherever the phrasing
 * collided with checkmatefinancialgroup.com. No carrier rating claim appears
 * here: "A-rated" and "AM Best" are Checkmate's, absent from fflsynergy
 * entirely. No language claim appears here either: fflsynergy nowhere states
 * that advisors work in Spanish, and the client is confirming it in writing.
 */
const STEPS = [
  { key: "s1", src: step1Photo },
  { key: "s2", src: step2Photo },
  { key: "s3", src: step3Photo },
] as const satisfies ReadonlyArray<{ key: string; src: StaticImageData }>;

/* Their measured entry tween. power2.out === easeOutCubic. */
const EASE = [0.215, 0.61, 0.355, 1] as const;
const DURATION = 0.6;
const STAGGER = 0.2;

/* The slot the card actually occupies, so next/image requests the right
   derivative instead of a viewport-wide one. Container is (100vw - 64px) at
   md+, so with C = 100vw - 64 and col = (C - 352) / 12:

     >=1280   4 cols + 3 gutters = (100vw - 416px)/3 + 96px
     768-1279 8 cols + 7 gutters = (2C - 704)/3 + 224
                                 = (200vw - 832px)/3 + 224px
     <768     the full container, 100vw - 40px  (px-5) */
const SIZES =
  "(min-width: 1280px) calc((100vw - 416px) / 3 + 96px), " +
  "(min-width: 768px) calc((200vw - 832px) / 3 + 224px), " +
  "calc(100vw - 40px)";

/**
 * True once the three steps are side by side. reyou hang their single
 * ScrollTrigger on the whole grid, so the 0.2s stagger only reads while the
 * steps share a row; once they stack, panels 2 and 3 play their tween far below
 * the fold and the visitor never sees it. We keep their per-panel trigger and
 * drop the stagger delay when stacked, which is the same motion wherever it is
 * actually visible.
 */
function useThreeAcross() {
  const [across, setAcross] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setAcross(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return across;
}

export default function HowItWorks() {
  const t = useTranslations("howItWorks");
  const reduce = useReducedMotion();
  const threeAcross = useThreeAcross();

  return (
    <section
      aria-labelledby="hiw-heading"
      // Their own section padding is 112px; ours is 80px at lg, matching every
      // other section on this page (and the same decision already taken in
      // WhySynergy). Why Synergy above closes on 80 and the Calculator below
      // opens on 80, so both boundaries are 160px ink-to-ink — identical to
      // every other seam on the page, and all three sections are bg-cream so
      // there is no visible join.
      className="px-5 py-14 md:px-8 lg:py-20"
    >
      {/* No max-width cap, matching theirs and matching Why Synergy directly
          above — the container is the viewport minus 32px each side at md+.
          The 12-track grid only applies from lg; below that the twelve 32px
          gaps alone would exceed the container. */}
      <div className="mx-auto">
        {/* HEADER ROW — eyebrow and heading share one 12-track grid from md,
            which is reyou's own placement (they hold cols 1-2 / 3-12 all the
            way down to 767). The STEPS switch to three-across later, at xl, for
            the panel-coverage reason above — the two are decoupled on purpose,
            so the header keeps its side-by-side relationship at widths where
            the cards are still stacked. */}
        <div className="md:grid md:grid-cols-12 md:items-center md:gap-x-8">
        {/* EYEBROW — cols 1-2, its own track at the far left.
            The outer div is a grid item and stretches to the row height, which
            the cap-trimmed heading sets. The <p> fills that height and centres
            its dot + text, so the eyebrow's cap band shares a centre line with
            the heading's cap band — reyou's exact relationship. */}
        <div className="flex md:col-span-2">
          {/* leading-none is load-bearing: the <p> itself is not cap-trimmed,
              so its 1.5 line box (16.5px) would otherwise set the header row's
              height instead of the heading's cap band — which pushed the
              heading off centre and inflated the 64px below it. With the line
              box collapsed, the row is exactly the heading's cap band and
              items-center puts the two cap bands on one centre line. */}
          <p className="flex h-full items-center gap-2 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-gold-deep">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep"
            />
            <span className="cap-trim cap-body">{t("eyebrow")}</span>
          </p>
        </div>

        {/* HEADING — cols 3-12, sharing the eyebrow's row. cap-trim makes this
            box exactly the capital letters, so the 64px below it is measured
            from the baseline like reyou's, not from a leading-padded box. */}
        <div className="mt-6 md:col-span-10 md:col-start-3 md:mt-0">
          <h2
            id="hiw-heading"
            className="cap-trim cap-display font-display font-semibold text-[clamp(20px,2.35vw,34px)] leading-[1.2] tracking-[-0.0162em] text-navy"
          >
            {t("headline")}
          </h2>
        </div>

        </div>

        {/* THE THREE STEPS — a real <ol>, so the numerals are the list's own
            semantics rather than decoration a screen reader has to guess at.
            The visible "Step 01" row is aria-hidden: the list already conveys
            order and position, and reading "Step 0 1" before every heading is
            noise.
            Every <li> carries the same top margin, the first one included —
            that is reyou's own construction (their row-gap is 0 and every
            .process_step_wrap has margin-top: space--8), so one number sets
            both the header-to-steps gap and the gap between stacked steps.
            40px small / 64px md+, matching their fluid space--8. */}
        <ol className="xl:grid xl:grid-cols-12 xl:gap-x-8">
          {STEPS.map((step, i) => (
            <li
              key={step.key}
              className={[
                "mt-10 md:mx-auto md:mt-16 md:w-[calc((200%_-_704px)_/_3_+_224px)] xl:mx-0 xl:mt-16 xl:w-auto",
                i === 0
                  ? "xl:col-span-4 xl:col-start-1"
                  : i === 1
                    ? "xl:col-span-4 xl:col-start-5"
                    : "xl:col-span-4 xl:col-start-9",
              ].join(" ")}
            >
              {/* TITLE ROW — label, rule, arrowhead, numeral. Decorative:
                  the <ol> carries the order. 24px to the card below. */}
              <div
                aria-hidden="true"
                className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70"
              >
                <span className="cap-trim cap-body">{t("stepLabel")}</span>
                <span className="hiw-rule flex-1" />
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  className="-ml-1 shrink-0"
                >
                  <path
                    d="M0 4h8M5.5 1L8.5 4l-3 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="cap-trim cap-body">
                  {t(`steps.${step.key}.num`)}
                </span>
              </div>

              {/* CARD — the photograph IS the card. aspect 4/5, radius 8,
                  padding 32. translateZ(0) for the same WebKit reason as the
                  hero card: Safari drops a rounded clip on a composited child
                  without its own layer. */}
              <div
                className="relative w-full overflow-hidden rounded-[8px] bg-navy p-8"
                style={{ aspectRatio: "4 / 5", transform: "translateZ(0)" }}
              >
                <Image
                  src={step.src}
                  alt={t(`steps.${step.key}.imageAlt`)}
                  fill
                  placeholder="blur"
                  quality={82}
                  sizes={SIZES}
                  // The crops are already exactly 4:5 and the card is exactly
                  // 4:5, so cover fits the slot with nothing trimmed on either
                  // axis — the visible framing CANNOT shift with viewport
                  // width, which is the whole reason the subject stays clear of
                  // the panel at every breakpoint. object-center is only a
                  // guard against sub-pixel rounding; the composition lives in
                  // the crop offsets recorded in CREDITS.md.
                  className="hiw-photo object-cover object-center"
                />

                {/* PANEL — natural height, top-anchored, over the photograph.
                    Under prefers-reduced-motion this is a PLAIN div: no
                    transform, no opacity tween, and — the part that matters —
                    no hidden initial state waiting on an IntersectionObserver.
                    "Instant state" has to mean the copy is simply there. */}
                {reduce ? (
                  <div className="hiw-glass relative flex flex-col gap-12 rounded-[4px] p-8">
                    <h3 className="font-display font-semibold text-[clamp(18px,1.7vw,26px)] leading-[1.3] tracking-[-0.0162em] text-cream">
                      {t(`steps.${step.key}.title`)}
                    </h3>
                    <p className="text-[clamp(16px,1.3vw,20px)] leading-[1.45] text-cream">
                      {t(`steps.${step.key}.body`)}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="hiw-glass relative flex flex-col gap-12 rounded-[4px] p-8"
                    // Their yPercent: 50 is 50% of the panel's OWN height,
                    // which is what a percentage y resolves to here too.
                    initial={{ opacity: 0, y: "50%" }}
                    whileInView={{ opacity: 1, y: "0%" }}
                    // Their ScrollTrigger `start: "top 75%"`, expressed as a
                    // root margin: pulling the root's BOTTOM edge up by 25%
                    // makes intersection begin exactly as the element's top
                    // crosses 75% of the viewport height. `once` is theirs.
                    viewport={{ once: true, margin: "0px 0px -25% 0px" }}
                    transition={{
                      duration: DURATION,
                      ease: EASE,
                      delay: threeAcross ? i * STAGGER : 0,
                    }}
                  >
                    <h3 className="font-display font-semibold text-[clamp(18px,1.7vw,26px)] leading-[1.3] tracking-[-0.0162em] text-cream">
                      {t(`steps.${step.key}.title`)}
                    </h3>
                    <p className="text-[clamp(16px,1.3vw,20px)] leading-[1.45] text-cream">
                      {t(`steps.${step.key}.body`)}
                    </p>
                  </motion.div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
