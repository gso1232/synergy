import type { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AdminShell from "@/components/admin/AdminShell";
import DataTable, { type Row } from "@/components/admin/DataTable";
import {
  MOCK_AGENTS,
  MOCK_CONTENT,
  MOCK_LEADS,
  MOCK_STATS,
} from "@/lib/adminMock";

/**
 * /[locale]/admin — the dashboard. PHASE 1: DESIGN ONLY.
 *
 * 🔴 NO BACKEND OF ANY KIND. No Supabase, no auth, no session, no RLS, no API
 * route, no fetch. Every row comes from lib/adminMock.ts, a hardcoded module
 * imported at build time; the tables sort and filter it in the browser and a
 * reload resets everything. The page says so in a banner, because a dashboard
 * that looks real is exactly the thing someone acts on by mistake.
 *
 * 🔴 THIS PAGE IS NOT PROTECTED. Being unlinked and `noindex` is obscurity, not
 * access control. That is survivable ONLY because there is nothing real behind
 * it. Do not put a genuine lead record here until auth has shipped and been
 * reviewed — real leads are PII and this URL is currently public.
 *
 * ROW ACTIONS RENDER DISABLED. They show what each row will be able to do
 * without any of them doing it. `Edit` on content is flagged furthest out: it
 * means writing MDX to disk or moving content into a database, which is a data
 * path and therefore a later phase.
 *
 * The three sections are ONE page with `#leads` / `#agents` / `#content`
 * headings; the sidebar links to those fragments. /admin/leads does not exist,
 * so nothing links to it.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  /* Product names are read from the `services` namespace — the same approved
     strings /services and /join render — so the admin cannot drift into naming
     the seven products differently. */
  const s = await getTranslations({ locale, namespace: "services" });

  /** One formatter, locale-aware. Dates are never string-concatenated. */
  const fmt = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const date = (iso: string) => fmt.format(new Date(`${iso}T00:00:00`));

  const leadRows: Row[] = MOCK_LEADS.map((l) => ({
    id: l.id,
    filterValue: l.status,
    cells: {
      name: l.name,
      email: l.email,
      phone: l.phone,
      source: t(`leads.source.${l.source}`),
      interest: s(`products.${l.interest}.name`),
      consent:
        [l.sms ? t("leads.consent.sms") : null, l.emailOptIn ? t("leads.consent.email") : null]
          .filter(Boolean)
          .join(" · ") || t("leads.consent.none"),
      status: t(`leads.status.${l.status}`),
      received: date(l.received),
    },
    tones: {
      status:
        l.status === "new" ? "good" : l.status === "closed" ? "neutral" : "warn",
      consent: l.sms || l.emailOptIn ? "neutral" : "stop",
    },
  }));

  const agentRows: Row[] = MOCK_AGENTS.map((a) => ({
    id: a.id,
    filterValue: a.stage,
    cells: {
      name: a.name,
      email: a.email,
      phone: a.phone,
      state: a.state,
      licensed: a.licensed ? t("agents.licensed.yes") : t("agents.licensed.no"),
      heard: a.heard,
      stage: t(`agents.stage.${a.stage}`),
      applied: date(a.applied),
    },
    tones: {
      licensed: a.licensed ? "good" : "warn",
      stage: a.stage === "appointed" ? "good" : "neutral",
    },
  }));

  const contentRows: Row[] = MOCK_CONTENT.map((c) => ({
    id: c.id,
    filterValue: c.compliance,
    cells: {
      title: c.title,
      slug: c.slug,
      type: t(`content.type.${c.type}`),
      locale: c.locales,
      status: t(`content.status.${c.status}`),
      compliance: t(`content.compliance.${c.compliance}`),
      updated: date(c.updated),
    },
    tones: {
      status: c.status === "published" ? "good" : "warn",
      compliance:
        c.compliance === "screened" ? "good" : c.compliance === "blocked" ? "stop" : "warn",
    },
  }));

  const stats = [
    { key: "leads", value: MOCK_STATS.leads },
    { key: "leadsNew", value: MOCK_STATS.leadsNew },
    { key: "apps", value: MOCK_STATS.apps },
    { key: "articles", value: MOCK_STATS.articles },
  ] as const;

  const col = (ns: string, key: string, sortable = true) => ({
    key,
    label: t(`${ns}.cols.${key}`),
    sortable,
  });

  return (
    <AdminShell>
      {/* ONE h1 on the page. The section headings below are h2. */}
      <h1 className="font-display text-[clamp(28px,3vw,38px)] leading-[1.1] text-ink">
        {t("heading")}
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.55] text-ink/80">{t("intro")}</p>

      {/* The banner is not decoration — see the page docblock. */}
      <div className="mt-6 rounded border border-gold-deep/40 bg-[#F6EEDA] p-4">
        <p className="text-[14px] font-semibold text-ink">{t("mockTitle")}</p>
        <p className="mt-1.5 max-w-[70ch] text-[14px] leading-[1.55] text-ink">{t("mockBody")}</p>
      </div>

      {/* ---------- Stat cards ---------- */}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => (
          <li key={st.key} className="rounded border border-ink/15 bg-white p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/70">
              {t(`stats.${st.key}`)}
            </p>
            <p className="mt-2 font-display text-[34px] leading-none text-ink">{st.value}</p>
            <p className="mt-2 text-[12px] text-gold-deep">{t("stats.caption")}</p>
          </li>
        ))}
      </ul>

      {/* ---------- Leads ---------- */}
      <section aria-labelledby="leads" className="mt-12">
        <h2 id="leads" className="font-display text-[24px] leading-[1.15] text-ink">
          {t("leads.heading")}
        </h2>
        <p className="mb-5 mt-2 text-[14px] text-ink/80">{t("leads.note")}</p>
        <DataTable
          caption={t("leads.heading")}
          columns={[
            col("leads", "name"),
            col("leads", "email"),
            col("leads", "phone", false),
            col("leads", "source"),
            col("leads", "interest"),
            col("leads", "consent", false),
            col("leads", "status"),
            col("leads", "received"),
          ]}
          rows={leadRows}
          filters={(["new", "contacted", "qualified", "closed"] as const).map((v) => ({
            value: v,
            label: t(`leads.status.${v}`),
          }))}
          actions={[
            t("leads.actions.view"),
            t("leads.actions.assign"),
            t("leads.actions.status"),
            t("leads.actions.export"),
          ]}
        />
      </section>

      {/* ---------- Agents ---------- */}
      <section aria-labelledby="agents" className="mt-14">
        <h2 id="agents" className="font-display text-[24px] leading-[1.15] text-ink">
          {t("agents.heading")}
        </h2>
        <p className="mb-5 mt-2 text-[14px] text-ink/80">{t("agents.note")}</p>
        <DataTable
          caption={t("agents.heading")}
          columns={[
            col("agents", "name"),
            col("agents", "email"),
            col("agents", "phone", false),
            col("agents", "state"),
            col("agents", "licensed"),
            col("agents", "heard", false),
            col("agents", "stage"),
            col("agents", "applied"),
          ]}
          rows={agentRows}
          filters={(["touch", "meet", "licensed", "appointed"] as const).map((v) => ({
            value: v,
            label: t(`agents.stage.${v}`),
          }))}
          actions={[
            t("agents.actions.view"),
            t("agents.actions.advance"),
            t("agents.actions.mentor"),
            t("agents.actions.archive"),
          ]}
        />
      </section>

      {/* ---------- Content ---------- */}
      <section aria-labelledby="content" className="mt-14">
        <h2 id="content" className="font-display text-[24px] leading-[1.15] text-ink">
          {t("content.heading")}
        </h2>
        <p className="mb-5 mt-2 text-[14px] text-ink/80">{t("content.note")}</p>
        <DataTable
          caption={t("content.heading")}
          columns={[
            col("content", "title"),
            col("content", "slug"),
            col("content", "type"),
            col("content", "locale"),
            col("content", "status"),
            col("content", "compliance"),
            col("content", "updated"),
          ]}
          rows={contentRows}
          filters={(["screened", "pending", "blocked"] as const).map((v) => ({
            value: v,
            label: t(`content.compliance.${v}`),
          }))}
          actions={[
            t("content.actions.view"),
            t("content.actions.preview"),
            t("content.actions.edit"),
          ]}
        />
      </section>
    </AdminShell>
  );
}
