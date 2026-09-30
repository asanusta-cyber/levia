import type { Feeling, RootWant } from "./db";

/** Временные русские подписи чувств. В подходе 2 их заменят словари i18n. */
export const FEELING_LABEL_RU: Record<Feeling, string> = {
  anxiety: "тревога",
  anger: "гнев",
  hurt: "обида",
  fear: "страх",
  frustration: "раздражение",
  envy: "зависть",
  sadness: "грусть",
  shame: "стыд",
  guilt: "вина",
  helplessness: "бессилие",
  other: "другое",
};

export interface RootWantOption {
  id: RootWant;
  title: string;
  description: string;
}

/** Короткие именительные ярлыки для пилюль и истории — отличаются от родительного в карточках выбора. */
export const ROOT_WANT_LABEL: Record<RootWant, string> = {
  approval: "одобрение",
  control: "контроль",
  safety: "безопасность",
};

export const ROOT_WANTS: RootWantOption[] = [
  {
    id: "approval",
    title: "Одобрения",
    description: "Быть любимым, принятым, ценным в чужих глазах",
  },
  {
    id: "control",
    title: "Контроля",
    description: "Управлять людьми, ситуацией, исходом",
  },
  {
    id: "safety",
    title: "Безопасности",
    description: "Выжить, защититься, иметь гарантии",
  },
];

export interface QuestionDef {
  key: "allowToBe" | "canRelease" | "readyToRelease" | "whenNow";
  question: string;
  hint: string;
}

export const QUESTIONS: QuestionDef[] = [
  {
    key: "allowToBe",
    question: "Могу ли я позволить этому чувству просто быть?",
    hint: "Не подавлять, не объяснять — признать, что оно есть.",
  },
  {
    key: "canRelease",
    question: "Могу ли я его отпустить?",
    hint: "Так же, как разжал бы руку с горячим предметом — без борьбы.",
  },
  {
    key: "readyToRelease",
    question: "Готов ли я отпустить?",
    hint: "Иногда часть тебя хочет ещё подержать чувство — это тоже важно заметить.",
  },
  {
    key: "whenNow",
    question: "Когда? — Сейчас.",
    hint: "Решение отпустить всегда происходит в настоящем моменте.",
  },
];

export interface RootWantHint {
  situation: string;
  want: RootWant;
}

export const ROOT_WANT_HINTS: RootWantHint[] = [
  {
    situation: "Меня не оценили на работе, обидно",
    want: "approval",
  },
  {
    situation: "Партнёр не отвечает на сообщение — тревога нарастает",
    want: "approval",
  },
  {
    situation: "Всё пошло не по плану, бесит",
    want: "control",
  },
  {
    situation: "Не могу заставить близкого человека измениться",
    want: "control",
  },
  {
    situation: "Боюсь потерять работу, страх перед будущим",
    want: "safety",
  },
  {
    situation: "Здоровье подводит, ощущение беспомощности",
    want: "safety",
  },
];

export const APP_NAME = "Levia";
export const APP_VERSION = "0.1.0";

export const ABOUT_TEXT =
  "Метод Седоны (Лестера Левенсона) — простая практика отпускания тяжёлых эмоций через пять последовательных шагов: назвать ситуацию, найти чувство, увидеть корневое «хочу», пройти четыре внутренних вопроса и заметить, что изменилось.";
