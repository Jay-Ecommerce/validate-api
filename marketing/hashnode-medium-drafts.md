# Hashnode + Medium article drafts

Four articles, adapted from the four newest entries in the Dev.to rotation
pool (`scripts/marketing/content-library.mjs`, `DEVTO_ARTICLES` indices
11-14 — QR API, Currency API, and two Validate API pieces). Dev.to
auto-publishes these on a weekly rotation (`devto-weekly.yml`); Hashnode and
Medium have no such automation here (see caveats below), so these are
paste-and-publish drafts for Jay to post manually.

## Setup checklist (one-time, manual — account creation not done here)

1. Create a free Hashnode account at [hashnode.com](https://hashnode.com) —
   fastest path is "Continue with GitHub," no separate password to manage.
2. Create a free Medium account at [medium.com](https://medium.com) —
   email or Google/Apple sign-in.
3. For each article below: open the platform's "New story" / "Write"
   editor, paste the title into the title field, paste the body into the
   body, add tags, publish (or schedule, if the platform offers it).
4. Do this article-by-article, not as one bulk paste — both editors reflow
   pasted markdown differently than they'd render a raw `.md` file, so a
   quick visual check per article after paste is worth the 30 seconds.

## Platform caveats (read before publishing)

- **Hashnode** renders GitHub-flavored markdown closely, including fenced
  code blocks with syntax highlighting — the articles below can be pasted
  in close to as-is. Hashnode also supports a canonical-URL field per post
  (Settings → "This post already exists somewhere else") — worth pointing
  it at the Dev.to version once that's live, so search engines attribute
  the canonical copy correctly instead of splitting authority across three
  near-identical posts.
- **Medium does poorly with heavy code blocks.** Its editor doesn't have a
  real fenced-code-block primitive — pasted markdown code fences often land
  as plain paragraphs with lost indentation, or as an inline "code style"
  span that line-wraps badly on mobile. For the articles below with
  multi-line JS snippets, either: (a) paste the snippet, then manually
  re-select it and apply Medium's code-block formatting (toolbar or
  `Cmd/Ctrl+Shift+.`) line by line, or (b) keep the snippet but shorten it
  to the single most illustrative fragment and describe the rest in prose.
  Don't skip proofreading the Medium version after paste — this is the one
  most likely to need manual cleanup.
- **Medium has no publishing API for new integrations.** Medium deprecated
  public write-API access for new integrations some time ago (existing
  legacy integrations were grandfathered, new ones can't get a token) — so
  Medium posting is manual-only **going forward**, not just for this batch.
  Any future automation plan should treat Medium as a permanently-manual
  channel, the same category as Reddit/Show HN/ProductHunt in
  `AUTOMATION_PLAN.md`, not something to revisit for API access later.
- Both platforms flag duplicate/near-duplicate content less harshly than
  it might seem — cross-posting the same technical article to Dev.to,
  Hashnode, and Medium is normal practice among developers, not something
  that gets penalized, as long as each platform's canonical-URL field (or
  Medium's "import" flow, if used) is set to point at one canonical source
  where possible.

---

## Article 1 — How to generate QR codes for free with an API

**Suggested tags:** `webdev`, `api`, `javascript`, `tutorial` (Hashnode) /
`Web Development`, `API`, `JavaScript`, `Programming`, `Tutorial` (Medium,
max 5 tags)

Generating a QR code server-side usually means pulling in a heavyweight image library, or shelling out to a third-party service that watermarks the output or rate-limits you into a paid plan. Here's the simplest version that actually works in production.

The core idea: a QR code is just a grid of black/white modules encoding your data with Reed-Solomon error correction, then rendered as an image. You don't need to implement the encoding yourself — you need an endpoint that returns either a ready-to-embed SVG or the raw module matrix if you want to render it yourself (canvas, terminal, whatever):

```bash
curl "https://qr-api.p.rapidapi.com/v1/qr?data=https://example.com&ecc=M&cellSize=8" \
  -H "X-RapidAPI-Key: <your-key>" \
  -H "X-RapidAPI-Host: qr-api.p.rapidapi.com" \
  --output qr.svg
```

That's an SVG you can embed directly with an `<img>` tag or inline it for crisp scaling at any size — no rasterization artifacts. A few things worth knowing before you ship this:

- **Error correction level matters more than people think.** `H` (30% recovery) survives a logo overlay or a slightly damaged print; `L` (7%) is fine for a clean digital display. Don't default to the highest level everywhere — it makes the code visually denser for no benefit if nothing's ever going to obscure it.
- **Cap your input length.** QR codes get exponentially denser as the encoded string grows. If you're encoding a URL, shorten it first; don't just dump JSON payloads into a QR code and expect a scannable result.
- **SVG over PNG when you can.** Vector output means no blurring when someone screenshots and enlarges it, which happens more than you'd expect with QR codes.

I built [QR API](https://rapidapi.com/jonashaemecommerce/api/qr-api19) as a free-to-start, stateless endpoint for exactly this — no data logged, no watermark, SVG or raw matrix output. Same provider also runs [Validate](https://rapidapi.com/jonashaemecommerce/api/validate7) (IBAN/email/phone/etc. validation) and [Currency API](https://rapidapi.com/jonashaemecommerce/api/currency-api15) (exchange rates) if you need those too.

---

## Article 2 — Real-time currency conversion API — no signup required

**Suggested tags:** `api`, `webdev`, `finance`, `tutorial` (Hashnode) /
`API`, `Finance`, `Web Development`, `Programming`, `Fintech` (Medium)

Most currency-conversion APIs make you register for a separate vendor account, verify an email, and sometimes wait for manual approval before you get a key — for something that should be a two-line integration. Here's a route that skips the vendor-specific signup entirely.

RapidAPI's marketplace lets you subscribe with the RapidAPI key you already have (or create once, for free) rather than a new account per data provider. For [Currency API](https://rapidapi.com/jonashaemecommerce/api/currency-api15), that means:

```bash
curl "https://currency-api.p.rapidapi.com/v1/convert?from=EUR&to=USD&amount=100" \
  -H "X-RapidAPI-Key: <your-rapidapi-key>" \
  -H "X-RapidAPI-Host: currency-api.p.rapidapi.com"
```

```json
{"from":"EUR","to":"USD","amount":100,"rate":1.0821,"result":108.21,"date":"2026-07-11"}
```

One RapidAPI key, and you're subscribed to every API on the platform you want to try — including this one, [Validate](https://rapidapi.com/jonashaemecommerce/api/validate7) for input validation, and [QR API](https://rapidapi.com/jonashaemecommerce/api/qr-api19) for QR generation.

A couple of implementation details worth knowing if you're building this into a checkout or pricing display:

- **Rates come from the European Central Bank** (via Frankfurter, a free keyless proxy over ECB reference rates), updated once per ECB business day — not a live tick-by-tick feed. Fine for pricing pages and invoicing; not a substitute for a trading-grade feed if you're doing FX execution.
- **Fail loud, not silent.** If the upstream rate source is unreachable, the API returns a clean `502` instead of quietly serving a stale cached rate. For anything touching money, knowing the number is wrong beats not knowing it's stale.
- **`/v1/rates` vs `/v1/convert`** — pull the whole rate table once per base currency if you're converting to several currencies at once (one call, cache it client-side for the day), and use `/v1/convert` for one-off single conversions.

Free tier is 500,000 requests/month, no card required to start.

---

## Article 3 — Why your regex for IBAN validation is probably wrong

**Suggested tags:** `javascript`, `banking`, `tutorial`, `webdev` (Hashnode) /
`JavaScript`, `Banking`, `Programming`, `Software Engineering`, `Fintech`
(Medium)

A regex like `/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/` will pass through plenty of IBANs that are complete garbage. It checks the shape — two letters, two digits, then alphanumerics — but shape isn't validity, and this is the mistake nearly every from-scratch IBAN validator makes.

Here's what a shape-only regex misses, in order of how often it bites people:

**1. Country-specific length.** IBAN length isn't a range, it's a fixed number per country: Germany is always 22 characters, the Netherlands 18, Malta 31. A regex with `{11,30}` for the BBAN portion accepts a "German" IBAN that's the wrong length for Germany, because it's only checking the global range across *all* countries, not the specific one this IBAN claims to be from.

**2. The checksum.** This is the part a regex structurally cannot do — regular expressions can't compute a mod-97 checksum, because that requires arithmetic over the whole string, not pattern matching. Every IBAN has two check digits (positions 3-4) that are the result of ISO 7064's mod-97-10 algorithm applied to the rearranged, letter-to-number-converted account number. A regex will happily accept an IBAN with those two digits set to anything:

```js
function isValidIBAN(iban) {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(clean)) return false; // shape check — necessary but nowhere near sufficient

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());

  let remainder = numeric;
  while (remainder.length > 2) {
    const chunk = remainder.slice(0, 9);
    remainder = (parseInt(chunk, 10) % 97) + remainder.slice(chunk.length);
  }
  return parseInt(remainder, 10) % 97 === 1;
}
```

Note the chunked-modulo loop — IBANs convert to numbers with 30+ digits, well past what JS's `Number` type can hold precisely, so you can't just do `bigNumber % 97` in one step without either a BigInt polyfill or this kind of iterative reduction.

**3. Per-country BBAN structure.** Beyond length, each country also defines which positions must be digits vs letters within the BBAN. A regex checking "alphanumeric" for the whole remainder will accept a UK IBAN with digits where the bank code letters should be.

None of this means "validate against a live bank lookup" — that's a different, heavier problem (does the account exist right now), and format validation deliberately doesn't answer it. It means: regex for shape, then the real mod-97 checksum, then country-specific length/structure — in that order, each one catching what the previous step can't.

I wrapped all three checks into one endpoint on [Validate](https://rapidapi.com/jonashaemecommerce/api/validate7) if you'd rather not own the mod-97 edge cases and the per-country BBAN table yourself. Same account also covers [QR API](https://rapidapi.com/jonashaemecommerce/api/qr-api19) and [Currency API](https://rapidapi.com/jonashaemecommerce/api/currency-api15) if useful.

---

## Article 4 — The complete guide to disposable email detection

**Suggested tags:** `security`, `webdev`, `api`, `tutorial` (Hashnode) /
`Security`, `Web Development`, `API`, `Software Engineering`, `Programming`
(Medium)

Syntax-valid, MX-record-valid, and still worthless for your product: that's a disposable email address from 10minutemail, guerrillamail, mailinator, or one of several hundred similar throwaway-inbox services. If you're not filtering these, a meaningful slice of your "verified" signups are addresses nobody will ever check twice.

Here's why this is a genuinely different problem from syntax or MX validation, and how to actually solve it.

**Why there's no algorithmic tell.** A disposable-mail domain looks completely normal — valid syntax, real MX records, sometimes even a legitimate-looking domain name. There's no structural pattern that distinguishes `mailinator.com` from `gmail.com` at the protocol level. The only reliable signal is a maintained list of known disposable domains, checked against the domain part of the address:

```js
function isDisposable(email, disposableDomainSet) {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomainSet.has(domain);
}
```

**The catch: the list has to stay current.** New disposable-mail domains spin up constantly — some services rotate domains specifically to dodge blocklists. A list you snapshot once and never update degrades within weeks. The community-run [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) project is a solid free starting point and is actively maintained, but you need a process to re-sync it, not a one-time import.

**Where this fits in the validation pipeline.** Order matters, because each check is progressively more expensive and should only run if the previous one passed:

1. **Syntax** — near-instant, always run
2. **MX record lookup** — one DNS call, catches typo'd/dead domains
3. **Disposable-domain check** — a set lookup against your list, catches throwaway-but-technically-valid addresses

Running them in that order means you only pay for the disposable-domain check on addresses that already passed the cheaper filters — no wasted work on obviously broken input.

**What it doesn't catch:** a user who signs up with a real Gmail address they simply never check again. Disposable-domain detection targets *services designed for throwaway use*, not general inbox abandonment — that's a retention problem, not a validation one.

I run this exact pipeline (syntax → MX → disposable-domain, each opt-in past the first) as an endpoint on [Validate](https://rapidapi.com/jonashaemecommerce/api/validate7) with a synced domain list, if you'd rather not own the re-sync process yourself. Sibling APIs on the same account: [QR API](https://rapidapi.com/jonashaemecommerce/api/qr-api19) and [Currency API](https://rapidapi.com/jonashaemecommerce/api/currency-api15).
