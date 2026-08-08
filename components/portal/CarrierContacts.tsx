import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { CARRIER_CONTACTS, assertContractedCarriers } from "@/lib/portal/carrierContacts";
import { carrierLogoSrc } from "@/lib/carrierLogos";
import { PortalLink } from "./PortalPrimitives";

/**
 * CARRIER SERVICE LINES AND AGENT PORTALS.
 *
 * 🔴 NAMES COME FROM `carriers.names.*`, NOT FROM THE CONTACT TABLE. Those are
 * the strings the homepage marquee and the /about logo wall already render, so
 * the portal cannot call a carrier something the marketing site does not. The
 * contact file carries only phone numbers and URLs — see its docblock for why
 * the appointment cross-check lives there.
 *
 * 🔴 IT IS A LIST, NOT A `<table>`. Three fields per carrier, one absent for
 * seven of the eight, is not tabular data — it is eight small records. A real
 * table would need a horizontal scroller at phone width to show a column that is
 * empty in most rows. Marked up as a description list: the carrier name is the
 * term, its contacts are the details.
 *
 * §AA on the light surface, measured composited:
 *   ink        on white   17.41:1   carrier name
 *   ink/75     on white    8.59:1   the dialable number
 *   ink/70     on white    6.34:1   the field label
 *   gold-deep  on white    5.65:1   portal link + focus ring
 *
 * 🔴 THE LOGO NEEDS NO CONTRAST TREATMENT AND MUST NOT BE GIVEN ONE. WCAG 1.4.3
 * exempts brand marks. It is `aria-hidden` because the carrier name sits beside
 * it in text; alt text would only repeat it. It keeps a white tile because
 * several of these marks are themselves light-on-dark artwork.
 */
export default async function CarrierContacts({ locale }: { locale: string }) {
  /* Fails the render — and therefore the build — if anyone lists a carrier
     Synergy is not appointed with. See assertContractedCarriers. */
  assertContractedCarriers();

  const t = await getTranslations({ locale, namespace: "portal" });
  const c = await getTranslations({ locale, namespace: "carriers" });

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {CARRIER_CONTACTS.map((carrier) => {
        const name = c(`names.${carrier.key}`);
        return (
          <div
            key={carrier.key}
            className="rounded-xl border border-ink/[0.10] bg-white p-4 shadow-[0_1px_2px_rgba(26,26,26,0.04)]"
          >
            <dt className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink/[0.08] bg-cream p-1">
                <Image
                  src={carrierLogoSrc(carrier.key)}
                  alt=""
                  aria-hidden="true"
                  width={28}
                  height={28}
                  className="h-auto max-h-[22px] w-auto max-w-[26px] object-contain"
                />
              </span>
              <span className="font-display text-[16px] font-medium leading-[1.2] text-ink">
                {name}
              </span>
            </dt>

            <dd className="mt-3 space-y-1">
              <ContactRow label={t("resources.phoneLabel")} value={carrier.phone} />
              {carrier.agentPhone ? (
                <ContactRow label={t("resources.agentPhoneLabel")} value={carrier.agentPhone} />
              ) : null}
              <p className="pt-0.5">
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

/** A dialable number with its label. `py-1` keeps the tap target over 24px. */
function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70">{label}</span>
      <a
        href={`tel:${value.replace(/[^\d+]/g, "")}`}
        className="inline-block py-1 font-mono text-[14px] text-ink/75 underline decoration-ink/25 underline-offset-4 transition-colors duration-200 hover:text-gold-deep hover:decoration-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
      >
        {value}
      </a>
    </p>
  );
}
