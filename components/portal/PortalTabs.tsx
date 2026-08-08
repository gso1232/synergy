"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

/**
 * THE SECTION TABS — the only client component in the portal, and it earns it.
 *
 * 🔴 WHY IT CANNOT BE A SERVER COMPONENT. The tabs live in `welcome/layout.tsx`
 * so they persist across all five routes without re-rendering, but a layout
 * cannot read its child's route params — `/welcome/licensing` knows it is
 * "licensing", the layout above it does not. The alternatives were worse:
 * render the chrome inside every page (five copies of the bar, five chances to
 * pass the wrong active key), or thread the segment through a context provider
 * (a client component either way, with more moving parts).
 *
 * `useSelectedLayoutSegment()` returns exactly the child segment — `null` on the
 * overview index, the section key beneath it. Roughly 20 lines of client JS for
 * correct active state on every route, forever.
 *
 * 🔴 `aria-current="page"` IS CORRECT HERE, unlike the admin's in-page anchors
 * where `"true"` was used. These tabs point at genuinely different documents.
 *
 * §AA — measured composited on white #FFFFFF:
 *     ink        17.41:1  active label
 *     ink/70      6.34:1  inactive label
 *     gold-deep   5.65:1  active underline (state, so 1.4.11's 3:1 binds) and
 *                         the outstanding-detail chip
 * `gold` is 2.29:1 here and appears nowhere.
 */
export default function PortalTabs({
  tabs,
  navLabel,
  gapTitle,
}: {
  tabs: { key: string; href: string; label: string; gaps: number }[];
  navLabel: string;
  /** e.g. "{n} details still needed" — {n} is substituted here. */
  gapTitle: string;
}) {
  const segment = useSelectedLayoutSegment();
  const active = segment ?? "overview";

  return (
    <nav
      aria-label={navLabel}
      className="border-b border-ink/[0.12] bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="mx-auto flex max-w-[1180px] gap-1 overflow-x-auto px-3 sm:px-6">
        {tabs.map((tab) => {
          const on = tab.key === active;
          return (
            <li key={tab.key} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={on ? "page" : undefined}
                className={[
                  "relative flex min-h-[44px] items-center gap-1.5 whitespace-nowrap px-3 text-[14px]",
                  "transition-colors duration-200 motion-reduce:transition-none",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-deep",
                  on ? "font-medium text-ink" : "text-ink/70 hover:text-ink",
                ].join(" ")}
              >
                {tab.label}
                {tab.gaps > 0 ? (
                  /* The outstanding-detail count on the tab itself, so the
                     portal's incompleteness is visible without opening a
                     section. Not colour-alone: it is a number in a chip. */
                  <span
                    className="rounded-full border border-gold-deep/35 bg-gold/[0.10] px-1.5 py-px font-mono text-[10px] font-medium leading-[1.5] text-gold-deep"
                    title={gapTitle.replace("{n}", String(tab.gaps))}
                  >
                    {tab.gaps}
                  </span>
                ) : null}
                {on ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-gold-deep"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
