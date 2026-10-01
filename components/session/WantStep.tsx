"use client";

import { ROOT_WANT_CODES } from "@/lib/constants";
import type { RootWant } from "@/lib/db";
import { useI18n } from "@/lib/i18n/LocaleProvider";

interface Props {
  rootWant: RootWant | null;
  onSelect: (w: RootWant) => void;
}

export function WantStep({ rootWant, onSelect }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{t.want.title}</h2>
        <p className="text-sm text-muted">{t.want.subtitle}</p>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-3"
        role="radiogroup"
        aria-label={t.want.groupLabel}
      >
        {ROOT_WANT_CODES.map((code) => {
          const active = rootWant === code;
          const option = t.rootWants[code];
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(code)}
              className={`flex flex-col gap-1 rounded-lg bg-surface p-4 text-left transition active:opacity-80 ${
                active ? "ring-1 ring-primary" : "ring-1 ring-transparent"
              }`}
            >
              <div className="text-md font-medium">{option.title}</div>
              <div className="text-sm text-muted">{option.description}</div>
            </button>
          );
        })}
      </div>

      <details className="rounded-lg bg-secondary p-4">
        <summary className="cursor-pointer list-none text-sm text-muted">
          {t.want.hintsToggle}
        </summary>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {t.rootWantHints.map((h, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>{h.situation}</span>
              <span className="shrink-0 text-muted">
                → {t.rootWants[h.want].label}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
