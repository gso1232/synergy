import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/navigation";
import FadeUp from "@/components/FadeUp";
import ArticleEssay from "@/components/ArticleEssay";
import RevealText from "@/components/RevealText";
import { getArticle, getBuiltSlugs, splitSections } from "@/lib/blog";

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
 * 🔴 THE RIGHT-HAND META COLUMNS ARE DROPPED. Theirs carry Services, Location
 *    and Size — project facts for an interiors job. A blog article has category
 *    and read time and nothing else, because fflsynergy publishes no dates
 *    (verified: a scan of the live listing for any date format returns zero).
 *    Two columns holding two short strings is a layout looking for content.
 *    Category and read time sit under the h1 instead.
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
 *
 * =========================================================================
 * 🔴 THE CENTRING IS REVERSED. THIS IS /services §4, EXACTLY.
 * =========================================================================
 *
 * The previous build put the back link, h1, meta line and prose inside one
 * `.blog-measure` wrapper — `max-width: 31em; margin-inline: auto` — and made
 * the article the only centred route on the site. That wrapper is gone. The
 * page now runs the essay pairing off `/services` §4, class for class:
 *
 *     .essay-grid     grid 1.75fr / 1fr, gap 131.2px, align-items start
 *     .essay-copy     the prose, LEFT, first in the DOM as well as on screen
 *     .essay-sticky   position sticky, top 8rem, `display:none` at <= 991
 *     .essay-frame    aspect-ratio 2 / 3, the `.services-frame` shadow
 *
 * Nothing here re-derives those numbers and nothing here overrides them: both
 * routes read the same rules in globals.css, so they cannot drift apart. What
 * that resolves to at 1536 is the measurement already recorded for /services —
 * container 1438.8 inside the 41px gutters, free track space 1438.8 - 131.2 =
 * 1307.6, columns 832.1 (copy) and 475.5 (frame).
 *
 * 🔴 THE MEASURE IS 86 CHARACTERS AND IT IS ACCEPTED, NOT FIXED. That is the
 * number /services ships (min 76, max 93 at 1536) and it is outside the 45-75
 * band the centred build was built around. It was raised, argued and ACCEPTED
 * ON INSTRUCTION: the copy column is not to be narrowed to correct it. What
 * WAS changed is the type, and only because narrowing was off the table — the
 * prose ramp moved from the article's own `clamp(16.5, .36vw + 15, 19.5)` to
 * `.sem-body`'s `clamp(18.98, .305vw + 16.67, 21.32)`, which is the exact ramp
 * the 86-character figure was measured on. At 19.5px in an 832.1px column the
 * same line runs ~93 characters; at 21.32px it runs ~85. Same column, same
 * gutter, different type — see the note on `.blog-prose` in globals.css.
 *
 * 🔴 WHAT KILLED THIS LAYOUT LAST TIME, AND WHAT ANSWERS IT NOW. The objection
 * on record was that /services can hold a sticky column only because it has an
 * image for EVERY block, so no scroll position is unfilled, whereas an article
 * would leave the column empty for most of its length. That objection is real
 * and it is answered by construction rather than by argument: sections that do
 * not qualify for a frame INHERIT one (see ARTICLE_FRAMES below), so the
 * column is never empty at any scroll position.
 *
 * 🔴 THE /blog LISTING HERO IS UNTOUCHED — still left-railed and full-bleed.
 *
 * 🔴 ANY FUTURE FEATURE IMAGE GOES FULL-BLEED, NOT IN THE COPY COLUMN. Body
 * images inside the column are a different thing — see `.blog-figure`.
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

/* =========================================================================
   THE FRAMES — keyed on the heading slug, never on the section index.

   🔴 THE ONLY RULE ON THIS TABLE THAT DOES NOT BEND: no frame may show
   illness, distress, grief, dereliction, abandonment or scattered paperwork.
   It has been broken twice on this project — a derelict study under a block
   about what reaches your family (Pexels `14201540`, replaced), and paperwork
   strewn across the floor of an abandoned building under the ITIN article
   (Pexels `4553661`, replaced). Both had good luminance numbers and both were
   caught only by opening the file. Every frame below was viewed at full
   resolution before it was written, and two were RE-CROPPED after that
   viewing: `article-pigeonholes` to drop a red FIRE ALARM box from the left
   wall, `article-colonnade-doors` to drop a devotional statuette from a
   glass-fronted cabinet at the right edge. Sources, crops and the luminance
   ladder are recorded in public/synergy/CREDITS.md.

   WHICH SECTIONS QUALIFY. A section gets a frame if it is substantive body
   prose. It does NOT if it is (a) a summary or abstract, (b) an FAQ, or
   (c) a single paragraph — in all three cases the section is either restating
   the article or is too short to hold a frame's worth of scroll, and a frame
   that swaps in and straight out again reads as a glitch.

   WHAT A SKIPPED SECTION DOES WITH ITS SLOT — and this is the part that makes
   the layout survivable on an article: NOTHING SWAPS. The sticky column keeps
   showing the frame of the nearest qualifying section ABOVE, and any section
   above the FIRST qualifying one shows the first frame. So on this article the
   summary opens on the products frame rather than on a hole, and the FAQ
   closes still holding the "what to have ready" frame. The column is never
   blank, never shows a frame invented for a section that has none, and never
   flickers. The frames are `alt=""` and `aria-hidden` (see ArticleEssay), so
   holding one across a section boundary asserts nothing about that section.

   Unlisted slug -> no frame of its own -> inherits. Adding an article means
   adding a key here; forgetting to is not a crash, it is inheritance.
   ========================================================================= */
const ARTICLE_FRAMES: Record<string, Record<string, string>> = {
  "life-insurance-orlando": {
    "which-products-are-available": "/synergy/article-arched-windows.jpg",
    "what-it-costs": "/synergy/article-stair-concrete.jpg",
    "what-a-broker-does-that-a-captive-agent-cannot":
      "/synergy/article-colonnade-doors.jpg",
    "what-to-have-ready": "/synergy/article-pigeonholes.jpg",
  },

  "term-life-insurance": {
    "what-is-term-life-insurance-and-how-does-it-work":
      "/synergy/article-tree-avenue.jpg",
    "how-much-coverage-do-i-need": "/synergy/article-timber-beams.jpg",
    "10-20-or-30-years-how-do-they-differ":
      "/synergy/article-concrete-atrium.jpg",
    "what-does-it-cost": "/synergy/article-reservoir-bridge.jpg",
    "what-happens-when-the-term-expires": "/synergy/article-stone-terrace.jpg",
    "can-i-convert-to-a-permanent-policy": "/synergy/article-vaulted-walk.jpg",
  },

  "final-expense-insurance": {
    "how-is-it-different-from-regular-life-insurance":
      "/synergy/article-tile-threshold.jpg",
    "who-qualifies": "/synergy/article-tiled-courtyard.jpg",
    "is-a-medical-exam-required": "/synergy/article-roof-frame.jpg",
    "guaranteed-issue-and-simplified-issue":
      "/synergy/article-stair-flights.jpg",
    "how-do-i-choose-a-policy": "/synergy/article-kitchen-garden-gate.jpg",
  },

  "mortgage-protection-insurance": {
    "what-is-mortgage-protection-insurance":
      "/synergy/article-garden-gate-pond.jpg",
    "how-is-it-different-from-pmi": "/synergy/article-sash-windows.jpg",
    "how-is-it-different-from-term-life-insurance":
      "/synergy/article-green-louvres.jpg",
    "what-does-it-cover": "/synergy/article-timber-canopy.jpg",
    "where-its-limits-are": "/synergy/article-white-cliffs.jpg",
  },

  "indexed-universal-life-iul": {
    "how-the-crediting-actually-works": "/synergy/article-glazed-dome.jpg",
    "what-the-floor-does-not-do": "/synergy/article-encaustic-floor.jpg",
    "how-is-it-different-from-whole-life-and-term":
      "/synergy/article-landing-skylight.jpg",
    "using-the-cash-value": "/synergy/article-white-spiral.jpg",
    "the-risks-stated-plainly": "/synergy/article-brick-arches.jpg",
  },

  "fixed-indexed-annuity-fia": {
    "what-is-a-fixed-indexed-annuity": "/synergy/article-stone-arcade.jpg",
    "how-the-crediting-works": "/synergy/article-forest-light.jpg",
    "where-the-cost-sits": "/synergy/article-field-track.jpg",
    "the-two-halves": "/synergy/article-dune-path.jpg",
    "surrender-charges-the-constraint-that-matters-most":
      "/synergy/article-hillside-steps.jpg",
  },

  "truck-drivers-retirement": {
    "why-the-usual-advice-does-not-fit": "/synergy/article-rail-canopy.jpg",
    "what-an-iul-does-differently": "/synergy/article-farm-track.jpg",
    "the-risk-that-comes-with-that-flexibility":
      "/synergy/article-timber-trusses.jpg",
    "how-the-cash-value-works": "/synergy/article-reed-boardwalk.jpg",
    "using-the-cash-value-on-the-road": "/synergy/article-forest-track.jpg",
  },

  "itin-holders-life-insurance": {
    "what-types-of-cover-are-available": "/synergy/article-open-gate.jpg",
    "why-an-iul-comes-up-often-in-this-context": "/synergy/article-sea-deck.jpg",
    "what-the-application-involves": "/synergy/article-patterned-tiles.jpg",
  },

  "living-benefits": {
    "the-three-types-of-living-benefits": "/synergy/article-woodland-path.jpg",
    "why-living-benefits-matter-for-your-financial-plan":
      "/synergy/article-sea-terrace.jpg",
    "which-life-insurance-policies-include-living-benefits":
      "/synergy/article-olive-hillside.jpg",
  },
};

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

  const sections = splitSections(article.body);
  const assigned = ARTICLE_FRAMES[slug] ?? {};

  // The frame list, in the order the sections that own them appear, plus the
  // per-section lookup. Built in one pass so the two can never disagree.
  const frames: string[] = [];
  const frameOf: number[] = [];
  for (const s of sections) {
    const src = assigned[s.key];
    if (src) frames.push(src);
    // -1 while no frame has been seen yet; resolved to 0 below. A leading
    // summary therefore opens on the first frame instead of on nothing.
    frameOf.push(frames.length - 1);
  }
  const blocks = sections.map((s, i) => ({
    key: s.key,
    frame: Math.max(0, frameOf[i]),
    content: <MDXRemote source={s.body} />,
  }));

  const header = (
    <FadeUp>
      {/* BACK LINK FIRST IN THE READING ORDER, like theirs ("All Articles"
          sits above the title on fflsynergy's own article pages too). */}
      <p className="blog-back">
        <Link href="/blog">{t("allArticles")}</Link>
      </p>

      {/* `max-w-[20ch]` REMOVED long ago — it measured 707.2px at 1536 against
          a 552px body. The copy COLUMN is the only measure now, and at 832.1px
          it is wider than that cap ever was, so no cap can apply. */}
      <RevealText
        as="h1"
        text={article.title}
        className="sem-h2 mt-6 font-display text-ink"
      />

      <p className="blog-card-meta mt-6">
        <span className="blog-tag">{article.category}</span>
        {article.readingMinutes ? (
          <span className="blog-read">
            {t("readTime", { minutes: article.readingMinutes })}
          </span>
        ) : null}
      </p>
    </FadeUp>
  );

  return (
    <main className="about-page page-header-offset min-h-screen">
      <article className="sem-shell sem-pad-t">
        <div className="sem-inner">
          {/* 🔴 NO FALLBACK BRANCH, AND THAT IS A DELIBERATE STATE, NOT AN
              OVERSIGHT. Every article with a body has frames — all nine, 41
              frames in total — so `frames.length === 0` is unreachable for any
              page that renders. The three frontmatter-only entries 404 above.

              A branch DID exist for one pass, rendering the old `.blog-measure`
              centred build for articles awaiting frames, and it is recorded
              here because the measurement that forced it is worth keeping: an
              unpaired `.essay-copy` inside `.sem-inner` renders 1,505px at
              1536 and the prose runs a median of 217 characters per line. So
              if a TENTH article is ever written, it must arrive with its frames
              or it will render at 217 characters. Either source its frames
              before shipping the body, or restore the branch —
              `.blog-measure` is kept commented in globals.css for exactly
              that. What must NOT happen is a body shipping unpaired. */}
          <ArticleEssay header={header} blocks={blocks} frames={frames} />
        </div>
      </article>

      <div className="h-[clamp(64px,8.6vw,131.2px)]" />
    </main>
  );
}
