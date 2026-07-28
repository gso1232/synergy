"use client";

import { useEffect } from "react";

/**
 * Paints the DOCUMENT background for a dark route, and puts it back on the way
 * out.
 *
 * THIS IS NOT THE SAME PROBLEM AS THE PAGE BACKGROUND, and that is the whole
 * reason it exists. There are three separate cream-flash risks on a dark route
 * and they need three different fixes:
 *
 *  1. A cream flash on client-side navigation — fixed in the markup, by the
 *     page's own `min-h-screen` gradient wrapper, which paints in the first
 *     frame the new segment renders.
 *  2. OVERSCROLL RUBBER-BANDING — this file. Drag past the top or bottom on a
 *     touch device (or a trackpad on macOS) and the area revealed beyond the
 *     document is painted from the CANVAS background, which the browser
 *     propagates from <body> — `bg-cream` in the root layout. No wrapper can
 *     fix that, because the wrapper is not what is being exposed: it is the
 *     absence of a wrapper. Only the html/body background reaches there.
 *  3. Restoring cream on the way back — the cleanup below, verified by
 *     rendering rather than assumed. React unmounting the segment is not, on
 *     its own, a guarantee that an attribute written to <html> comes off.
 *
 * WHY AN ATTRIBUTE AND NOT AN INLINE STYLE. `document.documentElement.style`
 * is a single shared slot; two components that both want it fight, and the
 * loser silently wins on unmount order. A data attribute is declarative, is
 * visible in the elements panel, and hands the actual colour to the stylesheet
 * where every other colour on this site lives.
 *
 * FIRST PAINT. The effect runs after hydration, which is early enough for
 * overscroll (you cannot overscroll a page you have not seen) but not for a
 * hard load, where the very first painted frame would be cream. The inline
 * script below sets the attribute while the HTML is still being parsed —
 * before the first paint — so a direct hit on /about never flashes either.
 * It is deliberately tiny and has no dependency on hydration.
 */
export default function RouteTheme({ theme }: { theme: "dark" }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-route-theme", theme);
    return () => {
      root.removeAttribute("data-route-theme");
    };
  }, [theme]);

  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.setAttribute('data-route-theme',${JSON.stringify(
          theme,
        )})`,
      }}
    />
  );
}
