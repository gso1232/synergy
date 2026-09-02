import type { ReactNode } from "react";

export type TableRow = {
  key: string;
  product: string;
  cells: string[];
};

/**
 * The "Which Product Is Right for You?" comparison — seven products against
 * six attributes.
 *
 * 🔴 THIS SECTION HAS NO EQUIVALENT ON restaurantsem.com/mindset. It is a
 * deliberate addition, approved: the content is fflsynergy's own and it is the
 * most useful thing on their services page, so the section is invented, not
 * the content.
 *
 * =========================================================================
 * TWO DOM REPRESENTATIONS, ONE HIDDEN PER BREAKPOINT — AND THAT IS AN
 * ACCESSIBILITY DECISION, NOT A CONVENIENCE.
 *
 * The usual responsive-table answer is `display: block` on `<table>`, `<tr>`
 * and `<td>` with `content: attr(data-label)` pseudo-elements. DO NOT DO THAT
 * HERE. Changing a table part's `display` REMOVES ITS TABLE SEMANTICS in most
 * screen readers — the row and column relationships disappear and a
 * seven-attribute grid becomes an unlabelled run of text. The visual result
 * looks like cards; the announced result is worse than no table at all.
 *
 * So there are two renderings from ONE data array:
 *
 *   >= 820   a real <table>, <th scope="col"> on the header row and
 *            <th scope="row"> on each product name, so every cell resolves to
 *            "Term Life Insurance, Medical Exam, Sometimes"
 *   <  820   a <ul> of cards, each an <h3> product name and a <dl> of
 *            label/value pairs
 *
 * `display: none` removes the inactive one from the accessibility tree
 * entirely, so nothing is announced twice and nothing is duplicated in the
 * source — only in the output.
 *
 * NO HORIZONTAL SCROLL AT ANY WIDTH. A seven-column table in a 390px viewport
 * either overflows the page or scrolls inside its own box; the first breaks
 * the layout and the second hides half the content behind a gesture nobody is
 * told about.
 */
export default function ServicesTable({
  headingId,
  heading,
  intro,
  columns,
  rows,
  caption,
}: {
  headingId: string;
  heading: ReactNode;
  intro: ReactNode;
  /** Attribute labels, WITHOUT the leading "Product" column. */
  columns: string[];
  rows: readonly TableRow[];
  caption: string;
}) {
  return (
    <section aria-labelledby={headingId} className="sem-shell sem-pad-t">
      <div className="sem-inner">
        <h2 id={headingId} className="sem-h2 font-display text-navy">
          {heading}
        </h2>
        <p className="sem-body mt-6 max-w-[46ch] text-ink">{intro}</p>

        {/* ---- >= 820: the real table ---- */}
        <div className="mt-[clamp(32px,4.3vw,65.6px)] hidden lg:block">
          <table className="services-table">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                <th scope="col">{columns[0]}</th>
                {columns.slice(1).map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <th scope="row">{r.product}</th>
                  {r.cells.map((c, i) => (
                    <td key={columns[i + 1]}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---- < 820: cards ---- */}
        <ul className="mt-[clamp(32px,4.3vw,65.6px)] space-y-8 lg:hidden">
          {rows.map((r) => (
            <li key={r.key} className="services-card">
              <h3 className="sem-eyebrow font-display text-navy">{r.product}</h3>
              <dl className="mt-4">
                {r.cells.map((c, i) => (
                  <div key={columns[i + 1]} className="services-card-row">
                    <dt>{columns[i + 1]}</dt>
                    <dd>{c}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
