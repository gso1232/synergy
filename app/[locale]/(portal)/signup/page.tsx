import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/portal/AuthShell";
import SignupForm from "@/components/portal/SignupForm";
import { LINK } from "@/components/portal/authStyles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "signup" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/**
 * PUBLIC SIGN-UP. Reachable while logged out, by anyone.
 *
 * 🔴 THE PAGE BEING PUBLIC IS NOT THE RISK — signup/actions.ts is where the
 * controls live, and the database is where they are enforced. This page holds no
 * secrets and grants nothing: submitting it can, at most, cause an `unverified`
 * profile row to exist, which reaches no table and is purged after 24 hours.
 *
 * `noindex` via metadata and app/robots.ts, and it is NOT in routes.ts, so it
 * cannot leak into the footer sitemap. It is linked only from /login.
 */
export default async function SignupPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "signup" });

  return (
    <AuthShell
      locale={locale}
      heading={t("heading")}
      subhead={t("subhead")}
      backLabel={t("back")}
    >
      <SignupForm locale={locale} />

      <p className="mt-6 text-center text-[14px] text-cream/75">
        {t("haveAccount")}{" "}
        <Link href={`/${locale}/login`} className={LINK}>
          {t("signIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
