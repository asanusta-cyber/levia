"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { countSessions, importSessions, type ImportResult } from "@/lib/db";
import {
  backupFilename,
  buildBackup,
  extractBackupSessions,
} from "@/lib/backup";
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fmt } from "@/lib/i18n/format";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { PluralForms } from "@/lib/i18n/types";
import { Toast, setToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { t, locale, setLocale, plural } = useI18n();
  const total = useLiveQuery(() => countSessions());
  const fileRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [importingState, setImporting] = useState(false);

  const canExport = total !== undefined && total > 0;
  const exportHint = total === 0 ? t.settings.exportHint : null;

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
      setToast(t.settings.exportDone);
    } catch (err) {
      console.error("export failed", err);
      setToast(t.settings.exportFailed);
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
        setToast(t.settings.notBackup);
        return;
      }

      const items = extractBackupSessions(parsed);
      if (items === null) {
        setToast(t.settings.notBackup);
        return;
      }

      const result = await importSessions(items);
      setToast(buildImportToast(result, t.settings, plural));
    } catch (err) {
      console.error("import failed", err);
      setToast(t.settings.importFailed);
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
            {t.common.back}
          </Link>
          <h1 className="text-md font-medium">{t.settings.title}</h1>
          <span className="w-12" aria-hidden />
        </header>

        <section className="flex flex-col gap-2">
          <h2
            id="language-heading"
            className="text-2xs uppercase tracking-wide text-tertiary"
          >
            {t.settings.language}
          </h2>
          <div
            role="radiogroup"
            aria-labelledby="language-heading"
            className="grid grid-cols-3 gap-2"
          >
            {LOCALES.map((code) => {
              const active = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  // Название языка — на самом языке, скринридер читает его с нужным произношением.
                  lang={code}
                  onClick={() => setLocale(code)}
                  className={`rounded-lg px-3 py-3 text-sm transition active:opacity-80 ${
                    active ? "bg-accent text-accent-fg" : "bg-surface text-primary"
                  }`}
                >
                  {LOCALE_NAMES[code]}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-2xs uppercase tracking-wide text-tertiary">
            {t.settings.backup}
          </h2>

          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport || exporting}
            className="rounded-lg bg-surface px-4 py-3 text-left text-sm transition active:opacity-80 disabled:opacity-40"
          >
            {exporting ? t.settings.exporting : t.settings.export}
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
            {importingState ? t.settings.importing : t.settings.import}
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
            {t.settings.about}
          </h2>
          <p className="text-sm leading-relaxed">{t.settings.aboutText}</p>
          <p className="text-2xs text-tertiary">
            {APP_NAME} · v{APP_VERSION}
          </p>
        </section>
      </div>
    </>
  );
}

function buildImportToast(
  r: ImportResult,
  s: Dictionary["settings"],
  plural: (forms: PluralForms, count: number) => string
): string {
  const { added, duplicate, invalid } = r;
  if (added === 0 && duplicate === 0 && invalid === 0) {
    return s.importNothing;
  }

  const parts: string[] = [];
  parts.push(added > 0 ? plural(s.importAdded, added) : s.importNoneAdded);
  if (duplicate > 0) parts.push(fmt(s.importDuplicates, { count: duplicate }));
  if (invalid > 0) parts.push(plural(s.importInvalid, invalid));
  return parts.join(", ");
}
