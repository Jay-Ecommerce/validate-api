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

const RAPIDAPI_HOST = "validate7.p.rapidapi.com";
const GITHUB_URL = "https://github.com/Jay-Ecommerce/validate-api";

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

If you'd rather not maintain that: [Validate](https://${RAPIDAPI_HOST}) is a small API I built that handles this (plus VAT/email/phone/credit-card format checks) as a single JSON call. Free tier is 100 requests/month, no card required.`,
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

That's genuinely all it takes — no library needed. I wrapped this (plus password strength scoring) into an endpoint on [Validate](https://${RAPIDAPI_HOST}) if you'd rather not maintain the hashing/comparison logic yourself, but honestly, the snippet above will get most people there.`,
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

For a stateless HTTP version of this (useful if your stack isn't JS, or you don't want the dependency), I built it as one of the endpoints on [Validate](https://${RAPIDAPI_HOST}) — same libphonenumber-js under the hood, just over JSON.`,
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

That's the shape I settled on for [Validate](https://${RAPIDAPI_HOST}) — format check always runs, VIES lookup is opt-in per request so you're not waiting on a flaky government API when you don't need to.`,
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

I built a fuller version of this (plus the breach-check endpoint from k-anonymity) as part of [Validate](https://${RAPIDAPI_HOST}) if you want the batteries-included version.`,
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

Brand detection (Visa vs Mastercard vs Amex) is a second, separate step based on the IIN/BIN prefix ranges. I bundled both into one endpoint on [Validate](https://${RAPIDAPI_HOST}) since they're almost always needed together.`,
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

If you want to see the actual shape of it: [Validate on RapidAPI](https://${RAPIDAPI_HOST}) — free tier, no card required. Source structure is public too: ${GITHUB_URL}`,
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

I run this as an optional flag on the email endpoint of [Validate](https://${RAPIDAPI_HOST}) — syntax check always runs, MX check is opt-in since it adds a DNS round-trip.`,
  },
];

export const LINKEDIN_POSTS = [
  `Small thing I learned building a validation API: IBAN checksums (ISO 13616 mod-97) catch most typos with zero database lookups. No need to hit a bank API just to know a user fat-fingered a digit. Format validation and existence validation are different problems — solve the cheap one first.`,
  `If you're checking passwords against breach databases, make sure you're using k-anonymity (HaveIBeenPwned's Pwned Passwords protocol) — you only ever send a 5-character hash prefix, never the password or full hash. Privacy-preserving security check, and it's genuinely simple to implement.`,
  `Underrated fact: phone number validation cannot be done correctly with regex. Numbering plans differ by country, and libphonenumber (Google's library, powers Android) is really the only correct way to do this. Learned this the hard way building an API around it.`,
  `Question for anyone who's shipped B2B signup flows in the EU: how do you handle VAT number validation? Format-check only, or do you also hit VIES for existence checks? I went with opt-in VIES since it's the flakier of the two calls and not every flow needs it.`,
  `Built a small stateless validation API (IBAN/VAT/email/phone/credit-card format + password strength/breach checks) on Cloudflare Workers. No database, no session state — just deployed at the edge. Free tier live on RapidAPI if anyone wants to poke at it.`,
  `Reminder that Luhn's checksum algorithm — the thing validating every credit card number's format — was patented in 1954. It only checks structural validity, nothing about whether the card is real or funded. Format validation and payment processing are very different layers.`,
  `Entropy-based password strength scoring beats "must contain a symbol" rules every time. The composition-rule approach produces things like Password1! — technically compliant, trivially guessable. Estimating actual search space is a much better signal.`,
  `Working on validation/utility APIs lately and the thing that surprised me most: MX record checks for email are almost free (one DNS lookup) but catch a real chunk of junk signups before you waste a verification email on a domain that can't receive mail.`,
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
