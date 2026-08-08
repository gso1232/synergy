/**
 * THE PORTAL'S SECTION REGISTRY — one list, read by the nav, the overview cards,
 * the pager and the route's param validation.
 *
 * 🔴 IT EXISTS BECAUSE THE PORTAL STOPPED BEING ONE PAGE. The first build put
 * all four sections on /welcome as a single 6,606px scroll; an agent who came
 * back to check step six had to hunt for it. Each section is now its own route,
 * which means four surfaces that can disagree about what exists — a nav item
 * pointing at a dead section, a card counting steps that moved. This list is the
 * one place that knows, so they cannot drift.
 *
 * `gaps` is the number of PortalPlaceholder blocks in that section. It is
 * declared rather than counted because the count has to be available to the
 * overview WITHOUT rendering the section, and a number that quietly goes stale
 * is worse than no number — so `scripts/check-portal-gaps.mjs` fails the build
 * if a declared count stops matching the components.
 */

export const PORTAL_SECTIONS = [
  { key: "licensing", steps: 8, gaps: 2 },
  { key: "contracting", steps: 6, gaps: 3 },
  { key: "resources", steps: 0, gaps: 1 },
  { key: "training", steps: 0, gaps: 1 },
] as const;

export type PortalSectionKey = (typeof PORTAL_SECTIONS)[number]["key"];

export const SECTION_KEYS = PORTAL_SECTIONS.map((s) => s.key) as readonly PortalSectionKey[];

export function isSectionKey(v: string | undefined): v is PortalSectionKey {
  return !!v && (SECTION_KEYS as readonly string[]).includes(v);
}

export function sectionMeta(key: PortalSectionKey) {
  return PORTAL_SECTIONS.find((s) => s.key === key)!;
}

/** Previous / next in reading order, for the pager at the foot of each section. */
export function neighbours(key: PortalSectionKey) {
  const i = SECTION_KEYS.indexOf(key);
  return {
    prev: i > 0 ? SECTION_KEYS[i - 1] : null,
    next: i < SECTION_KEYS.length - 1 ? SECTION_KEYS[i + 1] : null,
  };
}

/** Total outstanding Synergy details, shown on the overview. */
export const TOTAL_GAPS = PORTAL_SECTIONS.reduce((n, s) => n + s.gaps, 0);
