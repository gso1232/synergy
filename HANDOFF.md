# Synergy Insurance Group — project handoff

**Written for a session with zero memory of any previous one.** Everything you
need to continue is here or is pointed at from here. Read §2, the Standing
Rules, first — they are not negotiable and they are the reason most decisions
on this project look the way they do.

> **What changed since the last revision of this file.** The About page was
> **INVERTED FROM DARK TO CREAM.** The `navy-lift #1C3A5A` gradient is retired
> and commented out, the header's dark variant is retired, `RouteTheme` is no
> longer mounted, and **every contrast measurement on that page was rebuilt from
> scratch** — the old AA table is void and nothing in it carried over. Two
> values failed the inversion silently and were caught by re-deriving rather
> than by reasoning: the pull-quote reveal's floor opacity and the hero scrim's
> shape. See §6a.
>
> 🔴 **NEWEST (2026-07-30, 3) — /join §4 STEPS ARE IMAGELESS NOW; that resolves
> the step photo-collisions, and the step copy was tightened.** A cross-check
> found the step frames md5-identical to /about's §5/§4 portraits (and the hero
> to /about's hero); Synergy has NO distinct unused portrait — all seven are on
> /about. Rather than repeat a face across two pages, §4 was rebuilt as
> `components/JoinSteps.tsx`: an editorial rail of **I–IV gold-deep numerals +
> type, no photographs**. `useWordReveal` gained a `floor` arg (default 0.55, so
> /about is untouched); the numerals reveal at **0.78** so gold-deep stays ≥3:1
> (**5.16 full / 3.35 floor**; 0.55 → 2.23, fail). Otherwise flat cream:
> heading/body ink **15.88**, tagline ink-80 **8.66**.
> **COPY (authored, approved, written to `en.json`):** step headings → **"Get in
> Touch / Meet the Team / Get Licensed / Get Appointed & Start Selling"** (ours,
> not fflsynergy's; none asserts earnings; "Get Licensed" avoids a "fast-track"
> timeline claim). New **`join.steps.tagline` = "Your pace, your goals."** — the
> neutral stand-in for a **"$0 startup cost"** line that is **NOT shipped** (cost
> claim → Ziad, add to the client list; fflsynergy's own page says "Not a side
> hustle," so no part-time claim was carried either).
> 🔴 **STILL OPEN — the HERO collision is NOT resolved.** §1 is still the
> team-dinner, byte-identical to /about's hero. "SYNERGY OFFICE INSIDE" was
> proposed as its replacement and REFUSED — it carries a legible agent-commission
> sheet **and** an LG logo. No clean office-interior shot exists (all carry LG /
> AlphaMed / commission figures). Awaiting a hero decision or a clean high-res
> office frame from Ziad. The `join-step-*.jpg` files are now orphaned on disk.
>
> 🔴 **NEWEST (2026-07-30) — /join IS THE FIRST PAGE WHOSE IMAGERY IS ENTIRELY
> SYNERGY'S OWN.** All six /join photo slots moved off Pexels stock onto the
> client's own team photos (the `New folder` drop = fflsynergy.com/gallery — the
> same files, probed live, capped at 1620px wide): hero = team dinner, §2 = five
> agents (studio), the four steps = Aiman / Rula / team portraits (step 4 reuses
> the /about §5 stage portrait). **Branding audit:** five own frames were
> EXCLUDED, not placed — they carry AlphaMed, Checkmate, National Life / Solid
> Financial, LG, or a legible agent-commission sheet (the filename-hides-branding
> trap, §11). **§2 was SHRUNK** from full-width 16:9 to a **760×507 (3:2)**
> contained frame and its **parallax dropped** — no Synergy landscape reaches the
> 2908px the old box needed at 2×, so the 1620px own frame now clears 2× (+6.6%,
> no crop); the four step frames clear 2× natively (+13.5%). **🟡 THE HERO IS A
> PLACEHOLDER FOR RESOLUTION:** at 1620px it clears 1× (+5.5%) but softens at 2×
> (−47%) — the same trade the About hero took. Kept full-bleed for hero-to-hero
> consistency; **swapped when Ziad sends the high-res camera files**, exactly as
> the About hero awaits. Hero scrim + AA re-derived on the new frame
> (object-center): nav 7.14/4.82/5.05 · eyebrow 5.82/6.26/5.92 · h1 6.22/7.43/7.41
> · sub 7.36/8.60/8.79, all clearing. The `.join-apply-trust` **BBB slot stays
> empty** — Synergy's own accreditation, held for Ziad.
>
> 🔴 **NEWEST — TWO THINGS WERE SHIPPING BROKEN AND ARE NOW FIXED.**
> **(1) The Join journey was dead.** All three CTAs on the homepage's For
> Agents tab were `href="#"`. They now go to `JOIN_URL` with the header's and
> footer's `target`/`rel`. **The `href="#"` audit is swept across all 13
> rendered routes in both locales and the count is now ZERO** — the three "Get
> a free quote" stubs were resolved to `/contact` on evidence from the live
> source site, where the client's own identically-labelled buttons go. §4a.
> **§4's "All are gone" was false and is corrected in place.**
> 🔴 **And a finding to take to Ziad: fflsynergy.com's three forms look like
> fake successes** — no `action`, no endpoint anywhere in the bundle,
> hard-coded "Request Received" copy. §4a.
> **(2) `.sem-pill-cta` was cream-on-cream at 1.00:1 and shipping** on
> /contact's submit button, with its label at 2.86:1. Inverted to navy fill /
> cream label, 15.87:1 — §7.
> **(3) `join.fflsynergy.com` is an APPROVED COPY SOURCE** and the Join page is
> scoped to **four blocks** — §13b. Not built.
>
> 🔴 **PREVIOUSLY: THE BLOG ARTICLE IS NO
> LONGER CENTRED.** `.blog-measure` (31em, `margin-inline: auto`) is off the
> article that has frames; the template runs **/services §4** — copy column
> left at 832.25, sticky image column right at 475.56, 131.2 gutter, sticky
> `display: none` below 991. The measure is **86 characters and that was
> accepted on instruction**, not fixed by narrowing. **All nine articles with
> bodies are on the grid — 41 frames, sourced, audited at full resolution and
> placed; 18 candidates were rejected at that audit after passing every
> measurement.** See **§13a**, which is the section to read before touching the
> article template, and CREDITS.md for the frames.
>
> **Since then:** the gold hairlines were removed (§6c), the hero lost its foot
> ramp and gained a hard edge (§6d), the hero crop shifted to `object-top`, the
> copy dropped to SEM's 32.8px offset, the sub took SEM's type scale, and a
> site-wide locale switcher was built and shipped OFF (§6e). Everything below is
> read off the code as it stands. The hero AA table (§6f) was re-run at the
> final crop, copy position and scrim.

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
   <https://checkmatefinancialgroup.com/>.** Match found → keep the meaning,
   rewrite the phrasing.

   🔴 **SOME OVERLAPS ARE SHARED HISTORY, NOT LIFTED COPY.** Synergy and
   Checkmate were one company that split; they share a building, a suite, and
   whatever was written before the split. So an overlap is not evidence of
   anyone copying anyone, and the finding should never be reported to the
   client as an accusation.

   **THE REWRITE RULE IS UNCHANGED.** They are separate competing businesses
   now, and text that appears on both sites differentiates neither. Rewrite for
   DIFFERENTIATION, and say that is the reason. Factual data that is genuinely
   common to both — the shared office address — is not rewritten at all,
   because it is not phrasing, it is a fact.
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
| `navy-lift` | **`#1C3A5A`** | **0.0401** | 🔴 **RETIRED, TOKEN KEPT.** Was the top of the About gradient; the page is cream now. Still the only measured mid-tone this palette has — see §3a |
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

### 🔴 §3a — `navy-lift` is retired but the derivation is not

**The About page is cream now.** `.about-gradient` is commented out in
`globals.css` with everything below it intact, and the token stays in
`tailwind.config.ts`. Nothing renders it today. **Do not delete either** — this
is the only mid-tone this palette has ever had, and the next dark surface on
this site starts here instead of re-deriving it.

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

🔴 **`gold-deep` is UNUSABLE on this run — 2.06:1 at the top.** Dark surfaces
take `gold`, light surfaces take `gold-deep`, and neither crosses over. (On the
cream page the rule runs the other way and is just as absolute: **`gold` is
unusable, `gold-deep` is the only legal gold text.** See §6a.)

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
routes that 404. ~~All are gone.~~ **Unbuilt routes are NOT rendered as disabled
entries** — a greyed-out "Services" says Synergy has a services page that is
temporarily unavailable, which is false; an absent one says nothing, which is
true.

> 🔴 **CORRECTION — "All are gone" WAS FALSE AND STAYED IN THIS FILE FOR
> SEVERAL PASSES.** It was true of the header and the hero, which is where the
> 17 were counted, and it was written as if it were true of the site. It never
> was: `WhoWeServe`, `WhatWeCover` and `WhySynergy` each kept live `href="#"`
> stubs on the homepage the whole time, **including all three CTAs on the For
> Agents tab — the entire Join journey.** The stubs were only found when the
> Join research pass went looking for the Join journey and could not find one.
>
> **The count today, swept across all 13 rendered routes in both locales** (see
> §4a for the audit): **ZERO.** Every anchor on every route resolves.
>
> The lesson is about the record, not the links: a claim of completeness in
> this file has to be written against a sweep, not against the part of the
> change that was in front of you. Where a claim like this appears from now on
> it says what was swept and when.

🔴 **Unbuilt, listed only as a comment in `routes.ts`:** `services`, `contact`,
`blog`, `gallery`, `privacy`, `terms`. All their message strings (`nav.*`,
`footer.nav.*`, `footer.legal.*`) are **retained untouched** in both files.

🔴 **`privacy` and `terms` are BLOCKED, not merely unbuilt.** They are legal
documents for a Florida life-insurance brokerage and come from the client.
**Do not write them.**

---

## 4a. The `href="#"` audit — swept, dated, and 3 left standing

Method: every rendered route fetched as SSR HTML and parsed, in **both**
locales — `/[locale]`, `/about`, `/services`, `/blog`, `/blog/[slug]`,
`/contact`, `/calculator` — plus a client-side pass on the homepage with the
**For Agents** tab open, because `AnimatePresence` only renders the active tab
so the agent cards are absent from SSR. 13 routes, 29 anchors on the homepage.

### ✅ Fixed this pass — five stubs that had an obvious destination

| file | what it is | now points at |
|---|---|---|
| `WhoWeServe.tsx` agents c1 "Apply to join" | **the Join journey** | `JOIN_URL`, `_blank`, `noopener noreferrer` |
| `WhoWeServe.tsx` agents c2 "Meet the team" | **the Join journey** | `JOIN_URL`, same target/rel |
| `WhoWeServe.tsx` agents c3 "See the opportunity" | **the Join journey** | `JOIN_URL`, same target/rel |
| `WhoWeServe.tsx` families c2 "Compare my options" | homepage card CTA | `/[locale]/services` |
| `WhoWeServe.tsx` families c3 "Speak with an agent" | homepage card CTA | `/[locale]/contact` |
| `WhatWeCover.tsx` ctaSecondary "Talk to an advisor" | section CTA | `/[locale]/contact` |
| `WhatWeCover.tsx` card links ×3 "Learn more" | Term / IUL / Tax-Free cards | `/[locale]/services` |

**Plus the three "Get a free quote" CTAs, resolved the round after** — see the
section below: `WhatWeCover`, `WhoWeServe` families c1 and `WhySynergy`, all
three to `/[locale]/contact`, on evidence from the live source site.

The three agent CTAs carry **the same `target` and `rel` as the header pill and
the footer link**, so all three surfaces behave identically. Destinations live
in a `CTA_DEST` table at the top of `WhoWeServe.tsx`; when a `/join` route
exists, three entries change from `{kind:"join"}` to `{kind:"route"}` and
nothing else in the component moves.

### ✅ RESOLVED — the three "Get a free quote" stubs. **ZERO STUBS REMAIN.**

They were held back one round pending a decision, on the reasoning that there is
no quote route and no working form. **That reasoning was right about the facts
and wrong about the question.** Before removing them the live source site was
checked, the same way `join.fflsynergy.com` turned out to be a real destination
for the Join CTAs. Measured on **fflsynergy.com**, Brave 138 / Chromium 138:

| finding | detail |
|---|---|
| **No quote route exists** | the router carries **9** paths: `/ · /about · /services · /blog · /gallery · /contact · /join-us · /privacy · /terms`. No `/quote`, `/get-a-quote`, `/free-quote`, `/apply`, `/get-started` |
| **Every path returns 200** | it is a client-side SPA — `/zzz-not-a-real-page-9182` returns the same **878-byte** shell as `/contact`. HTTP status proves nothing on this site; pages had to be rendered to be read |
| **🔴 THEIR OWN "Get a Free Quote" BUTTONS GO TO `/contact`** | all three of them — homepage nav bar (y 30), hero (y 557) and closing band (y 5930). Each is a `<button class="btn-gold">` **wrapped in an `<a href="/contact">`** |
| **Their /contact submit reads "Request My Free Quote"** | which is the exact string our own `ContactForm` already ships as `form.submit` |
| one external destination, sitewide | `https://join.fflsynergy.com/` — the same one we already use |

**So the client had already answered the question.** Their own resolution of this
exact CTA is the contact page, and our `/contact` is the rebuild of theirs. All
three now point at **`routeHref(locale, "contact")`** — internal, so no `target`
or `rel`: those belong to the external Join destination, and sending a visitor
from our rebuild back to the old site would be wrong.

**Why this does not contradict the hero.** `hero.ctaQuote` was removed when
`/contact` did not exist and the CTA had no destination at all. That was correct
then. `/contact` exists now, and the source site resolves the CTA to it.
⚠️ **It does leave the hero as the odd one out** — three blocks now point at
/contact and the hero dropped its equivalent CTA entirely. Worth revisiting;
not changed here.

### 🔴 THEIR FORMS APPEAR TO BE FAKE SUCCESSES — relevant to us twice over

Inspected, **not submitted** — submitting would send data to a live business.
On `fflsynergy.com/contact`:

- the `<form>` has **no `action` and no `method`**; submission is a React
  `onSubmit` of **85 characters**
- the **entire 534 KB bundle contains one `fetch(`** and **no form endpoint of
  any kind** — no CRM, no GoHighLevel, no form service, no API host. Every
  outbound URL in it is React docs, React Router docs, Facebook, Instagram or
  Vercel analytics
- it ships **hard-coded success copy for three separate forms**: *"Message
  Sent"*, *"Request Received — A licensed Synergy agent will contact you
  shortly…"*, and *"Application Received — …within 1–2 business days."*

That is the signature of `preventDefault(); setSent(true)` — **the exact bug
this project already fixed in `LeadModal`**, which used to show "Thanks — we'll
be in touch" while sending nothing. It cannot be proven without submitting, and
it should not be proven that way; **what would settle it is asking Ziad where
those three forms deliver.**

**Two consequences.** (1) Our `/contact` form is *visibly disabled* with a "not
connected" notice, which is more honest than a fake success — that decision is
vindicated, keep it. (2) 🔴 **It is a client-side finding to report to Ziad**:
if their live site is accepting quote requests and applications and dropping
them, they are losing leads today.

🟡 **Also logged: the CTA pair in `WhatWeCover` now sends both buttons to the
same page.** "Get a free quote" and "Talk to an advisor" sit side by side at
y 1520 and both resolve to `/contact`. Not broken, but a primary/secondary pair
normally offers two different actions. Copy or destination question, not a link
bug. Not changed.

### 🟡 Dormant — stubs in components that render nowhere

Listed so a future pass does not "discover" them as live defects:

| file | stubs | status |
|---|---|---|
| `components/Nav.tsx` | 7 (lines 104, 117, 129, 185, 245, 256, 273) | **superseded** by `SiteHeader`; not imported by any route |
| `components/TwoWaysIn.tsx:50` | 1 | commented out of `app/[locale]/page.tsx`; component kept |

Neither ships. **If either is ever remounted its stubs come with it** —
`TwoWaysIn`'s is the agents card and would go to `JOIN_URL`.

### ⚠️ Two things the sweep turned up that are NOT stubs

- **"Talk to an advisor" now has two destinations on one page.** The hero dials
  `nav.phoneHref` (`tel:+14074340400`); `WhatWeCover`'s identically-labelled CTA
  now goes to `/contact`. The hero's was decided when `/contact` did not exist.
  Not changed here — changing the hero was not this pass — but one label with
  two destinations on one page should be resolved.
- **`whatWeCover.ctaPrimary` is untranslated.** On `/es` the button still reads
  "Get a free quote" while the other two quote CTAs render "Obtener una
  cotización gratis". It is one of the 174 empty `es.json` leaves (§6e), not a
  new gap.

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

**fflsynergy names the founder in a meta description AND — since the blog was
published — in body copy.** `/blog/life-insurance-orlando` carries *"Founded by
licensed insurance advisor Rula AlAryan."* That is the entire extent of it: one
sentence, no bio, no photo, no leadership section. No bio, no leadership section,
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
   surface once it leaves it. ⚠️ **The dark variant it used to take is
   RETIRED** — the bar is now byte-identical to the homepage's. See §6a.
2. **Footer.** ⚠️ **The gradient no longer lands on navy, so this changed.** On
   a cream page the footer is a hard boundary; it is solved by deleting the
   trailing spacer so the §7 photograph runs straight into it. See §6a.
3. **Cream → dark route transitions.** ⚠️ **No longer applicable** — the route
   is cream, `<body>` already is too, and `RouteTheme` is no longer mounted.
   Component and CSS both retained. See §6a and the pair rule.

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
- **§4 body** — ⚠️ **now renders `trust.p1` IN FULL**, both sentences, verbatim.
  It previously rendered `trust.body`, which is only p1's second sentence — a
  cut made when the copy column measured 688px against the images' 562px and was
  setting the row height. After the pill was removed the column had 234.6px of
  empty space below it, so the cut was reversed: p1 in full is 404.1px in a 562px
  row, which fits with 79px of air above and below (§9a).
  🔴 **`trust.p2` was deliberately NOT restored** — its first two sentences ship
  on the homepage as `carriers.subhead`, and putting it back would re-introduce
  that duplication. `trust.body` and `trust.p2` are both **retained untouched**
  in both message files.
- **§4 eyebrow** "Our approach" — an **authored interface label** under rule 4.
  Theirs reads "Dinner at SEM"; fflsynergy publishes nothing that fits.
- **Values** I Integrity / II Education / III Legacy — verbatim, incl. numerals
- **Pull-quotes** both verbatim (§3 from their About page, §6 from homepage)

---

## 6a. 🔴 THE CREAM INVERSION — read this before touching the About page

The page was dark: a `navy-lift #1C3A5A → navy #0D1B2A` gradient on one wrapper,
cream type throughout. **It is cream now** — `#F8F4EE` base, ink type, gold as
accent only. Everything in this section is the consequence.

### What is retired, and where it went

| thing | where it is now |
|---|---|
| `.about-gradient` | **commented out in `globals.css`** directly above `.about-page`, with the whole navy-lift derivation intact. Swapping the class name on the wrapper in `about/page.tsx` is the entire restore |
| `navy-lift` token | still live in `tailwind.config.ts`. Rendered by nothing. Keep it |
| header dark variant | CSS **commented out** in `globals.css`; the branch that drove it is gated behind `DARK_SURFACE_ROUTES = false` in `SiteHeader.tsx` |
| `<RouteTheme theme="dark" />` | **call removed** from `about/page.tsx`. Component and CSS rule both kept |
| `suppressHydrationWarning` | **removed** from `<html>` in `layout.tsx` — see the pair rule below |

### The one thing that cannot be carried over: value

The gradient descended **3.87×**. A light page has no such range:

| pairing | ratio |
|---|---|
| cream `#F8F4EE` 0.9083 → greige `#ECE9E2` 0.8160 | **1.11×** |

And it cannot be bought by going darker, because **`gold-deep` sets a floor** —
as normal text it needs its background at **L ≥ 0.786**:

| candidate band | L | ink | gold-deep | vs cream |
|---|---|---|---|---|
| cream `#F8F4EE` | 0.9083 | 15.88 | **5.16** | 1.00× |
| `#F2ECE3` | 0.8441 | 14.82 | 4.81 | 1.07× |
| greige `#ECE9E2` | 0.8160 | 14.35 | **4.66** ← already thin | 1.11× |
| `#E8DFD1` | 0.7453 | 13.18 | **4.28 FAIL** | 1.21× |

**Any band with enough separation to be seen breaks gold-deep.** So background
bands are not available as a separator on this page, and **no new token was
added**. Do not reach for one.

### What replaced the descent: the photographs

Inverted, the images stop being the light mass and become the dark one, over a
wider range than the gradient ever had. Measured mean luminance vs cream:

| section | image | mean L | step below cream |
|---|---|---|---|
| §1 hero | `about-hero-family` | 0.132 | **5.27×** |
| §2 | `gallery-team-presentation` | 0.405 | 2.11× |
| §4 left | `gallery-advisor-explaining` | 0.292 | 2.80× |
| §4 right | `gallery-team-meeting` | 0.412 | 2.08× |
| §5 I / II | `value-integrity` / `-education` | 0.234 / 0.290 | 3.38× / 2.82× |
| §5 III | `value-legacy` | **0.597** | **1.48×** 🟡 |
| §7 zoom | `about-zoom` | 0.105 | **6.18×** |
| footer | navy | 0.0104 | 15.87× |

The descent is not lost; its **shape** changed — an arc carried by the images
rather than a ramp painted on the background. Dark hero, open cream field,
photographs deepening through §2 → §4 → §5, the zoom as the darkest event, navy
footer.

🟡 **`value-legacy` is the one frame the inversion broke.** At L 0.597 it was
signed off as "a bright card against a dark gradient". On cream it sits 1.48×
from the page while its two neighbours sit at 3.38× and 2.82×, so it reads
washed out and detached. **It is awaiting a replacement pick** — candidates in
§11.

### Gold on cream — the rule, and the number that governs it

🔴 **gold `#C9A84C` on cream `#F8F4EE` is 2.09:1.** That fails the 4.5:1 text
bar **and** the 3:1 non-text bar of WCAG 1.4.11.

| use | verdict |
|---|---|
| ~~`.sem-rule` hairlines~~ | 🔴 **REMOVED — see §6c.** They shipped briefly as pure decoration at 2.09:1. There is no gold on this page now |
| §5 roman numerals | 🔴 **`gold-deep` 5.16:1.** A decoration-exemption argument was available — they are `aria-hidden` ordinal ornament and the word alone is the heading's accessible name. **It was deliberately refused**: it is an exemption you would have to defend on a site with documented regulatory exposure, and this project already refused to loosen gold to large-text-only for the same reason |
| any icon that means something | 🔴 gold-deep. 2.09 fails 3:1 |
| any text | 🔴 gold-deep `#7D641F` |
| focus rings | 🔴 **never `gold-pale`** — `#EFE1B0` on cream is **1.19:1**. Navy or gold-deep |
| ~~`.sem-pill-cta` if restored~~ | ✅ **DONE — INVERTED.** It was never "if restored": `ContactForm`'s submit has been rendering it on cream since /contact was built. Navy fill / cream label, 15.87:1. See §7 |

### 🔴 §6c — the gold hairlines are gone, and what carries the rhythm

A build separated every section with a 1px gold hairline (`.sem-rule`), with the
two pull-quotes bracketed above and below. **All of it was removed on
instruction.** There is no explicit section separation on this page at all — no
rules, no bands, no cards.

**What carries the section rhythm now**, in order of how much work each does:

1. **Whitespace.** `.sem-pad-t` is the rhythm again — 130.8 / 69.2 / 64px at
   1536 / 820 / 390. The hairline never created that gap; it sat *inside* it,
   splitting the section's top padding into a margin above and below itself.
   Taking it out returned the padding to the section and the seam measures the
   same.
2. **The photographs.** Every section but the two pull-quotes holds one, and on
   cream they are the page's dark mass. Their *position* alternates — §2 right,
   §4 pair left, §5 three across, §7 full-bleed — so no two adjacent sections
   put their weight in the same place.
3. **Type scale.** display 90.2 / h2 57.4 / quote 75.44 / body 21.32. No two
   adjacent sections open at the same size.

**The caveat, stated rather than glossed:** the two pull-quotes hold no
photograph, so they are bounded by whitespace and type scale alone. That is what
the reference does too — its quote sections carry no rule and no background.

**A finding worth keeping from the hairline build:** a rule on *both* sides of a
pull-quote seam put two hairlines 83px apart with nothing between them and
stretched that seam to **189.3px** against a 131 rhythm. If a separator is ever
reintroduced, one per seam.

**And it cannot be gold.** gold `#C9A84C` on cream is 2.09:1 — it failed the
4.5 text bar *and* the 3:1 of 1.4.11, and shipped only as pure decoration.
gold-deep `#7D641F` (5.16:1) or ink are the options.

### The four seams, all solved

**Header** — reverts to homepage behaviour exactly: transparent white ink over
the hero, cream bar with ink from scrollY 60. **`/about` KEEPS its place in
`isHeroRoute`** — that rule tests whether the first viewport holds a full-bleed
photograph dark enough to carry white ink, and it still does. Only the surface
reverted.

**Hero** — 🔴 **superseded, see §6d.** The cream foot ramp described in earlier
revisions of this file has been removed and the photograph now ends on a hard
edge.

**Footer** — solved by a deletion. A bare `h-[clamp(64px,8.6vw,131.2px)]` spacer
sat between the zoom and the footer. On cream that would have been a 131px cream
band wedged between a full-bleed photograph and a navy footer — exactly the hard
boundary the inversion had to solve. Deleted: the zoom's bottom edge is now the
footer's top edge, and photo (L 0.105) meeting navy (L 0.0104) is a **1.42×**
step against the **15.87×** a cream/navy butt-joint would have been. Holds under
reduced motion, where the zoom is a static full-bleed still.

**`RouteTheme`** — no longer needed. `<body>` is already `bg-cream` and the
canvas propagates it, so overscroll at both ends exposes the right colour
unaided. **The call was removed; the component and its CSS rule were kept.**

> ⚠️ **THE PAIR RULE.** Removing the `<RouteTheme />` call is what allowed
> `suppressHydrationWarning` to come off `<html>` in `app/[locale]/layout.tsx`.
> That prop existed *only* because RouteTheme's inline script writes an
> attribute before hydration. With nothing writing it, leaving the prop in would
> silently mask a future genuine mismatch on the document element. **Restore
> both together or neither.**

### 🔴 Two values that failed the inversion silently

Both would have shipped below AA. Neither was catchable by reasoning — only by
re-deriving against the new surface.

1. **`useWordReveal`'s floor opacity.** It was 0.45, derived for *cream at alpha
   over navy*. The quotes are *ink over cream* now, and the arithmetic is not
   symmetric: ink at 0.45 over cream composites to `rgb(148,146,143)` = **2.83:1
   — FAIL** against a 3:1 bar. And it fails in the *resting* state, on the
   section a reader is most likely to stop at. Floor is 0.50 (3.27); **shipped
   0.55 (3.79)**. Illumination range narrows to 1.82×.
2. **The hero scrim.** Covered above — the old shape was actively wrong for a
   cream handover, not merely under-tuned.

**The lesson to carry: an alpha value derived against one surface is not a
number, it is a relationship. Inverting a page invalidates every one of them.**

---

## 6d. 🔴 The hero: hard edge, `object-top`, SEM's copy scale

Three changes, and they interlock — each one moved the copy, and the copy
position is what the scrim is derived from.

### The edge — no ramp

A ramp over the last 15% of the hero used to fade the photograph into cream. It
has been **removed**; the photograph ends on a hard line. The ramp is commented
out in `globals.css` with its full per-row derivation.

**It was removed for CONSISTENCY, not because the step became tolerable.** Every
other photograph on this page already butts straight onto a flat colour with no
fade:

| | step onto its flat colour |
|---|---|
| §2 `gallery-team-presentation` → cream | 2.11× |
| §5 `value-integrity` / `-education` → cream | 3.38× / 2.82× |
| §5 `value-legacy` → cream | 1.48× |
| §7 `about-zoom` → navy | 1.42× |
| **§1 hero → cream** | **5.16×** |

The hero was the only faded edge on the page, which is why it read as a glow. It
now agrees with the rest of the page.

⚠️ **The full-bleed caveat, recorded because it is real:** the other images are
*contained* — they have left and right edges, so they read as pictures in a
layout. The hero is full-bleed, so its cut is a line across the whole viewport.
That is the intended effect.

### The crop — `object-top`

Source 3840×2560 (1.500). At 1536×900 the box is 1.707 — wider — so `cover`
crops **124px of height, which is the entire budget**. Centred, the topmost head
sat ~20px from the frame edge with the nav on it at y 49–68. `object-top` spends
all 62px of available shift and the head clears the nav band.

**At 820 and 390 it is a no-op** — both boxes are *taller* in aspect than 1.500
(0.801, 0.462), so `cover` fits by height and crops width. Confirmed: those two
columns of the AA table are byte-identical before and after.

### The copy — SEM's 32.8px, and SEM's type

`padding-bottom` went from `18vh` (162px at 900) to **32.8px**, which is SEM's
own `margin-bottom: 2rem` on its notice block. **That only became available when
the ramp came out** — every pixel of the 18vh was clearance so cream would not
bleed into the sub's last line.

The sub is now `.sem-hero-sub`: **20.5px / 30.75 (lh 1.5) / w600**, measure
**32em**, which is SEM's `.hero-section_address-link` measured live (20.5px,
lh 1.5, w700, 656.35px natural — 32.02em).

- **w600, not their 700.** This is the body face (Overpass), where 700 exists
  and the "never above 500" rule does not apply — that rule is about the display
  face. 700 beside a w400 Kufam h1 reads as two competing bolds.
- **`32em`, not `32ch`.** An earlier pass wrote `32ch`, which is 427.6px — a
  third narrower than theirs and a different block shape. `ch` is the width of
  "0" (~0.6em here), not the em.
- **Our size ramp is not theirs.** Their rem is fluid across three Webflow
  breakpoint formulas, so their 1.25rem computes to 20.50 / 18.39 / 19.07px at
  1536 / 820 / 390 — **non-monotonic**, shrinking to tablet then growing again on
  phone. That is an artifact, not an intent. Ours holds their desktop value and
  steps with our own body scale: 20.50 / 18.43 / 16.50.
- **Their mobile treatment is not copied.** At ≤991 they centre the block.
  Theirs has no h1; ours does, and centring only the sub under a left-aligned h1
  reads as a mistake.

### The h1 is unchanged, deliberately

The sub went *down* 21.32 → 20.5, so the size ratio moved **4.23 : 1 → 4.40 : 1**
— the hierarchy widened rather than collapsed. The w600 adds optical presence
without size; those roughly cancel. **SEM has no headline at all**, so there is
nothing to calibrate an h1 against, and changing it would be invention.

### The scrim is on its THIRD shape

| | shape | why |
|---|---|---|
| 1 | peak 0.60, flat 72→100% | dark page, hero handed over to a navy gradient |
| 2 | peak 0.62 across 56–84%, **decaying** to 0 by 96% | cream page with a foot ramp; the ramp needed bare photograph below the copy, which sat at 82% |
| 3 | peak 0.62 from 64% and **holding to 100%** | no ramp, and the copy now runs to ~96%. Under shape 2 the sub sat where the scrim had already decayed to nothing — **1.44:1** |

**Copy band, read off the built page** (not estimated), as a % of hero height:

| viewport | h1 | sub |
|---|---|---|
| 1536 × 900 | 75.96–85.97 | 89.53–96.36 |
| 820 × 1024 | 80.38–88.29 | 91.41–96.80 |
| 390 × 844 | 71.82–84.47 | 87.32–96.11 |

---

## 6e. 🔴 Locale switcher — built, mounted site-wide, SHIPPED OFF

`components/LocaleSwitcher.tsx`, mounted in `app/[locale]/layout.tsx` **outside
`SmoothScroll`** (it is `position: fixed`, and a fixed child of a transformed
ancestor positions against that ancestor — the same trap the mobile menu panel
documents).

**`LOCALE_SWITCHER_READY = false`. It renders `null`.** Same pattern as
`HEADER_ASIDES_READY`, off for the same reason the lead form is disabled: **an
affordance must not advertise a capability the site does not have.**

Measured on the catalogue: **131 of 305 leaf strings translated — 43.0%.** Empty
by namespace: `about` 30 · `carriers` 29 · `footer` 25 · `whatWeCover` 23 ·
`hero` 20 · `whySynergy` 16 · `leadModal` 14 · `two` 9 · `consultation` 3 ·
`meta` 2 · `calculator` 2 · `whoWeServe` 1. **The whole About page and the whole
homepage hero are at zero.** A visitor clicking ES gets English at a Spanish URL.

**To ship: flip the one constant.** Nothing else changes.

### SEM's, measured live, and our four divergences

| | SEM | ours |
|---|---|---|
| position | fixed, right 49.2 / bottom 32.8 (49.2 on inner pages) | right 49.2 / bottom 32.8; 19.07 right below `md` |
| pill | white, radius 82px, pad 0 8.2, shadow `0 2px 5px rgba(0,0,0,.2)` | **cream `#F8F4EE`**, same geometry, navy-tinted shadow |
| link | 16.4/24.6 w500 uppercase, gap 4.92, pad 4.92/8.2 | identical |
| active | their orange `#EB6330` | **gold-deep `#7D641F`** — 5.16:1 |
| inactive | `#1E1E1E` | **ink `#1A1A1A`** — 15.88:1 |
| flags | 19.68px UK / PT webp | 🔴 **none** |
| hover | 🔴 **none exists** | gold-deep on greige, 4.66:1 |
| focus | 🔴 **none exists** | 2px gold-deep, offset 2 |
| mobile ≤991 | jumps to bottom-**left** | stays bottom-right, moves in to the gutter |

1. **No flags.** A UK flag for English on a Florida insurance site is wrong; a US
   flag makes a nationality claim about the *reader*; Synergy's Spanish audience
   is US Hispanic. Language is not nationality.
2. **Hover and focus exist.** Theirs has neither — no `:hover` rule for
   `.local-link` anywhere in their stylesheet. That is a defect, not a spec.
3. **Our colours are measured**, not matched.
4. **It does not move across the screen at a breakpoint.** Relocating a
   persistent control for no reason a reader can see is worse than the 30px of
   gutter it saves.

**Zero new strings.** `nav.langLabel` / `langEn` / `langEs` already existed for
the retired `components/Nav.tsx` and are already translated in `es.json`.
Nothing was written to a message file.

### ⚠️ `navigation.ts` — and the trap it exists for

**`usePathname` from `next/navigation` is the wrong one, and it fails silently.**
Next's returns the real path *including* the locale — `/en/about` — so
`/es` + that = **`/es/en/about`**, which 404s. The first pass shipped exactly
that and TypeScript was happy with it; it was caught by reading the rendered
`href` on the built page.

`navigation.ts` re-exports next-intl's `createSharedPathnamesNavigation({locales})`.
Its `usePathname` strips the locale (`/about`) and its `Link` understands the
`locale` prop, which **`next/link` silently ignores in the App Router** (a Pages
Router API). `createShared…` rather than `createLocalizedPathnames…` because our
routes are the same strings in both locales — localised pathnames would be a
second route table to keep in sync with `routes.ts`.

Verified with the flag on: `/en/about` → `EN` `aria-current="page"` gold-deep,
`ES` → `/es/about` (HTTP 200, `<html lang="es">`), both real anchors, both
tabbable, `<nav aria-label>` + `role="list"` + `hreflang` + `lang`.

---

## 6f. AA — rebuilt from scratch, and re-run at the final hero

**The pre-inversion table is void. None of it carried over.** Worst pixel, not
mean. Anything over a photograph is composited in the browser's own order —
photo → `.hero-veil-top` → `.about-hero-scrim` → `.about-hero-foot` — in sRGB,
with the JPEG mapped through the same object-cover arithmetic the browser uses
at each viewport, and text boxes read off the built page with
`getBoundingClientRect`.

### Text over the photograph — §1 hero

🔴 **Re-derived at the FINAL crop (`object-top`), the FINAL copy position
(32.8px) and the FINAL scrim (shape 3).** The composite is photo →
`.hero-veil-top` → `.about-hero-scrim`. **There is no `.about-hero-foot` in the
stack any more.**

| element | viewport | fg | px | worst | needs | | worst pixel |
|---|---|---|---|---|---|---|---|
| h1 | 1536×900 | `#F8F4EE` | 90.1 | **5.83** | 3.0 | pass | y 76.8% x 42.1% |
| sub | 1536×900 | `#F8F4EE` | 20.5 | **5.93** | 4.5 | pass | y 92.2% x 41.7% |
| nav links | 1536×900 | `#FFFFFF` | 15 | **7.87** | 4.5 | pass | y 5.5% x 10.0% |
| nav "Calculator" | 1536×900 | `#FFFFFF` | 15 | **11.18** | 4.5 | pass | y 5.5% x 83.3% |
| Join pill boundary | 1536×900 | `#F8F4EE` | — | **6.36** | 3.0 | pass | y 4.2% x 93.6% |
| h1 | 820×1024 | `#F8F4EE` | 80.9 | **5.54** | 3.0 | pass | y 82.6% x 82.6% |
| sub | 820×1024 | `#F8F4EE` | 18.4 | **5.95** | 4.5 | pass | y 95.2% x 37.9% |
| h1 | 390×844 | `#F8F4EE` | 53.4 | **5.53** | 3.0 | pass | y 75.3% x 92.7% |
| sub | 390×844 | `#F8F4EE` | 16.5 | **5.95** | 4.5 | pass | y 95.2% x 29.6% |

Tightest in the matrix: **h1 at 390, 5.53 against 3.0.**

The scrim peak was bisected against the final copy boxes, not chosen:

| peak | h1 (1536/820/390) | sub (1536/820/390) | |
|---|---|---|---|
| 0.00 | 1.40 / 1.27 / 1.27 | 1.44 / 1.44 / 1.44 | fails |
| 0.50 | 4.21 / 3.94 / 3.94 | 4.30 / 4.31 / 4.31 | fails on the sub |
| 0.51 | 4.32 / 4.05 / 4.05 | 4.41 / 4.42 / 4.42 | fails on the sub |
| **0.52** | 4.44 / 4.16 / 4.16 | 4.53 / 4.54 / 4.54 | **the floor, +0.03** |
| **0.62** | 5.83 / 5.54 / 5.53 | 5.93 / 5.95 / 5.95 | **SHIPPED, +1.43** |
| 0.66 | 6.53 / 6.23 / 6.22 | 6.63 / 6.65 / 6.65 | costs the photograph |

0.62 is not a new number — it is the peak the previous shape already shipped, so
the photograph reads at the same strength it did before the edge changed. The
floor *improved* (0.56 → 0.52) because the copy moved into a darker band of the
frame.

### Text on the cream surface — flat, no photograph involved

Identical at all three widths; the surface does not vary.

| element | fg | px | ratio | needs | |
|---|---|---|---|---|---|
| §2 h2 "Our Story" | ink | 90.1 | **15.88** | 3.0 | pass |
| §2 body ×3 | ink | 21.3 | **15.88** | 4.5 | pass |
| §2b carrier wordmarks | ink | 17.5 | **15.88** | 4.5 | pass |
| §3 / §6 pull-quote, illuminated | ink | 75.3 | **15.88** | 3.0 | pass |
| §3 / §6 pull-quote, **at the reveal floor** | ink @ 0.55 | 75.3 | **3.79** | 3.0 | pass |
| §4 eyebrow | ink | 21.3 | **15.88** | 4.5 | pass |
| §4 h2 | ink | 57.4 | **15.88** | 3.0 | pass |
| §4 body | ink | 21.3 | **15.88** | 4.5 | pass |
| §5 h2 | ink | 57.4 | **15.88** | 3.0 | pass |
| §5 value labels | ink | 21.3 | **15.88** | 4.5 | pass |
| §5 roman numerals | **gold-deep** | 21.3 | **5.16** | 4.5 | pass |
| §5 value bodies | ink | 21.3 | **15.88** | 4.5 | pass |

Tightest on cream: **the pull-quote at its reveal floor, 3.79 against 3.0.**
Second tightest: **the roman numerals at 5.16.**

### Non-text — recorded as a decision, not an omission

| element | ratio | governed by | verdict |
|---|---|---|---|
| ~~`.sem-rule` gold hairlines~~ | ~~2.09~~ | — | 🔴 **REMOVED — §6c.** There is no gold anywhere on this page now. The reasoning is kept because it is the standing rule for any future separator |
| locale switcher, active | 5.16 | 1.4.3, 4.5 | pass — gold-deep on the cream pill |
| locale switcher, inactive | 15.88 | 1.4.3, 4.5 | pass — ink |
| locale switcher, hover | 4.66 | 1.4.3, 4.5 | pass — gold-deep on greige |
| locale switcher, focus ring | 5.16 | 2.4.11, 3:1 | pass — gold-deep |
| Join pill boundary over the hero | 6.27 | 1.4.11, 3:1 | pass |
| header focus ring (cream bar) | 5.16 | 2.4.11, 3:1 | pass — gold-deep |
| header focus ring (over the hero) | 7.68+ | 2.4.11, 3:1 | pass — gold-pale on the veiled photograph |

🔴 **If a hairline on this page is ever asked to mean something** — group items,
bound an input, indicate state, mark focus — **it must stop being gold.** At
2.09 it is below the 3:1 any informational graphic needs. gold-deep (5.16) or
ink.

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

### 🔴 `.sem-pill-cta` — INVERTED, and it was shipping broken

**The previous entry here said the pill is cream fill with a navy label, and
that the class was unused. Both halves were wrong by the time /contact shipped.**
`ContactForm`'s submit button carries `.sem-pill-cta` and renders on the cream
contact page. Measured on the built page **before** the change:

| | |
|---|---|
| declared fill `#F8F4EE` on page `#F8F4EE` | **boundary 1.00:1 — no visible edge at all** |
| rendered label at `opacity: .45` | composited `rgb(142,146,150)` → **2.86:1, FAIL** (needs 4.5) |

**Shipped now — navy fill `#0D1B2A`, cream label `#F8F4EE`, 15.87:1**, and
15.87:1 for the boundary against cream as well. That is already the site's
button pairing (SiteHeader's Join pill, the hero CTA, WhySynergy's closing
pill). One button system, not two.

| | old | new | why |
|---|---|---|---|
| fill | `#F8F4EE` | **`#0D1B2A`** | 1.00:1 boundary on cream |
| label | `#0D1B2A` | **`#F8F4EE`** | follows the fill |
| hover | `#EFE1B0` | **`#7D641F`** | cream on gold-pale is **1.19:1**; cream on gold-deep is 5.16:1. WhySynergy's navy pill already hovers to gold-deep |
| focus | global gold ring | **`2px #7D641F`, offset 2** | scoped; see the note below |
| `.contact-submit:disabled` | `opacity: .45` | **`.62`** | 2.86 → **4.79:1**, measured |

**`.sem-pill-cta--on-dark` is the retired pairing, kept where it measures.**
Cream fill / navy label, 15.87:1 on navy, hover `gold-pale` (navy on gold-pale
is 13.30:1 — legal now that the label is navy). Nothing renders it yet; it
exists so a navy band does not invent a second button.

**Why the disabled alpha moved.** `opacity` on a button is a GROUP opacity —
fill and label composite together, then the group composites over the page, so
dimming the button drags its label down with it. Measured ladder on the built
page: `.45` → 2.86 · `.55` → 3.80 · `.60` → 4.45 · **`.62` → 4.79** · `1.0` →
15.87. **The 2.86 was pre-existing, not introduced by the inversion** — the old
cream-fill button's navy label measured exactly the same 2.86. A disabled
control is arguably exempt under 1.4.3's "inactive user interface component"
clause; **the exemption was refused**, for the same reason the §5 roman numerals
refused theirs. It still reads as disabled: 62% against a 100% page, plus
`cursor: not-allowed`, plus the real `disabled` attribute, plus the "not
connected" notice directly beneath it.

🔴 **A SEPARATE, SITE-WIDE DEFECT FOUND WHILE DOING THIS, NOT FIXED HERE.** The
global rule at the top of `globals.css` is `:focus-visible { outline: 2px solid
#c9a84c }`. **Gold on cream is 2.09:1**, under the 3:1 that 2.4.11 asks of a
focus indicator, so every focusable element on a cream surface that is not
inside `.site-header`, `#site-menu` or `.locale-link` — all of which already
override to `gold-deep` — takes a ring that fails. `.sem-pill-cta` now overrides
it too. **The global rule still needs changing and that touches every page.**

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
- **`data-surface`** (route-driven) — 🔴 **RETIRED, see §6a.** It is still
  emitted and still reads `light` everywhere; the branch that returned
  `dark` is gated behind `DARK_SURFACE_ROUTES = false`. What follows is what
  it did, kept because the next dark surface starts here: `dark` on `/{locale}/about`,
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

> 🔴 **SEM HAS NO SCROLL-DRIVEN LOGO BEHAVIOUR. Do not re-litigate this.**
> Measured live in real Chrome at scrollY **0 / 150 / 700 / 800 / 2000** — the
> logo's viewport position, size and transform are **identical at every one**,
> and the navbar's background is `rgba(221,221,221,0)` throughout.
>
> | | their homepage | their inner pages |
> |---|---|---|
> | logo | 196.8 × 193.35, centred, viewport y **274.2** (mid-hero) | 65.6 × 64.43, centred **in the bar**, cy 51.6 |
> | on scroll | does not move | does not move |
>
> **Those are two PAGE states, not an animation.** What looks like a logo
> "rising into the bar" is the difference between their homepage and an inner
> page.
>
> **Ours already does the thing SEM does not**, and it needed no work: measured
> in real Chrome on `/about`, the bar goes 116 → 76px and the logo 75.10 × 64
> (scale 1.3333) → 56.33 × 48 (scale 1), centre y 58 → 38, centre x 760.4
> against a viewport centre of 760.5. That is the homepage's existing
> compaction, shared unchanged now that the dark variant is gone. **No second
> mechanism was invented.**
>
> ⚠️ The Browser pane reports this header as 64px with no background at every
> scroll position, because **CSS transitions never advance there** (trap 1).
> Header state must be measured in real Chrome.

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
| **whole page** | one continuous gradient, daylight into darkness | 🔴 **flat cream `#F8F4EE`** | asked for. A light page cannot have a value descent — cream→greige is 1.11× and anything deeper breaks gold-deep as text. The descent moved into the photographs (6.18× at the zoom, wider than the gradient's 3.87×). See §6a |
| section boundaries | no rules, no cards — the gradient marked everything | 🔴 **nothing at all** | asked for. Whitespace, the photographs and the type scale carry it — §6c |
| §1 hero edge | — | 🔴 **hard cut, no fade** | asked for. Every other photograph on the page already meets its flat colour with no fade; the hero was the only one that did, which is what made it read as a glow — §6d |
| §1 hero copy | — | **32.8px bottom offset — THEIRS** | this is one of the few places we match them exactly, and it only became possible when the foot ramp came out |
| §1 hero sub | 20.5 / 30.75 / **w700**, centred at ≤991 | 20.5 / 30.75 / **w600**, left at every width | 700 beside a w400 Kufam h1 is two competing bolds; theirs has no h1 to sit under, ours does |
| locale switcher | flags, no hover, no focus, jumps left at ≤991 | no flags, hover + focus, stays right | §6e |
| §1 hero | **no headline at all** | h1 + sub | a silent photograph doesn't survive semantics or SEO |
| §2b | award/press logo grid | five carrier wordmarks | fflsynergy has no awards or press logos |

### 🔴 §9a — the dead-space pass, and the numbers that came out of it

A separate sweep of every boundary and every intra-section gap. **There was no
stacked padding anywhere** — every section carried `padding-top` and
`padding-bottom: 0`, so the seams were clean by construction. What was found was
oversized single gaps and one bare spacer.

| # | where | was | now | why |
|---|---|---|---|---|
| 1 | §2b carrier cells | `h-[131px]` holding **21.9px** of type — **109.1 / 112.3 / 93.5** empty per cell | **`h-[56px]`** | 131 is the height the reference needs for logo ARTWORK. 🔴 **Put it back to 131 when the logo files land** |
| 2 | §5 heading → grid | `clamp(48px,8.6vw,131.2px)` — **the full section rhythm, inside a section** | `clamp(32px,4.3vw,65.6px)`, measured **65.4** | the heading read as detached from its own three columns |
| 3 | §2 → carrier row | same clamp, **158.3** | halved with #2 | as above |
| 4 | §4 copy column | **327.4px** of ink top-aligned in a **562px** row → **234.6 empty below** | `justify-center` **and** the full `trust.p1` restored → **404.1** of ink, air **79 above / 79 below** | removing the pill had made this worse. `trust.p1`'s first sentence is fflsynergy verbatim and was unused — `trust.body` was only its second sentence. No cross-page duplication: `trust.p2` was **not** restored, because its first two sentences ship on the homepage as `carriers.subhead` |
| 5 | end of page | bare `h-[clamp(64px,8.6vw,131.2px)]` spacer | **deleted** | dead space *and* the hard cream/navy boundary — see §6a |
| 6 | §7 zoom | `sem-pad-t` **plus** the 225px `scale-50` rest offset = **355.8** from the quote's last line to the card | `pt-[clamp(24px,3.2vw,49px)]` → seam **56 / 32 / 28** | the effect supplies its own air; the padding was paying twice. Dropping it outright went too far — see §9b |

**Seams after that pass**, ink-to-ink at 1536: 155.8 / 139.6 / 131.7 / 138.7 /
57.6. **Two of those were still wrong and are fixed in §9b.**

**Left alone as healthy:** §2 h2→p1 32 · §4 eyebrow→h2 16.4 · §4 h2→body 32.7 ·
§5 label→image 16 · §5 image→body 24 · §5 row-gap 48.

### 🔴 §9b — the second dead-space pass (whole page, three widths)

Run after the hairlines came out. Ink-to-ink, transforms and FadeUp neutralised.

**Nothing had stacked padding at any boundary** — every section carries
`padding-top` and `padding-bottom: 0`. Two real defects, both traced to a cause
rather than shaved at the seam:

| # | where | measured (1536 / 820 / 390) | cause | fix |
|---|---|---|---|---|
| 1 | §2 carrier cells | **34.1 / 37.2 / 18.5** of empty cell | the cell had a fixed height (131px, then 56px) and is `items-center`, so **half the slack landed below the last row of type** — i.e. at the bottom of §2. That is why the §2 → §3 seam ran long at every width: **155.1 / 92.7 / 85.8** against a 130.8 / 69.2 / 64 rhythm | **no fixed height at all.** Grid rows stretch to the tallest cell on their own, so the height was never needed for alignment. Cell = 21.9px = text height, zero slack. 🔴 `h-[131px]` returns when logo artwork lands |
| 2 | §6 → §7 | **7.3 / 5.8 / 4.4** | removing the pull-quote's closing rule took its margin with it. Not a gap — a collision that only looked fine because the zoom's card is drawn 225px lower | `pt-[clamp(24px,3.2vw,49px)]` on the zoom wrapper. Structural **56 / 32 / 28**, perceived **~281 / 288 / 239** once the `scale-50` rest offset is counted |

**Seams after, 1536:** 138.0 / 138.2 / 130.8 / 138.0 / **56.0**. The 138s are
130.8 + 7.4 of blockquote line leading, which is intrinsic to the type, not
padding.

**Measured and left alone as healthy or explained:**

| gap | 1536 | 820 | 390 | |
|---|---|---|---|---|
| hero → §2 | 130.8 | 69.2 | 64.0 | on rhythm |
| §4 → §5 | 130.8 | 69.2 | 64.0 | on rhythm |
| §7 → footer | 0 | 0 | 0 | deliberate — §6a |
| §2 h2 → p1 | 32 | 32 | 32 | healthy |
| §2 last p → carrier row | 92.9 | — | — | explained: 65.6 + the 27.5 column-height mismatch |
| §2 left col vs image col | 27.5 | — | — | inherent to unequal columns |
| §4 eyebrow → h2 | 16.4 | 12 | 12 | healthy |
| §4 h2 → body | 32.7 | 24 | 24 | healthy |
| §4 air above / below copy | 79 / 79 | n/a | n/a | deliberate, balanced |
| §5 h2 → grid | 65.4 | 34.6 | 32 | healthy |
| §5 label → image | 16 | 16 | 16 | healthy |
| §5 image → body | 24 | 24 | 24 | healthy |
| §5 row-gap | 48 | 48 | 48 | healthy |

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

🟡 **Still owed:** `two.agents.body` is a placeholder. fflsynergy's MAIN site has
no agent-recruiting copy anywhere. (`TwoWaysIn` is no longer rendered, but the
string still ships in the catalogue on every page.) ~~**Open question for Ziad:
is `join.fflsynergy.com` in scope as a copy source?**~~ ✅ **ANSWERED — YES.
APPROVED BY THE CLIENT. See §13b.**

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
- ✅ **Address `5728 Major Blvd Suite 702` is VERIFIED — do not re-flag it.**
  It was held for months because Checkmate's JSON-LD carries the same building
  AND the same suite, which looked like lifted data. The client has confirmed
  the reason: **Synergy and Checkmate were one company that split, and the
  office is genuinely shared.** The match is shared history, not copied data.
  Rendered in full on /contact and in the /blog Orlando article. The phone
  `407-434-0400` is **not** shared; Checkmate's only number is `833-997-6934`
- **Light/horizontal logo lockup** — §11
- ~~Whether `join.fflsynergy.com` is an approved copy source~~ ✅ **CLOSED — the
  client has approved it. §13b**

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
| §1 hero | `about-hero-office.jpg` | Synergy's own ("OFFICE PHOTO IMPORTANT"), 1620×1080 | 🟢 **REAL team photo (2026-07-30).** Same 1.5 aspect as the old placeholder, so `object-top` maths unchanged. **2× clearance 52.7%** (1620 vs 3072 @1536): clears 1× (+5.5%), soft at 2× — a real downgrade taken on instruction (authenticity > sharpness). Ships **as shot**, logo baked bottom-right |
| §2 | `gallery-team-presentation.jpg` | Synergy **g8**, 1100×1375 | **exactly 4:5, so this slot performs NO crop at all.** Box renders 465×581 → 930×1163 at 2× → **+18.3%** |
| §4 left | `gallery-advisor-explaining.jpg` | Synergy **g11**, 1000×1250 | crop 972×1250 vs 874×1124 → **+11.2%** |
| §4 right | `gallery-team-meeting.jpg` | Synergy **g2**, 1000×1250 | crop 972×1250 vs 874×1124 → **+11.2%** |
| §5 ×3 | `about-value-rula-speaking` / `-training-skills` / `-aiman-rula` .jpg | Synergy's own, 4640×6960 / 1080×1620 / 1080×1620 | 🟢 **REAL (2026-07-30).** All exactly 2:3 → NO crop. **Parallax DROPPED** → plain `<Image>` in a fixed 2:3 box (box@2× 880×1320 clears; the two 1080-wide by +22.7%). The old Pexels `value-*` stock (1200×1800) stays on disk + in CREDITS.md. Ship **as shot** |
| §7 | `about-zoom.jpg` | Pexels `36777966`, 8000×5338 held at 3840×2562 | no people, so the 0.5→1.0 crop range has no face-crop failure mode |

### 🟡 Available Synergy assets on disk, waiting on a placement decision (2026-07-30)

Client dropped a folder of **real Synergy photographs** at **`public/New Folder/`**
(16 files). Three portraits went to §5 and one landscape to §1 (above); the rest
are **held** because the About layout has **no landscape band** below the hero
and no new layout was added this round. **Do not forget we have these** — they
are real team/office imagery and beat anything stock or licensed.

**Landscape 1620×1080 (1.5), all with the Synergy logo baked in — no home yet:**

| file | shows |
|---|---|
| `SYNERGY OFFICE INSIDE.jpeg` | the real office — open-plan cubicles, monitors, people working |
| `AGENT SPEAKING.jpeg` | a man at a mic presenting, "hosting some amazing companies" screen |
| `SYNERGY AGENTS.jpeg` | five women agents, grey-wall studio portrait |
| `WhatsApp …15.08.09 (1).jpeg` | three women, grey-wall studio portrait |
| `WhatsApp …15.08.09 (5).jpeg` | three people at the glass office door w/ Synergy signage |
| `WhatsApp …15.08.10 (1).jpeg` | office break area, team mingling, pizza |
| `WhatsApp …15.08.10.jpeg` | office floor candid, Synergy pull-up banner |

**Portraits NOT used by §5 (0.667–0.678), also held / available for §2 swaps:**
`RULA SPEAKING.jpg` is at §5 now; spare portraits are `aiman & rula .jpeg`
(1206×1779), `WhatsApp …15.08.09 (2).jpeg` and `…15.08.10 (3).jpeg` (1080×1620).

**Two files in that folder are NOT photos** — `WhatsApp …09.42.38.jpeg` and
`…(1).jpeg` (1254×1254) are the **Synergy logo artwork** (vertical crest and
horizontal lockup on black). The horizontal lockup may answer the Footer's
still-open "wide cream wordmark wanted" note — but it is on black, not cream.

**Decision needed:** add a landscape "inside Synergy" band, restore **§8 Staff**
(still blocked on founder bio copy — see §6), or leave them parked. No layout was
added this round on instruction.

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

### 🟡 `value-legacy` — awaiting a replacement pick

**The inversion turned this from a look into a defect.** `value-legacy.jpg`
(Pexels `8317698`, frame mean **L 0.597**) was chosen as "the brightest of the
set — a bright card against a dark gradient". On cream it sits **1.48× from the
page** while its two neighbours sit at 3.38× and 2.82×, so it reads washed out
and detached from a row that is meant to read as three of a kind.

**Target: L roughly 0.23–0.30**, matching `value-integrity` (0.234) and
`value-education` (0.290).

Candidates already measured for this slot, from `CREDITS.md`:

| Pexels ID | frame mean L | step below cream | parallax face-check | verdict |
|---|---|---|---|---|
| `8317698` | 0.597 | 1.48× | passes | **shipping — too bright on cream** |
| `8769727` | 0.144 | 5.03× | not yet run | **the only measured alternative still in play** — darker than its neighbours but in the right direction |
| `7086015` | 0.171 | 4.34× | 🔴 **FAILS** — forehead clipped at the travel extremes | unusable |
| `20191416` | 0.434 | 1.98× | 🔴 **FAILS** — same failure, was wired then replaced | unusable |

🔴 **Nothing here is a clean match.** `8769727` is the only survivor and it
overshoots the target the other way. **A fresh search is likely needed** — and
any new candidate must clear both bars: frame mean L ~0.23–0.30, **and** every
face inside the parallax safe band **21.5%–78.5%** verified by rendering at the
travel extremes, which is what eliminated the other two.

One line to swap in `VALUE_IMAGES` in `app/[locale]/about/page.tsx`.

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
| `app/globals.css` | **`.about-gradient`** + the whole navy-lift derivation | 🔴 the About page is cream — §6a. Swapping the class on the wrapper is the entire restore |
| `app/globals.css` | the **`[data-surface="dark"]` header block** | retired with the dark page. Its measurements are worth keeping for the next dark surface |
| `app/globals.css` | **`.about-hero-foot`** + its per-row derivation | 🔴 the hero ends on a hard edge — §6d |
| `components/LocaleSwitcher.tsx` | **`LOCALE_SWITCHER_READY = false`** | 🔴 built, mounted, renders `null`. es.json is 43.0% — §6e |
| `components/SiteHeader.tsx` | **`DARK_SURFACE_ROUTES = false`** | gates the `surface` memo's dark branch. Annotated `boolean` on purpose so TypeScript keeps the `"dark"` call sites compiled |
| `components/SiteHeader.tsx` | one focus-ring selector | **inert, not commented** — part of the same restore, left in the list so it is not forgotten separately |
| `app/[locale]/about/page.tsx` | the `RouteTheme` call | ⚠️ **pairs with `suppressHydrationWarning` in `layout.tsx`** — §6a |
| `components/Nav.tsx` | whole file | superseded three-zone nav, rendered nowhere. `SiteHeader` replaced it |
| `components/Calculator.tsx` | superseded layout, in the docblock | kept for revert |
| `routes.ts` | the `UNBUILT` list | six routes, recorded so restoring one is three lines |

`Calculator.headingLevel` (default 2) exists **only** so the calculator's
section header can be the `h1` on its own page. Keep it.

---

## 14. Testing traps — these will waste your time

### 🔴 0. A CLEAN BUILD IS NOT EVIDENCE. Read this before trusting a green tick.

`npx tsc --noEmit` clean and `next build` clean mean the code *parses, types and
compiles*. **They say nothing about whether a URL resolves or a measurement is
the one you meant.** Two defects in a single session passed both gates and would
have shipped:

| defect | what the toolchain said | what the page said |
|---|---|---|
| `usePathname` from `next/navigation` in the locale switcher | ✅ tsc clean, ✅ build clean — the types are identical, both return `string` | rendered `href="/en/en/about"` and `href="/es/en/about"`. Both 404 |
| `max-w-[32ch]` on the hero sub, meant as SEM's 32em measure | ✅ tsc clean, ✅ build clean — `32ch` is a valid length | 427.6px against their 656.35px. A third too narrow, and a different block shape |

Neither is exotic. `ch` is the advance width of "0" (~0.6em in this face), not
the em; and Next's `usePathname` returns the real path, locale segment and all.
**Both are type-correct and semantically wrong**, which is the category a
compiler cannot help with.

The rule this project already follows and should keep following: **read the
rendered value off the built page.** The href off the DOM, the box off
`getBoundingClientRect`, the contrast off composited pixels. A number you did
not measure is a number you guessed.

The same principle is why the hero AA table is re-run after *every* change that
moves anything. Dropping the hero copy from 18vh to SEM's 32.8px moved the sub
from 82% to ~96% of the hero — into the band where the previous scrim shape had
already decayed to zero. **Carried forward unchanged it would have measured
1.44:1 against a 4.5 requirement**, on a page that had passed AA an hour
earlier. Nothing in the build output would ever have mentioned it.

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
7. 🔴 **An alpha derived against one surface is not a number, it is a
   relationship.** Two values on this page failed the cream inversion silently
   and both were still "passing" by inspection: the word-reveal floor (0.45 →
   2.83:1) and the hero scrim shape. **Anything expressed as an opacity, a
   tint, a veil or a scrim must be re-derived when the surface under it
   changes.** Grep for `rgba(`, `opacity`, `FLOOR` and `-scrim` before assuming
   a page-level colour change is cosmetic.
8. **The Browser pane cannot measure the header.** It reports 64px and no
   background at every scroll position because the bar's height and background
   are CSS *transitions*, which never advance there. Header state — compaction,
   surface, logo scale — must be read in real Chrome. This is trap 1 with a
   specific victim.
9. **`usePathname` from `next/navigation` includes the locale segment.** For
   anything locale-aware use the one re-exported from `navigation.ts`. The wrong
   one type-checks, builds, and produces `/es/en/about` — see §6e.
10. **Measure §5's resting positions on the `<li>`, not the inner div.** The
   `<li>` is untransformed by design; the drift lives on its child. `offsetTop`
   is also transform-immune and is the cleaner read.

---

# §12 — /services §4, the mirrored essay: what shipped and what is still open

Built as restaurantsem.com's `.section_mindset-long` with the columns
**reversed** — essay left, sticky visual right. Every measurement is theirs
(`1.75fr / 1fr`, gap `131.2`, sticky `top: 8rem`, frame `2/3`, image column
`display:none` at ≤991); only the order is flipped. Components:
`components/ServicesEssay.tsx`, `.essay-*` in `app/globals.css`.

**Their image column is a 4-second autoplay carousel. Ours is not.** It runs
the same `useSequenceSwap` §2 runs. Verified on the shipped copy: 1→2→3→4→5
across the pin, back to 1 after a hard jump from the page bottom, and
**unchanged after nine seconds parked without scrolling**.

## The word count is load-bearing

A block must be at least as tall as the frame beside it, or the last image
never holds the screen for its own height of scroll. The frame grows until
`.sem-inner` caps at 1476, topping out at 733.5px → **210 words per block** at
the widest viewport (200 at 1536, 140 at 1280, 70 at 992, unconstrained below
992 where the frame is hidden).

Shipped: **304 / 227 / 248 / 239 / 270 words**. Measured block heights at 1536
against a 713px frame: **942 / 750 / 788 / 788 / 816** — all clear. Section
4,084px at 1536, 3,482 at 820, 5,698 at 390.

⚠️ **`b5` was extended late for a layout reason.** At 217 words it measured 662
against the 713 frame — the only failure, caused by
`.essay-block:last-child { padding-bottom: 0 }` removing 49.2px. Fixed by
covering fflsynergy's FIA clause *"a death benefit that passes to your
beneficiaries"*, which the block had not used. **Expansion of an
already-approved source line, no new OUTSIDE.** If `b5` is ever shortened,
re-check it against the frame.

## The copy is EXPANSION, and that was forced

fflsynergy has **no unspent prose** for this slot. Every homepage line already
ships somewhere in this repo — `about.trust.*`, `carriers.subhead`,
`whySynergy.rows.*`, `footer.pullQuote`, `two.agents.body`. The only unused
text on the whole site is the six FAQ answers (~350 words), earmarked for a
FAQ page. The section needs 1,050+. So §4 elaborates published sentences
rather than reproducing unused ones.

Zero n-gram collisions with checkmatefinancialgroup.com at 3-, 4-, 5- and
6-gram across all five blocks and all six headings.

## The OUTSIDE ledger — approved, refused, pending

Approved and shipping: **Tier A** (1-A, 1-B, 2-A, 2-B, 3-C, 4-A, 4-B, 5-A,
5-B, 5-C) and **Tier B** (2-C a flat year still carries charges; 2-D caps limit
the upside too; 3-B term expires and nothing is paid), plus **1-C** (an
outstanding loan is settled out of the death benefit).

🔴 **REFUSED — 3-A, level premium across the term.** *"at a price set at the
outset"* is **not** in the copy. No n-gram collision, but substantively the
same claim Checkmate makes (*"Level premium for the full term"*), and
fflsynergy states level premium only of final expense. Do not reintroduce it
without a decision.

🟡 **PENDING ZIAD, shipping meanwhile — two sentences in `essay.b1`.** Same
status as *"coverage is guaranteed for life"*:

1. the death benefit *"is not counted as income to them"*
2. money borrowed against cash value *"is not treated as income received"*

Both are **tax treatment, not product mechanics.** Written in plain terms with
**no statutory basis cited, on instruction**. If the compliance answer comes
back against, both sentences come out and `b1` drops ~60 words — re-check it
against the frame if so.

## `services.trust.*` is deleted

The three-across row that held this slot is gone from the page and both message
files. Its three claims already ship on the homepage (`whySynergy.rows.r1/r2/r6`)
and on /about, so nothing was lost from the site.

🔴 **"Fold in" did not mean paste.** The row's sentences are **not** reproduced
inside the essay: each is a claim about Synergy — who they work with, how they
sell, where they are licensed — and this section's rule is that it explains
products and says nothing new about the company. The essay took the slot, not
the sentences. The deleted strings, if ever wanted back:

- `trust.heading` — "Why Families Trust Synergy With Their Coverage"
- `trust.t1` — "One Agency. Multiple Carriers." / "We are not locked into one
  company. We compare options across the nation's top carriers to find the plan
  that fits your goals and your budget."
- `trust.t2` — "Education Before Everything." / "We will never recommend a
  product you do not fully understand. We explain every option in plain
  language before you ever make a decision."
- `trust.t3` — "Licensed in All 50 States." / "Whether you are in Orlando, New
  York, Texas, or anywhere in between — our licensed agents are ready to serve
  your family wherever you are."

## 🔴 Two Checkmate collisions found in copy that is ALREADY SHIPPING

Unrelated to §4, found while running the collision check. Both are fflsynergy's
own published wording, so rule 3 does not cover them and rule 2 says rewrite:

| key | shared phrase | Checkmate |
|---|---|---|
| `services.products.p1.body` | "the years your family depends on" | *"For the years your family depends on your income."* |
| `services.products.p6.body` | "the coverage that fits your" | *"Let's find the coverage that fits your life."* |

Not touched. Flagged only.

## The break band was raised

`clamp(260px, 30vw, 460px)` → **`clamp(340px, 40.8vw, 620px)`**. The number is
an aspect ratio: 40.8vw holds ~2.4:1 at 1536 *and* 820. The 620 ceiling caps it
at 72% of an 864 viewport so a section edge is always on screen and it can never
read as a second hero. Measured 620 / 340 / 340 at 1536 / 820 / 390. Nothing
else about the component changed.

## The five images are wired — all five external, none Synergy's

Synergy owns **three portrait-capable photographs wearing six filenames**, all
three already rendered on /about, and none clears the 978 x 1467 bar. Two of
the six (`gallery-leadership-panel`, `gallery-training-session`) read as fresh
assets and are re-crops of photographs already on /about. Full audit in
CREDITS.md.

Shipped, all Pexels License, all 1600 x 2400 at 2/3:

| slot | file | Pexels | mean L |
|---|---|---|---|
| 1 | `essay-desk-evening.jpg` | `35462658` | 0.126 |
| 2 | `essay-sea-horizon.jpg` | `29141332` | 0.266 |
| 3 | `essay-facade-old-new.jpg` | `37136105` | 0.219 |
| 4 | `essay-waiting-chairs.jpg` | `21404971` | 0.339 |
| 5 | `essay-road-hills.jpg` | `38746397` | 0.386 |

Ladder gaps 0.093 / 0.047 / 0.073 / 0.047. **At the achievable optimum** — the
4 -> 5 pair caps the set minimum at 0.047 and both those slots were left
standing, so re-sourcing slot 2 cannot improve it.

🔴 **`alt=""` on all five and `services.essay.b*.imageAlt` is deleted.** The
column is `aria-hidden` and `display:none` below 992, so no alt is ever
announced at any width. If the <=991 rule is reversed, alt must be written
before the images move inside the blocks.

🔴 **No `priority` on the first image.** It was there; at 390 it fetched w=256
and w=640 for a photograph inside a `display:none` column. All five are lazy
and 390 now fetches zero bytes for this section.

🟡 **Not visually confirmed on screen.** Files serve 200 raw and through
`_next/image`, srcs are wired, the swap pairs every block with the right file,
and geometry is measured — but lazy images do not decode in the Browser pane
(`visibilityState: hidden`, 0 rAF/sec), so the rendered pixels need a real
browser before sign-off.

---

# §13 — The blog: /[locale]/blog and /[locale]/blog/[slug]

Modelled on **for-living.it/work**, re-measured live. Grid 2 cols, image ratio
**1.615** held at every width, hover **scale 1.02 on the image only, 0.8s ease**.
Theirs settles at 1.0177 — a Webflow IX2 inline transform, not a designed value.

**Deliberately not reproduced:** their filter bar (`.sem-pad-t` closes the 145px
it leaves — no new token), their two `<h1>`s, their non-monotonic type ramp,
their pointer-following "See more" cursor, and their 0.5/0.6 resting opacities
(3.27:1 and 4.43:1 on cream — both fail AA; ours are 0.78 and 0.72 → 8.08:1 and
6.58:1).

## 🔴 992 DOES NOT GENERALISE. The card grid breaks at 768.

`.essay-*` on /services drops its column at **991** because a **sticky** column
cannot survive a single-column layout — there is nowhere for it to stick. A
**card grid has no such constraint**: it just reflows. Reusing 991 here gave
tablet ONE column and twelve rows instead of six, which is a different page
from the one that was measured and approved. `.blog-grid` uses **768**.
Measured after the fix: 2 / 2 / 1 columns and **6 / 6 / 12 rows** at
1536 / 820 / 390, card 695 / 353 / 352.

## Content lives on disk, not in the message catalogue

`content/blog/<locale>/<slug>.mdx`, loaded by `lib/blog.ts` (`server-only`).
Reasons: ~15,000 words against a 396-key catalogue; article bodies need markup
and the standing rule is that message files never carry any; and a next-intl
namespace reachable from a client component is serialised to the browser.
`en.json` holds seven chrome keys only.

🔴 **The es→en fallback is explicit in `resolveFile()`.** `i18n.ts` falls back
for message KEYS; it knows nothing about files. Without those two lines a
missing Spanish article 404s instead of rendering English. Verified:
`/es/blog/living-benefits` → 200 with no Spanish file present.

🔴 **A frontmatter-only file is a LISTING ROW, not an article.** `hasBody`
gates two things: the card renders without an href, and the route 404s.
Eleven of twelve are currently listing rows. An unbuilt card gets no hover, no
pointer and no tab stop, and **no "coming soon" label — that would be a
timeline claim.**

## Compliance — the blog is worse than /services, by a lot

/services produced five banned phrases. **Article #2 alone produced twenty.**
Screening is per-article, approved one batch at a time.

**Two standing rules for every remaining article:**

1. **Tax treatment: OMIT, never reword.** Same status as `services.essay.b1`,
   pending Ziad. Not "generally tax-free" softened — removed.
2. **Any statutory citation comes out.** (#12 published "IRS Section 101(g)";
   it is gone.)

🔴 **#6, #8 and #9 cannot ship at all until Ziad answers** — "tax-free" is in
their TITLES and excerpts, not just their bodies. They need either his answer
or a commissioned title change, and are sequenced last.

### 🔴 FACTUAL ERRORS ON THE CLIENT'S SITE — send these separately

**These are not phrasing problems and must not be sent with the rewrite list.**
They are statements that are wrong about how a product works or that contradict
another page of the same site. A rewrite fixes our copy; only Ziad can fix his.

**1. The IUL floor is described in a way the mechanic does not work.**
`/blog/indexed-universal-life-iul` states that in a zero-credit year *"you
simply maintain your current value **with no loss**"*. That is false. A life
insurance policy deducts a cost of insurance and policy fees whether or not
interest was credited, so in a period where the index fell and nothing was
credited the account value **goes down**. The error runs in the direction that
flatters the product. Our `services.essay.b2` already states the correct
mechanic — *"a flat year is not a frozen year"* — so his blog and our services
page currently disagree about the same product.

**2. The medical-exam requirement contradicts his own /services page.**
See below.

### 🔴 An internal inconsistency on the client's own site

`/blog` states flatly *"no medical exam required"*. `/services` states *"No
medical exam is required **for most applicants between ages 50 and 85**"*.
**Two pages of the same site disagree about a qualifying condition.** Ours uses
the qualified wording in both places. This is a factual correction for Ziad's
end, not only a phrasing fix on ours.

### Named carriers

#2 as published names **Mutual of Omaha, Aetna and Foresters Financial**. All
three also appear on Checkmate's carrier list. Not shipped — naming carriers is
an endorsement-and-accuracy risk distinct from the "A-rated / AM Best" ban.

## Built so far

| article | status |
|---|---|
| #12 living-benefits | ✅ shipped, 9 rewrites approved |
| #2 final-expense-insurance | ✅ shipped, 20 rewrites — approved |
| #1 term-life-insurance | ✅ shipped, 26 rewrites — approved |
| #3 | listing rows only |
| #4, #5, #7, #10, #11 | listing rows only |
| #6, #8, #9 | blocked on Ziad |

## 🔴 IMAGE SEPARATION: A GRID IS NOT A SEQUENCE

Applies to any future grid, not just the blog.

A **sequence** (the /services §4 essay) shows frames one after another in the
same box, so every frame is compared against every other and the rule is a
GLOBAL minimum separation. A **grid** shows two cards side by side and the pair
above; nobody compares card 2 against card 11. The rule there is NEIGHBOUR
separation — the horizontal and vertical pairs in the rendered order.

Carrying the sequence rule onto a grid fails twice over. On the blog it was
**arithmetically impossible**: band 0.10-0.42, twelve images, eleven gaps, so
the ceiling is 0.029 against a 0.05 rule. And optimising globally produced a
0.006 minimum where optimising for neighbours produced **0.036** from the same
candidate pool.

**Before applying a separation rule, check the arithmetic: (band width) /
(n - 1) is the ceiling.** Then pick the adjacency model that matches the
layout.

## 🔴 A HUB PAGE INHERITS THE ERRORS OF THE PAGES IT SUMMARISES

Found on #11 (`life-insurance-orlando`), which summarises the other products.
Its four product paragraphs re-introduced **"zero downside risk"** and
**"guaranteed income in retirement"** (already removed from #5) and **"ensure
their family is never burdened"** (already removed from #2). The article was
written from his originals, so it carried their claims forward intact.

**RULE: any summary, hub or landing page must be screened against the
CORRECTED articles, not against fflsynergy's versions.** A page that quotes
another page inherits whatever that page said at the time it was written.
Applies to #11 today and to any future index, category or campaign page.

Practical check: grep the new page's product sentences against the shipped
`.mdx` bodies, not against the live client site.

## 🔴 OPEN ITEM FOR ZIAD — published premium figures

Separate from phrasing, and not something a rewrite can solve. **#1 carries two
rate tables** (a term-length comparison and a full premium grid — roughly
eighteen dollar figures, e.g. "~$18/mo", "$500,000 in coverage for under $30
per month"). **#2 carries one.** Both also publish percentage claims about
preferred rates ("10-20% lower", "60-70% cheaper at 25 than at 45").

**None of it is reproduced.** Publishing premium figures is a pricing
representation, not copy: it needs a compliance answer from Ziad in the same
way "coverage is guaranteed for life" does, and the answer governs whether ANY
article on this blog may show a number. Until then every cost section says the
same thing — the inputs move independently, so a quote against your own details
is the only honest answer.

Expect this to recur: any product article can carry a rate table.

Images: **held**. Cards render 1.615 placeholder frames. Synergy's own set
cannot fill a card — largest portrait frame yields 1100 x 681 against a
1390 x 861 requirement at 2x, 21% short. See CREDITS.

---

# §13b — Join Us — ✅ BUILT AND APPROVED

**The header of this section used to read "SCOPED, NOT BUILT / Nothing is built.
No copy is written." Both sentences are now false and are replaced rather than
left to mislead the next pass. Everything below the "what happens next round"
list is retained as the record of how the page was scoped.**

## What is built, and when

Built 2026-07-29. `/[locale]/join` renders in both locales, is in `RouteKey`,
`PATHS`, `HEADER_ROUTES` and `FOOTER_ROUTES`, and is in `isPhotoHeroRoute`.

**Copy is APPROVED** — signed off against the rendered page. `join.*` in
`messages/en.json` carries no `_status` key any more because it no longer says
anything true. `messages/es.json` mirrors every leaf empty, so `/es/join` falls
back to working English until translation lands.

**SIX blocks, not the agreed four.** §13b scoped four on the assumption that the
Join CTA would hand off to `join.fflsynergy.com`. That subdomain returns a Vercel
404 (see `JOIN_URL_EXTERNAL_DEAD` in `routes.ts`), so the page had to grow its
own application surface — §2 (opening block) and §5 (apply) are the two
additions. Both are twinned to measured references; the numbers are in the page
file and in `globals.css`.

## 🔴 WHAT THE PAGE IS WAITING ON — three items, all client-side

**1. THE AGENT PORTAL URL.** The hero carries two CTAs. "Join as agent" is live
and scrolls to §5 through Lenis. **"Agent portal" is rendered, visible and
genuinely disabled** — a real `<button disabled aria-disabled="true">`, so it is
not focusable and cannot be tabbed to, with a visible note beneath it tied by
`aria-describedby` because a grey-out is colour alone and would not satisfy
1.4.1.

It ships visible so the decision is not quietly forgotten, and disabled so it is
not a link to nothing. **This is the ContactForm precedent, not a new pattern.**

*Waiting on:* a portal URL from the client. There is no agent portal today —
`checkmatefinancialgroup.com/agents` has one ("AGENT PORTAL / ONLINE / Already
one of ours? Sign in"), which is what raised the question. The day a URL
arrives: swap the `<button>` for a `<Link>`, delete `join.hero.portalNote` and
remove `.join-cta--disabled` from the markup. Nothing else changes.

**2. THE APPLY CONSENT WORDING.** §5's consent checkbox is BUILT and its label
is the placeholder `join.apply.consentPlaceholder`, which renders a visible
"wording pending" line so the gap cannot be missed on the page.

Checkmate's equivalent reads, in part: *"you authorize Checkmate Financial Group
LLC to text/call the number above… Msg/data rates apply, msg frequency varies…
Text HELP for help and STOP to unsubscribe."* **That was deliberately not
reproduced and not reworded.** It is TCPA consent language naming their legal
entity — a legal instrument, not copy. Rewording it changes what an applicant
agrees to and who they agree with.

*Waiting on:* the exact consent text and the legal entity name it must
reference. The client has confirmed a consent is required.

**3. THE BBB BADGE.** §5 has a trust slot, `join-apply-trust`, built and left
**unrendered**. Checkmate's is an `<a class="bbb-seal">` to their own
`bbb.org/us/fl/orlando/profile/life-insurance/checkmate-financia…` profile.

*Waiting on:* Synergy's own BBB rating and profile URL. The client says Synergy
is accredited. **Do not fill this slot with Checkmate's seal** — it is a
different company's accreditation.

**4. 🟡 §2'S PHOTOGRAPH IS A PLACEHOLDER — it is the hero's own file.**

`§2`'s 16:9 frame currently points at `join-hero-atrium.jpg`, which is also the
hero's photograph. The crop differs (`object-center` on 16:9 against the hero's
`object-top` on 1.5), but it is the same building twice on one page.

*Why it is not simply fixed:* the frame resolves to 1454 x 818 at 1536, so a
source needs to be **2908px wide** to clear 2x DPR. Every unused image in
`public/synergy` tops out at 2400 (`cover-backdrop.jpg`, which is also an
off-palette red sunset), so nothing in the repo qualifies, and the download was
blocked partway through the build pass.

*To fix:* source one landscape >= 2908px wide, croppable to 16:9, in the
register the `article-*` and `essay-*` sets established — architecture or place,
**no identifiable people**, nothing derelict, distressed or scattered-paperwork.
Save as `join-opening-hall.jpg`, point `§2`'s `<JoinFrame src>` at it, rewrite
`join.opening.imageAlt` to describe what actually lands, and add the row to
`public/synergy/CREDITS.md` with native dimensions and the 2x clearance.

## 🔴 The apply form cannot submit, and that is the point

`components/JoinApplyForm.tsx` is a SERVER component: no `"use client"`, no
state, no handler, no `action`, no `method`. The fields are fully visible inside
a `<fieldset disabled>` with a plain `role="status"` notice, exactly as
`ContactForm` does it.

**There is no code path that can show a success state**, because there is
nothing to succeed at. The client's own live site has **three** forms that
render a confirmation and post nowhere. We are not shipping a fourth. The day an
endpoint exists: wire the POST, drop `disabled` from the fieldset and the button,
add validation, error states **and** a success state, and replace the consent
placeholder with item 2 above.

## ✅ The copy blocker is lifted

**`join.fflsynergy.com` is an APPROVED COPY SOURCE.** The client confirmed it.
The open question recorded in §12 and in the "Confirmed by the client" list is
closed. That is the only thing that changed — **copy still stops for approval**,
exactly as it does for every other string on this site. Standing rule 5 is
untouched: nothing goes into `messages/en.json` without explicit approval with
the source line quoted.

## 🔴 Two rules survive the approval and are NOT negotiable

The approval is of a SOURCE, not of its contents. Both of these outrank it:

1. **No agent income, earnings or commission claims.** Any figure, range,
   average, "six figures", "unlimited", "residual income", commission
   percentage or advancement-pay example. This is the rule that already struck
   *"provides life-changing income opportunities for agents"* out of About §3.
2. **No unverified volume claims.** Agent counts, families served, policies
   placed, offices, states, growth rates — unless independently verifiable.

🔴 **If `join.fflsynergy.com` carries either, FLAG THE LINE AND DO NOT CARRY IT
OVER.** Report it with the published wording quoted, the same way the nine
`/services` compliance changes were reported. An approved source does not make a
non-compliant line compliant.

## The agreed scope — FOUR blocks, not eight

The eight-block structure proposed in the research round is **superseded**. It
needed 7–8 licensed photographs, which is more page than the content justifies,
and two of its blocks depended on assets that do not exist. Agreed scope:

| # | block | layout at 1536 |
|---|---|---|
| 1 | **Hero** | full-bleed photograph, `100svh`, copy bottom-left at the 41px gutter, 32.8px bottom offset. `.sem-display` 90.2/90.2 w400, sub `.sem-hero-sub` 20.5/30.75 w600 capped 32em. The /about §1 pattern; add `/join` to `isHeroRoute` and re-run the nav AA over the new photograph at 1536 / 820 / 390 |
| 2 | **The four-item offer** | two-column split: heading rail left, **2 × 2** cards right. `column-gap: var(--sem-gap-logos)` 49.2, `row-gap` 65.6. Heading `.sem-h2` 57.4/68.88, numerals `I–IV` in `gold-deep`, labels `.sem-h3` 49.2, bodies `.sem-body` 21.32/38.38. Stacks to one column below 768 |
| 3 | **The steps** | `.essay-grid` — copy **832.25** left, sticky frame **475.56** right, gutter **131.2**, `top: 8rem`, frame `aspect-ratio: 2/3`, `display:none` ≤991, driven by `useSequenceSwap`. Four steps = four frames, so no scroll position is unfilled |
| 4 | **Closing CTA** | full-bleed `navy #0D1B2A`, `padding-block: 131.2`. `.sem-h2` 57.4 in cream (15.87:1), body `.sem-body` in cream, **one `.sem-pill-cta--on-dark`** |

**DROPPED, with the reason:**

- **The checkerboard** ("what you bring") — needs two more licensed frames and
  a `greige` copy cell. Cut on asset cost.
- **The pull-quote** — needs an attributed quote from the client. Quotes ship
  verbatim or are dropped (standing rule 3), and there is none. Cut.
- **The break band, the FAQ and the credentials row** — cut with the eight-block
  version; four blocks is the agreed page.

**Photograph budget: 5** — one full-bleed hero, four 2:3 sticky frames. Same
sourcing rules as everything else: Pexels License or equivalent, nothing
upscaled, audited at full resolution, **no people presented as Synergy agents**.

**The button is `.sem-pill-cta`** — navy fill / cream label on cream, and
`--on-dark` on the navy closing band. Both now measure (§7). No new button.

## 🟡 What the source-site check already told us about the Join page

Measured while resolving the quote CTAs (§4a), and it changes the shape of the
next round:

- **`fflsynergy.com/join-us` is a COPY PAGE WITH NO FORM.** h1 *"Build Your
  Career. Change Your Life."*, zero `<form>` elements, and **two links out to
  `join.fflsynergy.com`**. So the main site's own join page does exactly what
  our nav pill does — it hands off to the subdomain. That is a second,
  independent confirmation that `JOIN_URL` is the right destination.
- **There are therefore TWO candidate copy sources**, and both are approved by
  extension of the client's answer: `fflsynergy.com/join-us` (prose, on the main
  site, already in scope under rule 1) and `join.fflsynergy.com` (the recruiting
  site itself). **Read both.**
- 🔴 **The bundle carries application-form copy** — *"Submit My Application" /
  "Application Received" / "…within 1–2 business days."* — which does **not**
  render on `/join-us`. If it renders on the subdomain, it is very likely the
  same fake-success pattern as their other two forms. **Do not reproduce a
  form on our /join page on the strength of theirs.** Our Join CTA hands off to
  the subdomain and that is the honest thing until a real endpoint exists.

## What happens next round, in order

1. **Fetch `join.fflsynergy.com` live** and read it in full. **Read
   `fflsynergy.com/join-us` too** — see above.
2. **Cross-check every line against `checkmatefinancialgroup.com`.** Where the
   meaning overlaps, **rewrite for differentiation** and say that is the reason
   — standing rule 2. Remember the shared-history caveat: an overlap is not an
   accusation, and genuinely common factual data (the shared office address) is
   not rewritten at all.
3. **Screen every line against the two rules above.** Flag and drop, do not
   soften.
4. **Come back with the proposed strings and their key names** — a `join.*`
   namespace — for approval **before anything goes into `en.json`.**

Nothing is built until step 4 comes back approved.

## 🔴 2026-07-30 VERIFICATION PASS — what the measurements changed

Both references were re-inspected live and **five recorded numbers turned out to
be wrong**. Every old value is retained, commented, at its rule.

**Browser: the in-app Browser pane, Chromium 148.0.7778.280.** Claude in Chrome
was requested for the reference inspection but the extension was **not
connected**, so the reference was measured in the same Chromium instead.

1. **`useClipReveal` is DELETED.** It was 129 lines, imported only by
   `JoinFrame`, and justified by "the reference's reveal is a clip inset." The
   reference has **no reveal at all** — `transition-duration: 0s`,
   `animation-name: none`, `clip-path: none`. The standing rule is to use the
   existing primitives first and only add one if the reference does something
   none of them can do; it does nothing, so nothing needed adding. The frame now
   enters on **`FadeUp`** (24px / 600ms / `cubic-bezier(0.16, 1, 0.3, 1)`), like
   every other block on the page. `JoinFrame` is a server component again.
2. **Two more of that file's claims were false** and are corrected in place:
   theirs is `overflow: visible`, not hidden, and their image is **1.100× larger
   than its figure box** (1463.7×823.4 vs 1330.9×748.6), spilling out of it.
3. **The §2 rhythm was inverted.** The gaps claimed to hold the reference's
   ratios and did not: 0.517 under the heading (target 0.263) and 0.098 under the
   figure (target 0.160) — generous where the reference is tight and tight where
   it is generous. Re-measuring at all three widths also showed the reference
   **does not hold a ratio at all** (0.263 / 0.529 / 0.590 at 1536 / 820 / 390);
   it renders near-constant absolutes. Both gaps are now absolute-and-fluid and
   land on the reference's own values: **69.4px** and **118.7px** at 1536
   (theirs: 69.9 and 120.1), **50.0px** at 390 (theirs: 50.0).
4. **`63ch` rendered 70 characters, and the rule was on the wrong element.** The
   measure sat on `.join-copy`, an unstyled `<div>` whose font-size is *not*
   fluid, so one px width served two type scales — 63 characters at 1536 and 70
   at 820. It is now on `.join-copy p`, where `ch` resolves against each
   paragraph's own fluid size, calibrated from the render at two widths (one text
   character ≈ 1/1.45 of a `ch` in this face): **43.5ch**. Counted after the
   change: **62–65 characters at 1536 and 820**, 40–49 at 390. This is the third
   instance of this same unit trap on this project — see the commit "Fix the
   article measure: 65ch rendered 91 characters, not 65."
5. **The hero CTA's scroll offset read a stale variable.** It used
   `--header-h-tall` (104px). The bar's real heights are **116px expanded / 76px
   compact at ≥900, 64px below** — 104 is none of them, and `globals.css` already
   warned that this variable went stale when the bar moved to concrete lengths.
   The landing now uses the **compact** height (the state the bar is in once the
   scroll arrives), matching `.page-header-offset`'s 64/76/900px. Clearance is
   now **24.1px at 1536, 23.8px at 820, 24.0px at 390** — it was 52px at desktop.

### 🟡 One thing that could NOT be measured, stated rather than glossed

**Scroll-linked parallax on the reference is unproven, not ruled out.** The
browser pane does not composite, so `requestAnimationFrame` never fires and
`getBoundingClientRect` does not update after a programmatic scroll — rects read
identically at scrollY 0 and 2000. An earlier note in `JoinFrame` claimed
"transform constant across 8 scroll positions"; that sweep never actually
scrolled (first a cookie-dialog scroll lock, then the missing compositor), so it
was eight copies of one reading. **The claim is withdrawn, not restated.** The
resting styles still establish no CSS transition, animation or clip. If a JS
parallax is ever confirmed, `useParallax` already exists.

The same limitation means the **Lenis smooth scroll and the FadeUp entry could
not be watched running** — both were verified by their computed target geometry
and by the arithmetic the handler performs, not by observing the animation.

## 🟢 2026-07-30 — §3b THE PRODUCTS, added

The brief called the page body thin and pointed at `checkmatefinancialgroup.com/agents`
for substance. Their blocks map onto ours as: **THE TERMS → §3 offer**,
**GETTING STARTED → §4 steps** — both already built. The one role genuinely
missing was their **CARRIERS** block ("The paper behind you"): telling someone
what they would actually be selling before asking them to apply.

`§3b` fills it. Four new strings (`join.range.*`); the **seven product names are
read from the `services` namespace**, not retyped, so /join and /services cannot
drift into naming the same products differently.

**Dropped from their block:** "40+ A-rated carriers" and every other count —
an unverified volume claim is dropped, not softened, so there is no "dozens of"
standing in for the number.

**🔴 Their "TECHNOLOGY & TOOLS" block was NOT taken, and that is a compliance
call rather than an editorial one.** It lists an AI CRM, an AI dialer, an agent
portal and an inbound call pipeline. There is no confirmation Synergy has any of
them, and writing them up would be **inventing capabilities**, which is worse
than duplicating copy. The agent portal is the sharpest case: this page *disables*
the portal CTA because the portal does not exist, so describing one in body copy
two blocks away would have the page contradict itself. Their **THE MACHINE**
block ("Here's your Monday", AI call routing) is dropped for the same reason.

**🟡 ALSO NOTED: their apply form carries TWO consent checkboxes, not one** — one
transactional, one promotional, each naming their legal entity. Ours builds
**one**, per what the client approved. If the client's counsel wants the
transactional/promotional split, that is a second checkbox and a second string,
not a rewording of the first.

---

# §14 — /contact

Modelled on **reyou.life/contact**, measured live. Their surface is
`rgb(248, 244, 238)` — #F8F4EE, our cream — and their display face is Kufam,
ours, so this reference sits closer to our system than any other on the project.

Their layout, measured at 1536 x 710: hero two columns **720 + 32 + 720** on a
32px gutter (copy left, form right); detail block **four columns at x 32 / 283 /
533 / 1285**, labels 11px, values 15px. h1 **58/69.6, w400, ls -0.94, Kufam**.
The split is theirs; the spacing is ours, because their 32px gutter is far
tighter than anything else on this site.

## 🔴 THREE DELIBERATE DIVERGENCES — do not "restore" these from the reference

**1. Their §2 is a mental-health crisis notice and is ABSENT here.** It reads
*"If You Are Struggling Right Now"* and directs readers to call **911** and the
**Suicide & Crisis Lifeline on 988**. reyou is a ketamine and Spravato clinic;
that notice is a duty of care specific to what they do. An insurance brokerage
has no equivalent, and manufacturing one would borrow the emotional weight of a
crisis service for a business that does not provide it. **It is not an
omission.**

**2. Their form is a third-party CRM iframe** — `link.psyclecrm.com/widget/form/`,
1472 x 724, parked off-canvas at x = -9967 and revealed on demand. They did not
hand-build a form; they embedded a hosted one, which is the same shape as our
own (blocked) GHL webhook.

**3. 🔴 THEIR MOTION COULD NOT BE MEASURED, AND WAS THEREFORE NOT COPIED.**
GSAP, ScrollTrigger and Flip are all loaded, and their hero h1 sits at
`opacity: 0` with `transform: none`, so an opacity-only entry reveal exists.
But **their preloader never dismisses under automation**: `readyState` reaches
`complete` while `.loader` stays `display: block; opacity: 1` and
`document.body.scrollHeight` stays pinned at one viewport (710). No reveal ever
plays, so no duration and no easing could be read. Reloading and waiting nine
seconds did not clear it. Guessing at numbers would be inventing them, so this
page uses **`FadeUp`** — ours, and the entrance every other page already uses.
If you re-measure, expect the same block.

## The form is present, complete and visibly disabled

`components/ContactForm.tsx`, following the `LeadModal` pattern. It is a SERVER
component with no client JS attached, no `action`, no `method` and no handler,
so it cannot submit or fake a submission.

🔴 **THERE IS NO SUCCESS STATE IN THE FILE AT ALL, AND THAT IS SEQUENCING, NOT
AN OMISSION.** A success message is only written when the POST exists, so no
code path can reach one before there is something to succeed at. Adding it now —
even behind a flag — would recreate exactly the bug fixed in `LeadModal`, which
used to run `preventDefault(); setSent(true)` and show "Thanks — we'll be in
touch" while sending nothing.

**The day the GHL webhook arrives, four things change and nothing else:**
1. wire the POST to the endpoint
2. drop `disabled` from the `<fieldset>` and the submit button
3. add a real `onSubmit` with validation, error states **and** a success state
4. swap the "not connected" notice for `contact.form.legalNote`

Markup, labels, focus rings, error styling and the select options are final.

**Accessibility divergences from the reference, deliberately:** reyou ships five
fields with placeholders and **no `<label>` elements at all**. Every field here
has a real visible `<label>` tied by `htmlFor`. Errors render text plus a symbol
via `.contact-field-error`, never colour alone — dormant until step 3, but
styled now so the wiring pass cannot forget the rule.

## 🟡 The legal note ships with UNLINKED document names

fflsynergy's form links *"Privacy Policy"* and *"Terms of Service"*. Both routes
are **BLOCKED** on this site — they are legal documents that must come from the
client. A link to a 404 is worse than a name without a link, so the sentence
ships with both names in plain text. **Link them the day the documents land.**

---

# 🔴 §13a — THE ARTICLE CENTRING IS REVERSED. THE TEMPLATE IS /services §4.

**Read this before touching `app/[locale]/blog/[slug]/page.tsx`.** The previous
revision of this file describes a centred article and argues at length for it.
That argument was overruled on instruction and the layout is gone.

## What changed

| | was | is |
|---|---|---|
| wrapper | `.blog-measure` — `max-width: 31em; margin-inline: auto` | `.essay-grid` — the /services §4 grid |
| copy | one centred column, 604.5 @1536 | `.essay-copy`, **832.25** @1536, left |
| image | none | `.essay-sticky`, **475.56**, right, `top: 8rem` |
| gutter between | — | **131.2px** |
| below 991 | n\a | sticky `display: none`, copy runs single-column |
| prose ramp | `clamp(16.5, .36vw + 15, 19.5)` / lh 1.62 | `.sem-body` `clamp(18.98, .305vw + 16.67, 21.32)` / lh 1.8 |
| chars/line | 67 | **86** |
| body element | one `<MDXRemote>` | one `<section>` per h2 |

**Nothing above is re-derived here.** `.essay-grid`, `.essay-copy`,
`.essay-sticky` and `.essay-frame` are the SAME rules `/services` reads, in
globals.css. The two routes cannot drift apart, and a change to that grid moves
both. Measured on the built page, not converted: 832.25 / 475.56 / 131.2 gap /
sticky `top: 128px` / frame 475.56 × 713.34 at 1536; 750.65 single column with
the sticky column `display: none` at 820; 352.27 at 390.

## 🔴 86 CHARACTERS IS ACCEPTED, NOT A DEFECT TO FIX HERE

**The copy column is not to be narrowed.** That is explicit. The section below
(§14) logs the 86-character measure on /services and still stands as a finding —
but on this route it is a decision, not a bug, and the two must not be
conflated by a later pass "fixing" the article.

The type moved because narrowing was ruled out and size is the only other lever:
characters = width ÷ font-size. At 19.5px in an 832.25px column the line runs
**~93** characters; at `.sem-body`'s 21.32px it runs **~85**. Re-counted on the
built page by per-character `Range` rects, last line of each block dropped:

| width | copy column | body px | lines | min | **median** | mean | max |
|---|---|---|---|---|---|---|---|
| 1536 | 832.25 | 21.309 | 41 | 53 | **86** | 84.9 | 106 |
| 820 | 750.65 | 19.125 | 41 | 53 | **86** | 84.2 | 94 |
| 390 | 352.27 | 17.16 | 83 | 31 | **43** | 42.8 | 50 |

⚠️ **The min/max spread is wider than /services' 76–93 and that is the CONTENT,
not the layout.** This article carries two bullet lists; a four-word list item
is a short line by definition. The paragraph median is the /services number.

## The four frames, and what a section without one does

`ARTICLE_FRAMES` in the template, **keyed on the heading slug, never on the
section index** — an index rots the moment a section is inserted, and a
mis-keyed frame is the failure that has already happened twice on this project.

| # | section | frame | shipped L |
|---|---|---|---|
| 1 | Quick summary | — inherits ↓ | — |
| 2 | Which products are available | `article-arched-windows.jpg` | 0.212 |
| 3 | What it costs | `article-stair-concrete.jpg` | 0.415 |
| 4 | What a broker does that a captive agent cannot | `article-colonnade-doors.jpg` | 0.290 |
| 5 | What to have ready | `article-pigeonholes.jpg` | 0.132 |
| 6 | Frequently asked questions | — inherits ↑ | — |

**THE SKIP RULE.** A section gets a frame if it is substantive body prose. It
does not if it is (a) a summary or abstract, (b) an FAQ, or (c) a single
paragraph — in all three the section is either restating the article or is too
short to hold a frame's worth of scroll, and a frame that swaps in and straight
out reads as a glitch.

**WHAT THE EMPTY SLOT DOES — and this is the answer to the objection that
killed this layout the first time.** Nothing swaps. A skipped section holds the
frame of the nearest qualifying section **above** it; a skipped section above
the first qualifying one holds the **first** frame. So the summary opens on the
products frame rather than on a hole, and the FAQ closes still holding the
"what to have ready" frame. **There is no scroll position at which the sticky
column is empty.** That is what makes the pattern survivable on an article,
where /services gets it for free by having an image per block. The frames are
`alt=""` inside an `aria-hidden` container, so holding one across a section
boundary asserts nothing about that section.

An unlisted slug is not a crash — it inherits.

## ✅ ALL NINE ARTICLES ARE ON THE GRID. 41 FRAMES. NO FALLBACK BRANCH.

| article | h2 | frames | ladder min gap |
|---|---|---|---|
| `term-life-insurance` | 9 | **6** | 0.076 |
| `final-expense-insurance` | 10 | **5** | 0.093 |
| `mortgage-protection-insurance` | 9 | **5** | 🟡 0.056 |
| `indexed-universal-life-iul` | 7 | **5** | 0.073 |
| `fixed-indexed-annuity-fia` | 8 | **5** | 0.063 |
| `truck-drivers-retirement` | 8 | **5** | 0.063 |
| `life-insurance-orlando` | 6 | **4** | 0.125 |
| `itin-holders-life-insurance` | 5 | **3** | 0.105 |
| `living-benefits` | 5 | **3** | 0.084 |
| | **67** | **41** | |

Sources, crops, subjects, ladders and the full rejection list are in
**public/synergy/CREDITS.md**. Every one of the 41 was viewed at full resolution
before it was written; that audit rejected **18 candidates that had already
cleared luminance, resolution and register** — six for people in frame, seven
for dereliction or neglect, five for legible signage or a place claim, plus a
chapel and a statuette on religious specificity. The rate is nearly one in
three, which is the argument for the rule.

### 🔴 A BRANCH EXISTED FOR ONE PASS AND IS NOW DELETED — keep the measurement

When only the Orlando article had frames, the template branched on
`frames.length` and rendered the old `.blog-measure` centred build for the other
eight, because **an unpaired `.essay-copy` inside `.sem-inner` measures 1,505px
at 1536 and the prose runs a median of 217 characters per line** (max 233,
measured on `term-life-insurance` before its frames landed). That branch is gone
because every body now has frames.

**The consequence for anyone writing article number ten: a body must not ship
without its frames.** There is no longer a layout that catches it — it would
render at 217 characters. Either source the frames first, or restore the branch;
`.blog-measure` is kept commented in globals.css with all its numbers for
exactly that. Three frontmatter-only entries (`iul-self-employed`,
`iul-vs-401k-construction`, `nurses-tax-free-retirement`) are listing rows and
404, so they are not affected.

### The one ladder below target, stated rather than hidden

🟡 **`mortgage-protection-insurance` ships a minimum adjacent gap of 0.056**
against a 0.06 target. Its five values cluster into two close pairs
(0.171/0.183, 0.263/0.282) and 0.056 is the best any ordering achieves —
checked exhaustively, not estimated. Opening it means replacing a frame already
audited at full size. The subjects at that seam — a garden gate and a brick
facade — share nothing, and subject change is what makes a swap legible. For
reference the /services essay five shipped at a min of 0.047.

## Verified on the built page

Brave/Chromium **148.0.7778.280** (Claude 1.24012.9 / Electron 42.7.0), dev
server.

**All nine articles swept at 1536 × 900**, 31 scroll samples each plus a hard
jump to the bottom and back. Every one passes on the same three assertions:

| article | blocks | frames | distinct pinned `top` | swap order | jump ↕ |
|---|---|---|---|---|---|
| term-life-insurance | 9 | 6 | **[128]** | 1→6 in order | ✅ |
| final-expense-insurance | 10 | 5 | **[128]** | 1→5 in order | ✅ |
| mortgage-protection-insurance | 9 | 5 | **[128]** | 1→5 in order | ✅ |
| indexed-universal-life-iul | 7 | 5 | **[128]** | 1→5 in order | ✅ |
| fixed-indexed-annuity-fia | 8 | 5 | **[128]** | 1→5 in order | ✅ |
| truck-drivers-retirement | 8 | 5 | **[128]** | 1→5 in order | ✅ |
| life-insurance-orlando | 6 | 4 | **[128]** | 1→4 in order | ✅ |
| itin-holders-life-insurance | 5 | 3 | **[128]** | 1→3 in order | ✅ |
| living-benefits | 5 | 3 | **[128]** | 1→3 in order | ✅ |

`.essay-copy` measures **832.25** on all nine. Release (the container bound) at
80–86% of travel on every one. Zero console errors, zero server errors,
production build clean, 33/33 static pages generated.

At **820**: single column 750.65, sticky `display: none`, block seams 51.5,
median 87 characters, **zero `article-` image requests**. At **390**: column
352.27, sticky none, seams 40, median 44 characters, no horizontal overflow,
**zero `article-` image requests**.

The detail below was measured on `/en/blog/life-insurance-orlando` and holds for
all nine.

- **Sticky holds against Lenis with zero drift.** 41 samples across the full
  **3,854px** travel. Over the pinned run the set of DISTINCT values of
  `getBoundingClientRect().top` is **`[128]`** — one number, not a range. 31 of
  the 41 samples sit on it. **No jitter, no sub-pixel wobble, no frame-lag
  against the copy.** The structural reason is the one `useStickyZoom` already
  records: `document.documentElement` and `body` both compute `transform: none`,
  so Lenis is driving NATIVE scroll and the pin is composited by the browser,
  not by GSAP. CSS sticky cannot desynchronise from it — which is exactly why
  the /services grid uses `position: sticky` and not ScrollTrigger's `pin`.
- **Release at scrollY 3,083 — 80% of the travel** — and it is the normal
  container bound, not a failure: `128 + 713.34 = 841.34` against a falling
  `grid.bottom`. The frame rides out over the last 771px with the FAQ, exactly
  as /services' does.
- **Swap sequence correct and in the right places**: arched-windows holds
  0 → 1,445 (summary + products), stair 1,542 → 1,831, colonnade 1,927 → 2,409,
  pigeonholes 2,505 → end (ready + FAQ). Three swaps, four frames, six sections.
- **Correct after a hard jump** in both directions — bottom lands on
  pigeonholes, top lands on arched-windows — which is the `useSequenceSwap`
  property the reference implementation demonstrably lacks.
- **Zero bytes fetched for the column at 820 and 390.** `performance
  .getEntriesByType('resource')` returns **0** entries matching `article-` at
  both widths. No horizontal overflow at 390.
- Block seams: **98.4** at 1536 (2 × 49.2), **51.5** at 820, **40** at 390 —
  the /services rhythm, and identical between every pair.
- Exactly one `<h1>`; blocks are `<section>`, not `<li>` — see below.
- Zero console errors, zero server errors, production build clean.

🟡 **No screenshot was captured.** The Browser pane was not displayed in this
session, so the page never composited frames: `computer{screenshot}` times out
and CSS transitions freeze at their last painted value. Everything above was
measured from live layout instead (`getBoundingClientRect`, `getComputedStyle`,
`Range` rects), and the crossfade was verified by reading the class binding with
`transition: none` forced. **The visual composition is unscreenshotted.**

## 🔴 `<section>`, not /services' `<ol>`/`<li>` — the one markup divergence

On /services the essay blocks are a **set** — five named principles — and a list
is what they are. Here they are the running body of one article, each already
introduced by its own h2. An `<ol>` wrapper makes a screen reader announce
"list, 6 items" and read every paragraph inside a list item. `.essay-block` is a
class, not an element, and it styles a `<section>` identically.

## Two CSS corrections the split forced

Both are the same shape as `.essay-block:last-child` on /services — *the block's
padding is the section rhythm, an element's own margin is internal rhythm, and
only one of them may own a seam.*

1. **`.blog-prose > h2:first-child { margin-top: 0 }`.** Every block now opens
   on its h2, whose `margin-top: clamp(40px, 5vw, 65.6px)` stacked on top of
   `.essay-block`'s `padding-block: clamp(32px, 4.3vw, 49.2px)` — a ~115px seam
   against a 49.2 rhythm.
2. **`.blog-prose { margin-top }` REMOVED.** It was the gap under the meta line
   when `.blog-prose` was one element for the whole article. It is one element
   *per section* now, so it fired between every pair of sections.

## What is retained, and where

- **`.blog-measure` is COMMENTED OUT IN FULL and renders nowhere** — the rule,
  the centring (`max-width: 31em`, `margin-inline: auto`), its 19.5px / lh 1.62
  ramp and its prose top-margin are all kept verbatim inside the comment block
  in globals.css. Restoring the centred build is uncommenting it and wrapping
  the article's children in it again.
- **Every replaced value is commented in place with the old number intact** —
  both earlier prose ramps (`clamp(16.5, .32vw + 15, 18.4)` and
  `clamp(16.5, .36vw + 15, 19.5)`) on `.blog-prose`, `.blog-prose p` and
  `.blog-prose li`; `line-height: 1.62`; `max-width: 30em`; and
  `.blog-prose { margin-top: clamp(32px, 4.3vw, 49.2px) }` with the reason it
  had to go.

---

# 🟡 §14 — LOGGED, NOT ACTED ON — /services §4 ships an 86-character measure

Found while measuring `/services` as a candidate pattern for the article
template, and logged on instruction rather than fixed. **This is a defect on a
shipping page.** Not touched in this pass.

⚠️ **SUPERSEDED IN PART.** The article template now runs this same grid and the
86 characters were **accepted on instruction** there — see §13a. The number
below is still the measurement; it is no longer an open question on the blog.

Measured in Brave 138.1.80.125, `.essay-copy` paragraphs, counting real glyphs
per rendered line via per-character `Range` rects — not converted from `ch`:

| width | copy column | sticky column | body size | chars/line (min / avg / max) |
|---|---|---|---|---|
| 1536 | 832.1 @ left 41 | 475.5 @ left 1004.3 | 21.32 | 76 / **86** / 93 |
| 820 | 750.1 @ left 27.4 | **`display: none`** | 19.171 | 76 / **86** / 94 |

The comfortable band is 45–75. The section runs **86 at both widths** across
**1,288 words** (5 blocks of 227–304), which is more prose than the longest blog
article. ~~For comparison the blog article now measures **67**.~~ 🔴 **That
comparison is void — the blog article was rebuilt on this grid and now measures
86 too, deliberately. See §13a.**

Two things make it worse than the number alone suggests:

- **Below 991px the image column is `display: none`**, so at 820 the section is
  1,288 words in a single unpaired 750px column at 86 characters. The sticky
  image — the thing that justifies the wide copy column — is not there.
- The grid is `1.75fr / 1fr` with a 131.2px gap, so the copy column's width is
  derived from the sticky column's, not from a measure. Nothing in the section
  is holding the line length to anything.

**Do not "fix" it by narrowing `.essay-copy` alone** — that re-opens the
one-sided gap on the right that the sticky column exists to close, which is the
same trap the article template was just pulled out of. The fix is a decision
about the grid ratio and the body ramp together.

