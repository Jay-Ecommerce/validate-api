import { Hono } from "hono";
import { checkPasswordStrength, checkPasswordBreach } from "../lib/password.js";
import { parseJsonBody } from "../lib/http.js";

export const passwordRoute = new Hono();

passwordRoute.post("/v1/password/strength", async (c) => {
  const body = await parseJsonBody<{ password?: string }>(c);
  if (typeof body?.password !== "string" || body.password.length === 0) {
    return c.json({ error: "bad_request", message: "Field 'password' (non-empty string) is required" }, 400);
  }
  return c.json(checkPasswordStrength(body.password));
});

passwordRoute.post("/v1/password/breach-check", async (c) => {
  const body = await parseJsonBody<{ password?: string }>(c);
  if (typeof body?.password !== "string" || body.password.length === 0) {
    return c.json({ error: "bad_request", message: "Field 'password' (non-empty string) is required" }, 400);
  }
  const result = await checkPasswordBreach(body.password);
  return c.json(result);
});
