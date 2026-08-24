"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { EditableString } from "@/lib/cms/editable-keys";

/**
 * The copy editor for the public site.
 *
 * =============================================================================
 * 🔴 ONE FORM PER STRING, NOT ONE FORM FOR THE PAGE. There are ~565 editable
 * strings; a single submit carrying all of them would be a huge payload, would
 * rewrite every row on every save, and would lose the whole edit if one field
 * tripped a validation rule. Per-string forms mean a save touches exactly the
 * string that changed, and a failure is contained to it.
 *
 * 🔴 SEARCH AND GROUPING ARE NOT DECORATION AT THIS SIZE. 565 textareas in one
 * scroll is unusable, so the list is grouped by PAGE — how the person editing
 * thinks — and collapsed by default, with a search that matches the current
 * text, the original text, or the key. Only the open group renders its fields.
 *
 * =============================================================================
 * WHY THE ORIGINAL IS ALWAYS SHOWN. An override hides what the repo says, so
 * without it there is no way to tell an edited string from an untouched one, or
 * to know what "reset" would restore. Edited rows carry a badge and their
 * original underneath.
 */

const PLAIN_BTN =
  "rounded-full border border-ink/25 bg-white px-4 py-2 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-gold-deep disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none";
const PRIMARY_BTN =
  "rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-cream transition-colors duration-200 hover:bg-navy-lift disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none";

type Groups = { id: string; label: string; namespaces: string[] }[];
type Overrides = Record<"en" | "es", Record<string, string>>;

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="rounded-full bg-navy px-5 py-2.5 text-[14px] font-semibold text-cream transition-colors duration-200 hover:bg-navy-lift disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="rounded-full border border-ink/25 bg-white px-4 py-2 text-[14px] font-medium text-ink transition-colors duration-200 hover:border-gold-deep disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none" disabled={pending}>
      {pending ? "…" : "Reset"}
    </button>
  );
}

export default function SiteContentEditor({
  uiLocale,
  groups,
  strings,
  overrides,
  saveAction,
  resetAction,
}: {
  uiLocale: string;
  groups: Groups;
  strings: EditableString[];
  overrides: Overrides;
  saveAction: (formData: FormData) => void;
  resetAction: (formData: FormData) => void;
}) {
  const [targetLocale, setTargetLocale] = useState<"en" | "es">("en");
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const current = overrides[targetLocale] ?? {};

  /* The list is stable; only the filter changes. Recomputing 565 rows on every
     keystroke is cheap, but re-deriving the group buckets is not, so both are
     memoised on the inputs that actually move. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return strings;
    return strings.filter((s) => {
      const live = current[s.key] ?? s.original;
      return (
        s.key.toLowerCase().includes(q) ||
        s.original.toLowerCase().includes(q) ||
        live.toLowerCase().includes(q)
      );
    });
  }, [strings, query, current]);

  const byGroup = useMemo(() => {
    const m = new Map<string, EditableString[]>();
    for (const s of filtered) {
      const arr = m.get(s.group);
      if (arr) arr.push(s);
      else m.set(s.group, [s]);
    }
    return m;
  }, [filtered]);

  const editedCount = Object.keys(current).length;

  return (
    <div className="site-content-editor">
      {/* ---------- Controls ---------- */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-[13px] font-medium text-ink" htmlFor="sc-locale">
            Language
          </label>
          {/* A real toggle rather than a select: there are exactly two, and
              which one you are editing is the single most important piece of
              state on this screen. */}
          <div id="sc-locale" className="mt-1 flex gap-2">
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setTargetLocale(l)}
                aria-pressed={targetLocale === l}
                className={targetLocale === l ? PRIMARY_BTN : PLAIN_BTN}
              >
                {l === "en" ? "English" : "Español"}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-[220px] flex-1">
          <label className="text-[13px] font-medium text-ink" htmlFor="sc-search">
            Search
          </label>
          <input
            id="sc-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the text you want to change…"
            className="mt-1 w-full rounded border border-ink/30 bg-white px-3 py-2 text-[14px] leading-[1.5] text-ink transition-colors duration-200 focus:border-gold-deep"
          />
        </div>

        <p className="text-[13px] text-ink/70">
          {editedCount} edited · {filtered.length} shown
        </p>
      </div>

      {/* ---------- Groups ---------- */}
      {groups.map((g) => {
        const items = byGroup.get(g.id) ?? [];
        if (items.length === 0) return null;
        const open = openGroup === g.id || query.trim().length > 0;
        const editedHere = items.filter((s) => current[s.key] !== undefined).length;

        return (
          <section key={g.id} className="mb-4 rounded-lg border border-ink/15">
            <button
              type="button"
              onClick={() => setOpenGroup(open && !query ? null : g.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="font-medium text-ink">
                {g.label}{" "}
                <span className="text-[13px] text-ink/70">
                  ({items.length}
                  {editedHere > 0 ? ` · ${editedHere} edited` : ""})
                </span>
              </span>
              <span aria-hidden="true">{open ? "−" : "+"}</span>
            </button>

            {open ? (
              <div className="border-t border-ink/10 px-4 py-4">
                {items.map((s) => {
                  const isEdited = current[s.key] !== undefined;
                  const value = current[s.key] ?? s.original;
                  return (
                    <div key={s.key} className="mb-6 last:mb-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <code className="font-mono text-[11px] text-ink/60">{s.key}</code>
                        {isEdited ? (
                          <span className="rounded border border-gold-deep px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-gold-deep">
                            edited
                          </span>
                        ) : null}
                      </div>

                      <form action={saveAction}>
                        <input type="hidden" name="uiLocale" value={uiLocale} />
                        <input type="hidden" name="targetLocale" value={targetLocale} />
                        <input type="hidden" name="key" value={s.key} />
                        {/* `key` on the textarea forces React to rebuild it when
                            the language toggles — without it the DOM node is
                            reused and keeps the previous locale's text as its
                            uncontrolled value, so switching to Español would
                            show English copy in an editable box and save it
                            straight back over the Spanish row. */}
                        <textarea
                          key={`${targetLocale}:${s.key}`}
                          name="value"
                          defaultValue={value}
                          rows={value.length > 120 ? 4 : 2}
                          className="w-full rounded border border-ink/30 bg-white px-3 py-2 text-[14px] leading-[1.5] text-ink transition-colors duration-200 focus:border-gold-deep"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <SaveButton />
                          {isEdited ? null : (
                            <span className="text-[13px] text-ink/70">
                              Clearing the box restores the original.
                            </span>
                          )}
                        </div>
                      </form>

                      {isEdited ? (
                        <div className="mt-2 flex items-start gap-3">
                          <form action={resetAction}>
                            <input type="hidden" name="uiLocale" value={uiLocale} />
                            <input type="hidden" name="targetLocale" value={targetLocale} />
                            <input type="hidden" name="key" value={s.key} />
                            <ResetButton />
                          </form>
                          <p className="text-[13px] text-ink/70 flex-1">
                            Original: <span className="text-ink/70">{s.original}</span>
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}

      {filtered.length === 0 ? (
        <p className="text-[13px] text-ink/70">Nothing matches “{query}”.</p>
      ) : null}
    </div>
  );
}
