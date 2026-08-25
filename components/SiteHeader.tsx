"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  HEADER_PILL_ROUTE,
  HEADER_ROUTES_TEXT,
  isCurrentRoute,
  routeHref,
  type RouteKey,
} from "@/routes";
import LogoLockup from "./LogoLockup";
import LocaleSwitcher from "./LocaleSwitcher";
import TopUtilityBar from "./TopUtilityBar";

/**
 * The bar is a three-column grid with the logo dead centre, so the nav is
 * split either side of it: the first two routes left, the rest right. The
 * SOURCE of the list is routes.ts — this file decides where the items sit, not
 * which items exist.
 *
 * It used to be two hard-coded pairs, `["home","about"]` and
 * `["services","contact"]`, every one of them rendered as `<a href="#">`.
 * Services and Contact are not built; they are gone rather than greyed out.
 */
// The split is over HEADER_ROUTES_TEXT, not HEADER_ROUTES: `join` lives in the
// route list but is rendered by the PILL below, so it must not also appear as a
// text link. Deriving the text list in routes.ts keeps the two in step.
/**
 * 🔴 THE AGENT LOGIN LINK IS BUILT AND SHIPPED OFF. FLIP THIS WHEN AN AGENT WHO
 * SIGNS IN HAS SOMEWHERE TO ARRIVE.
 *
 * Same pattern as `LOCALE_SWITCHER_READY` in LocaleSwitcher.tsx, off for the
 * same reason the lead form is disabled: AN AFFORDANCE MUST NOT ADVERTISE A
 * CAPABILITY THE SITE DOES NOT HAVE.
 *
 * THE SECURITY OBJECTION IS GONE. It used to be that /login was unlinked because
 * /admin was unprotected and a link would have signposted it. That is no longer
 * true: middleware.ts runs a fail-closed Supabase gate on /admin, and
 * (portal)/admin/layout.tsx re-verifies the user and reads the role from the
 * database on every request. Two layers. Linking this is SAFE.
 *
 * ✅ **ON, ON INSTRUCTION (2026-08-02).** The client's call, in their words: the
 * portal works with auth and guards, agents need a way in, and a discoverable
 * login is correct now. This flag and the /join "Agent portal" CTA were flagged
 * as ONE decision in two places and were flipped together — see JoinHeroCtas.
 *
 * 🟡 THE OBJECTION THAT WAS OVERRULED IS KEPT HERE, BECAUSE IT IS STILL TRUE AND
 * IT NAMES THE NEXT PIECE OF WORK. Measured in the tree:
 *
 *   - (portal)/ contains exactly two routes: `admin` and `login`. There is no
 *     agent route.
 *   - login/actions.ts ends `redirect(role === "admin" ? /admin : /${locale})`.
 *     An AGENT who signs in correctly is sent to the PUBLIC HOMEPAGE.
 *   - Nothing on the public site renders a signed-in state, and `signOut` exists
 *     only inside AdminShell. So that agent lands on a page identical to the one
 *     they started on, with no confirmation they are signed in and no way to
 *     sign out.
 *   - There is no `signUp` anywhere; accounts are created by hand.
 *
 * So the door is now findable and the room behind it is still empty for a
 * non-admin. That is a deliberate, accepted intermediate state — NOT an
 * oversight to be "fixed" by hiding the link again. The fix is an agent
 * destination plus a signed-in state on the public site.
 *
 * TO REVERT: set this `false`. It removes the bar link AND the mobile panel
 * entry. The strings (`nav.login`) stay in both message files either way, per
 * the standing convention that nothing is deleted, only unrendered.
 */
const AGENT_LOGIN_LINK_READY: boolean = true;

/**
 * 🔴 THE SPLIT IS DERIVED, NOT HARD-CODED, AND IT NOW LEANS LEFT ON TIES.
 *
 * It shipped as `slice(0, 2)` / `slice(2)` — the old 2 / 4. Then it was
 * `Math.ceil(length / 2)`, an even 3 / 3: Home · About · Services left, Blog ·
 * Contact · Calculator right.
 *
 * 🔴 BLOG MOVED TO THE LEFT ON INSTRUCTION (2026-08-02), NEXT TO SERVICES. That
 * makes the split 4 / 2, and `Math.ceil((length + 1) / 2)` is the formula that
 * produces it without reordering anything: it puts the LARGER half on the left,
 * breaking ties left. Blog already sits directly after Services in
 * HEADER_ROUTES_TEXT, so widening the left half to four simply carries it over
 * with no change to reading order. Today, on six text keys:
 *
 *     LEFT   Home · About · Services · Blog
 *     RIGHT  Contact · Calculator          (+ the Join pill, see below)
 *
 * This is consistent with the balance the bar was always built around, stated
 * in this file's own earlier note: the heavier half belongs on the LEFT because
 * the Join pill already weights the right. A seventh text route becomes 4 / 3
 * (ceil(8/2) = 4), still heavier-left; an eighth becomes 5 / 3.
 *
 * 🟡 THE PILL IS NOT IN THIS COUNT and cannot be. It renders from
 * `HEADER_PILL_ROUTE`, sits outside both `<ul>`s at the far right, and is a CTA
 * rather than a nav destination. So the bar is 4 links / 2 links + 1 pill: the
 * left carries more names, the right carries fewer names but the call to action,
 * which is where a CTA belongs.
 *
 * 🔴 THE SPLIT IS DESKTOP-ONLY. Below 900px BOTH `<ul>`s are `hidden` and the
 * bar is logo + hamburger; the mobile panel renders HEADER_ROUTES_TEXT as ONE
 * stacked list in source order (Home · About · Services · Blog · Contact ·
 * Calculator), so "left vs right" does not exist at 768 or 390 and Blog simply
 * sits fourth in the stack. Nothing about this change is visible below 900.
 */
const SPLIT_AT = Math.ceil((HEADER_ROUTES_TEXT.length + 1) / 2);
const LEFT_LINKS: readonly RouteKey[] = HEADER_ROUTES_TEXT.slice(0, SPLIT_AT);
const RIGHT_LINKS: readonly RouteKey[] = HEADER_ROUTES_TEXT.slice(SPLIT_AT);

/** /{locale}/about, either locale, with or without a trailing slash. */
const isAboutRoute = (pathname: string | null) =>
  /^\/(?:en|es)\/about\/?$/.test(pathname ?? "/");

/**
 * Routes whose FIRST VIEWPORT is a full-bleed photograph dark enough to carry
 * white nav ink, so the bar may stay transparent until it scrolls off them.
 *
 * This is a property of the PAGE, not a list of favourites: /about and
 * /services both open on a 100svh photo with `.hero-veil-top` over it.
 * /calculator does not — it opens on cream, where a transparent bar would
 * paint #FFFFFF on #F8F4EE at 1.11:1 and simply vanish.
 */
const isPhotoHeroRoute = (pathname: string | null) =>
  // /blog joins on the same terms /about and /services did: its first viewport
  // is a full-bleed photograph dark enough to carry white nav ink. Measured
  // worst nav-band luminance across 1536 / 820 / 390 is 0.148 -> 5.30:1 bare,
  // before the 0.15 scrim. The trailing `$` keeps ARTICLE pages off the list —
  // /blog/<slug> opens on cream and must keep the solid bar.
  //
  // /join joins on the same terms again, and the numbers below are MEASURED on
  // the built page, not estimated. Its hero is join-hero-atrium.jpg composited
  // under `.hero-veil-top` and `.join-hero-scrim`; the worst (brightest) pixel
  // of the real nav band, taken from the header links' own rects, is:
  //
  //     1536 x 900   band y 34-82   #4F5148   L 0.0802   white ink  8.07:1
  //      820 x 1180  band y 10-54   #454740   L 0.0614   white ink  9.42:1
  //      390 x 844   band y 10-54   #303431   L 0.0331   white ink 12.64:1
  //
  // Worst case 8.07:1 against the 4.5 that white nav ink needs. The margin is
  // wide because the veil sits over the atrium's dark upper storeys rather
  // than over sky, which is the opposite of the /blog hero's problem.
  //
  // /contact joined when its hero took the reference's CORNER BLEED. The
  // photograph is ~49% wide and 100svh, running under the bar, so the bar has
  // to be transparent here now. Below 900 the media becomes a full-width
  // in-flow 100svh band rather than collapsing, precisely so there is no width
  // at which a transparent bar sits on cream. Measured worst (brightest) pixel
  // of the real nav band over contact-advisor-couple.jpg:
  //
  //     1536 x 900   media 745x900   #2B3845  L 0.0377  white ink 11.97:1
  //      820 x 1180  media 805x1180  #273442  L 0.0328  white ink 12.68:1
  //      390 x 844   media 390x844   #293542  L 0.0341  white ink 12.48:1
  //
  // Worst case 11.97:1 against the 4.5 white nav ink needs. Measured over the
  // part of the nav band that actually overlaps the media, composited through
  // `.hero-veil-top` AND `.contact-hero-scrim` — not against the bare JPEG.
  /^\/(?:en|es)\/(?:about|services|blog|join|contact)\/?$/.test(pathname ?? "/");

/**
 * 🔴 IS ANY ROUTE A DARK SURFACE? Currently no. DO NOT DELETE THIS.
 *
 * /[locale]/about was the only one, and it is CREAM now — so its bar behaves
 * exactly like the homepage's: transparent white ink over the hero photograph,
 * then the cream bar with ink from scrollY 60.
 *
 * /about KEEPS its place in `isHeroRoute` below. That rule tests a property of
 * the page — does the first viewport hold a full-bleed photograph dark enough
 * to carry white ink? — and /about still does. Only the SURFACE reverted.
 *
 * Everything else stays wired: the `data-surface` attribute is still emitted,
 * the CSS that consumes it is commented out beside its measurements in
 * globals.css, and the focus-ring selector that referenced it is left inert in
 * its selector list on purpose. Restoring a dark route is flipping this to
 * `true` and uncommenting that CSS block — nothing has to be re-derived.
 *
 * Annotated `boolean` rather than left to infer `false`, so TypeScript keeps
 * the `"dark"` branch reachable and type-checks the call sites that depend on
 * it. See the note at `surface` below.
 */
const DARK_SURFACE_ROUTES: boolean = false;

/**
 * One nav link. Shared by the desktop row and the mobile panel so the
 * current-page logic cannot drift between them.
 *
 * ⚠️ IT IS DECLARED AT MODULE SCOPE, AND THAT IS LOAD-BEARING. DO NOT MOVE IT
 * BACK INSIDE SiteHeader.
 *
 * It was defined inside the component body for exactly one commit, and it made
 * every link in the header unclickable. The chain:
 *
 *   1. A component declared inside another component's body is a NEW FUNCTION
 *      IDENTITY on every render. React compares element types by identity, so
 *      it does not update the existing subtree — it unmounts the old one and
 *      mounts a fresh one, replacing every DOM node underneath.
 *   2. Pressing the mouse on a link focuses it, which fires `focusin`, which
 *      runs `setFocusWithin(true)`, which re-renders SiteHeader. That happens
 *      BETWEEN mousedown and mouseup.
 *   3. So the <a> that received mousedown is detached before mouseup lands on
 *      its replacement. The browser only synthesises a `click` when both
 *      halves hit the same node — so no click event was ever generated, React
 *      never saw one, and the router was never called.
 *
 * Measured in real Chrome: at mousedown the node is connected; at mouseup
 * `isConnected === false` and a different element occupies the slot. Nothing
 * was covering the link and nothing called preventDefault — the click simply
 * never existed.
 *
 * It survived automated testing because a synthetic `element.click()` or a
 * dispatched `new MouseEvent('click')` bypasses the browser's down/up pairing
 * entirely. Only a real pointer press can catch this. That is why the nav is
 * now verified by driving a real mouse in a real browser.
 *
 * CURRENT PAGE IS MARKED TWICE, ON PURPOSE.
 *
 *   aria-current="page"  the machine-readable half. Screen readers announce
 *                        "current page" on the link; nothing visual is
 *                        required for that to work.
 *   an underline         the visible half, driven off that same attribute in
 *                        globals.css. It is a SHAPE, not a colour — 1.4.1 is
 *                        not satisfied by colour alone, and the bar carries
 *                        three different ink colours across its states.
 *
 * The rule is drawn in `currentColor`, so it inherits whichever ink is live
 * and is exactly as legible as the label it sits under.
 */
function NavLink({
  routeKey,
  className,
  onClick,
}: {
  routeKey: RouteKey;
  className: string;
  onClick?: () => void;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const current = isCurrentRoute(pathname, locale, routeKey);

  return (
    <Link
      href={routeHref(locale, routeKey)}
      aria-current={current ? "page" : undefined}
      onClick={onClick}
      className={className}
    >
      {t(routeKey)}
    </Link>
  );
}

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
 *   layout      links SPLIT either side of the centred logo — Home/About/
 *               Services/Blog left, Contact/Calculator right — with the navy
 *               Join pill at the far right end.
 *
 * Gold is never text on cream: #C9A84C on #F8F4EE is 2.09:1. Hover is
 * gold-deep #7D641F at 5.16:1.
 */
export default function SiteHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  // Every href is built from the locale this bar is rendering in, so following
  // a link from /es never silently drops you back to /en.
  const locale = useLocale();
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

  /**
   * A ROUTE CHANGE RESETS THE SCROLL POSITION, BUT NOT THE BAR'S MEMORY OF IT.
   *
   * SiteHeader is mounted in the layout, so it does not remount on client-side
   * navigation — and the scroll reset that Next performs does not reach the
   * listener above, because Lenis deliberately swallows most native scroll
   * events. Measured: scrolled to the bottom of /en/about, click "Home" in the
   * footer, and the homepage arrives at scrollY 0 with data-compact="true" and
   * data-hidden="true" — a compacted bar, translated fully off the top of the
   * screen, over a hero that expects the tall transparent one. It stays there
   * until the first scroll gesture.
   *
   * This predates the dark variant and affects every route transition on the
   * site (it is just far easier to hit now that there is a long page to scroll
   * before leaving). Visibility is forced back on because arriving at a new
   * page with no navigation is the worse of the two failures; the surface is
   * recomputed from the real position, which is correct whether the new route
   * lands at the top or has its scroll restored by a back-navigation.
   *
   * setTimeout rather than requestAnimationFrame, for the same reason the
   * focus effect below uses one: rAF does not fire in a tab that is not
   * compositing, which would strand the bar off-screen in exactly the case
   * that is hardest to notice. The accumulator inside the scroll effect is
   * left alone — it self-resets on the first event at or below HIDE_AFTER, and
   * on any direction change.
   */
  useEffect(() => {
    setHidden(false);
    const id = window.setTimeout(() => {
      setCompact(window.scrollY > COMPACT_AT);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

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
   * Matches "/", "/en", "/es" and their trailing-slash forms, AND
   * "/{locale}/about". next-intl's middleware means the as-rendered path
   * always carries the locale, but "/" is matched too so a pre-redirect render
   * never flashes the solid bar over the hero.
   *
   * /about EARNED ITS PLACE HERE BY HAVING A HERO, not by being a special
   * case. The rule is a property of the page, not of the route: does the first
   * viewport contain a full-bleed photograph dark enough to carry white ink?
   * The homepage does. /about does — it opens on the same kind of full-bleed
   * image. /calculator does not; it opens on cream, where a transparent bar
   * would paint #FFFFFF on #F8F4EE at 1.11:1 and simply vanish.
   *
   * The reference nav goes further than this: theirs is `rgba(221,221,221,0)`
   * and NEVER takes a surface, at any scroll position — measured live at
   * scrollY 3500 and still fully transparent. Ours cannot copy that, and the
   * reason is that their page and ours are different below the fold. Their
   * gradient starts at #265C78 (L 0.117) and their nav is white; ours starts
   * at #1C3A5A and stays dark, but the sections our bar travels over include
   * the §2b logo row and the §5 image grid, where white ink would sit on
   * arbitrary photograph. So the bar takes a surface once it leaves the hero —
   * which is exactly what the homepage bar already does.
   */
  const isHeroRoute = useMemo(
    () => /^\/(?:en|es)?\/?$/.test(pathname ?? "/") || isPhotoHeroRoute(pathname),
    [pathname],
  );
  const solid = compact || !isHeroRoute;

  /**
   * SURFACE is the THIRD derived attribute, and it is orthogonal to the other
   * two in exactly the way `data-compact` and `data-hidden` are orthogonal to
   * each other. `data-compact` decides WHETHER the bar has a surface;
   * `data-surface` decides WHICH surface it is. `data-hidden` still owns
   * nothing but the transform.
   *
   * Why it exists: /[locale]/about is a dark page. It opens on a photograph and
   * then runs one continuous #1C3A5A -> #0D1B2A gradient to the footer, so a
   * cream bar forced solid over it is a bright band stapled across the top of a
   * page whose whole effect is a descent into darkness. The dark variant paints
   * the bar #0D1B2A with cream ink — 15.87:1, the same pairing the footer
   * already ships, so the page opens and closes on the same surface.
   *
   * It is DECLARED, not sniffed. The alternative — reading the pixels behind
   * the bar and inverting — is a scroll-time measurement that would have to run
   * every frame and would still be wrong for one frame after any navigation.
   * A route knows what colour it is; it says so.
   *
   * Route-scoped by construction: this matches /about under either locale and
   * nothing else, so every other route renders byte-identical markup to before
   * (the attribute is present and reads "light", which no CSS rule targets).
   */
  const surface = useMemo<"light" | "dark">(
    () => (DARK_SURFACE_ROUTES && isAboutRoute(pathname) ? "dark" : "light"),
    [pathname],
  );

  /**
   * Visibility is the scroll decision AND the two overrides. Focus wins over
   * scroll, and an open menu wins over both — the trigger that closes the
   * panel lives in the bar, so a hidden bar would strand the user in it.
   */
  const concealed = hidden && !focusWithin && !open;

  const linkClass =
    "nav-link nav-ink text-[15px] font-semibold tracking-[0.01em] transition-colors duration-200 hover:text-gold-deep";

  return (
    <>
    <header
      ref={headerRef}
      data-compact={solid ? "true" : "false"}
      data-hidden={concealed ? "true" : "false"}
      data-surface={surface}
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
      {/* 🔴 THE UTILITY STRIP IS INSIDE THE FIXED HEADER, NOT ABOVE IT.
          The header is `position: fixed`; a sibling above it would not move
          with it and would be left behind the moment the page scrolled. Being
          the first child also means the header's own height declarations are
          the single place the strip's 40px is accounted for. It is `card:block`
          only — a phone bar has no room for it, which is what the reference
          does at its own narrow width too. */}
      <TopUtilityBar />
      <nav
        aria-label={t("ariaLabel")}
        /* 🔴 `flex-1`, NOT `h-full`. `h-full` is height:100% of the HEADER, and
           since 2026-08-24 the header's first child is the 40px utility strip —
           so this row was 116px tall starting 40px down, overflowing the bar and
           centring its contents 20px below where they belong. Measured: logo,
           links and pill all sat at cy 98 in a row whose true centre is 78.
           `flex-1` on a flex-column header takes whatever is left after the
           strip, at any header height and any breakpoint, with no number to
           keep in sync. `min-h-0` stops the grid's content forcing it taller. */
        className="grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] items-center"
        style={{ paddingInline: "var(--nav-inset)" }}
      >
        {/* 🔴 THE THREE COLUMNS ARE PLACED EXPLICITLY, AND THAT IS A BUG FIX,
            NOT TIDYING. Found by measuring the bar at 768 while confirming the
            nav split (3/3 at the time, 4/2 now — the bug is independent of the
            split, it is about a hidden grid item collapsing a column).

            Both link lists are `hidden card:flex`, i.e. `display: none` below
            900px. A `display: none` grid ITEM is not placed in the grid at all
            — it does not occupy its cell, it is removed from auto-placement
            entirely. So below 900 the remaining two children slid up a column:
            the LOGO auto-placed into column 1 and the right-hand group into the
            `auto` column, leaving column 3 empty. Measured at 768 before the
            fix, on `grid-cols-[1fr_auto_1fr]` computing 305.763 / 32 / 305.763:

              logo    135.1 -> 280.0   centre 207.5   (content centre is 376.4)
              burger  360.4 -> 404.4   with 348px of empty bar to its right

            A centred logo 168.9px left of centre and a hamburger stranded in
            the middle of the bar. `justify-self-center` was doing its job — it
            was centring the logo in the WRONG COLUMN.

            `col-start-*` pins each child to its own track, so a hidden list
            leaves an empty cell rather than collapsing the row. This is why the
            phone bar looked fine on the DESKTOP-first reading of this file and
            wrong on the device.
        */}
        {/* LEFT — starts exactly on the headline's left edge.
            EN/ES closes this list, i.e. sits directly after Blog (LEFT_LINKS is
            Home · About · Services · Blog), per the instruction to put it top-
            left beside Blog. `gap-8` already separates it from Blog by the same
            32px every other pair uses, so it needs no margin of its own. */}
        <ul className="col-start-1 hidden items-center gap-8 card:flex">
          {LEFT_LINKS.map((key) => (
            <li key={key}>
              <NavLink routeKey={key} className={linkClass} />
            </li>
          ))}
          {/* 🔴 THE EN/ES PILL WAS HERE AND MOVED TO THE UTILITY STRIP. Keeping
              both would put two language switchers on one screen. See the note
              in components/TopUtilityBar.tsx — restoring it is uncommenting
              this and deleting the strip's copy.
          <li>
            <LocaleSwitcher />
          </li> */}
        </ul>

        {/* THE SAME CONTROL, PHONE PLACEMENT. Below `card` both <ul>s above are
            `hidden` and this grid column stands empty while the bar is logo +
            hamburger — so this is the top-left of a phone bar, which is where
            it was asked to go, and it costs no new row. `card:hidden` is what
            stops it rendering twice at desktop.

            ⚠️ IT IS A SIBLING OF THE LEFT <ul>, NOT INSIDE IT. Putting it in
            that list would inherit the list's own `hidden card:flex` and vanish
            on exactly the breakpoint this mount exists to serve. */}
        <div className="col-start-1 flex items-center card:hidden">
          <LocaleSwitcher />
        </div>

        {/* CENTRE — logo. A wordmark in the top-left (or here, top-centre) is
            expected to be the way home, and it was `href="#"`. It is the one
            link on the bar that is not labelled by its text — aria-label
            overrides the SVG's own <title> and its two <text> nodes, which
            otherwise concatenate into "Synergy Insurance GroupSYNERGY
            INSURANCE GROUP". No aria-current here: the visible Home link
            already carries it, and marking two elements as the current page
            makes a screen reader announce it twice. */}
        <Link
          href={routeHref(locale, "home")}
          aria-label={t("company")}
          className="col-start-2 flex items-center justify-self-center"
        >
          {/* The wordmark follows the surface. `light` is the wordmark
              recoloured to ink, which is right on cream and unreadable on the
              dark bar; `dark` is the gold artwork exactly as supplied — the
              same variant the footer already uses on the same #0D1B2A. Nothing
              is recoloured for this and no mark is invented.

              🔴 SUPERSEDED — THE HEADER NOW RENDERS THE SUPPLIED LOCKUP.
              `public/synergy-logo.svg`, 1120x340 (3.29:1), delivered 2026-08-02.
              It has now replaced the inline <Logo> at EVERY live placement —
              this bar, the mobile panel, the footer, the login navy panel and
              the Engine hub — via <LogoLockup>, which is the one place the file
              path, the alt policy and the sizing ladder live. The three notes
              below are why that swap is a trade, not a pure upgrade.

              1. IT HAS NO LIGHT VARIANT, AND CANNOT HAVE ONE. <Logo> recolours
                 its wordmark to ink #1A1A1A on light surfaces, for the reason
                 written above: gold type on cream is 2.09:1. This lockup bakes
                 the gold gradient (#FCE79A -> #A9790F) into the file, so the
                 same wordmark now ships on BOTH surfaces. That is legal —
                 WCAG 1.4.3 exempts "text that is part of a logo or brand name"
                 from contrast entirely — but it is a deliberate reversal of an
                 accessibility decision this codebase made on purpose, not an
                 oversight. Measured: the gradient's darkest stop #A9790F is
                 3.6:1 on cream, its lightest #FCE79A is 1.1:1.

              2. ITS SUBLINE IS BELOW READING SIZE HERE. "INSURANCE GROUP" is
                 47px in a 340px canvas. At `card:h-12` x the bar's scale(1.3333)
                 it renders 8.8px at rest and 6.6px scrolled. For 11px it would
                 need an 80px-tall lockup, and the scrolled bar is 70px. It
                 therefore functions as texture, not as type — acceptable only
                 because `aria-label` carries the full company name and the
                 subline says nothing the name does not.

              3. ITS WORDMARK IS LIVE <text>, NOT OUTLINES. font-family is
                 "Georgia, 'Times New Roman', serif" with no @font-face, so a
                 client without Georgia (most Linux, many Android) substitutes.
                 Measured: the lockup's content box is 4046px wide with Georgia
                 and 3823px without — a 5.5% shift, and different letterforms.
                 The fix is to outline the two <text> nodes to <path>; until
                 then the mark is not pixel-stable across platforms.

              WHY <img> AND NOT next/image: an SVG has no intrinsic raster to
              optimise, so the image pipeline would only add a proxy hop. It is
              `priority`-equivalent by being inline in the bar, and it must not
              lazy-load — it is above the fold on every route. */}
          {/* 🔴 `max-[359px]:h-9` IS CLEARANCE FOR THE EN/ES PILL, NOT TASTE.
              The logo is centred in its own grid column, so on a 320px viewport
              it starts at (320-111)/2 ≈ 106 — which is exactly where the
              switcher in column 1 ends. Measured: a 0px gap, the two flush
              against each other. Shrinking the PILL does not help, because the
              logo is centred rather than packed: it just moves to its natural
              centre and they touch again, which is what the first attempt at
              this proved. Taking the logo from 44px to 36px narrows it to ~91px
              and moves its centred left edge out to ~115, opening a real gap.
              360px and up is untouched — at 375 the two already clear by 10px. */}
          <LogoLockup className="site-header__logo h-11 w-auto max-[359px]:h-9 card:h-12" />
        </Link>

        {/* RIGHT — ends exactly on the headline's right edge */}
        <div className="col-start-3 flex items-center justify-end gap-8">
          <ul className="hidden items-center gap-8 card:flex">
            {RIGHT_LINKS.map((key) => (
              <li key={key}>
                <NavLink routeKey={key} className={linkClass} />
              </li>
            ))}
          </ul>

          {/* AGENT LOGIN — the portal's front door, public from today.
              ---------------------------------------------------------------
              🔴 THIS REVERSES A DELIBERATE DECISION, AND THE REASON IT WAS MADE
              NO LONGER HOLDS. /login was unlinked everywhere because the portal
              was design-only: HANDOFF records "NO backend, no auth, no session"
              and "NEITHER ROUTE IS PROTECTED... that is obscurity, not access
              control". Linking it then would have signposted an open /admin.

              That is now stale. Auth shipped: middleware.ts runs a FAIL-CLOSED
              Supabase gate on /admin (no verified user -> redirect to /login,
              and a thrown getUser also denies), and (portal)/admin/layout.tsx
              re-checks the user and reads the role from the database on every
              request. Two layers. So the thing the unlinking protected is now
              protected by auth, and a login link is just a login link.

              NOT `<NavLink>` AND NOT IN routes.ts. Both are for MARKETING
              routes: routes.ts is the list of public pages the header, the
              mobile panel and the footer all render, and adding `login` to it
              would put "Login" in the footer sitemap and the mobile nav as a
              seventh peer of Home/About/Services. This is a utility entry with
              one home — the top-right of the bar — so it is written here and
              PORTAL_PATHS in routes.ts stays absent from the nav lists.

              "AGENT LOGIN", NOT "LOGIN". There is no public signup (HANDOFF:
              "logins is on the client checklist, not automated"), so a bare
              "Login" invites a member of the public to look for an account they
              cannot create. The qualifier says who it is for before the click.

              TREATMENT: quieter than the nav links and much quieter than the
              Join pill — same 15px column but `font-medium` against their
              `font-semibold`, no pill, no border. It reads as utility chrome
              rather than a sixth destination competing with the CTA. */}
          {/* 🔴 MOVED TO THE UTILITY STRIP (2026-08-24), NOT DELETED. The strip
              above the nav row now carries "Agent Login" and "Apply to Work
              with Synergy", matching the reference this header was cloned
              toward. Rendering it here as well put the same words twice on one
              screen, 40px apart.

              `AGENT_LOGIN_LINK_READY` still gates the MOBILE panel entry below,
              so the flag keeps its job and its docblock above stays accurate —
              this is the desktop copy only. Restoring it is uncommenting this
              and removing the strip's copy.

          {AGENT_LOGIN_LINK_READY && (
            <Link
              href={`/${locale}/login`}
              className={`${linkClass} hidden !font-medium card:inline-block`}
            >
              {t("login")}
            </Link>
          )} */}

          {/* ADMIN ENTRY — RENDERS ONLY FOR A VERIFIED ADMIN.
              ---------------------------------------------------------------
              🔴 `isAdmin` IS THE SERVER'S VERDICT, not a client guess. It is
              computed in (site)/layout.tsx from getUserAndRole() — a verified
              user whose DB role is 'admin' — and passed in as a prop. For
              everyone else it is false and this link is NEVER RENDERED, so an
              agent or a logged-out visitor has no `/admin` link in their HTML at
              all. This is convenience, not a gate: the boundary is the
              middleware + the admin layout, both of which still deny a non-admin
              who reaches /admin by any other means. Not in routes.ts, for the
              same reason as the login link — it is a utility entry with one home
              (this bar), not a public marketing route, so it must not leak into
              the footer sitemap or the mobile nav list.
              `!font-semibold` (against login's `!font-medium`) so an admin's own
              tool reads a touch stronger than the generic portal door. */}
          {isAdmin && (
            <Link
              href={`/${locale}/admin`}
              className={`${linkClass} hidden !font-semibold card:inline-block`}
            >
              {t("admin")}
            </Link>
          )}

          {/* WAS the one destination on this bar that was not ours — an
              external target="_blank" link to join.fflsynergy.com. That
              subdomain now returns a Vercel 404 (see JOIN_URL_EXTERNAL_DEAD in
              routes.ts), so the pill points at our own /join route and the
              whole bar is internal again.

              🔴 THE PILL *IS* THE `join` ENTRY IN HEADER_ROUTES. It reads its
              href from the route list like every other item, so the bar cannot
              contain a destination the list does not know about, and the list
              cannot gain one the bar silently ignores.
              `HEADER_ROUTES_TEXT` is that list minus this key, and it is what
              the left/right split maps — otherwise "Join" would render as a
              seventh text link a few pixels from this pill, and the split
              around the centred logo would be thrown off (it would go 5/2
              instead of the intended 4/2). */}
          <Link
            href={routeHref(locale, HEADER_PILL_ROUTE)}
            // The pill is a nav item now, so it marks the current page like
            // every other one. Without this, /join was the only route in the
            // bar that never announced itself as current. The visible half is
            // `.nav-pill[aria-current]` in globals.css — a rule under the
            // label, the same SHAPE the text links use, because 1.4.1 is not
            // satisfied by a fill colour alone.
            aria-current={
              isCurrentRoute(pathname, locale, HEADER_PILL_ROUTE)
                ? "page"
                : undefined
            }
            className="nav-pill hidden h-10 items-center rounded-full px-6 text-[15px] font-semibold card:inline-flex"
          >
            {t("join")}
          </Link>

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
            {/* 36px — deliberately below the 48px header reference; this is
                a panel header, not the bar. */}
            <LogoLockup className="h-9 w-auto" />
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
            {/* HEADER_ROUTES_TEXT, not the left/right split — the panel is one
                stacked list, so it takes the nav's real order rather than
                re-joining two halves that only exist because of the logo.
                🔴 TEXT, not the full list: `join` is in HEADER_ROUTES but the
                CTA below renders it, and mapping the full list here printed
                "Join" twice in the open panel — once as a row and once as the
                button under it. */}
            {HEADER_ROUTES_TEXT.map((key) => (
              <NavLink
                key={key}
                routeKey={key}
                onClick={close}
                className="nav-link border-b border-navy/10 py-5 font-display text-[26px] font-medium tracking-[-0.01em] text-navy"
              />
            ))}

            {/* Same repoint as the desktop pill — /join, same tab. */}
            <Link
              href={routeHref(locale, HEADER_PILL_ROUTE)}
              onClick={close}
              aria-current={
                isCurrentRoute(pathname, locale, HEADER_PILL_ROUTE)
                  ? "page"
                  : undefined
              }
              className="nav-pill mt-8 inline-flex h-14 w-full items-center justify-center rounded-full bg-navy text-[16px] font-semibold text-cream"
            >
              {t("join")}
            </Link>

            {/* AGENT LOGIN — the panel's copy of the bar's utility link.
                The desktop entry is `hidden card:inline-block`, so without this
                the portal would be unreachable on every phone: a real feature
                that exists only above 900px. It sits BELOW the Join CTA and in
                the quiet type, not in the big stacked list above, because it is
                the same kind of thing here as it is up there — chrome, not a
                destination competing with the nav.
                Navy on cream, 15.87:1. */}
            {AGENT_LOGIN_LINK_READY && (
              <Link
                href={`/${locale}/login`}
                onClick={close}
                /* `py-2.5` with `mt-4` rather than a bare `mt-6`: measured at
                   23px tall on a 375px phone, the smallest target in the open
                   panel. The padding takes it to 43px and the reduced margin
                   gives back the 8px the padding added, so the gap above it
                   still reads as the 24px it was. */
                className="mt-4 self-start py-2.5 text-[15px] font-medium text-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
              >
                {t("login")}
              </Link>
            )}

            {/* The mobile twin of the admin entry. Same server-side gate — the
                desktop link is `hidden card:inline-block`, so without this an
                admin on a phone would have no way to the panel. Rendered only
                when isAdmin; a non-admin's panel never contains it. */}
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                onClick={close}
                /* Same touch-target padding as the login link above it. */
                className="mt-2 self-start py-2.5 text-[15px] font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
              >
                {t("admin")}
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
