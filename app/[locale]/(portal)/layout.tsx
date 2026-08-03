import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { unstable_setRequestLocale } from "next-intl/server";

/**
 * The admin's mono face, loaded HERE rather than in the root layout, and with
 * `preload: false`, so no PUBLIC page pays for a fourth webfont. The portal is
 * staff-only and noindex; only these routes mount the variable.
 *
 * 400 + 500 only. The reference sets every label, sub-label, unit and figure in
 * mono at 10-11px with wide tracking, which is where Plex Mono holds up and a
 * system mono stack would render differently per OS.
 */
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
  variable: "--font-mono",
});

/**
 * THE PORTAL SHELL — /login and /admin.
 *
 * Deliberately almost empty, and every absence is load-bearing:
 *
 *   NO SiteHeader / Footer — these routes must not be reachable from, or dressed
 *     as, the public marketing site. They are also absent from `routes.ts`'s nav
 *     lists (see PORTAL_PATHS there), so nothing on the site links to them.
 *   NO SmoothScroll (Lenis) — 🔴 THE LOAD-BEARING ONE. Lenis transforms the
 *     scroll container, and a `position: fixed` child of a transformed ancestor
 *     positions against that ancestor instead of the viewport. The admin shell
 *     is a fixed sidebar + sticky header, so inside Lenis it would break exactly
 *     as the mobile menu panel and LocaleSwitcher already document. Native
 *     scrolling is also simply correct for a data table.
 *   NO Splash — an intro animation in front of a sign-in form is noise.
 *   NO LocaleSwitcher — it renders null today anyway.
 *
 * 🔴 noindex IS SET HERE, ON THE GROUP, not per page. A `robots` value in a
 * layout's metadata is inherited by every route beneath it, so a page added to
 * this group later cannot be indexed by forgetting to add it. `app/robots.ts`
 * disallows the same paths at the crawler level — two independent guards.
 *
 * 🔴 THIS LAYOUT STAYS PUBLIC ON PURPOSE, EVEN NOW THAT AUTH EXISTS. It is
 * shared by BOTH /login and /admin, and /login must be reachable while logged
 * out — so the session/role guard does NOT live here. It lives one level down,
 * on the admin subtree, at (portal)/admin/layout.tsx (Layer B), with the
 * middleware as the earlier Layer A. Putting a guard here would lock people out
 * of the very page they sign in on.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PortalLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  return <div className={mono.variable}>{children}</div>;
}
