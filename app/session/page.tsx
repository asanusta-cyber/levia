"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { SituationStep } from "@/components/session/SituationStep";
import { FeelingStep } from "@/components/session/FeelingStep";
import { WantStep } from "@/components/session/WantStep";
import { QuestionsStep } from "@/components/session/QuestionsStep";
import { ReflectionStep } from "@/components/session/ReflectionStep";
import { setToast } from "@/components/ui/Toast";
import { createSession, type Feeling, type RootWant, type SessionQuestions } from "@/lib/db";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL: 5 = 5;

const EMPTY_QUESTIONS: SessionQuestions = {
  allowToBe: false,
  canRelease: false,
  readyToRelease: false,
  whenNow: false,
};

export default function SessionPage() {
  const router = useRouter();
  const { t, fmt } = useI18n();

  const [step, setStep] = useState<Step>(1);

  // Шаг 1
  const [situation, setSituation] = useState("");
  const [intensityBefore, setIntensityBefore] = useState(5);
  const [intensityBeforeInteracted, setIntensityBeforeInteracted] =
    useState(false);

  // Шаг 2
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [customFeeling, setCustomFeeling] = useState("");

  // Шаг 3
  const [rootWant, setRootWant] = useState<RootWant | null>(null);

  // Шаг 4
  const [questions, setQuestions] = useState<SessionQuestions>(EMPTY_QUESTIONS);

  // Шаг 5
  const [intensityAfter, setIntensityAfter] = useState(5);
  const [intensityAfterInteracted, setIntensityAfterInteracted] =
    useState(false);
  const [reflection, setReflection] = useState("");

  // Время старта — фиксируется при mount, используется в шаге 5 для durationSeconds.
  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  // Скролл вверх при смене шага.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function goBack() {
    if (step === 1) {
      setConfirmExitOpen(true);
      return;
    }
    setStep((s) => Math.max(1, s - 1) as Step);
  }

  async function finishSession() {
    if (saving) return;
    setSaving(true);
    try {
      const durationSeconds = Math.max(
        0,
        Math.round((Date.now() - startedAtRef.current) / 1000)
      );
      await createSession({
        createdAt: Date.now(),
        durationSeconds,
        situation: situation.trim(),
        feeling: feeling!,
        customFeeling:
          feeling === "other" ? customFeeling.trim() : undefined,
        rootWant,
        questions,
        intensityBefore,
        intensityAfter,
        reflection: reflection.trim(),
      });
      setToast(t.session.saved);
      router.push("/");
    } catch (err) {
      console.error("save failed", err);
      setSaving(false);
    }
  }

  function goNext() {
    if (step === 5) {
      finishSession();
      return;
    }
    setStep((s) => Math.min(TOTAL, s + 1) as Step);
  }

  const canStep1 =
    situation.trim().length >= 3 && intensityBeforeInteracted;
  const canStep2 =
    feeling !== null &&
    (feeling !== "other" || customFeeling.trim().length > 0);
  const canStep3 = rootWant !== null;
  const canStep4 =
    questions.allowToBe &&
    questions.canRelease &&
    questions.readyToRelease &&
    questions.whenNow;
  const canStep5 = intensityAfterInteracted;

  const canNext =
    step === 1
      ? canStep1
      : step === 2
        ? canStep2
        : step === 3
          ? canStep3
          : step === 4
            ? canStep4
            : step === 5
              ? canStep5
              : false;

  const nextLabel = step === 5 ? t.session.finish : t.session.next;

  function getNextHint(): string | null {
    if (canNext) return null;
    const hint = t.session.hint;
    if (step === 1) {
      if (situation.trim().length < 3) return hint.describeSituation;
      if (!intensityBeforeInteracted) return hint.moveSlider;
    }
    if (step === 2) {
      if (feeling === null) return hint.chooseFeeling;
      if (feeling === "other" && customFeeling.trim().length === 0)
        return hint.nameFeeling;
    }
    if (step === 3) {
      if (rootWant === null) return hint.chooseWant;
    }
    if (step === 4) {
      return hint.checkAll;
    }
    if (step === 5) {
      if (!intensityAfterInteracted) return hint.moveSlider;
    }
    return null;
  }
  const nextHint = getNextHint();

  function markQuestion(key: keyof SessionQuestions) {
    setQuestions((prev) => ({ ...prev, [key]: true }));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between text-sm">
        <button type="button" onClick={goBack} className="text-muted">
          {t.common.back}
        </button>
        <span className="text-muted tabular-nums">
          {step} / {TOTAL}
        </span>
      </header>

      <ProgressDots
        current={step}
        total={TOTAL}
        label={fmt(t.session.stepOf, { current: step, total: TOTAL })}
      />

      <div key={step} className="animate-fade-in">
        {step === 1 && (
          <SituationStep
            situation={situation}
            intensity={intensityBefore}
            hasInteractedIntensity={intensityBeforeInteracted}
            onSituation={setSituation}
            onIntensity={(v) => {
              setIntensityBefore(v);
              setIntensityBeforeInteracted(true);
            }}
          />
        )}
        {step === 2 && (
          <FeelingStep
            feeling={feeling}
            customFeeling={customFeeling}
            onFeeling={(f) => {
              setFeeling(f);
              if (f !== "other") setCustomFeeling("");
            }}
            onCustomFeeling={setCustomFeeling}
          />
        )}
        {step === 3 && (
          <WantStep rootWant={rootWant} onSelect={setRootWant} />
        )}
        {step === 4 && (
          <QuestionsStep questions={questions} onMark={markQuestion} />
        )}
        {step === 5 && (
          <ReflectionStep
            intensityAfter={intensityAfter}
            hasInteracted={intensityAfterInteracted}
            reflection={reflection}
            onIntensity={(v) => {
              setIntensityAfter(v);
              setIntensityAfterInteracted(true);
            }}
            onReflection={setReflection}
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext || saving}
          className="rounded-lg bg-accent px-6 py-4 text-center text-base font-medium text-accent-fg transition active:opacity-80 disabled:opacity-40"
        >
          {saving ? t.session.saving : nextLabel}
        </button>
        <p
          className="min-h-5 text-center text-2xs text-tertiary"
          aria-live="polite"
        >
          {nextHint ?? ""}
        </p>
      </div>

      <ConfirmDialog
        open={confirmExitOpen}
        title={t.session.exit.title}
        description={t.session.exit.description}
        confirmLabel={t.session.exit.confirm}
        cancelLabel={t.session.exit.cancel}
        destructive
        onCancel={() => setConfirmExitOpen(false)}
        onConfirm={() => {
          setConfirmExitOpen(false);
          router.push("/");
        }}
      />
    </div>
  );
}
