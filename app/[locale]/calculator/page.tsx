import type { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Calculator from "@/components/Calculator";

/**
 * /[locale]/calculator — the retirement calculator on its own page.
 *
 * This is a RE-HOUSING, not a rebuild. <Calculator /> is the same component
 * that used to sit last in the homepage's scroll flow (see the commented-out
 * import in app/[locale]/page.tsx); everything locked about it — the three
 * sliders and their ranges and defaults, the retirement-age clamp, the maths,
 * the illustrative-rate labelling, the "Equivalent to" receipt row, the
 * short-runway row under fifteen years, the assumption chips, the disclaimer
 * footnote, the fast settle with no count-up, and the CTA routing into
 * LeadModal — is untouched. The only prop it gained is `headingLevel`, because
 * its section header is this page's h1.
 *
 * THERE IS NO FOOTER YET, so this page ends at the calculator's last element.
 * That is deliberate and agreed: shipping it bare beats building a throwaway
 * footer here. The homepage already ends the same way.
 *
 * TOP OFFSET: SiteHeader is position:fixed and occupies no layout space (it was
 * built to float over the hero photograph). Any page that does not open with a
 * full-bleed hero has to reserve that height itself — hence .page-header-offset.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "calculator" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function CalculatorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <main className="page-header-offset bg-cream">
      <Calculator headingLevel={1} />
    </main>
  );
}
