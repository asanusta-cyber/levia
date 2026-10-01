import { describe, expect, it } from "vitest";
import {
  LOCALES,
  localeFromAcceptLanguage,
  resolveFormatLocale,
  resolveLocale,
} from "../i18n/config";
import { dictionaries } from "../i18n/dictionaries";
import {
  fmt,
  formatDuration,
  formatFullDateTime,
  formatMonthYear,
  formatTime,
  formatTodayHeading,
  greetingKey,
  plural,
  relativeDay,
} from "../i18n/format";

/** Плоский список [путь, значение] всех строк словаря, включая формы plural и элементы массивов. */
function flatten(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => flatten(v, `${path}.${i}`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => flatten(v, path ? `${path}.${k}` : k));
  }
  throw new Error(`Unexpected value at ${path}`);
}

const placeholders = (s: string) =>
  Array.from(s.matchAll(/\{(\w+)\}/g), (m) => m[1]).sort();

describe("language detection", () => {
  it.each([
    ["ru-RU,ru;q=0.9,en;q=0.8", "ru"],
    ["ru", "ru"],
    ["uk-UA,uk;q=0.9", "uk"],
    ["uk", "uk"],
    ["en-US,en;q=0.9", "en"],
    ["de-DE,ru;q=0.9", "en"], // решает только первый язык
    ["en-GB,uk;q=0.8", "en"],
    ["ru;q=0.5,uk;q=0.9", "uk"], // приоритет по q, а не по порядку
    ["*", "en"],
    ["", "en"],
    ["rue-SK", "en"], // русинский — не русский
  ])("Accept-Language %j → %s", (header, expected) => {
    expect(localeFromAcceptLanguage(header)).toBe(expected);
  });

  it("returns en without a header", () => {
    expect(localeFromAcceptLanguage(null)).toBe("en");
    expect(localeFromAcceptLanguage(undefined)).toBe("en");
  });

  it("prefers the manual choice from the cookie over the browser", () => {
    expect(resolveLocale({ cookie: "uk", acceptLanguage: "ru-RU" })).toBe("uk");
    expect(resolveLocale({ cookie: "en", acceptLanguage: "uk" })).toBe("en");
  });

  it("ignores an unknown cookie value", () => {
    expect(resolveLocale({ cookie: "fr", acceptLanguage: "ru" })).toBe("ru");
    expect(resolveLocale({ cookie: "", acceptLanguage: "uk" })).toBe("uk");
  });
});

describe("date format locale", () => {
  it("follows the browser's English region for EN", () => {
    expect(resolveFormatLocale("en", ["en-US", "en"])).toBe("en-US");
    expect(resolveFormatLocale("en", ["uk-UA", "en-GB"])).toBe("en-GB");
  });

  it("falls back to en-GB (24h) when the browser has no English", () => {
    expect(resolveFormatLocale("en", ["uk-UA", "ru"])).toBe("en-GB");
    expect(resolveFormatLocale("en", [])).toBe("en-GB");
  });

  it("uses the UI language itself for RU and UK", () => {
    expect(resolveFormatLocale("ru", ["en-US"])).toBe("ru");
    expect(resolveFormatLocale("uk", ["en-US"])).toBe("uk");
  });
});

describe("dictionaries", () => {
  const enKeys = flatten(dictionaries.en).map(([k]) => k);

  it.each(LOCALES)("%s has no empty strings", (locale) => {
    for (const [key, value] of flatten(dictionaries[locale])) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  it.each(["ru", "uk"] as const)("%s has exactly the same keys as en (plural forms aside)", (locale) => {
    const keys = flatten(dictionaries[locale])
      .map(([k]) => k)
      .filter((k) => !/\.(few|many)$/.test(k));
    expect(keys.sort()).toEqual([...enKeys].sort());
  });

  it.each(["ru", "uk"] as const)("%s has one/few/many/other for every plural", (locale) => {
    const d = dictionaries[locale];
    for (const forms of [d.home.daysUnit, d.home.sessionsUnit, d.settings.importAdded, d.settings.importInvalid]) {
      expect(Object.keys(forms).sort()).toEqual(["few", "many", "one", "other"]);
    }
  });

  it.each(["ru", "uk"] as const)("%s uses the same placeholders as en", (locale) => {
    const enByKey = new Map(flatten(dictionaries.en));
    // Обходим ключи проверяемого языка: так проверяются и формы few/many,
    // которых в en нет, — их сверяем с en-формой other.
    for (const [key, value] of flatten(dictionaries[locale])) {
      const enKey = key.replace(/\.(few|many)$/, ".other");
      expect(placeholders(value), key).toEqual(placeholders(enByKey.get(enKey)!));
    }
  });

  it.each(LOCALES)("%s hints keep the same order of wants", (locale) => {
    expect(dictionaries[locale].rootWantHints.map((h) => h.want)).toEqual(
      dictionaries.en.rootWantHints.map((h) => h.want)
    );
  });

  it("keeps the approved wording of the four questions verbatim", () => {
    const q = (locale: (typeof LOCALES)[number]) =>
      Object.values(dictionaries[locale].questions.items).map((i) => i.question);
    expect(q("en")).toEqual([
      "Could I allow this feeling to just be here?",
      "Could I let it go?",
      "Would I let it go?",
      "When? — Now.",
    ]);
    expect(q("ru")).toEqual([
      "Могу ли я позволить этому чувству просто быть?",
      "Могу ли я его отпустить?",
      "Отпущу ли я его?",
      "Когда? — Сейчас.",
    ]);
    expect(q("uk")).toEqual([
      "Чи можу я дозволити цьому почуттю просто бути?",
      "Чи можу я його відпустити?",
      "Чи відпущу я його?",
      "Коли? — Зараз.",
    ]);
  });

  describe("trademark and attribution", () => {
    // «Sedona Method» — зарегистрированная марка Sedona Training Associates.
    // Название метода упоминается только в About, рядом с пометкой о независимости.
    const methodName = { en: "Sedona Method", ru: "метод Седоны", uk: "метод Седони" } as const;
    const author = { en: "Lester Levenson", ru: "Лестера Левенсона", uk: "Лестера Левенсона" } as const;

    it.each(LOCALES)("%s mentions the method name only in settings.aboutText", (locale) => {
      const keys = flatten(dictionaries[locale])
        .filter(([, v]) => v.toLowerCase().includes(methodName[locale].toLowerCase()))
        .map(([k]) => k);
      expect(keys).toEqual(["settings.aboutText"]);
    });

    it.each(LOCALES)("%s About states independence from Sedona Training Associates", (locale) => {
      expect(dictionaries[locale].settings.aboutText).toContain("Sedona Training Associates");
    });

    it.each(LOCALES)("%s credits Lester Levenson's technique in the intro and About", (locale) => {
      expect(dictionaries[locale].home.intro).toContain(author[locale]);
      expect(dictionaries[locale].settings.aboutText).toContain(author[locale]);
    });

    it("keeps Levia in Latin and uses Latin in RU/UK only for the company name", () => {
      for (const locale of LOCALES) {
        expect(dictionaries[locale].meta.title.startsWith("Levia — ")).toBe(true);
      }
      for (const locale of ["ru", "uk"] as const) {
        const all = flatten(dictionaries[locale])
          .map(([, v]) => v.replaceAll("Sedona Training Associates", ""))
          .join("\n");
        expect(all).not.toMatch(/Sedona|Levenson/);
      }
    });
  });

  it("does not bring back the gendered forms that were rewritten", () => {
    const banned = ["уверен", "разжал", "Готов ли", "любимым", "принятым", "ценным", "Партнёр", "впевнен", "готовий"];
    for (const locale of ["ru", "uk"] as const) {
      for (const [key, value] of flatten(dictionaries[locale])) {
        for (const word of banned) expect(value, `${locale}.${key}`).not.toContain(word);
      }
    }
  });
});

describe("plurals via Intl.PluralRules", () => {
  const counts = [1, 2, 5, 11, 21, 22, 111];
  const days = (locale: (typeof LOCALES)[number]) =>
    counts.map((n) => `${n} ${plural(locale, dictionaries[locale].home.daysUnit, n)}`);

  it("ru", () => {
    expect(days("ru")).toEqual(["1 день", "2 дня", "5 дней", "11 дней", "21 день", "22 дня", "111 дней"]);
  });

  it("uk", () => {
    expect(days("uk")).toEqual(["1 день", "2 дні", "5 днів", "11 днів", "21 день", "22 дні", "111 днів"]);
  });

  it("en", () => {
    expect(days("en")).toEqual(["1 day", "2 days", "5 days", "11 days", "21 days", "22 days", "111 days"]);
  });

  it("fills {count} in plural templates", () => {
    const t = dictionaries.ru.settings.importAdded;
    expect(plural("ru", t, 1)).toBe("Добавлена 1 сессия");
    expect(plural("ru", t, 23)).toBe("Добавлено 23 сессии");
    expect(plural("uk", dictionaries.uk.settings.importAdded, 5)).toBe("Додано 5 сесій");
    expect(plural("en", dictionaries.en.settings.importAdded, 1)).toBe("Added 1 session");
  });
});

describe("date formatting", () => {
  const now = new Date(2026, 3, 30, 14, 32); // четверг, 30 апреля 2026, 14:32 (локальное время)
  const daysAgo = (n: number) => new Date(2026, 3, 30 - n, 9, 0).getTime();

  it("relative days within a week, exact date after", () => {
    const row = (fl: string) => [0, 1, 2, 5, 6, 7].map((n) => relativeDay(daysAgo(n), now, fl));
    expect(row("ru")).toEqual(["сегодня", "вчера", "позавчера", "5 дней назад", "6 дней назад", "23 апреля"]);
    expect(row("uk")).toEqual(["сьогодні", "учора", "позавчора", "5 днів тому", "6 днів тому", "23 квітня"]);
    expect(row("en-GB")).toEqual(["today", "yesterday", "2 days ago", "5 days ago", "6 days ago", "23 April"]);
  });

  it("adds the year for dates from a previous year", () => {
    const lastYear = new Date(2025, 3, 14).getTime();
    expect(relativeDay(lastYear, now, "ru")).toBe("14 апреля 2025 г.");
    expect(relativeDay(lastYear, now, "en-US")).toBe("April 14, 2025");
  });

  it("treats a future date as today", () => {
    expect(relativeDay(new Date(2026, 4, 2).getTime(), now, "ru")).toBe("сегодня");
  });

  it("month header: nominative, capitalized, no «г.»", () => {
    expect(formatMonthYear(now, "ru")).toBe("Апрель 2026");
    expect(formatMonthYear(now, "uk")).toBe("Квітень 2026");
    expect(formatMonthYear(now, "en-GB")).toBe("April 2026");
  });

  it("today heading", () => {
    expect(formatTodayHeading(now, "ru")).toBe("четверг, 30 апреля");
    expect(formatTodayHeading(now, "uk")).toBe("четвер, 30 квітня");
    expect(formatTodayHeading(now, "en-US")).toBe("Thursday, April 30");
  });

  it("time: 24h with a leading zero, or 12h for en-US", () => {
    const morning = new Date(2026, 3, 30, 9, 5).getTime();
    expect(formatTime(morning, "ru")).toBe("09:05");
    expect(formatTime(morning, "en-GB")).toBe("09:05");
    expect(formatTime(now.getTime(), "en-US")).toMatch(/^2:32\sPM$/);
  });

  it("full date and time", () => {
    expect(formatFullDateTime(now.getTime(), "uk")).toBe("30 квітня 2026 р. о 14:32");
    expect(formatFullDateTime(now.getTime(), "en-GB")).toBe("30 April 2026 at 14:32");
  });

  it("greeting buckets", () => {
    const at = (h: number) => greetingKey(new Date(2026, 3, 30, h));
    expect([at(4), at(5), at(11), at(12), at(17), at(18), at(22), at(23)]).toEqual([
      "night", "morning", "morning", "afternoon", "afternoon", "evening", "evening", "night",
    ]);
  });
});

describe("duration and fmt", () => {
  it("formats durations from dictionary templates", () => {
    const ru = dictionaries.ru.duration;
    expect(formatDuration(48, ru)).toBe("48 с");
    expect(formatDuration(263, ru)).toBe("4 мин 23 с");
    expect(formatDuration(240, ru)).toBe("4 мин");
    expect(formatDuration(3900, dictionaries.uk.duration)).toBe("1 год 5 хв");
    expect(formatDuration(3600, dictionaries.en.duration)).toBe("1 h");
  });

  it("keeps unknown placeholders and ignores inherited keys", () => {
    expect(fmt("{a} {b}", { a: 1 })).toBe("1 {b}");
    expect(fmt("{constructor}", {})).toBe("{constructor}");
  });
});
