"use client";

import { useTranslations } from "next-intl";
import FadeUp from "./FadeUp";
import { APPOINTMENTS } from "./Carriers";

/**
 * Slim carrier proof band, directly under the hero — fflsynergy.com treatment
 * (their under-hero band: ~48px vertical padding, quiet small type, no headline
 * ceremony). One marquee row of the 12 appointed carriers; wordmark text
 * fallback until logo assets arrive (drop SVGs into public/carriers/ and set
 * `src` on the stashed APPOINTMENTS array in Carriers.tsx).
 *
 * Marquee CSS (globals.css) is transform-only and pauses/statics under
 * prefers-reduced-motion.
 */
export default function CarrierStrip() {
  const t = useTranslations("carriers");

  const names = APPOINTMENTS.map((a) => ({
    key: a.key,
    name: t(`names.${a.key}`),
  }));

  // One track = two identical copies; -50% is the invisible loop reset.
  // Each name sits in an 80px-tall slot — reyou's marquee row height, so the
  // wordmarks occupy the space their logo assets eventually will.
  const set = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex items-center gap-16 pr-16 lg:gap-20 lg:pr-20"
    >
      {names.map((c) => (
        <span
          key={c.key}
          className="flex h-20 items-center whitespace-nowrap text-[22px] font-medium tracking-[0.01em] text-ink/70 lg:text-[26px]"
        >
          {c.name}
        </span>
      ))}
    </div>
  );

  return (
    <section aria-label={t("ariaLabel")} className="bg-cream py-16 lg:py-20">
      <FadeUp>
        <p className="px-6 text-center text-[13px] font-medium uppercase tracking-[0.16em] text-gold-deep lg:text-[14px]">
          {t("stripKicker")}
        </p>
        <div role="marquee" aria-label={t("ariaLabel")} className="mt-10 lg:mt-12">
          <div className="marquee-row overflow-hidden">
            <div className="marquee-track marquee-left flex w-max">
              {set(false)}
              {set(true)}
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
