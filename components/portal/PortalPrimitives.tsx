/**
 * The shared parts of the agent portal: section shell, step, external link,
 * lists and the operational warning.
 *
 * =============================================================================
 * 🔴 THE SURFACE IS LIGHT NOW, AND THAT INVERTS EVERY GOLD DECISION.
 *
 * The first build was navy with cream type and `gold` accents. This one is cream
 * with `ink` type and `gold-deep` accents. The palette rule from HANDOFF §3a is
 * absolute and it runs the OTHER WAY on light:
 *
 *      on DARK   the legal gold is `gold` #C9A84C     (gold-deep is 1.9:1)
 *      on LIGHT  the legal gold is `gold-deep` #7D641F (gold is 2.09:1)
 *
 * So `gold` appears NOWHERE on this surface as text, as a numeral, as a bullet,
 * as a border on a control, or as a focus ring. It survives only as a wash
 * (`gold/[0.06]`), where nothing is read off it and it carries no state.
 *
 * MEASURED, composited, at the widths that ship — not converted from tokens:
 *
 *   ink        #1A1A1A on cream #F8F4EE   15.89:1   body, headings
 *   ink/70               on cream          5.92:1   secondary prose  (floor)
 *   gold-deep  #7D641F on cream            5.16:1   numerals, bullets, focus
 *   gold-deep          on white #FFFFFF    5.65:1   inside cards
 *   ink        #1A1A1A on white           17.41:1   card body
 *   navy       #0D1B2A on gold #C9A84C     7.61:1   the one solid-gold fill
 *
 * 🔴 `ink/60` IS BANNED ON CREAM. It measures 4.34:1 — under 4.5, and close
 * enough to look fine. ink/70 is the lightest value used for prose here.
 *
 * =============================================================================
 * 🔴 THE `.sem-*` MARKETING SCALE IS STILL NOT USED. `.sem-h2` is 45.77px and
 * `.sem-body` is 17.16px/1.8 — built for a page scrolled past once to persuade.
 * This is a reference document worked through with a browser tab open beside it.
 * It takes a working scale, closer to the admin dashboard than the homepage.
 */
import Link from "next/link";

/* ---------------------------------------------------------------- section --- */

export function PortalSection({
  heading,
  intro,
  children,
}: {
  heading: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby="section-h">
      <h1
        id="section-h"
        className="font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.015em] text-navy"
      >
        {heading}
      </h1>
      {intro ? (
        <p className="mt-3 max-w-[34em] text-[16px] leading-[1.6] text-ink/70">{intro}</p>
      ) : null}
      <div className="mt-9">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------- step --- */

/**
 * A numbered step, as a card.
 *
 * 🔴 HIERARCHY IS THE POINT OF THE REDESIGN. The first build ran heading and
 * body at nearly the same weight down one hairline rule, so eight steps read as
 * one grey wall. Now: the ACTION is the heading, at 19–21px medium ink; the
 * DETAIL sits under it at 15px ink/70; each step is a white card on cream so the
 * eye can count them; and the numeral is a fixed chip rather than inline text.
 *
 * 🔴 THE NUMERAL IS `aria-hidden` AND THE `<ol>` CARRIES THE ORDER. A screen
 * reader already says "3 of 8"; painting "03" into the accessible name would
 * read it twice. It is gold-deep, not gold — a numeral is a graphic under
 * 1.4.11 and owes 3:1, which gold cannot reach on any light surface.
 */
export function PortalStep({
  n,
  heading,
  children,
}: {
  /* 🔴 `string` WAS ADDED FOR THE CMS, and it is a widening rather than a
     change: `String(n).padStart(2, "0")` already produced "03" from `3`, and it
     is a no-op on a stored "03". The CMS keeps `page_sections.step_number` as
     TEXT because the leading zero is what the badge renders and because a step
     is not always a number — "4A" is a legitimate thing for Aiman to type. The
     four retired hardcoded sections still pass numbers and are unaffected. */
  n: number | string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-xl border border-ink/[0.10] bg-white p-5 shadow-[0_1px_2px_rgba(11,31,58,0.04)] sm:p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-deep/35 bg-gold/[0.10] font-mono text-[12px] font-medium leading-none text-gold-deep"
        >
          {String(n).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[clamp(19px,1.6vw,21px)] font-semibold leading-[1.25] text-navy">
            {heading}
          </h2>
          {/* 🔴 MEASURE IS `em`, COUNTED NOT CONVERTED. `ch` is the width of "0",
              far narrower than the average letter in IBM Plex Sans: `70ch` here
              measured 93 rendered characters, the same over-render HANDOFF logs
              on the article route. 32em at 15px ≈ 480px ≈ 72 characters, counted
              by per-character Range rects on the built page. */}
          <div className="mt-2.5 max-w-[32em] space-y-3 text-[15px] leading-[1.6] text-ink/75">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}

export function PortalStepList({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-3">{children}</ol>;
}

/* ------------------------------------------------------------------ links --- */

/**
 * An outbound link to a regulator, provider or carrier.
 *
 * 🔴 EVERY ONE LEAVES THE SITE AND THE ACCESSIBLE NAME SAYS SO. `target="_blank"`
 * without warning is a WCAG 3.2.5 problem: the Back button stops working and the
 * reader is not told why. The arrow is decorative; the visually-hidden span
 * carries the warning.
 *
 * `rel="noreferrer noopener"` throughout — `noopener` because a `_blank` target
 * otherwise gets a handle on `window.opener`, `noreferrer` because a carrier
 * does not need to know which page of a private portal sent an agent to them.
 *
 * `py-1` is a TAP TARGET, not spacing: these are standalone controls in list
 * rows, so WCAG 2.2 SC 2.5.8's 24×24 applies with no inline exception.
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
      className="inline-flex items-baseline gap-1.5 py-1 text-[15px] font-medium text-gold-deep underline decoration-gold-deep/35 underline-offset-4 transition-colors duration-200 hover:decoration-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
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

export function PortalLinkList({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 space-y-1">{children}</ul>;
}

/* ------------------------------------------------------------------ lists --- */

/** Bullets are gold-deep: a marker is a graphic under 1.4.11 and owes 3:1,
 *  which `gold` (2.09:1 on cream, 2.29:1 on white) cannot reach. */
export function PortalBullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="relative pl-5 text-[15px] leading-[1.6] text-ink/75">
          <span
            aria-hidden="true"
            className="absolute left-0 top-[0.6em] h-[5px] w-[5px] rounded-full bg-gold-deep"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * An emphasised operational warning — the do-not-email rule on the voided check.
 * `amber-deep #8A5312` is the text-safe amber this palette already carries for
 * exactly this reason (the brand `amber #E0A458` is a wash, not a type colour).
 */
export function PortalWarn({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-lg border border-amber-deep/30 bg-amber/[0.12] px-3.5 py-2.5 text-[14px] font-medium leading-[1.5] text-amber-deep">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ pager --- */

/** Foot-of-section navigation. Real links, so Back works and each is bookmarkable. */
export function PortalPager({
  prev,
  next,
}: {
  prev: { href: string; label: string } | null;
  next: { href: string; label: string } | null;
}) {
  return (
    <nav
      aria-label="Section"
      className="mt-12 flex flex-wrap items-stretch justify-between gap-3 border-t border-ink/[0.12] pt-6"
    >
      {prev ? <PagerLink {...prev} dir="prev" /> : <span />}
      {next ? <PagerLink {...next} dir="next" /> : <span />}
    </nav>
  );
}

function PagerLink({ href, label, dir }: { href: string; label: string; dir: "prev" | "next" }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-ink/50 bg-white px-4 py-2 text-[15px] font-medium text-ink transition-colors duration-200 hover:border-gold-deep/50 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
    >
      {dir === "prev" ? <span aria-hidden="true">←</span> : null}
      <span>{label}</span>
      {dir === "next" ? <span aria-hidden="true">→</span> : null}
    </Link>
  );
}
