"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { deliverToGhl, ghlConfigured, splitName, type GhlPayload } from "@/lib/ghl";

/**
 * /contact intake. The twin of (site)/join/actions.ts — same shape, same rules,
 * same refusal to report success before the data is somewhere durable.
 *
 * =============================================================================
 * 🔴 ORDER OF OPERATIONS, AND WHY IT IS THIS WAY ROUND.
 *
 *   1. rate limit    2. validate    3. INSERT INTO public.leads
 *   4. POST to GoHighLevel    5. record the delivery result on the row
 *
 * THE ROW IS COMMITTED BEFORE THE CRM IS CALLED, DELIBERATELY. GoHighLevel is a
 * third party over the public internet: it can be slow, down, rate-limiting, or
 * mid-deploy. If delivery came first, every one of those states would cost a
 * real lead — the visitor sees an error, gives up, and nothing was ever
 * recorded. With the insert first, the worst case is a lead sitting safely in
 * Postgres and visible in the admin panel carrying `ghl_status = 'failed'`.
 *
 * SO STEP 4 CANNOT FAIL THE SUBMISSION. `deliverToGhl` never throws, and its
 * result only ever changes what is WRITTEN TO THE ROW — never what is returned
 * to the browser. The visitor is told it sent because it was captured, which is
 * true regardless of what the CRM did with it afterwards.
 * =============================================================================
 *
 * 🔴 THE FORM IS ONLY LIVE WHEN THERE IS A WEBHOOK. `contactIntakeReady()`
 * gates both the UI (the fieldset's `disabled`) and this action, and it is
 * false until GHL_CONTACT_WEBHOOK_URL (or GHL_WEBHOOK_URL) exists in the
 * environment. That is the brief: nothing visibly changes on the site until the
 * URL is supplied, and the moment it is, the form turns on by itself.
 *
 * WANT THE FORM LIVE BEFORE THE CRM EXISTS — storing to Postgres only? The
 * change is ONE LINE: make `contactIntakeReady()` return
 * `createAdminClient() !== null`. Everything else already works. It is not the
 * default because it is not what was asked for.
 */

export type ContactState = {
  status: "idle" | "ok" | "error";
  /** Generic codes only — never a database message, never a webhook URL. */
  error?: "invalid" | "throttled" | "unavailable" | "failed";
  /** Which fields failed, so the form can mark them. Names only, no values. */
  fields?: string[];
};

/**
 * Is the contact intake open for business?
 *
 * BOTH halves are required and each covers a different failure: without the
 * webhook there is no CRM to feed, which is the thing this form exists for;
 * without the secret key there is no durable store, so a CRM hiccup would lose
 * the lead outright. Either one missing means the form stays honestly disabled.
 */
export async function contactIntakeReady(): Promise<boolean> {
  return ghlConfigured("contact") && createAdminClient() !== null;
}

/* ---------------------------------------------------------------------------
   RATE LIMIT — 5 per IP per 10 minutes, matching join/actions.ts.

   SAME CAVEAT AS THERE: this Map is per serverless instance, so it throttles a
   burst from one warm instance and not a distributed flood. It is a courtesy
   brake, NOT a security control. The real fix is a captcha or an edge/KV-backed
   limiter, both of which need a key and a client decision.
--------------------------------------------------------------------------- */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
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
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** The eight product keys the select renders. */
const PRODUCTS = new Set(["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"]);

const str = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : "";

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (!(await contactIntakeReady())) return { status: "error", error: "unavailable" };
  if (rateLimited(clientIp())) return { status: "error", error: "throttled" };

  const name = str(formData.get("name"));
  const email = str(formData.get("email"));
  const phone = str(formData.get("phone"));
  const product = str(formData.get("product"));
  const message = str(formData.get("message"));
  const locale = str(formData.get("locale")) === "es" ? "es" : "en";
  const smsConsent = str(formData.get("sms")) === "on";
  const emailOptin = str(formData.get("marketing")) === "on";

  const fields: string[] = [];

  /* 🔴 ONLY EMAIL IS REQUIRED, and that matches what the form promises the
     visitor in `contact.form.optionalNote`: "Only your email address is
     required. All other fields are optional." Validating anything else as
     mandatory here would reject a submission the UI said was fine. */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    fields.push("email");

  if (name.length > 200) fields.push("name");
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) fields.push("phone");
  }
  if (product && !PRODUCTS.has(product)) fields.push("product");
  if (message.length > 2000) fields.push("message");

  if (fields.length) return { status: "error", error: "invalid", fields };

  const supabase = createAdminClient();
  if (!supabase) {
    console.error("[contact] SUPABASE_SECRET_KEY is not set; cannot store lead.");
    return { status: "error", error: "unavailable" };
  }

  /* 🔴 BUILT FIELD BY FIELD FROM VALIDATED LOCALS, never spread from FormData —
     that is how an attacker-supplied key reaches a column it should not (an
     `id`, or `status`, which would let anyone file a lead as already closed).

     `name` falls back to an EMPTY STRING rather than a placeholder: the column
     is NOT NULL, the visitor genuinely did not give a name, and inventing
     "Unknown" would put a fake first name on a real CRM contact record. */
  const { data: inserted, error } = await supabase
    .from("leads")
    .insert({
      name,
      email,
      phone: phone || null,
      source: "contact",
      interest: product || null,
      message: message || null,
      locale,
      sms_consent: smsConsent,
      email_optin: emailOptin,
      ghl_status: "pending",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[contact] insert failed:", error?.message);
    return { status: "error", error: "failed" };
  }

  /* ---- CRM delivery. Best-effort, past the point of no return. ---- */
  const { first, last } = splitName(name);
  const result = await deliverToGhl("contact", {
    source: "contact",
    first_name: first,
    last_name: last,
    full_name: name,
    email,
    phone,
    interest: product || undefined,
    message: message || undefined,
    sms_consent: smsConsent,
    email_optin: emailOptin,
    locale,
    submitted_at: new Date().toISOString(),
  } satisfies GhlPayload);

  /* The delivery record is a SEPARATE UPDATE that is allowed to fail quietly.
     The lead is already safe; losing the status flag is a reporting nuisance,
     not a lost customer, and surfacing it to the visitor would invert that. */
  await supabase
    .from("leads")
    .update(
      result.ok
        ? { ghl_status: "delivered", ghl_delivered_at: new Date().toISOString() }
        : {
            ghl_status: result.reason === "unconfigured" ? "unconfigured" : "failed",
            ghl_detail:
              result.reason === "http" ? `http ${result.status}` : result.reason,
          },
    )
    .eq("id", inserted.id);

  if (!result.ok) {
    // Loud in the server log so an outage is diagnosable, but the reason code
    // only — deliverToGhl deliberately never hands back the URL.
    console.error(
      `[contact] lead ${inserted.id} stored but NOT delivered to GHL:`,
      result.reason,
    );
  }

  // The ONLY success path, and it is after the row exists.
  return { status: "ok" };
}
