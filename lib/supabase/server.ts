import { cache } from "react";
import {
  createServerClient,
  createChunks,
  isChunkLike,
  stringToBase64URL,
  stringFromBase64URL,
} from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * =============================================================================
 * 🔴 THE RULE THIS FILE EXISTS TO ENFORCE:
 *
 *        ONLY A CONTEXT THAT CAN WRITE COOKIES MAY ROTATE THE REFRESH TOKEN.
 *
 * Supabase rotates refresh tokens. Exchanging token N consumes it and issues
 * N+1; re-presenting a consumed token more than ten seconds later (GoTrue's
 * SECURITY_REFRESH_TOKEN_REUSE_INTERVAL) is treated as theft and **the entire
 * token family is revoked** — `400 refresh_token_already_used`, "Possible abuse
 * attempt". Every session in that browser dies at once, mid-page.
 *
 * Next.js gives exactly two contexts that can persist a rotated token: the
 * middleware, and server actions / route handlers. A SERVER COMPONENT CANNOT —
 * its response headers are sealed by render time, `cookies().set()` throws, and
 * the `catch` below swallows it. So when a Server Component's client decides the
 * access token has expired and refreshes it, the new token is minted, consumed
 * on the server, and then THROWN AWAY. The browser keeps the old one. The next
 * time the browser presents it, GoTrue revokes the family and the admin is
 * bounced to /login having clicked nothing.
 *
 * MEASURED, in a real browser, before this fix: ONE visit to /en/admin burned
 * FOUR generations of refresh token (middleware minted gen 1 and sent it to the
 * browser; the layout guard and the four dashboard reads minted gens 2, 3 and 4
 * and discarded every one). The browser was left three generations behind, and
 * the next request logged the admin out with `refresh_token_already_used`.
 *
 * 🔴 THERE IS NO auth-js OPTION THAT TURNS THIS OFF. `autoRefreshToken: false`
 * only stops the background timer; `__loadSession()` still calls
 * `_callRefreshToken()` unconditionally whenever it judges the session expired.
 * The only lever is the input: do not let it judge the session expired.
 * `createReadClient()` below is that lever.
 * =============================================================================
 */

/** `sb-<project-ref>-auth-token`, derived the same way supabase-js derives it. */
function storageKey(): string {
  const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
  return `sb-${host.split(".")[0]}-auth-token`;
}

/**
 * Hand auth-js the real session with ONE field changed: `expires_at` is pushed
 * beyond its expiry margin, so `__loadSession()` never concludes "expired" and
 * never calls `_callRefreshToken()`.
 *
 * 🔴 THIS IS A DELIBERATE LIE, AND IT IS THE NARROWEST ONE THAT WORKS. It does
 * not forge a token, weaken a signature check, or extend anyone's access. The
 * access token itself is passed through untouched, and `getUser()` still sends
 * it to GoTrue, which validates the signature and the REAL `exp` and returns 401
 * if it has genuinely expired. All this suppresses is auth-js's local, clock-
 * based guess about whether it ought to refresh — a decision a Server Component
 * is not entitled to make, because it cannot persist the result.
 *
 * What it changes when the token really is stale: instead of silently rotating
 * the family into the ground, the request fails honestly (401 -> `getUser()`
 * returns null -> the guard denies, or a read returns its error state). The
 * middleware refreshes on the NEXT request and the session recovers, rather than
 * being destroyed.
 *
 * Chunking is handled so a session too large for one cookie behaves identically
 * — an earlier draft covered only the single-cookie case and would have quietly
 * stopped protecting exactly the biggest sessions. Re-splitting uses
 * @supabase/ssr's own `createChunks`, and the read side mirrors its
 * `combineChunks` precedence (whole-value cookie first, then `.0`, `.1`, …).
 */
function withSuppressedExpiry(
  all: { name: string; value: string }[],
): { name: string; value: string }[] {
  const key = storageKey();
  const mine = all.filter((c) => isChunkLike(c.name, key));
  const others = all.filter((c) => !isChunkLike(c.name, key));
  if (!mine.length) return all;

  // combineChunks' own order: the whole-value cookie wins, else `.0`, `.1`, …
  const whole = mine.find((c) => c.name === key);
  const combined = whole
    ? whole.value
    : mine
        .filter((c) => /\.\d+$/.test(c.name))
        .sort(
          (a, b) => Number(a.name.split(".").pop()) - Number(b.name.split(".").pop()),
        )
        .map((c) => c.value)
        .join("");

  try {
    const encoded = combined.startsWith("base64-");
    const json = JSON.parse(
      encoded ? stringFromBase64URL(combined.slice("base64-".length)) : combined,
    );
    if (!json?.access_token || !json?.refresh_token) return all;

    json.expires_at = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    json.expires_in = 24 * 60 * 60;

    const body = JSON.stringify(json);
    const value = encoded ? `base64-${stringToBase64URL(body)}` : body;
    return [...others, ...createChunks(key, value)];
  } catch {
    // Unparseable (format changed, corrupt cookie) — hand back the original and
    // let auth-js decide. Fails back to the old behaviour, never to "no session".
    return all;
  }
}

/**
 * READ-PATH client — for SERVER COMPONENTS. It cannot rotate the refresh token.
 *
 * Use this everywhere a page, layout or `server-only` reader needs Supabase:
 * the admin layout's guard, `getAccountState`, and every reader in
 * lib/admin/data.ts. It is a normal RLS-scoped client in every other respect —
 * publishable key, the caller's own JWT, policies decide what comes back.
 *
 * 🔴 IDENTITY IS STILL VERIFIED THE SAME WAY. `getUser()` on this client still
 * posts the access token to GoTrue for a signature check. Nothing about the
 * anti-spoofing guarantee changes; only the local refresh heuristic is muted.
 *
 * `cache()` gives one instance per request, so the layout guard and the four
 * dashboard reads share a single GoTrue client instead of constructing five.
 */
export const createReadClient = cache(() =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => withSuppressedExpiry(cookies().getAll()),
        // A Server Component cannot write cookies. Refusing loudly would be
        // noise; there is nothing to write, because nothing here refreshes.
        setAll: () => {},
      },
    },
  ),
);

/**
 * WRITE-PATH client — for SERVER ACTIONS and ROUTE HANDLERS only.
 *
 * These contexts CAN set cookies, so they are allowed to rotate the refresh
 * token: sign-in mints a session, sign-out clears one, and a genuinely expired
 * token refreshed here is written back to the browser correctly.
 *
 * Authenticates with the PUBLISHABLE key only (sb_publishable_…) — never the
 * secret key — so everything it does is still subject to RLS (see
 * supabase/migrations/0001_auth_profiles.sql). That is the point: even server
 * code cannot read another user's profile unless the caller is an admin, because
 * the policies, not the code, decide.
 *
 * 🔴 ALWAYS verify identity with `supabase.auth.getUser()`, never
 * `getSession()`. `getUser()` sends the access token to the Supabase Auth
 * server, which checks the JWT signature; `getSession()` only decodes whatever
 * cookie the browser sent and trusts it. The signature check is what makes a
 * tampered cookie useless — it is the anti-spoofing guarantee the whole role
 * system rests on.
 *
 * 🔴 DO NOT CALL THIS FROM A SERVER COMPONENT. It is the one that may refresh,
 * and in a render its `cookies().set()` throws, so the rotated token would be
 * lost and the browser stranded on a consumed one. Use `createReadClient()`.
 * The `catch` below stays only because a server action that redirects can reach
 * it after the headers are sent.
 */
export const createClient = cache(() => {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* headers already sent — nothing safe to do here */
          }
        },
      },
    },
  );
});
