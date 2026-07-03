import { describe, it, expect, vi, afterEach } from "vitest";
import { checkPasswordStrength, checkPasswordBreach } from "../src/lib/password.js";

describe("checkPasswordStrength", () => {
  it("rates a short common password as very weak", () => {
    const result = checkPasswordStrength("password");
    expect(result.label).toBe("very-weak");
  });

  it("rates a long random mixed-character password as strong", () => {
    const result = checkPasswordStrength("xQ7#mK9!vL2$pR4@");
    expect(["strong", "very-strong"]).toContain(result.label);
  });

  it("increases score as length and character diversity increase", () => {
    const weak = checkPasswordStrength("aaaa");
    const stronger = checkPasswordStrength("aB3!aB3!aB3!aB3!");
    expect(stronger.score).toBeGreaterThan(weak.score);
  });

  it("suggests adding missing character classes", () => {
    const result = checkPasswordStrength("alllowercase");
    expect(result.suggestions).toContain("Add uppercase letters");
    expect(result.suggestions).toContain("Add numbers");
  });
});

describe("checkPasswordBreach", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects a breached password via k-anonymity range response", async () => {
    // SHA1("password") = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8 -> prefix 5BAA6, suffix 1E4C9...FD8
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "1E4C9B93F3F0682250B6CF8331B7EE68FD8:3730471\nOTHERSUFFIX00000000000000000000:1",
      }),
    );

    const result = await checkPasswordBreach("password");
    expect(result.checked).toBe(true);
    expect(result.breached).toBe(true);
    expect(result.occurrences).toBe(3730471);
  });

  it("reports not breached when suffix is absent from the range", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:1",
      }),
    );

    const result = await checkPasswordBreach("password");
    expect(result.checked).toBe(true);
    expect(result.breached).toBe(false);
  });

  it("never sends the full password, only a SHA-1 prefix", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);

    await checkPasswordBreach("correct horse battery staple");

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).not.toContain("correct horse battery staple");
    expect(calledUrl.split("/").pop()).toHaveLength(5);
  });
});
