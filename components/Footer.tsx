import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FOOTER_ROUTES, JOIN_URL, routeHref } from "@/routes";
import Logo from "./Logo";

/**
 * Site footer — rebuilt on reyou.life's `footer.footer_wrap`, measured live at
 * 1536 / 1400 / 768 / 390. Their structure, fflsynergy's content, our tokens.
 * No CSS of theirs is copied and none of their files are used.
 *
 * THEIR ANATOMY, MEASURED:
 *
 *   footer      1536x858, background #252525, colour #F8F4EE, flex column,
 *               justify-content centre; section spacers of 112px top and bottom
 *   container   1472 (margin 0 32), a TWELVE-COLUMN grid, column gap 32,
 *               row gap 0, margin-bottom 32 — every child explicitly placed:
 *
 *                 subscribe     1 / span 3      social        1 / span 3
 *                 locations     4 / span 4      divider       1 / span 12
 *                 (col 8 empty gutter)          logo          1 / span 3
 *                 sitemap       9 / span 2      verification  7 / span 6
 *                 legal        11 / span 2      bottom bar    1 / span 12
 *
 *   divider     NOT a bordered box: `padding-top: 80px` plus
 *               `border-bottom: 0.8px solid rgba(248,244,238,0.10)`. Eighty
 *               pixels of air, then a cream hairline at 10%.
 *   headings    15/21.75, weight 400, tracking +0.243, cream at 0.30.
 *               NOT uppercased in CSS — "SITEMAP" is typed in caps.
 *   links       15/21.75, weight 400, cream 100%, `padding: 12px 0` (35px
 *               rows, no gap), never underlined in any state.
 *   hover       opacity 1 -> 0.30 over 0.1s ease. Nothing else moves.
 *   bottom bar  flex, space-between: © line left, studio credit right.
 *   a11y        opens with a VISUALLY HIDDEN <h2>Footer</h2> (clip-rect), so
 *               the landmark gets an accessible name with no visible heading.
 *               Kept — it is the one piece of their markup worth taking whole.
 *
 *   responsive  spacer 112 -> 84 -> 66; container margin 32 -> 22.6 -> 16.7;
 *               column gap 32 -> 22.6 -> 16.7; type 15 -> 14.4 -> 14.0;
 *               divider pad 80 -> 61 -> 49.5. The collapse (identical at 768
 *               and 390, so the switch is the same ~1025 boundary as their
 *               other blocks):
 *                 subscribe 1/3 -> 1/12    sitemap 9/2 -> 1/6
 *                 locations 4/4 -> 1/12    legal  11/2 -> 7/6
 *                 logo      1/3 -> 1/6     social  1/3 -> 7/6
 *               i.e. the two link columns sit SIDE BY SIDE at half width.
 *               Only the bottom bar changes direction, and only at phone.
 *
 * THREE DELIBERATE DEVIATIONS, all forced by contrast. Measured on their own
 * #252525, three of their states fail AA and a hover state has to pass too:
 *
 *   column headings   cream @ 0.30   2.56:1   (needs 4.5)
 *   link hover        opacity 0.30   2.56:1   (needs 4.5)
 *   bottom © line     cream @ 0.30   2.56:1   (needs 4.5)
 *
 * On our navy #0D1B2A: headings and the © line use cream at 70% (8.26:1), and
 * hover goes to gold-pale #EFE1B0 (13.31:1) rather than fading — the same
 * hover colour the consultation CTA uses, so the two read as one system.
 * Everything else about the treatment is theirs.
 *
 * TWO EMPTY SLOTS, LEFT EMPTY ON PURPOSE. Their layout has a "Follow us:" rail
 * and a verification-badge rail. fflsynergy has no social presence anywhere on
 * its site (checked: zero social hrefs) and shows no badges. Carrier marks
 * would imply endorsement. Both slots are dropped rather than filled.
 *
 * THE LOGO IS A STAND-IN. `variant="dark"` is the artwork exactly as supplied
 * — nothing is recoloured and no mark is invented — but reyou's slot expects a
 * WIDE WORDMARK (344x94, 3.7:1) and ours is a near-square crest. A horizontal
 * cream lockup is still wanted from the client.
 *
 * NOT INCLUDED: fflsynergy's footer SEO paragraph, which restates the contact
 * block verbatim for keywords. Omitted rather than wedged into a slot.
 *
 * NO DISCLOSURE LINE. fflsynergy carries no licence number and no regulatory
 * disclosure anywhere; Checkmate's footer does, and it reads: "Licensed
 * insurance agency. Coverage is subject to underwriting approval, and product
 * and carrier availability varies by state. This site does not constitute an
 * offer of insurance; policies are issued only by licensed agents and admitted
 * carriers." A Florida life agency footer would normally carry at least a
 * licence number and a "not an offer of insurance" line. That is a legal
 * question for the client, not copy to be written here, so the slot does not
 * exist yet. DO NOT invent one.
 *
 * UNVERIFIED CONTACT DETAIL. The street address is shared with Checkmate —
 * their JSON-LD carries "5728 Major Blvd, Ste 702 / Orlando / FL / 32819",
 * the same building and suite. Still awaiting client confirmation. (The phone
 * is NOT shared: Checkmate's only number, in both their footer and their
 * schema, is +1-833-997-6934; 407-434-0400 appears nowhere on their site.)
 *
 * ---------------------------------------------------------------------------
 * WCAG AA — measured on the built DOM at 1536. The surface is flat #0D1B2A
 * with no photograph behind it, so these are exact, not worst-case estimates.
 *
 *   element                     fg                  bg        ratio  needs
 *   column headings (15px)      cream 70% #B2B3B3   #0D1B2A     8.26   4.5
 *   nav links (15px)            #F8F4EE             #0D1B2A    15.87   4.5
 *   contact links tel/mailto    #F8F4EE             #0D1B2A    15.87   4.5
 *   contact text (address)      #F8F4EE             #0D1B2A    15.87   4.5
 *   mission paragraph           #F8F4EE             #0D1B2A    15.87   4.5
 *   pull-quote (18px)           #F8F4EE             #0D1B2A    15.87   4.5
 *   copyright (14px)            cream 70% #B2B3B3   #0D1B2A     8.26   4.5
 *   link hover                  #EFE1B0             #0D1B2A    13.31   4.5
 *   focus ring                  #EFE1B0             #0D1B2A    13.31   3.0
 *   divider hairline            cream 10%           #0D1B2A     1.31   n/a
 *
 * The hairline is a decorative separator, not a control boundary or a piece of
 * information, so 1.4.11 does not bind it. Everything else clears with margin;
 * the tightest is 8.26 against 4.5.
 *
 * No gold #C9A84C as text anywhere. For the record it would pass on navy
 * (7.61:1) — it is on cream that it fails at 2.09:1 — but hover uses gold-pale
 * so the footer and the consultation CTA share one hover system.
 * ---------------------------------------------------------------------------
 */
export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  // Rendered server-side. On a statically exported build this is baked at
  // build time, which is the same behaviour as fflsynergy's hard-coded year.
  const year = new Date().getFullYear();

  // `cap-trim cap-body` is the reason the rows are the right height. reyou lay
  // their footer links out on the CAP BAND, not the line box: at 1440 a
  // 15/21.75 link renders an ELEVEN pixel box, so 12 + 11 + 12 = a 35px row.
  // Without the trim the same link renders its full ~22px line box and the row
  // becomes ~46px — over seven links that alone was 73px of dead air in the
  // tallest column. `leading-[1.5]` is required, not decorative: cap-body's
  // trim values (0.2969em / 0.50em) are derived for Overpass at line-height
  // 1.5, and are wrong against an inherited `normal`.
  const linkClass =
    "cap-trim cap-body block py-3 text-[14px] leading-[1.5] text-cream transition-colors duration-100 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale md:text-[15px]";
  const headingClass =
    "cap-trim cap-body py-3 text-[14px] font-normal leading-[1.5] tracking-[0.016em] text-cream/70 md:text-[15px]";

  /**
   * THE FOOTER SITEMAP IS NOW A SITEMAP OF PAGES THAT EXIST.
   *
   * It used to list six routes hard-coded here; four of them — services,
   * blog, gallery, contact — 404. They were real <Link>s to nothing, which is
   * the worst version of the problem: they look and behave like working
   * navigation right up to the moment the 404 renders.
   *
   * The list comes from routes.ts now, which is the same list the header
   * reads, so the two navigation surfaces cannot disagree about what the site
   * contains. Restoring a page adds it in one place.
   */
  const navItems = FOOTER_ROUTES.map((key) => ({
    key,
    href: routeHref(locale, key),
  }));

  return (
    <footer className="bg-navy text-cream">
      {/* reyou's own technique: the landmark is named for assistive tech
          without putting a visible heading on the page. */}
      <h2 className="sr-only">{t("srTitle")}</h2>

      {/* Padding is ASYMMETRIC, because theirs is. Their top spacer is
          112/84/66 but the bottom is the layout's own margin — 32 at desktop,
          61/49 below. A symmetric 112 under the © line was most of the dead
          space complained about. Measured, not inherited. */}
      <div className="mx-auto max-w-[1620px] px-5 pb-12 pt-16 md:px-8 md:pb-16 md:pt-20 lg:pb-8 lg:pt-28">
        <div className="grid grid-cols-12 gap-x-4 gap-y-8 md:gap-x-6 lg:gap-x-8 lg:gap-y-0">
          {/* MISSION — their subscribe slot, 1 / span 3 */}
          <div className="col-span-12 lg:col-span-3">
            <h3 className={headingClass}>{t("missionTitle")}</h3>
            <p className="mt-1 text-[14px] leading-[1.55] text-cream md:text-[15px]">
              {t("mission")}
            </p>
            <p className="mt-4 font-display text-[16px] leading-[1.3] text-cream md:text-[18px]">
              {t("pullQuote")}
            </p>
          </div>

          {/* CONTACT — their locations slot, 4 / span 4 */}
          <address className="col-span-12 not-italic lg:col-span-4 lg:col-start-4">
            <h3 className={headingClass}>{t("contactTitle")}</h3>
            <ul className="mt-1 space-y-2 text-[14px] leading-[1.55] text-cream md:text-[15px]">
              <li>
                {/* fflsynergy renders these as plain spans; making them real
                    tel:/mailto: links is an interaction fix, not a copy change */}
                <a
                  href={t("phoneHref")}
                  className="transition-colors duration-100 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
                >
                  {t("phone")}
                </a>
              </li>
              <li>
                <a
                  href={t("emailHref")}
                  className="transition-colors duration-100 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
                >
                  {t("email")}
                </a>
              </li>
              <li>{t("address")}</li>
              <li>{t("hours")}</li>
            </ul>
          </address>

          {/* NAVIGATION — their sitemap slot, 9 / span 2 */}
          <nav
            aria-labelledby="footer-nav-heading"
            className="col-span-6 lg:col-span-2 lg:col-start-9"
          >
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
              <li>
                {/* The only link here that resolves today — it is fflsynergy's
                    own live external recruiting site, not a future route. */}
                <a
                  href={JOIN_URL}
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("nav.join")}
                </a>
              </li>
            </ul>
          </nav>

          {/* LEGAL — their legal slot, 11 / span 2.
              ---------------------------------------------------------------
              🔴 REMOVED, AND THIS ONE IS BLOCKED, NOT MERELY UNBUILT.

              It held two links, /privacy and /terms. Both 404.

              A privacy policy and terms of service for a Florida life
              insurance brokerage are legal documents, and they come from the
              client — the same rule that already governs the regulatory
              disclosure and the results disclaimer everywhere else in this
              codebase. They cannot be written here to fill the slot.

              And a link is worse than no link in this specific case: the link
              asserts that Synergy HAS a published privacy policy and that you
              can read it. Clicking it proves otherwise. An absent link says
              nothing, which is the accurate thing to say right now.

              The strings `footer.legalTitle`, `footer.legal.privacy` and
              `footer.legal.terms` are RETAINED UNTOUCHED in both message
              files. Restoring is: build the routes, then uncomment this.

              The nav column stays at col-start-9 / span 2 rather than
              spreading to fill the space — the reference layout this footer
              was measured from carries an empty gutter at column 8 already,
              so a second one at 11-12 is consistent with it rather than a
              hole where something used to be.

          <nav
            aria-labelledby="footer-legal-heading"
            className="col-span-6 lg:col-span-2 lg:col-start-11"
          >
            <h3 id="footer-legal-heading" className={headingClass}>
              {t("legalTitle")}
            </h3>
            <ul>
              <li>
                <Link href={`/${locale}/privacy`} className={linkClass}>
                  {t("legal.privacy")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className={linkClass}>
                  {t("legal.terms")}
                </Link>
              </li>
            </ul>
          </nav>
          */}

          {/* DIVIDER — their line_wrap: air, then a hairline at the BOTTOM */}
          <div
            aria-hidden="true"
            className="col-span-12 border-b border-cream/10 pt-12 md:pt-16 lg:pt-20"
          />

          {/* LOGO — their logo slot, 1 / span 3 */}
          {/* hairline → logo: their margin-top, 80 / 61.2 / 49.5 */}
          <div className="col-span-6 pt-12 md:pt-16 lg:col-span-3 lg:pt-20">
            {/* aria-label overrides the SVG's own <title> AND its two <text>
                nodes, which otherwise concatenate into
                "Synergy Insurance GroupSYNERGY INSURANCE GROUP". Same pattern
                SiteHeader already uses on the centred logo. */}
            <Link
              href={`/${locale}`}
              aria-label={tNav("company")}
              className="inline-flex rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-pale"
            >
              <Logo variant="dark" className="h-16 w-auto lg:h-20" />
            </Link>
          </div>

          {/* BOTTOM BAR — © left, nothing opposite (we have no agency credit) */}
          {/* logo → © line: their margin-top, 64 / 49.9 / 41.1 */}
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
