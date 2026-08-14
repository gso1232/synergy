import "server-only";

import { createReadClient } from "@/lib/supabase/server";
import type { AgentPage, Page, PageSection, SectionLink } from "@/lib/types";
import type { ReadResult } from "@/lib/admin/data";

/**
 * READS FOR THE AGENT-AREA CMS.
 *
 * Two audiences, two access paths, and the difference matters:
 *
 *   AGENTS   `getAgentPage()` -> the `public.agent_page()` RPC. One call, and
 *            the ONLY path to a password-protected page's content. See 0007 §6.
 *   ADMINS   plain table reads through RLS. The admin policies return every
 *            page including drafts, which is what the CMS needs to edit them.
 *
 * Every query here runs through the RLS-scoped client (the logged-in user's own
 * session), never the service role. The policies decide; this file only shapes.
 */

/* ------------------------------------------------------------------ agents --- */

/**
 * ONE PAGE, FOR AN AGENT.
 *
 * `password` is the attempt typed into the gate, or undefined. It is passed
 * straight to Postgres and compared there — it is never fetched to be compared
 * here, because the column it would be compared against is unreadable by any
 * client (0007 §5). A wrong attempt comes back as `locked: true` with an empty
 * `sections` array; there is nothing in the response to inspect.
 *
 * Returns null for: not signed in, not active, no such slug, or an unpublished
 * page viewed by a non-admin. All four collapse into the same answer on purpose
 * — a distinct "exists but you may not see it" would enumerate the private area.
 */
export async function getAgentPage(
  slug: string,
  password?: string,
): Promise<AgentPage | null> {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase.rpc("agent_page", {
      p_slug: slug,
      p_password: password ?? null,
    });
    if (error) {
      /* 🔴 THE MISSING-FUNCTION CASE IS NAMED, NOT LEFT AS A CODE. PGRST202 here
         means `public.agent_page()` does not exist, i.e. 0007 has not been run —
         and the caller turns a null into `notFound()`, so without this line the
         server log is the only place that difference survives. */
      if (error.code === "PGRST202" || /does not exist|schema cache/i.test(error.message ?? "")) {
        console.log(
          "[cms] agent_page() is missing — run supabase/migrations/0007_agent_cms.sql",
        );
      } else {
        console.log("[cms] agent_page failed", { code: error.code });
      }
      return null;
    }
    if (!data) return null;

    const page = data as AgentPage;
    // The RPC orders sections and links in SQL; this is belt and braces for the
    // day someone edits that ORDER BY out.
    page.sections = (page.sections ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({ ...s, links: s.links ?? [] }));
    return page;
  } catch (e) {
    console.log("[cms] agent_page threw", { message: e instanceof Error ? e.message : "unknown" });
    return null;
  }
}

/**
 * THE NAV / INDEX TREE — published pages only, parents with their children.
 *
 * 🔴 IT READS THE TABLE DIRECTLY RATHER THAN THROUGH THE RPC, and that is safe
 * because a page ROW carries no content: title, slug and whether it is gated.
 * The gate protects sections and links, which this never touches. An agent is
 * meant to see that "SFP Bootcamp English" exists — that is what tells them to
 * ask for the password.
 *
 * Unpublished pages never appear here for anyone, admin included. The CMS list
 * is where drafts live; the agent nav is not a preview surface.
 */
export type NavPage = Pick<Page, "id" | "slug" | "title" | "subtitle" | "is_password_protected"> & {
  children: NavPage[];
};

/**
 * =============================================================================
 * 🔴 WHY THIS RETURNS A RESULT INSTEAD OF AN ARRAY. IT USED TO RETURN `[]` ON
 * FAILURE, AND THAT COST A DEBUGGING SESSION.
 *
 * The first version caught every error and returned an empty array. `/agents`
 * then rendered its "no pages have been published yet" message — which is a
 * statement of fact about the CONTENT, and it was being shown for a reason that
 * had nothing to do with content: the CMS tables did not exist, because
 * `0007_agent_cms.sql` had never been run. The page said the database was empty;
 * the database did not have the table. Those are not the same, and the screen
 * gave no way to tell them apart.
 *
 * The empty-state message was itself documented as "an honest empty state…an
 * empty grid is indistinguishable from a failed query, and the difference
 * matters to whoever is debugging it". It was right about the principle and this
 * function silently broke it one layer down. Every reader in
 * `lib/admin/data.ts` already returns `ReadResult` for exactly this reason; this
 * one is now consistent with them.
 *
 * `missingSchema` is carried separately because it has a specific, actionable
 * answer — run the migration — that no other failure has.
 * =============================================================================
 */
export type NavTreeResult =
  | { ok: true; pages: NavPage[] }
  | { ok: false; error: string; missingSchema: boolean };

/**
 * PostgREST reports an absent table as PGRST205 ("Could not find the table … in
 * the schema cache"); Postgres itself reports 42P01 ("relation does not exist")
 * when the call gets that far. Either means the same thing here: the migration
 * has not been applied.
 */
function isMissingSchema(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return (
    err.code === "PGRST205" ||
    err.code === "42P01" ||
    /schema cache|does not exist/i.test(err.message ?? "")
  );
}

export async function getNavTree(): Promise<NavTreeResult> {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("pages")
      .select("id, slug, title, subtitle, parent_id, is_password_protected, sort_order")
      /* The landing list and the nav both want PUBLISHED pages only, and the
         nesting is rebuilt below rather than filtered here — a `parent_id is
         null` filter at this level would drop the children and leave every
         dropdown empty. */
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.log("[cms] nav read failed", { code: error.code });
      return { ok: false, error: error.message, missingSchema: isMissingSchema(error) };
    }
    if (!data) return { ok: true, pages: [] };

    type Row = Pick<Page, "id" | "slug" | "title" | "subtitle" | "parent_id" | "is_password_protected">;
    const rows = data as Row[];

    const node = (r: Row): NavPage => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      is_password_protected: r.is_password_protected,
      children: [],
    });

    const byId = new Map<string, NavPage>();
    const roots: NavPage[] = [];

    // Two passes so a child can appear before its parent in the result set.
    for (const r of rows) byId.set(r.id, node(r));
    for (const r of rows) {
      const n = byId.get(r.id)!;
      /* 🔴 AN ORPHAN IS PROMOTED, NOT DROPPED. `parent_id` is `on delete set
         null` in the schema, but a child whose parent is merely UNPUBLISHED has
         a parent_id pointing at a row this query filtered out. Dropping it would
         make a published page vanish from the nav with no error anywhere. */
      const parent = r.parent_id ? byId.get(r.parent_id) : undefined;
      if (parent) parent.children.push(n);
      else roots.push(n);
    }

    return { ok: true, pages: roots };
  } catch (e) {
    const message = e instanceof Error ? e.message : "read failed";
    return { ok: false, error: message, missingSchema: /does not exist|schema cache/i.test(message) };
  }
}

/* ------------------------------------------------------------------ admins --- */

/** Every page, drafts included, for the CMS list. Admin-gated by RLS. */
export async function getAllPages(): Promise<ReadResult<Page>> {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("pages")
      .select(
        "id, parent_id, slug, title, subtitle, is_password_protected, is_published, sort_order, created_at, updated_at",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return { ok: false, error: error.message };
    return { ok: true, rows: (data ?? []) as Page[] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "read failed" };
  }
}

export type PageDetail = {
  page: Page;
  sections: (PageSection & { links: SectionLink[] })[];
};

/**
 * ONE PAGE WITH EVERYTHING UNDER IT, FOR THE EDITOR.
 *
 * 🔴 THIS IS THE ADMIN PATH AND IT BYPASSES THE PASSWORD GATE — by policy, not
 * by trick. `page_sections_select_admin` returns protected sections to an active
 * admin, because the person who sets the password is the person who has to be
 * able to edit what is behind it. The gate exists to keep AGENTS out of content
 * they have not been given the password for, not to keep the author out.
 */
export async function getPageDetail(id: string): Promise<PageDetail | null> {
  try {
    const supabase = createReadClient();

    const { data: page, error: pageErr } = await supabase
      .from("pages")
      .select(
        "id, parent_id, slug, title, subtitle, is_password_protected, is_published, sort_order, created_at, updated_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (pageErr || !page) return null;

    const { data: sections, error: secErr } = await supabase
      .from("page_sections")
      .select("id, page_id, step_number, heading, body, sort_order")
      .eq("page_id", id)
      .order("sort_order", { ascending: true });

    if (secErr) return null;

    const ids = (sections ?? []).map((s) => s.id as string);
    let links: (SectionLink & { section_id: string; sort_order: number })[] = [];
    if (ids.length) {
      const { data: linkRows } = await supabase
        .from("section_links")
        .select("id, section_id, label, url, sort_order")
        .in("section_id", ids)
        .order("sort_order", { ascending: true });
      links = (linkRows ?? []) as typeof links;
    }

    return {
      page: page as Page,
      sections: ((sections ?? []) as PageSection[]).map((s) => ({
        ...s,
        links: links.filter((l) => l.section_id === s.id).map(({ id: lid, label, url }) => ({
          id: lid,
          label,
          url,
        })),
      })),
    };
  } catch {
    return null;
  }
}
