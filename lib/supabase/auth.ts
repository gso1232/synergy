import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

/**
 * The one place that answers "who is this request, and what is their role?"
 *
 * Wrapped in React `cache()` so that within a single request the layout guard
 * and the page that reads the user for display share ONE `getUser()` round trip
 * and ONE profile query, instead of each paying for their own.
 *
 * FAIL CLOSED by construction: any failure — no session, a tampered token that
 * fails signature verification, a profile row that does not exist, a thrown
 * error reaching for it — resolves to `{ user: null, role: null }`. Callers
 * treat null as "deny". There is no path that returns a user without a verified
 * identity behind it.
 *
 * Identity comes from `getUser()` (verifies the JWT with the Auth server), never
 * `getSession()`. The role comes from the database on EVERY request — not from a
 * JWT claim — so a revoked or downgraded role takes effect immediately, with no
 * stale-claim window.
 */
/**
 * Guard for MUTATIONS (server actions / route handlers). Re-verifies the admin
 * role server-side on every call — a hidden or disabled button is not access
 * control. Returns the RLS-scoped Supabase client (running as the logged-in
 * admin, so the DB policies are the second, authoritative gate) or `null` when
 * the caller is not a verified admin. Callers MUST treat null as "deny".
 *
 * FAIL CLOSED: any failure in getUserAndRole resolves to null here.
 */
export async function requireAdmin() {
  const { user, role } = await getUserAndRole();
  if (!user || role !== "admin") return null;
  return { user, supabase: createClient() };
}

export const getUserAndRole = cache(
  async (): Promise<{ user: User | null; role: AppRole | null }> => {
    try {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return { user: null, role: null };

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profileError || !profile) return { user, role: null };

      return { user, role: profile.role as AppRole };
    } catch {
      return { user: null, role: null };
    }
  },
);
