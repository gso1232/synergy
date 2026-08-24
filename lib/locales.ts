/**
 * The locale list, and NOTHING ELSE.
 *
 * =============================================================================
 * 🔴 THIS FILE EXISTS TO KEEP `i18n.ts` OUT OF THE CLIENT BUNDLE, and it was
 * created after a build guard caught the consequence of not having it.
 *
 * `components/LocaleSwitcher.tsx` is a client component and needs `locales` to
 * render its two links. It used to import them from `@/i18n` — harmless while
 * that file only read JSON. On 2026-08-24 `i18n.ts` gained an import of
 * `lib/cms/strings.ts` (admin-edited copy), which imports
 * `@supabase/supabase-js`, and webpack followed the chain: the entire Supabase
 * client landed in a chunk shipped to every visitor of every page.
 *
 * Two things went wrong at once, and only one of them was cosmetic:
 *
 *   1. WEIGHT. Tens of kilobytes of database client on every public page, to
 *      support a component that renders the text "EN" and "ES".
 *   2. THE BUILD GUARD TRIPPED. `scripts/check-no-service-role.mjs` scans the
 *      client bundle for `sb_secret_`, and supabase-js contains that literal in
 *      its own "you are using a secret key in a browser" warning. No key
 *      actually leaked — but a security check that fires on a false positive is
 *      a check somebody eventually silences, which is the real damage.
 *
 * So the rule this file enforces: A CLIENT COMPONENT MUST IMPORT LOCALES FROM
 * HERE, NEVER FROM `@/i18n`. This module has no imports of its own and can
 * never acquire a server dependency. `i18n.ts` re-exports both names so the
 * server-side call sites did not have to change.
 * =============================================================================
 */

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
