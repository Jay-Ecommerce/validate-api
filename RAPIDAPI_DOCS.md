# RapidAPI per-endpoint documentation (copy/paste)

Paste into each endpoint's "Description" field on the RapidAPI provider
dashboard (API → Endpoints → select endpoint → Description / Parameters).
Source of truth is [openapi.yaml](./openapi.yaml) — update there first if
behavior changes, then resync here.

---

## GET /health

**Description:** Liveness check. No API key required. Returns `200` with the
current server timestamp if the service is up.

**Example response:**
```json
{"status": "ok", "timestamp": "2026-07-07T14:27:00.621Z"}
```

---

## POST /v1/validate/iban

**Description:** Validates an IBAN using the ISO 13616 mod-97 checksum. No
external calls — pure offline format validation.

**Parameters:**
- `iban` (string, required) — the IBAN to validate, with or without spaces. Example: `DE89370400440532013000`

**Example response:**
```json
{"valid": true, "formatted": "DE89 3704 0044 0532 0130 00", "countryCode": "DE", "checkDigits": "89", "bban": "370400440532013000", "errors": []}
```

---

## POST /v1/validate/vat

**Description:** Validates an EU VAT number's format, and optionally
confirms it's registered via the European Commission's VIES service.

**Parameters:**
- `countryCode` (string, required) — ISO 3166-1 alpha-2 country code. Example: `IE`
- `vatNumber` (string, required) — the VAT number without the country prefix. Example: `6388047V`
- `checkExistence` (boolean, optional, default `true`) — set `false` to skip the live VIES lookup and only check format

**Example response:**
```json
{"formatValid": true, "countryCode": "IE", "vatNumber": "6388047V", "errors": [], "existence": null}
```

---

## POST /v1/validate/email

**Description:** Validates email syntax, and optionally checks the domain
has MX records (i.e. can actually receive mail).

**Parameters:**
- `email` (string, required) — the email address to validate. Example: `user@example.com`
- `checkMx` (boolean, optional, default `true`) — set `false` to skip the DNS lookup

**Example response:**
```json
{"syntaxValid": true, "localPart": "test", "domain": "gmail.com", "errors": [], "mx": {"checked": true, "hasMx": true, "records": ["5 gmail-smtp-in.l.google.com.", "..."]}}
```

---

## POST /v1/validate/disposable-email

**Description:** Flags throwaway/temp-mail addresses (Mailinator, Guerrilla
Mail, 10-minute-mail, YOPmail, and 80+ other known providers, including their
subdomains). Use alongside `/v1/validate/email` to block fake-account
signups without rejecting real free-webmail addresses (Gmail, Outlook, etc.
are never flagged).

**Parameters:**
- `email` (string, required) — the email address to check. Example: `test@mailinator.com`

**Example response:**
```json
{"syntaxValid": true, "domain": "mailinator.com", "disposable": true, "errors": []}
```

---

## POST /v1/validate/postal-code

**Description:** Validates a postal/ZIP code's format for a given country
(50+ countries covered — US, CA, GB, DE, FR, and most of EU/APAC/LatAm).
Format check only, like the IBAN checksum — does not confirm the code is
currently assigned by the country's postal service.

**Parameters:**
- `countryCode` (string, required) — ISO 3166-1 alpha-2. Example: `US`
- `postalCode` (string, required) — Example: `94103`

**Example response:**
```json
{"valid": true, "countryCode": "US", "postalCode": "94103", "supported": true, "errors": []}
```

---

## GET /v1/validate/postal-code/countries

**Description:** Lists the ISO country codes this API has a known postal
code format for.

**Example response:**
```json
{"countries": ["AR", "AT", "AU", "..."]}
```

---

## POST /v1/validate/phone

**Description:** Validates and formats a phone number using libphonenumber
rules (the same library Google uses in Android).

**Parameters:**
- `phone` (string, required) — the phone number, ideally with a `+countrycode` prefix. Example: `+491701234567`
- `defaultCountry` (string, optional) — ISO 3166-1 alpha-2 country code, used to interpret the number when it has no `+CC` prefix. Example: `DE`

**Example response:**
```json
{"valid": true, "country": "DE", "countryCallingCode": "49", "type": null, "e164": "+491701234567", "international": "+49 170 1234567", "national": "0170 1234567", "errors": []}
```

---

## POST /v1/validate/creditcard

**Description:** Validates a credit card number's format via the Luhn
checksum and detects the card brand (Visa, Mastercard, Amex, etc). Format
only — no card network is ever contacted, no charge is made or possible.

**Parameters:**
- `number` (string, required) — the card number, with or without spaces. Example: `4111111111111111`

**Example response:**
```json
{"valid": true, "brand": "visa", "luhnValid": true, "formatted": "4111 1111 1111 1111", "errors": []}
```

---

## POST /v1/password/strength

**Description:** Scores a password's strength locally using entropy
estimation. The password is processed in-memory only — never stored,
logged, or sent anywhere else.

**Parameters:**
- `password` (string, required)

**Example response:**
```json
{"score": 90, "label": "very-strong", "entropyBits": 72.3, "suggestions": []}
```

---

## POST /v1/password/breach-check

**Description:** Checks whether a password has appeared in known data
breaches, using the HaveIBeenPwned Pwned Passwords API's k-anonymity
protocol — only a 5-character SHA-1 hash prefix ever leaves this server,
never the password itself or its full hash.

**Parameters:**
- `password` (string, required)

**Example response:**
```json
{"checked": true, "breached": true, "occurrences": 2266543}
```

---

## GET /v1/generate/uuid

**Description:** Generates one or more cryptographically random UUID v4
values.

**Parameters:**
- `count` (integer, optional, default `1`, min `1`, max `100`) — query parameter

**Example response:**
```json
{"uuids": ["a1b2c3d4-...", "..."]}
```

---

## GET /v1/generate/password

**Description:** Generates a cryptographically random password.

**Parameters (all query, all optional):**
- `length` (integer, default `16`, min `4`, max `128`)
- `symbols` (boolean, default `true`)
- `numbers` (boolean, default `true`)
- `uppercase` (boolean, default `true`)
- `lowercase` (boolean, default `true`)

**Example response:**
```json
{"password": "aB3!kL9$mN2@pQ7x", "length": 16}
```

---

## POST /v1/batch/iban

**Description:** Validates up to 100 IBANs in a single call using the same
ISO 13616 mod-97 checksum logic as `/v1/validate/iban`. No external calls —
pure offline format validation, run once per item. Useful for cleaning a
customer/vendor list without burning single-item rate limits.

**Parameters:**
- `ibans` (array of strings, required, max 100 items) — Example: `["DE89370400440532013000", "not-an-iban"]`

**Example response:**
```json
{"count": 2, "results": [{"input": "DE89370400440532013000", "valid": true, "formatted": "DE89 3704 0044 0532 0130 00", "countryCode": "DE", "checkDigits": "89", "bban": "370400440532013000", "errors": []}, {"input": "not-an-iban", "valid": false, "formatted": null, "countryCode": null, "checkDigits": null, "bban": null, "errors": ["IBAN contains invalid characters"]}]}
```

---

## POST /v1/batch/email

**Description:** Validates up to 50 email addresses in a single call,
reusing the same syntax check as `/v1/validate/email`. Unlike the
single-item endpoint, MX record lookup defaults to **off** (`checkMx:
false`) since a batch call can otherwise fan out into many DNS lookups at
once — set `checkMx: true` to run it for every item in the batch.

**Parameters:**
- `emails` (array of strings, required, max 50 items) — Example: `["user@example.com", "not-an-email"]`
- `checkMx` (boolean, optional, default `false`) — set `true` to also check MX records for every valid-syntax item

**Example response:**
```json
{"count": 2, "results": [{"input": "user@example.com", "syntaxValid": true, "localPart": "user", "domain": "example.com", "errors": [], "mx": null}, {"input": "not-an-email", "syntaxValid": false, "localPart": null, "domain": null, "errors": ["Email does not match required syntax"], "mx": null}]}
```

---

## Authentication (applies to all `/v1/*` endpoints)

All `/v1/*` endpoints require RapidAPI's own `X-RapidAPI-Key` (handled
automatically once a consumer subscribes — RapidAPI adds it to every
proxied request). `/health` is exempt and needs no key.
