"use client";

import { useLocale, useTranslations } from "next-intl";
// ⚠️ BOTH OF THESE COME FROM @/navigation, NOT FROM next/link AND
// next/navigation. Next's own `usePathname` keeps the locale segment, so the
// href becomes /es/en/about and 404s — measured on the built page, and
// TypeScript accepts it silently. See the docblock in navigation.ts.
import { Link, usePathname } from "@/navigation";
import { locales, type Locale } from "@/i18n";

/**
 * 🔴 SHIPPED OFF. FLIP THIS TO `true` WHEN es.json CARRIES REAL COPY.
 *
 * The component is complete, mounted site-wide and verified; this constant is
 * the only thing standing between it and the page. It is the same pattern
 * `TESTIMONIAL_EYEBROW_READY` uses in components/Testimonials.tsx (that flag was
 * called `HEADER_ASIDES_READY` when this note was written), and it is off for
 * the same reason the lead form is disabled: AN AFFORDANCE MUST NOT ADVERTISE A
 * CAPABILITY THE SITE DOES NOT HAVE.
 *
 * Measured on the catalogue at the time of writing: 131 of 305 leaf strings are
 * translated — 43.0%. Empty by namespace:
 *
 *   about 30 · carriers 29 · footer 25 · whatWeCover 23 · hero 20
 *   whySynergy 16 · leadModal 14 · two 9 · consultation 3 · meta 2
 *   calculator 2 · whoWeServe 1
 *
 * THE ENTIRE ABOUT PAGE AND THE ENTIRE HOMEPAGE HERO ARE AT ZERO. i18n.ts falls
 * back to English for any missing or empty key, which is the right behaviour —
 * an English page is a working page — but it means a visitor who clicks ES gets
 * English content at a Spanish URL. That is the lead form's "Thanks, we'll be in
 * touch" failure in a different costume: the control works, and what it promises
 * does not exist.
 *
 * 🔴 IT IS NOT "ENGLISH AT A SPANISH URL". IT IS BOTH LANGUAGES IN ONE COLUMN,
 * AND THAT IS WORSE. Flipped to `true` and driven with a real click on 2026-08-02
 * to see what a visitor would actually get. /es renders, top to bottom:
 *
 *     nav              Inicio · Nosotros · Servicios · Blog · Contacto ·
 *                      Calculadora · Únete            SPANISH
 *     hero headline    "Protecting Families. Building Futures."   ENGLISH
 *     hero sub + SSN   English
 *     hero CTA pair    "Get a free quote" ENGLISH, next to
 *                      "Únete a nuestro equipo" SPANISH  <- SAME BUTTON ROW
 *     "WHAT WE DO"     English
 *     WhoWeServe       Spanish — EXCEPT one bullet, "Appointments with multiple
 *                      top-rated carriers", which is the single empty
 *                      `whoWeServe` key sitting between two Spanish bullets
 *     "OUR CARRIERS"   English
 *     <title>          English
 *
 * A reader who asks for Spanish and gets a page that changes language between
 * two adjacent buttons, and mid-list inside one card, does not read that as
 * "translation pending" — they read it as broken. The fallback is doing its job;
 * the job is just not a shippable experience yet.
 *
 * ✅ **SHIPPED VISIBLE 2026-08-02.** The condition above is met and the flag is
 * ON. What changed: es.json went 22.0% -> 100% of every PUBLIC namespace, and
 * `content/blog/es/` went from an empty directory to nine translated articles
 * plus three deliberate frontmatter-only stubs. The language-salad failure this
 * flag existed to prevent — Spanish nav over an English hero, "Get a free quote"
 * sitting beside "Únete a nuestro equipo" in the same button row — is gone,
 * verified by fetching every public /es route and scanning the rendered HTML.
 *
 * 🟡 WHAT IS STILL ENGLISH, AND WHY IT DOES NOT BLOCK THIS: the `admin`
 * namespace (126 keys). It is staff-only, `noindex`, robots-disallowed and
 * reachable only behind auth — not a public surface, so no visitor can meet it.
 *
 * TO REVERT: set this `false`. Nothing else changes.
 */
const LOCALE_SWITCHER_READY: boolean = true;

/**
 * Site-wide locale switcher — a fixed pill, bottom-right.
 *
 * Modelled on restaurantsem.com's `.locales-wrapper`, re-measured live today at
 * 1536. Their numbers, rebuilt in our tokens; none of their CSS is copied and
 * none of their assets are used.
 *
 *   position     fixed, `inset: auto 3rem 2rem auto` -> right 49.2, bottom 32.8
 *   inner pages  `.is-non-home` raises it to bottom 3rem (49.2)
 *   pill         white, radius 5rem (82px), padding 0 0.5rem (8.2), 141.57x34.42
 *   shadow       0 2px 5px rgba(0,0,0,0.2)
 *   z-index      30
 *   link         gap 0.3rem (4.92), padding 0.3rem 0.5rem, 16.4/24.6 w500, upper
 *   active       their orange #EB6330, plus aria-current="page"
 *   inactive     their ink #1E1E1E
 *   mobile       <=991 `right: auto` -> it moves to the BOTTOM-LEFT
 *
 * ⚠️ FOUR DELIBERATE DIVERGENCES.
 *
 * 1. NO FLAGS. Theirs carries a 19.68px flag after each code — a UK flag for
 *    English, a Portuguese one for Pt. We do not, and it is not a shortcut:
 *    a UK flag for English on a Florida insurance site is simply wrong; a US
 *    flag would make a nationality claim about the READER; and Synergy's
 *    Spanish-speaking audience is US Hispanic, so no flag on earth describes
 *    it. Language is not nationality. Text codes only.
 *
 * 2. HOVER AND FOCUS EXIST. Theirs has NEITHER — there is no `:hover` rule for
 *    `.local-link` anywhere in their stylesheet and no focus style at all. That
 *    is a defect, not a spec, and it is not one worth reproducing on a site
 *    whose nav links are real destinations people tab to.
 *
 * 3. OUR COLOURS, FOR A MEASURED REASON. Active is gold-deep #7D641F (5.16:1 on
 *    the cream pill), NOT gold #C9A84C — gold on cream is 2.09:1 and fails both
 *    the 4.5 text bar and the 3:1 of 1.4.11. Inactive is ink #1A1A1A (15.88:1).
 *
 * 4. `<Link>`, NOT A BUTTON. This is navigation: it changes the URL, it must
 *    work without JS, and it must be right-clickable and openable in a new tab.
 *    A button that calls `router.push` is none of those things. Real anchors
 *    carry `hreflang` and `lang` so assistive tech announces the target
 *    language in that language.
 *
 * PATH PRESERVATION. next-intl's `usePathname` (from @/navigation) returns the
 * path WITHOUT the locale segment — "/about", not "/en/about" — and its `Link`
 * prefixes the `locale` prop for us. /en/about -> /es/about with no string
 * surgery. Using Next's own `usePathname` here produced /es/en/about; that is
 * recorded in navigation.ts because nothing in the type system catches it.
 *
 * ZERO NEW STRINGS. `nav.langLabel`, `nav.langEn` and `nav.langEs` already
 * existed for the retired components/Nav.tsx and are already translated in
 * es.json. Nothing was written to a message file for this component.
 */
export default function LocaleSwitcher() {
  const t = useTranslations("nav");
  const active = useLocale();
  const pathname = usePathname();

  if (!LOCALE_SWITCHER_READY) return null;

  return (
    <nav
      aria-label={t("langLabel")}
      className="locale-switcher fixed bottom-[32.8px] right-[19.07px] z-30 md:right-[49.2px]"
    >
      <ul role="list" className="locale-pill flex items-center">
        {locales.map((loc: Locale) => {
          const isActive = loc === active;
          return (
            <li key={loc}>
              <Link
                href={pathname}
                locale={loc}
                hrefLang={loc}
                lang={loc}
                aria-current={isActive ? "page" : undefined}
                className={`locale-link ${isActive ? "is-active" : ""}`}
              >
                {t(loc === "en" ? "langEn" : "langEs")}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
