import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import LogoLockup from "@/components/LogoLockup";
import AgentsNav, { type NavItem } from "@/components/agents/AgentsNav";
import { signOut } from "@/app/[locale]/(portal)/session/actions";
import { getAccountState } from "@/lib/supabase/auth";
import { getNavTree } from "@/lib/cms/pages";

export const dynamic = "force-dynamic";

/**
 * THE AGENTS AREA SHELL — guard, chrome, and the CMS-driven nav.
 *
 * =============================================================================
 * 🔴 THE GUARD IS ON THE LAYOUT, covering `/agents` and every `/agents/:slug`
 * beneath it including pages that do not exist yet — which is the point, because
 * pages here are ROWS. A guard copied per route could not cover a route created
 * by an admin filling in a form.
 *
 *   no user            -> /login
 *   not active         -> /pending  (which re-checks and can bounce on)
 *   active agent       -> render
 *   active admin       -> render
 *
 * 🔴 AN ADMIN IS **NOT** BOUNCED TO /admin HERE, AND THAT IS A DELIBERATE
 * DEPARTURE FROM `welcome/layout.tsx`. That layout redirects admins away,
 * which was right when the portal was hardcoded and an admin had nothing to do
 * in it. It is wrong now: Aiman authors these pages. Sending him to /admin the
 * moment he clicks "view" would mean the one person who has to check that a page
 * reads correctly is the one person who cannot open it.
 *
 * It is not the security boundary — RLS is, and `public.agent_page()` re-checks
 * entitlement in SQL on every read. This stops a pending user seeing a portal
 * that assumes an approved account.
 */
export default async function AgentsLayout({
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

  const t = await getTranslations({ locale, namespace: "agents" });

  /* Published pages only, parents with their children. Read through RLS as the
     signed-in user, so a broken policy shows an empty nav rather than a nav of
     things the reader cannot open.

     🔴 A FAILED READ RENDERS AN EMPTY NAV AND NOTHING ELSE — the layout does not
     report the error, because the PAGE below it does, and two error banners on
     one screen for one failure is worse than one. `/agents` and `/agents/:slug`
     both surface it; this only has to not lie about what is navigable. */
  const nav = await getNavTree();
  const items: NavItem[] = (nav.ok ? nav.pages : []).map((p) => ({
    slug: p.slug,
    title: p.title,
    isProtected: p.is_password_protected,
    children: p.children.map((c) => ({
      slug: c.slug,
      title: c.title,
      isProtected: c.is_password_protected,
    })),
  }));

  return (
    /* `text-ink` on the root is the light-surface twin of the dark build's
       `text-cream`: anything that forgets its own colour inherits something
       legible instead of vanishing. Same reasoning as welcome/layout.tsx. */
    <div className="min-h-screen bg-cream text-ink">
      <header>
        {/* The identity strip stays navy because the lockup's wordmark is bright
            gold — 1.36:1 on white, 12.78:1 on navy. Documented in full on
            PortalChrome; the same artwork constraint applies here. */}
        <div className="bg-navy">
          <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
            <Link
              href={`/${locale}`}
              aria-label={t("home")}
              className="shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            >
              <LogoLockup className="h-7 w-auto sm:h-8" />
            </Link>

            <div className="flex items-center gap-3 sm:gap-5">
              <span className="hidden max-w-[26ch] truncate text-[13px] text-cream/70 md:inline">
                {t("signedInAs", { email: user.email ?? "" })}
              </span>
              <span className="sr-only md:hidden">
                {t("signedInAs", { email: user.email ?? "" })}
              </span>
              {/* A form posting a server action, so sign-out works with
                  JavaScript off — the same shape the portal and admin use. */}
              <form action={signOut}>
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="inline-flex min-h-[36px] items-center rounded-full border border-cream/40 px-4 text-[13px] font-medium text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none"
                >
                  {t("signOut")}
                </button>
              </form>
            </div>
          </div>
        </div>

        <AgentsNav
          locale={locale}
          items={items}
          overviewLabel={t("nav.overview")}
          navLabel={t("nav.label")}
          protectedLabel={t("nav.protected")}
          /* Role comes from the database on every request (getAccountState), not
             from a token claim, so a demoted admin loses the link immediately. */
          adminHref={role === "admin" ? `/${locale}/admin` : undefined}
          adminLabel={role === "admin" ? t("nav.admin") : undefined}
        />
      </header>

      <main className="mx-auto max-w-[1180px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">{children}</main>
    </div>
  );
}
