import { getTranslations } from "next-intl/server";
import PortalPlaceholder from "../PortalPlaceholder";
import { PortalSection } from "../PortalPrimitives";

/**
 * SECTION 4 — bootcamps and training.
 *
 * See `components/portal/sections/index.ts` for provenance and the strip list.
 *
 * 🔴 THE WHOLE SECTION IS ONE MARKED GAP (`gaps: 1`), AND THAT IS HONEST. Their
 * bootcamps were two password-protected pages on their own site; fflsynergy.com
 * publishes no training destination of any kind (checked 2026-08-08 across every
 * route in their sitemap). There is nothing to point at until Synergy has one,
 * and a section that invented a destination would be worse than a section that
 * says so.
 */
export default async function TrainingSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "portal" });
  const ph = { label: t("placeholder.label"), note: t("placeholder.note") };

  return (
    <PortalSection heading={t("training.heading")} intro={t("training.intro")}>
      <PortalPlaceholder {...ph}>{t("gaps.bootcamp")}</PortalPlaceholder>
    </PortalSection>
  );
}
