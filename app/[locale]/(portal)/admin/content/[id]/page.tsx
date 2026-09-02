import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AdminSubShell from "@/components/admin/AdminSubShell";
import { getUserAndRole } from "@/lib/supabase/auth";
import { getAllPages, getPageDetail } from "@/lib/cms/pages";
import {
  createLink,
  createSection,
  deleteLink,
  deletePage,
  deleteSection,
  moveSection,
  updatePage,
  updateSection,
} from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("cms.metaTitle"), robots: { index: false, follow: false } };
}

const control =
  "w-full rounded border border-ink/40 bg-white px-3 py-2 text-[14px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep";
const labelCls = "mb-1 block text-[13px] font-semibold text-ink";
const btn =
  "inline-flex min-h-[36px] items-center rounded-full border border-ink/40 px-3.5 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-gold-deep hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none";
const btnPrimary =
  "inline-flex min-h-[40px] items-center rounded-full bg-navy px-5 text-[14px] font-semibold text-cream transition-colors duration-200 hover:bg-navy-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none";

/**
 * /admin/content/[id] — THE PAGE EDITOR.
 *
 * =============================================================================
 * 🔴 EVERY CONTROL ON THIS SCREEN IS A `<form action={serverAction}>`, AND NOT
 * ONE OF THEM NEEDS JAVASCRIPT. Add a section, reorder it, delete a link — each
 * is a POST to a server action that re-checks `requireAdmin()` before it writes
 * and lets RLS re-judge the write in Postgres. No client state, no optimistic
 * update, nothing to get out of sync with the database.
 *
 * The cost is a full round trip per edit. That is the right trade for an admin
 * tool used a few times a week by one person, and it is what makes the
 * authorisation story so short: there is no client-side model of who may do
 * what, because there is no client-side model at all.
 *
 * 🔴 THE PASSWORD FIELD IS ALWAYS EMPTY, AND CANNOT BE OTHERWISE. `authenticated`
 * has no SELECT grant on `pages.password` (0007 §5) — not even for an admin —
 * so there is no value to prefill. Leaving it blank keeps the stored password;
 * typing in it replaces the password. `updatePage` documents that rule and is
 * where it is enforced.
 */
export default async function CmsPageEditor({
  params: { locale, id },
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams?: { cmsError?: string; saved?: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const { user } = await getUserAndRole();

  const detail = await getPageDetail(id);
  if (!detail) notFound();

  const { page, sections } = detail;
  const all = await getAllPages();
  const parents = (all.ok ? all.rows : []).filter((p) => !p.parent_id && p.id !== page.id);

  return (
    <AdminSubShell locale={locale} userLabel={user?.email ?? ""} current="cms">
      <p className="text-[13px]">
        <Link
          href={`/${locale}/admin/content`}
          className="text-ink/70 underline decoration-ink/25 underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          ← {t("cms.backToList")}
        </Link>
      </p>

      <h1 className="mt-2 font-display text-[clamp(24px,2.6vw,32px)] font-semibold leading-[1.15] text-navy">
        {page.title}
      </h1>
      <p className="mt-1 font-mono text-[12px] text-ink/70">
        /{locale}/agents/{page.slug}
        {/* A live link, so Aiman can check the rendered page. The agents layout
            deliberately does NOT bounce an admin away — see its docblock. */}
        {" · "}
        <Link
          href={`/${locale}/agents/${page.slug}`}
          className="underline decoration-ink/25 underline-offset-4 hover:text-ink"
        >
          {t("cms.viewLive")}
        </Link>
      </p>

      {searchParams?.saved ? (
        <p role="status" className="mt-5 rounded-lg border border-navy/25 bg-[#EEF3F8] px-4 py-3 text-[14px] text-navy">
          {t("cms.saved")}
        </p>
      ) : null}
      {searchParams?.cmsError ? (
        <p role="alert" className="mt-5 rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-3 text-[14px] text-[#7A2416]">
          {t(`cms.error.${["forbidden", "invalid"].includes(searchParams.cmsError) ? searchParams.cmsError : "write_failed"}`)}
        </p>
      ) : null}

      {/* ================= PAGE SETTINGS ================= */}
      <section aria-labelledby="cms-settings" className="mt-8">
        <h2 id="cms-settings" className="font-display text-[18px] font-semibold text-navy">
          {t("cms.settingsHeading")}
        </h2>

        <form action={updatePage} className="mt-3 rounded-lg border border-ink/20 bg-white p-5">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={page.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ep-title" className={labelCls}>{t("cms.field.title")}</label>
              <input id="ep-title" name="title" type="text" required defaultValue={page.title} className={control} />
            </div>
            <div>
              <label htmlFor="ep-slug" className={labelCls}>{t("cms.field.slug")}</label>
              <input
                id="ep-slug"
                name="slug"
                type="text"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                defaultValue={page.slug}
                aria-describedby="ep-slug-hint"
                className={control}
              />
              {/* 🔴 STATED, BECAUSE IT IS THE ONE EDIT HERE WITH A CONSEQUENCE
                  OUTSIDE THIS PAGE. Changing a slug changes the URL: existing
                  bookmarks and any internal link pointing at the old one break,
                  silently, and there is no redirect table behind this. */}
              <p id="ep-slug-hint" className="mt-1 text-[13px] text-amber-deep">
                {t("cms.field.slugWarning")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ep-subtitle" className={labelCls}>{t("cms.field.subtitle")}</label>
              <input id="ep-subtitle" name="subtitle" type="text" defaultValue={page.subtitle ?? ""} className={control} />
            </div>
            <div>
              <label htmlFor="ep-parent" className={labelCls}>{t("cms.field.parent")}</label>
              <select id="ep-parent" name="parent_id" defaultValue={page.parent_id ?? ""} className={control}>
                <option value="">{t("cms.field.noParent")}</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ep-sort" className={labelCls}>{t("cms.field.sort")}</label>
              <input id="ep-sort" name="sort_order" type="number" defaultValue={page.sort_order} className={control} />
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-ink/15 pt-5">
            <label className="flex items-start gap-2.5 text-[14px] text-ink">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={page.is_published}
                className="mt-0.5 h-4 w-4 accent-[#0066CC]"
              />
              <span>
                {t("cms.field.published")}
                <span className="block text-[13px] text-ink/70">{t("cms.field.publishedHint")}</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-[14px] text-ink">
              <input
                type="checkbox"
                name="is_password_protected"
                defaultChecked={page.is_password_protected}
                className="mt-0.5 h-4 w-4 accent-[#0066CC]"
              />
              <span>
                {t("cms.field.protected")}
                <span className="block text-[13px] text-ink/70">{t("cms.field.protectedHint")}</span>
              </span>
            </label>

            <div className="max-w-[24rem]">
              <label htmlFor="ep-password" className={labelCls}>{t("cms.field.password")}</label>
              <input
                id="ep-password"
                name="password"
                type="text"
                autoComplete="off"
                placeholder={page.is_password_protected ? t("cms.field.passwordSet") : ""}
                aria-describedby="ep-password-hint"
                className={control}
              />
              {/* 🔴 `type="text"`, NOT `type="password"`, AND THAT IS DELIBERATE.
                  This is not the admin's own credential — it is a shared value
                  they are about to read out to a room of agents. Masking it
                  would hide a typo in the one field where a typo locks everyone
                  out, and browsers offer to save masked fields as the admin's
                  own password. */}
              <p id="ep-password-hint" className="mt-1 text-[13px] text-ink/70">
                {t("cms.field.passwordHint")}
              </p>
            </div>
          </div>

          <button type="submit" className={`${btnPrimary} mt-5`}>{t("cms.savePage")}</button>
        </form>
      </section>

      {/* ================= SECTIONS ================= */}
      <section aria-labelledby="cms-sections" className="mt-10">
        <h2 id="cms-sections" className="font-display text-[18px] font-semibold text-navy">
          {t("cms.sectionsHeading")}
        </h2>
        <p className="mt-1 max-w-[70ch] text-[14px] leading-[1.5] text-ink/80">
          {t("cms.sectionsIntro")}
        </p>

        {sections.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-ink/25 bg-white px-4 py-4 text-[14px] text-ink/75">
            {t("cms.noSections")}
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {sections.map((s, i) => (
              <li
                key={s.id}
                id={`section-${s.id}`}
                className="rounded-lg border border-ink/20 bg-white p-5 [scroll-margin-top:120px]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
                    {s.step_number ? `${t("cms.step")} ${s.step_number}` : t("cms.block")}
                  </p>

                  {/* Reorder + delete. Separate forms, because a nested form is
                      invalid HTML and the section editor below is itself one. */}
                  <div className="flex flex-wrap gap-2">
                    <form action={moveSection}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="page_id" value={page.id} />
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button type="submit" className={btn} disabled={i === 0} aria-label={t("cms.moveUp")}>
                        ↑
                      </button>
                    </form>
                    <form action={moveSection}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="page_id" value={page.id} />
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button
                        type="submit"
                        className={btn}
                        disabled={i === sections.length - 1}
                        aria-label={t("cms.moveDown")}
                      >
                        ↓
                      </button>
                    </form>
                    <form action={deleteSection}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="page_id" value={page.id} />
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className={`${btn} border-[#8A2A1A]/45 text-[#7A2416] hover:border-[#8A2A1A] hover:text-[#7A2416]`}
                      >
                        {t("cms.deleteSection")}
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updateSection} className="mt-4">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="page_id" value={page.id} />
                  <input type="hidden" name="id" value={s.id} />

                  <div className="grid gap-4 sm:grid-cols-[7rem_1fr]">
                    <div>
                      <label htmlFor={`s-step-${s.id}`} className={labelCls}>{t("cms.field.step")}</label>
                      <input
                        id={`s-step-${s.id}`}
                        name="step_number"
                        type="text"
                        defaultValue={s.step_number ?? ""}
                        aria-describedby={`s-step-hint-${s.id}`}
                        className={control}
                      />
                      <p id={`s-step-hint-${s.id}`} className="mt-1 text-[13px] text-ink/70">
                        {t("cms.field.stepHint")}
                      </p>
                    </div>
                    <div>
                      <label htmlFor={`s-head-${s.id}`} className={labelCls}>{t("cms.field.heading")}</label>
                      <input
                        id={`s-head-${s.id}`}
                        name="heading"
                        type="text"
                        defaultValue={s.heading ?? ""}
                        className={control}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor={`s-body-${s.id}`} className={labelCls}>{t("cms.field.body")}</label>
                    <textarea
                      id={`s-body-${s.id}`}
                      name="body"
                      rows={8}
                      defaultValue={s.body ?? ""}
                      aria-describedby={`s-body-hint-${s.id}`}
                      className={`${control} font-mono text-[13px] leading-[1.6]`}
                    />
                    <p id={`s-body-hint-${s.id}`} className="mt-1 max-w-[70ch] text-[13px] leading-[1.5] text-ink/70">
                      {t("cms.field.bodyHint")}
                    </p>
                  </div>

                  <button type="submit" className={`${btnPrimary} mt-4`}>{t("cms.saveSection")}</button>
                </form>

                {/* ---- links on this section ---- */}
                <div className="mt-5 border-t border-ink/15 pt-4">
                  <h3 className="text-[13px] font-semibold text-navy">{t("cms.linksHeading")}</h3>

                  {s.links.length === 0 ? (
                    <p className="mt-2 text-[13px] text-ink/70">{t("cms.noLinks")}</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {s.links.map((l) => (
                        <li key={l.id} className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] text-ink">{l.label}</span>
                          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink/70">
                            {l.url}
                          </span>
                          <form action={deleteLink}>
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="page_id" value={page.id} />
                            <input type="hidden" name="id" value={l.id} />
                            <button
                              type="submit"
                              className="min-h-[32px] rounded-full border border-[#8A2A1A]/45 px-3 text-[12px] font-medium text-[#7A2416] hover:border-[#8A2A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
                            >
                              {t("cms.deleteLink")}
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form action={createLink} className="mt-3 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="page_id" value={page.id} />
                    <input type="hidden" name="section_id" value={s.id} />
                    <div className="min-w-[12rem] flex-1">
                      <label htmlFor={`l-label-${s.id}`} className={labelCls}>{t("cms.field.linkLabel")}</label>
                      <input id={`l-label-${s.id}`} name="label" type="text" required className={control} />
                    </div>
                    <div className="min-w-[14rem] flex-[2]">
                      <label htmlFor={`l-url-${s.id}`} className={labelCls}>{t("cms.field.linkUrl")}</label>
                      <input
                        id={`l-url-${s.id}`}
                        name="url"
                        type="text"
                        required
                        pattern="(https?://|/).*"
                        aria-describedby={`l-url-hint-${s.id}`}
                        className={control}
                      />
                      <p id={`l-url-hint-${s.id}`} className="mt-1 text-[13px] text-ink/70">
                        {t("cms.field.linkUrlHint")}
                      </p>
                    </div>
                    <button type="submit" className={btn}>{t("cms.addLink")}</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ---- new section ---- */}
        <form action={createSection} className="mt-6 rounded-lg border border-dashed border-ink/30 bg-white p-5">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="page_id" value={page.id} />
          <h3 className="font-display text-[16px] font-semibold text-navy">{t("cms.addSectionHeading")}</h3>

          <div className="mt-3 grid gap-4 sm:grid-cols-[7rem_1fr]">
            <div>
              <label htmlFor="ns-step" className={labelCls}>{t("cms.field.step")}</label>
              <input id="ns-step" name="step_number" type="text" className={control} />
            </div>
            <div>
              <label htmlFor="ns-head" className={labelCls}>{t("cms.field.heading")}</label>
              <input id="ns-head" name="heading" type="text" className={control} />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="ns-body" className={labelCls}>{t("cms.field.body")}</label>
            <textarea id="ns-body" name="body" rows={5} className={`${control} font-mono text-[13px] leading-[1.6]`} />
          </div>

          <button type="submit" className={`${btnPrimary} mt-4`}>{t("cms.addSection")}</button>
        </form>
      </section>

      {/* ================= DANGER ZONE ================= */}
      <section aria-labelledby="cms-delete" className="mt-12 border-t border-ink/15 pt-6">
        <h2 id="cms-delete" className="font-display text-[18px] font-semibold text-navy">
          {t("cms.deleteHeading")}
        </h2>
        {/* 🔴 NO CONFIRMATION DIALOG, AND THE WARNING SAYS SO. `confirm()` needs
            JavaScript, and every other control here works without it — a
            "safety" that is present only sometimes is worse than one that is
            honestly absent. The mitigation offered instead is the real one:
            unpublish rather than delete. */}
        <p className="mt-1 max-w-[70ch] text-[14px] leading-[1.5] text-amber-deep">
          {t("cms.deleteWarning", { count: sections.length })}
        </p>
        <form action={deletePage} className="mt-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={page.id} />
          <button
            type="submit"
            className="inline-flex min-h-[40px] items-center rounded-full border border-[#8A2A1A]/50 px-5 text-[14px] font-semibold text-[#7A2416] transition-colors duration-200 hover:border-[#8A2A1A] hover:bg-[#FBEBE7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            {t("cms.deletePage")}
          </button>
        </form>
      </section>
    </AdminSubShell>
  );
}
