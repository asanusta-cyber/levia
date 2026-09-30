import Dexie, { Table } from "dexie";
import { normalizeFeeling, type Feeling } from "./feelings";

export type { Feeling } from "./feelings";

export type RootWant = "approval" | "control" | "safety";

export interface SessionQuestions {
  allowToBe: boolean;
  canRelease: boolean;
  readyToRelease: boolean;
  whenNow: boolean;
}

export interface Session {
  id?: number;
  createdAt: number;
  durationSeconds: number;
  situation: string;
  feeling: Feeling;
  customFeeling?: string;
  rootWant: RootWant | null;
  questions: SessionQuestions;
  intensityBefore: number;
  intensityAfter: number;
  reflection: string;
}

export type NewSession = Omit<Session, "id">;

class AppDB extends Dexie {
  sessions!: Table<Session, number>;

  constructor() {
    // Имя базы — наследие первого названия приложения. Не менять: новое имя = новая
    // пустая база, сессии пользователей останутся в старой.
    super("PauseDB");
    this.version(1).stores({
      sessions: "++id, createdAt",
    });
    // v2: чувства хранятся кодами вместо русских слов. Upgrade идёт в одной
    // versionchange-транзакции: либо переписываются все записи, либо ни одной.
    this.version(2)
      .stores({
        sessions: "++id, createdAt",
      })
      .upgrade((tx) =>
        tx
          .table("sessions")
          .toCollection()
          .modify((s: Record<string, unknown>) => {
            const n = normalizeFeeling(s.feeling, s.customFeeling);
            s.feeling = n.feeling;
            if (n.customFeeling !== undefined) s.customFeeling = n.customFeeling;
          })
      );
  }
}

let _db: AppDB | null = null;

export function getDB(): AppDB {
  // Проверяем IndexedDB, а не window: на сервере его нет, а в тестах его даёт fake-indexeddb.
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!_db) _db = new AppDB();
  return _db;
}

/** Закрывает соединение и сбрасывает синглтон. Нужно тестам, чтобы переоткрыть базу. */
export function closeDB(): void {
  _db?.close();
  _db = null;
}

export async function createSession(data: NewSession): Promise<number> {
  return getDB().sessions.add(data as Session);
}

export async function listSessions(): Promise<Session[]> {
  return getDB().sessions.orderBy("createdAt").reverse().toArray();
}

export async function getSession(id: number): Promise<Session | undefined> {
  return getDB().sessions.get(id);
}

export async function deleteSession(id: number): Promise<void> {
  await getDB().sessions.delete(id);
}

export async function countSessions(): Promise<number> {
  return getDB().sessions.count();
}

export async function lastSession(): Promise<Session | undefined> {
  return getDB().sessions.orderBy("createdAt").reverse().first();
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/**
 * Серия = подряд идущие дни с сессиями, начиная либо с сегодня (если есть сессия),
 * либо со вчера (если сегодня пусто). Рвётся, когда пропущен целый день.
 */
export async function currentStreak(now: Date = new Date()): Promise<number> {
  const sessions = await getDB().sessions.toArray();
  if (sessions.length === 0) return 0;

  const days = new Set(sessions.map((s) => dayKey(s.createdAt)));

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayKey = dayKey(today.getTime());
  const yesterdayKey = dayKey(addDays(today, -1).getTime());

  let cursor: Date;
  if (days.has(todayKey)) {
    cursor = today;
  } else if (days.has(yesterdayKey)) {
    cursor = addDays(today, -1);
  } else {
    return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function exportAll(): Promise<Session[]> {
  return getDB().sessions.orderBy("createdAt").toArray();
}

export interface ImportResult {
  added: number;
  /** Сессия с таким `createdAt` уже есть в базе — пропущена. */
  duplicate: number;
  /** Запись не прошла валидацию структуры — пропущена. */
  invalid: number;
}

/**
 * Импорт с дедупликацией по createdAt (миллисекундная точность).
 * Невалидные записи и дубли считаются отдельно.
 * Чувство каждой записи проходит через normalizeFeeling — так старые бэкапы
 * с русскими словами превращаются в коды тем же словарём, что и миграция базы.
 */
export async function importSessions(items: unknown): Promise<ImportResult> {
  if (!Array.isArray(items)) throw new Error("Ожидался массив сессий");
  const db = getDB();
  const existing = await db.sessions.toArray();
  const existingKeys = new Set(existing.map((s) => s.createdAt));

  let added = 0;
  let duplicate = 0;
  let invalid = 0;
  const toAdd: NewSession[] = [];

  for (const raw of items) {
    if (!isValidSession(raw)) {
      invalid += 1;
      continue;
    }
    if (existingKeys.has(raw.createdAt)) {
      duplicate += 1;
      continue;
    }
    const { id: _ignore, feeling, customFeeling, ...rest } = raw;
    toAdd.push({ ...rest, ...normalizeFeeling(feeling, customFeeling) });
    existingKeys.add(raw.createdAt);
  }

  if (toAdd.length > 0) {
    await db.sessions.bulkAdd(toAdd as Session[]);
    added = toAdd.length;
  }

  return { added, duplicate, invalid };
}

/** Запись из файла: структура как у Session, но feeling ещё не нормализован. */
type RawSession = Omit<Session, "feeling"> & { feeling: string };

function isValidSession(v: unknown): v is RawSession {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.createdAt === "number" &&
    typeof s.durationSeconds === "number" &&
    typeof s.situation === "string" &&
    typeof s.feeling === "string" &&
    typeof s.intensityBefore === "number" &&
    typeof s.intensityAfter === "number" &&
    typeof s.reflection === "string" &&
    typeof s.questions === "object" &&
    s.questions !== null
  );
}
