import Link from "next/link";
import LogoLockup from "@/components/LogoLockup";
import SmokeyBackground from "@/components/SmokeyBackground";

/**
 * The shared shell for every portal auth screen: sign-in, sign-up, forgot
 * password, reset password, pending, welcome.
 *
 * It is EXACTLY the composition login/page.tsx already shipped — shader
 * background, lockup above, glass card, back link below — extracted so the five
 * screens 0005 adds cannot drift from it. The measured contrast decisions it
 * carries are the login page's, unchanged:
 *
 *   · `.auth-card` is rgba(13,27,42,0.82) + blur, dark enough that cream text
 *     clears AA over the brightest reachable pixel of the shader.
 *   · The back link is SOLID cream, not cream/70 — /70 measured 3.68 and failed
 *     against the shader's brightest gold. It is the one element sitting
 *     directly on the moving background.
 *   · The lockup is exempt from contrast (WCAG 1.4.3 excludes brand marks).
 *
 * `noindex` is inherited from (portal)/layout.tsx and reinforced by
 * app/robots.ts; nothing on the public site links to any of these routes.
 */
export default function AuthShell({
  locale,
  heading,
  subhead,
  backLabel,
  children,
  notice,
}: {
  locale: string;
  heading: string;
  subhead?: string;
  backLabel: string;
  children: React.ReactNode;
  /** Neutral status region above the content — wayfinding, not an error. */
  notice?: React.ReactNode;
}) {
  return (
    <main className="auth-screen relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-14">
      <SmokeyBackground className="z-0" />

      <div className="relative z-10 mb-10 flex flex-col items-center">
        <LogoLockup className="h-14 w-auto" />
      </div>

      <div className="auth-card relative z-10 w-full max-w-[420px] rounded-2xl p-7 text-center sm:p-9">
        <h1 className="font-display text-[clamp(26px,2.8vw,32px)] leading-[1.1] text-cream">
          {heading}
        </h1>
        {subhead ? (
          <p className="mx-auto mt-2.5 max-w-[34ch] text-[15px] leading-[1.55] text-cream/75">
            {subhead}
          </p>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="mt-5 rounded-lg border border-gold/40 bg-gold/[0.12] px-4 py-3 text-left text-[14px] leading-[1.5] text-cream"
          >
            {notice}
          </div>
        ) : null}

        {/* Left-aligned inside the centred card — fields and prose both read
            better flush-left even when the header above them is centred. */}
        <div className="text-left">{children}</div>
      </div>

      <Link
        href={`/${locale}`}
        className="relative z-10 mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-cream underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-pale"
      >
        {backLabel}
      </Link>
    </main>
  );
}
