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
import { FEELING_LABEL_RU, ROOT_WANT_LABEL } from "@/lib/constants";
import { feelingLabel } from "@/lib/feelings";
import {
  daysWord,
  formatTodayHeading,
  greeting,
  relativeDay,
  sessionsWord,
} from "@/lib/format";
import { Pill } from "@/components/ui/Pill";
import { Toast } from "@/components/ui/Toast";

export default function HomePage() {
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
            <p className="text-sm text-muted">{formatTodayHeading(now)}</p>
            <h1 className="text-lg font-medium">{greeting(now)}</h1>
          </>
        )}
      </header>

      {hasAny && (
        <section
          aria-label="Статистика"
          className="grid grid-cols-2 items-stretch gap-3"
        >
          {streak !== undefined && streak > 0 ? (
            <StatCard
              value={streak}
              unit={daysWord(streak)}
              caption="серия"
            />
          ) : (
            <NewStreakCard />
          )}
          <StatCard
            value={total!}
            unit={sessionsWord(total!)}
            caption="всего"
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
          Начать сессию
        </Link>
        <p className="text-center text-2xs text-tertiary">10 минут · 5 шагов</p>
      </div>

      <nav className="mt-2 flex justify-center gap-6 text-sm text-muted">
        <Link href="/history">История</Link>
        <Link href="/settings">Настройки</Link>
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

function NewStreakCard() {
  return (
    <div className="flex h-full flex-col justify-center rounded-lg bg-secondary p-4">
      <div className="text-sm font-medium">Начни</div>
      <div className="text-sm font-medium">новую серию</div>
    </div>
  );
}

function LastSessionCard({ session, now }: { session: Session; now: Date }) {
  const delta = session.intensityAfter - session.intensityBefore;
  const deltaClass = delta < 0 ? "text-success-text" : "text-muted";

  const label = feelingLabel(
    session.feeling,
    session.customFeeling,
    FEELING_LABEL_RU
  );

  return (
    <Link
      href={`/session/${session.id}`}
      className="flex flex-col gap-2 rounded-lg bg-surface p-4 transition active:opacity-80"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-2xs text-muted">
          {relativeDay(session.createdAt, now)}
        </span>
        <span className={`text-2xs tabular-nums ${deltaClass}`}>
          {session.intensityBefore} → {session.intensityAfter}
        </span>
      </div>
      <div className="truncate text-sm">{session.situation}</div>
      <div className="flex flex-wrap gap-1.5">
        <Pill>{label}</Pill>
        {session.rootWant && <Pill>{ROOT_WANT_LABEL[session.rootWant]}</Pill>}
      </div>
    </Link>
  );
}

function EmptyStateCard() {
  return (
    <section aria-label="Подсказка">
      <div className="rounded-lg bg-secondary p-4 text-sm leading-relaxed text-muted">
        Метод Седоны — простая практика отпускания тяжёлых эмоций. Каждая
        сессия занимает 5–10 минут. Начни первую — увидишь, как это работает.
      </div>
    </section>
  );
}
