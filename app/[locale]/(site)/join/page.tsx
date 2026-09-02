import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import FadeUp from "@/components/FadeUp";
import JoinSteps from "@/components/JoinSteps";
import JoinFrame from "@/components/JoinFrame";
import JoinHeroCtas from "@/components/JoinHeroCtas";
import JoinApplyForm from "@/components/JoinApplyForm";
import { routeHref } from "@/routes";

/**
 * /[locale]/join — "Careers at Synergy".
 *
 * =========================================================================
 * ✅ THE COPY ON THIS PAGE IS APPROVED. Signed off 2026-07-29 against the
 * rendered page, with every source line quoted in the build report. The
 * `_status` key that used to sit in the `join.*` namespace has been removed
 * because it no longer says anything true. Standing rule 5 is satisfied for
 * this namespace and NOT waived for any other.
 *
 * TWO SOURCES, BOTH APPROVED, BOTH REWRITTEN:
 *   fflsynergy.com/join-us              — the client's own careers page
 *   checkmatefinancialgroup.com/agents  — the competitor, for structure and
 *                                         substance only
 * Not one sentence is carried over verbatim from either. The two sites compete
 * for the same search terms, so duplicated copy would cost both of them; the
 * rewriting is the point, not a formality (standing rule 2).
 *
 * =========================================================================
 * 🔴 THE TWO COMPLIANCE RULES STRUCK TWELVE SOURCE LINES ACROSS THE TWO
 * SOURCES, AND THE APPROVAL DOES NOT BRING ANY OF THEM BACK.
 *
 * From fflsynergy.com/join-us — agent income claims:
 *   "ready to build real income", "uncapped in income", the "Uncapped /
 *   Commission" stat badge, "channel it into real income", "uncapped upside,
 *   recurring income, and a clear path to leadership".
 *
 * From checkmatefinancialgroup.com/agents — unverified volume claims:
 *   "700+ LICENSED AGENTS", "40+ A-RATED CARRIERS", "50 STATES",
 *   "98.1% 6-MONTH PERSISTENCY", "92.4% 12-MONTH PERSISTENCY".
 * ...and commission claims:
 *   "From signature to first commission", the step named "First commission",
 *   and the whole "THE MATH / What you'd pay for elsewhere" cost table.
 *
 * NONE is carried over, softened, or implied by a substitute. Checkmate's
 * fourth step was renamed on its SUBSTANCE ("You start taking appointments"),
 * not reworded to imply earnings. An approved source does not make a
 * non-compliant line compliant.
 *
 * =========================================================================
 * 🔴 join.fflsynergy.com IS DEAD, AND IT CHANGED THIS PAGE'S ENDING.
 *
 * Fetched live: Vercel **404 / DEPLOYMENT_NOT_FOUND**. §13b's plan was for our
 * Join CTA to hand off to that subdomain rather than reproduce their
 * application form. There is nothing to hand off to, so the closing CTA points
 * at /contact — a page on this site with a live phone number on it. The form
 * is still NOT reproduced: §13b's warning about their "Submit My Application"
 * / "Application Received" bundle stands, and building a form with no endpoint
 * is the LeadModal bug all over again.
 *
 * That deadness also made the header pill, the footer link, the mobile-panel
 * CTA and the WhoWeServe "For Agents" card into links to an error page. All
 * four now point here. See JOIN_URL_EXTERNAL_DEAD in routes.ts.
 *
 * =========================================================================
 * SIX BLOCKS. §13b's agreed four, plus the two this pass added — and the
 * addition is deliberate, not scope creep: §13b scoped a page with no
 * application path at all, on the assumption that the Join CTA would hand off
 * to join.fflsynergy.com. That subdomain is dead (see below), so the page has
 * to carry its own apply surface or send applicants nowhere.
 *
 *   §1  Hero          100svh photo, copy bottom-left  -> /about §1 pattern
 *                     TWO CTAs                        -> <JoinHeroCtas>
 *   §2  Opening block phrase + 16:9 frame + long copy -> NEW, nordiskamuseet
 *                     twin; frame enters on <FadeUp>
 *                     // was "frame runs <useClipReveal>" — that hook is
 *                     // deleted. See JoinFrame.tsx: the reference frame has no
 *                     // entry animation and no parallax at all, so there was
 *                     // nothing our existing primitives could not do.
 *   §3  The offer     heading rail + 2 x 2 cards      -> .join-* , this route
 *   §4  The steps     .essay-grid, sticky frame       -> <ServicesEssay>
 *   §5  Apply         copy left, form card right      -> NEW, checkmate twin;
 *                     <JoinApplyForm>, disabled       -> ContactForm precedent
 *   §6  Closing CTA   full-bleed navy, one pill       -> .sem-pill-cta--on-dark
 *
 * §1 IS THE /about PATTERN — WITH ONE THING RE-DERIVED, NOT INHERITED. Same
 * `h-[100svh] min-h-[560px]`, same `.hero-veil-top` at 42%, same `pb-[32.8px]`,
 * same `.sem-display` / `.sem-hero-sub` pair, same hard bottom edge with no
 * foot ramp. The photograph is even the same 1.500 aspect as
 * about-hero-family.jpg (3840x2560), so the `object-top` derivation on that
 * page transfers verbatim: at 1536x900 the box is 1.707, `cover` fits by width,
 * and the crop budget is spent on the top of the frame.
 *
 * 🔴 THE SCRIM IS `.join-hero-scrim`, NOT `.about-hero-scrim`, AND THAT IS A
 * BUG THAT WAS CAUGHT BY MEASURING. This page shipped the /about class for one
 * round. /about's stops are solved against /about's photograph; this one has a
 * bright glazed wall exactly where the copy sits, and under the borrowed scrim
 * the eyebrow measured 3.82:1 against cream — a fail. The re-derived class and
 * the full solve are in globals.css. Do not "simplify" this back to the shared
 * class: the class name would carry a derivation that is not true here.
 *
 * §3 REUSES <ServicesEssay> RATHER THAN FORKING IT. It already takes its
 * blocks as a prop, already runs `useSequenceSwap`, and already hides the
 * frame column at <=991. FOUR blocks means four frames, so no scroll position
 * in the section is left with an unfilled frame — that was the §13b
 * requirement and it is why the step count and the frame count are the same
 * number. Nothing in that component or in `.essay-*` was modified; a change
 * there would move /services and /blog/<slug> as well.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "join" });
  return { title: t("meta.title"), description: t("meta.description") };
}

/** §2's four items, in the order §13b sets. The numeral is a string in the
 *  message file, not derived from the index, so a reorder cannot silently
 *  renumber the page. */
const OFFER = ["i", "ii", "iii", "iv"] as const;

/**
 * §4's four steps — IMAGELESS (2026-07-30(3)). The four portrait frames were
 * dropped: every distinct Synergy portrait is already on /about, and repeating a
 * face across two pages is the thing we're avoiding. The section is now the
 * <JoinSteps> editorial rail — I–IV numerals + type, no photographs — so the
 * collision disappears rather than being papered over. See JoinSteps + HANDOFF.
 */
const STEP_KEYS = ["one", "two", "three", "four"] as const;

/** §3b's products. Keys into the `services` namespace, so the names on this
 *  page are the same strings /services renders rather than a second copy of
 *  them. Adding a product to /services and not here is then a one-line change
 *  in one obvious place. */
const PRODUCT_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;

export default async function JoinPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "join" });
  const f = await getTranslations({ locale, namespace: "footer" });
  /* §3b reads the product NAMES from /services rather than restating them. */
  const s = await getTranslations({ locale, namespace: "services" });
  const stepData = STEP_KEYS.map((k) => ({
    heading: t(`steps.${k}.heading`),
    body: t(`steps.${k}.body`),
  }));

  return (
    <main className="join-page min-h-screen">
      {/* ===================================================================
          §1 — HERO. The /about §1 pattern, unchanged.
      =================================================================== */}
      <section className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-navy">
        {/* 🟢 SYNERGY'S OWN — join-hero-team-dinner.jpg (the whole team at a
            restaurant, 1620x1080). `object-CENTER`, not object-top: object-top
            was the atrium's crop (kept its upper storeys); centred keeps the
            group. Scrim re-derived on this frame — see `.join-hero-scrim`.
            🟡 PLACEHOLDER FOR RESOLUTION: 1620px clears 1x (+5.5%) but softens
            at 2x DPR (1620/3072 = −47%), the same trade /about's hero took.
            Kept full-bleed for hero-to-hero consistency; swapped when Ziad's
            camera files arrive. Marked in HANDOFF. No own landscape reaches the
            3072px a full-bleed hero needs at 2x. */}
        <Image
          src="/synergy/join-hero-team-2026.jpg"
          alt={t("hero.imageAlt")}
          fill
          priority
          /* See components/Hero.tsx: `object-cover` in a portrait box renders
             the image `boxHeight x sourceAR` wide, which `100vw` understates by
             roughly 3x on a phone. */
          sizes="(max-width: 640px) 270vw, (max-width: 1024px) 130vw, 100vw"
          quality={74}
          className="object-cover object-center"
        />
        {/* The header veil. Load-bearing here exactly as on /about and the
            homepage: /join is in `isPhotoHeroRoute`, so the bar is transparent
            over this photograph and white nav ink sits on it. */}
        {/* 🔴 `.join-hero-veil-top`, NOT the shared `.hero-veil-top`. The 2026
            office photograph has a lit white ceiling exactly where the header
            sits, and the shared veil measures 4.25 there at 1280x800 — a fail.
            The join-only override holds 0.66 through the nav band. Full solve on
            the rule in globals.css. Do not "simplify" this back to the shared
            class: the class name would carry a derivation that is false here. */}
        <div
          aria-hidden="true"
          className="join-hero-veil-top absolute inset-x-0 top-0 h-[42%]"
        />
        <div aria-hidden="true" className="join-hero-scrim absolute inset-0" />

        <div className="sem-shell relative z-10 flex h-full flex-col justify-end pb-[32.8px]">
          <div className="sem-inner w-full">
            <p className="sem-eyebrow text-cream/85">{t("hero.eyebrow")}</p>
            <h1 className="sem-display mt-4 max-w-[16ch] font-display text-cream">
              {t("hero.headline")}
            </h1>
            <p className="sem-hero-sub mt-6 max-w-[32em] text-cream md:mt-8">
              {t("hero.sub")}
            </p>

            {/* TWO CTAs, BOTH LIVE FROM 2026-08-02. "Join as agent" scrolls
                through Lenis rather than being an anchor; "Agent portal" is now
                a real <Link> to /{locale}/login (it was a disabled <button>).
                `portalNote` is still passed and deliberately NOT rendered — the
                string is retained so restoring the disabled state is a revert.
                Full rationale in JoinHeroCtas. */}
            <JoinHeroCtas
              applyLabel={t("hero.ctaApply")}
              portalLabel={t("hero.ctaPortal")}
              portalNote={t("hero.portalNote")}
              targetId="join-apply-heading"
              locale={locale}
            />
          </div>
        </div>
      </section>

      {/* ===================================================================
          §2 — THE OPENING BLOCK. Twinned to nordiskamuseet.se.

          THEIR THREE PARTS, IN THEIR ORDER: a short opening phrase set very
          large, then a 16:9 photograph, then a long copy column broken up by
          question subheads. The rhythm between them is theirs as a RATIO —
          70px under a 268px heading (0.261x) and 120px under a 747.5px figure
          (0.161x) — applied to our own scale rather than copied as pixels.
          Numbers and method are on `.join-opening-phrase` in globals.css.

          🔴 THE FRAME HAS NO PARALLAX AND NO CLIP. Re-measured 2026-07-30:
          their figure's transition-duration is 0s, animation-name none,
          clip-path none, own transform none, and the image's transform is a
          static scale(1.1) with no transition. There is no CSS entry animation
          and no CSS clip to twin. (Scroll-linkage was NOT testable in a
          non-compositing pane — see the note in JoinFrame.tsx.)
          // was: "What it does have is a scroll-linked clip inset, which none of
          // our three motion primitives could do — see `useClipReveal`, added
          // for this and imported by nothing else." That was false, and it was
          // the whole argument for the hook. The hook is deleted; the frame
          // enters on <FadeUp> like every other block here.
      =================================================================== */}
      <section
        aria-labelledby="join-opening-phrase"
        className="sem-shell sem-pad-y"
      >
        <div className="sem-inner">
          <FadeUp>
            <h2
              id="join-opening-phrase"
              className="join-opening-phrase sem-display font-display text-navy"
            >
              {t("opening.phrase")}
            </h2>
          </FadeUp>

          {/* 🟢 SYNERGY'S OWN — join-opening-agents.jpg (five agents, studio),
              a DIFFERENT location from §1's restaurant, so the same building
              never appears twice on this page.

              History: was `join-hero-atrium.jpg` (same building as §1), then
              `services-break-dusk.jpg` (shared with /services), then a Pexels
              courtyard. All external. Now Synergy's own, and the SLOT WAS
              SHRUNK to fit it sharp: the box is capped at 760px @ 3:2 (see
              `.join-frame`), so the native 1620x1080 own frame clears 2x
              (1520x1013) by +6.6% with NO crop. The parallax was dropped — at
              this size a 130% travelling layer would need an ~18% upscale, and
              the reference frame has no parallax anyway. `opening.imageAlt`
              describes this frame; entry is <FadeUp>, like every block here. */}
          <FadeUp className="join-opening-gap">
            <JoinFrame
              src="/synergy/join-opening-agents.jpg"
              alt={t("opening.imageAlt")}
            />
          </FadeUp>

          <FadeUp>
            <div className="join-copy join-copy-gap">
              <p className="sem-hero-sub text-ink">{t("opening.lead")}</p>

              {/* The block is broken by QUESTION subheads, which is what their
                  h3s do — "Vad kostar en guidad visning?", "Hur många kan vi
                  vara?". Ours ask the three questions someone actually arrives
                  with. */}
              {(["1", "2", "3"] as const).map((n) => (
                <div key={n} className="join-copy-q">
                  <h3 className="sem-h3 font-display text-navy">
                    {t(`opening.q${n}`)}
                  </h3>
                  <p className="sem-body mt-5 text-ink">{t(`opening.a${n}`)}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ===================================================================
          §3 — THE OFFER. Heading rail left, 2 x 2 cards right.
      =================================================================== */}
      <section
        aria-labelledby="join-offer-heading"
        className="sem-shell sem-pad-y"
      >
        <div className="sem-inner">
          <div className="join-offer">
            <FadeUp className="join-offer-rail">
              <h2
                id="join-offer-heading"
                className="sem-h2 font-display text-navy"
              >
                {t("offer.heading")}
              </h2>
              <p className="sem-body mt-6 max-w-[34ch] text-ink">
                {t("offer.body")}
              </p>
            </FadeUp>

            {/* FadeUp renders a <div> and takes no `as` prop, so the <li> is
                OUTSIDE it rather than being it — a div between <ul> and <li>
                is invalid markup and breaks the list semantics. Giving FadeUp
                an `as` prop would have been the tidier-looking fix and is
                exactly the kind of change that leaks: three other pages render
                it. The <li> carries `.join-card` so the hairline sits on the
                list item, not on an animated wrapper whose transform would
                drag the border with it. */}
            <ul className="join-offer-cards">
              {OFFER.map((k, i) => (
                <li key={k} className="join-card">
                  <FadeUp index={i}>
                    {/* The numeral is decoration over a real heading — hidden
                        from the reading order so the card announces its label,
                        not "I. A system to work". */}
                    <p
                      aria-hidden="true"
                      className="join-numeral font-display text-[18px] font-semibold"
                    >
                      {t(`offer.${k}.numeral`)}
                    </p>
                    <h3 className="sem-h3 mt-3 font-display text-navy">
                      {t(`offer.${k}.label`)}
                    </h3>
                    <p className="sem-body mt-5 text-ink">
                      {t(`offer.${k}.body`)}
                    </p>
                  </FadeUp>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===================================================================
          §3b — THE PRODUCTS. The one piece of checkmate's substance that was
          genuinely missing from this page, and the only piece of it we can
          state truthfully.

          THEIR BLOCK: "CARRIERS / The paper behind you. / 40+ A-rated carriers
          behind every policy you write. Every client gets a real fit." plus
          their card "02 / 40+ carriers in your bag / All A-rated. Match every
          client to the right product instead of forcing one company's fit."

          WHAT WE TOOK: the ROLE that block plays — before you ask someone to
          apply, tell them what they would actually be selling — and the idea
          that holding more than one product is what lets you be honest with a
          client. WHAT WE DROPPED: "40+", and every other count. An unverified
          volume claim is dropped, not softened, so there is no "dozens of" or
          "a wide panel of" standing in for the number.

          🔴 WE DID NOT TAKE THEIR "TECHNOLOGY & TOOLS" BLOCK, AND THAT IS A
          COMPLIANCE DECISION RATHER THAN AN EDITORIAL ONE. Theirs lists an AI
          CRM, an AI dialer, an agent portal and an inbound call pipeline. We
          have no confirmation Synergy has any of them, and writing them up
          would be inventing capabilities, which is worse than duplicating
          copy. The agent portal is the sharpest case: this page DISABLES the
          portal CTA because the portal does not exist, so describing one in
          body copy two blocks away would have the page contradict itself.

          THE PRODUCT NAMES ARE READ FROM THE `services` NAMESPACE, NOT RETYPED.
          They are already approved on /services, and reading them means the two
          pages cannot drift into naming the same seven products differently.
          Only the four strings around them are new (`join.range.*`).
      =================================================================== */}
      <section
        aria-labelledby="join-range-heading"
        className="sem-shell sem-pad-y"
      >
        <div className="sem-inner">
          <div className="join-range">
            <FadeUp className="join-range-rail">
              <p className="sem-eyebrow text-ink/70">{t("range.eyebrow")}</p>
              <h2
                id="join-range-heading"
                className="sem-h2 mt-4 font-display text-navy"
              >
                {t("range.heading")}
              </h2>
              <p className="sem-body mt-6 text-ink">{t("range.body")}</p>
              {/* `.join-range-link`, NOT `.join-phone`. The phone rule is
                  21-26px with its own margin-top — it is sized to BE a phone
                  number, and borrowing it here would print a body link at
                  display scale and fight the margin. One route, one purpose,
                  one class. */}
              <Link
                href={routeHref(locale, "services")}
                className="join-range-link"
              >
                {t("range.link")}
              </Link>
            </FadeUp>

            {/* Same reason the §3 cards keep FadeUp INSIDE the <li>: a div
                between <ul> and <li> is invalid and breaks list semantics. */}
            <ul className="join-range-list">
              {PRODUCT_KEYS.map((k, i) => (
                <li key={k} className="join-range-item">
                  <FadeUp index={i}>
                    <span className="sem-body text-ink">{s(`products.${k}.name`)}</span>
                  </FadeUp>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===================================================================
          §4 — HOW IT WORKS. Imageless editorial rail (was <ServicesEssay> with
          four portrait frames). The frames all duplicated /about's team photos
          and no distinct Synergy portrait remains, so the section carries no
          images — I–IV numerals, type, whitespace. JoinSteps renders its own
          <section aria-labelledby>. See HANDOFF.
      =================================================================== */}
      <JoinSteps
        headingId="join-steps-heading"
        heading={t("steps.heading")}
        tagline={t("steps.tagline")}
        steps={stepData}
      />

      {/* ===================================================================
          §5 — APPLY. Twinned to checkmatefinancialgroup.com/agents#apply.

          THEIR SPLIT: copy and phone on the left, form card on the right, an
          even 561 + 22 + 561 on a 1144 container. We keep the even two-up and
          use our own 131.2 gap — 22px between a copy column and a form is
          tighter than anything else on this site.

          🔴 THE HEADING CARRIES THE SCROLL TARGET. `id="join-apply-heading"`
          is what the hero's "Join as agent" button scrolls to, offset by the
          bar's own height so the heading lands clear of it rather than under
          it. Moving or renaming this id breaks that CTA.
      =================================================================== */}
      <section
        aria-labelledby="join-apply-heading"
        className="sem-shell sem-pad-y"
      >
        <div className="sem-inner">
          <div className="join-apply-grid">
            <FadeUp>
              <p className="sem-eyebrow text-ink/70">{t("apply.eyebrow")}</p>
              <h2
                id="join-apply-heading"
                className="sem-h2 mt-4 font-display text-navy"
              >
                {t("apply.heading")}
              </h2>
              <p className="sem-body mt-6 max-w-[46ch] text-ink">
                {t("apply.body")}
              </p>

              {/* The phone sits in the left column exactly as theirs does
                  ("Questions first? Call (833) 997-6934."), and for our own
                  reason on top of theirs: the form cannot submit, so the live
                  path has to be the prominent one. Same call as /contact. */}
              <p className="sem-body mt-8 text-ink">{t("apply.phoneLead")}</p>
              {/* `.join-phone`, NOT `.contact-phone` — see the note on the rule
                  in globals.css. /contact solved the same problem first and
                  borrowing its class would have made one rule load-bearing on
                  two routes. */}
              <a href={f("phoneHref")} className="join-phone">
                {f("phone")}
              </a>
            </FadeUp>

            {/* No `locale` prop any more — the form is a CLIENT component now
                and reads its strings from the next-intl provider like every
                other client component. */}
            <FadeUp index={1}>
              <JoinApplyForm />
            </FadeUp>
          </div>
        </div>
      </section>
      {/* ===================================================================
          🔴 §6 — CLOSING CTA "Come and talk to us." REMOVED ON INSTRUCTION
          (2026-08-03). It was the full-bleed navy band that closed the page.

          WHY IT WAS RIGHT TO GO, beyond the instruction: its body read "There
          is no application form on this page. The first step is a conversation"
          — copy written back when §13b scoped a page with NO apply surface. §5
          (JoinApplyForm) exists now, so the block was actively CONTRADICTING the
          section directly above it, telling the reader the form they had just
          scrolled past was not there. Removing it resolves that, and the page
          now ends on the apply section as its final content.

          🔴 POSITION NOTE FOR THE RECORD: the instruction called it "above the
          apply section"; in the built page it was the last section, BELOW §5.
          There is only one "Come and talk to us" navy block on the site and this
          is it — removing it is unambiguous either way.

          KEPT, NOT DELETED: the strings `join.cta.heading/body/button` stay in
          both message files, unrendered, per the standing convention. Restoring
          the block is pasting this section back and it reads them again.

          THE SEAM: §5 uses `sem-pad-y`, so the page keeps a full section's
          bottom padding before the footer — the same rhythm every other route
          ends on (the footer is mounted once in (site)/layout, after children).
          No gap was left to close: removing a full-bleed section does not strand
          a half-height void, it just ends the page one section earlier on
          balanced padding. Verified: apply-section bottom → footer top seam is a
          clean single `sem-pad-y` gap, no double margin, no navy remnant.
      =================================================================== */}
    </main>
  );
}


