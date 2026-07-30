import type { MetadataRoute } from "next";

/**
 * THE PROJECT'S FIRST robots.txt, added with the portal (2026-07-30).
 *
 * It exists for one reason: /login and /admin are staff surfaces and must not
 * be indexed. That is already asserted by `robots: { index: false }` on
 * `(portal)/layout.tsx`, which every route in the group inherits; this file is
 * the second, independent guard, at the crawler level rather than the page
 * level. Belt and braces was the explicit instruction.
 *
 * Everything else stays crawlable — this must not become an accidental
 * site-wide `Disallow: /`. The locale prefixes are listed explicitly because
 * next-intl's middleware means the real URLs are /en/login and /es/login; the
 * unprefixed forms are listed too, since the middleware redirects through them.
 *
 * NO `sitemap` KEY YET. There is no app/sitemap.ts in this project, and
 * pointing at one that does not exist is the same class of lie as a link to a
 * 404. Add both together when a sitemap is built.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/admin", "/en/login", "/en/admin", "/es/login", "/es/admin"],
    },
  };
}
