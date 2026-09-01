"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

/**
 * GOOGLE REVIEWS — five real reviews from the Synergy Insurance Group - FFL
 * listing, each card linking out to the review it quotes.
 *
 * =============================================================================
 * NO API, BY DESIGN. The Places API costs money per load, needs a key in the
 * runtime env, and returns at most five reviews anyway. These five were read off
 * the listing by hand on 2026-09-01 and are stored below. The trade is that they
 * do not refresh on their own: when new reviews land, this array and the two
 * summary figures are edited and redeployed. That is the whole maintenance cost
 * and it is written down here so nobody goes looking for a cron job.
 *
 * =============================================================================
 * 🔴 THE REVIEW TEXT IS NOT IN messages/*.json AND MUST NOT BE MOVED THERE.
 *
 * Every other string on this site is CMS-editable so Aiman can reword it
 * (lib/cms/strings.ts). These are not site copy. They are verbatim statements by
 * five named members of the public, published under their names on Google, and
 * an admin panel that let someone "improve" them would be a tool for altering
 * what a real person said about an insurance company. That is misrepresentation
 * whatever the intent.
 *
 * So the split is: the SECTION CHROME below is editable (heading, buttons,
 * labels), the REVIEWS are code. This is the same reasoning as Standing Rule 3
 * in components/Testimonials.tsx, applied to third-party text where it matters
 * more, not less.
 *
 * =============================================================================
 * ⚠️ THE NO-APOSTROPHE RULE STOPS AT THE QUOTATION MARK, AND THAT IS DELIBERATE.
 *
 * The instruction for this site is no apostrophes in client-facing copy. Every
 * string this file authors obeys it, in both locales. The five review texts do
 * NOT, because two of them contain one: Coath Pedro wrote "family's future" and
 * Fernando Goncalves wrote "family's financial future".
 *
 * Editing those out would mean publishing an altered version of a named private
 * individual's words as if it were what they wrote, on a page whose entire
 * purpose is that a reader can click through and check. The link goes straight
 * to the original, so any edit is not just wrong, it is immediately visible.
 * Verbatim is the only defensible option; the styling rule yields to it.
 *
 * =============================================================================
 * LANGUAGE. Pedro Malpa wrote in Spanish. His review is stored in Spanish, with
 * Google's own English translation alongside it, and each locale is served the
 * one it can read with a "Translated by Google" note when it is the translation.
 *
 * The four English reviews stay in English on the Spanish page. Google would
 * offer a machine translation there; producing one here would mean this codebase
 * inventing Spanish words and attributing them to a named person, which is the
 * same objection as above. An English review shown in English is simply true.
 */

/* ---------------------------------------------------------------------------
   THE LISTING
   --------------------------------------------------------------------------- */

/**
 * Synergy Insurance Group - FFL, 5728 Major Blvd Ste 702, Orlando, FL 32819.
 * Google feature id 0x88e77f6ae619994d:0x725574a4acbccbea.
 *
 * The `cid` form is used rather than a /maps/place/ URL with a name and
 * coordinates in it: it is the shortest link Google will honour, it carries no
 * session or tracking parameters, and it survives the business being renamed or
 * moved. Verified 2026-09-01 to resolve to the listing.
 */
const LISTING_URL = "https://maps.google.com/?cid=8238619343965703146";

/**
 * The review composer for the same listing. `!12e1` is Google's own parameter
 * for "open the rating dialog".
 *
 * ⚠️ VERIFIED TO REACH THE LISTING, NOT VERIFIED TO OPEN THE DIALOG. Google
 * requires a signed-in account to write a review and the browser this was
 * checked in was signed out, where it lands on the listing with the "Write a
 * review" button in view. That is the correct degradation either way, but the
 * signed-in path is untested and should be checked from a real Google account
 * before anyone treats this button as proven.
 */
const WRITE_REVIEW_URL =
  "https://www.google.com/maps/place//data=!4m3!3m2!1s0x88e77f6ae619994d:0x725574a4acbccbea!12e1";

/**
 * Read off the listing on 2026-09-01: 5.0 average, 11 reviews, all five-star.
 *
 * ⚠️ THESE TWO NUMBERS GO STALE SILENTLY. Nothing checks them. A twelfth review
 * makes the count wrong the day it lands, and a four-star one makes the average
 * wrong too. They are a public claim about the business, so they get corrected
 * whenever this array does.
 */
const OVERALL_RATING = "5.0";
const TOTAL_REVIEWS = 11;

type Review = {
  name: string;
  rating: number;
  /** Verbatim, in the language the reviewer wrote it. Never edited. */
  text: string;
  /** Language of `text`. */
  lang: "en" | "es";
  /** Google's own translation, shown only to the other locale. */
  translation?: { lang: "en" | "es"; text: string };
  /**
   * Approximate posting date.
   *
   * Google publishes these as "2 months ago" and nothing more precise, so the
   * date is that offset applied to the capture date of 2026-09-01. It is stored
   * as a date rather than as the words "2 months ago" so the label recomputes
   * instead of quietly becoming a lie next spring. The precision is a month,
   * which is exactly the precision Google gave.
   */
  postedAround: string;
  url: string;
};

const REVIEWS: Review[] = [
  {
    name: "Josh Lampp",
    rating: 5,
    lang: "en",
    text: "Working with Synergy Insurance Group was a great experience. They took the time to explain my options clearly, answered all my questions, and helped me find coverage that fit my needs and budget. The process was simple, professional, and stress-free. I highly recommend them to anyone looking for honest and reliable insurance guidance.",
    postedAround: "2026-07-01",
    url: "https://maps.app.goo.gl/XDbH13kKLjGHXw7n9",
  },
  {
    name: "justin mosher",
    rating: 5,
    lang: "en",
    text: "Great experience with Synergy Insurance! They made it easy to understand how an IUL works and helped me find the right policy for my goals. Very knowledgeable, professional, and easy to work with. Highly recommend!",
    postedAround: "2026-07-01",
    url: "https://maps.app.goo.gl/KmYmbwy4qcQZWHYz7",
  },
  {
    name: "Fernando Goncalves",
    rating: 5,
    lang: "en",
    text: "Excellent experience from start to finish. The process was clear, professional, and educational. I felt informed every step of the way and confident in the decisions made for my family’s financial future.",
    postedAround: "2026-07-01",
    url: "https://maps.app.goo.gl/SvTXoTCLn6Y3mkTZ8",
  },
  {
    name: "Coath Pedro",
    rating: 5,
    lang: "en",
    text: "Excellent service and personalized attention. They helped me find the right coverage for my family’s future with professionalism, clarity, and care.",
    postedAround: "2026-07-01",
    url: "https://maps.app.goo.gl/XPSN9FhZCKeREFDW8",
  },
  {
    name: "Pedro Malpa",
    rating: 5,
    lang: "es",
    text: "La mejor agencia de seguros. Atencion en Inglés y en español con los mejores expertos de la industria",
    translation: {
      lang: "en",
      text: "The best insurance agency. Service in English and Spanish with the best experts in the industry.",
    },
    postedAround: "2026-07-01",
    url: "https://maps.app.goo.gl/BNYNXD3BeKWQZuUs8",
  },
];

/* ---------------------------------------------------------------------------
   MARKS
   --------------------------------------------------------------------------- */

/**
 * The Google G, in Google's own four colours.
 *
 * Google's brand terms require their mark, unaltered, on anything presenting
 * their review content — a monochrome or restyled G would be the violation, not
 * the compliance. So this one logo is exempt from the site palette. It is
 * `aria-hidden`: "Posted on Google" already says so in text.
 */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.97-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * The rating.
 *
 * `gold-deep` #7D641F rather than Google's amber: it is 5.16:1 on cream and 5.35
 * on greige, so the stars pass as normal text instead of relying on being
 * decorative. The row carries one text alternative and the stars themselves are
 * hidden, so the rating is never conveyed by shape alone.
 */
function Stars({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-[3px]" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-[15px] w-[15px] ${i < n ? "fill-gold-deep" : "fill-ink/20"}`}
        >
          <path d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.22l-4.94 2.6.94-5.51-4-3.9 5.53-.8z" />
        </svg>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   THE CARD
   --------------------------------------------------------------------------- */

/**
 * 🔴 THE WHOLE CARD IS THE LINK, AND THAT IS WHY THE ANCHOR IS AN OVERLAY.
 *
 * The obvious build wraps the card in an <a>. It cannot be done here: "Read
 * more" has to be a real <button>, and a button inside an anchor is invalid
 * HTML that browsers resolve differently from each other. Nesting them would
 * make expanding the text also open a new tab, on some browsers only.
 *
 * So the anchor is a stretched overlay across the card and the button sits above
 * it. Both are ordinary focusable elements, keyboard order is link then button,
 * and the anchor carries an sr-only name because none of the visible text is
 * inside it.
 *
 * ⚠️ THE COST IS THAT THE CARD TEXT CANNOT BE SELECTED WITH THE MOUSE. That
 * follows from "the ENTIRE card is clickable" and is not fixable while that
 * holds. The reader who wants the text has the link to the original.
 */
function ReviewCard({ review }: { review: Review }) {
  const t = useTranslations("googleReviews");
  const locale = useLocale();

  const textRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const showTranslation = review.lang !== locale && review.translation?.lang === locale;
  const body = showTranslation ? review.translation!.text : review.text;
  /* The paragraph is tagged with the language it is actually in, so a screen
     reader switches voice for the Spanish one instead of reading it as English. */
  const bodyLang = showTranslation ? review.translation!.lang : review.lang;

  /**
   * ⚠️ MEASURE ONLY WHILE CLAMPED. Once expanded, scrollHeight equals
   * clientHeight by definition, so a live measurement would decide the text no
   * longer overflows and remove the "Show less" the reader needs to collapse it.
   * Freezing the result on expand is the fix.
   */
  useEffect(() => {
    if (expanded) return;
    const el = textRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    /* Re-measured on resize because whether four lines is enough depends on the
       card width, which changes between the phone carousel and the desktop grid
       with no remount in between. */
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, body]);

  return (
    <li
      className={[
        "group relative flex shrink-0 snap-center flex-col",
        /* 🔴 AN EXPLICIT WIDTH, NOT A min-width. `min-w-[84%]` was the first
           attempt and it produced 2344px-wide cards on a 375px phone. In a
           `shrink-0` flex row that overflows, an item's base width is `auto`,
           which resolves to MAX-CONTENT: the whole review on one line. A
           min-width only raises that floor, it never caps it, so every card grew
           to the length of its own longest review and the carousel scrolled
           7084px sideways. Measured, not guessed. A fixed width is the only
           thing that binds it. */
        "w-[84%] sm:w-[62%]",
        // Desktop: three per row, the last two centred by the parent's wrap.
        "md:w-[calc((100%-3rem)/3)]",
        "rounded-[4px] border border-ink/10 bg-white p-6 sm:p-7",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out-expo",
        "hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_14px_34px_-14px_rgba(13,27,42,0.28)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      ].join(" ")}
    >
      {/* The stretched link. `focus-visible` styles the CARD, not a 1px box in
          the corner, so keyboard focus lands somewhere visible. */}
      <a
        href={review.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0 rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
      >
        <span className="sr-only">{t("cardAria", { name: review.name })}</span>
      </a>

      <div className="flex items-start gap-3">
        <GoogleG className="mt-[2px] h-[22px] w-[22px] shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-[1.3] text-ink">
            {review.name}
          </p>
          <span className="mt-1.5 block">
            <Stars n={review.rating} label={t("starsAria", { n: review.rating })} />
          </span>
        </div>
      </div>

      <p
        ref={textRef}
        lang={bodyLang}
        className={`mt-4 text-[15px] leading-[1.6] text-ink/85 ${expanded ? "" : "line-clamp-4"}`}
      >
        {body}
      </p>

      {/* z-10 lifts the button clear of the stretched link so a click expands
          the text instead of opening the tab underneath it. */}
      {overflows ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="relative z-10 mt-2 self-start text-[13px] font-semibold text-gold-deep underline underline-offset-2 transition-colors duration-200 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
        >
          {expanded ? t("showLess") : t("readMore")}
        </button>
      ) : null}

      {showTranslation ? (
        <p className="mt-3 text-[12px] leading-[1.4] text-ink/55">{t("translated")}</p>
      ) : null}

      {/* mt-auto pins the footer to the bottom, so the three footers line up
          across a row whatever the review lengths are. */}
      <p className="mt-auto pt-5 text-[12.5px] leading-[1.4] text-ink/60">
        {t("postedOn")}
        <span aria-hidden="true"> &middot; </span>
        <RelativeDate iso={review.postedAround} />
      </p>
    </li>
  );
}

/**
 * "2 months ago", recomputed on every render rather than stored as words.
 *
 * ⚠️ suppressHydrationWarning IS REQUIRED, NOT COSMETIC. This reads the clock,
 * so a page rendered on the server at 23:59 on the last day of a month and
 * hydrated a second later would produce two different strings and React would
 * discard the markup. The value is the same either side of that one boundary in
 * every other second of the year.
 */
function RelativeDate({ iso }: { iso: string }) {
  const locale = useLocale();
  const then = new Date(`${iso}T00:00:00Z`);
  const now = new Date();
  const months =
    (now.getUTCFullYear() - then.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - then.getUTCMonth());

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const label =
    months >= 12
      ? rtf.format(-Math.floor(months / 12), "year")
      : rtf.format(-Math.max(months, 1), "month");

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}

/* ---------------------------------------------------------------------------
   THE SECTION
   --------------------------------------------------------------------------- */

export default function GoogleReviews() {
  const t = useTranslations("googleReviews");

  const btn =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[14px] font-medium transition-transform duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  return (
    /* 🔴 greige, NOT cream, AND THAT IS A SEAM DECISION. This sits directly
       under <Testimonials />, which is cream, and directly above the navy
       footer. Two cream sections in a row read as one long section with a
       heading floating in the middle of it; #ECE9E2 is one step down, enough to
       separate them, and it makes the white cards read as cards rather than as
       holes. It also keeps the Consultation(navy) -> light -> Footer(navy)
       rhythm the page comment in page.tsx asks for. */
    <section aria-labelledby="google-reviews-heading" className="bg-greige">
      <div className="mx-auto w-full max-w-content px-5 py-16 md:px-7 lg:py-20">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[46ch]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              {t("eyebrow")}
            </p>
            <h2
              id="google-reviews-heading"
              className="mt-2.5 font-display text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.12] tracking-[-0.015em] text-ink"
            >
              {t("heading")}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-display text-[26px] font-medium leading-none text-ink">
                {OVERALL_RATING}
              </span>
              <Stars n={5} label={t("starsAria", { n: OVERALL_RATING })} />
              <span className="text-[14px] leading-[1.4] text-ink/70">
                {t("summary", { count: TOTAL_REVIEWS })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={LISTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} bg-navy text-cream hover:bg-navy-lift`}
            >
              <GoogleG className="h-[17px] w-[17px]" />
              {t("seeAll")}
            </a>
            <a
              href={WRITE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} border border-navy/70 text-navy hover:bg-navy/[0.06]`}
            >
              {t("writeReview")}
            </a>
          </div>
        </div>

        {/* ---------- Cards ----------
            One flex row that is a snap carousel below md and a wrapping,
            centred three-across grid above it. The negative margin plus the
            matching padding lets the carousel bleed to both screen edges on a
            phone while the first card still starts on the page gutter, which is
            what stops the last card looking cut off at the wrong place.

            `justify-center` is what makes 5 cards sit 3 + 2 with the second row
            centred; a plain grid would leave the fourth and fifth hard left
            under a gap. */}
        <ul
          className={[
            "mt-10 flex list-none gap-5 md:gap-6",
            "-mx-5 snap-x snap-mandatory overflow-x-auto px-5 pb-2",
            "md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 md:pb-0",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          ].join(" ")}
        >
          {REVIEWS.map((r) => (
            <ReviewCard key={r.url} review={r} />
          ))}
        </ul>
      </div>
    </section>
  );
}
