import { unstable_setRequestLocale } from "next-intl/server";
// NOTE: navigation is <SiteHeader />, mounted in app/[locale]/layout.tsx so it
// persists on every page and down the whole scroll. Nothing nav-related belongs
// in this file or in the hero. components/Nav.tsx is the superseded three-zone
// version and is no longer rendered anywhere.
import Hero from "@/components/Hero";
import TheEngine from "@/components/TheEngine";
import WhatWeCover from "@/components/WhatWeCover";
import WhoWeServe from "@/components/WhoWeServe";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Consultation from "@/components/Consultation";
// 🔴 FOLDED INTO <TheEngine /> — 2026-08-01. Both are COMMENTED OUT, NOT
// DELETED; the component files are untouched and restoring either is
// uncommenting one import and one line here.
//
// import CarrierStrip from "@/components/CarrierStrip";
//   The slim 21-logo marquee. TheEngine now renders the SAME 21 carriers (both
//   read APPOINTMENTS from components/Carriers.tsx, which STAYS — TheEngine
//   imports it) plus the argument the strip could not make, so shipping both
//   adjacent said "21 carriers" twice in one screen. TheEngine takes the
//   strip's exact slot, which also preserves the rhythm the strip was holding:
//   it was the ONLY cream breather between the navy/photo Hero and
//   WhatWeCover's full-bleed parallax photo. Deleting it without a cream
//   replacement would have butted two photographic sections together.
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
        <Hero />
        <WhatWeCover />
        <WhoWeServe />
        {/* 🔴 MOVED 2026-08-02 — was in the retired CarrierStrip's slot at
            position 2, now sits directly under WhoWeServe on instruction.
            Read the seam note above the imports: this move has a measured cost
            at the OLD slot, which is now Hero → WhatWeCover. */}
        <TheEngine />
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
