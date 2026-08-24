"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/[locale]/(portal)/session/actions";
import LogoLockup from "@/components/LogoLockup";
import AdminNav from "./AdminNav";
import dynamic from "next/dynamic";

/** Code-split for the same reason as EngineNoise: a canvas has no server
 *  markup, and this one is `fixed inset-0` behind the dashboard, so it cannot
 *  shift layout. Keeps the OKLab/fbm shader out of the admin's first load. */
const AdminSilk = dynamic(() => import("./AdminSilk"), { ssr: false });

/**
 * THE ADMIN CHROME — TOP BAR (replaces the left sidebar, on instruction).
 *
 * =============================================================================
 * 🔴 WHY A NEW COMPONENT RATHER THAN AN EDIT TO AdminShell. `AdminShell` is a
 * client component carrying a focus-trapped off-canvas drawer, a collapsible
 * desktop rail, body-scroll locking and Escape handling — all solved and all
 * irrelevant to a top bar. Rewriting it in place would have meant deleting that
 * work to reach a different layout, with no way back. This is a sibling;
 * `AdminShell` stays in the tree, unused, so the rail is a one-line revert.
 *
 * 🔴 IT DOES NOT AUTHENTICATE ANYTHING. Chrome only. The boundary is
 * `(portal)/admin/layout.tsx` + middleware, both untouched. `signOut` is
 * imported unchanged and posts the same `locale` field it always did.
 *
 * =============================================================================
 * §LAYOUT — one sticky bar, three zones, and nothing that scrolls away.
 *
 *   left    wordmark + section nav (in-page anchors, as the rail's were)
 *   right   the signed-in identity + sign out
 *   below   the greeting and page title, in the content column
 *
 * NAV ITEMS ARE STILL IN-PAGE ANCHORS, not routes — `#leads`, `#agents`,
 * `#content` point at headings that exist on this one page. /admin/leads does
 * not exist and linking to it would be the `href="#"` problem in a new costume.
 * That was true of the rail and is unchanged.
 *
 * 🔴 THE ACTIVE SECTION IS TRACKED, AND IT IS NOT `:target`. An
 * IntersectionObserver marks whichever section owns the viewport, so the bar
 * says where you are even when you scroll by hand rather than by clicking. It
 * sets `aria-current="true"` (not `"page"` — these are fragments within one
 * page, and `page` would claim the link points at a different document).
 *
 * §MOTION — the underline slides between items. Dropped entirely under
 * `prefers-reduced-motion`, where the marker simply appears.
 *
 * §AA — every value on this bar is measured against the bar's own surface,
 * which is an OPAQUE-ENOUGH cream over the silk (see `.admin-topbar` in
 * globals.css). Nothing here is measured against the raw shader.
 */

/* 🔴 ALL SIX SECTIONS, IN PAGE ORDER. The previous list carried four and the
   page renders six — "Create an agent", "Accounts" and "Applications" existed
   with working anchors and simply were not linked. Two of those three are the
   page's most important surfaces: AdminDashboard's own docblock calls the
   create form "the primary action on this page" and the approvals queue "a
   queue with people waiting in it". A nav that omits the primary action is not
   a nav, and nothing in the markup hinted at the omission. */
const NAV = [
  { key: "dashboard", href: "#admin-main" },
  { key: "leads", href: "#leads" },
  { key: "createAccount", href: "#create-account" },
  { key: "accounts", href: "#accounts" },
  { key: "agents", href: "#agents" },
  { key: "applications", href: "#applications" },
] as const;

/** Height of the sticky chrome — navy identity strip + white nav row. Sections
 *  pay it back as `scroll-margin-top` so an anchored heading is not hidden. */
const BAR_OFFSET = 108;

/* 🔴 THE HIDE-ON-SCROLL MECHANIC IS GONE, CONSTANTS AND ALL.

   It was SiteHeader's accumulator debounce (HIDE_AFTER 120, DIR_DELTA 8), a
   `data-hidden` transform, a reduced-motion special case and a focus-within
   guard to stop a translated-off-screen bar trapping keyboard focus. Roughly
   90 lines, all in service of hiding a bar whose only job is to stay
   reachable: the admin nav is in-page anchors on a ~4,000px page, so removing
   it from view is removing the navigation. The bar is `sticky` now and the
   whole apparatus — including the focus trap it needed a guard for — is
   deleted rather than left dormant. SiteHeader keeps its copy; the public
   header has different priorities and is untouched.

   🔴 THE LISTENERS WENT WITH IT. Leaving the effects in place "retired" would
   have kept a scroll handler and a focusin/focusout pair running on every
   admin render, doing nothing. Retiring a TREATMENT is this codebase's
   convention; retiring live event listeners is just a leak. */

/**
 * 🔴 THE GREETING IS COMPUTED ON THE CLIENT, AND THAT IS DELIBERATE.
 * Rendering it on the server would use the SERVER's clock and time zone — a
 * Vercel box in another region — so an admin in Orlando could be told "Good
 * evening" at 2pm. `new Date().getHours()` here is the reader's own local time.
 *
 * The cost is a hydration mismatch if it rendered during SSR, so it is held
 * behind a mounted flag and renders nothing on the first paint. That is a
 * deliberate flash-of-nothing on one line of text, chosen over being wrong.
 *
 * Boundaries: < 12 morning, < 18 afternoon, else evening.
 */
function useGreetingKey(): "greetMorning" | "greetAfternoon" | "greetEvening" | null {
  const [key, setKey] = useState<
    "greetMorning" | "greetAfternoon" | "greetEvening" | null
  >(null);
  useEffect(() => {
    const h = new Date().getHours();
    setKey(h < 12 ? "greetMorning" : h < 18 ? "greetAfternoon" : "greetEvening");
  }, []);
  return key;
}

/**
 * HONORIFICS, keyed by the email's local-part (lowercased).
 *
 * 🔴 A MAP, NOT A HARD-CODED "Dr." ON THE GREETING. The client asked for
 * "Good morning, Dr. Aiman". Prefixing every admin with a doctorate would be
 * wrong the moment a second one exists — and inventing a title for someone is a
 * worse error than omitting one. Anyone not listed here gets their name alone,
 * which is the safe default.
 *
 * 🟡 THIS IS THE STOPGAP, NOT THE RIGHT HOME. An honorific is a fact about a
 * PERSON and belongs on their record: `public.profiles` already has a
 * `full_name` column (0001) that nothing currently reads. The proper fix is to
 * select it in `getUserAndRole` and render it — but that is a DATA-PATH change,
 * and this pass is design-only. When `full_name` is wired up, delete this map
 * and read the stored name instead.
 *
 * "Dr." rather than "Doctor" because that is the form the client wrote in their
 * own brief. One string to change if the spelled-out version is wanted.
 */
const TITLES: Record<string, string> = {
  aiman: "Dr.",
};

/**
 * The display name for the greeting. The admin's identity arrives as an EMAIL
 * (that is what `getUserAndRole` returns), so the local-part is title-cased:
 * `aiman@fflsynergy.com` -> "Dr. Aiman". Dots and underscores become spaces so
 * `first.last` reads as a name.
 *
 * 🔴 IT IS DERIVED, NOT AUTHORED. Hard-coding "Aiman" would be wrong the moment
 * a second admin exists, and there is no `full_name` on the profile read path —
 * adding one would be a DATA change, which this pass is forbidden from making.
 * If a real display name is wanted later, `profiles.full_name` already exists in
 * the schema and only the read needs extending.
 */
function displayName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const title = TITLES[local.trim().toLowerCase()];
  const name =
    local
      .replace(/[._-]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || email;

  return title ? `${title} ${name}` : name;
}

export default function AdminTopShell({
  children,
  locale,
  userLabel,
  userRole,
}: {
  children: React.ReactNode;
  locale: string;
  /** The signed-in admin's email — real, from the server (getUserAndRole). */
  userLabel: string;
  /** Their role label, already translated. */
  userRole: string;
}) {
  const t = useTranslations("admin");
  const greetKey = useGreetingKey();

  /* 🔴 THE ACTIVE-STATE OBSERVER MOVED TO `AdminNav`, AND ITS BUG WENT WITH IT.
     The version here watched the section HEADINGS — every one of them `sr-only`,
     measured 1x1px and clipped — so it fired almost at random and the highlight
     stuck one item behind. Measured before the rewrite: at scrollY 0 it said
     "Leads"; clicking Agents lit "Leads"; at scrollY 3600, past Content, it
     still said "Agents". AdminNav observes the SECTIONS instead and resolves by
     position rather than by which entry fired last. */

  const name = displayName(userLabel);

  return (
    <div className="admin-page relative min-h-screen">
      {/* THE BACKDROP. Fixed, behind everything, and covered by a heavy scrim —
          see AdminSilk's header for why no data is ever composited over it. */}
      <div aria-hidden="true" className="admin-silk-layer">
        <AdminSilk className="h-full w-full" />
        <div className="admin-silk-scrim" />
      </div>

      <a href="#admin-main" className="admin-skip">
        {t("skipToContent")}
      </a>

      {/* ---------- THE BAR — the portal's chrome shape, in the light palette.

          🔴 IT NO LONGER HIDES ON SCROLL, AND THAT IS A DELIBERATE LOSS. The
          old bar was `position: fixed` with an accumulator-debounced
          hide-on-scroll lifted from SiteHeader, plus a focus-within guard to
          stop a hidden bar trapping keyboard focus. All of it is gone. On a
          4,000px single-page dashboard whose nav is in-page anchors, a bar that
          removes itself is the wrong trade: the nav's whole job is to be
          reachable from anywhere in the page. `sticky` keeps it reachable and
          deletes the focus trap, the 101% transform and the reduced-motion
          special case along with it.

          🔴 THE IDENTITY STRIP IS NAVY FOR THE SAME REASON THE PORTAL'S IS —
          the lockup's wordmark measures mean luminance 0.7219, which is 1.36:1
          on white and 12.78:1 on navy. It also replaces a plain "Synergy" text
          wordmark, so the admin now carries the same mark as the portal and the
          login screen rather than a typographic stand-in. */}
      <header className="sticky top-0 z-30">
        <div className="bg-navy">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-5 sm:h-16 sm:px-6">
            <LogoLockup className="h-7 w-auto sm:h-8" />

            <div className="flex items-center gap-3 sm:gap-5">
              <span className="hidden text-right md:block">
                <span className="block max-w-[26ch] truncate text-[13px] text-cream">
                  {userLabel}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-cream/70">
                  {userRole}
                </span>
              </span>
              <span className="sr-only md:hidden">{`${userLabel} — ${userRole}`}</span>
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

        {/* 🔴 THE LAST TWO ITEMS ARE REAL ROUTES, NOT ANCHORS, AND THE NAV
            HANDLES THAT WITHOUT A CHANGE. AdminNav's observer resolves each
            href with `getElementById(href.replace(/^#/, ""))`; a path returns
            null and is filtered out of the observed set, so a route item simply
            never becomes the "active" anchor — which is correct, because when
            you are ON that route you are not on this page at all. The CMS and
            the log are genuinely separate pages: an editor with nested forms
            and a filterable table do not belong in a dashboard's scroll. */}
        <AdminNav
          items={[
            ...NAV.map((n) => ({ key: n.key, href: n.href, label: t(`nav.${n.key}`) })),
            /* 🔴 "Site content" IS A ROUTE NOW, NOT AN ANCHOR. It used to be
               `#content` — a jump to the read-only inventory table further down
               this same page. That table still exists and is still useful, but
               it is a LIST OF WHAT EXISTS, not a way to change anything, and it
               was the only thing the nav offered under that name. The route
               below is the actual editor for the public site's copy. */
            { key: "content", href: `/${locale}/admin/site-content`, label: t("nav.content") },
            { key: "cms", href: `/${locale}/admin/content`, label: t("nav.cms") },
            { key: "logs", href: `/${locale}/admin/logs`, label: t("nav.logs") },
          ]}
          label={t("navLabel")}
          barOffset={BAR_OFFSET}
        />
      </header>

      {/* ---------- CONTENT ---------- */}
      <main id="admin-main" className="admin-main admin-main--static">
        {/* 🔴 THE GREETING IS THE PAGE'S OPENING STATEMENT NOW, NOT A CAPTION.
            It shipped as a 14px ink/70 line and read as metadata — the client's
            word was "too subtle". It is now display-face, clamp(30px..44px),
            full ink, and the first thing on the page.

            🔴 IT IS NOT AN <h1>, AND THAT IS DELIBERATE. The dashboard's h1 is
            "Dashboard" — it names the page. A greeting names nobody, and making
            it the h1 would tell a screen reader the page is called "Good
            morning, Aiman". So it is a <p> that merely LOOKS like the largest
            thing here, with the real h1 immediately after, demoted visually
            rather than structurally.

            `aria-live="polite"` because it appears after mount (client clock —
            see the hook) and would otherwise be inserted silently. */}
        <p className="admin-greeting" aria-live="polite">
          {/* Nothing until mounted. The line is reserved by
              `.admin-greeting { min-height }` in globals.css rather than by a
              placeholder character — an invisible NBSP in source is a trap. */}
          {greetKey ? t(greetKey, { name }) : null}
        </p>
        {children}
      </main>
    </div>
  );
}
