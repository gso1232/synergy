import { getTranslations } from "next-intl/server";
import PortalTopBar from "./PortalTopBar";
import PortalPlaceholder from "./PortalPlaceholder";
import CarrierContacts from "./CarrierContacts";
import {
  PortalSection,
  PortalStep,
  PortalStepList,
  PortalLink,
  PortalLinkList,
  PortalBullets,
  PortalWarn,
} from "./PortalPrimitives";

/**
 * THE AGENT PORTAL — what an approved agent sees after signing in.
 *
 * =============================================================================
 * 🔴 PROVENANCE, BECAUSE IT MATTERS MORE HERE THAN ANYWHERE ELSE ON THIS SITE.
 *
 * The four sections below follow the STRUCTURE and the STEP SEQUENCE of another
 * agency's agent pages, supplied as source material. Not one sentence is
 * theirs. Both agencies recruit from the same pool, so reused phrasing would
 * differentiate neither — the same standing rule the marketing site applies to
 * Checkmate (HANDOFF §2.2), applied to a second competitor.
 *
 * WHAT WAS STRIPPED, AND WHY EACH ONE HAD TO GO:
 *   · Both "download Slack" steps — deleted outright, not swapped for another
 *     chat tool. Synergy has not said what it uses, and inventing one would put
 *     an instruction on the page that leads nowhere.
 *   · Their admin email, phone, Houston address, office hours and named staff.
 *   · Every ffl-oc.com link, their Gateway bootcamp and their password-walled
 *     bootcamp pages — private systems Synergy cannot reach.
 *   · Their three PDF downloads. Their documents.
 *
 * WHAT WAS KEPT, AND WHY IT IS KEEPABLE: the regulators and providers every
 * licensed agent in the country uses — NIPR, Prepare2Pass, Xcel Solutions,
 * Sircon, WebCE — and the substance of each step, which is industry process
 * rather than anyone's copy: the E&O minimum and its start-date rule, the AML
 * certificate, the contracting document list, the voided-check requirement and
 * the beneficiary detail.
 *
 * 🔴 EVERY GAP LEFT BY THE STRIP IS A `PortalPlaceholder`, NOT A GUESS. See that
 * component's docblock. Nothing operational on this page is invented.
 *
 * =============================================================================
 * 🔴 COMPLIANCE. No income, earnings or commission figures anywhere, and no
 * volume claims — the two standing rules, and the reason step 4 of the
 * contracting list says carriers "set up payment to you directly" rather than
 * describing what is paid. That sentence exists only to explain why a voided
 * check is required; it states a mechanism, not an amount. The source's tagline
 * ("your financial success is our priority") was dropped for the same reason.
 * "A-rated" and "AM Best" appear nowhere near the carrier list (HANDOFF §2.6).
 */
export default async function AgentPortal({
  locale,
  email,
}: {
  locale: string;
  email: string;
}) {
  const t = await getTranslations({ locale, namespace: "portal" });

  const ph = {
    label: t("placeholder.label"),
    note: t("placeholder.note"),
  };

  const nav = [
    { id: "licensing", label: t("nav.licensing") },
    { id: "contracting", label: t("nav.contracting") },
    { id: "resources", label: t("nav.resources") },
    { id: "training", label: t("nav.training") },
  ];

  return (
    /* 🔴 `text-cream` ON THE ROOT IS NOT DECORATION. The document body inherits
       `ink #1A1A1A` from globals, which is luminance-identical to navy (HANDOFF
       §3) — 1.0:1, i.e. genuinely invisible. Every element below sets its own
       colour, so nothing renders wrong today, but the first one that forgets
       would disappear silently rather than look wrong. The base colour makes
       forgetting harmless. */
    <div className="min-h-screen bg-navy text-cream">
      <PortalTopBar
        locale={locale}
        email={email}
        signedInAs={t("signedInAs", { email })}
        signOutLabel={t("signOut")}
        backLabel={t("back")}
        navLabel={t("navLabel")}
        nav={nav}
      />

      <main className="mx-auto max-w-[1100px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <h1 className="max-w-[20ch] font-display text-[clamp(28px,4.4vw,44px)] font-medium leading-[1.1] tracking-[-0.015em] text-cream">
          {t("heading")}
        </h1>
        <p className="mt-4 max-w-[34em] text-[16px] leading-[1.65] text-cream/80">
          {t("subhead")}
        </p>

        <div className="mt-14 space-y-14 sm:mt-16 sm:space-y-16">
          {/* ================= 1. LICENSING ================= */}
          <PortalSection
            id="licensing"
            heading={t("licensing.heading")}
            intro={t("licensing.intro")}
          >
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
                {/* The source pointed at the other agency's own pre-licensing
                    portal. Stripped, and Synergy has not named a replacement. */}
                <PortalPlaceholder {...ph}>
                  Where a Synergy agent enrols for pre-licensing study — the provider,
                  the enrolment link, and anything Synergy covers or discounts.
                </PortalPlaceholder>
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
                <PortalPlaceholder {...ph}>
                  The address a new agent sends their exam date to.
                </PortalPlaceholder>
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

            <p className="mt-8 border-t border-cream/[0.10] pt-6 text-[15px] leading-[1.6] text-cream/75">
              {t("licensing.done")}
            </p>
          </PortalSection>

          {/* ================= 2. CONTRACTING ================= */}
          <PortalSection
            id="contracting"
            heading={t("contracting.heading")}
            intro={t("contracting.intro")}
          >
            <PortalStepList>
              <PortalStep n={1} heading={t("contracting.c1.heading")}>
                <p>{t("contracting.c1.body")}</p>
                <PortalBullets
                  items={[t("contracting.c1.rule1"), t("contracting.c1.rule2")]}
                />
              </PortalStep>

              <PortalStep n={2} heading={t("contracting.c2.heading")}>
                <p>{t("contracting.c2.body")}</p>
                {/* 🟡 NAMED WITHOUT A LINK ON PURPOSE. The source named the
                    provider and the course number but carried no URL for it,
                    and a plausible-looking WebCE URL is exactly the kind of
                    thing that must not be invented. The course number is enough
                    to find it; the link can be added once someone confirms it. */}
                <p className="mt-3 font-mono text-[14px] text-cream/70">
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
                <PortalPlaceholder {...ph}>
                  The address a new agent sends their contracting documents to — the same
                  one used in the licensing checklist.
                </PortalPlaceholder>
              </PortalStep>

              <PortalStep n={4} heading={t("contracting.c4.heading")}>
                <p>{t("contracting.c4.body")}</p>
                <PortalWarn>{t("contracting.c4.warn")}</PortalWarn>
              </PortalStep>

              <PortalStep n={5} heading={t("contracting.c5.heading")}>
                <p>{t("contracting.c5.body")}</p>
                <PortalBullets
                  items={[t("contracting.c5.item1"), t("contracting.c5.item2")]}
                />
              </PortalStep>

              <PortalStep n={6} heading={t("contracting.c6.heading")}>
                <p>{t("contracting.c6.body")}</p>
                {/* Their required training sat behind the FFL-SRS Gateway. */}
                <PortalPlaceholder {...ph}>
                  Where Synergy&rsquo;s required IUL and annuity product training lives, and
                  the address a completion screenshot goes to.
                </PortalPlaceholder>
              </PortalStep>
            </PortalStepList>

            <div className="mt-8 border-t border-cream/[0.10] pt-6">
              <h3 className="font-display text-[clamp(18px,2vw,21px)] font-medium leading-[1.25] text-cream">
                {t("contracting.after.heading")}
              </h3>
              <p className="mt-2.5 max-w-[34em] text-[15px] leading-[1.65] text-cream/80">
                {t("contracting.after.body")}
              </p>
              {/* The source promised a 48-hour callback and gave a number to
                  chase it on. Both are operational commitments Synergy has not
                  made, so neither is asserted here. */}
              <PortalPlaceholder {...ph}>
                How long an agent should expect to wait for that call, Synergy&rsquo;s admin
                phone number, and the hours it is answered.
              </PortalPlaceholder>
            </div>
          </PortalSection>

          {/* ================= 3. RESOURCES ================= */}
          <PortalSection
            id="resources"
            heading={t("resources.heading")}
            intro={t("resources.intro")}
          >
            <h3 className="font-display text-[clamp(18px,2vw,21px)] font-medium leading-[1.25] text-cream">
              {t("resources.carriersHeading")}
            </h3>
            <p className="mt-2.5 max-w-[34em] text-[15px] leading-[1.65] text-cream/75">
              {t("resources.carriersNote")}
            </p>
            <div className="mt-6">
              <CarrierContacts locale={locale} />
            </div>

            <div className="mt-12">
              <h3 className="font-display text-[clamp(18px,2vw,21px)] font-medium leading-[1.25] text-cream">
                {t("resources.docsHeading")}
              </h3>
              {/* Replaces their onboarding-tips and contracting-tips links (both
                  on their private portal) and their three PDF downloads. */}
              <PortalPlaceholder {...ph}>
                Synergy&rsquo;s own agent documents, if any exist — onboarding and contracting
                guides, client-inventory or appointment-tracking sheets, scripts.
              </PortalPlaceholder>
            </div>
          </PortalSection>

          {/* ================= 4. TRAINING ================= */}
          <PortalSection
            id="training"
            heading={t("training.heading")}
            intro={t("training.intro")}
          >
            {/* Their bootcamps were two password-protected pages on their own
                site. There is nothing here to point at until Synergy has one. */}
            <PortalPlaceholder {...ph}>
              Synergy&rsquo;s own bootcamp or training destination — where it runs, how an
              agent joins, and whether there is a Spanish session.
            </PortalPlaceholder>
          </PortalSection>
        </div>
      </main>
    </div>
  );
}
