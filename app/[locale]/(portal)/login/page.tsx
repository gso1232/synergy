import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Logo from "@/components/Logo";
import LoginForm from "@/components/admin/LoginForm";

/**
 * /[locale]/login — the split-screen sign-in. ONE page for both admin and
 * agents: role decides where someone lands afterwards, never which form they
 * use, so there is no role selector here and nothing in this UI presumes one.
 *
 * 🔴 IT DOES NOT SIGN ANYONE IN. Phase 1 is design only: no auth, no session,
 * no request. See LoginForm — the fieldset is disabled and there is no handler,
 * so no code path can produce a fake success.
 *
 * `noindex` is inherited from `(portal)/layout.tsx` and reinforced by
 * app/robots.ts. Nothing on the public site links here (see PORTAL_PATHS).
 *
 * LAYOUT: navy panel left, form right, at md+. Below md the panel is REMOVED
 * (not stacked above): on a phone it would push the form under the fold, and a
 * decorative panel is not worth a scroll before the first field.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "login" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "login" });

  return (
    <div className="grid min-h-screen bg-cream md:grid-cols-2">
      {/* LEFT — navy. Gold at FULL strength is legal here and only here:
          #C9A84C on #0D1B2A is 7.61:1. On cream it is 2.09:1 and is banned
          outright, which is why every gold thing on the right-hand side and in
          the admin is gold-deep instead. */}
      <div className="hidden flex-col justify-between bg-navy p-10 md:flex lg:p-14">
        <Logo variant="dark" className="h-14 w-auto" />
        <p className="max-w-[26ch] font-display text-[clamp(24px,2.4vw,34px)] leading-[1.15] text-cream">
          {t("brandLine")}
        </p>
        <Link
          href={`/${locale}`}
          className="text-[14px] text-gold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
        >
          {t("backToSite")}
        </Link>
      </div>

      {/* RIGHT — cream, form centred. */}
      <div className="flex items-center justify-center px-5 py-12 md:px-10">
        <div className="w-full max-w-[400px]">
          <h1 className="font-display text-[clamp(28px,3vw,36px)] leading-[1.1] text-ink">
            {t("heading")}
          </h1>
          <p className="mt-3 text-[15px] leading-[1.55] text-ink/80">{t("subhead")}</p>
          <LoginForm />
          <p className="mt-8 md:hidden">
            <Link
              href={`/${locale}`}
              className="text-[14px] text-gold-deep underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
            >
              {t("backToSite")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
