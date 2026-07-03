# Decisions

Chronological log of the choices made while building this project, and why.
Newest at the bottom.

## 1. Business model: Micro-SaaS API on RapidAPI

**Options considered:** SEO niche site + affiliate links, KI digital downloads
on Gumroad, Micro-SaaS API, browser tool with premium features, newsletter
with sponsorship.

**Chosen:** Micro-SaaS API distributed via the RapidAPI marketplace.

**Why:** Every other option needs an audience or traffic before it earns
anything (SEO takes months; a newsletter needs subscribers; a marketplace
listing on Gumroad/Etsy still needs discovery). An API on RapidAPI is
discoverable through RapidAPI's own marketplace search/categories from day
one, and RapidAPI — not this project — owns billing, metering, quota
enforcement, and payout. That removes the single biggest blocker to a
fully-autonomous system: no Stripe integration, no invoicing code, no tax
handling to build. The tradeoff is a revenue share and dependency on RapidAPI
as a distribution channel — acceptable for a first iteration; nothing here
prevents adding direct billing later if it outgrows the marketplace.

## 2. Product: a validation/utility toolkit, not a single-purpose API

**Options considered:** public holidays API, QR/barcode generator, single
IBAN validator, broad "everything" toolkit.

**Chosen:** A focused cluster of related validators (IBAN, VAT, email, phone,
credit card) plus password tooling (strength, breach-check) and generators
(UUID, random password).

**Why:** "Form/input validation for SaaS backends" is a coherent, recognizable
category with real recurring demand (every app with a signup form, checkout,
or B2B invoicing needs some subset of this) and near-zero marginal cost per
endpoint once the pattern is established. A single-purpose API (e.g. just
public holidays) has a lower ceiling and more direct competition from
long-established listings. Going fully general-purpose ("do everything")
would dilute the marketplace listing's positioning and searchability.

## 3. Runtime: Cloudflare Workers, not a traditional server

**Why:** Free tier (100k requests/day, no credit card) with global edge
distribution and zero idle cost — a traditional always-on VPS would cost
money from day one regardless of traffic, which conflicts with the "start at
€0" constraint. Every endpoint is stateless, so Workers' request-scoped
execution model is a natural fit; there's no session state or database that
would need Workers KV/D1.

**Tradeoff accepted:** Workers has no native `dns.resolve()` or long-lived
TCP sockets, which shaped a few implementation choices (see #5, #6 below).
`src/server.ts` exists as an escape hatch if the project ever needs to move
off Workers (e.g. after outgrowing the free tier).

## 4. Framework: Hono

**Why:** Runs unmodified on Cloudflare Workers, Node, Deno, and Bun — this
directly enables the Node fallback runtime (`src/server.ts`) sharing 100% of
the route/middleware code with the Workers deployment, so there is exactly
one codebase to maintain regardless of hosting decision.

## 5. VAT existence check via VIES REST API, not a scraped/paid source

**Why:** VIES (`ec.europa.eu/taxation_customs/vies/rest-api`) is the European
Commission's own official service, purpose-built for exactly this kind of
third-party validation, free, keyless, and within its documented ToS. Using
it avoids any legal/ethical grey area that scraping a commercial VAT database
would introduce, at zero cost.

**Known limitation documented in code and API responses:** VIES has
per-member-state downtime. The API always returns local format validation
(`formatValid`) even when the live existence check fails, and marks
`existence.checked: false` rather than silently reporting `false` as if the
VAT number were invalid.

## 6. Email MX lookup via Cloudflare DNS-over-HTTPS

**Why:** Workers has no native DNS resolver API. Cloudflare's own
`cloudflare-dns.com/dns-query` endpoint is free, keyless, and — since the
Worker itself runs on Cloudflare's network — architecturally the most natural
choice (same operator, well-documented, generous rate limits).

## 7. Password breach-check: HIBP k-anonymity, never the full password

**Why:** HaveIBeenPwned's Pwned Passwords API explicitly documents the
k-anonymity pattern (send only the first 5 hex chars of the SHA-1 hash,
receive all matching suffixes, compare locally) as the intended integration
method for third parties — it exists so services like this one don't have to
transmit real passwords anywhere. `checkPasswordBreach` in
`src/lib/password.ts` hashes locally via Web Crypto and only ever sends the
5-character prefix; this is asserted by a dedicated test
(`test/password.test.ts` → "never sends the full password").

## 8. RapidAPI proxy-secret gate instead of a custom API-key system

**Why:** Building and maintaining a custom API-key issuance/rotation/billing
system duplicates what RapidAPI already provides as part of the marketplace
listing. `src/middleware/auth.ts` simply verifies RapidAPI's own
`X-RapidAPI-Proxy-Secret` header, so all customer-facing key management,
plan tiers, and quota enforcement live in RapidAPI's dashboard — one less
system to build, test, and secure.

## 9. Defense-in-depth local rate limiting despite RapidAPI's own quotas

**Why:** RapidAPI enforces plan-level quotas, but that's a billing control,
not a guard against a single misbehaving client hammering one Worker isolate
(e.g. a runaway retry loop). `src/middleware/rateLimit.ts` adds a cheap,
best-effort per-identity window as a second layer. It is explicitly
documented as non-global (each Workers isolate has its own in-memory map) —
correctness for billing/quota purposes is intentionally left to RapidAPI.

## 10. Structured JSON logging, request/response bodies never logged

**Why:** Several endpoints handle passwords, full card numbers, IBANs, and
VAT registrant names/addresses — real PII/secrets. `src/middleware/logger.ts`
logs only method, path, status, duration, and a generated request ID, so logs
are safe to retain and inspect without becoming a compliance liability.

## 11. Deployment target left as a placeholder in openapi.yaml

**Why:** The Workers subdomain (`<name>.<subdomain>.workers.dev`) is only
assigned on first `wrangler deploy`, which requires a Cloudflare account that
doesn't exist yet at the time this spec was written. See RUNBOOK.md step 2.
