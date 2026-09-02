"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ProgressRail from "./ProgressRail";
import type { Lead, LeadStatus } from "@/lib/types";

/**
 * LEADS — the master/detail split, mapped from the reference's station list +
 * main pane.
 *
 * 🔴 THIS IS A PRESENTATION COMPONENT. It receives `leads` as a prop, already
 * fetched server-side by `getLeads()` through the RLS-scoped client. It runs no
 * query, opens no client, and performs no mutation — selection is local state
 * over rows the page already had. Leads are READ-ONLY by policy (the `leads`
 * table has a select policy and nothing else), so there is deliberately no
 * control here that could attempt a write.
 *
 * WHY LEADS AND NOT AGENTS. A lead carries eight fields, which forced the old
 * table into a horizontal scroller; it is exactly the "pick one, read it all"
 * shape. Agents keep a plain table because their create/edit form already owns
 * the right-hand pane, and two editors on one screen would compete.
 *
 * The sidebar item is the reference's anatomy: name over a mono sub-label,
 * right-aligned mono value (status, per the approved decision), active item
 * filled dark.
 */
const STATUS_STEPS = ["new", "contacted", "qualified", "closed"] as const;

export default function LeadsExplorer({ leads }: { leads: Lead[] }) {
  const t = useTranslations("admin");
  const [selectedId, setSelectedId] = useState<string | null>(leads[0]?.id ?? null);

  if (leads.length === 0) {
    return (
      <p className="rounded-lg border border-ink/15 bg-cream px-4 py-8 text-center text-[14px] text-ink/80">
        {t("leads.empty")}
      </p>
    );
  }

  const selected = leads.find((l) => l.id === selectedId) ?? leads[0];

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));

  const consent = [
    selected.sms_consent ? t("leads.consent.sms") : null,
    selected.email_optin ? t("leads.consent.email") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  /** Detail rows: mono label, ink value. Every one is a stored column. */
  const fields: { label: string; value: string }[] = [
    { label: t("leads.cols.email"), value: selected.email },
    { label: t("leads.cols.phone"), value: selected.phone ?? "—" },
    { label: t("leads.cols.source"), value: t(`leads.source.${selected.source}`) },
    { label: t("leads.cols.interest"), value: selected.interest ?? "—" },
    { label: t("leads.cols.consent"), value: consent || t("leads.consent.none") },
    { label: t("leads.cols.received"), value: fmtDate(selected.received_at) },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-8">
      {/* ---------- Master: the selector ---------- */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/70">
          {t("leads.selectorLabel")}
        </p>
        <ul className="flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1">
          {leads.map((l) => {
            const active = l.id === selected.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(l.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep ${
                    active
                      ? "border-navy bg-navy"
                      : "border-ink/15 bg-cream hover:bg-ink/[0.04]"
                  }`}
                >
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-[14px] leading-tight ${
                        active ? "text-cream" : "text-ink"
                      }`}
                    >
                      {l.name}
                    </span>
                    <span
                      className={`mt-1 block truncate font-mono text-[10px] tracking-[0.08em] ${
                        active ? "text-cream/80" : "text-ink/70"
                      }`}
                    >
                      {l.email}
                    </span>
                  </span>
                  {/* Right-aligned value = status, per the approved decision. */}
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] ${
                      active ? "text-gold-pale" : "text-gold-deep"
                    }`}
                  >
                    {t(`leads.status.${l.status}`)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---------- Detail ---------- */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <h3 className="font-display text-[clamp(20px,1.7vw,26px)] leading-tight text-navy">
              {selected.name}
            </h3>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
            {fmtDate(selected.received_at)}
          </p>
        </div>

        {/* The rail — position on the scale, never a claimed history. */}
        <div className="mt-6 rounded-lg border border-ink/15 bg-cream p-4">
          <ProgressRail
            steps={STATUS_STEPS.map((s) => ({ key: s, label: t(`leads.status.${s}`) }))}
            current={selected.status as LeadStatus | null}
            legend={t("rail.positionLegend")}
            unknownLabel={t("rail.unknown")}
          />
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/70">
                {f.label}
              </dt>
              <dd className="mt-1 break-words text-[15px] leading-[1.5] text-ink">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
