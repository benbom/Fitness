import { describe, expect, it } from "vitest";

import { deleteAccountSchema } from "./delete-account";

describe("deleteAccountSchema", () => {
  it("accepterar giltig delete-begäran", () => {
    const result = deleteAccountSchema.safeParse({
      action: "delete",
      confirmation: "RADERA",
    });
    expect(result.success).toBe(true);
  });

  it("accepterar giltig anonymize-begäran", () => {
    const result = deleteAccountSchema.safeParse({
      action: "anonymize",
      confirmation: "RADERA",
    });
    expect(result.success).toBe(true);
  });

  it("förkastar okänd action", () => {
    const result = deleteAccountSchema.safeParse({
      action: "suspend",
      confirmation: "RADERA",
    });
    expect(result.success).toBe(false);
  });

  it("förkastar felstavad bekräftelse", () => {
    const result = deleteAccountSchema.safeParse({
      action: "delete",
      confirmation: "radera", // små bokstäver
    });
    expect(result.success).toBe(false);
  });

  it("förkastar tom bekräftelse (default-form-submit-scenariot)", () => {
    const result = deleteAccountSchema.safeParse({
      action: "delete",
      confirmation: "",
    });
    expect(result.success).toBe(false);
  });

  it("förkastar 'RADERA ' med trailing space", () => {
    const result = deleteAccountSchema.safeParse({
      action: "delete",
      confirmation: "RADERA ",
    });
    expect(result.success).toBe(false);
  });
});
