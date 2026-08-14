import RichText from "./RichText";
import {
  PortalLink,
  PortalLinkList,
  PortalStep,
  PortalStepList,
} from "@/components/portal/PortalPrimitives";
import type { PageSection } from "@/lib/types";

/**
 * THE CMS SECTION RENDERER — the counterpart of the four hardcoded portal
 * sections, driven by rows instead of JSX.
 *
 * =============================================================================
 * 🔴 A SECTION WITH A STEP NUMBER AND A SECTION WITHOUT ARE DIFFERENT THINGS,
 * AND THEY MUST NOT RENDER THE SAME.
 *
 * "01 Review licensing requirements" is item one of an ordered procedure — it
 * belongs in an `<ol>`, and a screen reader should say "1 of 9". "Finish.
 * Congratulations!" and the four Agent Resources cards are not steps at all;
 * putting them in that list would announce a tenth step that does not exist and
 * imply an order that is not there.
 *
 * So this splits the run into ordered stretches and unordered ones, in document
 * order, and renders each with the right element. The seed content relies on it:
 * `licensing-checklist` is nine steps followed by one closing card.
 *
 * 🔴 THE `<ol>` DOES NOT CARRY `start`, AND IT DOES NOT NEED TO. The visible
 * numeral comes from `step_number` (the stored text, so "01" not "1"), and the
 * numeral is `aria-hidden` — the list's own position is what a reader hears.
 * That is PortalStep's existing decision, unchanged.
 */

/** Links hanging off a section. Rendered under the body in both shapes. */
function SectionLinks({ links }: { links: PageSection["links"] }) {
  if (!links?.length) return null;
  return (
    <PortalLinkList>
      {links.map((l) => (
        <li key={l.id}>
          {/* Internal links (the seed's "New Agent Checklist" cross-reference)
              are plain anchors: PortalLink opens a new tab and announces that it
              does, which would be a lie about a link that stays on the site. */}
          {l.url.startsWith("/") ? (
            <a
              href={l.url}
              className="inline-flex items-baseline gap-1.5 py-1 text-[15px] font-medium text-gold-deep underline decoration-gold-deep/35 underline-offset-4 transition-colors duration-200 hover:decoration-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep motion-reduce:transition-none"
            >
              {l.label}
            </a>
          ) : (
            <PortalLink href={l.url}>{l.label}</PortalLink>
          )}
        </li>
      ))}
    </PortalLinkList>
  );
}

/** A section with no step number — a card, not a list item. */
function PlainSection({ section }: { section: PageSection }) {
  return (
    <div className="rounded-xl border border-ink/[0.10] bg-white p-5 shadow-[0_1px_2px_rgba(26,26,26,0.04)] sm:p-6">
      {section.heading ? (
        <h2 className="font-display text-[clamp(19px,1.6vw,21px)] font-medium leading-[1.25] text-ink">
          {section.heading}
        </h2>
      ) : null}
      <div
        className={`max-w-[32em] space-y-3 text-[15px] leading-[1.6] text-ink/75 ${
          section.heading ? "mt-2.5" : ""
        }`}
      >
        <RichText body={section.body} />
        <SectionLinks links={section.links} />
      </div>
    </div>
  );
}

export default function CmsSections({ sections }: { sections: PageSection[] }) {
  if (!sections.length) {
    return null;
  }

  /* Group consecutive sections by whether they are steps. One pass, document
     order preserved — this is what keeps "Finish. Congratulations!" out of the
     nine-step list without reordering anything. */
  const groups: { stepped: boolean; items: PageSection[] }[] = [];
  for (const s of sections) {
    const stepped = Boolean(s.step_number && s.step_number.trim());
    const last = groups[groups.length - 1];
    if (last && last.stepped === stepped) last.items.push(s);
    else groups.push({ stepped, items: [s] });
  }

  return (
    <div className="space-y-3">
      {groups.map((g, gi) =>
        g.stepped ? (
          <PortalStepList key={gi}>
            {g.items.map((s) => (
              <PortalStep key={s.id} n={s.step_number!.trim()} heading={s.heading ?? ""}>
                <RichText body={s.body} />
                <SectionLinks links={s.links} />
              </PortalStep>
            ))}
          </PortalStepList>
        ) : (
          <div key={gi} className="space-y-3">
            {g.items.map((s) => (
              <PlainSection key={s.id} section={s} />
            ))}
          </div>
        ),
      )}
    </div>
  );
}
