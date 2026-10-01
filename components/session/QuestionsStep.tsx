"use client";

import { useEffect, useRef } from "react";
import { QUESTION_KEYS } from "@/lib/constants";
import type { SessionQuestions } from "@/lib/db";
import { useI18n } from "@/lib/i18n/LocaleProvider";

interface Props {
  questions: SessionQuestions;
  onMark: (key: keyof SessionQuestions) => void;
}

/**
 * Прогрессивный показ четырёх вопросов:
 * - Пройденные — на зелёном `bg-success-bg`, не редактируемые.
 * - Текущий — `bg-surface` с тёмной рамкой, чекбокс активный, фокус.
 * - Будущие — не отрисовываются вовсе, чтобы пользователь не пробежал глазами все четыре.
 * Текущий индекс выводится из `questions`: число подряд идущих true с начала.
 */
export function QuestionsStep({ questions, onMark }: Props) {
  const { t } = useI18n();

  // Cколько подряд идущих с начала true. Поскольку флаги ставятся только в порядке,
  // это и количество пройденных, и индекс текущего.
  const passedCount = QUESTION_KEYS.findIndex((key) => !questions[key]);
  const passedTotal = passedCount === -1 ? QUESTION_KEYS.length : passedCount;
  const currentIndex = passedTotal < QUESTION_KEYS.length ? passedTotal : -1;

  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    currentRef.current?.focus({ preventScroll: true });
  }, [currentIndex]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{t.questions.title}</h2>
        <p className="text-sm text-muted">{t.questions.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">
        {QUESTION_KEYS.map((key, i) => {
          const q = { key, ...t.questions.items[key] };
          const isPassed = i < passedTotal;
          const isCurrent = i === currentIndex;
          const isFuture = !isPassed && !isCurrent;
          if (isFuture) return null;

          return (
            <button
              key={q.key}
              ref={isCurrent ? currentRef : undefined}
              type="button"
              onClick={() => {
                if (!isPassed) onMark(q.key);
              }}
              disabled={isPassed}
              aria-pressed={isPassed}
              className={`flex items-start gap-3 rounded-lg p-4 text-left transition ${
                isPassed
                  ? "cursor-default bg-success-bg text-success-text"
                  : "bg-surface ring-1 ring-primary"
              }`}
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md ${
                  isPassed
                    ? "bg-success-text text-success-bg"
                    : "border border-primary"
                }`}
                aria-hidden
              >
                {isPassed && <CheckIcon label={t.questions.checked} />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{q.question}</span>
                {!isPassed && (
                  <span className="text-2xs text-muted">{q.hint}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon({ label }: { label: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      role="img"
      aria-label={label}
    >
      <path
        d="M3 7L6 10L11 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
