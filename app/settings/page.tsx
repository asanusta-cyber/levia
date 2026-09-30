"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { countSessions, importSessions, type ImportResult } from "@/lib/db";
import { buildBackup, extractBackupSessions } from "@/lib/backup";
import { ABOUT_TEXT, APP_NAME, APP_VERSION } from "@/lib/constants";
import { backupFilename, pluralRu } from "@/lib/format";
import { Toast, setToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const total = useLiveQuery(() => countSessions());
  const fileRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [importingState, setImporting] = useState(false);

  const canExport = total !== undefined && total > 0;
  const exportHint = total === 0 ? "Сначала добавь хотя бы одну сессию" : null;

  async function handleExport() {
    if (exporting || !canExport) return;
    setExporting(true);
    try {
      const payload = JSON.stringify(await buildBackup(), null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backupFilename();
      document.body.appendChild(a);
      a.click();
      a.remove();
      // даём браузеру время инициировать загрузку, потом отзываем url
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setToast("Файл скачан");
    } catch (err) {
      console.error("export failed", err);
      setToast("Не удалось создать файл");
    } finally {
      setExporting(false);
    }
  }

  function openFilePicker() {
    fileRef.current?.click();
  }

  async function handleFile(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setToast("Файл не распознан как бэкап Levia");
        return;
      }

      const items = extractBackupSessions(parsed);
      if (items === null) {
        setToast("Файл не распознан как бэкап Levia");
        return;
      }

      const result = await importSessions(items);
      setToast(buildImportToast(result));
    } catch (err) {
      console.error("import failed", err);
      setToast("Не удалось импортировать данные");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <Toast />
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted">
            ‹ назад
          </Link>
          <h1 className="text-md font-medium">Настройки</h1>
          <span className="w-12" aria-hidden />
        </header>

        <section className="flex flex-col gap-2">
          <h2 className="text-2xs uppercase tracking-wide text-tertiary">
            Резервная копия
          </h2>

          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport || exporting}
            className="rounded-lg bg-surface px-4 py-3 text-left text-sm transition active:opacity-80 disabled:opacity-40"
          >
            {exporting ? "Готовлю файл…" : "Экспортировать все данные (JSON)"}
          </button>
          {exportHint && (
            <p className="text-2xs text-tertiary">{exportHint}</p>
          )}

          <button
            type="button"
            onClick={openFilePicker}
            disabled={importingState}
            className="rounded-lg bg-surface px-4 py-3 text-left text-sm transition active:opacity-80 disabled:opacity-40"
          >
            {importingState ? "Импортирую…" : "Импортировать данные"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              // сброс — чтобы повторный выбор того же файла триггерил onChange
              e.target.value = "";
            }}
          />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-2xs uppercase tracking-wide text-tertiary">
            О приложении
          </h2>
          <p className="text-sm leading-relaxed">{ABOUT_TEXT}</p>
          <p className="text-2xs text-tertiary">
            {APP_NAME} · v{APP_VERSION}
          </p>
        </section>
      </div>
    </>
  );
}

const SESSION_FORMS: [string, string, string] = [
  "сессия",
  "сессии",
  "сессий",
];
const INVALID_FORMS: [string, string, string] = [
  "невалидная запись",
  "невалидные записи",
  "невалидных записей",
];
const EXIST_VERB_FORMS: [string, string, string] = [
  "уже существует",
  "уже существуют",
  "уже существуют",
];

function buildImportToast(r: ImportResult): string {
  const { added, duplicate, invalid } = r;
  if (added === 0 && duplicate === 0 && invalid === 0) {
    return "Нечего импортировать";
  }

  const parts: string[] = [];
  if (added > 0) {
    parts.push(`Добавлено ${added} ${pluralRu(added, SESSION_FORMS)}`);
  } else {
    parts.push("Ничего не добавлено");
  }
  if (duplicate > 0) {
    parts.push(
      `пропущено ${duplicate} (${pluralRu(duplicate, EXIST_VERB_FORMS)})`
    );
  }
  if (invalid > 0) {
    parts.push(`${invalid} ${pluralRu(invalid, INVALID_FORMS)}`);
  }
  return parts.join(", ");
}
