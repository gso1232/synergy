import { redirect } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import PortalChrome from "@/components/portal/PortalChrome";
import { getAccountState } from "@/lib/supabase/auth";
import { SECTION_KEYS } from "@/lib/portal/sections";

export const dynamic = "force-dynamic";

/**
 * THE AGENT PORTAL SHELL — guard plus chrome, for the overview and all four
 * section routes beneath it.
 *
 * 🔴 THE GUARD MOVED HERE FROM `welcome/page.tsx`, AND THAT IS THE POINT OF THE
 * LAYOUT. The portal is five routes now (`/welcome` plus four sections). A guard
 * copied into five pages is five chances to forget one; a guard on the layout
 * covers every route in the subtree, including any added later. Exactly the
 * argument `(portal)/admin/layout.tsx` already makes for the admin subtree.
 *
 *   no user            -> /login
 *   not active         -> /pending  (which re-checks and can bounce on)
 *   admin              -> /admin    (they have their own destination)
 *   active agent       -> render
 *
 * It is not the security boundary — RLS is, and these pages read no agent data
 * at all — but it stops a pending user seeing a portal that assumes an approved
 * account. `getAccountState` is React-cached, so the section page below shares
 * this round trip rather than paying for a second.
 *
 * 🔴 `force-dynamic` FOR THE SAME REASON THE ADMIN LAYOUT CARRIES IT: without
 * it this segment can be prerendered into a static redirect-to-login that fires
 * for everyone, because at build time there is no session.
 */
export default async function PortalLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  const { user, role, status } = await getAccountState();
  if (!user) redirect(`/${locale}/login`);
  if (status !== "active") redirect(`/${locale}/pending`);
  if (role === "admin") redirect(`/${locale}/admin`);

  const t = await getTranslations({ locale, namespace: "portal" });

  const sectionLabels = Object.fromEntries(
    SECTION_KEYS.map((k) => [k, t(`nav.${k}`)]),
  ) as Record<string, string>;

  return (
    /* 🔴 `text-ink` ON THE ROOT IS NOT DECORATION — it is the light-surface twin
       of the reason the dark build set `text-cream`. Anything that forgets its
       own colour inherits something legible instead of vanishing. */
    <div className="min-h-screen bg-cream text-ink">
      <PortalChrome
        locale={locale}
        signedInAs={t("signedInAs", { email: user.email ?? "" })}
        signOutLabel={t("signOut")}
        homeLabel={t("back")}
        navLabel={t("navLabel")}
        overviewLabel={t("nav.overview")}
        sectionLabels={sectionLabels}
        gapTitle={t("gapChipTitle")}
      />
      <main className="mx-auto max-w-[1180px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">{children}</main>
    </div>
  );
}
