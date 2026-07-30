import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";

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
 * PHASE 1 IS DESIGN ONLY. There is no auth here, and this layout does not — and
 * must not — check a session. Nothing below it fetches, persists or
 * authenticates. Route protection arrives in a later, separately reviewed phase;
 * until then these pages are public URLs showing mock data, which is why they
 * carry no real record of any kind.
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
  return <>{children}</>;
}
