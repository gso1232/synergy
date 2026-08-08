import { getTranslations } from "next-intl/server";
/* 🔴 AdminTopShell REPLACES AdminShell (nav moved to a top bar, on instruction).
   `AdminShell` — the collapsible left rail with its focus-trapped mobile drawer
   — is RETIRED, NOT DELETED: it is still in the tree, unused, so restoring the
   rail is swapping this one import back. Same convention this project applies to
   every superseded treatment. */
import AdminTopShell from "@/components/admin/AdminTopShell";
import AdminCard from "@/components/admin/AdminCard";
import AgentsManager from "@/components/admin/AgentsManager";
import StatRow from "@/components/admin/StatRow";
import DataTable, { type Row } from "@/components/admin/DataTable";
import ApprovalsQueue from "@/components/admin/ApprovalsQueue";
import CreateAccountForm from "@/components/admin/CreateAccountForm";
import { getContent, type ReadResult } from "@/lib/admin/data";
import type { Agent, Application, AppRole, Lead, Profile } from "@/lib/types";

/** Which `interest` values are product keys rather than free text. Moved here
 *  with the leads table; identical set to the one the admin page held. */
const PRODUCT_KEYS = new Set(["p1", "p2", "p3", "p4", "p5", "p6", "p7"]);

/**
 * THE ADMIN DASHBOARD'S BODY — presentation only, no data fetching, no auth.
 *
 * =============================================================================
 * 🔴 WHY THIS WAS EXTRACTED, AND WHAT IT DELIBERATELY DOES NOT DO.
 *
 * It was the body of `(portal)/admin/page.tsx`. It moved here so TWO routes can
 * render the identical UI:
 *
 *   (portal)/admin           real data, behind the auth guard
 *   (portal)/admin-preview   mock data, development only, no auth
 *
 * The alternative was to copy the JSX into the preview, which would have drifted
 * from the real dashboard the first time either changed — a design preview that
 * shows a stale design is worse than none.
 *
 * 🔴 THIS COMPONENT PERFORMS NO AUTHORISATION AND MUST NEVER BE GIVEN ANY.
 * It takes already-fetched data and renders it. The security boundary is, and
 * stays, `(portal)/admin/layout.tsx` (verified user + DB role === 'admin') with
 * the middleware in front of it. Extracting the view changed neither. If a
 * future route renders this component, THAT route is responsible for deciding
 * who may see it — exactly as the two routes above each do in their own way.
 *
 * It also does not FETCH. Both callers pass `ReadResult`s in, so the preview can
 * hand over fixtures without a database and the real page keeps its RLS-scoped
 * reads. That separation is what makes the preview safe: it cannot accidentally
 * read a real row, because it has no client to read one with.
 */
export default async function AdminDashboard({
  locale,
  userLabel,
  role,
  leadsRes,
  agentsRes,
  profilesRes,
  applicationsRes,
  currentUserId,
  accountError,
  created,
  createError,
}: {
  locale: string;
  userLabel: string;
  role: AppRole | null;
  leadsRes: ReadResult<Lead>;
  agentsRes: ReadResult<Agent>;
  /* Optional so (portal)/admin-preview — which hands over fixtures and has no
     Supabase client at all — keeps compiling without inventing fake accounts.
     Absent means the section is not rendered, never that it is empty. */
  profilesRes?: ReadResult<Profile>;
  /* Same optionality reasoning as profilesRes: the design-preview route has no
     Supabase client, and a table of fixture APPLICATIONS is exactly the kind of
     thing someone later mistakes for a real recruiting pipeline. */
  applicationsRes?: ReadResult<Application>;
  currentUserId?: string;
  /** Set by a failed approve/reject/delete redirect. Coarse code only. */
  accountError?: string;
  /** Set by a SUCCESSFUL invite redirect — the address the setup link went to. */
  created?: string;
  /** Set by a failed invite redirect. Separate channel from accountError so the
   *  two banners cannot be confused for one another. */
  createError?: string;
}) {
  const t = await getTranslations({ locale, namespace: "admin" });
  /* Product NAMES are read from the `services` namespace, not restated here, so
     a lead's `interest` renders the same string /services publishes. This is the
     same lookup the retired LeadsExplorer detail pane did. */
  const s = await getTranslations({ locale, namespace: "services" });
  const userRole = t(role === "admin" ? "roleAdmin" : "roleAgent");
  const content = getContent(locale);

  const fmt = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const leads = leadsRes.ok ? leadsRes.rows : [];
  const agents = agentsRes.ok ? agentsRes.rows : [];

  /* ---- Stat figures. EVERY ONE is a filter over rows already passed in; no new
     query, no derived estimate, nothing that is not a stored column.
     Deliberately dataset-scoped rather than detail-scoped like the reference —
     see StatRow's docblock. ---- */
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const leadStats = [
    { key: "leadsTotal", label: t("stats.leadsTotal"), value: leads.length },
    { key: "leadsNew", label: t("stats.leadsNew"), value: leads.filter((l) => l.status === "new").length },
    {
      key: "leadsWeek",
      label: t("stats.leadsWeek"),
      value: leads.filter((l) => new Date(l.received_at).getTime() >= weekAgo).length,
    },
    {
      key: "leadsContactable",
      label: t("stats.leadsContactable"),
      value: leads.filter((l) => l.sms_consent || l.email_optin).length,
    },
  ];

  const agentStats = [
    { key: "agentsTotal", label: t("stats.agentsTotal"), value: agents.length },
    { key: "agentsActive", label: t("stats.agentsActive"), value: agents.filter((a) => a.active).length },
    { key: "agentsLicensed", label: t("stats.agentsLicensed"), value: agents.filter((a) => a.licensed).length },
    {
      key: "agentsPipeline",
      label: t("stats.agentsPipeline"),
      value: agents.filter((a) => a.active && (a.stage === "touch" || a.stage === "meet")).length,
    },
  ];

  /** The mono meta line in each card header: section · date · timezone note. */
  const today = fmt.format(new Date());
  const metaLine = (section: string) =>
    `${section} · ${today} · ${t("card.serverTime")}`.toUpperCase();

  /* 🔴 LEADS IS A FULL-WIDTH TABLE NOW. `LeadsExplorer` — the 260px selector
     column plus detail pane — is RETIRED (still in the tree, unused). Removing
     only the left column would have left the detail with nothing to drive it, so
     on instruction the whole master/detail is replaced by the same plain
     DataTable that Agents and Content already use. The dashboard now reads as
     one consistent surface rather than one card behaving differently.

     🔴 THIS IS A PRESENTATION CHANGE ONLY. `getLeads()` is untouched and every
     field below is read straight off the row it already returned — `sms_consent`
     and `email_optin` are the real column names, collapsed into ONE displayed
     "Consent" cell rather than being renamed or recomputed. No lead data is
     dropped from the query; the detail pane's fields that have no column here
     (interest is kept; nothing else existed) remain available the moment a
     detail view is wanted back. */
  const leadRows: Row[] = leads.map((l) => ({
    id: l.id,
    cells: {
      name: l.name,
      email: l.email,
      phone: l.phone ?? "—",
      source: t(`leads.source.${l.source}`),
      interest: PRODUCT_KEYS.has(l.interest ?? "")
        ? s(`products.${l.interest}.name`)
        : (l.interest ?? "—"),
      /* The existing `leads.consent.*` strings are reused rather than
         hard-coding "SMS"/"Email" — they are already translated in both
         locales and were written for exactly these two flags. */
      consent:
        l.sms_consent || l.email_optin
          ? [
              l.sms_consent ? t("leads.consent.sms") : null,
              l.email_optin ? t("leads.consent.email") : null,
            ]
              .filter(Boolean)
              .join(" · ")
          : t("leads.consent.none"),
      status: t(`leads.status.${l.status}`),
      received: fmt.format(new Date(l.received_at)),
    },
    /* Built conditionally: `tones` types its values as a fixed union, so an
       explicit `undefined` would not typecheck. */
    ...(l.status === "new"
      ? { tones: { status: "good" as const } }
      : l.status === "closed"
        ? { tones: { status: "warn" as const } }
        : {}),
  }));

  const contentRows: Row[] = content.map((c) => ({
    id: c.id,
    cells: {
      title: c.title,
      slug: c.slug,
      type: t(`content.type.${c.type}`),
      status: t(`content.status.${c.status}`),
    },
    tones: { status: c.status === "published" ? "good" : "warn" },
  }));

  /* 🔴 APPLICATIONS — /join submissions. Read-only by design: 0003 grants the
     admin SELECT and nothing else, so there is no update path to render and no
     ApplicationInput type to build a form from. `consent` is shown as a plain
     yes/no because it is a legal record of what the applicant agreed to, not a
     status to be styled. */
  const applications = applicationsRes?.ok ? applicationsRes.rows : [];
  const applicationRows: Row[] = applications.map((a) => ({
    id: a.id,
    cells: {
      name: `${a.first_name} ${a.last_name}`.trim(),
      email: a.email,
      phone: a.phone,
      state: a.state,
      licensed: a.licensed ? t("applications.yes") : t("applications.no"),
      heard: a.heard ? t(`applications.heard.${a.heard}`) : "—",
      consent: a.consent ? t("applications.yes") : t("applications.no"),
      received: fmt.format(new Date(a.received_at)),
    },
    tones: { licensed: a.licensed ? ("good" as const) : ("warn" as const) },
  }));

  const col = (ns: string, key: string, sortable = true) => ({
    key,
    label: t(`${ns}.cols.${key}`),
    sortable,
  });

  return (
    <AdminTopShell locale={locale} userLabel={userLabel} userRole={userRole}>
      {/* 🔴 THE h1 STEPS DOWN VISUALLY SO THE GREETING CAN LEAD — the heading
          LEVEL is unchanged. "Dashboard" still names the page for the document
          outline and for a screen reader's heading list; it just stops competing
          with the greeting above it, which is a <p> precisely so the outline
          stays correct. Was clamp(28→38px) display; now a 15→17px label.
          ink/62 on the page scrim's worst pixel measures 5.9 against 4.5. */}
      <h1 className="mt-1.5 text-[clamp(15px,1.2vw,17px)] font-semibold leading-[1.3] tracking-[0.01em] text-ink/[0.62]">
        {t("heading")}
      </h1>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.55] text-ink/80">{t("intro")}</p>

      {/* ---------- LEADS — card + selector + detail + stats ----------
          The h1 above stays OUTSIDE the card, as in the reference; the
          letterspaced section name lives in the card header. */}
      <section aria-labelledby="leads" className="mt-10">
        <h2 id="leads" className="sr-only">
          {t("leads.heading")}
        </h2>
        <AdminCard
          title={t("leads.heading")}
          meta={metaLine(t("leads.heading"))}
          statusLabel={t("card.records")}
          statusValue={String(leads.length)}
        >
          {!leadsRes.ok ? (
            <p
              role="alert"
              className="rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-4 text-[14px] text-[#7A2416]"
            >
              {t("leads.loadError")}
            </p>
          ) : (
            <>
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
              />
              <StatRow stats={leadStats} />
            </>
          )}
        </AdminCard>
      </section>

      {/* ---------- ACCOUNTS / APPROVALS — FIRST, AND THAT IS THE POINT.
          It sits above leads and agents because it is the only section holding a
          decision that BLOCKS a real person: an agent who signed up cannot reach
          anything until someone here says yes. Leads and agents are records to
          review; this is a queue with people waiting in it, and a queue put
          third is a queue read last.

          🔴 IT RENDERS ONLY WHEN THE PAGE SUPPLIED DATA. The design preview
          route passes no `profilesRes`, and an approvals table filled with
          fixture accounts is exactly the kind of thing someone later mistakes
          for real. Absent means absent. */}
      {/* ---------- CREATE AN AGENT — ABOVE THE QUEUE, DELIBERATELY.
          Public signup was removed on 2026-08-08, so this form is the ONLY way
          an account comes into existence. It sits above the approvals queue
          because it is now the primary action on this page, not a secondary
          one: the queue handles people who are already in the system, this
          creates them. Gated on `profilesRes` for the same reason the queue is
          — the design-preview route has no Supabase client, and a live create
          form on a fixture page would mint real accounts from mock data. */}
      {profilesRes ? (
        <section aria-labelledby="create-account" className="mt-8">
          <h2 id="create-account" className="sr-only">
            {t("createAccount.heading")}
          </h2>
          <AdminCard
            title={t("createAccount.heading")}
            meta={metaLine(t("createAccount.heading"))}
            statusLabel={t("accounts.heading")}
            statusValue={String(profilesRes.ok ? profilesRes.rows.length : 0)}
          >
            <CreateAccountForm locale={locale} />
          </AdminCard>
        </section>
      ) : null}

      {profilesRes ? (
        <section aria-labelledby="accounts" className="mt-8">
          <h2 id="accounts" className="sr-only">
            {t("accounts.heading")}
          </h2>
          <AdminCard
            title={t("accounts.heading")}
            meta={metaLine(t("accounts.heading"))}
            statusLabel={t("accounts.awaiting")}
            statusValue={String(
              profilesRes.ok
                ? profilesRes.rows.filter((p) => p.status === "pending").length
                : 0,
            )}
          >
            {accountError ? (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-3 text-[14px] text-[#7A2416]"
              >
                {t(`accounts.error.${accountError === "forbidden" || accountError === "invalid" ? accountError : "write_failed"}`)}
              </p>
            ) : null}

            {!profilesRes.ok ? (
              <p
                role="alert"
                className="rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-4 text-[14px] text-[#7A2416]"
              >
                {t("accounts.loadError")}
              </p>
            ) : (
              <ApprovalsQueue
                profiles={profilesRes.rows}
                locale={locale}
                currentUserId={currentUserId ?? ""}
              />
            )}
          </AdminCard>
        </section>
      ) : null}

      {/* ---------- AGENTS — card + plain table + stats ----------
          No master/detail here on purpose: the create/edit form already owns
          the right-hand pane and two editors would compete. */}
      <section aria-labelledby="agents" className="mt-8">
        <h2 id="agents" className="sr-only">
          {t("agents.heading")}
        </h2>
        <AdminCard
          title={t("agents.heading")}
          meta={metaLine(t("agents.heading"))}
          statusLabel={t("card.records")}
          statusValue={String(agents.length)}
        >
          {!agentsRes.ok ? (
            <p
              role="alert"
              className="rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-4 text-[14px] text-[#7A2416]"
            >
              {t("agents.loadError")}
            </p>
          ) : (
            <>
              <AgentsManager agents={agents} locale={locale} />
              <StatRow stats={agentStats} />
            </>
          )}
        </AdminCard>
      </section>

      {/* ---------- APPLICATIONS — /join submissions, read-only ----------
          🔴 IT SITS BETWEEN AGENTS AND CONTENT because it is the RECRUITING
          pipeline: a person who applied but is not yet an agent. It is NOT a
          lead — no lead form is wired, and the consent wording for lead capture
          is still owed by the client.

          Read-only, and that is enforced below the UI: 0003 gives the admin
          SELECT and NOTHING else, and rows are written only by the /join server
          action's service-role client. There is no edit control to add. */}
      {applicationsRes ? (
        <section aria-labelledby="applications" className="mt-8">
          <h2 id="applications" className="sr-only">
            {t("applications.heading")}
          </h2>
          <AdminCard
            title={t("applications.heading")}
            meta={metaLine(t("applications.heading"))}
            statusLabel={t("card.records")}
            statusValue={String(applications.length)}
          >
            {!applicationsRes.ok ? (
              <p
                role="alert"
                className="rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-4 text-[14px] text-[#7A2416]"
              >
                {t("applications.loadError")}
              </p>
            ) : (
              <DataTable
                caption={t("applications.heading")}
                columns={[
                  col("applications", "name"),
                  col("applications", "email"),
                  col("applications", "phone", false),
                  col("applications", "state"),
                  col("applications", "licensed"),
                  col("applications", "heard"),
                  col("applications", "consent", false),
                  col("applications", "received"),
                ]}
                rows={applicationRows}
              />
            )}
          </AdminCard>
        </section>
      ) : null}

      {/* ---------- CONTENT — card + plain table, no stat row ----------
          Four read-only columns and nothing to detail; its one real figure
          (articles published) would only duplicate what is already countable. */}
      <section aria-labelledby="content" className="mt-8">
        <h2 id="content" className="sr-only">
          {t("content.heading")}
        </h2>
        <AdminCard
          title={t("content.heading")}
          meta={metaLine(t("content.heading"))}
          statusLabel={t("card.records")}
          statusValue={String(content.length)}
        >
          <p className="mb-5 text-[14px] leading-[1.5] text-ink/80">{t("content.note")}</p>
          <DataTable
            caption={t("content.heading")}
            columns={[
              col("content", "title"),
              col("content", "slug"),
              col("content", "type"),
              col("content", "status"),
            ]}
            rows={contentRows}
          />
        </AdminCard>
      </section>
    </AdminTopShell>
  );
}
