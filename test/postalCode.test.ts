import { describe, it, expect } from "vitest";
import { validatePostalCode, supportedPostalCountries } from "../src/lib/postalCode.js";

describe("validatePostalCode", () => {
  it("accepts a valid US zip", () => {
    expect(validatePostalCode("US", "94103").valid).toBe(true);
  });

  it("accepts a valid US zip+4", () => {
    expect(validatePostalCode("US", "94103-1234").valid).toBe(true);
  });

  it("rejects an invalid US zip", () => {
    expect(validatePostalCode("US", "abc").valid).toBe(false);
  });

  it("accepts a valid UK postcode", () => {
    expect(validatePostalCode("GB", "SW1A 1AA").valid).toBe(true);
  });

  it("accepts a valid Canadian postal code", () => {
    expect(validatePostalCode("CA", "K1A 0B1").valid).toBe(true);
  });

  it("accepts a valid German postal code", () => {
    expect(validatePostalCode("DE", "10115").valid).toBe(true);
  });

  it("is case-insensitive on country code", () => {
    expect(validatePostalCode("de", "10115").valid).toBe(true);
  });

  it("marks an unknown country as unsupported", () => {
    const result = validatePostalCode("ZZ", "12345");
    expect(result.supported).toBe(false);
    expect(result.valid).toBe(false);
  });

  it("rejects an empty postal code", () => {
    const result = validatePostalCode("US", "");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/empty/);
  });

  it("lists supported countries", () => {
    const countries = supportedPostalCountries();
    expect(countries).toContain("US");
    expect(countries).toContain("DE");
    expect(countries).toEqual([...countries].sort());
  });
});
