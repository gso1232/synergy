import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * =============================================================================
 * THE EMAIL-CONFIRMATION LANDING. This is where the link in the sign-up mail
 * comes back to.
 *
 * Supabase appends a one-time `code` to the redirect. Exchanging it does two
 * things at once:
 *
 *   1. sets `email_confirmed_at` on auth.users — which fires 0005's
 *      `on_auth_user_confirmed` trigger and flips the profile
 *      `unverified -> pending`, i.e. THIS is the moment the account becomes
 *      something an admin is asked to judge; and
 *   2. mints a session.
 *
 * 🔴 THE SESSION IT MINTS REACHES NOTHING, AND THAT IS THE DESIGN. The account
 * is `pending` at this instant, and every RLS policy in 0005 requires `active`.
 * So the user lands on /pending holding a valid JWT that returns zero rows from
 * every table. The session exists only so /pending can greet them by name and
 * offer a sign-out — not because confirming an email grants anything.
 *
 * =============================================================================
 * 🔴 IT IS A ROUTE HANDLER, NOT A PAGE, BECAUSE THE COOKIES MUST BE WRITTEN.
 * A Server Component cannot set cookies (headers are sealed by render time —
 * see lib/supabase/server.ts, which swallows that throw). The code exchange
 * MUST persist auth cookies, so it needs a real response object to write onto.
 * That is why this uses `createServerClient` directly against the outgoing
 * NextResponse rather than the shared `createClient()`.
 *
 * FAIL CLOSED: a missing, malformed, replayed or expired code redirects to
 * /login with a generic notice. It never renders anything, never echoes the
 * Supabase error, and never leaves a half-session behind.
 * =============================================================================
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } },
) {
  const locale = params.locale === "es" ? "es" : "en";
  const code = request.nextUrl.searchParams.get("code");

  /* 🔴 ONE EXCHANGE POINT FOR BOTH EMAIL FLOWS, and it is deliberate.
     Sign-up confirmation and password recovery both come back with a `code`
     that has to be swapped for cookies, and only a route handler can write
     them. Giving recovery its own landing route would mean a second copy of
     this exchange — two places to get the cookie plumbing wrong, and two URLs
     to keep in the Supabase Redirect URLs allowlist. `next` picks the
     destination AFTER the exchange; it is compared against a fixed literal, not
     used as a URL, so it cannot be turned into an open redirect. */
  const next = request.nextUrl.searchParams.get("next");
  const destination = next === "reset" ? `/${locale}/reset-password` : `/${locale}/pending`;

  const failed = NextResponse.redirect(
    new URL(`/${locale}/login?confirm=failed`, request.url),
  );

  if (!code) return failed;

  // Redirect responses carry Set-Cookie headers, so the session written here
  // survives the hop to the destination.
  const response = NextResponse.redirect(new URL(destination, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.log("[auth] confirm exchange failed", {
      code: (error as unknown as { code?: string }).code ?? error.name,
      status: error.status,
    });
    return failed;
  }

  return response;
}
