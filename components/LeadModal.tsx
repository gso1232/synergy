"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type LeadModalProps = {
  open: boolean;
  onClose: () => void;
  /** Preformatted monthly amount, e.g. "$300" */
  monthly: string;
  age: number;
  retire: number;
};

/**
 * Lead capture — native <dialog>, so focus trapping, Esc, and the backdrop are
 * handled by the platform (no UI library). Light surface: ink text, gold-deep
 * for gold-on-light, gold fill only on the submit button.
 */
export default function LeadModal({
  open,
  onClose,
  monthly,
  age,
  retire,
}: LeadModalProps) {
  const t = useTranslations("leadModal");
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setSent(false);
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  const mono = (chunks: React.ReactNode) => (
    <span className="font-data font-medium text-ink">{chunks}</span>
  );

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        // Close on backdrop click (clicks on the dialog element itself, i.e.
        // outside the inner content, land here).
        if (e.target === ref.current) onClose();
      }}
      className="lead-dialog m-auto w-[min(92vw,460px)] rounded-[14px] bg-cream p-0 text-ink shadow-[0_1px_2px_rgba(0,32,80,0.04),0_8px_20px_-14px_rgba(0,32,80,0.18)] backdrop:bg-[rgba(0,32,80,0.55)]"
    >
      <div className="relative p-7 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors duration-200 hover:bg-ink/[0.06] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2 2l12 12M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {sent ? (
          <div className="py-6">
            <h2
              id={titleId}
              className="font-display font-semibold text-[27px] leading-[1.1] tracking-[-0.015em] text-navy"
            >
              {t("successTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
              {t("successBody")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 inline-flex h-12 items-center rounded-full bg-gold px-7 text-[14px] font-medium text-navy transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:hover:translate-y-0"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <>
            <h2
              id={titleId}
              className="pr-8 font-display font-semibold text-[27px] leading-[1.1] tracking-[-0.015em] text-navy"
            >
              {t("title")}
            </h2>
            <p className="mt-3 rounded bg-navy/[0.04] px-3 py-2 text-[13px] text-ink/80">
              {t.rich("summary", { monthly, age, retire, mono })}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/70">
              {t("intro")}
            </p>

            {/* NOT WIRED. There is no endpoint, no webhook and no POST behind
                this form — the GHL integration is unbuilt. It previously ran
                `preventDefault(); setSent(true)`, which showed "Thanks — we'll
                be in touch" and sent nothing anywhere. A fake success is worse
                than a visibly broken form: the client believes a lead was
                captured and it silently was not.

                So: the fields stay VISIBLE (they show what will be collected)
                but are inert inside a disabled <fieldset>, the submit is
                disabled, and the notice below says so plainly.

                TO RESTORE: wire the POST, drop the `disabled` on the fieldset
                and the button, restore the onSubmit handler, and swap the
                notice back to `leadModal.privacy` (still in both message
                files, untouched). */}
            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <fieldset disabled className="flex flex-col gap-4 border-0 p-0">
                <Field id="lead-name" label={t("name")} type="text" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="lead-phone" label={t("phone")} type="tel" required />
                  <Field id="lead-email" label={t("email")} type="email" />
                </div>
                <Field
                  id="lead-message"
                  label={t("message")}
                  type="textarea"
                />
              </fieldset>
              <button
                type="submit"
                disabled
                className="mt-1 inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full bg-navy/10 px-7 text-[14px] font-medium text-ink/45"
              >
                {t("submit")}
              </button>
              <p
                role="note"
                className="rounded-r border-l-2 border-amber bg-amber/[0.12] py-3 pl-4 pr-3 text-[13px] leading-relaxed text-ink"
              >
                <strong className="font-semibold">{t("notLiveTitle")}</strong>{" "}
                {t("notLiveBody")}
              </p>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

function Field({
  id,
  label,
  type,
  required,
  autoFocus,
}: {
  id: string;
  label: string;
  type: "text" | "tel" | "email" | "textarea";
  required?: boolean;
  autoFocus?: boolean;
}) {
  // `focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/40`
  // — REMOVED, same defect as ContactForm's `field` (see the note there). At
  // 40% alpha it was worse: gold-deep #7D641F at 0.40 over the white field
  // composites to #CBC2A8, which is 1.79:1 on #FFFFFF against the 3:1 that
  // 1.4.11 requires. These fields ARE reachable — the modal has no disabled
  // fieldset — so this one was live on every keyboard open of the lead form.
  // The global rule now draws gold-deep at 5.65:1 on the white field.
  const base =
    "w-full rounded border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/40 transition-colors duration-200 focus:border-gold-deep";
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink/60">
        {label}
      </span>
      {type === "textarea" ? (
        <textarea id={id} rows={2} className={base} />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          autoFocus={autoFocus}
          className={base}
        />
      )}
    </label>
  );
}
