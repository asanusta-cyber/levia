"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { listSessions, type Session } from "@/lib/db";
import { groupByDay, type DayGroup as DayGroupT } from "@/lib/stats";
import { feelingLabel } from "@/lib/feelings";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { formatMonthYear, formatTime, relativeDay } from "@/lib/i18n/format";
import { Pill } from "@/components/ui/Pill";
import { Toast } from "@/components/ui/Toast";

export default function HistoryPage() {
  const { t, formatLocale } = useI18n();
  const sessions = useLiveQuery(() => listSessions());

  // «Сейчас» — только на клиенте: у сервера своя таймзона, и на границе месяца
  // заголовок с сервера не совпал бы с клиентским.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const isLoading = sessions === undefined || now === null;
  const isEmpty = sessions !== undefined && sessions.length === 0;
  const groups = !isLoading && !isEmpty ? groupByDay(sessions) : [];

  return (
    <>
      <Toast />
      <div className="flex flex-col gap-6">
        {/* Три колонки: заголовок по центру не сдвигается, когда появляется месяц. */}
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link href="/" className="justify-self-start text-sm text-muted">
            {t.common.back}
          </Link>
          <h1 className="text-md font-medium">{t.history.title}</h1>
          <span className="justify-self-end text-sm text-muted">
            {now ? formatMonthYear(now, formatLocale) : ""}
          </span>
        </header>

        {isEmpty && (
          <div className="rounded-lg bg-secondary p-4 text-sm text-muted">
            {t.history.empty}
          </div>
        )}

        {now && !isLoading && !isEmpty && (
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
  const { formatLocale } = useI18n();
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xs uppercase tracking-wide text-tertiary">
        {relativeDay(group.ts, now, formatLocale)}
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
  const { t, formatLocale } = useI18n();
  const delta = session.intensityAfter - session.intensityBefore;
  const deltaClass =
    delta < 0 ? "text-success-text" : delta === 0 ? "text-muted" : "text-primary";

  const label = feelingLabel(session.feeling, session.customFeeling, t.feelings);

  return (
    <Link
      href={`/session/${session.id}`}
      className="flex flex-col gap-2 rounded-lg bg-surface p-4 transition active:opacity-80"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-2xs text-muted tabular-nums">
          {formatTime(session.createdAt, formatLocale)}
        </span>
        <span className={`text-2xs tabular-nums ${deltaClass}`}>
          {session.intensityBefore} → {session.intensityAfter}
        </span>
      </div>
      <div className="line-clamp-2 text-sm">{session.situation}</div>
      <div className="flex flex-wrap gap-1.5">
        <Pill>{label}</Pill>
        {session.rootWant && <Pill>{t.rootWants[session.rootWant].label}</Pill>}
      </div>
    </Link>
  );
}
