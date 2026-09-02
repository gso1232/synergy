import { Link } from "@/navigation";
import BlogCardImage from "./BlogCardImage";
import type { ArticleMeta } from "@/lib/blog";

/**
 * One card in the blog grid — for-living.it/work's `.blog12_item`, re-measured
 * live today and rebuilt on cream.
 *
 * THEIRS, MEASURED AT 1536 x 710:
 *
 *   grid        2 columns, 631 wide, column gap 50, row gap 65-66
 *   image       631 x 391 -> ratio 1.615, `overflow: hidden`, object-fit cover
 *   image -> title   19px
 *   title row   ONE LINE: `Title · Excerpt`, both 20.5/28.7, ls -0.205px.
 *               Title at opacity 1, separator and excerpt at 0.5
 *   title -> tag     22px
 *   tag         12.3/13.53, ls +0.328px, uppercase, in a padded pill
 *
 * 🔴 THE EXCERPT DOES NOT SHARE THE TITLE'S LINE HERE, AND THAT IS A CONTENT
 * DECISION, NOT A TASTE ONE. Their excerpts are five to eight words ("Bespoke
 * interiors for a private Milan residence") so a title and an excerpt fit one
 * 631px line. fflsynergy's run 30 to 38 words — the longest is 38. On one line
 * that is four wraps, and the "·" separator stops reading as a separator the
 * moment the thing after it is a paragraph. The excerpt takes its own block.
 *
 * 🔴 NO DATE, because there is no date. fflsynergy publishes category and read
 * time and nothing else — verified on the live listing, where a scan for any
 * date format returned zero matches. A date is not withheld here; it does not
 * exist, and inventing one would be inventing content.
 *
 * 🔴 THE CARD IS A LINK ONLY WHEN THE ARTICLE HAS A BODY. Eleven of the twelve
 * are listing entries whose prose has not been written, screened and approved
 * yet. A card that looks like a link and 404s is exactly what `routes.ts`
 * exists to prevent — a link is a promise that a page exists. An unbuilt card
 * renders the same content with no href, no hover, no pointer and no tab stop,
 * so it makes no promise at all. It also carries NO "coming soon" label: that
 * would be a timeline claim, which the standing rules forbid outright.
 *
 * HOVER — rebuilt at a clean 1.02, image only. Theirs settles at 1.0177, which
 * is not a designed number (there is no CSS `:hover` rule at all; it is Webflow
 * IX2 writing an inline transform against a `transform 0.8s ease` base style).
 * At 694.8px wide the difference between 1.0177 and 1.02 is two tenths of a
 * pixel. Duration and easing are theirs exactly: 0.8s, ease.
 *
 * 🔴 THEIR "SEE MORE" CUSTOM CURSOR IS NOT REPRODUCED. It lives outside the
 * card in `.see-more-text-container` and follows the pointer. It is invisible
 * on touch, has no keyboard equivalent, and fights the OS pointer. Dropped on
 * instruction; the whole card is the link instead.
 *
 * REDUCED MOTION: `motion-reduce:transition-none` on the image kills the scale
 * transition. The hover is decoration — it tells you nothing the cursor and the
 * focus ring do not already say — so unlike the sequence swap on /services it
 * is switched off rather than made instant.
 */
export default function BlogCard({
  article,
  readLabel,
}: {
  article: ArticleMeta;
  /**
   * Already-formatted "5 min read", or NULL for a frontmatter-only listing row.
   * The minutes are COMPUTED from the body (see `lib/blog.ts`) — a row with no
   * body has no honest figure to show, so it shows none rather than a zero.
   */
  readLabel: string | null;
}) {
  const inner = (
    <>
      {article.image ? (
        <BlogCardImage src={article.image} alt={article.imageAlt ?? ""} />
      ) : (
        /* 🟡 PLACEHOLDER for a listing row with no photograph chosen. */
        <div className="blog-card-frame relative w-full overflow-hidden">
          <div className="blog-card-ph absolute inset-0" />
        </div>
      )}

      <h2 className="blog-card-title font-display text-navy">{article.title}</h2>
      <p className="blog-card-excerpt text-ink">{article.excerpt}</p>

      {/* CATEGORY + READ TIME, which is the whole of fflsynergy's card meta.
          The read-time NUMBER is theirs; the word "min read" is an interface
          label and lives in the message files so it can be translated. */}
      <p className="blog-card-meta">
        <span className="blog-tag">{article.category}</span>
        {readLabel ? <span className="blog-read">{readLabel}</span> : null}
      </p>
    </>
  );

  if (!article.hasBody) {
    return (
      <li className="blog-card" data-unbuilt="true">
        {inner}
      </li>
    );
  }

  return (
    <li className="blog-card">
      <Link href={`/blog/${article.slug}`} className="blog-card-link">
        {inner}
      </Link>
    </li>
  );
}
