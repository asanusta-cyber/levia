import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";

/**
 * Язык текущего запроса: cookie ручного выбора → Accept-Language → en.
 * Вызов делает маршрут динамическим (рендер на каждый запрос) — это плата за
 * HTML сразу на нужном языке, без мерцания.
 */
export function getRequestLocale(): Locale {
  return resolveLocale({
    cookie: cookies().get(LOCALE_COOKIE)?.value,
    acceptLanguage: headers().get("accept-language"),
  });
}
