"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  saveAgent,
  setAgentActive,
  type AgentActionState,
} from "@/app/[locale]/(portal)/admin/actions";
import { AGENT_HEARD, AGENT_STAGES, type Agent } from "@/lib/types";

/**
 * The agents section — full CRUD, wired to server actions.
 *
 * Every mutation goes through a server action that re-verifies the admin role
 * (see admin/actions.ts) and writes through RLS. This component is just the UI;
 * it cannot grant access. On success the action calls revalidatePath, so the
 * server re-renders with fresh rows and they arrive back here as new props —
 * there is no client-side optimistic fudging that could show a write that
 * didn't land.
 *
 * "Delete" is deliberately absent. Deactivate flips `active` to false so the
 * record survives; the DB has no delete policy to back a hard delete anyway.
 */
const control =
  "w-full rounded border border-ink/40 bg-white px-3 py-2 text-[14px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep aria-[invalid=true]:border-[#8A2A1A]";
const labelCls = "mb-1 block text-[13px] font-semibold text-ink";

function SaveButton({ save, saving }: { save: string; saving: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-cream hover:bg-navy-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:bg-ink/40"
    >
      {pending ? saving : save}
    </button>
  );
}

export default function AgentsManager({
  agents,
  locale,
}: {
  agents: Agent[];
  locale: string;
}) {
  const t = useTranslations("admin");
  const [editing, setEditing] = useState<Agent | null>(null);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction] = useFormState<AgentActionState, FormData>(saveAgent, {
    ok: false,
    error: null,
  });

  // On a successful save, close the form and reset it (formKey remounts inputs).
  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      setEditing(null);
      setFormKey((k) => k + 1);
    }
  }, [state]);

  const startCreate = () => {
    setEditing(null);
    setOpen(true);
    setFormKey((k) => k + 1);
  };
  const startEdit = (a: Agent) => {
    setEditing(a);
    setOpen(true);
    setFormKey((k) => k + 1);
  };

  const fieldErr = state.fields;
  const topError =
    state.error === "forbidden"
      ? t("agents.form.errForbidden")
      : state.error === "write_failed"
        ? t("agents.form.errWrite")
        : null;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[60ch] text-[14px] text-ink/80">{t("agents.note")}</p>
        <button
          type="button"
          onClick={startCreate}
          className="shrink-0 rounded-full border border-navy px-4 py-2 text-[14px] font-semibold text-navy hover:bg-navy hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          {t("agents.new")}
        </button>
      </div>

      {/* ---- Create / edit form ---- */}
      {open ? (
        <form
          key={formKey}
          action={formAction}
          className="mb-6 rounded border border-ink/20 bg-white p-5"
        >
          <h3 className="mb-4 font-display text-[18px] text-ink">
            {editing ? t("agents.form.editTitle") : t("agents.form.createTitle")}
          </h3>

          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <input type="hidden" name="locale" value={locale} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ag-name" className={labelCls}>
                {t("agents.form.name")}
              </label>
              <input
                id="ag-name"
                name="name"
                type="text"
                defaultValue={editing?.name ?? ""}
                aria-invalid={!!fieldErr?.name}
                aria-describedby={fieldErr?.name ? "ag-name-err" : undefined}
                className={control}
              />
              {fieldErr?.name ? (
                <p id="ag-name-err" className="mt-1 text-[13px] text-[#7A2416]">
                  {t("agents.form.errName")}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="ag-email" className={labelCls}>
                {t("agents.form.email")}
              </label>
              <input
                id="ag-email"
                name="email"
                type="email"
                defaultValue={editing?.email ?? ""}
                aria-invalid={!!fieldErr?.email}
                aria-describedby={fieldErr?.email ? "ag-email-err" : undefined}
                className={control}
              />
              {fieldErr?.email ? (
                <p id="ag-email-err" className="mt-1 text-[13px] text-[#7A2416]">
                  {fieldErr.email === "format"
                    ? t("agents.form.errEmailFormat")
                    : t("agents.form.errEmail")}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="ag-phone" className={labelCls}>
                {t("agents.form.phone")}
              </label>
              <input
                id="ag-phone"
                name="phone"
                type="tel"
                defaultValue={editing?.phone ?? ""}
                className={control}
              />
            </div>

            <div>
              <label htmlFor="ag-state" className={labelCls}>
                {t("agents.form.state")}
              </label>
              <input
                id="ag-state"
                name="state"
                type="text"
                defaultValue={editing?.state ?? ""}
                className={control}
              />
            </div>

            <div>
              <label htmlFor="ag-heard" className={labelCls}>
                {t("agents.form.heard")}
              </label>
              <select
                id="ag-heard"
                name="heard"
                defaultValue={editing?.heard ?? ""}
                className={control}
              >
                <option value="">{t("agents.form.heardNone")}</option>
                {AGENT_HEARD.map((h) => (
                  <option key={h} value={h}>
                    {t(`agents.heard.${h}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ag-stage" className={labelCls}>
                {t("agents.form.stage")}
              </label>
              <select
                id="ag-stage"
                name="stage"
                defaultValue={editing?.stage ?? "touch"}
                className={control}
              >
                {AGENT_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {t(`agents.stage.${s}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 sm:col-span-2">
              <input
                id="ag-licensed"
                name="licensed"
                type="checkbox"
                defaultChecked={editing?.licensed ?? false}
                className="h-4 w-4 accent-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
              />
              <label htmlFor="ag-licensed" className="text-[14px] text-ink">
                {t("agents.form.licensed")}
              </label>
            </div>
          </div>

          {topError ? (
            <p
              role="alert"
              className="mt-4 rounded border border-[#8A2A1A]/40 bg-[#FBEBE7] px-4 py-3 text-[14px] text-[#7A2416]"
            >
              {topError}
            </p>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <SaveButton save={t("agents.form.save")} saving={t("agents.form.saving")} />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
              className="rounded-full px-4 py-2.5 text-[14px] font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
            >
              {t("agents.form.cancel")}
            </button>
          </div>
        </form>
      ) : null}

      {/* ---- Roster ---- */}
      {agents.length === 0 ? (
        <p className="rounded border border-ink/15 bg-white px-4 py-8 text-center text-[14px] text-ink/80">
          {t("agents.empty")}
        </p>
      ) : (
        <div
          tabIndex={0}
          role="group"
          aria-label={t("agents.heading")}
          className="relative overflow-x-auto rounded-lg border border-ink/15 bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          <table className="w-full min-w-[820px] border-collapse text-left text-[14px]">
            <caption className="sr-only">{t("agents.heading")}</caption>
            <thead>
              {/* Mono uppercase column heads, per the reference's label voice. */}
              <tr className="border-b border-ink/15">
                {(["name", "email", "phone", "state", "licensed", "stage", "status"] as const).map(
                  (c) => (
                    <th
                      key={c}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/70"
                    >
                      {t(`agents.cols.${c}`)}
                    </th>
                  ),
                )}
                <th
                  scope="col"
                  className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/70"
                >
                  {t("table.actionsLabel")}
                </th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr
                  key={a.id}
                  className={`border-b border-ink/10 last:border-b-0 ${a.active ? "bg-white" : "bg-ink/[0.03]"}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-ink">{a.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-ink">{a.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-ink">{a.phone ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-ink">{a.state ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {a.licensed ? t("agents.licensed.yes") : t("agents.licensed.no")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {t(`agents.stage.${a.stage}`)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[13px] text-ink ${a.active ? "bg-[#E4EFE4]" : "bg-ink/[0.08]"}`}
                    >
                      {a.active ? t("agents.activeLabel") : t("agents.inactiveLabel")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(a)}
                        className="rounded border border-ink/30 px-2.5 py-1 text-[13px] text-ink hover:bg-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
                      >
                        {t("agents.actions.edit")}
                      </button>
                      {/* Deactivate/reactivate — its own tiny form posting the
                          opposite `active` value. Server action re-checks admin. */}
                      <form action={setAgentActive}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="active" value={a.active ? "false" : "true"} />
                        <input type="hidden" name="locale" value={locale} />
                        <button
                          type="submit"
                          className="rounded border border-ink/30 px-2.5 py-1 text-[13px] text-ink hover:bg-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
                        >
                          {a.active ? t("agents.actions.deactivate") : t("agents.actions.reactivate")}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
