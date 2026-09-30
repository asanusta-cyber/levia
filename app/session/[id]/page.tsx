"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteSession, getSession, type Session } from "@/lib/db";
import { FEELING_LABEL_RU, QUESTIONS, ROOT_WANT_LABEL } from "@/lib/constants";
import { feelingLabel } from "@/lib/feelings";
import { formatDuration, formatFullDateTime } from "@/lib/format";
import { Pill } from "@/components/ui/Pill";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { setToast } from "@/components/ui/Toast";

type State =
  | { status: "loading" }
  | { status: "found"; session: Session }
  | { status: "not-found" };

export default function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const idNum = Number(params.id);

  const [state, setState] = useState<State>({ status: "loading" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isFinite(idNum)) {
      setState({ status: "not-found" });
      return;
    }
    getSession(idNum)
      .then((s) => {
        if (cancelled) return;
        setState(
          s ? { status: "found", session: s } : { status: "not-found" }
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "not-found" });
      });
    return () => {
      cancelled = true;
    };
  }, [idNum]);

  async function handleDelete() {
    if (state.status !== "found" || deleting) return;
    setDeleting(true);
    try {
      await deleteSession(state.session.id!);
      setToast("Сессия удалена");
      router.push("/history");
    } catch (err) {
      console.error("Не удалось удалить сессию", err);
      setDeleting(false);
    }
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <BackHeader />
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="flex flex-col gap-6">
        <BackHeader />
        <div className="rounded-lg bg-secondary p-4 text-sm text-muted">
          Сессия не найдена. Возможно, она была удалена.
        </div>
        <Link
          href="/history"
          className="rounded-lg bg-accent px-6 py-4 text-center text-base font-medium text-accent-fg"
        >
          Вернуться к истории
        </Link>
      </div>
    );
  }

  const s = state.session;
  const delta = s.intensityAfter - s.intensityBefore;
  const deltaClass =
    delta < 0
      ? "text-success-text"
      : delta === 0
        ? "text-muted"
        : "text-primary";

  const label = feelingLabel(s.feeling, s.customFeeling, FEELING_LABEL_RU);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-2">
        <Link href="/history" className="shrink-0 text-sm text-muted">
          ‹ история
        </Link>
        <span className="truncate text-right text-sm text-muted">
          {formatFullDateTime(s.createdAt)}
        </span>
      </header>

      <p className="-mt-3 text-2xs text-tertiary">
        Длительность: {formatDuration(s.durationSeconds)}
      </p>

      <Section title="Ситуация">
        <p className="rounded-lg bg-surface p-4 text-sm leading-relaxed">
          {s.situation}
        </p>
      </Section>

      <Section title="Чувство и хочу">
        <div className="flex flex-wrap gap-2">
          <Pill>{label}</Pill>
          {s.rootWant && <Pill>{ROOT_WANT_LABEL[s.rootWant]}</Pill>}
        </div>
      </Section>

      <Section title="Четыре вопроса">
        <ul className="flex flex-col gap-2">
          {QUESTIONS.map((q) => (
            <li key={q.key} className="flex items-start gap-2 text-sm">
              <span
                className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded text-success-text"
                aria-hidden
              >
                <CheckIcon />
              </span>
              <span>{q.question}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Интенсивность">
        <div className="flex items-baseline justify-between gap-3 rounded-lg bg-surface p-4">
          <span className="text-sm text-muted">До → После</span>
          <span className={`text-md font-medium tabular-nums ${deltaClass}`}>
            {s.intensityBefore} → {s.intensityAfter}
          </span>
        </div>
      </Section>

      {s.reflection && (
        <Section title="Что изменилось">
          <p className="rounded-lg bg-surface p-4 text-sm leading-relaxed">
            {s.reflection}
          </p>
        </Section>
      )}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={deleting}
        className="mt-4 flex items-center justify-center gap-2 self-center text-sm text-destructive transition active:opacity-80 disabled:opacity-40"
      >
        <TrashIcon />
        {deleting ? "Удаляю…" : "Удалить сессию"}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить эту сессию?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        destructive
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          handleDelete();
        }}
      />
    </div>
  );
}

function BackHeader() {
  return (
    <header className="flex items-center justify-between text-sm">
      <Link href="/history" className="text-muted">
        ‹ история
      </Link>
    </header>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xs uppercase tracking-wide text-tertiary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7L6 10L11 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 4h9M5.5 4V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M5 6.5v4M9 6.5v4M3.7 4l.4 7.3a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9L10.3 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
