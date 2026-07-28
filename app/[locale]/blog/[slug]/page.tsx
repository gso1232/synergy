import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/navigation";
import FadeUp from "@/components/FadeUp";
import { getArticle, getBuiltSlugs } from "@/lib/blog";

/**
 * /[locale]/blog/[slug] — the article template.
 *
 * Modelled on **for-living.it/work/casa-brera**, measured live today.
 *
 * THEIRS, AT 1536:
 *
 *   h1          73.8/81.18, w400, uppercase display face, at the 105 gutter
 *   deck        18.45/25.83, flush under the h1 (zero gap)
 *   body        16.4/24.6 (lh 1.50) in a 492px column — about 60 characters
 *   meta        two label columns parked right, at x=1007 and x=1273
 *   feature     1312 x 887 (ratio 1.479), full container width
 *   2-up        two images at 640 wide, 32px gap
 *   page        2268 tall, exactly one <h1>
 *
 * WHAT CARRIES OVER AND WHAT DOES NOT:
 *
 * ✅ The narrow measure. 492px at 16.4px is ~60 characters, and a 60-character
 *    measure is the single most valuable thing on their article page. Ours uses
 *    `.sem-body` in a `65ch` column, which lands in the same band at every
 *    width rather than being pinned to one pixel value.
 *
 * 🔴 THE RIGHT-HAND META COLUMNS ARE DROPPED. Theirs carry Services, Location
 *    and Size — project facts for an interiors job. A blog article has category
 *    and read time and nothing else, because fflsynergy publishes no dates
 *    (verified: a scan of the live listing for any date format returns zero).
 *    Two columns holding two short strings is a layout looking for content.
 *    Category and read time sit under the h1 instead.
 *
 * 🟡 THE FEATURE AND 2-UP IMAGERY IS NOT WIRED. No photograph has been chosen
 *    — sourcing is deliberately held until the articles are settled. The
 *    template renders correctly without it and the slots are additive.
 *
 * 🔴 COMPLIANCE. This article's prose is fflsynergy's, REWRITTEN where their
 *    published wording breaches the standing rules. Every change is listed in
 *    HANDOFF with the published line quoted. Two things carry through every
 *    article on this blog and both are live here:
 *
 *      1. NO TAX-TREATMENT ASSERTION ANYWHERE, pending Ziad — the same status
 *         `services.essay.b1` holds. Their published FAQ answer *"generally
 *         tax-free under IRS Section 101(g)"* and the body's *"is typically
 *         tax-free"* are BOTH OMITTED, not reworded, exactly as the "coverage
 *         is guaranteed for life" clause was omitted on /services.
 *      2. No unverified volume claims, superlatives or market-wide assertions.
 */

export async function generateStaticParams() {
  return getBuiltSlugs("en").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const article = getArticle(locale, slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const article = getArticle(locale, slug);

  // A frontmatter-only entry is a LISTING ROW, not a page. It must 404 rather
  // than render an empty article — the listing already refuses to link it, and
  // this is the second half of the same promise.
  if (!article || !article.hasBody) notFound();

  return (
    <main className="about-page page-header-offset min-h-screen">
      <article className="sem-shell sem-pad-t">
        <div className="sem-inner">
          <FadeUp>
            {/* BACK LINK FIRST IN THE READING ORDER, like theirs ("All
                Articles" sits above the title on fflsynergy's own article
                pages too). */}
            <p className="blog-back">
              <Link href="/blog">{t("allArticles")}</Link>
            </p>

            <h1 className="sem-h2 mt-6 max-w-[20ch] font-display text-ink">
              {article.title}
            </h1>

            <p className="blog-card-meta mt-6">
              <span className="blog-tag">{article.category}</span>
              {article.readingMinutes ? (
                <span className="blog-read">
                  {t("readTime", { minutes: article.readingMinutes })}
                </span>
              ) : null}
            </p>
          </FadeUp>

          {/* THE PROSE COLUMN — their 492px measure, expressed as 65ch so it
              holds the same character count at every width instead of one
              pixel value at one width. */}
          <div className="blog-prose">
            <MDXRemote source={article.body} />
          </div>
        </div>
      </article>

      <div className="h-[clamp(64px,8.6vw,131.2px)]" />
    </main>
  );
}
