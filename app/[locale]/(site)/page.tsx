import { unstable_setRequestLocale } from "next-intl/server";
// NOTE: navigation is <SiteHeader />, mounted in app/[locale]/layout.tsx so it
// persists on every page and down the whole scroll. Nothing nav-related belongs
// in this file or in the hero. components/Nav.tsx is the superseded three-zone
// version and is no longer rendered anywhere.
import Hero from "@/components/Hero";
import ImpactStats from "@/components/ImpactStats";
import CarrierStrip from "@/components/CarrierStrip";
// import TheEngine from "@/components/TheEngine";
//   🔴 REMOVED FROM THE PAGE 2026-08-07, ON INSTRUCTION — see the call site
//   below for the full derivation and the copy inventory. The component file is
//   UNTOUCHED on disk, all 612 lines; restoring it is uncommenting this line
//   and the one in the tree below.
import WhatWeCover from "@/components/WhatWeCover";
import WhoWeServe from "@/components/WhoWeServe";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Consultation from "@/components/Consultation";
// 🟢 CARRIERSTRIP IS BACK — 2026-08-07, and it is now rendered TWICE.
//   It was commented out on 2026-08-01 because TheEngine rendered the same 21
//   carriers and shipping both said "21 carriers" twice in one screen. That
//   reason died with TheEngine: the strip is now the ONLY carrier surface on
//   the homepage, so the duplication it was retired for cannot happen.
//   It also resumes the job it always had — being the ONLY cream breather
//   between the navy/photo Hero and WhatWeCover's full-bleed parallax photo.
//
// 🔴 FOLDED INTO <TheEngine /> — 2026-08-01. STILL COMMENTED OUT, NOT DELETED.
//
// import WhySynergy from "@/components/WhySynergy";
//   It rendered `whySynergy.points.p1-p4`. p1/p2/p3 are the SAME three
//   arguments as `rows.r1/r2/r3`, which TheEngine's cards now carry in prose
//   form — so this is a duplication removed, not content lost. The r-rows were
//   already orphaned (the eight-row zig-zag they belonged to was superseded
//   inside WhySynergy.tsx long ago), so TheEngine introduces no new duplication.
//   🟡 ONE CASUALTY, LOGGED: `points.p4` — "ITIN-friendly, licensed in all fifty
//   states" — has NO equivalent among r1-r3 and now renders nowhere on the
//   homepage. ITIN is a genuine Synergy differentiator (it is in their meta
//   description, their FAQ and three blog articles). `whySynergy.rows.r4`
//   ("ITIN-Friendly, No SSN Required") is approved and sitting unused in
//   en.json, so the fix is a FOURTH card here — one entry in CARD_KEYS and one
//   more OUT_Y anchor. Flagged for a decision rather than done unasked.
//
// STASHED sections — kept for reuse, not rendered:
// import Calculator from "@/components/Calculator"; // MOVED, not deleted — the
//   calculator now lives on its own route at app/[locale]/calculator/page.tsx
//   (/en/calculator, /es/calculator). The section that replaces it here is the
//   consultation panel, which links to that page. Nothing else in the page
//   order changed; the calculator was last, and the new section takes that
//   exact slot.
// import TwoWaysIn from "@/components/TwoWaysIn";   // removed from page; component kept
// import Carriers from "@/components/Carriers";     // full section stashed; its
//   APPOINTMENTS array now feeds CarrierStrip (the slim band under the hero)

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <main>
        <Hero locale={locale} />
        {/* Directly under the hero, before the carrier marquee — the position
            the reference puts it in. */}
        <ImpactStats />
        {/* MARQUEE 1 — directly under the hero, on instruction. Carries the
            kicker; marquee 2 does not, so the line is not said twice. */}
        <CarrierStrip />
        <WhatWeCover />
        <WhoWeServe />
        {/* =================================================================
            🔴 THE ENGINE IS REMOVED, 2026-08-07, ON HAMZA'S INSTRUCTION.
            COMMENTED, NOT DELETED — `components/TheEngine.tsx` is untouched on
            disk (612 lines, every Checkmate derivation intact). Reverting is
            uncommenting the import above and the line below.

                <TheEngine />

            WHAT WENT WITH IT. All of this is the client's own copy from
            fflsynergy.com, and NONE of it renders anywhere else on the site:

              carriers.eyebrow    "Our carriers"
              carriers.headline   "The strength behind every policy."
              carriers.subhead    the multi-carrier independence claim
              whySynergy.rows.r1  "We Work For You, Not One Carrier"
              whySynergy.rows.r2  "Clear, Honest, No Pressure"
              whySynergy.rows.r3  "A Partner for Life"
              engine.*            diagramLabel / cardsLabel / cardKicker

            NO MESSAGE KEY IS DELETED. They sit unused exactly as
            `whySynergy.rows.r4`-`r8` already do, so the revert needs no
            translation work in either locale.

            🟡 ONE CONSEQUENCE, LOGGED RATHER THAN QUIETLY ACCEPTED.
            /services deleted its own three-across trust row on the recorded
            reasoning that "the same three claims already ship on the homepage
            (whySynergy.rows.r1/r2/r6)" — see services/page.tsx §4. That is no
            longer true. The INDEPENDENCE claim in particular ("we are not tied
            to one carrier") now appears on no page: /about's values cover
            Education but not independence, and a logo marquee can show WHO the
            carriers are without making the argument for WHY being independent
            matters. Flagged for a copy decision; a one-line kicker on marquee 2
            is the cheapest home for it if it is wanted back.

            EngineNoise is now a zero-consumer component. File kept; ~8 KB of
            JS and one <canvas> grain loop leave the homepage. The 20 `.engine-*`
            rules and `.passport-guilloche` in globals.css are inert but LEFT IN
            PLACE, so the revert stays a one-file change.
        ================================================================= */}
        {/* MARQUEE 2 — the Engine's exact slot. Same component, so same 21
            marks, same 80 px/s, same direction. Kicker suppressed. */}
        <CarrierStrip showKicker={false} />
        <HowItWorks />
        {/* <Calculator /> — no longer in the homepage scroll flow. It lives at
            /[locale]/calculator, which <Consultation />'s CTA links to. The
            component and its route are untouched; only this call site is
            commented out, and it is kept so the old order is recoverable. */}
        <Consultation />
        {/* 🔴 MOVED 2026-08-02 — Testimonials was at position 5, between
            TheEngine and HowItWorks. The instruction was "after the calculator
            section"; there IS no calculator section on this page (see the
            comment above — it moved to /calculator and <Consultation /> took its
            exact slot and links to it), so "after the calculator" resolves to
            after <Consultation />, which makes this the last section before the
            footer. It is CREAM now, which is what keeps the Consultation(navy) →
            Testimonials(cream) → Footer(navy) run from collapsing into one dark
            mass. See the seam note in HANDOFF for the cost this left behind at
            the vacated slot. */}
        <Testimonials />
      </main>
    </>
  );
}
