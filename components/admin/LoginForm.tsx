import { getTranslations } from "next-intl/server";

/**
 * The sign-in form. A SERVER COMPONENT with no handler, no `action` and no
 * client JS — the same guarantee ContactForm and LeadModal give: there is no
 * code path that can fake a success, because there is no code path at all.
 *
 * 🔴 PHASE 1 IS DESIGN ONLY. When auth is built (a separate, reviewed phase):
 *   1. this becomes a client component with a real submit
 *   2. `disabled` comes off the <fieldset>
 *   3. real validation + error states go in, wired to `aria-invalid` /
 *      `aria-describedby` on the fields (the hooks are already here)
 *   4. this notice is removed
 * The markup, labels, autocomplete tokens and focus rings are final.
 *
 * FLOATING LABELS, DONE WITHOUT JS AND WITHOUT LYING TO SCREEN READERS. Each
 * field is a real <label for>, not a placeholder standing in for one. The label
 * starts overlaying the field and rises when the field is filled or focused,
 * using `peer-placeholder-shown` — which is why every input carries
 * `placeholder=" "` (a single space). That placeholder is a CSS hook, not
 * copy: it is never read as a label, and the <label> is always in the
 * accessibility tree.
 *
 * ⚠️ A disabled <fieldset> disables EVERY control inside it, so the show/hide
 * toggle and "keep me signed in" are inert this phase too. That is deliberate:
 * a working toggle on a dead form is a half-live control, and the whole point
 * of the pattern is that nothing here pretends to work.
 *
 * AUTOCOMPLETE: `username` on the email field and `current-password` on the
 * password field are the tokens password managers actually look for on a
 * sign-in form — `email` would work for filling but not for saving a
 * credential pair.
 */
const FIELD =
  "peer w-full rounded border border-ink/40 bg-white px-3.5 pb-2.5 pt-6 text-[15px] text-ink transition-colors duration-200 placeholder:text-transparent focus:border-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:bg-ink/[0.03] disabled:text-ink/55";

const LABEL =
  "pointer-events-none absolute left-3.5 top-2 text-[12px] text-ink/70 transition-all duration-150 motion-reduce:transition-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-2 peer-focus:text-[12px]";

export default async function LoginForm() {
  const t = await getTranslations("login");

  return (
    <form aria-describedby="login-status" className="mt-8">
      <fieldset disabled className="m-0 border-0 p-0">
        <legend className="sr-only">{t("heading")}</legend>

        <div className="relative">
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder=" "
            className={FIELD}
          />
          <label htmlFor="login-email" className={LABEL}>
            {t("emailLabel")}
          </label>
        </div>

        <div className="relative mt-4">
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder=" "
            className={`${FIELD} pr-24`}
          />
          <label htmlFor="login-password" className={LABEL}>
            {t("passwordLabel")}
          </label>
          {/* Real button, `aria-pressed` for its two states, `aria-controls`
              pointing at the field it governs. Inert while the fieldset is
              disabled — see the docblock. */}
          <button
            type="button"
            aria-pressed={false}
            aria-controls="login-password"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2.5 py-1.5 text-[13px] font-semibold text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:text-ink/45"
          >
            {t("showPassword")}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <input
              id="login-keep"
              name="keep"
              type="checkbox"
              className="h-4 w-4 accent-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
            />
            <label htmlFor="login-keep" className="text-[14px] text-ink">
              {t("keepSignedIn")}
            </label>
          </div>
          {/* Not a <Link>: /forgot-password does not exist, and a link is a
              promise that a page exists (routes.ts). It is a disabled control
              until that route is built. */}
          <button
            type="button"
            className="text-[14px] text-gold-deep underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:no-underline disabled:opacity-70"
          >
            {t("forgot")}
          </button>
        </div>

        <button
          type="submit"
          className="mt-7 h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-cream transition-colors duration-200 hover:bg-navy-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:bg-ink/25 disabled:text-ink/70 motion-reduce:transition-none"
        >
          {t("submit")}
        </button>
      </fieldset>

      {/* The notice is OUTSIDE the fieldset so it is never dimmed with it. */}
      <div
        id="login-status"
        className="mt-6 rounded border border-ink/20 bg-ink/[0.04] p-4"
      >
        <p className="text-[14px] font-semibold text-ink">{t("notLiveTitle")}</p>
        <p className="mt-1.5 text-[14px] leading-[1.55] text-ink/80">{t("notLiveBody")}</p>
      </div>
    </form>
  );
}
