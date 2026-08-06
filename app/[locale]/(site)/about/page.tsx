import type { Metadata } from "next";
import Image from "next/image";
// NOTE: no `next/link` import. This page renders no links of its own — the §4
// pill CTA was removed for want of an honest destination (see the note in §4).
// Restoring it needs this import back.
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import FadeUp from "@/components/FadeUp";
import CtaPair from "@/components/CtaPair";
import { carrierLogoSrc, CARRIER_KEYS } from "@/lib/carrierLogos";
// NOTE: no RouteTheme. This page is CREAM now, and <body> is already
// `bg-cream`, so the canvas propagates the right colour to the overscroll
// region with no help. RouteTheme and its CSS rule are both retained for the
// next dark route — and removing the call here is what allowed
// `suppressHydrationWarning` to come off <html> in app/[locale]/layout.tsx.
// Those two travel as a pair; see HANDOFF.md §8.
import AboutPullQuote from "@/components/AboutPullQuote";
// AboutParallaxImage import REMOVED 2026-07-30 — §5's image parallax was dropped
// in favour of plain <Image> (real Synergy photos, no upscale). Re-add this line
// to restore the parallax; see the §5 imagery note and the block below §5's h3.
import AboutValueColumn from "@/components/AboutValueColumn";
import AboutZoom from "@/components/AboutZoom";
import RevealText from "@/components/RevealText";

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
 *   §2b Logo grid       inside §2                 -> 5 carrier LOGOS
 *                                                    ✅ REAL ARTWORK (2026-07-30)
 *   §3  Pull-quote #1   715px, scrubbed reveal    -> "Insurance is not a
 *                                                    product. It is a promise."
 *   §4  Food & Drink    826px, entrance reveal    -> "Built on Trust. Driven
 *                                                    by Results." + 2 images.
 *                                                    Their pill CTA is
 *                                                    DELIBERATELY ABSENT
 *   §5  Images grid     1158px, scrubbed drift    -> "What We Stand For",
 *                                                    3 columns, NO stagger
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
 * NO SECTION HAS A BACKGROUND. Every section here is transparent and the
 * whole non-hero column sits on ONE wrapper — the same structure the
 * reference uses, where that wrapper carries one gradient
 * (`linear-gradient(rgb(38,92,120), rgb(30,30,30) 75%)` over 8,036px) and you
 * scroll from daylight into darkness.
 *
 * 🔴 OURS NO LONGER DOES. THE PAGE IS CREAM.
 *
 * The wrapper is `.about-page`, a flat #F8F4EE. `.about-gradient`
 * (#1C3A5A -> #0D1B2A) is RETIRED AND COMMENTED OUT in globals.css with its
 * full navy-lift derivation intact; swapping the class name back is the whole
 * restore.
 *
 * WHAT REPLACED THE DESCENT. The gradient dropped 3.87x from top to bottom and
 * that descent was the page's spine. A light page cannot have one: cream
 * #F8F4EE (L 0.9083) to greige #ECE9E2 (L 0.8160) is 1.11x, and anything
 * deeper breaks gold-deep #7D641F as text (it needs its background at
 * L >= 0.786). So background bands are not available and none were added.
 *
 * The value moved into the PHOTOGRAPHS. Inverted, they stop being the light
 * mass and become the dark one, over a wider range than the gradient ever had
 * — hero 0.132, §2 0.405, §4 0.292/0.412, §5 0.234/0.290/0.597, §7 zoom 0.105,
 * footer 0.0104. The descent is not gone; it is an arc carried by the images
 * instead of a ramp painted on the background.
 *
 * 🔴 THERE ARE NO SECTION SEPARATORS AT ALL. NO RULES, NO BANDS, NO CARDS.
 *
 * A build with gold hairlines at every seam existed and has been removed on
 * instruction. What carries the section rhythm now, in order of how much work
 * each does:
 *
 *   1. WHITESPACE. `.sem-pad-t` is back on every section and is the rhythm
 *      again — 130.8 / 69.2 / 64px at 1536 / 820 / 390. The hairline never
 *      created that gap; it sat inside it.
 *   2. THE PHOTOGRAPHS. Every section except the two pull-quotes contains one,
 *      and on cream they are the page's dark mass: §2 image right, §4 pair
 *      left, §5 three-up, §7 full-bleed. Their POSITION alternates, so no two
 *      adjacent sections put their weight in the same place.
 *   3. TYPE SCALE. display 90.2 / h2 57.4 / quote 75.44 / body 21.32. No two
 *      adjacent sections open at the same size.
 *
 * THE HONEST CAVEAT: the two pull-quotes hold no photograph, so they are
 * bounded by whitespace and type scale alone. That is exactly what the
 * reference does — their quote sections carry no rule either, and sit on the
 * gradient with nothing marking where they start or stop. It reads because
 * 75px display type against 21px body is its own boundary.
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
 * on this page was authored except image alt text and the §4 eyebrow.
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
 * §2b — the carriers that appear in the logo row.
 *
 * 🔴 2026-08-07 — NOW ALL 21, NOT FIVE. The previous note argued for five
 * ("the reference grid is exactly five columns of 191.74px") and that was a
 * layout argument, not a content one: the row's job is to show who Synergy is
 * appointed with, and showing 5 of 21 understates it. Ziad is contracted with
 * every carrier in `carrierLogos.CARRIER_KEYS`, the same set the homepage
 * marquee already renders, so the About wall now renders the same 21.
 *
 * The five-column reference grid does NOT survive that change, and the fix is
 * the one the grid note below already spells out — see the layout comment on
 * the <ul>. Order is CARRIER_KEYS', so About and the homepage read alike.
 */
const LOGO_CARRIERS = CARRIER_KEYS;

/**
 * §5 imagery.
 *
 * 🟢 2026-07-30 — NOW REAL SYNERGY PHOTOS. The last licensed stock on the page
 * is gone. The three provisional Pexels frames (value-integrity / -education /
 * -legacy, still on disk and still logged in CREDITS.md) are replaced by
 * client-supplied photographs of the actual team:
 *
 *   Integrity  about-value-rula-speaking.jpg   4640x6960  (founder on stage)
 *   Education  about-value-training-skills.jpg 1080x1620  (office training)
 *   Legacy     about-value-aiman-rula.jpg      1080x1620  (leadership portrait)
 *
 * All three are EXACTLY 2:3 (0.6667), so the fixed 2:3 box performs NO crop.
 * They SHIP AS SHOT — the Synergy logo baked into each frame is neither added
 * nor cropped, on instruction.
 *
 * 🔴 THE PARALLAX IS DROPPED HERE, AND THAT IS A RESOLUTION DECISION. A plain
 * image needs box@2x = 880x1320; all three clear it (the two 1080-wide frames
 * by +22.7%). The old AboutParallaxImage needed the 130% LAYER (880x1716),
 * which those two missed by 5.6% and would have upscaled. Clean, unmoving
 * images that never upscale beat a moving one here. The COLUMN DRIFT
 * (AboutValueColumn) is UNCHANGED — it carries no 130% image layer and does not
 * bear on resolution. Restore path is in the block below §5's h3.
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
  v1: "about-value-rula-speaking.jpg", // Integrity — founder on stage
  v2: "about-value-training-skills.jpg", // Education — office training
  v3: "about-value-aiman-rula.jpg", // Legacy — leadership portrait
};

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const tc = await getTranslations({ locale, namespace: "carriers" });
  const tCta = await getTranslations({ locale, namespace: "cta" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <main>
      {/* =====================================================================
          §1 HERO — 100vh, static.

          THE BAR IS TRANSPARENT OVER THIS, not a solid band. /about is now in
          SiteHeader's `isHeroRoute` set, so it behaves exactly like the
          homepage: no background until scrollY > 60, white ink, and the veil
          below carries it. The reference nav never takes a surface at all;
          ours takes one once it leaves the hero, because below the fold this
          page runs a logo row and a three-column image grid that white ink
          cannot sit on unaided.

          🟢 2026-07-30 — NOW SYNERGY'S OWN PHOTOGRAPH. Replaced the family
          placeholder with `about-hero-office.jpg` (client-supplied "OFFICE
          PHOTO IMPORTANT.jpeg", the actual Synergy team). Under an h1 reading
          "We Are Synergy" the real team is a TRUE claim — the earlier caveat
          (a team photo of strangers would be false) is resolved: these are the
          real people. Ships AS SHOT, including the Synergy logo baked into the
          lower-right of the frame — not added here and not cropped out of the
          file; on instruction these photos are not composited or re-branded.

          ⚠️ RESOLUTION CAVEAT — a real downgrade from the 3840x2560 placeholder,
          taken on instruction (authenticity over sharpness). Source is
          1620x1080 (same 1.500 aspect as the placeholder, so the object-top
          crop maths below are UNCHANGED). 2x DPR clearance at 1536 wide:
          1620 / 3072 = 52.7% — it clears 1x (+5.5%) but is a 1.9x shortfall at
          2x, so it renders soft on Retina/2x displays. Max crisp DPR 1.055x.
          A higher-resolution original of this frame is the only fix. The lower
          crop budget (12.1% of height at desktop) lands on the baked logo and
          the floor, not on faces — heads still clear the nav.
      ===================================================================== */}
      <section className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-navy">
        {/* ⚠️ `object-top`, NOT `object-center`, AND IT ONLY DOES ANYTHING AT
            DESKTOP. The source is 3840x2560 (1.500). At 1536x900 the box is
            1.707 — WIDER in aspect — so `cover` fits by width and crops 124px
            of height (12.1%). Centred, that put the topmost head about 20px
            from the frame edge with the nav sitting on it at y 49-68.

            `object-top` spends the whole 124px of crop budget on the top of
            the frame: the family drops 62px and the highest head clears the
            nav band with room. 62px is the entire budget — there is no more
            to give, and any value between the two only clears the nav
            partially (at 25% the head lands at ~51px, still under the links).

            AT 820 AND 390 THIS IS A NO-OP, verified by arithmetic and by
            rendering: both boxes are TALLER in aspect than 1.500 (0.801 and
            0.462), so `cover` fits by HEIGHT and crops width instead. The
            full frame height is shown and the vertical position has nothing
            to position. Horizontal stays centred at every width. */}
        <Image
          src="/synergy/about-hero-office.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          /* 🔴 q88, UP FROM q74 — THE ONLY HONEST SHARPENING AVAILABLE HERE.
             The client reports this hero as soft. It is: the file is 1620x1080
             and a 1536-wide hero needs 3072px at 2x, so it is 47.3% short and
             the browser upscales it ~1.9x. THERE IS NO SHARPER SOURCE — the
             original ("OFFICE PHOTO IMPORTANT.jpeg") is the same 1620x1080, and
             every other own office frame on disk is too. Upscaling to fake it is
             refused (Standing Rule 9).
             What CAN be recovered is compression damage, which the upscale was
             magnifying. Measured (variance-of-Laplacian on the served
             derivative): q74 = 665, q82 = 705, **q88 = 809**, q92 = 852, against
             the uncompressed file's ceiling of 923. q88 recovers 22% of the lost
             detail; q92 buys 6% more for another 60KB of AVIF.
             ⚠️ COST, FLAGGED AGAINST THE PERFORMANCE BRIEF: this is the LCP
             image and AVIF goes 239KB -> 374KB. Sharpness was asked for
             explicitly, so it wins here — but the two asks pull opposite ways
             and this is where they meet. */
          quality={88}
          className="object-cover object-top"
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
        {/* 🔴 NO FOOT RAMP. The photograph ends on a hard edge at 5.16x, the
            same way every other image on this page meets its flat colour —
            §2 at 2.11x, §5 at 3.38 / 2.82 / 1.48x, §7 onto navy at 1.42x. The
            ramp that used to sit here is commented out in globals.css with
            its full per-row derivation. DO NOT PUT IT BACK: it was removed
            for CONSISTENCY, not because the step became tolerable. */}

        {/* 32.8px, WHICH IS SEM'S OWN OFFSET — `margin-bottom: 2rem` on their
            notice block, measured live today.

            IT ONLY BECAME AVAILABLE WHEN THE FOOT RAMP CAME OUT. The previous
            value was 18vh (162px at 900) and every pixel of it was clearance
            for a 15% cream ramp: cream bleeding up into the sub's last line is
            cream text on cream. With a hard edge there is nothing below the
            copy to clear, so the block sits exactly where theirs does.

            THE SCRIM WAS RE-DERIVED FOR THIS POSITION. The copy now runs to
            ~96% of the hero instead of 82% — a completely different band of
            the photograph, and one the old decaying scrim left almost bare.
            See .about-hero-scrim in globals.css. */}
        <div className="sem-shell relative z-10 flex h-full flex-col justify-end pb-[32.8px]">
          <div className="sem-inner w-full">
            {/* Still CREAM — this is the one place on the page where type sits
                on a photograph, and the scrim under it is measured for exactly
                this pairing. Everything below the hero is ink on cream. */}
            <RevealText
              as="h1"
              text={t("hero.headline")}
              className="sem-display max-w-[14ch] font-display text-cream"
            />
            {/* `.sem-hero-sub`, not `.sem-body` — 20.5px / 30.75 / w600 at
                desktop, which is SEM's notice block measured live. Full
                derivation, including why our size ramp deliberately is NOT a
                copy of their non-monotonic one, is on the class in globals.css.

                THE MEASURE IS 32em, AND `em` IS NOT A TYPO FOR `ch`. Their
                block runs 656.35px at 20.5px with `max-width: none` — that is
                32.02 EM, which is about 53ch in this face. An earlier pass
                wrote `32ch`, which is 427.6px: a third narrower than theirs and
                a different block shape entirely. `em` also tracks the fluid
                font size for free, so the measure holds at every width without
                a second clamp. */}
            <p className="sem-hero-sub mt-6 max-w-[32em] text-cream md:mt-8">
              {t("hero.sub")}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================
          THE CREAM COLUMN. One wrapper, every section below it transparent —
          the same structure the gradient had, with a flat surface instead.

          ⚠️ `.about-gradient` IS RETIRED, NOT DELETED. It and the whole
          navy-lift #1C3A5A derivation are commented out in globals.css
          directly above `.about-page`. Swapping this one class name back is
          the entire restore.

          WHAT SEPARATES SECTIONS NOW: NOTHING EXPLICIT. No rules, no bands,
          no cards. Whitespace (`.sem-pad-t`), the photographs and the type
          scale carry it — see the rhythm note in the file docblock above.
          Background bands were measured and rejected too: cream to greige is
          1.11x and anything deeper breaks gold-deep as text.
      =================================================================== */}
      <div className="about-page min-h-screen">
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
                <RevealText
                  as="h2"
                  id="about-story"
                  text={t("story.eyebrow")}
                  className="sem-display font-display text-ink"
                />
                {/* Their left wrapper is a flex column with a 32.8px gap. */}
                <div className="mt-8 space-y-6 text-ink">
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

                🔴 SUPERSEDED 2026-08-07 — EVERYTHING BELOW UNTIL THE NEXT RED
                MARKER DESCRIBES THE FIVE-LOGO, FIVE-COLUMN ROW. The row is now
                all 21 marks in a wrapping wall; the reference's five columns
                and its 191.74px cell no longer apply, and neither does the
                48px ship height the table at the end of this note lands on.
                Kept because the reasoning it records — why the cell has no
                fixed height, why 131px never comes back, why nothing is
                upscaled — still governs. Live numbers are on the <ul> below.

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
                same cell. The grid, the gap, the cell height and the centring
                are all on the <li>, so nothing here changes when artwork
                arrives — only the child.

                ⚠️ THE CELL HAS NO HEIGHT AT ALL, AND THAT REVERTS THE DAY
                ARTWORK ARRIVES. The reference's cells are 131px because that
                is what a logo needs at `object-fit: contain`. Ours hold type:
                21.9px at 1536, 18.8 at 820, 37.5 at 390 (where the names wrap
                to two lines).

                A fixed height was tried twice and left dead space both times —
                131px left 109.1 / 112.3 / 93.5 empty per cell, and 56px still
                left 34.1 / 37.2 / 18.5. Because the cell is `items-center`,
                half of that slack lands BELOW the last row of type, which is
                the bottom of §2, which is why the §2 → §3 seam ran long at
                every width (155.1 / 92.7 / 85.8 against a 130.8 / 69.2 / 64
                rhythm).

                Grid rows stretch to the tallest cell on their own, so nothing
                needed the height for alignment. Content height, zero slack.

                🔴 RESOLVED 2026-07-30 — AND `h-[131px]` IS **NOT** COMING
                BACK. The artwork landed and the cells now hold real marks, but
                131px is unachievable without upscaling two of them. Measured on
                the real rendered grid (cell 190.9px wide at 1536, matching the
                reference's 191.74):

                  logo height   corebridge 367w   athene 368w   global-atl 405w
                  131px (cap)      -3.9% SHORT     -3.6% SHORT     +6.1%
                   56px            +7.1%           -3.6% SHORT     +7.1%
                   48px  <-ship   +25.0%          +11.5%          +25.0%

                At 131px the logo's width hits the 190.9px cell cap, so each
                needs a 382px source and two do not have it. 48px clears all
                three with margin and matches the homepage marquee's 40px band.
                The cell keeps CONTENT height for the same reason it did when it
                held type: a fixed 131px cell around a 48px mark reintroduces
                exactly the dead space (and the long §2 → §3 seam) documented
                above. Nothing is upscaled.

                The row's own top margin halved with it — the old clamp was the
                full section rhythm (130.8) sitting INSIDE a section, which is
                what made "Our Story" and the carrier row read as two separate
                blocks rather than one. */}
            {/* 🔴 2026-08-07 — THE FIXED GRID IS GONE, AND IT HAD TO GO WHEN
                the row went from 5 marks to 21. A grid gives every mark the
                same CELL WIDTH; these marks do not have the same width. At the
                48px common height the row ships, natural widths measured off
                the real assets run from 48px (columbus-life, square) to 279px
                (american-national, 234x40.3) — a 5.8x spread:

                  american-national 279   liberty-bankers 278   m-of-omaha 270
                  ethos 249   aetna 247   americo 241   transamerica 209
                  ... 14 more ...   united-home-life 83   columbus-life 48

                No column count works. Even the widest option — the full
                1220px container at 5 columns, 49.2px gap — is 205px per cell,
                so `max-w-full` would shrink the four widest marks to 35-42px
                tall while columbus-life sat at a true 48. That is the exact
                failure the note above records at 7 columns, and the one the
                homepage solved by never wrapping into cells at all.

                A WRAPPING FLEX ROW IS THE FIX: width is unconstrained, so
                every mark renders at a TRUE common band and the row breaks
                wherever it runs out of container. Rows come out ragged-right
                and centred — which is what a logo wall looks like — rather
                than even-columned and unevenly sized, which is what a grid of
                these assets looks like. `max-w-full` is dropped with the cells
                (nothing is 1220px wide; the widest is 279px), so no mark is
                ever scaled down. The band itself is set on the <li>/<img> —
                see the sizing note there.

                The 4/5 inset goes with it. Five marks in 80% of the container
                was the reference's proportion; 21 marks need the full
                max-w-content or the wall grows a row for no reason. */}
            <FadeUp index={2}>
              {/* THE BAND STEPS DOWN WITH THE VIEWPORT — 28 / 40 / 44px — and
                  the desktop value is 44, not the 48 the five-logo row shipped
                  at. Both changes are the same measurement, taken by packing
                  the real rendered aspect ratios at each candidate size:

                    ul width   1024  1060  1100  1140  1157  1180  1220
                    44px/40    4/5/4/5/3  4/6/4/5/2  4/6/4/6/1  5/6/5/5 ...
                    48px/49.2  4/5/5/5/2  4/6/4/6/1  ...        4/6/4/6/1

                  44px with a 40px gap gives four even rows (5/6/5/5) at every
                  width from 1140 to the 1220 cap — i.e. at 1280 and 1366, the
                  two desktop widths this page is checked at. 48px does not; it
                  leaves a single centred mark on a fifth row. 21 marks is also
                  simply more block than 5, and 44 sits between the homepage
                  band (40) and the old row (48) rather than inventing a size.

                  ⚠️ NOT SOLVED AT EVERY WIDTH, AND IT CANNOT BE. Greedy wrap
                  over a fluid container always has some width where the tail is
                  one mark — here a ~40px window around ul=1100 (viewport ≈1223).
                  It was measured, it is narrow, and a tapering centred last row
                  is what a logo wall does. Do not add per-width gap hacks.

                  🔴 THE PHONE BAND IS 28px, AND 32 IS WHY. At 32px the two
                  widest marks (mutual-of-omaha 175, liberty-bankers 180) do not
                  fit a second mark beside them in the 327px column, so the wall
                  came out 11 rows / 613px tall with TWO solo rows stranded in
                  the middle. 28px drops the widest to 158, every row pairs, and
                  the wall is 9 rows / ~476px. Measured at 327/343/375/400 — no
                  solo row at any of them, and the gap barely matters (16/20/24
                  all pack identically), so the 24px gap stays. 28 is below the
                  homepage strip's 40px band on purpose: the strip is a marquee
                  and never wraps, so it can afford the height.

                  Nothing is upscaled at 44: every raster's native height clears
                  2x44 (the tightest is nassau at 195 = 2.2x) and the 10 SVGs
                  are vector. Source order is kept — see CARRIER_KEYS. */}
              <ul className="mx-auto mt-[clamp(32px,4.3vw,65.6px)] flex max-w-content flex-wrap items-center justify-center gap-x-6 gap-y-7 md:gap-x-10 md:gap-y-9 lg:gap-y-10">
                {LOGO_CARRIERS.map((key) => (
                  <li
                    key={key}
                    className="flex h-7 shrink-0 items-center justify-center md:h-10 lg:h-11"
                  >
                    {/* `alt` is `carriers.names.*`, the SAME translated string
                        the homepage strip uses, so the two surfaces cannot name
                        a carrier differently — and all 21 keys exist in both
                        en and es, checked before this went to 21.

                        Plain <img>, not next/image, deliberately: this mirrors
                        CarrierStrip, the sources are already correctly sized
                        (10 of the 21 are SVG), and the optimiser cannot improve
                        a vector. `grayscale`/`opacity-80` are the homepage's
                        treatment, kept so the two logo surfaces read as one
                        system. Logos are exempt from contrast requirements
                        (WCAG 1.4.11 excludes logotypes); no text moved. */}
                    <img
                      src={carrierLogoSrc(key)}
                      alt={tc(`names.${key}`)}
                      loading="lazy"
                      decoding="async"
                      className="h-7 w-auto object-contain opacity-80 grayscale md:h-10 lg:h-11"
                    />
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
                <div className="col-span-2 flex h-full flex-col justify-center xl:col-span-1">
                  {/* EYEBROW — theirs reads "Dinner at SEM" in this slot.
                      fflsynergy publishes nothing that fits it, so this is an
                      AUTHORED INTERFACE LABEL under the standing rule that
                      permits them: it names the section and asserts nothing
                      about the business — no claim, no number, no promise.
                      One line to change or remove. */}
                  <p className="sem-eyebrow text-ink">{t("trust.eyebrow")}</p>
                  <h2
                    id="about-trust"
                    className="sem-h2 mt-[clamp(12px,1.1vw,16.4px)] font-display text-ink"
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
                  <div className="mt-[clamp(24px,2.15vw,32.8px)] text-ink">
                    <p className="sem-body">{t("trust.p1")}</p>
                    {/* ✅ THE CTA IS BACK — but NOT the one that was removed,
                        and that distinction is the whole point.

                        What was removed was `about.trust.ctaLabel` ("Open the
                        retirement calculator") pointing at /calculator, and the
                        note above is right that it misdirected: this section is
                        about who Synergy is, not about a projection tool. That
                        reasoning still stands and that label is still retired
                        (the key stays untouched in both message files).

                        What is here instead is the site's shared CTA pair —
                        quote first, phone second — which is a CONVERSION
                        moment rather than a story link, and /contact is a real
                        built route now. The section no longer ends on a full
                        stop with nothing to do next. See CtaPair.tsx. */}
                    <CtaPair
                      locale={locale}
                      variant="cream"
                      quoteLabel={tCta("quote")}
                      secondary={{
                        kind: "tel",
                        label: tCta("call"),
                        aria: tCta("callAria"),
                        href: tNav("phoneHref"),
                      }}
                      className="mt-8"
                    />
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
              <RevealText
                as="h2"
                id="about-values"
                text={t("values.headline")}
                className="sem-h2 font-display text-ink"
              />
            </FadeUp>

            {/* HALVED. The old clamp was the full SECTION rhythm (130.8 at 1536)
                sitting inside a section, which pushed "What We Stand For" so
                far from its own three columns that the heading read as
                detached from them. */}
            <ul className="mt-[clamp(32px,4.3vw,65.6px)] grid grid-cols-1 gap-x-[var(--sem-gap-lg)] gap-y-12 xl:grid-cols-3">
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
                    <h3 className="sem-eyebrow font-display text-ink">
                      {/* 🔴 gold-deep #7D641F, NOT gold #C9A84C.
                          gold on cream is 2.09:1. There is a real argument
                          that these numerals are pure decoration and therefore
                          exempt from 1.4.3 — they are aria-hidden, they are
                          ordinal ornament, and the word alone is this
                          heading's accessible name. That argument was
                          DELIBERATELY NOT TAKEN. It is an exemption you would
                          have to defend, on a site with documented regulatory
                          exposure, and this project already refused to loosen
                          gold to large-text-only for exactly that reason.
                          gold-deep measures 5.16:1 and needs no argument. */}
                      <span aria-hidden="true" className="text-gold-deep">
                        {t(`values.${v}.numeral`)}
                      </span>{" "}
                      {t(`values.${v}.title`)}
                    </h3>

                    {/* 16px label-to-image gap, measured. 2:3 portrait, their
                        exact ratio (394x591 at 1526).

                        PLAIN <Image> IN A FIXED 2:3 BOX — the same shape §2 and
                        §4 use. The parallax was dropped here (see the §5 imagery
                        note above): all three real sources are exactly 2:3 and
                        clear box@2x = 880x1320 with margin, so nothing crops and
                        nothing upscales. The `max-w-[440px] xl:max-w-none`
                        wrapper is kept verbatim, so the column measurements are
                        unchanged.

                        TO RESTORE PARALLAX: re-add the import on line ~15 and
                        swap this wrapper/div for the tag below — and accept the
                        5.6% upscale on the two 1080x1620 frames.

                        <AboutParallaxImage
                          src={`/synergy/${VALUE_IMAGES[v]}`}
                          alt={t(`values.${v}.imageAlt`)}
                          sizes="(min-width: 1280px) 28vw, 440px"
                          aspect="aspect-[2/3]"
                          className="mt-4 mx-auto w-full max-w-[440px] xl:max-w-none"
                        />
                    */}
                    <div className="mt-4 mx-auto w-full max-w-[440px] xl:max-w-none">
                      <div className="relative aspect-[2/3] w-full overflow-hidden">
                        <Image
                          src={`/synergy/${VALUE_IMAGES[v]}`}
                          alt={t(`values.${v}.imageAlt`)}
                          fill
                          sizes="(min-width: 1280px) 28vw, 440px"
                          quality={80}
                          className="object-cover object-center"
                        />
                      </div>
                    </div>

                    <p className="sem-body mt-6 text-ink">
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
        {/* A SMALL TOP GAP, NOT THE FULL `sem-pad-t`, AND THE REASON IS THE
            EFFECT'S OWN GEOMETRY.

            The sticky child rests at `scale-50` inside a 100svh box, so its
            visible top edge already sits a quarter of a viewport below the
            runway's top — 225px at 900, 256 at 1024, 211 at 844. The effect
            supplies its own air. A full `sem-pad-t` on top of that put 355.8px
            between the pull-quote's last word and the top of the card.

            Removing the padding outright went too far the other way: measured
            7.3 / 5.8 / 4.4px from the quote's last line to the runway, which
            is not a gap, it is a collision that happens to look fine only
            because the card is drawn 225px lower. This is the middle value —
            structural gap ~56 / 32 / 28, perceived gap ~281 / 288 / 239. */}
        <div className="pt-[clamp(24px,3.2vw,49px)]">
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
                      className="sem-h2 font-display text-ink"
                    >
                      {t("founder.headline")}
                    </h2>
                    <div className="mt-8 space-y-6 text-ink">
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
        {/* 🔴 THE TRAILING SPACER IS GONE, AND IT WAS DOING TWO BAD THINGS.
            It was `h-[clamp(64px,8.6vw,131.2px)]` — 130.8 / 69.2 / 64px of
            nothing between the zoom photograph and the footer. On the dark
            page it was invisible gradient. On cream it would have been a
            131px cream band wedged between a full-bleed photograph and a navy
            footer, which is precisely the hard cream/navy boundary the
            inversion had to solve.

            Deleting it solves both at once: the zoom's own bottom edge is now
            the footer's top edge, and photograph (L 0.105) meeting navy
            (L 0.0104) is a 1.42x step — effectively seamless, against the
            15.87x a cream/navy butt-joint would have been. Holds under
            reduced motion too, where the zoom is a static full-bleed still. */}
      </div>
    </main>
  );
}
