import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A production build writes into the same directory `next dev` is serving
  // from, which corrupts a running dev server's manifests and 500s it until the
  // cache is cleared. Setting NEXT_DIST_DIR lets a build go somewhere else:
  //   NEXT_DIST_DIR=.next-build npx next build
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // avif first, webp fallback. Next picks by Accept header and never emits a
    // derivative wider than the source, so the 7008px hero is only ever scaled
    // down — deviceSizes tops out at 3840, well inside it.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },

  /**
   * ==========================================================================
   * 🔴 /welcome IS RETIRED IN FAVOUR OF /agents. THE PAGES ARE NOT DELETED.
   *
   * The portal's four sections — licensing, contracting, resources, training —
   * were hardcoded React carrying seven `PortalPlaceholder` gaps: details
   * Synergy owed and a developer had to ship to supply. The same four are now
   * CMS rows Aiman edits himself, which is what the gaps were waiting for.
   *
   * The redirect lives HERE rather than in the page components for the reason
   * this codebase retires everything: `welcome/page.tsx`, `welcome/[section]/
   * page.tsx`, `PortalChrome` and the four section components are untouched and
   * still compile. Restoring the old portal is deleting this block. Rewriting
   * those files as redirect stubs would have destroyed them to reach the same
   * behaviour.
   *
   * 🔴 IT MAPS SECTION-BY-SECTION RATHER THAN DUMPING EVERYONE ON /agents. An
   * agent who bookmarked the contracting steps gets the contracting steps. A
   * blanket redirect to the index would make every one of those bookmarks
   * technically-working and practically useless.
   *
   * `permanent: false` (307) deliberately: a 308 is cached by browsers
   * indefinitely, and these mappings are a decision that could be revisited.
   * ==========================================================================
   */
  async redirects() {
    const SECTION_TO_SLUG = {
      licensing: "licensing-checklist",
      contracting: "new-agent-checklist",
      resources: "agent-resources",
      training: "bootcamps",
    };

    return [
      { source: "/:locale(en|es)/welcome", destination: "/:locale/agents", permanent: false },
      ...Object.entries(SECTION_TO_SLUG).map(([section, slug]) => ({
        source: `/:locale(en|es)/welcome/${section}`,
        destination: `/:locale/agents/${slug}`,
        permanent: false,
      })),
      /* Anything else under /welcome (a slug that never existed, or one added
         to the retired registry later) lands on the index rather than 404ing. */
      { source: "/:locale(en|es)/welcome/:rest*", destination: "/:locale/agents", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
