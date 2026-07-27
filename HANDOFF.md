# Synergy Insurance Group — project handoff

**Written for a session with zero memory of any previous one.** Everything you
need to continue is here or is pointed at from here. Read the Standing Rules
first; they are not negotiable and they are the reason most decisions on this
project look the way they do.

> **Note on this file.** The previous handoff was never committed to the repo —
> at the time of writing, the only tracked Markdown was
> `public/synergy/CREDITS.md`. Several code comments refer to "the handover
> notes"; those referred to a document that does not exist in version control.
> This file replaces it and is now the single source of truth. Where a code
> comment says "see the handover notes", it means this file.

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
  missing **or empty** key, so an untranslated page is a working English page

**Live preview:** <https://synergy-umber.vercel.app> — public, no login.
See §11 for why that is the production alias and not a preview URL.

---

## 2. Standing rules — unchanged, non-negotiable

1. **Copy comes only from <https://fflsynergy.com/>.** Never invent copy to fill
   a slot. An empty slot is reported to the client, not filled.
2. **Every proposed line is checked against
   <https://checkmatefinancialgroup.com/>.** The two agencies share a building
   and there is a known lifted-copy problem. Match found → keep the meaning,
   rewrite the phrasing.
3. **Attributed quotes are never reworded.** Ship verbatim or drop.
4. **Interface labels may be authored** — nav items, column headings, CTA labels.
   A wayfinding label names a destination; it asserts nothing about the business.
   Anything that says something *about Synergy* comes from fflsynergy.
5. **Nothing is written to `messages/en.json` without explicit approval**, with
   the source line quoted.
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
   scroll range for anything that moves.
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
| `ink` | `#1A1A1A` | **0.0103** | body text on light |
| `gold` | `#C9A84C` | 0.4094 | borders, icons, and **text on navy only** |
| `gold-pale` | `#EFE1B0` | 0.7534 | hover + focus rings on dark |
| `gold-deep` | `#7D641F` | 0.1357 | the only legal gold **text on light** |
| `amber` | `#E0A458` | — | rules and washes only |
| `amber-deep` | `#8A5312` | — | amber text on cream (calculator figure) |
| **`navy-lift`** | **`#1C3A5A`** | **0.0401** | **PROPOSED, NOT YET APPROVED** — see below |

### ⚠️ The finding that must survive: navy and ink are luminance-identical

`navy #0D1B2A` is **L 0.0104**. `ink #1A1A1A` is **L 0.0103**.

They differ in hue, **not in brightness**. A gradient from navy to ink has a
luminance descent of **1.00×** — it looks like nothing is happening. This was
discovered while designing the About page, whose whole effect depends on a
descent. For reference, the source page's own gradient descends **7.26×**.

**Anyone reaching for "navy to ink" to create depth is making a mistake.** Our
palette has no mid-tone between `greige` (0.816) and `navy` (0.0104).

`navy-lift #1C3A5A` was solved backwards from the gold constraint, not chosen by
eye:

```
gold #C9A84C as NORMAL text (4.5:1)  →  background must be L ≤ 0.0521
gold #C9A84C as LARGE  text (3.0:1)  →  background must be L ≤ 0.1031
```

`#1C3A5A` at L 0.0401 is the lightest navy that keeps gold legal as *normal*
text with real margin. `#204264` (L 0.0512) lands on 4.54:1 — too close to ship.

**Gold and cream across the full `#1C3A5A → #0D1B2A` run:**

| down | colour | bg L | gold | cream | gold-pale |
|---|---|---|---|---|---|
| 0% | `#1C3A5A` | 0.0401 | **5.10** | 10.63 | 8.92 |
| 25% | `#18324E` | 0.0305 | 5.71 | 11.90 | 9.98 |
| 50% | `#152B42` | 0.0224 | 6.35 | 13.24 | 11.10 |
| 75% | `#112336` | 0.0157 | 6.99 | 14.58 | 12.23 |
| 100% | `#0D1B2A` | 0.0104 | **7.61** | 15.87 | 13.31 |

Descent **3.87×**. Gold worst case **5.10:1**. `gold-deep` is **unusable** on
this run — 2.06:1 at the top.

### Type

- **Display** — Kufam, `var(--font-display)`, **max weight 500, never bold**
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

## 4. Homepage — `app/[locale]/page.tsx`

Order as shipped:

| # | component | what it is |
|---|---|---|
| 1 | `Hero` | full-bleed video/poster, VEX spec, headline + two CTAs |
| 2 | `CarrierStrip` | slim marquee band, 12 carrier names as **text wordmarks** |
| 3 | `WhatWeCover` | full-bleed parallax photo, translucent cards |
| 4 | `WhoWeServe` | tabbed Families / Agents, three cards each |
| 5 | `WhySynergy` | eight alternating image/text rows |
| 6 | `Testimonials` | full-bleed parallax photo, three quote cards |
| 7 | `HowItWorks` | three process cards on photos, glass panels |
| — | *`Calculator`* | **commented out — see §8** |
| 8 | `Consultation` | full-bleed parallax photo, glass panel, CTA → calculator |
| — | `Footer` | site-wide, mounted in the layout |

`SiteHeader` and `Splash` are mounted in `app/[locale]/layout.tsx`, so they are
on every route. `Footer` is mounted there too, **inside `SmoothScroll`**.

### Routes that exist

- `/[locale]` — homepage
- `/[locale]/calculator` — the retirement calculator, its own page

**Everything else 404s.** 8 footer routes (`/about`, `/services`, `/blog`,
`/gallery`, `/contact`, `/privacy`, `/terms`) plus 17 `href="#"` stubs in the
header and hero. This is known and agreed — they are honestly unbuilt.
`Join Us` → `https://join.fflsynergy.com/` is the one external link that works.

---

## 5. About page — `/[locale]/about` — **DESIGNED, NOT BUILT**

Modelled on the **entire homepage of <https://www.restaurantsem.com/>**, section
for section, with Synergy's content. **Nothing is built yet.** Copy is proposed
and unapproved; no keys are in `en.json`.

### What makes the reference page work

**No section has a background.** Every one is transparent. The whole non-hero
column sits on **one continuous gradient** on a single 8,036px wrapper:
`#265C78 → #1E1E1E at 75%`. You scroll from daylight into darkness. There are no
colour blocks, no rules, no cards marking boundaries. That single gradient does
most of the emotional work. Ours is `navy-lift #1C3A5A → navy #0D1B2A`, ending
on exactly the footer's colour so that seam disappears.

### The mapping — their 8 sections + footer

| # | theirs | height | mechanism | ours |
|---|---|---|---|---|
| 1 | Hero | 658 (100vh) | static, **no headline at all** | ✅ h1 "We Are Synergy" + sub. **We add a headline** — theirs is a silent photograph, which doesn't survive semantics or SEO |
| 2 | Info | 1248 | IX2 entrance reveal | ✅ "Our Story", 3 paragraphs, image right |
| 2b | *5-col award/press logo grid* | — | — | ❌ **DROPPED.** fflsynergy has no awards or press logos, and our carrier marks are text only. Text names where they have logos reads as a placeholder |
| 3 | Pull-quote #1 | 715 | **GSAP scrub**, 30 word-spans, opacity 0.2→1, stagger 0.8, `start: top 70% → end: top 20%` | ✅ *"Insurance is not a product. It is a promise."* |
| 4 | Food & Drink | 826 | IX2 reveal | ✅ homepage "Built on Trust. Driven by Results." block + CTA. Borrowing from Synergy's own homepage was explicitly approved |
| 5 | Images grid | 1158 | IX2 reveal | ✅ "What We Stand For" — **I Integrity / II Education / III Legacy**. Three columns, three values, exact fit |
| 6 | Pull-quote #2 | 705 | same scrub | ✅ *"We do not just sell policies. We build protection strategies that last a lifetime."* |
| 7 | Image zoom | **1973** | CSS `position: sticky` pin + JS scale **0.5 → 1.0**, element exactly one viewport, origin centre | ✅ image only, no copy |
| 8 | Staff | 807 | IX2 reveal | 🔴 **AWAITING CLIENT — see below** |
| 9 | Footer | 604 | static | ✅ our existing site-wide `Footer` |

Reference type scale: display **90.2px / lh 1.0 / weight 300**; pull-quote
**75.4 / 113 / 300**; body **21.3px**. Nothing above weight 500 anywhere.
Responsive: info grid 2→1 col at 768; images grid 3→1 at 768; footer 3→1 at 390;
pull-quote 75.4 → 52.6 → 38.1.

### 🔴 §8 Staff — AWAITING CLIENT

Theirs is a founder story, portrait, and "Meet our team".

**fflsynergy names the founder only in a meta description** — *"founded by Rula
AlAryan"* — and that is the entire extent of it. No bio, no leadership section,
no founder photo, no team copy anywhere on the site.

**Do not write a founder bio.** Checkmate's About page has four named leaders
with full bios; that is exactly what must not be borrowed to fill this.

**Needed from Ziad:** two or three sentences on Rula AlAryan and the founding,
plus a usable portrait.

**How it is left:** the section is omitted cleanly — a commented JSX block in
`app/[locale]/about/page.tsx` directly after the second pull-quote, plus a
`SECTION_ORDER` comment listing all eight with §8 marked `AWAITING CLIENT`.
Restore = uncomment, add `about.founder.*` keys to both message files, drop the
portrait in `public/synergy/`. No layout maths changes; the gradient is on the
wrapper and reflows on its own.

### Seams — resolved, pending approval

1. **Header.** A cream bar forced solid on a dark page is a bright band. The fix
   is a **declared dark variant**: `SiteHeader` gains `data-surface="dark"`
   (bar `#0D1B2A`, ink cream, 15.87:1), set only for this route from the
   existing `usePathname` logic. Every other route byte-identical.
2. **Footer.** No change needed. The footer is **already `bg-navy #0D1B2A`**,
   and the gradient ends on exactly that colour, so the seam vanishes.
3. **Cream → dark route transitions.** Three separate risks: a cream flash on
   client-side navigation (fixed by a `min-h-screen` gradient wrapper painting
   in the first frame); **overscroll rubber-banding exposing the cream `body`**
   (the wrapper does *not* fix this — needs `html { background: #0D1B2A }`
   scoped to the route via a `data-route-theme` attribute); and restoring cream
   on the way back (verify by rendering, do not assume).

### Copy — proposed, **approved but NOT yet written to en.json**

Source: `fflsynergy.com/about`, verbatim except where noted.

- **h1** "We Are Synergy"
- **sub** "A brokerage built on integrity, education, and a genuine commitment to protecting the people we serve."
- **Our Story p1** "Synergy Insurance Group was founded in Orlando, Florida with a single purpose: to bring transparency and honesty to an industry that too often leaves families confused. We were built around family values — the belief that every person deserves to understand exactly what they are getting and why."
- **Our Story p2** — ⚠️ **REWRITTEN.** Original ended *"we search the market to find the best fit for you"*, which matches Checkmate's *"we shop the whole market to find the honest fit"*. Approved replacement: *"…we are never locked into one carrier — we compare what is available and bring back what suits your household."*
- **Our Story p3** — ⚠️ **TWO CUTS APPROVED**, final wording still to confirm. Original asserted *"serves thousands of families"* (unverified volume claim) and *"provides life-changing income opportunities for agents"* (agent income claim). Proposed: *"Licensed in all 50 states and partnered with the nation's top-rated carriers, Synergy serves families across the country."*
- **Values** I Integrity / II Education / III Legacy — verbatim, including numerals
- **Pull-quotes** as in the table above, both verbatim

---

## 6. Motion

### `components/useParallax.ts` — existing, shared

Two shipped configurations. **Both are ours; pick deliberately.**

| pairing | markup | values | safe band |
|---|---|---|---|
| Coverage | `top-[-30%] h-[160%]` | `±16`, scrub | middle **30.5%** |
| Testimonials | `top-[-15%] h-[130%]` | `from: -10, to: 10` | middle **56.9%** |

**The safe band is the part of the source image visible at *every* scroll
position.** It is the constraint that chooses photographs. Under the deep
pairing, a 30.5% band is narrower than any ordinary photograph of people — 23
human-subject frames were tested and every one cropped a head at one extreme or
both. The shallow pairing is what allows people in a parallax section. Do not
"upgrade" a section to the deeper pairing without re-verifying its image.

### Two new hooks — **APPROVED, NOT BUILT**

**`useWordReveal`** — the pull-quote reveal. Splits the rendered string into word
spans, GSAP ScrollTrigger `scrub: true`, `start: top 70% → end: top 20%`,
opacity `0.2 → 1`, `stagger 0.8`, `duration 0.4`, `power1.out`. Words illuminate
one after another as you scroll. **Split at runtime on the i18n value** — never
author spans in the message file.
**Reduced motion:** all words render at full opacity, no split animation.

**`useStickyZoom`** — the image-zoom section. CSS `position: sticky; top: 0` on a
one-viewport element inside a tall runway; GSAP only for the scrubbed
`scale 0.5 → 1`, transform-origin centre.
**Reduced motion:** static at `scale: 1` (full-bleed), no pin.

### Header hide/reveal — `components/SiteHeader.tsx`

Two **orthogonal** axes. Do not conflate them.

- **Surface** (existing, position-driven): `solid = scrollY > 60 || !isHeroRoute`
  → background, ink, height 116↔76, logo scale. A bar revealed mid-page is
  always readable because mid-page is always past 60.
- **Visibility** (direction-driven): `translateY(0)` ↔ `translateY(-100%)`.
  `HIDE_AFTER = 160` (past the 60 compaction point and past the tall bar's own
  116 height). `DIR_DELTA = 8px` **accumulated, resetting on direction change** —
  not a timer, because a timer adds latency to the one gesture that must feel
  instant. 8px because Lenis at `lerp: 0.1` emits sub-pixel deltas every frame.
  Overrides: never hidden below 160, never hidden while focus is inside the
  header, never hidden while the mobile menu is open.
  **Reduced motion: stays put.** The feature is switched off, not made instant.

> **⚠️ The mobile menu panel is a SIBLING of `<header>`, not a child. Do not move
> it back inside.** `transform` makes an element the containing block for its
> `position: fixed` descendants, so nesting it sized the `fixed inset-0` panel
> to the 64px bar — measured 753×64 instead of 753×1024. Setting `transform:
> none` on the bar does **not** fix it: `transform` is in the bar's transition
> list, so it resolves to an identity **matrix**, and an identity matrix still
> creates the containing block.

### Other motion

`FadeUp` (24px / 600ms / `cubic-bezier(0.16,1,0.3,1)`), Ken Burns on the hero,
carrier marquee, `Splash` (clip-path wipe, once per real document load, does not
replay on client-side navigation).

---

## 7. Testing traps — these will waste your time

1. **The Browser pane does not composite.** CSS transitions never advance in it.
   It once reported the header stuck at 64px when the real value was 76. Use it
   for layout geometry and DOM reads; use **real Chrome** for anything animated.
2. **Programmatic `window.scrollTo` does not drive Lenis or Webflow interactions.**
   It will make a working parallax look frozen. Use real wheel events via the
   `computer` tool, or `window.lenis.scrollTo(y, {immediate:true})`.
3. **`element.focus()` does not dispatch `focusin` when `document.hasFocus()` is
   false.** In automation this makes working focus handlers look broken. Click
   the page first, or press a real Tab.
4. **Dev-server error logs are a buffer.** Errors from a transient mid-edit state
   persist in `preview_logs` long after the code is fixed. Check recent request
   status codes, not the error tail.

---

## 8. What is commented out — **do not delete any of this**

| where | what | why |
|---|---|---|
| `app/[locale]/page.tsx:15` | `import Calculator` | Moved to `/[locale]/calculator`. Component and route both live and working. Only the homepage call site is commented |
| `app/[locale]/page.tsx:42` | `<Calculator />` | as above — kept so the old page order is recoverable |
| `app/[locale]/page.tsx:21` | `import TwoWaysIn` | section removed from the page; component kept |
| `app/[locale]/page.tsx:22` | `import Carriers` | full section stashed; its `APPOINTMENTS` array now feeds `CarrierStrip` |
| `components/Nav.tsx` | whole file | superseded three-zone nav, rendered nowhere. `SiteHeader` replaced it |
| `components/Testimonials.tsx:68` | `HEADER_ASIDES_READY = false` | hides the eyebrow **and** the results-disclaimer — see §9 |
| `components/Calculator.tsx` | superseded layout, documented in the docblock | kept for revert |

`Calculator.headingLevel` (default 2) exists **only** so the calculator's section
header can be the `h1` on its own page. Keep it.

---

## 9. Open items

### ✅ Compliance — four contaminated strings, DONE (`9db65f1`)

A catalogue scan found **four**, not three. `carriers.subheadWithCount` was the
one people miss — the branch `Carriers.tsx` used once the carrier count reached
15. **`next-intl` serialises the entire message catalogue into every page's
HTML**, so all four were readable in view-source on every route even though only
one painted.

| key | resolution |
|---|---|
| `whoWeServe.families.c2.b1` | → "Appointments with multiple top-rated carriers" |
| `carriers.subhead` | → fflsynergy "Built on Trust" block, verbatim. Also removed a paraphrase of Checkmate's *"we shop them so you don't overpay"* |
| `carriers.subheadWithCount` | **key and `count >= 15` branch deleted** |
| `two.agents.body` | 🟡 **INTERIM** — was near-verbatim Checkmate, ending *"Bring your license. We handle the rest."*, their sentence exactly. Now the fflsynergy footer line |

**Verified: zero occurrences in the rendered page AND zero in the full HTML
source.**

🟡 **Still owed:** `two.agents.body` is a placeholder. fflsynergy has **no
agent-recruiting copy anywhere**. Real copy is needed from the client.
**Open question for Ziad: is `join.fflsynergy.com` in scope as a copy source?**

### ✅ Lead form — disabled, no longer lies (`9db65f1`)

It previously ran `preventDefault(); setSent(true)` — showing "Thanks — we'll be
in touch" while **sending nothing anywhere**. A fake success is worse than a
visibly broken form: the client believes a lead was captured and it silently was
not.

Now: fields stay **visible** (they show what will be collected) inside a
`<fieldset disabled>`, submit is disabled, and an honest notice replaces the
privacy line. Verified — all four fields match `:disabled` and refuse focus,
submit fires no submit event, no success state is reachable, and `Close` is the
only focusable element so focus cannot strand.

> "This form isn't connected yet."
> "Your details won't be sent anywhere and no one will be contacted. Call 407-434-0400 to speak with a licensed advisor in the meantime."

**To restore:** wire the POST, drop `disabled` from the fieldset and the button,
restore the `onSubmit` handler, swap the notice back to `leadModal.privacy` —
which is retained untouched in both message files.

### 🟡 Placeholder strings — hidden, not fixed

`testimonials.eyebrow` and `testimonials.disclaimer` still contain literal
`[PLACEHOLDER — …]` text and were rendering on the deployed preview. Hidden
behind `HEADER_ASIDES_READY = false`.

**Restore in one step:** set it `true` and replace both strings. The heading
moves back to column 3 on its own. **The disclaimer is a legal
results-disclaimer for a US insurance site — the wording comes from the client.
Do not write one.**

### 🟡 Blocked on Ziad

- Founder bio + portrait for About §8
- Results-disclaimer wording
- **Regulatory disclosure / licence number.** fflsynergy carries **none**
  anywhere. Checkmate's footer does: *"Licensed insurance agency. Coverage is
  subject to underwriting approval… This site does not constitute an offer of
  insurance…"* A Florida life-agency footer would normally carry at least a
  licence number and a "not an offer of insurance" line. **Do not write one.**
- **Address `5728 Major Blvd Suite 702` is unverified and IS shared with
  Checkmate** — their JSON-LD carries the same building and suite. The phone
  `407-434-0400` is **not** shared; Checkmate's only number is `833-997-6934`.
- Light/horizontal logo lockup — see §10
- Whether `join.fflsynergy.com` is an approved copy source

### 🟡 About page decisions still open

`navy-lift #1C3A5A` approval; the header dark variant; final p3 wording; and the
image picks (hero A–D, zoom E–H — candidates measured, see §10).

---

## 10. Images

Full derivations, licence lines, rejected candidates and AA tables live in
**`public/synergy/CREDITS.md`**. Read it before touching imagery.

### Synergy's own images cannot carry a full-bleed slot

Measured. **"Safe to vw" = widest viewport a full-bleed slot serves at 2× DPR
without upscaling.**

| file | pixels | safe to |
|---|---|---|
| `why-g1` / `why-g10` / `why-g3` | 1620 × 766 | **810** |
| `why-itin` | 1400 × 933 | 700 |
| `why-bilingual` | 1206 × 678 | 603 |
| `gallery-team-presentation` | 1100 × 1375 | 550 |
| `why-g11` / `why-g12` | 1080 × 1150 | 540 |
| `gallery-team-meeting` / `-advisor-explaining` | 1000 × 1250 | 500 |
| `why-overlooked` | 880 × 495 | 440 |

The best is 1620px, soft above an 810px viewport. **Fine for contained slots**
(half-width columns, grid cells) with headroom. Not for heroes or full-bleed.

**Excluded for third-party branding:** `g5` (Checkmate Financial Group on a
screen), `g6` (Checkmate TV), `g7` and `g13` (AlphaMed signage), `g9` (consumer
branding). `why-overlooked` already crops out an **LG** monitor mark; every
`why-*` has the Synergy watermark band cropped off.

### About page candidates — measured, awaiting a pick

All Pexels. **Exact licence line:** *"All photos and videos on Pexels are free to
use."* / *"Attribution is not required."*

**Hero** — luminance measured only in the rectangle the h1 and sub occupy:

| | ID | pixels | MP | copy-region mean | p99 |
|---|---|---|---|---|---|
| A | 5638613 | 6000 × 4000 | 24.0 | 0.081 | 0.344 |
| **B** | **5638414** | **8224 × 5483** | **45.1** | 0.096 | 0.582 |
| C | 7799613 | 4461 × 2978 | 13.3 | 0.076 | 0.240 |
| D | 5591277 | 5743 × 3829 | 22.0 | 0.232 | 0.569 |

Faces verified by rendering; all clear every edge with headroom, none collide
with the copy block. Rejected: `27520972` (15.2% blown pixels behind the copy),
`5888407`, `5591173`, `11459334`.

**Deliberate choice:** the hero uses *family* imagery, not a team photo. With an
h1 reading "We Are Synergy", a family photo reads as *who they protect* — true.
A team photo would read as *Synergy's staff* — a false claim, and would have to
be Synergy's own.

**Zoom** — no copy sits on it, so there is no contrast threshold. All four
contain **no people**, so the face-crop failure mode is impossible across the
0.5→1.0 scale range:

| | ID | pixels | MP | frame mean L |
|---|---|---|---|---|
| **E** | **36777966** | 8000 × 5338 | 42.7 | 0.100 |
| F | 4933643 | 6016 × 4016 | 24.2 | 0.219 |
| G | 36777965 | 8000 × 5338 | 42.7 | 0.154 |
| H | 9592437 | 5031 × 3354 | 16.9 | 0.053 |

### 🟡 Logo

`components/Logo.tsx` has `variant="dark"` (gold artwork as supplied, for dark
backgrounds) and `variant="light"` (wordmark recoloured to ink for light
backgrounds). **Neither is a horizontal cream lockup.** The footer uses `dark`,
which is the artwork unmodified — nothing is recoloured and no mark is invented —
but it is a near-square crest sitting in a slot the reference fills with a wide
wordmark. A horizontal lockup is still wanted from the client. Contrast is not
the blocker: logotypes are exempt from 1.4.3 and 1.4.11.

---

## 11. Repo, build, deploy

### Git

The project had **no version control for weeks**. Initialised during this work.

- `main` — `764f5cc` baseline, the whole project as first committed
- `preview/client-review` — `3ac43e1`, current working branch
- No remote configured

`.gitignore` excludes `node_modules`, `.next`, `.next-build`, `*.tsbuildinfo`,
`next-env.d.ts`, `.env*` (a guard — none exist, nothing reads them), `.vercel`,
OS noise. **`public/` is tracked in full** (38 MB, including a 13.1 MB
`hero-video.mp4`); the build needs it.

### Build

```
npx tsc --noEmit
NEXT_DIST_DIR=.next-build npx next build
```

**Always set `NEXT_DIST_DIR` for a production build.** A build writing into
`.next` while a dev server serves from it corrupts the running server's
manifests. Both must pass with nothing disabled — there is no
`ignoreBuildErrors` and none may be added.

### Deploy

**<https://synergy-umber.vercel.app> — public, verified anonymous, HTTP 200.**

Two things a fresh session must know:

1. **This is the *production* alias, not a preview.** `vercel deploy --yes` on a
   fresh non-git project promoted the first deployment to production. Use
   `--target=preview` explicitly.
2. **Vercel Authentication (Standard Protection) is ON** for project `synergy`.
   The deployment-specific URL redirects to `vercel.com/login` via `/sso-api`.
   Standard Protection exempts the production domain, which is the only reason
   the alias above is public. **A preview URL will be gated.** The setting is
   Project → Settings → Deployment Protection → Vercel Authentication.
   **Do not change project or account settings** — report and let the client do it.

### Not wired, and nothing breaks by their absence

GA4, Meta Pixel, GHL webhook. **No code references any of them.** The only
`process.env` read in the codebase is `NEXT_DIST_DIR`. `NEXT_PUBLIC_VERDICT_ENABLED`
appears **only in a comment** — see below.

### The verdict sentence is unbuilt, not flagged

Earlier notes claimed `calculator.verdict.difference` sat behind
`NEXT_PUBLIC_VERDICT_ENABLED`. **That was wrong.** There is no such env var, no
gate, and no `.env` file. The string exists in both message files and nothing
reads it. It is off because it was never built and cannot ship by accident.
When the client signs off, build the feature and its gate together.
