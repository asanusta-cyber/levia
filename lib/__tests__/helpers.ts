import Dexie from "dexie";
import { closeDB } from "../db";
import type { Feeling } from "../feelings";
import fixture from "./fixtures/backup-v1.json";

export const DB_NAME = "PauseDB";

/** Реалистичный бэкап старого формата (version 1, чувства русскими словами). */
export const legacyBackup = fixture;

/**
 * Что должно получиться из фикстуры после миграции или импорта.
 * Таблица записана явно по ТЗ, а не выведена из словаря в lib/feelings.ts.
 */
export const EXPECTED_BY_CREATED_AT: Record<
  number,
  { feeling: Feeling; customFeeling?: string }
> = {
  1754000000000: { feeling: "anxiety" },
  1754090000000: { feeling: "anger" },
  1754180000000: { feeling: "hurt" },
  1754270000000: { feeling: "fear" },
  1754360000000: { feeling: "frustration" },
  1754450000000: { feeling: "envy" },
  1754540000000: { feeling: "sadness" },
  1754630000000: { feeling: "shame" },
  1754720000000: { feeling: "guilt" },
  1754810000000: { feeling: "helplessness" },
  1754900000000: { feeling: "other", customFeeling: "усталость" },
  1754990000000: { feeling: "other" },
};

/** Закрыть соединение приложения и удалить базу — чистый старт для каждого теста. */
export async function resetDB(): Promise<void> {
  closeDB();
  await Dexie.delete(DB_NAME);
}

/**
 * Создаёт базу PauseDB в состоянии до локализации: схема version(1),
 * записи как есть (с русскими словами). Так выглядит база у пользователя
 * до обновления приложения.
 */
export async function seedLegacyV1(rows: Record<string, unknown>[]): Promise<void> {
  const legacy = new Dexie(DB_NAME);
  legacy.version(1).stores({ sessions: "++id, createdAt" });
  await legacy.table("sessions").bulkAdd(rows);
  legacy.close();
}
