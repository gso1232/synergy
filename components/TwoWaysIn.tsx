"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import FadeUp from "./FadeUp";

type CardProps = {
  label: string;
  title: string;
  body: string;
  cta: string;
  src: string;
  objectPosition: string;
};

function Card({
  label,
  title,
  body,
  cta,
  src,
  objectPosition,
}: CardProps) {
  return (
    <article className="motion-safe-lift group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[14px] p-6 transition-transform duration-300 ease-out-expo hover:-translate-y-1 motion-reduce:hover:translate-y-0 card:min-h-[420px] card:p-8">
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 900px) 50vw, 100vw"
        className={`tw-photo object-cover ${objectPosition} transition-transform duration-[600ms] ease-out-expo group-hover:scale-[1.03] motion-reduce:group-hover:scale-100`}
      />
      <div aria-hidden="true" className="tw-scrim absolute inset-0" />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
          {label}
        </p>
        <h3 className="mt-2 font-display font-semibold text-[29px] leading-[1.12] tracking-[-0.015em] text-white">
          {title}
        </h3>
        <p className="mt-2 max-w-[44ch] text-[15px] leading-[1.55] text-white/85">
          {body}
        </p>
        <div className="mt-5">
          {/* Both cards share one button treatment: solid white on the dark
              image, so the two CTAs read as equal, consistent actions. */}
          <a
            href="#"
            className="inline-flex h-12 items-center rounded-full bg-white px-7 text-[14px] font-medium text-navy shadow-[0_2px_16px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
          >
            {cta}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function TwoWaysIn() {
  const t = useTranslations("two");

  return (
    <section
      aria-labelledby="two-ways-heading"
      className="relative overflow-hidden bg-cream py-12 lg:py-16"
    >
      {/* dot-grid texture removed — the page is one flat cream, no patterns */}
      <div className="relative mx-auto max-w-[1680px] px-6 md:px-8">
        <FadeUp>
          <h2
            id="two-ways-heading"
            className="text-center font-display font-semibold text-[clamp(30px,3.9vw,48px)] leading-[1.06] tracking-[-0.02em] text-navy"
          >
            {t("heading")}
          </h2>
        </FadeUp>

        <div className="mt-6 grid items-stretch gap-6 card:grid-cols-2">
          <FadeUp index={1} className="h-full">
            <Card
              label={t("families.label")}
              title={t("families.title")}
              body={t("families.body")}
              cta={t("families.cta")}
              src="/synergy/two-families.jpg"
              objectPosition="object-[center_30%]"
            />
          </FadeUp>
          <FadeUp index={2} className="h-full">
            <Card
              label={t("agents.label")}
              title={t("agents.title")}
              body={t("agents.body")}
              cta={t("agents.cta")}
              src="/synergy/two-agents.jpg"
              objectPosition="object-[center_44%]"
            />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
