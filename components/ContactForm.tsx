import { getTranslations } from "next-intl/server";

/**
 * The contact form — PRESENT, COMPLETE, AND VISIBLY DISABLED.
 *
 * 🔴 THERE IS NO BACKEND. The GHL webhook is still unblocked, so nothing this
 * form collects can go anywhere. It follows the pattern already established by
 * `components/LeadModal.tsx`, which was itself a FIX: that modal used to run
 * `preventDefault(); setSent(true)` and show "Thanks — we'll be in touch" while
 * sending nothing. A fake success is worse than a visibly broken form, because
 * the client believes a lead was captured and it silently was not.
 *
 * 🔴 THERE IS NO SUCCESS STATE IN THIS FILE AT ALL, AND THAT IS DELIBERATE
 * SEQUENCING RATHER THAN AN OMISSION. A success message is only written when
 * the POST exists, so there is no code path that can reach one before there is
 * something to succeed at. Adding it now — even behind a flag — would recreate
 * exactly the bug that was fixed.
 *
 * THE DAY THE WEBHOOK ARRIVES, four things change and nothing else:
 *   1. wire the POST to the GHL endpoint
 *   2. drop `disabled` from the <fieldset> and the submit button
 *   3. add a real onSubmit with validation, error states and a success state
 *   4. swap the notice below for `contact.form.legalNote`
 * The markup, labels, focus rings, error styling and select options are final.
 *
 * 🔴 THE EARLIER NOTE HERE WAS WRONG AND IS CORRECTED. It read: "reyou.life
 * /contact ships five fields with placeholders and NO <label> elements —
 * measured." Re-measured today against the hosted form itself
 * (link.psyclecrm.com/widget/form/jr1reKcGmDwPsRIYnsre, which is what their
 * page embeds), that is not what they ship:
 *
 *   NINE visible fields, not five: First Name*, Last Name*, Email Address*,
 *   Phone Number*, Condition, Preferred Location*, Specific treatment,
 *   Insurance to verify, Your Message — plus two consent checkboxes.
 *
 *   EVERY ONE HAS A REAL <label for=...>, 15/27 w400, mb 8, full ink. They
 *   carry a placeholder AS WELL as the label, not instead of it.
 *
 * The first pass measured the parent page, where the form is an off-canvas
 * iframe at x=-9967, and read the visible placeholder text without reaching
 * the labels inside it.
 *
 * So our labels are NOT a divergence from them — we agree.
 *
 * THEIR PLACEHOLDERS NOW SHIP TOO, on the client's instruction. Every field
 * carries BOTH, exactly as theirs does. Measured and taken verbatim where the
 * field is the same:
 *
 *   theirs "Enter your first name" / "Enter your last name"  -> ours
 *          "Enter your name", because we ship ONE name field, not two
 *   theirs "Enter your email address"                        -> verbatim
 *   theirs "Enter your phone number"                         -> verbatim
 *   theirs "What would you like us to know"                  -> verbatim,
 *          including their missing question mark
 *
 * 🔴 DELIBERATE DIVERGENCE — THE SELECT KEEPS OUR STRING. Client decision,
 * on the record: theirs reads "Select one of the options" on all four of their
 * dropdowns, which names nothing — it describes the ACT of choosing rather than
 * what is being chosen from. Ours reads "Select a product…", which says what
 * the list contains. Matching the reference is not worth trading a specific
 * string for a vague one, so `form.productPlaceholder` stands as ours.
 *
 * This is the same call as the field contrast below and the labels above: take
 * their anatomy, refuse the parts that are worse. Do NOT "fix" this on a future
 * re-measure — it is a decision, not drift.
 *
 * 🔴 A PLACEHOLDER IS A HINT, NEVER THE LABEL. It is still true that a
 * placeholder disappears the moment the field has content and fails anyone
 * returning to check what they typed — which is why every <label> below stays
 * exactly where it was. Nothing was removed to make room for these. The
 * placeholder colour is #767676 (4.54:1, AA) rather than their 0.3-alpha ink
 * at ~1.9:1; the contrast table is in globals.css.
 *
 * ⚠️ SPANISH IS EMPTY, AS THE WHOLE NAMESPACE ALREADY IS. The four new keys
 * are present in `messages/es.json` as "" to match every other string in
 * `contact` — that namespace is untranslated and awaiting the client.
 *
 * VERIFIED ON /es/contact RATHER THAN ASSUMED: an empty string falls back to
 * the English message, so the Spanish page renders "Enter your email address"
 * — exactly as it already renders "Email address" for the label, "Let Us
 * Protect Your Family" for the h1 and "Request My Free Quote" for the submit.
 * The placeholders are in the same untranslated state as every string around
 * them. They neither improve nor worsen it; the namespace lands as one piece.
 *
 * ERRORS CARRY TEXT, NOT COLOUR. `.contact-field-error` renders a symbol and a
 * sentence, not a red border alone. The rule is dormant until step 3 above, but
 * the styling is in place so the wiring pass cannot forget it.
 *
 * 🔴 THE LEGAL NOTE'S DOCUMENT NAMES ARE NOT LINKED. fflsynergy's own form links
 * "Privacy Policy" and "Terms of Service"; on this site both routes are BLOCKED
 * — they are legal documents that must come from the client. A link to a 404 is
 * worse than a name without a link, so the sentence ships with the names in
 * plain text. Link them the day the documents land.
 */
export default async function ContactForm({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "contact" });
  const products = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"] as const;

  // `focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/45`
  // — REMOVED. This opted OUT of the global focus ring and replaced it with a
  // 45%-alpha one, which is not a colour: over the white field it composites
  // to #C5B99A, and #C5B99A on #FFFFFF is 1.95:1 — below the 3:1 of 1.4.11,
  // i.e. the same defect as the old gold global, one component deeper.
  //
  // Not reachable TODAY (the <fieldset> below is `disabled`, so none of these
  // fields take focus at all), which is why the sweep could not see it. Fixed
  // now rather than left as a trap for whoever flips the fieldset on: the
  // global rule gives these gold-deep #7D641F at 5.65:1 on the white field.
  //
  // `focus:border-gold-deep` is KEPT — it is the field's own affordance, not
  // the focus indicator, and at 5.65:1 it reinforces rather than replaces.
  const field =
    "w-full rounded border border-ink/50 bg-white px-3.5 py-2.5 text-[15px] text-ink transition-colors duration-200 focus:border-gold-deep disabled:bg-ink/[0.03] disabled:text-ink/55";

  return (
    <form
      // No action, no method, no handler. This is a server component: there is
      // no client JS attached to it at all, so it cannot submit or fake one.
      aria-describedby="contact-form-status"
      className="contact-form"
    >
      {/* NO VISIBLE HEADING HERE ANY MORE. Their right column carries ONE
          heading above the form; ours carried two — the section heading and
          this one. The page supplies the heading now (`contact.agentHeading` at
          `sem-h3`, their h3 step) and `form.heading` stays as the fieldset's
          sr-only legend below, so the form is still named for a screen reader. */}
      <p className="contact-optional">{t("form.optionalNote")}</p>

      <fieldset disabled className="contact-fieldset">
        <legend className="sr-only">{t("form.heading")}</legend>

        <div className="contact-row">
          <label className="contact-label" htmlFor="cf-name">
            {t("form.nameLabel")}{" "}
            <span className="contact-optional-tag">
              {t("form.optionalSuffix")}
            </span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={t("form.namePlaceholder")}
            className={field}
          />
        </div>

        <div className="contact-row">
          <label className="contact-label" htmlFor="cf-email">
            {t("form.emailLabel")}
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("form.emailPlaceholder")}
            className={field}
          />
        </div>

        <div className="contact-row">
          <label className="contact-label" htmlFor="cf-phone">
            {t("form.phoneLabel")}{" "}
            <span className="contact-optional-tag">
              {t("form.optionalSuffix")}
            </span>
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t("form.phonePlaceholder")}
            className={field}
          />
        </div>

        <div className="contact-row">
          <label className="contact-label" htmlFor="cf-product">
            {t("form.productLabel")}{" "}
            <span className="contact-optional-tag">
              {t("form.optionalSuffix")}
            </span>
          </label>
          <select id="cf-product" name="product" className={field} defaultValue="">
            <option value="">{t("form.productPlaceholder")}</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {t(`form.${p}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="contact-row">
          <label className="contact-label" htmlFor="cf-message">
            {t("form.messageLabel")}{" "}
            <span className="contact-optional-tag">
              {t("form.optionalSuffix")}
            </span>
          </label>
          <textarea
            id="cf-message"
            name="message"
            rows={4}
            placeholder={t("form.messagePlaceholder")}
            className={field}
          />
        </div>

        {/* CONSENT — both strings are fflsynergy's verbatim. An SMS consent is a
            legal string: it ships exactly as published or not at all. */}
        <div className="contact-consent">
          <input id="cf-sms" name="sms" type="checkbox" className="contact-check" />
          <label htmlFor="cf-sms">{t("form.smsConsent")}</label>
        </div>
        <div className="contact-consent">
          <input id="cf-marketing" name="marketing" type="checkbox" className="contact-check" />
          <label htmlFor="cf-marketing">{t("form.emailConsent")}</label>
        </div>

        <button type="submit" disabled className="sem-pill-cta contact-submit">
          {t("form.submit")}
        </button>
      </fieldset>

      {/* THE NOTICE REPLACES THE LEGAL LINE WHILE THE FORM IS INERT, exactly as
          LeadModal does. `role="status"` so it is announced rather than being a
          silent visual caveat. */}
      <div id="contact-form-status" role="status" className="contact-status">
        <p className="contact-status-title">{t("form.disabledTitle")}</p>
        <p className="contact-status-body">{t("form.disabledBody")}</p>
      </div>

      <p className="contact-legal">{t("form.legalNote")}</p>
    </form>
  );
}
