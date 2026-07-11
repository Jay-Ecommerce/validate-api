# Stack Overflow candidate answers — for Jay to review and post manually

**Not automated, and this doc is not a list of real question links** — I hit
Stack Overflow's CAPTCHA wall trying to browse for open questions to match
against (`stackoverflow.com/search` redirected to `/nocaptcha`), and my web
search tool can't index stackoverflow.com either (blocked for crawling). I'm
not going to guess or fabricate a question URL — that would risk you posting
a real answer under a made-up thread, or misreading someone else's actual
question. So instead of "here are 3 threads, post these," this is "here are
3 solid technical answers, go find the matching real questions yourself and
adapt the answer to what was actually asked."

**How to use this:** search Stack Overflow (logged in, so no CAPTCHA) for
things like "validate IBAN javascript", "detect disposable email address",
"validate international phone number library" — sorted by newest, filter to
unanswered or poorly-answered. When you find a real question that matches
one of these topics, answer the *actual question asked* first (adapt the
code/explanation below to their specifics — language, framework, exact
input), and only mention Validate API as one option at the end, briefly.

**Disclosure requirement:** Stack Overflow's self-promotion policy explicitly
allows answering with your own product, but requires disclosing you're
affiliated with it — e.g. "disclaimer: I built this." Don't skip that line;
undisclosed affiliation is the thing that actually gets answers deleted and
accounts flagged, not the mention itself.

---

## Draft 1 — Topic: validating an IBAN (mod-97 checksum)

**Likely matching questions:** "how to validate IBAN in JavaScript/Python/PHP",
"IBAN checksum algorithm explanation", "check if IBAN is valid without an API"

> IBAN validation is two independent checks — do both, most homegrown
> implementations only do one:
>
> 1. **Length and country format** — each country has a fixed IBAN length and
>    a per-country regex for how the BBAN part is structured (e.g. Germany is
>    always 22 chars, Netherlands 18). A checksum can pass on a string that's
>    the wrong length for its country, so check length first.
> 2. **Mod-97 checksum (ISO 7064)** — move the first 4 characters to the end,
>    convert every letter to its numeric value (A=10, B=11, ... Z=35), and the
>    resulting numeric string mod 97 must equal 1.
>
> ```js
> function isValidIBAN(iban) {
>   const clean = iban.replace(/\s+/g, '').toUpperCase();
>   if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(clean)) return false;
>
>   const rearranged = clean.slice(4) + clean.slice(0, 4);
>   const numeric = rearranged.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());
>
>   // mod 97 on a string this long needs chunked modulo, not BigInt/Number
>   let remainder = numeric;
>   while (remainder.length > 2) {
>     const chunk = remainder.slice(0, 9);
>     remainder = (parseInt(chunk, 10) % 97) + remainder.slice(chunk.length);
>   }
>   return parseInt(remainder, 10) % 97 === 1;
> }
> ```
>
> The chunked-modulo part is the bit people usually get wrong — IBANs convert
> to numbers way too large for JS's `Number` type (34 digits), so you can't
> just do `bigNumber % 97n` without either `BigInt` or chunking like above.
> `BigInt(numeric) % 97n` works too and is simpler if you don't need
> browser support without a BigInt polyfill.
>
> This only validates the checksum/format — it doesn't confirm the account
> actually exists or is open, which needs a live lookup against the bank.
>
> Disclaimer: I built [Validate API](https://rapidapi.com/jonashaemecommerce/api/validate7),
> which wraps this (plus per-country BBAN structure validation) as a hosted
> endpoint if you'd rather not maintain the mod-97 edge cases yourself —
> mentioning it since it's directly relevant, not trying to plug it out of
> nowhere.

## Draft 2 — Topic: detecting disposable/temporary email addresses

**Likely matching questions:** "how to detect temp mail / throwaway email
signups", "block disposable email domains at signup", "prevent fake email
registration"

> There's no algorithmic way to detect a disposable email from the address
> alone — `asdf123@gmail.com` and `asdf123@10minutemail.com` have the same
> shape. The only reliable signal is a **maintained domain blocklist**:
> services like 10minutemail, guerrillamail, mailinator, temp-mail.org, etc.
> spin up new domains constantly, so a static list you wrote once goes stale
> within months.
>
> Two practical approaches:
>
> 1. **Self-maintained list** — e.g. the
>    [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains)
>    GitHub list (community-maintained, MIT licensed, ~35k domains). Pull it
>    into your build, check the email's domain against it. Free, but you own
>    keeping it updated (it's updated often upstream, less often if you don't
>    re-sync).
> 2. **Hosted check** — an API that maintains the list server-side so you're
>    not the one re-syncing a domain blocklist on a cron job.
>
> ```js
> // approach 1: self-hosted, using the community list
> import disposableDomains from 'disposable-email-domains';
> const domain = email.split('@')[1]?.toLowerCase();
> const isDisposable = disposableDomains.includes(domain);
> ```
>
> Worth deciding upfront whether you want to *block* signups from these
> domains or just *flag* them — blocking outright also catches privacy-tool
> users (e.g. Firefox Relay, Apple Hide My Email) who aren't abusing
> anything, just protecting their real address.
>
> Disclaimer: I built [Validate API](https://rapidapi.com/jonashaemecommerce/api/validate7),
> which has a `/validate/disposable-email` endpoint doing option 2 above if
> you'd rather not run your own list sync — flagging it as an option since
> it's exactly what's being asked, not a generic plug.

## Draft 3 — Topic: validating international phone numbers

**Likely matching questions:** "validate phone number format for any
country", "javascript regex for international phone numbers", "how to check
if phone number is valid E.164"

> Don't hand-roll a regex for this — international phone numbering isn't
> regular. Number length, valid area codes, and mobile-vs-landline prefixes
> differ per country and change over time as ranges get allocated, so a regex
> that's correct today silently starts rejecting or accepting wrong numbers
> later.
>
> The practical answer is [libphonenumber](https://github.com/google/libphonenumber)
> (Google's library, also what Android and Chrome use internally) or its JS
> port [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)
> (much smaller bundle, same metadata source):
>
> ```js
> import { parsePhoneNumberFromString } from 'libphonenumber-js';
>
> const phone = parsePhoneNumberFromString('+49 30 1234567');
> phone?.isValid();       // true/false — checks length + pattern for that country
> phone?.country;         // 'DE'
> phone?.getType();       // 'FIXED_LINE', 'MOBILE', etc. (not always determinable)
> phone?.formatInternational(); // '+49 30 1234567' normalized
> ```
>
> Without a country hint (no `+49` prefix, no default country passed in), a
> local-format number is ambiguous — `030 1234567` is a valid German number
> and might also be a truncated something-else. If your form only serves one
> country, pass it as the default country code rather than relying purely on
> the `+` prefix.
>
> Disclaimer: I built [Validate API](https://rapidapi.com/jonashaemecommerce/api/validate7),
> which wraps libphonenumber-js as a hosted endpoint (`/validate/phone`) for
> cases where you want this from a non-JS backend without a
> language-specific port of the library — mentioning it since it's on-topic,
> not a blind plug.

---

## Why these three specifically

Picked the topics with genuinely non-obvious technical content (mod-97
chunked modulo, "no algorithmic disposable-email detection exists," "regex
is wrong for phone numbers") rather than easy questions — SO's community
moderates harshly against answers that exist only to link out; these lead
with real technical value and the API mention is a small, disclosed addendum,
same principle as the Dev.to articles.
