"use client";

import { useTranslations } from "next-intl";
import { LOGO_FILE, LOGO_DIR } from "@/lib/carrierLogos";
import FadeUp from "./FadeUp";
import { APPOINTMENTS } from "./Carriers";

/**
 * Slim carrier proof band, directly under the hero.
 *
 * 🟢 2026-07-30 — NOW RENDERS THE ACTUAL CARRIER LOGOS, not wordmark text.
 * Assets are copied space-free into `public/carriers/` from the client-supplied
 * `public/Insurance Carriers Logos/`. ALL 21 confirmed appointments now render:
 * the original 12 plus the 9 formerly held-back carriers (aetna, aflac,
 * american-national, columbus-life, ethos, f&g, national-life-group,
 * royal-neighbors, united-home-life) — Ziad confirmed he is contracted with
 * every one, so the endorsement claim is now backed and they are shown. The 3
 * "-2" duplicate source files are skipped (one file per carrier).
 *
 * LAYOUT: a static, centered, WRAPPING grid — not the old infinite marquee.
 * Every logo is normalised to a common HEIGHT (40px), width auto, so varied
 * aspect ratios stay even in height rather than ragged. Greyscale on the cream
 * ground reads as one cohesive set; the marks are dark wordmarks so contrast
 * holds. No logo is stretched or upscaled: each raster's native height (min
 * 103px) exceeds 2×40px, and the SVGs are vector.
 *
 * // ─── REPLACED: the wordmark-text marquee. Kept commented for one round. ───
 * // const names = APPOINTMENTS.map((a) => ({ key: a.key, name: t(`names.${a.key}`) }));
 * // const set = (hidden) => (
 * //   <div aria-hidden={hidden || undefined} className="flex items-center gap-16 pr-16 lg:gap-20 lg:pr-20">
 * //     {names.map((c) => (
 * //       <span key={c.key} className="flex h-20 items-center whitespace-nowrap text-[22px] font-medium tracking-[0.01em] text-ink/70 lg:text-[26px]">
 * //         {c.name}
 * //       </span>
 * //     ))}
 * //   </div>
 * // );
 * // ...marquee-row / marquee-track / marquee-left with set(false)+set(true)...
 */

/* The key→file map and LOGO_DIR moved to lib/carrierLogos.ts on 2026-07-30
   so /about §2b can render the same artwork from the same source of truth.
   Nothing about this component's rendering changed. */

export default function CarrierStrip() {
  const t = useTranslations("carriers");

  const logos = APPOINTMENTS.map((a) => ({
    key: a.key,
    name: t(`names.${a.key}`),
    src: `${LOGO_DIR}/${LOGO_FILE[a.key]}`,
  }));

  return (
    <section aria-label={t("ariaLabel")} className="py-16 lg:py-20">
      <FadeUp>
        <p className="px-6 text-center text-[13px] font-medium uppercase tracking-[0.16em] text-gold-deep lg:text-[14px]">
          {t("stripKicker")}
        </p>

        {/* ─── PREVIOUS APPROACH: static wrapping grid. COMMENTED, NOT DELETED,
            so we can revert (2026-07-30). Superseded by the logo marquee below.
            It rendered 21 = 3×7 as 7 desktop / 3 tablet+mobile columns — no
            orphan row, but the 137px desktop cells shrank the widest wordmarks
            to 24–32px visible height, which the marquee fixes by never wrapping.
            Inner eslint/line comments were stripped ONLY so this stays a valid
            JSX comment (no nested close); restore them on revert.

        <ul className="carrier-logos mx-auto mt-10 grid max-w-content grid-cols-3 items-center justify-items-center gap-x-8 gap-y-9 px-6 md:px-8 lg:mt-12 lg:grid-cols-7">
          {logos.map((c) => (
            <li key={c.key} className="flex h-10 items-center justify-center">
              <img
                src={c.src}
                alt={c.name}
                decoding="async"
                className="h-10 w-auto max-w-full object-contain opacity-80 grayscale"
              />
            </li>
          ))}
        </ul>
            ──────────────────────────────────────────────────────────────── */}

        {/* ─── LOGO MARQUEE (2026-07-30) ────────────────────────────────────
            A single horizontal row of all 21 logos scrolling right-to-left at a
            constant speed — modelled on reyou.life's insurance marquee
            (`.marquee-4`), measured live: their track runs xPercent -100 over
            39.775s = 80 px/s, linear (ease `none`), infinite, seam hidden by a
            duplicate set. Ours matches the motion: 80 px/s, linear,
            right-to-left, seamless via two identical sets + translateX(-50%).

            WHY THIS SOLVES THE 21-LOGO PROBLEM: a single scrolling row never
            wraps, so there is no orphan row and no cell to narrow — every logo
            sits at a TRUE common height (40px) because width is unconstrained.

            DIVERGENCES FROM REYOU, on purpose:
              • common 40px height — reyou sizes each mark individually (32–80px)
              • greyscale on cream — reyou shows full-colour logos
              • reduced-motion → static, scrollable strip (globals.css); reyou
                does not honour prefers-reduced-motion, we do
              • pauses on hover — reyou does not; we keep it so a reader can rest
                on a mark (the marks are not links, so nothing else is lost)

            SEAM: the set renders twice inside `.marquee-track`; the keyframe
            translateX(0 → -50%) moves the track by exactly one set-width, so the
            duplicate lands where the original began — an invisible reset. The
            per-set trailing `pr-12` carries the gap across the seam so it stays
            even. The second set is `.marquee-dup` + aria-hidden: hidden from AT,
            and dropped entirely under reduced-motion (one clean set to scroll).

            SPEED: animation-duration is set inline = one set-width ÷ 80 px/s.
            Measured set width ≈ 4028px → 50s. Height-invariant (logos are always
            40px tall, track is w-max), so one duration holds at every width. */}
        <div
          role="marquee"
          aria-label={t("ariaLabel")}
          className="marquee-row mt-10 lg:mt-12"
        >
          <div
            className="marquee-track marquee-left flex w-max"
            style={{ animationDuration: "50s" }}
          >
            {[false, true].map((hidden) => (
              <ul
                key={hidden ? "dup" : "base"}
                aria-hidden={hidden || undefined}
                className={`flex shrink-0 items-center gap-12 pr-12${
                  hidden ? " marquee-dup" : ""
                }`}
              >
                {logos.map((c) => (
                  <li
                    key={c.key}
                    className="flex h-10 shrink-0 items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.src}
                      alt={c.name}
                      decoding="async"
                      // h-10 = 40px common height; width auto keeps native aspect.
                      // grayscale unifies the set on cream; no stretch/upscale.
                      className="h-10 w-auto object-contain opacity-80 grayscale"
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
