import { getTranslations } from "next-intl/server";

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
 * 🔴 TWO THINGS ARE DELIBERATELY NOT REPRODUCED, AND BOTH ARE FLAGGED.
 *
 * 1. THE CONSENT CHECKBOX TEXT. Theirs reads, in part, "you authorize Checkmate
 *    Financial Group LLC to text/call the number above… Msg/data rates apply…
 *    Text HELP for help and STOP to unsubscribe." That is TCPA consent
 *    language. It names THEIR legal entity, and a consent string is a legal
 *    instrument — it is not copy that gets reworded into our voice, because
 *    rewording it changes what the applicant is agreeing to and who they are
 *    agreeing with. The checkbox is BUILT; the string is the placeholder key
 *    `join.apply.consentPlaceholder` and ships as a visible "awaiting wording"
 *    line. The client has confirmed a consent is needed; the wording and the
 *    entity name have not arrived.
 *
 * 2. THE BBB BADGE. Theirs is an <a class="bbb-seal"> to
 *    `bbb.org/us/fl/orlando/profile/life-insurance/checkmate-financia…` — their
 *    own accreditation profile. Ours would be a different profile with a
 *    different rating, and neither the rating nor the link has arrived. The
 *    SLOT is built and left UNRENDERED rather than filled with theirs or with a
 *    guess. Grep `join-apply-trust` to find it.
 *
 * =========================================================================
 * 🔴 THERE IS NO SUBMIT DESTINATION AND THEREFORE NO SUCCESS STATE.
 *
 * This is a SERVER component. No "use client", no state, no handler, no
 * `action`, no `method`. There is no code path that can show a confirmation,
 * because there is nothing to confirm. The fields are fully visible and the
 * <fieldset> is `disabled`, exactly as ContactForm does it.
 *
 * That is not caution for its own sake — the client's own live site has THREE
 * forms that render a success message and post nowhere. We are not shipping a
 * fourth. The day an endpoint exists: wire the POST, drop `disabled` from the
 * fieldset and the button, add validation, error states AND a success state,
 * and swap this notice for the real consent line.
 *
 * FOCUS RINGS. The field class carries `focus:border-gold-deep` and NOTHING
 * else — no `focus:outline-none`, no translucent `ring-*`. That pattern
 * measured 1.79:1 on this project and was fixed; reintroducing it here would
 * re-open the same defect one component deeper. The global `:focus-visible`
 * rule draws gold-deep #7D641F, which is 5.65:1 on the white field and 5.16:1
 * on the cream ground the checkbox and radios sit on.
 */
export default async function JoinApplyForm({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "join" });

  const field =
    "w-full rounded border border-ink/50 bg-white px-3.5 py-2.5 text-[15px] text-ink transition-colors duration-200 focus:border-gold-deep disabled:bg-ink/[0.03] disabled:text-ink/55";

  const hearOptions = ["search", "social", "referral", "event", "other"] as const;

  return (
    <form aria-describedby="join-apply-status" className="join-apply-form">
      <fieldset disabled className="join-apply-fieldset">
        <legend className="sr-only">{t("apply.legend")}</legend>

        {/* Their two-up pairing: first + last on one row. */}
        <div className="join-field-pair">
          <div className="join-field">
            <label className="join-label" htmlFor="ja-first">
              {t("apply.firstName")}
            </label>
            <input id="ja-first" name="firstName" type="text" autoComplete="given-name" className={field} />
          </div>
          <div className="join-field">
            <label className="join-label" htmlFor="ja-last">
              {t("apply.lastName")}
            </label>
            <input id="ja-last" name="lastName" type="text" autoComplete="family-name" className={field} />
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
              placeholder={t("apply.phonePlaceholder")}
              className={field}
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
              placeholder={t("apply.emailPlaceholder")}
              className={field}
            />
          </div>
        </div>

        <div className="join-field">
          <label className="join-label" htmlFor="ja-state">
            {t("apply.state")}
          </label>
          {/* Their select is 51 options. Ours ships the same field with our own
              placeholder option; the state list is data, not copy, and is
              generated rather than transcribed from their markup. */}
          <select id="ja-state" name="state" defaultValue="" className={field}>
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
              <input id="ja-lic-yes" name="licensed" type="radio" value="yes" className="join-radio-input" />
              <label htmlFor="ja-lic-yes">{t("apply.licensedYes")}</label>
            </div>
            <div className="join-radio">
              <input id="ja-lic-no" name="licensed" type="radio" value="no" className="join-radio-input" />
              <label htmlFor="ja-lic-no">{t("apply.licensedNo")}</label>
            </div>
          </div>
        </fieldset>

        <div className="join-field">
          <label className="join-label" htmlFor="ja-hear">
            {t("apply.hear")}
          </label>
          <select id="ja-hear" name="hear" defaultValue="" className={field}>
            <option value="" disabled>
              {t("apply.hearPlaceholder")}
            </option>
            {hearOptions.map((k) => (
              <option key={k} value={k}>
                {t(`apply.hearOptions.${k}`)}
              </option>
            ))}
          </select>
        </div>

        {/* 🔴 CONSENT — BUILT, WORDING PENDING. See the header note. The label
            renders the placeholder string so the gap is VISIBLE on the page
            rather than being an empty checkbox nobody notices. */}
        <div className="join-consent">
          <input id="ja-consent" name="consent" type="checkbox" className="join-check" />
          <label htmlFor="ja-consent">{t("apply.consentPlaceholder")}</label>
        </div>

        <button type="submit" disabled className="sem-pill-cta join-apply-submit">
          {t("apply.submit")}
        </button>
      </fieldset>

      {/* The plain notice, `role="status"` so it is announced and not merely
          seen. Identical in role to ContactForm's. */}
      <div id="join-apply-status" role="status" className="join-apply-status">
        <p className="join-apply-status-title">{t("apply.disabledTitle")}</p>
        <p className="join-apply-status-body">{t("apply.disabledBody")}</p>
      </div>

      {/* 🔴 TRUST SLOT — BBB accreditation. Built and intentionally EMPTY.
          Renders nothing until the client supplies the rating and the profile
          URL. Do not fill this with Checkmate's seal: theirs links to their own
          profile, which is a different company's accreditation.
          <div className="join-apply-trust"> … </div> */}
    </form>
  );
}

/** State list is DATA, not copy — enumerated here rather than transcribed from
 *  the reference's markup, and identical in content because a list of US states
 *  is a fact rather than an authored string. */
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
