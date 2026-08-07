import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/portal/AuthShell";
import { getAccountState } from "@/lib/supabase/auth";
import { signOut } from "@/app/[locale]/(portal)/session/actions";
import { NOTE } from "@/components/portal/authStyles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "pending" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/**
 * "AWAITING APPROVAL." Where a verified but unapproved agent lands.
 *
 * =============================================================================
 * 🔴 THIS PAGE READS NO TABLE, AND THAT IS THE POINT OF THE WHOLE 0005 DESIGN.
 *
 * `profiles_select_own` requires `status = 'active'`, so a pending user reads
 * ZERO rows from `profiles` — including their own. That is deliberate: it means
 * a pending JWT pointed straight at PostgREST gets nothing back from anywhere,
 * with no carve-out to reason about.
 *
 * The status shown here comes from `current_account_status()`, a SECURITY
 * DEFINER RPC that takes no arguments and answers only for `auth.uid()`. The
 * most a caller can learn from it is their own status. So the UI can explain
 * what is happening without RLS granting a single row.
 *
 * The session is real and is left alive on purpose — it reaches nothing, and it
 * is what lets this page offer a working sign-out instead of stranding someone
 * on a message they cannot leave.
 * =============================================================================
 *
 * FAIL CLOSED, and note the direction of each redirect:
 *   no user      -> /login          (nothing to show)
 *   active       -> /welcome or /admin (they are past this; do not park them here)
 *   rejected     -> /login          🔴 SILENTLY. Decision 4: rejected users are
 *                                   denied without being told, so this page must
 *                                   never render "you were rejected".
 *   pending/unverified -> render.
 */
export default async function PendingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pending" });

  const { user, role, status } = await getAccountState();

  if (!user) redirect(`/${locale}/login`);
  if (status === "active") redirect(role === "admin" ? `/${locale}/admin` : `/${locale}/welcome`);
  if (status === "rejected" || status === null) redirect(`/${locale}/login`);

  const unverified = status === "unverified";

  return (
    <AuthShell
      locale={locale}
      heading={t("heading")}
      subhead={unverified ? t("subheadUnverified") : t("subhead")}
      backLabel={t("back")}
    >
      <div role="status" className={`mt-6 ${NOTE}`}>
        {unverified ? t("noticeUnverified") : t("notice")}
      </div>

      <p className="mt-6 text-[14px] leading-[1.6] text-cream/75">{t("body")}</p>

      <form action={signOut} className="mt-7">
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center rounded-full border border-cream/40 text-[15px] font-medium text-cream transition-colors duration-200 hover:border-gold hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale motion-reduce:transition-none"
        >
          {t("signOut")}
        </button>
      </form>
    </AuthShell>
  );
}
