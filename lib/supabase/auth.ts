import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, createReadClient } from "@/lib/supabase/server";
import type { AccountStatus, AppRole } from "@/lib/types";

/**
 * The one place that answers "who is this request, what is their role, and is
 * their account active?"
 *
 * Wrapped in React `cache()` so that within a single request the layout guard
 * and the page that reads the user for display share ONE `getUser()` round trip
 * and ONE status/role lookup, instead of each paying for their own.
 *
 * FAIL CLOSED by construction: any failure — no session, a tampered token that
 * fails signature verification, a missing profile, a thrown error reaching for
 * it — resolves to `{ user: null, role: null, status: null }`. Callers treat
 * null as "deny". There is no path that returns a user without a verified
 * identity behind it.
 *
 * Identity comes from `getUser()` (verifies the JWT with the Auth server), never
 * `getSession()`. Role and status come from the database on EVERY request — not
 * from a JWT claim — so a revoked, downgraded or rejected account takes effect
 * immediately, with no stale-claim window.
 *
 * =============================================================================
 * 🔴 WHY ROLE AND STATUS COME FROM RPCs AND NOT FROM `select ... from profiles`.
 *
 * 0005's `profiles_select_own` policy requires `status = 'active'`. A pending
 * user therefore reads ZERO rows from `profiles` — including their own — which
 * is exactly the behaviour we want at the database. But it means a table read
 * cannot distinguish these three cases:
 *
 *     pending user        (row exists, policy denies)   -> 0 rows
 *     rejected user       (row exists, policy denies)   -> 0 rows
 *     no profile at all   (broken/half-created account) -> 0 rows
 *
 * Collapsing all three into "deny" is safe, but it makes it impossible to show
 * a pending agent the "awaiting approval" screen — they would look identical to
 * a broken account and get bounced to /login forever with no explanation.
 *
 * `current_app_role()` and `current_account_status()` are SECURITY DEFINER, so
 * they bypass RLS and answer for the CALLER ONLY (no arguments; `auth.uid()`
 * comes from the verified JWT). They leak nothing: the most a caller can learn
 * is their own role and their own status, which they are entitled to know.
 * =============================================================================
 */
export const getAccountState = cache(
  async (): Promise<{
    user: User | null;
    role: AppRole | null;
    status: AccountStatus | null;
  }> => {
    try {
      /* 🔴 THE READ CLIENT, NOT THE WRITE ONE. This runs inside layouts and
         pages, which cannot persist a rotated refresh token — see the rule at
         the top of lib/supabase/server.ts. Refreshing here is what was logging
         admins out mid-session. Identity is still verified against GoTrue
         below; only the local refresh heuristic is suppressed. */
      const supabase = createReadClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return { user: null, role: null, status: null };

      const [roleRes, statusRes] = await Promise.all([
        supabase.rpc("current_app_role"),
        supabase.rpc("current_account_status"),
      ]);

      return {
        user,
        role: (roleRes.data as AppRole | null) ?? null,
        status: (statusRes.data as AccountStatus | null) ?? null,
      };
    } catch {
      return { user: null, role: null, status: null };
    }
  },
);

/**
 * Back-compat shim for callers that only ever cared about role.
 *
 * 🔴 IT NOW RETURNS `role: null` FOR A NON-ACTIVE ACCOUNT, and that is the
 * point: every existing guard written as `if (role !== "admin") deny` becomes
 * status-aware for free, with no call-site edits and no chance of one being
 * missed. A pending admin — which should not exist, but defence in depth — is
 * denied by the same line that denies an agent.
 */
export const getUserAndRole = cache(
  async (): Promise<{ user: User | null; role: AppRole | null }> => {
    const { user, role, status } = await getAccountState();
    return { user, role: status === "active" ? role : null };
  },
);

/**
 * Guard for MUTATIONS (server actions / route handlers). Re-verifies the admin
 * role AND the active status server-side on every call — a hidden or disabled
 * button is not access control. Returns the RLS-scoped Supabase client (running
 * as the logged-in admin, so the DB policies are the second, authoritative
 * gate) or `null` when the caller is not a verified ACTIVE admin. Callers MUST
 * treat null as "deny".
 *
 * The client it hands back is deliberately NOT the service-role client. Every
 * write it performs is re-judged by `is_active_admin()` in Postgres, so even if
 * this function were deleted the database would still refuse the write.
 *
 * FAIL CLOSED: any failure in getAccountState resolves to null here.
 */
export async function requireAdmin() {
  const { user, role, status } = await getAccountState();
  if (!user || role !== "admin" || status !== "active") return null;
  return { user, supabase: createClient() };
}
