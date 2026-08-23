/**
 * GoHighLevel delivery — the one place a lead leaves this site for the CRM.
 *
 * =============================================================================
 * 🔴 THIS FILE IS THE "DAY THE WEBHOOK ARRIVES" SWITCH. Nothing else has to
 * change when Ziad supplies the URLs.
 *
 * Every form on this site was built complete and then deliberately disabled,
 * because "a form that cannot send must not pretend to" — the note at the top
 * of components/ContactForm.tsx spells out the fake-success bug that rule
 * exists to prevent. The missing piece was always the same one: somewhere for
 * the data to go. This is that somewhere.
 *
 * SET THE ENV VAR, AND THE FORM TURNS ITSELF ON. `contactIntakeReady()` is read
 * by the contact page at render time, so the fieldset stops being `disabled`
 * and the server action starts accepting posts the moment a URL exists in the
 * environment. No deploy-time flag, no code edit, no second pass.
 *
 * =============================================================================
 * ENVIRONMENT VARIABLES — all optional, all server-only, NONE prefixed
 * NEXT_PUBLIC_. A webhook URL is a write endpoint into the CRM: anyone holding
 * it can inject contacts and fire automations. Prefixing any of these would
 * compile it into the browser bundle and publish it.
 *
 *   GHL_CONTACT_WEBHOOK_URL   /contact submissions
 *   GHL_APPLY_WEBHOOK_URL     /join agent applications
 *   GHL_WEBHOOK_URL           fallback used for either of the above when the
 *                             specific one is unset — fine if GoHighLevel is
 *                             set up with one inbound workflow that branches on
 *                             the `source` field in the payload.
 *
 * GoHighLevel's inbound webhook trigger accepts arbitrary JSON and exposes each
 * top-level key to the workflow builder, so the payload below is FLAT on
 * purpose. A nested object would arrive as one opaque blob that cannot be
 * mapped to a contact field without a custom-code step.
 * =============================================================================
 */

/** Which form a lead came from. Also shipped in the payload as `source`. */
export type GhlSource = "contact" | "apply";

/**
 * The delivered payload. Flat, snake_case, and stable — the workflow mapping
 * Ziad builds in GoHighLevel is keyed on these names, so RENAMING A KEY HERE
 * SILENTLY BREAKS HIS AUTOMATION. Add new keys freely; do not rename old ones.
 */
export type GhlPayload = {
  source: GhlSource;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  /** Contact: the product key (p1..p8). Apply: the applicant's state. */
  interest?: string;
  message?: string;
  sms_consent?: boolean;
  email_optin?: boolean;
  consent?: boolean;
  licensed?: boolean;
  heard?: string;
  /** "en" | "es" — so the CRM can route to a bilingual agent. */
  locale?: string;
  /** ISO 8601, set server-side. Never trust a client clock. */
  submitted_at: string;
};

function readUrl(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // 🔴 VALIDATED, NOT JUST PRESENT. A typo'd or half-pasted value would
  // otherwise turn every submission into a runtime throw inside the action.
  // An unparseable URL is treated as "not configured", which keeps the form
  // honestly disabled rather than live and broken.
  try {
    const u = new URL(trimmed);
    /* 🔴 https ONLY IN PRODUCTION. Lead PII must not cross plain http, so an
       http:// URL is treated as "not configured" — which keeps the form
       honestly disabled rather than live and leaking.

       THE ONE EXCEPTION IS A LOCAL MOCK, and it is deliberately narrow: http is
       accepted only for loopback, and only when NODE_ENV is not production.
       Without it there is no way to exercise the delivery path end to end
       before Ziad's real URL exists — the alternative is shipping this
       untested, which is worse than the exception. Neither half alone opens
       anything: a production build rejects loopback too, and a dev build still
       rejects any non-loopback http host. */
    const loopback =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "[::1]";
    const httpAllowed =
      u.protocol === "https:" ||
      (u.protocol === "http:" && loopback && process.env.NODE_ENV !== "production");
    if (!httpAllowed) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** The endpoint for a source, or null when none is configured. */
export function ghlWebhookUrl(source: GhlSource): string | null {
  const specific =
    source === "contact"
      ? readUrl("GHL_CONTACT_WEBHOOK_URL")
      : readUrl("GHL_APPLY_WEBHOOK_URL");
  return specific ?? readUrl("GHL_WEBHOOK_URL");
}

/** True when this source has somewhere to deliver to. */
export function ghlConfigured(source: GhlSource): boolean {
  return ghlWebhookUrl(source) !== null;
}

export type GhlResult =
  | { ok: true; status: number }
  | { ok: false; reason: "unconfigured" | "timeout" | "network" | "http"; status?: number };

/* 🔴 THESE NUMBERS ARE BOUNDED BY VERCEL'S FUNCTION TIMEOUT, NOT BY TASTE.
   A naive "3 attempts x 8s each" is a 25-second worst case, which on Vercel's
   default Serverless limit does not fail politely — the whole invocation is
   killed and the visitor gets a 504 for a lead that WAS ALREADY COMMITTED to
   Postgres a moment earlier. They would then almost certainly submit again,
   duplicating a lead that was never lost.

   So the retry loop runs against a TOTAL BUDGET rather than a per-attempt
   timeout: whatever happens, `deliverToGhl` returns inside ~9s and the action
   finishes well within the limit. A CRM that is slower than that is treated as
   down, the row is flagged, and someone picks it up — which is the whole point
   of storing before delivering. */
const TOTAL_BUDGET_MS = 9000;
const PER_ATTEMPT_MS = 4000;
const ATTEMPTS = 3;

/**
 * POST one lead to GoHighLevel.
 *
 * 🔴 IT NEVER THROWS AND IT NEVER RETURNS THE URL. Callers treat delivery as
 * best-effort: the lead is already in Postgres before this runs, so a CRM
 * outage must not turn a captured lead into an error page for the visitor.
 * The URL is kept out of the return value and out of every log line because it
 * is a write credential in disguise.
 *
 * RETRIES ON 5xx AND NETWORK ONLY — never on 4xx. A 400 from GoHighLevel means
 * the payload is wrong and will be wrong every time; retrying it three times
 * just triples the noise. Backoff is 300ms then 900ms.
 */
export async function deliverToGhl(
  source: GhlSource,
  payload: GhlPayload,
): Promise<GhlResult> {
  const url = ghlWebhookUrl(source);
  if (!url) return { ok: false, reason: "unconfigured" };

  let last: GhlResult = { ok: false, reason: "network" };
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    // Out of budget: stop rather than start an attempt that cannot finish.
    const remaining = deadline - Date.now();
    if (remaining <= 0) return last.reason === "network" ? { ok: false, reason: "timeout" } : last;
    // AbortController rather than AbortSignal.timeout(): the controller is also
    // what clears the timer on the success path, so a fast response does not
    // leave an 8s handle pinned open on a serverless invocation.
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.min(PER_ATTEMPT_MS, remaining),
    );
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        // Never cached, never revalidated — this is a write.
        cache: "no-store",
      });
      clearTimeout(timer);

      if (res.ok) return { ok: true, status: res.status };

      last = { ok: false, reason: "http", status: res.status };
      // 4xx is a permanent failure. Stop.
      if (res.status < 500) return last;
    } catch (e) {
      clearTimeout(timer);
      const aborted = e instanceof Error && e.name === "AbortError";
      last = { ok: false, reason: aborted ? "timeout" : "network" };
    }

    if (attempt < ATTEMPTS) {
      const backoff = attempt === 1 ? 300 : 900;
      // Do not sleep past the deadline just to discover there is no time left.
      if (deadline - Date.now() <= backoff) break;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  return last;
}

/**
 * Split a single free-text name into the two fields a CRM contact record wants.
 * Everything before the last space is the given name, so "Ana María Ruiz Vega"
 * yields "Ana María Ruiz" / "Vega" rather than dropping the middle names — and
 * a single-word entry keeps the whole string as the first name with an empty
 * last, which GoHighLevel accepts.
 */
export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] ?? "", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}
