import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AgentPortal from "@/components/portal/AgentPortal";
import { getAccountState } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "portal" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/**
 * WHERE AN APPROVED AGENT LANDS — now the portal itself.
 *
 * 🔴 IT WAS AN HONEST EMPTY WELCOME, AND THAT WAS RIGHT AT THE TIME. The
 * previous version was a single `AuthShell` card saying training and resources
 * were being prepared, with a deliberate note refusing to link to a courses area
 * that did not exist. The content exists now, so the card is replaced rather
 * than decorated: the licensing and contracting checklists, the carrier
 * contacts, and clearly-marked gaps where Synergy still owes an operational
 * detail. The rule the old file stated still holds — nothing here pretends to
 * be a resource that is not one, which is why the gaps are drawn as gaps.
 *
 * THE GUARD IS UNCHANGED, and it is the same shape as the admin layout's:
 *
 *   no user            -> /login
 *   not active         -> /pending  (which re-checks and can bounce on)
 *   admin              -> /admin    (they have their own destination)
 *   active agent       -> render
 *
 * It is not the security boundary — RLS is, and this page reads no agent data
 * at all — but it stops a pending user seeing a page that assumes an approved
 * account. `AuthShell` is no longer imported here; it still serves the five auth
 * screens and is untouched.
 */
export default async function WelcomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  const { user, role, status } = await getAccountState();

  if (!user) redirect(`/${locale}/login`);
  if (status !== "active") redirect(`/${locale}/pending`);
  if (role === "admin") redirect(`/${locale}/admin`);

  return <AgentPortal locale={locale} email={user.email ?? ""} />;
}
