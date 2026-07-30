"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import FadeUp from "./FadeUp";
import { useWordReveal } from "./useWordReveal";

/**
 * /join §4 — "How it works", the imageless editorial rail.
 *
 * WHY IMAGELESS: the four step frames every duplicated /about's team portraits,
 * and Synergy has no distinct unused portraits — all seven are on /about. Rather
 * than repeat a face across two pages, the section carries no photographs at
 * all: type, gold-deep numerals and whitespace do the work. See HANDOFF.
 *
 * THE NUMERAL REVEAL. useWordReveal (the /about pull-quote hook) scrubs each
 * numeral from a floor to full as its row passes through. The floor is 0.78,
 * NOT the pull-quotes' 0.55: gold-deep #7D641F on cream is 5.16:1 at full and
 * 3.34:1 at 0.78 — and a numeral is a graphic, so 1.4.11's 3:1 non-text bar
 * binds it even though it is aria-hidden ornament. 0.55 would drop it to 2.2:1.
 * The reveal is subtle by that necessity. Reduced motion: static at full.
 *
 * The numeral is aria-hidden; the <h3> is the row's accessible name, so the
 * ordinal is ornament, not information a reader depends on.
 */
const NUMERALS = ["I", "II", "III", "IV"] as const;

type Step = { heading: string; body: string };

function StepRow({
  step,
  num,
  index,
  reduce,
}: {
  step: Step;
  num: string;
  index: number;
  reduce: boolean | null;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  useWordReveal(numRef, num, { reduce, floor: 0.78 });
  return (
    <li className="border-t border-ink/[0.14] first:border-t-0">
      <FadeUp index={index}>
        <div className="grid gap-3 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
          <span
            aria-hidden="true"
            ref={numRef}
            className="font-display text-[clamp(44px,5vw,76px)] font-medium leading-none tracking-[-0.02em] text-gold-deep lg:col-span-2"
          >
            {num}
          </span>
          <div className="lg:col-span-9 lg:col-start-4">
            <h3 className="sem-h3 font-display text-ink">{step.heading}</h3>
            <p className="sem-body mt-4 max-w-[60ch] text-ink">{step.body}</p>
          </div>
        </div>
      </FadeUp>
    </li>
  );
}

export default function JoinSteps({
  headingId,
  heading,
  tagline,
  steps,
}: {
  headingId: string;
  heading: string;
  tagline?: string;
  steps: Step[];
}) {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby={headingId} className="sem-shell sem-pad-y">
      <div className="sem-inner">
        <FadeUp>
          <h2 id={headingId} className="sem-h2 font-display text-ink">
            {heading}
          </h2>
          {tagline ? <p className="sem-body mt-3 text-ink/80">{tagline}</p> : null}
        </FadeUp>
        <ol className="mt-10 lg:mt-14">
          {steps.map((step, i) => (
            <StepRow
              key={i}
              step={step}
              num={NUMERALS[i] ?? String(i + 1)}
              index={i}
              reduce={reduce}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
