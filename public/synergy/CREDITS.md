# Imagery credits

## Hero — background video

`hero-couple.mp4` + `hero-couple-poster.jpg` — **Pexels video `4196177`**,
"Couples holding hands while walking on the grass field" (a cinematic
golden-hour drone shot). **Pexels License**, commercial use. Source:
https://www.pexels.com/video/4196177/. The 4K/32 MB original was re-encoded with
ffmpeg to a web-optimized **1080p H.264, no audio, faststart — 3.53 MB**; the
poster JPG is **0.19 MB** and is the LCP paint. The video is `muted / autoPlay /
loop / playsInline / preload="metadata"` and mounts **only on desktop +
non-reduced-motion**; mobile and reduced-motion get the poster still only.


### Hero legibility — measured against real video frames

Re-measured with the same ground-truth method used for "What we do": the actual
MP4 decoded to canvas, object-cover mapped to the section box, `.hero-scrim`
composited as a real gradient fill, and the `backdrop-blur` layers (12px under
the stat strip, 4px under the ghost CTA) reproduced with canvas filters — then
**every pixel** of each text element's box sampled across **48 frames** of the
11.98 s loop, plus the poster still (the mobile / reduced-motion path).

Method validated by differential test: with the scrim removed the headline falls
to **1.12:1** over a 0.884-luminance sky, confirming the pipeline actually
resolves the composite rather than assuming a flat dark surface.

**One real failure found and fixed.** On the 375 px poster crop — a portrait
crop that puts a brighter patch under the copy, which the sky-tuned top scrim
never reaches — the sub-headline measured **4.26:1** (needs 4.5), failing on
4.6 % of its pixels. Fixed two ways, neither of which darkens the frame at
large: the sub-headline's `text-white/90` became `text-white` (the 10 % alpha was
self-inflicted and bought nothing), and a new **`.hero-text-scrim`** adds a soft
ellipse behind the copy column only — peak **0.10**, fully clear by 78 %, no band
and no edge. Sub-headline **4.26 → 4.96**; headline also gained (3.91 → 4.38 on
video).

Worst-case per element after the fix (lowest across all frames / crops):

| element | 1440 video | 768 video | 375 poster | needs |
|---|---|---|---|---|
| eyebrow (12px) | 5.57 | 4.80 | 6.64 | 4.5 |
| headline (34–58px) | 4.38 | 4.61 | 5.29 | 3 |
| sub-headline (16–19px) | 6.40 | 6.15 | **4.96** | 4.5 |
| ITIN / SSN line (14px) | 5.61 | 6.89 | 8.33 | 4.5 |
| primary CTA (solid white) | 17.39 | 17.39 | 17.39 | 4.5 |
| ghost CTA (15px) | 8.61 | 8.40 | 7.40 | 4.5 |
| stat values (18px, ×5) | 13.37–15.09 | 13.94–14.85 | 13.91–14.47 | 4.5 |
| stat labels (12px, ×5) | 5.91–6.35 | 6.04–6.32 | 5.96–6.25 | 4.5 |
| nav links over video (14px) | 10.15 | — | — | 4.5 |
| nav phone, gold (14px) | 5.41 | — | — | 4.5 |

All photographs are licensed under the **Pexels License**
(https://www.pexels.com/license/) — free for commercial use, no attribution
required. Attribution recorded here as good practice.

## What we do — full-bleed parallax photograph (active)

`coverage-family-meadow.jpg` — **Pexels photo `30632127`**, "A cheerful family
enjoying a sunny day in a lush meadow with tall grass" — two children in the
foreground (one turning back, laughing) with both parents seated behind them in
golden backlit grass. Source: https://www.pexels.com/photo/30632127/. **Pexels
License**, free for commercial use. Downloaded at 2400×1602, no edits. Checked
clean of third-party branding at full size (plain white tees, unbranded denim).

Chosen over nine other candidates as the **brightest frame that is also even**:
card-band mean luminance **0.404** against the retired image's **0.078** — the
whole section reads ~2.2× brighter (full-frame mean 0.374 vs 0.170) — with the
lowest horizontal swing of any bright candidate (0.223) and almost no blown
highlights (**0.24 % hot** vs 6.9–27.8 % for the beach candidates). Warm
golden-hour grade needs no correction to sit in the palette, and the subject
(two generations together, parents watching children) reads as protection and
continuity rather than travel.

Rejected: Pexels `18649776` (sharpest and brightest, but a **Carhartt** logo sits
centrally on the father's shorts — unccroppable without destroying the frame);
`8623334`, `34133881`, `8170239` (beach/resort — swimwear, pool rings, cool cyan
water that fights the warm palette); `4971472` (mother and baby only — less
continuity); `35659773`, `36703216` (too dark to be an improvement).

### Tint floor — measured, and a correction to the previous entry

Re-measured **against the real composited pixels** (the graded photo drawn to a
canvas with the exact `.cover-photo` CSS filter, sampled through the veil and
card tint at every parallax position). Two independent methods agree.

**The previously recorded α0.19 / "worst 4.77:1" does not reproduce.** At α0.19
the retired image measures **card desc 2.48:1** (needs 4.5) and the closing line
**2.88:1** (needs 3) — the section was shipping below AA. The floor for white
card text is **α≈0.47 even on the old dark photo**; α0.19 was never sufficient.

Shipped values, all eight elements passing:

- `.cover-card` tint **rgba(13,27,42,0.60)** (hover 0.66)
- `.cover-veil` bottom ramp raised to **0.32 @70% · 0.58 @82% · 0.82 @100%** so
  the 52px closing line clears large-text AA over the bright dry grass.

| element | ratio | needs |
|---|---|---|
| eyebrow (gold 10px) | 5.18 | 4.5 |
| heading (white 34px) | 9.71 | 3 |
| subhead (white 15px) | 5.90 | 4.5 |
| card eyebrow (11px) | 6.16 | 4.5 |
| card name (31px) | 5.03 | 3 |
| card desc (16px) | **4.91** | 4.5 |
| card cta (12px) | 7.66 | 4.5 |
| closing line (52px) | 3.91 | 3 |

Note the inverse relationship: **a brighter photograph requires a heavier card
tint**, not a lighter one, because the card text is white. The section still
reads far brighter than before — the tint only covers the three card footprints,
while the photograph between and around them is the full 2.2×-brighter frame. A
cream-glass card with navy text was measured as the alternative and needs
α0.55 for the same AA, so it buys no extra transparency.

## Coverage — full-bleed parallax photograph (retired)

`coverage-family-five.jpg` — **Pexels photo `30221605`**, "Charming family of five
enjoying a sunset in Long Creek, SC" — a sharp, premium portrait of parents with
three young children standing in an autumn-gold field with mountains behind, by
**Daniel & Hannah Snipes**. Source: https://www.pexels.com/photo/30221605/.
**Pexels License**, free for commercial use. Re-downloaded at 1920px, no edits.

Chosen as a clear **family with children** (the prior frame read as a couple) that
is both sharp/premium and the **most tonally even** of the candidates — its card
region measured the flattest of all (horizontal swing 0.021, **0.2% hot**, dark
mid-tone), which is what keeps the tint low. Full-bleed parallax background of the
Coverage section, travelling ≈460px as it scrolls. Lightly warm-graded
(`.cover-photo`, `sepia 0.12 saturate 1.1 brightness 0.94 contrast 1.05`) to pull
the cooler sky toward the palette; a navy `.cover-veil` darkens the top/bottom
edges so the white heading and closing statement clear AA over the photograph.

> **⚠ SUPERSEDED — this measurement did not reproduce.** Re-measured against the
> real composited pixels, this image at α0.19 gives card body text **2.48:1**
> (needs 4.5) and the closing line **2.88:1** (needs 3). The α0.17/α0.19 figures
> below are wrong; the true floor for white card text is ≈**α0.47** even on this
> dark frame. See the active "What we do" entry above for the corrected method
> and shipped values. Kept only as a record of what was previously believed.

**Card transparency floor**, measured **across the full parallax travel** (the
background moves behind the cards, so brighter frames scroll through — the honest
constraint): **α0.17** was the last value where all white card text held ≥4.5:1 at
every scroll position (worst 4.62:1); landed one step up at **α0.19** (worst
element, IUL desc, 4.77:1). At rest alone the frame is even enough for ~0.03, but
the moving background sets the real floor. The reference uses a *light* 5% beige
tint (white text — does not clear AA); ours is a *navy* tint, so the numbers
aren't directly comparable, but **α0.19 keeps the photograph clearly readable
through the glass**.

## Why Synergy — reasons-to-choose row photographs

Eight alternating image/text rows. **Five are Synergy's own team photos**, pulled
from https://fflsynergy.com/gallery (their genuine assets — team, leadership,
office), with the **Synergy logo watermark cropped off the bottom band** and a
shared warm grade (`.why-photo`, `sepia 0.14 saturate 1.06 contrast 1.02`).

- `why-g10.jpg` / `why-g1.jpg` / `why-g12.jpg` / `why-g3.jpg` / `why-g11.jpg` —
  gallery g10, g1, g12, g3, g11 (team of five; team of three; a leadership pair
  on a wood-slat wall; the full team at a dinner; an advisor presenting).
  Source: fflsynergy.com/gallery, © Synergy Insurance Group.

**Every gallery image was checked for third-party branding.** Excluded: **g5**
(a competitor, *Checkmate Financial Group*, on a screen), **g6** ("Checkmate TV"
on an AirPlay dialog), **g7** and **g13** (an *AlphaMed Solutions* banner/sign),
and **g9** (consumer product branding + low quality).

The remaining **three rows use matched commercial stock** (Pexels License) for
the family/community reasons, where a real family reads better than an office
photo:
- `why-itin.jpg` — **Pexels `5082949`**, a warm multicultural family of four, by
  **Vanessa Loring**. https://www.pexels.com/photo/5082949/ (ITIN row)
- `why-bilingual.jpg` — **gallery `g8`** ("Leadership presentation"), Synergy's
  leaders speaking to the team, mic in hand. Source: fflsynergy.com/gallery,
  © Synergy Insurance Group. **Cropped** to 16:9 (`x0–1206 · y400–1078` of the
  1206×1779 frame) — the two speakers framed, the Synergy watermark (bottom
  band) cropped off. **Replaced** Pexels `7642122` (stock advisory consultation)
  — a genuine Synergy advisor speaking beats matched stock for the
  English & Spanish row.
- `why-overlooked.jpg` — **gallery `g4`** ("Orlando office floor"), the full
  Synergy floor at work. Source: fflsynergy.com/gallery, © Synergy Insurance
  Group. **Cropped** to 16:9 (`x300–1180 · y280–775` of the 1620×1080 frame) to
  exclude the Synergy watermark shield (bottom-right) **and** an incidental
  **LG** mark on a monitor at far left — no third-party branding ships.
  **Replaced** Pexels `5973961` (the workshop craftsman) — the whole operation
  working for overlooked families, and a genuine Synergy asset.

Earlier picks for these two rows, retired in order: Pexels `8260452`
(mother/daughter, cold grey kitchen — generic affection, cool tones) and
`7642122` (stock consultation) for the bilingual row; Pexels `8487397` (neon
hi-vis worker — page's most saturated element, read as one trade) and `5973961`
(workshop craftsman, dropped for a **Marshall** amp on the shelf requiring a
crop, then superseded by the genuine gallery asset) for the overlooked row.

## Testimonials — full-bleed parallax background (active)

`testimonials-family-sofa.jpg` — **Pexels `7415061`**, "Smiling family enjoying
quality time on the sofa in their new home".
https://www.pexels.com/photo/a-family-sitting-on-a-couch-7415061/
**Pexels License** — *"All photos and videos on Pexels are free to use."* /
*"Attribution is not required."*

Native **5938×3959**; shipped at **3840×2560, 596 KB**. 3840 is the largest entry
in next/image's `deviceSizes`, so no viewport/DPR combination can request a wider
derivative — **nothing is upscaled at any size**, which matters more than usual
because a parallax crops and scales rather than fitting.

A family of three on a sofa with moving boxes still stacked behind them —
bright, warm, and about as on-theme as stock gets for protecting a home.

### THE THING THAT ACTUALLY GOVERNS THIS IMAGE: the safe band

Two backgrounds were rejected here for the same reason and it is worth writing
down properly, because it is not obvious and `object-position` cannot fix it.

The section shows a window into a wrapper taller than itself, and **the window
slides as you scroll**. So the only band of the photograph guaranteed to be
visible at *every* scroll position — the only band where a face cannot be
bisected by the section edge — is the intersection of the two extremes:

| wrapper | travel | safe band of source height | width | bg travel |
|---|---|---|---|---|
| 160% | ±16% | 34.8%–65.3% | 30.5% | 51.2% of H |
| 140% | ±12% | 26.3%–73.7% | 47.4% | 33.6% of H |
| **130%** | **±10%** | **21.5%–78.5%** | **56.9%** | **26.0% of H** |
| 120% | ±7% | 15.3%–84.7% | 69.3% | 16.8% of H |

At the original 160/16 that band is 30.5% of the frame, and **essentially all
family photography fails it** — people sit in the upper third of a sofa shot.
Pexels `9220876` and `3875142` were both decapitated at one end of the travel
(verified by rendering p=0 / 0.5 / 1: at 1280 p0 the parents of 3875142 lose
their heads at the section's top edge).

So the parallax was reduced to **wrapper 130% / travel ±10%**, widening the band
to 56.9%. This photograph's faces sit at **26%–48%**, inside it with ~4.5 points
of margin at the top. Background still travels 26% of the section height.
Coverage keeps 160/16 — the reduction is local to this section, passed through
`useParallax`'s `from`/`to`.

**`object-position` is `center`, and its vertical half is a no-op by
construction.** The wrapper is taller in aspect than the 3:2 photograph at every
width (1280 → 1280×763, 890 → 890×1357, 390 → 390×1405), so `cover` fits by
height and crops width; the full frame height always maps to the wrapper. There
is nothing vertical left to position, which is precisely why the band arithmetic
above is the governing constraint. Horizontally 50% *is* a choice: on phone only
~19% of the width is visible, and centre lands on the father-and-son look.

### Verified across the scroll range

Rendered at p=0, 0.5 and 1 for 1280 / 890 / 390 — nine frames, source rows and
visible width recorded for each. **No face clipped at any position or width.**
On phone the mother falls outside the 19% slice entirely; she is out of frame,
not cut.

### Luminance — candidates

| candidate | native | mean | p95 | hot >0.85 |
|---|---|---|---|---|
| **7415061** — family of three, new home | 5938×3959 | **0.420** | 0.956 | 12.3% |
| 7943706 — mother and daughter laughing | 6000×4000 | 0.471 | 0.839 | 4.4% |
| 8055079 — family of three, art wall | 6000×4000 | 0.451 | 0.745 | 0.3% |
| 7114420 — family of five on a sofa | 5472×3648 | 0.341 | 0.747 | 0.6% |
| 4307954 — couple on a sofa | 6000×4000 | 0.327 | 0.975 | 7.5% |
| 4474015 — mother and children, TV | 5800×3867 | 0.328 | 0.663 | 0.2% |
| *3875142 (retired — faces clipped)* | 5760×3840 | *0.523* | *0.958* | *13.2%* |
| *9220876 (retired — too dark)* | 6000×4000 | *0.088* | *0.442* | *1.5%* |

`8055079` was the only candidate that survives the *original* 160/16 band
without reducing travel — every face inside 34.8%–65.3%, and the cleanest frame
of the set at 0.3% hot. It was rejected on editorial grounds: the family reads
bored, which is the wrong expression under "What Our Clients Say". `7114420` is
warmer still but its faces sit at 15%–30%, outside every band above ±7%.

### Scrim and card tint — derived across the parallax travel

Composite rebuilt per pixel — the `.ts-photo` CSS filter formulas, then the
scrim, then (for card text) a real 12px Gaussian for the card's
`backdrop-filter`, then the card tint — sampled at **15 scroll positions × 3
widths**, taking the brightest pixel found under each text box at any position.
Geometry: the travelling layer is `top:-30%; height:160%` and runs
`yPercent -16 → +16`, so the visible window slides across the middle 62.5% of it.

**The flat veil is gone.** A flat value heavy enough to carry the header would
have dimmed the whole frame, defeating the point of a bright photograph.
Replaced by a **top-anchored gradient that clears completely by 35%** of the
section — before the cards begin at every width — so the photograph is bare and
at full brightness exactly where it is meant to show: *around* the cards.

    .ts-veil  0.70 @0% · 0.66 @16% · 0.45 @22% · 0.24 @27% · 0.09 @31% · 0 @35%

The plateau has to hold to 16% because the **disclaimer is the lowest header box
and sets the phone case**; an earlier shape that fell from 10% measured 4.43:1
there against a 4.5 requirement.

Peak came **down** from 0.76 to 0.70 when the travel was reduced to ±10%: a
shorter travel sweeps less of the photograph's blown highlight through the
header band, so less scrim buys the same ratio. 0.58 was tested and fails
(3.79:1 at tablet); 0.66 passes but leaves only +0.40 there. Monotonic, no
segment steeper than 0.21 per 5% of height, ending at `transparent` rather than
a step — no band, no edge.

**Card `rgba(13,27,42,0.66)`** — heavier than reyou's 0.50 and heavier than the
0.62 floor the measurement returned (4.78:1 at laptop). Card text sits on the
*bare* photograph, since the scrim has cleared before the cards start, so the
tint carries all of it alone. The floor left +0.28 of margin; 0.66 leaves ~+1.0
and costs only visibility *through* the cards, which is not where the photograph
is supposed to show.

| viewport | eyebrow / heading / disclaimer | needs | card attribution | card quote | needs |
|---|---|---|---|---|---|
| phone 390 | 6.18 | 4.5 (20px) | 6.31 | 6.31 | 4.5 |
| tablet 890 | 5.61 | 4.5 (20.6px) | 6.25 | 6.25 | 4.5 |
| laptop 1280 | **4.20** | 3 (29.7px) | **5.45** | 5.45 | 4.5 |

All three header elements sit directly on the photograph with no card behind
them, so they share the header figure — it is the worst pixel under any of the
three boxes. Heading thresholds differ by width because the fluid size crosses
24px between tablet and laptop: below it the heading is normal text at 4.5, above
it large text at 3.

### Cards

Pulled in from the first build so the photograph reads around them: each still
occupies its 4-of-12 track at xl, but `px-4` insets the card inside that track,
taking the visible gutter from 32 → **64px** and the outer edges to 48. At md the
centred stack dropped from 8 of 12 columns to **6** (530 → 390px), which is where
most of the extra photograph comes from on tablet. Card padding **24**, not
reyou's 32. The 64px gap between attribution and quote is theirs, unchanged, as
is the order — attribution first.

### Parallax

Shared with the Coverage section through `components/useParallax.ts` — one tween,
not two implementations: `gsap.fromTo(bg, {yPercent:-16}, {yPercent:16,
ease:"none", scrollTrigger:{trigger:section, start:"top bottom",
end:"bottom top", scrub:true}})`, over the global Lenis instance that
`SmoothScroll` drives off the GSAP ticker.

These are **our** numbers, kept deliberately over reyou's: they run
`yPercent -35 → 0` with `scrub: 2` (a two-second lag); ours is symmetric ±16 at
`scrub: true`, locked to scroll position. Coverage's feel was the target.

Measured at 1536 through the section transit: **median frame 16.7 ms, p99
16.9 ms, zero frames over 33 ms, zero long tasks.** No layout is read in the
scroll path — no `getBoundingClientRect`, `offsetTop` or `getComputedStyle` in
the hook or either section; ScrollTrigger measures on creation and refresh only,
so the scroll path is write-only and cannot force synchronous layout.

Under `prefers-reduced-motion` the hook returns **before importing GSAP at all** —
no tween, no ScrollTrigger, background static at its CSS position. It is not a
slower parallax; there is none.

### The testimonials themselves

All three are reproduced **verbatim** from fflsynergy.com's "What Our Clients
Say" (homepage; each string occurs exactly once in the whole site bundle, so
they appear nowhere else). Spanish is the **client's own published translation**,
not ours — quotes are never translated in-house.

Two fragments overlap checkmatefinancialgroup.com — "They made it simple," in
Mark's quote, and "every option" in Brian & Jessica's — and ship **unchanged**.
The rewrite rule covers copy we author; it never applies to a quotation
attributed to a named person. Rewording a testimonial to dodge a phrase
collision is the falsification the rule exists to prevent.

Not used: **Maria G., Carlos R., Jennifer M.** from the original brief. Zero
occurrences anywhere on fflsynergy. Checkmate's own testimonial block carries the
line *"Reviews are illustrative samples pending publication of verified Google
reviews"* beneath three ★★★★★ quotes badged "Verified Google Review", which is
the likely origin.

Open item (not a blocker): the client has confirmed verbally that Michael &
Laura Adams, Brian & Jessica Williams and Mark are real clients; written
confirmation is being obtained for the record.

### The header row, and the two strings that are not ours

The row is reyou's three-part header: eyebrow cols 1–2, heading cols 3–7,
disclaimer cols 10–12 hard right, all three cap-band aligned on one centre line
(`items-center` over `cap-trim`, the same mechanism as Where to Start). Verified
at 0.00px delta between all three.

**`testimonials.disclaimer` is a PLACEHOLDER and must not ship.** It is a legal
results-disclaimer on a US insurance site, so the wording comes from the client —
not composed here, and not adapted from reyou's "*individual experiences vary".
Hand the final line over as `testimonials.disclaimer` in `messages/en.json` with
its mirror in `es.json`; nothing else needs to change.

`testimonials.eyebrow` is also a placeholder pending approval of a short line
sourced from fflsynergy's own language.

Note the placeholder disclaimer currently wraps to two lines, which makes the
header row 31.6px instead of 24.5px and centres the heading 3.5px lower than the
padding edge. A one-line disclaimer returns the row to exactly 80px from the
section top and 64px above the cards.

## How It Works — three process photographs (active)

Built on reyou.life's "How to Get Started" layout: a 4:5 photo card with a
top-anchored translucent panel over it. **That layout dictates the photography.**
On reyou the subject sits in the bottom half of every frame and the top half is
empty sky, so the panel never covers anything. A first pass using Synergy's own
gallery failed for exactly this reason — those frames are shot with faces in the
upper and middle third, so the panel landed on three people's heads. Measured:
the panel bottom reaches **57–77%** of the card depending on width and language,
so any subject above ~75% gets covered.

The three below were chosen against that constraint first and everything else
second. All **Pexels License** (https://www.pexels.com/license/) — *"All photos
and videos on Pexels are free to use."* / *"Attribution is not required."*
Attribution recorded here as good practice.

| file | source | native | crop (exactly 4:5) | subject head |
|---|---|---|---|---|
| `process-01-consultation.jpg` | Pexels `33665702`, **Alexander Mass** — "Mother and Daughter Walking in Meadow at Dusk" | 4160×6240 | `4160×5200 @ y0` → 1600×2000 | **79%** |
| `process-02-market.jpg` | Pexels `34471651`, **Lina Kucher** — "Family walks through tranquil countryside landscape" | 4160×6240 | `4160×5200 @ y0` → 1600×2000 | **82%** |
| `process-03-explained.jpg` | Pexels `9374830` — "Woman and a little girl holding hands on a field" | 3840×5760 | `3840×4800 @ y600` → 1600×2000 | **81%** |

Sources are 3840–4160px wide against a 1195px worst-case 2× request, so nothing
is upscaled at any viewport. Served at 1600px.

`34471651` was already in this repo as the retired `coverage-family-dusk.jpg`
("even but distant"). The distance that retired it from a full-bleed background
is precisely the quality wanted here — subject low, everything above it open.

**Crop, not object-position.** Each file is cut to exactly 4:5 and the card is
exactly 4:5, so `object-cover` shows the whole file and the framing **cannot**
shift with viewport width. `object-position` is left at `center` as a sub-pixel
guard only; the composition lives in the crop offsets above. This removes the
class of bug where a subject drifts under the panel at one breakpoint.

**Panel clearance, measured at rest in both locales** (panel bottom as a % of
card height vs. where the subject's head sits). Spanish runs longer, so it sets
the worst case:

| | phone 390 | tablet 890 | laptop 1280 | desktop 1536 |
|---|---|---|---|---|
| step 01 | 64.7 / **75.3** es | 35.8 | 61.5 / **66.5** es | 50.6 |
| step 02 | 70.0 / **75.3** es | 35.8 | 66.5 / **77.4** es | 55.6 |
| step 03 | 64.7 / 59.5 es | 32.3 | 57.3 | 51.4 |

Tightest margin in the whole matrix: **Spanish phone, step 01 — 3.7 points
(~16px)**. Positive everywhere; no face is overlapped at any width in either
language. The margin is thin rather than generous, and it is thin because
Spanish body copy runs ~10% longer than English — worth remembering before any
step's copy grows.

### Grade and tint — re-derived for these photographs

`.hiw-photo` = `sepia(0.16) saturate(1.06) brightness(0.94) contrast(1.03)`.
The three are the same register but not the same white balance (01 warm gold,
02 cooler green-teal, 03 pale daylight); this pulls them together without
reading as a filter.

Tint held at **rgba(13,27,42,0.62)**, unchanged. Counter to the usual rule
recorded above — *a brighter photograph needs a heavier tint* — these brighter
frames need **less** than the office interiors they replaced, because a dusk sky
is darker than a white-painted wall and a lit ceiling. Worst case improved from
**4.72:1 to 5.40:1** at the same alpha.

Measured by running the exact CSS filter formulas per pixel, then the 12px
blur, then the tint — in the order the browser composites them (element filter →
panel `backdrop-filter` → panel background) — and sampling **every pixel** of
the whole card inset 64px, so the number holds for both locales at any copy
length.

| viewport | card | step 01 | step 02 | step 03 | needs |
|---|---|---|---|---|---|
| phone 390 | 350×438 | 7.79 | 5.46 | 6.27 | 4.5 |
| tablet 890 | 530×663 | 7.67 | **5.40** | 5.80 | 4.5 |
| laptop 1280 | 379×474 | 7.76 | 5.43 | 6.23 | 4.5 |
| desktop 1536 | 464×580 | 7.68 | 5.42 | 5.89 | 3 / 4.5 |
| wide 1920 | 592×740 | 7.63 | **5.40** | 5.86 | 3 / 4.5 |

Text on the cream surface: eyebrow (gold-deep 11px) **5.16**, heading (ink)
**15.88**, step label + numeral (ink/70) **6.15**, gold dot **5.16**, hairline
rule **3.52** (raised from 0.75 opacity; at the original 0.45 it measured 1.99,
under the 3:1 non-text floor).

Pexels forbids implying endorsement by people appearing in its imagery, so the
alt text describes these as families outdoors — never as Synergy clients or
advisors.

## How It Works — the Synergy gallery crops (kept, not rendered)

The first pass at this section, cut from Synergy's own gallery and retained for
use elsewhere. Watermark removed by **cropping**, not painting — pulling the 4:5
window in slightly clears it with no retouching:

- `gallery-team-presentation.jpg` — gallery `g8`, 1100×1375 from `x53–1153 · y0–1375`
- `gallery-team-meeting.jpg` — gallery `g2`, 1000×1250 from `x40–1040 · y0–1250`
- `gallery-advisor-explaining.jpg` — gallery `g11`, 1000×1250 from `x40–1040 · y0–1250`

All © Synergy Insurance Group, from fflsynergy.com/gallery. Re-audited for
third-party branding at 3× on this pass; additional exclusions beyond the list
above: **g4** (an **LG** mark legible on a monitor bezel), **g10** (a **BALMAIN**
belt buckle) and **g12**/**g13** (a Gucci **GG** belt buckle). g10 and g12 remain
in the repo as `why-g10.jpg` / `why-g12.jpg`, referenced only from the
commented-out eight-row block in `WhySynergy.tsx` — they do not ship, but
uncommenting that block would ship them.

## How It Works — four process photographs (retired)

The "Four steps to your plan" section was deleted and replaced by Why Synergy;
these `howitworks-*.jpg` files remain in the repo but are not rendered.

- `howitworks-1-call.jpg` — **Pexels `8279761`**, RDNE Stock project.
- `howitworks-2-compare.jpg` — **Pexels `8296998`**, Mikhail Nilov.
- `howitworks-3-review.jpg` — **Pexels `36729961`**, Vitaly Gariev.
- `howitworks-4-covered.jpg` — **Pexels `8441826`**, Kampus Production.

## Two Ways In — card photographs

`two-families.jpg` — **Pexels photo `12788407`**, "A joyful family moment with
parents and child sitting together indoors," by **Mizuno K**. Source:
https://www.pexels.com/photo/12788407/.

`two-agents.jpg` — **Pexels photo `8439669`**, a young advisor and an older
client laughing over paperwork in a warm home setting, by **Kampus Production**.
Source: https://www.pexels.com/photo/8439669/.

Chosen as a matched pair — both warm indoor, soft natural window light, candid
genuine emotion, muted warm palette — so they read as one shoot. Each fills its
card behind a bottom-weighted navy scrim (`.tw-scrim`) so white text and gold
eyebrows clear AA while the photograph still reads clearly.

## Retired (kept in repo, not rendered)

- `coverage-family-hill.jpg` (Pexels `33325152`, Alexander Mass) — sharp
  golden-hour field portrait; read as a couple/pregnancy rather than a clear
  family with children, so replaced by the family-of-five above.
- `coverage-family-mist.jpg` (Pexels `35209929`, Jan Dvorak) — the foggy
  parent-and-child path; even but too soft/blurry, replaced by the sharp
  golden-field family above.
- `coverage-family-field.jpg` (Pexels `36612841`, Liliane Salles) — the golden
  wheat-field family; replaced when the Coverage section was rebuilt full-bleed
  on fog for a lower card tint.
- `coverage-path-field.jpg` (Pexels `10679180`, cottonbro studio) — lone figure
  on a dirt path through golden overcast wheat; a mis-identification of the
  requested frame, replaced by the family-in-wheat photo above.
- `coverage-mist-hills.jpg` (Pexels `33175695`, Zetong Li) — golden misty-hills
  sunrise; briefly restored during the same search.
- `coverage-family-garden.jpg` (derived from Pexels `13197844`, Catalina
  Herrera) — the multigenerational golden-hour garden portrait.
- `coverage-family-dusk.jpg` (Pexels `34471651`, Lina Kucher) — the even but
  distant "family walking a trail at dusk" landscape.
- `coverage-path-field.jpg` (Pexels `10679180`, cottonbro studio) and
  `coverage-wheat-warm.jpg` (Pexels `11091742`, Marina Leonova) — earlier
  single-figure section images.
- `term-life-young-family.jpg`, `iul-midlife-couple.jpg`,
  `tax-free-self-employed.jpg`, `final-expense-senior-couple.jpg` — Unsplash
  placeholders from an early per-card design.

## Removed

`69ba93704c1b501dddeab133_treatments_section.jpg` — the reyou.life licensed
asset. Used **only** as a visual reference and deleted from `public/`; it must
never ship on a client's commercial site under any filename.

## Consultation — full-bleed parallax photograph (active)

`consultation-family-walk.jpg` — **Pexels photo `18689100`**, "Parents Leading
their Little Son by Hands", by **vkmoraesPH**. A father, mother and toddler
walking away hand in hand through dry scrubland at golden hour, backs to camera.
Source: https://www.pexels.com/photo/18689100/. **Pexels License**
(https://www.pexels.com/license/) — the exact terms, quoted: *"All photos and
videos on Pexels are free to use."* and *"Attribution is not required."*
Downloaded at **5184×3456** (17.9 MP), no edits, no grade. Attribution recorded
here as good practice only.

Nothing upscales: a 1920 viewport at 2× DPR asks for 3840px and the source is
5184px wide.

### The constraint that actually chose this image: the parallax safe band

The background box is taller than the section and slides, so the *visible* slice
of the source changes with scroll. Only the intersection of the extreme slices
is on screen at every scroll position, and any subject must live inside it:

    Coverage pairing   top-[-30%] h-[160%] ±16   safe band 34.8%–65.3%  (30.5%)
    Testimonials pair  top-[-15%] h-[130%] ±10   safe band 21.5%–78.5%  (56.9%)

**This section uses the Testimonials pairing, and that is not a style choice.**
Under the Coverage pairing every human-subject photograph tested cropped a head
at one extreme or both — 23 frames, no survivors. A 30.5% band is narrower than
any ordinary photograph of people. Four building frames did pass, and were
rejected on the grounds that removing the people to solve a framing problem is
not solving it.

Cover slack is **0.040 Hs** at each extreme under the shallow pairing — checked,
the box never uncovers.

Head positions in this frame: father 53%, mother 50%, toddler 66% — all far
below the 21.5% edge, verified by rendering the object-cover crop at 1440 / 768 /
390 at scroll start, middle and end. At scroll **end** the crop lands at
mid-thigh (desktop, phone) and knee-to-calf (tablet). That was inspected rather
than assumed: it reads as a deliberate tighter framing, not an accident — one
straight edge across three figures mid-stride, cutting body mass rather than an
extremity.

Rejected on the same test: `32147474` (family of four on a dusty road — clears
by ~6px on screen, which is not headroom), `11217104`, `29345277`, `27954351`,
`4894877`, `3932687`, `32250332` (heads cropped), `4452217` (panel edge slices a
face), `7642014` (8.6% blown pixels behind the glass), `23224994`, `16665646`,
`5038716`, `18423188` (upscale).

### Panel tint — solved, not chosen

`.consult-glass` is navy `rgba(13,27,42,0.30)` + `backdrop-filter: blur(12px)`.
reyou's own panel is CREAM at α0.05; that lightens, and cannot carry text over
our photography — the same finding already recorded for `.hiw-glass`.

The alpha was solved against the real composite in the browser's own order:
object-cover into the 130% box → extract the window at a scroll position →
Gaussian blur σ12 → source-over the navy **in sRGB** → relative luminance →
contrast vs cream `#F8F4EE`. Sampled at three scroll positions × three widths,
worst pixel per element.

    α0.00  3.77:1  fail        α0.15  4.67:1  PASSES — the floor
    α0.05  4.04:1  fail        α0.30  5.85:1  shipped
    α0.10  4.34:1  fail

Shipped at double the floor: the worst case sits at scroll **start** where the
backdrop is brightest, so the extra alpha buys evenness across the travel rather
than headroom at one point; and every other translucent surface here ships above
its floor (`.cover-card` 0.17→0.19, `.ts-card` 0.62→0.66, `.hiw-glass`
0.61→0.62). It is still less than **half** of `.hiw-glass`'s 0.62, because this
photograph is genuinely dark where the panel sits — worst-case panel-region mean
luminance **0.072** across the whole travel, against 0.4–0.5 for the office
interiors that forced 0.62.

### WCAG AA — measured across the full travel

Per-line client rects read from the live DOM at each width (not element boxes,
not modelled), composited as above, worst pixel across all lines and all three
scroll positions. Text is cream `#F8F4EE` throughout.

| width | element | fg | bg (worst composited) | ratio | needs | worst at | |
|---|---|---|---|---|---|---|---|
| 1440 | paragraph (20px) | #F8F4EE | #58402F | **8.75** | 4.5 | start | pass |
| 1440 | CTA label (15px) | #F8F4EE | #563F2E | **8.97** | 4.5 | start | pass |
| 1440 | arrow stroke | #F8F4EE | #584130 | **8.68** | 3.0 | mid | pass |
| 1440 | headline (34px) | #F8F4EE | #634630 | **7.84** | 3.0 | start | pass |
| 768 | paragraph (17.6px) | #F8F4EE | #524F5F | **7.26** | 4.5 | start | pass |
| 768 | CTA label (15px) | #F8F4EE | #51526A | **6.91** | 4.5 | mid | pass |
| 768 | arrow stroke | #F8F4EE | #605860 | **6.28** | 3.0 | start | pass |
| 768 | headline (25.7px) | #F8F4EE | #634734 | **7.71** | 3.0 | start | pass |
| 390 | paragraph (16.2px) | #F8F4EE | #5B5661 | **6.50** | 4.5 | start | pass |
| 390 | CTA label (14px) | #F8F4EE | #5B5257 | **6.89** | 4.5 | mid | pass |
| 390 | arrow stroke | #F8F4EE | #7D5B46 | **5.52** | 3.0 | start | pass |
| 390 | headline (21px) | #F8F4EE | #5A525B | **6.84** | **4.5** | end | pass |

Tightest is the paragraph at 390: **6.50 against 4.5**, a 1.45× margin.

The headline threshold is **not** 3:1 at every width. It is fluid, so it is
large text (≥24px) at 1440 and 768 and drops to 21px on phone, where it becomes
normal text and needs 4.5:1. It clears at 6.84.

No gold `#C9A84C` appears as text anywhere in this section. The CTA hover and
the focus ring use **gold-pale `#EFE1B0`** (L 0.752), which measures 5.2:1
against the worst panel composite — over the 3:1 a focus indicator needs.

### One thing the AA table deliberately over-tests

The section is currently the LAST element on the page and there is no footer, so
its bottom can never reach the viewport top. Measured live: the tween reaches
**yPercent +0.7 of a possible +10 — 53.5% of its range** — at maximum scroll.
The table above was measured across the FULL ±10 travel, including positions no
visitor can currently reach, so it stays valid unchanged the moment a footer is
added below.

---

# About page — `/[locale]/about`

Three images. One is Synergy's own; two are licensed stock, and one of those is
explicitly a placeholder.

## §1 Hero — `about-hero-family.jpg` 🟡 PLACEHOLDER

**Pexels photo `5638414`** — a multi-generational family posed together in warm
late light while an out-of-focus figure in the left foreground photographs them.
Source: https://www.pexels.com/photo/5638414/. **Pexels License** — exact
licence line: *"All photos and videos on Pexels are free to use."* /
*"Attribution is not required."* No attribution required; recorded here as good
practice.

Source **8224 × 5483 (45.1 MP)**, held at **3840 × 2560** — the largest
derivative `next/image` will ever request, which is a full-bleed slot on a 1920
viewport at 2× DPR. Nothing upscales at any width. No edits, no grade.

Checked clean of third-party branding at full size. Faces verified by rendering
at all three widths: all six clear every edge, and none collide with the copy
block.

Chosen from four measured candidates. Luminance was sampled **only in the
rectangle the h1 and sub occupy**, not over the whole frame:

| | ID | pixels | MP | copy-region mean | p99 |
|---|---|---|---|---|---|
| A | 5638613 | 6000 × 4000 | 24.0 | 0.081 | 0.344 |
| **B** | **5638414** | **8224 × 5483** | **45.1** | 0.096 | 0.582 |
| C | 7799613 | 4461 × 2978 | 13.3 | 0.076 | 0.240 |
| D | 5591277 | 5743 × 3829 | 22.0 | 0.232 | 0.569 |

B on two grounds: at 45.1 MP it never softens at any viewport, and the
out-of-focus foreground figure sits exactly where the copy block lands, so the
copy has a quiet region to sit on that is part of the photograph rather than
something the scrim has to manufacture.

Rejected: `27520972` (15.2% blown pixels behind the copy), `5888407`,
`5591173`, `11459334`.

**🟡 It is a placeholder for Synergy's own photography.** Ziad still owes
original camera files; when they arrive this hero is swapped and nothing else
on the page changes. A contained hero was NOT built as a workaround — an honest
full-bleed option exists today.

**Deliberate: family imagery, not a team photo.** Under an h1 reading "We Are
Synergy" a family reads as *who we protect*, which is true. A team photo of
strangers would read as *Synergy's staff*, which would be false — and would
have to be Synergy's own people.

### Hero legibility — measured on the real composite

Ground truth: the JPEG mapped through the same object-cover arithmetic the
browser uses at each viewport, `.about-hero-scrim` composited as a real per-row
alpha fill in sRGB, then **every pixel** of each text box sampled. Text boxes
read off the built page with `getBoundingClientRect`, not estimated. Worst
pixel, not mean.

**There is no `.hero-veil-top` on this hero.** The homepage needs one because
`SiteHeader` is transparent at the top of the locale root; `/about` is not the
hero route, so the bar is opaque `#0D1B2A` from scroll 0 (nav links 15.87:1 on
a flat fill) and a second graduated veil would darken 300px of photograph for
nobody.

| scrim peak | h1 worst | sub worst | |
|---|---|---|---|
| none | 1.49 | 1.39 | fails |
| 0.55 | 4.58 | 4.83 | passes, sub has only +0.33 at tablet |
| **0.60** | **4.43** | **5.51** | **shipped** |
| 0.72 | 5.87 | 7.78 | buys nothing, costs the photograph |

Per viewport at the shipped 0.60:

| viewport | h1 (needs 3.0) | sub (needs 4.5) |
|---|---|---|
| 1425 × 900 | **4.43** | **5.51** |
| 753 × 1024 | 5.39 | 5.56 |
| 390 × 844 | 5.34 | 5.56 |

The scrim is anchored to the bottom edge, monotonic, fully clear by 30% of the
section, and held flat from 72% down so no vertical gradient crosses the last
line of the sub-headline. Steepest segment 0.20 per 10% of height — no band,
no edge, and it never reaches the faces, which sit in the upper half at every
width.

## §2 Our Story — `gallery-advisor-explaining.jpg` (Synergy's own)

Already in the repo. A Synergy advisor with a microphone gesturing at a
presentation slide headed "Hone Your Skills & Knowledge". Checked clean of
third-party branding at full size.

**1000 × 1250**, i.e. safe to a **500px CSS box at 2× DPR**. The image column is
capped at exactly 500px for that reason — it is a resolution budget, not a
taste call, and a wider column would upscale Synergy's own photograph. It could
not carry a full-bleed slot at any width; this is the one contained slot on the
page and it is where Synergy's own imagery belongs.

## §7 Image zoom — `about-zoom.jpg`

**Pexels photo `36777966`** — a stone-and-shingle family house at dusk, every
window lit, shot through tall pines. Source:
https://www.pexels.com/photo/36777966/. **Pexels License**, same licence line as
above.

Source **8000 × 5338 (42.7 MP)**, held at **3840 × 2562**. The element is one
viewport wide at scale 1.0 and never wider, so 3840 covers a 1920 viewport at
2× DPR with nothing to upscale — and at scale 0.5 it is being downscaled 2×,
which is where the frame is sharpest.

| | ID | pixels | MP | frame mean L | |
|---|---|---|---|---|---|
| **E** | **36777966** | 8000 × 5338 | 42.7 | **0.100** | shipped |
| F | 4933643 | 6016 × 4016 | 24.2 | 0.219 | |
| G | 36777965 | 8000 × 5338 | 42.7 | 0.154 | |
| H | 9592437 | 5031 × 3354 | 16.9 | 0.053 | |

Two measured reasons for E:

1. **No people.** The scale runs 0.5 → 1.0, so the visible crop changes
   continuously through the whole section. A frame with faces has to be
   verified at every intermediate scale and any face near an edge fails at one
   end of the run. With no people the failure mode does not exist. All four
   candidates share this; E is not special here.
2. **Frame mean L 0.100**, sitting just above the gradient's top value
   (`#1C3A5A`, L 0.0401). That is what makes the half-scale card read as a
   **lift out of the page rather than a hole punched in it** — a darker frame
   at scale 0.5 would look like a gap. H (L 0.053) is the one that would.

No copy sits on this image in the reference or in ours, so there is no contrast
threshold to meet. Checked clean of third-party branding at full size.

## §8 Staff — 🔴 no image, and none may be sourced

The section is commented out in `app/[locale]/about/page.tsx`. A stock portrait
presented as Synergy's founder would be a fabrication, not a placeholder.
Awaiting a real portrait of Rula AlAryan from Ziad.

---

## §4 Built on Trust — the pair (equal size + offset)

`gallery-team-meeting.jpg` (1000×1250) and `gallery-team-presentation.jpg`
(1100×1375) — both Synergy's own, both checked clean of third-party branding at
full size.

Rendered **437 × 562 each, identical**, with the second offset down **131.2px**
and a **32.8px** gap. At the widest container each column is 448 CSS → **896 ×
1153 at 2× DPR**; cropped to the box ratio 0.7775 the sources give **972 × 1250**
and **1069 × 1375**. Both clear with margin.

⚠️ **Equal-size-plus-offset is a deliberate deviation from the reference**, made
on instruction after being reported. Re-measured live at 1536 and 820:

| viewport | SEM left | SEM right | margin-top | transform |
|---|---|---|---|---|
| 1536 | 376 × 564 @ y2994 | 501 × 564 @ y2994 | 0 / 0 | none / none |
| 820 | 354 × 530 @ y3515 | 354 × 530 @ y3515 | 0 / 0 | none / none |

Theirs differ in **width** at desktop, are **identical** at tablet, and the tops
are **flush at both**. The staggered offset on that page belongs to §5. The
numbers used here are still theirs: the pair keeps SEM's total image span
(376 + 32.8 + 501 = 909.8 of 1444) and their 32.8 gap, split evenly; the 131.2px
offset is SEM's own offset unit from §5.

## 🔴 Two more exclusions from the vetted list

Found on inspection at full size, both previously listed as usable:

- **`why-g10.jpg`** — **Balmain** belt buckle, centre frame.
- **`why-g12.jpg`** — **Gucci GG** belt buckle, centre frame.

Both are disqualified under the third-party-branding rule. That leaves Synergy
with exactly **three** portrait-capable frames — `gallery-advisor-explaining`,
`-team-meeting`, `-team-presentation` — all three consumed by §2 and §4, where
each is the only asset that clears its slot.

## §5 What We Stand For — three portraits 🟡 PROVISIONAL

Synergy's own material could not fill this section at the resolution its columns
need (see above), so these are licensed stock, **wired pending approval**, one
line each to swap in `VALUE_IMAGES` in `app/[locale]/about/page.tsx`.

All **Pexels License** — exact licence line: *"All photos and videos on Pexels
are free to use."* / *"Attribution is not required."* Each downloaded at 2400px
and stored at **1200 × 1800** against the **809 × 1214** the column needs at 2×
DPR on the widest container — 48% headroom.

| slot | file | Pexels ID | source | frame mean L |
|---|---|---|---|---|
| I Integrity | `value-integrity.jpg` | `6814528` | 2400 × 3600 | 0.233 |
| II Education | `value-education.jpg` | `8439647` | 2400 × 3595 | 0.289 |
| III Legacy | `value-legacy.jpg` | `8317698` | 2400 × 3600 | 0.597 |

Candidates measured and rejected: Integrity — `8441789` (L 0.455), `8470806`
(0.408), `7734593` (0.224). Education — `8204948` (0.430), `8439686` (0.429),
`8112157` (0.123). Legacy — `8769727` (0.144), `20191416` (0.434), `7086015`
(0.171).

**`20191416` was wired first and then replaced — it failed the parallax
face-check.** Rendered at the travel extremes, the woman's forehead is clipped
by the top edge at −10% and at rest. `7086015` fails the same way. `8317698` is
the only Legacy candidate whose faces sit fully inside the guaranteed band, and
it is the brightest of the set (L 0.597) — a bright card against a dark
gradient, which is a look to sign off rather than a defect. No text sits on it.

### Parallax — verified by rendering, not by reading source

Every image in §5 carries the site's shared scroll parallax via
`components/useParallax.ts` using the **Testimonials pairing** — a 130% layer
starting at −15%, travelling **±10** — chosen because its safe band is what
allows people in a parallax section at all.

Geometry reproduced exactly and checked at 1536 / 820 / 390:

| travel | source visible | edge exposed? |
|---|---|---|
| −10% | 21.5% – 98.5% | no |
| 0% | 11.5% – 88.5% | no |
| +10% | 1.5% – 78.5% | no |

**Safe band (visible at every position): 21.5% – 78.5% = 56.9% of source
height**, identical at all three widths (the box aspect is fixed, so the band is
width-independent). All three images were rendered at all three positions and
every face sits inside the band with headroom.

`scrub: 0.5` rather than the default locked scrub — derived from the reference's
own `smoothing: 50`. See the §5 note in `app/[locale]/about/page.tsx`.

---

## §4 — pair swapped, and both now carry parallax

The previous pair (`gallery-team-meeting` + `gallery-team-presentation`) was two
frames from the same moment in the same room and read as duplicates. Replaced
with two frames that share nothing:

| slot | file | pixels | subject |
|---|---|---|---|
| left | `howitworks-2-compare.jpg` | 1280 × 1920 | hands comparing paperwork at a desk — **no faces at all** |
| right | `consultation-family-walk.jpg` | 5184 × 3456 | a family walking a path at golden hour |

Both already in the repo and previously vetted for the homepage.

**Resolution now includes the parallax layer**, which is 130% of the box, so the
bar is the LAYER's size and not the box's: at the widest container the box is
448 × 577 CSS, the layer 448 × 749, i.e. **896 × 1498 at 2× DPR**. Cropped to
the layer's 0.598 aspect the sources give **1148 × 1920** and **2067 × 3456**.
Both clear it.

### Equal by construction, verified by rendering

Both boxes are `aspect-[0.7775]` on equal grid tracks, so width and height are
identical by construction. Measured on the rendered boxes across nine widths:

| viewport | box 1 | box 2 | equal | overflow |
|---|---|---|---|---|
| 1200 | 543.4 × 698.9 | 543.4 × 698.9 | ✅ | none |
| 1280 | 358.7 × 461.3 | 358.7 × 461.3 | ✅ | none |
| 1366 | 385.1 × 495.3 | 385.1 × 495.3 | ✅ | none |
| 1440 | 407.6 × 524.3 | 407.6 × 524.3 | ✅ | none |
| 1536 | 437 × 562 | 437 × 562 | ✅ | none |
| 1600–2560 | 448.8 × 577.2 | 448.8 × 577.2 | ✅ | none |

Offset 131.2px, gap 32.8px, image-block-to-copy 32px, copy column 499 — against
SEM's 33 / 33 / 501 measured the same day.

## §5 — column drift (a second, separate effect)

`AboutValueColumn` moves the WHOLE COLUMN; `AboutParallaxImage` moves the
photograph inside its frame. The reference has only the first.

Measured live on restaurantsem.com, then measured on ours:

| | SEM | ours |
|---|---|---|
| col 1 | drifts down | −76.9 → +76.9 ✅ |
| col 2 | **static at 0 throughout** | **0 throughout** ✅ |
| col 3 | drifts up | +76.9 → −76.9 ✅ |
| extremes | +225 / 0 / −233 px | ±76.9 px (shipped ±10 yPercent) |
| scrubbed | yes, `smoothing: 50` | yes, `scrub: 0.5` |
| opacity | **not animated** (1/1/1) | not animated |

Magnitude is the shipped ±10 rather than their ±225; only the SIGN varies per
column, and the middle column's 0 is their own measured value.

---

## §4 — Synergy's own photography (replaces the stock pair)

Both frames are the client's own, taken from **fflsynergy.com/gallery**:

| slot | file | source | original | stored |
|---|---|---|---|---|
| left | `gallery-leadership-panel.jpg` | `fflsynergy.com/gallery/g8.jpg` | 1206 × 1779 | **1206 × 1263** |
| right | `gallery-training-session.jpg` | `fflsynergy.com/gallery/g11.jpg` | 1080 × 1620 | **1080 × 1150** |

### The watermark

**Every image on fflsynergy's gallery page carries a large SYNERGY wordmark
across the lower ~29% of the frame.** The `why-` and `gallery-` files already in
this repo are the same photographs with that band cropped off, which is why they
are shorter than their originals (`why-g11` is 1080 × 1150 from a 1080 × 1620
source — exactly 71.0%). The two new files use the identical 71.0% crop, so the
watermark is gone and nothing else is altered. No recolouring, no retouching.

Both checked clean of third-party branding at full size.

### Different moments, same room

g8 is two advisors presenting with a screen behind them; g11 is a different
speaker at a different slide. Same Orlando training room — which is unavoidable.
**Synergy's entire usable gallery is that one room**, plus a team dinner and an
office floor, and both of those are landscape and far too small (596 × 766 after
the watermark crop against a 874 × 1124 requirement).

### 🔴 The parallax came off this pair, and it is a resolution decision

The rendered box is 437 × 562 at 1536, so the bar is **874 × 1124 at 2× DPR**.
A parallax layer is 130% of its box, which raises the bar to **874 × 1461**.
Measured on the watermark-free sources:

| candidate | box-crop | vs 874 × 1124 | layer-crop | vs 874 × 1461 |
|---|---|---|---|---|
| g8 leadership panel | 982 × 1263 | **PASS +12.4%** | 755 × 1263 | **FAIL −13.6%** |
| g11 training session | 894 × 1150 | **PASS +2.3%** | 688 × 1150 | **FAIL −21.3%** |
| g2 (same moment as g8) | 894 × 1150 | PASS +2.3% | 688 × 1150 | FAIL −21.3% |
| g1 / g3 / g4 landscape | 596 × 766 | FAIL −31.9% | 458 × 766 | FAIL −47.6% |

Synergy's own photography cannot carry a parallax in this slot without being
upscaled. "Large enough that nothing upscales" is a standing rule; the parallax
on this particular pair was one round old. The images won.

**To restore it:** swap the two `<Image>` tags for `<AboutParallaxImage>` and
accept a 14% / 21% upscale, or go back to licensed stock. §5's three images are
unaffected and keep their parallax.

### FadeUp stagger removed

The right-hand image was `index={1}`, which adds 80ms on a 600ms fade. On a pair
meant to read as one object that lag meant one image was fully painted while the
other was still at zero opacity for most of the reveal — the most likely cause of
the pair reading as mismatched mid-scroll. Both are `index={0}` now.


---

# /[locale]/services — "What We Protect"

Nine images. **All external.** Synergy's own vetted set is three photographs
wearing six filenames (see the About section above), all three already spent on
`/about` §2 and §4 — and a services page needs seven distinct product frames
plus a full-bleed hero and a break band.

All **Pexels License** — exact line: *"All photos and videos on Pexels are free
to use."* / *"Attribution is not required."* Attribution recorded here as good
practice only.

## Hero — `services-hero-family.jpg`

**Pexels `8841348`** — a father and his two sons talking on the deck of a
family home, a woman reading behind them.
Source: https://www.pexels.com/photo/8841348/
Native **8067 x 5378 (43.4 MP)**, held at **3840 x 2560** — the largest
derivative next/image will request. Nothing upscales at any width.

Chosen on copy-region luminance, sampled **only in the rectangle the h1 and sub
occupy**, not over the whole frame:

| | ID | pixels | MP | copy mean | p99 | hot >0.85 |
|---|---|---|---|---|---|---|
| A | 7678153 | 5845 x 3897 | 22.8 | **0.125** | 0.782 | 0.4% |
| **B** | **8841348** | **8067 x 5378** | **43.4** | 0.301 | 0.741 | **0.0%** |
| C | 5447197 | 7897 x 5264 | 41.6 | 0.290 | 0.781 | **0.0%** |
| D | 7819827 | 5472 x 3648 | 20.0 | 0.279 | 0.761 | 0.4% |

B on two grounds: **zero blown pixels** behind the copy, and 43.4 MP. A is
darker but has 0.4% blown, and blown highlights are the one defect a scrim
cannot fix — the scrim already carries 0.301, measured.

🔴 **Rejected, and why:**
- `8470833` — **24.2% blown pixels** behind the copy. Same failure as
  `27520972` on the About hero.
- `15077113` — **Nike swoosh centre-frame** plus "TRIBAL" on the shorts.
- `6185344` — darkest and cleanest of everything measured (0.061, 0% hot) but
  it is a **Hanukkah menorah scene**: a religious-specificity claim about the
  reader on a general services page.
- every `5638xxx` result — **the same shoot as the About hero** (`5638414`).
  A cross-page repeat in a different costume; the filename trap generalised.

## Break band — `services-break-dusk.jpg`

**Pexels `28201816`** — waterfront homes at dusk with their lights on, seen
across calm water. Source: https://www.pexels.com/photo/28201816/
Native **8192 x 5464 (44.8 MP)**, held at **3840 x 2560**.
Frame mean L **0.188**. No text sits on it, so there is no contrast threshold.

| | ID | pixels | MP | frame mean |
|---|---|---|---|---|
| E | 37453136 | 4239 x 2825 | 12.0 | 0.321 |
| **F** | **28201816** | **8192 x 5464** | **44.8** | **0.188** |
| G | 11002963 | 6000 x 4000 | 24.0 | 0.157 |
| H | 32772414 | 6000 x 4000 | 24.0 | 0.396 |

🔴 **Rejected:**
- `12551262` — **Pontiac** grille badge in the foreground and a **Ford** badge
  behind it, both confirmed by zooming to full size.
- `35005664` — legible German street signage (*"Strassenreinigung"*). Not a
  brand, but it places the photograph in Germany on a page for a Florida
  agency.
- `34463947` (-31%) and `17928839` (-1%, and square) on resolution.

## The seven product frames

The desktop swap column renders **476 x 557 CSS** (bar **952 x 1115 at 2x**),
but below the sticky breakpoint (≤1279) the frame renders INLINE and much larger
— up to **751 CSS at 820** (1502 @2x) and **1192 CSS at 1279** (2384 @2x). The
old files were stored at 1200 x 1405, which covered only the desktop bar and
upscaled on the inline layout. **The 2026-07-30 set is stored at 1600 x 1874**,
which clears every TESTED width (1536 / 820 / 390) with no upscaling; the natives
are far larger again. The 992–1279 inline band still exceeds 1600 (a pre-existing
property of the frame system, far worse under the old 1200 files); a 2600-wide
store would clear that too and every native here supports it — flagged, not done.

### 🟢 2026-07-30 — REAL TOPIC-MATCHED PHOTOGRAPHY (current)

Replaced the generic lifestyle stock (table below, files retained on disk) with
seven photographs each chosen to read as its actual product. **Pexels License**
throughout — *"Free to use." / "Attribution is not required."* — free for
commercial use, no attribution. Each was viewed at full size and cleared the
content rules: no illness / distress / grief / dereliction / scattered paperwork;
the Final Expense and Medicare seniors read **well and dignified**, never frail;
no stock handshake and no posed-on-a-lawn. Alt text describes only what the
photograph shows — no person is presented as a Synergy agent.

| slot | file | Pexels photo page | native | 2x clearance |
|---|---|---|---|---|
| Term Life | `service-term-life-family.jpg` | pexels.com/photo/…-33204381/ | 4160 x 6240 | crop 4160×4871 vs 1200×1405 store → **3.47x**, no upscale |
| Final Expense | `service-final-expense-senior.jpg` | pexels.com/photo/…-36792488/ | 4160 x 6240 | **3.47x** |
| Mortgage Protection | `service-mortgage-home.jpg` | pexels.com/photo/…-8962201/ | 3648 x 5472 | crop 3648×4272 → **3.04x** |
| IUL | `service-iul-couple.jpg` | pexels.com/photo/…-7328474/ | 3872 x 5808 | crop 3872×4534 → **3.23x** |
| Fixed Indexed Annuities | `service-annuities-couple.jpg` | pexels.com/photo/…-4894565/ | 3840 x 5760 | crop 3840×4496 → **3.20x** |
| Medicare | `service-medicare-active.jpg` | pexels.com/photo/…-7658788/ | 5105 x 3408 (landscape) | crop 2910×3408 → **2.43x** |
| Health | `service-health-kitchen.jpg` | pexels.com/photo/…-7705380/ | 4333 x 6500 | **3.61x** |

Subjects: young family at golden hour (term life); a silver-haired woman laughing
(final expense — dignity, not decline); a couple unlocking their front door with
move-in boxes (mortgage protection); an older couple with coffee at their home
(IUL — the comfortable future it funds); a settled retired couple outdoors
(annuities); an active senior harvesting vegetables (Medicare — well at 65+); a
family making dumplings together (health — everyday wellbeing).

Full photo-page URLs are in the git history of this commit's build report. The
Medicare native is landscape (5105 x 3408) — cropped to the 0.854 portrait it
still clears the 2x bar by 2.43x, so no upscaling; the other six are portrait
natives.

### PREVIOUS — generic lifestyle stock (replaced 2026-07-30, files kept for fallback)

| slot | file | Pexels ID | native | frame mean L |
|---|---|---|---|---|
| Term Life | `service-term-life.jpg` | `1648368` | 3456 x 5184 | 0.431 |
| Final Expense | `service-final-expense.jpg` | `6975091` | 4480 x 6720 | 0.350 |
| Mortgage Protection | `service-mortgage-protection.jpg` | `7641540` | 3827 x 5309 | 0.410 |
| IUL | `service-iul.jpg` | `8422729` | 3930 x 5887 | 0.211 |
| Fixed Indexed Annuities | `service-annuities.jpg` | `7477744` | 3858 x 5779 | 0.328 |
| Medicare | `service-medicare.jpg` | `12419277` | 3456 x 5184 | 0.218 |
| Health | `service-health.jpg` | `5410080` | 2920 x 4000 | 0.326 |

**Judged as a set, not one at a time.** Frame means run 0.211-0.431, so against
cream (0.9083) the set spans **3.67x to 1.99x**. That range is the point: the
`/about` §5 lesson was that a frame at 1.48x reads washed out and detached from
a row meant to look like three of a kind.

🔴 **Two picks were replaced during review, both for reasons worth recording:**

- `31152769` (Mortgage Protection) — a **LEGO Duplo** set centre-frame. Trade
  dress rather than a legible wordmark, so it sat on the line the Carhartt /
  Marshall / LG / Balmain exclusions drew; those were all *marks*. Cut anyway:
  LEGO trade dress is recognisable worldwide and the mark-versus-trade-dress
  distinction is not one worth defending on an insurance site. Replaced with
  `7641540`, checked clean at full size (the laptop lid carries no logo).
- `8871552` (Medicare) — frame mean **0.470**, only 1.84x from cream. The
  `value-legacy` problem again. Replaced with `12419277` at 0.218.

**Rejected for set incoherence:** `35858304` (grey studio backdrop — nothing
else on this site is studio), `4008802` and `8847446` (moody dark bedrooms;
8847446 at 0.078 would be the same defect inverted), `15092536` (shot through a
window grille), `35549384` (black and white), `17923325` (the subject is
holding a cigarette — wrong signal on an insurance page).

## §4 The mirrored essay — five photographs

🔴 **SYNERGY'S OWN SET CANNOT FILL THIS SECTION, AND THE REASON IS NOT TASTE.**
Audited by opening every file rather than reading its name. Synergy owns **five
distinct photographs**; **three are portrait-capable, and those three wear six
filenames**:

| photograph | filenames it wears | shows |
|---|---|---|
| gallery **g8** | `gallery-team-presentation` · `gallery-leadership-panel` · `why-bilingual` | two people presenting, woman on the mic |
| gallery **g11** | `gallery-advisor-explaining` · `gallery-training-session` · `why-g11` | advisor at the "Hone Your Skills & Knowledge" slide |
| gallery **g2** | `gallery-team-meeting` | different moment, same conference room |
| gallery g1 | `why-g1` | three women posed — **1620 × 766 landscape** |
| gallery g3 | `why-g3` | full team at a dinner — **1620 × 766 landscape** |

`gallery-leadership-panel` and `gallery-training-session` are the trap: they
read as two fresh assets and are re-crops of two photographs **already rendered
on /about**.

**None clears the box.** The frame maxes at 489 × 733.5, so the 2× DPR bar is
**978 × 1467**. Largest possible 2:3 crop from each:

| file | source | max 2:3 crop | vs 978 × 1467 |
|---|---|---|---|
| `gallery-team-presentation` | 1100 × 1375 | 917 × 1375 | 6.2% short |
| `gallery-leadership-panel` | 1206 × 1263 | 842 × 1263 | 13.9% short |
| `gallery-advisor-explaining` | 1000 × 1250 | 833 × 1250 | 14.8% short |
| `gallery-team-meeting` | 1000 × 1250 | 833 × 1250 | 14.8% short |
| `gallery-training-session` / `why-g11` | 1080 × 1150 | 767 × 1150 | 21.6% short |
| `why-g1` / `why-g3` | 1620 × 766 | 511 × 766 | 47.8% short |

Resolution is the second reason. **The first is that this is a SEQUENCE.** At
most three slots could be Synergy's, and those three are two crops of moments
already on /about plus one more from the same room. Five frames from one
afternoon in one conference room is a contact sheet, not a sequence — and it
would sit directly below §2, which is seven genuinely different photographs.

### The five, all Pexels License

Licence line, verbatim: *"All photos and videos on Pexels are free to use."* /
*"Attribution is not required."* Each fetched at full resolution, cropped to
**2 / 3**, written at **1600 × 2400** (1.63× headroom over the 2× DPR bar),
quality 86; the component re-encodes at `quality={78}`.

| slot | block | file | Pexels | source | crop | mean L |
|---|---|---|---|---|---|---|
| 1 | Tax-free is three different things | `essay-desk-evening.jpg` | `35462658` | 2268 × 4032 | **top-biased, y=0** | **0.126** |
| 2 | What a floor does, and what it does not | `essay-sea-horizon.jpg` | `29141332` | 3729 × 5594 | centre | **0.266** |
| 3 | A period, or a lifetime | `essay-facade-old-new.jpg` | `37136105` | 3820 × 5730 | centre | **0.219** |
| 4 | The medical exam column | `essay-waiting-chairs.jpg` | `21404971` | 4160 × 6240 | centre | **0.339** |
| 5 | When a balance becomes a payment | `essay-road-hills.jpg` | `38746397` | 4160 × 6240 | centre | **0.386** |

**Filenames describe the subject, not the slot** — deliberately, because a
slot-numbered name rots the moment the block order changes, and because the
`gallery-leadership-panel` mess above is what happens when a name stops
describing the file.

**Slot 1's crop is not centred.** Source is 2268 × 4032 and needed 630px
removed. Centre clipped the lamp; bottom-biased lost the papers. **y=0** keeps
the whole lamp, the candle, the cup, the pen and the full spread of papers.

**Third-party branding audited at full pixel resolution**, three to four
horizontal bands per frame — not thumbnails. All five clean. What that caught:
🔴 **`18530057` was the best luminance match for slot 1 at L 0.105 and is
DISQUALIFIED** — magazines on the desk carry legible **"Hayat"** mastheads,
plus a laptop in frame. Invisible at thumbnail size.

### Two frames were rejected on judgement, not numbers

- **`14201540`** (L 0.165) was the original slot 1 and is **not shipped**. It is
  technically the strongest slot-1 candidate for light quality and it is a
  **derelict** room — peeling paint, dust, a ruined desk. Under a block about
  what reaches your family after a death, that is the wrong note. Replaced on
  instruction with an intact, occupied room.
- **`12294063`** (L 0.319) was the original slot 2. Re-sourced darker to open
  the sequence's luminance spread.

### The luminance ladder, and why it stops where it does

Set band is **0.10–0.42** — the range the existing photographs occupy against
cream `#F8F4EE`. A lighter frame vanishes into the page; a darker one reads as
a hole. Target was no two frames within **0.06**.

Shipped ladder, measured on the written files: **0.126 / 0.219 / 0.266 / 0.339
/ 0.386**. Adjacent gaps **0.093 / 0.047 / 0.073 / 0.047**. Minimum gap 0.047,
span 0.260 — against 0.019 and 0.221 for the first-pass set.

🟡 **The 0.06 rule fails on two adjacent pairs and cannot be fixed by
re-sourcing slot 2.** With slots 3 and 4 fixed at 0.219 and 0.339, the widest a
slot-2 frame can open its narrower neighbour is **0.0595** — and slots 4 → 5
measure **0.047** regardless. The set minimum is therefore capped at 0.047 by
the 4 → 5 pair, and the shipped slot 2 already delivers it. **The set is at the
achievable optimum.** To clear 0.06 everywhere, slot 5 must move up to ~0.42 or
slot 4 down to ~0.31; both were left standing on instruction.

### 🔴 No alt text, deliberately

`alt=""` on all five, inside an `aria-hidden` container that is `display:none`
below 992. There is **no width and no assistive-technology path** on which an
alt string here is announced. These photographs are decorative relative to the
essay — a desk, a horizon, a facade, two chairs, a road — unlike §2, where the
image identifies which of seven products you are reading about. Authoring alt
would be writing strings nobody can reach, so `services.essay.b*.imageAlt` was
removed from both message files. **If the ≤991 rule is ever reversed and the
images move inside the blocks, alt must be written before they do.**

### 🔴 No `priority`, and it was measured doing harm

The first image carried `priority` and it was removed. This section begins
~8,200px down the page, so it can never be the LCP element. Below 992 it
actively cost bandwidth: the column is `display:none` but an eager image is
still fetched, and at 390 that was a measured **w=256 and w=640** request for a
photograph the reader can never see. All five are now `loading="lazy"` and 390
fetches **zero bytes** for this section.

---

# Blog — `/[locale]/blog` — twelve card photographs

🔴 **SYNERGY'S OWN SET CANNOT FILL A BLOG CARD.** The card renders **694.8 x
430.3** at 1536, so the 2x DPR bar is **1390 x 861**. Their largest
portrait-capable frame (`gallery-team-presentation`, 1100 x 1375, gallery g8)
cropped to a 1.615 landscape yields **1100 x 681** — **21% short**, and it
discards half the frame to get there. Every other Synergy file is smaller. All
three portrait photographs are also already rendered on /about and /services.
All twelve are therefore external.

## The set

All **Pexels License**. Exact licence line: *"All photos and videos on Pexels
are free to use."* / *"Attribution is not required."* Each fetched at full
resolution, centre-cropped to **1.615**, written **1600 x 991** (15% headroom
over the 2x bar), quality 84. Source URL pattern:
`https://www.pexels.com/photo/<id>/`.

| # | article | file | Pexels | source px | mean L |
|---|---|---|---|---|---|
| 1 | term-life-insurance | `blog-house-dusk.jpg` | 186077 | 3352 x 2286 | 0.309 |
| 2 | final-expense-insurance | `blog-window-interior.jpg` | 14149574 | 3637 x 2433 | 0.215 |
| 3 | mortgage-protection-insurance | `blog-rooftops.jpg` | 2092793 | 5509 x 3673 | 0.188 |
| 4 | indexed-universal-life-iul | `blog-pier-water.jpg` | 2909254 | 6000 x 3375 | 0.394 |
| 5 | fixed-indexed-annuity-fia | `blog-road-first-light.jpg` | 2812561 | 5568 x 3712 | 0.410 |
| 6 | iul-self-employed | `blog-machine-shop.jpg` | 7423708 | 4272 x 2848 | 0.105 |
| 7 | itin-holders-life-insurance | `blog-binders-desk.jpg` | 17018372 | 2998 x 2000 | 0.206 |
| 8 | iul-vs-401k-construction | `blog-scaffolding.jpg` | 154141 | 2560 x 1707 | 0.315 |
| 9 | nurses-tax-free-retirement | `blog-corridor-light.jpg` | 19435068 | 4864 x 3263 | 0.291 |
| 10 | truck-drivers-retirement | `blog-freight-port.jpg` | 14020705 | 4032 x 3024 | 0.351 |
| 11 | life-insurance-orlando | `blog-palms-water.jpg` | 15823905 | 6720 x 4480 | 0.121 |
| 12 | living-benefits | `blog-door-handle.jpg` | 16053396 | 6827 x 4551 | 0.227 |

**Register: no people, in any of the twelve.** /services §2 already runs seven
people-portraits; twelve more would put nineteen on one site in one register.
These are light, interiors, objects and the built environment.

## 🔴 THE SEPARATION RULE WAS RE-DERIVED. A GRID IS NOT A SEQUENCE.

The five-image essay set used "no two within 0.06 L". Carried to twelve that
rule is **arithmetically impossible**: the band is 0.10-0.42 and eleven gaps
give a ceiling of **0.32 / 11 = 0.029**. Best achievable global ladder from the
candidate pool was **0.006** — two cards reading as one tone.

It was also the wrong SHAPE. A sequence shows frames one after another in the
same box, so global uniqueness matters. A grid shows two side by side and the
pair above; nobody compares card 2 against card 11. **Re-derived against the
neighbours a reader can actually perceive together** — the six horizontal pairs
and ten vertical pairs in fflsynergy's fixed order:

**Minimum neighbour separation 0.036**, tightest pair slots 8 and 10.
Next tightest 0.060 (9-10) and 0.085 (7-9). Band 0.105-0.410, all inside spec.

🟡 The 8/10 pair at 0.036 is the one soft spot and it is recorded rather than
hidden. Opening it means moving slot 8 or 10 to a frame that was not visually
audited, which is the trade that produced the two rejects below.

## 🔴 Two frames rejected on inspection, both with good numbers

**Looking at the file caught what the measurement could not, twice.**

- **`4553661`** (L 0.236, dead on the slot-7 target) — paperwork strewn across
  the floor of a derelict room. On the ITIN article, read by people most
  anxious about their documents, "your papers scattered in an abandoned
  building" is the wrong note. Replaced with ring binders in order.
- **`6538572`** (L 0.202, in band) — a portrait, which breaks the no-people
  register, and it reads as someone clearing out a desk.

Also rejected: **`249074`** for slot 10 — an abstract of bridge cables in fog
that did not read as freight at all (the search matched "mist", not the
subject), and which made **two of twelve roads** alongside slot 5. The freight
port fixes both. **`2194838`** for slot 12 carried unresolved signage above the
doorway and was dropped rather than audited around.

**Every one of the twelve was viewed at crop size before selection**, and the
finalists at full resolution for third-party branding. All clear.

## Alt text

Authored per file and stored in the article frontmatter (`imageAlt`), not in
the message catalogue — alt describes the file and must change when the file
changes, which is the one authored-content exception in the standing rules.
Unlike /services §4, these images are NOT `aria-hidden`: a blog card is a link
whose image is part of the link's accessible name context, and the card is
rendered at every width rather than hidden below 992.

---

# Blog articles — the sticky column — 41 frames across nine articles

The article template was rebuilt on **/services §4** (copy left, sticky image
column right). The column needs a frame per qualifying h2 section. **All nine
articles that have bodies now carry frames — 41 in total.** The first four
below were sourced for `/blog/life-insurance-orlando`; the remaining 37 for the
other eight, in one pass, and they are listed further down.

**Common spec for all 41.** Pexels License — exact line: *"All photos and videos
on Pexels are free to use."* / *"Attribution is not required."* Each fetched at
full resolution, cropped to **2 / 3**, written **1600 × 2400** JPEG q86 mozjpeg;
the component re-encodes at `quality={78}`. Resolution bar **978 × 1467** (the
489 × 733.5 CSS frame at 2× DPR) — the smallest crop shipped is **2153px** wide,
2.2× the bar, so nothing upscales at any width or DPR. Source URL pattern:
`https://www.pexels.com/photo/<id>/`.

**Register held across all 41: no people, no legible signage, no third-party
branding, nothing derelict.** Interiors, light, landscape and the built
environment — the same register as the twelve blog cards, the /services essay
five and the /contact hero.

## /blog/life-insurance-orlando — four frames

| section heading | file | Pexels | native | crop | shipped L |
|---|---|---|---|---|---|
| Which products are available | `article-arched-windows.jpg` | `20822566` | 2268 × 4032 | 2268 × 3402 @ y315 | **0.212** |
| What it costs | `article-stair-concrete.jpg` | `5498049` | 2966 × 4000 | 2667 × 4000 @ x149 | **0.415** |
| What a broker does that a captive agent cannot | `article-colonnade-doors.jpg` | `27675521` | 3834 × 5896 | 3499 × 5248 @ y324 | **0.290** |
| What to have ready | `article-pigeonholes.jpg` | `35623825` | 5993 × 7491 | 4593 × 6889 @ x1400 y301 | **0.132** |

### The luminance ladder

Measured on the SHIPPED files, in the order the sections appear:
**0.212 → 0.415 → 0.290 → 0.132.** Adjacent gaps **0.203 / 0.125 / 0.158**,
minimum **0.125**, band **0.132–0.415**. That clears the 0.06 target the
/services essay set by a factor of two, and comfortably beats that set's own
shipped minimum of 0.047 — a four-frame sequence has three gaps to spend
across the same 0.10–0.42 band, where five frames had four.

### 🔴 TWO FRAMES WERE RE-CROPPED AFTER BEING VIEWED AT FULL SIZE

Both passed every measurement and both would have shipped a wrong note. This is
the third and fourth time on this project that opening the file caught what the
numbers could not.

- **`article-pigeonholes`** — a centred 2:3 crop keeps a red **FIRE ALARM** box,
  its label legible, on the left wall. Crop moved right to `x=1400` (the box's
  right edge is x≈1335), which also improves the composition: the wall of
  compartments now fills the frame instead of sharing it with an empty corner.
- **`article-colonnade-doors`** — the last cabinet on the right-hand wall is
  glass-fronted and holds a **devotional statuette**, legible at full size and
  invisible at thumbnail size. 335px trimmed off the right. Same call as the
  rejected `6185344` menorah frame on /services: no religious specificity about
  the reader on a general page. Four door panels remain, which is the point of
  the frame.

### 🔴 REJECTED, and why — the rule that did not bend

The instruction on this pass was absolute: **nothing showing illness, distress,
grief, dereliction, abandonment or scattered paperwork.** Rejections:

- **`6333730`** (card-catalogue drawers, L 0.194, dead on the brief for "What to
  have ready") — every label is legible **Cyrillic**, including *Ленин В.И.*
  and *Лермонтов М.Ю.* Foreign-language signage placing the frame in a Russian
  library, and a Lenin drawer label on a Florida insurance page. Same class as
  the `35005664` German street-sign rejection on /services.
- **`18725637`** (numbered PO boxes, L 0.254) — heavy fluorescent yellow cast,
  scuffed and grimy doors, and one door hanging open on a broken latch. Reads
  neglected.
- **`19683921`** (arcade with potted plants, L 0.126) — a person on the balcony
  in frame, and cracked weathered plaster throughout.
- **`37297699`** (repeated arched niches, L 0.35) — ducting hose on the ground,
  a poster carrying faces, and a CCTV camera. Reads utility corridor.
- **`14201540`**-class **derelict rooms** — not sourced at all this pass. The
  frame that shipped and was pulled from /services slot 1 is the standing
  example of the rule.
- The entire **postal-box** family beyond the two above — `4551930` (Latvijas
  **PASTS**), `35664126` (Deutsche Post horn), `5308805` (**India Post**),
  `38548889`/`36644909`/`33975914` (Royal Mail **E‖R**), `4744773` (Почта).
  All disqualified on third-party branding, not on subject.
- **`13726560`**, **`20378650`**, **`34187516`**, **`20849350`**, **`17190476`**
  — black and white. The register on this site is colour; a monochrome frame in
  a colour sequence reads as a different photographer, not as a choice.
- **`10051525`** / **`10051526`** (apothecary drawers, L 0.308 / 0.298) —
  legible pharmacopoeia labels (*AMYLUM*, *ANNATTO*, *CUSSO*). A pharmacy
  reading is illness-adjacent on a life-insurance page.
- **`5716254`**, **`29555786`**, **`38675666`**, **`6550460`**, **`15412016`**,
  **`277572`**, **`1861153`**, **`3460599`** — all clean and all usable; cut on
  the ladder or on motif duplication, not on content. `15412016` (warm wooden
  staircase in raking light, L 0.262) is the strongest runner-up and is the
  first place to look if `article-stair-concrete` is ever replaced for being
  the only cool-toned frame in the set.

**Every candidate above was viewed at crop size, and all four finalists at full
resolution in three horizontal bands at native pixel scale**, which is what
caught the fire alarm, the statuette and the Cyrillic.

### 🔴 No alt text, deliberately

`alt=""` on all four, inside an `aria-hidden` container that is `display:none`
below 992 — identical to /services §4 and for the identical reason. There is no
width and no assistive-technology path on which an alt string here is
announced. These are decorative relative to the article: a room of windows, a
stair, a colonnade, a wall of pigeonholes. **If the ≤991 rule is ever reversed
and the images move inside the sections, alt must be written before they do.**

### 🔴 No `priority`

All four are lazy. Below 992 the column is `display:none` but an eager image is
still fetched, and the section begins immediately below the fold at every
width — it can never be the LCP element. Same finding as /services §4.
**Verified: at 820 and 390 the page fetches ZERO bytes matching `article-`.**

---

## The other eight articles — 37 frames

Same spec, same register, same rule. Sourced, audited and placed in one pass.
Every frame below was **viewed at full resolution before it was written** — that
audit rejected 18 candidates that had passed every measurement (list at the end).

### `/blog/term-life-insurance` — 6 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | What is term life insurance and how does it work? | `article-tree-avenue.jpg` | `18573952` | 3965 × 5950 | 0.144 |
| 2 | How much coverage do I need? | `article-timber-beams.jpg` | `31848124` | 4000 × 6000 | 0.261 |
| 3 | 10, 20 or 30 years — how do they differ? | `article-concrete-atrium.jpg` | `35288711` | 6048 × 8064 | 0.168 |
| 4 | What does it cost? | `article-reservoir-bridge.jpg` | `37130561` | 3024 × 4032 | 0.305 |
| 5 | What happens when the term expires? | `article-stone-terrace.jpg` | `36039235` | 4000 × 6000 | 0.194 |
| 6 | Can I convert to a permanent policy? | `article-vaulted-walk.jpg` | `29809065` | 3024 × 4032 | 0.270 |

Frames, in order: an avenue of bare trees running to a sunset horizon · new
timber beams under a white boarded ceiling · a concrete atrium with a glass lift
and columns · a long causeway bridge over a green reservoir · stone steps and
flagstones with a potted shrub, from above · a vaulted stone walk ending on a
red door. **Adjacent gaps 0.117 / 0.093 / 0.137 / 0.111 / 0.076 — min 0.076.**

### `/blog/final-expense-insurance` — 5 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | How is it different from regular life insurance? | `article-tile-threshold.jpg` | `7047482` | 4176 × 6264 | 0.122 |
| 2 | Who qualifies? | `article-tiled-courtyard.jpg` | `19638850` | 3760 × 5642 | 0.282 |
| 3 | Is a medical exam required? | `article-roof-frame.jpg` | `8817839` | 3648 × 5472 | 0.189 |
| 4 | Guaranteed issue and simplified issue | `article-stair-flights.jpg` | `20361882` | 2369 × 3230 | 0.348 |
| 5 | How do I choose a policy? | `article-kitchen-garden-gate.jpg` | `38119102` | 5152 × 7728 | 0.196 |

Frames: patterned tiles meeting old floorboards in raking sun · a terracotta
arcaded courtyard with a stone fountain · new roof framing against blue sky and
pines · cascading concrete stair flights under warm uplight · an open picket gate
onto a kitchen garden. **Gaps 0.160 / 0.093 / 0.159 / 0.152 — min 0.093.**

🔴 **This article's imagery was chosen with a specific constraint.** It is about
funeral costs, and §3 is headed *"Is a medical exam required?"* Nothing in this
set is sombre, clinical, medical or valedictory — the register is deliberately
warm daylight, growing things and new construction.

### `/blog/mortgage-protection-insurance` — 5 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | What is mortgage protection insurance? | `article-garden-gate-pond.jpg` | `34317574` | 4160 × 6240 | 0.227 |
| 2 | How is it different from PMI? | `article-sash-windows.jpg` | `27418816` | 2604 × 3993 | 0.171 |
| 3 | How is it different from term life insurance? | `article-green-louvres.jpg` | `20703557` | 5446 × 7262 | 0.263 |
| 4 | What does it cover? | `article-timber-canopy.jpg` | `32599822` | 4004 × 6006 | 0.183 |
| 5 | Where its limits are | `article-white-cliffs.jpg` | `5328309` | 3024 × 4032 | 0.282 |

Frames: an open timber gate onto a lawn and pond with a tree in blossom · a brick
facade of sash windows reflecting the street · a green louvred facade over grass
and daisies · a timber-and-glass canopy seen from below · white chalk cliffs and
green downland above the sea. **Gaps 0.056 / 0.092 / 0.080 / 0.099.**

🟡 **Min gap 0.056 — the one set below the 0.06 target, and it is recorded
rather than hidden.** The five values cluster into two close pairs
(0.171/0.183 and 0.263/0.282), and 0.056 is the best any ordering of this set
achieves — checked exhaustively. Opening it means replacing a frame that has
already been audited at full size, which is the trade that produced most of the
rejections below. The subjects at the seam — a garden gate and a brick facade —
share nothing, and subject change is what makes a swap legible; luminance is the
second cue, not the first. For reference the /services essay five shipped at a
min of 0.047.

### `/blog/indexed-universal-life-iul` — 5 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | How the crediting actually works | `article-glazed-dome.jpg` | `18800234` | 2444 × 3666 | 0.148 |
| 2 | What the floor does not do | `article-encaustic-floor.jpg` | `30992346` | 4672 × 7008 | 0.273 |
| 3 | How is it different from whole life and term? | `article-landing-skylight.jpg` | `30473221` | 3213 × 5712 | 0.200 |
| 4 | Using the cash value | `article-white-spiral.jpg` | `16261090` | 3024 × 4032 | 0.307 |
| 5 | The risks, stated plainly | `article-brick-arches.jpg` | `37100567` | 3977 × 5966 | 0.208 |

Frames: an octagonal atrium looking up into a glazed lantern · an encaustic tile
floor in raking light · a landing under a roof window with a wooden banister · a
white spiral stair from below · a brick and stone facade of arched windows with
geraniums. **Gaps 0.125 / 0.073 / 0.107 / 0.099 — min 0.073.**

### `/blog/fixed-indexed-annuity-fia` — 5 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | What is a Fixed Indexed Annuity? | `article-stone-arcade.jpg` | `16239490` | 3310 × 4965 | 0.211 |
| 2 | How the crediting works | `article-forest-light.jpg` | `28656695` | 5304 × 7952 | 0.131 |
| 3 | Where the cost sits | `article-field-track.jpg` | `13417449` | 3024 × 4032 | 0.194 |
| 4 | The two halves | `article-dune-path.jpg` | `38457237` | 2656 × 3984 | 0.346 |
| 5 | Surrender charges — the constraint that matters most | `article-hillside-steps.jpg` | `27396713` | 3985 × 5978 | 0.189 |

Frames: a barrel-vaulted limestone arcade with a dark doorway at the end · light
shafts through a misty pine wood beside a lane · a farm track through fields at
dusk with one tree · a boardwalk climbing through marram dunes to a blue sky · a
flight of balustraded stone steps rising past dry-stone terracing.
**Gaps 0.080 / 0.063 / 0.152 / 0.157 — min 0.063.**

### `/blog/truck-drivers-retirement` — 5 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | Why the usual advice does not fit | `article-rail-canopy.jpg` | `3636903` | 2696 × 3740 | 0.201 |
| 2 | What an IUL does differently | `article-farm-track.jpg` | `32821657` | 4000 × 6000 | 0.264 |
| 3 | The risk that comes with that flexibility | `article-timber-trusses.jpg` | `19240406` | 4000 × 6000 | 0.154 |
| 4 | How the cash value works | `article-reed-boardwalk.jpg` | `14044290` | 4129 × 5504 | 0.357 |
| 5 | Using the cash value on the road | `article-forest-track.jpg` | `31612219` | 4672 × 7008 | 0.116 |

Frames: curving rail tracks under a glazed viaduct canopy · a gravel farm track
between green and rape fields under a big sky · timber trusses and glazing seen
from below · a long boardwalk running through reeds to the horizon · a soft green
forest track in rain. **Gaps 0.063 / 0.110 / 0.203 / 0.241 — min 0.063.**

The journey register is deliberate on this one — it is the article written for
drivers — but note it stays in the site's unpeopled vocabulary: no cab, no
truck, no road-freight imagery, because that would be a different register from
every other page and would make a claim about the reader.

### `/blog/itin-holders-life-insurance` — 3 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | What types of cover are available? | `article-open-gate.jpg` | `16961830` | 3986 × 4982 | 0.230 |
| 2 | Why an IUL comes up often in this context | `article-sea-deck.jpg` | `30819026` | 4480 × 6720 | 0.125 |
| 3 | What the application involves | `article-patterned-tiles.jpg` | `32021732` | 4000 × 6000 | 0.265 |

Frames: an open iron field gate under a hawthorn in blossom, path running through
· a blue-railed viewing deck out over a calm sea · a patchwork of encaustic tiles.
**Gaps 0.105 / 0.140 — min 0.105.**

🔴 **THIS IS THE ARTICLE WHERE IT WENT WRONG BEFORE.** Pexels `4553661` —
paperwork strewn across the floor of a derelict room — was placed here on the
card and pulled. The set above was chosen against that history: three open,
bright, tended, unmistakably intact frames, no documents, no archives, no
institutional interiors. Two candidates were rejected specifically on this
article: **`13504750`**, a domed glasshouse that is unambiguously derelict at
full size — broken panes, rust, building rubble — and **`35485678`**, a mossy
winter pergola with plastic buckets that reads unkempt. Both had good numbers.
Both were caught by opening the file.

### `/blog/living-benefits` — 3 frames

| # | section heading | file | Pexels | native | shipped L |
|---|---|---|---|---|---|
| 1 | The three types of living benefits | `article-woodland-path.jpg` | `37368587` | 3712 × 5568 | 0.141 |
| 2 | Why living benefits matter for your financial plan | `article-sea-terrace.jpg` | `37109551` | 2773 × 4160 | 0.260 |
| 3 | Which life insurance policies include living benefits? | `article-olive-hillside.jpg` | `5624201` | 4014 × 5352 | 0.344 |

Frames: a green woodland path in soft mist · a balcony rail and a laid table
above a calm sea · a Tuscan olive grove backlit gold, a hill village beyond.
**Gaps 0.119 / 0.084 — min 0.084.**

🔴 **THE HARDEST SET ON THE BLOG, AND THE REASON IS THE SUBJECT.** Living
benefits are critical-, chronic- and terminal-illness riders. Nothing here may
read as illness, care, decline or valediction — no clinical interiors, no
hospital light, no empty chairs, no dusk-as-ending. All three frames are green,
warm, in daylight, and about somewhere you would want to be. The luminance
ladder rises rather than falls, which is the one place on this blog where the
ARC of the set was chosen for what it says and not only for separation.

---

## 🔴 The full-size audit — 18 rejections that passed every measurement

Every candidate was screened at crop size (526 screened, 96 out of the 0.10–0.42
band) and every finalist opened at full resolution. **The audit rejected 18
frames that had already cleared luminance, resolution and register.** It is
listed in full because the rate — nearly one in three finalists — is the argument
for the rule.

**People in frame** (the register is unpeopled, and it was applied to distant
figures too, not just subjects): `19683921` (a figure on a balcony, plus cracked
plaster), `15018649` (a walker on a tree-lined avenue), `38335387` (figures on a
coastal boardwalk), `16292315` (one seated figure deep in a cloister arcade),
`34055577` (a cyclist on a canal street), `34336856` (a seated figure in the
Casa de Pilatos courtyard, plus museum stanchions and labels).

**Dereliction, decay or neglect** — the rule that does not bend: `13504750`
(derelict glasshouse, broken panes and rubble), `12098858` (graffitied stairwell
in an abandoned building), `3968002` (railway past a rusting shed with a broken
fence and weeds), `32413272` (rusting truss bridge with litter on the bank),
`18725637` (scuffed PO boxes, one door hanging on a broken latch), `35485678`
(mossy winter pergola with plastic buckets), `27039489` (boardwalk over a bog
under a dead grey sky — bleak rather than derelict, cut anyway).

**Legible text, signage or a place claim**: `6333730` (Cyrillic drawer labels
including *Ленин В.И.*), `5025768` (fishing boats with legible names and a Cape
Town registration), `15887356` (a national flag on a Venetian facade),
`37419745` (a yellow signboard and erosion netting on a cliff walkway),
`37376693` (the **LOUVRE** wordmark).

**Religious specificity** — the same call as the `6185344` menorah rejection on
/services: `15562594` (three leaded lancet windows behind a cypress: reads as a
chapel), and the RE-CROP of `27675521` for the devotional statuette.

**Register break, not content**: `5953664` (a cattle barn — live animals and
manure), `26893623` (a rust-streaked underpass), `37297699` (ducting hose, CCTV
and a poster of faces), `15703818` (an encaustic floor with grey cement patches),
`13726560` / `20378650` / `34187516` / `20849350` / `17190476` (black and white —
a monochrome frame in a colour sequence reads as a different photographer),
`10051525` / `10051526` (apothecary drawers with pharmacopoeia labels —
illness-adjacent on a life-insurance page), and the whole **postal-box** family
on third-party branding (`4551930` Latvijas **PASTS**, `35664126` Deutsche Post,
`5308805` **India Post**, `38548889` / `36644909` / `33975914` Royal Mail
**E‖R**, `4744773` Почта).

**One near-miss worth keeping:** `15412016`, a warm wooden staircase in raking
sunlight (L 0.262). Clean, audited, unused — cut on the ladder, not on content.
It is the first place to look if any frame here ever needs replacing.

---

# /contact

## §1 hero — `contact-doors-light.jpg`

**Pexels `19184551`** — "Open door to the balcony". Source:
https://www.pexels.com/photo/open-door-to-the-balcony-19184551/

**Pexels License**, exact line: *"All photos and videos on Pexels are free to
use."* / *"Attribution is not required."* Commercial use, no attribution
required — the same licence every other Pexels file in this repo carries.

**Subject:** an empty room, French doors standing open onto a balcony, low
raking sun throwing the window bars across the floor. No people, no interior
clutter, no signage. In the unpeopled register the blog twelve and the
/services essay five established — interiors, objects, light, built
environment.

### Derivation, measured

| | |
|---|---|
| source | **2820 × 5018** (ratio 0.5620), 1.51 MB |
| crop | **2820 × 4230** at 0,394 — centred, keeps **84.3%** of source height |
| downscale | factor **0.5674** — a REDUCTION. Nothing is upscaled |
| shipped master | **1600 × 2400**, JPEG q82 mozjpeg, **397 KB** |
| slot box | ratio **1.0598** — THEIRS, off their measured 752 × 709.6 |
| band the slot shows | master rows **445–1955**, the middle **62.9%** |

**Mean luminance**, WCAG relative, measured on the shipped file — not on the
source, and not on the full frame where it would flatter:

| | |
|---|---|
| full master | **0.2806** (darkest row 0.028, brightest 0.672) |
| **slot crop @ 1.0598** | **0.3644** (darkest row 0.057, brightest 0.671) |

Candidate measurement before processing was 0.3662; the 0.0018 delta is the
crop and the JPEG. Against the /services essay ladder (0.126 / 0.219 / 0.266 /
0.339 / 0.386) this sits at the light end of the band, inside it.

### Resolution, checked at DPR 2 rather than assumed

Box renders **654 CSS** at 1536 → needs **1309** at DPR 2. next/image's srcset
jumps 1200 → 1920, so the browser requests **w=1920** from a **1600**-wide
master. Verified empirically that this is safe: `/_next/image?...&w=1920`
returns **1600 × 2400**. The optimizer caps at the source width and does not
enlarge. The delivered image is a downscale at every width and DPR.

### Branding audit

Viewed at full resolution before selection. Clear — no logos, wordmarks,
signage or identifiable marks anywhere in frame.

**Two candidates with good numbers were rejected on exactly this**, which is
why the audit is not a formality:

- **`10985999`** (doorway to a staircase, crop L 0.142) — a **branded oval
  floor mat** carrying a monogram and wordmark, plus a branded standing banner
  at the left edge. Disqualified under the standing rule.
- **`20543598`** (window corner, crop L 0.152) — a **printed wall label** with
  Chinese text and a circular logo mark. A centre crop clears it by ~27px,
  which is far too thin a margin to ship on.

Also rejected, on register rather than branding: `27872073` (clean, but a
café/bar with clutter and a fire extinguisher — reads hospitality),
`26508560` (clean, but a tight object study whose large blue mass fights
cream/ink/gold), `11433145` and `10091248` (L 0.58 / 0.80 — too light to be
the page's dark mass), `9899873` / `34245503` / `8285612` (L 0.04–0.06, below
the set's floor), `35278717` (person in frame).

Runners-up, both clean and both still viable if this one is ever replaced:
**`2128347`** (stone hall, arched window, crop L 0.243, delivers +104% over the
master) and **`20180326`** (window corner and a shaft of light, crop L 0.286,
+29.4%).

### Alt text

**`alt=""`.** The photograph carries nothing the copy does not already say —
the h1, the phone number and the intro paragraph are the content of that
column. It is decorative, and an invented description ("light through open
doors") would be noise in a screen reader rather than information. This
matches the /services essay five. It is NOT `aria-hidden` and NOT hidden below
992: unlike /services §4 the image renders at every width, but a decorative
image with an empty alt is already skipped, so no hiding is needed.

### 🔴 In-column, not full-bleed — and what that defers

Theirs is pinned to the viewport corner at x=0, y=0, running under their nav,
with the h1 absolutely positioned over the photograph. Ours sits inside the
grid column at 654 CSS.

Reproducing their placement means the photograph runs under our header, which
means the header cannot stay solid on this route, which means adding /contact
to `isPhotoHeroRoute`, restoring the nav veil and re-running the **nav** AA
over a photograph at three widths. That is a header decision, not an image
decision. The file does not change if it is taken later — only the wrapper.

Because the image is in flow, there is also no DOM order to be faithful to:
theirs sits between the h1 and the phone only as an artifact of corner-
anchoring with `margin: -160px 0 0 -32px`. Ours goes at the foot of the column,
which is where the dead-space pass found the **701.1px** void it exists to
fill. Residual after wiring: **40.4px**, columns ending 1251 vs 1290 — a
mismatch inherent to unequal columns, the same condition already accepted on
/about §2.

---

# /[locale]/join — six photographs

All six are **Pexels License**, commercial use, no attribution required. Every
one is a genuine **downscale** of a larger original — nothing on this page is
upscaled, and the source dimensions are given so that can be checked.

| # | slot | file | Pexels ID | original | shipped | 2× DPR target | clearance |
|---|---|---|---|---|---|---|---|
| 1 | §1 hero | `join-hero-atrium.jpg` | `38197381` | 5207 × 3472 | **3840 × 2560** | 3072 × 1800 | **+25% W / +42% H** |
| 2 | §2 opening frame | `join-opening-courtyard.jpg` | `36756213` | 6000 × 4000 | **3840 × 2560** | 2908 × 1636 | **+32% W / +56% H** |
| 3 | §3 step 1 | `join-step-palm-walk.jpg` | `32642344` | 3568 × 5352 | **1600 × 2400** | 952 × 1427 | **+68% / +68%** |
| 4 | §3 step 2 | `join-step-reading-room.jpg` | `35548579` | 4000 × 6000 | **1600 × 2400** | 952 × 1427 | **+68% / +68%** |
| 5 | §3 step 3 | `join-step-stair-light.jpg` | `28560789` | 4000 × 6000 | **1600 × 2400** | 952 × 1427 | **+68% / +68%** |
| 6 | §3 step 4 | `join-step-palm-road.jpg` | `10504639` | 3648 × 5472 | **1600 × 2400** | 952 × 1427 | **+68% / +68%** |

Sources: https://www.pexels.com/photo/38197381/ · `/36756213/` · `/32642344/` ·
`/35548579/` · `/28560789/` · `/10504639/`

**§2 opening frame — `join-opening-courtyard.jpg` (Pexels `36756213`).** A sunlit
honey-stone courtyard with a tree and arched wooden doorways — warm,
place/architecture, no identifiable people, nothing derelict. Route-scoped: used
on /join only, not shared with any other page (it replaced a borrow of
`services-break-dusk.jpg`). The 16:9 frame `object-cover`s this 3:2 file; the
extra height feeds the parallax layer's no-uncover margin. No text sits on it.

**The hero is 1.500 aspect on purpose.** `about-hero-family.jpg` is 3840 × 2560
— the same ratio — so the `object-top` derivation written on /about §1 transfers
to /join verbatim instead of needing to be re-derived: at 1536 × 900 the box is
1.707, `cover` fits by width, and the whole crop budget comes out of the height.
At 820 and 390 the box is taller in aspect than 1.500, so it is a no-op there.

The four step frames ship at 1600 × 2400 because that is exactly what the
`essay-*` frames ship at, and they render in the same `.essay-frame` box.

## 🔴 What is in these frames, and what is deliberately not

The brief rejects on sight: illness, distress, grief, dereliction, abandonment,
scattered paperwork. It also forbids presenting any person as a Synergy agent.

**There are no identifiable people in any of the five.** That was the cheapest
way to satisfy the agent rule outright rather than argue the line, and it also
keeps the page inside the architectural vocabulary the `article-*` and `essay-*`
sets already established. What each one actually shows:

1. an atrium under a glazed roof, with a city street visible through it
2. a paved walkway between date palms under a clear sky
3. a vaulted library reading room with empty wooden desks
4. a flight of stairs rising toward a skylit landing
5. a road between palms, backlit at golden hour

**Six candidates were rejected after being viewed at full size**, and the reasons
are recorded because two wrong frames have shipped on this project already:

| Pexels ID | why rejected |
|---|---|
| `7534173` | bare office, empty chairs and empty shelves — reads as abandonment |
| `7046156` | office interior, but red/pink furnishings clash with cream/gold/navy |
| `26799456` | legible Turkish museum signage ("Tematik Sergiler") in frame |
| `38369237` | legible Turkish signage ("İTİNİZ") plus weathered, stained stonework |
| `34936110` | unrendered brick and bare dirt ground — reads as dereliction |
| `15257959` | near-black stone tunnel; gloomy, and almost no tonal range on cream |
| `9408172` | back-of-house service stairwell, chain across the flight, debris |
| `10945186` | marble stairwell with **snow** through the windows — wrong for Florida |

---

## Client-supplied galleries (2026-08) — `/services-gallery/` and `/blog-gallery/`

The client supplied two folders of their own photography. Each file was matched
to a slot **by name** and copied into a **space-free** public path — a space in a
public URL double-encodes (`%2520`) and 404s — leaving the space-named originals
(`public/services gallery/`, `public/blog gallery/`) untouched on disk. Nothing
is upscaled: every image clears its rendered slot at **2× DPR** with margin.
These are the client's own assets, not Pexels; no licence line applies.

Clearance = min(sourceW ÷ slotW×2, sourceH ÷ slotH×2) for the object-cover box.

### Services — product frames (§2), slot 476×557 CSS → 952×1115 @2×

| slot | product | source file → copy | native | 2× clearance |
|---|---|---|---|---|
| p1 | Term Life | `Term life.jpg` → `term-life.jpg` | 3840×5760 | 4.03× |
| p2 | Final Expense | `Final Expense Insurance.jpg` → `final-expense.jpg` | 2001×3000 | 2.10× |
| p3 | Mortgage Protection | `Mortgage Protection Insurance.jpg` → `mortgage-protection.jpg` | 2738×3010 | 2.70× |
| p4 | Indexed Universal Life | `Indexed Universal Life (IUL).jpg` → `indexed-universal-life.jpg` | 4000×6000 | 4.20× |
| p5 | Fixed Indexed Annuities | `Fixed Indexed Annuities (FIAs).jpg` → `fixed-indexed-annuities.jpg` | 2001×3000 | 2.10× |
| p6 | Medicare | `medical insurance.jpg` → `medical-insurance.jpg` | 4160×6240 | 4.37× |
| p7 | Health | `health insurance.jpg` → `health-insurance.jpg` | 4016×6016 | 4.22× |

### Services — essay frames (§4), slot 489×734 CSS → 978×1467 @2×

| slot | block | source file → copy | native | 2× clearance |
|---|---|---|---|---|
| b1 | "Tax-free…" | `Tax-free.jpg` → `tax-free.jpg` | 3514×5271 | 3.59× |
| b2 | "What a floor does…" | `A floor.jpg` → `a-floor.jpg` | 4000×6000 | 4.09× |
| b3 | "A period, or a lifetime" | — (no supplied match; prior frame kept) | — | — |
| b4 | "The medical exam column" | `The medical exam column.jpg` → `medical-exam-column.jpg` | 3391×5080 | 3.46× |
| b5 | "When a balance becomes a payment" | `balance become payment.jpg` → `balance-becomes-payment.jpg` | 4480×6720 | 4.58× |

### Blog — card frames, slot 713×442 CSS → 1427×883 @2×

| article | source file → copy | native | 2× clearance |
|---|---|---|---|
| fixed-indexed-annuity-fia | `Annuity.jpg` → `annuity.jpg` | 6720×4480 | 4.71× |
| iul-vs-401k-construction | `constuction work.jpg` → `construction-work.jpg` | 7952×5304 | 5.57× |
| life-insurance-orlando | `florida.jpg` → `florida.jpg` | 5472×3078 | 3.48× |
| itin-holders-life-insurance | `itin.jpg` → `itin.jpg` | 4512×3008 | 3.16× |
| indexed-universal-life-iul | `iul.jpg` → `iul.jpg` | 6000×4000 | 4.21× |
| iul-self-employed | `iul2.jpg` → `iul-self-employed.jpg` | 4205×3493 | 2.95× |
| living-benefits | `Living Benefits.jpg` → `living-benefits.jpg` | 5184×3888 | 3.63× |
| mortgage-protection-insurance | `mortgage protection.jpg` → `mortgage-protection.jpg` | 5184×3888 | 3.63× |
| nurses-tax-free-retirement | `nurses.jpg` → `nurses.jpg` | 6000×4000 | 4.21× |
| term-life-insurance | `Term Life2.jpg` → `term-life.jpg` | 5616×3744 | 3.94× |
| truck-drivers-retirement | `truck drivers.jpg` → `truck-drivers.jpg` | 6240×4160 | 4.37× |
| final-expense-insurance | `retirment planning .jpg` → `retirement-planning.jpg` | 6016×4016 | 4.22× |

**⚠ One blog pairing is by elimination, not by name.** Eleven articles matched a
same-named image cleanly; `final-expense-insurance` had no "final expense" /
"senior" file, and `retirment planning .jpg` had no "retirement" article (the
truck-drivers piece took `truck drivers.jpg`). They are paired last by
elimination — a retirement-planning photo on the final-expense card. Flag for the
client if a better-matched final-expense image exists.

### Article body images — REMOVED (2026-08)

The in-article sticky image column (`ARTICLE_FRAMES`, `ArticleEssay`'s
`.essay-sticky`) is commented out, not deleted; all 12 articles are text-only,
the copy re-centred via `.essay-grid--textonly`. The `article-*.jpg` frame files
remain on disk for restore.
