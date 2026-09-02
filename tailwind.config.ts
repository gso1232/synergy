import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* =====================================================================
         * SYNERGY BRAND PALETTE, 2026-09-01. Supplied directly:
         *
         *     Primary navy   #002050
         *     Royal blue     #0066CC
         *     White          #FFFFFF
         *     Gold accent    #D4A017
         *
         * with two standing rules: NO GREY OR BLUE-GREY anywhere in the main
         * design, and gold is an occasional small accent, never dominant.
         *
         * 🔴 THE TOKEN NAMES ARE NOT ALL HONEST ANY MORE AND THAT IS A DELIBERATE
         * TRADE. `gold-deep` holds royal blue, and `navy-soft` holds royal blue
         * too. Renaming them properly means editing 170 and 9 class strings, and
         * every one of those edits is a chance to typo a Tailwind class into
         * silence with no error. The VALUE is the single place the colour lives;
         * changing it here changed every surface at once, which is the whole
         * reason the token layer exists. Read the mapping below, not the names.
         *
         * ⚠️ CONTRAST FIGURES QUOTED THROUGHOUT THIS CODEBASE ARE FROM THE OLD
         * PALETTE AND ARE NOW WRONG, NOT MERELY CONSERVATIVE. The cream->white
         * change could be waved through because white is lighter than cream, so
         * every ratio improved. This one moves hues, so each pair had to be
         * recomputed. The ones that matter, measured:
         *
         *     white on navy #002050        15.88:1   (was 15.87 on #0D1B2A)
         *     ink #0B1F3A on white         16.50:1
         *     white on royal #0066CC        5.56:1   passes normal text
         *     royal #0066CC on white        5.56:1   passes normal text
         *     gold #D4A017 on navy          6.69:1   passes normal text
         *     gold #D4A017 on WHITE         2.38:1   FAILS EVERYTHING
         *
         * 🔴 THAT LAST LINE IS THE ONE THAT SHAPED THE MAPPING. The supplied gold
         * cannot carry text on white, and it cannot even be a 3:1 UI boundary
         * there. The old palette used `gold-deep` #7D641F for every accent on a
         * light surface — eyebrows, kickers, rules, and 66 focus rings. Pointing
         * that token at #D4A017 would have put 170 sub-3:1 elements on a white
         * site. It points at ROYAL instead, which is both accessible and exactly
         * what the brief asks for: "royal blue accents" on white, gold reserved
         * for small accents. Gold now appears only where it is legible: on navy.
         * ===================================================================== */

        /** The page. Named `cream` since it was #F8F4EE; 130 call sites. */
        cream: "#FFFFFF",

        /**
         * 🔴 NOT GREY ANY MORE. This was #ECE9E2, a warm grey, and "please do
         * not use gray backgrounds" retires it as a surface. It is repointed at
         * white rather than deleted because deleting the token breaks its one
         * remaining call site and eight CSS rules; every one of those is now
         * white, and the surfaces that used it for separation take a royal
         * hairline instead. See the greige sweep in this change.
         */
        greige: "#FFFFFF",

        /** Primary navy. Dark section backgrounds, headings, secondary buttons. */
        navy: "#002050",

        /**
         * Hover for the primary button, per the brief: royal -> navy. It is the
         * SAME value as `navy` on purpose, so `hover:bg-navy-lift` lands on the
         * specified colour without touching 12 call sites.
         */
        "navy-lift": "#002050",

        /**
         * 🔴 ROYAL BLUE #0066CC, DESPITE THE NAME. This is the site's accent and
         * the primary button fill: the Join pill, the utility strip badges, the
         * hero CTAs, the service card accents. White on it is 5.56:1.
         */
        "navy-soft": "#0066CC",

        /** The same royal blue. See the note above about why the name stayed. */
        royal: "#0066CC",

        /** Gold accent. LEGIBLE ON NAVY ONLY (6.69:1); 2.38:1 on white. */
        gold: "#D4A017",

        /**
         * Gold on dark surfaces — focus rings and link hovers over navy and over
         * photographs. Was #EFE1B0, a pale gold; now the brand gold itself,
         * which still clears 6.69:1 on navy.
         */
        "gold-pale": "#D4A017",

        /**
         * 🔴 ROYAL BLUE, NOT GOLD. The accent-on-light slot: 46 text, 33 border,
         * 66 focus rings, 14 backgrounds. See the contrast note above for why
         * the supplied gold could not take this job.
         */
        "gold-deep": "#0066CC",

        /** Body text. Very dark navy rather than black, per the brief. */
        ink: "#0B1F3A",

        /**
         * Status tints in the admin only — warning amber on light chips. Left on
         * the old values: they are not brand surfaces, they are the colour that
         * says "caution" in a data table, and turning them blue would remove the
         * only thing distinguishing them from every other row.
         */
        amber: "#E0A458",
        "amber-deep": "#8A5312",
      },

      fontFamily: {
        // 🔴 ALL FOUR SLOTS ARE MONTSERRAT, 2026-09-01. Fraunces (display),
        // IBM Plex Sans (body/data) and Be Vietnam Pro (hero) are gone on
        // instruction. The four names are KEPT because ~500 call sites use
        // them, and --font-display / --font-hero are aliased onto --font-body
        // in app/globals.css. See the docblock in app/[locale]/layout.tsx,
        // including the tabular-figures check that swap had to survive.
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        data: ["var(--font-body)"],
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
