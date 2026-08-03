import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import LogoLockup from "@/components/LogoLockup";
import LoginForm from "@/components/admin/LoginForm";
import SmokeyBackground from "@/components/SmokeyBackground";

/**
 * /[locale]/login — a CENTRED DARK GLASS CARD on a navy/gold aurora. ONE page
 * for both admin and agents: role decides where someone lands afterwards, never
 * which form they use, so there is no role selector here and nothing in this UI
 * presumes one.
 *
 * 🔴 REDESIGNED 2026-08-02 FROM THE SPLIT-SCREEN. Was a navy panel left / white
 * form right at md+. The client's target is a centred glassy card over an
 * animated blob field, with the logo lockup ABOVE the card (Checkmate's login
 * composition). Adapted to our palette: the reference's BLUE blobs become NAVY +
 * GOLD, and there is no Google button / "or continue with" / sign-up, because we
 * have neither social auth nor public registration — shipping those buttons
 * would advertise capabilities that do not exist.
 *
 * 🔴 AUTH IS UNTOUCHED. This is a visual reskin only. `LoginForm` still posts to
 * the `signIn` server action, which sets the session cookies server-side and
 * redirects by role; the /admin guard (middleware + layout) is unchanged; the
 * `denied` wayfinding notice still renders; password-manager autofill still
 * works (the form keeps `username`/`current-password`).
 *
 * `noindex` is inherited from `(portal)/layout.tsx` and reinforced by
 * app/robots.ts. Nothing on the public site links here (see PORTAL_PATHS).
 *
 * LAYOUT: one centred column at every width — logo, then card, then a back link.
 * The old panel is gone, so there is no md-only decoration to strip on phones;
 * the same composition simply narrows. The aurora is a set of blurred blobs
 * behind the card (`.auth-aurora` in globals.css) that drift slowly and FREEZE
 * under `prefers-reduced-motion`. The card is `rgba(13,27,42,0.82)` + blur, dark
 * enough that cream text clears AA over the brightest gold blob (measured).
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "login" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { denied?: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "login" });

  // Set by the admin guard when a signed-in NON-admin is bounced here. It is a
  // wayfinding notice, not an error — the credentials were fine, the role was
  // wrong — so it renders in a neutral status region, not the form's alert.
  const denied = searchParams?.denied === "1";

  return (
    <main className="auth-screen relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-14">
      {/* 🔴 THE BACKGROUND IS THE CLIENT'S WebGL SMOKE SHADER NOW, NOT THE CSS
          BLOB AURORA. The first pass built drifting blurred blobs from a written
          description; the client then supplied the actual reference, which is a
          GLSL fragment shader, and asked for "the background exactly like it but
          gold and white instead of blue and black". The blob CSS is retired in
          globals.css (kept, unused — it is the no-WebGL look).
          See components/SmokeyBackground.tsx for what is theirs (all the shader
          math) and what is not (the colour line, and four host-code fixes). */}
      <SmokeyBackground className="z-0" />

      {/* LOGO ABOVE THE CARD — the reference's composition. The lockup already
          carries the wordmark beside the mark, so "centred logo + Synergy text"
          is one element. WCAG 1.4.3 exempts brand marks from contrast.

          🔴 THE "STAFF & AGENT PORTAL" META LINE IS REMOVED (2026-08-03, on
          instruction). It was the one piece of text sitting DIRECTLY on the
          moving smoke, and it cost two AA re-derivations to keep legible there
          (ink/80 when the field was light; then full cream — not cream/70, which
          measured 3.68 and failed — once it went navy). Deleting it removes the
          only element on this page whose contrast depended on the shader's
          brightest reachable pixel. The `login.metaLabel` string stays in both
          message files, unrendered, per the standing convention.

          🔴 SPACING: `mb-10`, up from `mb-8`, and the lockup grows 48 → 56px.
          With the meta line gone the logo block lost 30px of its own height and
          sat too close to the card — the brief's "move it up and slightly down
          into position". Larger mark + more air below reads as a deliberate
          crown above the card rather than something resting on it. */}
      <div className="relative z-10 mb-10 flex flex-col items-center">
        <LogoLockup className="h-14 w-auto" />
      </div>

      {/* THE GLASS CARD. `.auth-card` is rgba(13,27,42,0.82) + backdrop-blur —
          glassy, but opaque enough that cream text clears AA over the brightest
          blob (measured). Centred, one column at every width. */}
      <div className="auth-card relative z-10 w-full max-w-[420px] rounded-2xl p-7 text-center sm:p-9">
        <h1 className="font-display text-[clamp(26px,2.8vw,32px)] leading-[1.1] text-cream">
          {t("heading")}
        </h1>
        <p className="mx-auto mt-2.5 max-w-[34ch] text-[15px] leading-[1.55] text-cream/75">
          {t("subhead")}
        </p>

        {denied ? (
          <div
            role="status"
            className="mt-5 rounded-lg border border-gold/40 bg-gold/[0.12] px-4 py-3 text-left text-[14px] leading-[1.5] text-cream"
          >
            {t("deniedNotice")}
          </div>
        ) : null}

        {/* The form is left-aligned inside the centred card — fields read better
            flush-left even when the header above them is centred. */}
        <div className="text-left">
          <LoginForm locale={locale} />
        </div>
      </div>

      {/* Same reasoning as the meta line, same reversal, and the same 3.68 fail
          at cream/70 — this is solid cream (5.61) for the identical reason. */}
      <Link
        href={`/${locale}`}
        className="relative z-10 mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-cream underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
      >
        {t("backToSite")}
      </Link>
    </main>
  );
}
