import { describe, it, expect, vi, afterEach } from "vitest";
import app from "../src/index.js";

const TEST_ENV = { RAPIDAPI_PROXY_SECRET: "test-secret" };
const AUTH_HEADERS = { "X-RapidAPI-Proxy-Secret": "test-secret", "Content-Type": "application/json" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readJson(res: Response): Promise<any> {
  return res.json();
}

describe("POST /v1/batch/iban", () => {
  it("validates a mix of valid and invalid IBANs, preserving order", async () => {
    const res = await app.request(
      "/v1/batch/iban",
      {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({ ibans: ["DE89370400440532013000", "not-an-iban", "gb82 west 1234 5698 7654 32"] }),
      },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.count).toBe(3);
    expect(body.results).toHaveLength(3);
    expect(body.results[0].input).toBe("DE89370400440532013000");
    expect(body.results[0].valid).toBe(true);
    expect(body.results[0].countryCode).toBe("DE");
    expect(body.results[1].valid).toBe(false);
    expect(body.results[2].valid).toBe(true);
    expect(body.results[2].countryCode).toBe("GB");
  });

  it("rejects a missing 'ibans' field", async () => {
    const res = await app.request(
      "/v1/batch/iban",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({}) },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });

  it("rejects an empty array", async () => {
    const res = await app.request(
      "/v1/batch/iban",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ ibans: [] }) },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });

  it("rejects a non-string item", async () => {
    const res = await app.request(
      "/v1/batch/iban",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ ibans: ["DE89370400440532013000", 12345] }) },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });

  it("rejects a batch larger than the max size", async () => {
    const ibans = Array.from({ length: 101 }, () => "DE89370400440532013000");
    const res = await app.request(
      "/v1/batch/iban",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ ibans }) },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /v1/batch/email", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates syntax for a mix of valid and invalid emails without checking MX by default", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const res = await app.request(
      "/v1/batch/email",
      {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({ emails: ["user@example.com", "not-an-email"] }),
      },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.count).toBe(2);
    expect(body.results[0].syntaxValid).toBe(true);
    expect(body.results[0].mx).toBeNull();
    expect(body.results[1].syntaxValid).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("checks MX records per item when checkMx=true", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ Answer: [{ type: 15, data: "10 mail.example.com." }] }),
      }),
    );

    const res = await app.request(
      "/v1/batch/email",
      {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({ emails: ["user@example.com"], checkMx: true }),
      },
      TEST_ENV,
    );
    const body = await readJson(res);
    expect(body.results[0].mx.checked).toBe(true);
    expect(body.results[0].mx.hasMx).toBe(true);
  });

  it("rejects a missing 'emails' field", async () => {
    const res = await app.request(
      "/v1/batch/email",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({}) },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });

  it("rejects a batch larger than the max size", async () => {
    const emails = Array.from({ length: 51 }, () => "user@example.com");
    const res = await app.request(
      "/v1/batch/email",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ emails }) },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });
});
