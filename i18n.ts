import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

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

  return { locale, messages: messages as AbstractIntlMessages };
});
