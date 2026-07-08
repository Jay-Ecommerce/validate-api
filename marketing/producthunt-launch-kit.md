# ProductHunt launch kit — Validate API

This is prep material for a **one-time manual launch**, not automation. PH
launches are a single event by design — repeated automated "updates" or
re-launches violate their guidelines and risk the maker account, so this
kit exists to make the one real launch day go smoothly, nothing more.

## Tagline (60 char max)

`Validate IBAN, VAT, email, phone & cards in one API call`

(59 chars)

## Description (short)

A stateless validation API for IBAN, EU VAT, email (incl. disposable/temp-mail
detection), phone, credit card, and postal code (50+ countries) formats —
plus password strength and breach checks. No database, deployed at
Cloudflare's edge. Free tier, no card required.

## First comment (post this as the maker immediately after launch)

> Hey PH! I built Validate because I kept re-implementing the same checksum
> and format-validation logic (IBAN mod-97, Luhn, libphonenumber, VIES) across
> side projects. It's a stateless HTTP API — one JSON call per check, no
> database, deployed on Cloudflare Workers so it's fast globally.
>
> A few things I cared about building this:
> - **Privacy** — password breach checks use HaveIBeenPwned's k-anonymity
>   protocol, so full passwords never leave your server.
> - **No lock-in** — it's plain JSON over HTTP, works from any language.
> - **Free to start** — 100 requests/month on the free tier, no card required.
>
> Would love feedback, especially on what validation checks people wish
> existed that aren't covered yet (currently: IBAN, VAT, email, disposable-
> email detection, phone, credit card format, postal code, password
> strength/breach).
>
> Landing page + docs: https://validate-api.jay-trading.workers.dev

## Gallery image ideas (need to be created — not auto-generated here)

1. Logo (`logo.png` in repo root) as the thumbnail.
2. A screenshot of a single curl request + JSON response (pick the IBAN
   endpoint — most visually clean example).
3. A simple architecture diagram: client → Cloudflare Worker → (optional)
   VIES/DNS/HIBP lookup → JSON response. Keep it to 3-4 boxes, no clutter.

## Launch day checklist

- [ ] Post between 12:01–3:00 AM PT (PH's day resets at midnight PT; earlier
      launches get more of the 24-hour voting window)
- [ ] Have 3-5 people you know ready to upvote/comment organically in the
      first hour (not coordinated fake engagement — genuinely ask friends/
      colleagues who'd actually find it useful)
- [ ] Reply to every comment within the first few hours
- [ ] Cross-post the launch link to Dev.to / personal social once it's live
      (not before — PH discourages pre-announcing the exact launch link)
- [ ] Do NOT relaunch or "update" the listing after this — one launch, done
