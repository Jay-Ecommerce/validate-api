import { describe, it, expect, vi, afterEach } from "vitest";
import { checkVatFormat, checkVatExistence } from "../src/lib/vat.js";

describe("checkVatFormat", () => {
  it("accepts a validly formatted German VAT number", () => {
    const result = checkVatFormat("DE", "123456789");
    expect(result.formatValid).toBe(true);
  });

  it("normalizes lowercase country codes and stray whitespace", () => {
    const result = checkVatFormat("de", " 123456789 ");
    expect(result.formatValid).toBe(true);
    expect(result.countryCode).toBe("DE");
  });

  it("rejects a malformed VAT number for a known country", () => {
    const result = checkVatFormat("DE", "12");
    expect(result.formatValid).toBe(false);
  });

  it("rejects an unsupported country code", () => {
    const result = checkVatFormat("US", "123456789");
    expect(result.formatValid).toBe(false);
    expect(result.errors[0]).toContain("Unsupported");
  });
});

describe("checkVatExistence", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns existence data on a successful VIES response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ valid: true, name: "ACME GmbH", address: "Berlin" }),
      }),
    );

    const result = await checkVatExistence("DE", "123456789");
    expect(result.checked).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.name).toBe("ACME GmbH");
  });

  it("gracefully degrades when VIES is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    const result = await checkVatExistence("DE", "123456789");
    expect(result.checked).toBe(false);
    expect(result.source).toBe("unavailable");
  });
});
