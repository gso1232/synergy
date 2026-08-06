/**
 * The client's hi-res lockup — `public/synergy-logo_1.webp`, adopted
 * 2026-08-07 on instruction. ONE component so the four placements cannot drift.
 *
 * ---------------------------------------------------------------------------
 * 🔴 WHAT CHANGED, AND WHY IT IS NOT THE FILE THAT WAS HANDED OVER.
 *
 * The instruction was "change to synergy-logo_1.svg". That file CANNOT be
 * served as-is, measured:
 *
 *   synergy-logo_1.svg   1254 x 1254   100% opaque, 100% opaque EDGES
 *
 * It is not a vector at all. It is a single 1254² **RGB PNG with no alpha
 * channel**, base64-embedded in an SVG wrapper — an export of the logo sitting
 * on a SOLID BLACK SQUARE. 87.7% of it is pure black; the lockup itself only
 * occupies rows 388-820, columns 112-1178. Dropped into the header it renders a
 * black box, and because the canvas is square while the lockup is 2.47:1, the
 * artwork inside it would shrink to roughly a third of the band height.
 * `synergy-logo_2.svg` was byte-identical to it; `_3` and `-tight` were
 * auto-traces of the same black export (2,990 paths, 2,851 near-black colours).
 *
 * 🔴 WHAT SHIPS: THE PLATE IS GONE, BUT THE SHIELD KEEPS ITS OWN DARK FILL.
 * That distinction is the whole point and it is easy to undo by accident.
 * Three passes were needed to land it, and the two rejected ones are recorded
 * so neither gets re-proposed:
 *
 *   pass 1  keyed the black out everywhere -> the page showed THROUGH the
 *           shield. Rejected: the shield lost its body.
 *   pass 2  kept the whole black square -> a black rectangle behind the
 *           wordmark too. Rejected: "not the whole logo".
 *   pass 3  SHIPPED. Black keyed out around the wordmark; the shield's
 *           enclosed interior stays opaque with its original colours.
 *
 * HOW PASS 3 IS BUILT — reproducible, and no pixel is recoloured by hand:
 *   1. alpha = max(r,g,b), floored at 12 to kill the export's noise, then
 *      unpremultiplied so the golds stay saturated.
 *   2. Threshold at 90 to get the SOLID artwork only, label it, take the
 *      largest connected component — that is the shield (x 120-449, y 400-813).
 *      🔴 90, NOT 12: at the low threshold the soft blue glow at the shield's
 *      top-right joins the component and `binary_fill_holes` closes a loop
 *      around it, painting a dark blob into the corner. Measured and looked at.
 *   3. `binary_fill_holes` on that component, masked to x < 520 — the x-clamp
 *      is what stops the counters inside the S, R and G of "SYNERGY" being
 *      filled in solid.
 *   4. Inside that region: alpha 255 and the ORIGINAL rgb, because those pixels
 *      genuinely sit on their own plate inside the shield. Everywhere else:
 *      the keyed values from step 1, so the glow survives as a soft halo.
 *
 *   Result: 68.7% of the canvas fully transparent, 18.7% fully opaque.
 *
 * CROP is the alpha bbox plus 24px — (93,361) to (1196,839), 1103 x 478
 * (2.31:1), served at 591 x 256.
 *
 * `public/synergy-logo_1.svg` IS LEFT ON DISK EXACTLY AS DELIVERED. This is a
 * derivative, not a replacement of the source.
 *
 * FORMAT IS WEBP, NOT SVG, AND THAT IS FORCED. The source has no vector data to
 * preserve — re-wrapping the raster in SVG would only add base64's 33% inflation
 * (95 KB vs 71 KB) for a file that is a bitmap either way.
 *
 * ---------------------------------------------------------------------------
 * RESOLUTION. 591 x 256, against a largest render of 58.7px (header at rest,
 * h-11 x the bar's scale(1.3333)) — 176px at 3x DPR. 256 clears every placement
 * at 3x with 45% to spare. Nothing is upscaled anywhere.
 *
 * COST: 45 KB against the 5.7 KB of the file it replaces, on every route above
 * the fold. That is the price of real artwork over a reconstruction — see the
 * `<text>` note below for what the old file actually was.
 *
 * 🔴 IT IS STILL A DARK-SURFACE MARK. The shield now carries its own body and
 * reads on anything, but the WORDMARK is bare gold on whatever sits behind it:
 * 7.67:1 on navy, 2.07:1 on cream. Composited and looked at on both. All four
 * live slots — header over the navy/photo hero, mobile panel, footer, login
 * panel — are dark surfaces, so this is not a live problem. Do not put this
 * file on cream without looking at it first.
 *
 * ---------------------------------------------------------------------------
 * WHAT THE OLD FILE WAS, AND WHY THIS IS AN UPGRADE DESPITE THE BYTES.
 *
 * `public/synergy-logo.svg` drew its wordmark as LIVE <text> in
 * `font-family="Georgia, 'Times New Roman', serif"` with no @font-face and no
 * outlines — so the wordmark was never the brand lettering, it was Georgia
 * standing in for it, and it substituted to Times or a generic serif on any
 * client without Georgia. SiteHeader's own note 3 records the same finding.
 * The new artwork has the real letterforms baked in as pixels, which is
 * platform-stable in a way live <text> can never be.
 *
 * 🔴 AND THE OLD FILE IS GONE FROM DISK. `public/synergy-logo.svg` was deleted
 * from the working tree on 2026-08-07 (not by this change) and was 404ing at
 * every placement — `naturalWidth` 0 in the live header — before this swap.
 * It is still tracked in git at 6e75423 if it is ever wanted back:
 *     git checkout -- public/synergy-logo.svg
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
 * SIZING. The header is the reference. Everything else is scaled DOWN or held
 * level with it, never past it.
 *
 *   header at rest    58.7px  (h-11 x the bar's own scale(1.3333))  <- LARGEST
 *   header scrolled   44px    h-11 / card:h-12
 *   login navy panel  56px    h-14
 *   footer            48px    h-12
 *   mobile panel      36px    h-9
 *   engine hub        --      REMOVED 2026-08-07 with TheEngine
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
      /* src="/synergy-logo.svg" — SUPERSEDED 2026-08-07, kept for one round.
         1120x340 vector, 5.7KB, but its wordmark was live Georgia <text> and
         the file is no longer on disk (see the docblock). Reverting is this one
         line plus `git checkout -- public/synergy-logo.svg`. */
      src="/synergy-logo_1.webp"
      alt={alt}
      /* Intrinsic size, so the box is reserved before the bitmap arrives — this
         is what keeps the header's CLS at 0 now that the source is a raster
         rather than a vector. 591x256 = the padded crop's 2.31:1. */
      width={591}
      height={256}
      // NEVER lazy: every placement is either above the fold (header, login)
      // or inside a section the reader has already reached.
      decoding="async"
      className={className}
    />
  );
}
