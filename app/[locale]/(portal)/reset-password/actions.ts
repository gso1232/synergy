"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ResetState = {
  status: "idle" | "error";
  error?: "missing" | "weak" | "mismatch" | "expired" | "failed";
};

/** Mirrors the Supabase project setting. Keep the two in step. */
const MIN_PASSWORD = 10;

/**
 * =============================================================================
 * SET A NEW PASSWORD, from a recovery link.
 *
 * By the time this action runs the user is holding a RECOVERY SESSION: the
 * `/reset-password` page exchanged the `code` from the emailed link for real
 * auth cookies. That session is what authorises `updateUser` — there is no
 * token in the form, and there must not be, because a token in a form field is
 * a token in browser history, in the Referer header and in any analytics that
 * scrapes form state.
 *
 * 🔴 IT SIGNS OUT IMMEDIATELY AFTER THE PASSWORD CHANGES, AND THAT IS A
 * SECURITY REQUIREMENT, NOT TIDINESS.
 *
 * A recovery link is a credential delivered to an inbox. Completing a reset
 * with the session left intact would mean: anyone who can read the mailbox —
 * a forwarded mail, a shared inbox, a stale device, a mail-server compromise —
 * lands INSIDE the portal without ever knowing a password. Signing out forces
 * the new password to be used at /login, where every gate applies again:
 *
 *   · the confirmed-address check on the VERIFIED address (the company-domain
 *     half of that gate was removed on 2026-08-14 — see login/actions.ts),
 *   · the `email_confirmed_at` requirement,
 *   · 🔴 and the ACCOUNT STATUS gate — so a `pending` or `rejected` account
 *     cannot use the reset flow as a side door into an approved session.
 *
 * RLS is the backstop under all of that: a pending user's recovery session
 * already reads zero rows from every table. The sign-out closes the window
 * rather than relying on the backstop alone.
 * =============================================================================
 */
export async function setNewPassword(
  locale: string,
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!password || !confirm) return { status: "error", error: "missing" };
  if (password !== confirm) return { status: "error", error: "mismatch" };
  if (password.length < MIN_PASSWORD) return { status: "error", error: "weak" };

  const supabase = createClient();

  // FAIL CLOSED. No recovery session means the link was never exchanged, has
  // already been used, or has expired — `updateUser` would otherwise operate on
  // whoever happens to be signed in on this browser, which would let someone
  // change a colleague's password from a shared machine by visiting this URL.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { status: "error", error: "expired" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.log("[auth] reset completion failed", {
      code: (error as unknown as { code?: string }).code ?? error.name,
      status: error.status,
    });
    // A rejected password (leaked-password protection, length policy) and a
    // genuine failure both land here. `failed` is generic; the page tells the
    // user to try again or request a new link.
    return { status: "error", error: "failed" };
  }

  // 🔴 See the box. The session dies here, not on the next page.
  await supabase.auth.signOut();

  // redirect() throws NEXT_REDIRECT — it must be OUTSIDE any try/catch.
  redirect(`/${locale}/login?reset=1`);
}
