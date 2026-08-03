import type { ReactNode } from "react";

/**
 * The outer card every admin view sits in — the reference's big rounded panel.
 *
 * ANATOMY, mapped from the reference:
 *   - large rounded container, generous padding, thin hairline border. Their
 *     card sits LIGHTER than the page; ours is white on the cream admin page,
 *     which is the same relationship in our tokens. Cream-on-greige was
 *     rejected: it is a 1.11x luminance step (HANDOFF §6a) and the edge would
 *     have depended entirely on the hairline.
 *   - header row: a heavily letterspaced title left (their `A D M I R A L T Y`,
 *     ours the section name), a mono meta line beneath it, and a small status
 *     element right (their moon phase, ours the live record count).
 *   - a thin divider under the header.
 *
 * Purely presentational. It takes no data and runs no query.
 */
export default function AdminCard({
  title,
  meta,
  statusLabel,
  statusValue,
  children,
}: {
  /** Section name. Rendered letterspaced, like the reference's wordmark. */
  title: string;
  /** The mono line beneath: section · date · timezone note. */
  meta: string;
  /** Small right-hand label, e.g. "RECORDS". */
  statusLabel: string;
  /** Its value, e.g. the live row count. */
  statusValue: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink/15 bg-white p-5 md:p-7 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="font-display text-[clamp(18px,1.6vw,22px)] uppercase leading-none tracking-[0.34em] text-ink">
            {title}
          </p>
          <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/70">
            {meta}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {/* Redundant dot — the count beside it carries the same information,
              so this is ornament. Still at gold-deep/80 (3.71:1 on white)
              rather than leaning on a decorative exemption. */}
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-gold-deep/80"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
            <span className="text-ink/70">{statusLabel}</span> {statusValue}
          </p>
        </div>
      </header>

      <hr className="mt-5 border-0 border-t border-ink/15" />

      <div className="mt-6">{children}</div>
    </section>
  );
}
