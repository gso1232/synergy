"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useTranslations } from "next-intl";
import FadeUp from "./FadeUp";

/**
 * Who We Serve — beetogreen.com's card section, re-measured live at a 1536
 * viewport. Their whole design scales linearly from a 1440 artboard (factor
 * 1.0667); the bracketed numbers below are the 1440 design values.
 *
 *   section    85.33px block padding            [80]
 *   grid       3 × 475, gap 21.33, 1467.8 wide  [3 × 445, gap 20] = 95.6% of vw
 *   card       475 × 633.4, r21.33, pad 42.67   [445 × 594, r20, pad 40]
 *   title h3   59.73 / lh 1.0 / ls -0.025em     [56]
 *   bullets    17.07 / lh 25.6, 0.6rem ::before dot at top 0.9em  [16 / 24]
 *   button     full width, h64, r12.8, w600     [60, r12]
 *   heading h2 76.8 / lh 1.0 / ls -0.03em, 71.7% of viewport, centred  [72]
 *   toggle     mt 42.67, bg #F5F0E6, h86.4, pad 7.47, radius full     [40, 7]
 *   toggle btn 19.2 / w600 / pad 21.33 42.67    [18]
 *
 * MOTION, from their authored rules:
 *   indicator  transform .5s + width .5s cubic-bezier(.645,.045,.355,1)
 *   tab labels color .4s   cubic-bezier(.645,.045,.355,1); inactive :hover .7
 *   card swap  opacity .4s + transform .4s, from { opacity 0; translateY(1rem) }
 *   buttons    base .3s cubic-bezier(.645,.045,.355,1); :active scale(.98)
 *   card hover NONE. Verified — a sweep of every stylesheet for :hover rules
 *              matching their card returns an empty set. Their only card-level
 *              hover is a CTA underline that wipes away (scaleX 1 → 0, origin
 *              flipping left→right, .7s cubic-bezier(.77,0,.175,1)).
 *
 * DELIBERATE DEVIATIONS (all flagged in the handover):
 *   - Our CTA is a filled pill, not an underlined text link, so their underline
 *     wipe has nothing to attach to. The card lift below is OURS.
 *   - Our two tabs are equal width, so the indicator's `width` transition is a
 *     no-op; only `transform` does visible work.
 *   - Sizing runs deliberately PAST theirs — see the notes on each value.
 *
 * Everything transform-based is dropped under prefers-reduced-motion, leaving
 * an instant state swap.
 */
const TABS = ["families", "agents"] as const;
type Tab = (typeof TABS)[number];
const CARDS = [1, 2, 3] as const;
const BULLETS = ["b1", "b2", "b3"] as const;

/* Colours are ours — navy, gold-deep, gold. Each card's text colour is the one
   that actually measures on that background, never plain gold on a light card. */
const SKINS = [
  {
    card: "bg-navy",
    title: "text-white",
    body: "text-white/90",
    marker: "bg-gold",
    button: "bg-cream text-navy hover:bg-white",
  },
  {
    // Marker is cream, not gold: gold-on-bronze measured 2.47:1, under the 3:1
    // non-text minimum (two neighbouring golds).
    card: "bg-gold-deep",
    title: "text-white",
    body: "text-white/90",
    marker: "bg-cream",
    button: "bg-cream text-navy hover:bg-white",
  },
  {
    card: "bg-gold",
    title: "text-navy",
    body: "text-navy/80",
    marker: "bg-navy",
    button: "bg-navy text-cream hover:bg-[#16304d]",
  },
] as const;

/** Their easing — easeInOutCubic — reused for the swap, the indicator and the
 *  buttons so the whole section shares one curve, as theirs does. */
const EASE = [0.645, 0.045, 0.355, 1] as const;
const EASE_CSS = "cubic-bezier(0.645,0.045,0.355,1)";

export default function WhoWeServe() {
  const t = useTranslations("whoWeServe");
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("families");

  // The in-view gate is read here rather than declared with `whileInView` on
  // the keyed layer. With `whileInView` on that element the viewport observer
  // unmounts along with the outgoing set, so its exit animation never completed
  // and AnimatePresence never called safeToRemove — both card sets stayed in
  // the DOM stacked in the same grid cell, forever, after the first toggle.
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { once: true, margin: "-80px" });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setTab(tab === "families" ? "agents" : "families");
    }
  };

  /* The SET crossfades as one unit — which is what BeeToGreen actually does;
     their Vue transition sits on the container, not on each card. Real
     animatable properties here are also what lets AnimatePresence resolve the
     exit: the previous version's `out` variant carried only a `transition`
     object with nothing to animate, so the exit never reported complete and
     both card sets stayed mounted in the same grid cell forever after the
     first toggle. */
  const setEnter = reduce ? { opacity: 0 } : { opacity: 0, y: 16 };
  const setShown = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
  const setHidden = reduce ? { opacity: 0 } : { opacity: 0, y: 16 };

  return (
    // Vertical rhythm pulled in throughout — see the handover for the deltas.
    <section
      aria-labelledby="who-we-serve-heading"
      // Asymmetric on purpose: the bottom is trimmed so the boundary into Why
      // Synergy lands on the same ~160px ink-to-ink rhythm as the rest of the
      // page instead of the 232px it was.
      className="bg-cream py-14 pb-10 lg:py-20 lg:pb-14"
    >
      {/* 1620 cap with slim padding puts the grid at ~97% of viewport, against
          BeeToGreen's 95.6% — the cards get the extra width. */}
      <div className="mx-auto max-w-[1620px] px-4 md:px-5">
        <FadeUp className="text-center">
          <p className="flex items-center justify-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-gold-deep"
            />
            {t("eyebrow")}
          </p>
          {/* Kufam, weight 500 — the face tops out there, never a synthetic
              bold. Runs to 92px against their 76.8, and is held to 72% of the
              container so it breaks across the same number of lines theirs
              does at 71.7%. */}
          <h2
            id="who-we-serve-heading"
            className="mx-auto mt-3 max-w-[72%] font-display font-medium text-[clamp(38px,6.2vw,92px)] leading-[0.98] tracking-[-0.03em] text-ink"
          >
            {t("heading")}
          </h2>
        </FadeUp>

        {/* Toggle — beige pill, sliding navy indicator */}
        <FadeUp className="mt-7 flex justify-center">
          <div
            role="tablist"
            aria-label={t("tablistLabel")}
            onKeyDown={onKeyDown}
            className="relative grid grid-cols-2 rounded-full bg-[#ECE9E2] p-[7px]"
          >
            <span
              aria-hidden="true"
              style={{ transitionTimingFunction: "cubic-bezier(0.645,0.045,0.355,1)" }}
              className={`absolute inset-y-[7px] left-[7px] w-[calc(50%-7px)] rounded-full bg-navy transition-transform duration-500 motion-reduce:transition-none ${
                tab === "agents" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`who-tab-${key}`}
                aria-selected={tab === key}
                aria-controls="who-panel"
                tabIndex={tab === key ? 0 : -1}
                onClick={() => setTab(key)}
                style={{ transitionTimingFunction: "cubic-bezier(0.645,0.045,0.355,1)" }}
                className={`relative z-10 h-[58px] rounded-full px-9 text-[16px] font-semibold transition-[color,opacity] duration-[400ms] motion-reduce:transition-none sm:h-[72px] sm:px-[46px] sm:text-[19px] ${
                  tab === key ? "text-gold" : "text-ink hover:opacity-70"
                }`}
              >
                {t(key === "families" ? "tabFamilies" : "tabAgents")}
              </button>
            ))}
          </div>
        </FadeUp>

        {/* Both card sets share one grid cell so the outgoing and incoming sets
            cross-fade simultaneously — BeeToGreen's own behaviour (their Vue
            transition defines enter-active AND leave-active with no `mode`).
            role/label live on the stable wrapper, not the animated layer, so
            exactly one tabpanel exists even while two sets overlap. */}
        <div
          id="who-panel"
          ref={panelRef}
          role="tabpanel"
          aria-labelledby={`who-tab-${tab}`}
          className="mt-8 grid"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={tab}
              initial={setEnter}
              animate={inView ? setShown : setHidden}
              exit={setHidden}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ gridArea: "1 / 1" }}
              // 3-up only from lg. At md the three cards came out 224px wide
              // with 36px padding — 152px of usable line length, unreadable.
              className="grid gap-5 lg:grid-cols-3"
            >
              {CARDS.map((n, i) => {
                const skin = SKINS[i];
                return (
                  <motion.div
                    key={n}
                    // Per-card stagger is OURS — theirs moves the set as one.
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                    animate={
                      inView
                        ? reduce
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0 }
                        : reduce
                          ? { opacity: 0 }
                          : { opacity: 0, y: 14 }
                    }
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                      delay: reduce ? 0 : i * 0.07,
                    }}
                    style={{ transitionTimingFunction: EASE_CSS }}
                    className={`group flex flex-col rounded-[24px] p-9 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_44px_-18px_rgba(13,27,42,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:min-h-[680px] lg:p-[46px] ${skin.card}`}
                  >
                    {/* 64px against their 59.73 */}
                    <h3
                      className={`font-display font-medium text-[clamp(32px,4.4vw,64px)] leading-[1.0] tracking-[-0.025em] ${skin.title}`}
                    >
                      {t(`${tab}.c${n}.title`)}
                    </h3>

                    <ul
                      className={`mb-8 mt-7 space-y-4 text-[17px] leading-[1.55] ${skin.body}`}
                    >
                      {BULLETS.map((b) => (
                        <li key={b} className="flex gap-3.5">
                          <span
                            aria-hidden="true"
                            className={`mt-[9px] h-[9px] w-[9px] shrink-0 rounded-full ${skin.marker}`}
                          />
                          <span>{t(`${tab}.c${n}.${b}`)}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Their button contract: .3s on the shared curve, and a
                        press state of scale(.98). */}
                    <a
                      href="#"
                      style={{ transitionTimingFunction: EASE_CSS }}
                      className={`mt-auto flex h-[66px] w-full shrink-0 items-center justify-center rounded-full text-[17px] font-semibold transition-[background-color,transform] duration-300 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 ${skin.button}`}
                    >
                      {t(`${tab}.c${n}.cta`)}
                    </a>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
