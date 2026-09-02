import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AdminSubShell from "@/components/admin/AdminSubShell";
import { getUserAndRole } from "@/lib/supabase/auth";
import { getAllPages } from "@/lib/cms/pages";
import { createPage } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("cms.metaTitle"), robots: { index: false, follow: false } };
}

/**
 * /admin/content — THE CMS PAGE LIST.
 *
 * 🔴 THE GUARD IS NOT HERE. `(portal)/admin/layout.tsx` verifies the user and
 * reads the role from the database before anything under /admin renders, with
 * the middleware in front of it. `getUserAndRole` is React-cached, so reading
 * the identity here to label the shell shares the layout's round trip.
 *
 * 🔴 EVERY ROW IS READ THROUGH RLS. `getAllPages` runs as the logged-in admin,
 * so `pages_select_admin` is what actually returns drafts. A non-admin reaching
 * this function gets zero rows from Postgres, not a filtered list from this file.
 */
export default async function CmsListPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { cmsError?: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const { user } = await getUserAndRole();

  const res = await getAllPages();
  const pages = res.ok ? res.rows : [];
  const titleOf = (id: string | null) => pages.find((p) => p.id === id)?.title ?? null;

  const control =
    "w-full rounded border border-ink/40 bg-white px-3 py-2 text-[14px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep";
  const labelCls = "mb-1 block text-[13px] font-semibold text-ink";

  return (
    <AdminSubShell locale={locale} userLabel={user?.email ?? ""} current="cms">
      <h1 className="font-display text-[clamp(24px,2.6vw,32px)] font-semibold leading-[1.15] text-navy">
        {t("cms.heading")}
      </h1>
      <p className="mt-2 max-w-[70ch] text-[15px] leading-[1.55] text-ink/80">{t("cms.intro")}</p>

      {searchParams?.cmsError ? (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-3 text-[14px] text-[#7A2416]"
        >
          {t(`cms.error.${["forbidden", "invalid"].includes(searchParams.cmsError) ? searchParams.cmsError : "write_failed"}`)}
        </p>
      ) : null}

      {/* ---------- THE PAGES ---------- */}
      <section aria-labelledby="cms-pages" className="mt-8">
        <h2 id="cms-pages" className="font-display text-[18px] font-semibold text-navy">
          {t("cms.pagesHeading")}
        </h2>

        {!res.ok ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-4 text-[14px] text-[#7A2416]"
          >
            {t("cms.loadError")}
          </p>
        ) : pages.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-ink/25 bg-white px-4 py-4 text-[14px] text-ink/75">
            {t("cms.noPages")}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pages.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/${locale}/admin/content/${p.id}`}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-ink/20 bg-white px-4 py-3 transition-colors duration-200 hover:border-gold-deep/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
                >
                  <span className="text-[15px] font-medium text-ink">{p.title}</span>
                  <span className="font-mono text-[12px] text-ink/70">/{p.slug}</span>

                  {/* Status chips. Text, not colour alone — a chip that only
                      differs by hue tells a colour-blind reader nothing. */}
                  <span
                    className={`ml-auto rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${
                      p.is_published
                        ? "border-ink/20 bg-cream text-ink/75"
                        : "border-amber-deep/35 bg-amber/[0.12] text-amber-deep"
                    }`}
                  >
                    {p.is_published ? t("cms.published") : t("cms.draft")}
                  </span>
                  {p.is_password_protected ? (
                    <span className="rounded-full border border-gold-deep/35 bg-gold/[0.10] px-2.5 py-0.5 font-mono text-[11px] text-gold-deep">
                      {t("cms.protected")}
                    </span>
                  ) : null}
                  {p.parent_id ? (
                    <span className="w-full font-mono text-[11px] text-ink/70">
                      {t("cms.childOf", { parent: titleOf(p.parent_id) ?? "—" })}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- NEW PAGE ----------
          🔴 IT CREATES A DRAFT. See `createPage`: a new page is born
          `is_published: false`, so it cannot appear in an agent's nav
          mid-sentence. Publishing is a separate, deliberate act in the editor. */}
      <section aria-labelledby="cms-new" className="mt-10">
        <h2 id="cms-new" className="font-display text-[18px] font-semibold text-navy">
          {t("cms.newHeading")}
        </h2>
        <p className="mt-1 max-w-[70ch] text-[14px] leading-[1.5] text-ink/80">
          {t("cms.newBody")}
        </p>

        <form action={createPage} className="mt-3 rounded-lg border border-ink/20 bg-white p-5">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="np-title" className={labelCls}>{t("cms.field.title")}</label>
              <input id="np-title" name="title" type="text" required className={control} />
            </div>
            <div>
              <label htmlFor="np-slug" className={labelCls}>{t("cms.field.slug")}</label>
              <input
                id="np-slug"
                name="slug"
                type="text"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                aria-describedby="np-slug-hint"
                className={control}
              />
              <p id="np-slug-hint" className="mt-1 text-[13px] text-ink/70">
                {t("cms.field.slugHint")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="np-subtitle" className={labelCls}>{t("cms.field.subtitle")}</label>
              <input id="np-subtitle" name="subtitle" type="text" className={control} />
            </div>
            <div>
              <label htmlFor="np-parent" className={labelCls}>{t("cms.field.parent")}</label>
              <select id="np-parent" name="parent_id" className={control} defaultValue="">
                <option value="">{t("cms.field.noParent")}</option>
                {/* Only top-level pages may be parents — the database enforces
                    one level of nesting (0007's `enforce_page_depth`), so
                    offering a child here would produce a form that always
                    fails. */}
                {pages
                  .filter((p) => !p.parent_id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="np-sort" className={labelCls}>{t("cms.field.sort")}</label>
              <input
                id="np-sort"
                name="sort_order"
                type="number"
                defaultValue={(pages.length + 1) * 10}
                className={control}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-cream transition-colors duration-200 hover:bg-navy-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            {t("cms.createPage")}
          </button>
        </form>
      </section>
    </AdminSubShell>
  );
}
