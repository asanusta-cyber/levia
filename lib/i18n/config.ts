export const LOCALES = ["en", "ru", "uk"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie пишется только при ручном выборе языка. До этого язык следует за браузером. */
export const LOCALE_COOKIE = "levia-locale";

/** Названия языков для переключателя — на самих этих языках, не переводятся. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uk: "Українська",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/** ru / ru-RU → ru, uk / uk-UA → uk, всё остальное → null. */
export function localeFromTag(tag: string): Locale | null {
  const lang = tag.trim().toLowerCase().split(/[-_]/)[0];
  if (lang === "ru") return "ru";
  if (lang === "uk") return "uk";
  return null;
}

/**
 * Язык по заголовку Accept-Language: берём самый приоритетный язык
 * (с учётом q-весов), остальные не смотрим. ru* → ru, uk* → uk, иначе en.
 */
export function localeFromAcceptLanguage(
  header: string | null | undefined
): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0, index };
    })
    .filter((e) => e.tag.length > 0 && e.tag !== "*" && e.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  const first = ranked[0];
  return (first && localeFromTag(first.tag)) ?? DEFAULT_LOCALE;
}

/** Порядок: явный выбор пользователя (cookie) → язык браузера → en. */
export function resolveLocale(input: {
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(input.cookie)) return input.cookie;
  return localeFromAcceptLanguage(input.acceptLanguage);
}

/**
 * Локаль для форматирования дат. Для RU/UK — сам язык. Для EN — английский
 * регион браузера, если он есть в списке (en-US → «April 30, 2:32 PM»),
 * иначе en-GB с 24-часовым временем.
 */
export function resolveFormatLocale(
  locale: Locale,
  browserLanguages: readonly string[]
): string {
  if (locale !== "en") return locale;
  for (const tag of browserLanguages) {
    if (tag.toLowerCase().split(/[-_]/)[0] !== "en") continue;
    try {
      return Intl.getCanonicalLocales(tag)[0];
    } catch {
      // Невалидный тег — пробуем следующий.
    }
  }
  return "en-GB";
}
