import "server-only";

import { createReadClient } from "@/lib/supabase/server";
import type { ActivityLog } from "@/lib/types";
import type { ReadResult } from "@/lib/admin/data";

/**
 * THE ACTIVITY LOG — one writer, one reader.
 *
 * =============================================================================
 * 🔴 EVERY WRITE IS BEST-EFFORT AND CAN NEVER FAIL THE THING IT IS RECORDING.
 *
 * `logActivity` swallows its errors on purpose. The alternative — letting a
 * failed INSERT propagate — means a Postgres hiccup while writing "agent viewed
 * page 3" would throw inside a server component and 500 the page the agent was
 * trying to read. An audit trail is a record OF the work; it is not allowed to
 * BE the work. A dropped line is logged to the server console and the request
 * continues.
 *
 * 🔴 IT WRITES THROUGH THE RLS-SCOPED CLIENT, NOT THE SERVICE ROLE. 0007's
 * `activity_logs_insert_self` policy checks `user_id = auth.uid()`, so Postgres
 * — not this function — is what guarantees an entry is attributed to the session
 * that actually made it. Passing `userId` explicitly and having the database
 * refuse a mismatch is stronger than trusting the caller to pass the right one.
 *
 * 🔴 WHAT MUST NEVER GO IN `metadata`. It is readable by any admin, forever, and
 * it is the obvious place to "just log the input for debugging". No passwords
 * (including page-gate attempts), no tokens, no full email addresses of third
 * parties. `target` carries a slug or an address the admin already administers;
 * that is the intended level of detail.
 */
export async function logActivity(
  userId: string | null | undefined,
  action: string,
  target?: string | null,
  metadata?: Record<string, unknown>,
): Promise<void> {
  // No verified user means no row: the policy would reject it anyway, and a
  // null-actor line written from the app would be indistinguishable from the
  // null-actor lines that appear when an account is deleted.
  if (!userId) return;

  try {
    const supabase = createReadClient();
    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      target: target ?? null,
      metadata: metadata ?? null,
    });
    if (error) console.log("[activity] write dropped", { action, code: error.code });
  } catch {
    console.log("[activity] write dropped", { action, code: "throw" });
  }
}

/** Filters the Logs tab can apply. All optional; all narrow the same query. */
export type LogFilters = {
  userId?: string;
  action?: string;
  /** ISO date (YYYY-MM-DD), inclusive. */
  from?: string;
  /** ISO date (YYYY-MM-DD), inclusive — expanded to end-of-day below. */
  to?: string;
  limit?: number;
};

/** Hard ceiling on rows per read. The log grows without bound (a `view_page`
 *  per page view), so an unbounded select would eventually time out the admin
 *  page and take the whole dashboard with it. */
const MAX_ROWS = 500;

/**
 * READ THE LOG — admin only, and that is enforced in Postgres.
 *
 * This runs through the RLS-scoped client, so `activity_logs_select_admin`
 * decides. A non-admin reaching this function gets ZERO ROWS rather than an
 * error, exactly like every other reader in lib/admin/data.ts.
 *
 * The actor's email is resolved in a SECOND query against `profiles` rather than
 * a join, because PostgREST cannot embed `auth.users` and `activity_logs` has no
 * FK to `profiles` to hang an embed on. Two round trips, both admin-gated.
 */
export async function getActivityLogs(
  filters: LogFilters = {},
): Promise<ReadResult<ActivityLog>> {
  try {
    const supabase = createReadClient();

    let query = supabase
      .from("activity_logs")
      .select("id, user_id, action, target, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(filters.limit ?? MAX_ROWS, MAX_ROWS));

    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.action) query = query.eq("action", filters.action);
    if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00Z`);
    // 🔴 END OF DAY, NOT START. `to=2026-08-14` meaning "up to midnight ON the
    // 14th" would silently exclude everything that happened that day — the most
    // likely day anyone filters for.
    if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);

    const { data, error } = await query;
    if (error) return { ok: false, error: error.message };

    const rows = (data ?? []) as ActivityLog[];

    // Resolve actor addresses in one extra query.
    const ids = Array.from(
      new Set(rows.map((r) => r.user_id).filter((v): v is string => Boolean(v))),
    );
    let emails = new Map<string, string | null>();
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);
      emails = new Map((profiles ?? []).map((p) => [p.id as string, p.email as string | null]));
    }

    return {
      ok: true,
      rows: rows.map((r) => ({
        ...r,
        actor_email: r.user_id ? (emails.get(r.user_id) ?? null) : null,
      })),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "read failed" };
  }
}

/** The distinct actors present in the log, for the filter dropdown. */
export async function getLogActors(): Promise<{ id: string; email: string | null }[]> {
  try {
    const supabase = createReadClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email")
      .order("email", { ascending: true });
    return (data ?? []) as { id: string; email: string | null }[];
  } catch {
    return [];
  }
}
