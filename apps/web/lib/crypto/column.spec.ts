import { randomBytes } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  _resetKeyCacheForTest,
  decryptColumn,
  decryptColumnNullable,
  encryptColumn,
  encryptColumnNullable,
} from "./column";

const KEY_ENV = "COLUMN_ENCRYPTION_KEY";

function freshKey(): string {
  return randomBytes(32).toString("base64");
}

describe("column encryption", () => {
  const originalKey = process.env[KEY_ENV];

  beforeEach(() => {
    process.env[KEY_ENV] = freshKey();
    _resetKeyCacheForTest();
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env[KEY_ENV];
    } else {
      process.env[KEY_ENV] = originalKey;
    }
    _resetKeyCacheForTest();
  });

  it("round-trip: encrypt → decrypt återger exakt samma sträng", () => {
    const plaintext = "Ryggskada 2024-03, undvik tunga lyft > 60 kg";
    const encrypted = encryptColumn(plaintext);
    expect(encrypted).toBeInstanceOf(Buffer);
    expect(encrypted.length).toBeGreaterThan(plaintext.length);
    expect(decryptColumn(encrypted)).toBe(plaintext);
  });

  it("två anrop på samma klartext ger olika ciphertext (unik IV)", () => {
    const plaintext = "Samma text";
    const a = encryptColumn(plaintext);
    const b = encryptColumn(plaintext);
    expect(a.equals(b)).toBe(false);
    expect(decryptColumn(a)).toBe(plaintext);
    expect(decryptColumn(b)).toBe(plaintext);
  });

  it("stöder UTF-8 med å/ä/ö och emoji", () => {
    const plaintext = "Bäckenbotten känns bättre 💪 efter rehab";
    const encrypted = encryptColumn(plaintext);
    expect(decryptColumn(encrypted)).toBe(plaintext);
  });

  it("stöder tom sträng", () => {
    const encrypted = encryptColumn("");
    expect(decryptColumn(encrypted)).toBe("");
  });

  it("throwar när ciphertext manipulerats (GCM authTag-verifiering)", () => {
    const encrypted = encryptColumn("hemligt");
    // Flippar en bit i ciphertext-delen (efter IV, före authTag)
    const tampered = Buffer.from(encrypted);
    tampered[15]! ^= 0x01;
    expect(() => decryptColumn(tampered)).toThrow();
  });

  it("throwar när authTag manipulerats", () => {
    const encrypted = encryptColumn("hemligt");
    const tampered = Buffer.from(encrypted);
    tampered[tampered.length - 1]! ^= 0x01;
    expect(() => decryptColumn(tampered)).toThrow();
  });

  it("throwar på för kort payload", () => {
    expect(() => decryptColumn(Buffer.alloc(10))).toThrow(/för kort/);
  });

  it("throwar tydligt när COLUMN_ENCRYPTION_KEY saknas", () => {
    delete process.env[KEY_ENV];
    _resetKeyCacheForTest();
    expect(() => encryptColumn("x")).toThrow(/COLUMN_ENCRYPTION_KEY saknas/);
  });

  it("throwar när nyckeln har fel längd", () => {
    process.env[KEY_ENV] = Buffer.alloc(16).toString("base64");
    _resetKeyCacheForTest();
    expect(() => encryptColumn("x")).toThrow(/32 bytes/);
  });

  it("throwar när annan nyckel används för decrypt", () => {
    const encrypted = encryptColumn("hemligt");
    process.env[KEY_ENV] = freshKey();
    _resetKeyCacheForTest();
    expect(() => decryptColumn(encrypted)).toThrow();
  });

  it("nullable-varianter: null in ger null ut", () => {
    expect(encryptColumnNullable(null)).toBeNull();
    expect(encryptColumnNullable(undefined)).toBeNull();
    expect(encryptColumnNullable("")).toBeNull();
    expect(decryptColumnNullable(null)).toBeNull();
    expect(decryptColumnNullable(undefined)).toBeNull();
  });

  it("nullable-varianter: round-trip fungerar likt vanliga", () => {
    const encrypted = encryptColumnNullable("not-empty");
    expect(encrypted).toBeInstanceOf(Buffer);
    expect(decryptColumnNullable(encrypted)).toBe("not-empty");
  });
});
