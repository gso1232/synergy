import { headers } from "next/headers";

/**
 * The absolute origin to build auth email links from.
 *
 * 🔴 SUPABASE EMAIL LINKS MUST BE ABSOLUTE, and they must match an entry in the
 * project's Auth -> URL Configuration -> Redirect URLs allowlist. A relative
 * path silently produces a link pointing at Supabase's own domain, which lands
 * the user nowhere useful.
 *
 * NEXT_PUBLIC_SITE_URL wins when set — in production it is the only trustworthy
 * source, because `Host` is attacker-controllable and a poisoned host header
 * would mint password links pointing at someone else's domain. The header
 * fallback exists for local dev, where the var is often unset.
 *
 * Extracted from (portal)/forgot-password/actions.ts so the admin invite flow
 * builds the identical origin. (It previously carried a "see the identical note
 * in signup/actions.ts" pointer; that file was deleted when public signup was
 * removed, so the note lives here now.)
 */
export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
