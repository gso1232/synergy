import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/portal/AuthShell";
import ResetPasswordForm from "@/components/portal/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "reset" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/**
 * SET A NEW PASSWORD. Reached only from /auth/callback?next=reset, which has
 * already exchanged the emailed code for a recovery session.
 *
 * 🔴 THE GUARD IS "IS THERE A SESSION AT ALL", NOT A ROLE OR STATUS CHECK, AND
 * THAT IS CORRECT HERE. A `pending` or even `rejected` user must be able to
 * change their own password — refusing would mean an unapproved agent who
 * mistypes their password at signup can never recover, and it would make this
 * page a status oracle for anyone holding a recovery link.
 *
 * Letting them through costs nothing, because a password change grants nothing:
 * the action signs the session out immediately afterwards, and the next sign-in
 * runs every gate (domain, confirmed email, account status). RLS is underneath
 * all of it — a pending recovery session already reads zero rows.
 *
 * No session means the link was never exchanged, was already used, or expired.
 * Bounce to /login rather than render a form that cannot work.
 */
export default async function ResetPasswordPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "reset" });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login?reset=expired`);

  return (
    <AuthShell
      locale={locale}
      heading={t("heading")}
      subhead={t("subhead")}
      backLabel={t("back")}
    >
      <ResetPasswordForm locale={locale} />
    </AuthShell>
  );
}
