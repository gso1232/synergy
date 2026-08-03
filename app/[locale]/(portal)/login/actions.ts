"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCompanyEmail } from "@/lib/auth-domain";

export type SignInState = {
  error: "invalid" | "missing" | "throttled" | null;
};

/**
 * The sign-in server action. Runs entirely on the server, so the session
 * cookies Supabase issues are set on the response before the browser ever sees
 * a page — there is no window where a token lives in client JS.
 *
 * `locale` is bound by the form (see LoginForm) so the post-login redirect stays
 * in the reader's locale.
 *
 * ERROR MESSAGING IS DELIBERATELY GENERIC. A wrong password and an unknown email
 * both return "invalid" — never "no such account" — so the form cannot be used
 * to enumerate which email addresses have accounts.
 *
 * POST-LOGIN ROUTING IS ROLE-AWARE, and it must be: sending an agent to /admin
 * would bounce them off the admin guard and back here, a loop. Admins land on
 * /admin. Agents have no portal of their own yet (open decision, deferred), so
 * for now they land on the public site — authenticated, but with nowhere
 * staff-only to be. Wire the agent destination here when that route exists.
 */
export async function signIn(
  locale: string,
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "missing" };

  // ===========================================================================
  // 🔧 TEMPORARY SIGN-IN DIAGNOSTICS — REMOVE AFTER DEBUGGING.
  // These console lines print to the SERVER TERMINAL (the `next dev` window),
  // never to the browser. They log which Supabase project the runtime is
  // actually talking to and which key it's using, so we can confirm the target
  // matches the project where the user was created. The key VALUE is never
  // printed — only its kind and a short prefix.
  // ===========================================================================
  const dbgUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbgKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  const dbgKeyKind = dbgKey.startsWith("sb_secret_")
    ? "SECRET ❌ (should never be here)"
    : dbgKey.startsWith("sb_publishable_")
      ? "publishable ✅"
      : dbgKey
        ? "unknown-format ⚠️"
        : "MISSING ❌";
  console.log("[auth-debug] Supabase URL      :", dbgUrl);
  console.log("[auth-debug] key kind          :", dbgKeyKind);
  console.log("[auth-debug] key prefix / len  :", dbgKey.slice(0, 17) + "…", "/", dbgKey.length);
  console.log("[auth-debug] attempting email  :", JSON.stringify(email));
  // ===========================================================================

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 🔧 TEMPORARY — REMOVE AFTER DEBUGGING. The distinct error code matters:
  // `invalid_credentials` = wrong email/password (or user in another project);
  // `email_not_confirmed`  = the user exists but Auto Confirm was NOT applied.
  if (error) {
    console.log("[auth-debug] sign-in FAILED   :", {
      name: error.name,
      status: error.status,
      code: (error as unknown as { code?: string }).code,
      message: error.message,
    });
  } else {
    console.log("[auth-debug] sign-in OK        : user id", data.user?.id);
  }

  // Supabase throttles the sign-in endpoint per IP and returns HTTP 429 when the
  // limit is hit. That is the ONE failure we surface distinctly — it is about
  // the rate of attempts, not about any specific account, so telling the user
  // "slow down" leaks nothing and makes the throttle observable. Wrong password
  // and unknown email both stay "invalid" so the form cannot enumerate accounts.
  if (error?.status === 429) return { error: "throttled" };
  if (error || !data.user) return { error: "invalid" };

  // ===========================================================================
  // 🔴 COMPANY-DOMAIN GATE. Sign-in succeeded; that is not the same as access.
  //
  // THREE THINGS MAKE THIS SAFE, AND ALL THREE ARE DELIBERATE:
  //
  // 1. IT READS `data.user.email`, NOT `email` FROM THE FORM. The form value is
  //    attacker-controlled. `data.user` is what Supabase returned for the
  //    authenticated account after verifying the credentials, so this is the
  //    address the account actually owns. Checking the typed value instead would
  //    be trivially bypassed by typing a company address while signing in to a
  //    personal account.
  //
  // 2. IT REQUIRES A CONFIRMED EMAIL. An unconfirmed address is one nobody has
  //    proven they control, so "it ends in @fflsynergy.com" means nothing yet.
  //    Supabase leaves `email_confirmed_at` null until the address is verified.
  //
  // 3. IT SIGNS THE SESSION OUT BEFORE RETURNING. `signInWithPassword` has
  //    ALREADY minted a session and set cookies by this point. Returning an
  //    error without `signOut()` would leave a valid session in the browser —
  //    the user would see "invalid" and yet be logged in, and the middleware
  //    would happily let them at /admin (where the role guard would then be the
  //    only thing stopping them). Revoking here is what makes the denial real.
  //
  // FAIL CLOSED: any failure to establish a company identity ends here, and the
  // error is the SAME generic "invalid" every other failure returns, so this
  // cannot be used to discover which addresses have accounts or which domain is
  // allowed.
  // ===========================================================================
  const verifiedEmail = data.user.email;
  const emailConfirmed = Boolean(data.user.email_confirmed_at);

  if (!emailConfirmed || !isCompanyEmail(verifiedEmail)) {
    console.log("[auth] denied — not a confirmed company address:", {
      confirmed: emailConfirmed,
      // Domain only. The full address is not logged.
      domain: verifiedEmail?.split("@")[1] ?? null,
    });
    await supabase.auth.signOut();
    return { error: "invalid" };
  }

  // Role decides the destination. Read from the DB, not the token.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // redirect() throws NEXT_REDIRECT — it must be OUTSIDE any try/catch.
  redirect(profile?.role === "admin" ? `/${locale}/admin` : `/${locale}`);
}
