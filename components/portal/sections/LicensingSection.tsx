import { getTranslations } from "next-intl/server";
import PortalPlaceholder from "../PortalPlaceholder";
import {
  PortalSection,
  PortalStep,
  PortalStepList,
  PortalLink,
  PortalLinkList,
} from "../PortalPrimitives";

/**
 * SECTION 1 — the route to a resident licence. Eight steps.
 *
 * Provenance, what was stripped and what was kept are documented once, on
 * `components/portal/sections/index.ts`. Read that before editing any section.
 *
 * 🔴 TWO MARKED GAPS HERE (`lib/portal/sections.ts` declares `gaps: 2`). If you
 * add or remove one, update that number — `scripts/check-portal-gaps.mjs` fails
 * the build when the declared count and the rendered count disagree.
 */
export default async function LicensingSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "portal" });
  const ph = { label: t("placeholder.label"), note: t("placeholder.note") };

  return (
    <PortalSection heading={t("licensing.heading")} intro={t("licensing.intro")}>
      <PortalStepList>
        <PortalStep n={1} heading={t("licensing.s1.heading")}>
          <p>{t("licensing.s1.body")}</p>
          <PortalLinkList>
            <li>
              <PortalLink href="https://nipr.com/licensing-center/state-requirements">
                {t("licensing.s1.link1")}
              </PortalLink>
            </li>
            <li>
              <PortalLink href="https://prepare2pass.com/requirements">
                {t("licensing.s1.link2")}
              </PortalLink>
            </li>
          </PortalLinkList>
        </PortalStep>

        <PortalStep n={2} heading={t("licensing.s2.heading")}>
          <p>{t("licensing.s2.body")}</p>
          {/* The source pointed at the other agency's own pre-licensing portal.
              Stripped; Synergy has not named a replacement. Confirmed absent
              from fflsynergy.com on 2026-08-08. */}
          <PortalPlaceholder {...ph}>{t("gaps.prelicensing")}</PortalPlaceholder>
        </PortalStep>

        <PortalStep n={3} heading={t("licensing.s3.heading")}>
          <p>{t("licensing.s3.body")}</p>
          <PortalLinkList>
            <li>
              <PortalLink href="https://www.xcelsolutions.com/insurance-license/requirements">
                {t("licensing.s3.link1")}
              </PortalLink>
            </li>
          </PortalLinkList>
        </PortalStep>

        <PortalStep n={4} heading={t("licensing.s4.heading")}>
          <p>{t("licensing.s4.body")}</p>
          <PortalPlaceholder {...ph}>{t("gaps.examEmail")}</PortalPlaceholder>
        </PortalStep>

        <PortalStep n={5} heading={t("licensing.s5.heading")}>
          <p>{t("licensing.s5.body")}</p>
        </PortalStep>

        <PortalStep n={6} heading={t("licensing.s6.heading")}>
          <p>{t("licensing.s6.body")}</p>
        </PortalStep>

        <PortalStep n={7} heading={t("licensing.s7.heading")}>
          <p>{t("licensing.s7.body")}</p>
          <PortalLinkList>
            <li>
              <PortalLink href="https://nipr.com/licensing-center/apply">
                {t("licensing.s7.link1")}
              </PortalLink>
            </li>
            <li>
              <PortalLink href="https://www.sircon.com/products/individuals/index.jsp">
                {t("licensing.s7.link2")}
              </PortalLink>
            </li>
          </PortalLinkList>
        </PortalStep>

        <PortalStep n={8} heading={t("licensing.s8.heading")}>
          <p>{t("licensing.s8.body")}</p>
          <PortalLinkList>
            <li>
              <PortalLink href="https://nipr.com/help/look-up-your-npn">
                {t("licensing.s8.link1")}
              </PortalLink>
            </li>
          </PortalLinkList>
        </PortalStep>
      </PortalStepList>
    </PortalSection>
  );
}
