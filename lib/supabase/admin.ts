import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * THE SERVICE-ROLE CLIENT. **SERVER ONLY. NEVER IMPORT THIS FROM A CLIENT
 * COMPONENT.**
 *
 * =============================================================================
 * 🔴 THIS CLIENT BYPASSES ROW LEVEL SECURITY. Everything else on this project
 * talks to Supabase with the PUBLISHABLE key, so the policies decide what is
 * allowed and even server code cannot overreach. This one does not: it holds the
 * secret key and can read and write anything. It exists for exactly ONE reason —
 * a table that must be written by anonymous visitors but readable by nobody
 * except an admin cannot be written through RLS, because granting anon INSERT
 * would grant it to everyone with the publishable key and a fetch call.
 *
 * The trade is deliberate and narrow:
 *
 *   public.applications   NO insert policy exists      -> browsers cannot write
 *                         this client inserts           -> the only write path
 *
 * So the write path is a server action that validates first (see
 * app/[locale]/(site)/join/actions.ts). The database is not the thing keeping
 * junk out — the action is; the database keeps READERS out.
 *
 * =============================================================================
 * 🔴 THREE THINGS KEEP THE KEY OUT OF THE BROWSER, AND ALL THREE MATTER.
 *
 * 1. The env var has NO `NEXT_PUBLIC_` prefix, so Next never inlines it into a
 *    client bundle. This is the actual mechanism.
 * 2. The runtime guard below throws if this module is ever evaluated in a
 *    browser — a loud failure in development beats a silent leak in production.
 * 3. `scripts/check-no-service-role.mjs` runs on `postbuild` and FAILS THE BUILD
 *    if `sb_secret_`, `service_role`, or either secret env var NAME appears
 *    anywhere under `.next/static`. That gate is why this file must only ever be
 *    imported from server actions, route handlers or server components.
 *
 * If you find yourself wanting this in a component, the answer is a server
 * action instead.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "lib/supabase/admin.ts was imported in the browser. It holds the service-role key and must only be used from server code.",
  );
}

/**
 * Built per call rather than as a module singleton: the key is read at call
 * time, so a missing secret fails at the point of use with a clear message
 * instead of crashing module evaluation for every route that transitively
 * imports it.
 *
 * `persistSession: false` / `autoRefreshToken: false` — this client is never a
 * user session. It is a one-shot privileged connection for a single write, and
 * leaving session handling on would have it try to store tokens it does not have.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supports both the new secret key and the legacy service-role name, matching
  // what scripts/check-no-service-role.mjs already scans for.
  const secret =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) return null;

  return createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
