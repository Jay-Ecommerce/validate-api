# ProductHunt launch kit — QR API

This is prep material for a **one-time manual launch**, not automation. PH
launches are a single event by design — repeated automated "updates" or
re-launches violate their guidelines and risk the maker account, so this
kit exists to make the one real launch day go smoothly, nothing more.

**Three products, three separate launch kits.** This is the sibling kit
to `producthunt-launch-kit.md` (Validate API) and
`currency-api-producthunt-launch-kit.md` (Currency API). **Stagger the
three launches on different weeks, not the same day or the same week.** PH
community consensus is that multiple simultaneous or near-simultaneous
launches from one maker dilute each other — voter/comment attention splits
across listings, and it can read as spammy rather than as one maker with a
focused launch. Let each launch fully run its 24-hour cycle and settle,
then wait at least 2-3 weeks before the next.

**Best day: Tuesday.** PH community consensus is that Tuesday gets the
strongest engagement of the week — Monday competes with a weekend backlog,
Wednesday-Friday taper off, weekends are dead. Launch on a **Tuesday**,
spaced weeks apart from the other two launches.

## Tagline (60 char max)

`Generate QR codes as SVG or JSON — free, no watermark`

(54 chars)

## Description (short)

A stateless QR code generation API — returns a ready-to-embed SVG or the
raw boolean module matrix as JSON if you want to render it yourself.
Configurable error-correction level, colors, and cell size. No database,
deployed at Cloudflare's edge. Free tier, no card required.

## First comment (post this as the maker immediately after launch)

> Hey PH! I built QR API after noticing most "free" QR generators either
> watermark the output, cap you at a handful of codes before demanding a
> paid plan, or only give you a rasterized PNG that blurs the moment
> someone screenshots and enlarges it.
>
> It's a stateless HTTP API — one call, get back an SVG (crisp at any
> size) or, if you want to render it yourself (canvas, terminal, whatever),
> the raw module matrix as JSON. No database, deployed on Cloudflare
> Workers so it's fast globally.
>
> A few things I cared about building this:
> - **No watermark, ever** — not even on the free tier.
> - **SVG-first** — vector output means no blur when it gets resized,
>   which happens constantly with QR codes (someone always screenshots and
>   zooms).
> - **Configurable error correction** — up to `H` (30% recovery) if you're
>   overlaying a logo or printing somewhere it might get scuffed; `L` if
>   you just want the densest-possible clean digital code.
> - **Free to start** — generous free tier, no card required.
>
> Would love feedback, especially on whether the raw-matrix (JSON) output
> is actually useful to people or if everyone just wants the image — that's
> the part I was least sure about when building it.
>
> Landing page + docs: https://qr-api.jay-trading.workers.dev

## Gallery image ideas (need to be created — not auto-generated here)

1. Logo/icon as the thumbnail (reuse the existing project logo style if
   one exists for QR API, otherwise a simple QR-code-motif icon).
2. A screenshot of a single curl request + the resulting rendered QR code
   side by side — most visually clean way to show what the API does in
   one glance.
3. A before/after comparison: a blurry screenshotted-and-enlarged PNG QR
   code next to a crisp SVG one at the same enlarged size — makes the
   SVG-over-PNG pitch visual instead of just text.

## Launch day checklist

- [ ] Launch on a **Tuesday** — best engagement day per PH community
      consensus (see note above)
- [ ] Post between 12:01–3:00 AM PT (PH's day resets at midnight PT;
      earlier launches get more of the 24-hour voting window)
- [ ] Confirm this is at least 2-3 weeks after (or before) the Validate
      API and Currency API launches — don't overlap
- [ ] Have 3-5 people you know ready to upvote/comment organically in the
      first hour (not coordinated fake engagement — genuinely ask friends/
      colleagues who'd actually find it useful)
- [ ] Reply to every comment within the first few hours
- [ ] Cross-post the launch link to Dev.to / personal social once it's
      live (not before — PH discourages pre-announcing the exact launch
      link)
- [ ] Do NOT relaunch or "update" the listing after this — one launch,
      done
