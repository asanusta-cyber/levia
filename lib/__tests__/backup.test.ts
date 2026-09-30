import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FEELING_CODES } from "../feelings";
import { closeDB, getDB, importSessions, listSessions } from "../db";
import { BACKUP_VERSION, buildBackup, extractBackupSessions } from "../backup";
import { EXPECTED_BY_CREATED_AT, legacyBackup, resetDB } from "./helpers";

function withoutId<T extends { id?: number }>(rows: T[]): Omit<T, "id">[] {
  return rows.map(({ id: _id, ...rest }) => rest);
}

describe("import of an old (v1) backup", () => {
  beforeEach(resetDB);
  afterEach(resetDB);

  it("maps Russian feelings to codes with the same dictionary as the migration", async () => {
    const items = extractBackupSessions(legacyBackup);
    expect(items).not.toBeNull();

    const result = await importSessions(items);
    expect(result).toEqual({ added: 12, duplicate: 0, invalid: 0 });

    const rows = await getDB().sessions.toArray();
    for (const row of rows) {
      const expected = EXPECTED_BY_CREATED_AT[row.createdAt];
      expect(row.feeling).toBe(expected.feeling);
      expect(row.customFeeling).toBe(expected.customFeeling);
    }
  });

  it("keeps situation, reflection and the rest of each record as they were", async () => {
    await importSessions(extractBackupSessions(legacyBackup));
    const rows = await getDB().sessions.orderBy("createdAt").toArray();

    const expected = legacyBackup.sessions.map(
      ({ id: _id, feeling: _f, customFeeling: _c, ...rest }) => rest
    );
    const actual = rows.map(
      ({ id: _id, feeling: _f, customFeeling: _c, ...rest }) => rest
    );
    expect(actual).toEqual(expected);
  });

  it("skips the same file on a second import as duplicates", async () => {
    await importSessions(extractBackupSessions(legacyBackup));
    const again = await importSessions(extractBackupSessions(legacyBackup));
    expect(again).toEqual({ added: 0, duplicate: 12, invalid: 0 });
  });

  it("handles a mixed file: codes, Russian words and a broken record", async () => {
    const [a, b] = legacyBackup.sessions;
    const mixed = [
      { ...a, feeling: "anxiety" },
      { ...b, feeling: "гнев" },
      { createdAt: 1, feeling: "страх" }, // нет обязательных полей
    ];
    const result = await importSessions(mixed);
    expect(result).toEqual({ added: 2, duplicate: 0, invalid: 1 });

    const feelings = (await listSessions()).map((s) => s.feeling).sort();
    expect(feelings).toEqual(["anger", "anxiety"]);
  });
});

describe("export → import round-trip", () => {
  beforeEach(resetDB);
  afterEach(resetDB);

  it("writes codes with version 2 and restores identical sessions", async () => {
    await importSessions(extractBackupSessions(legacyBackup));
    const before = await getDB().sessions.orderBy("createdAt").toArray();

    const file = JSON.parse(JSON.stringify(await buildBackup(1760000000000)));
    expect(file.version).toBe(BACKUP_VERSION);
    expect(file.version).toBe(2);
    expect(file.sessionCount).toBe(12);
    for (const s of file.sessions) {
      expect(FEELING_CODES).toContain(s.feeling);
    }

    // Как у пользователя: база удалена, импортируем только что скачанный файл.
    closeDB();
    await resetDB();
    const result = await importSessions(extractBackupSessions(file));
    expect(result).toEqual({ added: 12, duplicate: 0, invalid: 0 });

    const after = await getDB().sessions.orderBy("createdAt").toArray();
    expect(withoutId(after)).toEqual(withoutId(before));
  });
});

describe("extractBackupSessions", () => {
  it("accepts the wrapped format of any version and a bare array", () => {
    expect(extractBackupSessions({ version: 1, sessions: [1] })).toEqual([1]);
    expect(extractBackupSessions({ version: 2, sessions: [] })).toEqual([]);
    expect(extractBackupSessions([1, 2])).toEqual([1, 2]);
  });

  it("returns null for unknown structures", () => {
    expect(extractBackupSessions(null)).toBeNull();
    expect(extractBackupSessions({ items: [] })).toBeNull();
    expect(extractBackupSessions("text")).toBeNull();
  });
});
