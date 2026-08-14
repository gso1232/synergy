/**
 * EMAIL RULES FOR ACCOUNTS. One definition, imported by every place that has to
 * apply it, so the check can never drift between call sites.
 *
 * =============================================================================
 * 🔴 THE COMPANY-DOMAIN RULE WAS REMOVED ON 2026-08-14, ON INSTRUCTION.
 *
 * This file used to answer "is this address @fflsynergy.com". It no longer asks.
 * ANY valid email address may hold an account — gmail, outlook, anything — and
 * may sign in. The database side went with it in
 * `supabase/migrations/0009_remove_domain_restriction.sql`, which drops the
 * `on_auth_user_domain_check` trigger on `auth.users` and the
 * `enforce_company_domain()` function behind it.
 *
 * 🔴 THE EXPORTS WERE DELETED RATHER THAN NEUTERED, AND THAT IS THE WHOLE POINT
 * OF THIS NOTE. The tempting minimal edit is `return true` inside
 * `isCompanyEmail`. That leaves a function whose NAME states a rule the codebase
 * no longer has, still imported at a gate in `login/actions.ts` that now gates
 * nothing — and the next person to read that line will believe the domain is
 * still checked. A removed rule should be removed at the call site, so the
 * absence is visible where the decision is made. `isCompanyEmail`,
 * `isCompanyDomainEmail`, `isAllowlistedEmail`, `looksLikeCompanyDomainTypo`,
 * `ALLOWED_DOMAINS`, `ALLOWED_EMAILS` and `PRIMARY_DOMAIN` are all gone;
 * `scripts/test-auth-domain.mjs` now FAILS if any of them comes back, so the
 * lock cannot creep in again unnoticed.
 *
 * =============================================================================
 * 🔴 WHAT ACTUALLY KEEPS STRANGERS OUT — UNCHANGED, AND IT WAS NEVER THIS FILE.
 *
 * The old docblock here said so itself: "the address ends in @fflsynergy.com"
 * proves nothing, because anyone can type that string. The control that holds is
 * that **THERE IS NO PUBLIC SIGNUP**. There is no signup route, no `signUp()`
 * call anywhere in the repo, and no OAuth or OTP entry point; accounts are
 * created only by an authenticated admin, the Supabase dashboard, or the Admin
 * API. That is asserted on every run of `scripts/test-auth-domain.mjs`, and it
 * is untouched by this change.
 *
 * Also untouched: sign-in still requires a CONFIRMED address, `profiles.status`
 * must be `'active'` for any policy to grant anything, `role` is immutable
 * through the API, and RLS is on every table.
 *
 * WHAT WAS GENUINELY LOST: a mistyped address used to be refused at creation
 * ("did you mean @fflsynergy.com?"). It is now accepted, and the account is
 * created at the wrong address. Admins should read the address back before
 * submitting.
 * =============================================================================
 */

/**
 * Split and normalise an address, or return null if it is not exactly one
 * `local@domain` pair. Rejects "a@b@c", which some naive parsers read as
 * domain "c".
 *
 * Kept from the original module: it was the shared parser under every predicate
 * here, and the multi-`@` rejection is still worth having.
 */
function parts(email: string | null | undefined): { local: string; domain: string } | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  const bits = trimmed.split("@");
  if (bits.length !== 2) return null;
  const [local, domain] = bits;
  if (!local || !domain) return null;
  return { local, domain };
}

/**
 * IS THIS A USABLE EMAIL ADDRESS? Format only — no domain rule of any kind.
 *
 * 🔴 DELIBERATELY PERMISSIVE, AND THAT IS CORRECT FOR THIS JOB. It is not
 * attempting RFC 5322; a regex that tries to is either wrong or unreadable, and
 * a stricter one here would reject real addresses (plus-tags, apostrophes,
 * long TLDs, internationalised domains) that Supabase would happily accept. The
 * authority on whether an address can hold an account is GoTrue at creation
 * time, and the authority on whether the person owns it is the confirmation
 * step. This exists so an admin gets "that is not an email address" from a form
 * instead of a driver error from the API.
 *
 * What it does require: exactly one `@`, something either side of it, a dot in
 * the domain with at least two characters after it, and no whitespace anywhere.
 *
 * FAIL CLOSED: null, undefined, empty, malformed and multi-`@` input all return
 * false. There is no input that returns true by accident.
 */
export function isValidEmailFormat(email: string | null | undefined): boolean {
  const p = parts(email);
  if (!p) return false;
  if (/\s/.test(`${p.local}@${p.domain}`)) return false;
  // A dot with a 2+ character label after it, and no leading/trailing dot.
  return /^[^.].*\.[a-z]{2,}$/.test(p.domain) && !p.domain.endsWith(".");
}

/**
 * The one shape check the server actions share, so the create/invite/resume
 * paths cannot disagree about what counts as an address.
 *
 * 🔴 IT IS THE SAME REGEX THE ACTIONS USED INLINE BEFORE. Those three copies of
 * `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` are now one import. Consolidated during the
 * domain removal specifically because that edit touched all three call sites —
 * three identical regexes in three functions is exactly how one of them ends up
 * subtly different a year later.
 */
export const EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
