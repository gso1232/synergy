"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  submitContact,
  type ContactState,
} from "@/app/[locale]/(site)/contact/actions";

/**
 * The contact form.
 *
 * =============================================================================
 * 🔴 IT NOW SUBMITS FOR REAL — BUT ONLY WHEN THERE IS SOMEWHERE TO SUBMIT TO.
 * 2026-08-16. The `enabled` prop is the whole story, and it is computed on the
 * server by `contactIntakeReady()`: true when a GoHighLevel webhook URL AND a
 * Supabase secret key are both present in the environment.
 *
 *   enabled === false  the form renders EXACTLY as it did before this change —
 *                      `disabled` fieldset, disabled button, and the
 *                      "This form isn't connected yet" notice in place of the
 *                      legal line. Nothing about the live site changes until
 *                      the webhook exists.
 *   enabled === true   the fieldset unlocks, the action runs, and the success
 *                      and error states below become reachable.
 *
 * So the day the webhook arrives, NOTHING IN THIS FILE HAS TO BE EDITED. That
 * was the point: the four-step "the day the webhook arrives" checklist this
 * docblock used to carry is now done, and the trigger is an environment
 * variable rather than a code change.
 *
 * =============================================================================
 * 🔴 THE OLD RULE STILL HOLDS AND IS NOW ENFORCED BY THE SERVER, NOT BY A
 * DISABLED ATTRIBUTE. This form's ancestor bug — `preventDefault();
 * setSent(true)`, which showed "Thanks, we'll be in touch" while sending
 * nothing — is impossible here for a structural reason: `status === "ok"` is
 * returned by `submitContact` at exactly one place, AFTER the row exists in
 * `public.leads`. The success block below cannot render before a lead has been
 * stored. A fake success is worse than a visibly broken form, because the
 * client believes a lead was captured and it silently was not.
 *
 * 🔴 A CRM OUTAGE DOES NOT BECOME AN ERROR HERE, AND THAT IS CORRECT. The
 * action stores the lead first and forwards to GoHighLevel second; if the
 * webhook times out the row is still committed and flagged for follow-up. The
 * visitor is told it sent because it did — telling them otherwise would push
 * them to submit again and duplicate a lead that was already captured.
 *
 * =============================================================================
 * ON SUCCESS THE FORM IS REPLACED, NOT LEFT FILLED. Re-rendering populated
 * fields under a success message invites a double submission and reads as if it
 * had not sent. Same behaviour as JoinApplyForm.
 *
 * ERRORS ARE ANNOUNCED, NOT JUST SHOWN. The status region is `role="status"`
 * for success and `role="alert"` for failure, and invalid fields carry
 * `aria-invalid` + `aria-describedby` pointing at it.
 *
 * =============================================================================
 * WHAT IS UNCHANGED FROM THE DISABLED VERSION, and must stay unchanged: every
 * label, placeholder, class name, the select's eight options, the two consent
 * strings and the legal line. Those were measured against the reference form
 * and signed off; this change is about wiring, not about copy. The long note on
 * how the field set was measured lives in git history at 6e2c3c9 if it is ever
 * needed again — it recorded that the reference ships nine fields with real
 * `<label for=...>` plus placeholders, that our single name field and our
 * "Select a product…" string are deliberate divergences, and that a placeholder
 * is a hint and never the label.
 */

const products = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"] as const;

/* `focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/45` —
   REMOVED. It opted OUT of the global focus ring and replaced it with a
   45%-alpha one, which is not a colour: over the white field it composites to
   #C5B99A, and #C5B99A on #FFFFFF is 1.95:1 — below the 3:1 of 1.4.11.
   🔴 THAT FIX IS LOAD-BEARING NOW. It was unreachable while the fieldset was
   `disabled` (no field could take focus), which is why the accessibility sweep
   could not see it. With the form live these rings are on screen for real, and
   the global rule gives them gold-deep #0066CC at 5.65:1 on the white field.

   `focus:border-gold-deep` is KEPT — the field's own affordance, not the focus
   indicator, and at 5.65:1 it reinforces rather than replaces.

   `text-[16px] md:text-[15px]` is the iOS zoom-on-focus fix, matched to
   JoinApplyForm's FIELD: mobile Safari zooms the page in when a field under
   16px takes focus and never zooms back out. */
const field =
  "w-full rounded border border-ink/50 bg-white px-3.5 py-2.5 text-[16px] text-ink transition-colors duration-200 focus:border-gold-deep disabled:bg-ink/[0.03] disabled:text-ink/55 md:text-[15px]";

/**
 * Disables the fieldset while the action is in flight and swaps the button
 * label, so a slow network cannot be double-submitted. Must be a CHILD of the
 * <form> — `useFormStatus` reads the nearest form above it and returns a
 * permanent `false` when called in the same component that renders the form.
 */
function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="sem-pill-cta contact-submit">
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function ContactForm({
  locale,
  enabled,
}: {
  locale: string;
  /** Computed server-side by `contactIntakeReady()`. See the docblock. */
  enabled: boolean;
}) {
  const t = useTranslations("contact");
  const [state, formAction] = useFormState<ContactState, FormData>(submitContact, {
    status: "idle",
  });

  const invalid = (name: string) =>
    state.status === "error" && state.fields?.includes(name);

  /* ---- SUCCESS. The fieldset is gone, not merely covered. ---- */
  if (state.status === "ok") {
    return (
      <div className="contact-form">
        <div id="contact-form-status" role="status" className="contact-status">
          <p className="contact-status-title">{t("form.successTitle")}</p>
          <p className="contact-status-body">{t("form.successBody")}</p>
        </div>
      </div>
    );
  }

  const errorMessage =
    state.status === "error"
      ? t(
          state.error === "invalid"
            ? "form.errorInvalid"
            : state.error === "throttled"
              ? "form.errorThrottled"
              : state.error === "unavailable"
                ? "form.errorUnavailable"
                : "form.errorFailed",
        )
      : null;

  return (
    <form
      action={enabled ? formAction : undefined}
      aria-describedby="contact-form-status"
      className="contact-form"
    >
      {/* NO VISIBLE HEADING HERE. The page supplies it (`contact.agentHeading`
          at `sem-h3`) and `form.heading` stays as the fieldset's sr-only legend
          below, so the form is still named for a screen reader. */}
      <p className="contact-optional">{t("form.optionalNote")}</p>

      {/* The visitor's language rides along so the CRM can route to a bilingual
          agent. Hidden rather than derived server-side from the URL because the
          action is shared by both locales and a hidden field is the one value
          that cannot drift from the page the visitor actually filled in. */}
      <input type="hidden" name="locale" value={locale} />

      <fieldset disabled={!enabled} className="contact-fieldset">
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
            aria-invalid={invalid("name") || undefined}
            aria-describedby={invalid("name") ? "contact-form-status" : undefined}
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
            /* The one required field, and the only one `required` may sit on —
               `contact.form.optionalNote` promises the visitor that everything
               else is optional, and the server validates to match. */
            required
            aria-invalid={invalid("email") || undefined}
            aria-describedby={invalid("email") ? "contact-form-status" : undefined}
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
            aria-invalid={invalid("phone") || undefined}
            aria-describedby={invalid("phone") ? "contact-form-status" : undefined}
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
            aria-invalid={invalid("message") || undefined}
            aria-describedby={invalid("message") ? "contact-form-status" : undefined}
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

        {enabled ? (
          <SubmitButton label={t("form.submit")} pendingLabel={t("form.submitting")} />
        ) : (
          <button type="submit" disabled className="sem-pill-cta contact-submit">
            {t("form.submit")}
          </button>
        )}
      </fieldset>

      {/* ONE STATUS REGION, THREE JOBS — and the role changes with the job.
          `alert` for a failure (interrupts, because the visitor must act),
          `status` for the not-connected notice (polite, it is a caveat). The id
          is stable because `aria-describedby` on the form and on every invalid
          field points at it. */}
      {errorMessage ? (
        <div id="contact-form-status" role="alert" className="contact-status">
          <p className="contact-status-body">{errorMessage}</p>
        </div>
      ) : !enabled ? (
        <div id="contact-form-status" role="status" className="contact-status">
          <p className="contact-status-title">{t("form.disabledTitle")}</p>
          <p className="contact-status-body">{t("form.disabledBody")}</p>
        </div>
      ) : (
        <div id="contact-form-status" role="status" className="sr-only" />
      )}

      <p className="contact-legal">{t("form.legalNote")}</p>
    </form>
  );
}
