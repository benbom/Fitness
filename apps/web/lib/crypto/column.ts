import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Kolumn-kryptering för Klass 2-data (ADR-004).
 *
 * AES-256-GCM med 12-bytes slumpmässig IV per rad. Nyckel läses en gång
 * via COLUMN_ENCRYPTION_KEY (base64-kodad 32-bytes). Cachas i minnet så
 * vi inte parsar env vid varje kall.
 *
 * Format på lagrad bytea:  [iv(12)] [ciphertext(N)] [authTag(16)]
 * Tampering upptäcks via GCM-authTag och throwar vid decrypt.
 *
 * Break-glass: supportåtkomst kräver samma env-var. Loggning av vem
 * som dekrypterade sker i application-koden (t.ex. runt injuryFlag.read).
 */

const ALGORITHM = "aes-256-gcm";
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;
const KEY_LEN = 32;

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.COLUMN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "COLUMN_ENCRYPTION_KEY saknas — sätt env-var till en base64-kodad 32-bytes-nyckel.",
    );
  }

  let decoded: Buffer;
  try {
    decoded = Buffer.from(raw, "base64");
  } catch {
    throw new Error("COLUMN_ENCRYPTION_KEY är inte giltig base64.");
  }

  if (decoded.length !== KEY_LEN) {
    throw new Error(
      `COLUMN_ENCRYPTION_KEY måste vara ${KEY_LEN} bytes (base64-avkodad); fick ${decoded.length}.`,
    );
  }

  cachedKey = decoded;
  return decoded;
}

/**
 * Endast för test — nollställer cachad nyckel så att en ny env-var
 * kan läsas i nästa anrop.
 */
export function _resetKeyCacheForTest(): void {
  cachedKey = null;
}

/** Krypterar en klartext-sträng till bytea-buffer (iv | ct | tag). */
export function encryptColumn(plaintext: string): Buffer {
  const key = loadKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, authTag]);
}

/** Dekrypterar en bytea-buffer tillbaka till klartext. Kastar vid tampering. */
export function decryptColumn(payload: Buffer): string {
  const key = loadKey();

  if (payload.length < IV_LEN + AUTH_TAG_LEN) {
    throw new Error("Krypterad payload är för kort.");
  }

  const iv = payload.subarray(0, IV_LEN);
  const authTag = payload.subarray(payload.length - AUTH_TAG_LEN);
  const ciphertext = payload.subarray(IV_LEN, payload.length - AUTH_TAG_LEN);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

/** Kryptera nullable — null in ger null ut (för valfria kolumner). */
export function encryptColumnNullable(plaintext: string | null | undefined): Buffer | null {
  if (plaintext === null || plaintext === undefined || plaintext === "") return null;
  return encryptColumn(plaintext);
}

/** Dekryptera nullable — null in ger null ut. */
export function decryptColumnNullable(payload: Buffer | null | undefined): string | null {
  if (payload === null || payload === undefined) return null;
  return decryptColumn(payload);
}
