import type { Dictionary } from "./en";

export const uk = {
  meta: {
    title: "Levia — практика відпускання",
    description: "Тихий щоденник практики методу Седони",
  },

  common: {
    back: "‹ назад",
    history: "Історія",
    settings: "Налаштування",
  },

  greeting: {
    morning: "Доброго ранку",
    afternoon: "Добрий день",
    evening: "Добрий вечір",
    night: "Доброї ночі",
  },

  home: {
    statsLabel: "Статистика",
    streakCaption: "серія",
    totalCaption: "усього",
    daysUnit: { one: "день", few: "дні", many: "днів", other: "дня" },
    sessionsUnit: { one: "сесія", few: "сесії", many: "сесій", other: "сесії" },
    newStreak: "Почни\nнову серію",
    start: "Почати сесію",
    startNote: "10 хвилин · 5 кроків",
    introLabel: "Про метод",
    intro:
      "Метод Седони — проста практика відпускання важких емоцій. Кожна сесія триває 5–10 хвилин. Почни першу — і побачиш, як це працює.",
  },

  session: {
    stepOf: "Крок {current} з {total}",
    next: "Далі",
    finish: "Завершити сесію",
    saving: "Зберігаю…",
    saved: "Сесію збережено",
    hint: {
      describeSituation: "Опиши ситуацію, щоб продовжити",
      moveSlider: "Торкнися повзунка, щоб зафіксувати інтенсивність",
      chooseFeeling: "Обери почуття",
      nameFeeling: "Назви своє почуття",
      chooseWant: "Обери одне з трьох",
      checkAll: "Відзнач усі чотири, коли внутрішню відповідь знайдено",
    },
    exit: {
      title: "Перервати сесію?",
      description: "Введене не збережеться.",
      confirm: "Перервати",
      cancel: "Продовжити",
    },
  },

  intensity: {
    label: "Інтенсивність",
    outOf: "з {max}",
    milder: "слабше",
    stronger: "сильніше",
  },

  situation: {
    title: "Назви ситуацію",
    subtitle: "Що зараз тривожить, дратує чи обтяжує — однією-двома фразами.",
    placeholder: "Наприклад: колега перебиває на нараді, відчуваю роздратування",
    intensityQuestion: "Наскільки сильно зараз?",
    intensityLabel: "Інтенсивність зараз",
  },

  feeling: {
    title: "Назви почуття",
    subtitle: "Що найточніше описує відчуття просто зараз?",
    groupLabel: "Почуття",
    customPlaceholder: "Своє слово",
    customLabel: "Власне формулювання почуття",
  },

  feelings: {
    anxiety: "тривога",
    anger: "гнів",
    hurt: "образа",
    fear: "страх",
    frustration: "роздратування",
    envy: "заздрість",
    sadness: "смуток",
    shame: "сором",
    guilt: "провина",
    helplessness: "безсилля",
    other: "інше",
  },

  want: {
    title: "Знайди кореневе «хочу»",
    subtitle:
      "Під майже кожною важкою емоцією лежить одне з трьох бажань. Яке відгукується?",
    groupLabel: "Кореневе бажання",
    hintsToggle: "Вагаєшся? Переглянь підказки",
  },

  rootWants: {
    approval: {
      title: "Схвалення",
      description: "Щоб тебе любили, приймали й цінували",
      label: "схвалення",
    },
    control: {
      title: "Контролю",
      description: "Керувати людьми, ситуацією, результатом",
      label: "контроль",
    },
    safety: {
      title: "Безпеки",
      description: "Вижити, захиститися, мати гарантії",
      label: "безпека",
    },
  },

  rootWantHints: [
    { situation: "Мене не оцінили на роботі, прикро", want: "approval" },
    { situation: "Довго немає відповіді на повідомлення — тривога наростає", want: "approval" },
    { situation: "Усе пішло не за планом, дратує", want: "control" },
    { situation: "Не можу змусити близьку людину змінитися", want: "control" },
    { situation: "Боюся втратити роботу, страх перед майбутнім", want: "safety" },
    { situation: "Здоров’я підводить, відчуття безпорадності", want: "safety" },
  ],

  questions: {
    title: "Пройди чотири запитання",
    subtitle:
      "Не поспішай. Запитай себе чесно — відзнач, коли внутрішню відповідь знайдено.",
    checked: "відзначено",
    items: {
      allowToBe: {
        question: "Чи можу я дозволити цьому почуттю просто бути?",
        hint: "Не придушувати, не пояснювати — визнати, що воно є.",
      },
      canRelease: {
        question: "Чи можу я його відпустити?",
        hint: "Так само, як розтискаєш руку з гарячим предметом, — без боротьби.",
      },
      readyToRelease: {
        question: "Чи відпущу я його?",
        hint: "Іноді частина тебе хоче ще потримати почуття — це теж важливо помітити.",
      },
      whenNow: {
        question: "Коли? — Зараз.",
        hint: "Рішення відпустити завжди ухвалюється в теперішньому моменті.",
      },
    },
  },

  reflection: {
    title: "Що змінилося?",
    subtitle:
      "Що тепер у тілі, думках, диханні? Якщо нічого — це теж чесна відповідь.",
    intensityQuestion: "Наскільки сильно тепер?",
    intensityLabel: "Інтенсивність тепер",
    placeholder: "Наприклад: дихання стало глибшим, плечі розслабилися",
    fieldLabel: "Що змінилося",
  },

  history: {
    title: "Історія",
    empty: "Тут з’являтимуться твої сесії. Почни першу з головного екрана.",
  },

  detail: {
    back: "‹ історія",
    duration: "Тривалість: {duration}",
    situation: "Ситуація",
    feelingAndWant: "Почуття і хочу",
    questions: "Чотири запитання",
    intensity: "Інтенсивність",
    beforeAfter: "До → Після",
    changed: "Що змінилося",
    notFound: "Сесію не знайдено. Можливо, її видалено.",
    backToHistory: "Повернутися до історії",
    delete: "Видалити сесію",
    deleting: "Видаляю…",
    deleted: "Сесію видалено",
    confirm: {
      title: "Видалити цю сесію?",
      description: "Цю дію не можна скасувати.",
      confirm: "Видалити",
      cancel: "Скасувати",
    },
  },

  settings: {
    title: "Налаштування",
    language: "Мова",
    backup: "Резервна копія",
    export: "Експортувати всі дані (JSON)",
    exporting: "Готую файл…",
    exportHint: "Спершу додай хоча б одну сесію",
    exportDone: "Файл завантажено",
    exportFailed: "Не вдалося створити файл",
    import: "Імпортувати дані",
    importing: "Імпортую…",
    notBackup: "Файл не розпізнано як резервну копію Levia",
    importFailed: "Не вдалося імпортувати дані",
    importNothing: "Немає чого імпортувати",
    importAdded: {
      one: "Додано {count} сесію",
      few: "Додано {count} сесії",
      many: "Додано {count} сесій",
      other: "Додано {count} сесії",
    },
    importNoneAdded: "Нічого не додано",
    importDuplicates: "пропущено {count} (уже є)",
    importInvalid: {
      one: "{count} запис із помилкою",
      few: "{count} записи з помилкою",
      many: "{count} записів із помилкою",
      other: "{count} запису з помилкою",
    },
    about: "Про застосунок",
    aboutText:
      "Метод Седони (Лестера Левенсона) — проста практика відпускання важких емоцій через п’ять послідовних кроків: назвати ситуацію, знайти почуття, побачити кореневе «хочу», пройти чотири внутрішні запитання й помітити, що змінилося.",
  },

  duration: {
    seconds: "{s} с",
    minutes: "{m} хв",
    minutesSeconds: "{m} хв {s} с",
    hours: "{h} год",
    hoursMinutes: "{h} год {m} хв",
  },
} satisfies Dictionary;
