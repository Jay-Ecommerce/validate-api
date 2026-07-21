// Rotating content pools for automated marketing scripts.
//
// This is deliberately template-based, not LLM-generated: the project has no
// paid LLM API budget, and template rotation is honest about what it is
// (predictable variety) rather than pretending to be organic AI writing.
// Selection is by ISO week number, so a given script always advances through
// its pool in order and wraps around, rather than repeating randomly.

export function isoWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export function pick(pool, offset = 0) {
  const idx = (isoWeekNumber() + offset) % pool.length;
  return pool[idx];
}

const RAPIDAPI_HOST = "rapidapi.com/jonashaemecommerce/api/validate7";
const GITHUB_URL = "https://github.com/Jay-Ecommerce/validate-api";
const QR_RAPIDAPI_HOST = "rapidapi.com/jonashaemecommerce/api/qr-api19";
const CURRENCY_RAPIDAPI_HOST = "rapidapi.com/jonashaemecommerce/api/currency-api15";

export const DEVTO_ARTICLES = [
  {
    title: "The IBAN mod-97 checksum, explained (and how to validate one in one line)",
    tags: ["webdev", "api", "tutorial", "javascript"],
    body: `Ever wondered how your bank instantly knows you fat-fingered an IBAN before it even checks if the account exists? It's a checksum: ISO 13616's mod-97 algorithm.

Here's the short version: move the first four characters to the end, convert letters to numbers (A=10, B=11...), then check if the resulting number mod 97 equals 1. That's it — no database lookup needed to catch most typos.

\`\`\`js
// simplified version of the check
function ibanChecksumValid(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => c.charCodeAt(0) - 55);
  let remainder = 0;
  for (const digit of numeric) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}
\`\`\`

Fine for a side project. Once you're validating IBANs from real users, you also want country-specific length checks, BBAN structure validation, and ideally a formatted, human-readable output — which is more code than you want to own for something this boilerplate.

If you'd rather not maintain that: [Validate](https://${RAPIDAPI_HOST}) is a small API I built that handles this (plus VAT/email/phone/credit-card format checks) as a single JSON call. Free tier is 100 requests/month, no card required. Same account also runs [QR API](https://${QR_RAPIDAPI_HOST}) (QR code generation) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}) (exchange rates) if useful.`,
  },
  {
    title: "Stop rolling your own password breach checker — here's how k-anonymity makes it safe",
    tags: ["security", "webdev", "api", "javascript"],
    body: `If you're checking user passwords against HaveIBeenPwned's breach database, please don't send the full password (or even the full hash) over the wire. Here's why, and the actual protocol that fixes it.

HIBP's Pwned Passwords API uses k-anonymity: you SHA-1 hash the password locally, send only the first 5 characters of the hash, and the API returns every suffix that starts with that prefix (usually 300-900 of them). You compare locally. The full password never leaves your server, and HIBP never sees enough to reconstruct it.

\`\`\`js
import { createHash } from "node:crypto";

async function isBreached(password) {
  const hash = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(\`https://api.pwnedpasswords.com/range/\${prefix}\`);
  const text = await res.text();
  return text.split("\\n").some(line => line.startsWith(suffix));
}
\`\`\`

That's genuinely all it takes — no library needed. I wrapped this (plus password strength scoring) into an endpoint on [Validate](https://${RAPIDAPI_HOST}) if you'd rather not maintain the hashing/comparison logic yourself, but honestly, the snippet above will get most people there. Sibling APIs on the same account: [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "Phone number validation is harder than you think (a libphonenumber crash course)",
    tags: ["webdev", "javascript", "api", "tutorial"],
    body: `A regex will not validate phone numbers correctly. I promise. Numbering plans vary by country, mobile vs landline prefixes differ, and some countries have variable-length numbers. Google's libphonenumber (the library that powers Android's dialer) is the only sane way to do this client- or server-side.

\`\`\`js
import parsePhoneNumberFromString from "libphonenumber-js";

const parsed = parsePhoneNumberFromString("+49 170 1234567");
console.log(parsed.isValid());          // true
console.log(parsed.country);            // "DE"
console.log(parsed.formatInternational()); // "+49 170 1234567"
\`\`\`

Two gotchas that catch people out: numbers without a country code need a \`defaultCountry\` hint or parsing will silently fail, and "valid" only means "matches the numbering plan" — it says nothing about whether the number is currently assigned to someone.

For a stateless HTTP version of this (useful if your stack isn't JS, or you don't want the dependency), I built it as one of the endpoints on [Validate](https://${RAPIDAPI_HOST}) — same libphonenumber-js under the hood, just over JSON. Same account also covers [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "EU VAT number validation: format check vs VIES lookup, and when you need which",
    tags: ["webdev", "api", "tutorial", "business"],
    body: `If you sell B2B in the EU, you'll eventually need to validate a customer's VAT number. There are two very different levels of "validation" here and it's worth knowing which one you actually need:

**Format validation** — does the string match the country's VAT number pattern (length, structure)? This catches typos instantly, works offline, and is free forever.

**VIES lookup** — is this VAT number actually registered with that EU country's tax authority right now? This requires a live call to the European Commission's VIES service, can be slow (VIES has outages more often than you'd like), and is the only way to know if the number is real vs just correctly-formatted.

For most signup flows, format validation is enough to catch mistakes, with an optional VIES check before you actually apply a reverse-charge VAT exemption (since that's the part with tax liability implications).

\`\`\`json
POST /v1/validate/vat
{ "countryCode": "IE", "vatNumber": "6388047V", "checkExistence": true }
\`\`\`

That's the shape I settled on for [Validate](https://${RAPIDAPI_HOST}) — format check always runs, VIES lookup is opt-in per request so you're not waiting on a flaky government API when you don't need to. Sibling APIs on the same account: [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "Entropy-based password strength scoring (and why 'has a symbol' rules are theater)",
    tags: ["security", "webdev", "javascript"],
    body: `"Must contain one uppercase, one number, one symbol" rules produce passwords like \`Password1!\` — technically compliant, trivially guessable. Entropy-based scoring is a better signal.

The idea: estimate the search space an attacker would need to brute-force, based on character variety and length, then flag patterns that reduce real entropy below what the raw math suggests (dictionary words, keyboard walks, repeated characters).

Rough approach:
\`\`\`js
function estimateEntropyBits(password) {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
  return Math.log2(poolSize) * password.length;
}
\`\`\`

That's the naive version — it overestimates for anything with patterns. A real implementation should also penalize repeated substrings and common dictionary words before trusting the raw bits figure.

I built a fuller version of this (plus the breach-check endpoint from k-anonymity) as part of [Validate](https://${RAPIDAPI_HOST}) if you want the batteries-included version. Same account also runs [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "Luhn's algorithm: the 70-year-old checksum still validating every card you own",
    tags: ["webdev", "javascript", "tutorial"],
    body: `Every credit card number has a built-in checksum digit, and the algorithm that checks it (Luhn's algorithm) predates modern computing — it was patented in 1954, before credit cards as we know them existed.

\`\`\`js
function luhnValid(number) {
  const digits = number.replace(/\\D/g, "").split("").reverse().map(Number);
  const sum = digits.reduce((acc, digit, i) => {
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    return acc + digit;
  }, 0);
  return sum % 10 === 0;
}
\`\`\`

This only checks that the number is *structurally* valid — it says nothing about whether the card exists, is active, or has funds. That's a completely separate (and much more sensitive) concern that needs a real payment processor, not a format checker.

Brand detection (Visa vs Mastercard vs Amex) is a second, separate step based on the IIN/BIN prefix ranges. I bundled both into one endpoint on [Validate](https://${RAPIDAPI_HOST}) since they're almost always needed together. Same account also runs [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "Why I put input validation behind an API instead of a shared npm package",
    tags: ["webdev", "api", "opinion"],
    body: `Most validation logic (IBAN, VAT, phone, email, credit card format) is language-agnostic — it's just string parsing and checksums. So why did I build it as an HTTP API instead of a JS library?

A few reasons that mattered to me:
- **Polyglot by default.** An HTTP API works from Python, Go, Ruby, whatever — a JS package only works in JS projects.
- **No dependency upgrades to babysit.** libphonenumber's metadata changes as countries update numbering plans; that's my problem to keep current, not every consumer's.
- **The VIES/MX-record/breach-check lookups need a server anyway.** Those aren't pure functions — they're network calls. Once you need a server for those, you may as well put the offline checks behind the same API for consistency.

The tradeoff is obviously latency — a network round-trip beats a local function call every time. For anything on a hot path doing thousands of validations per second, a local library is the right call. For "validate this form submission once," the API overhead is noise.

If you want to see the actual shape of it: [Validate on RapidAPI](https://${RAPIDAPI_HOST}) — free tier, no card required. Source structure is public too: ${GITHUB_URL}. Same account also runs [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "MX record checks: the cheap email validation step everyone skips",
    tags: ["webdev", "api", "tutorial"],
    body: `Regex-validating an email address only tells you the *syntax* is plausible. It says nothing about whether \`user@totallyfakedomain12345.com\` can receive mail. An MX record lookup closes that gap for basically zero extra latency.

\`\`\`js
import { resolveMx } from "node:dns/promises";

async function domainCanReceiveMail(domain) {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}
\`\`\`

This won't catch every typo (an MX record existing doesn't mean the specific mailbox exists — that needs an actual SMTP handshake, which is slow, unreliable, and often blocked by mail servers as spam-probing behavior). But it's a strong, cheap signal that catches a meaningful chunk of junk signups before you send a verification email into the void.

I run this as an optional flag on the email endpoint of [Validate](https://${RAPIDAPI_HOST}) — syntax check always runs, MX check is opt-in since it adds a DNS round-trip. Sibling APIs on the same account: [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "How to validate email addresses properly in 2026",
    tags: ["webdev", "api", "tutorial", "javascript"],
    body: `"Just use a regex" is the most common wrong answer to email validation. Here's what actually matters, in the order it actually matters.

**1. Syntax — but a permissive one.** The RFC 5322 spec technically allows things like quoted strings and comments in the local part, which almost no real mail provider uses. Don't implement the full spec; use a pragmatic check instead:

\`\`\`js
function looksLikeEmail(input) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input);
}
\`\`\`

This deliberately under-validates. A regex that's *too* strict will reject real addresses (plus-addressing, unusual-but-valid TLDs) more often than it catches typos — false rejections cost you signups, false acceptances just mean you fall through to the next check.

**2. MX record lookup.** Syntax passing doesn't mean the domain can receive mail:

\`\`\`js
import { resolveMx } from "node:dns/promises";

async function canReceiveMail(domain) {
  try {
    return (await resolveMx(domain)).length > 0;
  } catch {
    return false;
  }
}
\`\`\`

Catches typo'd domains (\`gmial.com\`) and abandoned/fake domains for basically zero added latency.

**3. Disposable/temp-mail detection.** Syntax-valid, MX-valid, and still worthless for your product: throwaway addresses from 10minutemail, guerrillamail, mailinator, and hundreds of similar services that spin up new domains constantly. There's no algorithmic tell — you need a maintained domain blocklist (the community-run [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) list is a solid free start, just budget time to keep it synced).

**4. What you're deliberately *not* doing:** an SMTP handshake to check if the specific mailbox exists. It's slow, unreliable, and most mail servers now treat probing behavior as spam reconnaissance and silently no-op it. Don't build on a foundation that stopped being reliable.

Put together, that's syntax (fast, always run) → MX (cheap, catches typos) → disposable-domain check (catches throwaway signups) — each step only worth running if the previous one passed. I built exactly this pipeline as endpoints on [Validate](https://${RAPIDAPI_HOST}) if you'd rather not maintain the MX/disposable-list plumbing yourself. Same account also runs [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "IBAN validation guide for developers",
    tags: ["webdev", "api", "tutorial", "banking"],
    body: `IBAN validation trips people up because it looks like it should be a length check plus a regex, and it's neither. Here's the actual structure, in the order you should check it.

**1. Length and country format.** Every IBAN starts with a 2-letter ISO country code and 2 check digits, followed by a country-specific BBAN whose length is fixed *per country* — Germany is always 22 characters, the Netherlands 18, Malta 31. A string can be the right shape (letters-then-digits) and still be the wrong length for the country it claims to be from.

**2. The mod-97 checksum (ISO 7064).** This is the part people get wrong or skip:

\`\`\`js
function isValidIBAN(iban) {
  const clean = iban.replace(/\\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\\d{2}[A-Z0-9]+$/.test(clean)) return false;

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());

  // IBANs convert to numbers far too large for JS's Number type (30+ digits),
  // so mod 97 has to be computed in chunks rather than in one BigInt/Number op.
  let remainder = numeric;
  while (remainder.length > 2) {
    const chunk = remainder.slice(0, 9);
    remainder = (parseInt(chunk, 10) % 97) + remainder.slice(chunk.length);
  }
  return parseInt(remainder, 10) % 97 === 1;
}
\`\`\`

Move the first 4 characters to the end, convert every letter to its numeric value (A=10 ... Z=35), and the resulting number mod 97 must equal 1. The chunked-modulo loop is the detail that trips up most from-scratch implementations — you can't just do \`BigInt(numeric) % 97n\` in older runtimes without a BigInt polyfill, and plain \`Number\` silently loses precision past 2^53.

**3. What this does *not* tell you.** A passing checksum means the IBAN is well-formed — not that the account exists, is open, or belongs to who the payer thinks it does. Confirming that needs a live lookup against the bank (or a service like the account-name-matching checks banks now run for fraud prevention), which is a separate, heavier operation than format validation.

For most apps — checkout forms, payout setup, onboarding — steps 1 and 2 are exactly the right amount of validation: fast, no external calls, no third-party uptime dependency. I wrapped both (plus the per-country BBAN structure check) into an endpoint on [Validate](https://${RAPIDAPI_HOST}) if you'd rather not own the mod-97 edge cases yourself. Sibling APIs on the same account: [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "Stop using regex for phone validation - use this instead",
    tags: ["webdev", "api", "javascript", "tutorial"],
    body: `A regex for "valid phone number" is a trap. International phone numbering isn't regular: number length, valid area codes, and mobile-vs-landline prefixes differ per country and change over time as ranges get reassigned. A regex that's correct today starts silently misclassifying numbers months later, and you won't notice until a support ticket comes in.

The actual fix is using the numbering-plan data Google publishes and maintains for Android/Chrome: [libphonenumber](https://github.com/google/libphonenumber), or its much smaller JS port [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js).

\`\`\`js
import { parsePhoneNumberFromString } from "libphonenumber-js";

const phone = parsePhoneNumberFromString("+49 30 1234567");
phone?.isValid();              // true — checks length + pattern for that country
phone?.country;                // "DE"
phone?.getType();               // "FIXED_LINE" | "MOBILE" | undefined (not always determinable)
phone?.formatInternational();   // "+49 30 1234567", normalized
\`\`\`

Two things regex can't give you that this does for free:

- **Country-aware validity.** "Valid length" isn't one number — it varies by country and sometimes by number type within a country. The library knows the real ranges, and gets updated when they change.
- **Normalization.** Users type phone numbers a dozen different ways (spaces, dashes, parens, with or without country code). \`formatInternational()\` gives you one canonical form to store and compare against, instead of writing your own normalization pass.

One gotcha: without a country hint, a local-format number is ambiguous. \`030 1234567\` is valid in Germany and might also just be a truncated something-else from another country. If your form is scoped to one country, pass it as the default country rather than relying purely on a \`+\` prefix being present.

If your backend isn't JS (or you don't want the dependency in a small service), I wrapped libphonenumber-js as a hosted endpoint on [Validate](https://${RAPIDAPI_HOST}) — same validation logic, plain JSON in and out. Same account also runs [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "How to generate QR codes for free with an API",
    tags: ["webdev", "api", "tutorial", "javascript"],
    body: `Generating a QR code server-side usually means pulling in a heavyweight image library, or shelling out to a third-party service that watermarks the output or rate-limits you into a paid plan. Here's the simplest version that actually works in production.

The core idea: a QR code is just a grid of black/white modules encoding your data with Reed-Solomon error correction, then rendered as an image. You don't need to implement the encoding yourself — you need an endpoint that returns either a ready-to-embed SVG or the raw module matrix if you want to render it yourself (canvas, terminal, whatever):

\`\`\`bash
curl "https://qr-api.p.rapidapi.com/v1/qr?data=https://example.com&ecc=M&cellSize=8" \\
  -H "X-RapidAPI-Key: <your-key>" \\
  -H "X-RapidAPI-Host: qr-api.p.rapidapi.com" \\
  --output qr.svg
\`\`\`

That's an SVG you can embed directly with an \`<img>\` tag or inline it for crisp scaling at any size — no rasterization artifacts. A few things worth knowing before you ship this:

- **Error correction level matters more than people think.** \`H\` (30% recovery) survives a logo overlay or a slightly damaged print; \`L\` (7%) is fine for a clean digital display. Don't default to the highest level everywhere — it makes the code visually denser for no benefit if nothing's ever going to obscure it.
- **Cap your input length.** QR codes get exponentially denser as the encoded string grows. If you're encoding a URL, shorten it first; don't just dump JSON payloads into a QR code and expect a scannable result.
- **SVG over PNG when you can.** Vector output means no blurring when someone screenshots and enlarges it, which happens more than you'd expect with QR codes.

I built [QR API](https://${QR_RAPIDAPI_HOST}) as a free-to-start, stateless endpoint for exactly this — no data logged, no watermark, SVG or raw matrix output. Same provider also runs [Validate](https://${RAPIDAPI_HOST}) (IBAN/email/phone/etc. validation) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}) (exchange rates) if you need those too.`,
  },
  {
    title: "Real-time currency conversion API - no signup required",
    tags: ["webdev", "api", "tutorial", "finance"],
    body: `Most currency-conversion APIs make you register for a separate vendor account, verify an email, and sometimes wait for manual approval before you get a key — for something that should be a two-line integration. Here's a route that skips the vendor-specific signup entirely.

RapidAPI's marketplace lets you subscribe with the RapidAPI key you already have (or create once, for free) rather than a new account per data provider. For [Currency API](https://${CURRENCY_RAPIDAPI_HOST}), that means:

\`\`\`bash
curl "https://currency-api.p.rapidapi.com/v1/convert?from=EUR&to=USD&amount=100" \\
  -H "X-RapidAPI-Key: <your-rapidapi-key>" \\
  -H "X-RapidAPI-Host: currency-api.p.rapidapi.com"
\`\`\`

\`\`\`json
{"from":"EUR","to":"USD","amount":100,"rate":1.0821,"result":108.21,"date":"2026-07-11"}
\`\`\`

One RapidAPI key, and you're subscribed to every API on the platform you want to try — including this one, [Validate](https://${RAPIDAPI_HOST}) for input validation, and [QR API](https://${QR_RAPIDAPI_HOST}) for QR generation.

A couple of implementation details worth knowing if you're building this into a checkout or pricing display:

- **Rates come from the European Central Bank** (via Frankfurter, a free keyless proxy over ECB reference rates), updated once per ECB business day — not a live tick-by-tick feed. Fine for pricing pages and invoicing; not a substitute for a trading-grade feed if you're doing FX execution.
- **Fail loud, not silent.** If the upstream rate source is unreachable, the API returns a clean \`502\` instead of quietly serving a stale cached rate. For anything touching money, knowing the number is wrong beats not knowing it's stale.
- **\`/v1/rates\` vs \`/v1/convert\`** — pull the whole rate table once per base currency if you're converting to several currencies at once (one call, cache it client-side for the day), and use \`/v1/convert\` for one-off single conversions.

Free tier is 500,000 requests/month, no card required to start.`,
  },
  {
    title: "Why your regex for IBAN validation is probably wrong",
    tags: ["webdev", "javascript", "banking", "tutorial"],
    body: `A regex like \`/^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$/\` will pass through plenty of IBANs that are complete garbage. It checks the shape — two letters, two digits, then alphanumerics — but shape isn't validity, and this is the mistake nearly every from-scratch IBAN validator makes.

Here's what a shape-only regex misses, in order of how often it bites people:

**1. Country-specific length.** IBAN length isn't a range, it's a fixed number per country: Germany is always 22 characters, the Netherlands 18, Malta 31. A regex with \`{11,30}\` for the BBAN portion accepts a "German" IBAN that's the wrong length for Germany, because it's only checking the global range across *all* countries, not the specific one this IBAN claims to be from.

**2. The checksum.** This is the part a regex structurally cannot do — regular expressions can't compute a mod-97 checksum, because that requires arithmetic over the whole string, not pattern matching. Every IBAN has two check digits (positions 3-4) that are the result of ISO 7064's mod-97-10 algorithm applied to the rearranged, letter-to-number-converted account number. A regex will happily accept an IBAN with those two digits set to anything:

\`\`\`js
function isValidIBAN(iban) {
  const clean = iban.replace(/\\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\\d{2}[A-Z0-9]+$/.test(clean)) return false; // shape check — necessary but nowhere near sufficient

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());

  let remainder = numeric;
  while (remainder.length > 2) {
    const chunk = remainder.slice(0, 9);
    remainder = (parseInt(chunk, 10) % 97) + remainder.slice(chunk.length);
  }
  return parseInt(remainder, 10) % 97 === 1;
}
\`\`\`

Note the chunked-modulo loop — IBANs convert to numbers with 30+ digits, well past what JS's \`Number\` type can hold precisely, so you can't just do \`bigNumber % 97\` in one step without either a BigInt polyfill or this kind of iterative reduction.

**3. Per-country BBAN structure.** Beyond length, each country also defines which positions must be digits vs letters within the BBAN. A regex checking "alphanumeric" for the whole remainder will accept a UK IBAN with digits where the bank code letters should be.

None of this means "validate against a live bank lookup" — that's a different, heavier problem (does the account exist right now), and format validation deliberately doesn't answer it. It means: regex for shape, then the real mod-97 checksum, then country-specific length/structure — in that order, each one catching what the previous step can't.

I wrapped all three checks into one endpoint on [Validate](https://${RAPIDAPI_HOST}) if you'd rather not own the mod-97 edge cases and the per-country BBAN table yourself. Same account also covers [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}) if useful.`,
  },
  {
    title: "The complete guide to disposable email detection",
    tags: ["webdev", "security", "api", "tutorial"],
    body: `Syntax-valid, MX-record-valid, and still worthless for your product: that's a disposable email address from 10minutemail, guerrillamail, mailinator, or one of several hundred similar throwaway-inbox services. If you're not filtering these, a meaningful slice of your "verified" signups are addresses nobody will ever check twice.

Here's why this is a genuinely different problem from syntax or MX validation, and how to actually solve it.

**Why there's no algorithmic tell.** A disposable-mail domain looks completely normal — valid syntax, real MX records, sometimes even a legitimate-looking domain name. There's no structural pattern that distinguishes \`mailinator.com\` from \`gmail.com\` at the protocol level. The only reliable signal is a maintained list of known disposable domains, checked against the domain part of the address:

\`\`\`js
function isDisposable(email, disposableDomainSet) {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomainSet.has(domain);
}
\`\`\`

**The catch: the list has to stay current.** New disposable-mail domains spin up constantly — some services rotate domains specifically to dodge blocklists. A list you snapshot once and never update degrades within weeks. The community-run [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) project is a solid free starting point and is actively maintained, but you need a process to re-sync it, not a one-time import.

**Where this fits in the validation pipeline.** Order matters, because each check is progressively more expensive and should only run if the previous one passed:

1. **Syntax** — near-instant, always run
2. **MX record lookup** — one DNS call, catches typo'd/dead domains
3. **Disposable-domain check** — a set lookup against your list, catches throwaway-but-technically-valid addresses

Running them in that order means you only pay for the disposable-domain check on addresses that already passed the cheaper filters — no wasted work on obviously broken input.

**What it doesn't catch:** a user who signs up with a real Gmail address they simply never check again. Disposable-domain detection targets *services designed for throwaway use*, not general inbox abandonment — that's a retention problem, not a validation one.

I run this exact pipeline (syntax → MX → disposable-domain, each opt-in past the first) as an endpoint on [Validate](https://${RAPIDAPI_HOST}) with a synced domain list, if you'd rather not own the re-sync process yourself. Sibling APIs on the same account: [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
  {
    title: "Validating a CSV of 500 emails or IBANs? Stop doing it one HTTP call at a time",
    tags: ["webdev", "api", "tutorial", "javascript"],
    body: `Cleaning a signup list or a vendor-payout CSV against a single-item validation endpoint means one HTTP round-trip per row — 500 rows means 500 requests, most of which burn through a rate limit before you're a quarter of the way through the file.

The fix isn't a faster loop, it's an endpoint that accepts the whole array and validates it server-side in one call:

\`\`\`bash
curl -X POST https://validate-api.p.rapidapi.com/v1/batch/iban \\
  -H "X-RapidAPI-Key: <your-key>" \\
  -H "X-RapidAPI-Host: validate-api.p.rapidapi.com" \\
  -H "Content-Type: application/json" \\
  -d '{"ibans": ["DE89370400440532013000", "not-an-iban", "FR1420041010050500013M02606"]}'
\`\`\`

\`\`\`json
{"count": 3, "results": [
  {"input": "DE89370400440532013000", "valid": true, "countryCode": "DE", "errors": []},
  {"input": "not-an-iban", "valid": false, "countryCode": null, "errors": ["IBAN contains invalid characters"]},
  {"input": "FR1420041010050500013M02606", "valid": true, "countryCode": "FR", "errors": []}
]}
\`\`\`

Same checksum logic as the single-item endpoint, just run once per array item instead of once per request — order-preserving output, so row *n* in the response always maps to row *n* in your input.

One design choice worth calling out if you're building something similar: batch email validation defaults MX-record checking to **off**, unlike the single-item endpoint. A batch of 50 emails with MX checking on means 50 DNS lookups fired from one request — fine occasionally, not something you want as the default for a bulk endpoint. Opt in explicitly (\`checkMx: true\`) when you actually need it.

I added \`/v1/batch/iban\` (up to 100 items) and \`/v1/batch/email\` (up to 50 items) to [Validate](https://${RAPIDAPI_HOST}) for exactly this list-cleaning use case — same free tier, no separate pricing for batch. Sibling APIs on the same account: [QR API](https://${QR_RAPIDAPI_HOST}) and [Currency API](https://${CURRENCY_RAPIDAPI_HOST}).`,
  },
];

const LINKEDIN_HASHTAGS = `#API #Developer #Webdev #SideProject`;

// One post per entry, deliberately alternating which of the 3 products it's
// about (Validate / QR API / Currency API) so the day-of-year-offset rotation
// in linkedin-post.mjs naturally cycles through all three over a few weeks
// instead of one product dominating. Every post links its own product's
// RapidAPI listing and ends in the same hashtag block for a consistent,
// recognizable company-page voice.
export const LINKEDIN_POSTS = [
  `Small thing I learned building a validation API: IBAN checksums (ISO 13616 mod-97) catch most typos with zero database lookups. No need to hit a bank API just to know a user fat-fingered a digit. Format validation and existence validation are different problems — solve the cheap one first.

Validate (IBAN/VAT/email/phone/card/password checks) on RapidAPI: https://${RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Generating QR codes server-side usually means pulling in a heavyweight image library. A QR code is really just a grid of black/white modules with Reed-Solomon error correction baked in — an SVG response is all you need, and it stays crisp at any zoom or print size, unlike a rasterized PNG.

QR API (SVG or raw module-matrix output, free to start) on RapidAPI: https://${QR_RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Most currency-conversion needs in a typical app — pricing pages, invoicing, a rough converted total — don't need a live tick-by-tick FX feed. ECB reference rates (published once per business day) are free, stable, and honest about their own freshness, which matters more than people think for anything touching money.

Currency API (ECB rates via a free keyless proxy) on RapidAPI: https://${CURRENCY_RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `If you're checking passwords against breach databases, make sure you're using k-anonymity (HaveIBeenPwned's Pwned Passwords protocol) — you only ever send a 5-character hash prefix, never the password or full hash. Privacy-preserving security check, and it's genuinely simple to implement.

Wrapped this into Validate on RapidAPI: https://${RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `QR codes don't degrade gracefully as you stuff more data into them — they hit a capacity ceiling and the module grid gets denser the closer you get to it. Past a certain point you're not looking at a code you can scan from arm's length anymore. The fix is almost always encoding a short pointer (shortened URL, ID) instead of raw data.

QR API caps input length for exactly this reason: https://${QR_RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `A tempting shortcut when a currency API's rate source is unreachable: serve the last cached rate and let the request succeed anyway. For anything touching money, that's the wrong default — a stale rate returns 200 and looks identical to a correct one. An honest 502 beats a wrong-but-confident number every time.

That's the principle Currency API is built on: https://${CURRENCY_RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Underrated fact: phone number validation cannot be done correctly with regex. Numbering plans differ by country, and libphonenumber (Google's library, powers Android) is really the only correct way to do this. Learned this the hard way building an API around it.

That's what powers the phone endpoint on Validate: https://${RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Building a small stateless suite of developer APIs on Cloudflare Workers has been a good lesson in "no database" as a design choice, not just a cost-saver — every endpoint is a pure function or a single outbound call, so it scales horizontally for free and there's no session state to ever get out of sync.

Validate, QR API, and Currency API — all free to start on RapidAPI: https://${RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Reminder that Luhn's checksum algorithm — the thing validating every credit card number's format — was patented in 1954. It only checks structural validity, nothing about whether the card is real or funded. Format validation and payment processing are very different layers, and conflating them is an easy mistake.

Card format + brand detection is one endpoint on Validate: https://${RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Branded QR codes without touching a design tool: most "just generate a QR code" APIs don't expose color at all, which pushes recoloring into a manual post-processing step. Foreground/background as plain hex query params turns that into a one-line request instead.

QR API supports that out of the box: https://${QR_RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Not every currency has 2 decimal places — JPY has zero, KWD has three. A hardcoded "always format to 2 decimals" assumption silently mangles both. Small edge case, real bug the first time a Japanese or Kuwaiti amount hits your checkout flow.

Currency API's /v1/currencies always reflects the actual current supported set: https://${CURRENCY_RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
  `Entropy-based password strength scoring beats "must contain a symbol" rules every time. The composition-rule approach produces things like Password1! — technically compliant, trivially guessable. Estimating actual search space is a much better signal, and it's not hard to build.

That scoring plus breach-checking lives on Validate: https://${RAPIDAPI_HOST}

${LINKEDIN_HASHTAGS}`,
];

export const REDDIT_STYLES = ["tutorial", "question", "case-study", "tip"];

export const REDDIT_SUBREDDITS = ["webdev", "programming", "SideProject", "APIs"];

const REDDIT_TEMPLATES = {
  tutorial: [
    {
      title: "IBAN validation explained: the mod-97 checksum in about 10 lines of JS",
      body: `Was explaining this to a junior dev on my team recently and figured it's worth writing up. IBANs have a built-in checksum (ISO 13616, mod-97) so you can catch most typos without ever calling a bank API:

\`\`\`js
function ibanChecksumValid(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => c.charCodeAt(0) - 55);
  let remainder = 0;
  for (const digit of numeric) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}
\`\`\`

Move the first 4 chars to the end, convert letters to numbers (A=10...Z=35), mod 97 the whole thing, check if it's 1. That's it. Doesn't tell you the account exists, just that the number is internally consistent.`,
    },
  ],
  question: [
    {
      title: "How are you all handling EU VAT number validation — format-only or live VIES checks?",
      body: `Curious what people's setups look like here. VIES (the EU's VAT lookup service) is notoriously flaky and slow, so I've been wondering if most people just do format validation and skip the existence check unless it's actually needed (e.g. right before applying a reverse-charge exemption).

Anyone doing something smarter, like caching VIES results or falling back gracefully when it's down?`,
    },
    {
      title: "What's your approach to phone number validation — regex, libphonenumber, or something else?",
      body: `Every time I think a regex will handle phone validation, I get reminded that numbering plans vary wildly by country and it falls apart. Ended up standardizing on libphonenumber-js. Curious if anyone's found a lighter-weight approach that's still actually correct, or if this is just one of those "there's no shortcut" problems.`,
    },
  ],
  "case-study": [
    {
      title: "Built a stateless validation API on Cloudflare Workers — some notes on what worked",
      body: `Been running a small validation API (IBAN/VAT/phone/email/credit-card format checks, password strength/breach checks) on Cloudflare Workers for a bit now. A few things that worked out well:

- No database at all — every endpoint is a pure function or a single outbound call (VIES, DNS, HaveIBeenPwned), so it scales horizontally for free
- k-anonymity for the breach-check endpoint so passwords never leave the request in a reversible form
- Graceful degradation — if VIES or DNS is unreachable, the endpoint still returns the offline format-validation result instead of failing the whole request

Happy to go into more detail on any part of this if useful to anyone building something similar.`,
    },
  ],
  tip: [
    {
      title: "TIL: HaveIBeenPwned's breach-check API uses k-anonymity so you never send full password hashes",
      body: `Small thing that I think doesn't get enough attention: you SHA-1 hash the password locally, send only the first 5 hex characters of the hash, and the API returns every suffix starting with that prefix (a few hundred, typically). You compare locally. Full password and full hash never leave your server.

Genuinely simple to implement yourself in a few lines if you don't want a dependency for it — happy to share the snippet if anyone wants it.`,
    },
    {
      title: "TIL Luhn's checksum algorithm (validates every card number's format) is from 1954",
      body: `Predates modern credit cards as we know them. It only checks structural validity — nothing about whether a card is real, active, or funded, that's a completely separate and much more sensitive concern. Always found it neat that such an old, simple algorithm is still doing this exact job on every checkout page today.`,
    },
  ],
};

export function pickRedditDraft(subreddit, weekOffset = 0) {
  const style = pick(REDDIT_STYLES, weekOffset);
  const pool = REDDIT_TEMPLATES[style];
  const template = pool[isoWeekNumber() % pool.length];
  return { subreddit, style, ...template };
}
