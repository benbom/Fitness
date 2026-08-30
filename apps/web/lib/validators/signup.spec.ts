import { describe, expect, it } from "vitest";

import { signupSchema } from "./signup";

describe("signupSchema", () => {
  const validInput = {
    email: "test@example.com",
    password: "twelve-chars-min",
    consent: "on",
  };

  it("accepterar giltigt input", () => {
    const result = signupSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("förkastar saknad e-post", () => {
    const result = signupSchema.safeParse({ ...validInput, email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toContain("e-postadress");
    }
  });

  it("förkastar ogiltig e-postformat", () => {
    const result = signupSchema.safeParse({ ...validInput, email: "notemail" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toContain("rätt");
    }
  });

  it("trim:ar whitespace från e-post", () => {
    const result = signupSchema.safeParse({
      ...validInput,
      email: "  test@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("förkastar lösenord kortare än 12 tecken", () => {
    const result = signupSchema.safeParse({ ...validInput, password: "kort" });
    expect(result.success).toBe(false);
  });

  it("förkastar utan samtyckeskryss", () => {
    const result = signupSchema.safeParse({ ...validInput, consent: undefined });
    expect(result.success).toBe(false);
  });

  it("förkastar samtycke som inte är 'on'", () => {
    const result = signupSchema.safeParse({ ...validInput, consent: "off" });
    expect(result.success).toBe(false);
  });
});
