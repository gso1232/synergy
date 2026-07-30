"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * The admin chrome: collapsible sidebar + sticky top header.
 *
 * WHY `position: fixed` IS SAFE HERE AND WOULD NOT HAVE BEEN BEFORE. This
 * component only works because the portal routes live in `(portal)/`, OUTSIDE
 * SmoothScroll. Lenis transforms the scroll container, and a fixed child of a
 * transformed ancestor is positioned against that ancestor, not the viewport —
 * the trap SiteHeader's mobile panel and LocaleSwitcher both document. Do not
 * move these routes back under the site group.
 *
 * TWO MODES, one component:
 *   >= lg  a permanent rail, collapsible to icons. The toggle carries
 *          `aria-expanded` + `aria-controls`, so its state is announced.
 *   <  lg  an off-canvas drawer over a scrim: `role="dialog"` + `aria-modal`,
 *          Escape closes, focus moves to the panel on open and returns to the
 *          trigger on close, and the body scroll locks while it is open.
 *
 * NAV ITEMS ARE IN-PAGE ANCHORS, not routes. The dashboard is one page with
 * three sections; /admin/leads does not exist, and linking to it would be the
 * `href="#"` problem in a new costume. They are real `#leads` / `#agents` /
 * `#content` fragment links to headings that exist on this page.
 *
 * PREFERS-REDUCED-MOTION: the width/translate transitions are dropped via
 * `motion-reduce:` — the panel still opens and closes, it just arrives.
 */
const NAV = [
  { key: "dashboard", href: "#admin-main", icon: "▦" },
  { key: "leads", href: "#leads", icon: "◉" },
  { key: "agents", href: "#agents", icon: "◈" },
  { key: "content", href: "#content", icon: "▤" },
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop rail
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Escape to close, focus into the panel on open, focus back to the trigger on
  // close, and lock the background scroll while the drawer is over the page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      triggerRef.current?.focus();
    };
  }, [open]);

  const navList = (
    <ul className="flex flex-col gap-1">
      {NAV.map((n) => (
        <li key={n.key}>
          <a
            href={n.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded px-3 py-2.5 text-[14px] text-cream hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
          >
            <span aria-hidden="true" className="w-5 shrink-0 text-center text-gold">
              {n.icon}
            </span>
            <span className={collapsed ? "lg:sr-only" : ""}>{t(`nav.${n.key}`)}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Skip link — first tab stop, hidden until focused. */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-navy focus:px-4 focus:py-2 focus:text-cream"
      >
        {t("skipToContent")}
      </a>

      {/* ---------- Desktop rail ---------- */}
      <aside
        id="admin-sidebar"
        aria-label={t("sidebarLabel")}
        className={`fixed inset-y-0 left-0 z-30 hidden shrink-0 flex-col bg-navy p-4 transition-[width] duration-200 motion-reduce:transition-none lg:flex ${
          collapsed ? "w-[76px]" : "w-[240px]"
        }`}
      >
        <p className={`px-3 pb-4 font-display text-[15px] text-gold ${collapsed ? "sr-only" : ""}`}>
          Synergy
        </p>
        <nav className="flex-1">{navList}</nav>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="admin-sidebar"
          className="mt-4 rounded px-3 py-2 text-left text-[13px] text-cream hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
        >
          {collapsed ? t("sidebarOpen") : t("sidebarClose")}
        </button>
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy/60 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t("sidebarLabel")}
            className="fixed inset-y-0 left-0 z-50 flex w-[260px] max-w-[80vw] flex-col bg-navy p-4 lg:hidden"
          >
            <div className="flex items-center justify-between pb-4">
              <p className="px-1 font-display text-[15px] text-gold">Synergy</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded px-2 py-1 text-[13px] text-cream hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
              >
                {t("sidebarClose")}
              </button>
            </div>
            <nav className="flex-1">{navList}</nav>
          </div>
        </>
      ) : null}

      {/* ---------- Content column ---------- */}
      <div className={`transition-[padding] duration-200 motion-reduce:transition-none ${collapsed ? "lg:pl-[76px]" : "lg:pl-[240px]"}`}>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink/15 bg-cream/95 px-4 py-3 backdrop-blur md:px-6">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="admin-sidebar"
            className="rounded border border-ink/30 px-3 py-1.5 text-[13px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep lg:hidden"
          >
            {t("sidebarOpen")}
          </button>
          <p className="font-display text-[15px] text-ink">{t("nav.dashboard")}</p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right text-[13px] leading-tight text-ink sm:block">
              {t("userName")}
              <span className="block text-ink/70">{t("userRole")}</span>
            </span>
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[13px] font-semibold text-gold"
            >
              SU
            </span>
          </div>
        </header>

        <main id="admin-main" className="px-4 py-8 md:px-6 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
