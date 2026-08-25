import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, Be_Vietnam_Pro } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from "next-intl/server";
import { locales, type Locale } from "@/i18n";
import "../globals.css";

/**
 * Fraunces — display / headings. Drives 96 heading sites across the app.
 *
 * 🔴 REPLACED KUFAM (2026-08-16) ON THE BRIEF "fix the font ... more relaxed
 * more aesthetically pleasing". Kufam was inherited from reyou.life along with
 * that site's layout measurements; it is a tight, upright display sans whose
 * Latin cut is fairly neutral, and set at heading sizes over a photograph it
 * reads brisk and corporate rather than warm. Nothing was broken about it —
 * this is a taste instruction, executed as one.
 *
 * WHY THIS FACE SPECIFICALLY, rather than "a nicer font":
 *
 *   · IT IS A SOFT OLD-STYLE SERIF. Rounded terminals and a gentle stroke
 *     modulation are what "relaxed" actually means typographically — the
 *     opposite of the flat, even stems Kufam sets. It carries warmth at
 *     display sizes without becoming decorative at small ones.
 *   · IT AGREES WITH THE LOGO. The supplied lockup's SYNERGY is a classical
 *     high-contrast serif. Kufam put a geometric sans directly beneath a serif
 *     wordmark on every page; a serif display resolves that argument.
 *   · IT IS VARIABLE, so 400-600 are REAL weights cut by the designer, not the
 *     browser's synthetic smear. That preserves the rule Kufam was carrying —
 *     headings take their weight from size and the face, never a faux-bold —
 *     while removing the "never above 500" ceiling that existed only because
 *     Kufam had nothing above it.
 *
 * 🔴 `.cap-display` IN globals.css WAS RE-DERIVED IN THE SAME COMMIT, and it
 * had to be: those trim values are computed from the LOADED face's cap height,
 * ascent and descent, and are wrong the instant the face changes. The
 * derivation, the measurement method and Fraunces's numbers are written out at
 * that rule. This is the same discipline the Overpass -> IBM Plex Sans swap
 * followed, and the note there explains what silently breaks when it is
 * skipped.
 *
 * `axes` is deliberately NOT set. Fraunces ships SOFT and WONK as extra axes;
 * requesting them adds bytes to every page and neither is being driven from
 * CSS. The defaults (SOFT 0, WONK 0) are the calm cut, which is the one wanted
 * here. `font-optical-sizing` stays at the browser default of `auto`, so the
 * face thins its own hairlines as headings scale up — which is most of why it
 * stays comfortable at the hero's clamp() ceiling.
 */
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  variable: "--font-display",
});

/**
 * IBM Plex Sans — body, UI, labels, AND the data numerals.
 *
 * 🔴 REPLACED OVERPASS (2026-08-03), AND THE REASON IS THE FIGURES, NOT TASTE.
 *
 * The deciding property is TABULAR FIGURES, and it is not a preference — this
 * site's most persuasive element is a currency figure bound to two sliders, and
 * `components/Calculator.tsx` spends `tabular-nums` in eight places. That class
 * emits `font-variant-numeric: tabular-nums`, which is a REQUEST: a face
 * without the `tnum` feature drops it silently and every digit keeps its
 * natural width, so the figure shifts sideways on every slider drag.
 *
 * IBM Plex Sans's figures are TABULAR NATIVELY — not via the feature, but by
 * construction. Measured at 1000px/700, every digit 0-9 set ten times returns
 * the same 600px advance, spread 0.00px, with and without the request. That
 * means a future component that forgets `tabular-nums` still renders aligned,
 * which is the failure mode that eliminated the first candidate.
 *
 * (For the record, so nobody "improves" this later: DM Sans was the leading
 * alternative and FAILS this outright — `1111111111` measures 364px against
 * `0000000000` at 704px, a 340px spread that `tabular-nums` does not change
 * because the feature is absent from the font. Overpass, the face being
 * replaced here, passed — its spread collapses 260.8px -> 0.00px when the
 * feature is requested — so this swap is a lateral move on that axis, not a
 * rescue. Nothing was broken; Plex is simply the stronger guarantee.)
 *
 * THE OTHER TWO SLOTS ARE UNCHANGED ON PURPOSE. Kufam keeps the display slot
 * and its "never above 500" ceiling; Inter keeps the VEX-spec hero. This was a
 * body/data swap, scoped deliberately: `.cap-display` never had to be
 * re-derived and the display/body contrast that separates headings from copy
 * survives.
 *
 * 🔴 IF YOU CHANGE THIS FACE, `.cap-body` IN globals.css MUST BE RE-DERIVED IN
 * THE SAME COMMIT. Those trim values are computed from the LOADED font's
 * ascent/descent/cap-height and are wrong the instant the face changes. The
 * derivation, and Plex's numbers, are written out at that rule.
 */
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  variable: "--font-body",
});

/**
 * Be Vietnam Pro — the HERO ONLY, via `font-hero`.
 *
 * 🔴 REPLACED INTER (2026-08-24). The homepage hero was rebuilt to match
 * familyfirstlife.com's, on the client's instruction, and that layout's whole
 * character is its typeface: a geometric sans set very heavy and very tight,
 * which is what makes "Protect What Matters Most" read as a poster rather than
 * a sentence. Measured off the reference: 44px/700 for the headline, 30px/700
 * with +1px tracking for the second line, 21px/600 with +1.3px for the product
 * row, 13px/800 uppercase with +0.4px for the buttons. Inter set to those
 * numbers is visibly a different design.
 *
 * THIS SLOT ALREADY EXISTED AND IS STILL SCOPED THE SAME WAY. `--font-hero` is
 * referenced by exactly one element — the hero <section> — so nothing else on
 * the site pays for this font, and the rest stays on Fraunces / IBM Plex Sans.
 * Swapping the family inside the existing slot is why this change costs one
 * font rather than a fourth one.
 *
 * 800 is loaded because the buttons genuinely use it; dropping it would have
 * the browser synthesise a fake bold from 600 and thicken the letterforms
 * unevenly at 13px, which is exactly where it shows.
 */
const hero = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-hero",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * 🔴 THE SITE URL, AND WHY `metadataBase` IS NOT OPTIONAL. Open Graph requires
 * ABSOLUTE image URLs — a relative `/og-image.png` is silently dropped by every
 * scraper. `metadataBase` is what lets Next resolve the relative path below into
 * an absolute one. Without it Next logs a warning and emits a URL against
 * `localhost`, so the card would work in dev and break in production.
 *
 * It reads the Vercel-provided origin when deployed and falls back to the known
 * production domain, so it is correct on preview deployments too.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("https://fflsynergy.com");

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: SITE_URL,
    title,
    description,
    /**
     * 🔴 ICONS ARE NOT DECLARED HERE ON PURPOSE. `app/favicon.ico`,
     * `app/icon.svg` and `app/apple-icon.png` are Next FILE CONVENTIONS — Next
     * discovers them, fingerprints them for cache-busting and injects the
     * <link> tags into every route automatically. Declaring `icons` in metadata
     * as well would emit a SECOND, unfingerprinted set of links pointing at the
     * same files, which is how you end up with a stale favicon pinned in the
     * browser cache. One mechanism, not two.
     */
    openGraph: {
      type: "website",
      siteName: t("title"),
      title,
      description,
      locale: locale === "es" ? "es_US" : "en_US",
      url: `/${locale}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          // Describes the card image itself — Rule 5's standing exception for
          // image alt text, which must change when the file changes.
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${hero.variable}`}
      // 🔴 NO `suppressHydrationWarning`, AND ITS ABSENCE TRAVELS AS A PAIR
      // WITH RouteTheme. DO NOT ADD IT BACK ALONE.
      //
      // It existed for exactly one reason: components/RouteTheme.tsx writes
      // `data-route-theme` onto <html> from an inline script, before React
      // hydrates, so the first painted frame of a dark route is already dark.
      // React then saw an attribute its server render did not emit and logged
      // "Extra attributes from the server: data-route-theme" on every load of
      // /[locale]/about. A nested route cannot contribute attributes to <html>
      // in the App Router, so the two could not be made to agree, and
      // suppressing was the documented answer.
      //
      // /about is cream now and no longer mounts RouteTheme, so nothing writes
      // that attribute and there is no mismatch to suppress. Leaving the prop
      // in would silently mask a FUTURE genuine mismatch on the document
      // element — the one place on the page where that is hardest to notice.
      //
      // Restoring a dark route means restoring both: the `<RouteTheme />` call
      // on that page AND this prop. See HANDOFF.md §8.
    >
      {/* The hero is a photo now; next/image with `priority` emits its own
          preload link for the correct derivative, so the hand-written
          <link rel="preload" as="video"> that used to warm the clip is gone —
          keeping it would have downloaded 8 MB nobody renders. */}
      {/* No `bg-cream` here — the page surface is the gradient defined on `body`
          in globals.css. A Tailwind background-color class would win on
          specificity and flatten it. */}
      <body className="font-body text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* 🔴 THE MARKETING CHROME NO LONGER LIVES HERE. 2026-07-30.
              Splash, SiteHeader, SmoothScroll (Lenis), Footer and LocaleSwitcher
              moved to `(site)/layout.tsx`, and every public route moved into
              that group. Route groups do not affect URLs, so nothing about the
              public paths changed.

              WHY: the portal routes (`(portal)/login`, `(portal)/admin`) must
              not carry the marketing header/footer, and — the load-bearing
              reason — they must not render INSIDE Lenis. SmoothScroll transforms
              the scroll container, and a `position: fixed` child of a
              transformed ancestor positions against that ancestor rather than
              the viewport. The admin shell is a fixed/sticky sidebar, so it
              would have broken exactly the way the mobile menu panel and
              LocaleSwitcher already document.

              This layout is now the shared shell ONLY: html/body, fonts and the
              next-intl provider. Anything visual belongs to a group below it. */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
