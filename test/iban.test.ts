import { describe, it, expect } from "vitest";
import { validateIban } from "../src/lib/iban.js";

describe("validateIban", () => {
  it("accepts a well-known valid German IBAN", () => {
    const result = validateIban("DE89370400440532013000");
    expect(result.valid).toBe(true);
    expect(result.countryCode).toBe("DE");
    expect(result.formatted).toBe("DE89 3704 0044 0532 0130 00");
  });

  it("accepts a valid IBAN with spaces and lowercase input", () => {
    const result = validateIban("gb82 west 1234 5698 7654 32");
    expect(result.valid).toBe(true);
    expect(result.countryCode).toBe("GB");
  });

  it("accepts a valid French IBAN", () => {
    const result = validateIban("FR1420041010050500013M02606");
    expect(result.valid).toBe(true);
  });

  it("rejects an IBAN with a broken checksum", () => {
    const result = validateIban("DE89370400440532013001");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Checksum (mod-97) validation failed");
  });

  it("rejects an unknown country code", () => {
    const result = validateIban("ZZ89370400440532013000");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Unknown or unsupported country code"))).toBe(true);
  });

  it("rejects wrong length for a known country", () => {
    const result = validateIban("DE8937040044053201300");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid length"))).toBe(true);
  });

  it("rejects input with invalid characters", () => {
    const result = validateIban("DE89-3704-0044!!");
    expect(result.valid).toBe(false);
  });
});
