import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "./i18n";

/**
 * next-intl's locale-aware navigation APIs.
 *
 * ⚠️ THIS EXISTS BECAUSE `usePathname` FROM `next/navigation` IS THE WRONG ONE
 * FOR A LOCALE SWITCHER, AND IT FAILS QUIETLY.
 *
 * Next's own `usePathname` returns the REAL path, locale segment and all —
 * "/en/about". Building a switcher href from it gives `/es` + `/en/about` =
 * "/es/en/about", which 404s. That was measured on the built page, not
 * theorised: the first pass of components/LocaleSwitcher.tsx shipped
 * `href="/en/en/about"` and `href="/es/en/about"` and TypeScript was perfectly
 * happy with both.
 *
 * The `usePathname` re-exported here strips the locale — "/about" — so the swap
 * is `/{locale}{pathname}` with no string surgery, no regex, and no chance of
 * doubling or dropping the segment. `Link` from here also understands the
 * `locale` prop, which `next/link` silently ignores in the App Router (it is a
 * Pages Router API).
 *
 * `createSharedPathnamesNavigation` rather than `createLocalizedPathnames...`:
 * our routes are the SAME strings in both locales (/about, /calculator — see
 * routes.ts). Localised pathnames would mean a second route table to keep in
 * sync with routes.ts, which is the exact drift routes.ts was created to stop.
 */
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
