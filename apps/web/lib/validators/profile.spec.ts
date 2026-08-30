import { describe, expect, it } from "vitest";

import { profileSchema } from "./profile";

const validInput = {
  goals: ["get_stronger"],
  level: "beginner",
  equipment: ["home"],
  daysPerWeek: 3,
  timePerSession: 45,
};

describe("profileSchema", () => {
  it("accepterar giltigt input", () => {
    const result = profileSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepterar flera goals samtidigt", () => {
    const result = profileSchema.safeParse({
      ...validInput,
      goals: ["get_stronger", "feel_better", "perimenopause"],
    });
    expect(result.success).toBe(true);
  });

  it("förkastar tom goals-lista", () => {
    const result = profileSchema.safeParse({ ...validInput, goals: [] });
    expect(result.success).toBe(false);
  });

  it("förkastar okänt mål", () => {
    const result = profileSchema.safeParse({
      ...validInput,
      goals: ["fat_loss"],
    });
    expect(result.success).toBe(false);
  });

  it("förkastar tom equipment-lista", () => {
    const result = profileSchema.safeParse({ ...validInput, equipment: [] });
    expect(result.success).toBe(false);
  });

  it("förkastar okänd level", () => {
    const result = profileSchema.safeParse({ ...validInput, level: "pro" });
    expect(result.success).toBe(false);
  });

  it("konverterar daysPerWeek från sträng till nummer (coerce)", () => {
    const result = profileSchema.safeParse({ ...validInput, daysPerWeek: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.daysPerWeek).toBe(3);
    }
  });

  it("förkastar 0 dagar per vecka", () => {
    const result = profileSchema.safeParse({ ...validInput, daysPerWeek: 0 });
    expect(result.success).toBe(false);
  });

  it("förkastar 8 dagar per vecka", () => {
    const result = profileSchema.safeParse({ ...validInput, daysPerWeek: 8 });
    expect(result.success).toBe(false);
  });

  it("förkastar under 10 min per pass", () => {
    const result = profileSchema.safeParse({
      ...validInput,
      timePerSession: 5,
    });
    expect(result.success).toBe(false);
  });

  it("förkastar över 120 min per pass", () => {
    const result = profileSchema.safeParse({
      ...validInput,
      timePerSession: 200,
    });
    expect(result.success).toBe(false);
  });
});
