import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LogoLockup from "@/components/LogoLockup";
import { signOut } from "@/app/[locale]/(portal)/session/actions";

/**
 * CHROME FOR THE ADMIN'S SUB-ROUTES — /admin/content and /admin/logs.
 *
 * =============================================================================
 * 🔴 WHY NOT `AdminTopShell`. That shell's nav is IN-PAGE ANCHORS (`#leads`,
 * `#accounts`, …) pointing at sections of the dashboard, driven by an
 * IntersectionObserver over those sections. Rendered on a different route every
 * one of those targets is absent: the links would scroll nowhere and the active
 * marker would sit on "Dashboard" permanently. It also mounts `AdminSilk`, a
 * full-viewport canvas shader, which a CMS form does not need.
 *
 * So this is a sibling, not a rewrite — the same convention `AdminTopShell`
 * itself followed when it replaced `AdminShell` rather than editing it. The
 * navy identity strip is deliberately identical markup so the two surfaces read
 * as one product.
 *
 * 🔴 IT AUTHENTICATES NOTHING. Chrome only. The boundary is
 * `(portal)/admin/layout.tsx`, which guards this entire subtree, with the
 * middleware in front of it.
 *
 * §AA — cream on navy 15.87:1, cream/70 on navy 8.26:1, cream/40 border 3.44:1
 * (1.4.11). On the white nav row: ink 17.41:1 current, ink/70 6.34:1 the rest,
 * gold-deep 5.65:1 for the underline. Measured values carried from PortalChrome,
 * whose strip this is.
 */
export default async function AdminSubShell({
  children,
  locale,
  userLabel,
  /** Which of the three nav entries is the current page. */
  current: currentKey,
}: {
  children: React.ReactNode;
  locale: string;
  userLabel: string;
  current: "dashboard" | "cms" | "logs";
}) {
  const t = await getTranslations({ locale, namespace: "admin" });

  const items = [
    { key: "dashboard", href: `/${locale}/admin`, label: t("nav.dashboard") },
    { key: "cms", href: `/${locale}/admin/content`, label: t("nav.cms") },
    { key: "logs", href: `/${locale}/admin/logs`, label: t("nav.logs") },
  ] as const;

  return (
    <div className="min-h-screen bg-cream text-ink">
      <a href="#admin-sub-main" className="admin-skip">
        {t("skipToContent")}
      </a>

      <header className="sticky top-0 z-30">
        <div className="bg-navy">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-5 sm:h-16 sm:px-6">
            <Link
              href={`/${locale}/admin`}
              className="shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            >
              <LogoLockup className="h-7 w-auto sm:h-8" />
            </Link>

            <div className="flex items-center gap-3 sm:gap-5">
              <span className="hidden max-w-[26ch] truncate text-[13px] text-cream/70 md:inline">
                {userLabel}
              </span>
              <span className="sr-only md:hidden">{userLabel}</span>
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

        {/* Real routes, so this needs no client component and no observer —
            the current item is known at render time. */}
        <nav
          aria-label={t("navLabel")}
          className="border-b border-ink/[0.12] bg-white"
        >
          <ul className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-3 sm:px-6">
            {items.map((item) => {
              const on = item.key === currentKey;
              return (
                <li key={item.key} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={on ? "page" : undefined}
                    className={`relative flex min-h-[44px] items-center whitespace-nowrap px-3 text-[14px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-deep motion-reduce:transition-none ${
                      on ? "font-medium text-ink" : "text-ink/70 hover:text-ink"
                    }`}
                  >
                    {item.label}
                    {on ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-gold-deep"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main
        id="admin-sub-main"
        className="mx-auto max-w-[1180px] px-5 pb-24 pt-8 sm:px-6 sm:pt-10"
      >
        {children}
      </main>
    </div>
  );
}
