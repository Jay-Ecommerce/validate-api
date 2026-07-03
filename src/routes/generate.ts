import { Hono } from "hono";
import { generateUuids, generatePassword } from "../lib/generate.js";

export const generateRoute = new Hono();

generateRoute.get("/v1/generate/uuid", (c) => {
  const countParam = c.req.query("count");
  const count = countParam ? Number(countParam) : 1;

  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return c.json({ error: "bad_request", message: "'count' must be an integer between 1 and 100" }, 400);
  }

  return c.json({ uuids: generateUuids(count) });
});

generateRoute.get("/v1/generate/password", (c) => {
  const length = Number(c.req.query("length") ?? "16");
  const symbols = c.req.query("symbols") !== "false";
  const numbers = c.req.query("numbers") !== "false";
  const uppercase = c.req.query("uppercase") !== "false";
  const lowercase = c.req.query("lowercase") !== "false";

  if (!Number.isInteger(length) || length < 4 || length > 128) {
    return c.json({ error: "bad_request", message: "'length' must be an integer between 4 and 128" }, 400);
  }

  try {
    const password = generatePassword({ length, symbols, numbers, uppercase, lowercase });
    return c.json({ password, length, symbols, numbers, uppercase, lowercase });
  } catch (err) {
    return c.json({ error: "bad_request", message: err instanceof Error ? err.message : "Invalid options" }, 400);
  }
});
