import { describe, it, expect, vi, afterEach } from "vitest";
import { checkEmailSyntax, checkMxRecords } from "../src/lib/email.js";

describe("checkEmailSyntax", () => {
  it("accepts a normal address", () => {
    const result = checkEmailSyntax("user@example.com");
    expect(result.syntaxValid).toBe(true);
    expect(result.localPart).toBe("user");
    expect(result.domain).toBe("example.com");
  });

  it("accepts plus-addressing and subdomains", () => {
    expect(checkEmailSyntax("user+tag@mail.example.co.uk").syntaxValid).toBe(true);
  });

  it("rejects missing @", () => {
    expect(checkEmailSyntax("not-an-email").syntaxValid).toBe(false);
  });

  it("rejects empty input", () => {
    const result = checkEmailSyntax("");
    expect(result.syntaxValid).toBe(false);
    expect(result.errors).toContain("Email is empty");
  });

  it("rejects a domain without a TLD", () => {
    expect(checkEmailSyntax("user@localhost").syntaxValid).toBe(false);
  });
});

describe("checkMxRecords", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports hasMx true when DNS answer contains MX records", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ Answer: [{ type: 15, data: "10 mail.example.com." }] }),
      }),
    );

    const result = await checkMxRecords("example.com");
    expect(result.checked).toBe(true);
    expect(result.hasMx).toBe(true);
    expect(result.records).toHaveLength(1);
  });

  it("reports hasMx false when no MX records are returned", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    const result = await checkMxRecords("no-mx.example.com");
    expect(result.checked).toBe(true);
    expect(result.hasMx).toBe(false);
  });

  it("marks checked=false when the DNS request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await checkMxRecords("example.com");
    expect(result.checked).toBe(false);
    expect(result.hasMx).toBeNull();
    expect(result.error).toContain("network down");
  });
});
