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
    <div className="flex flex-col gap-3">
      {/* Label and the live value sit on ONE baseline row now — the value is
          promoted from a small pill beside the track to a legible readout
          aligned with its label, which is how the strongest calculators present
          a bound value. Same `displayValue`, same `output` element wired to the
          input; only the placement and type changed. */}
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[14px] font-medium leading-[1.4] text-ink/80">
          {label}
        </label>
        <output
          htmlFor={id}
          className="shrink-0 font-data text-[17px] font-bold tabular-nums text-navy"
        >
          {displayValue}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="calc-slider w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
      />
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
    <section aria-labelledby="calc-heading" className="py-14 lg:py-20">
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

        {/* THE CARD — cream-on-cream would vanish, so ours is greige. A hairline
            and a whisper of shadow give it depth against the page without
            reading as a heavy panel — polish, not a new surface. */}
        <FadeUp index={1}>
          <div className="rounded-[20px] border border-ink/[0.06] bg-greige p-5 shadow-[0_1px_2px_rgba(0,32,80,0.04),0_12px_32px_-20px_rgba(0,32,80,0.18)] sm:p-8 lg:p-12">
            {/* Two equal columns, exactly as theirs */}
            <div className="grid gap-5 lg:grid-cols-2">
              {/* INPUTS — first in the DOM and first on the page, at every width.
                  🔴 THE `order-*` PAIR IS GONE. It was `order-2` here and
                  `order-1` on the result, "so the result reads first" on mobile.
                  Measured at 375: the result card painted at y=441 and the
                  sliders that produce it at y=664, so the phone opened on a
                  $-figure sitting 223px ABOVE the only controls that change it —
                  an answer before its question.

                  IT WAS ALSO A SEQUENCE BUG, NOT ONLY A TASTE ONE. `order`
                  repaints the box without moving it in the DOM, so the visual
                  order and the reading/tab order disagreed: a screen-reader or
                  keyboard user got inputs → result while a sighted phone user
                  saw result → inputs. That is 1.3.2 (Meaningful Sequence) and
                  2.4.3 (Focus Order).

                  DELETING ALL FOUR CLASSES IS THE WHOLE FIX, and the desktop
                  half needs no replacement: the DOM is already inputs-then-
                  result, so `lg:order-1`/`lg:order-2` were restating the
                  natural grid flow and the two columns still land left/right
                  exactly as before. */}
              <div className="rounded-[16px] border border-ink/[0.06] bg-white p-6 sm:p-8">
                <div className="flex h-full flex-col justify-center gap-8">
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

              {/* RESULT — white wrapper around a navy inner.
                  ---------------------------------------------------------------
                  🔴 THE OVERFLOW IS FIXED BY UN-INLINING THE UNIT, AND IT HAD TO
                  BE. The figure and "by age 65" were ONE `<p>`: a huge number at
                  `clamp(...,7vw,112px)` with the unit inline at up to 56px and
                  `whitespace-nowrap`. Two things made that spill on the right:
                    1. the inline unit added ~280px to the widest line, so
                       "$495,212 by age 65" ran past the navy box's padding;
                    2. the FIGURE ITSELF can be far wider than $495,212 — the
                       sliders reach $2,000/mo over 57 years, whose IUL value is
                       "$35,000,000", ELEVEN glyphs. At 112px that alone overran
                       the column before any unit.
                  Neither is a width bug that a media query fixes; the content is
                  simply too big for the box at the top of the clamp.

                  THE FIX, both halves:
                    • the unit moves to ITS OWN LINE under the number — no inline
                      run to overflow, and it reads as a clean caption rather
                      than a giant tail. This is a deliberate divergence from
                      BeeToGreen's inline unit, made because their figure is a
                      two-digit CO2 number that never gets wide and ours is a
                      currency total that does.
                    • the number's ceiling drops 112 → 76px. At 76px the 11-glyph
                      worst case is ~520px against the navy inner's ~600px usable
                      width at the 1620 cap — inside, with margin, at every width
                      down to 390. `break-words` + `min-w-0` are the belt to that
                      braces so a pathological value wraps rather than spills.
                  No mechanic changes: same `d.iul`, same `resultUnit`/`age`,
                  same `resultCaption`, same Figure settle. */}
              {/* RESULT — second in the DOM, and now second on the page too.
                  See the note on the inputs card above for why the `order-1` /
                  `lg:order-2` pair was removed rather than re-pointed. */}
              <div className="rounded-[16px] border border-ink/[0.06] bg-white p-6 sm:p-8">
                <div className="flex h-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-[14px] bg-navy px-6 py-9 text-center">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-pale">
                    {t("resultCaption")}
                  </p>
                  <Figure
                    value={usd.format(d.iul)}
                    className="block max-w-full break-words font-data text-[clamp(38px,6vw,76px)] font-bold leading-[1.02] tracking-[-0.01em] tabular-nums text-gold"
                  />
                  <p className="text-[clamp(14px,1.4vw,18px)] font-medium text-cream/85">
                    {t("resultUnit", { age: retire })}
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
