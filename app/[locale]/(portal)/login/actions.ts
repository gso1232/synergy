"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/cms/activity";
import type { AccountStatus, AppRole } from "@/lib/types";

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
 * ERROR MESSAGING IS DELIBERATELY GENERIC. A wrong password, an unknown email, a
 * non-company address and a REJECTED account all return "invalid" — never "no
 * such account" — so the form cannot be used to enumerate which addresses have
 * accounts, or which have been turned down.
 *
 * 🔴 THE `[auth-debug]` BLOCK THAT USED TO LIVE HERE IS DELETED, NOT COMMENTED.
 * It printed the attempted email address and a prefix of the Supabase key to the
 * server log on EVERY sign-in attempt. Attempted addresses are personal data and
 * a log of them is an enumeration oracle for anyone who can read logs; a key
 * prefix narrows a brute force. It was labelled "TEMPORARY — REMOVE AFTER
 * DEBUGGING" and outlived its debugging session. The one line kept below logs a
 * DOMAIN and a status, never a full address.
 */
export async function signIn(
  locale: string,
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "missing" };

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Supabase throttles the sign-in endpoint per IP and returns HTTP 429 when the
  // limit is hit. That is the ONE failure we surface distinctly — it is about
  // the rate of attempts, not about any specific account, so telling the user
  // "slow down" leaks nothing and makes the throttle observable. Wrong password
  // and unknown email both stay "invalid" so the form cannot enumerate accounts.
  if (error?.status === 429) return { error: "throttled" };
  if (error || !data.user) return { error: "invalid" };

  // ===========================================================================
  // 🔴 GATE 1 — CONFIRMED ADDRESS. Sign-in succeeded; that is not the same as
  // access.
  //
  // 🔴 THE COMPANY-DOMAIN HALF OF THIS GATE WAS REMOVED ON 2026-08-14, ON
  // INSTRUCTION. It read `!isCompanyEmail(verifiedEmail)` and signed out any
  // account whose verified address was not @fflsynergy.com (or on a small
  // individual allowlist). ANY domain may now sign in. The database side went
  // with it — see supabase/migrations/0009_remove_domain_restriction.sql, and
  // lib/auth-domain.ts for what still protects this boundary and what does not.
  //
  // The check was DELETED rather than made to always pass: a gate that is still
  // written but can no longer fail is a gate the next reader will believe in.
  //
  // WHAT REMAINS HERE, AND WHY EACH PART STILL MATTERS:
  //
  // 1. IT REQUIRES A CONFIRMED EMAIL. An unconfirmed address is one nobody has
  //    proven they control. Supabase leaves `email_confirmed_at` null until the
  //    address is verified. This is now the ONLY property of the address itself
  //    that sign-in tests, which makes it more load-bearing than it was before,
  //    not less.
  //
  // 2. IT READS `data.user.email`, NOT `email` FROM THE FORM. The form value is
  //    attacker-controlled; `data.user` is what Supabase returned for the
  //    authenticated account after verifying the credentials. Nothing below
  //    branches on the address any more, but the variable feeds the activity
  //    log, and a log written from form input would be a log of what someone
  //    typed rather than of who signed in.
  //
  // 3. IT SIGNS THE SESSION OUT BEFORE RETURNING. `signInWithPassword` has
  //    ALREADY minted a session and set cookies by this point. Returning an
  //    error without `signOut()` would leave a valid session in the browser —
  //    the user would see "invalid" and yet be logged in.
  // ===========================================================================
  const verifiedEmail = data.user.email;
  const emailConfirmed = Boolean(data.user.email_confirmed_at);

  if (!emailConfirmed) {
    await supabase.auth.signOut();
    return { error: "invalid" };
  }

  // ===========================================================================
  // 🔴 GATE 2 — ACCOUNT STATUS. NEW IN 0005, and the reason public signup can be
  // open at all.
  //
  // Passing gate 1 does not imply "belongs here" — since 2026-08-14 it implies
  // only "controls the inbox for this address", on any domain. An admin still
  // has to have set the account active, and until then it reaches nothing.
  //
  // 🔴 THIS GATE CARRIES MORE WEIGHT THAN IT USED TO. With the domain rule gone
  // (see gate 1), `status = 'active'` and the absence of public signup are what
  // separate an account that belongs here from one that merely exists.
  //
  // Status is read through the RPC, not `select ... from profiles`, because
  // 0005's `profiles_select_own` policy denies a non-active user their own row —
  // see the note in lib/supabase/auth.ts.
  //
  // 🔴 THIS IS NOT THE SECURITY BOUNDARY. RLS is. Even if this whole block were
  // deleted, a pending user's JWT still reads zero rows from every table. This
  // is here so the user is TOLD what is happening instead of silently landing on
  // an empty dashboard.
  // ===========================================================================
  const [{ data: roleData }, { data: statusData }] = await Promise.all([
    supabase.rpc("current_app_role"),
    supabase.rpc("current_account_status"),
  ]);

  const role = (roleData as AppRole | null) ?? null;
  const status = (statusData as AccountStatus | null) ?? null;

  // Domain only, never the full address; status is not personal data.
  console.log("[auth] sign-in", {
    domain: verifiedEmail?.split("@")[1] ?? null,
    status,
  });

  // REJECTED, or no profile at all (a half-created account). Same generic
  // "invalid" as a wrong password, and the session is destroyed. Decision 4:
  // rejected users are silently denied — no distinct message, no email — so
  // this cannot be used to discover that an address was turned down.
  if (status === "rejected" || status === null) {
    await supabase.auth.signOut();
    return { error: "invalid" };
  }

  // PENDING / UNVERIFIED — the session SURVIVES, deliberately. It reaches
  // nothing (RLS), and keeping it is what lets /pending render a real
  // "awaiting approval" screen with a working sign-out, instead of a message on
  // the login form that vanishes on refresh. `unverified` should be unreachable
  // here because Supabase blocks sign-in for an unconfirmed address, but it is
  // handled rather than assumed.
  if (status !== "active") {
    redirect(`/${locale}/pending`);
  }

  /* 🔴 THE AUDIT TRAIL STARTS HERE, AND IT IS WRITTEN ONLY FOR A SUCCESSFUL,
     APPROVED SIGN-IN. Every failure path above has already returned — a log of
     attempts would be a log of which addresses exist, i.e. the enumeration
     oracle the generic error messages exist to prevent.

     `await`ed BEFORE the redirect, not after: `redirect()` throws NEXT_REDIRECT
     to unwind the action, so anything below it never runs. The write is
     best-effort and cannot fail the sign-in (see logActivity's docblock). */
  await logActivity(data.user.id, "login", verifiedEmail ?? null, { role });

  // ACTIVE. Role decides the destination, read from the DB and not the token.
  // Sending an agent to /admin would bounce them off the admin guard and back
  // to /login, a loop.
  //
  // 🔴 AN AGENT NOW LANDS ON /agents, NOT /welcome. The hardcoded portal is
  // retired in favour of the CMS-driven area; next.config.mjs redirects the old
  // routes, so an existing bookmark still works. See that file's block.
  redirect(role === "admin" ? `/${locale}/admin` : `/${locale}/agents`);
}
