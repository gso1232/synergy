"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import FadeUp from "./FadeUp";
import { useParallax } from "./useParallax";

// Three products (Final Expense dropped): Term (protect now), IUL (grow),
// Tax-Free Retirement (the only card carrying the ITIN "No SSN required" line).
const CARDS = ["term", "iul", "taxfree"] as const;

export default function WhatWeCover() {
  const t = useTranslations("whatWeCover");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Scroll-driven parallax: the background travels at a different rate than the
  // content as the section passes through the viewport. The implementation now
  // lives in useParallax and is shared with Testimonials — same tween, same
  // ±16 / scrub:true, so the two sections cannot drift apart. Disabled entirely
  // under reduced motion; the background then sits static.
  useParallax(sectionRef, bgRef, { reduce });

  const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
  };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    show: reduce
      ? { opacity: 1, transition: { duration: 0.7 } }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
        },
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cover-heading"
      className="relative overflow-hidden bg-navy"
    >
      {/* Full-bleed parallax photograph */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div
          ref={bgRef}
          className="absolute inset-x-0 top-[-30%] h-[160%] will-change-transform"
        >
          <Image
            src="/synergy/coverage-family-meadow.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="cover-photo object-cover object-[center_40%]"
          />
        </div>
        <div className="cover-veil absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-6 py-16 md:px-8 lg:py-20">
        {/* Heading block — deliberately small so the cards below lead */}
        <FadeUp className="mx-auto max-w-[44ch] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            {t("eyebrow")}
          </p>
          <h2
            id="cover-heading"
            className="mt-2.5 font-display font-medium text-[clamp(25px,2.6vw,34px)] leading-[1.06] tracking-[-0.02em] text-white"
          >
            {t("heading")}
          </h2>
          <p className="mx-auto mt-3 max-w-[40ch] text-[15px] leading-[1.55] text-white">
            {t("subhead")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[14px] font-medium text-navy shadow-[0_2px_18px_rgba(13,27,42,0.28)] transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              {t("ctaPrimary")}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              >
                →
              </span>
            </a>
            <a
              href="#"
              className="inline-flex h-12 items-center rounded-full border border-white/70 bg-navy/30 px-7 text-[14px] font-medium text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-navy/40"
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </FadeUp>

        {/* Three translucent cards */}
        <motion.div
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
          className="mt-12 grid gap-7 md:grid-cols-3"
        >
          {CARDS.map((key) => (
            <motion.a
              key={key}
              href="#"
              variants={rise}
              className="cover-card group flex min-h-[360px] flex-col rounded-[4px] p-10 backdrop-blur-[12px] transition-[transform,box-shadow,background-color] duration-300 ease-out-expo hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                {t(`cards.${key}.eyebrow`)}
              </p>
              <h3 className="mt-3 font-display font-medium text-[31px] leading-[1.08] tracking-[-0.015em] text-white">
                {t(`cards.${key}.name`)}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-white">
                {t(`cards.${key}.desc`)}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[12px] font-semibold uppercase tracking-[0.09em] text-white">
                {t("cta")}
                <span
                  aria-hidden="true"
                  className="text-gold transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                >
                  →
                </span>
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* Closing statement — the one large line, per the reference */}
        <FadeUp className="mx-auto mt-8 max-w-[24ch] text-center">
          <p className="font-display font-medium text-[clamp(32px,4vw,52px)] leading-[1.06] tracking-[-0.02em] text-white">
            {t("closingLine")}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
