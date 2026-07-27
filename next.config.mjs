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
};

export default withNextIntl(nextConfig);
