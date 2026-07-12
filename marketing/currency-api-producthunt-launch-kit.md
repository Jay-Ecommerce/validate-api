# ProductHunt launch kit — Currency API

This is prep material for a **one-time manual launch**, not automation. PH
launches are a single event by design — repeated automated "updates" or
re-launches violate their guidelines and risk the maker account, so this
kit exists to make the one real launch day go smoothly, nothing more.

**Three products, three separate launch kits.** This is the sibling kit
to `producthunt-launch-kit.md` (Validate API) and
`qr-api-producthunt-launch-kit.md` (QR API). **Stagger the three launches
on different weeks, not the same day or the same week.** PH community
consensus is that multiple simultaneous or near-simultaneous launches from
one maker dilute each other — voter/comment attention splits across
listings, and it can read as spammy rather than as one maker with a
focused launch. Let each launch fully run its 24-hour cycle and settle,
then wait at least 2-3 weeks before the next.

**Best day: Tuesday.** PH community consensus is that Tuesday gets the
strongest engagement of the week — Monday competes with a weekend backlog,
Wednesday-Friday taper off, weekends are dead. Launch on a **Tuesday**,
spaced weeks apart from the other two launches.

## Tagline (60 char max)

`Currency conversion API sourced from ECB rates, no signup`

(59 chars)

## Description (short)

A currency conversion and exchange-rate API with rates sourced from the
European Central Bank. Subscribe with the RapidAPI key you already have —
no separate vendor account, no email verification wait. No database,
deployed at Cloudflare's edge. Free tier, no card required.

## First comment (post this as the maker immediately after launch)

> Hey PH! I built Currency API because every exchange-rate API I tried for
> a side project wanted its own account, its own email verification step,
> and sometimes manual approval — for something that should be a two-line
> integration.
>
> It's a stateless HTTP API on RapidAPI, so if you already have a RapidAPI
> key (or make one, free, in about a minute) you can subscribe and start
> calling it immediately — no separate vendor signup.
>
> A few things I cared about building this:
> - **Real rate source** — sourced from the European Central Bank via
>   Frankfurter (a free, keyless proxy over ECB reference rates), not a
>   black-box "trust us" number.
> - **Fails loud, not silent** — if the upstream source is unreachable,
>   you get a clean error instead of a quietly-served stale cached rate.
>   For anything touching money, knowing the number's wrong beats not
>   knowing it's stale.
> - **Two endpoints, not twenty** — `/v1/convert` for a single conversion,
>   `/v1/rates` for the full table per base currency if you're converting
>   to several currencies at once.
> - **Free to start** — 500,000 requests/month free, no card required.
>
> Worth knowing upfront: ECB rates update once per business day, not
> tick-by-tick — great for pricing pages and invoicing, not a substitute
> for a trading-grade feed if you're doing FX execution.
>
> Landing page + docs: https://currency-api.jay-trading.workers.dev

## Gallery image ideas (need to be created — not auto-generated here)

1. Logo/icon as the thumbnail.
2. A screenshot of a single curl request + the JSON response — clean,
   concrete example of the conversion endpoint.
3. A simple diagram: client → Cloudflare Worker → Frankfurter/ECB → JSON
   response, 3-4 boxes, emphasizing the "real central bank source" point
   from the first comment.

## Launch day checklist

- [ ] Launch on a **Tuesday** — best engagement day per PH community
      consensus (see note above)
- [ ] Post between 12:01–3:00 AM PT (PH's day resets at midnight PT;
      earlier launches get more of the 24-hour voting window)
- [ ] Confirm this is at least 2-3 weeks after (or before) the Validate
      API and QR API launches — don't overlap
- [ ] Have 3-5 people you know ready to upvote/comment organically in the
      first hour (not coordinated fake engagement — genuinely ask friends/
      colleagues who'd actually find it useful)
- [ ] Reply to every comment within the first few hours
- [ ] Cross-post the launch link to Dev.to / personal social once it's
      live (not before — PH discourages pre-announcing the exact launch
      link)
- [ ] Do NOT relaunch or "update" the listing after this — one launch,
      done
