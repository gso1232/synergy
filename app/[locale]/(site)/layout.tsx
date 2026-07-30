import { unstable_setRequestLocale } from "next-intl/server";
import SmoothScroll from "@/components/SmoothScroll";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Splash from "@/components/Splash";

/**
 * THE PUBLIC SITE'S CHROME. Moved here from `[locale]/layout.tsx` on
 * 2026-07-30, unchanged in behaviour — every comment below is the original
 * reasoning, kept with the code it explains.
 *
 * WHY IT MOVED: the portal routes (`(portal)/login`, `(portal)/admin`) must
 * carry none of this, and in particular must not render inside Lenis. A route
 * group changes no URLs, so `/en`, `/en/about`, `/en/blog/<slug>` and the rest
 * resolve exactly as before — this file simply wraps them and the portal group
 * does not.
 *
 * ADDING A PUBLIC PAGE means adding it under `(site)/`. A page added directly
 * under `[locale]/` would render with no header and no footer.
 */
export default function SiteLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <>
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
    </>
  );
}
