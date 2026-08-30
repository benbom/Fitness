import { describe, expect, it } from "vitest";

import { scrubKlass1 } from "./scrub";

describe("scrubKlass1", () => {
  it("censorerar top-level cycleEntry, bevarar syskon", () => {
    const input = { cycleEntry: { phase: "luteal" }, userId: "u-123" };
    const out = scrubKlass1(input) as Record<string, unknown>;
    expect(out.cycleEntry).toBe("[REDACTED]");
    expect(out.userId).toBe("u-123");
  });

  it("censorerar nested symptoms på nivå 2", () => {
    const input = { user: { symptoms: ["cramps", "fatigue"], name: "Anna" } };
    const out = scrubKlass1(input) as {
      user: { symptoms: unknown; name: string };
    };
    expect(out.user.symptoms).toBe("[REDACTED]");
    expect(out.user.name).toBe("Anna");
  });

  it("censorerar nested flow på nivå 3", () => {
    const input = { context: { user: { flow: "heavy" }, ok: true } };
    const out = scrubKlass1(input) as {
      context: { user: { flow: unknown }; ok: boolean };
    };
    expect(out.context.user.flow).toBe("[REDACTED]");
    expect(out.context.ok).toBe(true);
  });

  it("censorerar båda camelCase och snake_case", () => {
    const input = { lifeStage: "postpartum", life_stage: "postpartum" };
    const out = scrubKlass1(input) as Record<string, unknown>;
    expect(out.lifeStage).toBe("[REDACTED]");
    expect(out.life_stage).toBe("[REDACTED]");
  });

  it("stoppar rekursion vid djup > 6 (undviker infinite loops)", () => {
    // Bygg ett djupt objekt: { a: { a: { a: ... { cycleEntry: {...} } } } }
    let deep: Record<string, unknown> = { cycleEntry: { phase: "menstrual" } };
    for (let i = 0; i < 10; i += 1) {
      deep = { a: deep };
    }
    // Ska inte krasha, returnerar strukturen (djupare cycleEntry kanske inte scrubbas)
    expect(() => scrubKlass1(deep)).not.toThrow();
  });

  it("hanterar arrays djupt", () => {
    const input = { list: [{ symptoms: ["a"] }, { ok: true }] };
    const out = scrubKlass1(input) as { list: Array<Record<string, unknown>> };
    expect(out.list[0]!.symptoms).toBe("[REDACTED]");
    expect(out.list[1]!.ok).toBe(true);
  });

  it("passerar null och undefined orört", () => {
    expect(scrubKlass1(null)).toBeNull();
    expect(scrubKlass1(undefined)).toBeUndefined();
  });

  it("passerar primitives orört", () => {
    expect(scrubKlass1("plain string")).toBe("plain string");
    expect(scrubKlass1(42)).toBe(42);
    expect(scrubKlass1(true)).toBe(true);
  });

  it("censorerar även när Klass 1-fältet innehåller null", () => {
    const input = { symptoms: null, ok: true };
    const out = scrubKlass1(input) as Record<string, unknown>;
    expect(out.symptoms).toBe("[REDACTED]");
    expect(out.ok).toBe(true);
  });
});
