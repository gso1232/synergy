/**
 * A MARKED GAP — a detail Synergy still owes, rendered so it cannot be mistaken
 * for finished copy.
 *
 * =============================================================================
 * 🔴 WHY THIS EXISTS INSTEAD OF PLAUSIBLE FILLER.
 *
 * The four agent pages this portal was rewritten from belong to another agency.
 * Their admin email, their phone number, their office hours, their bootcamp and
 * their PDFs were all stripped, and every one of them leaves a hole in a
 * procedural instruction: "email your documents to …" is useless without an
 * address. The tempting fix is to invent something reasonable — an
 * `agents@fflsynergy.com` that nobody monitors, a plausible 9-to-5 — and that
 * is exactly the failure mode. Invented operational detail is indistinguishable
 * from real operational detail once it is on the page, and the first person to
 * find out it is wrong is an agent whose documents went nowhere.
 *
 * So the hole is drawn as a hole: dashed rule, mono label, and a sentence
 * saying what is missing. It survives review because it is visibly unfinished.
 *
 * 🔴 IT IS `role="note"`, NOT `role="alert"`. Nothing has gone wrong; this is an
 * aside about the page's own completeness. An alert would announce itself over
 * whatever the reader was doing, for content that is not urgent to them at all.
 *
 * §AA — dashed `gold/50` on navy is a boundary, so WCAG 1.4.11's 3:1 applies:
 * gold #C9A84C over navy #0D1B2A is 7.61:1 at full and 3.8:1 at 50%. The label
 * is full `gold` (7.61:1) and the body is `cream/80` (~9.9:1).
 */
export default function PortalPlaceholder({
  label,
  note,
  children,
}: {
  /** The standing "Awaiting Synergy detail" chip text. */
  label: string;
  /** The standing "this is a marked gap" reassurance. */
  note: string;
  /** What specifically is needed, in a sentence. */
  children: React.ReactNode;
}) {
  return (
    <div
      role="note"
      className="mt-4 rounded-lg border border-dashed border-gold/50 bg-gold/[0.07] px-4 py-3.5"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
        {label}
      </p>
      <p className="mt-2 text-[14px] leading-[1.6] text-cream/80">{children}</p>
      <p className="mt-1.5 text-[13px] leading-[1.5] text-cream/55">{note}</p>
    </div>
  );
}
