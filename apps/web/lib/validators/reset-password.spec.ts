import { describe, expect, it } from "vitest";

import { newPasswordSchema, resetRequestSchema } from "./reset-password";

describe("resetRequestSchema", () => {
  it("accepterar giltig e-post", () => {
    const result = resetRequestSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("förkastar tom e-post", () => {
    const result = resetRequestSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("förkastar ogiltig e-postformat", () => {
    const result = resetRequestSchema.safeParse({ email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("trim:ar whitespace från e-post", () => {
    const result = resetRequestSchema.safeParse({
      email: "  user@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });
});

describe("newPasswordSchema", () => {
  it("accepterar 12+ tecken", () => {
    const result = newPasswordSchema.safeParse({ password: "safe-pass-12" });
    expect(result.success).toBe(true);
  });

  it("förkastar 11 tecken", () => {
    const result = newPasswordSchema.safeParse({ password: "elva-tecken" });
    expect(result.success).toBe(false);
  });

  it("förkastar tom sträng", () => {
    const result = newPasswordSchema.safeParse({ password: "" });
    expect(result.success).toBe(false);
  });
});
