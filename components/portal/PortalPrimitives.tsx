import Link from "next/link";

/**
 * The small shared parts of the agent portal: section wrapper, numbered step,
 * external link, and the two list treatments the checklists need.
 *
 * =============================================================================
 * 🔴 THE MARKETING `.sem-*` SCALE IS DELIBERATELY NOT USED HERE.
 *
 * `.sem-h2` is 45.77px and `.sem-body` is 17.16px at line-height 1.8 — a scale
 * built for a page someone scrolls past once, at speed, to be persuaded. This
 * portal is the opposite: a reference document an agent works through with a
 * browser tab open beside it, returning to step six three days later. It is
 * closer in kind to the admin dashboard than to the homepage, and it takes a
 * working scale to match — roughly 15px body, headings that separate sections
 * without dominating them.
 *
 * Using the marketing scale would have made a nine-step checklist about four
 * screens longer with no gain in legibility.
 *
 * =============================================================================
 * §AA — everything here sits on `navy #0D1B2A` (L 0.0104), so the ratios are
 * fixed and worth stating once:
 *
 *   cream      #F8F4EE   15.87:1
 *   gold-pale  #EFE1B0   13.31:1
 *   gold       #C9A84C    7.61:1
 *   cream/80             ~ 9.9:1
 *   cream/70             ~ 8.1:1
 *   cream/55             ~ 5.4:1   — smallest value used, on 13px+ only
 *
 * 🔴 `gold-deep` NEVER APPEARS ON THIS SURFACE. It is 1.9:1 on navy. On a dark
 * background the legal gold is `gold`; on a light background it is `gold-deep`;
 * they do not cross over. (HANDOFF §3a.)
 */

/** Section shell — anchor target, heading, optional intro. */
export function PortalSection({
  id,
  heading,
  intro,
  children,
}: {
  id: string;
  heading: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-h`}
      /* scroll-mt clears the sticky bar so an anchored heading is not hidden
         under it — the bar is 56px at phone and 64px above. */
      className="scroll-mt-[72px] border-t border-cream/[0.14] pt-10 first:border-t-0 first:pt-0 sm:scroll-mt-[80px] sm:pt-14"
      id={id}
    >
      <h2
        id={`${id}-h`}
        className="font-display text-[clamp(24px,3.2vw,32px)] font-medium leading-[1.15] tracking-[-0.01em] text-cream"
      >
        {heading}
      </h2>
      {intro ? (
        <p className="mt-3 max-w-[34em] text-[15px] leading-[1.65] text-cream/75">{intro}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/**
 * A numbered step.
 *
 * 🔴 THE NUMERAL IS `aria-hidden` AND THE `<ol>` CARRIES THE ORDER. A screen
 * reader already announces "list item 3 of 8"; painting "03" into the
 * accessible name as well would have it read twice. The digits are typography.
 *
 * They are `gold` rather than `cream/40` because a numeral is a graphic under
 * 1.4.11 and owes 3:1 — cream/40 measures 2.4:1 on navy and would fail.
 */
export function PortalStep({
  n,
  heading,
  children,
}: {
  n: number;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <li className="border-t border-cream/[0.10] py-7 first:border-t-0 first:pt-0 sm:py-8">
      <div className="sm:flex sm:gap-6">
        <span
          aria-hidden="true"
          className="mb-2 block font-mono text-[13px] font-medium leading-none tracking-[0.08em] text-gold sm:mb-0 sm:w-10 sm:shrink-0 sm:pt-1"
        >
          {String(n).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[clamp(18px,2vw,21px)] font-medium leading-[1.25] text-cream">
            {heading}
          </h3>
          {/* 🔴 THE MEASURE IS `em`, NOT `ch`, AND IT WAS COUNTED NOT CONVERTED.
              `ch` is the width of "0", which in IBM Plex Sans is far narrower
              than its average letter — `max-w-[70ch]` here measured 93 rendered
              characters per line, the same over-render HANDOFF logs on the
              article route ("65ch rendered 91 characters, not 65"). 32em at
              15px is 480px, counted at ~73 characters by per-character Range
              rects on the built page.

              The article accepts 86 because narrowing it was ruled out on
              instruction. That decision is specific to that route: this is a
              checklist someone re-reads at step six three days later, and long
              lines cost more here than they do in an essay read once. */}
          <div className="mt-2.5 max-w-[32em] space-y-3 text-[15px] leading-[1.65] text-cream/80">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}

/** The ordered wrapper the steps live in. */
export function PortalStepList({ children }: { children: React.ReactNode }) {
  return <ol>{children}</ol>;
}

/**
 * An outbound link to a regulator, provider or carrier.
 *
 * 🔴 EVERY ONE OF THESE LEAVES THE SITE, AND THE LABEL SAYS SO. `target="_blank"`
 * without a warning is a WCAG 3.2.5 problem — the back button stops working and
 * the reader is not told why. The visible arrow is decorative; the accessible
 * name carries "opens in a new tab" via the visually-hidden span.
 *
 * `rel="noreferrer noopener"` on all of them: `noopener` because a `_blank`
 * target otherwise gets a handle on `window.opener`, and `noreferrer` because
 * a carrier does not need to be told which page of a private portal sent an
 * agent to them.
 */
export function PortalLink({
  href,
  children,
  newTabLabel = "opens in a new tab",
}: {
  href: string;
  children: React.ReactNode;
  newTabLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      /* `py-1` is a TAP TARGET, not spacing. Each of these is a standalone
         control in its own list row — not a link inside a sentence — so WCAG
         2.2 SC 2.5.8's 24×24 minimum applies with no inline exception.
         Unpadded, they measured 23px at phone width. */
      className="group inline-flex items-baseline gap-1.5 py-1 text-[15px] text-gold-pale underline decoration-gold/40 underline-offset-4 transition-colors duration-200 hover:decoration-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale motion-reduce:transition-none"
    >
      <span>{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="h-[10px] w-[10px] shrink-0 translate-y-[-1px] fill-none stroke-current stroke-[1.5]"
      >
        <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only"> ({newTabLabel})</span>
    </a>
  );
}

/** A stack of outbound links under a step. */
export function PortalLinkList({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3.5 space-y-2">{children}</ul>;
}

/**
 * A plain bullet list — the document list, the E&O conditions, the call
 * checklist. Gold markers, because a cream/40 bullet fails 1.4.11 the same way
 * the step numeral would.
 */
export function PortalBullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="relative pl-5 text-[15px] leading-[1.6] text-cream/80">
          <span
            aria-hidden="true"
            className="absolute left-0 top-[0.62em] h-[5px] w-[5px] rounded-full bg-gold"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * An emphasised operational warning — the do-not-email rule on the voided
 * check. Amber rather than the error salmon: nothing has failed, but getting
 * this wrong puts bank details in an inbox.
 */
export function PortalWarn({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3.5 rounded-lg border border-amber/45 bg-amber/[0.10] px-3.5 py-2.5 text-[14px] font-medium leading-[1.5] text-cream">
      {children}
    </p>
  );
}

/** The closing line that hands off to the next section. */
export function PortalHandoff({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p className="mt-8 border-t border-cream/[0.10] pt-6 text-[15px] leading-[1.6] text-cream/75">
      <Link
        href={href}
        className="text-gold-pale underline decoration-gold/40 underline-offset-4 hover:decoration-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
      >
        {children}
      </Link>
    </p>
  );
}
