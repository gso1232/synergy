import Link from "next/link";
import LogoLockup from "@/components/LogoLockup";
import { signOut } from "@/app/[locale]/(portal)/session/actions";
import { SECTION_KEYS, sectionMeta } from "@/lib/portal/sections";
import PortalTabs from "./PortalTabs";

/**
 * THE AGENT PORTAL'S CHROME — identity bar plus the section tabs.
 *
 * =============================================================================
 * 🔴 THE TABS ARE REAL LINKS TO REAL ROUTES, NOT IN-PAGE ANCHORS.
 *
 * The first build put all four sections on one 6,606px page with `#licensing`
 * style anchors. That is a table of contents for a document, not navigation: an
 * agent returning to check step six landed at the top and scrolled. Each section
 * is now `/welcome/<section>`, so a tab is a page load, Back works, a section is
 * bookmarkable, and the browser restores scroll per section instead of one
 * shared offset.
 *
 * 🔴 THIS FILE IS A SERVER COMPONENT; ONLY THE TAB STRIP IS NOT. `PortalTabs`
 * is a ~20-line client component because a layout cannot read its child's route
 * segment, and the tabs must live in the layout to persist across all five
 * routes — see its docblock for the alternatives that were worse. Everything
 * here (logo, identity, sign-out) stays on the server, and sign-out is a form
 * posting a server action, so it works with JavaScript off.
 *
 * 🔴 IT AUTHENTICATES NOTHING. Chrome only. The boundary is the guard in
 * `welcome/layout.tsx` plus the middleware.
 *
 * =============================================================================
 * 🔴 THE IDENTITY STRIP STAYS NAVY, AND THAT IS FORCED BY THE ARTWORK, NOT TASTE.
 *
 * `synergy-logo_1.webp` is a keyed raster whose wordmark is bright gold —
 * measured mean luminance **0.7219** across its opaque pixels (samples
 * rgb(255,226,125), rgb(252,206,83)). On white that is **1.36:1**: legible as a
 * smudge, effectively invisible. On navy it is **12.78:1**. WCAG 1.4.3 exempts
 * brand marks from contrast, so this is not an AA failure — it is simply a logo
 * nobody can see, which is worse than a rule violation because nothing flags it.
 *
 * So the mark keeps a dark plate and everything below it goes light. Note what
 * is NOT on that strip: no gold, in any value. The brief was a light surface
 * with gold as the accent rather than gold on dark, and gold on this strip would
 * reintroduce exactly the treatment being moved away from. It is cream on navy
 * only; all gold on this page is `gold-deep` on light.
 *
 * =============================================================================
 * §AA — measured composited, three surfaces:
 *
 *   NAVY STRIP   cream      on navy    15.87:1   logo row, account, sign out
 *                cream/70   on navy     8.26:1   the signed-in address
 *                cream/40 border        3.44:1   sign-out outline (1.4.11)
 *   WHITE TABS   ink        on white   17.41:1   active tab label
 *                ink/70     on white    6.34:1   inactive tab label
 *                gold-deep  on white    5.65:1   active underline, chip, focus
 *   CREAM BODY   see PortalPrimitives
 *
 * 🔴 THE ACTIVE UNDERLINE IS `gold-deep`, NOT `gold`. It carries STATE — which
 * section am I in — so it is a meaningful graphic owing 3:1 under 1.4.11.
 * `gold` measures 2.29:1 on white and would fail. State is not signalled by
 * colour alone either: the active tab is medium weight and carries
 * `aria-current="page"`.
 */
export default function PortalChrome({
  locale,
  signedInAs,
  signOutLabel,
  homeLabel,
  navLabel,
  overviewLabel,
  sectionLabels,
  gapTitle,
}: {
  locale: string;
  signedInAs: string;
  signOutLabel: string;
  homeLabel: string;
  navLabel: string;
  overviewLabel: string;
  sectionLabels: Record<string, string>;
  /** Tooltip template for the outstanding-detail chip, with an {n} slot. */
  gapTitle: string;
}) {
  const tabs = [
    { key: "overview", href: `/${locale}/welcome`, label: overviewLabel, gaps: 0 },
    ...SECTION_KEYS.map((k) => ({
      key: k,
      href: `/${locale}/welcome/${k}`,
      label: sectionLabels[k],
      gaps: sectionMeta(k).gaps,
    })),
  ];

  return (
    <header>
      {/* Identity strip — the one dark band, and the only place the lockup is
          legible. Cream on navy throughout; no gold at any value. */}
      <div className="bg-navy">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
          <Link
            href={`/${locale}`}
            aria-label={homeLabel}
            className="shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
          >
            <LogoLockup className="h-7 w-auto sm:h-8" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden max-w-[26ch] truncate text-[13px] text-cream/70 md:inline">
              {signedInAs}
            </span>
            <span className="sr-only md:hidden">{signedInAs}</span>
            <form action={signOut}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="inline-flex min-h-[36px] items-center rounded-full border border-cream/40 px-4 text-[13px] font-medium text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream motion-reduce:transition-none"
              >
                {signOutLabel}
              </button>
            </form>
          </div>
        </div>
      </div>

      <PortalTabs tabs={tabs} navLabel={navLabel} gapTitle={gapTitle} />
    </header>
  );
}
