import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/portal/AuthShell";
import ForgotPasswordForm from "@/components/portal/ForgotPasswordForm";
import { LINK } from "@/components/portal/authStyles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "forgot" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "forgot" });

  return (
    <AuthShell
      locale={locale}
      heading={t("heading")}
      subhead={t("subhead")}
      backLabel={t("back")}
    >
      <ForgotPasswordForm locale={locale} />

      <p className="mt-6 text-center text-[14px] text-cream/75">
        <Link href={`/${locale}/login`} className={LINK}>
          {t("backToSignIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
