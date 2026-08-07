"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AGENT_HEARD, AGENT_STAGES, type AgentHeard, type AgentStage } from "@/lib/types";

/*
 * 🔴 `signOut` LIVES IN (portal)/session/actions.ts NOW, AND IT IS NOT
 * RE-EXPORTED FROM HERE.
 *
 * It moved because /pending and /welcome need it and neither should import a
 * module whose every other export is admin-gated. The obvious courtesy —
 * `export { signOut } from ".../session/actions"` — DOES NOT COMPILE: a
 * "use server" file may only export async functions, and a re-export is not
 * one. Next fails the build with "Only async functions are allowed to be
 * exported in a 'use server' file". Import it from its own module.
 */

// =============================================================================
// ACCOUNT APPROVAL — the mutations behind the approvals queue.
//
// 🔴 EVERY ONE OF THEM CALLS requireAdmin() FIRST, and requireAdmin now demands
// role='admin' AND status='active'. A hidden button is not access control; this
// is the first of three gates:
//
//   1. requireAdmin()          — the caller is a verified, ACTIVE admin.
//   2. profiles_update_admin   — RLS re-judges it in Postgres, and the column
//      + the `grant update (status)`   grant means `status` is the only column any API
//                                caller can write on this table.
//   3. profiles_enforce_transition — the trigger allows only the four legal
//      status moves and refuses any role change or self-approval.
//
// Delete every line of TypeScript below and the database still refuses an
// agent's attempt to approve themselves. That is the design.
// =============================================================================

/**
 * 🔴 THESE TWO ACTIONS RETURN `void`, NOT A RESULT OBJECT, AND THAT IS FORCED BY
 * THE MARKUP RATHER THAN CHOSEN.
 *
 * The approvals queue posts a plain `<form action={serverAction}>` per row — no
 * `useFormState` — because that is what makes the buttons work without
 * JavaScript and keeps the authorisation decision on the server (see
 * ApprovalsQueue's docblock). React types a bare form action as returning
 * `void | Promise<void>`, so a result object cannot be handed back through it.
 *
 * Feedback therefore travels by REDIRECT: a failure sends the admin back to
 * /admin?accountError=<code>, which the page renders as an alert. Success needs
 * no message — the row's badge changes, which is the feedback.
 *
 * Same shape as the existing `setAgentActive` below, deliberately: one pattern
 * for every mutation on this page.
 */
export type AccountErrorCode = "forbidden" | "invalid" | "write_failed";

/**
 * Bounce back to the dashboard with a failure code.
 *
 * `redirect()` throws NEXT_REDIRECT, so it must never sit inside a try/catch —
 * and calling it as `return fail(...)` keeps each guard a single readable line
 * while still terminating the action.
 *
 * 🔴 THE CODE IS COARSE ON PURPOSE. "forbidden", "invalid" and "write_failed"
 * say nothing about WHICH row, WHICH status, or why Postgres refused. A precise
 * message here would be a probe: an admin whose session has been downgraded
 * could otherwise learn other accounts' states from the error text alone.
 */
function fail(locale: string, code: AccountErrorCode): never {
  redirect(`/${locale}/admin?accountError=${code}`);
}

/**
 * Approve (pending -> active) or reject (pending/active -> rejected).
 *
 * 🔴 IT WRITES `status` AND NOTHING ELSE. `approved_at`/`approved_by` are NOT
 * set here, and that is not an oversight: the section-5 column grant in 0005
 * gives `authenticated` UPDATE on `status` only, so an attempt to write the
 * audit columns through this RLS-scoped client would fail the whole statement
 * and take the approval down with it. Recording who approved whom needs either a
 * definer RPC or a service-role write; both are wider surfaces than this feature
 * currently justifies, so the columns exist, stay null, and are documented as
 * reserved rather than half-populated.
 *
 * 🔴 IT DOES NOT PRE-CHECK THE CURRENT STATUS. The trigger is the authority on
 * which transitions are legal, and re-implementing that list here would create
 * two sources of truth that can drift. An illegal move returns `write_failed`
 * because Postgres raised, which is the correct answer.
 */
export async function setAccountStatus(formData: FormData): Promise<void> {
  // Read the locale FIRST — every failure path below redirects, and the
  // redirect needs it.
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const id = String(formData.get("id") ?? "").trim();
  const next = String(formData.get("status") ?? "").trim();

  const admin = await requireAdmin();
  if (!admin) return fail(locale, "forbidden");

  // Only these two are reachable from the UI. 'pending' and 'unverified' are
  // deliberately NOT accepted: nothing may be pushed back into a queue state,
  // and the trigger would refuse it anyway.
  if (!id || (next !== "active" && next !== "rejected")) {
    return fail(locale, "invalid");
  }

  // 🔴 An admin cannot act on their own row. The trigger enforces this too; the
  // check here exists so the UI gets `invalid` rather than a raised exception.
  if (id === admin.user.id) return fail(locale, "invalid");

  const { error } = await admin.supabase
    .from("profiles")
    .update({ status: next })
    .eq("id", id);

  if (error) {
    console.log("[admin] status write rejected", { code: error.code });
    return fail(locale, "write_failed");
  }

  revalidatePath(`/${locale}/admin`);
}

/**
 * DELETE AN UNVERIFIED ACCOUNT — squatting mitigation (a).
 *
 * The attack it answers: signup is open to anyone who can type an
 * @fflsynergy.com address, so an attacker can register `ziad@fflsynergy.com`,
 * fail to confirm it (no inbox), and thereby BLOCK the real Ziad from ever
 * signing up. The account reaches nothing — but the address is taken.
 *
 * =============================================================================
 * 🔴 THIS IS THE ONLY PLACE IN THE ADMIN SURFACE THAT USES THE SERVICE-ROLE
 * CLIENT, AND THE REASON IS NARROW AND UNAVOIDABLE.
 *
 * The row that has to die is in `auth.users`, which Supabase owns. There is no
 * RLS policy that can grant a browser session the right to delete an auth user,
 * and there is no DELETE policy on `public.profiles` either (deleting the
 * profile alone would leave an orphaned auth user whose ADDRESS IS STILL TAKEN,
 * i.e. it would not fix the squat at all). Deleting the auth user removes the
 * profile with it, via 0001's `on delete cascade`.
 *
 * THREE THINGS KEEP THIS FROM BEING A BACK DOOR:
 *   1. requireAdmin() runs FIRST and the service client is not created until it
 *      passes.
 *   2. The target is re-read through the RLS-SCOPED client and the delete is
 *      refused unless that read returns status === 'unverified'. So the
 *      privileged call can only ever be aimed at an account that has never
 *      proven its inbox — never at a pending, active or rejected colleague.
 *   3. It is a server action in a server-only module; `createAdminClient` throws
 *      if it is ever evaluated in a browser, and `postbuild` fails the build if
 *      the key's name or prefix reaches `.next/static`.
 * =============================================================================
 */
export async function deleteUnverifiedAccount(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const id = String(formData.get("id") ?? "").trim();

  const admin = await requireAdmin();
  if (!admin) return fail(locale, "forbidden");
  if (!id) return fail(locale, "invalid");
  if (id === admin.user.id) return fail(locale, "invalid");

  // Gate 2. Read through RLS, not the service client — this is the check that
  // stops the privileged delete below being pointed at anyone else.
  const { data: target, error: readError } = await admin.supabase
    .from("profiles")
    .select("id, status")
    .eq("id", id)
    .single();

  if (readError || !target) return fail(locale, "invalid");
  if (target.status !== "unverified") return fail(locale, "invalid");

  const service = createAdminClient();
  if (!service) return fail(locale, "write_failed");

  const { error } = await service.auth.admin.deleteUser(id);
  if (error) {
    console.log("[admin] unverified delete failed", { status: error.status });
    return fail(locale, "write_failed");
  }

  revalidatePath(`/${locale}/admin`);
}

// =============================================================================
// AGENT MUTATIONS
//
// 🔴 EVERY mutation calls requireAdmin() FIRST and returns "forbidden" if the
// caller is not a verified admin — the button being hidden in the UI is not the
// control; this is. requireAdmin() also hands back the RLS-scoped client, so the
// database policies (agents_insert_admin / agents_update_admin) are the second,
// authoritative gate: even if this check were removed, a non-admin's write is
// still rejected by Postgres.
// =============================================================================

export type AgentActionState = {
  ok: boolean;
  error: "forbidden" | "invalid" | "write_failed" | null;
  /** Field-level messages for the form, keyed by field name. */
  fields?: Partial<Record<"name" | "email", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readAgentInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const licensed = formData.get("licensed") === "on";
  const heardRaw = String(formData.get("heard") ?? "");
  const stageRaw = String(formData.get("stage") ?? "");

  const fields: NonNullable<AgentActionState["fields"]> = {};
  if (!name) fields.name = "required";
  if (!email) fields.email = "required";
  else if (!EMAIL_RE.test(email)) fields.email = "format";

  const stage: AgentStage = (AGENT_STAGES as readonly string[]).includes(stageRaw)
    ? (stageRaw as AgentStage)
    : "touch";
  const heard: AgentHeard | null = (AGENT_HEARD as readonly string[]).includes(heardRaw)
    ? (heardRaw as AgentHeard)
    : null;

  return {
    valid: Object.keys(fields).length === 0,
    fields,
    values: {
      name,
      email,
      phone: phone || null,
      state: state || null,
      licensed,
      heard,
      stage,
    },
  };
}

/**
 * Create (no id) or update (id present) an agent. One action, one form.
 */
export async function saveAgent(
  _prev: AgentActionState,
  formData: FormData,
): Promise<AgentActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "forbidden" };

  const { valid, fields, values } = readAgentInput(formData);
  if (!valid) return { ok: false, error: "invalid", fields };

  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";

  const { error } = id
    ? await admin.supabase.from("agents").update(values).eq("id", id)
    : await admin.supabase.from("agents").insert(values);

  if (error) return { ok: false, error: "write_failed" };

  revalidatePath(`/${locale}/admin`);
  return { ok: true, error: null };
}

/**
 * Deactivate / reactivate an agent — the stand-in for delete (no delete policy
 * exists). Re-checks admin; RLS's agents_update_admin is the backstop.
 */
export async function setAgentActive(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return; // forbidden — no-op, nothing changes

  const id = String(formData.get("id") ?? "").trim();
  const active = formData.get("active") === "true";
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  if (!id) return;

  await admin.supabase.from("agents").update({ active }).eq("id", id);
  revalidatePath(`/${locale}/admin`);
}
