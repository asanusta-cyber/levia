import type { Dictionary } from "./en";

export const ru = {
  meta: {
    title: "Levia — практика отпускания",
    description: "Тихий дневник практики метода Седоны",
  },

  common: {
    back: "‹ назад",
    history: "История",
    settings: "Настройки",
  },

  greeting: {
    morning: "Доброе утро",
    afternoon: "Добрый день",
    evening: "Добрый вечер",
    night: "Доброй ночи",
  },

  home: {
    statsLabel: "Статистика",
    streakCaption: "серия",
    totalCaption: "всего",
    daysUnit: { one: "день", few: "дня", many: "дней", other: "дня" },
    sessionsUnit: { one: "сессия", few: "сессии", many: "сессий", other: "сессии" },
    newStreak: "Начни\nновую серию",
    start: "Начать сессию",
    startNote: "10 минут · 5 шагов",
    introLabel: "О методе",
    intro:
      "Метод Седоны — простая практика отпускания тяжёлых эмоций. Каждая сессия занимает 5–10 минут. Начни первую — увидишь, как это работает.",
  },

  session: {
    stepOf: "Шаг {current} из {total}",
    next: "Дальше",
    finish: "Завершить сессию",
    saving: "Сохраняю…",
    saved: "Сессия сохранена",
    hint: {
      describeSituation: "Опиши ситуацию, чтобы продолжить",
      moveSlider: "Дотронься до ползунка, чтобы зафиксировать интенсивность",
      chooseFeeling: "Выбери чувство",
      nameFeeling: "Назови своё чувство",
      chooseWant: "Выбери одно из трёх",
      checkAll: "Отметь все четыре, когда внутренний ответ найден",
    },
    exit: {
      title: "Прервать сессию?",
      description: "Введённое не сохранится.",
      confirm: "Прервать",
      cancel: "Продолжить",
    },
  },

  intensity: {
    label: "Интенсивность",
    outOf: "из {max}",
    milder: "тише",
    stronger: "сильнее",
  },

  situation: {
    title: "Назови ситуацию",
    subtitle: "Что сейчас тревожит, раздражает или тяготит — одной-двумя фразами.",
    placeholder: "Например: коллега перебивает на встрече, чувствую раздражение",
    intensityQuestion: "Насколько сильно сейчас?",
    intensityLabel: "Интенсивность сейчас",
  },

  feeling: {
    title: "Назови чувство",
    subtitle: "Что точнее всего описывает ощущение прямо сейчас?",
    groupLabel: "Чувство",
    customPlaceholder: "Своё слово",
    customLabel: "Своя формулировка чувства",
  },

  feelings: {
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
  },

  want: {
    title: "Найди корневое «хочу»",
    subtitle:
      "Под почти любой тяжёлой эмоцией лежит одно из трёх желаний. Какое резонирует?",
    groupLabel: "Корневое желание",
    hintsToggle: "Сомневаешься? Посмотри подсказки",
  },

  rootWants: {
    approval: {
      title: "Одобрения",
      description: "Чтобы тебя любили, принимали и ценили",
      label: "одобрение",
    },
    control: {
      title: "Контроля",
      description: "Управлять людьми, ситуацией, исходом",
      label: "контроль",
    },
    safety: {
      title: "Безопасности",
      description: "Выжить, защититься, иметь гарантии",
      label: "безопасность",
    },
  },

  rootWantHints: [
    { situation: "Меня не оценили на работе, обидно", want: "approval" },
    { situation: "Долго нет ответа на сообщение — тревога нарастает", want: "approval" },
    { situation: "Всё пошло не по плану, бесит", want: "control" },
    { situation: "Не могу заставить близкого человека измениться", want: "control" },
    { situation: "Боюсь потерять работу, страх перед будущим", want: "safety" },
    { situation: "Здоровье подводит, ощущение беспомощности", want: "safety" },
  ],

  questions: {
    title: "Пройди четыре вопроса",
    subtitle:
      "Не торопись. Спроси себя честно — отметь, когда внутренний ответ найден.",
    checked: "отмечено",
    items: {
      allowToBe: {
        question: "Могу ли я позволить этому чувству просто быть?",
        hint: "Не подавлять, не объяснять — признать, что оно есть.",
      },
      canRelease: {
        question: "Могу ли я его отпустить?",
        hint: "Так же, как разжимаешь руку с горячим предметом, — без борьбы.",
      },
      readyToRelease: {
        question: "Отпущу ли я его?",
        hint: "Иногда часть тебя хочет ещё подержать чувство — это тоже важно заметить.",
      },
      whenNow: {
        question: "Когда? — Сейчас.",
        hint: "Решение отпустить всегда происходит в настоящем моменте.",
      },
    },
  },

  reflection: {
    title: "Что изменилось?",
    subtitle:
      "Что в теле, голове, дыхании теперь? Если ничего — это тоже валидный ответ.",
    intensityQuestion: "Насколько сильно теперь?",
    intensityLabel: "Интенсивность теперь",
    placeholder: "Например: дыхание стало глубже, плечи отпустило",
    fieldLabel: "Что изменилось",
  },

  history: {
    title: "История",
    empty: "Здесь будут появляться твои сессии. Начни первую с главного экрана.",
  },

  detail: {
    back: "‹ история",
    duration: "Длительность: {duration}",
    situation: "Ситуация",
    feelingAndWant: "Чувство и хочу",
    questions: "Четыре вопроса",
    intensity: "Интенсивность",
    beforeAfter: "До → После",
    changed: "Что изменилось",
    notFound: "Сессия не найдена. Возможно, она была удалена.",
    backToHistory: "Вернуться к истории",
    delete: "Удалить сессию",
    deleting: "Удаляю…",
    deleted: "Сессия удалена",
    confirm: {
      title: "Удалить эту сессию?",
      description: "Это действие нельзя отменить.",
      confirm: "Удалить",
      cancel: "Отмена",
    },
  },

  settings: {
    title: "Настройки",
    language: "Язык",
    backup: "Резервная копия",
    export: "Экспортировать все данные (JSON)",
    exporting: "Готовлю файл…",
    exportHint: "Сначала добавь хотя бы одну сессию",
    exportDone: "Файл скачан",
    exportFailed: "Не удалось создать файл",
    import: "Импортировать данные",
    importing: "Импортирую…",
    notBackup: "Файл не распознан как бэкап Levia",
    importFailed: "Не удалось импортировать данные",
    importNothing: "Нечего импортировать",
    importAdded: {
      one: "Добавлена {count} сессия",
      few: "Добавлено {count} сессии",
      many: "Добавлено {count} сессий",
      other: "Добавлено {count} сессии",
    },
    importNoneAdded: "Ничего не добавлено",
    importDuplicates: "пропущено {count} (уже есть)",
    importInvalid: {
      one: "{count} запись с ошибкой",
      few: "{count} записи с ошибкой",
      many: "{count} записей с ошибкой",
      other: "{count} записи с ошибкой",
    },
    about: "О приложении",
    aboutText:
      "Метод Седоны (Лестера Левенсона) — простая практика отпускания тяжёлых эмоций через пять последовательных шагов: назвать ситуацию, найти чувство, увидеть корневое «хочу», пройти четыре внутренних вопроса и заметить, что изменилось.",
  },

  duration: {
    seconds: "{s} с",
    minutes: "{m} мин",
    minutesSeconds: "{m} мин {s} с",
    hours: "{h} ч",
    hoursMinutes: "{h} ч {m} мин",
  },
} satisfies Dictionary;
