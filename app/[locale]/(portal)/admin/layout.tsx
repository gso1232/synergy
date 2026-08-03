import { redirect } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import { getUserAndRole } from "@/lib/supabase/auth";

/**
 * 🔴 FORCE DYNAMIC — non-negotiable for an auth boundary, and applies to this
 * layout AND every route nested under it (the admin page included).
 *
 * Without it, this segment can be prerendered at build time into a STATIC
 * redirect-to-login that fires for everyone, admins included — because at build
 * there is no session, the guard sees no user and redirects, and that redirect
 * gets baked into static HTML. (The `try/catch` in getUserAndRole would also
 * swallow the DynamicServerError that `cookies()` raises to signal "render me
 * per request", hiding the problem.) Forcing dynamic guarantees the guard runs
 * fresh on EVERY request, which is the entire point.
 */
export const dynamic = "force-dynamic";

/**
 * LAYER B — the authoritative guard for the admin area, and the security
 * boundary. (Layer A is the middleware, an earlier and cheaper gate.)
 *
 * It lives HERE, on the admin subtree, and NOT on (portal)/layout.tsx, because
 * that parent layout is shared with /login, which must stay reachable while
 * logged out. Everything below this layout is admin-only; /login is not.
 *
 * FAIL CLOSED: `getUserAndRole()` returns null for any failure, and the only
 * way past the two checks below is a verified user whose database role is
 * exactly 'admin'. A logged-out user, an agent, an unverifiable token, a
 * missing profile, or a thrown error all redirect to /login. There is no
 * fall-through that renders the dashboard.
 *
 * A logged-out user is normally already bounced by the middleware; this repeats
 * the check on purpose. An AGENT is NOT stopped by the middleware (they have a
 * valid session) — they are stopped HERE, by the role check, which is the whole
 * reason a second layer exists.
 */
export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  const { user, role } = await getUserAndRole();

  if (!user) redirect(`/${locale}/login`);
  if (role !== "admin") redirect(`/${locale}/login?denied=1`);

  return <>{children}</>;
}
