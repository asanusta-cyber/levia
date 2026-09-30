import { describe, expect, it } from "vitest";
import {
  FEELING_CODES,
  feelingLabel,
  isFeelingCode,
  normalizeFeeling,
  type Feeling,
} from "../feelings";

describe("normalizeFeeling", () => {
  it.each([
    ["тревога", "anxiety"],
    ["гнев", "anger"],
    ["обида", "hurt"],
    ["страх", "fear"],
    ["раздражение", "frustration"],
    ["зависть", "envy"],
    ["грусть", "sadness"],
    ["стыд", "shame"],
    ["вина", "guilt"],
    ["бессилие", "helplessness"],
    ["другое", "other"],
  ] as const)("maps legacy «%s» → %s", (ru, code) => {
    expect(normalizeFeeling(ru, undefined)).toEqual({ feeling: code });
  });

  it("is idempotent for every code", () => {
    for (const code of FEELING_CODES) {
      expect(normalizeFeeling(code, undefined)).toEqual({ feeling: code });
    }
  });

  it("ignores surrounding whitespace and case", () => {
    expect(normalizeFeeling("  Страх ", undefined)).toEqual({ feeling: "fear" });
    expect(normalizeFeeling("ANXIETY", undefined)).toEqual({ feeling: "anxiety" });
  });

  it("keeps customFeeling of «другое»", () => {
    expect(normalizeFeeling("другое", "усталость")).toEqual({
      feeling: "other",
      customFeeling: "усталость",
    });
  });

  it("drops an empty customFeeling", () => {
    expect(normalizeFeeling("другое", "   ")).toEqual({ feeling: "other" });
  });

  it("moves an unrecognized word into an empty customFeeling", () => {
    expect(normalizeFeeling("злость", undefined)).toEqual({
      feeling: "other",
      customFeeling: "злость",
    });
    expect(normalizeFeeling("злость", "")).toEqual({
      feeling: "other",
      customFeeling: "злость",
    });
  });

  it("appends an unrecognized word to an existing customFeeling via « / »", () => {
    expect(normalizeFeeling("тоска", "по дому")).toEqual({
      feeling: "other",
      customFeeling: "по дому / тоска",
    });
  });

  it("does not treat Object.prototype keys as known feelings", () => {
    expect(normalizeFeeling("constructor", undefined)).toEqual({
      feeling: "other",
      customFeeling: "constructor",
    });
    expect(normalizeFeeling("__proto__", undefined)).toEqual({
      feeling: "other",
      customFeeling: "__proto__",
    });
  });

  it("falls back to 'other' for missing or non-string values and keeps customFeeling", () => {
    expect(normalizeFeeling(undefined, undefined)).toEqual({ feeling: "other" });
    expect(normalizeFeeling(42, "своё")).toEqual({
      feeling: "other",
      customFeeling: "своё",
    });
  });
});

describe("isFeelingCode", () => {
  it("accepts codes and rejects legacy words", () => {
    expect(isFeelingCode("anxiety")).toBe(true);
    expect(isFeelingCode("тревога")).toBe(false);
    expect(isFeelingCode(undefined)).toBe(false);
  });
});

describe("feelingLabel", () => {
  const labels = Object.fromEntries(
    FEELING_CODES.map((c) => [c, `label:${c}`])
  ) as Record<Feeling, string>;

  it("uses the dictionary label for regular feelings", () => {
    expect(feelingLabel("anxiety", undefined, labels)).toBe("label:anxiety");
  });

  it("shows the user's own word for 'other'", () => {
    expect(feelingLabel("other", "усталость", labels)).toBe("усталость");
  });

  it("falls back to the dictionary label for 'other' without a custom word", () => {
    expect(feelingLabel("other", undefined, labels)).toBe("label:other");
    expect(feelingLabel("other", "  ", labels)).toBe("label:other");
  });
});
