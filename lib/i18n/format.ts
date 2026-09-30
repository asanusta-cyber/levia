import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";
import type { PluralForms } from "./types";

type Vars = Record<string, string | number>;

/** Подставляет {name} из vars. Неизвестные плейсхолдеры остаются как есть. */
export function fmt(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
}

const pluralRulesCache = new Map<Locale, Intl.PluralRules>();

function pluralRules(locale: Locale): Intl.PluralRules {
  let rules = pluralRulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRulesCache.set(locale, rules);
  }
  return rules;
}

/** Форма слова для числа по правилам языка (Intl.PluralRules). */
export function pluralForm(locale: Locale, forms: PluralForms, count: number): string {
  const category = pluralRules(locale).select(count);
  const form = (forms as unknown as Record<string, string | undefined>)[category];
  return form ?? forms.other;
}

/** pluralForm + подстановка {count} и остальных vars. */
export function plural(
  locale: Locale,
  forms: PluralForms,
  count: number,
  vars: Vars = {}
): string {
  return fmt(pluralForm(locale, forms, count), { count, ...vars });
}

export type GreetingKey = keyof Dictionary["greeting"];

export function greetingKey(date: Date): GreetingKey {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "evening";
  return "night";
}

/** «четверг, 30 апреля» / «Thursday 30 April» / «Thursday, April 30». */
export function formatTodayHeading(date: Date, formatLocale: string): string {
  return new Intl.DateTimeFormat(formatLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** «14:32» / «2:32 PM». В 24-часовых локалях час с ведущим нулём, как раньше. */
export function formatTime(ts: number, formatLocale: string): string {
  const hour12 = new Intl.DateTimeFormat(formatLocale, { hour: "numeric" })
    .resolvedOptions().hour12;
  return new Intl.DateTimeFormat(formatLocale, {
    hour: hour12 ? "numeric" : "2-digit",
    minute: "2-digit",
  }).format(ts);
}

/** «30 апреля 2026 г. в 14:32» / «30 April 2026 at 14:32». */
export function formatFullDateTime(ts: number, formatLocale: string): string {
  return new Intl.DateTimeFormat(formatLocale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(ts);
}

/** «Апрель 2026» — именительный падеж, с заглавной, без «г.». */
export function formatMonthYear(date: Date, formatLocale: string): string {
  const month = new Intl.DateTimeFormat(formatLocale, { month: "long" }).format(date);
  const capitalized = month.charAt(0).toLocaleUpperCase(formatLocale) + month.slice(1);
  return `${capitalized} ${date.getFullYear()}`;
}

function startOfDay(d: Date): number {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r.getTime();
}

/**
 * Относительная дата для заголовков дней:
 * сегодня / вчера / позавчера / 5 дней назад — в пределах недели,
 * дальше «14 апреля», а для прошлых лет — «14 апреля 2025 г.».
 */
export function relativeDay(ts: number, now: Date, formatLocale: string): string {
  const d = new Date(ts);
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (days < 7) {
    const rtf = new Intl.RelativeTimeFormat(formatLocale, { numeric: "auto" });
    // Даты из будущего (сбитые часы устройства) показываем как «сегодня».
    return rtf.format(days <= 0 ? 0 : -days, "day");
  }

  const sameYear = d.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(formatLocale, {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(d);
}

/** «4 мин 23 с» / «4 min 23 s» / «1 год 5 хв». */
export function formatDuration(
  seconds: number,
  templates: Dictionary["duration"]
): string {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return fmt(templates.seconds, { s: total });

  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) {
    return s === 0
      ? fmt(templates.minutes, { m })
      : fmt(templates.minutesSeconds, { m, s });
  }

  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm === 0
    ? fmt(templates.hours, { h })
    : fmt(templates.hoursMinutes, { h, m: mm });
}
