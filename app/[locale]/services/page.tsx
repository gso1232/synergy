import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import FadeUp from "@/components/FadeUp";
import AboutPullQuote from "@/components/AboutPullQuote";
import ServicesSequence, {
  type SequenceItem,
} from "@/components/ServicesSequence";
import ServicesBreak from "@/components/ServicesBreak";
import ServicesEssay, { type EssayBlock } from "@/components/ServicesEssay";
import ServicesTable, { type TableRow } from "@/components/ServicesTable";

/**
 * /[locale]/services — "What We Protect".
 *
 * Modelled on restaurantsem.com/**mindset**, re-measured live today at
 * 1526 x 658. None of their CSS is copied and none of their files are used.
 *
 * =========================================================================
 * SECTION_ORDER — theirs, and what each one is here.
 *
 *   §1  Hero              658 / 100vh, static      -> photo + h1 + sub
 *   §2  .section_principles  2070, SCROLL-LINKED   -> the SEVEN products,
 *                            sticky visual + copy     sticky image column
 *   §3  .section_fw-parralax  460, full-bleed      -> the break band
 *   §4  .section_mindset-long 5314, essay + a
 *                            4s AUTOPLAY carousel  -> BUILT, MIRRORED, and
 *                                                     scroll-linked, see below
 *   §5  .section_pull-quote   715, word reveal     -> "Every policy is
 *                                                     explained clearly..."
 *   --  (no equivalent)                            -> the comparison table
 *   --  (no equivalent)                            -> the closing CTA
 *   §6  footer                604                  -> site-wide <Footer />
 *
 * =========================================================================
 * 🔴 §4 IS MIRRORED, AND ITS IMAGE COLUMN IS NOT A CAROUSEL.
 *
 * Theirs is 5,314px: a sticky visual on the LEFT and a 4,950px essay running
 * down the RIGHT. Ours reverses the columns — essay left, sticky visual right
 * — so the section reads as the answering half of §2 rather than a repeat of
 * it. Every measurement is theirs; only the order is flipped. See
 * `components/ServicesEssay.tsx` and the `.essay-*` rules in globals.css.
 *
 * Their image column is a TIMER: `data-autoplay="true"`, `data-delay="4000"`,
 * `data-animation="cross"`, verified by pinning scrollY at 0 for eight seconds
 * and watching the slides advance anyway. Ours is not. It runs the same
 * `useSequenceSwap` §2 runs, so the image changes because the reader scrolled
 * past a block. Verified: 1→2→3→4→5 across the pin, correct after a hard jump
 * from the page bottom, and UNCHANGED after nine seconds parked without
 * scrolling.
 *
 * =========================================================================
 * COPY. §1–§3, §5 and the table are Synergy's own from fflsynergy.com/services,
 * VERBATIM except for nine documented changes — five compliance, four Checkmate
 * collisions — each approved with the published line quoted.
 *
 * 🔴 §4 IS THE ONE SECTION THAT IS NOT VERBATIM ANYTHING, and it could not be.
 * The section needs 210 words per block by measurement; fflsynergy's entire
 * unspent prose is ~350 words of FAQ earmarked for another page, and every
 * other line on their site already ships somewhere in this repo. So §4 is
 * EXPANSION: each block elaborates a sentence fflsynergy publishes, and every
 * fact not on their site was flagged and approved individually. The approved
 * set is Tier A + Tier B + item 1-C; item 3-A (level premium across the term)
 * was REFUSED and is not in the copy. See HANDOFF for the full ledger.
 *
 * 🔴 TWO SENTENCES IN `essay.b1` ARE TAX TREATMENT, NOT PRODUCT MECHANICS, and
 * are PENDING ZIAD's written compliance answer exactly as "guaranteed for life"
 * is — the death benefit "is not counted as income", and money borrowed against
 * cash value "is not treated as income received". Both are written in plain
 * terms with no statutory basis cited, on instruction. They SHIP pending that
 * answer; if it comes back against, they come out.
 *
 * The FAQ block on their page is deliberately excluded; it gets its own page.
 *
 * 🔴 ONE CLAUSE IS OMITTED RATHER THAN REWRITTEN. Their Final Expense copy
 * ends "...and coverage is guaranteed for life." Whether that is a
 * contractual product feature or a prohibited guaranteed-outcome claim is a
 * COMPLIANCE question, not a copy question, and it is pending Ziad's written
 * answer. The clause is omitted, not reworded and not shipped. See
 * `services.products.p2.body`.
 *
 * =========================================================================
 * SURFACE. Cream #F8F4EE, ink type, the same system as /about — see the
 * §6a note in HANDOFF.md. No gradient, no separators, no gold.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

/**
 * The seven products, in fflsynergy's own order.
 *
 * SEVEN, COUNTED OFF THE LIVE PAGE — not assumed, and not trimmed to the
 * reference's five. Their §2 runs five items; the mechanism does not care how
 * many there are, and cutting two products or inventing three would be fitting
 * content to a layout.
 */
const PRODUCTS = [
  ["p1", "service-term-life.jpg"],
  ["p2", "service-final-expense.jpg"],
  ["p3", "service-mortgage-protection.jpg"],
  ["p4", "service-iul.jpg"],
  ["p5", "service-annuities.jpg"],
  ["p6", "service-medicare.jpg"],
  ["p7", "service-health.jpg"],
] as const;

/**
 * §4's five blocks. FIVE IS A MEASUREMENT, NOT A PREFERENCE — a block has to be
 * at least as tall as the sticky frame beside it or the last image never holds
 * the screen for its own height of scroll, which sets a 210-word floor per
 * block at the widest viewport. See the note on `<ServicesEssay>` below.
 *
 * THE FILENAMES DESCRIBE WHAT THE FILE SHOWS, not which block it serves. That
 * is the lesson of `gallery-leadership-panel` / `gallery-training-session`,
 * which read as two fresh assets and are re-crops of two photographs already
 * rendered on /about. A slot-numbered name would rot the moment the block
 * order changed; a subject name cannot.
 *
 * 🔴 NO ALT TEXT, AND THAT IS NOT AN OVERSIGHT. The sticky column is
 * `aria-hidden` and is `display:none` below 992, so there is no width and no
 * assistive-technology path on which an alt string is ever announced. These
 * five photographs are decorative relative to the essay beside them — unlike
 * §2, where the image identifies which product you are reading about. Writing
 * alt here would be authoring text nobody can reach. If the ≤991 decision is
 * ever reversed and the images move inside the blocks, alt must be written at
 * that point and `services.essay.b*.imageAlt` re-added to both message files.
 */
const ESSAY = [
  ["b1", "essay-desk-evening.jpg"],
  ["b2", "essay-sea-horizon.jpg"],
  ["b3", "essay-facade-old-new.jpg"],
  ["b4", "essay-waiting-chairs.jpg"],
  ["b5", "essay-road-hills.jpg"],
] as const;
const ROWS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7"] as const;
const COLS = ["c0", "c1", "c2", "c3", "c4", "c5", "c6"] as const;

export default async function ServicesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "services" });

  const items: SequenceItem[] = PRODUCTS.map(([key, file]) => ({
    key,
    heading: t(`products.${key}.name`),
    body: t(`products.${key}.body`),
    src: `/synergy/${file}`,
    alt: t(`products.${key}.imageAlt`),
  }));

  const rows: TableRow[] = ROWS.map((r, i) => ({
    key: r,
    product: t(`products.p${i + 1}.name`),
    cells: COLS.slice(1).map((c) => t(`compare.${r}.${c}`)),
  }));

  return (
    <main>
      {/* =====================================================================
          §1 HERO — 100svh, static.

          THE BAR IS TRANSPARENT OVER THIS. /services joins /about and the
          locale root in SiteHeader's `isHeroRoute` set, and it earns that the
          same way they do: the first viewport is a full-bleed photograph dark
          enough to carry white nav ink. The rule is a property of the page,
          not a list of routes.

          Same three layers as /about's hero and the same reasoning:
          `.hero-veil-top` carries the nav, `.about-hero-scrim` carries the
          copy, and there is NO foot ramp — the photograph ends on a hard edge,
          exactly like every other image on the site meets its flat colour.
      ===================================================================== */}
      <section className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-navy">
        <Image
          src="/synergy/services-hero-family.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={74}
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="hero-veil-top absolute inset-x-0 top-0 h-[42%]"
        />
        <div aria-hidden="true" className="about-hero-scrim absolute inset-0" />

        <div className="sem-shell relative z-10 flex h-full flex-col justify-end pb-[32.8px]">
          <div className="sem-inner w-full">
            <h1 className="sem-display max-w-[14ch] font-display text-cream">
              {t("hero.headline")}
            </h1>
            <p className="sem-hero-sub mt-6 max-w-[32em] text-cream md:mt-8">
              {t("hero.sub")}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================
          THE CREAM COLUMN. One wrapper, every section below it transparent —
          the same structure /about uses. No gradient, no bands, no rules.
      =================================================================== */}
      <div className="about-page min-h-screen">
        {/* =================================================================
            §2 THE PRODUCTS — their `.section_principles`.
            Heading and intro first, then the scroll-linked sequence.
        ================================================================= */}
        <section aria-labelledby="services-products" className="sem-shell sem-pad-t">
          <div className="sem-inner">
            <FadeUp>
              <h2
                id="services-products"
                className="sem-display font-display text-ink"
              >
                {t("products.heading")}
              </h2>
              <p className="sem-body mt-6 max-w-[46ch] text-ink">
                {t("products.intro")}
              </p>
            </FadeUp>
          </div>
        </section>

        {/* The sequence carries its own <section> and its own heading id so
            the sticky column can span the full list. `services-products` is
            the h2 above it; this one is labelled by the same heading because
            it is the same section of content. */}
        <ServicesSequence items={items} headingId="services-products" />

        {/* =================================================================
            §3 THE BREAK — their `.section_fw-parralax`.
        ================================================================= */}
        <div className="sem-pad-t">
          <ServicesBreak alt={t("breakImageAlt")} />
        </div>

        {/* =================================================================
            §4 THE MIRRORED ESSAY — their `.section_mindset-long`.

            🔴 THE THREE-ACROSS TRUST ROW THAT USED TO HOLD THIS SLOT IS GONE.
            It was the stand-in while this section was unbuilt. Its three items
            were 75 words of fflsynergy's own copy covering the same ground the
            essay covers, and the same three claims already ship on the
            homepage (`whySynergy.rows.r1/r2/r6`) and on /about — so deleting
            the row removes a near-duplicate section and loses nothing from the
            site. `services.trust.*` is removed from both message files; the
            deleted strings are recorded in HANDOFF if they are ever wanted.

            🔴 "FOLD IN" DID NOT MEAN PASTE. The row's sentences are NOT
            reproduced inside the essay, and that is deliberate: every one of
            them is a claim about Synergy — who they work with, how they sell,
            where they are licensed — and the rule for this section is that it
            explains products and says nothing new about the company. Dropping
            three first-person brand lines into the middle of a mechanics essay
            would also break its voice on the page. The essay takes the SLOT,
            not the sentences.

            WORD COUNT IS A MEASUREMENT. A block has to be at least as tall as
            the sticky frame beside it, or the last image never holds the screen
            for its own height of scroll and the column dies with air under it.
            The frame grows until `.sem-inner` caps at 1476, topping out at
            733.5px; block chrome (49.2 + h3 + 24 + 49.2) is 178; the remaining
            555.6px at a 38.38 line-height is 15 lines; 15 lines in the 855.8px
            essay column is 210 words. Below that width the requirement only
            falls — 200 at 1536, 140 at 1280, 70 at 992, and nothing at all
            below 992 where the frame is hidden. The shipped blocks run
            304 / 227 / 248 / 239 / 217.

            FIVE BLOCKS, not their seven-ish. Theirs is 5,314px; five blocks
            land near 3,900. Six or seven would sit closer to their number, and
            reaching for a reference's height is exactly the reasoning that
            produced the founder-bio mistake. The count follows the subjects
            the source supports.
        ================================================================= */}
        <section aria-labelledby="services-essay" className="sem-shell sem-pad-t">
          <div className="sem-inner">
            <FadeUp>
              <h2 id="services-essay" className="sem-h2 font-display text-ink">
                {t("essay.heading")}
              </h2>
            </FadeUp>
          </div>
        </section>

        {/* The essay carries its own <section> so the sticky column can span
            the whole run, and is labelled by the h2 above — the same split §2
            uses for the same reason. */}
        <ServicesEssay
          headingId="services-essay"
          blocks={ESSAY.map(
            ([k, file]): EssayBlock => ({
              key: k,
              heading: t(`essay.${k}.name`),
              body: t(`essay.${k}.body`),
              src: `/synergy/${file}`,
            }),
          )}
        />

        {/* =================================================================
            §5 PULL-QUOTE — their `.section_pull-quote`, our existing
            component and its existing measured word reveal.
        ================================================================= */}
        <AboutPullQuote text={t("quote")} className="sem-pad-t" />

        {/* =================================================================
            THE COMPARISON TABLE — no equivalent on their page.
        ================================================================= */}
        <ServicesTable
          headingId="services-compare"
          heading={t("compare.heading")}
          intro={t("compare.intro")}
          caption={t("compare.caption")}
          columns={COLS.map((c) => t(`compare.cols.${c}`))}
          rows={rows}
        />

        {/* =================================================================
            CLOSING CTA — fflsynergy's own closing block.

            🟡 NO BUTTON. Their page ends this block with a call-to-action
            control; ours does not, for the same reason the About page's §4
            pill was removed — there is no contact route and no working form
            (the lead modal is deliberately disabled). The phone number in the
            header and footer is the live path, and it is honest. One <Link>
            to add the day /contact exists.
        ================================================================= */}
        <section aria-labelledby="services-cta" className="sem-shell sem-pad-t">
          <div className="sem-inner">
            <FadeUp>
              <h2 id="services-cta" className="sem-h2 font-display text-ink">
                {t("cta.heading")}
              </h2>
              <p className="sem-body mt-6 max-w-[46ch] text-ink">
                {t("cta.body")}
              </p>
            </FadeUp>
          </div>
        </section>

        <div className="h-[clamp(64px,8.6vw,131.2px)]" />
      </div>
    </main>
  );
}
