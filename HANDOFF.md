# Synergy Insurance Group — project handoff

**Written for a session with zero memory of any previous one.** Everything you
need to continue is here or is pointed at from here. Read §2, the Standing
Rules, first — they are not negotiable and they are the reason most decisions
on this project look the way they do.

> **What changed since the last revision of this file.** The previous version
> described the About page as *"DESIGNED, NOT BUILT"*. **It is built and it is
> in the working tree.** Eight new files exist that that document never
> mentioned. Everything below is read off the code as it stands, not off notes.

---

## 1. What this is

A marketing site for **Synergy Insurance Group**, a life-insurance brokerage in
Orlando, Florida. Client contact: **Ziad**. Founder of the agency: **Rula
AlAryan**.

- **Next.js 14**, App Router
- **next-intl** locale routing — `/en` and `/es`
- **Tailwind**, hand-rolled components, **no UI libraries**
- **Lenis** (smooth scroll) + **GSAP ScrollTrigger** — the only motion libs
- Spanish copy is largely unwritten; `i18n.ts` falls back to English for any
  missing **or empty** key, so an untranslated page is a working English page.
  Every `about.*` key exists in `es.json` as `""` and therefore renders English.

**Live preview:** <https://synergy-umber.vercel.app> — public, no login.
See §12 for why that is the production alias and not a preview URL.

---

## 2. Standing rules — unchanged, non-negotiable

1. **Copy comes only from <https://fflsynergy.com/>.** Never invent copy to fill
   a slot. An empty slot is reported to the client, not filled.
2. **Every proposed line is checked against
   <https://checkmatefinancialgroup.com/>.** The two agencies share a building
   and there is a known lifted-copy problem. Match found → keep the meaning,
   rewrite the phrasing.
3. **Attributed quotes are never reworded.** Ship verbatim or drop.
4. **Interface labels may be authored** — nav items, column headings, CTA
   labels, image alt text. A wayfinding label names a destination; it asserts
   nothing about the business. Anything that says something *about Synergy*
   comes from fflsynergy.
5. **Nothing is written to `messages/en.json` without explicit approval**, with
   the source line quoted. The one standing exception is **image alt text**,
   which is descriptive of the file and must change when the file changes.
6. **Compliance.** No guaranteed outcomes. No "recession-proof". No timeline
   claims. **No "A-rated", no "AM Best"** — Synergy says *"top-rated carriers"*.
   No unverified volume claims. No agent income claims.
7. **Never gold `#C9A84C` as text on cream** — 2.09:1. Forbidden.
8. **Reference sites are measured live, never copied.** Do not copy their CSS
   line by line and do not download their files. Measure, then rebuild in our
   tokens. Reference sites change; re-measure rather than trusting notes.
9. **Images**: prefer Synergy's own. Third-party branding in frame disqualifies.
   External images must be free for commercial use, no attribution required,
   large enough that nothing upscales; report source URL and the exact licence
   line; choose on measured luminance with candidate numbers shown; verify faces
   are clear of every edge **by rendering**, at all three widths, and across the
   scroll range for anything that moves. **If a candidate falls short, report by
   how much — never upscale silently.**
10. **WCAG AA on everything**, measured on composited pixels for anything over a
    photo, worst case, at desktop / tablet / phone, across the full scroll range
    wherever it moves.
11. `prefers-reduced-motion` respected on every animation.

---

## 3. Design tokens

`tailwind.config.ts`. **Do not add colours without measuring and recording why.**

| token | hex | luminance | notes |
|---|---|---|---|
| `cream` | `#F8F4EE` | 0.9083 | page background, and text on dark |
| `greige` | `#ECE9E2` | 0.8160 | card surface on cream |
| `navy` | `#0D1B2A` | **0.0104** | dark surface, footer, panels |
| `navy-lift` | **`#1C3A5A`** | **0.0401** | **SHIPPED.** Top of the About gradient — see below |
| `ink` | `#1A1A1A` | **0.0103** | body text on light |
| `gold` | `#C9A84C` | 0.4094 | borders, icons, and **text on navy only** |
| `gold-pale` | `#EFE1B0` | 0.7534 | hover + focus rings on dark |
| `gold-deep` | `#7D641F` | 0.1357 | the only legal gold **text on light** |
| `amber` | `#E0A458` | — | rules and washes only |
| `amber-deep` | `#8A5312` | — | amber text on cream (calculator figure) |

### ⚠️ The finding that must survive: navy and ink are luminance-identical

`navy #0D1B2A` is **L 0.0104**. `ink #1A1A1A` is **L 0.0103**.

They differ in hue, **not in brightness**. A gradient from navy to ink has a
luminance descent of **1.00×** — it looks like nothing is happening. This was
discovered while designing the About page, whose whole effect depends on a
descent. For reference, the source page's own gradient descends **7.26×**.

**Anyone reaching for "navy to ink" to create depth is making a mistake.** Our
palette has no mid-tone between `greige` (0.816) and `navy` (0.0104).

### Why `navy-lift #1C3A5A` exists, and why it is that exact value

It was solved **backwards from the gold constraint**, not chosen by eye:

```
gold #C9A84C as NORMAL text (4.5:1)  →  background must be L ≤ 0.0521
gold #C9A84C as LARGE  text (3.0:1)  →  background must be L ≤ 0.1031
```

`#1C3A5A` at L 0.0401 is the **lightest navy that keeps gold legal as *normal*
text with real margin**. `#204264` (L 0.0512) lands on 4.54:1 — too close to
ship.

**Gold and cream across the full `#1C3A5A → #0D1B2A` run:**

| down | colour | bg L | gold | cream | gold-pale |
|---|---|---|---|---|---|
| 0% | `#1C3A5A` | 0.0401 | **5.10** | 10.63 | 8.92 |
| 25% | `#18324E` | 0.0305 | 5.71 | 11.90 | 9.98 |
| 50% | `#152B42` | 0.0224 | 6.35 | 13.24 | 11.10 |
| 75% | `#112336` | 0.0157 | 6.99 | 14.58 | 12.23 |
| 100% | `#0D1B2A` | 0.0104 | **7.61** | 15.87 | 13.31 |

Descent **3.87×**. Gold worst case **5.10:1**.

🔴 **`gold-deep` is UNUSABLE on this run — 2.06:1 at the top. Nothing on the
About page may use it.** Dark surfaces take `gold`, light surfaces take
`gold-deep`, and neither crosses over.

`navy-lift` is a **background token only**. It has never been measured as text
and must not be used as one — see the `.sem-pill-cta` note in §7.

### Type

- **Display** — Kufam, `var(--font-display)`, **max weight 500, never bold**,
  loaded at 400 and 500 only. **No synthetic weights, ever.**
- **Body / data** — Overpass, `var(--font-body)`
- **Hero** — Inter, `var(--font-hero)`, VEX-spec hero only
- Breakpoint `card: 900px` (custom). `maxWidth.content: 1220px`.

### Cap-trim

`.cap-trim` + `.cap-display` / `.cap-body` in `globals.css`. Reference sites lay
text out on its **cap band**, not its line box. The trim values are derived from
our own loaded font metrics, not copied. **`.cap-body` assumes `line-height:
1.5`** — set it explicitly or the trim is wrong. This is what makes footer link
rows 35px instead of 46px.

---

## 4. Routes — `routes.ts` is the single source of truth

**`routes.ts` at the repo root is the one place that knows which pages exist.**
The header, the mobile panel and the footer all read from it, so a route can
never be linked from one surface and missing from another.

**Built and reachable — three routes, and only three:**

| key | path | what |
|---|---|---|
| `home` | `/[locale]` | homepage |
| `about` | `/[locale]/about` | the About page |
| `calculator` | `/[locale]/calculator` | the retirement calculator |

`JOIN_URL = https://join.fflsynergy.com/` is the only external destination.

**The rule it enforces: A LINK IS A PROMISE THAT A PAGE EXISTS.** Before this
file there were 17 `href="#"` stubs in the header and hero and 6 footer links to
routes that 404. All are gone. **Unbuilt routes are NOT rendered as disabled
entries** — a greyed-out "Services" says Synergy has a services page that is
temporarily unavailable, which is false; an absent one says nothing, which is
true.

🔴 **Unbuilt, listed only as a comment in `routes.ts`:** `services`, `contact`,
`blog`, `gallery`, `privacy`, `terms`. All their message strings (`nav.*`,
`footer.nav.*`, `footer.legal.*`) are **retained untouched** in both files.

🔴 **`privacy` and `terms` are BLOCKED, not merely unbuilt.** They are legal
documents for a Florida life-insurance brokerage and come from the client.
**Do not write them.**

---

## 5. Homepage — `app/[locale]/page.tsx`

Order as shipped:

| # | component | what it is | state |
|---|---|---|---|
| 1 | `Hero` | full-bleed video/poster, VEX spec, headline | ⚠️ **now ONE CTA** — see below |
| 2 | `CarrierStrip` | slim marquee band, 12 carrier names as **text wordmarks** | shipped |
| 3 | `WhatWeCover` | full-bleed parallax photo, translucent cards | shipped |
| 4 | `WhoWeServe` | tabbed Families / Agents, three cards each | shipped |
| 5 | `WhySynergy` | eight alternating image/text rows (`id="why-heading"`) | shipped |
| 6 | `Testimonials` | full-bleed parallax photo, three quote cards | 🟡 two asides hidden — §10 |
| 7 | `HowItWorks` | three process cards on photos, glass panels | shipped |
| — | *`Calculator`* | **commented out** — moved to its own route, §9 | — |
| 8 | `Consultation` | full-bleed parallax photo, glass panel, CTA → calculator | shipped |
| — | `Footer` | site-wide, mounted in the layout inside `SmoothScroll` | ⚠️ legal column removed |

`SiteHeader` and `Splash` are mounted in `app/[locale]/layout.tsx`, so they are
on every route.

### ⚠️ The hero now has ONE CTA, and it dials a real phone

There were two, both `href="#"`. **"Talk to an advisor" is the survivor**
because it has an honest destination: `407-434-0400` is Synergy's own number,
already a live `tel:` link in the footer, and **not** shared with Checkmate
(their only number is `833-997-6934`). It reads the number from `nav.phoneHref`
rather than duplicating it into a second key.

It takes the **primary** styling (solid white pill) rather than staying a glass
ghost — a hero with a single low-emphasis CTA reads as unfinished. To revert,
put `liquid-glass … text-white` back in place of `bg-white … text-navy`.

🔴 **Removed: "Get a free quote" (`hero.ctaQuote`).** No quote route, no working
form. String retained untouched in both message files.

### ⚠️ The footer's Legal column is commented out

It held `/privacy` and `/terms`. Both 404, and both are blocked (§4). The whole
`<nav aria-labelledby="footer-legal-heading">` block is commented out in
`components/Footer.tsx`. The nav column stays at `col-start-9 / span 2` rather
than spreading — the reference layout already carries an empty gutter at column
8, so a second one at 11–12 is consistent rather than a hole.

---

## 6. About page — `/[locale]/about` — **BUILT**

`app/[locale]/about/page.tsx`. Modelled on the **entire homepage of
<https://www.restaurantsem.com/>**, section for section, re-measured live at
1526 / 758 / 390.

### What makes the reference page work

**No section has a background.** Every one is transparent. The whole non-hero
column sits on **one continuous gradient** on a single wrapper: theirs
`#265C78 → #1E1E1E at 75%` over 8,036px. You scroll from daylight into
darkness. No colour blocks, no rules, no cards marking boundaries.

Ours is `.about-gradient`, `#1C3A5A → #0D1B2A also landing at 75%`, ending on
exactly the footer's colour so that seam does not exist.

### The mapping — their 8 sections + footer

| # | theirs | ours | state |
|---|---|---|---|
| 1 | Hero, static, **no headline at all** | h1 "We Are Synergy" + sub, 100svh | ✅ built. **We add a headline** — theirs is a silent photograph, which doesn't survive semantics or SEO. 🟡 photo is a placeholder |
| 2 | Info, 1248px | "Our Story" — display heading + 3 paras, image right | ✅ built |
| 2b | 5-col award/press logo grid | **5 carrier wordmarks** | ✅ built, 🟡 **AWAITING LOGO FILES** — see below |
| 3 | Pull-quote #1, 715px | *"Insurance is not a product. It is a promise."* | ✅ built |
| 4 | Food & Drink, 826px | "Built on Trust. Driven by Results." + 2 images | ✅ built. 🔴 **their pill CTA is deliberately absent** — §9 |
| 5 | Images grid, 1158px | "What We Stand For" — I Integrity / II Education / III Legacy | ✅ built. 🟡 provisional imagery |
| 6 | Pull-quote #2, 705px | *"We do not just sell policies…"* | ✅ built |
| 7 | Image zoom, **1973px** | image only, no copy | ✅ built |
| 8 | Staff, 807px | 🔴 **AWAITING CLIENT — commented out** | see below |
| 9 | Footer, 604px | the site-wide `<Footer />` | ✅ already `bg-navy`, no seam |

### 🔴 What was DROPPED from their page

- **Their award/press logo grid became a carrier row.** fflsynergy has no awards
  and no press logos. The slot is filled with five carrier names instead — see
  §2b below.

### §2b — the carrier row, and why five

`LOGO_CARRIERS = ["c1","c2","c8","c7","c6"]` in `about/page.tsx`, read from the
`carriers.names` namespace. **FIVE, not the twelve in `carriers.names`:** the
reference grid is exactly five columns of 191.74px and twelve names crammed in
would be a different component wearing its layout. These are the five with the
widest consumer recognition — the row's job is reassurance.

🟡 **THESE ARE WORDMARKS, NOT LOGOS, AND IT SHOWS.** The client confirmed the
appointments but has sent no logo files. The cells are 191×131 and typeset names
fill maybe a third of that, so the whitespace that would hold a mark is visibly
empty. Honest, but not finished.
**Drop-in swap:** replace the `<span>` with `<Image>` in the same cell. Grid,
gap, 131px cap and centring are all on the `<li>`.

### 🔴 §8 Staff — AWAITING CLIENT

**fflsynergy names the founder only in a meta description** — *"founded by Rula
AlAryan"* — and that is the entire extent of it. No bio, no leadership section,
no founder photo, no team copy anywhere on the site.

**DO NOT WRITE A FOUNDER BIO.** Checkmate's About page has four named leaders
with full bios; that is exactly what must not be borrowed to fill this. A stock
portrait presented as Synergy's founder would be a fabrication, not a
placeholder.

**Needed from Ziad:** two or three sentences on Rula AlAryan and the founding,
plus a usable portrait.

**How it is left:** a **commented JSX block in `app/[locale]/about/page.tsx`
directly after §7**, plus the `SECTION_ORDER` docblock at the top of the file
listing all eight with §8 marked `AWAITING CLIENT`. **Do not delete it.**
Restore = uncomment, add `about.founder.*` keys to both message files, drop the
portrait in `public/synergy/`. No layout maths changes — the gradient is on the
wrapper and reflows on its own.

### Seams — all three resolved and shipped

1. **Header.** `/about` is now in `SiteHeader`'s `isHeroRoute` set, so the bar
   is **transparent over the hero** exactly like the homepage, and takes a
   surface once it leaves it. The surface it takes is the new **dark variant**
   — see §8.
2. **Footer.** No change needed. Already `bg-navy #0D1B2A`, and the gradient
   ends on exactly that colour.
3. **Cream → dark route transitions.** Handled by `components/RouteTheme.tsx` —
   see §8.

### Copy — written to `en.json`, `about.*`

Source: `fflsynergy.com/about`, verbatim except for two documented changes.

- **h1** "We Are Synergy" · **sub** "A brokerage built on integrity, education,
  and a genuine commitment to protecting the people we serve."
- **Our Story p2** — ⚠️ **REWRITTEN.** Original ended *"we search the market to
  find the best fit for you"*, which matches Checkmate's *"we shop the whole
  market to find the honest fit"*. Shipped replacement: *"…we are never locked
  into one carrier — we compare what is available and bring back what suits
  your household."*
- **Our Story p3** — ⚠️ **TWO CUTS.** Original asserted *"serves thousands of
  families"* (unverified volume claim) and *"provides life-changing income
  opportunities for agents"* (agent income claim). Shipped: *"Licensed in all 50
  states and partnered with the nation's top-rated carriers, Synergy serves
  families across the country."*
- **§4 body** — `trust.body` is the **second sentence of `trust.p1`, verbatim**.
  A cut, not a rewrite. `trust.p1` and `trust.p2` are **retained untouched** in
  both files; restoring the full block is putting the two `<p>` tags back.
  *Why it was cut:* the copy column measured 688px against the images' 562px, so
  the copy — not the imagery — was setting the row height. Dropping p2 also
  removed a duplication: its first two sentences ship on the homepage as
  `carriers.subhead`.
- **§4 eyebrow** "Our approach" — an **authored interface label** under rule 4.
  Theirs reads "Dinner at SEM"; fflsynergy publishes nothing that fits.
- **Values** I Integrity / II Education / III Legacy — verbatim, incl. numerals
- **Pull-quotes** both verbatim (§3 from their About page, §6 from homepage)

---

## 7. The `.sem-*` scale — `app/globals.css`

Every number is **read off restaurantsem.com's computed styles** at three
viewports. None of their CSS is copied and none of their files are used.

|  | 1526 | 758 | 390 |
|---|---|---|---|
| page gutter | 41 | 36.5 | 19.07 |
| container max | 1476 | 1476 | 1476 |
| display h1 | 90.2/90.2 | 80.31/80.31 | 53.39/53.39 |
| section h2 | 57.4/68.88 | 51.11/61.33 | 45.77/54.92 |
| eyebrow | 21.32/25.58 | 18.98/22.78 | 17.16/20.59 |
| body | 21.32/38.38 | 18.98/34.17 | 17.16/30.89 |
| pull-quote | 75.44/113.16 | 52.57/73.59 | 38.14/57.21 |
| pill CTA | 16.4/24.6 | 14.6/21.9 | 15.26/22.88 |

Classes: `.sem-shell` (gutter) + `.sem-inner` (max-width 1476), `.sem-display`,
`.sem-h2`, `.sem-eyebrow`, `.sem-body`, `.sem-quote`, `.sem-pill`,
`.sem-pill-cta`, `.sem-pad-t`, and the gap vars `--sem-gap-lg` (131.2 desktop /
43.8 below), `--sem-gap-md` (32.8 / 29.2), `--sem-gap-logos` (49.2 / 43.8).

**Their ramp is STEPPED** (Webflow rem + breakpoints), not fluid — which is why
these are two-step rules rather than one clamp. A single clamp fitted to the
extremes misses their tablet value by 15px on the display size.

**Weight is the one thing we cannot match.** Theirs is Satoshi at 300
throughout; Kufam is loaded at 400/500 only and synthetic weights are forbidden.
Every display size here is **w400** — one step heavier at the same size.

**`.sem-pill-cta` inverts their label colour, and that is forced.** Theirs is
their gradient's top value on white. Ours would be `navy-lift` on cream — which
measures 11.65:1 and *would* pass, but `navy-lift` exists only as a background
token and has never been measured as text. So the pill is cream fill with
`navy #0D1B2A` label (15.87:1), which is already the site's button pairing
(SiteHeader's Join pill, the hero CTA). One button system, not two.
Hover → `gold-pale #EFE1B0`.

**The 38.14px pull-quote floor is load-bearing, not aesthetic.** It keeps the
quote **large text** at every width (threshold 24px), which is what lets the
word reveal's floor opacity be judged against 3:1 rather than 4.5:1.

---

## 8. Motion, and the new components

### `components/useParallax.ts` — existing, shared

| pairing | markup | values | safe band |
|---|---|---|---|
| Coverage | `top-[-30%] h-[160%]` | `±16`, scrub `true` | middle **30.5%** |
| Testimonials | `top-[-15%] h-[130%]` | `±10`, scrub `true` | middle **56.9%** |

**The safe band is the part of the source visible at *every* scroll position.**
It is the constraint that chooses photographs. Under the deep pairing a 30.5%
band is narrower than any ordinary photograph of people — 23 human-subject
frames were tested and every one cropped a head at one extreme or both. The
shallow pairing is what allows people in a parallax section at all. **Do not
"upgrade" a section to the deeper pairing without re-verifying its image.**

⚠️ **NEW: a `scrub` option was added** (`boolean | number`, default `true`). A
number gives GSAP that many seconds to catch up — a damped follow rather than a
locked scrub. It exists because the reference's grid parallax is a Webflow
`SCROLLING_IN_VIEW` continuous action with `smoothing: 50`. **Added as an option
rather than a change of default**, so Coverage and Testimonials keep the exact
feel they were tuned to. **Only the About page passes it, and it passes `0.5`.**

### The two new hooks — **BUILT**

**`components/useWordReveal.ts`** — the pull-quote reveal. Splits the rendered
string into word spans, GSAP ScrollTrigger `scrub: true`, `start: top 70% → end:
top 20%`, `stagger 0.8`, `duration 0.4`, `power1.out`.

- **The split happens at runtime on `element.textContent`**, never in the
  message file. A translator types a sentence, not a span-per-word structure
  whose word count has to match the English. Whitespace is preserved as its own
  text node so wrapping is unchanged.
- 🔴 **THE FLOOR IS 0.45, NOT THEIR 0.2, AND THAT IS A CONTRAST FIX.** A
  scrubbed reveal holds un-illuminated words at the floor for as long as the
  reader is above `top 20%` — an indefinite on-screen state, not a transient
  frame. Measured on the real composite against the gradient stop each quote
  sits on:

  | alpha | quote 1 (t≈0.18) | quote 2 (t≈0.62) |
  |---|---|---|
  | 0.20 | 1.79 | 1.84 ← their value, **fails** |
  | 0.40 | 3.18 | 3.43 |
  | **0.45** | **3.61** | **3.94** ← shipped |

  Cost: illumination range narrows from 5× to 2.2×. Worth it.
- Cleanup restores the original single text node — killing the tween mid-scrub
  would otherwise leave spans at fractional opacity permanently.
- **Reduced motion:** returns before importing GSAP. No split, full opacity.

**`components/useStickyZoom.ts`** — the §7 image zoom. 300vh runway, `scale 0.5
→ 1.0`, origin centre.

- 🔴 **THE PIN IS CSS `position: sticky`, NOT ScrollTrigger's `pin: true`.**
  GSAP's pin rewrites the document (pin-spacer + `position: fixed`), which under
  Lenis takes the pinned element out of the smoothed scroll context while its
  neighbours stay in it — the card judders by a frame against the sections
  above and below. Sticky is composited by the browser and cannot desynchronise.
  GSAP is left doing one thing: scrubbing one transform.
- `start: "top top"`, `end: "bottom bottom"` — **not** `top bottom`, which would
  burn half the zoom while the card is still travelling up the screen.
- **Reduced motion:** runway collapses to `100svh` via `motion-reduce:` classes,
  sticky → static, `scale-100`. **Full-bleed, not frozen at 0.5** — freezing an
  effect at its start ships a half-scale image nobody asked for.

### The four new About components

| file | what |
|---|---|
| `AboutPullQuote.tsx` | §3 / §6. `<blockquote>`, no heading level, **no measure cap** — the container is the measure, as theirs is (x51, width 1424 of 1444) |
| `AboutZoom.tsx` | §7. 300vh runway + sticky child + `<Image fill sizes="100vw">` |
| `AboutParallaxImage.tsx` | contained image on the Testimonials pairing at `scrub: 0.5` |
| `AboutValueColumn.tsx` | §5 per-column drift. **The `<li>` is the trigger and stays untransformed**; an inner div takes the transform, or ScrollTrigger would feed its own offset back into the cached start/end on refresh |

`AboutValueColumn` only drifts above **1280px** (`SIDE_BY_SIDE`), live-tracked
via `matchMedia`. Below that the grid is one column and drifting neighbours by
±68px made them **overlap by 20px** — the bottom of one photo sliding under the
next label.

### `components/RouteTheme.tsx` — the dark-route canvas

Three separate cream-flash risks, three different fixes:

1. **Cream flash on client-side navigation** — fixed in the markup by the page's
   own `min-h-screen` gradient wrapper, which paints in the first frame.
2. **Overscroll rubber-banding** — **this file.** The area revealed beyond the
   document is painted from the CANVAS background, propagated from `<body>`
   (`bg-cream`). **No wrapper can fix that**, because the wrapper is not what is
   exposed — its absence is. Only `html`'s background reaches there:
   `html[data-route-theme="dark"] { background-color: #0d1b2a }`.
   iOS Safari is the real case; it rubber-bands at both ends by default.
3. **Restoring cream on the way back** — the effect's cleanup, verified by
   rendering.

**An attribute, not an inline style:** `documentElement.style` is a single
shared slot and two components that both want it fight, with the loser silently
winning on unmount order.

**First paint:** an inline `<script>` sets the attribute while the HTML is still
parsing, so a hard load of `/about` never flashes. Consequence: React sees an
attribute its server render did not emit, so **`app/[locale]/layout.tsx` carries
`suppressHydrationWarning` on `<html>`** — a nested route cannot contribute
attributes to `<html>` in the App Router, so there is no way to make them agree.
It covers that element's own attributes only; `lang` is the one other attribute
in scope and is derived from the same `locale` on both sides.

### `components/SiteHeader.tsx` — three orthogonal axes now

Do not conflate them.

- **`data-compact`** (position-driven): `solid = compact || !isHeroRoute`.
  Threshold `COMPACT_AT = 60`. Decides **whether** the bar has a surface.
- **`data-surface`** (route-driven, **NEW**): `dark` on `/{locale}/about`,
  `light` everywhere else. Decides **which** surface — dark paints `#0D1B2A`
  with cream ink, 15.87:1, the same pairing the footer ships, so the page opens
  and closes on the same surface. **It is DECLARED, not sniffed** — reading the
  pixels behind the bar would be a scroll-time measurement running every frame
  and still wrong for one frame after any navigation. Route-scoped by
  construction: every other route renders `light`, which no CSS rule targets.
- **`data-hidden`** (direction-driven): `HIDE_AFTER = 160`, `DIR_DELTA = 8px`
  **accumulated, resetting on direction change** — not a timer, because a timer
  adds latency to the one gesture that must feel instant. 8px because Lenis at
  `lerp: 0.1` emits sub-pixel deltas every frame. Never hidden below 160, never
  while focus is inside the header, never while the mobile menu is open.
  **Reduced motion: stays put** — switched off, not made instant.

**`/about` is in `isHeroRoute`, and it earned that by having a hero.** The rule
is a property of the page: does the first viewport contain a full-bleed
photograph dark enough to carry white ink? Homepage yes. `/about` yes.
`/calculator` **no** — it opens on cream, where a transparent bar would paint
`#FFFFFF` on `#F8F4EE` at 1.11:1 and vanish.

> The reference nav never takes a surface at any scroll position. **Ours cannot
> copy that** — below the fold our bar travels over the §2b logo row and the §5
> image grid, where white ink would sit on arbitrary photograph.

#### 🔴 Three traps in this file, all of them already paid for

1. **`NavLink` IS DECLARED AT MODULE SCOPE. DO NOT MOVE IT BACK INSIDE
   `SiteHeader`.** It lived inside the component body for one commit and made
   every header link unclickable. A component declared inside another
   component's body is a new function identity every render, so React unmounts
   and remounts the subtree. Pressing the mouse focuses the link → `focusin` →
   `setFocusWithin(true)` → re-render — **between mousedown and mouseup**. The
   `<a>` that got mousedown is detached before mouseup lands, so the browser
   never synthesises a `click`. Measured in real Chrome: `isConnected === false`
   at mouseup. **It survived automated testing** because a synthetic
   `element.click()` bypasses the browser's down/up pairing entirely. Only a
   real pointer press catches it.
2. **The mobile menu panel is a SIBLING of `<header>`, not a child.**
   `transform` makes an element the containing block for its `position: fixed`
   descendants, so nesting it sized the `fixed inset-0` panel to the 64px bar —
   measured 753×64 instead of 753×1024. Setting `transform: none` on the bar
   does **not** fix it: `transform` is in the bar's transition list, so it
   resolves to an identity **matrix**, and an identity matrix still creates the
   containing block.
3. **A route change resets scroll but not the bar's memory of it.** SiteHeader
   is mounted in the layout so it does not remount on client-side nav, and
   Next's scroll reset does not reach the scroll listener because Lenis swallows
   most native scroll events. Measured: scroll to the bottom of `/en/about`,
   click Home, and the homepage arrives at scrollY 0 with `data-compact="true"`
   and `data-hidden="true"` — a compacted bar translated off the top, over a
   hero expecting the tall transparent one. Fixed by a `useEffect` on
   `pathname` that forces `hidden=false` and recomputes `compact` from the real
   position. **`setTimeout`, not `requestAnimationFrame`** — rAF does not fire
   in a non-compositing tab, which would strand the bar off-screen in exactly
   the case hardest to notice.

**Current page is marked twice, on purpose:** `aria-current="page"` (machine)
plus an underline driven off that attribute in `globals.css` (visible). The
underline is a **shape, not a colour** — 1.4.1 is not satisfied by colour alone,
and the bar carries three different ink colours across its states. The rule is
drawn in `currentColor`.

### Other motion

`FadeUp` (24px / 600ms / `cubic-bezier(0.16,1,0.3,1)`, +80ms per `index` step),
Ken Burns on the hero, carrier marquee, `Splash` (clip-path wipe, once per real
document load, does not replay on client-side navigation).

---

## 9. 🔴 The deliberate divergences from the reference

**These are decisions, not omissions. Do not "fix" them back toward the
reference.** Each is recorded in a `⚠️`-marked comment at its call site.

| # | theirs | ours | why |
|---|---|---|---|
| §4 pair | 376 × 564 and 501 × 564 — **different widths** | **equal**, 437 × 562 each, tops flush, bottoms flush | asked for. The numbers are still theirs: the pair keeps their total image span (376 + 32.8 + 501 = 909.8 of 1444) and their 32.8 gap, split evenly to 438.5 each → tracks `0.875fr 0.875fr 1fr`, height ratio 0.7775 |
| §4 pair | — | **no `margin-top` on either** | a 131.2px offset lived here briefly and was removed. It never matched the reference (measured live at 1536 **and** 820: both wraps at the same document y, `margin-top: 0`, `transform: none`) and it made the pair *look* unequal at most scroll positions, because the upper image's top edge was routinely clipped by the viewport or hidden under the header while the lower one was fully visible |
| §4 pair | — | **both `FadeUp index={0}`** | `index={1}` added 80ms on a 600ms fade, so for most of the reveal one image was fully painted and the other at zero opacity |
| §4 pair | — | **no parallax** | resolution. A parallax layer is 130% of the box, raising the bar from 874×1124 to 874×1461 at 2× DPR; Synergy's own frames fail that by 13.6% and 21.3%. **The images won.** To restore: swap the `<Image>` tags for `<AboutParallaxImage>` and accept the upscale, or go to licensed stock |
| §5 columns | staggered `margin-top: 0 / 131.2 / 262.4` | 🔴 **NO STAGGER — 0 / 0 / 0** | asked for, and the same call already made for §4. **All three tops on one line, all three bottoms on one line.** Verified rendered at 1536: tops `3253.95` ×3, bottoms `4023.02` ×3; at 1280: tops `3041.18` ×3, bottoms `3718.81` ×3 |
| §5 columns | column drift only | column drift **and** image parallax | the image parallax was asked for separately. **Theirs does not do it.** Drop it by swapping `AboutParallaxImage` for a plain `<Image>` |
| §5 | opacity **not animated** (measured 1/1/1 everywhere) | `FadeUp` entrance | ours; the reference has no fade at all on this section |
| §4 copy | **pill CTA** between heading and body ("Food with a story" → their story page) | 🔴 **no CTA at all** | **no honest destination exists.** `routes.ts` lists three built routes. `/calculator` is not what this section is about; `/about#about-story` sends the reader back up to a paragraph they passed thirty seconds ago; `/#why-heading` is real but leaves the page and is not a story. **It comes back when a Services or Story page exists.** `.sem-pill` / `.sem-pill-cta` are retained in `globals.css`, `about.trust.ctaLabel` is retained untouched in both message files, and `about/page.tsx` has no `next/link` import as a result — the restore recipe is in the comment at the call site |
| §1 hero | **no headline at all** | h1 + sub | a silent photograph doesn't survive semantics or SEO |
| §2b | award/press logo grid | five carrier wordmarks | fflsynergy has no awards or press logos |

### What §5's drift still is, and it is unchanged

Measured live on the reference: **col 1 drifts DOWN, col 2 is STATIC AT 0 for
the whole range, col 3 drifts UP.** Observed extremes `+225 / 0 / −233`.
`COLUMN_DRIFT` in `about/page.tsx` is `{-10,10} / {0,0} / {10,-10}` — magnitude
is the **shipped ±10** from `useParallax` (≈ ±76.9px rendered), not their ±225,
because ±10 is a value this project already ships and tuned. **Only the SIGN
varies per column**, which is a direction, not a new number — and the middle
column's 0 is their own measured value, not a disabled effect.

Both the column and the photograph inside it run `scrub: 0.5`, derived from
their `smoothing: 50`, so they ease on the same curve instead of fighting.

---

## 10. Open items

### ✅ Compliance — four contaminated strings, DONE (`9db65f1`)

A catalogue scan found **four**, not three. **`next-intl` serialises the entire
message catalogue into every page's HTML**, so all four were readable in
view-source on every route even though only one painted.

| key | resolution |
|---|---|
| `whoWeServe.families.c2.b1` | → "Appointments with multiple top-rated carriers" |
| `carriers.subhead` | → fflsynergy "Built on Trust" block, verbatim |
| `carriers.subheadWithCount` | **key and `count >= 15` branch deleted** |
| `two.agents.body` | 🟡 **INTERIM** — was near-verbatim Checkmate. Now the fflsynergy footer line |

Verified: zero occurrences in the rendered page **and** zero in the full HTML
source.

🟡 **Still owed:** `two.agents.body` is a placeholder. fflsynergy has **no
agent-recruiting copy anywhere**. (`TwoWaysIn` is no longer rendered, but the
string still ships in the catalogue on every page.) **Open question for Ziad: is
`join.fflsynergy.com` in scope as a copy source?**

### ✅ Lead form — disabled, no longer lies (`9db65f1`)

It previously ran `preventDefault(); setSent(true)` — showing "Thanks — we'll be
in touch" while **sending nothing anywhere**. A fake success is worse than a
visibly broken form: the client believes a lead was captured and it silently was
not.

Now (`components/LeadModal.tsx`): fields stay **visible** (they show what will
be collected) inside a `<fieldset disabled>`, submit is disabled, and an honest
notice replaces the privacy line. Verified — all four fields match `:disabled`
and refuse focus, submit fires no submit event, no success state is reachable,
and `Close` is the only focusable element so focus cannot strand.

> "This form isn't connected yet."
> "Your details won't be sent anywhere and no one will be contacted. Call 407-434-0400 to speak with a licensed advisor in the meantime."

**To restore:** wire the POST, drop `disabled` from the fieldset and the button,
restore the `onSubmit` handler, swap the notice back to `leadModal.privacy` —
retained untouched in both message files.

### 🟡 Placeholder strings — hidden, not fixed

`testimonials.eyebrow` and `testimonials.disclaimer` still contain literal
`[PLACEHOLDER — …]` text in `messages/en.json` (lines ~246–247) and were
rendering on the deployed preview. Hidden behind `HEADER_ASIDES_READY = false`
at `components/Testimonials.tsx:68`, which hides the eyebrow **and** the
results-disclaimer.

**Restore in one step:** set it `true` and replace both strings. The heading
moves back to column 3 on its own. 🔴 **The disclaimer is a legal
results-disclaimer for a US insurance site — the wording comes from the client.
Do not write one.**

### ✅ §4 pill CTA — REMOVED, and it stays removed until a page exists

Decided and shipped. See §9 for the reasoning and the restore recipe.
`about.trust.ctaLabel` ("Open the retirement calculator") is **retained
untouched** in both message files but is read by nothing. It will need
re-approving against whatever the new destination turns out to be — a label
naming a calculator cannot be reused for a story page.

### 🟡 Blocked on Ziad

- **Founder bio + portrait for About §8** — and *only* a real portrait; see §6
- **Results-disclaimer wording**
- **Carrier logo files for About §2b** — appointments confirmed, artwork not
  sent. Five files needed
- **Original camera files for the About hero** — the current photo is licensed
  stock and is explicitly a placeholder
- **Regulatory disclosure / licence number.** fflsynergy carries **none**
  anywhere. Checkmate's footer does: *"Licensed insurance agency. Coverage is
  subject to underwriting approval… This site does not constitute an offer of
  insurance…"* A Florida life-agency footer would normally carry at least a
  licence number and a "not an offer of insurance" line. **Do not write one.**
- **Privacy policy and terms of service** — §4
- **Address `5728 Major Blvd Suite 702` is unverified and IS shared with
  Checkmate** — their JSON-LD carries the same building and suite. The phone
  `407-434-0400` is **not** shared; Checkmate's only number is `833-997-6934`
- **Light/horizontal logo lockup** — §11
- Whether `join.fflsynergy.com` is an approved copy source

### 🟡 Still to sign off (built, shipping, reversible)

- The §5 value imagery (licensed stock — one line each in `VALUE_IMAGES`)
- `value-legacy.jpg` is markedly the brightest of the three (L 0.597) — a bright
  card against a dark gradient. A look to sign off, not a defect; no text on it
- The §4 pair sharing one room — unavoidable from Synergy's current material
  (§11). Needs original camera files, not a re-crop

---

## 11. Images

Full derivations, licence lines, rejected candidates and AA tables live in
**`public/synergy/CREDITS.md`**. Read it before touching imagery.

### 🔴 Filenames conceal duplicates. Check the SOURCE GALLERY ID.

Synergy's gallery frames were cropped more than once under different names, and
the `gallery-` names describe the crop rather than the photograph. **Three
distinct portrait photographs exist. Six filenames point at them.**

| photograph | files that are the SAME image |
|---|---|
| **g11** — a man with a microphone at a "Hone Your Skills & Knowledge" slide | `gallery-advisor-explaining.jpg` (1000×1250) · `gallery-training-session.jpg` (1080×1150) · `why-g11.jpg` (1080×1150) |
| **g8** — two people standing, one speaking, a portrait on the screen behind | `gallery-leadership-panel.jpg` (1206×1263) · `gallery-team-presentation.jpg` (1100×1375) · `why-bilingual.jpg` (16:9 crop) |
| **g2** — a colleague applauding, the same speaker with a mic at right | `gallery-team-meeting.jpg` (1000×1250) |

**This caused a real defect, and fixing it needed two passes.**

1. §4-right was `gallery-training-session.jpg` while §2 used
   `gallery-advisor-explaining.jpg` — **the same photograph, twice on one
   page**, under two names.
2. Moving §4-right to g2 fixed the duplicate *image* but left a duplicate
   *person*: **g8 and g2 both contain the woman with the microphone**, so the
   §4 pair had the same face in both halves of one row.

**Final arrangement — §2 takes g8, §4 runs g11 + g2**, which share nobody.
Every photograph and every person now appears once.

### The About page's images as shipped

| slot | file | source | note |
|---|---|---|---|
| §1 hero | `about-hero-family.jpg` | Pexels `5638414`, 8224×5483 held at 3840×2560 | 🟡 **PLACEHOLDER** for Synergy's own |
| §2 | `gallery-team-presentation.jpg` | Synergy **g8**, 1100×1375 | **exactly 4:5, so this slot performs NO crop at all.** Box renders 465×581 → 930×1163 at 2× → **+18.3%** |
| §4 left | `gallery-advisor-explaining.jpg` | Synergy **g11**, 1000×1250 | crop 972×1250 vs 874×1124 → **+11.2%** |
| §4 right | `gallery-team-meeting.jpg` | Synergy **g2**, 1000×1250 | crop 972×1250 vs 874×1124 → **+11.2%** |
| §5 ×3 | `value-integrity` / `-education` / `-legacy` .jpg | Pexels `6814528` / `8439647` / `8317698`, 1200×1800 | 🟡 **PROVISIONAL** licensed stock |
| §7 | `about-zoom.jpg` | Pexels `36777966`, 8000×5338 held at 3840×2562 | no people, so the 0.5→1.0 crop range has no face-crop failure mode |

All Pexels files carry the **Pexels License** — exact line: *"All photos and
videos on Pexels are free to use."* / *"Attribution is not required."*

### 🔴 §4 is two different moments in the SAME room, and it cannot be fixed

Both frames are Synergy's own, from `fflsynergy.com/gallery`, cropped at the
same **71.0%** of source height that every other `why-`/`gallery-` file uses, to
remove the SYNERGY wordmark across the lower ~29%. Both checked clean of
third-party branding at full size.

**"Two different rooms" is not available from Synergy's material.** The entire
usable gallery is one Orlando training room plus a team dinner and an office
floor, and the latter two are landscape. Measured against the box's 874×1124
requirement at 2× DPR:

| candidate | crop to 0.7775 | vs 874 × 1124 |
|---|---|---|
| **g11 `gallery-advisor-explaining`** | 972 × 1250 | **PASS +11.2%** ← §4 left |
| **g2 `gallery-team-meeting`** | 972 × 1250 | **PASS +11.2%** ← §4 right |
| g11 `gallery-training-session` | 894 × 1150 | PASS +2.3% — same photo, tighter crop, **not used** |
| g8 `gallery-team-presentation` | 1069 × 1375 | PASS +22.3% — **spent on §2** |
| g8 `gallery-leadership-panel` | 982 × 1263 | PASS +12.3% — same photo as above, **not used** |
| `why-g1` / `why-g3` landscape | 596 × 766 | **FAIL −31.8%** |
| `why-overlooked` | 385 × 495 | **FAIL −56.0%** |

Reported rather than upscaled, per rule 9.

**Every candidate that would give a second room fails on resolution**, and by a
margin no amount of `object-position` recovers. Sourcing a second room means
asking Ziad for original camera files, not re-cropping what exists.

### Synergy's own images cannot carry a full-bleed slot

**"Safe to vw" = widest viewport a full-bleed slot serves at 2× DPR without
upscaling.**

| file | pixels | safe to |
|---|---|---|
| `why-g1` / `why-g10` / `why-g3` | 1620 × 766 | **810** |
| `why-itin` | 1400 × 933 | 700 |
| `why-bilingual` | 1206 × 678 | 603 |
| `gallery-leadership-panel` | 1206 × 1263 | 603 |
| `gallery-team-presentation` | 1100 × 1375 | 550 |
| `why-g11` / `why-g12` / `gallery-training-session` | 1080 × 1150 | 540 |
| `gallery-team-meeting` / `-advisor-explaining` | 1000 × 1250 | 500 |
| `why-overlooked` | 880 × 495 | 440 |

The best is 1620px, soft above an 810px viewport. **Fine for contained slots.
Not for heroes or full-bleed.**

### 🔴 Excluded for third-party branding — the full list

`g5` (Checkmate Financial Group on a screen), `g6` ("Checkmate TV" AirPlay
dialog), `g7` and `g13` (AlphaMed signage), `g9` (consumer branding),
**`g10` (a BALMAIN belt buckle)**, **`g12` (a Gucci GG belt buckle)**.

`g10` and `g12` remain in the repo as `why-g10.jpg` / `why-g12.jpg`, referenced
only from the **commented-out eight-row block in `WhySynergy.tsx`** — they do
not ship, but uncommenting that block would ship them.

`why-overlooked` already crops out an **LG** monitor mark; every `why-*` has the
Synergy watermark band cropped off.

### 🟡 Logo

`components/Logo.tsx` has `variant="dark"` (gold artwork as supplied) and
`variant="light"` (wordmark recoloured to ink). **Neither is a horizontal cream
lockup.** The footer uses `dark` — the artwork unmodified, nothing recoloured
and no mark invented — but it is a near-square crest in a slot the reference
fills with a wide wordmark. A horizontal lockup is still wanted from the client.
Contrast is not the blocker: logotypes are exempt from 1.4.3 and 1.4.11.

---

## 12. Repo, build, deploy

### Git — ⚠️ NOTHING SINCE `1e4bb08` IS COMMITTED

The project had **no version control for weeks**. Initialised during this work.

- `main` — `764f5cc`, the whole project as first committed
- `preview/client-review` — **`1e4bb08`**, current working branch
- **No remote configured**

🔴 **The entire About page is UNCOMMITTED WORKING TREE.** `git status` shows 10
modified files and 12 untracked paths, including `app/[locale]/about/`,
`routes.ts`, all four `About*.tsx` components, both new hooks, `RouteTheme.tsx`
and seven image files. **Losing this working tree loses the About page.** Commit
it early.

```
M app/[locale]/layout.tsx      M components/SiteHeader.tsx
M app/globals.css              M components/useParallax.ts
M components/Footer.tsx        M messages/en.json
M components/Hero.tsx          M messages/es.json
M public/synergy/CREDITS.md    M tailwind.config.ts

?? routes.ts                   ?? app/[locale]/about/
?? components/AboutParallaxImage.tsx   ?? components/AboutPullQuote.tsx
?? components/AboutValueColumn.tsx     ?? components/AboutZoom.tsx
?? components/RouteTheme.tsx           ?? components/useStickyZoom.ts
?? components/useWordReveal.ts
?? public/synergy/{about-hero-family,about-zoom,gallery-leadership-panel,
                   gallery-training-session,value-education,value-integrity,
                   value-legacy}.jpg
```

> **Two of these image files are now unreferenced** and are kept, not deleted:
> `gallery-training-session.jpg` (a tighter crop of g11, superseded by
> `gallery-advisor-explaining.jpg`) and `gallery-leadership-panel.jpg` (a
> wider crop of g8, superseded by `gallery-team-presentation.jpg`). Both were
> added during this work and both are duplicates of a photograph the page
> already ships. Deleting them is safe; keeping them costs 222 KB and preserves
> the alternative crops.

`.gitignore` excludes `node_modules`, `.next`, `.next-build`, `*.tsbuildinfo`,
`next-env.d.ts`, `.env*` (a guard — none exist, nothing reads them), `.vercel`,
OS noise. **`public/` is tracked in full** (38 MB, including a 13.1 MB
`hero-video.mp4`); the build needs it.

### Build

```bash
npx tsc --noEmit
```

```bash
NEXT_DIST_DIR=.next-build npx next build
```

**Always set `NEXT_DIST_DIR` for a production build.** A build writing into
`.next` while a dev server serves from it corrupts the running server's
manifests. Both must pass with nothing disabled — there is no
`ignoreBuildErrors` and none may be added.

Dev server: `.claude/launch.json` defines `synergy-dev` on port 3000 with
`autoPort` — start it through the preview tooling, not Bash.

### Deploy

**<https://synergy-umber.vercel.app> — public, verified anonymous, HTTP 200.**

1. **This is the *production* alias, not a preview.** `vercel deploy --yes` on a
   fresh non-git project promoted the first deployment to production. Use
   `--target=preview` explicitly.
2. **Vercel Authentication (Standard Protection) is ON** for project `synergy`.
   The deployment-specific URL redirects to `vercel.com/login` via `/sso-api`.
   Standard Protection exempts the production domain, which is the only reason
   the alias above is public. **A preview URL will be gated.** Setting is
   Project → Settings → Deployment Protection → Vercel Authentication.
   **Do not change project or account settings** — report and let the client do
   it.

### Not wired, and nothing breaks by their absence

GA4, Meta Pixel, GHL webhook. **No code references any of them.** The only
`process.env` read in the codebase is `NEXT_DIST_DIR`.

**The verdict sentence is unbuilt, not flagged.** Earlier notes claimed
`calculator.verdict.difference` sat behind `NEXT_PUBLIC_VERDICT_ENABLED`. **That
was wrong.** There is no such env var, no gate, and no `.env` file. The string
exists in both message files and nothing reads it. It is off because it was
never built and cannot ship by accident. When the client signs off, build the
feature and its gate together.

---

## 13. What is commented out — **do not delete any of this**

| where | what | why |
|---|---|---|
| `app/[locale]/about/page.tsx` (after §7) | the whole **§8 Staff** `<section>` | 🔴 awaiting founder bio + portrait — §6 |
| `app/[locale]/page.tsx:15` | `import Calculator` | moved to `/[locale]/calculator`; component and route both live. Only the homepage call site is commented |
| `app/[locale]/page.tsx:42` | `<Calculator />` | as above — kept so the old page order is recoverable |
| `app/[locale]/page.tsx:21` | `import TwoWaysIn` | section removed from the page; component kept |
| `app/[locale]/page.tsx:22` | `import Carriers` | full section stashed; its `APPOINTMENTS` array now feeds `CarrierStrip` |
| `components/Footer.tsx` | the whole **Legal `<nav>`** | 🔴 `/privacy` + `/terms` are blocked — §4, §5 |
| `components/Hero.tsx` | the second CTA (`hero.ctaQuote`) | removed, not commented — string retained in both message files |
| `components/Testimonials.tsx:68` | `HEADER_ASIDES_READY = false` | hides the eyebrow **and** the results-disclaimer — §10 |
| `components/WhySynergy.tsx` | the eight-row block | ⚠️ references `why-g10` / `why-g12`, which carry **Balmain / Gucci** buckles. Uncommenting ships them |
| `components/Nav.tsx` | whole file | superseded three-zone nav, rendered nowhere. `SiteHeader` replaced it |
| `components/Calculator.tsx` | superseded layout, in the docblock | kept for revert |
| `routes.ts` | the `UNBUILT` list | six routes, recorded so restoring one is three lines |

`Calculator.headingLevel` (default 2) exists **only** so the calculator's
section header can be the `h1` on its own page. Keep it.

---

## 14. Testing traps — these will waste your time

1. **The Browser pane does not composite.** CSS transitions never advance in it,
   `computer{action:"screenshot"}` fails outright when the pane is not
   displayed, and **lazy `next/image` never fires its IntersectionObserver**, so
   `naturalWidth` reads 0 no matter how far you scroll. Force a load with
   `img.loading='eager'; img.setAttribute('src', img.getAttribute('src'))`, or
   `curl` the `/_next/image?url=…&w=…` derivative directly. Use the pane for
   layout geometry and DOM reads; use **real Chrome** for anything animated.
2. **The pane is DPR 1**, so it picks the `w=640` derivative where a real
   retina client picks `w=1080`. Resolution claims must be arithmetic against
   the source, not read off `naturalWidth` in the pane.
3. **Programmatic `window.scrollTo` does not drive Lenis or Webflow
   interactions.** Use `window.lenis.scrollTo(y, {immediate:true})` or real
   wheel events.
4. **`element.focus()` does not dispatch `focusin` when `document.hasFocus()` is
   false.** In automation this makes working focus handlers look broken.
5. **A synthetic `element.click()` cannot catch the mousedown/mouseup unmount
   bug** — see §8's `NavLink` note. Nav must be verified with a real pointer.
6. **Dev-server error logs are a buffer.** Errors from a transient mid-edit
   state persist in `preview_logs` long after the code is fixed. Check recent
   request status codes, not the error tail.
7. **Measure §5's resting positions on the `<li>`, not the inner div.** The
   `<li>` is untransformed by design; the drift lives on its child. `offsetTop`
   is also transform-immune and is the cleaner read.
