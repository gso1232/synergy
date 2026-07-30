import Link from "next/link";
import { routeHref } from "@/routes";

/**
 * THE SITE'S ONE CTA PAIR. Every primary conversion moment renders this and
 * nothing else, so the two actions cannot drift apart across pages.
 *
 *   PRIMARY    "Get a free quote"    -> /[locale]/contact
 *   SECONDARY  "Call 407-434-0400"   -> tel:+14074340400
 *
 * WHY THE SECONDARY IS A PHONE CALL, AND NOT A SECOND LINK TO /contact.
 * Both forms on this site are disabled pending the GHL webhook (ContactForm and
 * JoinApplyForm both ship inside `<fieldset disabled>` with a notice). The
 * phone is therefore THE ONLY CHANNEL THAT REACHES A HUMAN TODAY, which makes
 * it a genuinely different action rather than decoration. The label carries the
 * literal number so the destination is unambiguous before the click — the exact
 * failure of the retired "Talk to an advisor", which rendered twice under one
 * label pointing at two different destinations (tel: in the hero, /contact in
 * WhatWeCover).
 *
 * 🔴 RETIRED WITH THIS COMPONENT: "Talk to an advisor" (`hero.ctaCall`,
 * `whatWeCover.ctaSecondary`). Both keys are RETAINED UNTOUCHED in both message
 * files per the standing convention — nothing is deleted, only unrendered.
 *
 * NO HOOKS ON PURPOSE. This takes its strings as props instead of calling
 * useTranslations, so it renders inside a server component (/about, /services)
 * and inside a client one (Hero, WhatWeCover) without a "use client" boundary
 * or a second copy. Callers pass the `cta.*` namespace.
 *
 * VARIANTS — both solved so contrast does NOT depend on the photograph:
 *   "photo"  over a full-bleed image. Primary is an OPAQUE white pill (navy
 *            text, 15.87:1); secondary is an OPAQUE navy pill (white text,
 *            15.87:1) with a white border. Deliberately opaque: a translucent
 *            fill would make legibility a function of whatever pixels sit
 *            behind it, which changes with every crop and viewport.
 *   "cream"  on the cream sections. Primary navy/cream (15.87:1), secondary is
 *            an outlined navy pill with navy text on cream (15.88:1).
 *
 * The tel: is a REAL <a href="tel:">, never a button with a handler, so it is
 * keyboard reachable, focusable and works with the OS dialer. `aria-label`
 * carries the company name so the link makes sense read out of context.
 */
export default function CtaPair({
  locale,
  quoteLabel,
  callLabel,
  callAria,
  phoneHref,
  variant = "cream",
  className = "",
}: {
  locale: string;
  quoteLabel: string;
  callLabel: string;
  callAria: string;
  phoneHref: string;
  variant?: "photo" | "cream";
  className?: string;
}) {
  const base =
    "inline-flex h-12 items-center justify-center rounded-full px-7 text-[14px] font-medium transition-transform duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  const primary =
    variant === "photo"
      ? `${base} bg-white text-navy shadow-[0_2px_18px_rgba(13,27,42,0.28)] focus-visible:outline-gold-pale`
      : `${base} bg-navy text-cream hover:bg-navy-lift focus-visible:outline-gold-deep`;

  const secondary =
    variant === "photo"
      ? `${base} border border-white/80 bg-navy text-white focus-visible:outline-gold-pale`
      : `${base} border border-navy/70 text-navy hover:bg-navy/[0.06] focus-visible:outline-gold-deep`;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Link href={routeHref(locale, "contact")} className={primary}>
        {quoteLabel}
      </Link>
      {/* A real tel: anchor — see the docblock. */}
      <a href={phoneHref} aria-label={callAria} className={secondary}>
        {callLabel}
      </a>
    </div>
  );
}
