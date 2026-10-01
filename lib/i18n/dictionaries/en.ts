import type { RootWant } from "../../db";
import type { Feeling } from "../../feelings";
import type { PluralForms } from "../types";

/**
 * Английский словарь задаёт структуру: ru.ts и uk.ts проверяются против
 * `Dictionary` через `satisfies`, так что пропущенный или лишний ключ — ошибка tsc.
 *
 * Плейсхолдеры в фигурных скобках ({count}, {max}, …) подставляет fmt().
 * «\n» — перенос строки, который показывается как есть.
 * В словарях используется только стираемый TS-синтаксис (import type, as,
 * satisfies) — так scripts/i18n-table.mjs может импортировать их через Node.
 */
export const en = {
  meta: {
    title: "Levia — emotional release practice",
    description: "A quiet journal for letting go of difficult emotions",
  },

  common: {
    back: "‹ back",
    history: "History",
    settings: "Settings",
  },

  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Good evening",
  },

  home: {
    statsLabel: "Stats",
    streakCaption: "streak",
    totalCaption: "total",
    daysUnit: { one: "day", other: "days" } as PluralForms,
    sessionsUnit: { one: "session", other: "sessions" } as PluralForms,
    newStreak: "Start\na new streak",
    start: "Start a session",
    startNote: "10 minutes · 5 steps",
    introLabel: "About the method",
    intro:
      "Levia is built on Lester Levenson's releasing technique — a simple practice for letting go of difficult emotions. Each session takes 5–10 minutes. Start your first one and see how it works.",
  },

  session: {
    stepOf: "Step {current} of {total}",
    next: "Next",
    finish: "Finish session",
    saving: "Saving…",
    saved: "Session saved",
    hint: {
      describeSituation: "Describe the situation to continue",
      moveSlider: "Move the slider to record the intensity",
      chooseFeeling: "Choose a feeling",
      nameFeeling: "Name your feeling",
      chooseWant: "Choose one of the three",
      checkAll: "Check all four once each inner answer is found",
    },
    exit: {
      title: "Leave this session?",
      description: "What you've entered won't be saved.",
      confirm: "Leave",
      cancel: "Keep going",
    },
  },

  intensity: {
    label: "Intensity",
    outOf: "of {max}",
    milder: "milder",
    stronger: "stronger",
  },

  situation: {
    title: "Name the situation",
    subtitle:
      "What's worrying, irritating or weighing on you right now — in a sentence or two.",
    placeholder:
      "For example: a colleague keeps interrupting in meetings, I feel irritated",
    intensityQuestion: "How strong is it right now?",
    intensityLabel: "Intensity before",
  },

  feeling: {
    title: "Name the feeling",
    subtitle: "What best describes the feeling right now?",
    groupLabel: "Feeling",
    customPlaceholder: "Your own word",
    customLabel: "Your own word for the feeling",
  },

  feelings: {
    anxiety: "anxiety",
    anger: "anger",
    hurt: "hurt",
    fear: "fear",
    frustration: "frustration",
    envy: "envy",
    sadness: "sadness",
    shame: "shame",
    guilt: "guilt",
    helplessness: "helplessness",
    other: "other",
  } satisfies Record<Feeling, string>,

  want: {
    title: "Find the underlying want",
    subtitle:
      "Almost every heavy emotion has one of three wants beneath it. Which one resonates?",
    groupLabel: "Underlying want",
    hintsToggle: "Not sure? See examples",
  },

  /** title — заголовок карточки на шаге 3, label — подпись в пилюлях. */
  rootWants: {
    approval: {
      title: "Approval",
      description: "To be loved, accepted and valued by others",
      label: "approval",
    },
    control: {
      title: "Control",
      description: "To manage people, situations, outcomes",
      label: "control",
    },
    safety: {
      title: "Security",
      description: "To survive, stay protected, have guarantees",
      label: "security",
    },
  } satisfies Record<RootWant, { title: string; description: string; label: string }>,

  rootWantHints: [
    { situation: "My work went unnoticed, and it hurts", want: "approval" },
    { situation: "No reply to my message for hours — anxiety builds", want: "approval" },
    { situation: "Nothing went to plan, it's infuriating", want: "control" },
    { situation: "I can't make someone close to me change", want: "control" },
    { situation: "Afraid of losing my job, scared of the future", want: "safety" },
    { situation: "My health is letting me down, I feel helpless", want: "safety" },
  ] as { situation: string; want: RootWant }[],

  questions: {
    title: "Go through the four questions",
    subtitle:
      "Take your time. Ask yourself honestly — check each one once the inner answer is there.",
    checked: "checked",
    items: {
      allowToBe: {
        question: "Could I allow this feeling to just be here?",
        hint: "Don't push it away or explain it — just acknowledge that it's here.",
      },
      canRelease: {
        question: "Could I let it go?",
        hint: "The way you'd let go of something hot in your hand — without a struggle.",
      },
      readyToRelease: {
        question: "Would I let it go?",
        hint: "Sometimes part of you wants to hold on a little longer — that's worth noticing too.",
      },
      whenNow: {
        question: "When? — Now.",
        hint: "Letting go always happens in the present moment.",
      },
    },
  },

  reflection: {
    title: "What has changed?",
    subtitle:
      "What's in your body, mind, breath now? If nothing — that's a valid answer too.",
    intensityQuestion: "How strong is it now?",
    intensityLabel: "Intensity after",
    placeholder: "For example: breathing got deeper, shoulders dropped",
    fieldLabel: "What has changed",
  },

  history: {
    title: "History",
    empty: "Your sessions will appear here. Start the first one from the home screen.",
  },

  detail: {
    back: "‹ history",
    duration: "Duration: {duration}",
    situation: "Situation",
    feelingAndWant: "Feeling and underlying want",
    questions: "Four questions",
    intensity: "Intensity",
    beforeAfter: "Before → After",
    changed: "What changed",
    notFound: "Session not found. It may have been deleted.",
    backToHistory: "Back to history",
    delete: "Delete session",
    deleting: "Deleting…",
    deleted: "Session deleted",
    confirm: {
      title: "Delete this session?",
      description: "This can't be undone.",
      confirm: "Delete",
      cancel: "Cancel",
    },
  },

  settings: {
    title: "Settings",
    language: "Language",
    backup: "Backup",
    export: "Export all data (JSON)",
    exporting: "Preparing file…",
    exportHint: "Add at least one session first",
    exportDone: "File downloaded",
    exportFailed: "Couldn't create the file",
    import: "Import data",
    importing: "Importing…",
    notBackup: "This file isn't a Levia backup",
    importFailed: "Couldn't import the data",
    importNothing: "Nothing to import",
    importAdded: {
      one: "Added {count} session",
      other: "Added {count} sessions",
    } as PluralForms,
    importNoneAdded: "Nothing added",
    importDuplicates: "skipped {count} (already there)",
    importInvalid: {
      one: "{count} damaged entry",
      other: "{count} damaged entries",
    } as PluralForms,
    about: "About",
    aboutText:
      "Levia is based on the releasing technique developed by Lester Levenson, later taught as the Sedona Method. Each session follows five steps: name the situation, find the feeling, see the underlying want, go through four inner questions, and notice what has changed. Levia is an independent app, not affiliated with Sedona Training Associates.",
  },

  duration: {
    seconds: "{s} s",
    minutes: "{m} min",
    minutesSeconds: "{m} min {s} s",
    hours: "{h} h",
    hoursMinutes: "{h} h {m} min",
  },
};

export type Dictionary = typeof en;
