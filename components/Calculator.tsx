"use client";

import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { routeHref } from "@/routes";
import FadeUp from "./FadeUp";
// import LeadModal from "./LeadModal";
// 🔴 COMMENTED, NOT DELETED. LeadModal is a complete, working modal whose form
// is deliberately disabled because the GHL webhook does not exist yet. Its one
// and only trigger was this section's CTA, which now goes to /contact instead —
// a page whose phone and email actually reach someone. The component file is
// untouched; restoring is: uncomment this import, the `modalOpen` state, the
// <LeadModal> mount at the bottom of this file, and swap the <Link> back for a
// <button onClick={() => setModalOpen(true)}>. See HANDOFF.

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const IUL_RATE = 0.085;
const BANK_RATE = 0.005;

/** FV of a monthly annuity: P × ((1+r)^n − 1) / r, monthly compounding. */
function futureValue(monthly: number, annualRate: number, months: number) {
  const r = annualRate / 12;
  return monthly * ((Math.pow(1 + r, months) - 1) / r);
}

/**
 * Retirement calculator — rebuilt on beetogreen.com's "Calculate your CO2
 * impact" layout, measured live at a 1536 viewport. Their design scales from a
 * 1440 artboard (×1.0667); bracketed numbers are the 1440 design values.
 *
 *   section     padding 42.67 / 0 [40]; inner padding 0 34.13 [32]
 *   header      CENTRED, padding-bottom 32, gap 12.8
 *               h2 76.8 / 700 [72] at 51% of container; sub 19.2 / 400 [18]
 *   card        cream, padding 64 [60], radius 17.07 [16], column gap 32 [30]
 *   grid        TWO EQUAL COLUMNS — 659.213px each, gap 21.33 [20]
 *   inputs      white, padding 32, radius 21.33 [20], column gap 25.6 [24]
 *   field       column, gap 10.67, label 17.07 / 400 / lh 1.5
 *   slider row  flex, align centre, gap 17.07
 *   slider      a PLAIN native <input type=range> with accent-color and
 *               flex:1 — they use no custom track, thumb or pseudo-elements
 *   readout     to the RIGHT of the track: filled pill, radius 4.27,
 *               weight 600, min-width 74.7, padding 4.27 / 10.67, centred
 *   result      white wrapper (padding 32, radius 21.33) around a dark inner
 *               (radius 12.8 [12], padding 32 / 21.33, gap 12.8)
 *               value 117.33 / 700, unit INLINE at 59.73 / 500 (half the
 *               number), caption 19.2 / 400 underneath
 *   equivalence dark block, padding 42.67 [40], radius 21.33, gap 25.6
 *               title 25.6 / 500; THREE equal columns, gap 17.07;
 *               cards radius 12.8, padding 25.6, value 59.73 / 700,
 *               label 14.93 / 400
 *   cta         height 64, radius 12.8, 17.07 / 600
 *
 * NUMBER BEHAVIOUR — measured, not assumed. Driving their slider 200 → 4000 and
 * sampling 46 times over 1.4s, the result reached its final value by the first
 * 30ms sample and never moved again. THEY DO NOT COUNT UP. Ours matches: a
 * 150ms opacity settle on the swapped figure, no odometer, nothing to chase
 * while dragging. Instant under reduced motion.
 *
 * Their only transition anywhere in the section is a CTA underline wipe. There
 * is no entry animation and no panel hover, so ours has none either.
 *
 * Palette is ours throughout — cream, navy, gold-deep for gold text on light,
 * amber for the difference figure. The brief's dark-navy-with-gold-border
 * result card, red gap block and gold button are deliberately discarded; the
 * brief contributes only the inputs and the maths. There is no red in this
 * brand.
 *
 * ---------------------------------------------------------------------------
 * THE VERDICT SENTENCE IS UNBUILT, NOT FLAGGED. Earlier handover notes claimed
 * it sat behind `NEXT_PUBLIC_VERDICT_ENABLED` pending the client's written
 * sign-off. That is wrong and always was: grep the repo and there is no such
 * env var, no gate, and no `.env` file of any kind. What exists is the string
 * `calculator.verdict.difference` in messages/en.json and es.json, which
 * nothing reads. The verdict is therefore off because it was never built, and
 * it cannot ship by accident. When the client signs off, the feature and its
 * gate get built together — do not treat the string's presence as evidence
 * that a switch exists somewhere.
 * ---------------------------------------------------------------------------
 * SUPERSEDED LAYOUT (kept for revert, nothing deleted): a max-w-[1500px] left-
 * aligned header, a single white card with `lg:grid-cols-2` holding the sliders
 * left and a NAVY result panel right with the figure in plain gold, then a navy
 * full-width bar with three white receipt cards, then a gold pill CTA. Replaced
 * wholesale by the BeeToGreen anatomy above. Its copy keys `framingQuestion`
 * and `subhead` remain in messages/en.json, unused.
 * ---------------------------------------------------------------------------
 */

/** Figures snap to the new value with a 150ms opacity settle — no count-up, no
 *  odometer, matching BeeToGreen's measured instant settle. */
function Figure({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{value}</span>;
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.45 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

type SliderProps = {
  id: string;
  label: string;
  valueText: string;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
};

/**
 * Label above; native range + filled value pill to its right, matching their
 * slider row. The input is a real `<input type="range">`, so arrows, Home/End
 * and PageUp/PageDown come from the platform and cannot drift out of sync with
 * the visual. `aria-valuetext` carries the humanised value ("$300 per month")
 * because the raw number alone is meaningless to a screen reader here.
 */
function Slider({
  id,
  label,
  valueText,
  displayValue,
  min,
  max,
  step,
  value,
  onChange,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-[15px] leading-[1.5] text-ink">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          className="calc-slider min-w-0 flex-1"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={valueText}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ "--fill": `${pct}%` } as React.CSSProperties}
        />
        <output
          htmlFor={id}
          className="min-w-[76px] shrink-0 rounded bg-navy px-2.5 py-1 text-center font-data text-[15px] font-semibold tabular-nums text-cream"
        >
          {displayValue}
        </output>
      </div>
    </div>
  );
}

/**
 * `headingLevel` exists only because this component is now the whole of
 * /[locale]/calculator, where its section header IS the page heading and has to
 * be the h1. It defaults to 2 so the (currently commented-out) homepage
 * instance is unchanged. Nothing else about the component varies with it.
 */
export default function Calculator({
  headingLevel = 2,
}: {
  headingLevel?: 1 | 2;
} = {}) {
  const t = useTranslations("calculator");
  const locale = useLocale();
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const uid = useId();
  const [monthly, setMonthly] = useState(300);
  const [age, setAge] = useState(35);
  const [retire, setRetire] = useState(65);
  // const [modalOpen, setModalOpen] = useState(false); // see the LeadModal note above

  // Retirement age must always stay at least 5 years above current age.
  const handleAge = (v: number) => {
    setAge(v);
    if (retire < v + 5) setRetire(Math.min(v + 5, 75));
  };
  const handleRetire = (v: number) => setRetire(Math.max(v, age + 5));

  const d = useMemo(() => {
    const months = (retire - age) * 12;
    const iul = futureValue(monthly, IUL_RATE, months);
    const bank = futureValue(monthly, BANK_RATE, months);
    const principal = monthly * months;
    return { iul, bank, principal };
  }, [monthly, age, retire]);

  const shortRunway = retire - age < 15;

  const receipt = [
    { key: "putIn", value: d.principal },
    { key: "bankAdds", value: d.bank - d.principal },
    { key: "iulAdds", value: d.iul - d.principal },
  ] as const;

  return (
    <section aria-labelledby="calc-heading" className="bg-cream py-14 lg:py-20">
      <div className="mx-auto max-w-[1620px] px-5 md:px-8">
        {/* HEADER — centred, like theirs */}
        <FadeUp className="mx-auto max-w-[62ch] pb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            {t("eyebrow")}
          </p>
          <Heading
            id="calc-heading"
            className="mt-3 font-display font-medium text-[clamp(30px,4.4vw,64px)] leading-[1.05] tracking-[-0.025em] text-ink"
          >
            {t("sectionHeadline")}
          </Heading>
          <p className="mx-auto mt-4 max-w-[58ch] text-[clamp(15px,1.3vw,19px)] leading-[1.55] text-ink/75">
            {t("sectionSupport")}
          </p>
        </FadeUp>

        {/* THE CARD — cream-on-cream would vanish, so ours is greige */}
        <FadeUp index={1}>
          <div className="rounded-[16px] bg-greige p-5 sm:p-8 lg:p-12">
            {/* Two equal columns, exactly as theirs */}
            <div className="grid gap-5 lg:grid-cols-2">
              {/* INPUTS — order-2 on mobile so the result reads first */}
              <div className="order-2 rounded-[20px] bg-white p-6 sm:p-8 lg:order-1">
                <div className="flex h-full flex-col justify-center gap-6">
                  <Slider
                    id={`${uid}-monthly`}
                    label={t("monthlyLabel")}
                    displayValue={usd.format(monthly)}
                    valueText={t("monthlyValueText", {
                      value: usd.format(monthly),
                    })}
                    min={50}
                    max={2000}
                    step={25}
                    value={monthly}
                    onChange={setMonthly}
                  />
                  <Slider
                    id={`${uid}-age`}
                    label={t("ageLabel")}
                    displayValue={String(age)}
                    valueText={t("ageValueText", { value: age })}
                    min={18}
                    max={60}
                    step={1}
                    value={age}
                    onChange={handleAge}
                  />
                  <Slider
                    id={`${uid}-retire`}
                    label={t("retireLabel")}
                    displayValue={String(retire)}
                    valueText={t("retireValueText", { value: retire })}
                    min={55}
                    max={75}
                    step={1}
                    value={retire}
                    onChange={handleRetire}
                  />
                </div>
              </div>

              {/* RESULT — white wrapper around a navy inner, as theirs */}
              <div className="order-1 rounded-[20px] bg-white p-6 sm:p-8 lg:order-2">
                <div className="flex h-full flex-col justify-center rounded-[12px] bg-navy px-6 py-8 text-center">
                  <p className="font-data leading-[1.0] tabular-nums text-gold">
                    <Figure
                      value={usd.format(d.iul)}
                      className="text-[clamp(44px,7vw,112px)] font-bold"
                    />
                    {/* Unit inline at roughly half the number (theirs is
                        59.73/117.33 = 0.51; ours 0.49). whitespace-nowrap so
                        "by age 65" wraps as one block instead of orphaning
                        "by" on the end of the figure's line. */}
                    <span className="ml-2 whitespace-nowrap align-baseline text-[clamp(22px,3.4vw,56px)] font-medium">
                      {t("resultUnit", { age: retire })}
                    </span>
                  </p>
                  <p className="mt-3 text-[clamp(14px,1.3vw,19px)] text-cream/85">
                    {t("resultCaption")}
                  </p>
                </div>
              </div>
            </div>

            {/* ASSUMPTIONS + disclaimer footnote — both locked */}
            <div className="mt-6 border-t border-ink/10 pt-5">
              {/* ink/60 measured 4.27:1 on the greige card — under AA. */}
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/75">
                {t("assumptionsLabel")}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                <span className="font-medium text-ink">
                  <span className="font-data tabular-nums">
                    {t("chips.iulRate")}
                  </span>
                  <span className="ml-1.5 font-normal text-ink/70">
                    {t("chips.iulNote")}
                  </span>
                </span>
                <span className="font-medium text-ink">
                  <span className="font-data tabular-nums">
                    {t("chips.bankRate")}
                  </span>
                  <span className="ml-1.5 font-normal text-ink/70">
                    {t("chips.bankNote")}
                  </span>
                </span>
              </div>

              {/* Short-runway row — non-negotiable, stays */}
              {shortRunway && (
                <p
                  role="note"
                  className="mt-4 rounded-r border-l-2 border-amber bg-amber/[0.12] py-3 pl-4 pr-3 text-[13px] leading-relaxed text-ink"
                >
                  {t("shortRunway")}
                </p>
              )}

              <p className="mt-3 text-[12px] leading-relaxed text-ink/70">
                {t("disclaimer")}
              </p>
            </div>
          </div>
        </FadeUp>

        {/* EQUIVALENCE — their dark block with three cards. Our locked receipt
            row has exactly three items, so it drops straight in. */}
        <FadeUp index={2}>
          <div className="mt-5 rounded-[20px] bg-navy p-6 sm:p-10">
            <p className="text-center text-[clamp(17px,1.7vw,24px)] font-medium text-cream">
              {t("equivLabel")}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {receipt.map((row, i) => (
                <div
                  key={row.key}
                  className="rounded-[12px] bg-cream p-6 text-center"
                >
                  <Figure
                    value={usd.format(row.value)}
                    className={`block font-data text-[clamp(26px,3.6vw,56px)] font-bold leading-none tabular-nums ${
                      // The difference figure is the amber one — amber-deep,
                      // because the brand amber cannot carry type on cream.
                      i === 2 ? "text-amber-deep" : "text-navy"
                    }`}
                  />
                  <p className="mt-3 text-[clamp(13px,1vw,15px)] text-ink/75">
                    {t(`receipt.${row.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp index={3} className="mt-6 flex justify-center">
          {/* WAS a <button> opening LeadModal. The modal's form cannot submit
              (no webhook), so the CTA led to a dead end dressed as a form. It
              is a real <Link> to /contact now — same label, a destination that
              reaches a human. See the LeadModal note at the top of this file. */}
          <Link
            href={routeHref(locale, "contact")}
            className="inline-flex h-16 items-center justify-center rounded-[12px] bg-navy px-8 text-[17px] font-semibold text-cream transition-colors duration-300 hover:bg-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            {t("cta")}
          </Link>
        </FadeUp>
      </div>

      {/* <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        monthly={usd.format(monthly)}
        age={age}
        retire={retire}
      /> */}
    </section>
  );
}
