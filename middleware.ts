import createIntlMiddleware from "next-intl/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * ONE middleware doing three jobs:
 *
 *   1. Supabase session refresh — `getUser()` mints a fresh access token when
 *      the old one has expired and writes the rotated auth cookies onto BOTH
 *      the incoming request and the outgoing response (see the red block
 *      below — writing only one of the two is the bug this file exists to
 *      prevent). This MUST live in middleware: a server component can read
 *      cookies but cannot set them, so without this step sessions would
 *      silently expire mid-use.
 *   2. next-intl locale routing. It produces the response (locale
 *      rewrite/redirect), and the refreshed cookies are attached to it.
 *   3. Portal gate (LAYER A of two) — FAIL CLOSED. If the path is under /admin
 *      and there is no verified user, redirect to /login before the page runs.
 *
 * =============================================================================
 * 🔴 THIS IS THE ONLY PLACE IN A PAGE REQUEST ALLOWED TO ROTATE THE REFRESH
 * TOKEN. The rule, and the mid-session-logout bug behind it, are documented in
 * full at the top of lib/supabase/server.ts — read that first. In one line:
 * Supabase rotates refresh tokens, only a context that can WRITE cookies may
 * spend one, and a Server Component cannot write cookies.
 *
 * Two supporting details live here:
 *
 * 1. THE REFRESH RUNS BEFORE next-intl. The rotated cookie is written onto the
 *    REQUEST as well as the response, and next-intl's rewrite snapshots
 *    `new Headers(request.headers)` at the moment it runs — so the refresh has
 *    to happen first for that snapshot to carry it. Next.js also propagates
 *    `response.cookies` down to `cookies()` on its own, so this is belt AND
 *    braces rather than the load-bearing part; it removes the dependency on
 *    that implicit behaviour.
 *
 * 2. THE REDIRECT CARRIES THE COOKIES TOO. When a session has genuinely ended,
 *    the entries Supabase hands back are cookie CLEARS. The old code returned a
 *    bare `NextResponse.redirect(...)` and dropped them, so the browser kept
 *    replaying a dead token on every subsequent request.
 * =============================================================================
 *
 * 🔴 This is the EARLY gate, not the only one. It checks logged-in / logged-out
 * cheaply. It does NOT decide admin-vs-agent — that authoritative check is
 * LAYER B, the server component at (portal)/admin/layout.tsx, which re-verifies
 * the user and reads the role from the database on every request. Two layers on
 * an auth boundary is not redundant: if this matcher is ever misconfigured, the
 * layout still denies.
 */
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "es"],
  defaultLocale: "en",
});

/**
 * Paths that require A SESSION — any session. This is LAYER A: the cheap
 * logged-in/logged-out gate.
 *
 * 🔴 IT DELIBERATELY DOES NOT CHECK ROLE OR ACCOUNT STATUS. Doing so would cost
 * a database round trip on every request to every matched path, and it would
 * duplicate a decision the page-level guards already make authoritatively:
 *   · /admin        -> (portal)/admin/layout.tsx re-verifies role AND status
 *   · /welcome      -> its own guard, redirects a non-active user to /pending
 *   · /pending      -> its own guard, redirects an active user onward
 * and RLS is underneath all three regardless.
 *
 * /login, /forgot-password and /reset-password are NOT here — they must stay
 * reachable while logged out, which is the whole point of them. There is no
 * /signup: public registration was removed, and accounts are created only by an
 * admin from the admin panel.
 */
const AUTHED_PATH = /^\/(en|es)\/(admin|welcome|pending)(\/|$)/;

export async function middleware(request: NextRequest) {
  /* Whatever Supabase rotates during the refresh below, held until there is a
     response object to write it onto. It is applied to EVERY response this
     function can return — including the redirect — because when a session has
     genuinely ended these entries are the cookie CLEARS, and dropping them
     leaves the browser replaying a dead token on every subsequent request. */
  const refreshed: { name: string; value: string; options: CookieOptions }[] = [];

  // 1. Session refresh. FIRST, so the rotated cookie is on the request before
  //    next-intl snapshots the headers and before any page code reads them.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            /* Onto the REQUEST — this mutates `request.headers`' cookie header
               in place, which is what stops the five server clients downstream
               re-refreshing an already-consumed token. */
            request.cookies.set(name, value);
            refreshed.push({ name, value, options });
          }
        },
      },
    },
  );

  // FAIL CLOSED: if getUser throws (Supabase unreachable, bad config, anything),
  // `user` stays null and a protected path is denied rather than served.
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  // 2. Locale routing. Runs AFTER the refresh so its internal
  //    `NextResponse.rewrite(url, { request: { headers } })` snapshot carries
  //    the rotated cookie through to the server components.
  const response = intlMiddleware(request);

  // 3. Gate the signed-in area. Logged-out (or errored) -> bounce to /login.
  const { pathname } = request.nextUrl;
  if (AUTHED_PATH.test(pathname) && !user) {
    const locale = pathname.split("/")[1] === "es" ? "es" : "en";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    const redirect = NextResponse.redirect(url);
    for (const { name, value, options } of refreshed) {
      redirect.cookies.set(name, value, options);
    }
    return redirect;
  }

  // 4. Hand the rotated cookies to the browser.
  for (const { name, value, options } of refreshed) {
    response.cookies.set(name, value, options);
  }

  return response;
}

export const config = {
  matcher: ["/", "/(en|es)/:path*"],
};
