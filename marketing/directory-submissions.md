# API directory submissions

Status of each directory you listed:

## public-apis/public-apis (GitHub)

**Done (2026-07-08):** opened as PR #6518 — https://github.com/public-apis/public-apis/pull/6518
— added under the existing "Data Validation" category, inserted in the
correct alphabetical position relative to its neighbor. Note: that category
had a pre-existing alphabetical-order violation unrelated to this change
(VATlayer listed before Lob.com) — if their CI flags order, it's likely
that pre-existing issue, not the new entry. Watch the PR for review comments.

## APIs.guru (APIs-guru/openapi-directory)

Also PR-based, but their contribution process expects the OpenAPI spec
reformatted to their exact schema (specific `x-providerName`, `x-logo`,
`x-origin` metadata fields) and passing their own validator script before a
PR will be accepted. `openapi.yaml` in this repo isn't in that shape yet —
needs adaptation, not a blind copy. Flagging as a follow-up task rather than
guessing at their schema and shipping a PR likely to fail their CI.

## APIList.fun

No public submission API found — appears to be a manual web-form submission.
Not automatable; would need to be done by hand if you want to pursue it.

## RapidAPI Collections

Not a separate directory — this is a curation feature inside your existing
RapidAPI provider dashboard for the account already used to list validate-api.
Requires being logged into that dashboard; see the RapidAPI section of the
final report for the exact manual steps.

## Postman API Network

Requires its own free Postman account + publishing a Postman Collection —
account creation, so left for you to do (2026-07-08). Steps: create a
Postman account, import `openapi.yaml`, publish the resulting collection to
the Postman API Network from your workspace settings.

## "Mashape"

Mashape was RapidAPI's old name before a 2017 rebrand — this is the same
marketplace validate-api is already listed on, not a separate directory.
Nothing additional to do here.

## "any.run"

This is a malware-analysis sandbox, not an API directory — likely a mix-up
in the original request. Skipped; let me know if a different site was meant.

---

## BetaList, SaaSHub, AlternativeTo — ready-to-paste listing copy

Added 2026-07-12, covering all three live APIs. Honest framing up front:
**these are slow-burn, low-effort-per-signup channels, not high-leverage.**
Directory listings mostly drive long-tail SEO backlinks and the occasional
curious browser, not a launch spike — worth doing because each one is a
few minutes of copy-paste once an account exists, not because it'll move
the revenue needle on its own. Do them once, don't treat as a recurring
task.

Each site requires a free account first (account creation not done here,
per project policy):

- **BetaList** — [betalist.com](https://betalist.com) — create a free
  account, submit via their "Submit a startup" form. Submissions are
  reviewed manually by BetaList's team before publishing, which can take
  **days to weeks**, and they skew toward pre-launch/early-stage products
  with a landing page, not API infrastructure specifically — acceptance
  isn't guaranteed. Submit once per API (three separate submissions), not
  in the same week, so they don't look like a batch from one account.
- **SaaSHub** — [saashub.com](https://saashub.com) — create a free
  account, then self-serve "Add a service" — no manual review gate,
  listing appears quickly. SaaSHub's structure leans on "alternative to"
  relationships too, so fill in the "Alternatives" field alongside the
  base listing where prompted.
- **AlternativeTo** — [alternativeto.net](https://alternativeto.net) —
  create a free account, then add each API as a new item **or**, often
  more effective for discovery, add it as a listed *alternative* under an
  existing, already-popular tool's page (community-edited, so this is
  normal practice, not gaming the system — just be accurate about what it's
  actually an alternative to). For Validate API, good target pages to add
  it under: AbstractAPI, Mailgun's email-validation tooling, or similar
  validation/verification tools. For QR API, target existing QR-code
  generator listings (e.g. QR Code Generator, QRCode Monkey, goQR.me). For
  Currency API, target existing exchange-rate/currency-conversion tools
  and libraries (e.g. Open Exchange Rates, Fixer, ExchangeRate-API).

### Validate API

**Name:** Validate API
**Tagline (one line):** Stateless API for IBAN, VAT, email, phone, credit
card, and password validation.
**Description (longer):** Validate API is a stateless HTTP API that
handles the input-validation checks every backend re-implements: IBAN
(mod-97 checksum + per-country BBAN structure), EU VAT (format check +
optional live VIES registry lookup), email (syntax, MX record, and
disposable/temp-mail domain detection), phone number format
(libphonenumber-based), credit card format (Luhn + brand detection),
postal code format for 50+ countries, and password strength scoring plus
breach checks via HaveIBeenPwned's k-anonymity protocol (only a 5-character
hash prefix ever leaves your server). No database, deployed at Cloudflare's
edge for low latency globally. Free tier available, no card required to
start; Pro and Ultra paid tiers for higher volume.
**Category / tags:** Developer Tools, API, Data Validation, Security,
Fintech
**URL:** https://rapidapi.com/jonashaemecommerce/api/validate7 (listing) /
https://validate-api.jay-trading.workers.dev (docs/landing)

### QR API

**Name:** QR API
**Tagline (one line):** Stateless QR code generation API — SVG or raw
matrix output, no watermark.
**Description (longer):** QR API generates QR codes over a simple HTTP
call, returning either a ready-to-embed SVG or the raw boolean module
matrix as JSON for callers who want to render it themselves. Supports
configurable error-correction level (L/M/Q/H), custom colors, and cell
size. No database, no session state, deployed on Cloudflare Workers for
fast global response times, no watermark on output. Free tier available,
no card required to start; Pro and Ultra paid tiers for higher volume.
**Category / tags:** Developer Tools, API, Utilities, Image Generation
**URL:** https://rapidapi.com/jonashaemecommerce/api/qr-api19 (listing) /
https://qr-api.jay-trading.workers.dev (docs/landing)

### Currency API

**Name:** Currency API
**Tagline (one line):** Real-time currency conversion and exchange rates,
sourced from the European Central Bank.
**Description (longer):** Currency API provides currency conversion and
exchange-rate lookups over a simple HTTP call, with rates sourced from the
European Central Bank (via Frankfurter, a free keyless proxy over ECB
reference rates), updated once per ECB business day. Endpoints for
single-pair conversion and full rate tables per base currency. Fails loud
(a clean error) rather than silently serving stale cached rates if the
upstream source is unreachable — important for anything touching money.
No database, deployed on Cloudflare Workers. Free tier is 500,000
requests/month, no card required to start; Pro and Ultra paid tiers for
higher volume.
**Category / tags:** Developer Tools, API, Fintech, Finance, Currency
**URL:** https://rapidapi.com/jonashaemecommerce/api/currency-api15
(listing) / https://currency-api.jay-trading.workers.dev (docs/landing)
