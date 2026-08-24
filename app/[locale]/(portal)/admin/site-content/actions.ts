"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logActivity } from "@/lib/cms/activity";
import { CONTENT_STRINGS_TAG } from "@/lib/cms/strings";
import { EDITABLE_KEYS } from "@/lib/cms/editable-keys";

/**
 * Saving and clearing the admin-edited copy for the public site.
 *
 * =============================================================================
 * 🔴 THE KEY IS CHECKED AGAINST AN ALLOWLIST, NOT VALIDATED BY SHAPE.
 *
 * `EDITABLE_KEYS` is derived from the repo's own message catalogue at build
 * time, so it is the exact set of strings that exist and are meant to be
 * edited. A key that is not in it is refused outright.
 *
 * This is the security boundary AND the correctness boundary, and it closes
 * three holes at once:
 *   · a forged post cannot write a row for `admin.*` or `portal.*` and quietly
 *     reword the staff tooling — those namespaces are excluded from the list;
 *   · it cannot write a NAMESPACE key like "about", which would otherwise sit
 *     in the table waiting to be dropped by mergeOverrides on every render;
 *   · it cannot invent a key nothing renders, so the table stays a set of
 *     overrides for real strings rather than a junk drawer.
 *
 * lib/cms/strings.ts guards the same thing again at render time. Two layers,
 * because this one is a list that can drift and that one is structural.
 * =============================================================================
 */

const LOCALES = new Set(["en", "es"]);
const MAX_VALUE = 5000;

function locOf(formData: FormData): string {
  const l = String(formData.get("uiLocale") ?? "en");
  return l === "es" ? "es" : "en";
}

/**
 * 🔴 BOTH REVALIDATIONS ARE REQUIRED AND THEY DO DIFFERENT JOBS.
 *
 *   revalidateTag  drops the cached database read in lib/cms/strings.ts.
 *                  Without it the next render still serves the old overrides.
 *   revalidatePath drops the PRERENDERED HTML. 67 pages are statically
 *                  generated, so /en/about has its words baked into a file;
 *                  clearing the string cache alone changes nothing a visitor
 *                  can see until that file is rebuilt.
 *
 * The path is revalidated as a LAYOUT at the locale root, which covers every
 * page beneath it — a single edited string can appear in the nav or the footer
 * and therefore on every route, so revalidating only the page being edited
 * would leave the rest stale.
 */
function revalidateEverything() {
  revalidateTag(CONTENT_STRINGS_TAG);
  for (const l of ["en", "es"]) revalidatePath(`/${l}`, "layout");
}

export type SaveResult = { ok: boolean; error?: string };

export async function saveContentString(formData: FormData): Promise<void> {
  const uiLocale = locOf(formData);
  const admin = await requireAdmin();
  if (!admin) return;

  const targetLocale = String(formData.get("targetLocale") ?? "");
  const key = String(formData.get("key") ?? "").trim();
  const value = String(formData.get("value") ?? "");

  if (!LOCALES.has(targetLocale)) return;
  if (!EDITABLE_KEYS.has(key)) return;
  if (value.length > MAX_VALUE) return;

  /* AN EMPTY VALUE IS A RESET, NOT A BLANK STRING. Saving "" would render an
     empty heading on a live page and look like a bug; what the editor means by
     clearing the box is "give me the original back". */
  if (value.trim() === "") {
    await admin.supabase
      .from("content_strings")
      .delete()
      .eq("locale", targetLocale)
      .eq("key", key);
    await logActivity(admin.user.id, "cms_edit", key, {
      entity: "string",
      op: "reset",
      locale: targetLocale,
    });
    revalidateEverything();
    revalidatePath(`/${uiLocale}/admin/site-content`);
    return;
  }

  const { error } = await admin.supabase.from("content_strings").upsert(
    {
      locale: targetLocale,
      key,
      value,
      updated_at: new Date().toISOString(),
      updated_by: admin.user.id,
    },
    { onConflict: "locale,key" },
  );

  if (error) {
    console.error("[site-content] upsert failed:", error.message);
    return;
  }

  await logActivity(admin.user.id, "cms_edit", key, {
    entity: "string",
    op: "update",
    locale: targetLocale,
  });
  revalidateEverything();
  revalidatePath(`/${uiLocale}/admin/site-content`);
}

/** Explicit "back to the original" button, for when the box is not empty. */
export async function resetContentString(formData: FormData): Promise<void> {
  const uiLocale = locOf(formData);
  const admin = await requireAdmin();
  if (!admin) return;

  const targetLocale = String(formData.get("targetLocale") ?? "");
  const key = String(formData.get("key") ?? "").trim();
  if (!LOCALES.has(targetLocale) || !EDITABLE_KEYS.has(key)) return;

  await admin.supabase
    .from("content_strings")
    .delete()
    .eq("locale", targetLocale)
    .eq("key", key);

  await logActivity(admin.user.id, "cms_edit", key, {
    entity: "string",
    op: "reset",
    locale: targetLocale,
  });
  revalidateEverything();
  revalidatePath(`/${uiLocale}/admin/site-content`);
}
