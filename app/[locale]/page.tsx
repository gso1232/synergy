import { unstable_setRequestLocale } from "next-intl/server";
// NOTE: navigation is <SiteHeader />, mounted in app/[locale]/layout.tsx so it
// persists on every page and down the whole scroll. Nothing nav-related belongs
// in this file or in the hero. components/Nav.tsx is the superseded three-zone
// version and is no longer rendered anywhere.
import Hero from "@/components/Hero";
import CarrierStrip from "@/components/CarrierStrip";
import WhatWeCover from "@/components/WhatWeCover";
import WhoWeServe from "@/components/WhoWeServe";
import WhySynergy from "@/components/WhySynergy";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Consultation from "@/components/Consultation";
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
        <CarrierStrip />
        <WhatWeCover />
        <WhoWeServe />
        <WhySynergy />
        <Testimonials />
        <HowItWorks />
        {/* <Calculator /> — no longer in the homepage scroll flow. It lives at
            /[locale]/calculator, which <Consultation />'s CTA links to. The
            component and its route are untouched; only this call site is
            commented out, and it is kept so the old order is recoverable. */}
        <Consultation />
      </main>
    </>
  );
}
