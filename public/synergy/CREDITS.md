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
