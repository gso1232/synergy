import type { ReactNode } from "react";

/**
 * The progression rail — the honest stand-in for the reference card's chart.
 *
 * 🔴 IT SHOWS POSITION ON A SCALE, NOT A COMPLETED JOURNEY, AND THE DIFFERENCE
 * IS NOT COSMETIC. We store ONE value per record (`leads.status`,
 * `agents.stage`) and no history table — there is no `status_changed_at`, no
 * audit trail, nothing that records whether a closed lead was ever contacted.
 * So a rail that filled every earlier step as "done" would be asserting events
 * we have no evidence for. It does not. Steps before the current one render as
 * PASSED POSITION (a hairline outline, no fill), only the current step is
 * filled, and the connector is drawn to the current step only. The legend says
 * so in words too, so the visual is not the only thing carrying the caveat.
 *
 * AWKWARD CASES, ALL HANDLED EXPLICITLY — none of them assume a clean march:
 *   - a lead at `closed` that never passed through `contacted`/`qualified`:
 *     renders at step 4 with steps 1-3 as outlines, NOT as completed ticks.
 *   - an agent stalled at `meet` for months: renders at step 2. There is no
 *     "stalled" styling because we have no timestamps to justify one — inventing
 *     an "overdue" state would be fabricating a judgement.
 *   - a value that is not in the sequence at all (null, or an enum extended in
 *     the database before this array is updated): `index` is -1, so NO step is
 *     filled, the connector is empty, and the raw value is printed in an
 *     "unrecognised" chip. It fails visible rather than silently rendering
 *     step 1, which would misreport the record.
 */
export type RailStep = { key: string; label: string };

export default function ProgressRail({
  steps,
  current,
  legend,
  unknownLabel,
}: {
  steps: readonly RailStep[];
  /** The record's actual stored value. May be null or off-sequence. */
  current: string | null | undefined;
  /** Wording that states this is position, not history. */
  legend: string;
  /** Shown with the raw value when `current` is not in `steps`. */
  unknownLabel: string;
}): ReactNode {
  const index = current ? steps.findIndex((s) => s.key === current) : -1;
  const unrecognised = index === -1;

  return (
    <div>
      <ol className="flex items-stretch gap-1.5">
        {steps.map((s, i) => {
          const isCurrent = i === index;
          const isPassed = index > -1 && i < index;
          return (
            <li key={s.key} className="min-w-0 flex-1">
              {/* The bar. THREE STATES, ALL CLEARING 3:1, AND NOT SEPARATED BY
                  COLOUR ALONE — an earlier build used ink/15 for the inert bar
                  (1.36:1) and leaned on a decorative exemption for it. Raising
                  it to ink/50 (3.27:1) put it a hair from `passed`
                  (gold-deep/80, 3.48:1), which would have left those two
                  distinguished only by hue — a 1.4.1 failure in place of a
                  1.4.11 one. So the inert state is also THINNER: weight carries
                  the difference, colour merely reinforces it, and the step label
                  beneath shifts ink/70 -> ink as a third, textual cue.
                    current  navy      15.87:1  full height
                    passed   gold/80    3.48:1  full height
                    inert    ink/50     3.27:1  half height */}
              <span aria-hidden="true" className="flex h-1.5 items-center">
                <span
                  className={`w-full rounded-full ${
                    isCurrent
                      ? "h-1.5 bg-navy"
                      : isPassed
                        ? "h-1.5 bg-gold-deep/80"
                        : "h-[3px] bg-ink/50"
                  }`}
                />
              </span>
              <span
                className={`mt-2 block truncate font-mono text-[10px] uppercase tracking-[0.14em] ${
                  isCurrent ? "text-ink" : "text-ink/70"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {unrecognised ? (
        <p
          role="status"
          className="mt-3 inline-block rounded border border-[#8A2A1A]/40 bg-[#FBEBE7] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7A2416]"
        >
          {unknownLabel}
          {current ? `: ${current}` : ""}
        </p>
      ) : (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/70">
          {legend}
        </p>
      )}
    </div>
  );
}
