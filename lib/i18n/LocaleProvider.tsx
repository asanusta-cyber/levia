"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALE_COOKIE,
  isLocale,
  resolveFormatLocale,
  type Locale,
} from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";
import { fmt, plural } from "./format";
import type { PluralForms } from "./types";

interface I18n {
  locale: Locale;
  t: Dictionary;
  /** Локаль для Intl-форматирования дат (для EN учитывает регион браузера). */
  formatLocale: string;
  setLocale: (locale: Locale) => void;
  fmt: typeof fmt;
  plural: (forms: PluralForms, count: number, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18n | null>(null);

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readLocaleCookie(): Locale | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return isLocale(value) ? value : null;
}

function writeLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

/**
 * Язык приходит с сервера (initialLocale), поэтому первый HTML уже на нужном
 * языке. Смена языка — только клиентский state + cookie, без запроса к серверу.
 */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [browserLanguages, setBrowserLanguages] = useState<readonly string[]>([]);

  useEffect(() => {
    setBrowserLanguages(
      navigator.languages?.length ? navigator.languages : [navigator.language]
    );
    // Оффлайн service worker может отдать HTML, отрендеренный до смены языка.
    // Cookie — источник правды о ручном выборе, сверяемся с ней.
    const saved = readLocaleCookie();
    if (saved && saved !== initialLocale) setLocaleState(saved);
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = dictionaries[locale].meta.title;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writeLocaleCookie(next);
    setLocaleState(next);
  }, []);

  const value = useMemo<I18n>(
    () => ({
      locale,
      t: dictionaries[locale],
      formatLocale: resolveFormatLocale(locale, browserLanguages),
      setLocale,
      fmt,
      plural: (forms, count, vars) => plural(locale, forms, count, vars),
    }),
    [locale, browserLanguages, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <LocaleProvider>");
  return value;
}
