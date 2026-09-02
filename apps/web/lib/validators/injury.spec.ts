import { describe, expect, it } from "vitest";

import { NOTE_MAX_LEN, injuriesInputSchema, injuryAreaEnum, injurySeverityEnum } from "./injury";

describe("injuryAreaEnum", () => {
  it("accepterar alla standardområden", () => {
    for (const area of ["back", "knee", "shoulder", "pelvic_floor", "diastasis", "other"]) {
      expect(injuryAreaEnum.safeParse(area).success).toBe(true);
    }
  });

  it("förkastar okänt område", () => {
    expect(injuryAreaEnum.safeParse("spleen").success).toBe(false);
  });
});

describe("injurySeverityEnum", () => {
  it("accepterar alla nivåer", () => {
    for (const s of ["none", "mild", "moderate", "severe"]) {
      expect(injurySeverityEnum.safeParse(s).success).toBe(true);
    }
  });

  it("förkastar okänd nivå", () => {
    expect(injurySeverityEnum.safeParse("catastrophic").success).toBe(false);
  });
});

describe("injuriesInputSchema", () => {
  it("accepterar tomt set (rensar allt)", () => {
    const result = injuriesInputSchema.safeParse({ entries: [] });
    expect(result.success).toBe(true);
  });

  it("accepterar giltiga entries med och utan note", () => {
    const result = injuriesInputSchema.safeParse({
      entries: [
        { area: "back", severity: "mild", note: "korta pass" },
        { area: "knee", severity: "none" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("förkastar note längre än max", () => {
    const long = "x".repeat(NOTE_MAX_LEN + 1);
    const result = injuriesInputSchema.safeParse({
      entries: [{ area: "back", severity: "mild", note: long }],
    });
    expect(result.success).toBe(false);
  });

  it("trim:ar whitespace från note", () => {
    const result = injuriesInputSchema.safeParse({
      entries: [{ area: "back", severity: "mild", note: "  padding  " }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entries[0]!.note).toBe("padding");
    }
  });

  it("förkastar mer än 20 entries", () => {
    const entries = Array.from({ length: 21 }, () => ({
      area: "other" as const,
      severity: "none" as const,
    }));
    const result = injuriesInputSchema.safeParse({ entries });
    expect(result.success).toBe(false);
  });
});
