import { describe, expect, it } from "vitest";

import { signinSchema } from "./signin";

describe("signinSchema", () => {
  it("accepterar giltigt input", () => {
    const result = signinSchema.safeParse({
      email: "test@example.com",
      password: "anything-non-empty",
    });
    expect(result.success).toBe(true);
  });

  it("förkastar saknat lösenord (till skillnad från signup: ingen längdkoll)", () => {
    const result = signinSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepterar 1-tecken-lösenord — sign-in ska inte avslöja policy", () => {
    // Om sign-in vägrade kort lösenord vore det en enumeration-vektor
    // (angripare kan skilja 'ogiltigt format' från 'fel lösenord').
    const result = signinSchema.safeParse({
      email: "test@example.com",
      password: "a",
    });
    expect(result.success).toBe(true);
  });

  it("förkastar ogiltig e-postformat", () => {
    const result = signinSchema.safeParse({
      email: "notemail",
      password: "some-pass",
    });
    expect(result.success).toBe(false);
  });
});
