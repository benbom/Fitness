import { beforeEach, describe, expect, it, vi } from "vitest";

const { profileFindUniqueMock } = vi.hoisted(() => ({
  profileFindUniqueMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { profile: { findUnique: profileFindUniqueMock } },
}));

import {
  ONBOARDING_DONE_HREF,
  ONBOARDING_STEPS,
  ONBOARDING_TOTAL,
  hasCompletedOnboarding,
  nextOnboardingHref,
  stepNumber,
} from "./status";

describe("ONBOARDING_STEPS", () => {
  it("innehåller exakt de tre stegen i rätt ordning", () => {
    expect(ONBOARDING_STEPS.map((s) => s.slug)).toEqual(["mal", "skador", "notiser"]);
    expect(ONBOARDING_TOTAL).toBe(3);
  });
});

describe("hasCompletedOnboarding", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returnerar false om profil saknas", async () => {
    profileFindUniqueMock.mockResolvedValue(null);
    expect(await hasCompletedOnboarding("u-1")).toBe(false);
    expect(profileFindUniqueMock).toHaveBeenCalledWith({
      where: { id: "u-1" },
      select: { level: true },
    });
  });

  it("returnerar false om profil finns men level saknas", async () => {
    profileFindUniqueMock.mockResolvedValue({ level: null });
    expect(await hasCompletedOnboarding("u-1")).toBe(false);
  });

  it("returnerar true när profil finns med level satt", async () => {
    profileFindUniqueMock.mockResolvedValue({ level: "beginner" });
    expect(await hasCompletedOnboarding("u-1")).toBe(true);
  });
});

describe("nextOnboardingHref", () => {
  it("mal → skador", () => {
    expect(nextOnboardingHref("mal")).toBe("/onboarding/skador");
  });

  it("skador → notiser", () => {
    expect(nextOnboardingHref("skador")).toBe("/onboarding/notiser");
  });

  it("notiser → klar-sidan (slutet av sekvensen)", () => {
    expect(nextOnboardingHref("notiser")).toBe(ONBOARDING_DONE_HREF);
  });
});

describe("stepNumber", () => {
  it("returnerar 1-indexerat positionsnummer", () => {
    expect(stepNumber("mal")).toBe(1);
    expect(stepNumber("skador")).toBe(2);
    expect(stepNumber("notiser")).toBe(3);
  });
});
