import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { SOCIALS } from "@/components/social";
import { FOOTER_ROUTES, routeHref } from "@/routes";
import LogoLockup from "./LogoLockup";

/**
 * Site footer — GROUNDED, FULL-BLEED, TEXT OVER THE SCENE.
 *
 * Rebuilt on the ALTENNIS reference. There is no card, no panel, no border and
 * no radius: the footer is one continuous edge-to-edge band, the photograph is
 * the background of the WHOLE band, and every piece of content floats over the
 * picture's pale upper half. The section above dissolves into the top of the
 * image, so there is no findable boundary between page and footer.
 *
 * WHAT THIS REPLACED, AND WHY IT WAS WRONG. The previous pass built an inset
 * greige CARD with a 28px radius and pinned the photo to its bottom edge as a
 * 460px strip, with all the type sitting on flat greige above it. That gave a
 * provably exact contrast table — and completely missed the reference, which
 * has no container at all and runs its type over the scene. Three specific
 * faults: a visible card edge where the reference has none, an image reduced to
 * a hidden sliver, and a hard tonal line where the greige stopped.
 *
 * ---------------------------------------------------------------------------
 * THE MELT. The footer paints NO background of its own; the page surface shows
 * through it. Over that sits a gradient on the photograph whose FIRST STOP IS
 * THE PAGE COLOUR AT ALPHA 1 — #FFFFFF since 2026-09-01.
 *
 * 🔴 THE STOP IS WHATEVER THE PAGE IS, AND KEEPING THEM IN STEP IS THE WHOLE
 * SEAM. The history is the warning: this opened on flat #F8F4EE, matching the
 * flat-cream page it was built against; when <body> became a gradient ending at
 * #F4EFE4 that same value was 0.043 of luminance too light at exactly the point
 * the two meet, a visible step across the full width. It was corrected to
 * #F4EFE4. Then the whole site went pure white and this stop did NOT follow, so
 * a hard cream band ran the height of the footer against a white page in
 * production until it was caught.
 *
 * IF THE PAGE COLOUR CHANGES AGAIN, THESE THREE CHANGE WITH IT IN THE SAME
 * COMMIT: the melt's stop, the scrim's stop, and the PAGE constant in
 * scripts/measure-footer-aa.mjs. There is no test that catches this.
 *
 * ---------------------------------------------------------------------------
 * TWO GRADIENTS, EACH ANCHORED TO AN EDGE IN PIXELS.
 *
 *   THE MELT    top-anchored:  cream alpha 1 at 0px -> 0 at --melt
 *               (clamp(140px, 16vw, 240px))
 *   THE SCRIM   bottom-anchored: 0 at the bottom edge -> 0.55 at --reveal,
 *               then HELD at 0.55 for the entire height above it
 *               (clamp(200px, 26vw, 380px))
 *
 * They stack as two cream layers, so the combined alpha is 1-(1-a)(1-b): 1.00
 * at the seam, ~0.55-0.71 across the content, 0 at the bottom edge.
 *
 * 🔴 WHY NOT PERCENTAGES. The first version of this used percentage stops down
 * the layer, and it passed 21/21 at 1440 — because at 1440 the footer is 896px
 * tall and the © line lands at 56% of it. At 390 the same footer is 1259px
 * tall, the © line lands at 83%, and at 83% the wash had already fallen to
 * 0.26. Copyright measured 2.37:1 and the sign-off 2.00:1: two straight fails,
 * invisible from the desktop breakpoint.
 *
 * A percentage scrim cannot track content that reflows. --reveal is the
 * footer's own bottom padding and the scrim's ramp length is the same value, so
 * the flat 0.55 region is exactly the region the content occupies, at every
 * width, whatever the content does. The `pb-[var(--reveal)]` on the content
 * container and the `var(--reveal)` in the gradient MUST stay the same token.
 *
 * 0.55 IS A FLOOR, NOT A TASTE CALL. It was derived against the photograph this
 * footer carried before — the darkest thing that frame put under type resolved
 * to #8E8F8C at 0.55 (5.35:1) and to 4.36:1 at 0.48, so 0.55 was the last
 * passing value. The current image is easier: its tightest block is 6.94:1 at
 * 1440. The floor is kept where it is because it is the value the treatment was
 * signed off at, and because it still binds at the small breakpoints, where the
 * mobile crop lands on the dark hills — see the per-breakpoint table.
 *
 * An earlier pass ran the wash at 0.90 across the columns and every block
 * passed at 12-15:1 — but at alpha 0.9 over a pale sky the composite IS cream
 * (#F6F2EE), so the top of the footer read as a flat panel and the photograph
 * only appeared below the type. That is the fault this rebuild exists to
 * remove. Holding 0.55 instead spends that unused headroom on a visible scene:
 * the composites now carry the picture's own colour (#F8EFDA under the Legal
 * column, #D0B39C under the address, #F2E1CA under the logo) and the tightest
 * block still holds 6.94:1.
 *
 * ---------------------------------------------------------------------------
 * 🔴 EVERY PIECE OF TYPE IS SOLID INK. NO OPACITY ON TEXT OVER THE IMAGE.
 *
 * The card version used `ink/70` for the blurb, address, legal names and © line
 * and measured 5.85:1, which was correct on flat greige. Over the photograph it
 * is not, and the reason is that lowering a text's alpha pulls it TOWARDS the
 * background it sits on: `ink/70` over a composite at L 0.223 resolves to an
 * effective #37373 6 and measures 3.14:1 — a fail that a flat-surface habit
 * would have carried straight over.
 *
 * Hierarchy therefore comes from size and weight only. Every glyph in this
 * footer is #1A1A1A at alpha 1.
 *
 * 🔴 NO GOLD ANYWHERE, AND THAT IS A MEASUREMENT, NOT A PREFERENCE.
 * `gold-deep` #7D641F sits at L 0.1357, so it needs a background at L >= 0.786
 * to clear 4.5:1. It gets that on flat cream (5.16:1) and flat greige (4.66:1),
 * which is why it is the correct gold everywhere else on this site. Over this
 * footer the composited background runs down to L 0.223, where gold-deep
 * measures 1.47:1. It cannot be the hover colour and it cannot be the focus
 * ring here.
 *
 * So hover is a rule, not a recolour — `underline` with a 2px offset, which
 * carries at any luminance — and the focus ring is ink, which measures 4.53:1
 * against the worst composite and needs only 3.0. Plain `gold` #C9A84C is worse
 * still and appears nowhere.
 *
 * ---------------------------------------------------------------------------
 * OUR CONTENT ONLY.
 *
 *   Navigation  the seven routes in FOOTER_ROUTES, read from routes.ts — the
 *               same list the header reads, so the two navigation surfaces
 *               cannot disagree about what the site contains.
 *   Contact     phone, email, street address, hours. The phone and the full
 *               Orlando address are both client-confirmed. fflsynergy renders
 *               these as plain spans; making them real tel:/mailto: links is an
 *               interaction fix, not a copy change.
 *   Legal       Privacy Policy and Terms of Service as NAMES WITHOUT LINKS.
 *
 * 🔴 THE LEGAL COLUMN IS DELIBERATELY UNLINKED. Both routes 404 — see the
 * UNBUILT block in routes.ts. A privacy policy and terms of service for a
 * Florida life-insurance brokerage are legal documents that come from the
 * client, exactly like the regulatory disclosure. They cannot be written here
 * to make the links work, and a link would be WORSE than no link: the link
 * asserts the document is published and readable, and clicking it proves
 * otherwise. A name with no link says only "this is a document we have to
 * have", which is true. They are plain <li>, so they are not in the tab order
 * pretending to be links. When the routes exist, wrap them in <Link> and change
 * nothing else — the strings are already in both message files.
 *
 * 🟢 SOCIALS — RESTORED 2026-09-01. The note here used to read:
 *
 *     "SOCIALS — DROPPED, NOT UNBUILT. The reference puts a social row under
 *      the logo. Searched the whole tree for facebook / instagram / linkedin /
 *      twitter / x.com / youtube / tiktok across components, app, lib and both
 *      message files: ZERO hits. There is no Synergy account to link. Three
 *      icons pointing at '#' is the same lie as a dead Privacy link in a more
 *      clickable shape."
 *
 * That was true when it was written and is not now. Three accounts exist, and
 * the objection above is answered the only way it can be: each one was opened
 * and confirmed to be Synergy's before being linked. They live in
 * components/social.tsx, shared with the header strip so the URLs have one
 * home. LinkedIn, X and TikTok are still absent, for the original reason.
 *
 * 🔴 NEWSLETTER — DROPPED. The reference has a "Join Newsletter" field. There is
 * no mailing list, no provider and no endpoint; the form on /contact is itself
 * visibly disabled for exactly that reason. An input that accepts an address
 * and drops it is worse than no input.
 *
 * ---------------------------------------------------------------------------
 * THE IMAGE. `public/footer/ground-sunrise-hills.jpg` — golden sunrise haze over
 * misty rolling hills. Pexels License: free for commercial and non-commercial
 * use, no attribution required, modification permitted. Zetong Li,
 * pexels.com/photo/a-sunrise-over-a-valley-with-fog-and-hills-16672664/
 *
 * TRUE SOURCE 5633x3748, shipped FULL FRAME downscaled to 3840x2555 / 706KB.
 * 3840 because that is the largest entry in next/image's deviceSizes and it
 * never emits a derivative wider than the source, so anything above 3840 here
 * is bytes that can never be served. Full frame because the source is 1.50:1
 * and the layer is 1.59:1, so `object-cover` crops 52px of height and nothing
 * of width at 1440 — the photographer's composition survives intact.
 *
 * THE GRADIENT IS IN THE PHOTOGRAPH, NOT FAKED. This frame is chosen for its
 * own top-to-bottom structure: open sunlit haze across the top where the type
 * sits, dense green detail across the bottom where none does. Measured, the
 * lower band carries 3.9x the local detail energy of the upper band. The cream
 * wash is doing legibility work, not manufacturing a composition.
 *
 * VERIFIED NOT AN UPSCALE. Downscaling the original to 1920 and resampling it
 * back to 5633 retains only 37% of its fine-detail energy (`keep 0.37`) — a
 * file that had already been upscaled would retain most of it, because it has
 * little real detail to lose. For contrast, a rejected 8000x5333 candidate
 * measured `keep 0.66`: bigger file, emptier pixels.
 *
 * ITS ONE HONEST WEAKNESS: absolute detail energy is low (4.7) because the
 * subject is FOG, which has no high-frequency information to carry. The file is
 * a genuine capture at its stated size; the misty upper half will still never
 * look crisp, because there is nothing there to be crisp. The sharpness lives
 * in the foreground hills.
 *
 * DECORATION: it carries no information the text does not, so `alt=""` and the
 * whole layer is aria-hidden. `priority` is deliberately NOT set — it is below
 * every fold on every route and must not compete with the LCP image.
 *
 * NO PARALLAX, so there is nothing for `prefers-reduced-motion` to freeze. The
 * reference's scene is static and this stays a server component; a scroll-driven
 * transform would mean shipping a client component and a listener for an effect
 * nobody asked for. If it is ever added it goes behind
 * `prefers-reduced-motion: reduce` like the other motion in this codebase.
 *
 * ---------------------------------------------------------------------------
 * WCAG AA — MEASURED PER BLOCK, OVER THE REAL PIXELS.
 *
 * Not one global number. For each text block the harness takes its rect from
 * the built DOM at 1440, maps it onto the cover-fitted source, composites the
 * cream gradient at that block's own rows, then takes the WORST 8px patch
 * inside the rect — 8px because a 14px glyph has a ~2px stem and a patch that
 * size sits under one. Ink #1A1A1A, L 0.0103, against that worst patch:
 *
 *   block                          a      worst patch   ratio   needs
 *   sign-off                     0.550   #B1A18E        6.94    4.5
 *   mission blurb                0.550   #B9ABA1        7.78    4.5
 *   copyright                    0.550   #B7AEA4        7.94    4.5
 *   nav link: Contact            0.550   #C2AFA0        8.20    4.5
 *   contact: hours               0.550   #C6AE9C        8.25    4.5
 *   contact: address (2 lines)   0.550   #D0B39C        8.81    4.5
 *   brand tagline (26px)         0.550   #C6B7AB        8.93    3.0
 *   nav link: Blog               0.550   #D1B9A3        9.28    4.5
 *   nav link: Services           0.550   #E0C9B1       10.91    4.5
 *   nav link: Calculator         0.550   #E8DCCA       12.83    4.5
 *   nav link: About              0.552   #F5DEC1       13.39    4.5
 *   logo wordmark                0.622   #F2E1CA       13.57    4.5
 *   contact: info@fflsynergy.com 0.552   #F7E1C1       13.62    4.5
 *   nav link: Join Us            0.550   #F4E4CE       13.92    4.5
 *   nav link: Home               0.624   #F6E5CB       14.05    4.5
 *   legal: Terms of Service      0.556   #F8E6C3       14.17    4.5
 *   contact: 407-434-0400        0.624   #F8E7CC       14.35    4.5
 *   heading: Navigation          0.705   #F7E9D6       14.56    4.5
 *   heading: Contact             0.705   #F7EAD5       14.69    4.5
 *   legal: Privacy Policy        0.626   #F8EBCD       14.76    4.5
 *   heading: Legal               0.705   #F8EFDA       15.17    4.5
 *
 * 21/21 pass. Re-run at the two breakpoints where the layout reflows and the
 * blocks land on completely different pixels:
 *
 *    768  (two-up columns, footer 1090px)  21/21, tightest 4.97 (copyright)
 *    390  (stacked, footer 1259px)         21/21, tightest 4.93 (copyright)
 *
 * (1440 layer measured at 1425x899.6 with fonts settled. An earlier capture
 *  read 896.2 before the display face loaded; the 3.4px difference moves the
 *  tightest block by 0.04 and is recorded here so the next person does not
 *  chase it.)
 *
 * 🔴 THE SMALL BREAKPOINTS ARE THE BINDING CASE NOW, AND NOT FOR THE OBVIOUS
 * REASON. It is not that the footer is taller — the bottom-anchored scrim
 * handles that. It is that the layer is NARROW: at 390 the box is 0.31:1
 * against a 1.50:1 source, so `object-cover` scales to match HEIGHT and crops
 * horizontally, showing a 390px-wide slice of a 1893px-wide image. The mobile
 * visitor sees a narrow centre column of the frame, and in this photograph the
 * centre-bottom is the dark green hillside. Desktop gets 6.98:1; mobile gets
 * 4.93:1 off the same file.
 *
 * A sweep of `object-position` X at 390 (20/30/40/50/60/70/80%) moves that
 * tightest figure between 4.92 and 5.39, and 768 stays at ~4.95 whatever X is,
 * so re-cropping is not worth trading the composition for. If more margin is
 * ever wanted, the lever is the 0.55 floor: 0.58 gives 7.43 / 5.46 / 5.42
 * across 1440 / 768 / 390, at the cost of a slightly more washed photograph.
 *
 * Regenerate with scripts/measure-footer-aa.mjs after ANY change to --melt,
 * --reveal, the 0.55 floor, the padding, the object-position or the image. AND
 * RE-RUN IT AT 390 — the percentage bug above passed at 1440 and failed there.
 *
 * The three numbers that move it are the gradient stops, the vertical padding
 * (which decides which rows of the photograph each block lands on) and
 * `object-position`. Change any one and re-measure; none of them is decorative.
 * ---------------------------------------------------------------------------
 */
export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tSocial = useTranslations("social");
  const locale = useLocale();
  // Rendered server-side. On a statically exported build this is baked at
  // build time, which is the same behaviour as fflsynergy's hard-coded year.
  const year = new Date().getFullYear();

  const navItems = FOOTER_ROUTES.map((key) => ({
    key,
    href: routeHref(locale, key),
  }));

  // Hover is an UNDERLINE, not a colour. See NO GOLD ANYWHERE above.
  /* 🔴 `block py-2.5` IS THE TOUCH TARGET, NOT STYLING. Measured on a 375px
     phone before this change: every footer link was 21px tall — 14px of text at
     leading 1.5 — against the 44px every touch guideline asks for. That included
     `407-434-0400` and the email address, which on a phone are the two most
     likely taps in the entire footer and were the two hardest to hit.

     `inline-block` -> `block` so the box spans the column and the padding has
     something to apply to vertically; 10px top and bottom takes 21 -> 41.

     THE LISTS DROP FROM `space-y-3` TO `space-y-1` IN THE SAME CHANGE. Left at
     12px, the padded boxes would have grown the footer by 24px per row AND the
     hit areas would still have been separated by a 12px dead strip. At 4px the
     row pitch goes 33 -> 45, i.e. the footer grows ~12px per row, and adjacent
     targets sit 4px apart — close, but never overlapping, so a tap is never
     ambiguous about which link it meant. */
  const linkClass =
    "block py-2.5 text-[14px] leading-[1.5] text-ink underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:text-[15px]";
  const headingClass =
    "font-display text-[15px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink md:text-[17px]";
  // Solid ink, not ink/70. See EVERY PIECE OF TYPE IS SOLID INK above.
  const plainClass = "text-[14px] leading-[1.55] text-ink md:text-[15px]";

  /**
   * TWO DIFFERENT REAL TAGLINES, AND THAT IS THE POINT.
   *
   * The reference carries a statement line under the brand AND a sign-off at
   * bottom-right. We have exactly two neutral fflsynergy taglines already in
   * the message files, so each slot gets its own and neither is written here:
   *
   *   nav.tagline       "Protecting Families. Building Futures."  -> brand
   *   footer.pullQuote  "Protect What Matters Most"               -> sign-off
   *
   * NEITHER IS GATED. `footer.mission` and `footer.pullQuote` are empty strings
   * in es.json — the marketing prose is not approved in Spanish yet — but
   * i18n.ts merges every locale over en.json with `withFallback`, which SKIPS
   * empty values. `t()` cannot return "" for a key en.json fills, so a guard
   * here would be dead code that reads like a real edge case. The visible
   * consequence on /es is that these two lines render in English while the
   * labels around them render in Spanish; that is the whole site's behaviour,
   * per i18n.ts.
   */
  const brandTagline = tNav("tagline");
  const signOff = t("pullQuote");
  const mission = t("mission");

  return (
    // FULL BLEED. No wrapper, no gutter, no card, no radius. `bg-cream` is the
    // base the gradient's alpha-1 top stop matches, and the fallback if the
    // photograph 404s.
    // 🔴 --melt's FLOOR CAME DOWN 140px -> 72px WITH THE ASPECT-RATIO LAYER
    // BELOW, and the two must be read together. The melt is a cream fade
    // anchored to the TOP of the photo layer; while that layer was the whole
    // footer (1346px on a phone) a 140px fade was a rounding error on it. The
    // layer is now the photograph's own 3:2 box — 250px tall at 375px wide — so
    // the old floor would have covered 56% of the band in cream and left ~110px
    // of actual photograph. 72px leaves 178px.
    //
    // ONLY THE FLOOR MOVED. 16vw still governs from 450px up (16vw = 72 at
    // 450), so tablet and desktop resolve exactly as before: 123px at 768,
    // 205px at 1280, 240px at the cap. --reveal is untouched — it is the
    // footer's own bottom padding and the scrim's flat region reads the same
    // variable, and neither depends on the layer's height.
    <footer className="relative isolate [--melt:clamp(72px,16vw,240px)] [--reveal:clamp(200px,26vw,380px)]">
      {/* The landmark is named for assistive tech without putting a visible
          heading on the page. */}
      <h2 className="sr-only">{t("srTitle")}</h2>

      {/* ---------------------------------------------------------------
          THE SCENE. Fills the entire footer, not a strip at the bottom.
          --------------------------------------------------------------- */}
      {/* 🔴 THE LAYER TAKES THE PHOTOGRAPH'S OWN ASPECT RATIO. IT USED TO BE
          `inset-0` — the full footer box — AND THAT IS WHAT MADE IT UNREADABLE
          ON A PHONE.

          The docblock above already spotted the symptom ("at 390 the box is
          0.31:1 against a 1.50:1 source ... the mobile visitor sees a narrow
          centre column of the frame") but treated it as a CONTRAST problem and
          swept `object-position` looking for a better slice. It is a GEOMETRY
          problem, and no object-position can fix it. Measured on this build:

            width   layer box     box AR   frame shown   image width needed
            ---------------------------------------------------------------
             375    375x1346       0.28        19%        2020px  (got 750)
             768    753x1153       0.65        44%        1730px  (got 828)
            1280   1265x 922       1.37        92%        1382px  (fine)

          TWO FAULTS, ONE CAUSE. `object-cover` on a portrait box scales the
          image until its HEIGHT fills, so (a) it throws away 81% of the frame
          and (b) the rendered image is 2020px wide while `sizes="100vw"` asks
          the browser for a 375px-wide box — it fetched 750px and enlarged it
          5.4x. That 5.4x IS the "not clear on mobile" report; the file is a
          genuine 3840x2555 capture and was never the problem.

          `aspect-[3/2]` is the source's own 1.50:1, so the box and the frame
          agree and `object-cover` crops NOTHING: the whole photograph shows, at
          every width, and the rendered image width equals the layer width —
          which is what `sizes="100vw"` has been claiming all along. The 750px
          derivative a phone already downloads becomes exactly right at DPR 2.
          Sharper AND fewer bytes, with no new assets.

          `max-h-full` is the cap, and it is what keeps the desktop untouched:
          on a wide/short footer (1920, box ~2.16:1) the aspect box would be
          taller than the footer, so the cap wins and the layer stays exactly
          the full-bleed box it is today. The rule therefore only engages where
          the footer is taller than width/1.5 — i.e. only where it was broken.

          `bottom-0` anchors it: the photograph is the ground the footer stands
          on, so it grows UP from the bottom edge and the cream page above melts
          into it. AA improves as a side effect — the type that used to sit on
          the washed photo at 4.93:1 (the tightest block, `copyright`) now sits
          on plain cream at 15.87:1. */}
      <div
        aria-hidden="true"
        /* 🔴 SCOPED TO `max-lg` SO THE DESKTOP IS BYTE-FOR-BYTE THE OLD LAYER.
           The aspect box was first written unscoped, on the reasoning that
           `max-h-full` alone would cap it back to full-bleed on wide screens.
           That is true at 1920 but NOT at 1440: the footer is 978px tall there
           and 3:2 of 1425 is 950, so the cap never engaged and the layer came
           out 28px short with a band of cream above it. Small, but it is a
           desktop change, and the desktop was never the broken case — it
           already showed 92-97% of the frame at a sane 1.0-1.4x scale.
           Below lg the override applies in full and the reasoning above holds
           unchanged. */
        className="pointer-events-none absolute inset-0 -z-10 select-none max-lg:bottom-0 max-lg:top-auto max-lg:aspect-[3/2] max-lg:max-h-full"
      >
        <Image
          src="/footer/ground-sunrise-hills.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_38%]"
        />
        {/* TWO GRADIENTS, EACH ANCHORED TO AN EDGE IN PIXELS. Both are
            load-bearing; see THE MELT and THE SCRIM. Neither uses percentages,
            and that is the entire point — see WHY NOT PERCENTAGES. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              // THE MELT — top-anchored. THE PAGE COLOUR at alpha 1 exactly at
              // the seam, gone by --melt.
              //
              // 🔴 IT IS WHITE BECAUSE THE PAGE IS. This was
              // rgba(244,239,228,1), the old cream. Its entire job is to BE the
              // background of whatever sits above the footer, so the photograph
              // has nothing to melt out of. When the site went pure white this
              // one stop did not, and the result was a hard cream band starting
              // at the seam and running the height of the footer against a
              // white page. It was written as rgba(), not as the hex, which is
              // how the sweep missed it. Any future change to the page colour
              // has to change this line in the same commit.
              "linear-gradient(to bottom, rgba(255,255,255,1) 0px, rgba(255,255,255,0) var(--melt))",
              // THE SCRIM — bottom-anchored. Zero at the very bottom edge, up
              // to 0.55 by the top of --reveal, then held at 0.55 for the whole
              // height above it. --reveal is the footer's own bottom padding,
              // so the flat 0.55 region is exactly the region the content
              // occupies, at every breakpoint, whatever the content does.
              "linear-gradient(to top, rgba(255,255,255,0) 0px, rgba(255,255,255,0.55) var(--reveal), rgba(255,255,255,0.55) 100%)",
            ].join(", "),
          }}
        />
      </div>

      {/* `pb` reads the SAME --reveal the scrim does. They must not drift. */}
      <div className="mx-auto max-w-content px-6 pb-[var(--reveal)] pt-[clamp(72px,9vw,132px)] sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          {/* BRAND — logo, tagline, blurb. The reference's newsletter block
              folded into this column, which is why it is this wide. */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href={`/${locale}`}
              aria-label={tNav("company")}
              className="inline-flex rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {/* aria-label above overrides the SVG's own <title> and its two
                  <text> nodes, which otherwise concatenate into "Synergy
                  Insurance GroupSYNERGY INSURANCE GROUP". Same pattern
                  SiteHeader uses on the centred logo. */}
              {/* 48px, level with the header's scrolled size — was h-14/h-16
                  (56/64), which on a 3.29:1 lockup rendered 184-211px wide and
                  dominated the brand column. */}
              <LogoLockup className="h-12 w-auto" />
            </Link>

            <p className="mt-6 max-w-[16ch] font-display text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-ink md:text-[26px]">
              {brandTagline}
            </p>

            <p className={`mt-4 max-w-[40ch] ${plainClass}`}>{mission}</p>

            {/* 🟢 THE SOCIAL ROW, RESTORED 2026-09-01. This is the reference's
                own slot for it, and it stood empty because there were no
                accounts to link. There are now three, all opened and confirmed
                before being linked — see components/social.tsx, which is also
                where the strip in the header gets them from.

                24px against the header strip's 16-18px: this row sits on its
                own under a 26px tagline with nothing competing for the space,
                where the strip is a 36px band with two text links beside it. */}
            <ul className="mt-7 flex list-none items-center gap-4">
              {SOCIALS.map(({ key, href, Mark }) => (
                <li key={key} className="flex">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={tSocial(key)}
                    /* min-h/w 44px: this is the one place these icons are a
                       primary target rather than a secondary one in a utility
                       strip, and a 24px tap target on a phone is below every
                       guideline. The box is padded around the mark rather than
                       the mark being grown. */
                    className="-m-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
                  >
                    {/* Opacity, not colour: these marks have to stay in their
                        own brand colours. */}
                    <Mark instanceId="footer" className="h-6 w-6" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* NAVIGATION */}
          <nav
            aria-labelledby="footer-nav-heading"
            className="lg:col-span-2 lg:col-start-6"
          >
            <h3 id="footer-nav-heading" className={headingClass}>
              {t("navTitle")}
            </h3>
            {/* space-y-1, not -3 — the links now carry their own 10px of
                padding as a touch target. See linkClass. */}
            <ul className="mt-5 space-y-1">
              {navItems.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className={linkClass}>
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CONTACT — <address> because it is one */}
          <address className="not-italic lg:col-span-3 lg:col-start-8">
            <h3 className={headingClass}>{t("contactTitle")}</h3>
            {/* space-y-1 for the same reason as the nav list. The two plain
                rows below take the padding explicitly rather than inheriting a
                gap, so the address and hours keep the breathing room they had
                while the phone and email get real targets. */}
            <ul className="mt-5 space-y-1">
              <li>
                <a href={t("phoneHref")} className={linkClass}>
                  {t("phone")}
                </a>
              </li>
              <li>
                <a href={t("emailHref")} className={linkClass}>
                  {t("email")}
                </a>
              </li>
              <li className={`py-1 ${plainClass}`}>{t("address")}</li>
              <li className={`py-1 ${plainClass}`}>{t("hours")}</li>
            </ul>
          </address>

          {/* LEGAL — NOT a <nav>: there is nothing to navigate to. */}
          <div className="lg:col-span-2 lg:col-start-11">
            <h3 className={headingClass}>{t("legalTitle")}</h3>
            <ul className={`mt-5 space-y-3 ${plainClass}`}>
              <li>{t("legal.privacy")}</li>
              <li>{t("legal.terms")}</li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR — © left, sign-off right. NO RULE ABOVE IT: a border
            here would be exactly the hard line this rebuild exists to remove.
            The gap does the separating. */}
        <div className="mt-16 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:mt-24">
          <p className="text-[13px] leading-[1.5] text-ink md:text-[14px]">
            {t("copyright", { year })}
          </p>
          <p className="text-[13px] leading-[1.5] text-ink md:text-[14px]">
            {signOff}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ===========================================================================
   🗃️  PREVIOUS FOOTER — KEPT FOR COMPARISON, NOT DEAD CODE TO DELETE.
   ===========================================================================

   This is the footer that shipped before the grounded rebuild: a flat NAVY
   twelve-column block measured off reyou.life's `footer.footer_wrap`. It is
   preserved verbatim so the treatments can be diffed rather than reconstructed
   from git.

   NOTE ON PROVENANCE: there was never a dock.cool / "giant wordmark" footer in
   this file. That treatment was scoped and measured but the direction changed
   before any of it was written, so there is no such version to keep. What
   follows is the reyou.life-based one it would have replaced.

   Its structure, measured at 1536 / 1400 / 768 / 390:

     footer      background #252525 (ours: navy #0D1B2A), colour #F8F4EE, flex
                 column, section spacers of 112px top and bottom
     container   a TWELVE-COLUMN grid, column gap 32, every child placed:
                   mission 1/3 · contact 4/4 · nav 9/2 · legal 11/2
                   divider 1/12 · logo 1/3 · bottom bar 1/12
     divider     NOT a bordered box: padding-top 80px plus
                 border-bottom 0.8px solid rgba(248,244,238,0.10)
     headings    15/21.75, weight 400, tracking +0.243, cream at 0.30
     links       15/21.75, cream 100%, padding 12px 0 (35px rows)
     hover       opacity 1 -> 0.30 over 0.1s ease
     responsive  spacer 112 -> 84 -> 66; type 15 -> 14.4 -> 14.0; the two link
                 columns sit SIDE BY SIDE at half width below ~1025

   Three deliberate deviations, all forced by contrast — on their own #252525,
   column headings, link hover and the © line all measure 2.56:1 against a
   required 4.5. On our navy those became cream at 70% (8.26:1), and hover went
   to gold-pale #EFE1B0 (13.31:1) rather than fading.

   Its AA table on flat navy #0D1B2A:
     column headings      cream 70% #B2B3B3    8.26 : 1
     nav / contact links  #F8F4EE             15.87 : 1
     copyright            cream 70%            8.26 : 1
     link hover           #EFE1B0             13.31 : 1

   `cap-trim cap-body` on the links is load-bearing, not decorative: reyou lay
   their footer links out on the CAP BAND, not the line box, which is what makes
   a 15/21.75 link render an 11px box and a 12+11+12 = 35px row. `leading-[1.5]`
   is required with it — cap-body's trim values are derived for the BODY FACE
   (IBM Plex Sans since 2026-08-03) at line height 1.5 and are wrong against an
   inherited `normal`. They were re-derived with that swap; if the body face
   changes again this row is one of the things that silently goes wrong.

   To restore: swap the export above for this component, put `gold-pale` back on
   the focus rings (13.31:1 on navy, 1.13:1 on greige — it is only correct on
   the dark surface), and re-check the Testimonials seam: cream into navy is
   15.87:1, a hard edge, which is why Testimonials was moved above it.

export default function FooterNavy() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const year = new Date().getFullYear();

  const linkClass =
    "cap-trim cap-body block py-3 text-[14px] leading-[1.5] text-cream transition-colors duration-100 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale md:text-[15px]";
  const headingClass =
    "cap-trim cap-body py-3 text-[14px] font-normal leading-[1.5] tracking-[0.016em] text-cream/70 md:text-[15px]";

  const navItems = FOOTER_ROUTES.map((key) => ({
    key,
    href: routeHref(locale, key),
  }));

  return (
    <footer className="bg-navy text-cream">
      <h2 className="sr-only">{t("srTitle")}</h2>

      <div className="mx-auto max-w-[1620px] px-5 pb-12 pt-16 md:px-8 md:pb-16 md:pt-20 lg:pb-8 lg:pt-28">
        <div className="grid grid-cols-12 gap-x-4 gap-y-8 md:gap-x-6 lg:gap-x-8 lg:gap-y-0">
          <div className="col-span-12 lg:col-span-3">
            <h3 className={headingClass}>{t("missionTitle")}</h3>
            <p className="mt-1 text-[14px] leading-[1.55] text-cream md:text-[15px]">
              {t("mission")}
            </p>
            <p className="mt-4 font-display text-[16px] leading-[1.3] text-cream md:text-[18px]">
              {t("pullQuote")}
            </p>
          </div>

          <address className="col-span-12 not-italic lg:col-span-4 lg:col-start-4">
            <h3 className={headingClass}>{t("contactTitle")}</h3>
            <ul className="mt-1 space-y-2 text-[14px] leading-[1.55] text-cream md:text-[15px]">
              <li>
                <a href={t("phoneHref")} className="transition-colors duration-100 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale">
                  {t("phone")}
                </a>
              </li>
              <li>
                <a href={t("emailHref")} className="transition-colors duration-100 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale">
                  {t("email")}
                </a>
              </li>
              <li>{t("address")}</li>
              <li>{t("hours")}</li>
            </ul>
          </address>

          <nav aria-labelledby="footer-nav-heading" className="col-span-6 lg:col-span-2 lg:col-start-9">
            <h3 id="footer-nav-heading" className={headingClass}>
              {t("navTitle")}
            </h3>
            <ul>
              {navItems.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className={linkClass}>
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div aria-hidden="true" className="col-span-12 border-b border-cream/10 pt-12 md:pt-16 lg:pt-20" />

          <div className="col-span-6 pt-12 md:pt-16 lg:col-span-3 lg:pt-20">
            <Link href={`/${locale}`} aria-label={tNav("company")} className="inline-flex rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-pale">
              <Logo variant="dark" className="h-16 w-auto lg:h-20" />
            </Link>
          </div>

          <div className="col-span-12 flex flex-col gap-2 pt-10 sm:flex-row sm:items-center sm:justify-between md:pt-12 lg:pt-16">
            <p className="text-[13px] text-cream/70 md:text-[14px]">
              {t("copyright", { year })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

   =========================================================================== */
