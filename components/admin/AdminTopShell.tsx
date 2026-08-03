"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/[locale]/(portal)/admin/actions";
import dynamic from "next/dynamic";

/** Code-split for the same reason as EngineNoise: a canvas has no server
 *  markup, and this one is `fixed inset-0` behind the dashboard, so it cannot
 *  shift layout. Keeps the OKLab/fbm shader out of the admin's first load. */
const AdminSilk = dynamic(() => import("./AdminSilk"), { ssr: false });

/**
 * THE ADMIN CHROME — TOP BAR (replaces the left sidebar, on instruction).
 *
 * =============================================================================
 * 🔴 WHY A NEW COMPONENT RATHER THAN AN EDIT TO AdminShell. `AdminShell` is a
 * client component carrying a focus-trapped off-canvas drawer, a collapsible
 * desktop rail, body-scroll locking and Escape handling — all solved and all
 * irrelevant to a top bar. Rewriting it in place would have meant deleting that
 * work to reach a different layout, with no way back. This is a sibling;
 * `AdminShell` stays in the tree, unused, so the rail is a one-line revert.
 *
 * 🔴 IT DOES NOT AUTHENTICATE ANYTHING. Chrome only. The boundary is
 * `(portal)/admin/layout.tsx` + middleware, both untouched. `signOut` is
 * imported unchanged and posts the same `locale` field it always did.
 *
 * =============================================================================
 * §LAYOUT — one sticky bar, three zones, and nothing that scrolls away.
 *
 *   left    wordmark + section nav (in-page anchors, as the rail's were)
 *   right   the signed-in identity + sign out
 *   below   the greeting and page title, in the content column
 *
 * NAV ITEMS ARE STILL IN-PAGE ANCHORS, not routes — `#leads`, `#agents`,
 * `#content` point at headings that exist on this one page. /admin/leads does
 * not exist and linking to it would be the `href="#"` problem in a new costume.
 * That was true of the rail and is unchanged.
 *
 * 🔴 THE ACTIVE SECTION IS TRACKED, AND IT IS NOT `:target`. An
 * IntersectionObserver marks whichever section owns the viewport, so the bar
 * says where you are even when you scroll by hand rather than by clicking. It
 * sets `aria-current="true"` (not `"page"` — these are fragments within one
 * page, and `page` would claim the link points at a different document).
 *
 * §MOTION — the underline slides between items. Dropped entirely under
 * `prefers-reduced-motion`, where the marker simply appears.
 *
 * §AA — every value on this bar is measured against the bar's own surface,
 * which is an OPAQUE-ENOUGH cream over the silk (see `.admin-topbar` in
 * globals.css). Nothing here is measured against the raw shader.
 */

const NAV = [
  { key: "dashboard", href: "#admin-main" },
  { key: "leads", href: "#leads" },
  { key: "agents", href: "#agents" },
  { key: "content", href: "#content" },
] as const;

/* ---------------------------------------------------------------------------
   HIDE-ON-SCROLL — THE PUBLIC HEADER'S MECHANIC, AND ITS MEASURED CONSTANTS.
   `SiteHeader.tsx` already solved this; the values are lifted from it verbatim
   so the two bars behave identically rather than "similarly".

   🔴 THE DEBOUNCE IS AN ACCUMULATOR, NOT A TIMER, and that is the whole reason
   it does not flicker. A time-based debounce adds latency to the one gesture
   that has to feel instant (a decisive scroll-up must reveal immediately). This
   instead accumulates movement and only flips when a direction change has
   travelled DIR_DELTA px; the accumulator RESETS the moment direction changes,
   so a firm reversal clears it at once and sub-pixel jitter never does.

   🔴 WHAT IS *NOT* COPIED: SiteHeader also polls for a Lenis instance and
   subscribes to its emitter, because the public site is inside SmoothScroll and
   Lenis swallows most native scroll events. THE PORTAL IS DELIBERATELY OUTSIDE
   SmoothScroll (see (site)/layout.tsx — the portal must not render inside a
   transformed ancestor), so there is no Lenis here and the native listener is
   the whole story. Adding the Lenis polling would be dead code waiting 4s for
   an instance that never arrives.
--------------------------------------------------------------------------- */
/** Below this the bar is NEVER hidden — past its own height, so it cannot
 *  begin sliding away while it still overlaps where it started. */
const HIDE_AFTER = 120;
/** Accumulated px before a direction change flips visibility. 8 is far below a
 *  wheel notch (~100px) yet above the sub-pixel noise of momentum scrolling. */
const DIR_DELTA = 8;

/**
 * 🔴 THE GREETING IS COMPUTED ON THE CLIENT, AND THAT IS DELIBERATE.
 * Rendering it on the server would use the SERVER's clock and time zone — a
 * Vercel box in another region — so an admin in Orlando could be told "Good
 * evening" at 2pm. `new Date().getHours()` here is the reader's own local time.
 *
 * The cost is a hydration mismatch if it rendered during SSR, so it is held
 * behind a mounted flag and renders nothing on the first paint. That is a
 * deliberate flash-of-nothing on one line of text, chosen over being wrong.
 *
 * Boundaries: < 12 morning, < 18 afternoon, else evening.
 */
function useGreetingKey(): "greetMorning" | "greetAfternoon" | "greetEvening" | null {
  const [key, setKey] = useState<
    "greetMorning" | "greetAfternoon" | "greetEvening" | null
  >(null);
  useEffect(() => {
    const h = new Date().getHours();
    setKey(h < 12 ? "greetMorning" : h < 18 ? "greetAfternoon" : "greetEvening");
  }, []);
  return key;
}

/**
 * HONORIFICS, keyed by the email's local-part (lowercased).
 *
 * 🔴 A MAP, NOT A HARD-CODED "Dr." ON THE GREETING. The client asked for
 * "Good morning, Dr. Aiman". Prefixing every admin with a doctorate would be
 * wrong the moment a second one exists — and inventing a title for someone is a
 * worse error than omitting one. Anyone not listed here gets their name alone,
 * which is the safe default.
 *
 * 🟡 THIS IS THE STOPGAP, NOT THE RIGHT HOME. An honorific is a fact about a
 * PERSON and belongs on their record: `public.profiles` already has a
 * `full_name` column (0001) that nothing currently reads. The proper fix is to
 * select it in `getUserAndRole` and render it — but that is a DATA-PATH change,
 * and this pass is design-only. When `full_name` is wired up, delete this map
 * and read the stored name instead.
 *
 * "Dr." rather than "Doctor" because that is the form the client wrote in their
 * own brief. One string to change if the spelled-out version is wanted.
 */
const TITLES: Record<string, string> = {
  aiman: "Dr.",
};

/**
 * The display name for the greeting. The admin's identity arrives as an EMAIL
 * (that is what `getUserAndRole` returns), so the local-part is title-cased:
 * `aiman@fflsynergy.com` -> "Dr. Aiman". Dots and underscores become spaces so
 * `first.last` reads as a name.
 *
 * 🔴 IT IS DERIVED, NOT AUTHORED. Hard-coding "Aiman" would be wrong the moment
 * a second admin exists, and there is no `full_name` on the profile read path —
 * adding one would be a DATA change, which this pass is forbidden from making.
 * If a real display name is wanted later, `profiles.full_name` already exists in
 * the schema and only the read needs extending.
 */
function displayName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const title = TITLES[local.trim().toLowerCase()];
  const name =
    local
      .replace(/[._-]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || email;

  return title ? `${title} ${name}` : name;
}

export default function AdminTopShell({
  children,
  locale,
  userLabel,
  userRole,
}: {
  children: React.ReactNode;
  locale: string;
  /** The signed-in admin's email — real, from the server (getUserAndRole). */
  userLabel: string;
  /** Their role label, already translated. */
  userRole: string;
}) {
  const t = useTranslations("admin");
  const greetKey = useGreetingKey();
  const [active, setActive] = useState<string>("dashboard");
  const [hidden, setHidden] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);

  /* Hide on scroll down, reveal on scroll up. See the constants above for why
     the debounce is an accumulator rather than a timer. */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;
    let accum = 0;
    let lastDir = 0;

    const read = () => {
      const y = window.scrollY;

      /* 🔴 REDUCED MOTION SWITCHES THE BEHAVIOUR OFF RATHER THAN MAKING IT
         INSTANT. Snapping a bar in and out of existence is a jump-cut, which is
         worse for someone asking for less motion than simply leaving it put.
         Same call SiteHeader makes. */
      if (reduce.matches) {
        setHidden(false);
        lastY = y;
        return;
      }

      const delta = y - lastY;
      lastY = y;

      // Near the top, direction is ignored entirely.
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
    return () => window.removeEventListener("scroll", read);
  }, []);

  /* 🔴 KEYBOARD FOCUS FORCES THE BAR VISIBLE. Tabbing to a link sitting at
     translateY(-100%) is a focus trap in the literal sense: the element is
     focusable and its focus ring is off-screen. `focusout` only releases when
     focus has genuinely left the bar — a relatedTarget still inside means the
     user is tabbing BETWEEN bar items, which must not drop it. SiteHeader
     documents the same trap; repeating the guard rather than repeating the bug. */
  useEffect(() => {
    const el = barRef.current;
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

  /* Which section owns the viewport. `rootMargin` biases the trigger line to
     the upper third so a section counts as active once its heading is
     comfortably in view, not when its last pixel scrolls past. */
  useEffect(() => {
    const ids = ["admin-main", "leads", "agents", "content"];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!hit) return;
        const id = hit.target.id;
        setActive(id === "admin-main" ? "dashboard" : id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const name = displayName(userLabel);

  return (
    <div className="admin-page relative min-h-screen">
      {/* THE BACKDROP. Fixed, behind everything, and covered by a heavy scrim —
          see AdminSilk's header for why no data is ever composited over it. */}
      <div aria-hidden="true" className="admin-silk-layer">
        <AdminSilk className="h-full w-full" />
        <div className="admin-silk-scrim" />
      </div>

      <a href="#admin-main" className="admin-skip">
        {t("skipToContent")}
      </a>

      {/* ---------- THE BAR ----------
          `data-hidden` drives the transform in globals.css. Focus wins over
          scroll: a hidden bar with a focused link inside it is unusable. */}
      <header
        ref={barRef}
        data-hidden={hidden && !focusWithin ? "true" : "false"}
        className="admin-topbar"
      >
        <div className="admin-topbar__inner">
          <div className="admin-topbar__brand">
            <span className="admin-wordmark">Synergy</span>
            <span aria-hidden="true" className="admin-topbar__divider" />
            <nav ref={navRef} aria-label={t("navLabel")} className="admin-nav">
              {NAV.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  aria-current={active === item.key ? "true" : undefined}
                  className="admin-nav__link"
                >
                  {t(`nav.${item.key}`)}
                </a>
              ))}
            </nav>
          </div>

          <div className="admin-topbar__user">
            <span className="admin-topbar__identity">
              <span className="admin-topbar__email">{userLabel}</span>
              <span className="admin-topbar__role">{userRole}</span>
            </span>
            {/* Unchanged: the same server action, the same `locale` field. */}
            <form action={signOut}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="admin-signout">
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ---------- CONTENT ---------- */}
      <main id="admin-main" className="admin-main">
        {/* 🔴 THE GREETING IS THE PAGE'S OPENING STATEMENT NOW, NOT A CAPTION.
            It shipped as a 14px ink/70 line and read as metadata — the client's
            word was "too subtle". It is now display-face, clamp(30px..44px),
            full ink, and the first thing on the page.

            🔴 IT IS NOT AN <h1>, AND THAT IS DELIBERATE. The dashboard's h1 is
            "Dashboard" — it names the page. A greeting names nobody, and making
            it the h1 would tell a screen reader the page is called "Good
            morning, Aiman". So it is a <p> that merely LOOKS like the largest
            thing here, with the real h1 immediately after, demoted visually
            rather than structurally.

            `aria-live="polite"` because it appears after mount (client clock —
            see the hook) and would otherwise be inserted silently. */}
        <p className="admin-greeting" aria-live="polite">
          {/* Nothing until mounted. The line is reserved by
              `.admin-greeting { min-height }` in globals.css rather than by a
              placeholder character — an invisible NBSP in source is a trap. */}
          {greetKey ? t(greetKey, { name }) : null}
        </p>
        {children}
      </main>
    </div>
  );
}
