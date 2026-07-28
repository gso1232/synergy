import type { Metadata } from "next";
import Image from "next/image";
// NOTE: no `next/link` import. This page renders no links of its own — the §4
// pill CTA was removed for want of an honest destination (see the note in §4).
// Restoring it needs this import back.
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import FadeUp from "@/components/FadeUp";
import RouteTheme from "@/components/RouteTheme";
import AboutPullQuote from "@/components/AboutPullQuote";
import AboutParallaxImage from "@/components/AboutParallaxImage";
import AboutValueColumn from "@/components/AboutValueColumn";
import AboutZoom from "@/components/AboutZoom";

/**
 * /[locale]/about — "We Are Synergy".
 *
 * Modelled on the ENTIRE homepage of restaurantsem.com, section for section,
 * with Synergy's content and our tokens. RE-MEASURED LIVE at 1526 / 758 / 390;
 * every number in `.sem-*` in globals.css is read off their computed styles.
 * None of their CSS is copied and none of their files are used.
 *
 * =========================================================================
 * SECTION_ORDER — all eight of theirs, and what each one is here.
 *
 *   §1  Hero            658px / 100vh, static     -> photo + h1 + sub
 *   §2  Info            1248px, entrance reveal   -> "Our Story": display
 *                                                    heading, 3 paras, image
 *                                                    right
 *   §2b Logo grid       inside §2                 -> 5 carrier wordmarks
 *                                                    🟡 AWAITING LOGO FILES
 *   §3  Pull-quote #1   715px, scrubbed reveal    -> "Insurance is not a
 *                                                    product. It is a promise."
 *   §4  Food & Drink    826px, entrance reveal    -> "Built on Trust. Driven
 *                                                    by Results." + 2 images
 *                                                    + pill CTA
 *   §5  Images grid     1158px, scrubbed drift    -> "What We Stand For",
 *                                                    3 staggered columns
 *                                                    🟡 PROVISIONAL IMAGERY
 *   §6  Pull-quote #2   705px, scrubbed reveal    -> "We do not just sell
 *                                                    policies..."
 *   §7  Image zoom      1973px, sticky pin        -> image only, no copy
 *   §8  Staff           807px, entrance reveal    -> 🔴 AWAITING CLIENT
 *   §9  Footer          604px, static             -> the site-wide <Footer />
 *
 * §8 IS COMMENTED OUT AND MUST NOT BE DELETED — see the block below §7.
 *
 * =========================================================================
 * NO SECTION HAS A BACKGROUND. That is the single thing that makes the
 * reference page work: every section is transparent and the whole non-hero
 * column sits on ONE gradient on ONE wrapper (theirs
 * `linear-gradient(rgb(38,92,120), rgb(30,30,30) 75%)` over 8,036px, verified
 * live today). You scroll from daylight into darkness with no colour blocks,
 * no rules and no cards marking the boundaries.
 *
 * Ours is `.about-gradient`, #1C3A5A -> #0D1B2A also landing at 75%, ending on
 * exactly the footer's colour so that seam does not exist.
 *
 * =========================================================================
 * CONTAINER. Theirs is `.padding-global` (padding-inline 41px at 1526, 36.5 at
 * 758, 19.07 at 390) wrapping `.container-large` (max-width 1476px). Ours is
 * `.sem-shell` + `.sem-inner`, the same two numbers. The previous build used
 * the site's 1220px `max-w-content` with `px-5 md:px-8`, which started the copy
 * ~70px further in than theirs and made the whole page read narrow.
 *
 * =========================================================================
 * COPY. Every line is Synergy's own, from fflsynergy.com, verbatim except for
 * two documented changes in "Our Story" (p2 phrasing, p3 two cuts). No string
 * on this page was authored except image alt text.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const VALUES = ["v1", "v2", "v3"] as const;

/**
 * §2b — the five carriers that appear in the logo row.
 *
 * The client confirmed appointments, so this section is back. FIVE, not the
 * twelve in `carriers.names`: the reference grid is exactly five columns of
 * 191.74px, and twelve names crammed into it would be a different component
 * wearing its layout. These are the five with the widest consumer recognition
 * in the list — the row's job is reassurance, and a name nobody recognises
 * does not reassure.
 */
const LOGO_CARRIERS = ["c1", "c2", "c8", "c7", "c6"] as const;

/**
 * §5 imagery.
 *
 * 🟡 THESE THREE ARE LICENSED STOCK AND ARE PROVISIONAL. Synergy's vetted set
 * contains exactly three portrait-capable frames — gallery-advisor-explaining,
 * -team-meeting and -team-presentation — and all three are consumed by §2 and
 * §4, where each is the only asset that clears its slot. (why-g10 and why-g12
 * were struck off the vetted list on inspection: Balmain and Gucci belt
 * buckles.) So this section could not be filled from Synergy's own material at
 * the resolution its columns need.
 *
 * Candidates were measured and brought for approval; these are the three
 * recommended from that set. Pexels License, free for commercial use, no
 * attribution required — full derivation, rejected alternatives and the exact
 * licence line are in public/synergy/CREDITS.md. Each is one line to swap.
 *
 * Stored at 1200x1800. The parallax layer is 130% of the box, so the bar is
 * the LAYER's size, not the box's: at the widest container the box is 404x607
 * CSS and the layer 404x789, i.e. 809x1578 at 2x DPR. Cropped to the layer's
 * aspect these give 923x1800. Clears with margin.
 */
/**
 * §5 COLUMN DRIFT — direction per column, matching the reference exactly.
 *
 * Measured on restaurantsem.com: their first column drifts DOWN, their middle
 * column is STATIC AT 0 for the whole scroll range, their third drifts UP.
 * Observed extremes +225 / 0 / -233px.
 *
 * Magnitude here is the shipped ±10 from components/useParallax.ts (the
 * Testimonials pairing), not their ±225 — ±10 is a value this project already
 * ships and has tuned. Only the SIGN varies per column, which is a direction,
 * not a new number, and the middle column's 0 is their own measured value.
 */
const COLUMN_DRIFT = [
  { from: -10, to: 10 }, // I   — drifts down
  { from: 0, to: 0 }, //    II  — static, as theirs is
  { from: 10, to: -10 }, // III — drifts up
] as const;

const VALUE_IMAGES: Record<(typeof VALUES)[number], string> = {
  v1: "value-integrity.jpg",
  v2: "value-education.jpg",
  v3: "value-legacy.jpg",
};

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const tc = await getTranslations({ locale, namespace: "carriers" });

  return (
    <main>
      <RouteTheme theme="dark" />

      {/* =====================================================================
          §1 HERO — 100vh, static.

          THE BAR IS TRANSPARENT OVER THIS, not a solid band. /about is now in
          SiteHeader's `isHeroRoute` set, so it behaves exactly like the
          homepage: no background until scrollY > 60, white ink, and the veil
          below carries it. The reference nav never takes a surface at all;
          ours takes one once it leaves the hero, because below the fold this
          page runs a logo row and a three-column image grid that white ink
          cannot sit on unaided.

          🟡 THE PHOTOGRAPH IS A PLACEHOLDER FOR SYNERGY'S OWN. Ziad still owes
          original camera files. Family imagery, not a team photo: under an h1
          reading "We Are Synergy" a family reads as WHO WE PROTECT, which is
          true; a team photo of strangers would be a false claim.
      ===================================================================== */}
      <section className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-navy">
        <Image
          src="/synergy/about-hero-family.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={74}
          className="object-cover object-center"
        />
        {/* The header veil is BACK, and it is now load-bearing again. It was
            removed when the bar was solid navy over this hero — an opaque bar
            needs no veil. The bar is transparent here now, so white nav ink
            sits on the photograph and this is what carries it. Same gradient
            the homepage hero uses. */}
        <div
          aria-hidden="true"
          className="hero-veil-top absolute inset-x-0 top-0 h-[42%]"
        />
        <div aria-hidden="true" className="about-hero-scrim absolute inset-0" />
        <div
          aria-hidden="true"
          className="about-hero-foot absolute inset-x-0 bottom-0 h-24"
        />

        <div className="sem-shell relative z-10 flex h-full flex-col justify-end pb-[clamp(72px,10vh,140px)]">
          <div className="sem-inner w-full">
            <h1 className="sem-display max-w-[14ch] font-display text-cream">
              {t("hero.headline")}
            </h1>
            <p className="sem-body mt-6 max-w-[46ch] text-cream md:mt-8">
              {t("hero.sub")}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================
          THE GRADIENT. One wrapper, every section below it transparent.
      =================================================================== */}
      <div className="about-gradient min-h-screen">
        {/* =================================================================
            §2 OUR STORY — their `.section_info`.

            MEASURED: `.home-info_grid` is `729.55px 583.65px` with a 131.2px
            gap inside a 1444px container — i.e. 1.25fr / 1fr. One column below
            768, exactly as theirs collapses.

            The display heading is the thing that was missing. Theirs is
            `.heading-style-h1` at 90.2px / lh 1.0 / w300; ours is `.sem-display`
            at the same size in Kufam at w400 (our face has no 300 and the
            project forbids synthetic weights). Previously this section had no
            display heading at all — an 11px eyebrow and three body paragraphs
            at one size, which is why it read flat.

            "Our Story" is promoted from eyebrow to display heading rather than
            a new headline being written for the slot. No new copy.
        ================================================================= */}
        <section aria-labelledby="about-story" className="sem-shell sem-pad-t">
          <div className="sem-inner">
            <div className="grid grid-cols-1 items-start gap-y-12 lg:grid-cols-[1.25fr_1fr] lg:gap-x-[var(--sem-gap-lg)]">
              <FadeUp>
                <h2 id="about-story" className="sem-display font-display text-cream">
                  {t("story.eyebrow")}
                </h2>
                {/* Their left wrapper is a flex column with a 32.8px gap. */}
                <div className="mt-8 space-y-6 text-cream">
                  <p className="sem-body">{t("story.p1")}</p>
                  <p className="sem-body">{t("story.p2")}</p>
                  <p className="sem-body">{t("story.p3")}</p>
                </div>
              </FadeUp>

              <FadeUp index={1}>
                {/* Their image is 467 wide inside a 583.65 column and centred
                    — 80.0% of the column. That proportion is kept exactly.

                    THE ASPECT IS OURS, NOT THEIRS, AND IT IS A RESOLUTION
                    DECISION. Theirs renders 467x656 (ratio 0.712). Synergy's
                    own photograph is 1100x1375; cropping it to 0.712 yields
                    979px of real width against the 954 this column needs at
                    2x DPR — it would clear, but only by 2.6%. Held at its
                    native 4:5 instead, which the source IS exactly: same width
                    as theirs, 584 tall rather than 656, zero crop and nothing
                    enlarged. */}
                {/* THIS IS GALLERY g8, AND IT IS NOT THE FILE THAT USED TO BE
                    HERE. §2 was `gallery-advisor-explaining.jpg` (g11) while
                    §4 also ran g11 under the name `gallery-training-session`.
                    §2 moved to g8 and §4 took g11, which is what removes BOTH
                    the repeated photograph and the repeated person from the
                    page — g8 and g2 share the woman with the microphone, g11
                    and g2 share nobody. See the §4 note below and the
                    filename table in HANDOFF.md §11.

                    `gallery-team-presentation.jpg` rather than
                    `gallery-leadership-panel.jpg`: they are the same
                    photograph cropped twice, and this is the crop that is
                    exactly 4:5 (1100x1375), so this slot performs NO crop at
                    all. The other is 1206x1263 and would be cut.

                    CAPPED AT 500px, a resolution limit. In the single-column
                    layout this grew to 80% of the full container — 601px at
                    820 — which needs 1202x1502 at 2x DPR. The 1100x1375
                    source sustains 550; the cap stays at 500 because it is a
                    layout number this page was measured at, and the extra
                    50px would move the column for no editorial gain. Raise it
                    to 550, not further, if it is ever wanted. */}
                <div className="mx-auto w-4/5 max-w-[500px] lg:max-w-none">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src="/synergy/gallery-team-presentation.jpg"
                      alt={t("story.imageAlt")}
                      fill
                      sizes="(min-width: 768px) 40vw, 80vw"
                      quality={78}
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* ===============================================================
                §2b CARRIER ROW — their `.grid_logos-info`.

                MEASURED: five equal columns of 191.74px with a 49.2px gap,
                the whole grid inset to 1156 of the container's 1444 (80.0%)
                and centred, each cell centring a logo at up to 131px tall
                with `object-fit: contain`. 3 columns at 758, 2 at 390.

                🟡 THESE ARE WORDMARKS, NOT LOGOS, AND IT SHOWS.
                The client has confirmed the appointments but has sent no logo
                files. Set in Kufam at the row's own scale, five typeset names
                in a grid built for artwork read as a layout waiting for its
                assets — the cells are 191px wide and 131px tall and the type
                fills maybe a third of that box, so the whitespace that would
                hold a mark is visibly empty. It is honest (these are real
                appointments, named in Synergy's own copy) but it is not
                finished.

                DROP-IN SWAP: replace the <span> with <Image src=.../> at the
                same cell. The grid, the gap, the 131px cap and the centring
                are all on the <li>, so nothing here changes when artwork
                arrives — only the child. */}
            <FadeUp index={2}>
              <ul className="mx-auto mt-[clamp(48px,8.6vw,131.2px)] grid w-4/5 grid-cols-2 items-center gap-x-[var(--sem-gap-logos)] gap-y-8 md:grid-cols-3 xl:grid-cols-5">
                {LOGO_CARRIERS.map((key) => (
                  <li
                    key={key}
                    className="flex h-[131px] items-center justify-center"
                  >
                    <span className="text-center font-display text-[clamp(15px,1.15vw,19px)] font-medium leading-[1.25] tracking-[0.01em] text-cream">
                      {tc(`names.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </section>

        {/* =================================================================
            §3 PULL-QUOTE #1 — scrubbed word reveal.
        ================================================================= */}
        <AboutPullQuote text={t("quote1")} className="sem-pad-t" />

        {/* =================================================================
            §4 BUILT ON TRUST — their `.section_food-drink`.

            MEASURED: `.grid_food-drink` is `376.025px 501.388px 501.388px`
            with a 32.8px gap — i.e. 0.75fr / 1fr / 1fr. Two images left, copy
            column right. Two columns at 758 and at 390.

            ⚠️ THE TWO IMAGES ARE NOT VERTICALLY OFFSET. Re-measured live and
            confirmed visually today: both wraps sit at the same document y
            (2752) with the same height (564), `margin-top: 0`, `transform:
            none`, `align-self: auto`. The asymmetry is in WIDTH — 376 against
            501 — not in vertical position. The staggered offset belongs to
            §5, which really does carry `margin-top: 0 / 131.2 / 262.4`. Built
            as measured; say the word if you want an offset here as a
            deliberate deviation from the reference.

            Copy column: eyebrow, display heading, pill CTA, body — vertically
            centred in the row, as theirs is.

            🟡 NO EYEBROW. Theirs reads "Dinner at SEM" above the heading.
            fflsynergy publishes nothing that fits that slot and the rule is
            that an empty slot is reported rather than filled, so the row
            starts at the heading. A proposal is in the report.
        ================================================================= */}
        <section aria-labelledby="about-trust" className="sem-shell sem-pad-t">
          <div className="sem-inner">
            {/* EQUAL IMAGES, SIDE BY SIDE, NO OFFSET.
                ⚠️ DO NOT ADD A margin-top TO EITHER OF THESE.

                Both boxes are the same width and the same height, their tops
                align and their bottoms align. That is what the reference does
                — measured live at 1536 and 820, both wraps at the same
                document y with `margin-top: 0` and `transform: none` at both
                widths — and it is what was asked for.

                An offset of 131.2px lived here briefly and has been removed.
                It never matched the reference; it also made the pair LOOK
                unequal at most scroll positions, because the upper image's
                top edge was routinely clipped by the viewport or hidden under
                the opaque header while the lower one was fully visible.

                THE ONE DIVERGENCE THAT REMAINS is that ours are EQUAL and
                theirs are not: at desktop theirs run 376 and 501. The numbers
                are still theirs — the pair keeps their total image span
                (376 + 32.8 + 501 = 909.8 of 1444) and their 32.8 gap, split
                evenly to 438.5 each, so the columns are 0.875fr / 0.875fr /
                1fr and the height stays their 564 (ratio 0.7775). */}
            <div className="grid grid-cols-2 gap-[var(--sem-gap-md)] xl:grid-cols-[0.875fr_0.875fr_1fr]">
              {/* BOTH BOXES ARE `aspect-[0.7775]` ON EQUAL GRID TRACKS, so
                  width and height are identical by construction, and with no
                  margin on either they share a top edge and a bottom edge.
                  Verified by measuring the RENDERED boxes, not the sources.

                  SYNERGY'S OWN PHOTOGRAPHY, from fflsynergy.com/gallery —
                  g8 and g11, downloaded as the client's originals and cropped
                  to remove the SYNERGY watermark that sits across the lower
                  29% of every frame on that page (the same crop the existing
                  `why-` and `gallery-` files in this repo already use: 71.0%
                  of source height). Both checked clean of third-party branding
                  at full size.

                  ⚠️ SIX FILENAMES POINT AT THREE PHOTOGRAPHS. CHECK THE SOURCE
                  GALLERY ID, NOT THE FILENAME — the `gallery-` names describe
                  the CROP, not the image, and they conceal this:

                    g11  gallery-advisor-explaining (1000x1250)
                         gallery-training-session   (1080x1150)
                         why-g11                    (1080x1150)
                    g8   gallery-team-presentation  (1100x1375)
                         gallery-leadership-panel   (1206x1263)
                         why-bilingual              (16:9 crop)
                    g2   gallery-team-meeting       (1000x1250)

                  This already caused one defect: §2 ran g11 as
                  `gallery-advisor-explaining` while this slot ran g11 as
                  `gallery-training-session` — the same man, the same
                  microphone, the same "Hone Your Skills & Knowledge" slide,
                  twice on one page under two names.

                  THE PAIRING IS g11 + g2, AND THE CHOICE IS ABOUT PEOPLE, NOT
                  JUST PHOTOGRAPHS. g8 and g2 both contain the woman with the
                  microphone, so an earlier g8 + g2 pair here removed the
                  duplicate image but left a duplicate PERSON standing in both
                  halves of the same row. g11 and g2 share nobody. §2 took g8
                  in exchange, where it is the only frame on the page.

                  DIFFERENT MOMENTS, SAME ROOM — and the room could not be
                  varied. Synergy's entire usable gallery is one Orlando
                  training room plus a team dinner and an office floor; the
                  latter two are landscape and 596x766 after the watermark
                  crop, 31.8% short of the 874x1124 this box needs. Reported
                  rather than upscaled.

                  Cropped to this box's 0.7775 the two sources give 972x1250
                  (g11, +11.2%) and 972x1250 (g2, +11.2%) against 874x1124.
                  Both clear. `gallery-advisor-explaining` is the g11 crop
                  used here rather than `gallery-training-session`, whose
                  894x1150 clears by only 2.3%.

                  ⚠️ NO PARALLAX ON THIS PAIR, AND THAT IS A RESOLUTION
                  DECISION THAT REVERSES AN EARLIER INSTRUCTION.

                  A parallax layer is 130% of its box, so it raises the bar
                  from the box (874x1124 at 2x DPR) to the layer (874x1461).
                  Measured against the watermark-free sources:

                    g8   982x1263 vs box   PASS +12.4%
                         755x1263 vs layer FAIL -13.6%
                    g11  894x1150 vs box   PASS  +2.3%
                         688x1150 vs layer FAIL -21.3%

                  So Synergy's own photography cannot carry a parallax here
                  without being upscaled, and "large enough that nothing
                  upscales" is a standing rule while the parallax on this
                  particular pair is one round old. The images win.

                  To put the parallax back, swap these two <Image> tags for
                  <AboutParallaxImage> — and accept a 14% / 21% upscale, or
                  go back to licensed stock. §5's three images are unaffected
                  and keep theirs. */}
              <FadeUp>
                <div className="relative aspect-[0.7775] w-full overflow-hidden">
                  <Image
                    src="/synergy/gallery-advisor-explaining.jpg"
                    alt={t("trust.imageAlt1")}
                    fill
                    sizes="(min-width: 1280px) 31vw, 48vw"
                    quality={80}
                    className="object-cover object-center"
                  />
                </div>
              </FadeUp>

              {/* index={0}, THE SAME AS ITS PARTNER — no stagger.
                  FadeUp adds 80ms per index step on a 600ms fade, so an index
                  of 1 here meant the right-hand image began arriving 680ms
                  after the left one started. On a pair meant to read as one
                  object that lag is what made them look mismatched mid-scroll:
                  for most of the reveal one image was fully painted and the
                  other was still at zero opacity. Both now arrive together.

                  NO OFFSET. Side by side, tops aligned, bottoms aligned.
                  There is no margin-top here and there must not be one. */}
              <FadeUp>
                <div className="relative aspect-[0.7775] w-full overflow-hidden">
                  <Image
                    src="/synergy/gallery-team-meeting.jpg"
                    alt={t("trust.imageAlt2")}
                    fill
                    sizes="(min-width: 1280px) 31vw, 48vw"
                    quality={80}
                    className="object-cover object-center"
                  />
                </div>
              </FadeUp>

              <FadeUp index={2}>
                {/* TOP-ALIGNED, not centred. The reference centres its copy in
                    a 564px row where the content nearly fills it; ours has
                    358px of content in a 562px row, so centring left a band of
                    air above and below and the column read as floating.
                    Aligned to the top instead, so the eyebrow starts level
                    with the top edge of both images. */}
                <div className="col-span-2 flex h-full flex-col justify-start xl:col-span-1">
                  {/* EYEBROW — theirs reads "Dinner at SEM" in this slot.
                      fflsynergy publishes nothing that fits it, so this is an
                      AUTHORED INTERFACE LABEL under the standing rule that
                      permits them: it names the section and asserts nothing
                      about the business — no claim, no number, no promise.
                      One line to change or remove. */}
                  <p className="sem-eyebrow text-cream">{t("trust.eyebrow")}</p>
                  <h2
                    id="about-trust"
                    className="sem-h2 mt-[clamp(12px,1.1vw,16.4px)] font-display text-cream"
                  >
                    {t("trust.headline")}
                  </h2>

                  {/* 🔴 THE PILL CTA IS REMOVED, AND THAT IS A DELIBERATE
                      DIVERGENCE FROM THE REFERENCE. DO NOT RESTORE IT WITHOUT
                      A DESTINATION.

                      Theirs sits BETWEEN the heading and the body (measured at
                      y311 with the body at y384), reads "Food with a story"
                      and goes to their story page.

                      WE HAVE NO STORY PAGE. routes.ts lists exactly three
                      built routes — home, about, calculator — and every
                      candidate destination was wrong:

                        /{locale}/calculator   what this actually pointed at.
                                               A retirement calculator is not
                                               what this section is about.
                        /{locale}/about
                          #about-story         §2 of THIS page. A button that
                                               sends the reader back up to
                                               three paragraphs they passed
                                               thirty seconds ago is worse
                                               than no button.
                        /{locale}#why-heading  the homepage's Why Synergy. A
                                               real destination, but it leaves
                                               the page and it is not a story.

                      So the row starts at the eyebrow and runs heading -> body,
                      with no CTA. An honest section with one fewer element
                      beats a button that misdirects.

                      TO RESTORE: build a Services or Story route, add it to
                      routes.ts, and put a <Link className="sem-pill
                      sem-pill-cta ..."> back here between the </h2> and the
                      body <div>. `.sem-pill` and `.sem-pill-cta` are RETAINED
                      in globals.css and `about.trust.ctaLabel` is RETAINED
                      UNTOUCHED in both message files — the label will need
                      re-approving against the new destination, but nothing has
                      to be re-sourced. */}

                  {/* ONE SHORT PARAGRAPH, AND THAT IS A MEASUREMENT, NOT A
                      PREFERENCE.

                      This column used to render `trust.p1` + `trust.p2`. Its
                      content measured 688px against the images' 562px, so the
                      copy — not the imagery — was setting the grid row height
                      and pushing the section 126px past the reference's 564.
                      The reference's own body is three lines.

                      `trust.body` is the SECOND SENTENCE OF p1, verbatim. It
                      is a cut, not a rewrite: fflsynergy publishes no shorter
                      version of this block, so the only honest way to shorten
                      it was to drop sentences rather than compose new ones.

                      p1 AND p2 ARE RETAINED UNTOUCHED in both message files.
                      Restoring the full block is putting the two <p> tags
                      back; nothing has to be re-sourced or re-approved.

                      Dropping p2 also removes a duplication: its first two
                      sentences ship on the homepage as `carriers.subhead`. */}
                  <div className="mt-[clamp(24px,2.15vw,32.8px)] text-cream">
                    <p className="sem-body">{t("trust.body")}</p>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* =================================================================
            §5 WHAT WE STAND FOR — their `.grid-home-images`.

            MEASURED: three equal 394px columns with a 131.2px gap, staggered
            by `margin-top: 0 / 131.2px / 262.4px`. Each column is a label
            above a 2:3 portrait image with a 16px gap between them. Their
            label is 21.32/25.584 w500 with the emphasised word in their orange
            #EB6330 and the rest white. One column below 768.

            THE REVEAL, MEASURED PROPERLY THIS TIME — off Webflow's own IX2
            store plus a real-wheel scroll sweep:

              event         e-53, SCROLLING_IN_VIEW
              action        GENERAL_CONTINUOUS_ACTION  -> SCRUBBED, not
                            play-once. There is no entrance animation.
              smoothing     50  (a damped follow: scroll instantly to a new
                            position and the transform is still travelling
                            toward it ~0.5s later)
              start         startsEntering true, addOffsetValue 50
              end           startsExiting false, endOffsetValue 50
              OPACITY       NOT ANIMATED. Measured 1/1/1 on all three columns
                            and their images at every scroll position.
              transform     vertical only, DIFFERENTIAL per column —
                            col1 drifts DOWN, col2 is static at 0 throughout,
                            col3 drifts UP. Observed extremes +225 / 0 / -233,
                            easing back to +76 / 0 / -48 as the section exits.
              sibling a-18  on the LABELS (.small-statement-text): keyframe 44
                            -> +8rem, keyframe 100 -> -4rem, easing "ease",
                            duration 500. Media queries medium/small/tiny only
                            — it does not run at desktop.

            So what reads as "their reveal" is a scrubbed differential
            parallax plus the static stagger. There is nothing to fade in.

            OURS, SIDE BY SIDE — the reference has two effects here and we run
            two, but they are not the same two:

              static stagger      ⚠️ NOT BUILT. Theirs is 0 / 131.2 / 262.4;
                                  ours is 0 / 0 / 0. All three columns rest
                                  with their tops on one line and their bottoms
                                  on one line. This is a DELIBERATE DIVERGENCE
                                  taken on instruction, the same call already
                                  made for the §4 pair. Do not put it back.
              COLUMN DRIFT      AboutValueColumn, the whole column moving
                                  against its neighbours. Direction per column
                                  matches theirs exactly — down / static / up —
                                  and the middle column's 0 is their own
                                  measured value. Magnitude is the shipped ±10
                                  from useParallax rather than their ±225,
                                  because ±10 is a value this project already
                                  ships and tuned; only the SIGN varies per
                                  column, which is not a new number.
              image parallax      AboutParallaxImage, the photograph moving
                                  inside its fixed frame. THEIRS DOES NOT DO
                                  THIS — it was asked for separately and is an
                                  addition, not a match. Drop it by swapping
                                  AboutParallaxImage for a plain <Image>.

            Both scrubbed at `scrub: 0.5`, derived from their smoothing 50, so
            the column and the photograph inside it ease on the same curve.

            The entrance reveal is FadeUp and is OURS — the reference has no
            fade at all on this section (opacity measured 1/1/1 throughout).

            OURS: gold #C9A84C numeral + cream word, per the brief.

            🟡 THE THREE IMAGES ARE LICENSED STOCK AND PROVISIONAL — see
            VALUE_IMAGES above.
        ================================================================= */}
        <section aria-labelledby="about-values" className="sem-shell sem-pad-t">
          <div className="sem-inner">
            <FadeUp>
              <h2 id="about-values" className="sem-h2 font-display text-cream">
                {t("values.headline")}
              </h2>
            </FadeUp>

            <ul className="mt-[clamp(48px,8.6vw,131.2px)] grid grid-cols-1 gap-x-[var(--sem-gap-lg)] gap-y-12 xl:grid-cols-3">
              {VALUES.map((v, i) => (
                <AboutValueColumn
                  key={v}
                  // COLUMN DRIFT — direction per column exactly as measured on
                  // the reference: first down, middle static, third up. The
                  // middle 0 is their value, not a disabled effect.
                  from={COLUMN_DRIFT[i].from}
                  to={COLUMN_DRIFT[i].to}
                  // NO STAGGER. ⚠️ DO NOT REINTRODUCE A margin-top HERE.
                  //
                  // The reference staggers these three by 0 / 131.2 / 262.4px.
                  // Ours does not, on instruction, and it is the same decision
                  // already taken for the §4 pair: all three columns rest with
                  // their tops on one line and their bottoms on one line.
                  //
                  // Everything else about this section is unchanged — the
                  // per-column drift below, the image parallax, the labels and
                  // the imagery all still match what was measured. Only the
                  // resting positions changed.
                >
                  <FadeUp index={i}>
                    {/* Two-tone label, their treatment. The numeral is
                        aria-hidden — a screen reader reading "I" before
                        "Integrity" hears a pronoun — so the accessible name of
                        this heading is the word alone. */}
                    <h3 className="sem-eyebrow font-display text-cream">
                      <span aria-hidden="true" className="text-gold">
                        {t(`values.${v}.numeral`)}
                      </span>{" "}
                      {t(`values.${v}.title`)}
                    </h3>

                    {/* 16px label-to-image gap, measured.

                        2:3 portrait, their exact ratio (394x591 at 1526).
                        Every image in this section carries the site's shared
                        scroll parallax — see AboutParallaxImage, which uses
                        the Testimonials pairing (130% layer, ±10) from
                        components/useParallax.ts. No new values. */}
                    <AboutParallaxImage
                      src={`/synergy/${VALUE_IMAGES[v]}`}
                      alt={t(`values.${v}.imageAlt`)}
                      sizes="(min-width: 1280px) 28vw, 440px"
                      aspect="aspect-[2/3]"
                      // CAPPED BELOW xl, and this is a resolution limit, not a
                      // taste call. In the single-column layout the box grew to
                      // the full container — 751px wide at 820 — and the
                      // parallax layer is 130% of that, so the requirement was
                      // 1502x2928 at 2x DPR against a 1200x1800 source: a 1.63x
                      // upscale. At 440 the layer is 440x858, i.e. 880x1716,
                      // which the source clears.
                      className="mt-4 mx-auto w-full max-w-[440px] xl:max-w-none"
                    />

                    <p className="sem-body mt-6 text-cream">
                      {t(`values.${v}.body`)}
                    </p>
                  </FadeUp>
                </AboutValueColumn>
              ))}
            </ul>
          </div>
        </section>

        {/* =================================================================
            §6 PULL-QUOTE #2 — same hook, same numbers.
        ================================================================= */}
        <AboutPullQuote text={t("quote2")} className="sem-pad-t" />

        {/* =================================================================
            §7 IMAGE ZOOM — sticky pin, scale 0.5 -> 1.0. No copy.
        ================================================================= */}
        <div className="sem-pad-t">
          <AboutZoom alt={t("zoomAlt")} />
        </div>

        {/* =================================================================
            🔴 §8 STAFF — AWAITING CLIENT. DO NOT DELETE THIS BLOCK.

            fflsynergy names the founder in exactly one place, a meta
            description reading "founded by Rula AlAryan". There is no bio, no
            leadership section, no founder photograph and no team copy anywhere
            on the site. checkmatefinancialgroup.com's About page has four
            named leaders with full bios, which is precisely what must not be
            borrowed to fill this hole.

            DO NOT WRITE A FOUNDER BIO.

            NEEDED FROM ZIAD: two or three sentences on Rula AlAryan and the
            founding, plus a usable portrait.

            TO RESTORE: uncomment, add the `about.founder.*` keys to BOTH
            message files, and drop the portrait in public/synergy/. No layout
            arithmetic changes — the gradient is on the wrapper and reflows.

            <section
              aria-labelledby="about-founder"
              className="sem-shell sem-pad-t"
            >
              <div className="sem-inner">
                <div className="grid grid-cols-1 items-start gap-y-12 md:grid-cols-[1fr_1.25fr] md:gap-x-[var(--sem-gap-lg)]">
                  <FadeUp>
                    <div className="mx-auto w-4/5">
                      <div className="relative aspect-[4/5] w-full overflow-hidden">
                        <Image
                          src="/synergy/founder-portrait.jpg"
                          alt={t("founder.imageAlt")}
                          fill
                          sizes="(min-width: 768px) 40vw, 80vw"
                          quality={78}
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                  </FadeUp>
                  <FadeUp index={1}>
                    <h2
                      id="about-founder"
                      className="sem-h2 font-display text-cream"
                    >
                      {t("founder.headline")}
                    </h2>
                    <div className="mt-8 space-y-6 text-cream">
                      <p className="sem-body">{t("founder.p1")}</p>
                      <p className="sem-body">{t("founder.p2")}</p>
                    </div>
                  </FadeUp>
                </div>
              </div>
            </section>
        ================================================================= */}

        {/* §9 is the site-wide <Footer />, mounted in app/[locale]/layout.tsx
            inside <SmoothScroll>. It is already bg-navy #0D1B2A, exactly where
            this gradient lands, so there is no seam and nothing to build. */}
        <div className="h-[clamp(64px,8.6vw,131.2px)]" />
      </div>
    </main>
  );
}
