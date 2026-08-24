import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

/**
 * Admin-editable copy for the public site.
 *
 * =============================================================================
 * 🔴 THIS IS AN OVERRIDE LAYER, NOT A CONTENT SOURCE. i18n.ts loads
 * messages/{locale}.json first and merges whatever this returns ON TOP. Every
 * string the site renders still has a definition in the repo; a row here just
 * replaces one.
 *
 * WHICH MEANS THE FAILURE MODE IS "NOTHING CHANGED", NOT "SITE DOWN". If
 * Supabase is unreachable, the key is missing, the query throws, or the table
 * does not exist yet, `getStringOverrides` returns {} and every page renders
 * exactly what it rendered before this feature existed. That is not defensive
 * padding — it is the reason this design was chosen over moving the copy into
 * the database outright. A CMS that can take the marketing site down when the
 * database hiccups is worse than no CMS.
 *
 * =============================================================================
 * 🔴 A PLAIN supabase-js CLIENT, NOT `createReadClient()`. That helper reads
 * `cookies()`, and touching cookies inside `getRequestConfig` would opt EVERY
 * page into dynamic rendering — 67 statically generated pages would become
 * server-rendered on every request. This read is anonymous and identical for
 * everyone, so it needs no session and must not ask for one.
 *
 * The row-level policy backing it is `content_strings_select_public` (0011):
 * read is public because these rows ARE the public website's words. Keeping
 * the service-role key out of the render path is the safer arrangement.
 *
 * =============================================================================
 * CACHING. `unstable_cache` keyed per locale and tagged `content-strings`, so
 * the database is hit once per build/revalidation rather than once per render.
 * Saving in the admin calls `revalidateTag("content-strings")`, which drops
 * both locales' entries and lets the next request rebuild them.
 *
 * ⚠️ `revalidateTag` ALONE IS NOT ENOUGH FOR THE STATIC PAGES, and the save
 * action does both. Tag invalidation clears THIS cache; the prerendered HTML
 * of /en/about still has the old words baked in until the route itself is
 * revalidated. See the note on `revalidatePath` in the save action.
 */

/** A flat map of dotted next-intl paths to replacement copy. */
export type StringOverrides = Record<string, string>;

const EMPTY: StringOverrides = {};

async function readOverrides(locale: string): Promise<StringOverrides> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // No Supabase configured (a bare checkout, CI, a preview without env) — the
  // JSON catalogue alone is a complete, working site.
  if (!url || !key) return EMPTY;

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("content_strings")
      .select("key, value")
      .eq("locale", locale);

    if (error || !data) {
      // Logged, never thrown. A broken override table must not break a page.
      if (error) console.error("[content_strings] read failed:", error.message);
      return EMPTY;
    }

    const out: StringOverrides = {};
    for (const row of data) {
      if (typeof row.key === "string" && typeof row.value === "string") {
        out[row.key] = row.value;
      }
    }
    return out;
  } catch (e) {
    console.error(
      "[content_strings] read threw:",
      e instanceof Error ? e.message : String(e),
    );
    return EMPTY;
  }
}

/** Cache tag the admin invalidates after a save. */
export const CONTENT_STRINGS_TAG = "content-strings";

export const getStringOverrides = (locale: string): Promise<StringOverrides> =>
  unstable_cache(() => readOverrides(locale), ["content-strings", locale], {
    tags: [CONTENT_STRINGS_TAG],
  })();

/**
 * Write one dotted path into a nested messages object, in place.
 *
 * 🔴 IT REFUSES TO REPLACE AN OBJECT WITH A STRING, and that guard is the one
 * that matters. next-intl namespaces are nested objects; if an override row
 * carried the key "about" (a namespace) rather than "about.hero.title" (a
 * leaf), a naive assignment would swap the entire About namespace for a single
 * string and every `t()` call under it would throw at render time — turning a
 * typo in the editor into a 500 on a public page. A key that does not resolve
 * to an existing leaf is DROPPED, silently and safely.
 *
 * It also refuses to CREATE new keys. An override may only replace copy that
 * the repo already defines, so the JSON catalogue stays the complete list of
 * what exists and the editor cannot invent orphan strings nothing renders.
 */
export function applyOverride(
  target: Record<string, unknown>,
  dottedKey: string,
  value: string,
): boolean {
  const parts = dottedKey.split(".");
  if (parts.some((p) => p.length === 0)) return false;

  let node: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = node[parts[i]];
    if (!next || typeof next !== "object" || Array.isArray(next)) return false;
    node = next as Record<string, unknown>;
  }

  const leaf = parts[parts.length - 1];
  // Must already exist AND already be a string. Both halves are load-bearing.
  if (typeof node[leaf] !== "string") return false;

  node[leaf] = value;
  return true;
}

/**
 * Merge overrides into a messages tree. Returns a NEW tree — the imported JSON
 * module object is shared across requests in the same worker, so mutating it
 * would leak one visitor's overrides into everyone else's render.
 */
export function mergeOverrides(
  messages: Record<string, unknown>,
  overrides: StringOverrides,
): Record<string, unknown> {
  const keys = Object.keys(overrides);
  if (keys.length === 0) return messages;

  const clone = structuredClone(messages);
  for (const key of keys) {
    applyOverride(clone, key, overrides[key]);
  }
  return clone;
}
