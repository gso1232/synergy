/**
 * CARRIER SERVICE LINES AND AGENT PORTALS, for the agent portal's resources
 * section.
 *
 * =============================================================================
 * 🔴 NAMES ARE NOT HERE. They are keyed to `carriers.names.*` in the message
 * files — the same strings the homepage marquee and the /about logo wall
 * render. A carrier renamed in one place is renamed everywhere, and the portal
 * can never call a carrier something the marketing site does not.
 *
 * 🔴 THE KEY IS THE APPOINTMENT KEY. `c1`…`c21` are the confirmed appointments
 * in lib/carrierLogos.ts. A contact may only be listed here if its key is in
 * that map, which is the mechanical form of the rule below.
 *
 * =============================================================================
 * 🔴 ONLY CARRIERS SYNERGY IS APPOINTED WITH.
 *
 * The source list this was rewritten from was another agency's, and their
 * appointments are not ours. Every entry below was cross-checked against the 21
 * keys in `lib/carrierLogos.ts` (the marketing logo strip) before it was
 * allowed in. All eight of the source's carriers matched, so none were dropped
 * — but the check is the point, not the result. **Anything added here later
 * must clear the same check**, and `assertContractedCarriers()` below fails
 * loudly if it does not.
 *
 * =============================================================================
 * 🟡 THE NUMBERS AND URLS ARE TRANSCRIBED, NOT VERIFIED. They came from the
 * supplied source document, not from the carriers. They are public service
 * lines, which is why they are keepable at all, but nobody here has dialled
 * them. Spot-check before this page goes in front of agents — a dead agent-
 * support number is worse than no number, because it costs a call to discover.
 */

import { LOGO_FILE } from "@/lib/carrierLogos";

export type CarrierContact = {
  /** Appointment key — must exist in LOGO_FILE. Name comes from carriers.names[key]. */
  key: string;
  /** Main service line, as printed. */
  phone: string;
  /** Second line where the carrier publishes a separate agent desk. */
  agentPhone?: string;
  /** Agent portal / producer login. */
  url: string;
};

export const CARRIER_CONTACTS: CarrierContact[] = [
  {
    key: "c19", // National Life Group
    phone: "1-800-906-3310",
    url: "https://www.nationallife.com/agent/tools/contact-us/contact-information",
  },
  {
    key: "c18", // F&G
    phone: "1-800-445-6758",
    url: "https://saleslink.fglife.com/",
  },
  {
    key: "c7", // Athene
    phone: "1-888-266-8489",
    url: "https://www.athene.com/producer/login",
  },
  {
    key: "c13", // Aetna
    phone: "1-866-272-6630",
    url: "https://www.aetnaseniorproducts.com/ssi/secure/agentSecure/myCompass.html",
  },
  {
    key: "c11", // Foresters
    phone: "1-866-466-7166",
    url: "https://myezbiz.foresters.com/my.policy",
  },
  {
    key: "c5", // North American
    phone: "1-800-800-3656",
    url: "https://www.northamericancompany.com/",
  },
  {
    key: "c1", // Mutual of Omaha — publishes a separate agent support desk
    phone: "1-800-867-6873",
    agentPhone: "1-800-475-4465",
    url: "https://accounts.mutualofomaha.com/",
  },
  {
    key: "c8", // Corebridge
    phone: "1-800-677-3311",
    url: "https://www.connext.corebridgefinancial.com/life/connext-portal/public/login",
  },
];

/**
 * Build-time guard: every listed contact is a confirmed appointment.
 *
 * 🔴 IT THROWS RATHER THAN FILTERS. Silently dropping an unrecognised key would
 * hide the mistake — an agent would simply never see a carrier someone believed
 * they had added, and nobody would know why. A build that stops names the key.
 */
export function assertContractedCarriers(): void {
  const unknown = CARRIER_CONTACTS.filter((c) => !LOGO_FILE[c.key]).map((c) => c.key);
  if (unknown.length) {
    throw new Error(
      `carrierContacts: ${unknown.join(", ")} ${unknown.length === 1 ? "is" : "are"} not a ` +
        `confirmed Synergy appointment. Only carriers in lib/carrierLogos.ts may be listed. ` +
        `Add the appointment there first, or remove the contact.`,
    );
  }
}
