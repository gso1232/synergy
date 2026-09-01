import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /**
         * 🔴 cream IS PURE WHITE NOW. It was #F8F4EE, the warm off-white this
         * whole palette was built around, changed to #FFFFFF on instruction
         * 2026-09-01: "make the whole website pure white, not this dim white".
         *
         * THE NAME IS KEPT ON PURPOSE. Renaming it to `white` would touch 38
         * `bg-cream`, 81 `text-cream` and 11 `border-cream` call sites across
         * the codebase for zero behavioural gain, and every one of those edits
         * is a chance to typo a class into silence. The token is the single
         * place this value lives; changing it here changed every surface at
         * once, which is the whole reason it exists.
         *
         * ⚠️ CONTRAST RATIOS QUOTED IN OLDER COMMENTS ARE NOW CONSERVATIVE, NOT
         * WRONG. Roughly forty comments in app/globals.css and the components
         * cite figures measured against #F8F4EE (cream on navy 15.87:1,
         * gold-deep on cream 5.16:1, and so on). White is LIGHTER than cream,
         * so every one of those pairs now measures the same or better: ink on
         * white is 16.1:1 against 15.87, gold-deep on white 5.35 against 5.16.
         * They were left as written rather than rewritten in bulk, because a
         * forty-line find-and-replace through measured documentation is a good
         * way to introduce a number nobody checked.
         *
         * 🟡 WHAT THIS COSTS. Sections no longer separate by tone. `bg-cream`
         * and `bg-white` are now the same colour, so every white card on a
         * page surface reads by its border alone. They all have one, verified
         * across all 58 `bg-white` call sites; the two that did not are fixed
         * in this change (`.admin-skip` gained a boundary, and the Google
         * review cards already carry a hairline).
         */
        cream: "#FFFFFF",
        greige: "#ECE9E2",
        navy: "#0D1B2A",
        // Navy-lift — the TOP of the About page's continuous gradient, which
        // ends on `navy` so the footer seam disappears.
        //
        // It exists because navy and ink are luminance-identical: navy #0D1B2A
        // is L 0.0104 and ink #1A1A1A is L 0.0103. They differ in hue, not in
        // brightness, so the obvious "navy to ink" gradient descends 1.00x and
        // looks like nothing is happening. Our palette has no mid-tone between
        // greige (0.816) and navy (0.0104), so one had to be derived.
        //
        // Solved BACKWARDS from the gold constraint, not chosen by eye. Gold
        // #C9A84C (L 0.4094) as NORMAL text needs 4.5:1, which caps the
        // background at L <= 0.0521. #1C3A5A sits at L 0.0401 — the lightest
        // navy that keeps gold legal as normal text with real margin (5.10:1).
        // #204264 (L 0.0512) lands on 4.54:1, too close to ship.
        //
        // Across the full #1C3A5A -> #0D1B2A run the descent is 3.87x and gold
        // never drops below 5.10:1. `gold-deep` is UNUSABLE here — 2.06:1 at
        // the top — so dark surfaces take `gold`, light surfaces take
        // `gold-deep`, and neither crosses over.
        "navy-lift": "#1C3A5A",
        /**
         * navy-soft — THE SITE'S ONE ACCENT, and the fill of the utility strip.
         *
         * Asked for as "lighter than that, a slight bit" against `navy-lift`,
         * and then again once the strip took the same colour. It carries the
         * Join pill, the strip's background, the strip's two badges and the
         * hero's two CTAs, so the accent is one value rather than the four
         * different ones (navy, grey, red, cream) those surfaces started with.
         *
         * MEASURED, because it is a background for cream text everywhere it
         * appears: cream #F8F4EE on #22496F is 8.16:1 — clear of the 4.5 that
         * body text needs and of the 3:1 a large label needs, with room to
         * spare for the 13px uppercase button labels which are the smallest
         * type that sits on it.
         */
        "navy-soft": "#22496F",
        gold: "#C9A84C",
        // Pale gold / champagne — a lighter value of the brand gold, added for
        // muted-emphasis type on the hero video. #C9A84C sits at luminance
        // 0.421, which cannot reach 3:1 over a variable video frame without a
        // ~0.65 scrim; this tint is at 0.752 and behaves like white.
        "gold-pale": "#EFE1B0",
        "gold-deep": "#7D641F",
        ink: "#1A1A1A",
        amber: "#E0A458",
        // Text-safe amber. The brand amber #E0A458 is a light tint — fine as a
        // rule or a wash, but it cannot carry type on cream. This is the same
        // hue taken down to a value that clears AA on #F8F4EE for normal text,
        // used for the difference figure in the calculator.
        "amber-deep": "#8A5312",
      },
      fontFamily: {
        // Kufam for display, IBM Plex Sans for body and the data numerals.
        // `data` deliberately aliases `--font-body`: the figures and the copy
        // are one face, and Plex's figures are tabular natively — see the note
        // in app/[locale]/layout.tsx for why that decided the swap.
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        data: ["var(--font-body)"],
        // Inter — VEX-spec hero only.
        hero: ["var(--font-hero)"],
        // IBM Plex Mono — ADMIN ONLY. The variable is mounted on the (portal)
        // layout, not the root, so `font-mono` resolves to the fallback stack
        // anywhere else. Labels, sub-labels, units and figures in the admin.
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      screens: {
        card: "900px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16,1,0.3,1)",
      },
      maxWidth: {
        content: "1220px",
      },
    },
  },
  plugins: [],
};

export default config;
