import { PortalLink } from "@/components/portal/PortalPrimitives";
import { isInternalHref, localeHref } from "@/lib/cms/links";

/**
 * THE BODY RENDERER FOR CMS TEXT.
 *
 * =============================================================================
 * 🔴 IT DOES NOT USE `dangerouslySetInnerHTML`, AND IT NEVER WILL.
 *
 * `page_sections.body` is written by an admin through a browser form and stored
 * as text. "Admin-authored" is not the same as "trusted": an admin account is
 * exactly what a phisher goes after, and a compromised one that can inject a
 * `<script>` into a page every agent reads has just turned the portal into a
 * credential harvester. Rendering to React nodes means the worst a hostile
 * string can do is look odd.
 *
 * The URL side of that is closed in the database instead — 0007's
 * `section_links_url_scheme` check rejects anything that is not http(s) or a
 * site-relative path, so `javascript:` never reaches an href. The same test runs
 * here on inline links, because a body is written by hand and the constraint
 * only covers the `section_links` table.
 *
 * =============================================================================
 * §THE SUBSET. Deliberately small — a step-by-step instruction does not need
 * tables and blockquotes, and every construct supported is one more way for a
 * page to render wrong:
 *
 *   blank line        paragraph break
 *   single newline    line break within a paragraph
 *   **bold**          strong
 *   [label](url)      link (http/https/site-relative only)
 *   [ADMIN: …]        a MARKED GAP — see below
 *
 * 🔴 `[ADMIN: …]` IS RENDERED AS A VISIBLE, UNMISSABLE GAP, not as literal text
 * and not silently stripped. The seed content carries ten of them: every place a
 * competitor-specific link was removed and Synergy has not yet supplied its own.
 * They are a to-do list addressed to Aiman that happens to live on the page, and
 * the failure mode this guards against is the one PortalPlaceholder already
 * documents — an agent reading "email your documents to" with nothing after it,
 * and assuming the page is finished.
 */

const ADMIN_GAP = /\[ADMIN:[^\]]*\]/g;
const INLINE_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const BOLD = /\*\*([^*]+)\*\*/g;

/** Same allowlist as the database constraint. Anything else is not a link. */
function safeHref(url: string): string | null {
  return /^(https?:\/\/|\/)/i.test(url) ? url : null;
}

/** An inline "this is still missing" chip. Mono, uppercase, gold-deep — the
 *  same vocabulary PortalPlaceholder uses for the block-level version, so the
 *  two read as one signal rather than two conventions. */
function GapChip({ text }: { text: string }) {
  return (
    <span
      role="note"
      className="mx-0.5 inline-flex items-baseline gap-1 rounded border border-dashed border-gold-deep px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-gold-deep"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(125,100,31,0.08) 0 6px, rgba(125,100,31,0) 6px 12px)",
      }}
    >
      {text.replace(/^\[|\]$/g, "")}
    </span>
  );
}

/**
 * One line of text -> React nodes. Three passes, outermost first, so a gap
 * marker inside a link label cannot be double-processed.
 */
function inline(text: string, keyPrefix: string, locale: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let n = 0;

  // Pass 1 — gap markers. They win over everything: a marker is not content.
  ADMIN_GAP.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ADMIN_GAP.exec(text)) !== null) {
    if (match.index > cursor) {
      out.push(...linkPass(text.slice(cursor, match.index), `${keyPrefix}-t${n++}`, locale));
    }
    out.push(<GapChip key={`${keyPrefix}-g${n++}`} text={match[0]} />);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    out.push(...linkPass(text.slice(cursor), `${keyPrefix}-t${n++}`, locale));
  }
  return out;
}

/** Pass 2 — inline links. */
function linkPass(text: string, keyPrefix: string, locale: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let n = 0;

  INLINE_LINK.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE_LINK.exec(text)) !== null) {
    if (match.index > cursor) out.push(...boldPass(text.slice(cursor, match.index), `${keyPrefix}-b${n++}`));

    const href = safeHref(match[2]);
    if (href) {
      out.push(
        isInternalHref(href) ? (
          // Internal: a normal link, no new tab, no external warning.
          <a
            key={`${keyPrefix}-l${n++}`}
            href={localeHref(href, locale)}
            className="font-medium text-gold-deep underline decoration-gold-deep/35 underline-offset-4 hover:decoration-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            {match[1]}
          </a>
        ) : (
          /* External — `localeHref` would pass it through untouched, so calling
             it here would only imply this branch could ever be site-relative. */
          <PortalLink key={`${keyPrefix}-l${n++}`} href={href}>
            {match[1]}
          </PortalLink>
        ),
      );
    } else {
      // A rejected scheme renders as plain text — visible, inert, and obviously
      // wrong to whoever typed it, which is the point.
      out.push(<span key={`${keyPrefix}-x${n++}`}>{match[1]}</span>);
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) out.push(...boldPass(text.slice(cursor), `${keyPrefix}-b${n++}`));
  return out;
}

/** Pass 3 — bold. */
function boldPass(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let n = 0;

  BOLD.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = BOLD.exec(text)) !== null) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    out.push(
      <strong key={`${keyPrefix}-s${n++}`} className="font-medium text-ink">
        {match[1]}
      </strong>,
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export default function RichText({
  body,
  locale,
}: {
  body: string | null | undefined;
  /** Needed so a site-relative link in a body gets its locale segment — an
   *  href of `/agents/x` without it is a hard 404. See lib/cms/links.ts. */
  locale: string;
}) {
  if (!body || !body.trim()) return null;

  /* Blocks split on a blank line. `\r\n` is normalised first — a body pasted
     from Windows Notepad or an email would otherwise arrive as one giant
     paragraph, because `\r\n\r\n` does not match `\n\n`. */
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        if (!lines.length) return null;
        return (
          <p key={bi}>
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 ? <br /> : null}
                {inline(line, `b${bi}l${li}`, locale)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
