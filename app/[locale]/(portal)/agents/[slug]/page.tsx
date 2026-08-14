import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import CmsSections from "@/components/agents/CmsSections";
import { PortalPager } from "@/components/portal/PortalPrimitives";
import { getAccountState } from "@/lib/supabase/auth";
import { getAgentPage, getNavTree } from "@/lib/cms/pages";
import { logActivity } from "@/lib/cms/activity";
import { gateCookieName } from "@/lib/cms/gate";
import { unlockPage, lockPage } from "./actions";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const noIndex = { index: false, follow: false } as const;
  if (!SLUG_RE.test(slug)) return { robots: noIndex };

  const t = await getTranslations({ locale, namespace: "agents" });
  /* Title only — no password is supplied here, so a protected page's metadata
     is built from the locked stub. The title is not the secret. */
  const page = await getAgentPage(slug);
  return {
    title: page ? `${page.title} — ${t("metaTitle")}` : t("metaTitle"),
    description: t("metaDescription"),
    robots: noIndex,
  };
}

/**
 * /[locale]/agents/[slug] — one CMS page.
 *
 * =============================================================================
 * 🔴 THE SLUG IS ATTACKER-CONTROLLED AND IS VALIDATED BEFORE IT IS USED. Same
 * rule the hardcoded portal applied to `[section]`: anything not matching the
 * database's own slug shape is a 404, not a query.
 *
 * 🔴 A MISSING PAGE, AN UNPUBLISHED PAGE AND A PAGE THE READER MAY NOT SEE ARE
 * ALL THE SAME 404. `agent_page()` collapses them in SQL and this page does not
 * try to tell them apart — a distinct "exists, but not for you" would let a
 * signed-in agent enumerate the private area one guess at a time.
 *
 * =============================================================================
 * 🔴 THE PASSWORD GATE IS NOT A RENDER CONDITION. When `page.locked` is true the
 * `sections` array is EMPTY BECAUSE POSTGRES SENT NOTHING — the content was
 * never in the response, so there is nothing here to reveal, hide, or read out
 * of the DOM. See `[slug]/actions.ts` for why that shape was chosen over the
 * usual fetch-then-hide.
 */
export default async function AgentCmsPage({
  params: { locale, slug },
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams?: { gate?: string };
}) {
  unstable_setRequestLocale(locale);
  if (!SLUG_RE.test(slug)) notFound();

  const t = await getTranslations({ locale, namespace: "agents" });

  /* The unlock cookie holds the attempt that last worked (httpOnly, so page
     JavaScript cannot read it). Supplying it re-verifies in SQL on every
     request — which is what makes a rotated password take effect immediately
     rather than at the end of the reader's session. */
  const unlockAttempt = cookies().get(gateCookieName(slug))?.value;

  const page = await getAgentPage(slug, unlockAttempt);
  if (!page) notFound();

  /* 🔴 LOGGED AFTER THE PAGE RESOLVES, NOT BEFORE. Logging on entry would record
     a view for every 404 probe, which turns the log into a record of what an
     attacker guessed rather than of what an agent read. `await`ed because a
     server component that returns before its side effect completes may have the
     request torn down underneath it — and the write is already best-effort, so
     it cannot fail the page (see logActivity's docblock). */
  const { user } = await getAccountState();
  await logActivity(user?.id, "view_page", slug, page.locked ? { locked: true } : undefined);

  /* Prev/next across the published pages, flattened in nav order — the pager the
     hardcoded portal had, now over rows. Children sit directly after their
     parent, which is the order they are read in. */
  const nav = await getNavTree();
  const tree = nav.ok ? nav.pages : [];

  /* 🔴 A CONTAINER PAGE FORWARDS TO ITS FIRST CHILD. "New Agent Bootcamps" holds
     the two bootcamp pages and has no sections of its own, so rendering it would
     serve a correctly-built page with nothing on it. The nav already treats such
     a page as a menu rather than a destination; this is the same decision for
     anyone who reaches the URL directly — a retired /welcome/training bookmark,
     a shared link, or the address bar.

     Guarded on `sections.length === 0` rather than on "has children", so a page
     that has BOTH children and content of its own still renders its content. */
  const container = tree.find((p) => p.slug === slug && p.children.length > 0);
  if (container && page.sections.length === 0 && !page.locked) {
    redirect(`/${locale}/agents/${container.children[0].slug}`);
  }

  const flat = tree.flatMap((p) => (p.children.length ? p.children : [p]));
  const i = flat.findIndex((p) => p.slug === slug);
  const prev = i > 0 ? flat[i - 1] : null;
  const next = i >= 0 && i < flat.length - 1 ? flat[i + 1] : null;

  const gate = searchParams?.gate;

  return (
    <>
      <section aria-labelledby="page-h">
        <h1
          id="page-h"
          className="font-display text-[clamp(28px,3.4vw,38px)] font-medium leading-[1.12] tracking-[-0.015em] text-ink"
        >
          {page.title}
        </h1>
        {page.subtitle ? (
          <p className="mt-3 max-w-[34em] text-[16px] leading-[1.6] text-ink/70">{page.subtitle}</p>
        ) : null}

        {/* A draft, visible to its author only. Marked, so an admin previewing
            it never mistakes it for something agents can see. */}
        {!page.is_published ? (
          <p
            role="status"
            className="mt-6 max-w-[34em] rounded-lg border border-amber-deep/30 bg-amber/[0.12] px-3.5 py-2.5 text-[14px] font-medium leading-[1.5] text-amber-deep"
          >
            {t("draftNotice")}
          </p>
        ) : null}

        <div className="mt-9">
          {page.locked ? (
            <PasswordGate locale={locale} slug={slug} gate={gate} t={t} />
          ) : (
            <>
              {page.sections.length === 0 ? (
                <p
                  role="status"
                  className="max-w-[34em] rounded-xl border border-dashed border-ink/25 bg-white px-5 py-6 text-[15px] leading-[1.6] text-ink/75"
                >
                  {t("emptyPage")}
                </p>
              ) : (
                <CmsSections sections={page.sections} />
              )}

              {/* Only offered on a page that was actually gated — a "lock again"
                  button on open content is a control that does nothing. */}
              {page.is_password_protected ? (
                <form action={lockPage} className="mt-6">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="slug" value={slug} />
                  <button
                    type="submit"
                    className="inline-flex min-h-[36px] items-center rounded-full border border-ink/40 px-4 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-gold-deep hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
                  >
                    {t("gate.lockAgain")}
                  </button>
                </form>
              ) : null}
            </>
          )}
        </div>
      </section>

      <PortalPager
        prev={prev ? { href: `/${locale}/agents/${prev.slug}`, label: prev.title } : null}
        next={next ? { href: `/${locale}/agents/${next.slug}`, label: next.title } : null}
      />
    </>
  );
}

/**
 * THE GATE ITSELF.
 *
 * A plain `<form action={serverAction}>` with no `useFormState`, so it works
 * with JavaScript off and the comparison stays on the server. Feedback arrives
 * by redirect (`?gate=…`) — the same pattern the admin's approval buttons use,
 * and the reason they can be server-rendered too.
 *
 * 🔴 `autoComplete="off"` AND `name="password"`. The field must not be offered
 * to a password manager as the reader's own credential — it is a shared content
 * password handed out by a team leader, and saving it against the site's origin
 * would put it beside their actual login.
 */
function PasswordGate({
  locale,
  slug,
  gate,
  t,
}: {
  locale: string;
  slug: string;
  gate?: string;
  t: Awaited<ReturnType<typeof getTranslations<"agents">>>;
}) {
  /* Only the three codes the action can emit are rendered. An arbitrary
     `?gate=` value from the address bar falls through to no message rather than
     into a translation lookup that would throw. */
  const message =
    gate === "invalid" ? t("gate.invalid")
    : gate === "missing" ? t("gate.missing")
    : gate === "throttled" ? t("gate.throttled")
    : null;

  return (
    <div className="max-w-[34em] rounded-xl border border-ink/[0.10] bg-white p-5 shadow-[0_1px_2px_rgba(26,26,26,0.04)] sm:p-6">
      <h2 className="font-display text-[clamp(19px,1.6vw,21px)] font-medium leading-[1.25] text-ink">
        {t("gate.heading")}
      </h2>
      <p className="mt-2.5 text-[15px] leading-[1.6] text-ink/75">{t("gate.body")}</p>

      {message ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-3 text-[14px] text-[#7A2416]"
        >
          {message}
        </p>
      ) : null}

      <form action={unlockPage} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="slug" value={slug} />
        <div className="min-w-[14rem] flex-1">
          <label
            htmlFor="page-password"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink/70"
          >
            {t("gate.label")}
          </label>
          <input
            id="page-password"
            name="password"
            type="password"
            required
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-deep"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center rounded-full bg-navy px-5 text-[14px] font-medium text-cream transition-colors duration-200 hover:bg-navy-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
        >
          {t("gate.submit")}
        </button>
      </form>
    </div>
  );
}
