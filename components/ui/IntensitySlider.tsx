"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
  /** Если true — большое значение выводится приглушённо, как намёк «дотронься, чтобы зафиксировать». */
  dimmed?: boolean;
}

export function IntensitySlider({
  value,
  onChange,
  min = 1,
  max = 10,
  ariaLabel,
  dimmed = false,
}: Props) {
  const { t, fmt } = useI18n();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-center gap-2">
        <span
          className={`text-[40px] leading-none tabular-nums transition-colors ${
            dimmed ? "text-tertiary" : "text-primary"
          }`}
        >
          {value}
        </span>
        <span className="text-sm text-muted">{fmt(t.intensity.outOf, { max })}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        aria-label={ariaLabel ?? t.intensity.label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-2xs text-tertiary">
        <span>{t.intensity.milder}</span>
        <span>{t.intensity.stronger}</span>
      </div>
    </div>
  );
}
