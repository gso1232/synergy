/**
 * SYNERGY'S SOCIAL ACCOUNTS — one source for the URLs and the three marks.
 *
 * =============================================================================
 * WHY THIS FILE EXISTS. The strip (components/TopUtilityBar.tsx) and the footer
 * (components/Footer.tsx) both render these three links. Two copies of three
 * URLs is two places to update when an account moves and one place to forget,
 * on links that go to somebody else's platform where a stale URL is a 404 the
 * site cannot detect.
 *
 * ⚠️ NO HOOKS AND NO "use client" IN HERE, ON PURPOSE. TopUtilityBar is a client
 * component and Footer is a server one. Everything below is a plain array and
 * three pure SVG functions, so it imports cleanly into both. Adding a
 * `useId()` — the obvious way to solve the gradient-id problem below — would
 * make this client-only and drag the whole footer across the boundary with it.
 *
 * =============================================================================
 * 🟢 ALL THREE WERE OPENED AND CONFIRMED BEFORE BEING LINKED, 2026-09-01:
 *
 *   YouTube    "Synergy Insurance group"
 *   Instagram  @synergyinsurance_g, 18.8K followers, "Synergy Insurance Group"
 *   Facebook   "Synergy Insurance Group | Orlando FL"
 *
 * This matters more than usual here. Both call sites previously carried a
 * comment saying no Synergy accounts existed and that "three icons pointing at
 * a dead link is the same lie as a dead Privacy link in a more clickable
 * shape". That objection is answered by checking, not by assuming.
 *
 * X, LinkedIn and TikTok are still absent, because there are still no accounts.
 *
 * =============================================================================
 * ⚠️ THESE ARE OTHER COMPANIES' TRADEMARKS, REPRODUCED UNALTERED. All three
 * brands require their mark in its own colours and proportions rather than
 * recoloured to a host palette, so this is the one place besides the Google G
 * in components/GoogleReviews.tsx that is exempt from the Synergy palette. Any
 * hover affordance has to be opacity, never a colour shift.
 *
 * Drawn inline rather than fetched: three glyphs are a few hundred bytes of
 * path data against three network requests on every page of the site.
 *
 * Each mark is `aria-hidden`. The accessible name belongs on the <a> that wraps
 * it, because "YouTube" alone does not say what the link does — see the
 * `social.*` keys in messages/*.json.
 */

export function YouTubeMark({ className }: { className?: string }) {
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

export function FacebookMark({ className }: { className?: string }) {
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
 * Instagram's mark is a gradient, not a flat colour, and flattening it would be
 * the altered-trademark problem the header note is about.
 *
 * 🔴 `instanceId` IS REQUIRED AND IS NOT DECORATION. SVG gradient ids are GLOBAL
 * to the document, not scoped to their own <svg>. This mark renders twice on
 * every page — once in the top strip, once in the footer — so a fixed id would
 * ship duplicate ids in the HTML, which is invalid, and leave both icons
 * pointing at whichever definition happened to parse first. Each call site
 * passes its own string.
 */
export function InstagramMark({
  className,
  instanceId,
}: {
  className?: string;
  instanceId: string;
}) {
  const gradientId = `syn-ig-${instanceId}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#FDF497" />
          <stop offset="5%" stopColor="#FDF497" />
          <stop offset="45%" stopColor="#FD5949" />
          <stop offset="60%" stopColor="#D6249F" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="6.5" fill={`url(#${gradientId})`} />
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

/** Message key under the `social` namespace, used for the link's accessible name. */
export type SocialKey = "youtube" | "instagram" | "facebook";

export type Social = {
  key: SocialKey;
  href: string;
  /** `instanceId` is passed only to Instagram; the other two ignore it. */
  Mark: (props: { className?: string; instanceId: string }) => JSX.Element;
};

/**
 * 🔴 THE FACEBOOK URL IS THE `profile.php?id=` FORM ON PURPOSE. Facebook
 * redirects it to /people/Synergy-Insurance-Group/61591480711718/, which is
 * prettier and is NOT used: that form embeds the page NAME, so it breaks the
 * day the page is renamed. The numeric id never changes.
 */
export const SOCIALS: Social[] = [
  {
    key: "youtube",
    href: "https://www.youtube.com/channel/UC0sjqMP_obt8m9M0_5tgzig",
    Mark: YouTubeMark,
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/synergyinsurance_g/",
    Mark: InstagramMark,
  },
  {
    key: "facebook",
    href: "https://www.facebook.com/profile.php?id=61591480711718",
    Mark: FacebookMark,
  },
];
