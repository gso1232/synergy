"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { signUp, type SignUpState } from "@/app/[locale]/(portal)/signup/actions";
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
 * The sign-up form.
 *
 * 🔴 ON SUCCESS THE FORM IS REPLACED, NOT RESET. `status === "sent"` swaps the
 * whole fieldset for a "check your inbox" note. Leaving the form on screen
 * invites a second submission, and every submission costs an email from the
 * project's allowance.
 *
 * 🔴 THE SUCCESS COPY MUST NOT SAY "ACCOUNT CREATED". The action returns the
 * same `sent` whether the address was new, already registered, or failed inside
 * Supabase — that uniformity is what stops signup being an account-enumeration
 * oracle (see signup/actions.ts). The message therefore describes the EMAIL, not
 * the account: "if that address is eligible, a link is on its way". Wording that
 * confirmed an account existed would undo the protection the action is built
 * around.
 *
 * `autocomplete="new-password"` (not `current-password`) so password managers
 * offer to GENERATE rather than autofill an existing credential.
 */
export default function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("signup");
  const [show, setShow] = useState(false);
  const [state, formAction] = useFormState<SignUpState, FormData>(
    signUp.bind(null, locale),
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
    ? state.error === "domain"
      ? t("errorDomain")
      : state.error === "weak"
        ? t("errorWeak")
        : state.error === "throttled"
          ? t("errorThrottled")
          : t("errorMissing")
    : "";

  return (
    <form action={formAction} className="mt-8" noValidate>
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">{t("heading")}</legend>

        <div>
          <label htmlFor="signup-name" className={LABEL}>
            {t("nameLabel")}
          </label>
          <div className="relative">
            <User aria-hidden="true" className={ICON} />
            <input
              id="signup-name"
              name="full_name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              aria-invalid={hasError}
              aria-describedby={hasError ? "signup-error" : undefined}
              className={FIELD}
            />
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="signup-email" className={LABEL}>
            {t("emailLabel")}
          </label>
          <div className="relative">
            <Mail aria-hidden="true" className={ICON} />
            <input
              id="signup-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              aria-invalid={hasError}
              aria-describedby="signup-domain-hint"
              className={FIELD}
            />
          </div>
          {/* The domain rule is stated OUT LOUD. It reveals nothing an attacker
              could not learn by trying once, and hiding it only means a real
              agent submits their personal address and gets a bare rejection. */}
          <p id="signup-domain-hint" className="mt-2 text-[13px] leading-[1.5] text-cream/65">
            {t("domainHint")}
          </p>
        </div>

        <div className="mt-5">
          <label htmlFor="signup-password" className={LABEL}>
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <Lock aria-hidden="true" className={ICON} />
            <input
              id="signup-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              minLength={10}
              required
              aria-invalid={hasError}
              aria-describedby="signup-password-hint"
              className={`${FIELD} pr-[104px]`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
              aria-controls="signup-password"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded px-2 py-1.5 text-[13px] font-semibold text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
            >
              {show ? t("hidePassword") : t("showPassword")}
            </button>
          </div>
          <p id="signup-password-hint" className="mt-2 text-[13px] leading-[1.5] text-cream/65">
            {t("passwordHint")}
          </p>
        </div>

        <SubmitButton label={t("submit")} />
      </fieldset>

      <div id="signup-error" role="alert" aria-live="assertive" className="mt-4">
        {hasError ? <p className={ALERT}>{errorText}</p> : null}
      </div>
    </form>
  );
}
