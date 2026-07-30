"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * The admin data table — sorting and filtering, over a hardcoded array.
 *
 * 🔴 NO DATA PATH. `rows` is a prop, sourced from lib/adminMock.ts at build
 * time. Sorting and filtering are `useMemo` over that array in the browser.
 * Nothing fetches, nothing persists, nothing is written anywhere.
 *
 * ACCESSIBILITY, the parts that are easy to get wrong and are done properly:
 *   - the sort control is a real <button> INSIDE the <th>, and the <th> carries
 *     `aria-sort` — screen readers announce the column's sort state rather than
 *     the reader guessing from an arrow glyph.
 *   - the arrow is `aria-hidden`; sort state is never communicated by the icon
 *     alone, and never by colour alone.
 *   - the result count is a `role="status"` live region, so filtering announces
 *     "3 of 8" instead of silently changing the table under a screen reader.
 *   - the table has a real <caption> (visually hidden) naming it.
 *   - badges carry TEXT. Status is never colour-only; the tint is redundant.
 *
 * HORIZONTAL SCROLL IS SCOPED TO THE TABLE, not the page. The wrapper is
 * `overflow-x:auto` and is focusable (`tabIndex={0}`) with a label, because a
 * scrollable region that cannot be reached by keyboard is a WCAG 2.1.1 failure.
 * That is what keeps 390 free of body-level horizontal overflow.
 *
 * ROW ACTIONS ARE VISIBLY INERT. They render inside a <details> disclosure as
 * `disabled` buttons: the client can see exactly which actions a row will carry
 * without any of them doing something. Same principle as the disabled contact
 * form — no code path can pretend to have worked.
 */

export type Column = {
  key: string;
  label: string;
  /** Numeric-ish or date columns sort as strings here; every value is already
   *  a display string and the mock set is small. Real sorting arrives with the
   *  real data layer. */
  sortable?: boolean;
};

export type Row = {
  id: string;
  /** Display strings, pre-formatted by the server component. */
  cells: Record<string, string>;
  /** Optional badge rendering: column key -> tone. Text still comes from cells. */
  tones?: Record<string, "neutral" | "good" | "warn" | "stop">;
  /** Value the status filter matches on. */
  filterValue?: string;
};

const TONE: Record<string, string> = {
  // Every tone pairs a tint with INK text, so contrast never depends on the
  // tint: ink #1A1A1A on any of these sits far above 4.5:1. The tint is a
  // redundant cue behind the word, not the cue itself.
  neutral: "bg-ink/[0.06] text-ink",
  good: "bg-[#E4EFE4] text-ink",
  warn: "bg-[#F6EEDA] text-ink",
  stop: "bg-[#F3E0DE] text-ink",
};

export default function DataTable({
  caption,
  columns,
  rows,
  filters,
  actions,
}: {
  caption: string;
  columns: Column[];
  rows: Row[];
  /** Status filter options; omit for no filter. */
  filters?: { value: string; label: string }[];
  /** Row action labels. All render disabled — phase 1 wires nothing. */
  actions: string[];
}) {
  const t = useTranslations("admin");
  const uid = useId();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => {
      const matchQ = !q || Object.values(r.cells).some((v) => v.toLowerCase().includes(q));
      const matchS = status === "all" || r.filterValue === status;
      return matchQ && matchS;
    });
    if (sort) {
      const { key, dir } = sort;
      out = [...out].sort((a, b) => {
        const cmp = (a.cells[key] ?? "").localeCompare(b.cells[key] ?? "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return dir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, query, status, sort]);

  const toggle = (key: string) =>
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );

  const control =
    "rounded border border-ink/30 bg-white px-3 py-2 text-[14px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-q`} className="text-[13px] font-semibold text-ink">
            {t("table.searchLabel")}
          </label>
          <input
            id={`${uid}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("table.searchPlaceholder")}
            className={`${control} w-[min(260px,60vw)]`}
          />
        </div>

        {filters ? (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-f`} className="text-[13px] font-semibold text-ink">
              {t("table.filterLabel")}
            </label>
            <select
              id={`${uid}-f`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={control}
            >
              <option value="all">{t("table.filterAll")}</option>
              {filters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <p role="status" className="ml-auto text-[13px] text-ink/80">
          {t("table.resultCount", { shown: shown.length, total: rows.length })}
        </p>
      </div>

      {/* Focusable scroll container — see the docblock. */}
      <div
        tabIndex={0}
        role="group"
        aria-label={caption}
        // 🔴 `relative` IS LOAD-BEARING, NOT COSMETIC. Without it this wrapper
        // is `position: static`, so it is NOT the containing block for its
        // absolutely-positioned descendants (the row-action popovers, and any
        // `sr-only` text, which Tailwind implements as `position:absolute`).
        // An abs-positioned element is only clipped by an ancestor's overflow
        // if that ancestor is its containing block — so those descendants
        // escaped the scroller and extended the DOCUMENT's scrollable width.
        // Measured at a 568px viewport: html.scrollWidth was 1093 against a
        // 568 clientWidth and the page scrolled 524.8px sideways, while
        // body.scrollWidth stayed 568 (which is why a naive body check misses
        // it). Adding `relative` returned it to 568 exactly.
        className="relative overflow-x-auto rounded border border-ink/15 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
      >
        <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-ink/15">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}
                    className="whitespace-nowrap px-4 py-3 font-semibold text-ink"
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        // `aria-label` rather than a trailing `sr-only` span.
                        // Two reasons: the span was a `position:absolute`
                        // element inside the scroller (see the wrapper note),
                        // and the name it produced read "Name ↕ Sort by Name".
                        // "Sort by Name" still CONTAINS the visible label, so
                        // WCAG 2.5.3 label-in-name is satisfied.
                        aria-label={t("table.sortBy", { column: c.label })}
                        className="inline-flex items-center gap-1.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
                      >
                        {c.label}
                        <span aria-hidden="true" className="text-gold-deep">
                          {active ? (sort!.dir === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                );
              })}
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                {t("table.actionsLabel")}
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-ink/80">
                  {t("table.empty")}
                </td>
              </tr>
            ) : (
              shown.map((r) => (
                <tr key={r.id} className="border-b border-ink/10 last:border-b-0">
                  {columns.map((c) => {
                    const tone = r.tones?.[c.key];
                    return (
                      <td key={c.key} className="whitespace-nowrap px-4 py-3 text-ink">
                        {tone ? (
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[13px] ${TONE[tone]}`}>
                            {r.cells[c.key]}
                          </span>
                        ) : (
                          r.cells[c.key]
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <details className="relative">
                      <summary className="inline-flex cursor-pointer list-none items-center rounded border border-ink/30 px-2.5 py-1 text-[13px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep">
                        {t("table.rowActions", { name: r.cells[columns[0].key] ?? r.id })}
                      </summary>
                      <ul className="absolute right-0 z-10 mt-1 w-max rounded border border-ink/20 bg-white p-1 shadow-lg">
                        {actions.map((a) => (
                          <li key={a}>
                            {/* Disabled on purpose: phase 1 wires nothing. */}
                            <button
                              type="button"
                              disabled
                              className="block w-full cursor-not-allowed px-3 py-1.5 text-left text-[13px] text-ink/55"
                            >
                              {a}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
