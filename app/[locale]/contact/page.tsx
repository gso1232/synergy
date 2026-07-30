import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import FadeUp from "@/components/FadeUp";
import ContactForm from "@/components/ContactForm";

/**
 * /[locale]/contact
 *
 * Modelled on **reyou.life/contact**, RE-MEASURED FRESH on 2026-07-29 at
 * 1536 x 710, DPR 1.25 — not carried over from the earlier inventory, which got
 * three things wrong (the right column's role, the §3 column spans, and their
 * form's labels; each is marked 🔴 where it is corrected). Their surface is
 * `rgb(248, 244, 238)` — #F8F4EE, our cream — and their display face is Kufam,
 * ours, so this reference sits closer to our system than any other on the
 * project. None of their CSS is copied and none of their files are used.
 *
 * =========================================================================
 * THEIR PAGE, MEASURED 2026-07-29
 *
 * SHELL. `.u-container` = calc(100% - 64px) = 1472 centred, so 32px page
 * gutters. A 12-column grid inside it: column 93.325px, gutter 32px.
 * Section rhythm via `.u-section-spacer`: 160px above the hero (nav clearance)
 * and 112px on every other section edge. Nothing else sets vertical padding.
 *
 *   §1 `contact-hero_wrap`  y 0-996    flex, column-gap 32: 720 + 32 + 720
 *        LEFT   h1 58/69.6 w400 ls -0.9396 Kufam, x=32 y=160 — and it is
 *               `position:absolute; opacity:0`, laid OVER the image, awaiting
 *               a GSAP reveal that never fires under automation
 *               img 752 x 709.6 flush at 0,0 (margin -160 / -32), see below
 *               phone mt 64: 24px icon + 12px gap + 20/29 w400 Overpass
 *               paragraph mt 32, 15/21.75 ls 0.243, full 720 column
 *        RIGHT  heading 34/40.8 w400 ls -0.5508 Kufam, mb 32   🔴 see §1 RIGHT
 *               paragraph 15/21.75, mb 64
 *               form (third-party iframe, off-canvas at x = -9967)
 *   §2 `get-help_wrap`      y 996-1363  🔴 NOT REPRODUCED, see below
 *   §3 `contact-info_wrap`  y 1362-1860 eyebrow cols 1-2, heading cols 3-12 at
 *                                      34/40.8 Kufam, details grid mt 64
 *        🔴 THE FOUR DETAIL COLUMNS ARE UNEVEN — 2 / 2 / 6 / 2 of their twelve
 *           (x 32 / 283 / 533 / 1285, widths 218.7 / 218.7 / 720 / 218.7).
 *           The earlier inventory recorded the four x-positions but read them
 *           as four equal columns. The wide one is the address. Ours now
 *           carries their proportion — see `.contact-details` in globals.
 *        labels h3 11/16.5 uppercase Overpass, values 15/21.75; label-to-value
 *        baseline delta 39px (2.6em of their body), value-to-value ~42.5px
 *        their four are Email / Phone / Locations / Socials; ours are
 *        Phone / Email / Office / Hours, the address in the wide slot as theirs
 *
 * THEIR EYEBROW, MEASURED BUT NOT ADOPTED: a 6x6 dot marker, an 8px gap, then
 * an 11/16.5 uppercase Overpass h2, sitting in grid columns 1-2 with the
 * heading pushed to column 3. It is a genuine part of their §2 and §3. Our
 * system has no eyebrow-marker pattern anywhere — `.sem-eyebrow` is a size
 * step, not a marker — so introducing one here would make /contact the only
 * page on this site that has it. Held for a site-wide decision, not taken on
 * one page.
 *
 * =========================================================================
 * 🔴 THEIR §2 IS A MENTAL-HEALTH CRISIS NOTICE AND IS DELIBERATELY ABSENT.
 *
 * It reads "If You Are Struggling Right Now", and directs readers to call 911
 * and the Suicide & Crisis Lifeline on 988. reyou is a ketamine and Spravato
 * clinic; that notice is a duty of care specific to what they do. An insurance
 * brokerage has no equivalent, and manufacturing one would be inventing content
 * of the worst kind — borrowing the emotional weight of a crisis service for a
 * business that does not provide it.
 *
 * DO NOT RE-ADD IT when re-measuring the reference. It is not an omission.
 *
 * 🔴 THEIR FORM IS A THIRD-PARTY CRM IFRAME — `link.psyclecrm.com/widget/form/`,
 * 1472 x 724, parked off-canvas at x = -9967 and revealed on demand. They did
 * not hand-build a form; they embedded a hosted one, which is the same shape as
 * our own (blocked) GHL webhook. Ours is a real form, visibly disabled, because
 * we have no endpoint yet. See `components/ContactForm.tsx`.
 *
 * Measured by opening the hosted form directly, since the embed is off-canvas:
 * nine visible fields, every one with a real <label> AND a placeholder (this
 * CORRECTS the earlier record — see ContactForm.tsx; their placeholders now
 * ship on our fields too), fields styled as a 0.8px bottom rule at
 * rgba(37,37,37,0.3) with no box, no radius and a transparent fill, 8px 0
 * padding, 15/22.5 Inter; two consent checkboxes at 15px; a full-width submit
 * on ink #252525 with a cream label, 12/16 padding, radius 4, height 51.
 *
 * 🔴 THEIR FIELD TREATMENT IS THE ONE THING MEASURED AND DELIBERATELY REFUSED.
 * A 0.3-alpha ink rule on cream measures ~1.9:1. A field border is what tells
 * you where the control is, so it is a non-text UI component under WCAG 1.4.11
 * and owes 3:1. Ours is a full box at ink/50 (3.34:1) — the contrast table that
 * produced that number is in globals.css and predates this pass. Adopting their
 * underline would knowingly reverse a measured accessibility fix, so it stands.
 * This is a THIRD deliberate divergence, on top of the two already recorded.
 *
 * 🔴 THEIR MOTION STILL COULD NOT BE MEASURED — RE-CONFIRMED 2026-07-29.
 * GSAP, ScrollTrigger and Flip are all loaded on their page, and their hero h1
 * sits at `opacity: 0` with `transform: none` — so an opacity-only entry reveal
 * exists. But their preloader still never dismisses under automation, exactly
 * as before: `readyState` reaches `complete` while `.loader u-theme-light`
 * stays `display: block; opacity: 1; visibility: visible; z-index: 100` and
 * `document.body.scrollHeight` stays pinned at 710 — one viewport. No reveal
 * ever plays, so no duration and no easing could be read on this pass either.
 * Guessing at numbers would be inventing them. This page uses `FadeUp`, which
 * is OURS and is the entrance every other page on this site already uses.
 *
 * (Geometry is unaffected: the sections lay out at their real heights behind
 * the loader, which is why everything above could be measured and the motion
 * could not.)
 *
 * =========================================================================
 * SURFACE. Cream #F8F4EE and ink type from the phone down. 🔴 THE HEADER IS NO
 * LONGER SOLID ON THIS ROUTE — that changed when the bleed landed. The first
 * viewport is now a photograph, so `/contact` IS in `isPhotoHeroRoute`,
 * `.page-header-offset` is gone from <main>, and the bar is transparent with
 * white ink over the image. The nav AA over this specific photograph was
 * re-measured at 1536 / 820 / 390; the table is in SiteHeader beside the route
 * test. Below 900 the media is an ordinary in-flow 100svh band, so there is no
 * width at which the transparent bar sits on cream.
 *
 * 🟡 THE IMAGE NOTE BELOW IS HISTORY, KEPT FOR THE CROP ARITHMETIC.
 *
 * It said their hero carries no image. It does. Re-measured again today:
 * `.contact-hero_img` is **752 x 709.6 at x=0, y=0** — flush to the viewport
 * corner, exactly half the 1536 width and exactly one viewport tall, ratio
 * **1.0598**, natural 1693 x 2048 (`contact.avif`), `object-fit: cover`,
 * `object-position: 50% 50%`. The first pass missed it entirely because their
 * preloader never dismisses and the element reads as present-but-invisible.
 * Alt text, theirs: "Two hands reaching out toward each other" — people, which
 * is why the register question below exists at all.
 *
 * THE CROP THEIR SLOT PERFORMS: a 0.827 portrait source into a 1.0598 box on
 * `cover` uses the FULL width and the middle **78%** of the height — 225 rows
 * discarded off the top and 225 off the bottom of 2048.
 *
 * 🔴 "IT DOES NOT MOVE" IS WITHDRAWN — IT WAS NEVER TESTABLE. The earlier note
 * claimed transform stays `none` "at scroll 0, 400 and 800". Re-run today with
 * the scroll position actually read back: `window.scrollTo(0, 400)` leaves
 * `window.scrollY` at **0** every time, because the preloader pins
 * `document.body.scrollHeight` to 710 — `canScroll` is false, and
 * `ScrollTrigger.getAll()` returns **0** registered triggers because their init
 * runs after a dismissal that never happens. The old test scrolled nothing and
 * proved nothing.
 *
 * WHAT CAN HONESTLY BE SAID: at rest the image has `transform: none`, no
 * parallax wrapper, no data attribute and no `sizes`. So it is PROBABLY static
 * — but GSAP and ScrollTrigger are both loaded on the page, and a scroll-driven
 * transform cannot be ruled out from behind the preloader. Treat "static" as
 * unverified, in the same bucket as their entrance timings.
 *
 * HOW IT SITS IN FLOW, which today's pass adds: the image is an ordinary
 * in-flow child of the left column pulled to the corner by `margin: -160px 0 0
 * -32px`, and the h1 is taken OUT of flow (`position: absolute`) and laid over
 * it at x=32, y=160 in full ink. So their heading is dark type on a photograph,
 * and the phone that follows the image starts the cream part of the column.
 * Ours has no image, so our h1 is ordinary in-flow ink on cream and the
 * left-column order below is theirs minus the image.
 *
 * Their subject is two hands reaching toward each other — PEOPLE, which is
 * outside the no-people register the blog and services sets established.
 * Candidates in our register are measured and awaiting selection.
 *
 * 🔴 THE SLOT IS NOT DECORATIVE — THE DEAD-SPACE PASS PRICED ITS ABSENCE.
 * Measured at 1536 with FadeUp neutralised: the left column's last ink ends at
 * y=588 while §1 runs to y=1289, because the form column is 699px taller than
 * the copy column. That is **701.1px of empty cream** below the left column.
 * Their image is exactly what fills it — 752 x 709.6, almost precisely the
 * void's height. The column is short BY DESIGN on their page because the
 * photograph is the rest of it.
 *
 * The void is left standing rather than papered over with invented spacing: it
 * is the image slot, and balancing the columns some other way would build a
 * layout that has to be undone when the photograph lands. Below 900 the grid
 * stacks and the void does not exist at all, so this is a >=900 condition only.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const f = await getTranslations({ locale, namespace: "footer" });

  return (
    // 🔴 `page-header-offset` IS GONE, AND ITS REMOVAL IS THE BLEED.
    // That class reserved the fixed bar's height so cream content started
    // below it. The photograph now runs UNDER the bar — which is the whole
    // point of a corner bleed — so reserving space for the bar would push the
    // image down and leave a cream strip above it. /contact is in
    // `isPhotoHeroRoute` for the same reason; see SiteHeader.
    <main className="contact-page min-h-screen">
      {/* =====================================================================
          §1 — their two-column hero, rebuilt.

          Theirs is 720 + 32 + 720 on a 1536 viewport: copy left, form right.
          Ours keeps the split and takes our own gap token rather than their 32,
          which is far tighter than anything else on this site.

          🔴 THE PHONE SITS WHERE THEIR SUBMIT BUTTON DRAWS THE EYE. The form
          cannot be submitted, so the live path has to be the prominent one —
          the same call already made for the /services CTA, where the pill was
          removed because there was no working destination and the phone number
          is honest.
      ===================================================================== */}
      <section aria-labelledby="contact-heading" className="contact-hero">
        {/* THE MEDIA — corner-anchored, 100svh, ~49% wide, exactly as measured
            on the reference. It is absolute at >=900 so the form column starts
            level with the image; below 900 it is an ordinary in-flow band. */}
        <div className="contact-hero-media">
          <Image
            src="/synergy/contact-advisor-couple.jpg"
            alt={t("heroImageAlt")}
            fill
            priority
            sizes="(min-width: 900px) 49vw, 100vw"
            quality={74}
            className="object-cover object-center"
          />
          {/* Nav legibility, the same veil /about, /join and the homepage use.
              Load-bearing here now: the bar is transparent over this photo. */}
          <div
            aria-hidden="true"
            className="hero-veil-top absolute inset-x-0 top-0 h-[42%]"
          />
          {/* h1 legibility — derived for this photograph, see globals.css. */}
          <div
            aria-hidden="true"
            className="contact-hero-scrim absolute inset-0"
          />
          <div className="contact-hero-title">
            <div className="sem-shell">
              <div className="sem-inner">
                <h1
                  id="contact-heading"
                  className="sem-display font-display text-cream"
                >
                  {t("heading")}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="sem-shell">
          <div className="sem-inner">
            <div className="contact-grid">
              {/* LEFT — their sequence, re-measured: h1, [image], phone, para.
                The phone sits ABOVE the paragraph because theirs does; on their
                page the image separates the h1 from the phone, and the phone is
                the first thing under it. Our own reason for promoting the phone
                (the form cannot submit) points the same way, so the order is
                both theirs and ours.

                NO MEASURE CAP HERE, and dropping it was the fix. Their
                paragraph fills the full 720 column. Ours was capped at 46ch,
                which at `sem-body` is ~490px inside a ~631px column — it left a
                ragged column edge against the form for no readability gain: the
                column already yields ~59 characters unaided, inside our measure
                rule. The cap was solving a problem the grid had already solved. */}
              <div className="contact-hero-left">
                <FadeUp>
                  {/* The h1 is NOT here any more — it is laid over the
                    photograph above, which is where the reference puts it.
                    This column now opens on the phone, and the phone is still
                    the first thing under the image exactly as theirs is. */}
                  <a
                    href={f("phoneHref")}
                    className="contact-phone contact-phone--first"
                  >
                    {f("phone")}
                  </a>

                  <p className="sem-body contact-hero-para text-ink">
                    {t("intro")}
                  </p>
                </FadeUp>
              </div>

              {/* RIGHT — their column opens with a heading and a lead paragraph,
                THEN the form. Re-measured: `.contact-hero_right_heading` is
                34/40.8 Kufam (their h3 step, 0.586x their h1) with mb 32, then
                a 15/21.75 paragraph with mb 64, then the form.

                🔴 THIS IS WHERE `agentHeading` / `agentBody` BELONG, and they
                were in the wrong column. They were built into the left column
                under the phone at `sem-eyebrow` (17.16px) — a fourth item in a
                column their layout gives three, and at a size that read as a
                caption. They play exactly the role their right-column heading
                and lead paragraph play, so they moved here and took the h3 step
                (`sem-h3`). Rendered at 1536 that is 43.5 against a 90.14 h1 —
                0.483x, where theirs is 34/58 = 0.586. Ours sits a step further
                below its h1 than theirs does, because `sem-h3` is still inside
                its clamp at this width while `sem-display` has reached its cap.
                The step is the right one; the exact ratio is our ramp's, not
                theirs, and is left alone rather than hand-tuned on one page.
                The form's own visible h2 came out with the move: their
                column carries ONE heading above the form, and ours now does
                too. `form.heading` survives as the fieldset's sr-only legend,
                so nothing is lost to a screen reader. */}
              {/* 🔴 `.contact-hero-right` CARRIES THE TOP RAIL. Without it this
                  column started at y=0 and the nav links painted over the
                  heading — the corner bleed took `.page-header-offset` off
                  <main> for the media's sake and this column lost it too. The
                  rail and its derivation are in globals.css. */}
              <div className="contact-hero-right">
                <FadeUp index={1}>
                  <h2 className="sem-h3 font-display text-ink">
                    {t("agentHeading")}
                  </h2>
                  <p className="sem-body contact-lead-body text-ink">
                    {t("agentBody")}
                  </p>
                  <ContactForm locale={locale} />
                </FadeUp>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          §3 — their four-column detail block.

          🔴 THE ADDRESS SHIPS. It was held through the blog build because
          HANDOFF recorded it as unverified AND shared with Checkmate's JSON-LD.
          The client has since confirmed the reason: Synergy and Checkmate were
          one company that split, and the office is genuinely shared — which is
          why the building and the suite match. See HANDOFF §10.
      ===================================================================== */}
      <section
        aria-labelledby="contact-details"
        className="sem-shell sem-pad-t"
      >
        <div className="sem-inner">
          <FadeUp>
            {/* 🔴 h3 STEP, NOT h2, AND THE PAGE IS THE EVIDENCE. Re-measured:
                their §2 and §3 headings are BOTH 34/40.8 — the same h3 step as
                the §1 right-column heading. There is no h2-scale heading on
                their contact page at all; the h1 is the only thing above the h3
                step. Ours opened this section at `sem-h2` (57.4), which made
                the detail block compete with the page title. */}
            <h2 id="contact-details" className="sem-h3 font-display text-ink">
              {t("detailsHeading")}
            </h2>
          </FadeUp>
          <dl className="contact-details">
            <div>
              <dt className="contact-dt">{t("phoneLabel")}</dt>
              <dd className="contact-dd">
                <a href={f("phoneHref")}>{f("phone")}</a>
              </dd>
            </div>
            <div>
              <dt className="contact-dt">{t("emailLabel")}</dt>
              <dd className="contact-dd">
                <a href={f("emailHref")}>{f("email")}</a>
              </dd>
            </div>
            <div>
              <dt className="contact-dt">{t("addressLabel")}</dt>
              <dd className="contact-dd">{f("address")}</dd>
            </div>
            <div>
              <dt className="contact-dt">{t("hoursLabel")}</dt>
              <dd className="contact-dd">{f("hours")}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 🔴 THE TRAILING SPACER IS GONE — the dead-space pass caught the exact
          defect HANDOFF §9a #5 already fixed on /about, still shipping here.
          It was a bare `h-[clamp(64px,8.6vw,131.2px)]` div holding nothing:
          measured 133.5px of empty cream between the last detail value and the
          footer, with `main`-bottom to footer-top at 0. Dead space AND a hard
          cream/dark boundary sitting right under it — the same pair of reasons
          it came out of /about. Section rhythm belongs to sections; a bare div
          at the end of a page is padding nobody asked for. */}
    </main>
  );
}
