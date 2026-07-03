import { describe, it, expect } from "vitest";
import { validateCreditCard } from "../src/lib/creditcard.js";

describe("validateCreditCard", () => {
  it("validates a well-known test Visa number", () => {
    const result = validateCreditCard("4111111111111111");
    expect(result.valid).toBe(true);
    expect(result.brand).toBe("visa");
    expect(result.luhnValid).toBe(true);
  });

  it("validates a well-known test Mastercard number", () => {
    const result = validateCreditCard("5555555555554444");
    expect(result.valid).toBe(true);
    expect(result.brand).toBe("mastercard");
  });

  it("validates a well-known test Amex number", () => {
    const result = validateCreditCard("378282246310005");
    expect(result.valid).toBe(true);
    expect(result.brand).toBe("amex");
  });

  it("rejects a number that fails the Luhn checksum", () => {
    const result = validateCreditCard("4111111111111112");
    expect(result.valid).toBe(false);
    expect(result.luhnValid).toBe(false);
  });

  it("rejects non-numeric or too-short input", () => {
    expect(validateCreditCard("abc").valid).toBe(false);
    expect(validateCreditCard("123").valid).toBe(false);
  });

  it("formats a valid card number in groups of 4", () => {
    const result = validateCreditCard("4111 1111-1111 1111");
    expect(result.formatted).toBe("4111 1111 1111 1111");
  });
});
