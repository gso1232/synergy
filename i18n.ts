import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { getStringOverrides, mergeOverrides } from "@/lib/cms/strings";

/* 🔴 RE-EXPORTED, NOT DECLARED HERE. They live in lib/locales.ts, which has no
   imports at all, so a CLIENT component can take them without dragging this
   file — and therefore @supabase/supabase-js — into the browser bundle. See the
   docblock there for the build-guard failure that produced this split. Server
   call sites keep importing from "@/i18n" unchanged. */
import { locales, type Locale } from "@/lib/locales";
export { locales, type Locale };

type Messages = { [key: string]: string | Messages };

/**
 * Spanish copy is not written yet. Any missing or EMPTY value in a non-English
 * locale falls back to the English string — an English page is a working page,
 * a blank page is not. Delete this merge once es.json carries real copy for
 * every key (or keep it; a translated key always wins over the fallback).
 */
function withFallback(fallback: Messages, overrides: Messages): Messages {
  const out: Messages = { ...fallback };
  for (const [key, value] of Object.entries(overrides)) {
    const base = fallback[key];
    if (typeof value === "string") {
      if (value !== "") out[key] = value;
    } else if (value && typeof value === "object") {
      out[key] =
        base && typeof base === "object"
          ? withFallback(base, value)
          : value;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested as Locale) ? requested! : "en";

  const en = (await import("./messages/en.json")).default as Messages;

  let messages = en;
  if (locale !== "en") {
    const overrides = (await import(`./messages/${locale}.json`))
      .default as Messages;
    messages = withFallback(en, overrides);
  }

  /* -------------------------------------------------------------------------
     ADMIN-EDITED COPY, MERGED LAST SO IT WINS.

     Everything above this point is the repo catalogue — the complete, always-
     present definition of every string. `public.content_strings` (0011) holds
     the rows Aiman has edited in the admin panel, and they are applied on top.

     🔴 THE ORDER IS DELIBERATE: english -> spanish fallback -> admin edits. An
     admin edit to a Spanish string must beat the English fallback, or editing
     /es would appear to do nothing wherever es.json was still empty.

     🔴 THIS STEP CANNOT BREAK A PAGE. `getStringOverrides` swallows every
     failure and returns {} — no Supabase, no table, a thrown query, all render
     the repo catalogue unchanged. `mergeOverrides` clones before writing and
     drops any key that does not already resolve to a string leaf, so a bad row
     cannot replace a namespace object and take `t()` down with it. If this
     whole feature were deleted tomorrow the site would render identically.
  ------------------------------------------------------------------------- */
  const edits = await getStringOverrides(locale);
  const merged = mergeOverrides(
    messages as unknown as Record<string, unknown>,
    edits,
  );

  return { locale, messages: merged as AbstractIntlMessages };
});
