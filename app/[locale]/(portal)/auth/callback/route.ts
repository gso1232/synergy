import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * =============================================================================
 * THE EMAIL / SETUP-LINK LANDING. Both auth email flows come back here.
 *
 * 🔴 IT NOW HANDLES TWO LINK SHAPES, AND HANDLING ONLY ONE WAS A BUG THAT BURNED
 * EVERY ADMIN-ISSUED SETUP LINK ON FIRST USE.
 *
 * The symptom: an admin copies the setup link out of the admin panel, opens it
 * once, and gets "That confirmation link is invalid or has already been used."
 * Every time. No agent could be onboarded.
 *
 * WHAT THE AUTH LOGS ACTUALLY SHOWED. The token was presented to GoTrue's
 * `/verify` EXACTLY ONCE and was ACCEPTED — a 303 with a recorded login event
 * for the agent. Nothing pre-fetched it and nothing exchanged it twice; the
 * later "One-time token not found" entries were the admin retrying a link that
 * the first click had legitimately spent. So the token was never the problem.
 *
 * THE PROBLEM WAS WHERE GoTrue PUTS THE RESULT. `admin.generateLink()` mints an
 * IMPLICIT-flow link — there is no PKCE flow state, because no browser started
 * the flow. Following it returns:
 *
 *     303 -> /en/auth/callback?next=reset
 *              #access_token=…&refresh_token=…&type=recovery
 *
 * Everything that matters is in the URL FRAGMENT, and a fragment is never sent
 * to a server. This route read `?code=`, found nothing, and returned the
 * generic failure — after the token had already been spent. Measured directly:
 * the query carried only `next`; `code` was absent.
 *
 * THE FIX IS TO STOP USING GoTrue's REDIRECT FOR THAT FLOW. `buildSetupLink()`
 * in admin/actions.ts now points the link straight at this route carrying
 * `token_hash`, and the exchange happens HERE, server-side, where the resulting
 * cookies can actually be written. See that function for the other half.
 *
 * =============================================================================
 * THE TWO SHAPES, AND WHERE THE ONE-TIME TOKEN IS CONSUMED IN EACH:
 *
 *   ?token_hash=…&type=recovery   Admin-issued setup link. CONSUMED HERE, by
 *                                 `verifyOtp`. One call, one consumption.
 *   ?code=…                       PKCE. Used by `resetPasswordForEmail`, which
 *                                 a user starts in their own browser, so a
 *                                 code_verifier cookie exists. GoTrue consumed
 *                                 the one-time token on ITS /verify hop and
 *                                 handed us a flow code; `exchangeCodeForSession`
 *                                 spends that code, which is a different
 *                                 artefact.
 *
 * 🔴 CAN ANYTHING RUN TWICE? Only by re-requesting this URL — a reload, a Back,
 * or anything that re-fetches the link. That is inherent to a one-time token and
 * cannot be designed away; what CAN be fixed is the reporting, so the second
 * attempt says "already used" instead of the same generic "invalid" that hid
 * this bug for as long as it did. Both branches below are single-call: there is
 * no retry, no second exchange, and no path that verifies and then re-verifies.
 *
 * 🟡 A LINK PREVIEWER WOULD STILL BURN A LINK. Anything that fetches the URL —
 * a chat client generating a preview card, a mail scanner — spends the token,
 * exactly as it would have spent the old supabase.co link. The logs show this is
 * NOT what happened here, so nothing is built against it today; if it ever
 * shows up, the fix is an interstitial that POSTs rather than a GET that acts.
 *
 * =============================================================================
 * 🔴 STILL A ROUTE HANDLER, BECAUSE THE COOKIES MUST BE WRITTEN. A Server
 * Component cannot set cookies (see lib/supabase/server.ts, which now splits the
 * client precisely along that line). Both exchanges below must persist a
 * session, so both need a real response object to write onto — which is why
 * this uses `createServerClient` bound to `response` rather than the shared
 * `createClient()`.
 *
 * FAIL CLOSED: a missing, malformed, replayed or expired token redirects to
 * /login with a notice. It never renders anything, never echoes the Supabase
 * error, and never leaves a half-session behind.
 */

/** The only OTP types this app issues. A `type` off the query string is
 *  attacker-controlled, so it is matched against this list rather than passed
 *  through — an unexpected value is a malformed link, not a new flow. */
const ALLOWED_OTP_TYPES = ["recovery"] as const;

function isAllowedOtpType(v: string | null): v is (typeof ALLOWED_OTP_TYPES)[number] {
  return !!v && (ALLOWED_OTP_TYPES as readonly string[]).includes(v);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } },
) {
  const locale = params.locale === "es" ? "es" : "en";
  const q = request.nextUrl.searchParams;

  const code = q.get("code");
  const tokenHash = q.get("token_hash");
  const type = q.get("type");

  /* `next` picks the destination AFTER the exchange. Compared against a fixed
     literal, never used as a URL, so it cannot become an open redirect. */
  const next = q.get("next");
  const destination = next === "reset" ? `/${locale}/reset-password` : `/${locale}/pending`;

  const bounce = (notice: string) =>
    NextResponse.redirect(new URL(`/${locale}/login?${notice}`, request.url));

  /* 🔴 GoTrue's OWN error, surfaced before we try anything. When a link is
     expired or already spent it redirects here with `error_code` set. Reporting
     that distinctly is what stops a spent link and a broken link looking
     identical — which is exactly how the fragment bug stayed invisible. */
  const errorCode = q.get("error_code") ?? q.get("error");
  if (errorCode) {
    console.log("[auth] callback received provider error", { code: errorCode });
    return bounce(/expired|used|not_found/i.test(errorCode) ? "confirm=expired" : "confirm=failed");
  }

  if (!code && !tokenHash) {
    /* 🔴 THE OLD FAILURE MODE, NOW NAMED. Reaching here with neither parameter
       means the link put its payload in the fragment — an implicit-flow link
       that should have been issued as `token_hash`. Logged loudly because it is
       a wiring mistake, not a user error, and the generic notice below would
       otherwise send someone hunting for an expired token that never expired. */
    const seen: string[] = [];
    q.forEach((_v, k) => seen.push(k));
    console.log("[auth] callback got no code and no token_hash", { params: seen });
    return bounce("confirm=failed");
  }

  // Redirect responses carry Set-Cookie, so the session written here survives
  // the hop to the destination.
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

  // ---------------------------------------------------------------- token_hash
  if (tokenHash) {
    if (!isAllowedOtpType(type)) {
      console.log("[auth] callback token_hash with unexpected type", { type });
      return bounce("confirm=failed");
    }

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (error) {
      console.log("[auth] setup-link verify failed", {
        code: (error as unknown as { code?: string }).code ?? error.name,
        status: error.status,
      });
      /* 403 / "not found" is a spent or expired one-time token — the common,
         explainable case. Anything else is a genuine fault. */
      return bounce(
        error.status === 403 || /expired|not found|invalid/i.test(error.message)
          ? "confirm=expired"
          : "confirm=failed",
      );
    }

    return response;
  }

  // ---------------------------------------------------------------------- PKCE
  const { error } = await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    console.log("[auth] confirm exchange failed", {
      code: (error as unknown as { code?: string }).code ?? error.name,
      status: error.status,
    });
    return bounce("confirm=failed");
  }

  return response;
}
