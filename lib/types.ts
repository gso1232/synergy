/**
 * Shared app types. These mirror the Postgres enums/tables in
 * supabase/migrations/*.sql — keep the two in step.
 */
export type AppRole = "admin" | "agent";

/**
 * public.account_status (0005_agent_signup.sql). FOUR states, and the order
 * below is the lifecycle:
 *
 *   unverified  signed up, inbox NOT proven. Counts as nothing, reaches
 *               nothing, never appears in the approvals queue, purged at 24h.
 *   pending     inbox proven, awaiting an admin. Reaches NOTHING.
 *   active      approved. The only status any RLS policy grants anything to.
 *   rejected    denied. Reaches nothing. Reversible to active.
 *
 * 🔴 ONLY 'active' GRANTS ANYTHING. Every policy on the database turns on that
 * one word — treat any other value as "deny" without special-casing it.
 */
export type AccountStatus = "unverified" | "pending" | "active" | "rejected";

/** A row of public.profiles as an admin sees it in the approvals queue. */
export type Profile = {
  id: string;
  role: AppRole;
  status: AccountStatus;
  full_name: string | null;
  email: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
};

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
  /** Free text from the contact form. Added 0010_lead_intake_ghl.sql. */
  message: string | null;
  /** "en" | "es" — the language the visitor filled the form in. */
  locale: string | null;
  /**
   * CRM delivery record. 'delivered' means GoHighLevel returned 2xx; anything
   * else means THIS LEAD IS NOT IN THE CRM and has to be worked by hand. The
   * row is committed before delivery is attempted, so a lead is never lost —
   * but it can be un-delivered, which is exactly what this column is for.
   */
  ghl_status: "pending" | "delivered" | "failed" | "unconfigured" | null;
  ghl_detail: string | null;
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

// ---- AGENT-AREA CMS (0007_agent_cms.sql) ------------------------------------

/**
 * A row of public.pages, AS A CLIENT CAN SEE IT.
 *
 * 🔴 THERE IS NO `password` FIELD, AND ITS ABSENCE IS THE SCHEMA TELLING THE
 * TRUTH. 0007 revokes SELECT on that column from `authenticated`, so no session
 * — admin included — can read it back. Adding it here optimistically would
 * produce a type that says a value exists where the database returns nothing,
 * and the first `page.password` comparison written against it would silently
 * always fail. Protection is set and verified, never displayed:
 *   set     -> admin CMS writes the column
 *   verify  -> public.agent_page(slug, attempt) does the comparison in Postgres
 */
export type Page = {
  id: string;
  parent_id: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  is_password_protected: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** A row of public.section_links, as returned inside `AgentPage`. */
export type SectionLink = {
  id: string;
  label: string;
  url: string;
};

/** A row of public.page_sections. */
export type PageSection = {
  id: string;
  page_id?: string;
  /** '01', '02'… TEXT, not a number: the leading zero is what the badge renders. */
  step_number: string | null;
  heading: string | null;
  body: string | null;
  sort_order: number;
  links?: SectionLink[];
};

/**
 * What `public.agent_page(slug, password)` returns.
 *
 * 🔴 `locked: true` COMES WITH `sections: []` FROM THE DATABASE, not from the
 * UI choosing to hide them. The gate is server-side; this type just carries the
 * verdict. See the function's docblock in 0007.
 */
export type AgentPage = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  parent_id: string | null;
  is_published: boolean;
  is_password_protected: boolean;
  locked: boolean;
  sections: PageSection[];
};

/** A row of public.activity_logs, joined with the actor's address for display. */
export type ActivityLog = {
  id: string;
  user_id: string | null;
  action: string;
  target: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  /** Filled in by the reader from `profiles`; the table itself stores only the id. */
  actor_email?: string | null;
};

/** The actions this app writes. Free text in the database (see 0007) — this
 *  list is for the log filter's dropdown, not a constraint. */
export const ACTIVITY_ACTIONS = [
  "login",
  "view_page",
  "page_unlocked",
  "cms_edit",
  "account_created",
  "account_status_changed",
] as const;
