"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isCompanySignupEmail } from "@/lib/auth-domain";
import { authRateLimited } from "@/lib/auth-rate-limit";

export type SignUpState = {
  /**
   * `sent` is returned for EVERY outcome that is not a client-side input
   * problem — see the enumeration note below. It does not mean "an account was
   * created"; it means "if that address was eligible, an email is on its way".
   */
  status: "idle" | "sent" | "error";
  error?: "missing" | "domain" | "weak" | "throttled" | "unavailable";
};

/** Mirrors the Supabase project setting. Keep the two in step. */
const MIN_PASSWORD = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * =============================================================================
 * PUBLIC SIGN-UP. This is the most security-sensitive action in the project: it
 * is the first path by which a STRANGER can cause an account to exist.
 *
 * `lib/auth-domain.ts` used to say the thing keeping strangers out was that
 * there is no public signup. This file removes that control, so the ones that
 * replace it are worth naming precisely — in the order they actually fire:
 *
 *   1. RATE LIMIT, before any work. Speed bump only; see lib/auth-rate-limit.ts
 *      for why Supabase's own limiter is the durable control.
 *   2. DOMAIN, server-side, via `isCompanySignupEmail` — ALLOWED_DOMAINS only.
 *      🔴 NOT `isCompanyEmail`, which also honours the individual allowlist.
 *      Using that here would turn "this specific existing account may sign in"
 *      into "this specific address may be REGISTERED by whoever gets there
 *      first" — an account-takeover route on a personal gmail address.
 *   3. THE DATABASE TRIGGER `on_auth_user_domain_check` (0004) re-checks the
 *      domain at INSERT on auth.users. It catches every path that never touches
 *      this file, and it catches this file being wrong.
 *   4. EMAIL VERIFICATION. The account lands `unverified` (0005 trigger 4a) and
 *      counts as NOTHING until the inbox is proven. This is what makes the
 *      domain check mean something: anyone can type an @fflsynergy.com address,
 *      only the owner can open the mail.
 *   5. ADMIN APPROVAL. Even verified, the account is `pending` and RLS gives it
 *      zero rows on every table until an admin flips it to `active`.
 *
 * 🔴 ROLE IS NEVER SENT. `options.data` is attacker-controlled and lands in
 * `raw_user_meta_data`; 0005's `handle_new_user` hard-codes `'agent'` and reads
 * metadata ONLY for `full_name`. Passing `{"role":"admin"}` here would still
 * produce an agent — but this action does not pass it at all, so there are two
 * independent reasons it cannot happen.
 *
 * =============================================================================
 * 🔴 THE RESPONSE IS THE SAME WHETHER OR NOT THE ADDRESS ALREADY HAS AN ACCOUNT.
 *
 * With email confirmation ON, Supabase deliberately returns a success-shaped
 * response with an obfuscated user object when the address is already
 * registered, precisely so signup cannot be used to enumerate accounts. This
 * action preserves that: every outcome after the domain check returns `sent`,
 * including a Supabase error. A distinct "that address is already registered"
 * message would hand an attacker a list of who works here.
 *
 * The domain rejection IS distinct, and that is safe — it reveals only the
 * policy ("we take @fflsynergy.com addresses"), which the signup page states
 * out loud anyway, and nothing about which accounts exist.
 * =============================================================================
 */
export async function signUp(
  locale: string,
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 100);

  if (!email || !password || !fullName) return { status: "error", error: "missing" };
  if (!EMAIL_RE.test(email)) return { status: "error", error: "domain" };
  if (password.length < MIN_PASSWORD) return { status: "error", error: "weak" };

  // Gate 2 — see the box above. Domain only, allowlist deliberately excluded.
  if (!isCompanySignupEmail(email)) return { status: "error", error: "domain" };

  // Gate 1 runs AFTER the cheap input checks so a malformed submission does not
  // consume the caller's allowance, but BEFORE anything that costs an email.
  if (authRateLimited("signup")) return { status: "error", error: "throttled" };

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Where Supabase sends the confirmation link. MUST be listed in the
      // project's Auth -> URL Configuration -> Redirect URLs allowlist or
      // Supabase refuses it; see the deployment notes.
      emailRedirectTo: `${siteOrigin()}/${locale}/auth/callback`,
      // 🔴 full_name ONLY. No role, no status, nothing privileged. See the box.
      data: { full_name: fullName },
    },
  });

  if (error?.status === 429) return { status: "error", error: "throttled" };

  // Everything else — including "already registered" and genuine Supabase
  // failures — returns the SAME `sent`. Logged server-side (code only, never the
  // address) so a real outage is still diagnosable.
  if (error) {
    console.log("[auth] signup non-fatal", {
      code: (error as unknown as { code?: string }).code ?? error.name,
      status: error.status,
    });
  }

  return { status: "sent" };
}

/**
 * The origin to build the confirmation redirect from.
 *
 * 🔴 IT IS NOT TAKEN FROM THE `Host` HEADER ALONE WITHOUT A FALLBACK, and the
 * reason matters: `Host` is attacker-controlled on some setups, and a poisoned
 * value here would send the confirmation link — a one-time credential — to a
 * domain of the attacker's choosing. Two things make that inert:
 *
 *   1. `NEXT_PUBLIC_SITE_URL` wins when set. Set it in production.
 *   2. Supabase REJECTS any `emailRedirectTo` that is not in the project's
 *      Redirect URLs allowlist, so a poisoned host produces a failed send, not
 *      a leaked link. That allowlist is the real control.
 */
function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
