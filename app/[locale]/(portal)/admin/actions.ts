"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { AGENT_HEARD, AGENT_STAGES, type AgentHeard, type AgentStage } from "@/lib/types";

/**
 * Sign out. A server action so the cleared auth cookies are actually written
 * onto the response — `signOut()` revokes the refresh token server-side and
 * removes the cookies. After it, /admin redirects to /login (no session), and
 * the browser Back button cannot restore the dashboard because the page is
 * dynamically rendered and re-guarded on every request.
 */
export async function signOut(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
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
