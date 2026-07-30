"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scroll-scrubbed word-by-word illumination — the About page's two pull-quotes.
 *
 * Measured off restaurantsem.com's own pull-quote sections (§3 and §6 of their
 * homepage), which are the only two blocks on that page whose type animates.
 * Theirs is a Webflow IX2 interaction; this is the same effect rebuilt on
 * ScrollTrigger, with their numbers:
 *
 *   split        every word becomes its own span (30 spans on their §3 quote)
 *   opacity      0.2 -> 1        ** the one deviation: ours is 0.45 -> 1 **
 *   stagger      0.8
 *   duration     0.4
 *   ease         power1.out
 *   trigger      start `top 70%`  ->  end `top 20%`
 *   scrub        true — locked to the scroll position, not a timed playback,
 *                so scrubbing back un-illuminates the words in order
 *
 * THE SPLIT HAPPENS AT RUNTIME, ON THE RENDERED STRING. Nothing in
 * messages/en.json is allowed to carry markup: a translator editing a Spanish
 * pull-quote must be able to type a sentence, not maintain a span-per-word
 * structure whose word count has to match the English. This reads
 * `element.textContent` after React has painted it and rebuilds the children,
 * so the i18n value stays a plain string in both locales.
 *
 * The whitespace between words is preserved as its own text node rather than
 * being baked into the spans, so the line wraps and hyphenates exactly as the
 * unsplit paragraph did — a span-per-word with a trailing space inside each one
 * changes where the browser is allowed to break.
 *
 * THE FLOOR IS 0.55, NOT THEIR 0.2, AND THAT IS A CONTRAST FIX.
 *
 * A scrubbed reveal holds every un-illuminated word at the floor for as long as
 * the reader is above `top 20%` — that is not a transient frame, it is a state
 * you can sit in indefinitely, and it is on screen (the trigger opens at
 * `top 70%`, i.e. well inside the viewport). So the floor has to clear AA on
 * its own.
 *
 * ⚠️ RE-DERIVED FOR THE CREAM PAGE. THE PREVIOUS VALUE DOES NOT SURVIVE THE
 * INVERSION, AND IT FAILS QUIETLY RATHER THAN LOUDLY.
 *
 * The old floor was 0.45, derived for CREAM #F8F4EE at alpha over the navy
 * gradient stop each quote sat on. The quotes are INK #1A1A1A on cream now, and
 * the arithmetic is not symmetric — ink at 0.45 over cream composites to
 * rgb(148,146,143), which is 2.83:1 against cream and FAILS the 3:1 bar. Left
 * alone, the inversion would have shipped a pull-quote whose resting state is
 * below AA, on the section of the page a reader is most likely to stop at.
 *
 * Measured on the real composite — ink at alpha over cream, against cream:
 *
 *   alpha   composite        vs cream
 *   0.20    rgb(204,200,196)   1.52   <- their value, fails
 *   0.45    rgb(148,146,143)   2.83   <- the OLD floor, now fails
 *   0.50    rgb(137,135,132)   3.27   <- the floor, +0.27
 *   0.55    rgb(126,124,121)   3.79   <- SHIPPED, +0.79
 *   0.60    rgb(115,113,111)   4.43
 *
 * Both quotes are large text at every breakpoint (clamped to a 38.14px floor
 * against the 24px threshold), so the bar is 3.0:1. Shipped a step above the
 * floor for the same reason as everything else on this page: 0.50 leaves +0.27
 * and any reflow re-breaks it.
 *
 * The illumination range narrows from 5x to 1.82x, which is the cost, and it is
 * tighter than the 2.2x the dark build had. The effect still reads — words
 * visibly arrive — and an unreadable pull-quote on a page whose entire argument
 * is honesty is not a trade worth making.
 *
 * ACCESSIBILITY. The spans are visual only; the element's text content is
 * unchanged, so a screen reader still reads one continuous sentence. Opacity is
 * animated rather than colour, so the quote never goes below its measured
 * contrast in a way that depends on the palette.
 *
 * REDUCED MOTION: the effect returns before importing GSAP at all. No split, no
 * ScrollTrigger, and the string renders as authored at full opacity. It is not
 * a faster reveal — there is no reveal, because a quote held at its floor until
 * you scroll is a dimmed quote, not a slower animation.
 */
/** Un-illuminated opacity. See the contrast note above — this is not 0.2, and
 *  it is no longer the 0.45 the dark build shipped. It is derived from the
 *  SURFACE the quote sits on; change the surface and this must be re-derived. */
const FLOOR = 0.55;

export function useWordReveal(
  ref: RefObject<HTMLElement>,
  /** The rendered string. Only used to re-run the split when the copy or the
   *  locale changes — the split itself reads from the DOM. */
  text: string,
  { reduce = false, floor = FLOOR }: { reduce?: boolean | null; floor?: number } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      reduce ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // The original text node, kept so the cleanup can put the element back
    // exactly as React rendered it. Without this a locale switch would split an
    // already-split element and produce one span per word per re-run.
    const original = el.textContent ?? "";
    const words = original.split(/(\s+)/).filter((part) => part.length > 0);
    if (words.length === 0) return;

    const spans: HTMLSpanElement[] = [];
    const frag = document.createDocumentFragment();
    for (const part of words) {
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }
      const span = document.createElement("span");
      span.textContent = part;
      // inline-block would make each word its own line box and break the
      // shared baseline on a wrapped line; plain inline is what the unsplit
      // paragraph already was.
      span.style.opacity = String(floor);
      spans.push(span);
      frag.appendChild(span);
    }
    el.replaceChildren(frag);

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const tween = gsap.to(spans, {
        opacity: 1,
        duration: 0.4,
        stagger: 0.8,
        ease: "power1.out",
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
          end: "top 20%",
          scrub: true,
        },
      });

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
      // Back to a single text node. Restoring the string rather than clearing
      // the inline opacity matters: if the tween was killed mid-scrub some
      // spans are sitting at a fractional opacity, and leaving them in the DOM
      // would ship a permanently dimmed quote.
      el.replaceChildren(document.createTextNode(original));
    };
  }, [ref, text, reduce, floor]);
}
