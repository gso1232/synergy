"use client";

import { useLocale, useTranslations } from "next-intl";
/* 🔴 TWO Links, AND MIXING THEM UP IS WHAT BROKE BOTH UTILITY LINKS.
   `@/navigation`'s Link is next-intl's: it PREPENDS the active locale to
   whatever href it is given. The language switcher needs exactly that. The two
   utility links do not — they were handed `/${locale}/login`, which the Link
   then prefixed again and shipped as `/en/en/login`. Both 404'd in production.
   navigation.ts documents this same trap for `usePathname`; it applies to Link
   for the same reason. Plain `next/link` for anything already carrying its
   locale. */
import NextLink from "next/link";
import { Link, usePathname } from "@/navigation";
import { locales } from "@/lib/locales";
import { routeHref } from "@/routes";

/**
 * The thin utility strip above the main nav, matching familyfirstlife.com's.
 *
 * =============================================================================
 * 🔴 THE SOCIAL ICONS ARE DELIBERATELY ABSENT. The reference's strip opens with
 * Instagram / Facebook / YouTube / X / LinkedIn on the left. They are not here,
 * on explicit instruction — and the instruction is right for a second reason:
 * Synergy has no accounts on any of those platforms. The retired social row in
 * components/Footer.tsx records the same fact. An icon linking to a profile
 * that does not exist is worse than no icon.
 *
 * That leaves the strip with the two things the reference actually uses it for:
 * the language choice, centred, and the two utility destinations on the right.
 *
 * =============================================================================
 * 🔴 THE LANGUAGE SWITCHER MOVED HERE FROM THE NAV ROW, AND THAT REVERSES AN
 * EARLIER INSTRUCTION. On 2026-08-16 the EN/ES pill was moved INTO the left nav
 * rail, directly after Blog, because that is where it was asked for. The
 * reference puts it in this strip instead, and cloning the strip while leaving
 * the pill in place would put two language switchers on one screen — which is
 * not a clone of anything and reads as a bug.
 *
 * So there is exactly one switcher and it is here. `components/LocaleSwitcher`
 * still exists, still works, and is simply not mounted in the nav row; putting
 * it back is one line in SiteHeader.
 *
 * =============================================================================
 * PLAIN TEXT, NOT THE PILL. The reference renders "English Español" as two bare
 * words with the active one in bold. The pill's filled-chip treatment was built
 * for a control floating over a photograph and would be louder than everything
 * else on a 40px utility strip.
 *
 * `aria-current="true"` rather than `"page"`: these two links point at the SAME
 * page in different languages, so the active one is not a different page — it
 * is the current state of this one. `"page"` would tell a screen reader the
 * other language is a separate destination in a navigation list.
 */

const LABELS: Record<string, string> = { en: "English", es: "Español" };

/**
 * The two badges the reference puts before each utility link.
 *
 * 🔴 THEY ARE NOT THE SAME MARK. The first pass drew one generic filled dot for
 * both, which is what a glance at a small screenshot suggests — but the
 * reference uses a PERSON for the login and an ARROW for the application, and
 * that difference is the only thing distinguishing the two links at 15px before
 * you read the words. Reproducing them as one shape loses the signal that made
 * them worth having.
 *
 * Both are drawn rather than fetched: a 15px glyph is a handful of path data,
 * and an icon font or a sprite request for two shapes on every page would cost
 * more than it saves.
 *
 * 🔴 navy-soft DISCS ON A LIGHT STRIP. The strip was briefly filled with
 * `navy-soft` itself, which forced the discs to invert to cream to stay
 * visible; it is back to the reference's light grey, so the discs carry the
 * accent and the glyph inside them is white. The reference's red is gone
 * site-wide — see the note on the button colours in components/Hero.tsx.
 */

/** Red disc with a white person silhouette — the account/login badge. */
function PersonBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-navy-soft card:h-[17px] card:w-[17px]"
    >
      <svg viewBox="0 0 16 16" className="h-[9px] w-[9px] fill-white card:h-[11px] card:w-[11px]">
        <circle cx="8" cy="5.6" r="2.9" />
        <path d="M8 9.4c-3 0-5 1.9-5 3.9v.6h10v-.6c0-2-2-3.9-5-3.9z" />
      </svg>
    </span>
  );
}

/** Red disc with a white arrow — the "go and apply" badge. */
function ArrowBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-navy-soft card:h-[17px] card:w-[17px]"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-[9px] w-[9px] fill-none stroke-white stroke-[2.2] card:h-[10px] card:w-[10px]"
      >
        <path d="M2.5 8h10" strokeLinecap="round" />
        <path d="M8.6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function TopUtilityBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tHero = useTranslations("hero");

  return (
    <div className="top-utility-bar bg-[#EDEDED] text-ink">
      {/* 🔴 A GRID WITH THREE EQUAL TRACKS, NOT flex + fixed side widths. The
            first attempt gave each side a hard 220px, which was narrower than
            "Agent Login | Apply to Work with Synergy" and wrapped it onto two
            lines inside a 40px bar. Equal `1fr` tracks let the sides take what
            they need while keeping the language block centred on the PAGE axis
            rather than on whatever space happens to be left over. */}
      {/* 🔴 TWO LAYOUTS, ONE MARKUP. Below `card` the strip is a simple
          space-between row at 12px; the three-track grid only exists at
          desktop. The grid cannot survive a 375px phone — "English Español"
          plus "Agent Login" plus "Apply to Work with Synergy" is far wider
          than the viewport at 14px, and a centred middle track guarantees the
          right-hand one overflows rather than wraps. Space-between with the
          spacer dropped puts language hard left and the two utility links hard
          right, which is the only arrangement that fits the real strings. */}
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between gap-2 px-4 text-[12px] card:grid card:h-10 card:grid-cols-[1fr_auto_1fr] card:px-6 card:text-[14px]">
        {/* LEFT — empty by design. It is the column the reference fills with
            social icons, kept as a spacer so the language block stays optically
            centred on the page rather than on the remaining space. */}
        <div aria-hidden="true" className="hidden card:block" />

        {/* 🔴 DESKTOP ONLY. The reference splits these two differently by
            breakpoint: its phone strip carries ONLY the utility links and moves
            the language down into the nav row beside the hamburger. Copied,
            because it is also the only division that fits — language plus both
            links is 405px of content in a 375px strip. */}
        <nav aria-label={t("langLabel")} className="hidden items-center gap-1.5 whitespace-nowrap card:flex card:gap-2">
          {locales.map((l) => {
            const active = l === locale;
            return (
              <Link
                key={l}
                href={pathname}
                locale={l}
                aria-current={active ? "true" : undefined}
                className={`transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none ${
                  active ? "font-bold text-ink" : "font-normal text-ink/70"
                }`}
              >
                {LABELS[l] ?? l}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap font-semibold card:flex-none card:justify-end card:gap-3">
          <NextLink
            /* A literal path, not `routeHref`: /login is deliberately absent
               from the RouteKey registry (it is portal chrome, not a marketing
               route) and SiteHeader links it the same way. */
            href={`/${locale}/login`}
            className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            <PersonBadge />
            {t("login")}
          </NextLink>
          <span aria-hidden="true" className="text-ink/25">
            |
          </span>
          <NextLink
            href={routeHref(locale, "join")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            <ArrowBadge />
            {tHero("ctaApply")}
          </NextLink>
        </div>
      </div>
    </div>
  );
}
