import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import {
  LicensingSection,
  ContractingSection,
  ResourcesSection,
  TrainingSection,
} from "@/components/portal/sections";
import { PortalPager } from "@/components/portal/PortalPrimitives";
import { isSectionKey, neighbours, SECTION_KEYS } from "@/lib/portal/sections";

export const dynamic = "force-dynamic";

/**
 * ONE PORTAL SECTION, ON ITS OWN ROUTE.
 *
 * 🔴 THE SEGMENT IS VALIDATED AGAINST THE REGISTRY, NOT TRUSTED. `[section]`
 * comes off the URL, so it is attacker-controlled; anything not in
 * `SECTION_KEYS` is a 404 rather than an empty render or a thrown key error.
 * The same list drives the tabs and the overview cards, so a section cannot be
 * linked from one surface and missing from another — the rule `routes.ts`
 * already applies to the public site.
 *
 * The guard lives on `welcome/layout.tsx`; this page reads no agent data.
 */
export function generateStaticParams() {
  /* Not prerendered — the layout is force-dynamic behind an auth guard — but
     declaring the params keeps the section list in one place for the router. */
  return SECTION_KEYS.map((section) => ({ section }));
}

export async function generateMetadata({
  params: { locale, section },
}: {
  params: { locale: string; section: string };
}): Promise<Metadata> {
  if (!isSectionKey(section)) return { robots: { index: false, follow: false } };
  const t = await getTranslations({ locale, namespace: "portal" });
  return {
    /* The section names the tab, so the browser tab and the page tab agree. */
    title: `${t(`nav.${section}`)} — ${t("metaTitle")}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

const SECTIONS = {
  licensing: LicensingSection,
  contracting: ContractingSection,
  resources: ResourcesSection,
  training: TrainingSection,
} as const;

export default async function PortalSectionPage({
  params: { locale, section },
}: {
  params: { locale: string; section: string };
}) {
  unstable_setRequestLocale(locale);
  if (!isSectionKey(section)) notFound();

  const t = await getTranslations({ locale, namespace: "portal" });
  const Section = SECTIONS[section];
  const { prev, next } = neighbours(section);

  return (
    <>
      <Section locale={locale} />
      <PortalPager
        prev={prev ? { href: `/${locale}/welcome/${prev}`, label: t(`nav.${prev}`) } : null}
        next={next ? { href: `/${locale}/welcome/${next}`, label: t(`nav.${next}`) } : null}
      />
    </>
  );
}
