"use server";

import { createClient } from "@/lib/supabase/server";
import { authRateLimited } from "@/lib/auth-rate-limit";
import { siteOrigin } from "@/lib/site-origin";

export type ForgotState = {
  /**
   * 🔴 `sent` IS RETURNED FOR EVERY OUTCOME EXCEPT A MISSING/MALFORMED FIELD AND
   * A RATE LIMIT. Not because everything succeeded — because the alternative
   * leaks. See the box below.
   */
  status: "idle" | "sent" | "error";
  error?: "missing" | "throttled";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * =============================================================================
 * PASSWORD RESET REQUEST.
 *
 * 🔴 THE RESPONSE MUST NOT REVEAL WHETHER AN ACCOUNT EXISTS, AND THAT IS THE
 * WHOLE DESIGN OF THIS FILE.
 *
 * "We've sent you a link" vs "no account with that address" is a free account
 * enumeration oracle — point it at a list of `firstname@fflsynergy.com` guesses
 * and it tells you the company directory. So:
 *
 *   · the same `sent` is returned for a real address, an address with no
 *     account, a non-company address, and a Supabase failure;
 *   · `resetPasswordForEmail` is called for EVERY syntactically valid address,
 *     including non-company ones, so the work done (and therefore the response
 *     time) does not fork on whether the address is eligible. Supabase itself
 *     silently no-ops for unknown addresses;
 *   · no error from Supabase is surfaced to the caller. Failures are logged
 *     server-side without the address.
 *
 * 🔴 THERE IS DELIBERATELY NO DOMAIN CHECK HERE. Adding one would be the leak in
 * a different costume: rejecting non-company addresses distinctly tells an
 * attacker which domain is in use, and doing it EARLY would make non-company
 * addresses measurably faster to reject than company ones — a timing oracle for
 * exactly the thing the uniform message exists to hide. Sending a reset mail to
 * an address that has no account is harmless; Supabase does not send one.
 *
 * =============================================================================
 * WHAT A RESET CANNOT DO, WHICH IS WHY THE ABOVE IS SAFE.
 *
 * Completing a reset mints a session. That session is bound by exactly the same
 * RLS as any other: a `pending` account still reads zero rows from every table.
 * A reset is therefore not a way around approval, and reset-password/actions.ts
 * signs the session out the moment the password is changed, so the normal
 * sign-in gates re-apply on the next request.
 * =============================================================================
 */
export async function requestReset(
  locale: string,
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) return { status: "error", error: "missing" };

  // Tighter bucket than signup: every accepted request sends an email, so this
  // is the endpoint that can burn the project's mail allowance.
  if (authRateLimited("reset")) return { status: "error", error: "throttled" };

  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    /* Both email flows land on the SAME callback route, which is the only place
       that can exchange the code for cookies (a page cannot set them). `next`
       sends recovery on to /reset-password afterwards. One URL to allowlist in
       Supabase, one copy of the exchange. MUST be in the project's
       Auth -> URL Configuration -> Redirect URLs list. */
    redirectTo: `${siteOrigin()}/${locale}/auth/callback?next=reset`,
  });

  if (error) {
    // Never the address, never the message — only a code, so an outage is
    // diagnosable without building a log of who was probed.
    console.log("[auth] reset request non-fatal", {
      code: (error as unknown as { code?: string }).code ?? error.name,
      status: error.status,
    });
  }

  // Same answer, always.
  return { status: "sent" };
}

