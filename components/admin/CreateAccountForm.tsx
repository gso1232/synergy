"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  createAgentWithPassword,
  inviteAgentAccount,
  setupLinkForExisting,
  type InviteState,
} from "@/app/[locale]/(portal)/admin/actions";

const control =
  "w-full rounded border border-ink/40 bg-white px-3 py-2 text-[14px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep aria-[invalid=true]:border-[#8A2A1A]";
const labelCls = "mb-1 block text-[13px] font-semibold text-ink";

const KNOWN_ERRORS = [
  "name", "email", "domain", "domainTypo", "duplicate", "mail",
  "forbidden", "unconfigured", "timeout", "nouser",
  // Password mode.
  "passwordShort", "passwordMismatch",
];

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-cream hover:bg-navy-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:bg-ink/40"
    >
      {pending ? busy : idle}
    </button>
  );
}

/**
 * The setup link, shown when mail could not be delivered.
 *
 * 🔴 THIS IS A SINGLE-USE CREDENTIAL ON SCREEN. It is rendered into the response
 * body and never into the URL, so it does not reach browser history or any
 * access log. It is deliberately NOT auto-selected or auto-copied — the admin
 * has to choose to copy it. Treat it like a password: it sets one.
 */
function LinkPanel({ email, link, t }: { email: string; link: string; t: (k: string, v?: Record<string, string>) => string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mb-4 rounded-lg border border-gold-deep/40 bg-[#FBF6E9] px-4 py-3">
      <p className="text-[14px] font-semibold text-ink">{t("createAccount.manualTitle", { email })}</p>
      <p className="mt-1 text-[13px] leading-[1.5] text-ink/80">{t("createAccount.manualBody")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={link}
          aria-label={t("createAccount.manualTitle", { email })}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded border border-ink/30 bg-white px-3 py-2 font-mono text-[12px] text-ink"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(link).then(
              () => { setCopied(true); setTimeout(() => setCopied(false), 2500); },
              () => setCopied(false),
            );
          }}
          className="rounded-full border border-navy/40 px-4 py-2 text-[13px] font-semibold text-navy hover:bg-navy hover:text-cream"
        >
          {copied ? t("createAccount.copied") : t("createAccount.copy")}
        </button>
      </div>
    </div>
  );
}

function Feedback({ state, t }: { state: InviteState; t: (k: string, v?: Record<string, string>) => string }) {
  /* 🔴 THE PASSWORD IS NOT ECHOED HERE, AND THE ACTION DOES NOT RETURN IT. The
     admin typed it; they have it. Rendering it back would put a live credential
     into a response body, a screenshot and whatever is behind the admin's
     shoulder — for no gain at all. */
  if (state.status === "created") {
    return (
      <p role="status" className="mb-4 rounded-lg border border-navy/25 bg-[#EEF3F8] px-4 py-3 text-[14px] text-navy">
        {t("createAccount.created", { email: state.email })}
      </p>
    );
  }
  if (state.status === "sent") {
    return (
      <p role="status" className="mb-4 rounded-lg border border-navy/25 bg-[#EEF3F8] px-4 py-3 text-[14px] text-navy">
        {t("createAccount.sent", { email: state.email })}
      </p>
    );
  }
  if (state.status === "manual") {
    return <LinkPanel email={state.email} link={state.link} t={t} />;
  }
  if (state.status === "error") {
    const key = KNOWN_ERRORS.includes(state.code) ? state.code : "write_failed";
    return (
      <p role="alert" className="mb-4 rounded-lg border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-3 text-[14px] text-[#7A2416]">
        {t(`createAccount.error.${key}`)}
        {state.detail ? (
          <span className="mt-1 block font-mono text-[12px] text-[#7A2416]/80">{state.detail}</span>
        ) : null}
      </p>
    );
  }
  return null;
}

/**
 * THE CREATE-AGENT FORM — the only account-creation surface in the product.
 *
 * Two forms, one card. The first creates an account; the second re-issues a
 * setup link for an address that already has one, which is what you need when
 * mail is not being delivered (no SMTP yet) or an invite was missed.
 *
 * This component performs NO authorisation. It is rendered inside the admin
 * dashboard, whose route layout is the security boundary; both actions call
 * requireAdmin() server-side before doing anything.
 */
export default function CreateAccountForm({ locale }: { locale: string }) {
  const t = useTranslations("admin");
  const [createState, createAction] = useFormState<InviteState, FormData>(
    inviteAgentAccount,
    { status: "idle" },
  );
  const [linkState, linkAction] = useFormState<InviteState, FormData>(
    setupLinkForExisting,
    { status: "idle" },
  );
  const [pwState, pwAction] = useFormState<InviteState, FormData>(
    createAgentWithPassword,
    { status: "idle" },
  );

  return (
    <div>
      <Feedback state={createState} t={t} />

      <form action={createAction} className="rounded border border-ink/20 bg-white p-5">
        <input type="hidden" name="locale" value={locale} />
        <p className="mb-4 text-[14px] leading-[1.5] text-ink/80">{t("createAccount.intro")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ca-name" className={labelCls}>{t("createAccount.name")}</label>
            <input id="ca-name" name="full_name" type="text" required className={control} />
          </div>
          <div>
            <label htmlFor="ca-email" className={labelCls}>{t("createAccount.email")}</label>
            <input
              id="ca-email"
              name="email"
              type="email"
              required
              autoComplete="off"
              aria-describedby="ca-email-hint"
              className={control}
            />
            <p id="ca-email-hint" className="mt-1 text-[13px] text-ink/70">
              {t("createAccount.emailHint")}
            </p>
          </div>
          <div>
            <label htmlFor="ca-phone" className={labelCls}>{t("createAccount.phone")}</label>
            <input id="ca-phone" name="phone" type="tel" className={control} />
          </div>
        </div>

        <div className="mt-5">
          <SubmitButton idle={t("createAccount.submit")} busy={t("createAccount.submitting")} />
        </div>
      </form>

      {/* ==================================================================
          SET THE PASSWORD YOURSELF — the second creation path.

          🔴 IT SITS BELOW THE INVITE FORM DELIBERATELY. The invite is the
          better default: nobody but the agent ever knows their password. This
          one is for the case the invite cannot serve — sitting with a new agent,
          or mail not being delivered — and the hint under it says so plainly
          rather than presenting the two as equivalent choices.

          `autoComplete="new-password"` on both fields so the admin's own
          password manager does not offer to fill, or offer to save, a
          credential that belongs to somebody else.
          ================================================================== */}
      <div className="mt-6 border-t border-ink/15 pt-5">
        <h3 className="mb-1 font-display text-[16px] text-navy">{t("createAccount.pwTitle")}</h3>
        <p className="mb-3 max-w-[60ch] text-[14px] leading-[1.5] text-ink/80">
          {t("createAccount.pwBody")}
        </p>

        <Feedback state={pwState} t={t} />

        <form action={pwAction} className="rounded border border-ink/20 bg-white p-5">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pw-name" className={labelCls}>{t("createAccount.name")}</label>
              <input id="pw-name" name="full_name" type="text" required className={control} />
            </div>
            <div>
              <label htmlFor="pw-email" className={labelCls}>{t("createAccount.email")}</label>
              <input
                id="pw-email"
                name="email"
                type="email"
                required
                autoComplete="off"
                aria-describedby="pw-email-hint"
                className={control}
              />
              <p id="pw-email-hint" className="mt-1 text-[13px] text-ink/70">
                {t("createAccount.emailHint")}
              </p>
            </div>
            <div>
              <label htmlFor="pw-phone" className={labelCls}>{t("createAccount.phone")}</label>
              <input id="pw-phone" name="phone" type="tel" className={control} />
            </div>
            <div />
            <div>
              <label htmlFor="pw-password" className={labelCls}>{t("createAccount.password")}</label>
              <input
                id="pw-password"
                name="password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                aria-describedby="pw-password-hint"
                className={control}
              />
              <p id="pw-password-hint" className="mt-1 text-[13px] text-ink/70">
                {t("createAccount.passwordHint")}
              </p>
            </div>
            <div>
              <label htmlFor="pw-confirm" className={labelCls}>{t("createAccount.passwordConfirm")}</label>
              <input
                id="pw-confirm"
                name="password_confirm"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className={control}
              />
            </div>
          </div>

          <div className="mt-5">
            <SubmitButton idle={t("createAccount.pwSubmit")} busy={t("createAccount.submitting")} />
          </div>
        </form>
      </div>

      {/* ---------- RE-ISSUE A LINK FOR AN EXISTING ACCOUNT ---------- */}
      <div className="mt-6 border-t border-ink/15 pt-5">
        <h3 className="mb-1 font-display text-[16px] text-navy">{t("createAccount.existingTitle")}</h3>
        <p className="mb-3 text-[14px] leading-[1.5] text-ink/80">{t("createAccount.existingBody")}</p>

        {linkState !== createState ? <Feedback state={linkState} t={t} /> : null}

        <form action={linkAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <div className="min-w-[260px] flex-1">
            <label htmlFor="ca-existing" className={labelCls}>{t("createAccount.email")}</label>
            <input id="ca-existing" name="email" type="email" required autoComplete="off" className={control} />
          </div>
          <SubmitButton idle={t("createAccount.existingSubmit")} busy={t("createAccount.submitting")} />
        </form>
      </div>
    </div>
  );
}
