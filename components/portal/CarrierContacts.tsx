import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { CARRIER_CONTACTS, assertContractedCarriers } from "@/lib/portal/carrierContacts";
import { carrierLogoSrc } from "@/lib/carrierLogos";
import { PortalLink } from "./PortalPrimitives";

/**
 * CARRIER SERVICE LINES AND AGENT PORTALS.
 *
 * =============================================================================
 * 🔴 NAMES COME FROM `carriers.names.*`, NOT FROM THE CONTACT TABLE. Those are
 * the strings the homepage marquee and the /about logo wall already render, so
 * the portal cannot call a carrier something the marketing site does not. The
 * contact file carries only the phone numbers and URLs — see its docblock for
 * why the appointment cross-check lives there.
 *
 * 🔴 IT IS A LIST, NOT A `<table>`. Three fields per carrier, one of which is
 * absent for seven of the eight, is not tabular data — it is eight small
 * records. A real table would need a horizontal scroller at phone width to show
 * a column that is empty in most rows. Marked up as a description list so the
 * carrier name is the term and its contacts are its details.
 *
 * §AA — the logo sits on navy and is a brand mark, which WCAG 1.4.3 exempts
 * from contrast. It is `aria-hidden` because the carrier name is right beside
 * it in text; alt text would just repeat it.
 */
export default async function CarrierContacts({ locale }: { locale: string }) {
  /* Fails the render — and therefore the build — if anyone lists a carrier
     Synergy is not appointed with. See assertContractedCarriers. */
  assertContractedCarriers();

  const t = await getTranslations({ locale, namespace: "portal" });
  const c = await getTranslations({ locale, namespace: "carriers" });

  return (
    <dl className="grid gap-px overflow-hidden rounded-xl border border-cream/[0.14] bg-cream/[0.14] sm:grid-cols-2">
      {CARRIER_CONTACTS.map((carrier) => {
        const name = c(`names.${carrier.key}`);
        return (
          <div key={carrier.key} className="bg-navy p-5">
            <dt className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cream/95 p-1">
                <Image
                  src={carrierLogoSrc(carrier.key)}
                  alt=""
                  aria-hidden="true"
                  width={28}
                  height={28}
                  className="h-auto max-h-[22px] w-auto max-w-[26px] object-contain"
                />
              </span>
              <span className="font-display text-[17px] font-medium leading-[1.2] text-cream">
                {name}
              </span>
            </dt>

            <dd className="mt-3.5 space-y-1.5">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/55">
                  {t("resources.phoneLabel")}
                </span>
                {/* A phone number is dialable on the device most agents will
                    read this on. `tel:` strips to digits; the label keeps the
                    printed grouping. */}
                <a
                  href={`tel:${carrier.phone.replace(/[^\d+]/g, "")}`}
                  className="inline-block py-1 font-mono text-[14px] text-cream underline decoration-cream/30 underline-offset-4 hover:decoration-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
                >
                  {carrier.phone}
                </a>
              </p>

              {carrier.agentPhone ? (
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/55">
                    {t("resources.agentPhoneLabel")}
                  </span>
                  <a
                    href={`tel:${carrier.agentPhone.replace(/[^\d+]/g, "")}`}
                    className="inline-block py-1 font-mono text-[14px] text-cream underline decoration-cream/30 underline-offset-4 hover:decoration-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
                  >
                    {carrier.agentPhone}
                  </a>
                </p>
              ) : null}

              <p className="pt-1">
                {/* The accessible name names the carrier — eight links all
                    reading "Agent portal" would be indistinguishable in a
                    screen reader's link list. */}
                <PortalLink href={carrier.url}>
                  <span aria-hidden="true">{t("resources.portalLink")}</span>
                  <span className="sr-only">
                    {t("resources.portalLinkAria", { carrier: name })}
                  </span>
                </PortalLink>
              </p>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
