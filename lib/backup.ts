import { exportAll, type Session } from "./db";

/**
 * Формат файла бэкапа.
 * v1 — чувства русскими словами (до локализации).
 * v2 — чувства кодами (anxiety, anger, …).
 * Импорт принимает обе версии: каждое чувство проходит через normalizeFeeling.
 */
export const BACKUP_VERSION = 2;

export interface BackupFile {
  version: number;
  exportedAt: number;
  sessionCount: number;
  sessions: Session[];
}

export async function buildBackup(now: number = Date.now()): Promise<BackupFile> {
  const sessions = await exportAll();
  return {
    version: BACKUP_VERSION,
    exportedAt: now,
    sessionCount: sessions.length,
    sessions,
  };
}

/** Имя файла бэкапа: levia-backup-2026-05-01.json. Не локализуется. */
export function backupFilename(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `levia-backup-${y}-${m}-${d}.json`;
}

/**
 * Достаёт массив записей из разобранного JSON. Принимает и обёрнутый формат
 * ({ version, sessions: [...] }) любой версии, и сырой массив.
 * Возвращает null, если структура не распознана.
 */
export function extractBackupSessions(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.sessions)) return obj.sessions;
  }
  return null;
}
