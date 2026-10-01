import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { dictionaries } from "../i18n/dictionaries";

const PUBLIC = join(process.cwd(), "public");
const CYRILLIC = /[А-Яа-яЁёІіЇїЄєҐґ]/;

describe("static PWA files are in English and match the EN dictionary", () => {
  const manifest = JSON.parse(readFileSync(join(PUBLIC, "manifest.webmanifest"), "utf8"));
  const offline = readFileSync(join(PUBLIC, "offline.html"), "utf8");

  it("manifest name and description equal the EN meta", () => {
    expect(manifest.name).toBe(dictionaries.en.meta.title);
    expect(manifest.description).toBe(dictionaries.en.meta.description);
    expect(manifest.short_name).toBe("Levia");
    expect(manifest.lang).toBe("en");
  });

  it("manifest does not use the Sedona Method trademark", () => {
    expect(JSON.stringify(manifest)).not.toMatch(/Sedona|Седон/);
  });

  it("offline page is English", () => {
    expect(offline).toContain('<html lang="en">');
    expect(offline).not.toMatch(CYRILLIC);
  });

  it("service worker cache is versioned with the legacy prefix", () => {
    const sw = readFileSync(join(PUBLIC, "sw.js"), "utf8");
    expect(sw).toMatch(/const CACHE = "pause-v2";/);
  });
});
