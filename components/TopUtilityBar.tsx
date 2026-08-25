"use client";

import { useLocale, useTranslations } from "next-intl";
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

/** The small filled circle the reference puts before each utility link. */
function Dot() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#ED1C24]"
    >
      <svg viewBox="0 0 10 10" className="h-[7px] w-[7px] fill-white">
        <circle cx="5" cy="5" r="5" />
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
    <div className="top-utility-bar hidden bg-[#EDEDED] text-ink card:block">
      {/* 🔴 A GRID WITH THREE EQUAL TRACKS, NOT flex + fixed side widths. The
            first attempt gave each side a hard 220px, which was narrower than
            "Agent Login | Apply to Work with Synergy" and wrapped it onto two
            lines inside a 40px bar. Equal `1fr` tracks let the sides take what
            they need while keeping the language block centred on the PAGE axis
            rather than on whatever space happens to be left over. */}
      <div className="mx-auto grid h-10 max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-6">
        {/* LEFT — empty by design. It is the column the reference fills with
            social icons, kept as a spacer so the language block stays optically
            centred on the page rather than on the remaining space. */}
        <div aria-hidden="true" />

        <nav aria-label={t("langLabel")} className="flex items-center gap-2 whitespace-nowrap text-[14px]">
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

        <div className="flex items-center justify-end gap-3 whitespace-nowrap text-[14px] font-semibold">
          <Link
            /* A literal path, not `routeHref`: /login is deliberately absent
               from the RouteKey registry (it is portal chrome, not a marketing
               route) and SiteHeader links it the same way. */
            href={`/${locale}/login`}
            className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            <Dot />
            {t("login")}
          </Link>
          <span aria-hidden="true" className="text-ink/25">
            |
          </span>
          <Link
            href={routeHref(locale, "join")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            <Dot />
            {tHero("ctaApply")}
          </Link>
        </div>
      </div>
    </div>
  );
}
