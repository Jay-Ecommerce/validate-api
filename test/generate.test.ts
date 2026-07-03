import { describe, it, expect } from "vitest";
import { generateUuids, generatePassword } from "../src/lib/generate.js";

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("generateUuids", () => {
  it("generates the requested count of valid v4 UUIDs", () => {
    const uuids = generateUuids(5);
    expect(uuids).toHaveLength(5);
    for (const uuid of uuids) {
      expect(uuid).toMatch(UUID_V4_PATTERN);
    }
  });

  it("generates unique values", () => {
    const uuids = generateUuids(20);
    expect(new Set(uuids).size).toBe(20);
  });
});

describe("generatePassword", () => {
  it("generates a password of the requested length", () => {
    const pw = generatePassword({ length: 24, symbols: true, numbers: true, uppercase: true, lowercase: true });
    expect(pw).toHaveLength(24);
  });

  it("respects disabled character sets", () => {
    const pw = generatePassword({ length: 50, symbols: false, numbers: false, uppercase: false, lowercase: true });
    expect(pw).toMatch(/^[a-z]+$/);
  });

  it("throws when every character set is disabled", () => {
    expect(() => generatePassword({ length: 10, symbols: false, numbers: false, uppercase: false, lowercase: false })).toThrow();
  });

  it("produces different passwords across calls", () => {
    const a = generatePassword({ length: 32, symbols: true, numbers: true, uppercase: true, lowercase: true });
    const b = generatePassword({ length: 32, symbols: true, numbers: true, uppercase: true, lowercase: true });
    expect(a).not.toBe(b);
  });
});
