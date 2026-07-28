/**
 * THE ONE PLACE THAT KNOWS WHICH PAGES EXIST.
 *
 * Every navigation surface on the site reads from this file — the header, the
 * mobile panel and the footer — so a route can never be linked from one and
 * missing from another, and adding a page is one line here rather than a hunt
 * through three components.
 *
 * The rule it enforces: A LINK IS A PROMISE THAT A PAGE EXISTS. Before this
 * file there were 17 `href="#"` stubs in the header and hero and 6 footer
 * links to routes that 404. Every one of them looked like working navigation
 * to a client reviewing the preview, and every one of them was a dead end.
 *
 * Unbuilt routes are NOT listed as disabled entries. They are listed as a
 * comment (see UNBUILT below) and are absent from the rendered navigation.
 * The reasoning is in the report that accompanied this change; the short
 * version is that a greyed-out "Services" tells a visitor Synergy has a
 * services page that is temporarily unavailable, which is false — it was never
 * built — while an absent one says nothing at all, which is true.
 */

/** Routes that are built, routed and reachable today. */
export type RouteKey = "home" | "about" | "calculator";

/** Path AFTER the locale segment. `home` is the locale root itself. */
const PATHS: Record<RouteKey, string> = {
  home: "",
  about: "/about",
  calculator: "/calculator",
};

/**
 * Locale-aware href. next-intl's middleware means every rendered path carries
 * its locale, so links are built from the locale the component is rendering
 * in — following a link never silently drops you from /es back to /en.
 */
export function routeHref(locale: string, key: RouteKey): string {
  return `/${locale}${PATHS[key]}`;
}

/**
 * Is `key` the page currently being viewed?
 *
 * Exact match, not prefix match. A prefix match would light "Home" on every
 * route, because every path starts with the locale root. Trailing slashes are
 * tolerated because the middleware can produce either form.
 */
export function isCurrentRoute(
  pathname: string | null,
  locale: string,
  key: RouteKey,
): boolean {
  if (!pathname) return false;
  const normalise = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);
  return normalise(pathname) === normalise(routeHref(locale, key));
}

/**
 * Header nav order. Split either side of the centred logo by SiteHeader —
 * the first two go left, the rest go right, which keeps the three-column
 * balance the bar was built around.
 *
 * `calculator` is here even though it was never in the nav before. It is a
 * built, live page that had NO entry in any navigation: the only ways in were
 * the homepage's consultation CTA and the About page's §4 CTA. With the dead
 * links gone that omission became conspicuous. One line to remove if it is not
 * wanted.
 */
export const HEADER_ROUTES: readonly RouteKey[] = ["home", "about", "calculator"];

/** Footer sitemap order. Same set — the footer is not a reduced nav. */
export const FOOTER_ROUTES: readonly RouteKey[] = ["home", "about", "calculator"];

/**
 * fflsynergy's own live recruiting site. The only external destination on the
 * site, and the only link here that is not one of our routes.
 */
export const JOIN_URL = "https://join.fflsynergy.com/";

/* ---------------------------------------------------------------------------
   🔴 UNBUILT — linked from nowhere, deliberately.

   These had nav entries pointing at them. Every one 404s. They are recorded
   here so that restoring a page is: build the route, add the key to RouteKey
   and PATHS, add it to HEADER_ROUTES / FOOTER_ROUTES. The message strings for
   all of them are RETAINED UNTOUCHED in messages/en.json and messages/es.json
   (`nav.*`, `footer.nav.*`, `footer.legal.*`) — nothing has to be re-authored
   or re-approved.

     services   /[locale]/services    was in the header AND the footer
     contact    /[locale]/contact     was in the header AND the footer
     blog       /[locale]/blog        was in the footer
     gallery    /[locale]/gallery     was in the footer
     privacy    /[locale]/privacy     was in the footer's Legal column
     terms      /[locale]/terms       was in the footer's Legal column

   🔴 privacy and terms are not merely unbuilt, they are BLOCKED. A privacy
   policy and terms of service for a Florida life-insurance brokerage are legal
   documents that come from the client, exactly like the regulatory disclosure
   and the results disclaimer. Do not write them. Until they arrive, no link is
   more honest than a link to a 404: the link asserts the document exists and
   is available, and it is not.
--------------------------------------------------------------------------- */
