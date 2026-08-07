"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  requestReset,
  type ForgotState,
} from "@/app/[locale]/(portal)/forgot-password/actions";
import { ALERT, FIELD, ICON, LABEL, NOTE, SUBMIT } from "./authStyles";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={SUBMIT}>
      {label}
      <ArrowRight
        aria-hidden="true"
        className="ml-2 h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </button>
  );
}

/**
 * 🔴 THE SUCCESS MESSAGE IS CAREFULLY WORDED, AND THE WORDING IS THE SECURITY
 * CONTROL.
 *
 * It says "if an account exists for that address, we've sent a link" — never
 * "we've sent you a link". The action already returns the identical `sent` for a
 * real address, an unknown one and an internal failure (see
 * forgot-password/actions.ts); copy that asserted an email had definitely gone
 * out would leak the same fact the uniform response exists to hide, one layer
 * up. The form is REPLACED on success so the field cannot be resubmitted to
 * probe a second address as fast as the limiter allows.
 */
export default function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("forgot");
  const [state, formAction] = useFormState<ForgotState, FormData>(
    requestReset.bind(null, locale),
    { status: "idle" },
  );

  if (state.status === "sent") {
    return (
      <div role="status" className={`mt-8 ${NOTE}`}>
        {t("sent")}
      </div>
    );
  }

  const hasError = state.status === "error";
  const errorText = hasError
    ? state.error === "throttled"
      ? t("errorThrottled")
      : t("errorMissing")
    : "";

  return (
    <form action={formAction} className="mt-8" noValidate>
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">{t("heading")}</legend>

        <div>
          <label htmlFor="forgot-email" className={LABEL}>
            {t("emailLabel")}
          </label>
          <div className="relative">
            <Mail aria-hidden="true" className={ICON} />
            <input
              id="forgot-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              aria-invalid={hasError}
              aria-describedby={hasError ? "forgot-error" : undefined}
              className={FIELD}
            />
          </div>
        </div>

        <SubmitButton label={t("submit")} />
      </fieldset>

      <div id="forgot-error" role="alert" aria-live="assertive" className="mt-4">
        {hasError ? <p className={ALERT}>{errorText}</p> : null}
      </div>
    </form>
  );
}
