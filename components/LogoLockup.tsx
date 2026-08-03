/**
 * The supplied horizontal lockup — `public/synergy-logo.svg`, delivered
 * 2026-08-02. ONE component so the five placements cannot drift.
 *
 * ---------------------------------------------------------------------------
 * IT IS A VECTOR, AND IT HAS NO RESOLUTION CEILING.
 *
 * The file is an SVG whose `viewBox` is `0 0 1120 340`. That is a COORDINATE
 * SPACE, not a pixel size: there is no raster inside it (verified — no <image>
 * element, no base64, 12 <path> nodes and 2 <text> nodes). It is drawn from
 * geometry at whatever size it is placed, so it is pixel-exact at 1x, 2x, 3x
 * and on a billboard. NO placement on this site can make it pixelate, and no
 * larger source is needed for scale.
 *
 * BACKGROUND IS GENUINELY TRANSPARENT — verified, not assumed. Zero <rect>
 * elements, no <style> block, no background attribute. Rasterised and sampled:
 * all four corners at alpha 0, and only 23.1% of the canvas is painted at all.
 * It cannot sit in a white box over the hero photo or on the navy login panel.
 *
 * ---------------------------------------------------------------------------
 * 🔴 IT IS A DARK-SURFACE MARK. MEASURED:
 *
 *   gold wordmark #D6A521  on navy  #0D1B2A   7.67:1
 *   gold wordmark #D6A521  on cream #F8F4EE   2.07:1
 *   shield face   #0A0D14  on cream #F8F4EE  17.74:1
 *   shield face   #0A0D14  on navy  #0D1B2A   1.12:1
 *
 * So the two halves of the mark fail on OPPOSITE surfaces: on navy the shield
 * plate vanishes into the background (1.12:1) and the gold wordmark sings; on
 * cream the shield is crisp and the wordmark is the weak part. On navy the
 * shield still reads because its gold edge and blue border draw the silhouette
 * — the plate disappearing is not the same as the mark disappearing.
 *
 * None of this is a WCAG failure: 1.4.3 exempts "text that is part of a logo or
 * brand name" and 1.4.11 exempts logotypes. These are legibility numbers.
 *
 * The retired inline <Logo> solved the cream case by recolouring its wordmark
 * to ink #1A1A1A. This file bakes the gold gradient in and cannot do that, so
 * on light surfaces the wordmark is simply weaker than what it replaced. That
 * is a known, accepted trade — see SiteHeader's docblock.
 *
 * ---------------------------------------------------------------------------
 * SIZING. The header is the reference: 48px tall (`h-12`), which renders
 * 158x48. Everything else is scaled DOWN or held level with it, never past it.
 *
 *   header at rest    64px   (h-12 x the bar's own scale(1.3333))
 *   header scrolled   48px   h-12       <- THE REFERENCE
 *   footer            48px   h-12
 *   login navy panel  48px   h-12
 *   mobile panel      36px   h-9
 *   engine hub        46px   w-[150px]  -- see TheEngine; sized by WIDTH
 *
 * 🔴 THE SUBLINE IS BELOW READING SIZE AT ALL OF THEM. "INSURANCE GROUP" is
 * 47px in a 340px canvas, so at 48px tall it renders 6.6px and at 36px it
 * renders 5.0px. It is texture, not type. That is tolerable ONLY because every
 * placement is wrapped in something that carries the company name for assistive
 * tech — a link with `aria-label`, or an adjacent heading — which is why `alt`
 * is empty here by default rather than repeating the name.
 *
 * `alt` defaults to "" (decorative). Pass one ONLY where the lockup is the sole
 * carrier of the name and nothing around it announces the company.
 */
export default function LogoLockup({
  className = "",
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/synergy-logo.svg"
      alt={alt}
      width={1120}
      height={340}
      // NEVER lazy: every placement is either above the fold (header, login,
      // splash-adjacent) or inside a section the reader has already reached.
      // An SVG has no raster to defer and next/image would only add a proxy hop
      // for a file that is 5.7KB.
      decoding="async"
      className={className}
    />
  );
}
