import { unstable_setRequestLocale } from "next-intl/server";
import SmoothScroll from "@/components/SmoothScroll";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Splash from "@/components/Splash";
import { getUserAndRole } from "@/lib/supabase/auth";

/**
 * THE PUBLIC SITE'S CHROME. Moved here from `[locale]/layout.tsx` on
 * 2026-07-30, unchanged in behaviour — every comment below is the original
 * reasoning, kept with the code it explains.
 *
 * WHY IT MOVED: the portal routes (`(portal)/login`, `(portal)/admin`) must
 * carry none of this, and in particular must not render inside Lenis. A route
 * group changes no URLs, so `/en`, `/en/about`, `/en/blog/<slug>` and the rest
 * resolve exactly as before — this file simply wraps them and the portal group
 * does not.
 *
 * ADDING A PUBLIC PAGE means adding it under `(site)/`. A page added directly
 * under `[locale]/` would render with no header and no footer.
 */
export default async function SiteLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  /**
   * 🔴 ADMIN ENTRY IS GATED HERE, SERVER-SIDE, AND THAT PLACEMENT IS THE POINT.
   *
   * The admin needs a visible way into /admin from the public site; a non-admin
   * must not even see the link exists. Deciding that on the SERVER means the
   * link is absent from the HTML entirely for everyone who is not an admin — not
   * hidden with CSS, not rendered-then-removed, simply never sent. `role` comes
   * from `getUserAndRole()`, the same verified-user + DB-role read the admin
   * guard uses (getUser() checks the JWT signature; the role is read from the
   * profiles table, never a client-writable claim). An agent, a logged-out
   * visitor, an unverifiable token — all resolve to a non-admin role and get
   * `isAdmin=false`.
   *
   * 🔴 THIS IS A CONVENIENCE AFFORDANCE, NOT THE BOUNDARY. Hiding the link is
   * not access control — the boundary is the two guards that already exist
   * (middleware + (portal)/admin/layout.tsx), both untouched. If a non-admin
   * ever forced this link visible, /admin would still deny them. The link only
   * spares an admin from typing the URL.
   *
   * ⚠️ COST, STATED PLAINLY: reading the session cookie here opts the public
   * pages into DYNAMIC rendering (they were statically generated per locale).
   * The middleware already authenticates every request, so the marginal cost is
   * one role query for signed-in users and a null-session short-circuit for the
   * anonymous majority — acceptable for the guarantee it buys. If static
   * marketing pages are required, the alternative is a client-side check in
   * SiteHeader (weaker: the link would exist in JS and be forceable via
   * devtools, though still granting no access). Flagged for the client to call.
   */
  const { role } = await getUserAndRole();
  const isAdmin = role === "admin";

  return (
    <>
      <Splash />
      {/* Real global header — persists across every page and down the whole
          scroll. It floats OVER the hero photo, so it is deliberately given
          no layout offset: the hero card starts at the very top of the page
          and the bar sits on the image. Any future page without a
          full-bleed hero at the top will need its own top padding.

          `isAdmin` is the server's verdict; SiteHeader renders the /admin link
          only when it is true. */}
      <SiteHeader isAdmin={isAdmin} />
      {/* The footer is INSIDE SmoothScroll so it is part of the same
          scrolled document Lenis drives, and it is mounted here rather
          than per-page so every route ends the same way — including
          /[locale]/calculator, which used to stop dead at the CTA.

          It also fixes something measured on the homepage: the
          consultation section was the last element, so its bottom could
          never reach the viewport top and only 53.5% of its parallax
          travel was reachable. With a footer below it, the full ±10 runs. */}
      <SmoothScroll>
        {children}
        <Footer />
      </SmoothScroll>
      {/* 🔴 THE LOCALE SWITCHER USED TO MOUNT HERE, AND NO LONGER DOES.
          2026-08-16: it moved into the header — top-left, after Blog at
          desktop and in the bar's empty first column on a phone — on the
          instruction "خلي EN ES فوق على الشمال جنب Blog". It is mounted twice
          in components/SiteHeader.tsx, once per breakpoint; see that file and
          the component's own docblock.

          WHAT THIS MOUNT WAS CARRYING, so it is not re-added by reflex: it sat
          OUTSIDE <SmoothScroll> because the pill was `position: fixed`, and a
          fixed child of a transformed ancestor positions against that ancestor
          rather than the viewport. The component is not fixed any more, so that
          constraint died with the mount. The trap itself is still real and is
          still documented where it still bites — the mobile menu panel in
          SiteHeader. */}
    </>
  );
}
