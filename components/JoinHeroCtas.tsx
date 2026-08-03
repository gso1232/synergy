"use client";

import { useCallback } from "react";
import Link from "next/link";

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
 * 2. AGENT PORTAL — ✅ LIVE FROM 2026-08-02. It was a disabled <button>.
 *
 * 🔴 THE STALE CLAIM THAT KEPT IT DISABLED, RECORDED SO IT IS NOT REINSTATED.
 * The old note here said the button was waiting on "a portal URL from the
 * client". No such URL was ever coming, and nothing was blocked on the client:
 * `/[locale]/login` already existed, was built, and worked. Auth had shipped —
 * middleware.ts runs a fail-closed Supabase gate on /admin and
 * (portal)/admin/layout.tsx re-reads the role from the database on every
 * request. The button was inert because of a note that had stopped being true.
 *
 * The client's decision, in their words: the portal works with auth and guards,
 * agents need a way in, and a discoverable login is correct now. This CTA and
 * `AGENT_LOGIN_LINK_READY` in components/SiteHeader.tsx were flagged as ONE
 * question in two places and were flipped together. Flip them together or not
 * at all.
 *
 * 🟡 WHAT IS STILL MISSING IS A DESTINATION, NOT A URL — an accepted
 * intermediate state, not an oversight. `(portal)/` holds exactly `admin` and
 * `login`; there is no agent route. login/actions.ts ends
 * `redirect(role === "admin" ? /${locale}/admin : /${locale})`, so an AGENT who
 * signs in correctly is returned to the PUBLIC HOMEPAGE, with no signed-in state
 * rendered anywhere on the public site and `signOut` living only inside
 * AdminShell. The door is findable; the room behind it is empty for a non-admin.
 * Do NOT "fix" that by disabling this again.
 *
 * WHAT WENT WITH THE FLIP:
 *   - `<button disabled>` -> `<Link href={`/${locale}/login`}>`. It is a real
 *     anchor because it is navigation: it must work without JS and be
 *     right-clickable, which a button calling router.push is not.
 *   - `portalNote` ("The agent portal is not open yet.") is NO LONGER RENDERED.
 *     It asserted something false the moment the link went live. The string is
 *     RETAINED UNTOUCHED in both message files per the standing convention that
 *     nothing is deleted, only unrendered — and the prop is still accepted so
 *     restoring the disabled state is a revert, not a re-authoring.
 *   - `aria-describedby` went with the note. There is nothing to describe now.
 *   - `.join-cta--disabled` is unused by this component. The rule stays in
 *     globals.css with its derivation — it is the only solved disabled-control
 *     treatment on a dark photographic surface this codebase has.
 *
 * TREATMENT IS UNCHANGED: the ghost outline beside the filled primary. That is
 * exactly what it should look like now — the measurement recorded on
 * `.join-cta--disabled` showed the old "disabled" styling already read as a live
 * ghost CTA (label 5.48:1, border 3.17:1, both clearing the LIVE bars). It is
 * now a live ghost CTA, so those numbers are correct rather than misleading.
 */
export default function JoinHeroCtas({
  applyLabel,
  portalLabel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  portalNote,
  targetId,
  locale,
}: {
  applyLabel: string;
  portalLabel: string;
  /** RETAINED, DELIBERATELY UNRENDERED. See the docblock — restoring the
   *  disabled state is a revert, not a re-authoring. */
  portalNote: string;
  targetId: string;
  locale: string;
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

      {/* A real <Link>: navigation, so it must work without JS, be
          right-clickable and openable in a new tab. Same reasoning as
          LocaleSwitcher's anchors. */}
      <Link href={`/${locale}/login`} className="join-cta join-cta--ghost">
        {portalLabel}
      </Link>
    </div>
  );
}
