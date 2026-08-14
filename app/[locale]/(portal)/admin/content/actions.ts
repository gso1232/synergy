"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logActivity } from "@/lib/cms/activity";

/**
 * THE CMS MUTATIONS — pages, sections and links.
 *
 * =============================================================================
 * 🔴 EVERY ONE OF THESE CALLS requireAdmin() FIRST, AND NOT ONE OF THEM USES THE
 * SERVICE ROLE.
 *
 * A `"use server"` function compiles to a public POST endpoint. The admin layout
 * gates the PAGE; it does not gate these. So each action re-verifies that the
 * caller is a verified, ACTIVE admin before touching anything — and then writes
 * through the RLS-SCOPED client, so 0007's `*_admin` policies re-judge the write
 * in Postgres. Delete every guard in this file and the database still refuses an
 * agent's attempt to edit a page. That redundancy is the design, and it is the
 * same one `(portal)/admin/actions.ts` documents for account mutations.
 *
 * 🔴 THE SERVICE-ROLE CLIENT IS ABSENT ON PURPOSE. It is needed for exactly two
 * things in this product — minting and deleting `auth.users` rows — and neither
 * is here. CMS content is ordinary data in ordinary tables with ordinary
 * policies. Reaching for the privileged client to save a paragraph would widen
 * the blast radius of a bug in this file from "an admin edited a page" to
 * "anything at all".
 *
 * =============================================================================
 * §SHAPE. Every action returns `void` and reports by redirect, because each is
 * posted from a bare `<form action={...}>` with no `useFormState`. That is what
 * makes the whole CMS work with JavaScript off — the reorder buttons, the
 * deletes, all of it — and it keeps the authorisation decision on the server.
 * React types a bare form action as returning `void | Promise<void>`, so there
 * is no channel for a result object anyway.
 *
 * Failure codes are coarse ("forbidden", "invalid", "write_failed") for the same
 * reason the account actions' are: a precise message is a probe.
 */

export type CmsErrorCode = "forbidden" | "invalid" | "write_failed";

function locOf(formData: FormData): string {
  return String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
}

/** Back to the page editor (or the list) with a failure code. */
function fail(locale: string, pageId: string | null, code: CmsErrorCode): never {
  redirect(
    pageId
      ? `/${locale}/admin/content/${pageId}?cmsError=${code}`
      : `/${locale}/admin/content?cmsError=${code}`,
  );
}

/** The same shape the database enforces, checked before the round trip so the
 *  admin gets "invalid" rather than a raised constraint. */
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Matches 0007's `section_links_url_scheme`. */
const URL_RE = /^(https?:\/\/|\/)/i;

function int(formData: FormData, key: string, fallback = 0): number {
  const n = Number(String(formData.get(key) ?? ""));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/* ------------------------------------------------------------------ pages --- */

export async function createPage(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const admin = await requireAdmin();
  if (!admin) return fail(locale, null, "forbidden");

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  if (!SLUG_RE.test(slug) || !title) return fail(locale, null, "invalid");

  const { data, error } = await admin.supabase
    .from("pages")
    .insert({
      slug,
      title,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      parent_id: String(formData.get("parent_id") ?? "") || null,
      sort_order: int(formData, "sort_order"),
      // A new page starts UNPUBLISHED. Creating a page and having it appear in
      // every agent's nav mid-sentence is the wrong default; publishing is a
      // deliberate second act.
      is_published: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.log("[cms] page create rejected", { code: error?.code });
    return fail(locale, null, "write_failed");
  }

  await logActivity(admin.user.id, "cms_edit", slug, { entity: "page", op: "create" });
  revalidatePath(`/${locale}/admin/content`);
  redirect(`/${locale}/admin/content/${data.id}`);
}

export async function updatePage(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const id = String(formData.get("id") ?? "").trim();
  const admin = await requireAdmin();
  if (!admin) return fail(locale, id || null, "forbidden");
  if (!id) return fail(locale, null, "invalid");

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  if (!SLUG_RE.test(slug) || !title) return fail(locale, id, "invalid");

  const isProtected = formData.get("is_password_protected") === "on";
  const newPassword = String(formData.get("password") ?? "");

  const patch: Record<string, unknown> = {
    slug,
    title,
    subtitle: String(formData.get("subtitle") ?? "").trim() || null,
    parent_id: String(formData.get("parent_id") ?? "") || null,
    sort_order: int(formData, "sort_order"),
    is_published: formData.get("is_published") === "on",
    is_password_protected: isProtected,
  };

  /* =========================================================================
     🔴 AN EMPTY PASSWORD FIELD MEANS "LEAVE IT ALONE", NOT "CLEAR IT".
     The editor cannot show the current password — `authenticated` has no SELECT
     grant on that column (0007 §5), by design. So the field renders empty on
     every load, and writing it unconditionally would wipe the password every
     time Aiman fixed a typo in a heading. It is written ONLY when he types
     something.

     Turning protection OFF does clear it, because a stored password behind a
     disabled gate is a credential nobody is tracking. Turning protection ON
     without ever supplying one is refused here rather than at the database,
     where `pages_password_present` would raise a constraint error nobody can
     read.
     ========================================================================= */
  if (!isProtected) {
    patch.password = null;
  } else if (newPassword) {
    patch.password = newPassword;
  } else {
    // Protection is on and no new password was typed. Fine if one is already
    // stored; the database's check constraint is the arbiter.
    const { data: existing } = await admin.supabase
      .from("pages")
      .select("is_password_protected")
      .eq("id", id)
      .maybeSingle();
    if (!existing?.is_password_protected) return fail(locale, id, "invalid");
  }

  const { error } = await admin.supabase.from("pages").update(patch).eq("id", id);
  if (error) {
    console.log("[cms] page update rejected", { code: error.code });
    return fail(locale, id, "write_failed");
  }

  /* 🔴 THE NEW PASSWORD IS NOT IN THE LOG — only the fact that one was set.
     `metadata` is readable by every admin forever. */
  await logActivity(admin.user.id, "cms_edit", slug, {
    entity: "page",
    op: "update",
    password_changed: Boolean(isProtected && newPassword),
  });

  revalidatePath(`/${locale}/admin/content`);
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content/${id}?saved=1`);
}

export async function deletePage(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const id = String(formData.get("id") ?? "").trim();
  const admin = await requireAdmin();
  if (!admin) return fail(locale, id || null, "forbidden");
  if (!id) return fail(locale, null, "invalid");

  // Read the slug for the log BEFORE the row goes away.
  const { data: page } = await admin.supabase
    .from("pages")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  /* Sections and links go with it via `on delete cascade`; a child page's
     `parent_id` is set to null by the FK and it becomes top-level rather than
     disappearing (see getNavTree's orphan note). */
  const { error } = await admin.supabase.from("pages").delete().eq("id", id);
  if (error) {
    console.log("[cms] page delete rejected", { code: error.code });
    return fail(locale, id, "write_failed");
  }

  await logActivity(admin.user.id, "cms_edit", page?.slug ?? id, { entity: "page", op: "delete" });
  revalidatePath(`/${locale}/admin/content`);
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content`);
}

/* --------------------------------------------------------------- sections --- */

export async function createSection(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const pageId = String(formData.get("page_id") ?? "").trim();
  const admin = await requireAdmin();
  if (!admin) return fail(locale, pageId || null, "forbidden");
  if (!pageId) return fail(locale, null, "invalid");

  /* Appended to the end. The next multiple of ten leaves room to insert by hand
     later without renumbering the whole page — the same reason the seed uses
     10, 20, 30 rather than 1, 2, 3. */
  const { data: last } = await admin.supabase
    .from("page_sections")
    .select("sort_order")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.supabase.from("page_sections").insert({
    page_id: pageId,
    step_number: String(formData.get("step_number") ?? "").trim() || null,
    heading: String(formData.get("heading") ?? "").trim() || null,
    body: String(formData.get("body") ?? "") || null,
    sort_order: (last?.sort_order ?? 0) + 10,
  });

  if (error) {
    console.log("[cms] section create rejected", { code: error.code });
    return fail(locale, pageId, "write_failed");
  }

  await logActivity(admin.user.id, "cms_edit", pageId, { entity: "section", op: "create" });
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content/${pageId}?saved=1`);
}

export async function updateSection(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const pageId = String(formData.get("page_id") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const admin = await requireAdmin();
  if (!admin) return fail(locale, pageId || null, "forbidden");
  if (!id || !pageId) return fail(locale, pageId || null, "invalid");

  const { error } = await admin.supabase
    .from("page_sections")
    .update({
      step_number: String(formData.get("step_number") ?? "").trim() || null,
      heading: String(formData.get("heading") ?? "").trim() || null,
      body: String(formData.get("body") ?? "") || null,
    })
    .eq("id", id);

  if (error) {
    console.log("[cms] section update rejected", { code: error.code });
    return fail(locale, pageId, "write_failed");
  }

  await logActivity(admin.user.id, "cms_edit", pageId, { entity: "section", op: "update" });
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content/${pageId}?saved=1#section-${id}`);
}

export async function deleteSection(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const pageId = String(formData.get("page_id") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const admin = await requireAdmin();
  if (!admin) return fail(locale, pageId || null, "forbidden");
  if (!id || !pageId) return fail(locale, pageId || null, "invalid");

  const { error } = await admin.supabase.from("page_sections").delete().eq("id", id);
  if (error) return fail(locale, pageId, "write_failed");

  await logActivity(admin.user.id, "cms_edit", pageId, { entity: "section", op: "delete" });
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content/${pageId}`);
}

/**
 * REORDER — swap this section's `sort_order` with its neighbour's.
 *
 * 🔴 A SWAP, NOT A RENUMBER, and it is done in two statements rather than one
 * transaction because PostgREST has no transaction to offer. The failure mode of
 * a half-applied swap is two sections sharing a `sort_order`, which renders in
 * id order — untidy, and fixed by pressing the button again. The failure mode of
 * renumbering the whole page is worse, so this is the cheaper wrong.
 */
export async function moveSection(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const pageId = String(formData.get("page_id") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const dir = String(formData.get("dir") ?? "");
  const admin = await requireAdmin();
  if (!admin) return fail(locale, pageId || null, "forbidden");
  if (!id || !pageId || (dir !== "up" && dir !== "down")) {
    return fail(locale, pageId || null, "invalid");
  }

  const { data: rows, error: readErr } = await admin.supabase
    .from("page_sections")
    .select("id, sort_order")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });

  if (readErr || !rows) return fail(locale, pageId, "write_failed");

  const i = rows.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  // Already at the end. Not an error — the button simply does nothing.
  if (i < 0 || j < 0 || j >= rows.length) redirect(`/${locale}/admin/content/${pageId}`);

  const a = rows[i];
  const b = rows[j];

  const [r1, r2] = await Promise.all([
    admin.supabase.from("page_sections").update({ sort_order: b.sort_order }).eq("id", a.id),
    admin.supabase.from("page_sections").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);
  if (r1.error || r2.error) return fail(locale, pageId, "write_failed");

  await logActivity(admin.user.id, "cms_edit", pageId, { entity: "section", op: "reorder" });
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content/${pageId}#section-${id}`);
}

/* ------------------------------------------------------------------ links --- */

export async function createLink(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const pageId = String(formData.get("page_id") ?? "").trim();
  const sectionId = String(formData.get("section_id") ?? "").trim();
  const admin = await requireAdmin();
  if (!admin) return fail(locale, pageId || null, "forbidden");

  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  /* 🔴 THE SCHEME CHECK IS HERE **AND** IN THE DATABASE. This one produces a
     readable "invalid"; `section_links_url_scheme` is the one that actually
     holds, for every path including a direct API call. Neither is redundant. */
  if (!sectionId || !label || !URL_RE.test(url)) return fail(locale, pageId || null, "invalid");

  const { data: last } = await admin.supabase
    .from("section_links")
    .select("sort_order")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.supabase.from("section_links").insert({
    section_id: sectionId,
    label,
    url,
    sort_order: (last?.sort_order ?? 0) + 10,
  });

  if (error) {
    console.log("[cms] link create rejected", { code: error.code });
    return fail(locale, pageId, "write_failed");
  }

  await logActivity(admin.user.id, "cms_edit", pageId, { entity: "link", op: "create" });
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content/${pageId}?saved=1#section-${sectionId}`);
}

export async function deleteLink(formData: FormData): Promise<void> {
  const locale = locOf(formData);
  const pageId = String(formData.get("page_id") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const admin = await requireAdmin();
  if (!admin) return fail(locale, pageId || null, "forbidden");
  if (!id || !pageId) return fail(locale, pageId || null, "invalid");

  const { error } = await admin.supabase.from("section_links").delete().eq("id", id);
  if (error) return fail(locale, pageId, "write_failed");

  await logActivity(admin.user.id, "cms_edit", pageId, { entity: "link", op: "delete" });
  revalidatePath(`/${locale}/agents`);
  redirect(`/${locale}/admin/content/${pageId}`);
}
