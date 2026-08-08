import "server-only";

import { createReadClient } from "@/lib/supabase/server";
import { getAllArticles } from "@/lib/blog";
import type { Agent, Application, Lead, Profile } from "@/lib/types";

/**
 * Server-only reads for the admin dashboard. Every query runs through the
 * RLS-scoped client (the logged-in admin's session), so the database policies —
 * not this code — decide what comes back. A non-admin session gets zero rows
 * from leads/agents by policy; the admin layout has already blocked non-admins
 * before any of this runs, but the RLS floor holds even if it didn't.
 *
 * Each reader returns a discriminated result so the UI can render an HONEST
 * error state instead of pretending an empty list when the query actually
 * failed. Empty-because-empty and empty-because-error are different things.
 */
export type ReadResult<T> =
  | { ok: true; rows: T[] }
  | { ok: false; error: string };

/**
 * ACCOUNTS — the approvals queue.
 *
 * 🔴 RLS-SCOPED LIKE EVERY OTHER READ HERE, which matters more for this one than
 * for any of them: `profiles_select_admin` (0005) requires `is_active_admin()`,
 * so a non-admin — or a REJECTED admin — reaching this function gets ZERO ROWS
 * from the database rather than the account list. The layout guard stops them
 * seeing the page; this is the floor underneath it.
 *
 * ORDERED PENDING FIRST, deliberately: that is the only status that needs a
 * human decision, and burying it under a list of already-approved agents is how
 * a signup sits unnoticed for a week. Within each bucket, oldest first — the
 * person who has been waiting longest is the one to deal with next.
 *
 * `unverified` rows ARE returned, because the delete-unverified button needs
 * something to act on, but the UI files them under a separate heading and never
 * offers approve/reject for them — an address nobody has proven they own is not
 * a decision, it is a squat waiting to be purged.
 */
export async function getProfiles(): Promise<ReadResult<Profile>> {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, status, full_name, email, created_at, approved_at, approved_by")
      .order("created_at", { ascending: true });
    if (error) return { ok: false, error: error.message };

    const RANK: Record<string, number> = { pending: 0, unverified: 1, active: 2, rejected: 3 };
    const rows = ((data ?? []) as Profile[]).slice().sort((a, b) => {
      const r = (RANK[a.status] ?? 9) - (RANK[b.status] ?? 9);
      return r !== 0 ? r : a.created_at.localeCompare(b.created_at);
    });
    return { ok: true, rows };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "read failed" };
  }
}

export async function getLeads(): Promise<ReadResult<Lead>> {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("received_at", { ascending: false });
    if (error) return { ok: false, error: error.message };
    return { ok: true, rows: (data ?? []) as Lead[] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "read failed" };
  }
}

/**
 * /join applications. RLS-scoped like every other read here: this runs as the
 * logged-in user with the PUBLISHABLE key, so `applications_select_admin` in
 * 0003_applications.sql is what actually decides. A non-admin reaching this
 * function gets ZERO ROWS from the database rather than an error — the policy
 * filters, it does not throw — which is why the admin layout's role guard is the
 * thing that stops them seeing the page at all.
 *
 * 🔴 IT DOES NOT USE THE SERVICE-ROLE CLIENT. Only the INSERT path needs that
 * (there is no insert policy); reads deliberately stay under RLS so a bug here
 * cannot leak applications to a non-admin.
 */
export async function getApplications(): Promise<ReadResult<Application>> {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("received_at", { ascending: false });
    if (error) return { ok: false, error: error.message };
    return { ok: true, rows: (data ?? []) as Application[] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "read failed" };
  }
}

export async function getAgents(): Promise<ReadResult<Agent>> {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("active", { ascending: false })
      .order("applied_at", { ascending: false });
    if (error) return { ok: false, error: error.message };
    return { ok: true, rows: (data ?? []) as Agent[] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "read failed" };
  }
}

/**
 * CONTENT is not a table. This is a read-only reflection of real repo state —
 * the blog articles on disk (lib/blog.ts) plus the built static pages. `status`
 * comes from whether an article has an approved body; there is nothing to write
 * here from the admin, so the view carries no actions. Editing content means
 * writing MDX to disk / moving content into the DB — a separate phase, not
 * faked with a dead "Edit" button.
 */
export type ContentRow = {
  id: string;
  title: string;
  slug: string;
  type: "article" | "page";
  status: "published" | "listing";
};

const STATIC_PAGES: { slug: string; title: string }[] = [
  { slug: "about", title: "About" },
  { slug: "services", title: "Services" },
  { slug: "join", title: "Join" },
  { slug: "contact", title: "Contact" },
];

export function getContent(locale: string): ContentRow[] {
  const articles = getAllArticles(locale).map((a) => ({
    id: `article-${a.slug}`,
    title: a.title || a.slug,
    slug: a.slug,
    type: "article" as const,
    status: a.hasBody ? ("published" as const) : ("listing" as const),
  }));
  const pages = STATIC_PAGES.map((p) => ({
    id: `page-${p.slug}`,
    title: p.title,
    slug: p.slug,
    type: "page" as const,
    status: "published" as const,
  }));
  return [...pages, ...articles];
}
