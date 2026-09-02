"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";

const LINKS = ["home", "about", "services", "contact"] as const;
const SERVICES = ["term", "iul", "taxfree", "final"] as const;

/**
 * Three-zone nav — left links, centred logo, right utilities. Transparent over
 * the hero at rest; on scroll it solidifies to cream and shrinks (88px → 64px),
 * matching lemonade.com's shrink-and-settle behaviour (their header animates
 * height 100→70 over 0.2s and never hides). Reduced motion keeps the same
 * end-states without the transitions.
 */
export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const localePath = (loc: string) =>
    pathname.replace(/^\/(en|es)(?=\/|$)/, `/${loc}`);

  const solid = scrolled || menuOpen;
  const linkColor = solid
    ? "text-ink hover:text-gold-deep"
    : "text-white hover:text-gold";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        solid
          ? "border-gold/60 bg-cream/95 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      {/* Rest-state top scrim so white nav text clears AA over bright video
          frames; fades out once the bar solidifies. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy/55 to-transparent transition-opacity duration-300 ${
          solid ? "opacity-0" : "opacity-100"
        }`}
      />

      <nav
        aria-label={t("ariaLabel")}
        className={`relative mx-auto grid max-w-content grid-cols-[auto_1fr_auto] items-center px-6 transition-[height] duration-200 ease-out md:px-8 lg:grid-cols-3 ${
          solid ? "h-[64px]" : "h-[80px] md:h-[88px]"
        }`}
      >
        {/* LEFT — primary links (desktop) */}
        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((key) =>
            key === "services" ? (
              <li key={key} className="group relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 text-[14px] font-medium transition-colors duration-300 ${linkColor}`}
                >
                  {t("services")}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                    className="mt-px opacity-70 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                  >
                    <path
                      d="M1 3l4 4 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {/* Dropdown — opens on hover and keyboard focus-within */}
                <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 motion-safe:translate-y-1">
                  <ul className="min-w-[220px] overflow-hidden rounded-[10px] border border-ink/10 bg-cream py-2 shadow-[0_16px_40px_rgba(0,32,80,0.16)]">
                    {SERVICES.map((s) => (
                      <li key={s}>
                        <a
                          href="#"
                          className="block px-4 py-2 text-[14px] text-ink transition-colors duration-150 hover:bg-navy/[0.05] hover:text-gold-deep focus-visible:bg-navy/[0.05] focus-visible:outline-none"
                        >
                          {t(`servicesMenu.${s}`)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={key}>
                <a
                  href="#"
                  className={`text-[14px] font-medium transition-colors duration-300 ${linkColor}`}
                >
                  {t(key)}
                </a>
              </li>
            ),
          )}
        </ul>

        {/* CENTER — logo */}
        <a
          href="#"
          aria-label={t("company")}
          className="flex items-center justify-self-start lg:justify-self-center"
        >
          <Logo
            variant={solid ? "light" : "dark"}
            className={`w-auto transition-[height] duration-200 ${
              solid ? "h-8" : "h-9 md:h-10"
            }`}
          />
        </a>

        {/* RIGHT — utilities */}
        <div className="flex items-center justify-end gap-4">
          {/* EN / ES toggle */}
          <div
            aria-label={t("langLabel")}
            className={`hidden items-center rounded-full p-0.5 text-[12px] font-medium md:inline-flex ${
              solid ? "border border-ink/15" : "liquid-glass"
            }`}
          >
            {(["en", "es"] as const).map((loc) => {
              const active = locale === loc;
              return (
                <a
                  key={loc}
                  href={localePath(loc)}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-full px-2.5 py-1 leading-none transition-colors duration-200 ${
                    active
                      ? solid
                        ? "bg-navy text-white"
                        : "bg-white text-navy"
                      : solid
                        ? "text-ink/70 hover:text-ink"
                        : "text-white/75 hover:text-white"
                  }`}
                >
                  {t(loc === "en" ? "langEn" : "langEs")}
                </a>
              );
            })}
          </div>

          <a
            href={t("phoneHref")}
            className={`hidden font-data text-[14px] font-medium transition-colors duration-300 md:block ${
              solid ? "text-gold-deep hover:text-ink" : "text-gold hover:text-white"
            }`}
          >
            {t("phone")}
          </a>

          {/* Join — liquid glass over the hero video, solid gold once the bar
              settles onto cream (white-on-glass would fail AA over cream). */}
          <a
            href="#"
            className={`hidden h-10 items-center rounded-full px-6 text-[14px] font-medium transition-transform duration-300 ease-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 md:inline-flex ${
              solid ? "bg-gold text-navy" : "liquid-glass text-white"
            }`}
          >
            {t("join")}
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={menuOpen}
            className={`inline-flex h-10 w-10 items-center justify-center lg:hidden ${
              solid ? "text-ink" : "text-white"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <path
                d="M2 5h18M2 11h18M2 17h18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-cream lg:hidden">
          <div className="flex h-[64px] items-center justify-between px-6">
            <Logo variant="light" className="h-8 w-auto" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t("closeMenu")}
              autoFocus
              className="inline-flex h-10 w-10 items-center justify-center text-ink"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                <path
                  d="M4 4l14 14M18 4L4 18"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav
            aria-label={t("ariaLabel")}
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 pt-4"
          >
            {LINKS.map((key) => (
              <a
                key={key}
                href="#"
                onClick={() => setMenuOpen(false)}
                className="border-b border-ink/10 py-4 font-display font-medium text-[24px] tracking-[-0.01em] text-ink"
              >
                {t(key)}
              </a>
            ))}
            <div className="flex flex-wrap gap-x-6 gap-y-2 py-4">
              {SERVICES.map((s) => (
                <a
                  key={s}
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="text-[15px] text-ink/75 hover:text-gold-deep"
                >
                  {t(`servicesMenu.${s}`)}
                </a>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4 py-8">
              <a
                href={t("phoneHref")}
                className="font-data text-[18px] font-medium text-gold-deep"
              >
                {t("phone")}
              </a>
              <a
                href="#"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gold text-[15px] font-medium text-navy"
              >
                {t("join")}
              </a>
              <div className="inline-flex items-center self-start rounded-full border border-ink/15 p-0.5 text-[13px] font-medium">
                {(["en", "es"] as const).map((loc) => (
                  <a
                    key={loc}
                    href={localePath(loc)}
                    aria-current={locale === loc ? "true" : undefined}
                    className={`rounded-full px-3 py-1.5 leading-none ${
                      locale === loc ? "bg-navy text-white" : "text-ink/70"
                    }`}
                  >
                    {t(loc === "en" ? "langEn" : "langEs")}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
