# validate-api

Stateless validation & utility toolkit API — IBAN, EU VAT, email, phone, and
credit-card format validation; password strength scoring and breach checks;
UUID and random-password generation. Built to be sold as a metered API on the
[RapidAPI](https://rapidapi.com) marketplace, which handles all billing,
quota enforcement, and payout (including payout via PayPal).

## Why this exists

This is a Micro-SaaS revenue experiment: a genuinely useful, narrow developer
tool with no ongoing content or support burden, hosted entirely on a free
tier, monetized through a marketplace that owns the payment relationship with
customers. See [DECISIONS.md](./DECISIONS.md) for the full reasoning and
[RUNBOOK.md](./RUNBOOK.md) for the one-time manual setup required before it
can earn anything.

## Usage

Subscribe on the [Validate API listing on RapidAPI](https://rapidapi.com/search/validate)
to get your `X-RapidAPI-Key`.

```bash
curl -X POST "https://validate7.p.rapidapi.com/v1/validate/iban" \
  -H "X-RapidAPI-Key: <your-rapidapi-key>" \
  -H "X-RapidAPI-Host: validate7.p.rapidapi.com" \
  -H "Content-Type: application/json" \
  -d '{"iban": "DE89370400440532013000"}'
# => {"valid":true,"formatted":"DE89 3704 0044 0532 0130 00","countryCode":"DE","checkDigits":"89","bban":"370400440532013000","errors":[]}
```

| Endpoint | Body | Notes |
|---|---|---|
| `POST /v1/validate/iban` | `{"iban": "DE89370400440532013000"}` | Mod-97 checksum, no external calls |
| `POST /v1/validate/vat` | `{"countryCode": "IE", "vatNumber": "6388047V", "checkExistence": true}` | `checkExistence: false` skips the live VIES lookup |
| `POST /v1/validate/email` | `{"email": "user@example.com", "checkMx": true}` | `checkMx: false` skips the DNS lookup |
| `POST /v1/validate/phone` | `{"phone": "+491701234567"}` | `defaultCountry` (e.g. `"DE"`) needed if the number has no `+CC` prefix |
| `POST /v1/validate/creditcard` | `{"number": "4111111111111111"}` | Luhn checksum + brand detection, format only (no card networks are called) |
| `POST /v1/password/strength` | `{"password": "Tr0ub4dor&3"}` | Local entropy scoring, password is never stored or logged |
| `POST /v1/password/breach-check` | `{"password": "..."}` | HIBP k-anonymity — only a 5-char hash prefix leaves the request |
| `GET /v1/generate/uuid?count=5` | — | 1-100 UUID v4s |
| `GET /v1/generate/password?length=20&symbols=true` | — | Cryptographically random |
| `GET /health` | — | No API key required, used for uptime checks |

Full request/response schemas: [openapi.yaml](./openapi.yaml) (also what's
imported into the RapidAPI listing to generate its docs).

## Architecture

```
src/
  index.ts           Hono app: wires middleware + routes (Workers & Node share this)
  server.ts           Node entry point (self-host fallback, not the primary deploy target)
  lib/                 Pure, framework-free validation/generation logic (unit-testable)
  middleware/         Auth (RapidAPI proxy secret), structured logging, local rate limiting
  routes/              HTTP layer: parses requests, calls lib/, shapes responses
test/                  vitest unit + integration tests (one file per lib/route concern)
openapi.yaml           Spec used to auto-generate the RapidAPI marketplace listing
wrangler.toml           Cloudflare Workers deployment config (primary target, free tier)
Dockerfile / docker-compose.yml   Self-host fallback (any Docker host)
.github/workflows/       CI (lint+test on every push) and CD (deploy to Workers on main)
```

**Primary runtime: Cloudflare Workers.** Free tier gives 100,000 requests/day
with no credit card required. All endpoints are stateless — no database, no
in-memory session state — so it scales horizontally for free.

**External calls, all to free public services, none requiring an API key:**
| Endpoint | External service | Purpose |
|---|---|---|
| `/v1/validate/vat` | [VIES](https://ec.europa.eu/taxation_customs/vies/) (European Commission) | Confirms a VAT number is registered |
| `/v1/validate/email` | Cloudflare DNS-over-HTTPS | MX record lookup |
| `/v1/password/breach-check` | [HaveIBeenPwned Pwned Passwords](https://haveibeenpwned.com/API/v3#PwnedPasswords) | k-anonymity breach check (only a 5-char hash prefix is ever sent) |

If any of these are unreachable, the endpoint degrades gracefully
(`checked: false`) rather than failing the request — format validation always
works offline.

## Local development

```bash
npm install
npm run dev        # Cloudflare Workers local dev server (wrangler)
# or
npm run dev:node   # plain Node dev server via tsx, useful for quick debugging
```

Direct requests (no RapidAPI proxy secret) are rejected by default. For local
testing, set `ALLOW_DIRECT_ACCESS=true` in `.dev.vars` (wrangler) or `.env`
(Node) — **never** in production.

## Testing

```bash
npm run lint    # eslint
npm run build   # tsc --noEmit type check
npm test        # vitest (53 tests: pure-function unit tests + Hono route integration tests)
npm run coverage
```

Tests for endpoints that call external services (VIES, DNS, HIBP) mock
`fetch` — the suite never makes real network calls, so it's fast and
deterministic in CI.

## Deployment

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`):
every push to `main` that passes CI (`ci.yml`) deploys to Cloudflare Workers.
See [RUNBOOK.md](./RUNBOOK.md) for the required one-time secrets setup.

Self-hosting instead of Workers is also supported:

```bash
docker compose up --build
```

## Security & privacy

- The API is gated behind RapidAPI's proxy secret (`X-RapidAPI-Proxy-Secret`)
  so it can't be used for free by bypassing RapidAPI's billing.
- Request/response bodies are never logged — only method, path, status, and
  duration. Passwords and full card numbers never appear in logs.
- Password breach checks use the k-anonymity protocol: only a 5-character
  SHA-1 prefix is sent over the network, never the password or its full hash.
- No data is persisted anywhere (no database).

## License

Private/unpublished — all rights reserved by the project owner.
