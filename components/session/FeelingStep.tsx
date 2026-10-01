"use client";

import { useEffect, useRef } from "react";
import { FEELING_CODES, type Feeling } from "@/lib/feelings";
import { useI18n } from "@/lib/i18n/LocaleProvider";

interface Props {
  feeling: Feeling | null;
  customFeeling: string;
  onFeeling: (f: Feeling) => void;
  onCustomFeeling: (v: string) => void;
}

export function FeelingStep({
  feeling,
  customFeeling,
  onFeeling,
  onCustomFeeling,
}: Props) {
  const { t } = useI18n();
  const firstRef = useRef<HTMLButtonElement>(null);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (feeling === "other") {
      customRef.current?.focus({ preventScroll: true });
    }
  }, [feeling]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{t.feeling.title}</h2>
        <p className="text-sm text-muted">{t.feeling.subtitle}</p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={t.feeling.groupLabel}
      >
        {FEELING_CODES.map((f, i) => {
          const active = feeling === f;
          return (
            <button
              key={f}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onFeeling(f)}
              className={`rounded-lg px-4 py-2 text-sm transition active:opacity-80 ${
                active
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-primary"
              }`}
            >
              {t.feelings[f]}
            </button>
          );
        })}
      </div>

      {feeling === "other" && (
        <input
          ref={customRef}
          value={customFeeling}
          onChange={(e) => onCustomFeeling(e.target.value)}
          placeholder={t.feeling.customPlaceholder}
          maxLength={40}
          className="rounded-lg bg-surface px-4 py-3 text-base placeholder:text-tertiary focus:outline-none focus:ring-1 focus:ring-border"
          aria-label={t.feeling.customLabel}
        />
      )}
    </div>
  );
}
