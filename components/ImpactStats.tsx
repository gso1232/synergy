"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/**
 * The three-figure impact band under the hero — familyfirstlife.com's, cloned.
 *
 * =============================================================================
 * 🔴 THIS IS THE SECOND ATTEMPT, AND THE FIRST ONE MISSED THE THREE THINGS THAT
 * MAKE THE BAND WHAT IT IS. Recorded so they are not lost again:
 *
 *   1. THE NUMBERS COUNT UP. The reference's figures are Elementor counters,
 *      not static text: `data-from-value` -> `data-to-value` over
 *      `data-duration`. The first pass fade-slid three finished numbers into
 *      place, which is a different effect entirely.
 *   2. EACH CARD OPENS WITH AN ICON. ~100px tall, 20px above the figure. The
 *      first pass had no icon, so each card was a third empty and the whole
 *      band read as half its intended height.
 *   3. THE BAND OVERLAPS THE HERO. The reference's section carries
 *      `margin-top: -125px`, so the cards climb into the bottom of the
 *      photograph. The first pass sat it neatly below, which is what made it
 *      look like a separate strip rather than part of the hero composition.
 *
 * =============================================================================
 * MEASURED LIVE OFF THE REFERENCE AT 1491px, from computed styles — not read
 * off a screenshot:
 *
 *   section        margin-top -125px · position relative · z-index 1 · no bg
 *   container      1280 wide, three equal columns, NO gap between them
 *   column         427 x 460
 *   outer card     white, 427 x 396, padding 60px, margin 32px 0,
 *                  0.8px #d8d8d8 hairline
 *   middle card    #ED1C24, 427 x 460, padding 60px, margin 0
 *   icon           ~100px tall, 20px below
 *   figure         34px / 800 / lh 44.2 / #282828
 *   unit           12px / 700 / lh 15.6 / +0.4px / uppercase / black 76%
 *   label          20px / 700 / lh 27.2
 *
 * 🔴 THE 396 AND THE 460 ARE NOT TWO HEIGHTS, THEY ARE ONE HEIGHT AND A MARGIN.
 * The reference does not size these cards. All three columns stretch to the
 * tallest, and the outer two carry `margin: 32px 0` which shrinks them by 64.
 * Reproduced the same way — `md:my-8` on the outer cards and nothing else — so
 * the overhang survives a longer label or a translated string. Hard-coding
 * 396/460 would break the moment Spanish wrapped a label onto a third line.
 *
 * =============================================================================
 * 🔴 TWO DELIBERATE DEPARTURES FROM THE REFERENCE.
 *
 * THE RED IS GONE. #ED1C24 is FFL's brand colour; the middle card is
 * `navy-soft` #22496F, this site's single accent — the same fill as the Join
 * pill, the utility strip's badges and both hero CTAs. Cream on it is 8.16:1.
 *
 * THE ICONS ARE DRAWN HERE, NOT EMBEDDED. The reference's three icons are Rive
 * animations served in <iframe> from rive.app — FFL-branded artwork on a
 * third-party host. Embedding them would put someone else's trademark on this
 * page and three cross-origin iframes in the homepage's critical path, and they
 * can be changed or withdrawn without notice. These are plain inline SVG in
 * `currentColor`, so the same three paths work on the white cards and on the
 * navy one.
 */

/**
 * 🔴 THE FIGURES ARE 10% OF THE REFERENCE'S, AND THAT IS AN INSTRUCTION, NOT A
 * MEASUREMENT. The reference claims $150 Billion placed, 1,000,000 families and
 * $800 Million premium — those are the PARENT organisation's totals. A tenth of
 * someone else's number is a proportional estimate, not Synergy's own figure.
 *
 * ⚠️ These are public performance claims on an insurance site, and those are
 * regulated. Before they ever have to be defended they need to come out of
 * Synergy's own books. They live in `messages/*.json` under `impact` precisely
 * so that correction is an admin edit and not a deploy.
 */
type Stat = {
  /** Message key stem: `${key}v` value, `${key}u` unit, `${key}l` label. */
  key: "s1" | "s2" | "s3";
  /**
   * Where the counter starts, as a fraction of the target.
   *
   * These are the reference's own start points expressed as ratios: it counts
   * 50 -> 150 (a third), 0 -> 1,000,000 (from nothing) and 500 -> 800 (five
   * eighths). Stored as fractions rather than as absolute numbers so that
   * editing a figure in the admin panel cannot leave the animation starting
   * above the number it is counting to.
   */
  fromFraction: number;
  /** The reference's own per-card duration, in ms. */
  duration: number;
  /** The centre card: filled, and 64px taller than its neighbours. */
  feature?: boolean;
};

const STATS: Stat[] = [
  { key: "s1", fromFraction: 1 / 3, duration: 3000 },
  { key: "s2", fromFraction: 0, duration: 2000, feature: true },
  { key: "s3", fromFraction: 5 / 8, duration: 3000 },
];

/**
 * Split a display figure into the parts a counter needs.
 *
 * The messages hold ONE string per figure — "$15", "100,000+", "$80" — because
 * everything Aiman can edit has to be a plain string leaf (see the guard in
 * lib/cms/strings.ts). So the prefix, the digits and the suffix are recovered
 * from that string rather than stored as three more keys he would have to keep
 * in sync.
 *
 * Whether the result is grouped is taken from the SOURCE string, not from the
 * locale: "100,000+" is written with commas in both en and es, and switching
 * the Spanish build to "100.000" mid-count would be a change nobody asked for.
 */
function parseFigure(raw: string) {
  const m = /^([^\d]*)([\d., \s]*\d)(.*)$/.exec(raw.trim());
  if (!m) return { prefix: "", target: null as number | null, suffix: raw, grouped: false };
  const [, prefix, digits, suffix] = m;
  const grouped = /[., \s]/.test(digits);
  const target = Number(digits.replace(/[., \s]/g, ""));
  if (!Number.isFinite(target)) return { prefix, target: null, suffix, grouped };
  return { prefix, target, suffix, grouped };
}

/**
 * The count-up itself.
 *
 * ⚠️ IT RUNS ONCE. `useInView({ once: true })` — the reference does not replay
 * its counters on the way back up the page, and a number that resets to a third
 * of itself every time it leaves the viewport reads as a glitch rather than as
 * an animation.
 *
 * ⚠️ REDUCED MOTION IS THE FINAL NUMBER, IMMEDIATELY. Not a faster count. A
 * counter is the one animation where the intermediate frames carry information
 * the reader might mistake for the answer, so honouring the preference means
 * skipping straight to the value.
 */
function useCountUp(target: number | null, from: number, duration: number, inView: boolean) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(() => (target == null ? 0 : from));

  useEffect(() => {
    if (target == null) return;
    if (reduce) {
      setValue(target);
      return;
    }
    if (!inView) return;
    const controls = animate(from, target, {
      duration: duration / 1000,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
      onComplete: () => setValue(target),
    });
    return () => controls.stop();
  }, [target, from, duration, inView, reduce]);

  return value;
}

function Figure({ raw, stat, inView }: { raw: string; stat: Stat; inView: boolean }) {
  const { prefix, target, suffix, grouped } = parseFigure(raw);
  const from = target == null ? 0 : Math.round(target * stat.fromFraction);
  const value = useCountUp(target, from, stat.duration, inView);

  if (target == null) return <>{raw}</>;

  const n = Math.round(value);
  const text = grouped ? n.toLocaleString("en-US") : String(n);

  return (
    <>
      {prefix}
      {/* The counting digits are hidden from assistive tech and the finished
          figure is exposed instead: a screen reader does not need three
          thousand intermediate values read out, it needs the answer. */}
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{grouped ? target.toLocaleString("en-US") : target}</span>
      {suffix}
    </>
  );
}

/* ---------------------------------------------------------------------------
   The three icons. `currentColor` throughout, 108px tall — the height of the
   reference's own icon block — drawn on one 100x100
   grid so their optical weight matches across all three cards.
   --------------------------------------------------------------------------- */

/** A signed policy — "Life Insurance Placed". */
function PolicyIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-[108px] w-[108px]" aria-hidden="true" fill="none">
      <rect
        x="20"
        y="14"
        width="60"
        height="72"
        rx="7"
        stroke="currentColor"
        strokeWidth="3.5"
        opacity="0.9"
      />
      <path
        d="M33 33h34M33 45h34"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M31 68c5-9 9 5 14-3s9 5 13-4 8 3 11-1"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A family inside a heart — "Families Helped". */
function FamilyIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-[108px] w-[108px]" aria-hidden="true" fill="none">
      <path
        d="M50 86C50 86 11 61 11 37c0-14 11-22 22-22 8 0 14 4 17 10 3-6 9-10 17-10 11 0 22 8 22 22 0 24-39 49-39 49Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <g fill="currentColor">
        <circle cx="41" cy="41" r="7" />
        <path d="M41 51c-7 0-12 4.6-12 9.6V63h24v-2.4c0-5-5-9.6-12-9.6Z" />
        <circle cx="61" cy="45" r="5.4" opacity="0.6" />
        <path d="M61 53c-5.4 0-9.2 3.5-9.2 7.4V63h18.4v-2.6c0-3.9-3.8-7.4-9.2-7.4Z" opacity="0.6" />
      </g>
    </svg>
  );
}

/** An outward burst — "Premium Sold". */
function GrowthIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-[108px] w-[108px]" aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.5">
        <path d="M50 64 27 34M50 64 40 24M50 64l10-40M50 64l23-30" />
      </g>
      <g fill="currentColor">
        <circle cx="50" cy="72" r="11" />
        <circle cx="25" cy="30" r="6" />
        <circle cx="39" cy="19" r="4.5" opacity="0.75" />
        <circle cx="61" cy="19" r="4.5" opacity="0.75" />
        <circle cx="75" cy="30" r="6" />
      </g>
    </svg>
  );
}

const ICONS = { s1: PolicyIcon, s2: FamilyIcon, s3: GrowthIcon } as const;

export default function ImpactStats() {
  const t = useTranslations("impact");
  const ref = useRef<HTMLElement>(null);
  /* -120px: the counters start when the band is properly on screen rather than
     the instant its first pixel appears, which on a 460px card would mean the
     count was half over before the reader had reached it. */
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      ref={ref}
      aria-labelledby="impact-heading"
      /* 🔴 NO BACKGROUND ON THIS SECTION. It has to be transparent for the top
         125px, because that is the part sitting over the hero photograph — a
         `bg-cream` here would paint a cream rectangle across the bottom of the
         hero and undo the whole overlap. The cream under the lower half comes
         from `body`, which already carries it.

         🔴 THE PULL IS SMALLER ON A PHONE. -125px is measured at desktop, where
         the hero's bottom padding is 240. On a 375px screen that padding clamps
         down to 96, and pulling 125 through it would put the first card on top
         of the blurb. -56 clears it and keeps the overlap visible. */
      className="font-hero relative z-10 -mt-[56px] md:-mt-[125px]"
    >
      <h2 id="impact-heading" className="sr-only">
        {t("s1l")} · {t("s2l")} · {t("s3l")}
      </h2>

      <ul className="mx-auto flex max-w-[1280px] list-none flex-col px-5 md:flex-row md:px-6 lg:px-0">
        {STATS.map((s) => {
          const Icon = ICONS[s.key];
          return (
            <li
              key={s.key}
              className={`flex flex-1 flex-col items-center justify-center px-8 py-12 text-center sm:px-[60px] md:py-[60px] ${
                s.feature
                  ? "bg-navy-soft text-cream"
                  : /* The hairline is the reference's #d8d8d8. It sets only
                       left+bottom because its three columns share edges; a
                       four-sided border on cards that touch draws the same
                       grid, and survives the cards separating on a phone. */
                    "border border-[#d8d8d8] bg-white text-ink md:my-8"
              }`}
            >
              <span className={`mb-5 inline-flex ${s.feature ? "text-cream" : "text-navy-soft"}`}>
                <Icon />
              </span>

              <p className="text-[clamp(28px,3.2vw,34px)] font-extrabold leading-[1.3] tabular-nums">
                <Figure raw={t(`${s.key}v`)} stat={s} inView={inView} />
              </p>

              {/* Optional: "Families Helped" is a plain count with no scale word,
                  and rendering an empty line under it would drop that one label
                  16px out of line with the other two. */}
              {t(`${s.key}u`) ? (
                <p
                  className={`mt-1 text-[12px] font-bold uppercase leading-[1.3] tracking-[0.4px] ${
                    s.feature ? "text-cream/80" : "text-ink/75"
                  }`}
                >
                  {t(`${s.key}u`)}
                </p>
              ) : null}

              <p className="mt-7 text-[clamp(17px,1.6vw,20px)] font-bold leading-[1.36]">
                {t(`${s.key}l`)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
