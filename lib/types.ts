/**
 * Shared app types. These mirror the Postgres enums/tables in
 * supabase/migrations/*.sql — keep the two in step.
 */
export type AppRole = "admin" | "agent";

// ---- CRM (0002_crm.sql) -----------------------------------------------------
export type LeadSource = "contact" | "calculator";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed";
export type AgentStage = "touch" | "meet" | "licensed" | "appointed";
export type AgentHeard = "search" | "social" | "referral" | "event" | "other";

/** A row of public.leads. */
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: LeadSource;
  interest: string | null;
  sms_consent: boolean;
  email_optin: boolean;
  status: LeadStatus;
  received_at: string;
};

/** A row of public.agents. */
export type Agent = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  licensed: boolean;
  heard: AgentHeard | null;
  stage: AgentStage;
  active: boolean;
  applied_at: string;
  updated_at: string;
};

/**
 * A row of public.applications — a /join submission.
 *
 * 🔴 READ-ONLY IN THE APP, BY DESIGN. There is no `ApplicationInput` companion
 * type (unlike `AgentInput`) and that absence is deliberate: 0003 grants the
 * admin SELECT and nothing else, so there is no update path to type. Rows are
 * written only by the server action's service-role client.
 */
export type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  state: string;
  licensed: boolean;
  heard: AgentHeard | null;
  consent: boolean;
  received_at: string;
};

/** The values an admin may set when creating/editing an agent. */
export type AgentInput = {
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  licensed: boolean;
  heard: AgentHeard | null;
  stage: AgentStage;
};

export const AGENT_STAGES: readonly AgentStage[] = ["touch", "meet", "licensed", "appointed"];
export const AGENT_HEARD: readonly AgentHeard[] = ["search", "social", "referral", "event", "other"];
