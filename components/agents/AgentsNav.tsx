"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * THE AGENTS NAV — one level of nesting, rendered as a dropdown.
 *
 * =============================================================================
 * 🔴 IT IS BUILT FROM THE CMS, NOT FROM A CONSTANT. The portal's previous nav
 * read `lib/portal/sections.ts`, a hand-maintained list, because the four
 * sections were hardcoded React. These items are rows: whatever Aiman publishes
 * appears here, and whatever he unpublishes leaves. The registry file's whole
 * reason for existing — "four surfaces that can disagree about what exists" —
 * is answered by the database instead.
 *
 * 🔴 A PARENT WITH CHILDREN IS A LINK **AND** A BUTTON — SUPERSEDED 2026-08-24.
 * It used to be a button alone, because "New Agent Bootcamps" was a container
 * with no sections of its own and a link would have landed on an empty page.
 * That is no longer true: the page carries real content, and the button-only
 * version was reported as broken — clicking the item named after a page did not
 * open that page, it opened a menu.
 *
 * So the label is a `<Link>` to the page and the chevron beside it is a
 * `<button aria-expanded>` for the menu. Each control does one job and says so
 * to a screen reader, which a single element doing both cannot.
 *
 * A parent with NO children is still a plain link — Aiman can add a page today
 * and give it children next month, and the nav has to be right in both states.
 *
 * =============================================================================
 * §BEHAVIOUR, and why each piece is here rather than left to CSS.
 *
 *   · Click to open. NOT hover: hover menus are unusable on touch, and this
 *     nav's primary audience is an agent on a phone working through a checklist.
 *   · Escape closes and returns focus to the trigger — otherwise focus is left
 *     inside a menu that is no longer visible.
 *   · Pointer-down outside closes. `mousedown`, not `click`, so the menu is gone
 *     before the click lands on whatever is underneath.
 *   · The open menu closes on navigation (the pathname effect). Without it, the
 *     panel survives the client-side transition and hangs over the new page.
 *
 * §AA — the same measured values as PortalChrome's tab strip: ink on white
 * 17.41:1 active, ink/70 6.34:1 inactive, gold-deep 5.65:1 for the underline and
 * the focus ring. `gold` appears nowhere as a graphic on this surface; it cannot
 * reach 3:1 on white (2.29:1).
 */

export type NavItem = {
  slug: string;
  title: string;
  isProtected: boolean;
  children: { slug: string; title: string; isProtected: boolean }[];
};

/** A small padlock. Marks a page whose content needs a password — so an agent
 *  knows to ask for one BEFORE clicking, rather than after. `aria-hidden`; the
 *  accessible name carries the word instead. */
function Lock() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0 fill-current opacity-70">
      <path d="M6 0.75A2.4 2.4 0 0 0 3.6 3.15V4.5h-.35A.75.75 0 0 0 2.5 5.25v5A.75.75 0 0 0 3.25 11h5.5a.75.75 0 0 0 .75-.75v-5a.75.75 0 0 0-.75-.75H8.4V3.15A2.4 2.4 0 0 0 6 .75Zm1.2 3.75H4.8V3.15a1.2 1.2 0 1 1 2.4 0V4.5Z" />
    </svg>
  );
}

export default function AgentsNav({
  locale,
  items,
  overviewLabel,
  navLabel,
  protectedLabel,
  adminHref,
  adminLabel,
}: {
  locale: string;
  items: NavItem[];
  overviewLabel: string;
  navLabel: string;
  /** Appended to the accessible name of a gated page: "…, password required". */
  protectedLabel: string;
  /** Present only for an admin — the nav does not decide who is one. */
  adminHref?: string;
  adminLabel?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close on navigation. Without this the panel outlives the route change.
  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(null);
      // Focus goes back to the trigger, not nowhere.
      const trigger = navRef.current?.querySelector<HTMLButtonElement>(
        `[data-menu-trigger="${open}"]`,
      );
      trigger?.focus();
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const overviewHref = `/${locale}/agents`;
  const isOverview = pathname === overviewHref;

  /** A page is current when the URL ends in its slug. `endsWith` rather than an
   *  exact match so the locale prefix does not have to be reconstructed here. */
  const isCurrent = (slug: string) => pathname.endsWith(`/agents/${slug}`);
  /** A parent is highlighted when one of its children is the current page. */
  const hasCurrentChild = (item: NavItem) => item.children.some((c) => isCurrent(c.slug));

  const base =
    "relative inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap px-1 text-[14px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none";
  const on = "font-medium text-ink";
  const off = "text-ink/70 hover:text-ink";
  const underline =
    "after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-gold-deep after:content-['']";

  return (
    <nav ref={navRef} aria-label={navLabel} className="border-b border-ink/[0.12] bg-white">
      {/* Horizontally scrollable rather than wrapping: a nav that grows to two
          rows as pages are added pushes the page content down by a line at an
          arbitrary future moment. */}
      <ul className="mx-auto flex max-w-[1180px] items-stretch gap-5 overflow-x-auto px-5 sm:gap-7 sm:px-8">
        <li>
          <Link
            href={overviewHref}
            aria-current={isOverview ? "page" : undefined}
            className={`${base} ${isOverview ? `${on} ${underline}` : off}`}
          >
            {overviewLabel}
          </Link>
        </li>

        {items.map((item) => {
          const current = isCurrent(item.slug) || hasCurrentChild(item);

          // ---- container: a menu, not a destination ----
          if (item.children.length > 0) {
            const isOpen = open === item.slug;
            return (
              <li key={item.slug} className="relative">
                {/* 🔴 THE LABEL IS A LINK AND THE CHEVRON IS A BUTTON — TWO
                    CONTROLS, NOT ONE. This whole item used to be a single
                    <button>, on the reasoning recorded above: "New Agent
                    Bootcamps is a container: it has no sections of its own, so
                    a link to it would land on an empty page."

                    THAT REASONING EXPIRED. The page has real content now, and
                    the old behaviour was reported as a bug in exactly the words
                    you would expect — clicking the thing named after a page did
                    not go to that page. A parent that is BOTH a destination and
                    a menu needs both affordances, and collapsing them into one
                    control means one of the two jobs always loses.

                    ⚠️ THE CHEVRON KEEPS `data-menu-trigger`. The Escape handler
                    above returns focus by querying that attribute, so moving it
                    to the link would send focus to the wrong element and the
                    menu would reopen on the next Enter. */}
                <span className="relative inline-flex items-center">
                  <Link
                    href={`/${locale}/agents/${item.slug}`}
                    aria-current={isCurrent(item.slug) ? "page" : undefined}
                    className={`${base} ${current ? `${on} ${underline}` : off}`}
                  >
                    {item.title}
                  </Link>
                  <button
                    type="button"
                    data-menu-trigger={item.slug}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-label={`${item.title} — ${item.children.length}`}
                    onClick={() => setOpen(isOpen ? null : item.slug)}
                    className={`inline-flex min-h-[44px] items-center px-1.5 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none ${
                      current ? on : off
                    }`}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 10 10"
                      className={`h-[9px] w-[9px] shrink-0 fill-none stroke-current stroke-[1.6] transition-transform duration-200 motion-reduce:transition-none ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path d="M2 3.75 5 6.75l3-3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>

                {isOpen ? (
                  <ul className="absolute left-0 top-full z-40 mt-px min-w-[15rem] rounded-lg border border-ink/[0.12] bg-white py-1.5 shadow-[0_8px_24px_rgba(11,31,58,0.10)]">
                    {item.children.map((child) => (
                      <li key={child.slug}>
                        <Link
                          href={`/${locale}/agents/${child.slug}`}
                          aria-current={isCurrent(child.slug) ? "page" : undefined}
                          className={`flex min-h-[40px] items-center gap-2 px-4 py-2 text-[14px] transition-colors duration-200 hover:bg-gold/[0.10] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none ${
                            isCurrent(child.slug) ? "font-medium text-ink" : "text-ink/80"
                          }`}
                        >
                          <span>{child.title}</span>
                          {child.isProtected ? (
                            <>
                              <Lock />
                              <span className="sr-only">, {protectedLabel}</span>
                            </>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          }

          // ---- ordinary page ----
          return (
            <li key={item.slug}>
              <Link
                href={`/${locale}/agents/${item.slug}`}
                aria-current={current ? "page" : undefined}
                className={`${base} ${current ? `${on} ${underline}` : off}`}
              >
                <span>{item.title}</span>
                {item.isProtected ? (
                  <>
                    <Lock />
                    <span className="sr-only">, {protectedLabel}</span>
                  </>
                ) : null}
              </Link>
            </li>
          );
        })}

        {/* 🔴 THE ADMIN LINK IS RENDERED ONLY WHEN THE SERVER PASSED ONE, and
            the server passes one only for role='admin' read from the database.
            This component performs no authorisation — hiding a link is not
            access control, and /admin has two real guards of its own. */}
        {adminHref && adminLabel ? (
          <li className="ml-auto">
            <Link
              href={adminHref}
              className={`${base} ${off} font-medium`}
            >
              {adminLabel}
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
