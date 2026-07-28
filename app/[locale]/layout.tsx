import type { Metadata } from "next";
import { Kufam, Overpass, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from "next-intl/server";
import { locales, type Locale } from "@/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Splash from "@/components/Splash";
import "../globals.css";

// Kufam — display / headings (matches reyou.life). Tops out at 500; headings get
// their weight from size + the face, never a synthetic bold.
const display = Kufam({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  adjustFontFallback: true,
  variable: "--font-display",
});

// Overpass — body, UI, labels, AND the data numerals (replaces Space Grotesk).
const body = Overpass({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  variable: "--font-body",
});

// Inter — used ONLY inside the VEX-spec hero (via `font-hero`), per that spec.
// The rest of the site stays on Kufam / Overpass.
const hero = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-hero",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
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
      <body className="bg-cream font-body text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          <Splash />
          {/* Real global header — persists across every page and down the whole
              scroll. It floats OVER the hero photo, so it is deliberately given
              no layout offset: the hero card starts at the very top of the page
              and the bar sits on the image. Any future page without a
              full-bleed hero at the top will need its own top padding. */}
          <SiteHeader />
          {/* The footer is INSIDE SmoothScroll so it is part of the same
              scrolled document Lenis drives, and it is mounted here rather
              than per-page so every route ends the same way — including
              /[locale]/calculator, which used to stop dead at the CTA.

              It also fixes something measured on the homepage: the
              consultation section was the last element, so its bottom could
              never reach the viewport top and only 53.5% of its parallax
              travel was reachable. With a footer below it, the full ±10 runs. */}
          <SmoothScroll>
            {children}
            <Footer />
          </SmoothScroll>
          {/* Locale switcher — a fixed pill, bottom-right, on every route.
              ---------------------------------------------------------------
              🔴 IT RENDERS NOTHING TODAY. `LOCALE_SWITCHER_READY` is `false`
              inside the component and it returns null; the mount is here so
              that turning it on is one constant, not a hunt through the tree.
              es.json is 43.0% translated with the whole About page and the
              homepage hero at zero, so a visitor clicking ES would get English
              content at a Spanish URL. See the component docblock.

              OUTSIDE SmoothScroll, and that is deliberate: it is
              `position: fixed`, so it must not sit inside the element Lenis
              transforms. A fixed child of a transformed ancestor is positioned
              against that ancestor instead of the viewport — the same trap the
              mobile menu panel already documents in SiteHeader. */}
          <LocaleSwitcher />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
