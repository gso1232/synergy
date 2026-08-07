import { headers } from "next/headers";

/**
 * PER-IP RATE LIMITING FOR THE UNAUTHENTICATED AUTH ENDPOINTS (signup, password
 * reset request).
 *
 * =============================================================================
 * ⚠️ THIS IS A SPEED BUMP, AND IT IS STATED AS ONE RATHER THAN OVERSOLD.
 *
 * The map lives in module memory, so it is PER SERVER INSTANCE: it resets on
 * every deploy and does not coordinate across serverless instances or regions.
 * An attacker with many IPs, or one whose requests land on different instances,
 * is not stopped by it. It is the same limiter `/join` uses, with the same
 * honest caveat recorded in HANDOFF.
 *
 * 🔴 THE DURABLE LIMIT IS SUPABASE'S OWN. Supabase Auth rate-limits signup,
 * sign-in, and email sending upstream of this code, shared across every
 * instance, and returns HTTP 429 when a limit is hit — the actions surface that
 * as `throttled`. That is the control that actually holds; this one exists to
 * stop casual scripted abuse from burning through the Supabase quota (and the
 * project's email allowance) before Supabase's limiter sees it.
 *
 * If real abuse appears, the fix is a captcha (Turnstile/hCaptcha — Supabase has
 * first-class support, it is a dashboard toggle plus a site key) or a KV-backed
 * limiter. Both need a client decision and a key, so neither is assumed here.
 * =============================================================================
 */

const WINDOW_MS = 15 * 60 * 1000;

/** Per-bucket ceilings. Reset requests are tighter — each one sends an email. */
const LIMITS: Record<string, number> = {
  signup: 5,
  reset: 3,
};

const hits = new Map<string, number[]>();

/**
 * Returns true when the caller has exceeded the bucket's ceiling.
 *
 * The key is `bucket:ip`, so burning the signup allowance does not also lock the
 * caller out of a password reset — they are different actions with different
 * costs and should not share a counter.
 */
export function authRateLimited(bucket: keyof typeof LIMITS | string): boolean {
  const max = LIMITS[bucket] ?? 5;
  const key = `${bucket}:${clientIp()}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  // Bound the map so a long-running instance cannot grow it without limit. A
  // blunt clear is fine: the worst case is that a handful of callers get their
  // allowance back early, which this limiter already concedes can happen.
  if (hits.size > 5000) hits.clear();

  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

function clientIp(): string {
  const h = headers();
  // Vercel sets x-forwarded-for; take the FIRST entry (the original client).
  // A spoofed header only lets an attacker rate-limit themselves differently,
  // which is precisely why the limiter is not the security control.
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
