import Link from "next/link";
import { routeHref, type RouteKey } from "@/routes";

/**
 * THE SITE'S ONE CTA PAIR. Every primary conversion moment renders this and
 * nothing else, so the two actions cannot drift apart across pages.
 *
 *   PRIMARY    "Get a free quote"    -> /[locale]/contact   (everywhere)
 *   SECONDARY  varies by placement — see THE SECONDARY IS NOW A PROP below
 *
 * ---------------------------------------------------------------------------
 * 🔴 THE SECONDARY IS NOW A PROP, AND IT HAD TO BECOME ONE.
 *
 * It was hard-coded as the tel: link. The hero's secondary is now "Join our
 * team" -> /join, and this component has FOUR call sites — Hero, WhatWeCover,
 * /about §4 and /services §4. Editing the hard-coded destination would have
 * silently changed the other three, turning every "Call 407-434-0400" on the
 * site into a recruiting link. So the secondary is passed in, and the two
 * shapes it can take are a discriminated union rather than a bag of optional
 * strings:
 *
 *   { kind: "tel",   label, aria, href }   a real <a href="tel:">
 *   { kind: "route", label, route }        a <Link> to a RouteKey
 *
 * The union is what stops the two from being mixed up: a `route` secondary
 * cannot carry a phone `aria`, and a `tel` one cannot carry a RouteKey, so an
 * incomplete edit is a type error rather than a link that half-works.
 *
 * WHY THE PHONE REMAINS THE SECONDARY EVERYWHERE ELSE.
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
/** The two shapes the secondary action is allowed to take. */
export type CtaSecondary =
  | { kind: "tel"; label: string; aria: string; href: string }
  | { kind: "route"; label: string; route: RouteKey };

export default function CtaPair({
  locale,
  quoteLabel,
  secondary: secondaryAction,
  variant = "cream",
  className = "",
}: {
  locale: string;
  quoteLabel: string;
  secondary: CtaSecondary;
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

      {secondaryAction.kind === "tel" ? (
        // A real tel: anchor, never a button with a handler — see the docblock.
        <a
          href={secondaryAction.href}
          aria-label={secondaryAction.aria}
          className={secondary}
        >
          {secondaryAction.label}
        </a>
      ) : (
        // A route link. NO aria-label: the visible text ("Join our team") is
        // already the accessible name and already says where it goes, so an
        // aria-label here would only be a second, divergent name for the same
        // control — the failure the tel: variant needs one to avoid.
        <Link
          href={routeHref(locale, secondaryAction.route)}
          className={secondary}
        >
          {secondaryAction.label}
        </Link>
      )}
    </div>
  );
}
