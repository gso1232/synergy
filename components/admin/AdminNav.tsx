"use client";

import { useEffect, useRef, useState } from "react";

/**
 * THE ADMIN SECTION NAV — in-page anchors, with an active state that is actually
 * correct.
 *
 * =============================================================================
 * 🔴 WHAT WAS BROKEN, MEASURED ON THE BUILT PAGE BEFORE THIS REWRITE.
 *
 * The links themselves were fine — all four targets existed and scrolled to
 * within 2px of their section. The ACTIVE STATE was wrong at nearly every
 * position on the page:
 *
 *     scrollY    0  ->  "Leads"    (should be Dashboard)
 *     scrollY  900  ->  "Leads"
 *     scrollY 1800  ->  "Agents"
 *     scrollY 2700  ->  "Agents"
 *     scrollY 3600  ->  "Agents"   (Content starts at 2862)
 *     click Leads   ->  "Dashboard"
 *     click Agents  ->  "Leads"
 *     click Content ->  "Leads"
 *
 * THE CAUSE: the old IntersectionObserver watched the section HEADINGS, and
 * every one of those headings is `sr-only` — measured 1×1px, `position:
 * absolute`, clipped. A 1px target intersects the viewport in a razor-thin
 * scroll band and misses entirely at any speed, so the observer fired almost at
 * random and the last value stuck. Watching a 1px element to answer "which
 * section fills the screen" cannot work at any threshold.
 *
 * THE FIX: observe the `<section>` ELEMENTS, which are hundreds of pixels tall,
 * and pick the topmost one whose box is under the bar. `rootMargin` discounts
 * the sticky bar's own height so a section counts as active when it reaches the
 * bar rather than the viewport's true top.
 *
 * 🔴 IT RESOLVES BY POSITION, NOT BY EVENT ORDER. The old code set state from
 * whichever entry happened to fire last, which is why clicking one link lit up
 * the previous one. Every callback here recomputes from the full set of
 * currently-intersecting sections and takes the highest, so the answer does not
 * depend on the order the browser reports them.
 *
 * 🔴 `aria-current="true"`, NOT `"page"`. These are fragments of one document.
 * `page` would claim the link points at a different page — which is exactly
 * what the PORTAL's tabs do, and why they use `"page"` and this does not.
 */
export type AdminNavItem = { key: string; href: string; label: string };

export default function AdminNav({
  items,
  label,
  /** Height of the sticky chrome above the content, in px. */
  barOffset,
}: {
  items: AdminNavItem[];
  label: string;
  barOffset: number;
}) {
  const [active, setActive] = useState<string>(items[0]?.key ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  /* 🔴 A STABLE DEPENDENCY. `items` is rebuilt inline by the parent on every
     render, so depending on the array itself tore the observer down and rebuilt
     it on every `setActive` — the observer spent its life reconnecting and
     missed updates. The href list is the only thing this effect actually reads. */
  const idKey = items.map((i) => i.href).join(",");

  useEffect(() => {
    const ids = idKey.split(",").map((h) => h.replace(/^#/, ""));
    const nodes = ids
      .map((id) => {
        const el = document.getElementById(id);
        /* The id sits on an sr-only heading; the thing worth observing is the
           SECTION that heading names. Fall back to the element itself for
           `admin-main`, which is the <main> and has no section wrapper. */
        return { id, node: (el?.closest("section") as HTMLElement | null) ?? el };
      })
      .filter((x): x is { id: string; node: HTMLElement } => !!x.node);

    if (!nodes.length) return;

    const recompute = () => {
      /* Topmost section whose top edge has passed under the bar. Reading
         positions directly rather than trusting entry order is what makes the
         result stable — see the docblock. */
      let current = nodes[0].id;
      for (const { id, node } of nodes) {
        /* 🔴 THE SLOP IS NOT FUDGE, IT MATCHES `scroll-margin-top`. Clicking an
           anchor parks the section at `scroll-margin-top` (116px), which is
           BELOW the 108px bar — so a strict `top <= barOffset` test judged the
           section "not reached yet" and lit the previous item. Measured: every
           anchor lands its section at top 117. The tolerance absorbs that gap
           and any sub-pixel rounding. */
        if (node.getBoundingClientRect().top <= barOffset + 16) current = id;
      }
      /* At the very bottom the last section may never reach the bar on a short
         page; if we are within a viewport of the end, take the last one. */
      const atEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atEnd) current = nodes[nodes.length - 1].id;
      setActive(current);
    };

    recompute();

    /* An IntersectionObserver wakes the recompute cheaply; the recompute itself
       reads geometry, so it is correct even when the observer batches. A bare
       scroll listener would also work but runs on every frame of a momentum
       scroll for no gain. */
    const io = new IntersectionObserver(recompute, {
      rootMargin: `-${barOffset}px 0px 0px 0px`,
      threshold: [0, 0.01, 0.5, 1],
    });
    nodes.forEach(({ node }) => io.observe(node));
    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
    };
  }, [idKey, barOffset]);

  /* Keep the active tab in view in the phone-width scroller.
     🔴 IT SETS `scrollLeft` AND MUST NOT USE `scrollIntoView`. The first version
     called `scrollIntoView({ inline: "nearest", block: "nearest" })`, and
     `block: "nearest"` is still a VERTICAL instruction — it scrolled the PAGE to
     bring the bar into view, which fired the observer, which changed `active`,
     which scrolled again. Measured symptom: the highlight froze partway down the
     page because the effect was fighting the user's own scrolling. Writing
     `scrollLeft` on the list cannot touch the document scroll position. */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-key="${active}"]`);
    if (!el) return;
    const left = el.offsetLeft;
    const right = left + el.offsetWidth;
    const viewL = list.scrollLeft;
    const viewR = viewL + list.clientWidth;
    if (left >= viewL && right <= viewR) return; // already visible
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = left < viewL ? left - 12 : right - list.clientWidth + 12;
    list.scrollTo({ left: Math.max(0, target), behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav
      aria-label={label}
      className="border-b border-ink/[0.12] bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul
        ref={listRef}
        className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const on = item.key === active || item.href === `#${active}`;
          return (
            <li key={item.key} className="shrink-0">
              <a
                href={item.href}
                data-key={item.key}
                aria-current={on ? "true" : undefined}
                className={[
                  "relative flex min-h-[44px] items-center whitespace-nowrap px-3 text-[14px]",
                  "transition-colors duration-200 motion-reduce:transition-none",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-deep",
                  on ? "font-medium text-ink" : "text-ink/70 hover:text-ink",
                ].join(" ")}
              >
                {item.label}
                {on ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-gold-deep"
                  />
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
