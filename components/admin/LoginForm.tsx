"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { ArrowRight, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { signIn, type SignInState } from "@/app/[locale]/(portal)/login/actions";

/**
 * The sign-in form — LIVE as of auth phase 2. It submits to the `signIn` server
 * action (app/(portal)/login/actions.ts), which sets the session cookies
 * server-side and redirects by role. No token ever touches client JS.
 *
 * 🔴 RESKINNED FOR A DARK GLASSY CARD (2026-08-02). Was light: white fields,
 * ink text, on a white card in a split-screen layout. It is now cream-on-glass
 * with gold accents, sitting inside the centred glass card on page.tsx. NOTHING
 * ABOUT AUTH CHANGED — same `signIn` action binding, same `useFormState`, same
 * autocomplete tokens, same aria wiring, same generic error codes, same
 * disabled "Forgot". Only presentation moved. The AA numbers are re-derived for
 * the dark surface below and in page.tsx.
 *
 * 🔴 THE FIELDS HAVE LEADING ICONS, AND THEY ARE PURELY DECORATIVE. Each is
 * `aria-hidden` — the real <label for> carries the accessible name, so the icon
 * adds a visual cue without adding a second, redundant label to the a11y tree.
 * The input's `pl-11` clears it.
 *
 * 🔴 FIXED LABELS, NOT FLOATING ONES (2026-08-03). The float was broken and the
 * arithmetic is written out above `FIELD` below. Each field is still a real
 * <label for> — it is simply in its own block above the input, where it cannot
 * collide with the value at any width.
 *
 * ERRORS: the action returns a generic code (never "no such account" — that
 * would let someone enumerate accounts). It renders in a `role="alert"` region
 * wired to the fields via `aria-describedby`, and the fields flip
 * `aria-invalid` so a screen reader ties the message to the inputs.
 *
 * The show/hide toggle is a real client control (the fieldset is not disabled).
 * "Keep me signed in" stays removed — with SSR cookie sessions the refresh token
 * already persists, so a checkbox that changed nothing would be the half-live
 * control this codebase refuses. "Forgot your password?" stays a disabled
 * control — that route does not exist yet, and a link is a promise a page exists.
 * There is NO Google button, NO "or continue with", NO sign-up: there is no
 * social auth and no public registration, so none is shown.
 *
 * AUTOCOMPLETE: `username` + `current-password` are the tokens password
 * managers look for to save a sign-in credential pair — preserved verbatim so
 * the reskin does not break saved-credential autofill.
 *
 * 🔴 ON GLASS, THE FILL AND BORDER ALPHAS ARE SOLVED AGAINST THE WORST BACKDROP.
 * The card base is navy at 0.82 over the aurora, so the darkest input surface is
 * ~navy and the lightest (gold blob showing through) still composites dark —
 * cream #F8F4EE on it measures >12:1 either way. The field border is cream/30
 * (a 1px component boundary on the 3:1 non-text bar), going to gold #C9A84C on
 * focus. Both are measured against the card's worst composite — see the report.
 */
/* 🔴 RETIRED WITH THE UNDERLINE FIELDS: the cream/50 bottom-rule derivation.
   It solved a rule that WAS the field's only boundary (cream/30 = 2.27 FAIL,
   cream/50 = 3.56 PASS on the old card). The fields are boxed now, so the
   boundary is a full border and the number is re-derived below against the
   current card. The old finding is kept in git, not carried as a false comment.
*/
/* =============================================================================
   🔴 FIXED LABELS ABOVE THE INPUT. THE FLOATING LABELS ARE GONE, AND THIS IS A
   BUG FIX, NOT A RESTYLE.

   WHAT WAS BROKEN, and it is arithmetic rather than taste. The label was
   `absolute top-3` with a base transform of `-translate-y-6 scale-75`:

     raised position = top 12px − translate 24px = **−12px**

   i.e. the raised label sat TWELVE PIXELS ABOVE ITS OWN CONTAINER, in space
   nothing had reserved. Three consequences, all of which the client hit:
     · on the FIRST field it landed in the subhead above the form;
     · on the password field it landed on the email field's underline;
     · at the moment of focus it crossed THROUGH the input's own text on its way
       up, which is the "label pushes into the input text" report.
   `scale-75` about `origin-[0]` also meant the label's optical left edge shifted
   as it scaled, so the raised and resting states did not align — the "misaligned
   at the end".

   WHY FIXED LABELS RATHER THAN FIXING THE FLOAT. A floating label has to share
   one box with the value, so every fix is a negotiation between two things that
   both want the same 20 pixels; get the padding wrong at one width and they
   collide again. A label in its OWN block cannot overlap the value at any width,
   at any font size, in any locale — the failure mode is removed rather than
   tuned. It also lets the label stay full-size and full-contrast instead of
   shrinking to 75%, which is better for a form people sign into every day.

   The reference's underline+float look is retired with it; the fields are boxed
   now, which is what gives the icon, the value and the show/hide control a
   shared, obvious container.
============================================================================= */
/* 🔴 THE BORDER IS cream/40, AND cream/30 WAS A MEASURED FAIL. With the fields
   boxed, this border IS the input's boundary — a component boundary under
   1.4.11, owing 3:1 against the card's WORST (brightest) composite, rgb(30,40,45).
   Swept: cream/30 = **2.55 FAIL**, cream/35 = 2.97 still short, **cream/40 =
   3.44 PASS**, cream/50 = 4.56 (heavier than this design wants on two fields).
   The same shape of finding the retired underline produced — a plausible-looking
   hairline alpha two steps under the bar. */
const FIELD =
  "block w-full appearance-none rounded-lg border border-cream/40 bg-cream/[0.06] py-3 pl-11 pr-4 text-[15px] text-cream transition-colors duration-200 focus:border-gold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale aria-[invalid=true]:border-[#E9967A] motion-reduce:transition-none";

/** A block-level label in its own row. Cannot collide with the value. */
const LABEL = "mb-2 block text-[13px] font-medium text-cream/85";

/** The leading icon, centred in the input's own box rather than the field group
 *  — `top-1/2 -translate-y-1/2` of the RELATIVE wrapper that holds only the
 *  input, so it stays centred whatever the label above does. */
const ICON =
  "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-cream/55";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      // Gold fill, navy ink — the primary action, at full strength on the dark
      // card. Gold #C9A84C carries navy text at 6.4:1. Hover lifts to gold-pale.
      // The reference's arrow nudges right on hover; `motion-reduce` stops it.
      className="group mt-7 flex h-12 w-full items-center justify-center rounded-full bg-gold text-[15px] font-semibold text-navy transition-colors duration-200 hover:bg-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale disabled:bg-cream/30 disabled:text-navy/70 motion-reduce:transition-none"
    >
      {label}
      <ArrowRight
        aria-hidden="true"
        className="ml-2 h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </button>
  );
}

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("login");
  const [show, setShow] = useState(false);
  const [state, formAction] = useFormState<SignInState, FormData>(
    signIn.bind(null, locale),
    { error: null },
  );

  const hasError = state.error !== null;
  const errorText =
    state.error === "missing"
      ? t("errorMissing")
      : state.error === "throttled"
        ? t("errorThrottled")
        : t("errorInvalid");

  return (
    <form action={formAction} className="mt-8" noValidate>
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">{t("heading")}</legend>

        {/* 🔴 THE ICON IS A SIBLING OF THE INPUT, NOT A CHILD OF THE LABEL.
            It used to live inside the <label> so it would scale and rise with
            the float; with the float gone it belongs in the input's own
            relative box, vertically centred there. `aria-hidden` — the <label>
            already names the field and a decorative glyph must not add a second
            node to the accessibility tree.

            NOTE THE TWO NESTED BOXES: the outer div is the FIELD GROUP (label +
            input stacked); the inner `relative` div wraps ONLY the input, so the
            icon and the show/hide button centre against the input rather than
            against the group's full height. Collapsing these two into one is
            what makes the icon drift down as the label wraps. */}
        <div>
          <label htmlFor="login-email" className={LABEL}>
            {t("emailLabel")}
          </label>
          <div className="relative">
            <User aria-hidden="true" className={ICON} />
            <input
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              aria-invalid={hasError}
              aria-describedby={hasError ? "login-error" : undefined}
              className={FIELD}
            />
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="login-password" className={LABEL}>
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <Lock aria-hidden="true" className={ICON} />
            <input
              id="login-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={hasError}
              aria-describedby={hasError ? "login-error" : undefined}
              className={`${FIELD} pr-[104px]`}
            />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-controls="login-password"
            // Centred on the INPUT (its relative parent), not the field group —
            // the old `bottom-1.5` pinned it to the group's base, which is what
            // left it sitting low and out of line. gold-pale on the dark card.
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded px-2 py-1.5 text-[13px] font-semibold text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
          >
            {show ? t("hidePassword") : t("showPassword")}
          </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          {/* Disabled: /forgot-password does not exist yet. A link is a promise
              that a page exists (routes.ts). gold-pale on dark, dimmed while
              disabled. */}
          <button
            type="button"
            disabled
            className="text-[14px] text-gold-pale underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale disabled:no-underline disabled:opacity-55"
          >
            {t("forgot")}
          </button>
        </div>

        <SubmitButton label={t("submit")} />
      </fieldset>

      {/* Error region. `role="alert"` announces it the moment it appears; it is
          empty (and silent) until the action returns an error. Warm salmon on a
          translucent dark red — #F6C4B6 measures 8.6:1 on the card. */}
      <div id="login-error" role="alert" aria-live="assertive" className="mt-4">
        {hasError ? (
          <p className="rounded-lg border border-[#E9967A]/40 bg-[#5A1E12]/50 px-4 py-3 text-[14px] leading-[1.5] text-[#F6C4B6]">
            {errorText}
          </p>
        ) : null}
      </div>
    </form>
  );
}
