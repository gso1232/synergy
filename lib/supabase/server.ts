import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for SERVER components, server actions and route handlers.
 *
 * Reads the session from the request cookies. It authenticates with the
 * PUBLISHABLE key only (sb_publishable_…) — never the secret key — so everything
 * it does is still subject to RLS (see supabase/migrations/0001_auth_profiles.sql).
 * That is the
 * point: even server code cannot read another user's profile unless the caller
 * is an admin, because the policies, not the code, decide.
 *
 * 🔴 ALWAYS verify identity with `supabase.auth.getUser()`, never
 * `getSession()`. `getUser()` sends the access token to the Supabase Auth
 * server, which checks the JWT signature; `getSession()` only decodes whatever
 * cookie the browser sent and trusts it. The signature check is what makes a
 * tampered cookie useless — it is the anti-spoofing guarantee the whole role
 * system rests on.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // A Server Component cannot set cookies (the response headers are
          // already sealed by the time it renders), and Next throws if you try.
          // That is fine: the middleware (lib/supabase/middleware.ts) is what
          // actually writes refreshed cookies on every request, so swallowing
          // the throw here loses nothing.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* called from a Server Component — middleware handles the refresh */
          }
        },
      },
    },
  );
}
