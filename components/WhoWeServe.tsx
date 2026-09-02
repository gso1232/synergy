"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { joinHref, routeHref, type RouteKey } from "@/routes";
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

/* =========================================================================
   🔴 WHERE THE SIX CARD CTAs GO. ALL SIX WERE `href="#"` AND SHIPPING.

   These are the six most prominent buttons on the homepage — 66px tall, full
   card width — and every one of them was a dead stub. The three on the AGENTS
   tab were the entire Join journey: the nav pill goes to join.fflsynergy.com,
   and the section that actually argues the case for joining sent you nowhere.

   `null` means NO DESTINATION HAS BEEN DECIDED and the card keeps its `#`.
   That is deliberate and it is not laziness: see `families.1` below. A `#` is
   listed as an open item rather than quietly repointed, because repointing a
   label at a page that does not deliver what the label promises is the same
   class of lie the stub is.
   ========================================================================= */
type CtaDest = { kind: "join" } | { kind: "route"; key: RouteKey } | null;

const CTA_DEST: Record<Tab, Record<(typeof CARDS)[number], CtaDest>> = {
  families: {
    // "Get a free quote" — RESOLVED, AND THE CLIENT'S OWN SITE RESOLVED IT.
    // Was `null` (kept as `#`) on the reasoning that there is no quote route.
    // That is still true — fflsynergy.com has no /quote of any kind — but it
    // was the wrong question. Checked live: all three "Get a Free Quote"
    // buttons on fflsynergy.com are anchors to **/contact**, and the submit
    // button on that page reads "Request My Free Quote", which is the exact
    // string our own ContactForm already ships. The client's own answer to
    // "where does this CTA go" is the contact page. See HANDOFF §4a.
    1: { kind: "route", key: "contact" },
    // "Compare my options" — /services is the comparison: seven products and
    // the comparison table.
    2: { kind: "route", key: "services" },
    // "Speak with an agent" — /contact is that page, and its phone number is
    // live even while the form is not.
    3: { kind: "route", key: "contact" },
  },
  agents: {
    // 🔴 ALL THREE GO TO join.fflsynergy.com — Synergy's own live recruiting
    // site, and the only external destination on this site. Same `target` and
    // `rel` as the header pill and the footer link, so the three surfaces
    // behave identically. "Apply to join", "Meet the team" and "See the
    // opportunity" all resolve there today; when a /join route exists these
    // become internal and nothing else about this component changes.
    1: { kind: "join" },
    2: { kind: "join" },
    3: { kind: "join" },
  },
};

/** Anchor props for a destination. The external case carries the SAME `target`
 *  and `rel` the header pill and the footer link already use — one behaviour
 *  for one destination across all three surfaces. */
function ctaProps(dest: CtaDest, locale: string) {
  if (!dest) return { href: "#" };
  if (dest.kind === "join") {
    // WAS an external target="_blank" link to join.fflsynergy.com. That
    // subdomain 404s (see JOIN_URL_EXTERNAL_DEAD in routes.ts), so this is our
    // own /join route now — and with nothing external left on this card, the
    // `target` / `rel` pair goes with it.
    return { href: joinHref(locale) };
  }
  return { href: routeHref(locale, dest.key) };
}

/* =========================================================================
   🔴 THE CARDS ARE PHOTOGRAPHS NOW. THE THREE FLAT SKINS ARE GONE.

   WAS: three flat fills — `bg-navy`, `bg-gold-deep`, `bg-gold` — each with its
   own title/body/marker/button colour triplet, because each fill needed a
   different ink to measure. That whole SKINS table is deleted. Every card is
   now one treatment: a full-bleed photograph, a bottom gradient, cream copy.
   One ink pairing instead of three is the entire point of the restyle — the
   old table existed only to survive three different backgrounds.

   REFERENCE: the Indonesia/Dubai travel cards — full image, gradient at the
   bottom, title + sub-line, a clean text action with an arrow. THE STRUCTURE IS
   THEIRS; THE COLOURS ARE NOT. Their cards are saturated tourism-brand
   gradients; ours is navy #002050 at graduated alpha, which is the same scrim
   colour the hero, /about, /join and the footer already use.

   🟡 ONE HONEST DIVERGENCE FROM THE REFERENCE, FLAGGED RATHER THAN HIDDEN.
   Their card carries a title and ONE sub-stat. Ours carries a title, THREE
   bullets and a CTA — roughly five times the text — because the copy is fixed
   and this is a visual restyle, not a copy change. So our gradient has to be
   much taller and heavier than theirs: it opens at 30% of the card rather than
   ~60%, and it reaches a higher floor alpha. That is a cost of keeping the
   copy, and it is why more of each photograph is dimmed than in the reference.

   THE CTA IS NOW A TEXT ACTION, NOT A 66px FILLED PILL. That is the
   reference's "Explore Now ->" and it is what makes the card read as clean
   rather than as a poster with a button stapled to it. It is still a real
   <a> with a real href, still the only interactive thing in the card (the card
   itself is NOT a link — that would bury three destinations under one target),
   and its hit area is still 44px tall.
   ========================================================================= */

/**
 * The six photographs, one per card, keyed exactly as the copy is.
 *
 * 🔴 EVERY ONE WAS CHOSEN BY OPENING THE FILE AND LOOKING AT IT, NOT BY
 * TRUSTING A TITLE. Two candidates were rejected at exactly that step and the
 * rejections are recorded in CREDITS.md, because both are the trap: Pexels
 * `7414038` is titled "Office Team Sitting at the Table" and shows a team in a
 * DOMESTIC KITCHEN (gas hob, microwave, fridge in frame); Pexels `8117435`
 * ("Colleagues having a Discussion") carries a whiteboard in CYRILLIC and a
 * sticker-covered laptop, i.e. third-party branding in frame, which Standing
 * Rule 9 disqualifies outright.
 *
 * `alt` is descriptive of the FILE and is authored under Rule 5's standing
 * exception for image alt text.
 */
const CARD_IMAGES: Record<Tab, Record<(typeof CARDS)[number], { src: string; alt: string }>> = {
  families: {
    1: {
      src: "/synergy/who-families-advice-agent-documents.jpg",
      alt: "An advisor sitting with an older couple, talking them through an application form before anything is signed.",
    },
    2: {
      src: "/synergy/who-families-carriers-comparing-papers.jpg",
      alt: "Two sets of hands comparing printed policy documents side by side on a desk.",
    },
    3: {
      src: "/synergy/who-families-itin-mother-children.jpg",
      alt: "A mother outdoors in late afternoon light with her two young children.",
    },
  },
  agents: {
    1: {
      src: "/synergy/who-agents-training-briefing.jpg",
      alt: "An experienced agent standing at the front of a training room, talking to colleagues seated at the table.",
    },
    2: {
      src: "/synergy/who-agents-office-team-session.jpg",
      alt: "A team around a table in a working session, listening to a colleague at a flip chart.",
    },
    3: {
      src: "/synergy/who-agents-contract-signing.jpg",
      alt: "A close-up of a contract on a desk, one hand pointing to the signature line while another signs it.",
    },
  },
};

/** Their easing — easeInOutCubic — reused for the swap, the indicator and the
 *  buttons so the whole section shares one curve, as theirs does. */
const EASE = [0.645, 0.045, 0.355, 1] as const;
const EASE_CSS = "cubic-bezier(0.645,0.045,0.355,1)";

export default function WhoWeServe() {
  const t = useTranslations("whoWeServe");
  const reduce = useReducedMotion();
  const locale = useLocale();
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
      className="py-14 pb-10 lg:py-20 lg:pb-14"
    >
      {/* 1620 cap with slim padding puts the grid at ~97% of viewport, against
          BeeToGreen's 95.6% — the cards get the extra width. */}
      <div className="mx-auto max-w-[1620px] px-4 md:px-5">
        {/* 🔴 THE BIG HEADING WAS REMOVED ON INSTRUCTION (2026-08-02). The block
            is now just the eyebrow and the tabs beneath it — no headline.

            WAS: an h2 "Built for the people the system kept overlooking." at
            `clamp(28px,3.05vw,47px)`, id `who-we-serve-heading`. It is gone, not
            hidden: the `heading` string stays in both message files unrendered
            (nothing is deleted from the catalogue), and its measurement notes are
            preserved in git if the headline is ever wanted back.

            🔴 THE SECTION'S ACCESSIBLE NAME MOVED WITH IT. `aria-labelledby` on
            the <section> pointed at the removed h2's id, which would now be a
            dangling reference naming the section nothing. The eyebrow carries
            the id instead — it is the only heading-like text left and it reads
            "Who we're here for", a perfectly good section label. */}
        <FadeUp className="text-center">
          <p
            id="who-we-serve-heading"
            className="flex items-center justify-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-deep"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-gold-deep"
            />
            {t("eyebrow")}
          </p>
        </FadeUp>

        {/* Toggle — beige pill, sliding navy indicator.
            mt-5, tightened from the mt-7 it used when a headline sat above: with
            the heading gone the tabs follow the eyebrow directly, so the gap is
            closed to an eyebrow-to-control rhythm rather than the eyebrow-to-
            heading one it was. */}
        <FadeUp className="mt-5 flex justify-center">
          <div
            role="tablist"
            aria-label={t("tablistLabel")}
            onKeyDown={onKeyDown}
            /* The tab rail was grey #ECE9E2. "Please do not use gray backgrounds":
               it is a 7% tint of the brand blue now, which still reads as a
               track behind the moving pill without introducing a grey. */
            className="relative grid grid-cols-2 rounded-full bg-royal/[0.07] p-[7px]"
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
                const img = CARD_IMAGES[tab][n];
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
                    /* `isolate` so the scrim's stacking context is the card,
                       not the grid. The min-heights are MEASURED, not chosen:
                       they are what keeps the crop aspect inside what a single
                       1600x1600 source can serve sharp at 2x — see the note on
                       `.who-card-scrim` in globals.css. */
                    className="group relative isolate flex min-h-[460px] flex-col justify-end overflow-hidden rounded-[24px] p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_1px_2px_rgba(0,32,80,0.05),0_10px_24px_-16px_rgba(0,32,80,0.20)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:min-h-[560px] lg:min-h-[680px] lg:p-[38px]"
                  >
                    {/* THE PHOTOGRAPH.
                        🔴 `sizes` DECLARES THE CARD'S LARGER SIDE, NOT ITS
                        WIDTH, AND THAT IS A BUG FIX. It first shipped as the
                        measured WIDTHS — `480px` at lg+, `100vw` below md —
                        which is what `sizes` normally means. It is wrong here:
                        the source is SQUARE and the card is TALLER than it is
                        wide at two of the three breakpoints, so `object-cover`
                        scales the image to fill the HEIGHT and the width is
                        along for the ride. Measured on the built page at 1536:
                        the browser picked a **480x480** candidate for a
                        480x680 box, i.e. the square was being stretched 1.42x
                        vertically — an upscale, silently, on the widest layout.

                        Declaring the binding side instead:

                          lg+      card 480 x 680  -> declare 680px
                          md-lg    card 712 x 560  -> declare 720px
                          < md     card 358 x 460  -> declare 460px

                        `object-center` on a square source is verified by
                        RENDERING at 1536 / 768 / 390 — the only way to know a
                        face survives both the 0.71 portrait crop and the 1.27
                        one below lg. Two candidates were dropped at exactly
                        that step; see CREDITS. */}
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 1024px) 680px, (min-width: 768px) 720px, 460px"
                      quality={78}
                      className="absolute inset-0 -z-20 object-cover object-center"
                    />
                    <div
                      aria-hidden="true"
                      className="who-card-scrim absolute inset-0 -z-10"
                    />

                    {/* 46px, down from the old 64px. The type had to come down
                        once it sat on a photograph rather than on a flat fill:
                        at 64px a three-line title plus three bullets plus the
                        action needed a scrim so tall the image stopped
                        reading. */}
                    <h3 className="font-display font-semibold text-[clamp(30px,3.2vw,46px)] leading-[1.02] tracking-[-0.025em] text-cream">
                      {t(`${tab}.c${n}.title`)}
                    </h3>

                    <ul className="mb-7 mt-5 space-y-3 text-[16px] leading-[1.5] text-cream">
                      {BULLETS.map((b) => (
                        <li key={b} className="flex gap-3">
                          {/* Gold-pale, not gold: on the scrim's darkest floor
                              gold #D4A017 is legal, but these dots also sit
                              over the LIGHTEST composited pixel measured in the
                              copy band, where gold drops under 3:1. gold-pale
                              clears at both ends. */}
                          <span
                            aria-hidden="true"
                            className="mt-[8px] h-[7px] w-[7px] shrink-0 rounded-full bg-gold-pale"
                          />
                          <span>{t(`${tab}.c${n}.${b}`)}</span>
                        </li>
                      ))}
                    </ul>

                    {/* THE ACTION — the reference's "Explore Now ->", in our
                        tokens. Was a 66px full-width filled pill.
                        - Still a real <a> with a real href (see CTA_DEST); the
                          CARD is deliberately not a link, so there is exactly
                          one target and one accessible name per card.
                        - `min-h-[44px]` keeps the pointer/touch target at the
                          2.5.8 minimum even though the text is 17px.
                        - The rule under it is drawn with a pseudo-element that
                          wipes on hover (`.who-card-cta`), which is the one
                          hover the reference section actually has.
                        - The focus ring comes from the global :focus-visible
                          rule; `--focus-ring` is set to gold-pale on this card
                          because the ring lands on the PHOTOGRAPH, not on a
                          known flat fill. */}
                    <a
                      {...ctaProps(CTA_DEST[tab][n], locale)}
                      style={{ transitionTimingFunction: EASE_CSS }}
                      className="who-card-cta mt-auto inline-flex min-h-[44px] w-fit items-center gap-2.5 text-[17px] font-semibold text-cream"
                    >
                      {t(`${tab}.c${n}.cta`)}
                      <span aria-hidden="true" className="who-card-arrow">
                        &rarr;
                      </span>
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
