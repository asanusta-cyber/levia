/**
 * Чувства хранятся языконезависимыми кодами. Подписи для UI берутся из словарей.
 *
 * До v2 базы чувства хранились русскими словами — LEGACY_RU_FEELINGS нужен для
 * миграции IndexedDB (lib/db.ts) и для импорта старых бэкапов (lib/backup.ts).
 */

export const FEELING_CODES = [
  "anxiety",
  "anger",
  "hurt",
  "fear",
  "frustration",
  "envy",
  "sadness",
  "shame",
  "guilt",
  "helplessness",
  "other",
] as const;

export type Feeling = (typeof FEELING_CODES)[number];

const LEGACY_RU_FEELINGS = new Map<string, Feeling>([
  ["тревога", "anxiety"],
  ["гнев", "anger"],
  ["обида", "hurt"],
  ["страх", "fear"],
  ["раздражение", "frustration"],
  ["зависть", "envy"],
  ["грусть", "sadness"],
  ["стыд", "shame"],
  ["вина", "guilt"],
  ["бессилие", "helplessness"],
  ["другое", "other"],
]);

export function isFeelingCode(value: unknown): value is Feeling {
  return (
    typeof value === "string" &&
    (FEELING_CODES as readonly string[]).includes(value)
  );
}

export interface NormalizedFeeling {
  feeling: Feeling;
  customFeeling?: string;
}

/**
 * Приводит сохранённое или импортированное значение чувства к коду. Ничего не теряет:
 * - код остаётся кодом (функция идемпотентна);
 * - русское слово из старого списка превращается в код;
 * - нераспознанное значение превращается в 'other', а исходный текст уходит в
 *   customFeeling — если там уже есть текст, дописывается через « / ».
 */
export function normalizeFeeling(
  rawFeeling: unknown,
  rawCustom: unknown
): NormalizedFeeling {
  const custom =
    typeof rawCustom === "string" && rawCustom.trim().length > 0
      ? rawCustom
      : undefined;

  const original = typeof rawFeeling === "string" ? rawFeeling.trim() : "";
  const key = original.toLowerCase();

  const code = isFeelingCode(key) ? key : LEGACY_RU_FEELINGS.get(key);
  if (code) return withCustom(code, custom);

  if (original.length === 0) return withCustom("other", custom);

  return withCustom(
    "other",
    custom ? `${custom} / ${original}` : original
  );
}

function withCustom(feeling: Feeling, custom: string | undefined): NormalizedFeeling {
  return custom === undefined ? { feeling } : { feeling, customFeeling: custom };
}

/**
 * Подпись чувства для пилюль: своё слово для 'other', иначе подпись из словаря.
 * Значение, которое не является кодом, сначала нормализуется. Так запись, созданная
 * старой версией приложения уже после миграции базы (например, при откате деплоя),
 * всё равно показывается правильно, а не пустой пилюлей.
 */
export function feelingLabel(
  rawFeeling: string,
  rawCustom: string | undefined,
  labels: Record<Feeling, string>
): string {
  const { feeling, customFeeling } = isFeelingCode(rawFeeling)
    ? { feeling: rawFeeling, customFeeling: rawCustom }
    : normalizeFeeling(rawFeeling, rawCustom);
  if (feeling === "other" && customFeeling && customFeeling.trim().length > 0) {
    return customFeeling;
  }
  return labels[feeling];
}
