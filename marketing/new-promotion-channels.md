# New promotion channels — research + manual templates

All of these are manual/one-time actions requiring Jay's own accounts or
personal judgment — none of this is automated, same reasoning as the
Show HN and ProductHunt docs (real community, human posting from a real
identity, not a bot).

## Developer newsletters accepting free submissions

- **[console.dev](https://console.dev/)** — free weekly devtools newsletter,
  reviews 2-3 tools/week. No public submission form found; submit by emailing
  `hello@console.dev` with a short pitch (what it does, why it's useful,
  link). Best fit of the options checked — audience is exactly "developers
  looking for new tools."
- Most other developer newsletters found in this search (Bytes, TLDR, Web
  Tools Weekly, Pycoders, etc.) are sponsorship-based (paid placement), not
  free-submission — not pursuing given the €0 budget stance. Console.dev was
  the one clear exception.
- If you want to expand this list later: check each newsletter's own site
  for a "submit a tool" or "tip us" link before emailing cold — some have a
  form, most don't publish one and just want a direct email.

## Discord servers

- **[Indie Hackers Discord](https://discord.com/invite/indiehackers)** —
  the standard indie-hacker Discord, channels split by stage (idea,
  validating, launched, growing, scaling). Post in the "launched" or
  "show and tell"-style channel once you're a member for a bit — Discord
  communities generally react badly to join-and-immediately-pitch behavior,
  same spam-perception issue as Reddit. Worth lurking/participating for a
  few days first.
- No API-specific or RapidAPI-specific Discord with meaningful activity
  turned up in this search — the general indie-hacker community is the
  better fit for a two-product portfolio like this than a narrow
  API-tooling Discord would be.

## Manual social media post templates (for Jay's personal accounts)

Fill in `[handle]` / adjust tone per platform. These are intentionally short
and non-salesy — the goal is a genuine "I built this" post, not an ad.

**Twitter/X:**
> Built two small APIs this month: Validate (IBAN/VAT/email/phone/card/postal-code checks) and QR API (QR code generation). Both stateless, edge-deployed on Cloudflare Workers, free tier on RapidAPI.
>
> validate-api.jay-trading.workers.dev
> qr-api.jay-trading.workers.dev

**LinkedIn (personal post, not the Company Page needed for API-based posting):**
> Spent the last couple of weeks building and shipping two small APIs end-to-end — from Cloudflare Workers deployment to RapidAPI listing.
>
> Validate handles the input-validation checks every backend ends up re-implementing (IBAN, VAT, email, phone, credit card, postal code, password strength). QR API generates QR codes as SVG or raw JSON matrix data.
>
> Both stateless, no database, free tier available. Happy to answer questions about the Cloudflare Workers + RapidAPI setup if anyone's considering the same path for a side project.

## Show HN drafts

`marketing/show-hn-draft.md` already has the Validate API draft. See
`marketing/show-hn-draft-qr-api.md` (new, this commit) for QR API's.

**Note on timing:** don't post both Show HN threads back to back — HN's
guidelines and community norms don't forbid multiple posts from the same
account, but two posts close together from a new-ish account reads as
spammy. Space them out (a few weeks apart), and only after Validate's
thread (if posted) has run its course.
