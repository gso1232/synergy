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
> 🔴 **NEWEST (2026-08-02, l) — SIGN-IN SHIPPED VISIBLE · WHO-WE-SERVE CARDS ARE
> PHOTOGRAPHS · SPANISH PASS 1 (HOMEPAGE + CHROME COMPLETE).**
>
> **1 · AGENT LOGIN IS PUBLIC NOW, ON INSTRUCTION.**
> `AGENT_LOGIN_LINK_READY` is `true` (SiteHeader bar + mobile panel) AND the
> /join hero's "Agent portal" CTA is a real `<Link>` to `/{locale}/login`. **They
> were flagged as one question in two places and were flipped together — flip
> them together or not at all.** `.join-cta--disabled` is retired from that
> component and replaced by `.join-cta--ghost`; the rule and its derivation stay
> in globals.css as the only solved disabled-control treatment on a dark
> photographic surface. `join.hero.portalNote` ("The agent portal is not open
> yet.") is **retained in both message files and deliberately unrendered** — it
> became false the moment the link went live — and the prop is still accepted so
> restoring the disabled state is a revert, not a re-authoring.
> 🟡 **THE OBJECTION WAS OVERRULED, NOT REFUTED, AND IT NAMES THE NEXT JOB.**
> `(portal)/` still holds only `admin` and `login`; `login/actions.ts` still ends
> `redirect(role === "admin" ? /{locale}/admin : /{locale})`, so a non-admin who
> signs in lands on the PUBLIC HOMEPAGE with no signed-in state rendered anywhere
> and `signOut` living only inside AdminShell. **The door is findable and the
> room behind it is empty for an agent. That is an accepted intermediate state —
> do not "fix" it by hiding the link again.**
>
> **2 · THE WHO-WE-SERVE CARDS ARE PHOTOGRAPHS. THE THREE FLAT SKINS ARE GONE.**
> `bg-navy` / `bg-gold-deep` / `bg-gold` and their three ink triplets are deleted;
> every card is one photograph, one scrim, one ink. Six new files, all Pexels
> License, full table + per-file "what it actually shows" + rejections + AA in
> `public/synergy/CREDITS.md`.
> 🔴 **THE SCRIM IS A FULL-CARD WASH, NOT THE REFERENCE'S BOTTOM GRADIENT, AND
> MEASUREMENT FORCED THAT.** Built the reference's shape first, then measured the
> real copy block on the built page: at 768 the card is 712.8x560 and the copy
> runs **5% to 95% of card height** — title + three bullets + action fill it, and
> `justify-end` has no slack to distribute. With the bottom-only ramp the worst
> composited pixel was **cream 1.32:1** against a 4.5 bar. All six failed at all
> three widths. Now a **0.65 base wash ramping to 0.88**, which clears both bars
> against a **clipped-white pixel** — so the guarantee holds for ANY future image
> swap, not just these six. Re-measured per pixel on the real files: **18 of 18
> pass**, site-worst cream **4.96**, site-worst gold-pale **4.16**.
> 🟡 **COST, FLAGGED NOT HIDDEN:** the photograph is toned throughout instead of
> clean at the top. That is the direct price of keeping the card COPY verbatim —
> five times the reference's title-plus-one-stat cannot live in a bottom third.
> The only levers are copy or card height, both client decisions.
> 🔴 **A BUG INTRODUCED AND CAUGHT BY MEASURING: `sizes` MUST DECLARE THE CARD'S
> LARGER SIDE, NOT ITS WIDTH.** The source is SQUARE and the card is taller than
> wide at two of three breakpoints, so `object-cover` scales to fill the HEIGHT.
> Shipped first as the measured widths (`480px` at lg+); the browser then picked
> a **480x480** candidate for a **480x680** box — a silent 1.42x vertical upscale
> on the widest layout. Now `680px / 720px / 460px`.
> 🔴 **SYNERGY'S OWN PHOTOGRAPHY CANNOT FILL THESE CARDS.** Every own landscape is
> 1620x1080; at the card's 0.706 aspect that is 763x1080, **20.6% short on both
> axes** against the 961x1360 needed at 2x. Only `RULA SPEAKING.jpg` clears and
> that face is already on /about and /join. Same conclusion as entry (j) reached
> about the cut-out. **Do not re-derive this a third time.**
>
> 🔴 **NEWEST (2026-08-03, ab) — FAVICON + OG · PERF PASS · /join HERO SWAPPED ·
> SPLASH SCOPED TO HARD LOADS · /about HERO SHARPENED · FAQ AUDIT.**
>
> **1 · FAVICON.** 🔴 THE LOCKUP CANNOT BE A FAVICON — `synergy-logo.svg` is
> 1120x340 (3.29:1); at 32px it would be 32x10. The SVG contains a SEPARABLE
> SQUARE CREST (shield + figures + sparkle, x 110-371 / y 40-320) with the
> wordmark starting at x=430, so the crest was extracted to its own square
> viewBox with ~6% padding. Shipped via Next FILE CONVENTIONS —
> `app/favicon.ico` (multi-size 16/32/48, hand-built ICO since sharp cannot emit
> one), `app/icon.svg`, `app/apple-icon.png` (180, flattened on navy so iOS does
> not matte it black). 🔴 `icons` is deliberately NOT declared in metadata as
> well: Next fingerprints the file-convention assets, and a second hand-written
> set would emit unfingerprinted duplicates and pin a stale favicon in cache.
> OG/Twitter added with `metadataBase` (absolute URLs are mandatory — relative OG
> images are dropped by every scraper) + a generated 1200x630 `public/og-image.png`.
> ✅ Verified on a production build: all four assets 200, and the served HTML
> carries `rel="icon"` x2 + `apple-touch-icon` + 6 og: + 3 twitter: tags.
>
> **2 · PERFORMANCE — ⚠️ LIGHTHOUSE COULD NOT BE RUN.** No Chromium is installed
> on this machine (checked Chrome and Edge across all standard paths) and
> Lighthouse requires one, so there is **no before/after Lighthouse score and I
> will not invent one.** What was measured instead is production bundle size.
> 🔴 **A NEGATIVE RESULT, KEPT:** `next/dynamic` on `EngineNoise` made the
> homepage **WORSE — 166 kB -> 167 kB** (an 8 KB dependency-free leaf loses to
> the chunk + loader overhead). It was REVERTED and the measurement recorded in
> TheEngine.tsx so it is not "optimised" again. The same change on `AdminSilk`
> (15 KB shader) DID pay: **/admin 112 kB -> 109 kB**, kept.
> 🟡 **WHAT CAPS THE HOMEPAGE:** 87.5 kB of the 166 kB is the shared chunk, and
> the largest single piece is framer-motion (53.6 kB), used by the hero and most
> sections. Removing it means rewriting the animations — which the brief forbids.
> Everything else is already optimal: next/font (self-hosted, swap,
> adjustFontFallback), next/image with AVIF+WebP, static generation for all 42
> pages, route-level code splitting.
>
> **3 · /join HERO SWAPPED** to `join-hero-team-2026.jpg` (copied out of
> `public/New folder/` — spaces in a public path are fragile). 1620x1080, ar
> 1.500 — **IDENTICAL dimensions to the outgoing image**, so the crop maths carry
> over and the 2x shortfall is unchanged: **clears 1x (+5.5%), 47.3% short at 2x
> on a 1536 box**. No upscaling.
> 🔴 **IT BROKE THE NAV AND A JOIN-ONLY VEIL WAS ADDED.** The photo has a lit
> white suspended ceiling exactly where the header sits. Per-pixel over the real
> header box: 1536x900 = 4.516 (passes by 0.016), 1440x900 = 4.520, **1280x800 =
> 4.252 FAIL**. The worst pixel backs out to essentially PURE WHITE, so it is the
> brightest a pixel can be, not a sampling artefact. New `.join-hero-veil-top`
> holds 0.66 through 30% of the ramp (>= 0.61 is required against pure white).
> 🔴 THE SHARED `.hero-veil-top` IS UNTOUCHED — it serves 5 other routes, each
> with its own solved table. **Re-run exhaustively at 9 viewport sizes: nav
> 5.93-9.73 · eyebrow 7.51-8.09 · h1 7.80-7.87 · sub 6.61-9.23, ALL PASS.**
>
> **4 · SPLASH — HARD LOADS ONLY.** 🔴 The old docblock claimed it never replayed
> on client-side navigation; that was true only WITHIN one layout. Splash lives in
> `(site)/layout.tsx` and `(portal)/` is a SEPARATE ROUTE GROUP, so
> `/en/login -> /en` unmounted and remounted it and `useState(true)` replayed it.
> Fixed with a MODULE-SCOPE flag: created once per document, survives every
> client-side navigation, dies on a real load — which is exactly first-visit +
> refresh. 🔴 sessionStorage would be WRONG (it survives refreshes, so the splash
> would never play on one); `performance.navigation.type` alone is insufficient
> (a soft nav creates no new entry). ⚠️ The flag is set when the panel LIFTS, not
> on mount, because Strict Mode double-mounts and would otherwise skip it in dev.
> ✅ **Verified on a production build: 15 sampled states across `/en -> /en/about`
> and `/en/login -> /en`, ZERO replays.**
>
> **5 · /about HERO — NO SHARPER SOURCE EXISTS.** `about-hero-office.jpg` is
> 1620x1080 and so is its original (`New folder/OFFICE PHOTO IMPORTANT.jpeg`) —
> as is every other own office frame on disk. The softness is real and already
> documented as a client-instructed trade (authenticity over sharpness; the
> 3840x2560 file it replaced is a family placeholder of strangers). Upscaling
> refused. What WAS recoverable is compression damage, magnified by the ~1.9x
> browser upscale: measured variance-of-Laplacian on the served derivative,
> **q74 = 665 -> q88 = 809** (+22%), against the uncompressed ceiling of 923.
> ⚠️ COST: this is the LCP image; AVIF 239 KB -> 374 KB. Sharpness was asked for
> explicitly so it wins, but item 2 and item 5 pull opposite ways here.
>
> **6 · FAQ — DOES NOT EXIST. HANDOFF's "unbuilt" status is ACCURATE.** No
> `/faq` route (no directory), no FAQ component, no accordion anywhere, no `faq`
> key in routes.ts / nav / footer / either message file. Every "FAQ" string in the
> repo is a COMMENT describing the client's own FAQ as a COPY SOURCE (services
> §4's unspent prose, blog article structure, HowItWorks, WhySynergy). Nothing
> links to a FAQ, so there is no 404 to fix. Not built, as instructed.
>
> 🔴 **(2026-08-03, aa) — DASHBOARD BAR HIDES ON SCROLL · GREETING
> PROMOTED · LOGIN FIELD ANATOMY REBUILT. ✅ ALL 14 AUTH FILES BYTE-IDENTICAL.**
>
> **1 · THE ADMIN BAR HIDES ON SCROLL DOWN, REVEALS ON UP.** SiteHeader's exact
> mechanic and constants (HIDE_AFTER 120, DIR_DELTA 8). 🔴 THE DEBOUNCE IS AN
> ACCUMULATOR, NOT A TIMER — a timer adds latency to the one gesture that must
> feel instant. ✅ **PROVEN: 8 alternating ±3px jitter reversals produced ZERO
> flips; a decisive 40px up-scroll revealed it immediately.** 🔴 The bar had to
> become `fixed` (was `sticky`) — a sticky element is still in flow, so
> translating it away leaves a 64px hole; `.admin-main` pays the height back as
> padding. 🔴 NOT copied from SiteHeader: its Lenis polling — the portal is
> deliberately outside SmoothScroll, so the native listener is the whole story
> and the polling would wait 4s for an instance that never arrives. Focus forces
> the bar visible (tabbing to an off-screen link is a literal focus trap), and
> reduced motion switches the behaviour OFF rather than making it a jump-cut.
>
> **2 · THE GREETING LEADS THE PAGE.** 14px ink/70 → display face, 44px at
> desktop, full ink. 🔴 IT IS STILL A `<p>`, NOT AN `<h1>` — the h1 is
> "Dashboard" because that names the page; a greeting names nobody, and
> promoting it would tell a screen reader the page is called "Good morning,
> Aiman". The h1 steps down VISUALLY to a 17px label (done with utilities on the
> element, not a CSS rule that would lose to them). Full ink not ink/70: at that
> size softened ink read as disabled, and solid measures 12.33.
>
> **3–6 · THE LOGIN FIELD ANATOMY WAS BROKEN, AND IT WAS ARITHMETIC.** The
> floating label was `absolute top-3` with a base `-translate-y-6`, so its raised
> position was **−12px — twelve pixels above its own container**, in space
> nothing reserved. That produced all three reported symptoms: it landed in the
> subhead on the first field, on the email underline for the password field, and
> crossed THROUGH the input's text on the way up ("pushes the label into the
> input text"). `scale-75` about `origin-[0]` shifted its optical left edge, the
> "misaligned at the end".
> ✅ **FIXED LABELS ABOVE THE INPUT.** A floating label shares one box with the
> value, so every fix is a negotiation over the same 20px; a label in its own
> block cannot overlap at any width, size or locale — the failure mode is removed
> rather than tuned. Fields are boxed, icon and show/hide centre on the INPUT's
> own relative box (the old `bottom-1.5` pinned the toggle to the group's base).
> **VERIFIED: zero label/input overlap in empty+blur, filled+focused AND
> filled+blur, at 1440 and 390; fields aligned; toggle centred; 0 overflow.**
> 🔴 **BORDER cream/40 — cream/30 MEASURED 2.55, A FAIL.** With boxed fields the
> border IS the boundary (1.4.11, 3:1). Swept on the card's worst composite
> rgb(30,40,45): /30 = 2.55 FAIL, /35 = 2.97 short, **/40 = 3.44 PASS**. Same
> shape of finding the retired underline produced.
> **4 · "STAFF & AGENT PORTAL" REMOVED** — it was the ONLY text sitting directly
> on the moving smoke, and had cost two AA re-derivations (ink/80 on the light
> field; then full cream after cream/70 measured 3.68 and failed). Deleting it
> removes the only element whose contrast depended on the shader's brightest
> pixel. `login.metaLabel` kept in both message files, unrendered.
> **5 · LOGO** — 48 → 56px, `mb-10`; with the meta line gone the block had lost
> 30px and sat too close to the card.
> **AA on the rebuilt form** (worst card composite): label cream/85 **10.32** ·
> input text **11.61** · icon cream/55 **4.70** · border cream/40 **3.44** ·
> focus border gold **6.60** · show-hide **9.73** · forgot **11.54** · heading
> **13.77** · subhead **8.36** · button navy-on-gold **7.61**.
>
> ✅ **AUTH-UNCHANGED DIFF — 14 files, sha256 before vs after: IDENTICAL.**
> `lib/supabase/{auth,server,client,admin}.ts`, `lib/auth-domain.ts`,
> `middleware.ts`, `(portal)/admin/{layout,actions}`, `(portal)/login/actions.ts`,
> `(portal)/layout.tsx`, all four migrations. The form's contract is intact:
> `useFormState(signIn.bind(null, locale))`, `name="email"`/`"password"`,
> `autoComplete="username"`/`"current-password"`, `aria-invalid` +
> `aria-describedby`. Guards re-verified live: **/en/admin → 307 → /en/login**.
> tsc clean, domain tests 22/22.
>
> 🟡 **ITEM 7 (agent approval) — PROPOSED, NOT BUILT.** See the session report.
> The short version for anyone reading this later: **admin-created accounts ARE
> already an approval gate**, so the question is whether the client wants a NEW
> self-service request→approve flow. Nothing was changed pending that decision.
>
> 🔴 **(2026-08-03, z) — DASHBOARD REDESIGN: TOP NAV, GREETING, LEADS AS
> A FULL-WIDTH TABLE, SILK BACKDROP. VISUAL ONLY — ✅ ALL 15 DATA-PATH FILES ARE
> BYTE-IDENTICAL (sha256 compared before/after the pass).**
>
> **1 · LEADS IS A FULL-WIDTH TABLE.** `LeadsExplorer` (260px selector + detail
> pane) is RETIRED, not deleted. 🔴 The instruction named only "the left
> selector column", but removing it alone would leave the detail pane with
> nothing driving it — the client chose the full-width table. Eight columns, the
> same `DataTable` Agents and Content use, so the dashboard reads as one surface.
> Every cell is read straight off the row `getLeads()` ALREADY returned;
> `sms_consent` + `email_optin` are collapsed into one displayed "Consent" cell
> using the existing translated `leads.consent.*` strings. No column renamed, no
> value recomputed, no field dropped from the query.
>
> **2 · DEMO AGENTS CLEARED — PREVIEW FIXTURES ONLY.** The four invented rows in
> `admin-preview/page.tsx` are now `[]`. ✅ **NOTHING WAS DELETED FROM THE
> DATABASE**, and could not have been: that route has no Supabase client, and
> `agents` RLS deliberately has NO delete policy (0002: "Deactivate instead").
> The empty array is deliberate — it exercises the Agents EMPTY STATE, which had
> never been rendered. If real seeded rows exist in Supabase they are untouched.
>
> **3 · TIME-AWARE GREETING.** "Good morning/afternoon/evening, {name}".
> 🔴 COMPUTED ON THE CLIENT ON PURPOSE — a server render would use the Vercel
> box's clock and could tell an Orlando admin "Good evening" at 2pm. Held behind
> a mounted flag (so no hydration mismatch), which costs a one-line
> flash-of-nothing — chosen over being wrong. 🔴 The name is DERIVED from the
> verified identity's local-part (`aiman@…` → "Aiman"), not hard-coded: hard-
> coding breaks the moment a second admin exists, and adding `profiles.full_name`
> to the read would have been a DATA change this pass was forbidden from making.
>
> **4 · NAV MOVED TO A TOP BAR** — `AdminTopShell`. `AdminShell` (the collapsible
> rail with its focus-trapped drawer) is retired, not deleted; restoring it is
> swapping one import. Nav items are still in-page anchors. The active section is
> tracked by IntersectionObserver so the bar is right when you scroll by hand,
> and marks with `aria-current="true"` (not `"page"` — these are fragments in one
> document). Active state is a RULE under the label, not colour alone (1.4.1).
>
> **5 · THE SILK BACKDROP** — `AdminSilk`, the client's 21st.dev "Silk" recipe.
> Shader math is theirs; four things are not: **our palette** (ink-deep → navy →
> gold → gold-pale, not their brighter #FFC300), **reduced-motion** (theirs has
> none; ours draws one still frame and never loops), **no pointer interaction**
> (cursor-reactive liquid behind a data table is the "loud" the brief forbids —
> and SmokeyBackground already taught us the idle state IS hovered), and
> **timeScale −0.18 not −0.537** (drift, not churn).
> 🔴 **THE AA STRATEGY IS STRUCTURAL, NOT NUMERIC.** Contrast over a moving
> multi-hued field cannot be solved honestly — the worst pixel changesevery frame.
> So NO DATA IS EVER COMPOSITED OVER THE SHADER: cards stay opaque and every
> number/label/cell keeps its existing ratios (ink 17.40, ink/80 9.17, gold-deep
> 5.65 on white). The shader shows only in the gutters and faintly through the
> bar. Scrims: page 0.88 cream, bar 0.94 cream + blur.
> 🔴 **ONE MEASURED FAIL, CAUGHT BY SAMPLING THE ACTUAL CANVAS.** I estimated the
> role label at ink/60 = "7.6". Read off the real shader, its darkest reachable
> pixel is **rgb(17,16,13)**, putting the bar's worst composite at rgb(234,230,225)
> — ink/60 there is **4.24, a FAIL** for a 10px label. Now ink/70 = **5.79**.
> *Sample the shader; do not assume its range.*
> Measured on the live page against that worst pixel: greeting ink/70 **5.42** ·
> h1 ink **12.33** · nav inactive **5.10** · nav active **14.04** · gold-deep
> marker **4.56** · sign-out **14.04**. All clear.
>
> ✅ **DIFF PROOF — 15 data-path files, sha256 before vs after: IDENTICAL.**
> `lib/admin/data.ts`, `lib/supabase/{auth,server,admin}.ts`, `lib/auth-domain.ts`,
> `middleware.ts`, `(portal)/admin/{layout,actions}.ts(x)`,
> `(portal)/login/actions.ts`, `(site)/join/actions.ts`, all four migrations,
> `lib/types.ts`. Also verified: `AdminDashboard` contains **zero** DB/network
> calls (its only match is a comment), `admin/page.tsx` still calls
> `getUserAndRole()` + `getLeads()` + `getAgents()` identically, and the sign-out
> form still posts the same `locale` field.
>
> 🟡 **CMS ("Aiman edits any site text/image from the dashboard") — PARKED, NOT
> BUILT, AND THE CLIENT'S OWN REASONING IS THE RECORD:** it is weeks of work, a
> serious security surface, and — the decisive one — **it would bypass every
> compliance safeguard on this project.** Free-text editing puts "guaranteed",
> "tax-free" and "A-rated" back on the site with nothing screening them, undoing
> the twelve struck source lines documented in §13b and Standing Rule 6. If it is
> ever built it needs its own compliance-gated project with a review step between
> authoring and publish. Aiman remains admin over leads/agents/applications.
>
> 🔴 **NEWEST (2026-08-03, y) — ADMIN DESIGN PREVIEW, DEVELOPMENT ONLY.**
> `(portal)/admin-preview` renders the full admin dashboard with MOCK data and
> no auth, so the design can be reviewed without credentials. Added because the
> client wanted to SEE the panel and had lost the admin password — and resetting
> a password is theirs to do, not mine.
>
> 🔴 **TWO INDEPENDENT LOCKS, AND BOTH ARE LOAD-BEARING:**
> (1) `if (process.env.NODE_ENV !== "development") notFound()` is the first
> statement — fails closed, including on an unset NODE_ENV.
> (2) **IT TOUCHES NO DATABASE.** Every row is a hard-coded fixture in the file;
> there is no Supabase client, no `getLeads`/`getAgents`, no cookie read. Even if
> lock 1 were defeated there is no code path that can return a real record.
> ✅ **VERIFIED WITH A REAL PRODUCTION BUILD, not asserted.** `NEXT_DIST_DIR=
> .next-build next build && next start -p 3100`:
> **`/en/admin-preview` → 404 · `/en/admin` → 307 (guard intact) · `/en/login` →
> 200 · `/en/join` → 200.** The service-role leak gate also passed on that build
> (40 client files scanned, nothing found).
> 🔴 **IT IS A SIBLING OF `admin/`, NOT NESTED UNDER IT** — deliberately. Nesting
> would put it under the admin layout's guard (defeating the purpose) and would
> mean any future guard there silently starts or stops applying to it.
> 🟡 **MUTATIONS ARE REFUSED HERE, BY DESIGN.** AgentsManager's controls RENDER
> (it is a design preview) but its server actions call `requireAdmin()` and deny
> an unauthenticated caller. A preview must not be a write path.
> 🟡 Fixtures use `@example.com` (RFC 2606) and 555-01xx numbers (reserved for
> fiction), so nothing can collide with a real person or dial a real line if
> screenshotted. Dates are fixed strings so screenshots stay comparable.
>
> **THE DASHBOARD VIEW WAS EXTRACTED to `components/admin/AdminDashboard.tsx`**
> so the real page and the preview render the SAME markup and cannot drift — a
> preview showing a stale design is worse than none. 🔴 That component performs
> NO authorisation and must never be given any; the boundary stays
> `(portal)/admin/layout.tsx` + middleware, both untouched. `(portal)/admin/
> page.tsx` is now thin: guard (in the layout) → fetch → render.
> **TO DELETE THE PREVIEW LATER:** remove `app/[locale]/(portal)/admin-preview/`.
> Nothing imports or links to it.
>
> 🔴 **(2026-08-03, x) — LOGIN FIELD IS NAVY AGAIN + SMOKE IS TRULY
> MOUSE-INDEPENDENT · /join FORM SUBMITS TO SUPABASE · COMPANY-DOMAIN LOGIN
> ENFORCED. ⚠️ ENTRY (v)'s LIGHT-FIELD AA TABLE IS VOID.**
>
> **1 · THE SMOKE'S MOUSE COUPLING IS GONE — ENTRY (w) DID NOT FIX IT.** (w)
> added a time-driven orbit but KEPT a `hoverRef.current ? mouse : orbit`
> ternary. 🔴 THE CANVAS IS THE ENTIRE PAGE BACKGROUND, so simply RESTING the
> cursor anywhere over the login screen latched `live` to true and pinned the
> ripple centre to a stationary mouse — the orbit only ran when the pointer left
> the window. Net symptom: moved when you moved the mouse, stalled when you
> didn't. **The lesson: "hover hands control to the pointer" is fine for a small
> widget and wrong for a full-viewport background, because the idle state IS
> hovered.** Now: the ripple centre is `cos(t*0.2)`/`sin(t*0.16)` and nothing
> else, the three mouse listeners are DELETED (not bypassed), the `mouseRef`/
> `hoverRef` pair is gone, and the canvas is `pointer-events: none`.
> ✅ **PROVEN EMPIRICALLY, not by construction:** the same shader rendered at
> t=0 vs t=3 with identical time-derived input changes **79.5% of pixels**
> (t=0→t=7: 69%). Motion comes from time alone.
>
> **2 · THE FIELD IS NAVY (#0D1B2A), NOT WHITE.** One token — the shader's
> `u_base` — because it interpolates `mix(u_base, u_color, glow)`. Verified: the
> ramp runs exactly navy `(13,27,42)` → gold `(201,168,76)`.
> 🔴 **IT CREATED A DEAD BAND AND NEEDED A MEASURED VEIL.** On the bare navy→gold
> field, ink is 1.00 on the navy end and cream is **2.09 on the gold end** —
> NEITHER ink clears both ends, the same failure the retired About gradient
> documents. No colour solves it; the SURFACE had to come into range. A
> `rgba(13,27,42,0.5)` wash over the canvas caps the peak at rgb(107,98,59).
> Veil 0.40 lands on L 0.1627 against a 0.1629 ceiling — a 0.0002 margin, not
> shippable; **0.50 is the shipped value.**
> 🔴 **cream/70 ON THE SMOKE MEASURED 3.68 — A FAIL — AND IS NOW SOLID CREAM
> (5.61).** There is no headroom to soften ink that sits directly on the smoke.
> **AA, worst (brightest) field pixel; card composite rgb(30,40,45):**
> meta + back link cream **5.61** · card heading cream **13.77** · body cream/75
> **8.36** · field text **12.24** · controls gold-pale **11.54** · underline
> cream/50 **4.56** · focus border gold **6.60** · button navy-on-gold **7.61**.
> All clear; every in-card value GAINED over the light field.
>
> **3 · /join APPLY FORM SUBMITS FOR REAL** — `0003_applications.sql`,
> `(site)/join/actions.ts`, `lib/supabase/admin.ts`, `JoinApplyForm` (now a
> client component). 🔴 **THE ONE `ok` RETURN SITS AFTER THE INSERT'S ERROR
> CHECK** — no row, no success. Failure paths (validation / throttle / no secret
> key / rejected insert) all render an error naming the phone. Success REPLACES
> the form so it cannot be double-submitted.
> 🔴 **RLS — `applications` IS ADMIN-READ-ONLY AND NOBODY CAN WRITE IT VIA THE
> API.** anon: nothing. authenticated agent: **zero rows** (no ownership column;
> applications are about people who are not users). admin: SELECT every row.
> **No INSERT/UPDATE/DELETE policy exists for any API role**, so the publishable
> key cannot write it from a browser at all — the only writer is the server
> action's service-role client. Abuse controls, in order of what actually holds:
> (1) no client write path; (2) server-side validation of every field + fixed
> row shape (never spread from FormData); (3) CHECK length caps + enum types;
> (4) generic errors, DB messages never echoed. ⚠️ **THE RATE LIMIT (5/IP/10min)
> IS IN-MEMORY** — per instance, resets on deploy, does not coordinate across
> serverless regions. It is a speed bump, stated as one. If real abuse appears
> the fix is Turnstile/hCaptcha or a KV limiter; both need a client decision.
> 🔴 **CONSENT WORDING IS NOW URGENT.** The checkbox VALUE is stored against a
> real person's phone number; the LABEL is still the placeholder.
>
> **4 · LOGIN RESTRICTED TO @fflsynergy.com — FOUR LAYERS, ALL SERVER-SIDE.**
> `lib/auth-domain.ts`, `0004_company_domain.sql`, `login/actions.ts`.
> (a) **No public signup** — no `signUp`/OTP/OAuth call exists anywhere
> (asserted by a test that greps call syntax). Accounts are admin-created.
> (b) **Creation-time DB trigger** `before insert on auth.users` — catches the
> dashboard, Admin API, invites and any future provider, i.e. every path that
> never touches our code, and protects against the admin's own typo.
> (c) **Sign-in gate** — reads `data.user.email` (the VERIFIED address, never the
> typed one), requires `email_confirmed_at`, and **calls `signOut()` before
> returning** so a denied user is not left holding the session
> `signInWithPassword` already minted. Returns the same generic "invalid" as
> every other failure, so it cannot enumerate accounts or reveal the domain.
> (d) **Role is not self-assignable** — unchanged from 0001: no UPDATE policy on
> `profiles`, `handle_new_user` hard-codes `'agent'`, role read from the table
> not a JWT claim. New company accounts are agents; the one admin was elevated by
> hand.
> 🔴 **EXACT DOMAIN MATCH, NOT A SUFFIX TEST** — in both the TS and the SQL.
> `endsWith('.fflsynergy.com')` accepts `fflsynergy.com.evil.com`;
> `includes(...)` accepts `notfflsynergy.com`; a naive split accepts
> `a@fflsynergy.com@evil.com`. All three are covered by tests.
> ✅ **PROOF TESTS: `node scripts/test-auth-domain.mjs` — 22/22 pass**, and the
> no-signup assertion was NEGATIVE-CONTROLLED (a planted `signUp` call made it
> fail, as it must). Two bugs in the TEST itself were found and fixed: a drift
> guard that flagged a domain written in a COMMENT, and a `|| true` that on
> Windows made a real `signUp` hit report as PASSING.
> ⚠️ **OPERATOR STEPS in 0004 §4** — audit pre-existing non-company accounts
> (the trigger is forward-only), confirm roles, elevate the admin.
>
> 🔴 **(2026-08-03, w) — LOGIN SMOKE SELF-ANIMATES · JOIN "COME AND TALK"
> BLOCK REMOVED · ADMIN-ONLY /admin LINK IN THE HEADER. Two auth changes
> (form-submit, domain-restricted login) were PROPOSED and are NOT built.**
>
> **1 · THE LOGIN SMOKE ANIMATES ON ITS OWN NOW.** `SmokeyBackground.tsx`. It
> already advanced `iTime` every frame, but idle it pinned the ripple centre
> dead-centre, so the only PROMINENT motion came from the cursor dragging that
> centre. Now when the pointer is off the canvas the centre traces a slow
> Lissajous orbit (`cos(t*0.2)` / `sin(t*0.16)`, different freqs so it never
> loops obviously) and the field folds continuously with no mouse. Hover hands
> control back to the real pointer. 🔴 Reduced motion is unaffected: the loop
> still never runs, so `draw(0)` is the one frame shown — the orbit evaluates
> once at t=0 to a fixed point, a still image. ⚠️ NOT OBSERVED MOVING — rAF does
> not fire in the preview pane, so the motion is verified by construction; the
> still frame renders (gold→cream ramp intact, context alive). A human should
> confirm the churn in a real browser.
>
> **2 · JOIN §6 "Come and talk to us." REMOVED.** `(site)/join/page.tsx`. The
> full-bleed navy closing band is gone on instruction. Beyond the instruction it
> was self-contradicting: its body read "There is no application form on this
> page" — written before §5 (the apply form) existed, so it told the reader the
> form they had just scrolled past was not there. 🔴 The instruction called it
> "above the apply section"; it was actually the LAST section, below §5 — there
> is only one such block, so removal is unambiguous. Strings
> `join.cta.heading/body/button` kept in both message files, unrendered. Verified
> live: apply (`#join-apply-heading`) is now the last section, seam to the footer
> is a clean single `sem-pad-y` gap (0px extra), only the hero remains navy, no
> overflow.
>
> **3 · ADMIN-ONLY /admin LINK, SERVER-GATED.** `(site)/layout.tsx` +
> `SiteHeader.tsx` + `nav.admin` ("Admin", both locales, a Rule-4 wayfinding
> label). The layout is now `async` and reads `getUserAndRole()`; `isAdmin =
> role === "admin"` is passed to SiteHeader, which renders an /admin link
> (desktop + mobile panel) ONLY when true. 🔴 SERVER-SIDE by design — a
> non-admin's HTML never contains the link at all (verified: absent for an
> anonymous visitor; the agent-login link still shows). It is NOT in routes.ts,
> so it cannot leak into the footer sitemap. 🔴 CONVENIENCE, NOT THE BOUNDARY —
> the middleware and (portal)/admin/layout guards are untouched and still deny
> any non-admin who reaches /admin by other means.
> ⚠️ **COST, FLAGGED:** reading the session cookie in `(site)/layout` opts the
> public pages into DYNAMIC rendering (they were static per locale). The
> middleware already authenticates every request, so the marginal cost is one
> role query for signed-in users and a null short-circuit for anonymous ones.
> If static marketing pages must be preserved, the fallback is a client-side
> check in SiteHeader (weaker: link exists in JS, forceable via devtools, still
> grants no access). Left as the client's call.
>
> **4 · TWO AUTH CHANGES PROPOSED, NOT BUILT** — the /join form actually
> submitting, and login restricted to @fflsynergy.com with admin-only for the
> existing admin. Both are written up in the session report for approval; NO auth
> logic was touched. The existing guards, RLS and the least-privilege
> profile-on-signup trigger (`0001_auth_profiles.sql`) all stand unchanged.
>
> 🔴 **NEWEST (2026-08-03, v) — THE LOGIN BACKGROUND IS THE CLIENT'S ACTUAL
> WebGL SHADER NOW, RECOLOURED GOLD-ON-WHITE. ⚠️ THE (u) BLOB AURORA AND ITS AA
> TABLE ARE VOID — the surface flipped from dark to light and every ink on it
> was re-derived.**
>
> **WHY IT CHANGED:** entry (u) built a CSS blob aurora from a WRITTEN
> DESCRIPTION, because the reference images never arrived. The client then
> supplied the actual source — a GLSL fragment shader — and asked for "the
> background exactly like it but gold and white instead of blue and black".
>
> **1 · THE SHADER MATH IS THEIRS, VERBATIM. EXACTLY ONE LINE DIFFERS.**
> `components/SmokeyBackground.tsx`. The distortion loop, wave, glow curve and
> time scale are character-for-character the reference's — that is what makes the
> smoke fold the way it does.
>
>     reference   fragColor = vec4(u_color * glow, 1.0);      blue on black
>     ours        fragColor = vec4(mix(u_base, u_color, glow), 1.0);
>
> Theirs MULTIPLIES, so glow 0 is black. Ours INTERPOLATES between two real
> colours: gold `#C9A84C` smoke on cream `#F8F4EE`. 🔴 Multiplying cannot produce
> this — `white * glow` is grey, not white-to-gold. Verified on the live canvas:
> pixels ramp `(248,244,238)` → `(216,193,129)` → `(201,168,76)`.
>
> **2 · FOUR DEFECTS IN THE REFERENCE'S HOST CODE, NOT COPIED.** The GLSL is
> sound; the React around it is not.
> 🔴 **THE SERIOUS ONE: IT RECOMPILES THE PROGRAM ON EVERY MOUSE PIXEL AND LEAKS
> A rAF LOOP EACH TIME.** Its effect deps are `[isHovering, mousePosition, color]`
> with `mousePosition` written from `mousemove`, and its cleanup never calls
> `cancelAnimationFrame`. Move the mouse for five seconds → hundreds of
> concurrent render loops, forever. FIXED: pointer state in REFS, effect runs
> once, loop cancelled in cleanup.
> Also fixed: it reassigns `canvas.width` every frame (reallocates the drawing
> buffer even when unchanged); it has NO reduced-motion path; it never pauses on
> a hidden tab or releases GPU objects.
>
> **3 · TWO BUGS I INTRODUCED AND CAUGHT BY MEASURING — BOTH RENDERED WHITE.**
> 🔴 `WEBGL_lose_context.loseContext()` IN CLEANUP POISONS THE CANVAS PERMANENTLY.
> `getContext` returns the same object for a canvas forever, and React StrictMode
> mounts effects TWICE — the first cleanup killed the context, the second mount
> drew into a dead one. Measured `gl.isContextLost() === true` on the live page.
> Deleting the program/shaders/buffer is sufficient; the context dies with the
> element.
> 🔴 `preserveDrawingBuffer: true` IS REQUIRED, NOT AN OPTIMISATION TOGGLE. WebGL
> CLEARS the drawing buffer after every composite by default. The loop hides
> that; the moment the loop is NOT running the single still frame is wiped and
> the canvas goes blank — i.e. exactly the reduced-motion path and the hidden-tab
> path. ✅ **This is now empirically proven: rAF does NOT fire in the preview pane,
> and the smoke still renders — what is on screen IS the persisted still frame.**
>
> **4 · FIELDS REBUILT TO THE REFERENCE'S UNDERLINE + FLOATING LABEL.** Boxed
> inputs → bottom-rule fields with a label that scales down and rises, plus
> lucide `User`/`Lock` icons inside the label and `ArrowRight` on the button.
> `lucide-react@1.28.0` INSTALLED (it was not a dependency).
> ✅ Their label logic is correct and is preserved: base state RAISED,
> `peer-placeholder-shown` pushes it DOWN. Written the obvious way round the
> label drops back over typed text on blur. **Verified all four states with
> transitions suppressed: empty+blur down (1.0/0), filled+blur UP (0.75/−24),
> filled+focus up, back-to-empty down.**
> 🔴 Their `-z-10` on the label is DROPPED — on our translucent card it hides the
> label behind the CARD, not behind the input. `pointer-events-none` does the job
> with no stacking risk. Their bare `duration-300` (no transition-property, so it
> animates `all`) is narrowed to `transition-[transform,color]`.
>
> **5 · AA RE-DERIVED — THE WORST CASE INVERTED WITH THE SURFACE.**
> On a dark field a translucent dark card could only get darker, so contrast could
> only improve. On a LIGHT field it gets lighter, so **the worst backdrop is now
> the smoke's PALEST pixel** (cream, glow 0). Card composite `rgb(55,66,77)`:
>
> | element | ratio | bar |
> |---|---|---|
> | card heading / body — cream | 9.34 | 4.5 |
> | show-hide, forgot — gold-pale | 7.83 | 4.5 |
> | Sign-in button — navy on gold | 7.61 | 4.5 |
> | field focus border — gold | 4.48 | 3.0 |
> | **field underline — cream/50** | **3.66** | 3.0 |
> | meta + back link — ink/80 over gold end | 5.22 | 4.5 |
> | meta + back link — ink/80 over cream end | 8.66 | 4.5 |
>
> 🔴 **THE UNDERLINE FAILED AT cream/30 (2.27) AND WAS RAISED TO cream/50.** With
> no fill and no box, the bottom rule is the only thing marking the field's
> extent — a component boundary owing 3:1. cream/42 was still short at 2.97.
> 🔴 **gold-deep IS ILLEGAL ON THE SMOKE — 2.47 AGAINST ITS GOLD END.** The usual
> "gold text on light" token cannot be used for anything sitting directly on this
> background, because the surface swings cream→gold across the viewport and must
> clear at BOTH ends. ink/80 is the only safe ink there.
>
> 🟡 **THE CARD IS STILL DARK ON A NOW-LIGHT FIELD, AND THAT IS A JUDGEMENT CALL.**
> The client asked for a dark glassy card (entry u) and separately for a gold/white
> background (this entry); both are honoured literally. A light card would sit
> cream-on-cream against the smoke's pale end and need a hard border to exist —
> the same face-vs-surface problem the Engine's light surface documents. Flip by
> inverting `.auth-card` and the inks in LoginForm.
> ⚠️ The `.auth-aurora` / `.auth-blob` CSS is RETIRED but kept — it is the only
> solved no-WebGL answer to this effect and is the natural fallback if the shader
> is ever judged too heavy.
> ✅ AUTH UNCHANGED AGAIN — verified: `username`/`current-password` intact, real
> `<label for>` on both fields, required, disabled Forgot, no Google / no
> "continue with" / no sign-up, form action bound. 0 overflow and no horizontal
> scroll at 390; console clean.
>
> 🔴 **NEWEST (2026-08-02, u) — FIVE UNRELATED CHANGES: WHO-WE-SERVE HEADING
> REMOVED · BLOG MOVED LEFT IN THE NAV · CALCULATOR OVERFLOW FIXED + POLISHED ·
> LOGIN REDESIGNED TO A DARK GLASS CARD. All verified live; auth unchanged.**
>
> **1 · WHO-WE-SERVE — THE BIG H2 IS GONE.** `components/WhoWeServe.tsx` no
> longer renders the "Built for the people…" headline; the block is the eyebrow
> + the Families/Agents tabs only, gap tightened mt-7 → mt-5. 🔴 The section's
> `aria-labelledby="who-we-serve-heading"` id MOVED to the eyebrow `<p>` (it
> pointed at the removed h2 — a dangling reference otherwise). The `heading`
> string stays in both message files, unrendered. Verified: 0 h2 in the section,
> eyebrow carries the accessible name.
>
> **2 · BLOG MOVED TO THE LEFT NAV, NEXT TO SERVICES.** `SiteHeader.tsx`
> `SPLIT_AT` is now `Math.ceil((length + 1) / 2)` — heavier-half-left, ties left.
> On six text keys that is **4 / 2**: LEFT Home · About · Services · Blog; RIGHT
> Contact · Calculator (+ Join pill). 🔴 Desktop-only: below 900 both `<ul>`s are
> hidden and the mobile panel is ONE stacked list in `HEADER_ROUTES_TEXT` order,
> so Blog is simply fourth in the stack. Verified left/right at 1536, mobile
> order + 0 overflow at 390. routes.ts comments updated (order is now
> load-bearing — Blog must stay after Services).
>
> **3 · CALCULATOR — OVERFLOW FIXED, THEN POLISHED.** `components/Calculator.tsx`.
> 🔴 THE FIX: the unit ("by age 65") was INLINE with the figure at up to 56px
> and `whitespace-nowrap`, and the figure itself can be **eleven glyphs**
> ("$34,997,914" at max sliders), so the line ran past the navy box. The unit
> moved to ITS OWN LINE under the number and the figure ceiling dropped 112 →
> 76px. Verified: the **widest possible value $34,997,914 sits inside the box at
> 1536 / 768 / 390**, 0 overflow. Result now reads: eyebrow "Indexed policy
> value" / figure / "by age 65" — a divergence from BeeToGreen's inline unit,
> made because their number never gets wide and a currency total does.
> POLISH: `.calc-slider` upgraded from bare `accent-color` to a custom
> gold-deep track + white thumb (still a native range — no mechanic changed);
> value promoted to a baseline readout beside its label; cards gained a hairline
> + soft shadow. 🔴 ALL LOCKED MECHANICS CONFIRMED UNCHANGED live: defaults
> 300/35/65, ranges 50-2000/18-60/55-75, FV formula, $495,212 at defaults, the
> three-card Equivalent-to row, disclaimer, short-runway note, CTA → /contact.
> AA: result gold-on-navy 7.61; slider fill gold-deep-on-white 5.65 (brand gold
> would be 2.09 and fail — this is the corrected token).
>
> **4 · LOGIN REDESIGNED — CENTRED DARK GLASS CARD ON A NAVY/GOLD AURORA.**
> `(portal)/login/page.tsx` + `components/admin/LoginForm.tsx` +
> `.auth-*` in globals.css. Was a split-screen (navy panel / white form). Now:
> the logo lockup ABOVE a centred glass card (Checkmate's composition), on an
> animated blob field. 🔴 ADAPTED TO OUR PALETTE — the reference's BLUE blobs are
> gold + navy-lift + amber, never blue. 🔴 NO GOOGLE / "OR CONTINUE WITH" /
> SIGN-UP — we have no social auth and no public registration; verified absent.
> Fields gained decorative (`aria-hidden`) mail/lock icons; floating labels,
> show/hide, disabled "Forgot", generic error codes and the denied notice all
> preserved.
> 🔴 AUTH IS UNTOUCHED — reskin only. Verified: form still posts (the `signIn`
> action binding is unchanged), `autocomplete="username"` + `current-password`
> intact (password managers still work), the /admin guard and role redirect in
> actions.ts are not touched. AA on the glass card measured against the BRIGHTEST
> blob behind it (card is navy@0.82 + blur, opaque enough that the blob cannot
> lift it): cream 13.87, field text 12.34, gold-pale controls 11.63, gold focus
> border 6.65. Blobs FREEZE under `prefers-reduced-motion` (rule verified). No
> real horizontal scroll at 1280 or 390 (the oversized blobs are clipped by
> `overflow:hidden`, not scrollable).
> 🟡 **COPY: I KEPT OUR APPROVED "Sign in" / existing subhead, NOT the target's
> "Welcome Back" / "Sign in to continue".** Authoring new marketing-adjacent
> strings needs client approval (Standing Rule 5); the existing `login.heading` /
> `login.subhead` already say the same thing and are approved. If "Welcome Back"
> is wanted, it is a two-string approval, not a build.
> 🟡 **IMAGES 3 AND 4 WERE NOT RECEIVED** (same as the prior two turns) — built
> from the written description, and Checkmate's login composition (logo-above-
> card) measured live.
>
> 🔴 **NEWEST (2026-08-02, t) — THE ENGINE IS LIGHT NOW, AND CHECKMATE'S LINE
> MECHANIC WAS RE-MEASURED AND FOUND TO BE SOMETHING ELSE ENTIRELY. ⚠️ THE (s)
> AND (r) SURFACES AND BOTH THEIR AA TABLES ARE VOID. THE CREAM/LIGHT TABLE IS
> UN-VOIDED AND REBUILT BELOW.**
>
> **1 · THE SURFACE IS NEAR-WHITE — `.engine-surface-light`.** Client supplied a
> light reference (near-white, faint centre glow, fine SQUARE grid). Retoned:
> base **cream #F8F4EE**, glow **gold @0.08** (`circle 620px at 50% 50%`), grid
> **ink @0.045 at 24x24** (square, not the dark builds' 22x24), grain **alpha 4**.
> The two dark surfaces stay in globals.css as derivations; only C renders.
>
> 🔴 **ON A LIGHT SURFACE THE WORST PIXEL IS THE DARKEST ONE, NOT THE LIGHTEST.**
> Every dark-build figure assumed a WHITE grain pixel as worst case. Inverted,
> the worst case is a BLACK one, and that single flip is what forced grain
> alpha 6 → 4: at 6 the gold-deep eyebrow measures **4.45, a fail**.
> 🔴 **THE GRID IS 0.045 AND NOT 0.05 BECAUSE OF 768.** The glow is a FIXED
> 620px circle, so a narrower section puts the head inside it — measured live,
> the eyebrow is **382px from the glow centre at 768** against a 434px reach
> (glow α 0.0096 there), and 0px inside it at 1536 and 390. At grid 0.05 that
> gives 4.47 at 768 — a fail that does not exist at desktop. At 0.045: **4.57 /
> 4.54 / 4.57**. Same trap the (s) entry recorded for the lead. **Check 768.**
>
> **AA — 12 elements x 3 widths, ZERO failures.** Worst-pixel surface L **0.7548**
> (glow peak + grid line + black grain); away from the glow **0.7985**.
>
> | element | 1536 | 768 | 390 | bar |
> |---|---|---|---|---|
> | eyebrow gold-deep | 4.57 | **4.54** | 4.57 | 4.5 |
> | h2 ink | 14.06 | 13.98 | 14.06 | 4.5 |
> | lead ink/80 | 8.00 | 7.93 | 8.00 | 4.5 |
> | chip label ink on white/80 | 16.54 | same | same | 4.5 |
> | chip border gold-deep/80 | 3.07 | same | same | 3.0 |
> | hub rings gold-deep/90 | 3.64 | n/a | n/a | 3.0 |
> | out-lines / dots / endpoint ring gold-deep | 4.33 | n/a | n/a | 3.0 |
> | endpoint numeral ink on white/60 | 15.70 | n/a | n/a | 4.5 |
> | card border gold-deep/80 | 3.07 | same | same | 3.0 |
> | card h3 / body / kicker | 17.40 / 9.17 / 5.65 | same | same | 4.5 |
> | **in-lines gold-deep/49** | **1.90** | n/a | n/a | — see below |
>
> 🔴 **gold-deep IS LEGAL HERE ONLY AWAY FROM THE GLOW — 4.29 on its peak.** Same
> shape of finding gold produced on the dark surface, opposite end of the ramp.
> The eyebrow is the only gold-deep text sitting directly on this surface.
> 🔴 **THE CARD AND CHIP FACES DO NOT CARRY THEIR OWN EDGES.** White on this
> surface is **1.32:1**, white/80 is **1.25:1**, and no value fixes that without
> darkening a surface the brief calls near-white. The gold-deep/80 border at 3.07
> is the entire boundary. On dark the face did the work (9.57) and the border was
> a detail; here it is exactly reversed. **Do not lighten those borders.**
>
> **2 · WE HAD THE WRONG LINE MECHANIC. Rule 8 re-measurement overturned it.**
> Read off their live DOM/CSSOM, not off notes:
>
> | | ours (before) | Checkmate (measured) |
> |---|---|---|
> | moving element | a 5% DASH sliding the path | a **DOT** on CSS `offset-path`, r3.5 |
> | how many | **all 24** lines | **6 of 21** in-lines + all 3 out |
> | in-lines | full gold-deep, 1px | cream **@0.22**, 1px, **static, no animation** |
> | out-lines | no march | **dasharray 7 11**, `ep-march` 1.6s, stagger 0.9s |
> | hub | bloom + 2 small rings | **2 rings only** (r68 solid, r92 dashed 3/9, 60s) |
>
> 🔴 **THE OLD 5.2s AND 1100ms WERE RIGHT NUMBERS ON THE WRONG THING** — they are
> the dot's traverse and out-stagger. The note that the dash length was "measured
> off a screenshot" of a login-walled reference is **retired with the dash**.
> 🔴 **WEIGHT IS MATCHED AS A CONTRAST RATIO, NOT AN ALPHA** — copying `0.22`
> across a polarity flip means nothing. Their in-line measures **1.90:1** on
> their black; ours is **gold-deep @0.49 = 1.90:1** on our white. Their ring
> 3.50 → ours 3.64. Their out-line 11.93 → ours 4.33 (solid gold-deep; 11.93 is
> unreachable in gold on light, and ink would stop being gold — the RELATIONSHIP,
> out-lines emphatic over in-lines nearly gone, survives at 2.3x separation).
> 🔴 **THE IN-LINES AT 1.90 ARE BELOW THE 3:1 NON-TEXT BAR, ON INSTRUCTION.**
> Defensible because 1.4.11 covers graphics *required to understand content* and
> these carry none — every carrier name is a real `<span>`, every outcome a real
> `<h3>`/`<p>`, all readable with the SVG deleted. Everything not purely
> decorative is held to 3:1 and passes. **If information ever moves onto these
> lines they go back to 3:1.**
>
> **3 · THE STAGE IS A 3:2 GRID COLUMN AGAIN, AND THAT IS WHAT FIXED THE CURVE.**
> The curve FORMULA was never wrong — `M sx sy C mx sy, mx ey, ex ey`, mx the
> midpoint, identical to theirs. The BOX was: theirs is `.engine-stage`
> `aspect-ratio: 3/2` at 666x444 in the left column of a `1.55fr 1fr` grid; ours
> stretched the same maths across the full 1144. **Verified live: our first path
> now emits `M 162 78 C 345 78, 345 300, 528 300` — character-for-character
> theirs.** Stage measures 666x444, viewBox 900x600, 21 in / 3 out / 2 rings /
> 3 endpoints / 9 dots / 21 chips.
> 🔴 **THE HUB MOVED BACK TO 68.889%, NOT 50%** (their `.engine-core` left, and
> their rings' `cx="620"`). This reverses the pass whose own note says "not 68.9%
> of a narrower stage".
> ✅ **FOUR WORKAROUNDS DELETED BY THE UNIFORM SCALE:** `preserveAspectRatio="none"`,
> the `vector-effect` stroke correction, HTML circles for rings (so they could not
> be squashed to ellipses), and the **JS ResizeObserver** — including the
> documented trap where a fresh RO never fired and rendered the diagram EMPTY.
> Percentages and viewBox units are now the same coordinate; nothing is measured
> in JS. Chips scale with the column, as Checkmate's do (`width: 12.9%`).
>
> **4 · THE HUB IS CLEANED UP. THE BLOOM IS DELETED, NOT RESTYLED.** The 132px
> gold radial-gradient halo was the "glow artifact" — Checkmate has no equivalent,
> and on near-white it read as a printing defect. 🔴 **MEASUREMENT SAYS THEY HAVE
> TWO RINGS, NOT ONE** (r68 solid + r92 dashed spinning); both are kept, and the
> lines stop exactly on r92 by construction. If one ring is wanted, drop the
> dashed one — but the two-ring count is what they actually ship.
> 🟡 **THE LOCKUP-IN-A-CIRCLE PROBLEM IS UNCHANGED AND STILL OPEN.** It is 3.29:1
> horizontal; a circle has no width that flatters it. It is now sized to the inner
> ring minus 6px a side (~92px at 1536) so it cannot overrun the ring at any
> width, but it is SMALLER than the flat 150px it was and the subline suffers.
> Checkmate's hub holds a TALL mark (204x320 at 64px wide) — that is why theirs
> fits. Real fixes remain a square/stacked Synergy mark, or the crest.
>
> **5 · CARD BADGES ARE 01/02/03, WAS I/II/III** — the new endpoint discs put a
> "02" at the end of the line pointing at a card stamped "II". Same ordinal, two
> indexes. The passport stamp keeps its rotation, border and face; only the
> glyphs changed. Revert = the `NUMERAL` constant.
>
> **VERIFIED LIVE:** section 1521x1054, padding 106.47/53.235, stage 666x444,
> cards 430 wide, base `rgb(248,244,238)`, grid `24px 24px`, eyebrow
> `rgb(125,100,31)`, h2 `rgb(26,26,26)`, **h1 count 1**, **0 overflowing elements
> at 1521 / 753 / 390**, reduced-motion block covers `.engine-out`,
> `.engine-ring--dash` and `.engine-pulse`.
> ⚠️ **NOT VISUALLY CONFIRMED — the preview pane does not composite, so
> screenshots time out and rAF does not run.** Same limitation entry (s) records.
> Geometry, colour, counts and contrast are verified by measurement on the real
> DOM; **a human should look at it once in a real browser.**
> 🟡 **IMAGES 1 AND 2 (ours vs Checkmate) WERE NOT RECEIVED** — only the light-grid
> reference came through. The line work was matched against checkmatefinancialgroup.com
> measured live instead, which is what Rule 8 asks for anyway.
>
> 🔴 **(2026-08-02, s) — ENGINE SURFACE REPLACED AGAIN: DARK + GOLD
> RADIAL + LINE GRID + CANVAS GRAIN. THE (r) BROWN→GOLD RAMP AND ITS AA TABLE
> ARE VOID.** Checkmate's LAYOUT and sizing from (r) are untouched — only the
> surface and the grain changed.
>
> **THE REFERENCE'S STRUCTURE, OUR PALETTE:**
>
> | reference (21st.dev snippet) | ours |
> |---|---|
> | `bg-neutral-950` #0A0A0A | **#0A0A0A** kept |
> | radial `circle 600px at 50% 180px` | **same geometry** kept |
> | `rgba(168,85,247,0.33)` **PURPLE** | **`rgba(201,168,76,0.33)` GOLD** retoned |
> | grid `#64748b29` (slate @0.161) | **cream #F8F4EE @0.12** retoned |
> | `bg-[size:22px_24px]` | **22px 24px** kept |
> | canvas noise alpha 16 | **alpha 16** kept |
>
> The snippet's other variant is orange `#F97316`. Neither purple nor orange is
> a Synergy colour; the radial keeps their geometry and their alpha, the hue is
> ours.
>
> 🔴 **FOUR LAYERS STACK AND THE WORST PIXEL IS ALL FOUR AT ONCE** — a grid line
> crossing the radial's peak with a white canvas-noise pixel on top. Every
> figure below is against that. Solved BEFORE building:
>
>     glow  grid | surfL   gold   pale   cream
>     0.20  0.10 | 0.0690  3.86 F 6.75   8.05
>     0.33  0.10 | 0.1067  2.93 F 5.13   6.11
>     0.33  0.12 | ~0.115  ~2.8 F ~4.87  ~5.8    SHIPPED
>     0.33  0.14 | 0.1238  2.64 F 4.62   5.51
>     0.38  0.16 | 0.1510  2.29 F 4.00 F 4.77
>
> 🔴 **gold #C9A84C IS NOT A LEGAL TEXT COLOUR ANYWHERE IN THIS STACK** — best
> case across the whole solve is **3.86**, at a glow/grid pair far dimmer than
> the reference. The eyebrow is **gold-pale #EFE1B0**. Gold survives only as
> NON-TEXT (3:1) and only away from the radial peak.
> **GRID AT 0.12, NOT THE REFERENCE'S 0.161** — at 0.14 gold-pale lands on 4.62,
> a 0.12 margin; 0.12 buys ~4.87 for the same visual weight, because cream is a
> lighter ink than their slate and needs less alpha to read equally.
>
> **AA — 10 elements × 3 widths, ZERO failures:**
>
> | element | 1536 | 768 | 390 | bar |
> |---|---|---|---|---|
> | eyebrow gold-pale | 5.41 | 5.41 | 5.41 | 4.5 |
> | h2 cream | 6.29 | 5.98 | 5.93 | 4.5 |
> | lead **cream/90** | 5.78 | 5.08 | 5.33 | 4.5 |
> | chip label cream | 9.47 | 5.63 | 6.37 | 4.5 |
> | chip border cream/55 | 4.65 | **3.23** | 3.53 | 3.0 |
> | lines + dash gold *(on-path)* | **4.74** | n/a | n/a | 3.0 |
> | halo rings gold-pale/70 | 4.99 | n/a | n/a | 3.0 |
> | card face vs surface | 9.57 | 9.78 | 12.50 | 3.0 |
> | · card h3 / body / kicker | 17.40 / 9.17 / 5.65 | same | same | 4.5 |
>
> 🟡 **THE LEAD WENT cream/80 → cream/90, AND THE REASON IS A TRAP WORTH
> KEEPING.** The radial is a FIXED 600px circle, so on a narrower section it
> covers proportionally more of the width and the head sits closer to its peak.
> At 1536 cream/80 measured 5.32; at **768 it measured 4.41 — a fail that does
> not exist at desktop**. Anything added near the top of this section must be
> checked at 768, not just at 1536.
> 🔴 **"LINES GOLD @RADIAL PEAK 2.78" IS A FALSE POSITIVE — DO NOT CHASE IT.**
> Sampling the surface at y=180 (the radial's centre) and asking whether gold
> would pass there gives 2.78, but **no line is there**: the SVG starts at
> y=388 and the radial's reach ends at y=600. Walking every path and taking the
> worst point any line ACTUALLY occupies gives **4.74**. Measure on-path, not at
> an arbitrary y.
>
> **THE GRAIN IS A CANVAS NOW — `components/EngineNoise.tsx`**, on instruction,
> replacing the transform-stepped CSS tile (`.engine-grain` stays in globals.css
> unused; it is the cheaper approach if performance ever decides this again).
> 🔴 **THE TECHNIQUE IS THE REFERENCE'S; THE IMPLEMENTATION IS NOT.** Theirs is
> `fixed inset-0` full-VIEWPORT with no bounds, no pause and no reduced-motion
> path. Cost from its own constants: 1024² px × 1 `Math.random()` per px ×
> ~30 redraws/s = **~31M random calls/second, forever**, plus a fresh 4 MB
> ImageData per redraw (~120 MB/s of garbage). Four changes, same look:
> **512 not 1024** (4× less area; it was resolving finer than the upscale keeps)
> · **time-throttled to ~12fps, not `frame % 2`** (frame-counting doubles to
> 60/s on a 120Hz display; a timestamp gate is refresh-rate independent) ·
> **IntersectionObserver stops it off-screen** · **one ImageData reused** instead
> of allocating per frame. Net **~3.1M calls/s, ~10× cheaper, and zero when not
> on screen**. Reduced motion draws one still frame and never loops.
> ⚠️ **THE ANIMATION COULD NOT BE OBSERVED IN THE PREVIEW HARNESS** — `rAF` does
> not fire when the pane is not compositing (`rafFiresInThisPane: false`), so the
> loop, the throttle and the IO pause are verified by construction, not by
> watching frames. The FIRST frame is confirmed drawn on the real canvas
> (512×512, alpha 16, 17 distinct grey levels, `image-rendering: pixelated`,
> z-index −10). **A human should confirm the shimmer once in a real browser.**
>
> No overflow at any width (1521/1521 · 753/753 · **390/390, 0 overflowing**),
> h1 count 1. Layout, Checkmate sizing and copy all unchanged from (r).
>
> 🔴 **(2026-08-02, r) — THE CARD IS GONE. THE ENGINE IS A FULL-WIDTH
> SECTION MATCHED TO CHECKMATE. ⚠️ ITS BROWN→GOLD SURFACE AND AA TABLE ARE VOID
> — superseded by (s). The Checkmate layout measurements in it still stand.**
>
> `.engine-card` is RETIRED — no card, no inset, no radius. The section paints
> its own surface edge to edge via `.engine-surface`, matching Checkmate's
> `section.engine`. The whole near-black + gold-radial + dot-lattice derivation
> is kept in globals.css because it is the only solved warm-glow-on-dark on this
> site, but nothing renders it.
>
> **CHECKMATE MEASURED LIVE AT 1536 (client 1521), AND WHAT OURS DOES:**
>
> | | Checkmate | ours | |
> |---|---|---|---|
> | section pad | 106.47 / 53.235 | **106.47 / 53.235** | ✅ exact |
> | container | max-w 1200, pad 28 | **1200 / 28** | ✅ exact |
> | grid cols | 666.2 / 429.8 | **666 / 430** | ✅ |
> | grid gap | 48 | **48** | ✅ |
> | head block | 720 wide | **720** | ✅ |
> | eyebrow | 11.52px / ls 1.84 | **11.5 / 1.84** | ✅ |
> | h2 | 56 / lh 58.24 / ls −0.728 | **55.5 / 57.7 / −0.72** | ✅ (clamp at 3.65vw) |
> | lead | 22 / lh 33 | **21.75 / 32.6** | ✅ |
> | chip | 85.9 × 31.9, 10.5px, r8 | **86 × 32, 10.5px, r8** | ✅ |
> | chip grid | 3 cols pitch 90, rows 52 | **3 cols, 86+4=90, 52** | ✅ |
> | hub | 88 | **88** | ✅ |
> | card | 429.8 × 231.1, r14, gap 11.9 | **430 × 204, r14, gap 12** | ✅ size, ⚠️ height |
> | **section h** | **1283** | **1054** | ⚠️ |
>
> 🟡 **THE TWO HEIGHT DELTAS ARE CONTENT, NOT SIZING, AND MUST NOT BE "FIXED" BY
> PADDING.** Our card is 204 tall against their 231 and our section 1054 against
> their 1283, because **our card copy is shorter than theirs** — theirs carries a
> rate/premium readout and a "why it surfaced" block that Standing Rule 6 forbids
> us from publishing. Every SIZING value matches; the height falls out of honest
> copy. Padding to 1283 would be inventing whitespace to hit a number.
> ⚠️ **THIS REVERSED ENTRIES (p) AND (q).** Those passes drove the height DOWN
> on instruction (1187 → 952 → 807 as a card). Matching Checkmate put it back to
> 1054 as a section. The client approved the reversal explicitly. The compressed
> constants are in (q) if it is ever wanted back.
>
> 🔴 **THE GRADIENT'S LAST STOP IS AT 170%, NOT 100%, AND THAT IS A CONTRAST FIX,
> NOT A RECOLOUR.** The client's three stops are unchanged:
> `#16130E 0% · #372F20 32% · #9C8D63 100%`. Run to 100% the surface reaches
> **L 0.2702** at the bottom edge, and that opens a band where **NO TEXT COLOUR
> ON THIS SITE IS LEGAL** — cream fails above L 0.1630, ink fails below L 0.2215,
> and between them nothing works. On a 1283px section that dead band is
> **78.6% → 91.0% down (y 1008–1168)**, exactly where the third card and lowest
> chips sit. Measured down the ramp (cream / gold-pale / gold / ink):
>
>      0%   16.91  14.17   8.11   1.06 F
>     40%   10.22   8.57   4.90   1.55 F
>     70%    5.36   4.50   2.57 F 2.96 F
>     80%    4.37 F 3.67 F 2.10 F 3.63 F   <- nothing works
>    100%    2.99 F 2.51 F 1.43 F 5.31
>
> Pushing the final stop to 170% means the bottom edge only reaches **#5F543A,
> L 0.0909**. All three colours kept, ramp still reads brown→gold, dead band
> gone. **150% was tried and REJECTED — gold lines fall to 2.76 against the 3:1
> bar there. 170% is the first value where every token clears at both ends.**
>
> 🔴 **gold #C9A84C CANNOT BE TEXT ON THIS SURFACE.** It needs a background ≤
> L 0.0521 and the ramp passes that ~63% down, so a gold eyebrow would fail on
> the lower half. The eyebrow is **gold-pale #EFE1B0**. Gold stays on the lines,
> where the bar is 3:1.
>
> **AA — 11 elements × 3 widths = 33, ZERO failures**, each measured against the
> surface at that element's OWN position on the ramp (the 170deg tilt means the
> worst corner is sampled, not the centre):
>
> | element | 1536 | 768 | 390 | bar |
> |---|---|---|---|---|
> | eyebrow gold-pale | 11.59 | 11.49 | 12.83 | 4.5 |
> | h2 cream | 12.25 | 13.04 | 14.54 | 4.5 |
> | lead cream/80 | 7.79 | 8.32 | 9.05 | 4.5 |
> | chip label cream (lowest chip) | 6.72 | 8.95 | 8.93 | 4.5 |
> | chip border **cream/55** | 3.67 | 4.47 | 4.47 | 3.0 |
> | lines + dash gold (lowest) | **3.15** | 3.19 | 3.23 | 3.0 |
> | halo rings **gold-pale/70** | 3.62 | 3.65 | 3.69 | 3.0 |
> | card face vs gradient | 6.83 | 6.72 | 6.64 | 3.0 |
> | · card h3 ink | 17.40 | 17.40 | 17.40 | 4.5 |
> | · card body ink/80 | 9.17 | 9.17 | 9.17 | 4.5 |
> | · card kicker gold-deep | 5.65 | 5.65 | 5.65 | 4.5 |
>
> 🟡 **TWO TOKENS FAILED ON FIRST BUILD AND WERE RAISED, NOT WAIVED.** The chip
> border at cream/40 measured **2.69** on the lowest chip (the surface is lighter
> down there than it was on the near-black card) → **cream/55 = 3.67**. The halo
> rings at gold/70 measured **2.31** → **gold-pale/70 = 3.62**. Both failures are
> the same cause: values solved against a uniformly dark card do not survive a
> surface that gets lighter downward.
> ✅ **THE THREE CARDS STAY LIGHT, and that is what makes the gradient tractable
> at all** — a white card works at ANY point on the ramp, so every value inside
> it stays valid (ink 17.4, ink/80 9.17, gold-deep 5.65). Checkmate's own cards
> are near-white (rgb 251,251,250) on their dark section, so this also matches
> them. Restyling them dark would put their internals back on a shifting surface
> and reopen the dead-band problem inside each card.
> **Grain: TWO passes, as the client's snippet has** — one blended into the
> background stack via `background-blend-mode: overlay`, one as the separate
> animated `.engine-grain` layer (renamed from `.engine-card__grain`; still the
> transform-stepped tile at 10fps, still frozen under reduced motion).
> **No overflow at any width** (1521/1521 · 753/753 · **390/390, 0 overflowing**),
> h1 count 1. Copy unchanged — every string still Synergy's own, nothing from
> Checkmate.
>
> 🔴 **(2026-08-02, q) — ENGINE CARD COMPRESSED TO A TRUE LANDSCAPE, AND
> THE GRAIN IS ANIMATED. ⚠️ SUPERSEDED BY (r): the card no longer exists and its
> AA table is void. The compressed geometry constants are here if wanted back.**
>
> **1 · SHORTER AND WIDER. THE PASSPORT CARDS WERE THE WHOLE PROBLEM.**
>
> | width | before (p) | after (q) | Δ |
> |---|---|---|---|
> | 1536 | 1473 × 952 · **1.55** | **1489 × 807 · 1.84** | −145 tall, +16 wide |
> | 768 | 705 × 1027 · 0.69 | **721 × 895 · 0.81** | −132 tall, +16 wide |
> | 390 | 350 × 1547 · 0.23 | **366 × 1412 · 0.26** | −135 tall, +16 wide |
>
> Now **wider than the homepage hero's aspect** (1521 × 900 = 1.69).
>
> 🔴 **THE FIX WAS TO LAY EACH PASSPORT CARD OUT HORIZONTALLY, NOT TO MOVE THE
> THREE CARDS.** Each card was a STACKED passport: a full-width header row
> (numeral badge + kicker + a rule beneath both) sitting ABOVE the h3 and body.
> That header band cost **48px of pure height per card**, and three of them
> stacked in the right column was the single largest thing forcing the section
> portrait. The numeral badge now sits BESIDE the text column, so its 36px
> OVERLAPS the copy's height instead of adding to it, and the rule moved under
> the kicker inside the text column — the passport reading survives, the header
> band does not. **224 → 186px per card, 114px off the section, zero copy
> change.** The three cards stay in the right-hand column: moving them to a
> horizontal row would have broken the carriers → hub → cards left-to-right
> reading that is the entire point of the diagram.
> The rest: outer inset `px-5 md:px-6` → `px-3 md:px-4` and cap 1560 → 1720
> (+16px width), card column 468 → 500, stage `min-h` 520 → 440, head→stage gap
> 32 → 24, card padding 18 → 16, card gap 10 → 8.
>
> **2 · THE GRAIN ANIMATES. ONE STATIC TILE, TRANSFORM-STEPPED.**
> 🔴 **BOTH OBVIOUS TECHNIQUES WERE REJECTED FOR MEASURED REASONS.**
> · *Animating `feTurbulence`* (`<animate>` on baseFrequency/seed) regenerates
> the Perlin field on the CPU every frame across the whole filtered box — on a
> 1489×807 card that is >1M pixels of noise per frame. The most expensive
> option available.
> · *The reference snippet's canvas loop* builds a 1024×1024 ImageData
> (1,048,576 px × 4 channels) with `Math.random()` per channel and
> `putImageData`s it every other rAF frame, forever, full-viewport — roughly
> **15M random numbers per second on the main thread** for a background texture,
> with no off-screen pause and no reduced-motion path.
> ✅ **SHIPPED:** the feTurbulence tile is generated ONCE and cached as a
> background image; the layer is then moved between **8 offsets** with
> `transform: translate3d()` on `steps(1, end)`. Only `transform` changes, so it
> is a compositor-thread layer shift — **no repaint, no filter re-evaluation, no
> JS, no rAF, no canvas, no per-frame allocation.** Verified in the CSSOM: the
> animation's animated properties are `["composite","transform"]` and nothing
> else; there are **2 animations on the entire page**.
> **FRAME RATE IS DELIBERATELY THROTTLED: 8 steps / 0.8s = 10 effective fps**
> (the snippet runs ~30). Film grain reads as *more* filmic under-cranked; at
> 60fps it becomes television static. `steps(1, end)` makes each offset HOLD —
> a tweened translate would read as the texture sliding, a completely different
> and much worse effect.
> 🟡 **THE OFFSETS ARE NON-MONOTONIC AND NON-MULTIPLE ON PURPOSE**
> (37/−53/71/−29/…): stepping by a constant, or in one direction, lets the eye
> lock onto the tile's 140px period and the grain visibly marches.
> 🔴 **`inset: -80px` IS LOAD-BEARING** — the layer overhangs the card so every
> edge is still covered after the largest offset; at `inset: 0` a translate would
> drag it off its own box and leave an un-grained band. The card's
> `overflow-hidden` clips the overhang. **The component must NOT put `inset-0`
> on the grain span** — equal specificity, and it would win by source order.
> ⚠️ **A NAIVE OVERFLOW COUNTER WILL INTERMITTENTLY FLAG THE GRAIN.** Its layout
> box moves with the transform, so `getBoundingClientRect().right` exceeds the
> client width on some steps. It is visually clipped and
> `scrollWidth === clientWidth` at every breakpoint. Test page overflow with
> `scrollWidth`, not by counting element rects, or exclude `.engine-card__grain`.
> ✅ **REDUCED MOTION FREEZES IT TO A STILL GRAIN RATHER THAN REMOVING IT** — the
> texture is part of the surface, not an animation; deleting it would change what
> the card looks like rather than how much it moves. `will-change` is dropped too
> so no layer is promoted for something static. Verified present in the CSSOM.
>
> **AA — RE-MEASURED WITH THE GRAIN COMPOSITED IN. 11 elements × 3 widths = 33,
> ZERO failures.** The grain is modelled at its worst case: a pure-white noise
> pixel through `mix-blend-mode: overlay` at 0.035. Translating a statistically
> uniform field does not change its distribution, so the animation cannot make
> this worse than the still frame.
>
> | element | 1536 | 768 | 390 | bar |
> |---|---|---|---|---|
> | eyebrow gold-pale | 7.40 | 7.09 | 6.92 | 4.5 |
> | h2 cream | 9.45 | 9.00 | 8.58 | 4.5 |
> | sub cream/80 | 7.54 | 7.24 | 6.97 | 4.5 |
> | chip label cream | 11.98 | 11.46 | 10.06 | 4.5 |
> | chip border cream/40 | 3.50 | 3.45 | **3.28** | 3.0 |
> | lines + dash gold | 7.02 | 7.02 | 7.02 | 3.0 |
> | halo rings gold/70 | 4.16 | 4.16 | 4.16 | 3.0 |
> | card face vs field | 14.76 | 16.05 | 16.05 | 3.0 |
> | · card h3 ink | 17.40 | 17.40 | 17.40 | 4.5 |
> | · card body ink/80 | 9.17 | 9.17 | 9.17 | 4.5 |
> | · card kicker gold-deep | 5.65 | 5.65 | 5.65 | 4.5 |
>
> Grain costs **0.32 at worst** (eyebrow 7.72 → 7.40). Grain `z-index: -10`, so
> it can never sit above content. No page overflow at any width, h1 count 1.
>
> 🔴 **NEWEST (2026-08-02, p) — ENGINE CARD REBUILT AGAINST THE REFERENCE, AND
> MADE HERO-WIDE. ⚠️ THE AA TABLE IN THIS ENTRY IS SUPERSEDED BY (q) ABOVE.**
>
> The client's reference IMAGE and SNIPPET arrived after (o) was built from a
> written description alone. Two things were wrong and both are now fixed.
>
> **1 · THE GLOW GEOMETRY. `-10%` IS THE ENTIRE EFFECT.**
>
>     (o) built    ellipse 120% 70% at 50%   0%
>     reference    ellipse  90% 70% at 50% -10%
>
> Putting the ellipse's centre **above** the top edge means the card's top edge
> cuts the gradient near its middle, so the whole top edge is uniformly bright
> and the wash reads as a WIDE HORIZONTAL BAND fading down. With the centre AT
> the edge the brightest point is a single spot at top-centre that falls off
> toward the corners — the "too weak / too centered" the client rejected. Dot
> pitch **18px**, dot size 1px, both taken from the snippet (was 22px).
>
> 🔴 **THE BRIGHTER WASH COST ONE TOKEN, AND THE NUMBER IS EXACT.** Solved
> jointly (glow alpha × dot alpha, worst pixel = a dot ON the glow), gold TEXT:
>
>              dot .06   dot .08   dot .10   dot .12
>     glow .20   5.21      4.90      4.61      4.33 F
>     glow .26   4.54      4.27 F    4.03 F    3.79 F
>     glow .38   3.42 F    3.24 F    3.07 F    2.91 F
>
> **gold #C9A84C as text caps the wash at ~0.20–0.26. The reference needs 0.38.
> The two are not simultaneously satisfiable at 4.5:1.** Measured on the built
> page at the eyebrow's actual position (5% down the card, local glow alpha
> 0.233, surface L 0.0542): plain gold measures **4.41 — it fails by 0.09.**
> 🟡 **RESOLVED BY SPLITTING THE GOLD, NOT BY WAIVING THE BAR.** gold #C9A84C
> stays on every NON-TEXT gold thing — lines, travelling dash, halo rings —
> where the bar is 3:1 and the headroom is huge. The one piece of small gold
> TEXT, the 11px uppercase eyebrow, is **gold-pale #EFE1B0** (L 0.7534 vs gold's
> 0.4094, so it tolerates a surface 2.5× brighter): **7.72:1**. gold-pale is not
> a new colour — §3 lists it as the on-dark gold token.
> ⚠️ **PUTTING THE EYEBROW BACK TO #C9A84C MEANS TAKING THE GLOW BACK TO 0.20.
> THEY ARE ONE DECISION.**
> 🔴 **THE SNIPPET'S CANVAS WAS DELIBERATELY NOT USED.** It animates a 1024×1024
> noise field on every other rAF frame, forever, full-viewport — a permanent
> main-thread cost for a static texture that cannot honour reduced-motion. Ours
> is an inline SVG `feTurbulence` data URI: no canvas, no rAF, no file, no
> animation. Its orange `#fb923c` is not used either; the wash is our gold.
>
> **2 · HERO-WIDE. THE CARD WAS PORTRAIT AND IS NOW LANDSCAPE.**
> **1164 × 1187 (aspect 0.98) → 1473 × 952 (aspect 1.55)**, against the hero's
> 1521 × 900 (1.69). Three changes bought the 235px:
> · **It breaks out of `max-w-content`** — the only thing on the page that does.
> The hero is full-bleed 100vw, so a card held to the 1220px text column can
> never read as hero-proportioned. `max-w-[1560px]` + a 20/24px inset gives
> 1473px, near-full-bleed with just enough cream either side that it still reads
> as a CARD — and the inset is what keeps the 32px radius visible at all.
> · **The head is two columns at lg** (eyebrow + h2 left, sub right, baseline
> aligned): 260px → ~120px for the same copy. Nothing cut, rearranged.
> · **Card column 394 → 468px**, so the body wraps shorter: passport cards
> **251 → 224px** each. Stage `min-h` 700 → 520.
> **RESTACK BELOW lg IS UNCHANGED AND ALREADY CORRECT:** the diagram is
> `hidden lg:block` so it is not rendered at all; carriers become a wrapped
> 21-item text list and the passport cards stack beneath. Verified: at 768 and
> 390 `diagramVisible: false`, `chipList.items: 21`. **768 → 705 × 1027 ·
> 390 → 350 × 1547**, both deliberately portrait because a landscape diagram
> cannot hold on a phone.
>
> **AA — 11 elements × 3 widths = 33 measurements, ZERO failures**, measured on
> the built page against the real gradient at each element's own rect:
>
> | element | 1536 | 768 | 390 | bar |
> |---|---|---|---|---|
> | eyebrow **gold-pale** | 7.72 | 7.37 | 7.21 | 4.5 |
> | h2 cream | 9.73 | 9.26 | 8.90 | 4.5 |
> | sub cream/80 | 7.59 | 7.28 | 7.09 | 4.5 |
> | chip label cream on glass | 12.42 | 11.56 | 10.06 | 4.5 |
> | chip border cream/40 | 3.53 | 3.46 | **3.28** | 3.0 |
> | lines + dash **gold** | 7.12 | 7.12 | 7.12 | 3.0 |
> | halo rings gold/70 | 4.20 | 4.20 | 4.20 | 3.0 |
> | card face vs field | 14.69 | 16.08 | 16.27 | 3.0 |
> | · card h3 ink | 17.40 | 17.40 | 17.40 | 4.5 |
> | · card body ink/80 | 9.17 | 9.17 | 9.17 | 4.5 |
> | · card kicker gold-deep | 5.65 | 5.65 | 5.65 | 4.5 |
>
> Effective glow alpha at the top edge **0.282** (the 0.38 stop sits at t=0,
> which is above the card). No overflow at any width (1521/1521 · 753/753 ·
> **390/390, 0 overflowing elements**), h1 count 1. Reduced motion unchanged:
> the component does not render the highlight paths under `reduce`, CSS forces
> `display:none` as belt-and-braces, and the grain is static so it has nothing
> to suppress.
> **UNCHANGED FROM (o), AS APPROVED:** passport cards light, chips dark glass,
> centre logo untouched, moving dash re-toned to gold.
>
> 🔴 **NEWEST (2026-08-02, o) — THE ENGINE IS A DARK HERO CARD. ITS CREAM AA
> TABLE IS VOID. + THE WHO-WE-SERVE HEADING WAS HALVED. ⚠️ THE AA TABLE IN THIS
> ENTRY IS SUPERSEDED BY (p) ABOVE — the glow and dot alphas both changed.**
>
> **1 · "WHO WE'RE HERE FOR" HEADING — 92px → 47px.** It was the largest type on
> the site after the Hero h1, and an h2 that rivals the h1 flattens the page
> hierarchy. Measured at 1536: **3 lines / 270.5px tall → 2 lines / 98.3px
> (−64%)**; the eyebrow-to-tabs header block went **416 → 243.8px (−172px)**.
> 🟡 **FOUR VALUES MOVED TOGETHER AND THE OTHER THREE ARE NOT COSMETIC.**
> Tracking **−0.03 → −0.018em** (negative tracking is a DISPLAY-SIZE correction;
> at 47px the old value welds letters), leading **0.98 → 1.06** (sub-1 leading
> collides once the type is small enough), measure **72% → 26ch** (a percentage
> measure re-wraps at every width for no typographic reason; a `ch` cap is tied
> to the face, so the sentence breaks in the same place at 1536 / 768 / 390 —
> all three render 2 lines). Weight stays 500, Kufam's ceiling. Copy and the
> For Families / For Agents tabs untouched.
>
> **2 · THE ENGINE NOW SITS IN AN INSET DARK HERO CARD.** Near-black
> `#0B0B0D`, a warm-gold radial glow at the top fading down into black, a CSS
> dot lattice and SVG-turbulence film grain. **No library, no image asset, no
> shadcn, no Unsplash** — CSS gradients plus one inline `feTurbulence` data URI.
> ⚠️ **BUILT FROM A WRITTEN DESCRIPTION. The client referenced an attached image
> and a code snippet; NEITHER REACHED THE SESSION.** If the attachment pins down
> dot pitch, glow radius or fade depth, this is the thing to re-derive against.
>
> 🔴 **THE OLD CREAM AA TABLE FOR THIS SECTION IS VOID — every value in entries
> (a)–(d) was measured against `#F8F4EE` and NONE carries over.**
>
> 🔴 **THE ONE NUMBER THAT GOVERNS THE CARD WAS ALREADY IN THIS FILE.** gold
> `#C9A84C` is L 0.4094, so for it to clear 4.5:1 as normal text the surface
> beneath must be **L ≤ 0.0521** — the exact constraint §3 used to derive
> `navy-lift #1C3A5A`. The glow's brightest permitted stop was solved on this
> project long before the dark card existed.
>
> **THE THREE SURFACES:** base `#0B0B0D` **L 0.0034** · glow peak gold@0.20
> **L 0.0241** · **WORST PIXEL = glow + a dot@0.055 → L 0.0369**, still 29%
> under the ceiling.
> 🔴 **THE WORST CASE IS GLYPH-OVER-DOT-OVER-GLOW, NOT GLYPH-OVER-GLOW.** A dot
> stacks on the glow and contrast is worst-pixel. Every figure below is measured
> against 0.0369, never against the base.
> 🟡 **THE DOT GRID IS THE RISK, NOT THE GLOW — the opposite of how it looks.**
> Glow at α 0.25 still gives gold 5.53; dots at α 0.14 drop gold to **4.62**,
> 0.12 from failing. So the glow was tuned for LOOK and the dots for SAFETY
> (α 0.055). **In `background-image` the FIRST layer paints on TOP** — the dots
> are listed first and sit over the glow, which is the stack the measurement
> assumes. Reversing them silently invalidates the table.
>
> **AA — 11 elements × 3 widths = 33 measurements, ZERO failures**, computed on
> the built page from each element's real rect against the analytic gradient:
>
> | element | 1536 | 768 | 390 | bar |
> |---|---|---|---|---|
> | eyebrow **gold** (was gold-deep) | 5.96 | 5.51 | **5.43** | 4.5 |
> | h2 **cream** (was ink) | 12.61 | 11.79 | 11.54 | 4.5 |
> | sub **cream/80** (was ink/80) | 9.41 | 8.55 | 8.44 | 4.5 |
> | chip label cream on glass | 13.77 | 12.19 | 11.35 | 4.5 |
> | chip border **cream/40** | 3.59 | 3.51 | **3.44** | 3.0 |
> | lines + travelling dash **gold** | 7.77 | 7.77 | 7.77 | 3.0 |
> | halo rings **gold/70** | 4.44 | 4.44 | 4.44 | 3.0 |
> | passport card face vs field | 16.62 | 17.14 | 17.72 | 3.0 |
> | · card h3 ink *(unchanged)* | 17.40 | 17.40 | 17.40 | 4.5 |
> | · card body ink/80 *(unchanged)* | 9.17 | 9.17 | 9.17 | 4.5 |
> | · card kicker gold-deep *(unchanged)* | 5.65 | 5.65 | 5.65 | 4.5 |
>
> 🔴 **gold-deep #7D641F MEASURES 1.71:1 ON THIS CARD AND FAILS OUTRIGHT.** It is
> a dark-on-light token. Plain gold is the legal gold on dark — the exact mirror
> of the §6a cream-page rule where gold is unusable and gold-deep is the only
> legal gold. **Neither token ever crosses over.**
> 🔴 **THE CHIP BORDER WAS TWO STEPS UNDER THE BAR AT THE OBVIOUS VALUE.** A chip
> edge is a UI component boundary needing 3:1. cream@0.25 → **2.09 (fails)**,
> 0.30 → 2.41, 0.35 → 2.76, **0.40 → 3.15 (passes)**.
> ✅ **THE PASSPORT CARDS STAY WHITE, AND THAT ISOLATED THE CHANGE.** Three
> bright documents on a dark field is the figure/ground idea, the passport
> metaphor needs them to read as paper, and — the practical win — **every value
> INSIDE them is unchanged and still valid**, because their surface is still
> white. Restyling them dark would kill gold-deep inside them too, make the
> guilloché texture (ink@0.028) invisible, and force a full re-derivation.
> ✅ **CHIPS BECAME DARK GLASS ON HIERARCHY GROUNDS, not only contrast.** 21
> white pills on near-black is a large bright area competing with the cards,
> which are the point of the right-hand side.
> ✅ **THE CENTRE LOGO NEEDED NOTHING AND READS BETTER HERE.** `LogoLockup` bakes
> the gold gradient `#FCE79A → #A9790F` and HANDOFF records it "has no light
> variant and cannot have one" — gold on cream was the compromise. On near-black
> it is in its native home; the footer and the login panel already ship this
> exact file on `#0D1B2A`. Logo text is 1.4.3-exempt regardless.
>
> **HOW IT SITS IN THE CREAM PAGE.** Inset, not full-bleed — cream visible on
> all four sides, `rounded-[32px]` (up from the cards' 24px; 24 on a 1187px-tall
> object reads as a sharp corner). Section padding is **symmetric now**
> (`py clamp(48,6vw,96)`, was `pt 40–80 / pb 28–53`) because a dark object needs
> even breathing room or it reads as pasted. Measured at 1536: card **1164×1187**,
> cushions **91.3px above and below**, seams to the neighbouring sections
> **0.000px** both ends, no overflow at any width (1521/1521 · 753/753 ·
> **390/390, 0 overflowing elements**), h1 count 1.
> 🔴 **NO CONFLICT WITH THE BODY GRADIENT (§ entry i).** The `<section>` is still
> transparent — the CARD paints, and a card is exactly the kind of thing allowed
> its own surface, like the hero card, the footer photograph and the login panel.
> **Do not move this fill onto the section.**
> ✅ **IT FIXES A PREVIOUSLY FLAGGED PROBLEM.** Entry (a) recorded
> `WhoWeServe → TheEngine` as `sameSurface: true`, cushion 135.1px, with the note
> that the boundary "is now invisible, which is a design choice worth
> confirming". The dark card gives that boundary back.
>
> ✅ **SPANISH PASS 3 (2026-08-02, n) — THE SITE IS BILINGUAL. THE SWITCHER IS
> LIVE.** `LOCALE_SWITCHER_READY = true`. Approved by the client after review of
> the flagged compliance list.
> **THE BLOG IS TRANSLATED.** `content/blog/es/` now holds **nine full article
> bodies** (~9,500 words) plus **three frontmatter-only stubs**. All nine live
> ES articles return **200 and render Spanish**; the three tax-blocked slugs
> (`iul-self-employed`, `iul-vs-401k-construction`, `nurses-tax-free-retirement`)
> return **404 in ES exactly as they do in EN** — the stubs exist ONLY so the
> /es/blog listing rows are Spanish, and `hasBody:false` keeps them unbuilt and
> unlinked. **Do not add bodies to those three until Ziad's tax answer lands.**
> **VERIFIED, NOT ASSERTED.** Switcher present and path-preserving on **16/16**
> route+locale combinations (every public route × en/es, including a blog
> article): `/es/blog/term-life-insurance` ⇄ `/en/blog/term-life-insurance`.
> A rendered-HTML sweep for 19 English tell-strings across 12 public /es routes
> returns **clean on all 12**.
> **KEYS STILL FALLING BACK: 150, and NONE of them is public.** admin 126
> (staff-only, noindex, robots-disallowed, behind auth) · `carriers.names.c1–c21`
> (brand names — the fallback returns the identical string) ·
> `testimonials.quotes.*.rating` (a number, not copy). Filtering out admin and
> the deliberate set leaves **zero**.
> 🔴 **THE COMPLIANCE SCREEN NOW COVERS THE ARTICLES TOO, AND EVERY HIT WAS
> RESOLVED BY READING IT IN CONTEXT RATHER THAN BY SUPPRESSING THE REGEX:**
> `final-expense-insurance.mdx` trips `garantizad*` **8 times** — every one is
> **"emisión garantizada"**, the standard industry name for *guaranteed issue*,
> matching the English term for term. `mortgage-protection-insurance.mdx` trips
> once on **"deuda garantizada con su casa"** — a security interest, not an
> outcome. `life-insurance-orlando.mdx` trips once on **"lo que el contrato
> garantiza frente a lo que proyecta una ilustración"** — the compliant
> contract-vs-illustration distinction, carried straight from the English.
> **None is a guaranteed-outcome claim.**
> 🔴 **THE MEDICAL-EXAM QUALIFIER SURVIVED INTO THE ARTICLES.** Every Spanish
> assertion across `final-expense`, `itin-holders` and `life-insurance-orlando`
> reads *"no se requiere examen médico para la mayoría de los solicitantes de
> entre 50 y 85 años"*. A regex sweep for the bare unqualified form returns
> **zero** in both the message catalogue and the article bodies. This is the
> /blog-vs-/services contradiction §"An internal inconsistency on the client's
> own site" documents — **it must not come back loose in either language.**
> 🟡 **`whySynergy.rows.r4` and `.r7` ARE NOW TRANSLATED** ("plan de retiro libre
> de impuestos"), on the client's explicit approval of the tax-language list.
> They still render nowhere (only r1–r3 are used, by TheEngine).
>
> 🔴 **SPANISH PASS 2 (2026-08-02, m) — EVERY PUBLIC UI NAMESPACE IS 100%. THE
> BLOG BODIES ARE NOT, AND THAT IS THE ONE THING BLOCKING THE SWITCHER.**
> **74.8%** of leaf strings (523/699), up from 35.8%. **DONE, all at 100%:**
> meta · nav · hero · two · whatWeCover · whoWeServe · howItWorks · consultation ·
> calculator · leadModal · **about** · **services** · **contact** · **join** ·
> **login** · blog(chrome) · footer · engine · cta. Metadata (title +
> description) is translated for every route. All seven public /es routes return
> **200** and a scan of the rendered HTML for 19 English tell-strings comes back
> **clean on all seven**.
> 🔴 **THE BLOG IS THE GAP AND IT IS NOT COSMETIC.** `content/blog/es/` is an
> EMPTY DIRECTORY and `resolveFile()` in `lib/blog.ts` **falls back to the
> English file**, so `/es/blog` today lists English titles, English excerpts and
> English categories under Spanish chrome, and every article body is English.
> Nine live articles, ~9,500 words. **The three tax-blocked articles stay unbuilt
> in Spanish exactly as in English.**
> 🟡 **`admin` (126 keys) is untranslated by choice** — staff-only, `noindex`,
> robots-disallowed, not a public surface.
> **TERMINOLOGY — CLIENT-SPECIFIED, APPLIED GLOBALLY.** "top-rated carriers" is
> **"aseguradoras mejor calificadas"**. It replaced 8 occurrences of
> "aseguradoras de primer nivel", which was the term the pre-existing es.json had
> used; zero occurrences of the old term remain. Register is US-Hispanic neutral
> (Mexican/Central American), `usted` throughout, never Spain forms.
> 🔴 **THE MEDICAL-EXAM QUALIFIER SURVIVED, AND IT WAS VERIFIED BY REGEX, NOT BY
> EYE.** Both Spanish assertions read *"no se requiere examen médico para la
> mayoría de los solicitantes de entre 50 y 85 años"* — a sweep for the bare
> unqualified form returns **zero**. This is the /blog-vs-/services contradiction
> §"An internal inconsistency on the client's own site" documents; it must not
> come back loose in either language.
> **A COMPLIANCE REGEX SCREEN RUNS OVER es.json** (garantiz*/garantía · libre de
> impuestos · sin/exento de impuestos · crecimiento del mercado · a prueba de
> recesión · A-rated/AM Best · uncapped income · examen médico). **11 keys trip
> it; all 11 are reviewed and listed in the session report.** None is a new claim
> the English did not already make. Re-run it after every batch.
> ⚠️ **`LOCALE_SWITCHER_READY` IS STILL `false`, DELIBERATELY.** The instruction
> was to ship it visible; the same instruction said not to flip it until the
> flagged strings are approved. It is held on BOTH counts — the flagged list is
> unapproved AND the blog bodies still fall back to English, which is the exact
> mixed-language failure the flag exists to prevent.
>
> **3 · SPANISH — PASS 1 DONE, es.json IS NOT COMPLETE AND MUST NOT BE MARKED SO.**
> **22.0% -> 35.8%** of leaf strings (154 -> 250 of 699). **Every namespace the
> HOMEPAGE renders is now 100%**: meta · nav · hero · two · whatWeCover ·
> whoWeServe · howItWorks · consultation · calculator · engine · cta · footer ·
> blog(chrome). Verified live: /es renders Spanish end to end, including the two
> strings that used to break language mid-row — `cta.quote` ("Get a free quote"
> beside "Únete a nuestro equipo") and the single empty `whoWeServe` bullet.
> **STILL EMPTY, and this is the remaining job:** services 95 · join 76 ·
> contact 39 · about 30 · login 20 · leadModal 14 · admin 126, plus **all nine
> live blog articles** (`content/blog/es/` is an EMPTY DIRECTORY; the three
> tax-blocked articles stay unbuilt in Spanish exactly as in English).
> 🟡 **FOUR CATEGORIES ARE EMPTY ON PURPOSE — DO NOT "FIX" THEM.**
> `carriers.names.c1–c21` (brand names; the fallback returns the identical
> string) · `carriers.ratings.*` (empty in English too) ·
> `testimonials.quotes.*.rating` (a number, not copy — §the testimonials entry) ·
> **`whySynergy.rows.r4` and `.r7`, which contain "tax-free retirement" in the
> ENGLISH source.** Those two were deliberately NOT translated: authoring
> "libre de impuestos" is exactly the assertion that is pending Ziad. They render
> nowhere today (only r1/r2/r3 are used, by TheEngine).
> 🔴 **A COMPLIANCE SCREEN NOW EXISTS AND SHOULD BE RE-RUN AFTER EVERY BATCH.**
> Regexes for garantiz*/garantía · libre de impuestos · sin/exento de impuestos ·
> crecimiento del mercado · a prueba de recesión · A-rated/AM Best · uncapped
> income. Current state: **3 hits, 0 real violations.** Two are
> `calculator.disclaimer` matching on *"no están garantizados"* — the compliant
> NEGATION, a true false-positive worth keeping. The third is real and
> **PRE-EXISTING, NOT WRITTEN THIS PASS**: `nav.servicesMenu.taxfree` =
> **"Retiro Libre de Impuestos"**. It is rendered ONLY by `components/Nav.tsx`,
> which is superseded and imported nowhere — a latent string, not a live claim.
> **Flagged for Ziad; not silently edited.**
> ⚠️ **`LOCALE_SWITCHER_READY` IS STILL `false`.** The instruction was to ship it
> visible; it is held because the same instruction said not to mark es.json
> complete until the flagged strings are approved, and /es/services, /es/join,
> /es/contact, /es/about and every blog article still fall back to English. The
> mixed-language failure the flag exists to prevent is fixed on the HOMEPAGE and
> not yet elsewhere. **One line to flip when pass 2 lands.**
>
> 🔴 **(2026-08-02, k) — HEADER SPLIT, DISABLED-CTA FIX, TESTIMONIALS
> TIMER, LOCALE SWITCHER READ. FIVE SEPARATE PIECES.**
>
> **1 · THE HERO-ALT CLEANUP WAS ALREADY COMPLETE. NOTHING TO DO, VERIFIED
> RATHER THAN ASSUMED.** Entry (j) below is accurate in full. Re-checked on the
> filesystem this pass: `HeroAlt.tsx` / `HomeSections.tsx` absent from
> `components/`; `(site)/` holds only about · blog · calculator · contact · join
> · layout.tsx · page.tsx (**no `hero-alt/`**); `public/hero/` does not exist;
> `.env.local` holds three Supabase keys and **no `HERO_VARIANT` of any kind**;
> a repo-wide grep for `HERO_VARIANT|hero-alt|HeroAlt|house-cutout|HomeSections`
> returns **three hits, all inside this file**; `(site)/page.tsx` has no
> `searchParams` and no `hero=` reference. `Hero.tsx` untouched, live hero
> renders exactly as before (screenshotted at 1536: porch family photo, one h1,
> both CTAs).
>
> **2 · "WHO WE'RE HERE FOR" CARD RESTYLE — NOT BUILT. IMAGE CANDIDATES ONLY,
> BY INSTRUCTION.** See the shortlist in the session report; nothing was
> downloaded and `WhoWeServe.tsx` is unchanged. 🔴 **THE MEASURED CONSTRAINT
> THAT DECIDES THIS:** the card box is **475 × 680** at 1536 (3-up in the 1620
> container, `lg:min-h-[680px]`), so a full-bleed image needs **950 × 1360** at
> 2× DPR. **Synergy's own photography cannot fill it.** Every own landscape is
> **1620 × 1080** (`SYNERGY OFFICE INSIDE`, `SYNERGY AGENTS`, `AGENT SPEAKING`,
> `OFFICE PHOTO IMPORTANT` in `public/New folder/`); cropped to the card's 0.699
> aspect that yields **756 × 1080 — 20% short on width, 21% on height.** The
> gallery re-crops fail too and are already-used faces (§the gallery table).
> Only `RULA SPEAKING.jpg` (4640 × 6960) clears, and that face is already on
> /about and /join. **So these six cards are a stock brief, not an own-photo
> brief** — the same conclusion (j) reached about the cut-out, for the same
> reason, and it should not be re-derived a third time.
>
> **3 · THE HEADER NAV SPLIT WAS 2 / 4 WHILE routes.ts DOCUMENTED 3 / 3.** The
> code said `HEADER_ROUTES_TEXT.slice(0, 2)`; the docblock in routes.ts said in
> as many words that the split was 3 / 3 and that adding `join` "would make the
> split 2 left / 5 right instead of 3 / 3". **The comment was describing an
> intention the code never implemented.** It is now `SPLIT_AT =
> Math.ceil(HEADER_ROUTES_TEXT.length / 2)` — DERIVED, so a seventh route makes
> it 4 / 3 (heavier half LEFT, because the pill already weights the right)
> rather than silently drifting back. Landed:
>
>     LEFT   Home · About · Services
>     RIGHT  Blog · Contact · Calculator   + the Join pill beyond them
>
> Measured at **1536**: left ink 76.4→284.7, logo 681.3→839.5 (**centre 760.4 =
> content centre 760.4, exact**), right ink 1111→1334.8, pill 1366.8→1444.4
> against a content right edge of 1444.6. Left group starts on the inset, pill
> ends on it. No horizontal overflow (1521 = 1521).
>
> 🔴 **AND CONFIRMING IT AT 768 FOUND A REAL PRE-EXISTING BUG, WHICH IS FIXED.**
> Both link lists are `hidden card:flex`. **A `display: none` grid item is not
> placed in the grid at all** — so below 900px the logo auto-placed into
> **column 1** and the right-hand group into the `auto` column, leaving column 3
> empty. Measured at 768 before the fix, on tracks `305.763 / 32 / 305.763`:
> logo centre **207.5** against a content centre of **376.4** (168.9px off), and
> the hamburger stranded at **360.4→404.4** with 348px of empty bar to its
> right. `justify-self-center` was centring the logo in the wrong column.
> Fixed with explicit `col-start-1 / col-start-2 / col-start-3`, so a hidden
> list leaves an empty cell. After: **768** logo centre 376.4 = 376.4, burger
> 666.2→710.2 (hard right), scrollWidth 753 = 753. **390** logo centre 195.2 =
> 195.2, scrollWidth 390 = 390. **This only ever looked right on a
> desktop-first reading of the file.**
>
> **4 · THE /join "AGENT PORTAL" BUTTON — THE LINK WAS NEVER THE PROBLEM, THE
> STYLING WAS.** Diagnosed before touching it. It renders
> `<button type="button" disabled aria-disabled="true"
> aria-describedby="join-portal-note">` with **no href and no onClick prop at
> all** (read off React's own props on the live node): clicking it cannot do
> anything, and it is genuinely out of the tab order (`.focus()` does not move
> `activeElement` to it). All correct. **What was wrong is that it did not LOOK
> disabled** — and that is measurable, not taste. It sits at **83.4% down the
> hero**, where `.join-hero-scrim` is at its 0.70 floor; sampling the real JPEG
> through object-cover with `.hero-veil-top` and `.join-hero-scrim` composited
> as real per-row fills, the worst (brightest) backdrop pixel under its own rect
> is **#40454D, L 0.0588**. Against that:
>
>     label  cream@0.72   5.48:1     LIVE body text needs 4.5
>     border cream@0.45   3.17:1     a LIVE UI boundary needs 3.0
>
> **It measured as a fully compliant ENABLED ghost CTA, beside a filled primary,
> on a dark hero — the house style for a live secondary.** Now
> `1px dashed cream@0.35` (**2.51:1**), no fill, label cream@0.58 (**4.18:1**) —
> both deliberately UNDER the live bars, which 1.4.3 and 1.4.11 permit because
> both exempt inactive components. **The dash is the 1.4.1 half**: alpha alone
> is colour, a dashed edge is shape and survives greyscale. Full derivation on
> the rule in globals.css.
> 🔴 **THE HEADER HAS NO SIGN-IN AT ALL, AND THAT IS NOT A STYLING BUG EITHER.**
> `AGENT_LOGIN_LINK_READY = false` (SiteHeader.tsx) gates the bar entry AND the
> mobile-panel entry; the live bar renders exactly Home · About · Services ·
> [logo] · Blog · Contact · Calculator · Join, and a query for `a[href*=login]`
> across the whole page returns **zero**. The string is `nav.login` =
> **"Agent Login"**, not "Sign In". **DECISION RESERVED BY THE CLIENT — do not
> flip it unasked.**
> 🟡 **JoinHeroCtas' docblock WAS STALE AND IS CORRECTED IN FILE.** It said the
> button was waiting on "a portal URL from the client". No such URL is coming:
> `/login` exists and works, `(portal)/` holds only `admin` and `login`, and
> `login/actions.ts` sends a non-admin to `/${locale}` — the public homepage.
> **The missing thing is a DESTINATION, not a URL**, and it is the SAME open
> decision as `AGENT_LOGIN_LINK_READY`. Flip the two together or neither.
>
> **5 · THE TESTIMONIALS TIMER NO LONGER PAUSES ON HOVER.** Removed on
> instruction. `hovered` and both mouse handlers are gone; **`focused` is the
> whole pause** and still satisfies 2.2.2 (a keyboard user mid-read is the case
> the pause exists for; a pointer resting on the section is not). The
> hover/focus-cancellation bug recorded in entry (h) is now MOOT rather than
> solved — there is no second flag left to cancel the first. **Do not re-add a
> hover flag to "fix" it.**
> **PROVEN WITH REAL INPUT, per (h)'s own warning about synthetic events.** Two
> independent checks. (a) React's props on the live `<section>` are exactly
> `aria-labelledby · className · onFocusCapture · onBlurCapture · children` —
> **no `onMouseEnter`, no `onMouseLeave`**, so no code path exists. (b) A real
> pointer parked on the section (and directly on the Next arrow — `:hover` true
> on both, `activeElement` still BODY) for **48 consecutive samples over 19.2s**:
> `t-paused` **never once applied**, and the counter advanced **02 → 03 at
> t=5.61s** (mid-cycle — the hover did NOT reset it) and **03 → 01 at t=13.60s**,
> 7993ms later. Hover neither pauses nor restarts the 8s.
>
> **6 · THE LOCALE SWITCHER WORKS. IT IS STILL OFF, AND THE REASON IS WORSE THAN
> THE FILE SAID.** `LOCALE_SWITCHER_READY` was flipped `true`, driven, and put
> back to `false`. **The switch itself is verified**: a real click on ES
> navigated /en → /es and re-rendered every nav href into the new locale (Inicio
> · Nosotros · Servicios · Blog · Contacto · Calculadora · Únete). Placement
> confirmed live — `position: fixed`, z-30, **32.8px from the bottom**, cream
> pill, real `<a>`s with `hreflang`/`lang`, EN gold-deep + `aria-current="page"`,
> ES ink, **no flags**.
> 🔴 **BUT /es IS NOT "ENGLISH AT A SPANISH URL" — IT IS BOTH LANGUAGES IN ONE
> COLUMN.** Read off the live page: nav Spanish · hero headline, sub and SSN
> line **English** · **the hero CTA pair splits mid-row — "Get a free quote"
> English beside "Únete a nuestro equipo" Spanish** · "WHAT WE DO" English ·
> WhoWeServe Spanish **except one bullet** ("Appointments with multiple
> top-rated carriers", the single empty `whoWeServe` key) sitting between two
> Spanish bullets inside one card · "OUR CARRIERS" English · `<title>` English.
> A reader who asked for Spanish and gets a language change between two adjacent
> buttons does not read "translation pending", they read "broken". The fallback
> is working correctly; the result is not shippable. **Recommendation: stays
> hidden until es.json carries real copy. Same logic as the disabled lead form.**
> **FLAGS: NONE, AND THAT DECISION IS ALREADY IN THE FILE AND STILL RIGHT.**
> SEM uses national flags (UK / PT). Ours must not: a Spain flag for a US
> Hispanic (largely Mexican and Central American) audience names the wrong
> country; a US flag for English makes a nationality claim about the READER; and
> a globe is a language-agnostic glyph that says nothing about WHICH two
> languages. **Language is not nationality. Text codes only — "EN / ES".**
>
> 🔴 **NEWEST (2026-08-02, j) — "TYPE BEHIND IMAGE" HERO: TRIED, REJECTED,
> DELETED. DO NOT REBUILD IT.**
>
> An alternative homepage hero was built and compared against the live one, on
> the brün model — one huge display word ("Synergy") with a cut-out object
> standing in front of it, so the word reads behind and around the object. **The
> live family-photo hero WON and is now permanent.** `components/Hero.tsx` was
> never touched at any point; there is nothing to revert on it.
>
> **DELETED IN FULL:** `components/HeroAlt.tsx` · `components/HomeSections.tsx`
> (a shared section list that existed only so the two pages could differ by
> exactly one element) · `app/[locale]/(site)/hero-alt/` · the `?hero=alt`
> query-param toggle and its `searchParams` block in `(site)/page.tsx` ·
> `public/hero/house-cutout.png` · the stray `NEXT_PUBLIC_HERO_VARIANT` line in
> `.env.local`. `(site)/page.tsx` is back to its pre-toggle form and back to
> STATIC rendering — reading `searchParams` had opted it into dynamic.
>
> ---
>
> 🔴 **WHY IT WAS REJECTED, SO THE NEXT PERSON DOES NOT RE-DERIVE IT.**
>
> The design was sound and it measured fine. What killed it was the ASSET, and
> that problem is structural rather than a matter of searching harder:
>
> **The effect requires a genuinely transparent cut-out.** The word has to show
> through the empty space around the object — that is the whole trick. A
> rectangular photo cannot produce it. Synergy's own photography has no
> pre-isolated house and never will without a dedicated shoot.
>
> **The free stock pool does not contain one at usable quality.** Pexels and
> Unsplash are JPEG-only, so they are out by definition. Pixabay is the only
> free source carrying real alpha PNGs: 35 transparent house PNGs were pulled
> and probed. Most are illustration or 3D fantasy asset. Seven were photographic
> houses. Every one failed on two independent counts:
>
>   - **The base of the cut-out is destroyed.** Rooflines and sides cut cleanly
>     (sky-against-roof is easy segmentation), but the bottom is a soft
>     eraser-brush smear where the lawn was rubbed out — torn grass, floating
>     turf, a pale halo against cream. Fatal here specifically, because in this
>     composition the object's BASE is what crosses the word.
>   - **Resolution.** Trimmed to actual content the best were 1081x611 and
>     1028x480, against ~1400 device px needed at 2x. Pixabay's public CDN caps
>     at `_1280`; originals need an account.
>
> A `mask-image` fade on the bottom 12% was tried as mitigation. It softened the
> ragged base rather than fixing it, and it was still visible.
>
> **THE MEASUREMENTS, so they are not redone.** Word occlusion by opaque cut-out
> pixels, per letter, taken from real layout rects against the PNG's real alpha:
>
>   1536   13.5% of letter-box area   S 0 · y 0 · n 0 · e 1 · r 20 · g 32 · y 46
>    768    4.1%                      S-r 0 · g 8 · y 21
>    390    0%  (restacked, no overlap)
>
> The relationship worked — "Syne" always clear, house over the tail — and every
> AA figure passed (eyebrow gold-deep 5.16, word ink 15.87, sub 15.86, SSN line
> 6.14, CTAs 15.87 / 15.84). **The layout was not the problem. The image was.**
>
> **IF IT IS EVER REVISITED**, the only routes that work are: a commissioned
> shoot of a real Synergy-sold property against sky, cut properly; a paid
> licensed cut-out at 4000px+; or a different object with a clean silhouette —
> the Synergy shield from `public/synergy-logo.svg` is already vector, already
> transparent, already ours, and already means protection.
>
> 🔴 **NEWEST (2026-08-02, i) — THE PAGE SURFACE IS A GRADIENT. THE FLAT-CREAM
> AA TABLE IS VOID.**
>
> ```css
> body { background-color: #f8f4ee;
>        background-image: linear-gradient(180deg, #f8f4ee 0%, #f4efe4 100%); }
> ```
>
> **ON `<body>`, `background-attachment: scroll` (default).** Painted once across
> the document's own height, so it travels with the content — static, not
> scroll-shifting and not animated. `fixed` was considered and rejected: it locks
> the gradient to the viewport, every screenful then shows the full range, and it
> reads as a wash rather than as depth. Document-height is what makes it
> barely-there — on the 7,522px homepage the whole 0.043 luminance drop is spread
> over 7,522px, about **0.0006 per 100px**.
>
> **WHY `<body>` AND NOT A WRAPPER.** The overscroll rubber-band area is painted
> from the CANVAS, propagated from body. A wrapper cannot reach it — that finding
> is the entire reason `RouteTheme.tsx` exists (§8). A gradient on a wrapper would
> leave the top and bottom rubber-band bands flat while the page is not.
>
> 🔴 **ELEVEN THINGS HAD TO STOP PAINTING FLAT CREAM, OR THE GRADIENT WOULD HAVE
> BEEN INVISIBLE ON EVERY PIXEL.** `<body>` already carried `bg-cream`, and seven
> section components painted opaque `bg-cream` on their own outer `<section>`.
> Between them they tiled the full height of every page. Now transparent:
>
> | | |
> |---|---|
> | `app/[locale]/layout.tsx` `<body>` | `WhySynergy` · `HowItWorks` · `TheEngine` |
> | `Testimonials` · `WhoWeServe` | `Calculator` · `CarrierStrip` |
> | `.about-page` in globals.css (was a hardcoded `#f8f4ee`) | `(site)/calculator/page.tsx` `<main>` |
> | `(site)/join/page.tsx` `<main>` | `Footer` (see below) |
>
> They are PAGE SURFACE, not surfaces of their own. Anything that genuinely has
> its own surface still paints and is unaffected: the two navy sections, the hero
> card's photograph, the footer photograph, the navy login panel, glass panels.
> **Do not re-add `bg-cream` to a full-width section wrapper without reading the
> block above `body` in globals.css.**
>
> **`.about-page` WAS THE REAL BUG.** It wraps the whole body of /about
> (y 900–7027) and /services (y 900–11398) in a flat `#F8F4EE`. At its top the
> gradient beneath is `#F8F3ED` — invisible. At its BOTTOM the gradient has
> reached `#F4F0E5` while the fill was still `#F8F4EE`: the wrapper ended ~0.04
> of luminance LIGHTER than the surface either side, a full-width step on the two
> longest pages on the site.
>
> **THE FOOTER'S MELT AND SCRIM MOVED WITH IT.** Both opened on
> `rgba(248,244,238,·)`, correct against flat cream and 0.043 too light against
> the gradient at the point they meet. Both are `rgba(244,239,228,·)` now, and
> `CREAM` in `scripts/measure-footer-aa.mjs` tracks them. **Those three values and
> the body gradient's end stop are one number in four places.**
>
> **SEAMS — MEASURED, NOT EYEBALLED.** Every boundary between `main`'s children is
> flush to three decimals (899.984 · 1920.125 · 3184.094 · 4371.578 · 5232.453 ·
> 5990.828 · 6608.891), zero margins, max vertical gap **0.000px** on /, /about
> and /services. No stripe of gradient can appear at a seam. The 15px to the right
> of every full-bleed section is the `scrollbar-gutter: stable` reservation on
> `<html>` (body 1521 vs html 1536) — scrollbar space, not exposed page, and it
> predates the gradient unchanged.
>
> ---
>
> 🔴 **THE OLD FLAT-CREAM AA TABLE IS VOID.** Every value measured against a flat
> `#F8F4EE` page is superseded. Text on the gradient now sits on its LOCAL colour,
> which is a function of its own document position. Re-measured by walking every
> text node on every page and computing the surface at each block's document y:
>
> **530 blocks across /, /about, /services, /join, /calculator, /contact at
> 1536 / 768 / 390 — ZERO failures.** Worst instance of each token:
>
> | token | worst surface | ratio | bar |
> |---|---|---|---|
> | `#7D641F` gold-deep | `#F5F0E7` | **5.00** | 3.0 / 4.5 |
> | `#1A1A1A` @0.70 | `#F5F0E6` | **6.04** | 4.5 |
> | `#1A1A1A` @0.72 | `#F4F0E5` | **6.44** | 4.5 |
> | `#1A1A1A` @0.75 | `#F7F3EC` | **7.26** | 4.5 |
> | `#1A1A1A` @0.80 | `#F6F1E8` | **8.51** | 4.5 |
> | `#1A1A1A` @0.82 | `#F5F0E6` | **9.03** | 4.5 |
> | `#0D1B2A` navy | `#F4EFE5` | **15.21** | 4.5 |
> | `#1A1A1A` ink | `#F4EFE5` | **15.22** | 4.5 |
>
> **THE BOUNDING ARGUMENT, WHICH IS WHAT MAKES THIS DURABLE.** The gradient's
> range is closed at `[#F8F4EE, #F4EFE4]`. Every token clears its bar at the
> DARKER end (gold-deep 4.93, ink 15.18, ink/70 6.02 — see the token table at the
> head of globals.css), so no block at any width, on any page, at any document
> length can fail from the gradient alone. A new token must be checked against
> `#F4EFE4`, not against `#F8F4EE`.
>
> **FOOTER (text over the photograph), re-run with the new scrim:** 1536 **20/20**
> tightest 6.81 · 768 **21/21** tightest 4.79 · 390 **21/21** tightest 4.75. The
> small breakpoints tightened ~0.18 because the scrim now mixes a slightly darker
> cream. **4.75:1 is the site floor** and it is the first thing to re-check if the
> end stop ever moves.
>
> 🔴 **NEWEST (2026-08-02, h) — TESTIMONIALS REBUILT TO THE beetogreen.com/en
> ARRANGEMENT.** The staggered fan from entry (g) is REPLACED. Studied live in
> Chrome and reproduced: quote **37.33px / 44.8 lh (1.2) / −0.02em / w500** ·
> lead-in **24.89px w600** · counter **16px "NN / NN"** · arrows **44.4px
> circles, radius 50%, 1px border, ~8.9px apart, TOP-LEFT in their own column** ·
> ring **viewBox 0 0 50 50, circle r=24, dasharray 150.8 (=2πr), stroke-width 2,
> `animation: 8s linear forwards`** · **44px rhythm** header → quote → author.
> Ours measures 44px header→quote, 44px quote→author; quote 44px at 1536 (=37.4
> at their 1280), counter 16px, arrows 44px r50%. Their surface is white with
> near-black type; ours is cream/ink and any gold is gold-deep.
> 🟡 **ONE TYPE DEVIATION, FORCED BY OUR RULES:** their lead-in is weight **600**;
> Kufam tops out at **500** and synthetic weights are banned (§3), so ours is 500.
> **COUNT: THREE**, so the counter reads **01 / 03** (theirs 01 / 05). It is
> driven off `QUOTES.length` — it cannot drift from the data.
> **🔴 NO ORG FIELD EXISTS, SO THERE IS NO ORG.** The reference shows
> "name + company". `testimonials.quotes.*` carries `name` and `quote` ONLY —
> there is no organisation for any of the three and inventing an employer for a
> named attributed quote is not available. **Name alone.** One key per quote
> fixes it if the client supplies them.
> **§NO PHOTO, AND NO PLACEHOLDER FOR ONE.** Their author block is a 71px
> circular portrait beside the name. Ours drops the photo, the circle and any
> initial-bubble entirely, and rebalances that row so both ends carry content:
> **name bottom-left, five stars bottom-right**. Nothing occupies the space an
> image would have, so nothing reads as missing.
> **STARS — NOW REAL DATA, NOT A HARDCODED FIVE (2026-08-02, i).** The client
> confirmed the five-star ratings (verified by Hamza), so `quotes.*.rating`
> carries the value per testimonial — all three are `"5"` — and the row renders
> from it. The first build looped a fixed `STARS = [0..4]`, which would have
> asserted five stars for any FUTURE testimonial regardless of its real score.
> **A missing, non-numeric or out-of-range rating renders NO stars at all**
> rather than defaulting to five: an absent rating is silent, never invented.
> Earned stars are gold-deep **5.16:1**; unearned ones (only visible below five)
> are a HOLLOW glyph at ink/50 **3.27:1** — above the 3:1 bar rather than
> decorative-exempt, and the SHAPE differs too so it is never colour alone.
> `role="img"` + an interpolated `aria-label` ("Rated {n} out of 5") carries the
> value, so it is not conveyed by shape alone either.
> 🔴 **`rating` IS MIRRORED EMPTY IN es.json ON PURPOSE.** A rating is a number,
> not copy, and must not be translated; `i18n.ts`'s empty-value fallback returns
> the English `"5"`. **Verified live on /es: five stars render, aria-label
> "Rated 5 out of 5".** Do not "fix" the empty Spanish value by translating it.
> **THE LEAD-IN IS OUR OWN HEADING.** Theirs ("Don't just take our word for
> it…") is their copy; `testimonials.headline` sits in that exact slot, so the
> arrangement matches with ZERO new copy and the section keeps a real h2.
> **QUOTES VERBATIM** — verified by diff: no quote, name or headline changed. The
> curly marks are decorative `aria-hidden` spans, so the blockquote's accessible
> name is the client's sentence alone.
> **🔴 A REAL BUG FOUND BY DRIVING IT, NOT BY READING IT.** The pause first
> shipped as a SINGLE `paused` boolean set by four handlers. With focus still on
> an arrow, moving the POINTER off the section fired `onMouseLeave` and set it
> false — restarting the 8s timer under a keyboard user mid-read, the exact
> failure the pause exists to prevent. Measured: focused "Show the next
> testimonial", paused **false**. **Hover and focus are now separate flags and
> the pause is their OR**, plus `onBlurCapture` ignores focus moving BETWEEN the
> two arrows. Re-tested: focus + pointer away → still paused; blur → resumes.
> ⚠️ **AND A TESTING TRAP WORTH KEEPING:** synthetic `dispatchEvent` for
> mouseover/focusin did NOT reach React's delegated handlers and reported "not
> paused" for a pause that works. **Drive this component with real input
> (`computer` hover/click), never synthetic events** — the synthetic result is a
> false negative.
> **AA — every row passes:** quote **15.88** · lead-in **15.88** · counter
> ink/70 **6.15** (their ink@0.5 would be 3.27 and fail) · name **15.88** ·
> stars **5.16** · arrow glyph **15.87** · arrow border navy **15.87** (a UI
> component boundary, so 3:1 applies) · ring gold-deep **5.16**.
> **REDUCED MOTION:** the JS timer never starts and `.t-ring` renders COMPLETE
> (`stroke-dashoffset: 0`) rather than empty, so it reads as a finished dial, not
> a stalled one. Arrows keep working.
> **PLACEMENT UNCHANGED** — still last, after `<Consultation />`. Seams both
> 0px gap: Consultation(dark) → Testimonials(cream) cushion **216**, Testimonials
> → Footer(navy) **0**. Section height 618 at 1536, 475 at 375.
> **375: 375/375, ZERO elements outside the viewport**, arrows and ring present,
> quote 24px. One h1 (Hero) at both widths.
> 🟡 **THE VACATED-SLOT COST FROM ENTRY (g) STILL STANDS:** WhoWeServe → TheEngine
> → HowItWorks are three cream sections in a row (cushions 135.1 / 133).
> 🟡 **THREE NEW STRINGS TOTAL, all interface labels under Rule 4:**
> `testimonials.prevLabel`, `.nextLabel`, `.rating`. An unlabelled arrow and an
> unlabelled star row fail the keyboard/AT requirements and no equivalent existed
> in the catalogue. Mirrored empty in es.json.
>
> 🔴 **(2026-08-02, g) — TESTIMONIALS: STAGGERED FAN (SUPERSEDED BY (h) ABOVE —
> the fan is gone; the record correction below still stands), MOVED LAST, AND A
> RECORD CORRECTION THAT MATTERS.**
> **🔴 THE "STAFF STATEMENTS" CLAIM IN THIS FILE WAS WRONG. CORRECTED HERE.**
> §"Placeholder strings" said *"they are staff statements about how Synergy
> works"*. They are not. Read them: *"We have real peace of mind now"*, *"They
> truly put our family first"*, *"I never understood life insurance until I spoke
> with Synergy"* — these are CUSTOMERS. fflsynergy.com publishes all three
> verbatim, with these attributions, under the heading **"What Our Clients
> Say"**. So the heading is the CLIENT'S OWN wording over the client's own
> quotes: it does not overclaim and **it stays**.
> ⚠️ **CONSEQUENCE, FLAGGED NOT ACTED ON.** That mischaracterisation was the
> stated basis for **deleting the results disclaimer** (see the 2026-07-30
> entry). **The reasoning is void.** The deletion may still be right on the
> narrower ground that none of the three claims a RESULT — no earnings, no
> returns, only service experience — but that is a compliance call for Ziad, not
> one to re-decide in a restyle. **Nothing was re-added or re-removed.**
> **THREE testimonials** (`q1`–`q3`), **verbatim and unaltered** — Standing Rule
> 3. Verified by diff: no quote, name or heading changed.
> **🔴 NO PHOTOS, AND NO AVATAR SLOT AT ALL.** The reference puts a face on every
> card; we have none of these people and a stock or invented face on a NAMED
> attributed quote would be a fabrication. There is no empty slot and no
> initial-in-a-circle (which reads as a broken image) — the anchor in that
> position is a large gold-deep quotation mark, with corner ticks and a hairline
> rule so the card reads as a document panel. **There is also NO ROLE FIELD** —
> `quotes.*` carries `name` and `quote` only, so the card shows the name alone;
> a role or a "Client" label would be authored copy asserting who these people
> are and is not ours to add.
> **DEPTH IS SCALE + ROTATION + STACK ORDER, NEVER OPACITY — an AA decision.**
> Fading the back cards composites their ink toward the cream and drops the quote
> under 4.5:1. Every card stays fully opaque; rotation does not change contrast,
> so **all six text nodes measure 17.4:1** at any angle. Arrows 15.87:1.
> **ONE MARKUP, TWO BEHAVIOURS, DECIDED IN CSS** (`.t-stack` / `.t-card` /
> `.t-arrows`, end of globals.css) — not a JS branch, because rendering both
> variants would put three quotes in the DOM twice and a screen reader would read
> six. The fan requires **`min-width:768px` AND `prefers-reduced-motion:
> no-preference`**; anything else is a plain upright column with the arrows
> hidden. That single rule satisfies the reduced-motion contract and the phone
> layout at once, and `useReducedMotion()` was removed from the component.
> **🔴 A DEFECT CAUGHT BY MEASURING THE PHONE:** the first build fanned at every
> width and the left-hand card sat at **left −104.9px** — clipped off the
> viewport with its text unreachable, while `documentElement.scrollWidth` still
> matched `innerWidth` so a naive overflow check passed it. **8 elements were
> outside the viewport; it is 0 now** at 375 and at 1536.
> **PLACEMENT — "after the calculator section", which does not exist.** The
> Calculator is not on the homepage (moved to `/calculator`; `<Consultation />`
> took its exact slot and links to it), so that resolves to **after
> `<Consultation />`** — Testimonials is now the LAST section before the footer.
> New order: Hero → WhatWeCover → WhoWeServe → TheEngine → HowItWorks →
> Consultation → **Testimonials** → Footer.
> **SEAMS — all six 0px gap, no dead space.** New boundary
> Consultation(dark) → Testimonials(cream) cushion **216px**, then
> Testimonials(cream) → Footer(navy) at **0** — the section is CREAM precisely so
> that run does not collapse into one dark mass.
> 🟡 **THE COST AT THE VACATED SLOT, MEASURED:** Testimonials was the navy break
> between TheEngine and HowItWorks. Removing it leaves **three cream sections in
> a row** — WhoWeServe → TheEngine (cushion 135.1) → HowItWorks (cushion 133),
> both `sameSurface: true`. The alternation now reads dark·dark·cream·cream·cream
> ·dark·cream·navy. Nothing overlaps and no gap opened, but the middle of the
> page lost its rhythm break. **Fix if wanted:** give one of the three a distinct
> surface, or move HowItWorks. Not done unasked.
> **One h1 (Hero) at both widths; no horizontal overflow (1521/1536, 375/375).**
> 🟡 **TWO NEW STRINGS, THE ONE DEVIATION FROM "NOTHING INTO en.json":**
> `testimonials.prevLabel` / `.nextLabel`. The arrows are real buttons and an
> unlabelled control fails the keyboard requirement; no prev/next label existed
> anywhere in the catalogue. Interface labels under Rule 4. Mirrored empty in es.
>
> 🔴 **(2026-08-02, e) — ADMIN RESTYLE. VISUAL ONLY; NO DATA PATH MOVED.**
> The admin is re-skinned onto a reference card anatomy: big rounded outer card,
> letterspaced mono header, thin divider, left selector list, stat row.
> **🔴 THE BOUNDARY HELD, PROVEN BY HASH NOT INTENTION.** Nine files were hashed
> before and after: `lib/admin/data.ts`, `lib/supabase/auth.ts`,
> `lib/supabase/server.ts`, `(portal)/admin/layout.tsx`,
> `(portal)/admin/actions.ts`, `(portal)/login/actions.ts`, `middleware.ts` and
> both migrations — **all byte-identical**. Every field name `saveAgent` /
> `setAgentActive` read (`id, locale, name, email, phone, state, heard, stage,
> licensed, active`) is still present with the same name; the agent form's
> `action={formAction}` / `action={setAgentActive}` wiring is untouched. No
> query, guard, RLS policy or role check changed.
> **MAPPING.** **Leads = card + selector + detail + stat row** — 8 fields is the
> "pick one, read it" shape and it was forcing a horizontal scroller; read-only,
> so the split adds no write surface. **Agents = plain table in the card + stat
> row** — its create/edit form already owns the right-hand pane and two editors
> would compete. **Content = plain table, no stat row** — 4 read-only columns,
> nothing to detail.
> **🟡 STAT CARDS ARE DATASET-SCOPED ON PURPOSE.** The reference's are
> DETAIL-scoped (the selected station's tide events). Ours are totals, approved
> as a deliberate divergence because it is the more useful read for an admin
> opening the page. **Do not "fix" this back toward the reference.** Every figure
> is a `.filter().length` over rows the page already holds — no new query.
> Deliberately absent: conversion/close rate (no outcome timestamps) and any
> week-over-week delta (no historical snapshot).
> **🔴 THE PROGRESSION RAIL SHOWS POSITION, NOT HISTORY, AND THAT IS THE WHOLE
> POINT.** We store ONE value per record (`leads.status`, `agents.stage`) and no
> history table — no `status_changed_at`, no audit trail. A rail that filled
> earlier steps as "done" would assert events we have no evidence for. So only
> the CURRENT step is filled; earlier steps are hairline OUTLINES; the legend
> says so in words. **Verified by rendering all five cases, not by reasoning:**
> `new` → CURRENT/inert/inert/inert · `closed` (never contacted) →
> outline/outline/outline/CURRENT · agent stalled at `meet` →
> outline/CURRENT/inert/inert (no invented "overdue" styling — we have no
> timestamps to justify one) · `null` → all inert + "Unrecognised value" chip ·
> off-sequence `"lost"` → all inert + **"Unrecognised value: lost"**, printing
> the raw value. It fails VISIBLE rather than silently rendering step 1.
> **MONO: IBM Plex Mono 400/500**, mounted on the **`(portal)` layout with
> `preload: false`**, NOT the root layout — the admin is staff-only and noindex,
> so no public page pays for a fourth webfont. `font-mono` falls back to a system
> stack anywhere else. Tailwind gains `mono`.
> **AA — 22 text pairs, ZERO failures**, computed over the exact class pairs in
> the source: card title 17.4 · meta/labels ink70-on-white **6.41** · selector
> idle name 15.88, sub-label **6.15**, value gold-deep **5.16** · ACTIVE-on-navy
> name **15.87**, sub-label **10.46**, value gold-pale **13.31** · detail heading
> 17.4 · rail current label 15.88 · field value 17.4 · stat value 15.88 · table
> head 6.15 · table cell 17.4. Dots and hairline accents at gold-deep/80:
> **3.71** on white, **3.48** on cream — clearing 3:1, not exempted.
> ✅ **THE RAIL'S INERT BAR WAS RAISED — all three states now clear 3:1.** It
> shipped briefly at `ink/15` (**1.36**) on a decorative exemption; that was
> rejected on instruction. Raising it to `ink/50` (**3.27**) put it a hair from
> `passed` (gold-deep/80, **3.48**), which would have traded a 1.4.11 problem for
> a **1.4.1 one** — two states separated by hue alone. So the inert bar is also
> **half height**: weight carries the difference, colour reinforces it, and the
> step label (ink/70 → ink) is a third, textual cue. Final:
> current navy **15.87** full-height · passed gold-deep/80 **3.48** full-height ·
> inert ink/50 **3.27** half-height. **Change these three together or not at
> all.**
> 🟡 **ONE ITEM REMAINS AT 1.36, DOCUMENTED:** the card/table hairline `ink/15`.
> It is the pre-existing repo convention `DataTable` has always shipped, and it
> is a container boundary, not state — raising it would restyle every table on
> the site, well beyond this brief.
> **CHROME RESTYLED TOO (2026-08-02, f):** `AdminShell` (mono uppercase nav
> labels, letterspaced `SYNERGY` wordmark, mono user block and sign-out) and
> `/login` (the form now sits in the same `rounded-2xl` white card with a mono
> meta label + divider; new key `login.metaLabel`). **18 more pairs measured,
> zero failures** — shell nav cream-on-navy 15.87 · wordmark gold-on-navy 7.61 ·
> user role 6.15 · login left meta cream/70-on-navy 8.26 · login card meta 6.41 ·
> denied notice 15.05 · mobile back-link 5.65.
> **🔴 `LoginForm` WAS NOT TOUCHED** — its floating-label mechanic depends on
> `peer-placeholder-shown` and a `placeholder=" "` on every input (both hooks
> verified still present). Restyling those classes is how you silently break the
> labels. **The nine guarded data-path files were re-hashed after this pass and
> are still byte-identical.**
> ⚠️ **AA was computed from the source pairs, not sampled from a live render** —
> `/admin` needs a session this environment has none of, and a temporary public
> harness route resolved only intermittently in dev. Contrast is a pure function
> of two colours, and the pairs were enumerated by grepping the components rather
> than by eye, but a human should still eyeball it once signed in.
>
> 🔴 **(2026-08-02, d) — THE ENGINE: FULL-WIDTH BY SPACING, NOTHING
> SCALED.** The diagram now spans the whole content width by MOVING THE ELEMENTS
> APART and lengthening the lines. **Nothing grew.** Carriers went **3 columns →
> 2**, hard against the left edge; cards keep their width at the right edge; the
> hub is on the container's TRUE centre; the lines stretch to bridge the gaps.
> **🔴 EVERYTHING IS IN REAL PIXELS NOW, AND IT HAD TO BE.** Chips and rings were
> sized as PERCENTAGES of the stage, so widening the container would have scaled
> them — the one thing this pass forbids. They are fixed px (chip **100×34**,
> rings **149 / 110**, bloom **224**, logo **78** — all the sizes they already
> were). Fixed-px chips against viewBox-unit paths would then drift apart, so the
> SVG's **viewBox is the container's measured pixel box** and paths are authored
> in px. One coordinate system, cannot desync. This also RETIRES the old
> `preserveAspectRatio="none"` hack and the `vector-effect` corrections — 1 user
> unit is now 1 CSS px.
> **🔴 A BARE ResizeObserver RENDERED THE DIAGRAM EMPTY — DO NOT REINTRODUCE
> ONE.** The first build measured only via RO. In the preview browser a fresh RO
> attached to a visible **1164×755** node never fired a single callback
> (`__roFired` stayed `"pending"`), so `ready` stayed false and **no path, chip
> or viewBox was ever emitted**. The load-bearing measurement is now a direct
> `getBoundingClientRect()` on mount; the `resize` listener, `document.fonts.ready`
> (card height drives this box and shifts when the display face swaps in) and the
> RO are top-ups only.
> **MEASURED AT 1536** (content width 1164): viewBox `0 0 1164 756.9` · chips
> **100×34** at col0 **x=0** and col1 **x=114**, carriers' right edge **214** ·
> hub centre **582** (exact 50%) · rings **224/110/149** · cards **x=770, w=394**
> · 24 static tracks + 24 travelling dashes. **Line arc lengths: left
> 293.5–524.1px** (was ~293–407 horizontal span; the arc is longer than the span
> because of the vertical curve), **out-lines 275.5 / 97.5 / 275.5**.
> 🟡 **THE RIGHT SIDE IS INHERENTLY SHORT and that is geometry, not an oversight:**
> hub centred at 582 plus 394px of cards leaves ~114px of gap. If balance is
> wanted later the only levers are a narrower card column or an off-centre hub —
> both were excluded by the brief.
> **COLLAPSE:** the diagram is `display:none` below **lg (1024)**, so the
> two-column grid never applies on a phone and cannot overflow. 768 and 390 both
> render the carriers as a wrapped text list (all 21, no "+N more") with the
> cards stacked beneath — 768: cards 697 wide, section 1037; 390: cards 350,
> section 1495. **No horizontal overflow at any width** (1521/1536, 753/768,
> **390/390**, zero overflowing elements). **h1 = 1** at all three.
> **AA — every row passes, no exemptions.** Unchanged from (c): eyebrow 5.16 · h2
> 15.88 · sub 8.66 · chip 17.4 · kicker 5.35 · card h3 16.47 · card body 8.86 ·
> numeral 5.35 · lines + dash **5.16** · card rules 3.71 · halo 3.48.
> ✅ **The travelling highlight still never reaches card text** — dash reach
> **937**, card text at **957.5** → **20.5px clear** (and 11.4px clear of the card
> box). Tighter than the previous 50.8 only because the out-lines deliberately
> run closer to the cards now.
> **Unchanged:** cream surface, passport cards, centre logo, the moving-dash
> mechanic and its timings, Synergy-outward on the right, reduced-motion (dashes
> not rendered; static lines stand still), zero hardcoded strings.
>
> 🔴 **(2026-08-02, c) — THE ENGINE: TRAVELLING HIGHLIGHT (replaces the
> line-draw). The (b) entry below described the WRONG MECHANIC and is corrected
> here.** The lines do **NOT** animate. They are **static, thin, always present**
> — the track. What moves is a **short bright segment sliding ALONG** each fixed
> path. `engine-draw` is gone; `.engine-line` is now inert (dasharray none,
> dashoffset 0) and a **second path per line** carries the highlight.
> **MECHANIC:** highlight path has `pathLength="1"` +
> `stroke-dasharray: 0.05 0.95`, so the pattern PERIOD EQUALS THE WHOLE PATH and
> **exactly one 5%-long dash exists on a line at a time**; `stroke-dashoffset`
> 0 → −1 slides it one full traverse and wraps seamlessly. Nothing measured in
> JS. Drawn AFTER the tracks so the highlight always sits on top.
> **🔴 WHERE EACH NUMBER CAME FROM — the client's reference could NOT be
> measured.** `neuform.ai/community/74e23c51…` returns **"LOGIN REQUIRED"**; I
> did not authenticate and did not attempt to. So:
> · **dash length 5%** is measured off a **SCREENSHOT** the client supplied —
> bright segments run ~45–50px against paths spanning ~1060px (**4.2–4.7%**). An
> earlier draft used 12%, which reads as a comet streak, not the tight bead the
> reference shows. **The diamonds dotted along its paths are STATIC waypoint
> markers, not the moving part** — do not rebuild them as motion.
> · **traverse 5.2s linear** and the **1100ms right-hand stagger** are measured
> from checkmatefinancialgroup.com, which uses the identical mechanic
> (`.ep-pulse` 5.2s linear infinite; `.ep-out` dasharray 7,11).
> · **left stagger = CYCLE / 21 ≈ 248ms**, applied in COLUMN-MAJOR order, so all
> 21 highlights sit at different phases (measured 0s → 4.952s across the 5.2s
> cycle) and the diagram **shimmers continuously instead of pulsing in unison**.
> Checkmate spreads 6 highlights over ~0.82 of its cycle — same principle, scaled.
> · **fades in (8%) and out (12%)** rather than popping, matching the reference's
> `opacity: 0` base state.
> · **glow** `drop-shadow(0 0 3px rgba(201,168,76,.75))` — gold. Theirs is
> rgba(216,205,173,.8) at 4px on a DARK surface; on cream a highlight gains
> presence by getting **denser and wider** (2.5px vs the 1px track), not lighter.
> **DIRECTION unchanged:** left highlights run chip → hub, right run hub → card,
> each following its own path's authored direction.
> **✅ THE HIGHLIGHT NEVER REACHES CARD TEXT — measured, this was the explicit
> ask.** Dash max right **901.5px**, +3px glow +1.5px half-stroke =
> **906**; the cards column starts at **948** and the leftmost card text at
> **956.8** → **42px clear of the card box, 50.8px clear of the text**. The SVG
> does not overlap the cards column at all. AA is unaffected: the lines are
> decorative and every text ratio is unchanged from the (b) entry.
> **REDUCED MOTION:** the highlight paths are **NOT RENDERED** by the component,
> and the CSS additionally forces `display: none` on `.engine-dash` — so the
> static lines simply stand still, fully visible, no travelling dash, no stagger.
> **Unchanged this pass:** layout, passport cards, centre logo, the scaled-up
> stage (729.6×755.1 at 1536), zero dead space, `preserveAspectRatio="none"`.
> 390: 390/390, zero overflowing elements, 21 chips, 3 cards, **h1 = 1**.
>
> 🔴 **(2026-08-02, b) — THE ENGINE: LINE-DRAW MOTION + SCALED UP.** ⚠️ **The
> motion described in this entry was REPLACED — see (c) above. The scale, seam
> and AA findings below all still stand.**
> The particles are **GONE** and replaced by a **looping LINE DRAW** — the lines
> animate into existence rather than sitting static with something running along
> them. Mechanic: `pathLength="1"` normalises every path to a unit length so one
> `stroke-dasharray: 1` serves all 24 and **nothing is measured in JS**;
> `stroke-dashoffset` runs 1 to 0. `@keyframes engine-draw` + `.engine-line` are
> at the END of `globals.css`.
> **LOOP, NOT SCROLL-SCRUB — a decision, not a default.** Lenis owns this page
> and suppresses native scroll events (WhySynergy documents the rAF workaround a
> scrub would need); a scrub **reverses on scroll-up**, which destroys "one
> continuous flow"; and it only ever completes if the reader scrolls the whole
> section. Cycle **5600ms**, phases draw 4–38% / hold 38–86% / fade 86–100% —
> **the fade is what hides the reset**, the line snaps back to undrawn while
> already transparent.
> **SEQUENCE:** left lines stagger **COLUMN-MAJOR** (far-left column first) at
> 62ms so the sweep enters from the left edge; right lines start at **1400ms**,
> 300ms apart; cards land at 1500ms + 300ms. One left-to-right flow per cycle.
> **🔴 DIRECTION REVERSED ON THE LEFT, ON INSTRUCTION — this undoes an earlier
> decision and the reasoning is recorded so it is not silently re-flipped.**
> Left lines are now authored **CHIP → HUB** (they arrive); right lines stay
> **HUB → CARD**. A previous pass ran BOTH outward because carrier-to-hub motion
> can read as the carriers funding the brokerage, which is false — Synergy is an
> independent broker. The adopted reading is different and defensible: the market
> is surveyed on the left, Synergy is the hub it passes through, and what reaches
> the reader leaves on the right. **Synergy-outward is preserved where it carries
> the claim — the right-hand side.** Reversing again = swap the two endpoints in
> `inPaths` and flip the stagger order.
> **SCALED UP — dead space is now ZERO.** The stage no longer holds a fixed 3:2
> box or `self-center`; it **stretches to the row height** (`lg:items-stretch`)
> and the left column widened to `1.85fr`. Measured at 1536: stage **678.4×452.2
> → 729.6×755.1** (+7.5% wide, **+67% tall**), grid `729.6 / 394.4`, gap 40,
> **dead space above 0, below 0** (was 98.5/98.5). Columns pushed to `COL_X[0]=8`
> and output lines reach `x=892` so the diagram spans the column edge to edge.
> **🔴 `preserveAspectRatio="none"` IS LOAD-BEARING.** Once the box stopped
> matching the viewBox's proportions, only a non-uniform map keeps the HTML chips
> (positioned as % of the container) aligned with the SVG line endpoints —
> verified: chip right edge **14.66%** against an expected **14.67%**. It costs
> two things, both handled: `vector-effect="non-scaling-stroke"` stops strokes
> thickening on one axis, and **the halo rings are HTML circles, not SVG ones**,
> so they cannot be squashed into ellipses.
> **A BUG FOUND BY MEASURING:** the dashed halo ring sat **+23.9px off centre**
> (cx 526.6 vs 502.7) because an `animation` that sets `transform` REPLACES the
> Tailwind `-translate-x-1/2 -translate-y-1/2` centring, and the old
> `transform-origin: 620px 300px` was SVG user units applied to a DOM node. The
> keyframe now restates the translate and the origin is `center`; all three rings
> and the logo are concentric at (502.7, 377.6).
> **AA — EVERY ROW PASSES, no exemptions claimed.** All 24 lines are now FULL
> gold-deep **5.16:1** (the left lines were ink@0.22 = 1.59 and decorative; they
> are gold and above the bar now). Text worst-case ON a guilloché stripe:
> eyebrow **5.16** · h2 **15.88** · sub **8.66** · chip **17.4** · kicker
> **5.35** · card h3 **16.47** · card body **8.86** · numeral **5.35**. Rules at
> 0.80: **3.71** white / **3.57** stripe / **3.48** cream.
> **DIMENSIONS:** 1536 — section 1186 tall, stage 729.6×755.1, cards 394.4 wide.
> 768 — stage `display:none`, cards 696.8×611, section 1034, pad 40/28.
> 390 — stage hidden, 21 chips listed in full, cards 350.4 wide, section 1490,
> h2 30px. **No horizontal overflow at any width** (1521/1536, 753/768,
> **390/390**, zero overflowing elements). **h1 = 1** at all three.
> **REDUCED MOTION:** the `.engine-line` class is not applied at all, so lines
> render **fully drawn and connected** — no draw, no travel, no stagger — the
> ring does not spin and the cards render in place. Enforced in the component AND
> in CSS.
> 🟡 **The reference could not be verified.** "Quantum Core Diagnostics" was
> given without a URL and a web search surfaces no such dashboard; the mechanic
> was built from the written description, which specified it fully. Do not record
> this as a measured study of that site — it was not one.
>
> 🔴 **(2026-08-02, a) — THE ENGINE: MOTION, HALO, PASSPORT CARDS, MOVED.**
> **🔴 A CORRECTION TO THE 2026-08-01 ENTRY BELOW.** It recorded that their
> input lines "are NOT animated at all". **That was wrong** — it was true of
> their `<path>` elements and wrong about the section. Re-measured: **9
> `.ep-pulse` `<circle>` particles** ride the lines via CSS
> `offset-path: path(<the line's own d>)`, animating `offset-distance` 0→100%,
> **5.2s linear infinite**, base `opacity:0` so a keyframe envelope fades them in
> and out. Only **6 of their 21** input lines carry one (sparse reads as alive;
> one per line reads as noise), stagger **0.85s**; 3 more ride the output lines
> at ~1.1s stagger, r=4 vs 3.5. Two hub rings: solid **r=68**, dashed **r=92**
> (dasharray 3,9) spinning **60s**. And their **cards surface one at a time
> because each owns its own IntersectionObserver** — sequencing by SCROLL
> POSITION, not a timed stagger (every card measures `transition-delay: 0s`).
> **OURS — mechanics taken, look rejected.** Same `offset-path` mechanic;
> everything else diverges. **10 particles** (7 in, one per grid ROW, + 3 out),
> `engine-travel` **4.4s linear infinite**, in-stagger **620ms**, out-stagger
> **1100ms**, all in **gold-deep #7D641F** on cream with a gold bloom at the hub.
> **Every particle travels OUTWARD from the hub** (hub→carrier, hub→card) —
> theirs runs carrier→hub, which is the "carriers fund the broker" reading we
> refuse. Cards use a **timed stagger keyed to particle arrival** (1.16 / 1.42 /
> 1.68s) because at desktop all three are on screen at once and per-card
> observers would fire together. Keyframes + `.engine-pulse` / `.engine-ring-dash`
> / `.passport-guilloche` live at the END of `globals.css`.
> **HALO:** solid inner ring r=68 + dashed outer ring r=92 spinning 60s, both
> gold-deep@0.80, plus a `radialGradient` gold bloom. **r=92 is exactly where
> every line terminates** (620−528 = 712−620 = 92) — structure, not decoration.
> **PASSPORT CARDS:** gold-deep@0.80 border, corner ticks, a ruled header with a
> **−6° stamped roman numeral** in a bordered box, `engine.cardKicker` micro-label
> at 0.18em, and `.passport-guilloche` security texture (`repeating-linear-gradient`
> 45°, ink **0.028**). Measured, the texture moves the composited background under
> body text from #FFFFFF to **#F9F9F9** — costs the body ratio 0.31 (9.17 → 8.86)
> and everything still clears. Theirs are plain rounded rectangles holding a
> carrier logo and a `<dl>` of premium figures — a search result. Different genre.
> **🔴 AA — ALL GOLD-DEEP RULES RAISED TO ALPHA 0.80.** The first build shipped
> them at 0.45 / 0.25 / 0.55 / 0.60, which measured **1.95 / 1.42 / 2.23 / 2.53**
> — below the 3:1 bar and **inconsistent with the output lines strengthened on
> §6c grounds one pass earlier**. Minimum alpha for 3:1 is **0.73**; 0.80 gives
> **3.48 cream / 3.57 stripe / 3.71 white**. A faint inset second rule was
> **dropped** rather than shipped as the one hairline that could not clear.
> Text, worst case ON a guilloché stripe: eyebrow **5.16** · h2 **15.88** · sub
> **8.66** · chip **17.4** · kicker **5.35** · card h3 **16.47** · card body
> **8.86** · numeral **5.35** — all pass. Particles and output lines **5.16**.
> Input lines stay ink@0.22 (**1.59**) as documented decorative filigree.
> **🔴 MOVED to directly under `WhoWeServe`** (was position 2). New order: Hero →
> WhatWeCover → WhoWeServe → **TheEngine** → Testimonials → HowItWorks →
> Consultation. **All six seams measure 0px gap at 1536/768/390** and there is no
> horizontal overflow anywhere (1521/1536, 753/768, **390/390**, zero
> overflowing elements). **TWO COSTS, BOTH MEASURED, NEITHER SILENTLY ACCEPTED:**
> 🟡 **(1) The vacated slot is now Hero → WhatWeCover, and both are navy
> `#0D1B2A`** — verified `darkMeetsDark: true`, separated only by the hero's own
> **12px** bottom padding, so a 12px cream hairline now sits between two dark
> full-bleed sections. Before the move the Engine's cream absorbed that padding.
> **The cheapest fix is to restore `CarrierStrip` into that slot** — it is
> commented out in `(site)/page.tsx`, one import + one line, and the original
> objection (two carrier treatments adjacent) no longer applies now that the two
> are separated by WhatWeCover and WhoWeServe. **Not done unasked.**
> 🟡 **(2) `WhoWeServe → TheEngine` is now cream-on-cream** (`sameSurface: true`),
> cushion **135.1px** at 1536 / 80px at 768 and 390. The Engine's top padding was
> already cut from `clamp(40,6.9vw,106)` to `clamp(40,5.2vw,80)` to absorb this.
> 135px is within the About page's documented **130.8** section rhythm (§6c), so
> it is defensible as whitespace-as-separator — but the boundary between those
> two sections is now invisible, which is a design choice worth confirming.
>
> 🔴 **(2026-08-01) — THE ENGINE, AND TWO SECTIONS FOLDED INTO IT.**
> New homepage section `components/TheEngine.tsx` at **position 2**, modelled on
> checkmatefinancialgroup.com's "engine" section, MEASURED LIVE and rebuilt in
> our tokens. Full study + geometry in **§14**.
> **🔴 THE CARRIER COUNT IS 21 AND THE "12" IN THIS FILE WAS STALE.** The
> homepage table said *"12 carrier names"* — written before the 2026-07-30 entry
> that added *"the 9 formerly held-back carriers, now confirmed (Ziad is
> contracted with all)."* 12 + 9 = **21**, and all three sources agree:
> `carriers.names` (c1–c21), `lib/carrierLogos.ts` (21 files), `Carriers.tsx`
> `APPOINTMENTS` (21). The line is corrected. **The grid is DATA-DRIVEN off
> APPOINTMENTS** — 3 columns × ceil(N/3) rows — so it renders one chip per real
> relationship and can never harden into a claim. Add a carrier there and the
> diagram follows; nothing is padded and no phantom marks exist.
> **🔴 COPY: NOTHING FROM CHECKMATE. THIS WAS THE WHOLE RISK.** Their section is
> built on *"our AI reads 40+ A-rated carriers"* — an AI product Synergy does not
> have, **"A-rated" (a BANNED claim, Standing Rule 6)**, and an unverified volume
> claim; their three cards publish **premium figures, timing and underwriting
> claims** Synergy publishes nowhere. **All of it was refused, not reworded** —
> rewording would have been a fabrication about the client's business, a worse
> failure than the lifted-copy one. Every string is Synergy's own and already
> approved: eyebrow/heading/sub = `carriers.eyebrow`/`.headline`/`.subhead`
> (these were ORPHANED — the full `Carriers` section is stashed and only
> `APPOINTMENTS` was still imported); chips = `carriers.names.*`; the three cards
> = `whySynergy.rows.r1/r2/r3`, **also orphaned** (their eight-row zig-zag was
> superseded inside `WhySynergy.tsx` long ago). Only two new strings exist, both
> interface labels under Rule 4: `engine.diagramLabel`, `engine.cardsLabel`.
> **🔴 DIRECTION INVERTED ON PURPOSE.** Theirs reads carriers → hub, which would
> say the carriers feed or fund the brokerage. Synergy is an **independent
> broker**: it reaches out and shops carriers, nobody owns it. Our lines are
> authored **core → carrier** and the draw travels **outward from Synergy**.
> Their throughput readout ("reading 40+ carriers") is dropped entirely — a flow
> cue whose copy is banned here anyway.
> **TWO SECTIONS RETIRED INTO IT, commented out NOT deleted, both restorable by
> uncommenting one import + one line in `(site)/page.tsx`:**
> `CarrierStrip` (rendered the SAME 21 carriers — shipping both adjacent said
> "21 carriers" twice in one screen) and `WhySynergy` (rendered
> `points.p1–p4`; **p1/p2/p3 are the SAME three arguments** as `rows.r1/r2/r3`,
> so this removed a duplication rather than losing content).
> 🟡 **ONE CASUALTY, LOGGED:** `whySynergy.points.p4` — *"ITIN-friendly, licensed
> in all fifty states"* — has no equivalent among r1–r3 and now renders nowhere
> on the homepage. **ITIN is a real Synergy differentiator** (their meta
> description, their FAQ, three blog articles). `whySynergy.rows.r4`
> (*"ITIN-Friendly, No SSN Required"*) is approved and unused, so the fix is a
> **fourth card**: one entry in `CARD_KEYS` + one more `OUT_Y` anchor. Flagged
> for a decision, not done unasked.
> **🔴 `Carriers.tsx` MUST STAY** even though its section is stashed — `TheEngine`
> imports `APPOINTMENTS` from it. Deleting it breaks the homepage.
> **MEASURED AFTER BUILD (1536):** grid `678.35 / 437.65` (theirs 666.19/429.80),
> stage 3:2, section pad `104.9 / 53` (theirs 106.47/53.235), head 720 wide.
> **Seams: ALL SIX are 0px** — no gap, no stack — and the cream/dark alternation
> is now clean: Hero(dark) → **Engine(cream)** → WhatWeCover(dark) →
> WhoWeServe(cream) → Testimonials(dark) → HowItWorks(cream) →
> Consultation(dark). The Engine took the strip's slot precisely because the
> strip was the **only cream breather between two full-bleed dark/photo
> sections**; deleting it without a cream replacement would have butted them.
> **390: `documentElement.scrollWidth` 390 = 390, ZERO overflowing elements.**
> One h1 site-rule intact: **h1 = 1** (Hero); the Engine is h2 + three h3.
> **THREE DEFECTS FOUND BY MEASURING, NOT BY EYE — all fixed, all documented in
> the component:** (1) `1.55fr 1fr` blew out to **973.85 / 143.4px** because grid
> items default to `min-width:auto` — fixed with `minmax(0,…)`; (2) chips drawn as
> SVG `<text>` rendered at **9.8 CSS px** (worse at narrower widths) and
> *"National Life Group"* **overflowed its chip** (111.6 vs 108 usable) — chips
> are now **HTML**, 11px, wrapping rather than truncating (a carrier name is a
> factual brand; an ellipsis in one is a defect); (3) **197px of dead space**
> below the stage — `lg:self-center` splits it 98.5/98.5 and puts the hub
> **11.6px** off the middle card's centre.
> **AA, worst pixel, composited:** eyebrow gold-deep **5.16** · h2 ink **15.88** ·
> sub ink/80 **8.66** · chip label **15.88** · numeral gold-deep on white **5.65**
> · card h3 **17.4** · card body **9.17** — all clear. Output lines were
> strengthened from alpha 0.55 (**2.23**, sub-3:1) to **full gold-deep 5.16**,
> because §6c is the precedent for not shipping decoration you would have to
> defend; the 21 input lines stay ink@0.22 (1.59) as genuine filigree, since the
> relationship they draw is stated in text by the heading, sub and chips.
> **MOTION:** the draw IS the outward pulse — `pathLength={1}` + dashoffset 1→0,
> 900ms `cubic-bezier(.22,1,.36,1)`, 40ms stagger, fired once by an
> IntersectionObserver (autoplay-on-enter, **not** scrubbed). At rest every path
> is connected (verified `strokeDashoffset: 0px` on all 24).
> **Under `prefers-reduced-motion: reduce` the observer is never armed, `drawn`
> starts true and every transition is `none` — lines render CONNECTED, no draw.**
> 🔴 **A FINDING THAT CONTRADICTS THE BRIEF AND SHOULD SURVIVE:** their 21 input
> lines are **NOT animated at all** — static 1px strokes, no draw, no stagger, not
> scrubbed. The only motion in their section is a marching dash on the three
> OUTPUT lines (dasharray 7,11 · `stroke-dashoffset:-18px` · 1.6s linear
> infinite) plus a 0.55s card reveal with **no** stagger. Anyone "restoring" a
> scrubbed line-draw is adding something the reference never had.
>
> 🔴 **NEWEST (2026-07-31) — ADMIN CRUD, PHASE 3: THE PANEL IS ON REAL DATA.**
> The admin dashboard no longer renders mock rows. `lib/adminMock.ts` is
> **DELETED** (as its own docblock promised). What replaced it:
> **SCHEMA — `supabase/migrations/0002_crm.sql`** adds two tables. Run it AFTER
> `0001` (it uses `public.current_app_role()`). **`leads`** — admin **SELECT
> only** (only a select policy exists; no insert/update/delete). Rows arrive
> server-side from the lead intake (the GHL webhook, still blocked) using the
> SECRET key, which bypasses RLS; **the table is empty until that lands, shown
> with an honest empty state.** **`agents`** — admin SELECT/INSERT/UPDATE and a
> `touch_updated_at` trigger; **NO delete policy** — "removing" an agent sets
> `active=false` so history survives. Enums: `lead_source`, `lead_status`,
> `agent_stage`, `agent_heard`.
> **AGENTS ARE PIPELINE RECORDS, NOT PORTAL LOGINS.** A row in `agents` is a
> recruiting-CRM entry the admin manages. Giving an agent a *login* is still the
> separate manual `auth.users` + `profiles` path from phase 2. Creating those
> logins is on the client checklist, not automated (no public signup).
> **CONTENT IS NOT A TABLE.** The Content view is a **read-only reflection of the
> repo** — `lib/admin/data.ts` `getContent()` reads `lib/blog.ts` (articles on
> disk) + the built static pages. A working "Edit" would mean writing MDX to disk
> or moving content into the DB — a real data path deliberately **not faked** as
> a dead button. Flagged, not shipped.
> **WRITES.** `app/(portal)/admin/actions.ts` — `saveAgent` (create/update),
> `setAgentActive` (deactivate/reactivate). **Every mutation calls
> `requireAdmin()` FIRST** (`lib/supabase/auth.ts`) and writes through the
> RLS-scoped client, so the DB policies are the authoritative backstop — a hidden
> button is not the control. UI is `components/admin/AgentsManager.tsx`; reads run
> RLS-scoped in `lib/admin/data.ts` with honest ok/error results (empty-because-
> empty ≠ empty-because-error). `DataTable` gained an optional-`actions` mode for
> the read-only leads/content tables.
> **NEW API KEYS.** This project is on Supabase's NEW key system
> (`sb_publishable_…` / `sb_secret_…`), recognised natively by supabase-js 2.111.
> Env vars are **renamed**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (client-safe)
> and `SUPABASE_SECRET_KEY` (server-only, referenced by NO app code today). The
> build guard `scripts/check-no-service-role.mjs` (a `postbuild` step) now also
> catches an `sb_secret_` value in any client bundle.
> **PROVEN, not asserted (this replaced review):** RLS verified by running BOTH
> migrations against real Postgres (PGlite) — agent denied every admin mutation,
> anon denied all admin data, every policy active, admin CRUD works, hard delete
> denied, deactivate works. Client bundle grepped: **0** secret matches. Guard
> demonstrated firing on a planted leak, green when clean.
> **STILL BLOCKED:** the GHL webhook (lead intake) — until it lands, `leads` has
> no write path and stays empty by design.
>
> 🔴 **NEWEST (2026-07-30, 6) — RECORD-CORRECTIONS + TWO ITEMS CLOSED.**
> Two "blocked on client" items were STALE and one wasn't:
> ✅ **CARRIER LOGOS — About grid now real artwork.** The 21 files landed some
> time ago; the homepage marquee had been wired but the About §2b grid was still
> typeset names. Fixed 2026-07-30: `<span>` → `<img>` in the same cell, sourcing
> from a new `lib/carrierLogos.ts` shared with CarrierStrip. Measured on the
> real 190.9px cell at `h-12`: corebridge **+24.8%**, athene **+11.5%**, global
> **+25.0%** at 2× DPR; the two SVGs are vector. Nothing upscaled. 390 clean.
> 🟡 One artwork caveat, pre-existing: `athene.png` is white-on-solid-navy so it
> reads as a dark box on cream (same on the strip). Transparent-background file
> needed from the carrier; do not edit the trademark.
> **`h-[131px]` is NOT coming back.** Measured, it caps on width and needs a
> 382px source; corebridge (367) and athene (368) fall −3.9% / −3.6% SHORT.
> ✅ **TESTIMONIALS DISCLAIMER DELETED — SLOT, STRING AND FLAG.** These are
> staff statements, not client results claims, so there is nothing to disclaim.
> Removed from BOTH message files, the cols 10-12 markup is gone, and the old
> two-purpose flag was **renamed** `TESTIMONIAL_EYEBROW_READY` because the
> eyebrow (a separate open item with its own placeholder) still stays gated.
> **Off the client list — do not re-request the disclaimer.**
> ❌ **FOUNDER §8 stays blocked (accurate).** Verified: `about.founder.*` absent
> from en.json; `public/synergy/founder-portrait.jpg` does not exist. The three
> real Rula frames are already on /about §5 (and on /join), so borrowing would
> repeat a face on one page. Ziad still owes bio copy + a portrait not already
> in use.
> ❌ **GHL WEBHOOK stays blocked (accurate).** No `.env` file, no `app/api`
> directory, no `process.env` reference except `NEXT_DIST_DIR`. When an endpoint
> arrives, two more items are stacked behind the same door: SMS/call consent
> wording and a privacy policy.
> **CLIENT LIST NOW:** founder bio + portrait · GHL endpoint · SMS/call consent
> wording · privacy policy & terms · "$0 startup cost" cost claim · tax-treatment
> answer blocking three blog articles · high-res office/team camera files ·
> transparent-background athene.png. **Results disclaimer is REMOVED from this
> list.**
>
> 🔴 **NEWEST (2026-07-30, 5) — SITE-WIDE CTA AUDIT + THE ONE PAIR.**
> **✅ ZERO DEAD CTAs. Record this and stop re-reporting it.** A full sweep of
> every button and link on all eight public pages found **no** dead control: every
> CTA either resolves, or is visibly disabled with a notice (ContactForm,
> JoinApplyForm, LeadModal, the /join "Agent portal" button). **The earlier claim
> that stubs remained was reading COMMENTED-OUT code and RETIRED components** —
> every surviving `href="#"` in the repo is inside a `/* */` block, or in
> `components/Nav.tsx` (superseded by SiteHeader, imported nowhere) or
> `components/TwoWaysIn.tsx` (removed from the homepage). Verified on the served
> HTML: `href="#"` count is **0** on all eight routes. Grep the RENDERED output,
> not the source, before ever claiming a stub again.
> **THE PAIR.** Every primary conversion moment now renders `components/CtaPair.tsx`
> and nothing else: PRIMARY "Get a free quote" → /contact, SECONDARY
> "Call 407-434-0400" → `tel:+14074340400`. The secondary is a phone call because
> **both forms on this site are disabled**, so the phone is the only channel that
> reaches a human — a second link to /contact would be decoration. Placed on: the
> homepage hero, WhatWeCover, /services closing, /about §4. **WhySynergy stays a
> single CTA** (argument section, not a conversion point) and the WhoWeServe cards
> and /join §6 are untouched by design.
> **🔴 "Talk to an advisor" IS RETIRED SITE-WIDE.** It rendered twice under one
> label pointing at **two different destinations** (`tel:` in the hero, `/contact`
> in WhatWeCover). `hero.ctaCall` and `whatWeCover.ctaSecondary` are RETAINED
> UNTOUCHED in both message files, simply unrendered. Verified 0 rendered
> occurrences site-wide.
> **LeadModal is unhooked but NOT deleted.** Its only trigger was the calculator
> CTA, which now goes to /contact; the import, the `modalOpen` state and the
> `<LeadModal>` mount are all commented in `Calculator.tsx` with a restore note,
> and `LeadModal.tsx` is untouched. Re-wire it when the GHL webhook lands.
> **Labels live in a shared `cta` namespace** (`cta.quote` / `cta.call` /
> `cta.callAria`) rather than duplicated per-namespace — one edit keeps every pair
> in step. Mirrored empty in es.json per §6e.
> **MEASURED:** hero pair (over the photograph) **17.39:1 both buttons** — the
> fills are OPAQUE on purpose so contrast never depends on the crop behind them;
> cream pair primary **15.87:1**, secondary text **15.87:1**, its border **6.19:1**
> vs cream (3.0 bar). Keyboard: both reachable in order, real `:focus-visible`
> rings at **5.16:1**. 390px: `scrollWidth` 390 = clientWidth, zero sideways
> scroll, on every changed page. `/join` "Join as agent" re-verified — it scrolls
> to a real `#join-apply-heading` via Lenis with a `scrollIntoView` fallback.
> 🟡 `/login` EXISTS NOW but stays UNLINKED until auth ships — the /join "Agent
> portal" button remains a disabled `<button>`, not a link.
>
> 🔴 **NEWEST (2026-07-30, 4) — ADMIN + AGENT PORTAL, PHASE 1: DESIGN ONLY.**
> Two new routes, `(portal)/login` and `(portal)/admin`. **NO backend, no auth,
> no session, no Supabase, no RLS, no API route, no fetch, nothing persists.**
> Every row comes from `lib/adminMock.ts` (hardcoded; emails on `example.com`,
> phones in the reserved 555-01xx block, invented names — the content table's
> rows are real repo facts and contain no personal data). Delete that file when
> the real data layer lands; do not adapt it.
> **🔴 THE ROUTE TREE WAS RESTRUCTURED.** `[locale]/layout.tsx` is now the shared
> shell only (html/body, fonts, next-intl provider). The marketing chrome —
> Splash, SiteHeader, SmoothScroll/Lenis, Footer, LocaleSwitcher — moved to
> `[locale]/(site)/layout.tsx`, and all seven public routes moved into `(site)/`.
> **Route groups do not change URLs**; every public path is byte-identical and
> verified 200. A new public page belongs in `(site)/` — one added directly under
> `[locale]/` would render with no header or footer.
> WHY: the portal must not render inside Lenis. SmoothScroll transforms the
> scroll container and a `position: fixed` child of a transformed ancestor
> positions against that ancestor, not the viewport — the trap SiteHeader's
> mobile panel and LocaleSwitcher already document. The admin's sidebar is
> exactly that.
> **🔴 NEITHER ROUTE IS PROTECTED.** They are unlinked (`PORTAL_PATHS` in
> routes.ts is deliberately absent from HEADER_ROUTES/FOOTER_ROUTES), `noindex`
> (set on the group layout, inherited) and disallowed in the new `app/robots.ts`
> — but that is obscurity, not access control. It is survivable ONLY because
> nothing real is behind it. **Do not put a genuine lead record there until auth
> ships and is reviewed** — real leads are PII and these URLs are public.
> **🟡 KNOWN LEAK:** next-intl serialises the WHOLE message catalogue into every
> page, so `admin.*` / `login.*` strings now ship in the HTML of every public
> page (verified: "Sample data" appears in `/en`). No secrets, but it advertises
> that an admin area exists. Fix is to narrow the messages passed to
> `NextIntlClientProvider` per route group. Not done — it touches every page.
> **A11Y BUG FOUND AND FIXED IN BUILD:** the table scroller was `position:
> static`, so it was not the containing block for its abs-positioned descendants
> (`sr-only` text, the row-action popovers) — they escaped the `overflow-x:auto`
> clip and extended the DOCUMENT to 1093px against a 568px viewport (the page
> scrolled 524.8px sideways) while `body.scrollWidth` stayed 568, which is why a
> naive body check misses it. `relative` on the wrapper fixes it; 390px now
> measures 390/390, zero sideways scroll. Sort buttons use `aria-label` instead
> of a trailing `sr-only` span (also removed 7 abs-positioned nodes).
> AA all clears — gold #C9A84C is used at full strength ONLY on navy (7.61:1);
> every gold on cream is gold-deep (5.16:1), because gold on cream is 2.09:1.
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
| 2 | `TheEngine` | carrier diagram → Synergy hub → three cards | ✅ **NEW 2026-08-01** — §14 |
| — | *`CarrierStrip`* | slim marquee band, **21** carrier logos | 🔴 **RETIRED** — folded into `TheEngine`, §14 |
| 3 | `WhatWeCover` | full-bleed parallax photo, translucent cards | shipped |
| 4 | `WhoWeServe` | tabbed Families / Agents, three cards each | shipped |
| — | *`WhySynergy`* | four `points.p1–p4` cards (`id="why-heading"`) | 🔴 **RETIRED** — folded into `TheEngine`, §14 |
| 5 | `Testimonials` | full-bleed parallax photo, three quote cards | 🟡 two asides hidden — §10 |
| 6 | `HowItWorks` | three process cards on photos, glass panels | shipped |
| — | *`Calculator`* | **commented out** — moved to its own route, §9 | — |
| 7 | `Consultation` | full-bleed parallax photo, glass panel, CTA → calculator | shipped |
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
| 2b | 5-col award/press logo grid | **5 carrier LOGOS** | ✅ **DONE 2026-07-30** — real artwork, `h-12`, alt = `carriers.names.*` |
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

✅ **REAL LOGOS SINCE 2026-07-30.** The drop-in swap happened exactly as
predicted: same `<li>`, same grid, same gap, same centring — only the child
changed, `<span>` → `<img>`. Source of truth is `lib/carrierLogos.ts`, shared
with the homepage marquee, so the two surfaces cannot disagree about which mark
belongs to which carrier. `alt` is `carriers.names.*`, the same translated
string the strip uses. Logos are exempt from contrast rules (WCAG 1.4.11
excludes logotypes) and no text moved.
**Measured on the real 190.9px cell** (reference: 191.74) at `h-12`:
`corebridge` **+24.8%**, `athene` **+11.5%**, `global-atlantic` **+25.0%**;
`mutual-of-omaha` and `transamerica` are SVG. Nothing upscaled. At 390 the cell
narrows to 119px and all five still clear.
🟡 **ONE ARTWORK CAVEAT, NOT A BUG:** `athene.png` is a white wordmark on a
SOLID NAVY PLATE, so on cream it reads as a dark box among four transparent
marks (and `grayscale` makes it dark grey). Pre-existing — the homepage strip
has always had it. Fixing it means a transparent-background file from the
carrier or Ziad; do NOT edit a third-party trademark here.

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
`TESTIMONIAL_EYEBROW_READY` (was `HEADER_ASIDES_READY`), off for the same reason the lead form is disabled: **an
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
| 1 | §2b carrier cells | `h-[131px]` holding **21.9px** of type — **109.1 / 112.3 / 93.5** empty per cell | **content height**, logo `h-12` | ✅ **RESOLVED.** 131 is NOT coming back: measured on the real 190.9px cell, a 131px-tall logo caps on width and needs a 382px source — `corebridge` (367) and `athene` (368) fall **−3.9% / −3.6% SHORT**. `h-12` clears all three (+24.8 / +11.5 / +25.0%) |
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
`[PLACEHOLDER — …]` text in `messages/en.json` and were rendering on the
deployed preview.

🔴 **THE RESULTS-DISCLAIMER IS DELETED — SLOT, STRING AND FLAG (2026-07-30).**
It was held open on the assumption these are CLIENT testimonials needing a
results disclaimer. They are not: they are staff statements about how Synergy
works, they make no claim about anyone's results, so there is nothing to
disclaim. `testimonials.disclaimer` is removed from BOTH message files and the
cols 10-12 markup is gone. **It is off the client list — do not re-request it.**

**ONLY THE EYEBROW REMAINS GATED**, behind the renamed
`TESTIMONIAL_EYEBROW_READY = false` (the old name promised two asides and one no
longer exists). Its string is still `[PLACEHOLDER — awaiting approval]`.
**Restore in one step:** set it `true` and replace that one string. The heading
moves back to column 3 on its own.

### ✅ §4 pill CTA — REMOVED, and it stays removed until a page exists

Decided and shipped. See §9 for the reasoning and the restore recipe.
`about.trust.ctaLabel` ("Open the retirement calculator") is **retained
untouched** in both message files but is read by nothing. It will need
re-approving against whatever the new destination turns out to be — a label
naming a calculator cannot be reused for a story page.

### 🟡 Blocked on Ziad

- **Founder bio + portrait for About §8** — and *only* a real portrait; see §6
- **Results-disclaimer wording**
- ~~**Carrier logo files for About §2b**~~ — ✅ **DELIVERED AND WIRED 2026-07-30.** 21 files in `public/carriers/`; homepage marquee and About grid both render real artwork from `lib/carrierLogos.ts`. Was never the gap it was recorded as — the files had landed and the homepage was already wired; only the About grid was still typeset names. // stale: appointments confirmed, artwork not
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
| `components/Testimonials.tsx` | `TESTIMONIAL_EYEBROW_READY = false` | hides the **eyebrow only**. The results-disclaimer slot, its string and the old two-purpose flag are **DELETED** (2026-07-30) — these are staff statements, not client results claims, so there is nothing to disclaim |
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

