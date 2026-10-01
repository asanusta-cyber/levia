"use client";

import { useEffect, useRef } from "react";
import { IntensitySlider } from "@/components/ui/IntensitySlider";
import { useI18n } from "@/lib/i18n/LocaleProvider";

interface Props {
  intensityAfter: number;
  hasInteracted: boolean;
  reflection: string;
  onIntensity: (v: number) => void;
  onReflection: (v: string) => void;
}

export function ReflectionStep({
  intensityAfter,
  hasInteracted,
  reflection,
  onIntensity,
  onReflection,
}: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{t.reflection.title}</h2>
        <p className="text-sm text-muted">{t.reflection.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-surface p-4">
        <div className="text-sm text-muted">{t.reflection.intensityQuestion}</div>
        <IntensitySlider
          value={intensityAfter}
          dimmed={!hasInteracted}
          onChange={onIntensity}
          ariaLabel={t.reflection.intensityLabel}
        />
      </div>

      <textarea
        ref={ref}
        value={reflection}
        onChange={(e) => onReflection(e.target.value)}
        placeholder={t.reflection.placeholder}
        rows={4}
        className="min-h-32 w-full resize-none rounded-lg bg-surface p-4 text-base placeholder:text-tertiary focus:outline-none focus:ring-1 focus:ring-border"
        aria-label={t.reflection.fieldLabel}
      />
    </div>
  );
}
