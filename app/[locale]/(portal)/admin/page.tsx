import type { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getUserAndRole } from "@/lib/supabase/auth";
import { getAgents, getLeads } from "@/lib/admin/data";

// 🔴 Auth-gated + live data: must render per request, never prerendered.
export const dynamic = "force-dynamic";

/**
 * /[locale]/admin — the dashboard, now on REAL data.
 *
 * Every table below is fed by an RLS-scoped query run as the logged-in admin
 * (lib/admin/data.ts). The admin layout has already verified the admin role;
 * the DB policies are the floor under that. Leads are read-only, agents are
 * full CRUD via AgentsManager, and Content is a read-only reflection of repo
 * state (not a table). Each read returns ok/error so we render an HONEST error
 * state instead of an empty table that hides a failed query.
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

  /* 🔴 THE GUARD IS NOT HERE AND MUST NOT BE MOVED HERE. `(portal)/admin/
     layout.tsx` verifies the user and reads the role from the database before
     this page renders, with the middleware in front of it. This page reads the
     identity only to LABEL the shell — `getUserAndRole` is React-cached, so this
     shares the layout's round trip rather than paying for a second one. */
  const { user, role } = await getUserAndRole();

  const [leadsRes, agentsRes] = await Promise.all([getLeads(), getAgents()]);

  /* The view is shared with the development-only design preview
     (`(portal)/admin-preview`), so the two can never drift. It renders what it
     is given and performs no authorisation of its own — see its docblock. */
  return (
    <AdminDashboard
      locale={locale}
      userLabel={user?.email ?? ""}
      role={role}
      leadsRes={leadsRes}
      agentsRes={agentsRes}
    />
  );
}
