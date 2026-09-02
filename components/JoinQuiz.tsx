"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { submitApplication, type ApplyState } from "@/app/[locale]/(site)/join/actions";

/**
 * THE AGENT APPLICATION, ONE QUESTION AT A TIME.
 *
 * =============================================================================
 * WHAT THIS REPLACED. `components/JoinApplyForm.tsx` — the same 22 fields in one
 * long scrolling column. It is untouched on disk and still exports; swapping
 * back is one import in app/[locale]/(site)/join/page.tsx.
 *
 * The reason for the change is completion rate, not novelty. A 22-field wall
 * with four textareas reads as work before a single answer is given. The same
 * 22 fields asked one at a time read as a quiz, and the person is three answers
 * in before they have decided whether it is long.
 *
 * =============================================================================
 * 🔴 THE FIRST QUESTION IS A GATE AND IT ENDS THE FORM, NOT JUST THE PAGE.
 *
 * "Do you live in the United States and are you legally authorised to work
 * here?" Answering no does not hide a section or mark a field invalid: the
 * questions stop and nothing is ever submitted.
 *
 * That is the honest behaviour. A resident insurance licence is issued by a US
 * state and every state requires the producer to live here and be authorised to
 * work, so there is no route to appointment. Taking someone through eighteen
 * more questions and a consent checkbox, storing their address and their income
 * and their reasons, and then never calling them, would be collecting personal
 * data under a false impression. The dead end says why and gives the office
 * number, which is the only useful thing left to offer.
 *
 * =============================================================================
 * 🔴 THE VISIBLE CONTROLS ARE NOT THE SUBMITTED FIELDS, AND THAT IS DELIBERATE.
 *
 * Every answer lives in React state and is mirrored into a block of hidden
 * inputs at the bottom of the form. The alternative — real inputs kept mounted
 * and hidden with CSS so their values stay in FormData — breaks in a specific
 * and ugly way: a `required` input that is not visible cannot be focused, so
 * the browser refuses to submit and reports "an invalid form control is not
 * focusable" with nothing on screen to fix. Controlled state plus hidden mirrors
 * has no such failure mode, and it is what makes conditional questions possible
 * at all: a skipped question submits nothing rather than an empty string.
 *
 * ⚠️ NO `required` ATTRIBUTE APPEARS ANYWHERE IN THIS COMPONENT. Each step
 * validates before it advances, and the server validates again on arrival. The
 * server is the boundary; this is only the part that tells someone which answer
 * is missing before they have scrolled past it.
 *
 * =============================================================================
 * CONDITIONAL LOGIC, all of it derived rather than stored:
 *
 *   licensed = no          -> the "are you actively selling" question is
 *                             skipped, and `activelySelling` is submitted as
 *                             `not_licensed` because that is the true answer
 *   actively selling ≠ yes -> the agency question is skipped and
 *                             `agencyDetail` submits nothing at all
 *
 * The step list is computed from the current answers on every render, so the
 * progress count is honest: it shrinks when a branch is skipped instead of
 * promising questions that will never be asked.
 *
 * =============================================================================
 * KEYBOARD. Enter advances from any single-line question. It does NOT advance
 * from a textarea, where Enter is a paragraph break and hijacking it would make
 * long answers impossible to write. Choice questions advance on click, because
 * an extra Next press after a radio is the single most common complaint about
 * forms built this way.
 */

type Answers = Record<string, string>;

/* Kept in sync with US_STATES in the server action. The <select> is not the
   validation boundary; the server re-checks against its own list. */
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
] as const;

const HEAR = ["search", "social", "referral", "event", "other"] as const;
const INCOME = ["under40", "40to75", "75to125", "125to200", "over200", "private"] as const;

type StepId =
  | "name" | "email" | "phone" | "address" | "workType" | "selfEmployed"
  | "licensed" | "selling" | "agency" | "sales" | "background" | "why"
  | "social" | "income" | "hear" | "recruiter" | "comments" | "consent";

/** The order, before conditional removal. */
const ALL_STEPS: StepId[] = [
  "name", "email", "phone", "address", "workType", "selfEmployed", "licensed",
  "selling", "agency", "sales", "background", "why", "social", "income",
  "hear", "recruiter", "comments", "consent",
];

/** Which steps a given set of answers actually asks. */
function stepsFor(a: Answers): StepId[] {
  return ALL_STEPS.filter((s) => {
    if (s === "selling") return a.licensed === "yes";
    if (s === "agency") return a.licensed === "yes" && a.activelySelling === "yes";
    return true;
  });
}

const INPUT =
  "w-full rounded border border-ink/40 bg-white px-4 py-3 text-[17px] text-ink transition-colors duration-200 focus:border-royal focus:outline-none md:text-[16px]";

function Choice({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={checked}
      className={`flex w-full items-center gap-3 rounded border px-4 py-3.5 text-left text-[16px] transition-colors duration-200 ${
        checked
          ? "border-royal bg-royal/[0.07] text-navy"
          : "border-ink/25 bg-white text-ink hover:border-royal/60"
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 ${
          checked ? "border-royal" : "border-ink/35"
        }`}
      >
        {checked ? <span className="h-[8px] w-[8px] rounded-full bg-royal" /> : null}
      </span>
      {children}
    </button>
  );
}

function SubmitButton({ label, pending }: { label: string; pending: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex h-12 items-center justify-center rounded-full bg-royal px-8 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-navy disabled:opacity-60"
    >
      {busy ? pending : label}
    </button>
  );
}

export default function JoinQuiz() {
  const t = useTranslations("join");
  const q = useTranslations("join.quiz");
  const [serverState, formAction] = useFormState<ApplyState, FormData>(submitApplication, {
    status: "idle",
  });

  /** null = the gate has not been answered yet. */
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [touched, setTouched] = useState(false);
  const firstFieldRef = useRef<HTMLElement | null>(null);

  const steps = stepsFor(answers);
  const step = steps[Math.min(idx, steps.length - 1)];
  const set = useCallback(
    (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v })),
    [],
  );

  /* Focus moves to the new question when the step changes. Without this the
     focus ring stays on the Next button that has just been replaced, and a
     keyboard or screen reader user is left on a control that no longer relates
     to what is on screen. */
  useEffect(() => {
    setTouched(false);
    firstFieldRef.current?.focus();
  }, [idx, eligible]);

  const ok = (): boolean => {
    const a = answers;
    switch (step) {
      case "name":
        return !!a.firstName?.trim() && !!a.lastName?.trim();
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email ?? "");
      case "phone":
        return (a.phone ?? "").replace(/\D/g, "").length >= 7;
      case "address":
        return (
          (a.street ?? "").trim().length > 1 &&
          (a.city ?? "").trim().length > 1 &&
          !!a.state &&
          /^\d{5}(-\d{4})?$/.test(a.zip ?? "")
        );
      case "workType":
        return !!a.workType;
      case "selfEmployed":
        return !!a.selfEmployed;
      case "licensed":
        return !!a.licensed;
      case "selling":
        return !!a.activelySelling;
      case "agency":
        return (a.agencyDetail ?? "").trim().length >= 10;
      case "sales":
        return (a.salesExperience ?? "").trim().length > 1;
      case "background":
        return (a.background ?? "").trim().length > 1;
      case "why":
        return (a.whyUs ?? "").trim().length > 1;
      case "hear":
        return !!a.hear;
      /* social, income, recruiter and comments are optional and always pass. */
      default:
        return true;
    }
  };

  const next = () => {
    if (!ok()) {
      setTouched(true);
      return;
    }
    setIdx((i) => Math.min(i + 1, steps.length - 1));
  };

  /* 🔴 CHOICE QUESTIONS ADVANCE THROUGH HERE, NOT THROUGH next(). The first
     build called `set(...)` then `setTimeout(next, 140)`, and every choice
     question froze: `next` closes over the render it was created in, so its
     `ok()` read the answers from BEFORE the click and decided the question was
     unanswered. React state is not synchronous, and a 140ms timeout does not
     make it so.

     This computes the next answers, the next step list and the next index from
     the value in hand instead of from state that has not landed yet. It also
     has to recompute the LIST, because picking "not licensed" removes two
     questions from it and an index into the old list would land in the wrong
     place. */
  const pickAndAdvance = (patch: Answers) => {
    const nextAnswers = { ...answers, ...patch };
    setAnswers(nextAnswers);
    const nextSteps = stepsFor(nextAnswers);
    const here = nextSteps.indexOf(step);
    setIdx(Math.min((here === -1 ? idx : here) + 1, nextSteps.length - 1));
  };
  const back = () => setIdx((i) => Math.max(i - 1, 0));

  /* Enter advances, except inside a textarea where it is a paragraph break. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const el = e.target as HTMLElement;
    if (el.tagName === "TEXTAREA") return;
    e.preventDefault();
    if (step !== "consent") next();
  };

  /* ---------------- the gate ---------------- */
  if (eligible === null) {
    return (
      <div className="mx-auto w-full max-w-[640px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-royal">
          {q("kicker")}
        </p>
        <h3 className="mt-3 font-display text-[clamp(22px,2.6vw,30px)] font-semibold leading-[1.2] text-navy">
          {q("eligibility")}
        </h3>
        <p className="mt-3 text-[15px] leading-[1.6] text-ink/75">{q("eligibilityWhy")}</p>
        <div className="mt-7 flex flex-col gap-3">
          <Choice checked={false} onSelect={() => setEligible(true)}>
            {q("eligibilityYes")}
          </Choice>
          <Choice checked={false} onSelect={() => setEligible(false)}>
            {q("eligibilityNo")}
          </Choice>
        </div>
      </div>
    );
  }

  /* ---------------- the dead end ---------------- */
  if (eligible === false) {
    return (
      <div className="mx-auto w-full max-w-[640px]" role="status">
        <h3 className="font-display text-[clamp(22px,2.6vw,30px)] font-semibold leading-[1.2] text-navy">
          {q("stopHeading")}
        </h3>
        <p className="mt-4 text-[16px] leading-[1.65] text-ink">{q("stopBody")}</p>
        <p className="mt-4 text-[16px] leading-[1.65] text-ink">{q("stopContact")}</p>
        <button
          type="button"
          onClick={() => setEligible(null)}
          className="mt-7 text-[14px] font-semibold text-royal underline underline-offset-2"
        >
          {q("back")}
        </button>
      </div>
    );
  }

  if (serverState.status === "ok") {
    return (
      <div className="mx-auto w-full max-w-[640px]" role="status">
        <h3 className="font-display text-[clamp(22px,2.6vw,30px)] font-semibold leading-[1.2] text-navy">
          {t("apply.successTitle")}
        </h3>
        <p className="mt-4 text-[16px] leading-[1.65] text-ink">{t("apply.successBody")}</p>
      </div>
    );
  }

  const pos = steps.indexOf(step) + 1;
  const err = serverState.status === "error" ? serverState.error : null;

  return (
    <form action={formAction} onKeyDown={onKeyDown} className="mx-auto w-full max-w-[640px]">
      {/* progress */}
      <div className="flex items-center gap-4">
        <div
          className="h-[3px] flex-1 overflow-hidden rounded-full bg-royal/15"
          role="progressbar"
          aria-valuenow={pos}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        >
          <div
            className="h-full bg-royal transition-[width] duration-300 ease-out"
            style={{ width: `${(pos / steps.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink/60">
          {q("progress", { n: pos, total: steps.length })}
        </span>
      </div>

      <div className="mt-8 min-h-[240px]">
        {step === "name" ? (
          <Q label={q("qName")}>
            <div className="flex flex-col gap-3">
              <input
                ref={firstFieldRef as React.Ref<HTMLInputElement>}
                className={INPUT}
                placeholder={t("apply.firstName")}
                value={answers.firstName ?? ""}
                onChange={(e) => set("firstName", e.target.value)}
              />
              <input
                className={INPUT}
                placeholder={t("apply.middleName")}
                value={answers.middleName ?? ""}
                onChange={(e) => set("middleName", e.target.value)}
              />
              <input
                className={INPUT}
                placeholder={t("apply.lastName")}
                value={answers.lastName ?? ""}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
          </Q>
        ) : null}

        {step === "email" ? (
          <Q label={q("qEmail")}>
            <input
              ref={firstFieldRef as React.Ref<HTMLInputElement>}
              type="email"
              inputMode="email"
              className={INPUT}
              placeholder={t("apply.emailPlaceholder")}
              value={answers.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "phone" ? (
          <Q label={q("qPhone")} why={q("qPhoneWhy")}>
            <input
              ref={firstFieldRef as React.Ref<HTMLInputElement>}
              type="tel"
              inputMode="tel"
              className={INPUT}
              placeholder={t("apply.phonePlaceholder")}
              value={answers.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "address" ? (
          <Q label={q("qAddress")} why={q("qAddressWhy")}>
            <div className="flex flex-col gap-3">
              <input
                ref={firstFieldRef as React.Ref<HTMLInputElement>}
                className={INPUT}
                placeholder={t("apply.street")}
                value={answers.street ?? ""}
                onChange={(e) => set("street", e.target.value)}
              />
              <input
                className={INPUT}
                placeholder={t("apply.city")}
                value={answers.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
              />
              <select
                className={INPUT}
                value={answers.state ?? ""}
                onChange={(e) => set("state", e.target.value)}
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
              <input
                className={INPUT}
                inputMode="numeric"
                placeholder={t("apply.zip")}
                value={answers.zip ?? ""}
                onChange={(e) => set("zip", e.target.value)}
              />
            </div>
          </Q>
        ) : null}

        {step === "workType" ? (
          <Q label={q("qWorkType")} why={q("qWorkTypeWhy")}>
            <Choices
              options={(["part_time", "full_time", "either"] as const).map((v) => ({
                v,
                label: t(`apply.workTypeOptions.${v}`),
              }))}
              value={answers.workType}
              onPick={(v) => pickAndAdvance({ workType: v })}
            />
          </Q>
        ) : null}

        {step === "selfEmployed" ? (
          <Q label={q("qSelfEmployed")} why={q("qSelfEmployedWhy")}>
            <Choices
              options={[
                { v: "yes", label: t("apply.selfEmployedYes") },
                { v: "no", label: t("apply.selfEmployedNo") },
              ]}
              value={answers.selfEmployed}
              onPick={(v) => pickAndAdvance({ selfEmployed: v })}
            />
          </Q>
        ) : null}

        {step === "licensed" ? (
          <Q label={q("qLicensed")} why={q("qLicensedWhy")}>
            <Choices
              options={[
                { v: "yes", label: t("apply.licensedYes") },
                { v: "no", label: t("apply.licensedNo") },
              ]}
              value={answers.licensed}
              onPick={(v) =>
                pickAndAdvance({
                  licensed: v,
                  /* An unlicensed applicant is not "not selling", they are not
                     licensed. Recording the true answer here is what keeps the
                     column honest when the question is never asked. */
                  activelySelling: v === "no" ? "not_licensed" : (answers.activelySelling ?? ""),
                })
              }
            />
          </Q>
        ) : null}

        {step === "selling" ? (
          <Q label={q("qSelling")}>
            <Choices
              options={[
                { v: "yes", label: t("apply.activelySellingOptions.yes") },
                { v: "no", label: t("apply.activelySellingOptions.no") },
              ]}
              value={answers.activelySelling}
              onPick={(v) => pickAndAdvance({ activelySelling: v })}
            />
          </Q>
        ) : null}

        {step === "agency" ? (
          <Q label={q("qAgency")} why={q("qAgencyWhy")}>
            <textarea
              ref={firstFieldRef as React.Ref<HTMLTextAreaElement>}
              rows={5}
              className={INPUT}
              value={answers.agencyDetail ?? ""}
              onChange={(e) => set("agencyDetail", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "sales" ? (
          <Q label={q("qSales")} why={q("qSalesWhy")}>
            <textarea
              ref={firstFieldRef as React.Ref<HTMLTextAreaElement>}
              rows={4}
              className={INPUT}
              value={answers.salesExperience ?? ""}
              onChange={(e) => set("salesExperience", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "background" ? (
          <Q label={q("qBackground")} why={q("qBackgroundWhy")}>
            <textarea
              ref={firstFieldRef as React.Ref<HTMLTextAreaElement>}
              rows={4}
              className={INPUT}
              value={answers.background ?? ""}
              onChange={(e) => set("background", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "why" ? (
          <Q label={q("qWhy")} why={q("qWhyWhy")}>
            <textarea
              ref={firstFieldRef as React.Ref<HTMLTextAreaElement>}
              rows={4}
              className={INPUT}
              value={answers.whyUs ?? ""}
              onChange={(e) => set("whyUs", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "social" ? (
          <Q label={q("qSocial")} optional={q("skip")}>
            <input
              ref={firstFieldRef as React.Ref<HTMLInputElement>}
              className={INPUT}
              value={answers.socialHandles ?? ""}
              onChange={(e) => set("socialHandles", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "income" ? (
          <Q label={q("qIncome")} why={q("qIncomeWhy")} optional={q("skip")}>
            <Choices
              options={INCOME.map((v) => ({ v, label: q(`incomeOptions.${v}`) }))}
              value={answers.incomeRange}
              onPick={(v) => pickAndAdvance({ incomeRange: v })}
            />
          </Q>
        ) : null}

        {step === "hear" ? (
          <Q label={q("qHear")}>
            <Choices
              options={HEAR.map((v) => ({ v, label: t(`apply.hearOptions.${v}`) }))}
              value={answers.hear}
              onPick={(v) => pickAndAdvance({ hear: v })}
            />
          </Q>
        ) : null}

        {step === "recruiter" ? (
          <Q label={q("qRecruiter")} why={q("qRecruiterWhy")} optional={q("skip")}>
            <input
              ref={firstFieldRef as React.Ref<HTMLInputElement>}
              className={INPUT}
              value={answers.recruiter ?? ""}
              onChange={(e) => set("recruiter", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "comments" ? (
          <Q label={q("qComments")} optional={q("skip")}>
            <textarea
              ref={firstFieldRef as React.Ref<HTMLTextAreaElement>}
              rows={4}
              className={INPUT}
              value={answers.comments ?? ""}
              onChange={(e) => set("comments", e.target.value)}
            />
          </Q>
        ) : null}

        {step === "consent" ? (
          <Q label={q("qConsent")}>
            <label className="flex items-start gap-3 text-[14px] leading-[1.6] text-ink/80">
              <input
                type="checkbox"
                checked={answers.consent === "on"}
                onChange={(e) => set("consent", e.target.checked ? "on" : "")}
                className="mt-1 h-[18px] w-[18px] shrink-0 accent-royal"
              />
              <span>{t("apply.consent")}</span>
            </label>
          </Q>
        ) : null}

        {touched && !ok() ? (
          <p role="alert" className="mt-4 text-[14px] font-medium text-[#B4231F]">
            {q("required")}
          </p>
        ) : null}
        {err ? (
          <p role="alert" className="mt-4 text-[14px] font-medium text-[#B4231F]">
            {t(
              err === "throttled"
                ? "apply.errorThrottled"
                : err === "invalid"
                  ? "apply.errorInvalid"
                  : "apply.errorUnavailable",
            )}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex items-center gap-3">
        {pos > 1 ? (
          <button
            type="button"
            onClick={back}
            className="inline-flex h-12 items-center rounded-full border border-navy/60 px-6 text-[14px] font-semibold text-navy transition-colors duration-200 hover:bg-navy hover:text-white"
          >
            {q("back")}
          </button>
        ) : null}

        {step === "consent" ? (
          <SubmitButton label={t("apply.submit")} pending={t("apply.submitting")} />
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex h-12 items-center rounded-full bg-royal px-8 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-navy"
          >
            {q("next")}
          </button>
        )}
        <span className="hidden text-[12px] text-ink/45 sm:inline">{q("enterHint")}</span>
      </div>

      {/* 🔴 THE ACTUAL SUBMISSION. Every answer mirrored as a hidden input, so
          what reaches the server is exactly the state above and nothing that was
          skipped. A question the branch never asked contributes no key at all,
          which is what lets the server tell "not applicable" from "left
          blank". */}
      {Object.entries(answers).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
    </form>
  );
}

/** One question: the label, an optional reason, and the control. */
function Q({
  label,
  why,
  optional,
  children,
}: {
  label: string;
  why?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-[clamp(21px,2.4vw,28px)] font-semibold leading-[1.25] text-navy">
        {label}
      </h3>
      {why ? <p className="mt-3 text-[15px] leading-[1.6] text-ink/70">{why}</p> : null}
      {optional ? (
        <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.1em] text-ink/45">
          {optional}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choices({
  options,
  value,
  onPick,
}: {
  options: ReadonlyArray<{ v: string; label: string }>;
  value?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <Choice key={o.v} checked={value === o.v} onSelect={() => onPick(o.v)}>
          {o.label}
        </Choice>
      ))}
    </div>
  );
}
