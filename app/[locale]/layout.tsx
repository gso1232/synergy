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
