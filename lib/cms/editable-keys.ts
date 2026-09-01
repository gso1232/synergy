import en from "@/messages/en.json";

/**
 * Which strings the admin panel is allowed to edit, and how they are grouped
 * for a human.
 *
 * =============================================================================
 * 🔴 DERIVED FROM messages/en.json, NEVER HAND-MAINTAINED. The list is walked
 * out of the catalogue at module load, so adding a string to the JSON makes it
 * editable automatically and deleting one removes it. A hand-written list would
 * drift the first time somebody added a heading, and the drift would be
 * invisible — the new string simply would not appear in the editor.
 *
 * =============================================================================
 * 🔴 STAFF NAMESPACES ARE EXCLUDED, AND THAT IS A SECURITY DECISION AS MUCH AS
 * A TIDINESS ONE.
 *
 *   admin   the admin panel's own chrome. Editable copy here would let a
 *           compromised admin session reword the tooling — relabel "Deactivate"
 *           as "Save", for instance — which is a social-engineering primitive
 *           aimed at the next admin, not a content feature.
 *   portal  the retired /welcome portal. Not rendered.
 *   login · forgot · reset · pending · agents
 *           authentication and gated flows. Their wording carries security
 *           meaning ("your account is pending approval") and is not marketing
 *           copy. Editing it is a developer change, deliberately.
 *
 * Everything else IS public marketing copy, which is exactly what Aiman should
 * own without waiting for a deploy.
 */

const EXCLUDED_NAMESPACES = new Set([
  "admin",
  "portal",
  "login",
  "forgot",
  "reset",
  "pending",
  "welcome",
  "agents",
]);

/**
 * The groups the editor renders, in page order. A namespace not listed here
 * still ends up editable — it falls into "Other" — so forgetting to add one is
 * a cosmetic problem rather than a functional one.
 *
 * The mapping is by PAGE rather than by namespace because that is how the
 * person editing thinks: he wants "the words on the homepage", not "the
 * `whoWeServe` namespace".
 */
export const GROUPS: { id: string; label: string; namespaces: string[] }[] = [
  {
    id: "home",
    label: "Homepage",
    namespaces: [
      "hero",
      "two",
      "whoWeServe",
      "whatWeCover",
      "whySynergy",
      "howItWorks",
      "testimonials",
      "carriers",
      "consultation",
      "cta",
      "engine",
      // The impact band's three figures and their labels. It was reaching the
      // editor already, but through the "other" fallback, which is not where
      // anyone editing the homepage would look for it.
      "impact",
      // 🔴 THE SECTION CHROME ONLY. The five review texts are NOT here and must
      // not be added: they are verbatim, attributed statements by named members
      // of the public, and an edit box over them is a tool for altering what
      // someone said about this business. See the header of
      // components/GoogleReviews.tsx.
      "googleReviews",
    ],
  },
  { id: "about", label: "About page", namespaces: ["about"] },
  { id: "services", label: "Services page", namespaces: ["services"] },
  { id: "join", label: "Join / careers page", namespaces: ["join"] },
  { id: "contact", label: "Contact page", namespaces: ["contact"] },
  { id: "calculator", label: "Calculator", namespaces: ["calculator"] },
  { id: "blog", label: "Blog listing", namespaces: ["blog"] },
  {
    id: "shared",
    label: "Shared — menu, footer, popups",
    namespaces: ["nav", "footer", "leadModal", "meta"],
  },
];

export type EditableString = {
  /** Dotted next-intl path, e.g. "about.hero.title". */
  key: string;
  /** The repo's original copy, for "reset" and for showing what changed. */
  original: string;
  group: string;
};

function walk(
  node: unknown,
  path: string[],
  out: EditableString[],
  group: string,
): void {
  if (typeof node === "string") {
    // Empty strings in es.json are intentional fallback markers, but this walk
    // runs over EN, where an empty value means the string is unused. Skipping
    // them keeps rows nobody renders out of the editor.
    if (node.trim() === "") return;
    out.push({ key: path.join("."), original: node, group });
    return;
  }
  if (!node || typeof node !== "object" || Array.isArray(node)) return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    walk(v, [...path, k], out, group);
  }
}

function build(): EditableString[] {
  const catalogue = en as unknown as Record<string, unknown>;
  const groupOf = new Map<string, string>();
  for (const g of GROUPS) for (const ns of g.namespaces) groupOf.set(ns, g.id);

  const out: EditableString[] = [];
  for (const [ns, value] of Object.entries(catalogue)) {
    if (EXCLUDED_NAMESPACES.has(ns)) continue;
    walk(value, [ns], out, groupOf.get(ns) ?? "other");
  }
  return out;
}

/** Every editable string, with its original copy. Built once per process. */
export const EDITABLE_STRINGS: EditableString[] = build();

/** Fast membership test for the server action's allowlist check. */
export const EDITABLE_KEYS: Set<string> = new Set(
  EDITABLE_STRINGS.map((s) => s.key),
);
