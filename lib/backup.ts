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
