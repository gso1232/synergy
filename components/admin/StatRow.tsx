/**
 * The bottom stat row — mono uppercase label + dot, big value beneath.
 *
 * 🔴 DELIBERATE DIVERGENCE FROM THE REFERENCE, APPROVED. Its stat cards are
 * DETAIL-SCOPED (the four tide events of the selected station). Ours are
 * DATASET-SCOPED — total leads, active agents and so on — because that is the
 * more useful read for an admin opening the page. Recorded here so a later pass
 * does not "fix" it back toward the reference.
 *
 * Every figure is computed by the caller as a `.filter().length` over rows the
 * page ALREADY holds. This component runs no query and derives nothing; if a
 * number cannot be counted from data on the page, it does not belong here.
 */
export type Stat = { key: string; label: string; value: number };

export default function StatRow({ stats }: { stats: readonly Stat[] }) {
  return (
    <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <li key={s.key} className="rounded-lg border border-ink/15 bg-cream p-4">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/70">
            {/* Ornament: the label beside it already names the figure. */}
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep/80"
            />
            <span className="truncate">{s.label}</span>
          </p>
          <p className="mt-2 font-display text-[30px] leading-none text-ink">{s.value}</p>
        </li>
      ))}
    </ul>
  );
}
