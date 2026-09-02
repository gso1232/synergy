import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import AdminSubShell from "@/components/admin/AdminSubShell";
import { getUserAndRole, requireAdmin } from "@/lib/supabase/auth";
import { EDITABLE_STRINGS, GROUPS } from "@/lib/cms/editable-keys";
import SiteContentEditor from "@/components/admin/SiteContentEditor";
import { saveContentString, resetContentString } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Site content", robots: { index: false, follow: false } };
}

/**
 * /admin/site-content — EDIT THE WORDS ON EVERY PUBLIC PAGE.
 *
 * =============================================================================
 * WHAT THIS IS, AND WHY IT IS NOT A PAGE BUILDER.
 *
 * The public pages are scroll-linked sequences with parallax, measured spacing
 * and cap-height-trimmed type. Their COPY, though, has always lived in
 * messages/en.json and messages/es.json and been read through next-intl — the
 * components hold no hardcoded sentences. That separation already existed so
 * the site could be bilingual; this screen reuses it so the copy can be
 * edited.
 *
 * The consequence worth stating plainly: editing here changes WORDS and can
 * never change LAYOUT. Nothing typed on this page can break /about.
 *
 * =============================================================================
 * 🔴 THE GUARD IS NOT HERE — `(portal)/admin/layout.tsx` verifies the user and
 * reads the role from the database before anything under /admin renders, with
 * the middleware in front of it. `requireAdmin()` is still called BELOW, and
 * not as belt-and-braces: it is how this page gets an authenticated client to
 * read the current overrides under RLS. A non-admin reaching it gets nothing.
 *
 * `force-dynamic` because the whole point is showing what is saved RIGHT NOW.
 * The public pages this screen edits stay statically generated; the save action
 * revalidates them.
 */
export default async function SiteContentPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const { user } = await getUserAndRole();
  const admin = await requireAdmin();

  /* Both locales in one read — the editor toggles between them client-side, so
     fetching per-language would mean a round trip on every toggle. 565 short
     rows is a few kilobytes. */
  let overrides: Record<"en" | "es", Record<string, string>> = { en: {}, es: {} };
  let loadError: string | null = null;

  if (admin) {
    const { data, error } = await admin.supabase
      .from("content_strings")
      .select("locale, key, value");
    if (error) {
      loadError = error.message;
    } else {
      for (const row of data ?? []) {
        const l = row.locale === "es" ? "es" : "en";
        if (typeof row.key === "string" && typeof row.value === "string") {
          overrides[l][row.key] = row.value;
        }
      }
    }
  }

  return (
    <AdminSubShell locale={locale} userLabel={user?.email ?? ""} current="siteContent">
      <h1 className="font-display text-[clamp(24px,2.6vw,32px)] font-semibold leading-[1.15] text-navy">Site content</h1>
      <p className="mt-2 max-w-[70ch] text-[15px] leading-[1.55] text-ink/80">
        Edit the words on the public website. Changes go live within a few
        seconds — there is no deploy to wait for. Clearing a box puts the
        original text back.
      </p>
      {loadError ? (
        <p className="mt-5 rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-3 text-[14px] text-[#7A2416]" role="alert">
          Could not load saved edits: {loadError}
        </p>
      ) : null}
      <SiteContentEditor
        uiLocale={locale}
        groups={GROUPS}
        strings={EDITABLE_STRINGS}
        overrides={overrides}
        saveAction={saveContentString}
        resetAction={resetContentString}
      />
    </AdminSubShell>
  );
}
