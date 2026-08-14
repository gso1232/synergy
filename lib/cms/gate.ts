/**
 * The unlock cookie's name and path, in ONE place.
 *
 * 🔴 IT LIVES HERE RATHER THAN IN THE ACTION FILE BECAUSE OF A NEXT.JS RULE,
 * not a design preference: a `"use server"` module may only export ASYNC
 * functions. `export function gateCookieName()` in `[slug]/actions.ts` fails the
 * build with "Only async functions are allowed to be exported in a 'use server'
 * file" — the same rule that pushed `signOut` out of the admin actions module
 * (see the note at the top of `(portal)/admin/actions.ts`).
 *
 * Both the writer (the unlock action) and the reader (the page) import from
 * here, so the name and the path cannot drift. A mismatched path is the quiet
 * version of this bug: the cookie is set, the page never sees it, and the gate
 * appears to reject a correct password.
 */

/** Slugs are `^[a-z0-9]+(-[a-z0-9]+)*$` by database constraint (0007), so this
 *  cannot produce a name needing escaping. */
export function gateCookieName(slug: string): string {
  return `sg_pg_${slug}`;
}

/** Scoped to the one page it unlocks — not to `/`, so unlocking the English
 *  bootcamp does not hand the browser a cookie it will replay at every other
 *  route on the site. */
export function gateCookiePath(locale: string, slug: string): string {
  return `/${locale}/agents/${slug}`;
}
