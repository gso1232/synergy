"use client";

import { useLocale, useTranslations } from "next-intl";
/* 🔴 TWO Links, AND MIXING THEM UP IS WHAT BROKE BOTH UTILITY LINKS.
   `@/navigation`'s Link is next-intl's: it PREPENDS the active locale to
   whatever href it is given. The language switcher needs exactly that. The two
   utility links do not — they were handed `/${locale}/login`, which the Link
   then prefixed again and shipped as `/en/en/login`. Both 404'd in production.
   navigation.ts documents this same trap for `usePathname`; it applies to Link
   for the same reason. Plain `next/link` for anything already carrying its
   locale. */
import NextLink from "next/link";
import { Link, usePathname } from "@/navigation";
import { locales } from "@/lib/locales";
import { routeHref } from "@/routes";

/**
 * The thin utility strip above the main nav, matching familyfirstlife.com's.
 *
 * =============================================================================
 * 🟢 THE SOCIAL ICONS ARE HERE NOW, 2026-09-01. THIS REVERSES THIS FILE'S OWN
 * EARLIER NOTE, SO THE OLD REASONING IS KEPT RATHER THAN QUIETLY DELETED:
 *
 *     "THE SOCIAL ICONS ARE DELIBERATELY ABSENT. The reference's strip opens
 *      with Instagram / Facebook / YouTube / X / LinkedIn on the left. They are
 *      not here, on explicit instruction — and the instruction is right for a
 *      second reason: Synergy has no accounts on any of those platforms. An
 *      icon linking to a profile that does not exist is worse than no icon."
 *
 * Both halves of that have expired. The instruction is reversed, and the second
 * reason is simply no longer true: three accounts were supplied and all three
 * were opened and confirmed to be Synergy's own before being linked —
 * "Synergy Insurance group" on YouTube, @synergyinsurance_g on Instagram
 * (18.8K followers), and "Synergy Insurance Group | Orlando FL" on Facebook.
 *
 * X and LinkedIn are still absent, because there are still no accounts there.
 *
 * 🟡 components/Footer.tsx STILL SAYS THERE ARE NO ACCOUNTS. Its retired social
 * row (see SOCIALS in its docblock, and the placeholder at the reference's own
 * social slot) was dropped for exactly the reason that just expired. It is left
 * alone here because the instruction named the top banner, but it is now a
 * three-line change away from being correct, and it is currently documentation
 * that contradicts what this strip does.
 *
 * That leaves the strip carrying what the reference uses it for: the socials on
 * the left, the language choice centred, and the two utility destinations on
 * the right.
 *
 * =============================================================================
 * 🔴 THE LANGUAGE SWITCHER MOVED HERE FROM THE NAV ROW, AND THAT REVERSES AN
 * EARLIER INSTRUCTION. On 2026-08-16 the EN/ES pill was moved INTO the left nav
 * rail, directly after Blog, because that is where it was asked for. The
 * reference puts it in this strip instead, and cloning the strip while leaving
 * the pill in place would put two language switchers on one screen — which is
 * not a clone of anything and reads as a bug.
 *
 * So there is exactly one switcher and it is here. `components/LocaleSwitcher`
 * still exists, still works, and is simply not mounted in the nav row; putting
 * it back is one line in SiteHeader.
 *
 * =============================================================================
 * PLAIN TEXT, NOT THE PILL. The reference renders "English Español" as two bare
 * words with the active one in bold. The pill's filled-chip treatment was built
 * for a control floating over a photograph and would be louder than everything
 * else on a 40px utility strip.
 *
 * `aria-current="true"` rather than `"page"`: these two links point at the SAME
 * page in different languages, so the active one is not a different page — it
 * is the current state of this one. `"page"` would tell a screen reader the
 * other language is a separate destination in a navigation list.
 */

const LABELS: Record<string, string> = { en: "English", es: "Español" };

/**
 * The two badges the reference puts before each utility link.
 *
 * 🔴 THEY ARE NOT THE SAME MARK. The first pass drew one generic filled dot for
 * both, which is what a glance at a small screenshot suggests — but the
 * reference uses a PERSON for the login and an ARROW for the application, and
 * that difference is the only thing distinguishing the two links at 15px before
 * you read the words. Reproducing them as one shape loses the signal that made
 * them worth having.
 *
 * Both are drawn rather than fetched: a 15px glyph is a handful of path data,
 * and an icon font or a sprite request for two shapes on every page would cost
 * more than it saves.
 *
 * 🔴 navy-soft DISCS ON A LIGHT STRIP. The strip was briefly filled with
 * `navy-soft` itself, which forced the discs to invert to cream to stay
 * visible; it is back to the reference's light grey, so the discs carry the
 * accent and the glyph inside them is white. The reference's red is gone
 * site-wide — see the note on the button colours in components/Hero.tsx.
 */

/** Red disc with a white person silhouette — the account/login badge. */
function PersonBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-navy-soft card:h-[17px] card:w-[17px]"
    >
      <svg viewBox="0 0 16 16" className="h-[9px] w-[9px] fill-white card:h-[11px] card:w-[11px]">
        <circle cx="8" cy="5.6" r="2.9" />
        <path d="M8 9.4c-3 0-5 1.9-5 3.9v.6h10v-.6c0-2-2-3.9-5-3.9z" />
      </svg>
    </span>
  );
}

/** Red disc with a white arrow — the "go and apply" badge. */
function ArrowBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-navy-soft card:h-[17px] card:w-[17px]"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-[9px] w-[9px] fill-none stroke-white stroke-[2.2] card:h-[10px] card:w-[10px]"
      >
        <path d="M2.5 8h10" strokeLinecap="round" />
        <path d="M8.6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------------------
   THE SOCIAL MARKS.

   🔴 FULL BRAND COLOUR, NOT MONOCHROME, AND THAT IS THE ASK. The reference
   renders its social row as flat dark glyphs and the rest of this strip is
   ink-on-grey, so a monochrome set would sit more quietly here. "Must have the
   icons of the apps, logo of YouTube, Facebook and Instagram" is a request for
   the marks people recognise at a glance, and at 17px the thing that makes a
   YouTube icon read as YouTube is the red.

   ⚠️ THESE ARE OTHER COMPANIES' TRADEMARKS AND THEY ARE REPRODUCED UNALTERED.
   Every one of these three brands requires its mark be used in its own colours
   and proportions, not recoloured to a host palette. So this is the one place
   on the site exempt from the Synergy palette, for the same reason the Google
   G in components/GoogleReviews.tsx is.

   Drawn inline rather than fetched: three glyphs are a few hundred bytes of
   path data against three network requests on every page of the site.

   Each is `aria-hidden`; the accessible name lives on the <a> that wraps it,
   because an icon with no text needs a name a screen reader can announce and
   "YouTube" alone does not say what the link does.
   --------------------------------------------------------------------------- */

function YouTubeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#FF0000"
        d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13C24 15.93 24 12 24 12s0-3.93-.5-5.8z"
      />
      <path fill="#FFFFFF" d="M9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"
      />
      <path
        fill="#FFFFFF"
        d="M16.67 15.56l.53-3.49h-3.33V9.82c0-.96.47-1.89 1.96-1.89h1.51V4.96s-1.37-.24-2.68-.24c-2.74 0-4.53 1.67-4.53 4.69v2.66H7.08v3.49h3.05V24a12.1 12.1 0 0 0 3.74 0v-8.44h2.8z"
      />
    </svg>
  );
}

/**
 * Instagram's mark is a gradient, not a flat colour, and reproducing it flat
 * would be the altered-trademark problem the note above is about.
 *
 * The gradient id is namespaced (`syn-ig-*`) because SVG gradient ids are
 * GLOBAL to the document, not scoped to their <svg>. A bare `id="a"` would be
 * one collision away from another inline SVG on the page repainting this icon.
 */
function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="syn-ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#FDF497" />
          <stop offset="5%" stopColor="#FDF497" />
          <stop offset="45%" stopColor="#FD5949" />
          <stop offset="60%" stopColor="#D6249F" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="6.5" fill="url(#syn-ig-grad)" />
      <path
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        d="M8.4 4.9h7.2a3.5 3.5 0 0 1 3.5 3.5v7.2a3.5 3.5 0 0 1-3.5 3.5H8.4a3.5 3.5 0 0 1-3.5-3.5V8.4a3.5 3.5 0 0 1 3.5-3.5z"
      />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="16.6" cy="7.5" r="1.05" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 🔴 THE FACEBOOK URL IS THE `profile.php?id=` FORM ON PURPOSE. Facebook
 * redirects it to /people/Synergy-Insurance-Group/61591480711718/, which is
 * prettier and is NOT used: that form embeds the page NAME, so it breaks the
 * day the page is renamed. The numeric id never changes. Verified 2026-09-01 to
 * resolve to "Synergy Insurance Group | Orlando FL".
 */
const SOCIALS = [
  {
    key: "youtube" as const,
    href: "https://www.youtube.com/channel/UC0sjqMP_obt8m9M0_5tgzig",
    Mark: YouTubeMark,
  },
  {
    key: "instagram" as const,
    href: "https://www.instagram.com/synergyinsurance_g/",
    Mark: InstagramMark,
  },
  {
    key: "facebook" as const,
    href: "https://www.facebook.com/profile.php?id=61591480711718",
    Mark: FacebookMark,
  },
];

export default function TopUtilityBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tHero = useTranslations("hero");
  const tSocial = useTranslations("social");

  return (
    <div className="top-utility-bar bg-[#EDEDED] text-ink">
      {/* 🔴 A GRID WITH THREE EQUAL TRACKS, NOT flex + fixed side widths. The
            first attempt gave each side a hard 220px, which was narrower than
            "Agent Login | Apply to Work with Synergy" and wrapped it onto two
            lines inside a 40px bar. Equal `1fr` tracks let the sides take what
            they need while keeping the language block centred on the PAGE axis
            rather than on whatever space happens to be left over. */}
      {/* 🔴 TWO LAYOUTS, ONE MARKUP. Below `card` the strip is a simple
          space-between row at 12px; the three-track grid only exists at
          desktop. The grid cannot survive a 375px phone — "English Español"
          plus "Agent Login" plus "Apply to Work with Synergy" is far wider
          than the viewport at 14px, and a centred middle track guarantees the
          right-hand one overflows rather than wraps. Space-between with the
          spacer dropped puts language hard left and the two utility links hard
          right, which is the only arrangement that fits the real strings. */}
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between gap-2 px-4 text-[12px] card:grid card:h-10 card:grid-cols-[1fr_auto_1fr] card:px-6 card:text-[14px]">
        {/* LEFT — the socials, which is the column the reference uses for them.
            It was an empty spacer until 2026-09-01; see the note at the top of
            this file for why it was empty and why it is not any more.

            🔴 VISIBLE ON THE PHONE TOO, WHICH THE LANGUAGE SWITCHER IS NOT.
            Three 16px marks are ~76px including gaps. The two utility links are
            ~260px at 12px. That fits a 375px strip with the 32px gutters and
            nothing to spare, which is exactly why the language block stays
            desktop-only: adding it back would be another 110px into a row that
            has none. Measured, not assumed. */}
        <ul className="flex list-none items-center gap-2.5 card:gap-3">
          {SOCIALS.map(({ key, href, Mark }) => (
            <li key={key} className="flex">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial(key)}
                className="inline-flex rounded-[4px] transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
              >
                {/* Hover is OPACITY, not colour. These are trademarks that have
                    to stay in their own colours, so the one hover affordance
                    available is to dim the whole mark uniformly. */}
                <Mark className="h-[16px] w-[16px] card:h-[18px] card:w-[18px]" />
              </a>
            </li>
          ))}
        </ul>

        {/* 🔴 DESKTOP ONLY. The reference splits these two differently by
            breakpoint: its phone strip carries ONLY the utility links and moves
            the language down into the nav row beside the hamburger. Copied,
            because it is also the only division that fits — language plus both
            links is 405px of content in a 375px strip. */}
        <nav aria-label={t("langLabel")} className="hidden items-center gap-1.5 whitespace-nowrap card:flex card:gap-2">
          {locales.map((l) => {
            const active = l === locale;
            return (
              <Link
                key={l}
                href={pathname}
                locale={l}
                aria-current={active ? "true" : undefined}
                className={`transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none ${
                  active ? "font-bold text-ink" : "font-normal text-ink/70"
                }`}
              >
                {LABELS[l] ?? l}
              </Link>
            );
          })}
        </nav>

        {/* 🔴 `flex-1 justify-center` IS GONE FROM THE MOBILE CASE. It centred
            these two links when they were the ONLY thing in the row. With the
            socials now on the left they are the right-hand half of a split,
            and keeping the centring would have pushed them into the icons. */}
        <div className="flex items-center gap-2 whitespace-nowrap font-semibold card:justify-end card:gap-3">
          <NextLink
            /* A literal path, not `routeHref`: /login is deliberately absent
               from the RouteKey registry (it is portal chrome, not a marketing
               route) and SiteHeader links it the same way. */
            href={`/${locale}/login`}
            className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            <PersonBadge />
            {t("login")}
          </NextLink>
          <span aria-hidden="true" className="text-ink/25">
            |
          </span>
          <NextLink
            href={routeHref(locale, "join")}
            aria-label={tHero("ctaApply")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors duration-200 hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
          >
            <ArrowBadge />
            {/* 🔴 TWO LABELS, ONE LINK, AND THE SHORT ONE IS FORCED BY ARITHMETIC.
                "Apply to Work with Synergy" is 26 characters. With the three
                social marks now occupying the left of the strip, that phrase
                plus "Agent Login" plus the icons measured 373px of content in a
                360px viewport — the strip overflowed by 13px on a width that is
                one of the most common Android sizes. Measured, before and after.

                `nav.join` is EXISTING approved copy ("Join" / "Unete"), not a
                phrase invented to fit, and it points at the same route through
                the same `routeHref`. Desktop is untouched and still reads the
                full sentence.

                The `aria-label` carries the FULL phrase at every width, so a
                screen reader on a phone is never handed the word "Join" with no
                indication of what it joins. */}
            <span className="card:hidden">{t("join")}</span>
            <span className="hidden card:inline">{tHero("ctaApply")}</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
