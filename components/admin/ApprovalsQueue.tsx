"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import type { Profile } from "@/lib/types";
import {
  deleteUnverifiedAccount,
  setAccountStatus,
} from "@/app/[locale]/(portal)/admin/actions";

/**
 * THE APPROVALS QUEUE — where Aiman turns a signup into an account.
 *
 * =============================================================================
 * 🔴 EVERY CONTROL HERE IS A <form action={serverAction}>, NOT AN onClick.
 *
 * That is not a style preference. A button wired to a client handler puts the
 * decision — "is this person allowed to approve?" — inside JavaScript the caller
 * controls. A form posting to a server action puts it on the server, where
 * `requireAdmin()` runs before anything else and RLS re-judges the write in
 * Postgres. It also means the queue works with JavaScript disabled, and that a
 * mutation cannot be fired from the console by editing a disabled attribute.
 *
 * The buttons being hidden or shown below is PRESENTATION ONLY. Approve on an
 * unverified row is not rendered because it makes no sense, not because
 * rendering it would be dangerous — the trigger would refuse the transition
 * anyway.
 * =============================================================================
 *
 * 🔴 UNVERIFIED ROWS ARE SEPARATED, AND NEVER OFFERED APPROVE/REJECT. An address
 * nobody has proven they control is not a decision waiting to be made — it is a
 * squat waiting to expire (24h purge) or be cleared by hand. Mixing them into
 * the same list as real applicants is how someone approves an address that
 * belongs to a stranger.
 */

function ActionButton({
  label,
  tone,
  confirm,
}: {
  label: string;
  tone: "approve" | "reject" | "danger";
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  const base =
    "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 motion-reduce:transition-none";
  const tones = {
    approve: "bg-[#1B5E3A] text-white hover:bg-[#17502F] focus-visible:outline-[#1B5E3A]",
    reject: "border border-ink/25 text-ink/80 hover:border-ink/50 focus-visible:outline-ink/40",
    danger: "border border-[#8A2A1A]/45 text-[#7A2416] hover:bg-[#FBEBE7] focus-visible:outline-[#8A2A1A]",
  } as const;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      // A native confirm() for the destructive one only. It is a
      // misclick guard, not a control — the server re-checks everything.
      onClick={confirm ? (e) => { if (!window.confirm(confirm)) e.preventDefault(); } : undefined}
      className={`${base} ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

const BADGE: Record<string, string> = {
  pending: "bg-[#7D641F]/15 text-[#5E4A14]",
  unverified: "bg-ink/10 text-ink/70",
  active: "bg-[#1B5E3A]/15 text-[#14502F]",
  rejected: "bg-[#8A2A1A]/12 text-[#7A2416]",
};

export default function ApprovalsQueue({
  profiles,
  locale,
  currentUserId,
}: {
  profiles: Profile[];
  locale: string;
  /** The signed-in admin, so their own row never renders an action. */
  currentUserId: string;
}) {
  const t = useTranslations("admin.accounts");

  if (profiles.length === 0) {
    return <p className="px-1 py-6 text-[14px] text-ink/65">{t("empty")}</p>;
  }

  const fmt = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink/12">
            {["name", "email", "status", "signedUp", "actions"].map((k) => (
              <th
                key={k}
                scope="col"
                className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/60"
              >
                {t(`col.${k}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => {
            const isSelf = p.id === currentUserId;
            return (
              <tr key={p.id} className="border-b border-ink/8 align-middle">
                <td className="px-3 py-3 text-[14px] text-ink">
                  {p.full_name || <span className="text-ink/45">{t("noName")}</span>}
                  {p.role === "admin" ? (
                    <span className="ml-2 rounded bg-ink/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/70">
                      {t("adminTag")}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-[14px] text-ink/80">{p.email ?? "—"}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${BADGE[p.status] ?? "bg-ink/10 text-ink/70"}`}
                  >
                    {t(`status.${p.status}`)}
                  </span>
                </td>
                <td className="px-3 py-3 text-[14px] tabular-nums text-ink/70">
                  {fmt.format(new Date(p.created_at))}
                </td>
                <td className="px-3 py-3">
                  {isSelf ? (
                    <span className="text-[13px] text-ink/45">{t("you")}</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {p.status === "pending" ? (
                        <>
                          <form action={setAccountStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="status" value="active" />
                            <input type="hidden" name="locale" value={locale} />
                            <ActionButton label={t("approve")} tone="approve" />
                          </form>
                          <form action={setAccountStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input type="hidden" name="locale" value={locale} />
                            <ActionButton label={t("reject")} tone="reject" />
                          </form>
                        </>
                      ) : null}

                      {p.status === "active" && p.role !== "admin" ? (
                        <form action={setAccountStatus}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <input type="hidden" name="locale" value={locale} />
                          <ActionButton label={t("revoke")} tone="reject" />
                        </form>
                      ) : null}

                      {p.status === "rejected" ? (
                        <form action={setAccountStatus}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="active" />
                          <input type="hidden" name="locale" value={locale} />
                          <ActionButton label={t("restore")} tone="approve" />
                        </form>
                      ) : null}

                      {/* 🔴 DELETE IS OFFERED FOR UNVERIFIED ROWS ONLY. The
                          server re-reads the row through RLS and refuses any
                          other status, so this is a UI convenience over a real
                          server-side restriction, not the restriction itself. */}
                      {p.status === "unverified" ? (
                        <form action={deleteUnverifiedAccount}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="locale" value={locale} />
                          <ActionButton
                            label={t("delete")}
                            tone="danger"
                            confirm={t("deleteConfirm")}
                          />
                        </form>
                      ) : null}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
