import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { ru } from "./ru";
import { uk } from "./uk";

export type { Dictionary } from "./en";

/** Все три словаря в бандле: вместе это пара КБ gzip, зато смена языка мгновенная. */
export const dictionaries: Record<Locale, Dictionary> = { en, ru, uk };
