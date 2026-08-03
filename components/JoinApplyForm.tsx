"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { submitApplication, type ApplyState } from "@/app/[locale]/(site)/join/actions";

/**
 * /join §5 — the apply form. Twinned to checkmatefinancialgroup.com/agents#apply.
 *
 * THEIR FIELD SET, read off the live page: first name*, last name*, phone*
 * (placeholder "(000) 000-0000"), email* (placeholder "you@email.com"),
 * residential state* (a 51-option select), "Currently licensed?" as a
 * two-option radio pair named `lic` (Yes / Not yet), "How did you hear about
 * us?" (Select… / Search engine / Social media / Referred by an agent /
 * Recruiter outreach / Industry event / Other), one consent checkbox, and a
 * "Submit Application →" button. Their layout is a `561px + 22 + 561px` grid,
 * copy left and a white form card right, radius 22, padding 40.
 *
 * WE TAKE THE FIELD SET AND THE SPLIT. Not their card colour, not their radius,
 * not their type. Ours is a cream page with an ink form on white fields, our
 * own gap token instead of their 22px, and our own pill.
 *
 * =========================================================================
 * 🔴 IT SUBMITS FOR REAL AS OF 2026-08-03, AND THE SUCCESS STATE IS EARNED.
 *
 * It was a SERVER component with a `disabled` fieldset and no action, because
 * the GHL webhook did not exist and a form that cannot send must not pretend to.
 * The client approved storing applications in Supabase instead, so this is now a
 * client component posting to `submitApplication` (the server action), which
 * validates, rate-limits and inserts into `public.applications`.
 *
 * 🔴 `status === "ok"` IS RETURNED BY THE ACTION ONLY AFTER A ROW EXISTS. There
 * is one success path in that file and it sits after the insert's error check.
 * So the confirmation this component renders cannot appear unless the
 * application is actually stored. Every failure — validation, rate limit, no
 * secret key configured, a rejected insert — renders an error that names the
 * phone number instead. That is the difference between this and the client's own
 * live site, which has three forms that show "Application Received" and post
 * nowhere.
 *
 * ON SUCCESS THE FORM IS REPLACED, NOT LEFT FILLED. Re-rendering populated
 * fields under a success message invites a double submission and reads as if it
 * had not sent. The fieldset unmounts and the confirmation takes its place.
 *
 * ERRORS ARE ANNOUNCED, NOT JUST SHOWN. The status region is `role="status"` for
 * the success case and `role="alert"` for failures, and invalid fields carry
 * `aria-invalid` + `aria-describedby` pointing at it, so a screen reader ties
 * the message to the control the same way LoginForm does.
 *
 * =========================================================================
 * 🔴 TWO THINGS ARE DELIBERATELY NOT REPRODUCED, AND BOTH ARE FLAGGED.
 *
 * 1. THE CONSENT CHECKBOX TEXT. Theirs is TCPA consent language naming THEIR
 *    legal entity. A consent string is a legal instrument — rewording it changes
 *    what the applicant agrees to and with whom. The checkbox is BUILT and its
 *    value IS stored (`applications.consent`), but the LABEL is still the
 *    placeholder key `join.apply.consentPlaceholder` and ships as a visible
 *    "awaiting wording" line. 🔴 THIS IS NOW MORE URGENT THAN IT WAS: the form
 *    used to be inert, so an unworded consent collected nothing. It now records
 *    a boolean against a real person's phone number. Get the wording.
 *
 * 2. THE BBB BADGE. Theirs links to their own accreditation profile. Ours would
 *    be a different profile with a different rating, and neither has arrived.
 *    The SLOT is built and left UNRENDERED. Grep `join-apply-trust`.
 *
 * FOCUS RINGS. The field class carries `focus:border-gold-deep` and NOTHING
 * else — no `focus:outline-none`, no translucent `ring-*`. That pattern measured
 * 1.79:1 on this project and was fixed; reintroducing it here would re-open the
 * same defect one component deeper. The global `:focus-visible` rule draws
 * gold-deep #7D641F, 5.65:1 on the white field and 5.16:1 on the cream ground.
 */

const FIELD =
  "w-full rounded border border-ink/50 bg-white px-3.5 py-2.5 text-[15px] text-ink transition-colors duration-200 focus:border-gold-deep disabled:bg-ink/[0.03] disabled:text-ink/55 aria-[invalid=true]:border-[#8A2A1A]";

/** Disables the whole fieldset while the action is in flight, and swaps the
 *  button label — so a slow network cannot be double-submitted. */
function SubmitRow({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="sem-pill-cta join-apply-submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** The fields, wrapped so `useFormStatus` can disable them during submission.
 *  `useFormStatus` only reports for the nearest ancestor <form>, so it has to be
 *  read from a child component, not from the component rendering the form. */
function Fields({
  t,
  invalid,
  describedBy,
}: {
  t: ReturnType<typeof useTranslations>;
  invalid: Set<string>;
  describedBy?: string;
}) {
  const { pending } = useFormStatus();
  const bad = (name: string) =>
    invalid.has(name) ? ({ "aria-invalid": true, "aria-describedby": describedBy } as const) : {};

  return (
    <fieldset disabled={pending} className="join-apply-fieldset">
      <legend className="sr-only">{t("apply.legend")}</legend>

      {/* Their two-up pairing: first + last on one row. */}
      <div className="join-field-pair">
        <div className="join-field">
          <label className="join-label" htmlFor="ja-first">
            {t("apply.firstName")}
          </label>
          <input
            id="ja-first"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            maxLength={100}
            className={FIELD}
            {...bad("firstName")}
          />
        </div>
        <div className="join-field">
          <label className="join-label" htmlFor="ja-last">
            {t("apply.lastName")}
          </label>
          <input
            id="ja-last"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            maxLength={100}
            className={FIELD}
            {...bad("lastName")}
          />
        </div>
      </div>

      <div className="join-field-pair">
        <div className="join-field">
          <label className="join-label" htmlFor="ja-phone">
            {t("apply.phone")}
          </label>
          <input
            id="ja-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={32}
            placeholder={t("apply.phonePlaceholder")}
            className={FIELD}
            {...bad("phone")}
          />
        </div>
        <div className="join-field">
          <label className="join-label" htmlFor="ja-email">
            {t("apply.email")}
          </label>
          <input
            id="ja-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder={t("apply.emailPlaceholder")}
            className={FIELD}
            {...bad("email")}
          />
        </div>
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="ja-state">
          {t("apply.state")}
        </label>
        {/* Their select is 51 options. The state list is data, not copy, and is
            generated rather than transcribed from their markup. The server
            re-checks the value against the same list — a <select> is not a
            validation boundary. */}
        <select
          id="ja-state"
          name="state"
          defaultValue=""
          required
          className={FIELD}
          {...bad("state")}
        >
          <option value="" disabled>
            {t("apply.statePlaceholder")}
          </option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 🔴 A RADIOGROUP, NOT TWO LOOSE CHECKBOXES. Theirs is a radio pair
          named `lic`, and a fieldset+legend is what makes a two-option choice
          announce as one control with a name — a screen reader reads
          "Currently licensed? Yes, radio button, 1 of 2". Two checkboxes
          would announce as two unrelated yes/no toggles. */}
      <fieldset className="join-radiogroup">
        <legend className="join-label">{t("apply.licensed")}</legend>
        <div className="join-radio-row">
          <div className="join-radio">
            <input
              id="ja-lic-yes"
              name="licensed"
              type="radio"
              value="yes"
              required
              className="join-radio-input"
              {...bad("licensed")}
            />
            <label htmlFor="ja-lic-yes">{t("apply.licensedYes")}</label>
          </div>
          <div className="join-radio">
            <input
              id="ja-lic-no"
              name="licensed"
              type="radio"
              value="no"
              className="join-radio-input"
            />
            <label htmlFor="ja-lic-no">{t("apply.licensedNo")}</label>
          </div>
        </div>
      </fieldset>

      <div className="join-field">
        <label className="join-label" htmlFor="ja-hear">
          {t("apply.hear")}
        </label>
        {/* OPTIONAL — no `required`. The server accepts empty and validates any
            non-empty value against the `agent_heard` enum. */}
        <select id="ja-hear" name="hear" defaultValue="" className={FIELD} {...bad("hear")}>
          <option value="">{t("apply.hearPlaceholder")}</option>
          {HEAR_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {t(`apply.hearOptions.${k}`)}
            </option>
          ))}
        </select>
      </div>

      {/* 🔴 CONSENT — BUILT, VALUE STORED, WORDING STILL PENDING. See the header
          note. The label renders the placeholder string so the gap is VISIBLE on
          the page rather than being an empty checkbox nobody notices. */}
      <div className="join-consent">
        <input id="ja-consent" name="consent" type="checkbox" className="join-check" />
        <label htmlFor="ja-consent">{t("apply.consentPlaceholder")}</label>
      </div>

      <SubmitRow label={t("apply.submit")} pendingLabel={t("apply.submitting")} />
    </fieldset>
  );
}

export default function JoinApplyForm() {
  const t = useTranslations("join");
  const [state, formAction] = useFormState<ApplyState, FormData>(submitApplication, {
    status: "idle",
  });

  const invalid = new Set(state.fields ?? []);
  const failed = state.status === "error";
  const errorText = failed
    ? state.error === "throttled"
      ? t("apply.errorThrottled")
      : state.error === "unavailable"
        ? t("apply.errorUnavailable")
        : state.error === "failed"
          ? t("apply.errorFailed")
          : t("apply.errorInvalid")
    : null;

  // SUCCESS REPLACES THE FORM. See the header note — leaving populated fields
  // under a confirmation invites a second submission.
  if (state.status === "ok") {
    return (
      <div className="join-apply-form">
        <div role="status" className="join-apply-status">
          <p className="join-apply-status-title">{t("apply.successTitle")}</p>
          <p className="join-apply-status-body">{t("apply.successBody")}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="join-apply-form" noValidate>
      <Fields t={t} invalid={invalid} describedBy={failed ? "join-apply-status" : undefined} />

      {/* `role="alert"` so a failure is announced the moment it appears. Empty
          and silent until the action returns one. */}
      <div id="join-apply-status" role="alert" aria-live="assertive">
        {errorText ? (
          <div className="join-apply-status">
            <p className="join-apply-status-body">{errorText}</p>
          </div>
        ) : null}
      </div>

      {/* 🔴 TRUST SLOT — BBB accreditation. Built and intentionally EMPTY.
          Renders nothing until the client supplies the rating and the profile
          URL. Do not fill this with Checkmate's seal: theirs links to their own
          profile, which is a different company's accreditation.
          <div className="join-apply-trust"> … </div> */}
    </form>
  );
}

const HEAR_OPTIONS = ["search", "social", "referral", "event", "other"] as const;

/** State list is DATA, not copy — enumerated here rather than transcribed from
 *  the reference's markup, and identical in content because a list of US states
 *  is a fact rather than an authored string. The server holds the same list and
 *  re-checks against it. */
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho",
  "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
  "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah",
  "Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
] as const;
