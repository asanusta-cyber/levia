import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Страховка от непереведённых строк: в коде экранов и компонентов не должно
 * быть кириллицы вне комментариев. Все тексты интерфейса — в lib/i18n/dictionaries.
 */
const ROOT = process.cwd();
const DIRS = ["app", "components"];
const CYRILLIC = /[А-Яа-яЁёІіЇїЄєҐґ]/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|jsx?)$/.test(name) ? [path] : [];
  });
}

function stripComments(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) => line.replace(/(^|\s)\/\/.*$/, ""));
}

describe("UI code has no hard-coded user-facing text", () => {
  const files = DIRS.flatMap((d) => sourceFiles(join(ROOT, d)));

  it("finds the source files", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("contains no Cyrillic outside comments", () => {
    const offenders: string[] = [];
    for (const file of files) {
      stripComments(readFileSync(file, "utf8")).forEach((line, i) => {
        if (CYRILLIC.test(line)) {
          offenders.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
