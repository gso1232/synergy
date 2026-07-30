/**
 * MOCK DATA FOR THE ADMIN DESIGN PREVIEW. Phase 1 is design only.
 *
 * 🔴 NOTHING HERE IS REAL AND NOTHING HERE IS A DATA PATH. This is a hardcoded
 * module. There is no database, no fetch, no API route, no persistence: the
 * admin page imports these arrays at build time and the tables sort and filter
 * them in the browser. Reloading throws every change away, which is the point.
 *
 * THE FAKE RECORDS ARE FAKE BY CONSTRUCTION, not just by intention:
 *   - every email is on `example.com`, reserved by RFC 2606 and unroutable
 *   - every phone is in the 555-01xx block, reserved for fiction
 *   - every person's name is invented
 * A real lead record is PII. Seeding a preview with realistic-looking contact
 * details risks someone mistaking it for production data, or worse, acting on
 * it. These cannot be mistaken for anyone.
 *
 * THE CONTENT ROWS ARE THE EXCEPTION AND THEY ARE REAL — the twelve article
 * slugs, their build state and their compliance state are facts about this
 * repo (see lib/blog.ts `hasBody` and HANDOFF's blocked list), not invented
 * ones. That makes the third table useful to look at rather than decorative,
 * and it contains no personal data of any kind.
 *
 * When the real data path is built, this file is DELETED, not adapted.
 */

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";
export type LeadSource = "contact" | "calculator";

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  /** Key into `services.products.*.name`, so the admin names the seven products
   *  with the same strings /services and /join already render. */
  interest: "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7";
  sms: boolean;
  emailOptIn: boolean;
  status: LeadStatus;
  /** ISO date. Rendered through the page's formatter, never concatenated. */
  received: string;
};

export const MOCK_LEADS: LeadRow[] = [
  { id: "L-1041", name: "Dana Whitfield", email: "dana.whitfield@example.com", phone: "(407) 555-0148", source: "contact", interest: "p1", sms: true, emailOptIn: true, status: "new", received: "2026-07-29" },
  { id: "L-1040", name: "Marcus Iheanacho", email: "m.iheanacho@example.com", phone: "(407) 555-0192", source: "calculator", interest: "p4", sms: false, emailOptIn: true, status: "new", received: "2026-07-29" },
  { id: "L-1039", name: "Priya Raman", email: "priya.raman@example.com", phone: "(321) 555-0117", source: "contact", interest: "p6", sms: true, emailOptIn: false, status: "contacted", received: "2026-07-28" },
  { id: "L-1038", name: "Tomás Delgado", email: "t.delgado@example.com", phone: "(407) 555-0163", source: "contact", interest: "p2", sms: false, emailOptIn: false, status: "contacted", received: "2026-07-27" },
  { id: "L-1037", name: "Aisha Bello", email: "aisha.bello@example.com", phone: "(689) 555-0134", source: "calculator", interest: "p5", sms: true, emailOptIn: true, status: "qualified", received: "2026-07-26" },
  { id: "L-1036", name: "Grant Feltham", email: "g.feltham@example.com", phone: "(407) 555-0179", source: "contact", interest: "p3", sms: false, emailOptIn: true, status: "qualified", received: "2026-07-24" },
  { id: "L-1035", name: "Rosalind Achebe", email: "r.achebe@example.com", phone: "(321) 555-0155", source: "contact", interest: "p7", sms: true, emailOptIn: true, status: "closed", received: "2026-07-22" },
  { id: "L-1034", name: "Bao Nguyen", email: "bao.nguyen@example.com", phone: "(407) 555-0126", source: "calculator", interest: "p4", sms: false, emailOptIn: false, status: "closed", received: "2026-07-21" },
];

/** The four stages ARE the four public step headings on /join, deliberately:
 *  one vocabulary on the marketing page and in the admin, not two. */
export type AgentStage = "touch" | "meet" | "licensed" | "appointed";

export type AgentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  licensed: boolean;
  heard: "search" | "social" | "referral" | "event" | "other";
  stage: AgentStage;
  applied: string;
};

export const MOCK_AGENTS: AgentRow[] = [
  { id: "A-207", name: "Kiera Vance", email: "k.vance@example.com", phone: "(407) 555-0110", state: "FL", licensed: false, heard: "social", stage: "touch", applied: "2026-07-29" },
  { id: "A-206", name: "Osman Yilmaz", email: "o.yilmaz@example.com", phone: "(407) 555-0184", state: "FL", licensed: false, heard: "referral", stage: "touch", applied: "2026-07-28" },
  { id: "A-205", name: "Lena Kowalczyk", email: "l.kowalczyk@example.com", phone: "(321) 555-0139", state: "GA", licensed: false, heard: "search", stage: "meet", applied: "2026-07-25" },
  { id: "A-204", name: "Devon Pritchard", email: "d.pritchard@example.com", phone: "(689) 555-0171", state: "FL", licensed: true, heard: "event", stage: "licensed", applied: "2026-07-20" },
  { id: "A-203", name: "Ingrid Sørensen", email: "i.sorensen@example.com", phone: "(407) 555-0158", state: "NC", licensed: true, heard: "referral", stage: "appointed", applied: "2026-07-11" },
  { id: "A-202", name: "Hector Ramírez", email: "h.ramirez@example.com", phone: "(407) 555-0103", state: "FL", licensed: true, heard: "other", stage: "appointed", applied: "2026-07-03" },
];

export type ContentStatus = "published" | "listing" | "draft";
export type ContentCompliance = "screened" | "pending" | "blocked";

export type ContentRow = {
  id: string;
  title: string;
  slug: string;
  type: "article" | "page";
  /** `en` alone means es.json falls back to English for this route. */
  locales: string;
  status: ContentStatus;
  compliance: ContentCompliance;
  updated: string;
};

/** REAL repo state, not invented — see the docblock. `listing` mirrors
 *  lib/blog.ts's `hasBody === false`; `blocked` is HANDOFF's list of the three
 *  articles whose TITLES carry the tax-treatment claim. */
export const MOCK_CONTENT: ContentRow[] = [
  { id: "C-01", title: "Living Benefits", slug: "living-benefits", type: "article", locales: "EN", status: "published", compliance: "screened", updated: "2026-07-28" },
  { id: "C-02", title: "Final Expense Insurance", slug: "final-expense-insurance", type: "article", locales: "EN", status: "published", compliance: "screened", updated: "2026-07-28" },
  { id: "C-03", title: "Term Life Insurance", slug: "term-life-insurance", type: "article", locales: "EN", status: "published", compliance: "screened", updated: "2026-07-28" },
  { id: "C-04", title: "Indexed Universal Life (IUL)", slug: "indexed-universal-life-iul", type: "article", locales: "EN", status: "listing", compliance: "pending", updated: "2026-07-26" },
  { id: "C-05", title: "Mortgage Protection Insurance", slug: "mortgage-protection-insurance", type: "article", locales: "EN", status: "listing", compliance: "pending", updated: "2026-07-26" },
  { id: "C-06", title: "Fixed Indexed Annuity (FIA)", slug: "fixed-indexed-annuity-fia", type: "article", locales: "EN", status: "listing", compliance: "pending", updated: "2026-07-26" },
  { id: "C-07", title: "ITIN Holders Life Insurance", slug: "itin-holders-life-insurance", type: "article", locales: "EN", status: "listing", compliance: "pending", updated: "2026-07-26" },
  { id: "C-08", title: "Life Insurance Orlando", slug: "life-insurance-orlando", type: "article", locales: "EN", status: "listing", compliance: "pending", updated: "2026-07-26" },
  { id: "C-09", title: "Truck Drivers Retirement", slug: "truck-drivers-retirement", type: "article", locales: "EN", status: "listing", compliance: "pending", updated: "2026-07-26" },
  { id: "C-10", title: "Nurses Tax-Free Retirement", slug: "nurses-tax-free-retirement", type: "article", locales: "EN", status: "listing", compliance: "blocked", updated: "2026-07-26" },
  { id: "C-11", title: "IUL vs 401k (Construction)", slug: "iul-vs-401k-construction", type: "article", locales: "EN", status: "listing", compliance: "blocked", updated: "2026-07-26" },
  { id: "C-12", title: "IUL for the Self-Employed", slug: "iul-self-employed", type: "article", locales: "EN", status: "listing", compliance: "blocked", updated: "2026-07-26" },
  { id: "C-13", title: "About", slug: "about", type: "page", locales: "EN", status: "published", compliance: "screened", updated: "2026-07-30" },
  { id: "C-14", title: "Services", slug: "services", type: "page", locales: "EN", status: "published", compliance: "screened", updated: "2026-07-29" },
  { id: "C-15", title: "Join", slug: "join", type: "page", locales: "EN", status: "published", compliance: "screened", updated: "2026-07-30" },
  { id: "C-16", title: "Contact", slug: "contact", type: "page", locales: "EN", status: "published", compliance: "screened", updated: "2026-07-29" },
];

export const MOCK_STATS = {
  leads: MOCK_LEADS.length,
  leadsNew: MOCK_LEADS.filter((l) => l.status === "new").length,
  apps: MOCK_AGENTS.filter((a) => a.stage === "touch" || a.stage === "meet").length,
  articles: MOCK_CONTENT.filter((c) => c.type === "article" && c.status === "published").length,
};
