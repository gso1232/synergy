import { getTranslations } from "next-intl/server";
import PortalPlaceholder from "../PortalPlaceholder";
import {
  PortalSection,
  PortalStep,
  PortalStepList,
  PortalBullets,
  PortalWarn,
} from "../PortalPrimitives";

/**
 * SECTION 2 — getting appointed with carriers. Six steps plus the closing note.
 *
 * See `components/portal/sections/index.ts` for provenance and the strip list.
 *
 * 🔴 THREE MARKED GAPS HERE (`gaps: 3` in lib/portal/sections.ts).
 */
export default async function ContractingSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "portal" });
  const ph = { label: t("placeholder.label"), note: t("placeholder.note") };

  return (
    <PortalSection heading={t("contracting.heading")} intro={t("contracting.intro")}>
      <PortalStepList>
        <PortalStep n={1} heading={t("contracting.c1.heading")}>
          <p>{t("contracting.c1.body")}</p>
          <PortalBullets items={[t("contracting.c1.rule1"), t("contracting.c1.rule2")]} />
        </PortalStep>

        <PortalStep n={2} heading={t("contracting.c2.heading")}>
          <p>{t("contracting.c2.body")}</p>
          {/* 🟡 NAMED WITHOUT A LINK ON PURPOSE. The source named the provider
              and the course number but carried no URL, and a plausible-looking
              WebCE URL is exactly the sort of thing that must not be invented.
              The course number is enough to find it. */}
          <p className="mt-3 rounded-md border border-ink/[0.12] bg-cream px-3 py-2 font-mono text-[13px] text-ink/75">
            {t("contracting.c2.provider")}
          </p>
        </PortalStep>

        <PortalStep n={3} heading={t("contracting.c3.heading")}>
          <p>{t("contracting.c3.body")}</p>
          <PortalBullets
            items={[
              t("contracting.c3.doc1"),
              t("contracting.c3.doc2"),
              t("contracting.c3.doc3"),
              t("contracting.c3.doc4"),
              t("contracting.c3.doc5"),
            ]}
          />
          <PortalPlaceholder {...ph}>{t("gaps.docsEmail")}</PortalPlaceholder>
        </PortalStep>

        <PortalStep n={4} heading={t("contracting.c4.heading")}>
          <p>{t("contracting.c4.body")}</p>
          <PortalWarn>{t("contracting.c4.warn")}</PortalWarn>
        </PortalStep>

        <PortalStep n={5} heading={t("contracting.c5.heading")}>
          <p>{t("contracting.c5.body")}</p>
          <PortalBullets items={[t("contracting.c5.item1"), t("contracting.c5.item2")]} />
        </PortalStep>

        <PortalStep n={6} heading={t("contracting.c6.heading")}>
          <p>{t("contracting.c6.body")}</p>
          {/* Their required training sat behind the FFL-SRS Gateway. */}
          <PortalPlaceholder {...ph}>{t("gaps.training")}</PortalPlaceholder>
        </PortalStep>
      </PortalStepList>

      <div className="mt-8 rounded-xl border border-ink/[0.10] bg-white p-5 sm:p-6">
        <h2 className="font-display text-[clamp(19px,1.6vw,21px)] font-semibold leading-[1.25] text-navy">
          {t("contracting.after.heading")}
        </h2>
        <p className="mt-2.5 max-w-[32em] text-[15px] leading-[1.6] text-ink/75">
          {t("contracting.after.body")}
        </p>
        {/* The source promised a 48-hour callback and a number to chase it on.
            Both are operational commitments Synergy has not made. The phone and
            hours below ARE published (fflsynergy.com footer, verified
            2026-08-08); the callback window is not. */}
        <PortalPlaceholder {...ph}>{t("gaps.callback")}</PortalPlaceholder>
      </div>
    </PortalSection>
  );
}
