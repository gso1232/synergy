import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for BROWSER (client component) code.
 *
 * Uses the PUBLISHABLE key (sb_publishable_…), which is public by design — it
 * ships to every browser and can do nothing RLS does not allow. Data is
 * protected by the policies in supabase/migrations/0001_auth_profiles.sql, not
 * by keeping this key secret.
 *
 * Not needed by the sign-in flow (that runs through a server action so the
 * session cookies are set server-side), but kept for the client-side pieces a
 * later CRUD phase will want. It must NEVER see the secret key (sb_secret_…).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
