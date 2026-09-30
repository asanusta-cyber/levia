/**
 * Формы слова для Intl.PluralRules. В EN нужны one/other, в RU/UK — one/few/many.
 * other обязателен как запасной вариант: для целых чисел в RU/UK он не выпадает,
 * поэтому там в other стоит форма few.
 */
export interface PluralForms {
  one: string;
  few?: string;
  many?: string;
  other: string;
}
