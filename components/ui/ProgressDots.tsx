interface Props {
  current: number;
  total?: number;
  /** Уже переведённая подпись для скринридеров, например «Шаг 2 из 5». */
  label: string;
}

export function ProgressDots({ current, total = 5, label }: Props) {
  return (
    <div
      className="flex gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={label}
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        return (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              filled ? "bg-primary" : "bg-secondary"
            }`}
          />
        );
      })}
    </div>
  );
}
