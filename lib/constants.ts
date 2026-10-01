import type { RootWant, SessionQuestions } from "./db";

// Тексты интерфейса живут в lib/i18n/dictionaries. Здесь — только порядок,
// в котором коды выводятся на экран, и метаданные приложения.

export const ROOT_WANT_CODES: RootWant[] = ["approval", "control", "safety"];

export const QUESTION_KEYS: (keyof SessionQuestions)[] = [
  "allowToBe",
  "canRelease",
  "readyToRelease",
  "whenNow",
];

export const APP_NAME = "Levia";
export const APP_VERSION = "0.2.0";
