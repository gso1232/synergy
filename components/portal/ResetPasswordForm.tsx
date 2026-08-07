"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  setNewPassword,
  type ResetState,
} from "@/app/[locale]/(portal)/reset-password/actions";
import { ALERT, FIELD, ICON, LABEL, SUBMIT } from "./authStyles";

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
 * Set a new password from a recovery link.
 *
 * 🔴 THERE IS NO TOKEN FIELD IN THIS FORM, AND THERE MUST NOT BE. Authority
 * comes from the recovery SESSION that /auth/callback already exchanged into
 * cookies. A token carried in a form field is a token in browser history, in
 * the Referer header of any outbound link, and in anything that scrapes form
 * state. The action re-verifies the session with `getUser()` and fails closed if
 * it is missing or expired.
 *
 * There is no success branch here: the action redirects to /login on success,
 * because it signs the session out immediately after the change (see its
 * docblock — a recovery link is a credential delivered to an inbox, and leaving
 * a live session behind would let anyone who can read that mailbox stay inside
 * the portal). The user re-enters through the front door, where the domain and
 * account-status gates apply again.
 *
 * The confirm field is compared SERVER-SIDE, not just in the browser: a
 * client-only check is a typo-catcher, not a control, and it is trivially
 * skipped by posting the form directly.
 */
export default function ResetPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("reset");
  const [show, setShow] = useState(false);
  const [state, formAction] = useFormState<ResetState, FormData>(
    setNewPassword.bind(null, locale),
    { status: "idle" },
  );

  const hasError = state.status === "error";
  const errorText = hasError
    ? state.error === "mismatch"
      ? t("errorMismatch")
      : state.error === "weak"
        ? t("errorWeak")
        : state.error === "expired"
          ? t("errorExpired")
          : state.error === "missing"
            ? t("errorMissing")
            : t("errorFailed")
    : "";

  return (
    <form action={formAction} className="mt-8" noValidate>
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">{t("heading")}</legend>

        <div>
          <label htmlFor="reset-password" className={LABEL}>
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <Lock aria-hidden="true" className={ICON} />
            <input
              id="reset-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              minLength={10}
              required
              aria-invalid={hasError}
              aria-describedby="reset-password-hint"
              className={`${FIELD} pr-[104px]`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
              aria-controls="reset-password"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded px-2 py-1.5 text-[13px] font-semibold text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
            >
              {show ? t("hidePassword") : t("showPassword")}
            </button>
          </div>
          <p id="reset-password-hint" className="mt-2 text-[13px] leading-[1.5] text-cream/65">
            {t("passwordHint")}
          </p>
        </div>

        <div className="mt-5">
          <label htmlFor="reset-confirm" className={LABEL}>
            {t("confirmLabel")}
          </label>
          <div className="relative">
            <Lock aria-hidden="true" className={ICON} />
            <input
              id="reset-confirm"
              name="confirm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              minLength={10}
              required
              aria-invalid={hasError}
              aria-describedby={hasError ? "reset-error" : undefined}
              className={FIELD}
            />
          </div>
        </div>

        <SubmitButton label={t("submit")} />
      </fieldset>

      <div id="reset-error" role="alert" aria-live="assertive" className="mt-4">
        {hasError ? <p className={ALERT}>{errorText}</p> : null}
      </div>
    </form>
  );
}
