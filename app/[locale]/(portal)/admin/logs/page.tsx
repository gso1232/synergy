import type { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AdminSubShell from "@/components/admin/AdminSubShell";
import { getUserAndRole } from "@/lib/supabase/auth";
import { getActivityLogs, getLogActors } from "@/lib/cms/activity";
import { ACTIVITY_ACTIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("logs.metaTitle"), robots: { index: false, follow: false } };
}

/** Only a well-formed date reaches the query; anything else is ignored rather
 *  than passed through to Postgres to fail. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * /admin/logs — WHO DID WHAT, WHEN.
 *
 * =============================================================================
 * 🔴 THE FILTERS ARE A GET FORM, NOT CLIENT STATE. A filtered view is therefore
 * a URL: it can be bookmarked, shared with the person asking the question, and
 * reloaded without re-picking four dropdowns. It also means this page needs no
 * JavaScript at all.
 *
 * Every value is validated before it reaches the query — the action against a
 * known list, the dates against a shape, the actor against the profiles the
 * admin can already read. Not because the query is injectable (PostgREST
 * parameterises), but because an unvalidated value produces a confusing empty
 * table instead of an ignored filter.
 *
 * 🔴 THE READ IS ADMIN-ONLY IN POSTGRES. `activity_logs_select_admin` (0007) is
 * what returns these rows; this page's guard is the admin layout above it. An
 * agent who reached this route would see an empty table, not the log — but they
 * cannot reach it, because the layout redirects first.
 *
 * 🔴 IT IS CAPPED AT 500 ROWS AND SAYS SO. The log grows by one row per page
 * view, so an uncapped read eventually times out and takes the whole page with
 * it. A silent cap would read as "that is all there is"; the footer states the
 * ceiling whenever it is hit.
 */
export default async function AdminLogsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { user?: string; action?: string; from?: string; to?: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const { user } = await getUserAndRole();

  const actors = await getLogActors();

  const actionFilter =
    searchParams?.action && (ACTIVITY_ACTIONS as readonly string[]).includes(searchParams.action)
      ? searchParams.action
      : undefined;
  const userFilter =
    searchParams?.user && actors.some((a) => a.id === searchParams.user)
      ? searchParams.user
      : undefined;
  const from = searchParams?.from && DATE_RE.test(searchParams.from) ? searchParams.from : undefined;
  const to = searchParams?.to && DATE_RE.test(searchParams.to) ? searchParams.to : undefined;

  const res = await getActivityLogs({ userId: userFilter, action: actionFilter, from, to });
  const rows = res.ok ? res.rows : [];

  const fmt = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const control =
    "w-full rounded border border-ink/40 bg-white px-3 py-2 text-[14px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep";
  const labelCls = "mb-1 block text-[13px] font-semibold text-ink";

  /** An action label, falling back to the raw stored string. `action` is free
   *  text in the database on purpose (0007), so a value written by a future
   *  feature must render as itself rather than crash a translation lookup. */
  const actionLabel = (a: string) =>
    (ACTIVITY_ACTIONS as readonly string[]).includes(a) ? t(`logs.action.${a}`) : a;

  return (
    <AdminSubShell locale={locale} userLabel={user?.email ?? ""} current="logs">
      <h1 className="font-display text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.15] text-ink">
        {t("logs.heading")}
      </h1>
      <p className="mt-2 max-w-[70ch] text-[15px] leading-[1.55] text-ink/80">{t("logs.intro")}</p>

      {/* ---------- FILTERS ---------- */}
      <form method="get" className="mt-6 rounded-lg border border-ink/20 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="f-user" className={labelCls}>{t("logs.filter.user")}</label>
            <select id="f-user" name="user" defaultValue={userFilter ?? ""} className={control}>
              <option value="">{t("logs.filter.anyUser")}</option>
              {actors.map((a) => (
                <option key={a.id} value={a.id}>{a.email ?? a.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-action" className={labelCls}>{t("logs.filter.action")}</label>
            <select id="f-action" name="action" defaultValue={actionFilter ?? ""} className={control}>
              <option value="">{t("logs.filter.anyAction")}</option>
              {ACTIVITY_ACTIONS.map((a) => (
                <option key={a} value={a}>{t(`logs.action.${a}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-from" className={labelCls}>{t("logs.filter.from")}</label>
            <input id="f-from" name="from" type="date" defaultValue={from ?? ""} className={control} />
          </div>
          <div>
            <label htmlFor="f-to" className={labelCls}>{t("logs.filter.to")}</label>
            <input id="f-to" name="to" type="date" defaultValue={to ?? ""} className={control} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex min-h-[40px] items-center rounded-full bg-navy px-5 text-[14px] font-semibold text-cream transition-colors duration-200 hover:bg-navy-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            {t("logs.filter.apply")}
          </button>
          {/* A link, not a reset button: it clears the URL, which is where the
              filter state actually lives. */}
          <a
            href={`/${locale}/admin/logs`}
            className="inline-flex min-h-[40px] items-center rounded-full border border-ink/40 px-5 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-gold-deep hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            {t("logs.filter.clear")}
          </a>
        </div>
      </form>

      {/* ---------- THE TABLE ---------- */}
      <section aria-labelledby="logs-table" className="mt-8">
        <h2 id="logs-table" className="sr-only">{t("logs.heading")}</h2>

        {!res.ok ? (
          <p role="alert" className="rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-4 text-[14px] text-[#7A2416]">
            {t("logs.loadError")}
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink/25 bg-white px-4 py-4 text-[14px] text-ink/75">
            {t("logs.empty")}
          </p>
        ) : (
          <>
            {/* Wrapped rather than allowed to widen the page: a table that
                overflows the body is the one thing a phone cannot recover from. */}
            <div className="overflow-x-auto rounded-lg border border-ink/20 bg-white">
              <table className="w-full min-w-[46rem] border-collapse text-left">
                <caption className="sr-only">{t("logs.heading")}</caption>
                <thead>
                  <tr className="border-b border-ink/15">
                    {["when", "who", "what", "target", "detail"].map((c) => (
                      <th
                        key={c}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink/70"
                      >
                        {t(`logs.cols.${c}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-ink/10 last:border-0">
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-ink/80">
                        {fmt.format(new Date(r.created_at))}
                      </td>
                      <td className="px-4 py-2.5 text-[14px] text-ink">
                        {/* A deleted account leaves its log lines behind with a
                            null actor (`on delete set null`). Saying so is more
                            honest than a blank cell. */}
                        {r.actor_email ?? (
                          <span className="text-ink/70">{t("logs.deletedUser")}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-[14px] text-ink">
                        {actionLabel(r.action)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-ink/80">
                        {r.target ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-ink/70">
                        {r.metadata
                          ? Object.entries(r.metadata)
                              .map(([k, v]) => `${k}=${String(v)}`)
                              .join(" · ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[13px] text-ink/70">
              {rows.length >= 500 ? t("logs.capped", { count: rows.length }) : t("logs.count", { count: rows.length })}
            </p>
          </>
        )}
      </section>
    </AdminSubShell>
  );
}
