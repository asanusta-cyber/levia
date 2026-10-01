// Сводная таблица EN | RU | UK для вычитки переводов. Строится прямо из словарей.
// Запуск: npm run i18n:table > i18n-table.md
//
// Склонения показываются примерами на числах 1, 2, 5 (формы one / few / many).
// Форма other в RU/UK — запасная для дробных чисел, в интерфейсе не встречается.

const { en } = await import("../lib/i18n/dictionaries/en.ts");
const { ru } = await import("../lib/i18n/dictionaries/ru.ts");
const { uk } = await import("../lib/i18n/dictionaries/uk.ts");

const PLURAL_KEYS = new Set(["one", "few", "many", "other"]);

function isPluralForms(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "one" in value &&
    "other" in value &&
    Object.keys(value).every((k) => PLURAL_KEYS.has(k))
  );
}

function pluralSamples(locale, forms) {
  const rules = new Intl.PluralRules(locale);
  const seen = new Set();
  const out = [];
  for (const n of [1, 2, 5]) {
    const template = forms[rules.select(n)] ?? forms.other;
    const text = template.includes("{count}")
      ? template.replaceAll("{count}", String(n))
      : `${n} ${template}`;
    if (!seen.has(text)) {
      seen.add(text);
      out.push(text);
    }
  }
  return out.join(" · ");
}

// Подсказка шага 3: { situation, want }. want — код, его не переводят,
// поэтому он уходит в ключ строки, а в ячейку — только текст ситуации.
function isWantHint(value) {
  // Обе строки обязательны: у самого словаря тоже есть разделы situation и want.
  return (
    value &&
    typeof value === "object" &&
    typeof value.situation === "string" &&
    typeof value.want === "string"
  );
}

function flatten(value, locale, path = "") {
  if (typeof value === "string") return [[path, value]];
  if (isPluralForms(value)) return [[path, pluralSamples(locale, value)]];
  if (isWantHint(value)) return [[`${path} → ${value.want}`, value.situation]];
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => flatten(v, locale, `${path}.${i + 1}`));
  }
  return Object.entries(value).flatMap(([k, v]) =>
    flatten(v, locale, path ? `${path}.${k}` : k)
  );
}

const cell = (s) => (s ?? "").replaceAll("|", "\\|").replaceAll("\n", " ⏎ ");

const ruByKey = new Map(flatten(ru, "ru"));
const ukByKey = new Map(flatten(uk, "uk"));

let section = null;
const lines = [];
for (const [key, enValue] of flatten(en, "en")) {
  const top = key.split(".")[0];
  if (top !== section) {
    section = top;
    lines.push("", `### ${top}`, "", "| key | EN | RU | UK |", "|---|---|---|---|");
  }
  const shortKey = key.slice(top.length + 1) || top;
  lines.push(
    `| ${cell(shortKey)} | ${cell(enValue)} | ${cell(ruByKey.get(key))} | ${cell(ukByKey.get(key))} |`
  );
}

console.log(lines.join("\n").trim());
