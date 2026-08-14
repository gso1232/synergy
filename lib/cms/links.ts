import { locales } from "@/i18n";

/**
 * TURN A CMS-STORED URL INTO AN href THE ROUTER WILL ACTUALLY SERVE.
 *
 * =============================================================================
 * 🔴 THIS EXISTS BECAUSE THE SEEDED INTERNAL LINK WAS A 404.
 *
 * `section_links.url` for the closing step of the licensing checklist is
 * `/agents/new-agent-checklist` — written that way in the migration because that
 * is what the page "is" when you ignore locales. It was rendered straight into
 * an `href`, and every route on this site lives under a locale segment:
 *
 *     /agents/new-agent-checklist        -> 404   (measured, not assumed)
 *     /en/agents/new-agent-checklist     -> the page
 *
 * `middleware.ts` only matches `/` and `/(en|es)/:path*`, so a locale-less path
 * is not even rewritten — it falls through to a hard 404. The pager at the foot
 * of the same page built `/${locale}/agents/...` by hand and worked, which is
 * exactly why the bug survived review: the identical link worked in one place on
 * the page and 404'd in the other.
 *
 * 🔴 ADMINS WILL TYPE BOTH FORMS, so this accepts both. The CMS help text says
 * "a path on this site starting with /", and an admin copying a URL out of their
 * address bar will paste `/en/agents/...` while one following the instruction
 * will type `/agents/...`. Blindly prefixing would turn the first into
 * `/en/en/agents/...` — the exact doubling bug `navigation.ts` documents for the
 * locale switcher. So an already-localised path is passed through untouched.
 *
 * 🔴 WHY NOT `Link` FROM `@/navigation`. next-intl's locale-aware `Link` would
 * also solve it, and it is the right tool in client components. These are server
 * components rendering static markup inside a list, and every other href in the
 * agents area (`AgentsNav`, `PortalPager`, the index cards) is built as
 * `/${locale}/…` by hand. One convention, applied everywhere, beats two.
 */
export function localeHref(url: string, locale: string): string {
  // External (http/https) or anything not site-relative: untouched.
  if (!url.startsWith("/")) return url;

  // Already carries a locale segment — `/en`, `/en/…`, `/es/…`.
  const first = url.split("/")[1];
  if ((locales as readonly string[]).includes(first)) return url;

  return `/${locale}${url}`;
}

/** Is this URL internal to the site (so it must not open in a new tab, and must
 *  not carry the "opens in a new tab" warning)? */
export function isInternalHref(url: string): boolean {
  return url.startsWith("/");
}
