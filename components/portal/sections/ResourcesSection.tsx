import { getTranslations } from "next-intl/server";
import PortalPlaceholder from "../PortalPlaceholder";
import CarrierContacts from "../CarrierContacts";
import { PortalSection } from "../PortalPrimitives";

/**
 * SECTION 3 — carrier contacts and reference material.
 *
 * See `components/portal/sections/index.ts` for provenance and the strip list.
 * 🔴 ONE MARKED GAP HERE (`gaps: 1`).
 */
export default async function ResourcesSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "portal" });
  const ph = { label: t("placeholder.label"), note: t("placeholder.note") };

  return (
    <PortalSection heading={t("resources.heading")} intro={t("resources.intro")}>
      <section aria-labelledby="carriers-h">
        <h2
          id="carriers-h"
          className="font-display text-[clamp(19px,1.6vw,21px)] font-medium leading-[1.25] text-ink"
        >
          {t("resources.carriersHeading")}
        </h2>
        <p className="mt-2 max-w-[34em] text-[15px] leading-[1.6] text-ink/70">
          {t("resources.carriersNote")}
        </p>
        <div className="mt-5">
          <CarrierContacts locale={locale} />
        </div>
      </section>

      <section aria-labelledby="docs-h" className="mt-12">
        <h2
          id="docs-h"
          className="font-display text-[clamp(19px,1.6vw,21px)] font-medium leading-[1.25] text-ink"
        >
          {t("resources.docsHeading")}
        </h2>
        {/* Replaces their onboarding-tips and contracting-tips links (both on
            their private portal) and their three PDF downloads. Confirmed absent
            from fflsynergy.com on 2026-08-08 — zero document links site-wide. */}
        <PortalPlaceholder {...ph}>{t("gaps.documents")}</PortalPlaceholder>
      </section>
    </PortalSection>
  );
}
