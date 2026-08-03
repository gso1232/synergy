"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * THE /join APPLICATION INTAKE.
 *
 * =============================================================================
 * 🔴 SUCCESS IS RETURNED ONLY AFTER A ROW EXISTS. There is exactly one `ok`
 * return in this file and it sits after the insert's error check. Every other
 * path returns an error. This is the whole point of the change: the form used to
 * be inert precisely so it could not lie, and the client's own live site has
 * three forms that render "Application Received" and post nowhere. If the
 * database is unreachable, the secret key is missing, or the insert is rejected,
 * the user is told it did not send and given the phone number.
 *
 * =============================================================================
 * 🔴 THIS IS AN ANONYMOUS PUBLIC WRITE PATH — the first on this project — so it
 * is the thing standing between the open internet and a table. Four layers:
 *
 *   1. RATE LIMIT, per IP, before any work. 5 submissions / 10 minutes.
 *   2. VALIDATION of every field: presence, length ceilings, email and phone
 *      shape, `state` against the real 51-value list, `heard` against the enum.
 *      Unknown fields are ignored — the row is built field by field from a fixed
 *      shape, never spread from FormData, so an extra key cannot reach a column.
 *   3. THE DATABASE: no INSERT policy exists for anon/authenticated, so the only
 *      writer is this action's service-role client. CHECK constraints cap every
 *      text length and `heard` is an enum, so junk is rejected even if 2 failed.
 *   4. NOTHING IS ECHOED BACK. Errors are generic codes; the Supabase error is
 *      logged server-side and never returned, so this cannot be used to probe
 *      the schema.
 *
 * ⚠️ THE RATE LIMIT IS IN-MEMORY, AND ITS LIMITS ARE STATED RATHER THAN
 * OVERSOLD. A module-level Map lives per server instance, so it resets on deploy
 * and does not coordinate across serverless instances or regions — a determined
 * attacker with many IPs, or one who spreads across instances, is not stopped by
 * it. It is a SPEED BUMP against casual scripted spam, and the durable controls
 * are the validation, the CHECK constraints and the absence of any read access.
 * If real abuse appears, the fix is a captcha (hCaptcha/Turnstile) or an
 * edge/KV-backed limiter — both need a client decision and a key, so neither is
 * assumed here. Recorded in HANDOFF as an open item rather than left implied.
 */

export type ApplyState = {
  status: "idle" | "ok" | "error";
  /** Generic codes only — never a database message. */
  error?: "invalid" | "throttled" | "unavailable" | "failed";
  /** Which fields failed, so the form can mark them. Names only, no values. */
  fields?: string[];
};

/* ---------------------------------------------------------------------------
   RATE LIMIT — 5 per IP per 10 minutes. See the caveat in the header.
--------------------------------------------------------------------------- */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  // Bound the map so a long-running instance cannot grow it without limit.
  if (hits.size > 5000) hits.clear();
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(): string {
  const h = headers();
  // Vercel sets x-forwarded-for; take the FIRST entry (the original client).
  // A spoofed header only lets an attacker rate-limit themselves differently,
  // which is why the limiter is not the security control.
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/* ---------------------------------------------------------------------------
   VALIDATION. Mirrors the CHECK constraints in 0003_applications.sql, so a
   value that passes here cannot be rejected by the database for shape.
--------------------------------------------------------------------------- */
const HEARD = ["search", "social", "referral", "event", "other"] as const;

/** The same 51 values the form's <select> renders. */
const US_STATES = new Set([
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho",
  "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
  "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah",
  "Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
]);

const str = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : "";

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  if (rateLimited(clientIp())) return { status: "error", error: "throttled" };

  const firstName = str(formData.get("firstName"));
  const lastName = str(formData.get("lastName"));
  const email = str(formData.get("email"));
  const phone = str(formData.get("phone"));
  const state = str(formData.get("state"));
  const licensedRaw = str(formData.get("licensed"));
  const heardRaw = str(formData.get("hear"));

  const fields: string[] = [];

  if (firstName.length < 1 || firstName.length > 100) fields.push("firstName");
  if (lastName.length < 1 || lastName.length > 100) fields.push("lastName");
  // Deliberately permissive: one @, a dot in the domain, no spaces, length-capped.
  // Stricter regexes reject valid addresses, and the address is not a credential
  // here — it is a way to call someone back.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    fields.push("email");
  // Digits only after stripping formatting; 7–15 covers international.
  {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) fields.push("phone");
  }
  if (!US_STATES.has(state)) fields.push("state");
  if (licensedRaw !== "yes" && licensedRaw !== "no") fields.push("licensed");
  // `hear` is OPTIONAL — empty is fine, but a non-empty value must be in the enum.
  if (heardRaw && !HEARD.includes(heardRaw as (typeof HEARD)[number]))
    fields.push("hear");

  if (fields.length) return { status: "error", error: "invalid", fields };

  const supabase = createAdminClient();
  // No secret key configured — say so honestly rather than pretending it sent.
  if (!supabase) {
    console.error("[apply] SUPABASE_SECRET_KEY is not set; cannot store application.");
    return { status: "error", error: "unavailable" };
  }

  // 🔴 THE ROW IS BUILT FIELD BY FIELD FROM VALIDATED LOCALS. Never spread from
  // FormData — that is how an attacker-supplied key reaches a column it should
  // not (e.g. an `id` or a future `status`).
  const { error } = await supabase.from("applications").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    state,
    licensed: licensedRaw === "yes",
    heard: heardRaw || null,
    consent: str(formData.get("consent")) === "on",
  });

  if (error) {
    // Logged server-side, never returned — the message can name columns.
    console.error("[apply] insert failed:", error.message);
    return { status: "error", error: "failed" };
  }

  // The ONLY success path in this file, and it is after the row exists.
  return { status: "ok" };
}
