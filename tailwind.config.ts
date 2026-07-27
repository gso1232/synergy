import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F4EE",
        greige: "#ECE9E2",
        navy: "#0D1B2A",
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
