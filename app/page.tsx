"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  currentStreak,
  getDB,
  lastSession,
  type Session,
} from "@/lib/db";
import { feelingLabel } from "@/lib/feelings";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  formatTodayHeading,
  greetingKey,
  relativeDay,
} from "@/lib/i18n/format";
import { Pill } from "@/components/ui/Pill";
import { Toast } from "@/components/ui/Toast";

export default function HomePage() {
  const { t, plural, formatLocale } = useI18n();

  // Дата считается на клиенте, чтобы избежать SSR-рассинхрона.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const total = useLiveQuery(() => getDB().sessions.count());
  const streak = useLiveQuery(() => currentStreak());
  const last = useLiveQuery(() => lastSession());

  const loaded = total !== undefined;
  const hasAny = loaded && total > 0;

  return (
    <>
    <Toast />
    <div className="flex flex-col gap-6">
      <header className="flex min-h-16 flex-col gap-1">
        {now && (
          <>
            <p className="text-sm text-muted">
              {formatTodayHeading(now, formatLocale)}
            </p>
            <h1 className="text-lg font-medium">{t.greeting[greetingKey(now)]}</h1>
          </>
        )}
      </header>

      {hasAny && (
        <section
          aria-label={t.home.statsLabel}
          className="grid grid-cols-2 items-stretch gap-3"
        >
          {streak !== undefined && streak > 0 ? (
            <StatCard
              value={streak}
              unit={plural(t.home.daysUnit, streak)}
              caption={t.home.streakCaption}
            />
          ) : (
            <NewStreakCard text={t.home.newStreak} />
          )}
          <StatCard
            value={total!}
            unit={plural(t.home.sessionsUnit, total!)}
            caption={t.home.totalCaption}
          />
        </section>
      )}

      {hasAny && last && (
        <LastSessionCard session={last} now={now ?? new Date()} />
      )}

      {loaded && !hasAny && <EmptyStateCard />}

      <div className="flex flex-col gap-1">
        <Link
          href="/session"
          className="rounded-lg bg-accent px-6 py-4 text-center text-base font-medium text-accent-fg transition active:opacity-80"
        >
          {t.home.start}
        </Link>
        <p className="text-center text-2xs text-tertiary">{t.home.startNote}</p>
      </div>

      <nav className="mt-2 flex justify-center gap-6 text-sm text-muted">
        <Link href="/history">{t.common.history}</Link>
        <Link href="/settings">{t.common.settings}</Link>
      </nav>
    </div>
    </>
  );
}

function StatCard({
  value,
  unit,
  caption,
}: {
  value: number;
  unit: string;
  caption: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg bg-surface p-4">
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-medium">{value}</span>
        <span className="text-2xs text-muted">{unit}</span>
      </div>
      <div className="text-2xs text-tertiary">{caption}</div>
    </div>
  );
}

function NewStreakCard({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-lg bg-secondary p-4">
      <div className="whitespace-pre-line text-sm font-medium">{text}</div>
    </div>
  );
}

function LastSessionCard({ session, now }: { session: Session; now: Date }) {
  const { t, formatLocale } = useI18n();
  const delta = session.intensityAfter - session.intensityBefore;
  const deltaClass = delta < 0 ? "text-success-text" : "text-muted";

  const label = feelingLabel(session.feeling, session.customFeeling, t.feelings);

  return (
    <Link
      href={`/session/${session.id}`}
      className="flex flex-col gap-2 rounded-lg bg-surface p-4 transition active:opacity-80"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-2xs text-muted">
          {relativeDay(session.createdAt, now, formatLocale)}
        </span>
        <span className={`text-2xs tabular-nums ${deltaClass}`}>
          {session.intensityBefore} → {session.intensityAfter}
        </span>
      </div>
      <div className="truncate text-sm">{session.situation}</div>
      <div className="flex flex-wrap gap-1.5">
        <Pill>{label}</Pill>
        {session.rootWant && <Pill>{t.rootWants[session.rootWant].label}</Pill>}
      </div>
    </Link>
  );
}

function EmptyStateCard() {
  const { t } = useI18n();
  return (
    <section aria-label={t.home.introLabel}>
      <div className="rounded-lg bg-secondary p-4 text-sm leading-relaxed text-muted">
        {t.home.intro}
      </div>
    </section>
  );
}
