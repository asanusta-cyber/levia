"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { listSessions, type Session } from "@/lib/db";
import { groupByDay, type DayGroup as DayGroupT } from "@/lib/stats";
import { currentMonthLabel, formatTime, relativeDay } from "@/lib/format";
import { FEELING_LABEL_RU, ROOT_WANT_LABEL } from "@/lib/constants";
import { feelingLabel } from "@/lib/feelings";
import { Pill } from "@/components/ui/Pill";
import { Toast } from "@/components/ui/Toast";

export default function HistoryPage() {
  const sessions = useLiveQuery(() => listSessions());
  const now = new Date();

  const isLoading = sessions === undefined;
  const isEmpty = !isLoading && sessions.length === 0;
  const groups = !isLoading && !isEmpty ? groupByDay(sessions) : [];

  return (
    <>
      <Toast />
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted">
            ‹ назад
          </Link>
          <h1 className="text-md font-medium">История</h1>
          <span className="text-sm text-muted">{currentMonthLabel(now)}</span>
        </header>

        {isEmpty && (
          <div className="rounded-lg bg-secondary p-4 text-sm text-muted">
            Здесь будут появляться твои сессии. Начни первую с главного экрана.
          </div>
        )}

        {!isLoading && !isEmpty && (
          <div className="flex flex-col gap-6">
            {groups.map((g) => (
              <DayGroup key={g.key} group={g} now={now} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function DayGroup({ group, now }: { group: DayGroupT; now: Date }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xs uppercase tracking-wide text-tertiary">
        {relativeDay(group.ts, now)}
      </h2>
      <div className="flex flex-col gap-2">
        {group.sessions.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
      </div>
    </section>
  );
}

function SessionRow({ session }: { session: Session }) {
  const delta = session.intensityAfter - session.intensityBefore;
  const deltaClass =
    delta < 0 ? "text-success-text" : delta === 0 ? "text-muted" : "text-primary";

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
        <span className="text-2xs text-muted tabular-nums">
          {formatTime(session.createdAt)}
        </span>
        <span className={`text-2xs tabular-nums ${deltaClass}`}>
          {session.intensityBefore} → {session.intensityAfter}
        </span>
      </div>
      <div className="line-clamp-2 text-sm">{session.situation}</div>
      <div className="flex flex-wrap gap-1.5">
        <Pill>{label}</Pill>
        {session.rootWant && <Pill>{ROOT_WANT_LABEL[session.rootWant]}</Pill>}
      </div>
    </Link>
  );
}
