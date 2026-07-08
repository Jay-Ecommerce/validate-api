import { describe, it, expect } from "vitest";
import app from "../src/index.js";

const TEST_ENV = { RAPIDAPI_PROXY_SECRET: "test-secret" };
const AUTH_HEADERS = { "X-RapidAPI-Proxy-Secret": "test-secret", "Content-Type": "application/json" };

/** Test-only helper: response bodies are untyped JSON, so read them as `any` here. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readJson(res: Response): Promise<any> {
  return res.json();
}

describe("GET /health", () => {
  it("responds ok without requiring auth", async () => {
    const res = await app.request("/health", {}, {});
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.status).toBe("ok");
  });
});

describe("RapidAPI auth middleware", () => {
  it("rejects /v1 requests missing the proxy secret", async () => {
    const res = await app.request("/v1/generate/uuid", {}, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it("rejects requests with the wrong proxy secret", async () => {
    const res = await app.request(
      "/v1/generate/uuid",
      { headers: { "X-RapidAPI-Proxy-Secret": "wrong" } },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });

  it("allows requests with the correct proxy secret", async () => {
    const res = await app.request("/v1/generate/uuid", { headers: AUTH_HEADERS }, TEST_ENV);
    expect(res.status).toBe(200);
  });

  it("allows direct access when ALLOW_DIRECT_ACCESS=true", async () => {
    const res = await app.request("/v1/generate/uuid", {}, { ALLOW_DIRECT_ACCESS: "true" });
    expect(res.status).toBe(200);
  });
});

describe("route smoke tests", () => {
  it("POST /v1/validate/iban returns a validation result", async () => {
    const res = await app.request(
      "/v1/validate/iban",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ iban: "DE89370400440532013000" }) },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.valid).toBe(true);
  });

  it("POST /v1/validate/iban with missing field returns 400", async () => {
    const res = await app.request(
      "/v1/validate/iban",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({}) },
      TEST_ENV,
    );
    expect(res.status).toBe(400);
  });

  it("POST /v1/validate/creditcard returns brand detection", async () => {
    const res = await app.request(
      "/v1/validate/creditcard",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ number: "4111111111111111" }) },
      TEST_ENV,
    );
    const body = await readJson(res);
    expect(body.brand).toBe("visa");
  });

  it("POST /v1/password/strength returns a score", async () => {
    const res = await app.request(
      "/v1/password/strength",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ password: "abc" }) },
      TEST_ENV,
    );
    const body = await readJson(res);
    expect(typeof body.score).toBe("number");
  });

  it("GET /v1/generate/uuid?count=3 returns 3 uuids", async () => {
    const res = await app.request("/v1/generate/uuid?count=3", { headers: AUTH_HEADERS }, TEST_ENV);
    const body = await readJson(res);
    expect(body.uuids).toHaveLength(3);
  });

  it("GET /v1/generate/uuid?count=1000 rejects out-of-range count", async () => {
    const res = await app.request("/v1/generate/uuid?count=1000", { headers: AUTH_HEADERS }, TEST_ENV);
    expect(res.status).toBe(400);
  });

  it("POST /v1/validate/disposable-email flags a known disposable domain", async () => {
    const res = await app.request(
      "/v1/validate/disposable-email",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ email: "test@mailinator.com" }) },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.disposable).toBe(true);
  });

  it("POST /v1/validate/postal-code returns a validation result", async () => {
    const res = await app.request(
      "/v1/validate/postal-code",
      { method: "POST", headers: AUTH_HEADERS, body: JSON.stringify({ countryCode: "US", postalCode: "94103" }) },
      TEST_ENV,
    );
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.valid).toBe(true);
  });

  it("unknown route returns 404 json", async () => {
    const res = await app.request("/v1/does-not-exist", { headers: AUTH_HEADERS }, TEST_ENV);
    expect(res.status).toBe(404);
  });
});

describe("local rate limiting", () => {
  it("returns 429 after exceeding the burst limit for one identity", async () => {
    const identityHeaders = { ...AUTH_HEADERS, "X-RapidAPI-User": "rate-limit-test-user" };
    let lastStatus = 200;
    for (let i = 0; i < 55; i++) {
      const res = await app.request("/v1/generate/uuid", { headers: identityHeaders }, TEST_ENV);
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
