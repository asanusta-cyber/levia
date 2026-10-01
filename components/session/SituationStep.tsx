"use client";

import { useEffect, useRef } from "react";
import { IntensitySlider } from "@/components/ui/IntensitySlider";
import { useI18n } from "@/lib/i18n/LocaleProvider";

interface Props {
  situation: string;
  intensity: number;
  hasInteractedIntensity: boolean;
  onSituation: (v: string) => void;
  onIntensity: (v: number) => void;
}

export function SituationStep({
  situation,
  intensity,
  hasInteractedIntensity,
  onSituation,
  onIntensity,
}: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{t.situation.title}</h2>
        <p className="text-sm text-muted">{t.situation.subtitle}</p>
      </div>

      <textarea
        ref={ref}
        value={situation}
        onChange={(e) => onSituation(e.target.value)}
        placeholder={t.situation.placeholder}
        aria-label={t.situation.title}
        rows={4}
        className="min-h-32 w-full resize-none rounded-lg bg-surface p-4 text-base placeholder:text-tertiary focus:outline-none focus:ring-1 focus:ring-border"
      />

      <div className="flex flex-col gap-3 rounded-lg bg-surface p-4">
        <div className="text-sm text-muted">{t.situation.intensityQuestion}</div>
        <IntensitySlider
          value={intensity}
          dimmed={!hasInteractedIntensity}
          onChange={onIntensity}
          ariaLabel={t.situation.intensityLabel}
        />
      </div>
    </div>
  );
}
