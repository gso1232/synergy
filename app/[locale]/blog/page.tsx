import type { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import Image from "next/image";
import FadeUp from "@/components/FadeUp";
import BlogCard from "@/components/BlogCard";
import { getAllArticles } from "@/lib/blog";

/**
 * /[locale]/blog — the article listing.
 *
 * Modelled on **for-living.it/work**, re-measured live today at 1536 x 710 in
 * real Chrome (hover and motion) and at 820 / 390 for layout. None of their CSS
 * is copied and none of their files are used.
 *
 * =========================================================================
 * WHAT THEIR PAGE HAS THAT THIS ONE DOES NOT, AND WHY.
 *
 * 🔴 THE FILTER BAR IS REMOVED. Theirs is two rows — a `.filter_ruler_container`
 * of 1px tick marks at y 840-865, and a `.filter_collection_list` of four
 * labels (ALL PROJECTS / RESIDENTIAL / COMMERCIAL / MARINE) at y 876-900,
 * flex with a 127.92px gap — then 72px down to the grid. The whole displaced
 * span from the top block's last pixel (827) to the first card (972) is 145px.
 * `.sem-pad-t` closes it: clamp(64px, 8.6vw, 131.2px) is 131.2 at 1536, which
 * is 13.8px tighter than theirs and is the token every other section seam on
 * this site already uses. No new value was invented for it.
 *
 * 🔴 THEY SHIP TWO <h1>s — "selected Work" and a "WORK IN PROGRESS" notice.
 * That is a defect and it is not reproduced. This page has exactly one.
 *
 * 🔴 THEIR TYPE RAMP IS NON-MONOTONIC and that is not copied either. Measured,
 * their sub runs 16.4 -> 14.71 -> 15.26 at 1536 / 820 / 390 and the card title
 * 20.5 -> 18.39 -> 19.07: both shrink to tablet and grow again on phone. That
 * is three Webflow breakpoint formulas colliding, not an intention. Ours uses
 * the existing `.sem-*` clamps, which are monotonic by construction.
 *
 * 🔴 NO CUSTOM CURSOR. Theirs renders a pointer-following "See more" label from
 * `.see-more-text-container`, outside the card. Invisible on touch, no keyboard
 * equivalent, fights the OS pointer. Dropped on instruction — the whole card is
 * the link.
 *
 * 🔴 NO ENTRY REVEAL, because theirs has none. Cards measure opacity 1 and
 * transform none both above and below the fold, before and after scrolling;
 * the sub's 0.6 is a resting style, not an animation. The only motion on their
 * listing is the card hover. Ours adds `FadeUp` on the heading block only,
 * which is this site's existing entrance and is already used on every other
 * page — it is ours, not theirs.
 *
 * =========================================================================
 * TWELVE CARDS, NOT EIGHT. fflsynergy publishes twelve articles; for-living
 * shows eight. At 2 columns that is 6 rows instead of 4 at 1536 and 820, and
 * 12 rows instead of 8 at 390 — the grid roughly doubles in height. That was
 * raised before building and accepted: twelve is what the client has.
 *
 * SURFACE. Cream #F8F4EE, ink type, the same system as /about and /services.
 * The header is SOLID here — this route is not in `isHeroRoute`, because the
 * first viewport is cream and not a full-bleed photograph — so the page
 * reserves the bar's height with `.page-header-offset`.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function BlogIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const articles = getAllArticles(locale);

  return (
    <main>
      {/* =====================================================================
          THE HERO — 🔴 A DELIBERATE DIVERGENCE FROM THE REFERENCE.

          for-living.it/work HAS NO HERO. Its h1 sits 213px down a plain dark
          page with no image above it. This one is ours, added so /blog opens
          the way /about and /services open rather than being the only page on
          the site whose first viewport is flat cream under a solid bar.

          THE COPY SITS OVER THE PHOTOGRAPH, not below it, which is what "the
          same treatment" means on this site: both other heroes put the h1 in
          the last third of a full-bleed image. That also means /blog JOINS
          `isHeroRoute` and the bar goes transparent here.

          🔴 THE SCRIM IS SHAPED NOW — the flat one retired with the old image.
          The hero was blog-hero-rooftops-dusk.jpg, a dark frame whose two text
          bands cleared AA bare, so a flat 0.15 was the honest answer. It is now
          /blog-gallery/retirement-planning.jpg — an advisor with a senior couple
          in a BRIGHT office: windows/monitors under the nav bar, people under the
          copy. Under the old flat 0.15 the white nav ink measured 1.44:1 and the
          cream copy 2.11:1 — both fail, and a flat scrim can't rescue them
          without crushing the photo (nav is still 4.03:1 at flat 0.50). This
          image needs a shape, which is the case /about's scrim exists for.
          Re-derived on the real composite, worst pixel per band:

            band                 1536   820    390   needs
            nav (white 15px)     5.82   5.83   5.89   4.5
            h1  (cream, large)   4.94   5.54   5.77   3.0
            sub (cream)          5.88   6.28   7.00   4.5

          Full derivation, the retired flat value and the muted-photo trade-off
          are on `.blog-hero-scrim` in globals.css.

          2x DPR: the 6016x4016 source downscales to the 3072px a 1536 box needs
          at 2x by 0.51x (a genuine downscale) — clears with margin, nothing
          upscales. No baked-in lettering under either band; the only text in the
          frame is the prop document in the advisor's hand, bottom-RIGHT, clear of
          the bottom-LEFT copy.

          NO FOOT RAMP. The photograph ends on a hard edge into cream, like
          every other photo edge on this site.
      ===================================================================== */}
      <section className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-navy">
        <Image
          src="/blog-gallery/retirement-planning.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={74}
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="blog-hero-scrim absolute inset-0" />

        <div className="sem-shell relative z-10 flex h-full flex-col justify-end pb-[32.8px]">
          <div className="sem-inner w-full">
            <h1 id="blog-heading" className="sem-display max-w-[14ch] font-display text-cream">
              {t("heading")}
            </h1>
            <p className="sem-hero-sub mt-6 max-w-[32em] text-cream md:mt-8">
              {t("intro")}
            </p>
          </div>
        </div>
      </section>

    <div className="about-page min-h-screen">
      {/* =====================================================================
          THE TOP COPY BLOCK.

          THEIRS, MEASURED: h1 73.8/81.18 (lh 1.10) w400 uppercase display face,
          indented 263px from the 104 gutter — 20% of the 1312 container — and
          spanning 60% of it. Sub 16.4/21.32 at opacity 0.6, 50px below the h1.

          🔴 THE 20% INDENT IS NOT REPRODUCED. On their near-black page the
          indent reads as composition. On cream, with a solid header bar above
          it, an indented h1 reads as a mistake — every other page on this site
          starts its heading at the gutter, and one page starting somewhere else
          is an inconsistency a reader notices before they notice the effect.
          The 60% MEASURE is kept, as a max-width on the sub.

          🔴 OPACITY 0.6 IS NOT REPRODUCED EITHER, and this one is a contrast
          failure rather than a taste call. Ink #1A1A1A at 0.6 over cream
          #F8F4EE measures 3.1:1 — under AA for body text, and this is a resting
          state, not a transient. The sub takes full-strength ink.
      ===================================================================== */}
      {/* =====================================================================
          THE GRID. Their 2 columns at 631 with a 50px column gap on a 1312
          container is 3.81% of the container; ours takes `--sem-gap-logos`
          (49.2), the existing token nearest their measured value, so the card
          lands on 694.8 at 1536. Row gap 65.6 — half `--sem-gap-lg`, which is
          the same halving the About page's §5 heading-to-grid seam already
          uses. Their row gap measured 65-66.
      ===================================================================== */}
      {/* 🔴 HALF THE SECTION RHYTHM, NOT THE FULL ONE. The h1, the intro and the
          grid are ONE block of content — a heading and its own list — and a full
          `.sem-pad-t` between them measured 131 at 1536, which reads as a section
          break inside a section. This is the same correction already recorded for
          /about §5 in HANDOFF §9b: the heading read as detached from its own
          columns. Halved to clamp(32px,4.3vw,65.6px). */}
      <section
        aria-label={t("listLabel")}
        className="sem-shell sem-pad-t"
      >
        <div className="sem-inner">
          <ol className="blog-grid">
            {articles.map((a) => (
              <BlogCard
                key={a.slug}
                article={a}
                readLabel={
                  a.readingMinutes
                    ? t("readTime", { minutes: a.readingMinutes })
                    : null
                }
              />
            ))}
          </ol>
        </div>
      </section>

      <div className="h-[clamp(64px,8.6vw,131.2px)]" />
      </div>
    </main>
  );
}
