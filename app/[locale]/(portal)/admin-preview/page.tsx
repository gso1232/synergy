import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { Agent, Lead } from "@/lib/types";

/**
 * /[locale]/admin-preview — THE ADMIN DASHBOARD AS A DESIGN, DEVELOPMENT ONLY.
 *
 * =============================================================================
 * 🔴 THIS ROUTE HAS NO AUTHENTICATION, AND THAT IS ONLY SAFE BECAUSE OF THE TWO
 * PROPERTIES BELOW. Both are load-bearing. Removing either turns this into an
 * unauthenticated admin surface, which is exactly what the rest of the portal
 * exists to prevent.
 *
 *   1. IT DOES NOT EXIST OUTSIDE DEVELOPMENT. The first statement in the
 *      component is a `notFound()` unless `NODE_ENV === "development"`. Next
 *      sets NODE_ENV to "production" for `next build` and `next start`, and
 *      Vercel does the same, so on any deployed environment this route returns
 *      a genuine 404 — not a redirect, not an empty page.
 *
 *   2. IT TOUCHES NO DATABASE. Every row below is a hard-coded fixture in this
 *      file. There is no Supabase client, no `getLeads`, no `getAgents`, no
 *      cookie read. Even if the gate above were somehow defeated, there is no
 *      code path here that can return a real customer record, because none is
 *      ever fetched. That is the second lock, and it is the one that would still
 *      hold if the first failed.
 *
 * 🔴 IT DOES NOT WEAKEN THE ADMIN GUARD. `(portal)/admin` is untouched:
 * middleware still bounces logged-out users and `(portal)/admin/layout.tsx`
 * still requires a verified user whose database role is 'admin'. This route is a
 * SIBLING of that subtree, not a way into it, and it is deliberately NOT nested
 * under `admin/` — nesting would place it under that layout's guard, which would
 * defeat the purpose, and any future guard added there could silently start (or
 * stop) applying to it.
 *
 * 🟡 MUTATIONS DO NOT WORK HERE, BY DESIGN AND NOT BY ACCIDENT. `AgentsManager`
 * posts to the agents server actions, which call `requireAdmin()` and return
 * null for an unauthenticated caller. So the create/edit controls RENDER (the
 * point — it is a design preview) but any save is refused server-side. That is
 * the correct behaviour: a design preview must not be a write path.
 *
 * `noindex` is inherited from `(portal)/layout.tsx` and reinforced by
 * app/robots.ts, which disallows the whole portal group.
 *
 * =============================================================================
 * TO DELETE THIS LATER: remove this directory. Nothing imports it, nothing links
 * to it, and `AdminDashboard` (its only dependency) is used by the real page.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin design preview",
  robots: { index: false, follow: false },
};

export default function AdminPreviewPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // 🔴 LOCK 1. Fails closed: anything other than an explicit development build
  // 404s, including an unset NODE_ENV.
  if (process.env.NODE_ENV !== "development") notFound();

  unstable_setRequestLocale(locale);

  return (
    <AdminDashboard
      locale={locale}
      /* The real dashboard derives the greeting name from the signed-in
         identity's local-part, so the preview uses the admin's address to show
         what Aiman will actually see ("Good morning, Aiman"). It is a STRING IN
         THIS FILE, not a session — this route never authenticates anyone. */
      userLabel="aiman@fflsynergy.com"
      role="admin"
      leadsRes={{ ok: true, rows: MOCK_LEADS }}
      agentsRes={{ ok: true, rows: MOCK_AGENTS }}
    />
  );
}

/* ---------------------------------------------------------------------------
   FIXTURES — invented, and obviously so.
   🔴 EVERY NAME, EMAIL AND NUMBER HERE IS FAKE. Emails are on `example.com`
   (reserved by RFC 2606 for exactly this) and phone numbers are in the 555-01xx
   block (reserved for fiction), so nothing in this file can collide with a real
   person or dial a real line if it is ever screenshotted or pasted somewhere.
   Dates are fixed strings rather than `Date.now()` offsets so the preview looks
   identical on every render and screenshots stay comparable.
--------------------------------------------------------------------------- */
const MOCK_LEADS: Lead[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Dana Whitfield",
    email: "dana.whitfield@example.com",
    phone: "(407) 555-0142",
    source: "calculator",
    interest: "p3",
    sms_consent: true,
    email_optin: true,
    status: "new",
    received_at: "2026-08-02T14:20:00.000Z",
    message: null,
    locale: "en",
    ghl_status: "delivered",
    ghl_detail: null,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Marcus Ellery",
    email: "m.ellery@example.com",
    phone: "(407) 555-0198",
    source: "contact",
    interest: "p1",
    sms_consent: false,
    email_optin: true,
    status: "contacted",
    received_at: "2026-08-01T09:05:00.000Z",
    message: "We just had our second child and want to review cover before the end of the year.",
    locale: "en",
    ghl_status: "delivered",
    ghl_detail: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Priya Raman",
    email: "praman@example.com",
    phone: null,
    source: "contact",
    interest: "Final expense for a parent",
    sms_consent: false,
    email_optin: false,
    status: "qualified",
    received_at: "2026-07-29T16:48:00.000Z",
    message: "Necesito ayuda para mi madre. Prefiero hablar en espanol.",
    locale: "es",
    /* 🔴 DELIBERATELY THE FAILED CASE. The preview exists so the admin UI can
       be reviewed without real data, and the state that most needs reviewing is
       the one nobody sees in a happy-path screenshot: a lead that was captured
       but never reached GoHighLevel and has to be worked by hand. */
    ghl_status: "failed",
    ghl_detail: "http 502",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Tobias Nkemelu",
    email: "t.nkemelu@example.com",
    phone: "(321) 555-0107",
    source: "calculator",
    interest: "p5",
    sms_consent: true,
    email_optin: false,
    status: "closed",
    received_at: "2026-07-24T11:12:00.000Z",
    message: null,
    locale: "en",
    ghl_status: "delivered",
    ghl_detail: null,
  },
];

/**
 * 🔴 EMPTY ON INSTRUCTION (2026-08-03) — "clear the seeded/demo agents so it
 * starts clean". These were four invented rows (Rosa Delgado, Ken Ashworth,
 * Aisha Boateng, Victor Salazar) written for the first preview build.
 *
 * ✅ NOTHING WAS DELETED FROM THE DATABASE. These only ever existed as this
 * array, in this file, on the preview route. The real `public.agents` table was
 * not touched and could not be from here — this route has no Supabase client,
 * and RLS deliberately has NO delete policy, so agent rows cannot be destroyed
 * from the app at all (0002_crm.sql: "Deactivate instead, so the record
 * survives"). If real seeded rows exist in Supabase they are still there; say
 * the word and I will hand over the SQL to inspect and clear them.
 *
 * The empty array is deliberate rather than a shorter list: it exercises the
 * Agents card's EMPTY STATE, which is worth seeing in a design review and had
 * never been rendered.
 */
const MOCK_AGENTS: Agent[] = [];
