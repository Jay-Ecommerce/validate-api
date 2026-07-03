import { Hono } from "hono";
import parsePhoneNumberFromString from "libphonenumber-js";
import { validateIban } from "../lib/iban.js";
import { checkVatFormat, checkVatExistence } from "../lib/vat.js";
import { checkEmailSyntax, checkMxRecords } from "../lib/email.js";
import { validateCreditCard } from "../lib/creditcard.js";
import { parseJsonBody } from "../lib/http.js";

export const validateRoute = new Hono();

validateRoute.post("/v1/validate/iban", async (c) => {
  const body = await parseJsonBody<{ iban?: string }>(c);
  if (!body?.iban || typeof body.iban !== "string") {
    return c.json({ error: "bad_request", message: "Field 'iban' (string) is required" }, 400);
  }
  return c.json(validateIban(body.iban));
});

validateRoute.post("/v1/validate/vat", async (c) => {
  const body = await parseJsonBody<{ countryCode?: string; vatNumber?: string; checkExistence?: boolean }>(c);
  if (!body?.countryCode || !body.vatNumber) {
    return c.json({ error: "bad_request", message: "Fields 'countryCode' and 'vatNumber' (strings) are required" }, 400);
  }

  const formatResult = checkVatFormat(body.countryCode, body.vatNumber);
  if (!formatResult.formatValid || body.checkExistence === false) {
    return c.json({ ...formatResult, existence: null });
  }

  const existence = await checkVatExistence(formatResult.countryCode, formatResult.vatNumber);
  return c.json({ ...formatResult, existence });
});

validateRoute.post("/v1/validate/email", async (c) => {
  const body = await parseJsonBody<{ email?: string; checkMx?: boolean }>(c);
  if (!body?.email || typeof body.email !== "string") {
    return c.json({ error: "bad_request", message: "Field 'email' (string) is required" }, 400);
  }

  const syntax = checkEmailSyntax(body.email);
  if (!syntax.syntaxValid || body.checkMx === false || !syntax.domain) {
    return c.json({ ...syntax, mx: null });
  }

  const mx = await checkMxRecords(syntax.domain);
  return c.json({ ...syntax, mx });
});

validateRoute.post("/v1/validate/phone", async (c) => {
  const body = await parseJsonBody<{ phone?: string; defaultCountry?: string }>(c);
  if (!body?.phone || typeof body.phone !== "string") {
    return c.json({ error: "bad_request", message: "Field 'phone' (string) is required" }, 400);
  }

  try {
    const parsed = parsePhoneNumberFromString(body.phone, body.defaultCountry as never);
    if (!parsed) {
      return c.json({ valid: false, errors: ["Could not parse phone number"] });
    }

    return c.json({
      valid: parsed.isValid(),
      country: parsed.country ?? null,
      countryCallingCode: parsed.countryCallingCode,
      type: parsed.getType() ?? null,
      e164: parsed.number,
      international: parsed.formatInternational(),
      national: parsed.formatNational(),
      errors: parsed.isValid() ? [] : ["Number failed national validation rules"],
    });
  } catch {
    return c.json({ valid: false, errors: ["Could not parse phone number"] });
  }
});

validateRoute.post("/v1/validate/creditcard", async (c) => {
  const body = await parseJsonBody<{ number?: string }>(c);
  if (!body?.number || typeof body.number !== "string") {
    return c.json({ error: "bad_request", message: "Field 'number' (string) is required" }, 400);
  }
  return c.json(validateCreditCard(body.number));
});
