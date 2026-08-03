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
export type RouteKey =
  | "home"
  | "about"
  | "services"
  | "blog"
  | "contact"
  | "calculator"
  | "join";

/** Path AFTER the locale segment. `home` is the locale root itself. */
const PATHS: Record<RouteKey, string> = {
  home: "",
  about: "/about",
  services: "/services",
  blog: "/blog",
  contact: "/contact",
  calculator: "/calculator",
  join: "/join",
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
 * heavier-half-LEFT, at `ceil((length + 1) / 2)`. On today's six text keys that
 * is 4 / 2 (Home · About · Services · Blog left; Contact · Calculator right),
 * after Blog was moved left on instruction. It used to say "the first two go
 * left, the rest go right" (the old 2 / 4) and then split evenly 3 / 3; both are
 * gone. See SPLIT_AT in SiteHeader.tsx.
 *
 * `calculator` is here even though it was never in the nav before. It is a
 * built, live page that had NO entry in any navigation: the only ways in were
 * the homepage's consultation CTA and the About page's §4 CTA. With the dead
 * links gone that omission became conspicuous. One line to remove if it is not
 * wanted.
 */
/**
 * Header nav order.
 *
 * 🔴 `join` IS IN THIS LIST AND IS NOT A TEXT LINK. It is rendered by the bar's
 * Join PILL, which reads its href from here like everything else — so this
 * array is the single source of truth for what the header contains, and the
 * pill cannot drift from it.
 *
 * SiteHeader therefore splits `HEADER_ROUTES_TEXT` (this list minus `join`)
 * around the centred logo, not this list. Adding `join` to the text split
 * would print "Join" twice — once as a link and once as the pill a few pixels
 * away — and would throw off the left/right balance the bar is built around.
 *
 * 🔴 ORDER IS LOAD-BEARING NOW. Blog sits immediately after Services here so
 * that the heavier-left split (SPLIT_AT in SiteHeader) carries Blog onto the
 * LEFT beside Services. Reordering this array reorders the nav — desktop split
 * AND the mobile stacked panel both read it in this order.
 */
export const HEADER_ROUTES: readonly RouteKey[] = [
  "home",
  "about",
  "services",
  "blog",
  "contact",
  "calculator",
  "join",
];

/** The header's TEXT links — HEADER_ROUTES minus the key the pill renders.
 *  Derived, not hand-maintained, so the two cannot disagree. */
export const HEADER_PILL_ROUTE: RouteKey = "join";
export const HEADER_ROUTES_TEXT: readonly RouteKey[] = HEADER_ROUTES.filter(
  (k) => k !== HEADER_PILL_ROUTE,
);

/** Footer sitemap order. Same set — the footer is not a reduced nav.
 *
 * `join` is in FOOTER_ROUTES but NOT in HEADER_ROUTES, and that is deliberate:
 * the header already carries a dedicated Join PILL (see JOIN_URL below), so
 * adding a seventh text link would put the same destination in the bar twice.
 * The footer has no pill, so it takes the sitemap entry. */
export const FOOTER_ROUTES: readonly RouteKey[] = [
  "home",
  "about",
  "services",
  "blog",
  "contact",
  "calculator",
  "join",
];

/**
 * 🔴 THE RECRUITING SUBDOMAIN IS DEAD, AND THIS NOW POINTS AT OUR OWN PAGE.
 *
 * `https://join.fflsynergy.com/` was the destination of the header pill, the
 * footer pill, the mobile-panel CTA and the WhoWeServe "For Agents" card — four
 * places. Fetched live on 2026-07-29 it returns a Vercel
 * **404 / DEPLOYMENT_NOT_FOUND**, not a redirect and not a parked page. So
 * every one of those four controls was sending applicants to an error page.
 *
 * That also removed the plan recorded in HANDOFF §13b, which was for our Join
 * CTA to hand off to the subdomain rather than reproduce their form. There is
 * nothing left to hand off to, so `/join` — a real page on this site, with the
 * closing CTA pointing at `/contact`, which has a live phone number — is now
 * the honest destination. A link is a promise that a page exists.
 *
 * The old value is kept below, commented, because if the subdomain comes back
 * the decision is worth revisiting rather than rediscovering:
 *
 *   export const JOIN_URL = "https://join.fflsynergy.com/";   // 404 on 2026-07-29
 *
 * It is still a single exported constant, and still the one thing all four
 * call sites read, so restoring it is a one-line change.
 */
export const JOIN_URL_EXTERNAL_DEAD = "https://join.fflsynergy.com/";

/** Locale-aware href for the Join pill. Takes the locale so the pill never
 *  drops a reader from /es back to /en — the same rule `routeHref` enforces. */
export const joinHref = (locale: string) => routeHref(locale, "join");

/* ---------------------------------------------------------------------------
   🔴 UNBUILT — linked from nowhere, deliberately.

   These had nav entries pointing at them. Every one 404s. They are recorded
   here so that restoring a page is: build the route, add the key to RouteKey
   and PATHS, add it to HEADER_ROUTES / FOOTER_ROUTES. The message strings for
   all of them are RETAINED UNTOUCHED in messages/en.json and messages/es.json
   (`nav.*`, `footer.nav.*`, `footer.legal.*`) — nothing has to be re-authored
   or re-approved.

     gallery    /[locale]/gallery     was in the footer
     privacy    /[locale]/privacy     was in the footer's Legal column
     terms      /[locale]/terms       was in the footer's Legal column

   ✅ `contact` was on this list and is now BUILT — /[locale]/contact. The form
   is present and visibly DISABLED (no backend; the GHL webhook is unblocked),
   following the LeadModal pattern. See HANDOFF.

   ✅ `blog` was on this list and is now BUILT — /[locale]/blog, twelve articles
   from fflsynergy.com/blog. Note that only the articles with an approved body
   are LINKED; the rest render as listing rows with no href, because a link is
   a promise that a page exists.

   ✅ `services` was on this list and is now BUILT — /[locale]/services, seven
   products from fflsynergy.com/services. It is in HEADER_ROUTES and
   FOOTER_ROUTES above.

   🔴 privacy and terms are not merely unbuilt, they are BLOCKED. A privacy
   policy and terms of service for a Florida life-insurance brokerage are legal
   documents that come from the client, exactly like the regulatory disclosure
   and the results disclaimer. Do not write them. Until they arrive, no link is
   more honest than a link to a 404: the link asserts the document exists and
   is available, and it is not.
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   PORTAL PATHS — BUILT, ROUTED, AND DELIBERATELY UNLINKED.

   These are NOT `RouteKey`s and they are NOT in HEADER_ROUTES or FOOTER_ROUTES,
   and that is the whole point: this file is the one place that knows which
   pages exist, so a route that must never appear in navigation still belongs
   here — recorded, with the reason — rather than living as a bare string in a
   component where the next person assumes it was forgotten.

   The rule this file enforces is "a link is a promise that a page exists". The
   inverse applies here: these pages exist and are deliberately not promised.
   They are staff surfaces, not public ones. Nothing on the marketing site links
   to them, they are `noindex` (set on `(portal)/layout.tsx`, inherited by every
   route in the group) and `app/robots.ts` disallows them.

   🔴 THEY ARE NOT PROTECTED. Phase 1 is DESIGN ONLY — no auth, no session, no
   data. Being unlinked is obscurity, not access control, which is exactly why
   the pages show mock data and nothing real. Do not put a real record behind
   these URLs until the auth phase has shipped and been reviewed.
--------------------------------------------------------------------------- */
export const PORTAL_PATHS = {
  login: "/login",
  admin: "/admin",
} as const;

export type PortalKey = keyof typeof PORTAL_PATHS;

/** Locale-aware href for a portal path. Same contract as `routeHref`. */
export function portalHref(locale: string, key: PortalKey): string {
  return `/${locale}${PORTAL_PATHS[key]}`;
}
