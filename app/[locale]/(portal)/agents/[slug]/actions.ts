"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAccountState } from "@/lib/supabase/auth";
import { getAgentPage } from "@/lib/cms/pages";
import { logActivity } from "@/lib/cms/activity";
import { authRateLimited } from "@/lib/auth-rate-limit";
import { gateCookieName, gateCookiePath } from "@/lib/cms/gate";

/**
 * THE PASSWORD GATE ON A PROTECTED PAGE.
 *
 * =============================================================================
 * 🔴 THE COMPARISON HAPPENS IN POSTGRES, NOT HERE, AND NOT IN THE BROWSER.
 *
 * The obvious build — fetch the page, compare `page.password` to the input in
 * React, hide the sections until they match — is a curtain, not a lock. The
 * content is already in the browser by the time the form renders, and the
 * password is one `/rest/v1/pages?select=password` away.
 *
 * What actually holds, all three layers in 0007:
 *   1. `authenticated` has NO SELECT grant on `pages.password`. It cannot be
 *      fetched by any session, admin included.
 *   2. Sections and links belonging to a protected page are excluded from the
 *      agent-facing RLS policies, so the REST API will not serve them either.
 *   3. `public.agent_page(slug, attempt)` is the only path to that content, it
 *      is SECURITY DEFINER, and it returns `sections: []` unless the attempt
 *      matches.
 *
 * This action therefore does not decide anything. It forwards an attempt and
 * records the verdict.
 *
 * =============================================================================
 * 🔴 THE UNLOCK IS AN httpOnly COOKIE HOLDING THE ATTEMPT, AND THE ALTERNATIVES
 * WERE WORSE.
 *
 * The page is a server component and has to re-supply the password to the RPC on
 * every render, so something has to persist it across requests.
 *
 *   · sessionStorage + a client fetch — puts the content back in the browser's
 *     hands and needs JavaScript for a page that otherwise does not.
 *   · a query string — writes the password into browser history, the address
 *     bar, the Referer header and every access log in between.
 *   · a signed unlock token — genuinely better, and genuinely more machinery
 *     (a secret to manage, rotation, expiry). Worth it for a credential; this is
 *     a shared content gate on an already-authenticated page, where the reader
 *     has been given the password by their team leader.
 *
 * `httpOnly` means page JavaScript cannot read it. `secure` in production means
 * it is not sent over http. It is a SESSION cookie — no `maxAge` — so it dies
 * with the browser, and if Aiman changes the password the stale cookie simply
 * stops matching and the gate returns. That last property is why the cookie
 * holds the attempt rather than a boolean "unlocked" flag: a boolean would keep
 * an agent inside a page whose password had been rotated specifically to keep
 * them out.
 */

export async function unlockPage(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const slug = String(formData.get("slug") ?? "").trim();
  const attempt = String(formData.get("password") ?? "");

  const base = `/${locale}/agents/${slug}`;

  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) redirect(`/${locale}/agents`);

  /* 🔴 THE GUARD IS HERE AND NOT ONLY ON THE PAGE. A "use server" action
     compiles to a public POST endpoint; the layout gates the PAGE, not this
     function. `agent_page` re-checks entitlement in SQL as well, so this is the
     second of three. */
  const { user, status } = await getAccountState();
  if (!user || status !== "active") redirect(`/${locale}/login`);

  /* A speed bump on guessing, with the same honest caveat the module carries:
     in-memory, per instance. Supabase is not in this path (the comparison is a
     plain SQL equality), so this limiter is the only throttle there is — which
     is precisely why it is applied even though it is weak. */
  if (authRateLimited(`page-gate:${slug}`)) {
    redirect(`${base}?gate=throttled`);
  }

  if (!attempt) redirect(`${base}?gate=missing`);

  const page = await getAgentPage(slug, attempt);
  if (!page) redirect(`/${locale}/agents`);

  if (page.locked) {
    /* 🔴 THE ATTEMPT IS NOT LOGGED, and that is deliberate. `metadata` is
       readable by every admin forever, and a log of failed page passwords is a
       log of the passwords people nearly typed — which are, reliably, their
       other passwords. The slug and the failure are recorded; the string is not.
       Same reasoning as the deleted `[auth-debug]` block in login/actions.ts. */
    redirect(`${base}?gate=invalid`);
  }

  cookies().set(gateCookieName(slug), attempt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: gateCookiePath(locale, slug),
  });

  await logActivity(user.id, "page_unlocked", slug);

  /* =========================================================================
     🔴 WITHOUT THIS THE UNLOCK APPEARS TO FAIL. Measured, not theorised.

     The redirect below is a CLIENT-SIDE navigation, and the App Router serves
     it from the router cache — which still holds the render made moments ago,
     when the page was locked. So a correct password produced: the URL changing
     to the clean base (success), the cookie being set, and the screen still
     showing the gate WITH the previous attempt's "that password is not correct"
     message underneath it. A fetch of the same URL in the same session returned
     the unlocked page, which is how the cache was identified as the culprit.

     An agent hitting that would conclude the password they were given is wrong.

     `force-dynamic` on the page does not help: it governs SERVER rendering, not
     the client's cached RSC payload. `revalidatePath` is what evicts that entry,
     so the redirect re-fetches instead of replaying the locked render.
     ========================================================================= */
  revalidatePath(base);

  redirect(base);
}

/** Leave a protected page locked again — the counterpart of the unlock, so a
 *  shared machine is not left open behind whoever used it last. */
export async function lockPage(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) redirect(`/${locale}/agents`);

  cookies().delete({ name: gateCookieName(slug), path: gateCookiePath(locale, slug) });
  // Same router-cache eviction as the unlock — without it, re-locking leaves the
  // UNLOCKED page on screen, which is the more dangerous direction of the bug.
  revalidatePath(`/${locale}/agents/${slug}`);
  redirect(`/${locale}/agents/${slug}`);
}
