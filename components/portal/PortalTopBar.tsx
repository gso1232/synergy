import Link from "next/link";
import LogoLockup from "@/components/LogoLockup";
import { signOut } from "@/app/[locale]/(portal)/session/actions";

/**
 * THE AGENT PORTAL'S CHROME.
 *
 * =============================================================================
 * 🔴 A SERVER COMPONENT, AND UNLIKE `AdminTopShell` IT CARRIES NO JAVASCRIPT.
 *
 * The admin bar is a client component because it tracks the active section with
 * an IntersectionObserver and slides an underline between nav items. Neither is
 * worth a hydration payload here. This is a document an agent reads top to
 * bottom, mostly on a phone, often on a slow connection at a kitchen table; the
 * section links are plain in-page anchors and the browser's own `:focus` and
 * scrolling do the rest. Sign-out is a `<form>` posting a server action, so it
 * works with JavaScript switched off.
 *
 * 🔴 IT AUTHENTICATES NOTHING. Chrome only. The boundary is the guard in
 * `(portal)/welcome/page.tsx` plus the middleware, and `signOut` is the same
 * action the admin and /pending both post to, imported unchanged.
 *
 * §AA — the bar is `navy/95` over a navy page, so every ratio is effectively
 * the flat-navy set in PortalPrimitives. The backdrop blur is decoration; the
 * surface underneath it is already opaque enough to measure against.
 */
export default function PortalTopBar({
  locale,
  email,
  signedInAs,
  signOutLabel,
  backLabel,
  navLabel,
  nav,
}: {
  locale: string;
  email: string;
  signedInAs: string;
  signOutLabel: string;
  backLabel: string;
  navLabel: string;
  nav: { id: string; label: string }[];
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-cream/[0.14] bg-navy/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
        <Link
          href={`/${locale}`}
          aria-label={backLabel}
          className="shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-pale"
        >
          <LogoLockup className="h-7 w-auto sm:h-8" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* The address is useful (which account am I in?) but it is not
              wayfinding, so it steps aside on phones rather than truncating
              the sign-out control it sits beside. */}
          <span className="hidden max-w-[26ch] truncate text-[13px] text-cream/70 md:inline">
            {signedInAs}
          </span>
          <span className="sr-only md:hidden">{signedInAs}</span>

          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-full border border-cream/40 px-3.5 py-1.5 text-[13px] font-medium text-cream transition-colors duration-200 hover:border-gold hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale motion-reduce:transition-none sm:px-4"
            >
              {signOutLabel}
            </button>
          </form>
        </div>
      </div>

      {/* Section jump-links. A horizontal scroller at phone width rather than a
          wrap: four items that wrap to two rows double the height of a sticky
          bar, which then eats a third of a short viewport. */}
      <nav
        aria-label={navLabel}
        className="border-t border-cream/[0.10] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-3 sm:px-6">
          {nav.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                className="block whitespace-nowrap rounded px-2.5 py-2.5 text-[13px] text-cream/70 transition-colors duration-200 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-pale motion-reduce:transition-none"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
