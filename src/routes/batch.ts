import { Hono } from "hono";
import { validateIban } from "../lib/iban.js";
import { checkEmailSyntax, checkMxRecords } from "../lib/email.js";
import { parseJsonBody } from "../lib/http.js";

export const batchRoute = new Hono();

// Cloudflare Workers subrequest limits (and plain good-neighbor behavior) cap how
// large a single batch call can be. IBAN validation is pure/offline so it can afford
// a larger ceiling; email batch validation can trigger one DNS lookup per item when
// checkMx is enabled, so it gets a lower ceiling.
const MAX_BATCH_IBAN = 100;
const MAX_BATCH_EMAIL = 50;

batchRoute.post("/v1/batch/iban", async (c) => {
  const body = await parseJsonBody<{ ibans?: unknown }>(c);
  if (!Array.isArray(body?.ibans) || body.ibans.length === 0) {
    return c.json({ error: "bad_request", message: "Field 'ibans' (non-empty array of strings) is required" }, 400);
  }
  if (body.ibans.length > MAX_BATCH_IBAN) {
    return c.json({ error: "bad_request", message: `'ibans' must contain at most ${MAX_BATCH_IBAN} items` }, 400);
  }
  if (!body.ibans.every((item): item is string => typeof item === "string")) {
    return c.json({ error: "bad_request", message: "Every item in 'ibans' must be a string" }, 400);
  }

  const results = body.ibans.map((iban) => ({ input: iban, ...validateIban(iban) }));
  return c.json({ count: results.length, results });
});

batchRoute.post("/v1/batch/email", async (c) => {
  const body = await parseJsonBody<{ emails?: unknown; checkMx?: boolean }>(c);
  if (!Array.isArray(body?.emails) || body.emails.length === 0) {
    return c.json({ error: "bad_request", message: "Field 'emails' (non-empty array of strings) is required" }, 400);
  }
  if (body.emails.length > MAX_BATCH_EMAIL) {
    return c.json({ error: "bad_request", message: `'emails' must contain at most ${MAX_BATCH_EMAIL} items` }, 400);
  }
  if (!body.emails.every((item): item is string => typeof item === "string")) {
    return c.json({ error: "bad_request", message: "Every item in 'emails' must be a string" }, 400);
  }

  // Defaults to false (unlike the single-item endpoint) since a batch call can fan out
  // into many DNS lookups at once; callers opt in explicitly for the slower, fuller check.
  const checkMx = body.checkMx === true;

  const results = await Promise.all(
    body.emails.map(async (email) => {
      const syntax = checkEmailSyntax(email);
      if (!syntax.syntaxValid || !checkMx || !syntax.domain) {
        return { input: email, ...syntax, mx: null };
      }
      const mx = await checkMxRecords(syntax.domain);
      return { input: email, ...syntax, mx };
    }),
  );

  return c.json({ count: results.length, results });
});
