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
  const t = await getTranslations({ locale, namespace: "welcome" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/**
 * WHERE AN APPROVED AGENT LANDS.
 *
 * 🔴 IT IS DELIBERATELY A WELCOME PAGE AND NOT A PORTAL. The agent courses area
 * comes later, when Aiman supplies the content; this is the landing it will grow
 * into, so an approved agent has somewhere real to arrive instead of being
 * bounced to the public site (which is what login/actions.ts did before 0005,
 * and which it flagged as an open decision). NOTHING is built here that pretends
 * to be a course, a resource or a document — an empty shell that looks like a
 * portal is worse than an honest welcome.
 *
 * THE GUARD IS THE SAME SHAPE AS THE ADMIN LAYOUT'S and fails closed the same
 * way. It is not the security boundary — RLS is, and this page reads nothing
 * anyway — but it stops a pending user from seeing a page that says their
 * account is active.
 *
 *   no user            -> /login
 *   not active         -> /pending  (which itself re-checks and can bounce on)
 *   admin              -> /admin    (they have a real destination)
 *   active agent       -> render
 */
export default async function WelcomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "welcome" });

  const { user, role, status } = await getAccountState();

  if (!user) redirect(`/${locale}/login`);
  if (status !== "active") redirect(`/${locale}/pending`);
  if (role === "admin") redirect(`/${locale}/admin`);

  return (
    <AuthShell
      locale={locale}
      heading={t("heading")}
      subhead={t("subhead")}
      backLabel={t("back")}
    >
      <div role="status" className={`mt-6 ${NOTE}`}>
        {t("active")}
      </div>

      <p className="mt-6 text-[14px] leading-[1.6] text-cream/75">{t("body")}</p>

      {/* 🔴 NO LINKS TO A COURSES AREA. A link is a promise that a page exists
          (routes.ts states this rule), and the courses portal does not exist
          yet. When it does, it is added here. */}

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
