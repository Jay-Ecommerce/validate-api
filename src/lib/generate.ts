/**
 * Stateless generators backed by the Web Crypto API (available natively in Workers, Node >=19,
 * Deno, Bun) — no third-party randomness source.
 */

export function generateUuids(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

export interface PasswordGenerationOptions {
  length: number;
  symbols: boolean;
  numbers: boolean;
  uppercase: boolean;
  lowercase: boolean;
}

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}<>?",
};

export function generatePassword(options: PasswordGenerationOptions): string {
  let pool = "";
  if (options.lowercase) pool += CHARSETS.lowercase;
  if (options.uppercase) pool += CHARSETS.uppercase;
  if (options.numbers) pool += CHARSETS.numbers;
  if (options.symbols) pool += CHARSETS.symbols;

  if (pool.length === 0) {
    throw new Error("At least one character set must be enabled");
  }

  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < options.length; i++) {
    const idx = (randomValues[i] as number) % pool.length;
    result += pool[idx];
  }
  return result;
}
