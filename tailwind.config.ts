import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F4EE",
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
        // Kufam for display, Overpass for body and the data numerals.
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        data: ["var(--font-body)"],
        // Inter — VEX-spec hero only.
        hero: ["var(--font-hero)"],
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
