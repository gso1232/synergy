import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * THE BLOG CONTENT LAYER — filesystem, not `messages/*.json`.
 *
 * Articles live in `content/blog/<locale>/<slug>.mdx`. They are deliberately
 * NOT in the message catalogue, for three reasons that were argued and
 * approved before any of this was written:
 *
 *   1. VOLUME. Twelve articles at ~1,200 words is ~15,000 words against a
 *      message file that currently holds 396 keys in total.
 *   2. MARKUP. An article needs h2s, lists, a summary block and an FAQ. The
 *      standing rule on this project is that message files never carry markup
 *      — it is the whole reason `useWordReveal` splits text at runtime rather
 *      than shipping spans in JSON. Article bodies cannot honour that rule, so
 *      they do not belong there.
 *   3. BUNDLE. A next-intl namespace reachable from a client component is
 *      serialised to the browser. Prose has no business in a client bundle.
 *
 * `messages/*.json` keeps only the CHROME — page titles, metadata, the
 * "min read" label, category labels, the CTA. Those are interface labels, and
 * interface labels are the one thing the standing rules allow to be authored.
 *
 * 🔴 `server-only` IS LOAD-BEARING. This module reads the filesystem. Importing
 * it from a client component would fail at build rather than at runtime, which
 * is the point — the failure is loud and early instead of a mystery in the
 * browser.
 */

export type ArticleMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /**
   * COMPUTED FROM THE BODY, never read from frontmatter.
   *
   * fflsynergy publishes a read time per article and those figures were
   * computed on THEIR originals — which included the rate tables and the
   * claims our rewrites remove. Shipping their number against our body made
   * every card overstate by three to four minutes. "N min read" is a
   * reader-facing fact, not a claim about Synergy, and a wrong one is simply
   * wrong. Deriving it here means it cannot drift again when an article is
   * edited.
   *
   * NULL for a frontmatter-only listing row: there is no body to measure, and
   * a card that cannot state a real figure states none. Those cards are not
   * links either — see `BlogCard`.
   */
  readingMinutes: number | null;
  /** Absent until a photograph is chosen and audited. */
  image?: string;
  imageAlt?: string;
  /**
   * FALSE until our version of the body is written, compliance-screened and
   * approved. The listing uses this to decide whether the card is a LINK.
   * See the note in `BlogCard`.
   */
  hasBody: boolean;
};

export type Article = ArticleMeta & { body: string; locale: string };

const ROOT = path.join(process.cwd(), "content", "blog");
const FALLBACK_LOCALE = "en";

/**
 * THE ORDER IS THE FILE `order.json`, NOT ALPHABETICAL AND NOT DATE.
 *
 * fflsynergy publishes NO DATES anywhere on their blog — the card meta is
 * category plus read time and nothing else, verified on the live listing. So
 * there is no date to sort by, and alphabetical order would scramble a
 * sequence the client arranged deliberately. The order file is theirs.
 */
function readOrder(): string[] {
  const p = path.join(ROOT, "order.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")) as string[];
}

/**
 * 🔴 THE es -> en FALLBACK IS BUILT HERE, EXPLICITLY, AND IT HAS TO BE.
 *
 * `i18n.ts` falls back to English for a missing or empty MESSAGE KEY. It knows
 * nothing about files on disk. Without the two lines below, a missing
 * `content/blog/es/<slug>.mdx` would 404 the whole Spanish article rather than
 * quietly rendering the English one — which is the behaviour every other
 * surface on this site already has, and the reason an untranslated page is a
 * working English page instead of a broken one.
 */
function resolveFile(locale: string, slug: string): string | null {
  const localised = path.join(ROOT, locale, `${slug}.mdx`);
  if (fs.existsSync(localised)) return localised;
  const fallback = path.join(ROOT, FALLBACK_LOCALE, `${slug}.mdx`);
  return fs.existsSync(fallback) ? fallback : null;
}

/** 225 words per minute, rounded up, floored at 1. */
function readingMinutesFor(body: string): number | null {
  if (!body) return null;
  return Math.max(1, Math.round(body.split(/\s+/).length / 225));
}

function parse(file: string, slug: string, locale: string): ArticleMeta & { locale: string } {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const body = content.trim();
  return {
    slug,
    locale,
    title: String(data.title ?? ""),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? ""),
    readingMinutes: readingMinutesFor(body),
    image: data.image ? String(data.image) : undefined,
    imageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
    // A frontmatter-only file (no prose under the `---`) is a LISTING ENTRY,
    // not an article. That is how the eleven unwritten articles appear in the
    // grid without promising a page that does not exist yet.
    hasBody: body.length > 0,
  };
}

export function getArticle(locale: string, slug: string): Article | null {
  const file = resolveFile(locale, slug);
  if (!file) return null;
  const { content } = matter(fs.readFileSync(file, "utf8"));
  const a = parse(file, slug, locale);
  return { ...a, body: content.trim() };
}

export type ArticleSection = {
  /** The heading as authored, or `null` for prose sitting before the first h2. */
  heading: string | null;
  /** Kebab slug of the heading. Image assignments are keyed on this, never on
   *  the section's INDEX — an index rots the moment a section is inserted, and
   *  a mis-keyed frame on this site is the failure that has already happened
   *  twice. See ARTICLE_FRAMES in the article template. */
  key: string;
  /** The section's own MDX, INCLUDING its `##` line, so MDXRemote still emits
   *  the heading and the document keeps exactly one h1 and its real h2s. */
  body: string;
};

/**
 * Split an article body into its h2 sections.
 *
 * 🔴 WHY THIS EXISTS AT ALL. The article template now runs the /services §4
 * layout — copy left, sticky image column right — and that layout is driven by
 * `useSequenceSwap`, which needs ONE DOM ELEMENT PER BLOCK to hang a
 * ScrollTrigger on. A single `<MDXRemote source={article.body} />` is one
 * element for the whole article, so there is nothing to trigger against. The
 * body has to arrive already cut at its h2s.
 *
 * `##` ONLY, never `###`. An h3 is a sub-point inside a section; promoting it
 * to a swap point would change the image mid-argument.
 */
export function splitSections(body: string): ArticleSection[] {
  const lines = body.split("\n");
  const out: ArticleSection[] = [];
  let current: ArticleSection | null = null;

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current) out.push(current);
      const heading = m[1];
      current = { heading, key: slugifyHeading(heading), body: line };
      continue;
    }
    if (!current) {
      // Prose before the first h2. Rare — this blog's articles all open on a
      // summary heading — but a preamble must not be silently dropped.
      if (!line.trim() && out.length === 0) continue;
      current = { heading: null, key: "preamble", body: line };
      continue;
    }
    current.body += "\n" + line;
  }
  if (current) out.push(current);
  return out.map((s) => ({ ...s, body: s.body.trim() }));
}

function slugifyHeading(h: string): string {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getAllArticles(locale: string): ArticleMeta[] {
  const order = readOrder();
  return order
    .map((slug) => {
      const file = resolveFile(locale, slug);
      return file ? parse(file, slug, locale) : null;
    })
    .filter((a): a is ArticleMeta & { locale: string } => a !== null);
}

/** Slugs with a real body — the only ones `generateStaticParams` may promise. */
export function getBuiltSlugs(locale: string): string[] {
  return getAllArticles(locale)
    .filter((a) => a.hasBody)
    .map((a) => a.slug);
}
