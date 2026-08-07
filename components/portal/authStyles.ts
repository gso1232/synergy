/**
 * The field styling shared by every portal auth form.
 *
 * Lifted verbatim from LoginForm so the five screens 0005 adds cannot drift
 * from the one that was measured. The numbers below are that measurement, not
 * taste — see LoginForm's docblock for the full derivation:
 *
 *   · BORDER IS cream/40. This border IS the input's boundary, so it owes 3:1
 *     under WCAG 1.4.11 against the card's WORST (brightest) composite
 *     rgb(30,40,45). Swept: cream/30 = 2.55 FAIL, cream/35 = 2.97 short,
 *     cream/40 = 3.44 PASS. Do not thin it.
 *   · LABELS ARE FIXED, IN THEIR OWN BLOCK — never floating. A floating label
 *     shares one box with the value, so every fix is a negotiation between two
 *     things that want the same 20px; a label in its own block cannot collide
 *     at any width, font size or locale.
 *   · The gold submit fill carries navy text at 6.4:1.
 */

export const FIELD =
  "block w-full appearance-none rounded-lg border border-cream/40 bg-cream/[0.06] py-3 pl-11 pr-4 text-[15px] text-cream transition-colors duration-200 focus:border-gold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale aria-[invalid=true]:border-[#E9967A] motion-reduce:transition-none";

export const LABEL = "mb-2 block text-[13px] font-medium text-cream/85";

export const ICON =
  "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-cream/55";

export const SUBMIT =
  "group mt-7 flex h-12 w-full items-center justify-center rounded-full bg-gold text-[15px] font-semibold text-navy transition-colors duration-200 hover:bg-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale disabled:bg-cream/30 disabled:text-navy/70 motion-reduce:transition-none";

/** Error region: warm salmon on translucent dark red — #F6C4B6 is 8.6:1 here. */
export const ALERT =
  "rounded-lg border border-[#E9967A]/40 bg-[#5A1E12]/50 px-4 py-3 text-[14px] leading-[1.5] text-[#F6C4B6]";

/** Success / neutral region — gold-bordered, same weight as the alert. */
export const NOTE =
  "rounded-lg border border-gold/40 bg-gold/[0.12] px-4 py-3 text-[14px] leading-[1.5] text-cream";

export const LINK =
  "text-[14px] text-gold-pale underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale";
