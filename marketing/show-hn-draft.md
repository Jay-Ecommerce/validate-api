# Show HN draft — for Jay to post manually

Not automated — HN's culture is unusually sensitive to anything that smells
like marketing, and posts should come from a real account with real karma
history genuinely participating in the thread. This is just the draft text.

## Title (80 char max, must literally start with "Show HN:")

`Show HN: Validate – a stateless IBAN/VAT/email/phone/card validation API`

(74 chars)

## Post body

We built a small stateless API for the input-validation checks almost every
backend ends up re-implementing: IBAN (mod-97 checksum), EU VAT (format +
optional live VIES lookup), email (syntax + optional MX record check),
disposable/temp-mail detection, phone (libphonenumber), credit card format
(Luhn + brand detection), postal code format (50+ countries), and password
strength/breach checks (HaveIBeenPwned k-anonymity, so full passwords never
leave your server).

It's deployed on Cloudflare Workers — no database, no session state, so it
scales horizontally for free and responds fast globally. Source structure and
the reasoning behind a few of the design decisions (why an API instead of an
npm package, why VIES/MX checks are opt-in) are in the repo:
https://github.com/Jay-Ecommerce/validate-api

Free tier is 100 requests/month, no card required, if anyone wants to try it
against real input.

Genuinely curious what HN thinks of the "API instead of library" tradeoff
here — happy to go deeper on any of it in the comments.

## Posting notes

- HN's "Show HN" guidelines require the thing to be something you built and
  can answer questions about — true here, so that's fine.
- Best posting windows are generally US morning/early afternoon on a weekday
  (avoid weekends — much lower traffic).
- Do not ask anyone to upvote it. HN's ranking algorithm and community both
  react very badly to vote manipulation, and it's detectable.
- Answer every technical question in the thread promptly and honestly,
  including "why would I use this instead of X" — HN respects direct answers
  more than marketing framing.
