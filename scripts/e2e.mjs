// Сквозная проверка в настоящем Chromium на production-сборке.
//
//   npm run e2e                               — соберёт проект, поднимет next start и прогонит сценарии
//   E2E_BASE_URL=https://… node scripts/e2e.mjs — прогон против уже задеплоенной версии (без сборки)
//
// Браузер: по умолчанию тот, что знает playwright-core (один раз: npx playwright-core install chromium).
// Свой бинарник: CHROMIUM_PATH=/path/to/chrome npm run e2e
//
// Каждый сценарий открывает новый профиль браузера, поэтому настоящие данные
// приложения в твоём браузере не затрагиваются.

import pw from "playwright-core";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const { chromium } = pw;
const require = createRequire(import.meta.url);

const PORT = process.env.E2E_PORT ?? "3100";
const EXTERNAL = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const BASE = EXTERNAL ?? `http://localhost:${PORT}`;
const FIXTURE = fileURLToPath(new URL("../lib/__tests__/fixtures/backup-v1.json", import.meta.url));
const TZ = "Europe/Kyiv";

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  ok ? passed++ : failed++;
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`);
}

/** «Жовтень 2026» для текущего месяца — так же, как заголовок истории. */
function monthHeader(locale) {
  const now = new Date();
  const month = new Intl.DateTimeFormat(locale, { month: "long", timeZone: TZ }).format(now);
  const year = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: TZ }).format(now);
  return month.charAt(0).toLocaleUpperCase(locale) + month.slice(1) + " " + year;
}

async function toastText(page, expected) {
  try {
    await page.waitForFunction(
      (t) => document.querySelector('[role="status"]')?.textContent.trim() === t,
      expected,
      { timeout: 5000 }
    );
  } catch {
    // Вернём то, что есть, — check() покажет расхождение.
  }
  return (await page.locator('[role="status"]').textContent().catch(() => ""))?.trim();
}

/**
 * Записывает каждое значение <html lang> и текста кнопки «Начать» с первого
 * разбора документа. Если язык сначала один, а потом другой — это мерцание.
 */
const recordLanguage = () => {
  window.__seen = { cta: [], lang: [] };
  const push = (arr, v) => {
    if (v != null && arr[arr.length - 1] !== v) arr.push(v);
  };
  const rec = () => {
    push(window.__seen.lang, document.documentElement.lang);
    push(window.__seen.cta, document.querySelector('a[href="/session"]')?.textContent);
  };
  new MutationObserver(rec).observe(document, {
    subtree: true, childList: true, characterData: true, attributes: true,
  });
  document.addEventListener("DOMContentLoaded", rec);
};

async function newContext(browser, options = {}) {
  const ctx = await browser.newContext({ timezoneId: TZ, acceptDownloads: true, ...options });
  await ctx.addInitScript(recordLanguage);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  return { ctx, page, errors };
}

async function importFixture(page) {
  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await page.setInputFiles('input[type="file"]', FIXTURE);
  await page.waitForSelector('[role="status"]');
}

// ─── Сценарий 1: украинский браузер, импорт, смена языка, сессия, удаление, экспорт ───
async function mainFlow(browser) {
  const { ctx, page, errors } = await newContext(browser, { locale: "uk-UA" });

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  let seen = await page.evaluate(() => window.__seen);
  check("UK: <html lang> was only ever 'uk'", JSON.stringify(seen.lang) === '["uk"]', JSON.stringify(seen.lang));
  check("UK: CTA was only ever 'Почати сесію' (no flicker)", JSON.stringify(seen.cta) === '["Почати сесію"]', JSON.stringify(seen.cta));
  check("UK: tab title", (await page.title()) === "Levia — практика відпускання", await page.title());
  check("UK: empty state intro", await page.getByText("В основі Levia").isVisible());

  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await page.setInputFiles('input[type="file"]', FIXTURE);
  const imported = await toastText(page, "Додано 12 сесій");
  check("UK: import of the old Russian backup", imported === "Додано 12 сесій", imported);

  await page.goto(BASE + "/history", { waitUntil: "networkidle" });
  await page.getByText("тривога", { exact: true }).first().waitFor();
  const pills = [...new Set(await page.locator("span.inline-flex").allTextContents())];
  const expectedPills = ["тривога", "гнів", "образа", "безсилля", "усталость", "інше", "схвалення", "безпека", "контроль"];
  check("UK: history pills translated, custom word kept", expectedPills.every((w) => pills.includes(w)), pills.join(", "));
  check("UK: month header", await page.getByText(monthHeader("uk"), { exact: true }).isVisible(), monthHeader("uk"));
  check("UK: day header", (await page.locator("section > h2").first().textContent()) === "12 серпня 2025 р.");

  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  let documentRequests = 0;
  const onRequest = (r) => r.resourceType() === "document" && documentRequests++;
  page.on("request", onRequest);
  await page.getByRole("radio", { name: "English" }).click();
  await page.getByRole("heading", { name: "Settings" }).waitFor({ timeout: 1000 });
  page.off("request", onRequest);
  check("EN: switch without a page load", documentRequests === 0, `document requests: ${documentRequests}`);
  check("EN: <html lang> = en", (await page.evaluate(() => document.documentElement.lang)) === "en");
  check("EN: tab title", (await page.title()) === "Levia — emotional release practice", await page.title());
  check("EN: About with independence notice", await page.getByText("not affiliated with Sedona Training Associates").isVisible());
  check("EN: switcher state", (await page.getByRole("radio", { name: "English" }).getAttribute("aria-checked")) === "true");
  const cookie = (await ctx.cookies()).find((c) => c.name === "levia-locale");
  check("EN: choice saved in cookie", cookie?.value === "en", cookie?.value);

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  seen = await page.evaluate(() => window.__seen);
  check(
    "EN reload: lang only 'en', CTA only 'Start a session'",
    JSON.stringify(seen.lang) === '["en"]' && JSON.stringify(seen.cta) === '["Start a session"]',
    JSON.stringify(seen)
  );

  // Полная сессия на английском
  await page.goto(BASE + "/session", { waitUntil: "networkidle" });
  const next = page.getByRole("button", { name: "Next" });
  check("EN step 1: hint under the disabled button", await page.getByText("Describe the situation to continue").isVisible());
  await page.getByRole("textbox", { name: "Name the situation" }).fill("Test situation in English");
  check("EN step 1: slider hint", await page.getByText("Move the slider to record the intensity").isVisible());
  await page.getByRole("slider", { name: "Intensity before" }).fill("8");
  check("EN step 1: progress label", (await page.getByRole("progressbar").getAttribute("aria-label")) === "Step 1 of 5");
  await next.click();
  await page.getByRole("radio", { name: "frustration" }).click();
  await next.click();
  await page.getByRole("radio", { name: /^Control/ }).click();
  await next.click();
  const questions = ["Could I allow this feeling to just be here?", "Could I let it go?", "Would I let it go?", "When? — Now."];
  let sequential = true;
  for (let i = 0; i < questions.length; i++) {
    const shown = await page.locator("button[aria-pressed]").count();
    const current = page.locator('button[aria-pressed="false"]');
    if (shown !== i + 1 || !(await current.textContent()).includes(questions[i])) sequential = false;
    await current.click();
  }
  check("EN step 4: one question at a time, approved wording", sequential);
  await next.click();
  await page.getByRole("slider", { name: "Intensity after" }).fill("3");
  await page.getByRole("button", { name: "Finish session" }).click();
  await page.waitForURL(BASE + "/");
  const saved = await toastText(page, "Session saved");
  check("EN: saved toast", saved === "Session saved", saved);
  const stats = await page.locator('section[aria-label="Stats"]').textContent();
  check("EN: stats with plurals", /1\s*day/.test(stats) && /13\s*sessions/.test(stats), stats);

  // Русский: детали, удаление, экспорт, повторный импорт
  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: "Русский" }).click();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  seen = await page.evaluate(() => window.__seen);
  check(
    "RU reload: lang only 'ru', CTA only 'Начать сессию'",
    JSON.stringify(seen.lang) === '["ru"]' && JSON.stringify(seen.cta) === '["Начать сессию"]',
    JSON.stringify(seen)
  );
  const ruStats = await page.locator('section[aria-label="Статистика"]').textContent();
  check("RU: stats plurals", /1\s*день/.test(ruStats) && /13\s*сессий/.test(ruStats), ruStats);
  await page.locator('a[href^="/session/"]').first().click();
  await page.getByText("Чувство и «хочу»").waitFor();
  check("RU detail: approved question 3", await page.getByText("Отпущу ли я его?").isVisible());
  check(
    "RU detail: feeling and want pills",
    (await page.getByText("раздражение", { exact: true }).isVisible()) &&
      (await page.getByText("контроль", { exact: true }).isVisible())
  );
  check("RU detail: duration", await page.getByText(/^Длительность: \d+ (с|мин)/).isVisible());
  await page.getByRole("button", { name: "Удалить сессию" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Удалить" }).click();
  await page.waitForURL(BASE + "/history");
  const deleted = await toastText(page, "Сессия удалена");
  check("RU: delete toast", deleted === "Сессия удалена", deleted);

  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Экспортировать/ }).click(),
  ]);
  const file = await download.path();
  const backup = JSON.parse(readFileSync(file, "utf8"));
  check("Export: filename", /^levia-backup-\d{4}-\d{2}-\d{2}\.json$/.test(download.suggestedFilename()), download.suggestedFilename());
  check(
    "Export: version 2, 12 sessions, feelings as codes",
    backup.version === 2 && backup.sessionCount === 12 && backup.sessions.every((x) => /^[a-z]+$/.test(x.feeling)),
    `v${backup.version}, ${backup.sessionCount} sessions`
  );
  const exported = await toastText(page, "Файл скачан");
  check("RU: export toast", exported === "Файл скачан", exported);

  await page.setInputFiles('input[type="file"]', file);
  const reimport = await toastText(page, "Ничего не добавлено, пропущено 12 (уже есть)");
  check("RU: re-import counts duplicates", reimport === "Ничего не добавлено, пропущено 12 (уже есть)", reimport);

  check("Scenario 1: no console errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// ─── Сценарий 2: формат дат в английском ───
async function englishDates(browser) {
  for (const [name, locale, manual, expected] of [
    ["en-US browser", "en-US", null, "August 12, 2025 at 12:13 PM"],
    ["uk-UA browser + manual EN", "uk-UA", "en", "12 August 2025 at 12:13"],
  ]) {
    const { ctx, page, errors } = await newContext(browser, { locale });
    if (manual) await ctx.addCookies([{ name: "levia-locale", value: manual, url: BASE }]);
    await importFixture(page);
    await page.goto(BASE + "/history", { waitUntil: "networkidle" });
    await page.locator("a[href^='/session/']").first().click();
    const full = (await page.locator("header span.truncate").textContent()).trim();
    check(`EN dates, ${name}`, full === expected, full);
    check(`EN dates, ${name}: no console errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
}

// ─── Сценарий 3: оффлайн, кэш service worker, сверка языка с cookie ───
// Сеть «пропадает» остановкой локального сервера. context.setOffline() не годится:
// в Chromium он не действует на запросы самого service worker, и тот молча
// ходит в сеть — проверка выглядела бы зелёной, ничего не проверяя.
async function offline(browser) {
  if (!server) {
    console.log("· skipped: needs the local server (it is stopped to simulate going offline)");
    return;
  }
  const { ctx, page, errors } = await newContext(browser, { locale: "uk-UA" });

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Второй заход уже под контролем воркера — он кладёт в кэш HTML и JS-чанки.
  await page.reload({ waitUntil: "networkidle" });
  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  const cacheNames = await page.evaluate(() => caches.keys());
  check("SW: cache is pause-v2 only", JSON.stringify(cacheNames) === '["pause-v2"]', JSON.stringify(cacheNames));
  const manifest = await page.evaluate(async () => (await (await fetch("/manifest.webmanifest")).json()).name);
  check("PWA: manifest name in English", manifest === "Levia — emotional release practice", manifest);

  // Язык меняют на странице настроек (без перехода), потом сеть пропадает.
  // HTML главной в кэше отрендерен по-украински — провайдер должен свериться с cookie.
  await page.getByRole("radio", { name: "English" }).click();
  await stopServer();
  check("Offline: server is really unreachable", !(await reachable(BASE)));
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForFunction(() => document.documentElement.lang === "en", null, { timeout: 5000 }).catch(() => {});
  const cta = await page.locator('a[href="/session"]').textContent();
  check("Offline: cached home opens and follows the cookie (EN)", cta === "Start a session", cta);
  check("Offline: greeting rendered (JS loaded from cache)", (await page.locator("h1").count()) === 1);

  await page.goto(BASE + "/session/999999", { waitUntil: "load" });
  check("Offline: uncached page shows the English offline screen", await page.getByText("You're offline").isVisible());

  // Без сети Next не может заранее подгрузить данные соседних страниц и пишет
  // об этом в консоль; сам переход потом обрабатывает service worker.
  const offlineNoise = /Failed to load resource|net::ERR_|Failed to fetch RSC payload/;
  const meaningful = errors.filter((e) => !offlineNoise.test(e));
  check("Scenario 3: no console errors besides offline network failures", meaningful.length === 0, meaningful.join(" | "));
  await ctx.close();
}

// ─── Запуск ───
async function reachable(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await reachable(url)) return;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`server at ${url} did not start in ${timeoutMs} ms`);
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill();
  await exited;
}

let server = null;
let browser = null;
try {
  if (!EXTERNAL) {
    if (!existsSync(new URL("../.next/BUILD_ID", import.meta.url))) {
      throw new Error("no production build — run `npm run build` first (npm run e2e does it for you)");
    }
    server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-p", PORT], {
      stdio: "ignore",
    });
    await waitForServer(BASE);
  }
  console.log(`e2e against ${BASE}\n`);

  browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
  );

  // Оффлайн-сценарий последний: он останавливает сервер.
  for (const [name, scenario] of [
    ["1. languages, import, session, export", mainFlow],
    ["2. English date formats", englishDates],
    ["3. offline and service worker", offline],
  ]) {
    console.log(`\n${name}`);
    try {
      await scenario(browser);
    } catch (err) {
      check(`${name}: finished without crashing`, false, err.message.split("\n")[0]);
    }
  }
} catch (err) {
  failed++;
  console.error(`\n✗ ${err.message}`);
  if (/Executable doesn't exist/.test(err.message)) {
    console.error("  Install the browser once: npx playwright-core install chromium");
  }
} finally {
  await browser?.close();
  await stopServer();
}

console.log(`\n${passed}/${passed + failed} checks passed`);
process.exit(failed ? 1 : 0);
