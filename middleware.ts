import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * ONE middleware doing three jobs, in order:
 *
 *   1. next-intl locale routing — unchanged from before auth. It produces the
 *      response (locale rewrite/redirect), and everything below attaches to
 *      THAT response.
 *   2. Supabase session refresh — on every matched request, `getUser()` mints a
 *      fresh access token when the old one is near expiry and writes the updated
 *      auth cookies onto the response. This MUST live in middleware: a server
 *      component can read cookies but cannot reliably set them, so without this
 *      step sessions would silently expire mid-use.
 *   3. Portal gate (LAYER A of two) — FAIL CLOSED. If the path is under /admin
 *      and there is no verified user, redirect to /login before the page runs.
 *
 * 🔴 Composition order matters. Supabase's refreshed cookies are set on the
 * next-intl response object; a naive "two separate middlewares" setup drops
 * those cookies across the locale rewrite and logs everyone out. They are one
 * function here for exactly that reason.
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
 * /signup, /login, /forgot-password and /reset-password are NOT here — they must
 * stay reachable while logged out, which is the whole point of them.
 */
const AUTHED_PATH = /^\/(en|es)\/(admin|welcome|pending)(\/|$)/;

export async function middleware(request: NextRequest) {
  // 1. Locale routing first; its response carries any cookies we refresh.
  const response = intlMiddleware(request);

  // 2. Session refresh, bound to `response` so refreshed cookies survive.
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

  // FAIL CLOSED: if getUser throws (Supabase unreachable, bad config, anything),
  // `user` stays null and a protected path is denied rather than served.
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  // 3. Gate the signed-in area. Logged-out (or errored) -> bounce to /login.
  const { pathname } = request.nextUrl;
  if (AUTHED_PATH.test(pathname) && !user) {
    const locale = pathname.split("/")[1] === "es" ? "es" : "en";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/", "/(en|es)/:path*"],
};
