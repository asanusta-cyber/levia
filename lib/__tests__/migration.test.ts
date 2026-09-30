import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDB, getDB, type Session } from "../db";
import {
  EXPECTED_BY_CREATED_AT,
  legacyBackup,
  resetDB,
  seedLegacyV1,
} from "./helpers";

/** Записи, которые реальное приложение создать не могло, но миграция обязана пережить. */
const EDGE_ROWS = [
  { id: 101, createdAt: 1755100000000, feeling: "злость" },
  { id: 102, createdAt: 1755200000000, feeling: "тоска", customFeeling: "по дому" },
  { id: 103, createdAt: 1755300000000, feeling: "anxiety" },
  { id: 104, createdAt: 1755400000000, feeling: "  Страх " },
].map((r) => ({
  durationSeconds: 60,
  situation: `edge ${r.id}`,
  rootWant: "control",
  questions: { allowToBe: true, canRelease: true, readyToRelease: true, whenNow: true },
  intensityBefore: 5,
  intensityAfter: 4,
  reflection: "",
  ...r,
}));

const EDGE_EXPECTED: Record<number, { feeling: string; customFeeling?: string }> = {
  101: { feeling: "other", customFeeling: "злость" },
  102: { feeling: "other", customFeeling: "по дому / тоска" },
  103: { feeling: "anxiety" },
  104: { feeling: "fear" },
};

describe("Dexie v1 → v2 migration", () => {
  beforeEach(resetDB);
  afterEach(resetDB);

  it("rewrites every legacy feeling to a code and leaves all other fields intact", async () => {
    const legacyRows = legacyBackup.sessions as Record<string, unknown>[];
    await seedLegacyV1([...legacyRows, ...EDGE_ROWS]);

    const db = getDB();
    await db.open();
    expect(db.verno).toBe(2);

    const rows = await db.sessions.toArray();
    expect(rows).toHaveLength(legacyRows.length + EDGE_ROWS.length);

    for (const original of legacyRows) {
      const migrated = rows.find((r) => r.id === original.id) as Session;
      const expected = EXPECTED_BY_CREATED_AT[original.createdAt as number];
      expect(migrated.feeling).toBe(expected.feeling);
      expect(migrated.customFeeling).toBe(expected.customFeeling);

      const { feeling: _f1, customFeeling: _c1, ...restBefore } = original;
      const { feeling: _f2, customFeeling: _c2, ...restAfter } = migrated;
      expect(restAfter).toEqual(restBefore);
    }

    for (const edge of EDGE_ROWS) {
      const migrated = rows.find((r) => r.id === edge.id) as Session;
      expect(migrated.feeling).toBe(EDGE_EXPECTED[edge.id].feeling);
      expect(migrated.customFeeling).toBe(EDGE_EXPECTED[edge.id].customFeeling);
    }
  });

  it("runs once: reopening a migrated database keeps the data unchanged", async () => {
    await seedLegacyV1(legacyBackup.sessions as Record<string, unknown>[]);
    const first = await getDB().sessions.toArray();

    closeDB();
    const second = await getDB().sessions.toArray();

    expect(second).toEqual(first);
  });

  it("creates an empty v2 database for a fresh install", async () => {
    const db = getDB();
    await db.open();
    expect(db.verno).toBe(2);
    expect(await db.sessions.count()).toBe(0);
  });
});
