# Show HN draft — QR API — for Jay to post manually

Not automated, same reasoning as the Validate API Show HN draft: HN's
culture reacts badly to anything that smells like automated marketing, and
posts should come from a real account genuinely participating in the
thread.

## Title (80 char max, must literally start with "Show HN:")

`Show HN: QR API – stateless QR code generation on Cloudflare Workers`

(69 chars)

## Post body

Small stateless API that generates QR codes — either as an SVG image or as
the raw boolean module matrix (JSON), for callers who want to render it
themselves instead of embedding an image. Supports error-correction level,
custom colors, and cell size.

Deployed on Cloudflare Workers — no database, no session state, so it
scales for free and responds fast globally. Uses the `qrcode-generator`
library for the actual QR encoding (version selection, Reed-Solomon error
correction, mask evaluation) rather than hand-rolling that part — it's small,
dependency-free, and that's genuinely complex spec territory not worth
reimplementing.

It's a standalone sibling to an earlier project I posted here
([Validate](https://github.com/Jay-Ecommerce/validate-api), an input-validation
API) — same architecture and conventions, different problem. Source:
https://github.com/Jay-Ecommerce/qr-api

Free tier available if anyone wants to try it against real input. Curious
whether the "raw matrix" endpoint is actually useful to anyone or if
everyone just wants the image — that's the part I was least sure about
when building it.

## Posting notes

- Same guidance as the Validate API draft: post on a US morning/early
  afternoon weekday, don't ask for upvotes, answer every question honestly
  and promptly.
- Don't post this back-to-back with the Validate API Show HN — space them
  out by at least a few weeks so the account doesn't read as a marketing
  pipeline.
- The "curious whether X is useful" line is a genuine question, not a
  rhetorical hook — HN responds better to authentic uncertainty than to
  polished pitches, and the raw-matrix endpoint's usefulness actually is an
  open question worth real feedback on.
