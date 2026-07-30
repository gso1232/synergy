"use client";

import { useCallback } from "react";

/**
 * The /join hero's two CTAs.
 *
 * =========================================================================
 * 1. JOIN AS AGENT — live, and it scrolls THROUGH LENIS.
 *
 * 🔴 NOT A RAW ANCHOR. `<a href="#join-apply">` hands the scroll to the
 * browser, which jumps the native scroll position — and this site runs Lenis,
 * whose own scroll value then disagrees with the document's until the next
 * user gesture nudges it back. That is the same class of bug that made the
 * sticky measurements read wrong earlier in this project: two scroll systems,
 * one of them stale.
 *
 * So this is a BUTTON that calls `lenis.scrollTo`, with the anchor semantics
 * kept where they matter: the target is a real element with a real id, and if
 * Lenis is absent (it is a client-only import, and this component can render
 * before it mounts) the handler falls back to `scrollIntoView`, which is still
 * correct — just not smoothed.
 *
 * 🔴 THE OFFSET IS NOT DECORATION. The header is `position: fixed`, so
 * scrolling an element to y=0 puts it UNDER the bar. A further 24px keeps the
 * heading clear of the bar's edge rather than touching it.
 *
 * 🔴 IT NO LONGER READS `--header-h-tall`, BECAUSE THAT VARIABLE IS STALE AND
 * globals.css ALREADY SAYS SO. Measured on the built page at 1536:
 *
 *     --header-h-tall            104px   <- what this file used to read
 *     .site-header               116px   (>=900, expanded)
 *     .site-header[compact]       76px   (>=900, compacted)
 *     .site-header                64px   (<900, both states)
 *
 * 104 is none of those. The bar went to CONCRETE lengths when the var()
 * indirection broke its height transition — see the note above
 * `.page-header-offset`, which reserves 64/76 for exactly this reason and warns
 * that reserving the wrong number slides the heading under the bar.
 *
 * THE STATE THAT MATTERS IS THE COMPACT ONE. By the time the scroll lands, the
 * page is thousands of pixels down and the bar has compacted, so the clearance
 * has to be measured against 76 (or 64), not against the 116 it was when the
 * button was clicked. Reading the live element at click time would over-reserve
 * by 40px.
 *
 *   // was: parseFloat(getComputedStyle(document.documentElement)
 *   //        .getPropertyValue("--header-h-tall")) || 64      -> 104 at desktop
 *   // which landed the heading 128 - 76 = 52px below the bar instead of 24.
 *   // At <900 it read 64 and was correct by coincidence, which is why this only
 *   // ever looked wrong on desktop.
 *
 * The two lengths and the 900px breakpoint are the same three numbers
 * `.page-header-offset` uses. If the bar's heights change, both move together.
 *
 * =========================================================================
 * 2. AGENT PORTAL — rendered, visible, and genuinely DISABLED.
 *
 * The portal does not exist. It ships visible so the decision is not quietly
 * forgotten, and disabled so it is not a link to nothing — exactly the
 * ContactForm precedent, which renders a complete form inside a
 * `<fieldset disabled>` because there is no endpoint yet. This is that pattern,
 * not a new one.
 *
 * It is a `<button disabled>` — NOT an `<a>` without an href and NOT a div:
 *   - `disabled` on a real button removes it from the tab order for free, so
 *     it cannot be focused, which is what "not a dead link" has to mean for a
 *     keyboard user.
 *   - `aria-disabled` is set as well. Belt and braces on purpose: `disabled`
 *     is what actually enforces it, `aria-disabled` is what some screen readers
 *     announce more reliably on a control that is styled as an affordance.
 *   - `aria-describedby` points at the visible "not yet available" note, so the
 *     reason is announced rather than being a purely visual grey-out. Colour
 *     alone would not satisfy 1.4.1.
 *
 * WHAT IT IS WAITING ON is recorded in HANDOFF: a portal URL from the client.
 * The day it arrives this becomes a `<Link>` and the note comes out.
 */
export default function JoinHeroCtas({
  applyLabel,
  portalLabel,
  portalNote,
  targetId,
}: {
  applyLabel: string;
  portalLabel: string;
  portalNote: string;
  targetId: string;
}) {
  const scrollToApply = useCallback(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    // The bar's COMPACT height — the state it will be in once the scroll lands.
    // Same 64 / 76 / 900px that `.page-header-offset` uses.
    const barPx = window.matchMedia("(min-width: 900px)").matches ? 76 : 64;
    const offset = -(barPx + 24);

    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } })
      .lenis;

    if (lenis?.scrollTo) {
      lenis.scrollTo(target, { offset, duration: 1.1 });
      return;
    }
    // Fallback: no Lenis yet. Still lands clear of the bar.
    const y = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [targetId]);

  return (
    <div className="join-hero-ctas">
      <button
        type="button"
        onClick={scrollToApply}
        className="sem-pill-cta sem-pill-cta--on-dark join-cta"
      >
        {applyLabel}
      </button>

      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-describedby="join-portal-note"
        className="join-cta join-cta--disabled"
      >
        {portalLabel}
      </button>

      <p id="join-portal-note" className="join-portal-note">
        {portalNote}
      </p>
    </div>
  );
}
