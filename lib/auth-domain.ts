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

/**
 * MAY AN ADMIN CREATE AN ACCOUNT FOR THIS ADDRESS? Company domain ONLY.
 *
 * 🔴 THIS IS NOT `isCompanySignupEmail` COMING BACK, AND IT IS NOT A SIGN-UP
 * GATE. There is still no self-service creation path — see the block below, and
 * the `signUp()` grep in scripts/test-auth-domain.mjs that fails the build if one
 * appears. The only caller is `inviteAgentAccount`, where the person typing the
 * address is an ALREADY-AUTHENTICATED ADMIN and the question is "did Aiman make
 * a mistake", not "may this stranger in".
 *
 * 🔴 IT DELIBERATELY IGNORES `ALLOWED_EMAILS`. The individual allowlist is a
 * grandfather clause for an account that already exists; it must never be a
 * template for creating NEW ones. New accounts are company-domain only, full
 * stop. That is also what the `enforce_company_domain` trigger enforces at
 * INSERT, and these two must agree.
 */
export function isCompanyDomainEmail(email: string | null | undefined): boolean {
  const p = parts(email);
  if (!p) return false;
  return (ALLOWED_DOMAINS as readonly string[]).includes(p.domain);
}

/**
 * =============================================================================
 * NEAR-MISS DETECTION — "did you mean @fflsynergy.com?"
 *
 * 🔴 WHY A WRONG DOMAIN AND A TYPO'D DOMAIN MUST NOT SHARE ONE MESSAGE.
 *
 * `mohamedsamy2@fllsynergy.com` — a doubled L — reached account creation and the
 * admin got a generic "must use an @fflsynergy.com address", which reads as "you
 * used the wrong company" rather than "you fat-fingered one letter". The address
 * LOOKS right at a glance; that is exactly what makes the typo expensive. The
 * account silently fails to be created, or worse gets created somewhere it does
 * not belong, and nobody spots why.
 *
 * `ffl` -> `ffi` / `fll` / `ff1`, a dropped or doubled letter, two swapped
 * letters, `.com` -> `.cm` / `.co` / `.comm`: all one or two edits away, all
 * invisible when you are reading fast.
 *
 * 🔴 THIS GRANTS NOTHING. It is a message-selection helper and NOTHING else.
 * `isCompanyEmail` and `isCompanyDomainEmail` are unchanged and still return
 * false for every one of these; a near miss is still a REJECTION, just an
 * honest one. If this function were deleted, the same addresses would still be
 * refused — the admin would simply be told less.
 *
 * 🔴 THE THRESHOLD IS TWO EDITS, AND IT IS AN UPPER BOUND ON HELP, NOT ON
 * SECURITY. `fflsynergy.com` is 14 characters, so two edits cannot reach any
 * plausible real domain: `gmail.com` is 11 edits away, `notfflsynergy.com` is 3,
 * and `fflsynergy.com.evil.com` — the suffix attack — is 9. Those all fall
 * through to the ordinary refusal, which is the correct answer for them.
 * =============================================================================
 */

/**
 * Damerau-Levenshtein (optimal string alignment) distance, capped for cost.
 * Transpositions count as ONE edit, which is the whole point: `fflsyngery` is a
 * finger-swap, not two unrelated mistakes.
 */
function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return d[a.length][b.length];
}

/** How many edits from an allowed domain before we stop calling it a typo. */
const TYPO_MAX_EDITS = 2;

/**
 * Is this a plausible mistyping of a company domain — i.e. refused, but almost
 * certainly a slip rather than the wrong company?
 *
 * Returns false for anything `isCompanyDomainEmail` already accepts, so the two
 * can be asked in either order without overlapping.
 */
export function looksLikeCompanyDomainTypo(email: string | null | undefined): boolean {
  const p = parts(email);
  if (!p) return false;
  if ((ALLOWED_DOMAINS as readonly string[]).includes(p.domain)) return false;

  return (ALLOWED_DOMAINS as readonly string[]).some((allowed) => {
    /* 🔴 GUARD AGAINST THE SUFFIX ATTACK BEFORE MEASURING. A long hostile
       domain that merely CONTAINS the real one is not a near miss, and a raw
       distance check on wildly different lengths is meaningless anyway. */
    if (Math.abs(p.domain.length - allowed.length) > TYPO_MAX_EDITS) return false;
    return editDistance(p.domain, allowed) <= TYPO_MAX_EDITS;
  });
}

/** The domain to suggest in a near-miss message. One allowed domain today. */
export const PRIMARY_DOMAIN = ALLOWED_DOMAINS[0];

/**
 * =============================================================================
 * 🔴 `isCompanySignupEmail` WAS REMOVED WHEN PUBLIC SIGNUP WAS REMOVED.
 *
 * It answered "may this address CREATE an account" for the public signup form,
 * checking ALLOWED_DOMAINS only (never the allowlist) so that a stranger could
 * not register a grandfathered address out from under its owner.
 *
 * There is no public signup any more, so there is no caller and no question to
 * answer: accounts are created solely by an admin from the admin panel. A
 * domain check on the *typed* address was never the real control anyway —
 * anyone can type an @fflsynergy.com address. Admin creation is the control.
 *
 * 🔴 DO NOT REINTRODUCE THIS FUNCTION. Its existence implies a self-service
 * creation path. If one is ever wanted again, it needs its own review, not a
 * revived helper. The database trigger `on_auth_user_domain_check` (0004) still
 * re-checks the domain at INSERT on auth.users, covering the paths that never
 * touch app code: the dashboard, the Admin API, invites and an admin's typo.
 * =============================================================================
 */
