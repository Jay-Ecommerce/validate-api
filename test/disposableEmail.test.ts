import { describe, it, expect } from "vitest";
import { checkDisposableEmail } from "../src/lib/disposableEmail.js";

describe("checkDisposableEmail", () => {
  it("flags a known disposable domain", () => {
    const result = checkDisposableEmail("test@mailinator.com");
    expect(result.syntaxValid).toBe(true);
    expect(result.disposable).toBe(true);
  });

  it("flags a subdomain of a known disposable domain", () => {
    const result = checkDisposableEmail("test@abc.mailinator.com");
    expect(result.disposable).toBe(true);
  });

  it("does not flag a normal email domain", () => {
    const result = checkDisposableEmail("user@gmail.com");
    expect(result.syntaxValid).toBe(true);
    expect(result.disposable).toBe(false);
  });

  it("is case-insensitive on the domain", () => {
    const result = checkDisposableEmail("test@MAILINATOR.COM");
    expect(result.disposable).toBe(true);
  });

  it("returns null disposable status for syntactically invalid input", () => {
    const result = checkDisposableEmail("not-an-email");
    expect(result.syntaxValid).toBe(false);
    expect(result.disposable).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
