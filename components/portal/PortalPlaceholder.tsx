/**
 * A MARKED GAP — a detail Synergy still owes, drawn so it cannot be read as an
 * instruction.
 *
 * =============================================================================
 * 🔴 WHY THIS EXISTS INSTEAD OF PLAUSIBLE FILLER.
 *
 * The four agent pages this portal was rewritten from belong to another agency.
 * Their admin email, phone, office hours, bootcamp and PDFs were all stripped,
 * and every one leaves a hole in a procedural instruction: "email your documents
 * to …" is useless without an address. The tempting fix is to invent something
 * reasonable — an `agents@fflsynergy.com` nobody monitors — and that is the
 * failure mode. Invented operational detail is indistinguishable from real
 * operational detail once it is on the page, and the first person to discover it
 * is wrong is an agent whose documents went nowhere.
 *
 * =============================================================================
 * 🔴 TWO MEASURED DEFECTS IN THE PREVIOUS VERSION, BOTH FIXED HERE.
 *
 * 1. THE DASHED BORDER FAILED 1.4.11. `border-gold/50` on navy composited to
 *    #6B623B against #0D1B2A — **2.83:1**, under the 3:1 a boundary owes. It was
 *    reported last round as "3.8:1" from hand arithmetic that never touched a
 *    rendered pixel. The audit harness measures the composite; the hand sum did
 *    not. It is now solid `gold-deep` on cream, measured 5.16:1.
 *
 * 2. IT HAD NO MEASURE CAP. Sitting outside a step's 32em column, the body ran
 *    the full 1002px content width — **138 characters per line at 1536**, the
 *    longest text on the page by a wide margin, on the one block that most needs
 *    to be skimmed. Capped at 32em, the same as step body copy.
 *
 * =============================================================================
 * 🔴 IT HAS TO READ AS INCOMPLETE, NOT AS CONTENT. Seven of these ship. Four
 * signals, none of them subtle, and none of them colour alone:
 *
 *   · a dashed rule, against solid rules everywhere else on the page
 *   · a hatched wash — repeating-linear-gradient, the universal "nothing here yet"
 *   · a chip reading "NEEDS SYNERGY DETAIL", not a neutral label
 *   · the body in italic, which no real instruction on this page uses
 *
 * 🔴 `role="note"`, NOT `role="alert"`. Nothing has gone wrong; this is an aside
 * about the page's own completeness. An alert would interrupt whatever the
 * reader was doing, for something that is not urgent to them at all.
 */
export default function PortalPlaceholder({
  label,
  note,
  children,
}: {
  /** The standing "Needs Synergy detail" chip text. */
  label: string;
  /** The standing "this is a marked gap" reassurance. */
  note: string;
  /** What specifically is needed, in a sentence. */
  children: React.ReactNode;
}) {
  return (
    <div
      role="note"
      className="mt-3 max-w-[32em] rounded-lg border border-dashed border-gold-deep px-4 py-3.5"
      /* Hatching, not a flat tint: a flat tint reads as an aside, stripes read
         as unfinished. 6% gold is a wash — nothing is read off it, so it carries
         no contrast obligation of its own. */
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(125,100,31,0.06) 0 6px, rgba(125,100,31,0) 6px 12px)",
      }}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-gold-deep">
        <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0 fill-current">
          <path d="M6 0.5 11.5 10.5H0.5L6 0.5Zm0 3.6a.6.6 0 0 0-.6.65l.2 2.4a.4.4 0 0 0 .8 0l.2-2.4A.6.6 0 0 0 6 4.1Zm0 4.2a.65.65 0 1 0 0 1.3.65.65 0 0 0 0-1.3Z" />
        </svg>
        {label}
      </p>
      <p className="mt-1.5 text-[14px] italic leading-[1.55] text-ink/75">{children}</p>
      <p className="mt-1 text-[13px] leading-[1.45] text-ink/70">{note}</p>
    </div>
  );
}
