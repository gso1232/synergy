/**
 * THE COMPANY-DOMAIN RULE. One definition, imported by every place that has to
 * enforce it, so the check can never drift between call sites.
 *
 * =============================================================================
 * 🔴 WHAT THIS IS AND — MORE IMPORTANTLY — WHAT IT IS NOT.
 *
 * IT IS a server-side, fail-closed filter that denies sign-in to any account
 * whose verified email is not on the company domain.
 *
 * IT IS NOT, ON ITS OWN, WHAT KEEPS STRANGERS OUT. "The address ends in
 * @fflsynergy.com" proves nothing by itself — anyone can type that string. The
 * control that actually holds is that **THERE IS NO PUBLIC SIGNUP**: accounts
 * are created by an admin through the Supabase dashboard or Admin API, both
 * privileged paths a visitor cannot reach. A stranger cannot create an account
 * at all, with any address. This function is the BACKSTOP that makes the domain
 * rule true even if an account is ever created by some other route (an invite, a
 * future OAuth provider, a mistake).
 *
 * Both layers are needed. Signup control alone would let a mistakenly-created
 * gmail account in; this check alone would be theatre if anyone could sign up.
 *
 * =============================================================================
 * 🔴 IT READS THE *VERIFIED* EMAIL, NEVER FORM INPUT. Every caller passes
 * `user.email` from `supabase.auth.getUser()` — the address Supabase holds for
 * the authenticated account, returned only after the JWT signature is checked.
 * It must NEVER be called with the email a user typed into the form: that is
 * attacker-controlled and would let someone type an @fflsynergy.com address to
 * pass the check while signing in to a different account.
 *
 * =============================================================================
 * 🔴 CASE AND SUBDOMAINS. The comparison lowercases (email domains are
 * case-insensitive) and matches the domain EXACTLY — `@fflsynergy.com` and
 * nothing else. `@mail.fflsynergy.com` and `@fflsynergy.com.evil.com` both FAIL,
 * which is the point: a suffix test (`endsWith(".fflsynergy.com")` or a bare
 * `includes`) is the classic way this check is defeated. If a real subdomain is
 * ever needed, add it to ALLOWED_DOMAINS deliberately — do not loosen the match.
 */

/** Exact domains permitted to sign in. Lowercase. */
export const ALLOWED_DOMAINS = ["fflsynergy.com"] as const;

/**
 * 🔴 INDIVIDUAL ALLOWLIST — EXACT ADDRESSES, NOT A SECOND DOMAIN.
 *
 * The founding admin account is `mohamed204430@gmail.com`. It was created on
 * 2026-07-31, BEFORE the company-domain rule existed, and it is currently the
 * ONLY account on the project (verified against the live Auth API: 1 user, 1
 * profile, role `admin`).
 *
 * Without this list the domain rule locks that account out of its own portal:
 * `login/actions.ts` re-checks the VERIFIED email after a successful password
 * exchange and calls `signOut()` when the check fails, so the credentials would
 * be correct and the session would still be destroyed on every attempt.
 *
 * 🔴 WHY NOT JUST ADD "gmail.com" TO ALLOWED_DOMAINS. That would let ANY gmail
 * address in the world hold a portal account, which is the exact hole 0004
 * exists to close. One named address is an exception; a public mail domain is a
 * back door. Keep this list to specific, individually-justified addresses.
 *
 * 🟡 THIS IS A BRIDGE, NOT THE DESTINATION. The clean end state is an
 * `aiman@fflsynergy.com` (or equivalent) company account with the `admin` role,
 * after which this entry should be DELETED and the gmail account demoted or
 * removed. Mirrored in SQL by `public.is_allowlisted_email()` — the two must be
 * kept in step or the database and the app will disagree about who may exist.
 */
export const ALLOWED_EMAILS = ["mohamed204430@gmail.com"] as const;

/**
 * Split and normalise an address, or return null if it is not exactly one
 * `local@domain` pair. Rejects "a@b@c", which some naive parsers read as
 * domain "c".
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

/** Is this verified address on the individual allowlist above? */
export function isAllowlistedEmail(email: string | null | undefined): boolean {
  const p = parts(email);
  if (!p) return false;
  return (ALLOWED_EMAILS as readonly string[]).includes(`${p.local}@${p.domain}`);
}

/**
 * May this verified email address sign in?
 *
 * TRUE for the company domain OR an individually allowlisted address.
 *
 * FAIL CLOSED: null, undefined, empty, malformed, or multi-`@` input all return
 * false. There is no input that returns true by accident.
 *
 * 🔴 THE NAME IS KEPT AS `isCompanyEmail` ON PURPOSE. It is the single function
 * `login/actions.ts` guards on, and renaming it would leave a plausible-looking
 * `isCompanyEmail` import somewhere that no longer exists — or worse, a stale
 * copy that still returns false. One gate, one name, one place to reason about.
 */
export function isCompanyEmail(email: string | null | undefined): boolean {
  const p = parts(email);
  if (!p) return false;
  return (
    (ALLOWED_DOMAINS as readonly string[]).includes(p.domain) ||
    isAllowlistedEmail(email)
  );
}
