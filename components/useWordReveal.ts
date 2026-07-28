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
 * THE FLOOR IS 0.45, NOT THEIR 0.2, AND THAT IS A CONTRAST FIX.
 *
 * A scrubbed reveal holds every un-illuminated word at the floor for as long as
 * the reader is above `top 20%` — that is not a transient frame, it is a state
 * you can sit in indefinitely, and it is on screen (the trigger opens at
 * `top 70%`, i.e. well inside the viewport). So the floor has to clear AA on
 * its own. Measured on the real composite — cream #F8F4EE at alpha over the
 * gradient stop each quote actually sits on, against that same stop:
 *
 *   alpha   quote 1 (t≈0.18)   quote 2 (t≈0.62)
 *   0.20         1.79               1.84          <- their value, fails
 *   0.35         2.77               2.95
 *   0.40         3.18               3.43
 *   0.45         3.61               3.94          <- shipped
 *
 * Both quotes are large text at every breakpoint (clamped to a 38px floor,
 * against the 24px threshold), so the bar is 3.0:1 and 0.45 clears it with
 * margin at the worst position on the run. 0.40 clears it by 0.18 and would be
 * re-broken by any reflow that moves a quote further up the gradient.
 *
 * The illumination range narrows from 5x to 2.2x, which is the cost. The effect
 * still reads — words visibly arrive — and an unreadable pull-quote on a page
 * whose entire argument is honesty is not a trade worth making.
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
/** Un-illuminated opacity. See the contrast note above — this is not 0.2. */
const FLOOR = 0.45;

export function useWordReveal(
  ref: RefObject<HTMLElement>,
  /** The rendered string. Only used to re-run the split when the copy or the
   *  locale changes — the split itself reads from the DOM. */
  text: string,
  { reduce = false }: { reduce?: boolean | null } = {},
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
      span.style.opacity = String(FLOOR);
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
  }, [ref, text, reduce]);
}
