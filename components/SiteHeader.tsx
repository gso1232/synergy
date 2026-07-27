"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Logo from "./Logo";

const LEFT_LINKS = ["home", "about"] as const;
const RIGHT_LINKS = ["services", "contact"] as const;

/** Scroll distance at which the bar compacts. Lemonade's own threshold, found
 *  by bisection: 60px holds the tall bar, 62px has already compacted. */
const COMPACT_AT = 60;

/**
 * Scroll distance below which the bar is NEVER hidden.
 *
 * Past COMPACT_AT (60) so the compaction and the hide never fire on the same
 * pixel and read as one jumbled event, and past the tall bar's own height
 * (116) so it never begins sliding away while it still overlaps where it
 * started. This is also what guarantees the hero state and the
 * return-to-the-top state: below this line, direction is ignored entirely.
 */
const HIDE_AFTER = 160;

/**
 * Accumulated movement, in px, before a direction change flips visibility.
 *
 * An ACCUMULATOR, not a timer, and it resets the moment direction changes —
 * so a decisive scroll-up reveals the bar immediately, where a time-based
 * debounce would add latency to the one gesture that has to feel instant.
 *
 * 8px because Lenis runs at `lerp: 0.1` and emits sub-pixel deltas every frame
 * while momentum settles; a 1–2px threshold flips on those and the bar
 * flickers. 8 is far below a single wheel notch (~100px) or a trackpad flick,
 * so an intentional reversal always clears it and jitter never does.
 */
const DIR_DELTA = 8;

/**
 * Global site header — mounted in the layout, persists on every page.
 *
 * Structure and motion are modelled on lemonade.com, re-measured in a real
 * browser (the first pass was taken in a non-compositing pane behind a consent
 * modal and read the compact state as if it were the only state — it isn't).
 *
 * WHAT THEIRS ACTUALLY DOES, measured at 1440×900:
 *
 *   header      position:fixed, top 0, full width, z-index 100, white
 *               height 100px at rest → 70px scrolled, `transition: height .2s`
 *               (no timing function declared, so the CSS default `ease`)
 *   trigger     a binary class flip at scrollY > 60 — not scroll-linked.
 *               60px → 100 tall, 62px → 70. The transition does the smoothing.
 *   inner row   the link row is a FIXED 70px box pinned to the top of the bar.
 *               Links measured at y=24.6 in BOTH states — they never move. The
 *               extra 30px of tall-bar height hangs below the row, and that is
 *               where the big logo lives.
 *   logo        wrapper is position:absolute, left:50%, translateX(-50%),
 *               height:100% — dead centre, both states.
 *               the SVG itself animates transform, `transition: transform .2s`:
 *                 at rest   translateY(33px) scale(1)   → 146×33.4 at top 64.9
 *                 scrolled  translateY(0)   scale(0.8)  → 116.8×26.7 at top 20.3
 *               so it RISES 44.6px and shrinks to 80%.
 *   left/right  6 links left of the logo, "My Account" right. No header pill —
 *               their pink CTA is parked at translateY(-100px) with
 *               `transition: transform 300ms cubic-bezier(.175,.885,.32,1.275)`
 *               and never slides in on the homepage.
 *   mobile      base height 70px with the 100px only inside
 *               `@media (min-width:1025px)` — there is no tall state on mobile.
 *
 * OURS — same mechanism, our tokens:
 *   heights     104 → 72 desktop (same 1.44 ratio, 32px delta on our 8px
 *               scale); flat 64px below 900px, no compaction, like theirs.
 *   row         a fixed `--header-h-compact` box at the top of the bar, so our
 *               links and Join pill never move either.
 *   logo        translateY(28px) scale(1.25) at rest → translateY(0) scale(1)
 *               scrolled. Base box is 40px, so it renders 50px and hangs low
 *               at rest, then rises 28px and settles to 40px.
 *   timing      200ms `ease` on both height and transform, matching theirs
 *               exactly. Threshold 60px, matching theirs exactly.
 *   layout      links SPLIT either side of the centred logo — Home/About left,
 *               Services/Contact right — with the navy Join pill at the far
 *               right end.
 *
 * Gold is never text on cream: #C9A84C on #F8F4EE is 2.09:1. Hover is
 * gold-deep #7D641F at 5.16:1.
 */
export default function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Recomputed from the live scroll position on every event, so the bar
  // cross-fades in BOTH directions rather than latching once.
  //
  // The native `scroll` listener alone is not enough here: Lenis drives the
  // page and deliberately swallows most native scroll events
  // (`_preventNextNativeScrollEvent`), so a 0→500px scroll emitted only two of
  // them. Lenis is loaded lazily, so we also poll briefly for its instance and
  // subscribe to its own emitter, which fires every frame it moves.
  //
  // SURFACE and VISIBILITY are two orthogonal axes read from the same event.
  // Surface is POSITION-driven and unchanged (solid at any y > 60), which is
  // why a bar sliding back in mid-page is always readable — mid-page is always
  // past 60. Visibility is DIRECTION-driven and new.
  //
  // Position comes from `window.scrollY` in both paths because Lenis scrolls
  // the real window; the Lenis subscription is only a higher-frequency trigger,
  // not a different source of truth. Under reduced motion SmoothScroll never
  // mounts Lenis at all, so the native listener is the whole story there — and
  // the bar never hides in that case anyway.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;
    let accum = 0;
    let lastDir = 0;

    const read = () => {
      const y = window.scrollY;
      setCompact(y > COMPACT_AT);

      // Reduced motion: the hide/reveal is purely a motion affordance, so it
      // is switched off rather than made instant. Snapping a bar in and out of
      // existence is a jump-cut, which is worse for the people asking for less
      // motion than simply leaving it in place.
      if (reduce.matches) {
        setHidden(false);
        lastY = y;
        return;
      }

      const delta = y - lastY;
      lastY = y;

      // Below the line, direction is ignored entirely.
      if (y <= HIDE_AFTER) {
        setHidden(false);
        accum = 0;
        lastDir = 0;
        return;
      }
      if (delta === 0) return;

      const dir = delta > 0 ? 1 : -1;
      if (dir !== lastDir) {
        accum = 0;
        lastDir = dir;
      }
      accum += Math.abs(delta);
      if (accum < DIR_DELTA) return;

      setHidden(dir === 1);
    };

    read();
    window.addEventListener("scroll", read, { passive: true });

    let lenis: { on?: Function; off?: Function } | undefined;
    let tries = 0;
    const attach = window.setInterval(() => {
      const l = (window as unknown as { lenis?: typeof lenis }).lenis;
      if (l?.on) {
        lenis = l;
        l.on("scroll", read);
        window.clearInterval(attach);
      } else if (++tries > 40) {
        window.clearInterval(attach);
      }
    }, 100);

    return () => {
      window.removeEventListener("scroll", read);
      window.clearInterval(attach);
      lenis?.off?.("scroll", read);
    };
  }, []);

  // Keyboard focus forces the bar visible. Tabbing to a link that is sitting
  // at translateY(-100%) is a focus trap in the literal sense: the element is
  // focusable and its focus ring is off-screen. `focusout` only releases when
  // focus has genuinely left the header — relatedTarget still inside means the
  // user is tabbing BETWEEN header links, which must not drop it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onIn = () => setFocusWithin(true);
    const onOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
    };
    el.addEventListener("focusin", onIn);
    el.addEventListener("focusout", onOut);
    return () => {
      el.removeEventListener("focusin", onIn);
      el.removeEventListener("focusout", onOut);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Body scroll lock while the panel covers the page.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes; Tab is trapped inside the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Move focus into the panel when it opens. Deliberately a timer rather than
  // requestAnimationFrame: rAF does not fire in a tab that is not compositing,
  // which would strand focus on the trigger behind the panel.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      (
        root.querySelector<HTMLElement>("a[href], button:not([disabled])") ??
        root
      ).focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  /**
   * The transparent state is a HERO state, not a top-of-page state.
   *
   * At the top of the homepage the bar has no background and paints its ink
   * pure white, which is legible only because the hero photograph and
   * .hero-veil-top sit behind it. On a page that opens on the cream surface
   * instead, that same state is #FFFFFF on #F8F4EE — 1.11:1, an invisible
   * navigation bar. So the transparent state is allowed only on the locale
   * root, and every other route gets the solid bar from the first pixel.
   *
   * Matches "/", "/en", "/es" and their trailing-slash forms; anything deeper
   * ("/en/calculator") is a content page. next-intl's middleware means the
   * as-rendered path always carries the locale, but "/" is matched too so a
   * pre-redirect render never flashes the solid bar over the hero.
   */
  const isHeroRoute = useMemo(
    () => /^\/(?:en|es)?\/?$/.test(pathname ?? "/"),
    [pathname],
  );
  const solid = compact || !isHeroRoute;

  /**
   * Visibility is the scroll decision AND the two overrides. Focus wins over
   * scroll, and an open menu wins over both — the trigger that closes the
   * panel lives in the bar, so a hidden bar would strand the user in it.
   */
  const concealed = hidden && !focusWithin && !open;

  const linkClass =
    "nav-ink text-[15px] font-semibold tracking-[0.01em] transition-colors duration-200 hover:text-gold-deep";

  return (
    <>
    <header
      ref={headerRef}
      data-compact={solid ? "true" : "false"}
      data-hidden={concealed ? "true" : "false"}
      // Height AND surface live in globals.css keyed off data-compact. No
      // `bg-cream` here — at the top of the page the bar is a pure overlay on
      // the photo, and the cream is cross-faded in only once compacted.
      className="site-header fixed inset-x-0 top-0 z-50"
    >
      {/* The link row is a fixed-height box pinned to the top of the bar, so
          nothing in it moves when the bar compacts — only the bar's own height
          and the logo's transform change. */}
      {/* Three equal-flanked columns: [1fr] [logo] [1fr]. The two 1fr tracks are
          by definition the same width, so the logo is exactly centred without
          any absolute positioning, and the left and right groups are balanced
          containers around it. Everything is vertically centred over the FULL
          bar height, so nothing sits against the card's top edge. */}
      <nav
        aria-label={t("ariaLabel")}
        className="grid h-full grid-cols-[1fr_auto_1fr] items-center"
        style={{ paddingInline: "var(--nav-inset)" }}
      >
        {/* LEFT — starts exactly on the headline's left edge */}
        <ul className="hidden items-center gap-8 card:flex">
          {LEFT_LINKS.map((key) => (
            <li key={key}>
              <a href="#" className={linkClass}>
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        {/* CENTRE — logo */}
        <a
          href="#"
          aria-label={t("company")}
          className="flex items-center justify-self-center"
        >
          <Logo
            variant="light"
            className="site-header__logo h-11 w-auto card:h-12"
          />
        </a>

        {/* RIGHT — ends exactly on the headline's right edge */}
        <div className="flex items-center justify-end gap-8">
          <ul className="hidden items-center gap-8 card:flex">
            {RIGHT_LINKS.map((key) => (
              <li key={key}>
                <a href="#" className={linkClass}>
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#"
            className="nav-pill hidden h-10 items-center rounded-full px-6 text-[15px] font-semibold card:inline-flex"
          >
            {t("join")}
          </a>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={open}
            aria-controls="site-menu"
            className="nav-ink -mr-3 inline-flex h-11 w-11 items-center justify-center card:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <path
                d="M2 6h18M2 11h18M2 16h18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>

      {/* MOBILE panel — cream, full height, big stacked links, Join full width.

          IT IS A SIBLING OF <header>, NOT A CHILD, AND THAT IS LOAD-BEARING.
          `transform` on an element makes it the containing block for its
          position:fixed descendants, and the bar is now transformed to hide and
          reveal. Nesting the panel inside it sized this `fixed inset-0` to the
          64px bar — measured 753x64 instead of 768x1024.

          Setting `transform: none` on the bar while the panel is open does NOT
          fix it: `transform` is in the bar's transition list, so the resolved
          value is an identity MATRIX rather than the keyword `none`, and an
          identity matrix still establishes a containing block. Moving the panel
          out is the fix that cannot regress — there is no longer a transformed
          ancestor to depend on. */}
      {open && (
        <div
          id="site-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("ariaLabel")}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream card:hidden"
        >
          <div
            className="flex shrink-0 items-center justify-between"
            style={{
              height: "var(--header-h-compact)",
              paddingInline: "var(--nav-inset)",
            }}
          >
            <Logo variant="light" className="h-9 w-auto" />
            <button
              type="button"
              onClick={close}
              aria-label={t("closeMenu")}
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-navy"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                <path
                  d="M4 4l14 14M18 4L4 18"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div
            className="flex flex-1 flex-col pb-10 pt-2"
            style={{ paddingInline: "var(--nav-inset)" }}
          >
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((key) => (
              <a
                key={key}
                href="#"
                onClick={close}
                className="border-b border-navy/10 py-5 font-display text-[26px] font-medium tracking-[-0.01em] text-navy"
              >
                {t(key)}
              </a>
            ))}

            <a
              href="#"
              onClick={close}
              className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-full bg-navy text-[16px] font-semibold text-cream"
            >
              {t("join")}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
