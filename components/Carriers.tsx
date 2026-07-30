"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import FadeUp from "./FadeUp";

type Carrier = {
  /** Stable id — the messages key under carriers.names / carriers.ratings */
  id: string;
  name: string;
  /** Logo asset, preferred white/reversed SVG supplied by the client. */
  src?: string;
  /**
   * Single-color marks only: applies brightness(0) at 0.85 opacity so the mark
   * renders dark on the light surface. WRONG for multi-color marks (Corebridge,
   * American National) — those must ship as supplied assets tuned for a light
   * background. Never render a raw colored logo that fails contrast on white.
   */
  invert?: boolean;
  /** Per-carrier AM Best claim, verified before it ships. Absent = no claim. */
  rating?: string;
};

/**
 * Confirmed appointments. Only carriers in this list render.
 *
 * LOGO SLOTS — asset convention: public/carriers/<kebab-case-name>.svg
 * (suggested filename in each entry's comment). Dropping the file into
 * public/carriers/ is step 1; step 2 is uncommenting/setting `src` on that
 * entry — one line, no logic changes. Add `invert: true` ONLY for a
 * single-color dark-on-light mark; multi-color marks must be supplied
 * already white/reversed.
 */
export const APPOINTMENTS: ReadonlyArray<{
  key: string;
  src?: string;
  invert?: boolean;
}> = [
  { key: "c1" }, // Mutual of Omaha      → /carriers/mutual-of-omaha.svg
  { key: "c2" }, // Transamerica         → /carriers/transamerica.svg
  { key: "c3" }, // Americo              → /carriers/americo.svg
  { key: "c4" }, // American Amicable    → /carriers/american-amicable.svg
  { key: "c5" }, // North American       → /carriers/north-american.svg
  { key: "c6" }, // Global Atlantic      → /carriers/global-atlantic.svg
  { key: "c7" }, // Athene               → /carriers/athene.svg
  { key: "c8" }, // Corebridge           → /carriers/corebridge.svg (multi-color: never invert)
  { key: "c9" }, // Lincoln Financial    → /carriers/lincoln-financial.svg
  { key: "c10" }, // Nassau              → /carriers/nassau.svg
  { key: "c11" }, // Foresters           → /carriers/foresters.svg
  { key: "c12" }, // Liberty Bankers     → /carriers/liberty-bankers.svg
  // 2026-07-30 — the 9 formerly held-back carriers. Ziad confirmed he is
  // contracted with all of them, so they are now confirmed appointments and
  // render in CarrierStrip. (The 3 "-2" duplicate source files are skipped;
  // one file per carrier.)
  { key: "c13" }, // Aetna               → /carriers/aetna.svg
  { key: "c14" }, // Aflac               → /carriers/aflac.png
  { key: "c15" }, // American National    → /carriers/american-national.svg
  { key: "c16" }, // Columbus Life       → /carriers/columbus-life.svg
  { key: "c17" }, // Ethos               → /carriers/ethos.svg
  { key: "c18" }, // F&G                 → /carriers/fg.svg
  { key: "c19" }, // National Life Group → /carriers/national-life-group.png
  { key: "c20" }, // Royal Neighbors     → /carriers/royal-neighbors.svg
  { key: "c21" }, // United Home Life    → /carriers/united-home-life.svg
];

function CarrierMark({ carrier }: { carrier: Carrier }) {
  return (
    <span className="flex h-[56px] shrink-0 flex-col items-center justify-center gap-1">
      {carrier.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={carrier.src}
          alt={carrier.name}
          className={`max-h-10 max-w-[120px] object-contain ${
            carrier.invert ? "opacity-[0.85] brightness-0" : ""
          }`}
        />
      ) : (
        // Text fallback beats a broken image
        <span className="whitespace-nowrap text-[16px] font-medium tracking-[0.02em] text-ink/80">
          {carrier.name}
        </span>
      )}
      {carrier.rating && (
        <span className="whitespace-nowrap text-[11px] font-normal text-ink/60">
          {carrier.rating}
        </span>
      )}
    </span>
  );
}

function MarqueeRow({
  carriers,
  direction,
}: {
  carriers: Carrier[];
  direction: "left" | "right";
}) {
  // The set renders twice inside one track; translateX(-50%) lands exactly
  // one set-width in, so the loop reset is invisible. The gap lives INSIDE
  // each copy (gap + trailing padding) — a bare flex gap on the track puts
  // the seam half a gap off.
  const set = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex items-center gap-12 pr-12"
    >
      {carriers.map((c) => (
        <CarrierMark key={c.id} carrier={c} />
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8 }}
      className="marquee-row overflow-hidden"
    >
      <div
        className={`marquee-track flex w-max ${
          direction === "left" ? "marquee-left" : "marquee-right"
        }`}
      >
        {set(false)}
        {set(true)}
      </div>
    </motion.div>
  );
}

export default function Carriers() {
  const t = useTranslations("carriers");

  const carriers: Carrier[] = APPOINTMENTS.map((a) => {
    const rating = t(`ratings.${a.key}`);
    return {
      id: a.key,
      name: t(`names.${a.key}`),
      src: a.src,
      invert: a.invert,
      rating: rating || undefined,
    };
  });

  const count = carriers.length;

  return (
    // STASHED (not rendered) — the full carriers section with headline + intro.
    // Replaced on the page by CarrierStrip (slim ffl-style band under the hero);
    // texture/greige removed when the site moved to one flat cream background.
    <section
      aria-labelledby="carriers-heading"
      className="relative overflow-hidden bg-cream py-14 lg:py-[72px]"
    >
      <FadeUp className="relative z-10 mx-auto max-w-[60ch] px-6 text-center md:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gold-deep">
          {t("eyebrow")}
        </p>
        <h2
          id="carriers-heading"
          className="mt-3 font-display font-medium text-[clamp(28px,3.4vw,44px)] leading-[1.06] tracking-[-0.02em] text-ink"
        >
          {t("headline")}
        </h2>
        <p className="mx-auto mt-4 max-w-[640px] text-[16px] font-normal leading-[1.65] text-ink/70">
          {/* One string, unconditionally. The old `count >= 15` branch used
              `subheadWithCount`, which was unreachable (there are 12 carriers)
              AND carried an "A-rated" claim — banned, and readable in
              view-source on every route because next-intl serialises the whole
              catalogue. Key and branch both deleted. */}
          {t("subhead")}
        </p>
      </FadeUp>

      {count < 8 ? (
        // A short marquee reads as padding — static centered grid instead
        <FadeUp className="relative z-10 mx-auto mt-10 flex max-w-content flex-wrap items-center justify-center gap-x-12 gap-y-8 px-6 md:px-8">
          {carriers.map((c) => (
            <CarrierMark key={c.id} carrier={c} />
          ))}
        </FadeUp>
      ) : (
        // One row, all 12 marks, scrolling right-to-left.
        <div
          role="marquee"
          aria-label={t("ariaLabel")}
          className="relative z-10 mt-10"
        >
          <MarqueeRow carriers={carriers} direction="left" />
        </div>
      )}
    </section>
  );
}
