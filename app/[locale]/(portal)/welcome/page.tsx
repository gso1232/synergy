import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { PORTAL_SECTIONS, TOTAL_GAPS } from "@/lib/portal/sections";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "portal" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/**
 * THE PORTAL OVERVIEW — where an approved agent lands.
 *
 * =============================================================================
 * 🔴 IT IS A CHOOSER, NOT A CONTENTS PAGE, AND THAT IS THE WHOLE REDESIGN.
 *
 * The first build dropped the agent at the top of a 6,606px scroll containing
 * all four sections. Someone arriving to check one thing — what documents do I
 * send? — had to scroll past eight licensing steps to reach it. This page asks
 * "what are you here to do" and answers it in four cards, each a real link to a
 * real route. The longest thing on this page is four sentences.
 *
 * 🔴 THE OUTSTANDING-DETAIL COUNT IS ON THE LANDING PAGE ON PURPOSE. Seven of
 * the portal's blocks are gaps Synergy still owes. Burying that inside the
 * sections would let a reader work halfway through licensing before discovering
 * the step they need is unfinished. It is stated up front, per card and in
 * total, so nobody is surprised at step four.
 *
 * The guard lives on `welcome/layout.tsx` — see that file. This page reads no
 * agent data at all.
 */
export default async function PortalOverviewPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "portal" });

  return (
    <div>
      <h1 className="max-w-[18ch] font-display text-[clamp(30px,4.2vw,44px)] font-medium leading-[1.08] tracking-[-0.02em] text-ink">
        {t("heading")}
      </h1>
      <p className="mt-4 max-w-[34em] text-[17px] leading-[1.6] text-ink/75">{t("subhead")}</p>

      {TOTAL_GAPS > 0 ? (
        <p
          role="note"
          className="mt-5 inline-flex max-w-[34em] items-start gap-2 rounded-lg border border-dashed border-gold-deep px-3.5 py-2.5 text-[14px] leading-[1.5] text-ink/75"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(125,100,31,0.06) 0 6px, rgba(125,100,31,0) 6px 12px)",
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 12 12" className="mt-[3px] h-3 w-3 shrink-0 fill-gold-deep">
            <path d="M6 0.5 11.5 10.5H0.5L6 0.5Zm0 3.6a.6.6 0 0 0-.6.65l.2 2.4a.4.4 0 0 0 .8 0l.2-2.4A.6.6 0 0 0 6 4.1Zm0 4.2a.65.65 0 1 0 0 1.3.65.65 0 0 0 0-1.3Z" />
          </svg>
          <span>{t("overview.gapsNotice", { count: TOTAL_GAPS })}</span>
        </p>
      ) : null}

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {PORTAL_SECTIONS.map((s, i) => (
          <li key={s.key}>
            <Link
              href={`/${locale}/welcome/${s.key}`}
              className="group flex h-full flex-col rounded-xl border border-ink/50 bg-white p-5 transition-colors duration-200 hover:border-gold-deep/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none sm:p-6"
            >
              <span
                aria-hidden="true"
                className="font-mono text-[11px] font-medium tracking-[0.14em] text-gold-deep"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 font-display text-[clamp(20px,1.8vw,23px)] font-medium leading-[1.2] text-ink group-hover:text-gold-deep">
                {t(`nav.${s.key}`)}
              </span>
              <span className="mt-2 max-w-[34em] text-[15px] leading-[1.55] text-ink/70">
                {t(`overview.${s.key}`)}
              </span>

              <span className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                {s.steps > 0 ? (
                  <span className="rounded-full border border-ink/15 bg-cream px-2.5 py-1 font-mono text-[11px] text-ink/75">
                    {t("overview.stepCount", { count: s.steps })}
                  </span>
                ) : null}
                {s.gaps > 0 ? (
                  <span className="rounded-full border border-gold-deep/35 bg-gold/[0.10] px-2.5 py-1 font-mono text-[11px] text-gold-deep">
                    {t("overview.gapCount", { count: s.gaps })}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
