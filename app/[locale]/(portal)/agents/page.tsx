import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { getAccountState } from "@/lib/supabase/auth";
import { getNavTree } from "@/lib/cms/pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "agents" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    // 🔴 Gated content. Never indexed, never followed.
    robots: { index: false, follow: false },
  };
}

/**
 * /[locale]/agents — the landing page. Every published page, as cards.
 *
 * 🔴 IT LISTS ROWS, NOT ROUTES. The previous portal overview counted steps from
 * a hand-maintained registry (`lib/portal/sections.ts`) that could disagree with
 * what actually rendered. This reads the same query the nav reads, so the two
 * cannot drift: if a card is here, the nav has it, and the page exists.
 *
 * =============================================================================
 * 🔴 THREE OUTCOMES, THREE DIFFERENT SCREENS. THIS IS THE BUG THAT SHIPPED.
 *
 * The first version had two: cards, or "no pages have been published yet". A
 * failed read produced the second one — so when the CMS tables did not exist
 * (0007 never applied), the page confidently reported that the content was
 * empty. It was reported as "the pages exist in the database but the landing
 * page says nothing is published", and the screen was the reason that was the
 * obvious conclusion.
 *
 *   read failed, table absent   -> "the content tables are missing", + the fix
 *   read failed, anything else  -> "could not be loaded", NOT "empty"
 *   read succeeded, zero rows   -> "nothing published yet"  (the real empty)
 *
 * The empty state now means exactly one thing, which is the only way it is worth
 * anything.
 *
 * 🔴 THE MIGRATION FILENAME IS SHOWN ONLY TO AN ADMIN. It is an instruction to
 * whoever can act on it; to an agent it is noise about a system they cannot
 * touch, and naming internal files to end users is how internals leak.
 * =============================================================================
 */
export default async function AgentsIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "agents" });
  const nav = await getNavTree();
  const tree = nav.ok ? nav.pages : [];

  /* Role, not a session flag: read from the database on every request by
     getAccountState, and React-cached so this shares the layout's round trip. */
  const { role } = await getAccountState();

  return (
    <section aria-labelledby="agents-h">
      <h1
        id="agents-h"
        className="font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.015em] text-navy"
      >
        {t("indexHeading")}
      </h1>
      <p className="mt-3 max-w-[34em] text-[16px] leading-[1.6] text-ink/70">{t("indexIntro")}</p>

      {!nav.ok ? (
        <div
          role="alert"
          className="mt-9 max-w-[42em] rounded-xl border border-[#8A2A1A]/40 bg-[#FBEBE7] px-5 py-5 text-[15px] leading-[1.6] text-[#7A2416]"
        >
          <p className="font-medium">
            {nav.missingSchema ? t("schemaMissing.heading") : t("loadError.heading")}
          </p>
          <p className="mt-1.5">
            {nav.missingSchema ? t("schemaMissing.body") : t("loadError.body")}
          </p>
          {/* The actionable half, for the one person who can act on it. */}
          {role === "admin" && nav.missingSchema ? (
            <p className="mt-3 font-mono text-[13px] leading-[1.5]">
              {t("schemaMissing.adminFix")}
            </p>
          ) : null}
        </div>
      ) : tree.length === 0 ? (
        <p
          role="status"
          className="mt-9 rounded-xl border border-dashed border-ink/25 bg-white px-5 py-6 text-[15px] leading-[1.6] text-ink/75"
        >
          {/* Reached ONLY when the query succeeded and returned nothing. */}
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-9 grid gap-3 sm:grid-cols-2">
          {tree.map((page) => {
            /* A container page (children, no content of its own) links to its
               FIRST child rather than to itself — "New Agent Bootcamps" has no
               sections, so linking to it would land on an empty page. Same
               decision the nav makes by rendering it as a menu. */
            const target = page.children.length > 0 ? page.children[0] : page;

            return (
              <li key={page.id}>
                <Link
                  href={`/${locale}/agents/${target.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-ink/[0.10] bg-white p-5 shadow-[0_1px_2px_rgba(11,31,58,0.04)] transition-colors duration-200 hover:border-gold-deep/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none sm:p-6"
                >
                  <h2 className="font-display text-[clamp(19px,1.6vw,21px)] font-semibold leading-[1.25] text-navy">
                    {page.title}
                  </h2>
                  {page.subtitle ? (
                    <p className="mt-2 text-[15px] leading-[1.55] text-ink/75">{page.subtitle}</p>
                  ) : null}

                  {page.children.length > 0 ? (
                    <p className="mt-3 text-[14px] leading-[1.5] text-ink/70">
                      {page.children.map((c) => c.title).join(" · ")}
                    </p>
                  ) : null}

                  {/* The padlock is on the card too, not just the nav: an agent
                      should learn a page needs a password before they open it,
                      whichever surface they came from. */}
                  {page.is_password_protected ? (
                    <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-gold-deep">
                      {t("nav.protected")}
                    </p>
                  ) : null}

                  <span
                    aria-hidden="true"
                    className="mt-4 text-[15px] font-medium text-gold-deep"
                  >
                    {t("open")} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
