# Automation plan (marketing / revenue tracking / API expansion / SEO)

Status: **built, not yet wired up** — code and workflows exist, everything is
waiting on credentials (table below) before it actually runs. Nothing has
been deployed/posted live yet.

## What's built

| Component | Script | Workflow | Behavior |
|---|---|---|---|
| Dev.to weekly article | `scripts/marketing/devto-post.mjs` | `devto-weekly.yml` (Tue 09:00 UTC) | Auto-publishes, rotates through 8 real articles by ISO week |
| LinkedIn 3x/week | `scripts/marketing/linkedin-post.mjs` | `linkedin-3x-weekly.yml` (Mon/Wed/Fri 14:12/14:19/14:26 UTC) | Posts to the JayEdge Company Page (not a personal profile), rotates through 12 posts covering all 3 products |
| Reddit weekly drafts | `scripts/marketing/reddit-draft.mjs` | `reddit-draft-weekly.yml` (Mon 10:00 UTC) | Opens a GitHub issue with 4 drafts (one per subreddit, rotating style) — **does not post**, you post manually |
| Revenue report | `scripts/marketing/revenue-report.mjs` | `revenue-report-daily.yml` (07:00 UTC daily) | Emails a summary via Resend, sourced from PayPal transactions |
| API expansion proposals | `scripts/marketing/api-expansion-proposal.mjs` | `api-expansion-proposal-monthly.yml` (1st of month) | Opens a GitHub issue proposing 2 new endpoints — **does not write or deploy code** |
| ProductHunt launch kit | `marketing/producthunt-launch-kit.md`, `marketing/qr-api-producthunt-launch-kit.md`, `marketing/currency-api-producthunt-launch-kit.md` | — (one-time, manual) | Tagline, description, first comment, launch checklist per API — Tuesday launches, staggered 2-3 weeks apart |
| Show HN draft | `marketing/show-hn-draft.md` | — (one-time, manual) | Title + post body for you to post as yourself |
| Directory submissions | `marketing/directory-submissions.md` | — | public-apis entry ready to PR on request; APIs.guru needs schema adaptation first; APIList.fun has no API, manual only |

Content is template-rotation based (picked deterministically by ISO week/day
number), not live LLM generation — there's no paid LLM API in this project's
budget, and predictable rotation through real, specific, technically-accurate
posts beats generic AI-sounding text anyway.

## Decisions applied (from the prior turn, unanswered clarifying question — used my judgment)

1. **Social marketing**: Reddit is draft-only (you post manually as yourself) — auto-posting/auto-replying to strangers is spam/astroturfing regardless of how "human" it's made to look, risks account and domain bans, and was explicitly declined as a separate request. Dev.to and LinkedIn are auto-published per this turn's explicit instruction, since those are legitimate channels with real opt-in APIs — not impersonating organic strangers.
2. **API expansion**: research-and-propose via GitHub issue, not auto-deploy. New endpoints go through the same review/CI/deploy pipeline as any other change.
3. **Email delivery**: Resend.
4. **ProductHunt**: one-time launch kit only, no repeat-automation (PH guidelines prohibit that).

## Revenue tracking — what's real here

RapidAPI's own analytics API (GraphQL Platform API) is confirmed **Enterprise-plan
only** — not available on your account. I'm not building browser-login automation
to scrape the dashboard either, since that would require storing your RapidAPI
password as a GitHub secret for unattended automated login, which isn't something
I'll set up. `revenue-report.mjs` instead tracks incoming PayPal transactions
(RapidAPI pays out via PayPal) as a revenue proxy — real signal, but it lags
RapidAPI's payout schedule rather than being live subscriber/usage data. For
that, check RapidAPI Studio's dashboard directly.

## Credentials you need to create (I can't create accounts/authorize OAuth on your behalf)

| Secret name | Service | What to do | Used by |
|---|---|---|---|
| `DEVTO_API_KEY` | Dev.to | Account → Settings → Extensions → DEV API Keys → generate | Weekly article |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn | Create a Developer app at linkedin.com/developers/apps, associate it with the JayEdge Company Page, request the **Community Management API** product (organization posting — different from "Share on LinkedIn", which only posts to a personal profile; needs LinkedIn review, not instant), complete the OAuth flow yourself to get a token. **Expires every 60 days**, no refresh built in — you'll need to regenerate it periodically. Full walkthrough: `docs/linkedin-setup.md`. | 3x/week posts |
| `LINKEDIN_ORG_URN` | LinkedIn | The JayEdge page's numeric organization ID, formatted as `urn:li:organization:<id>` — find the ID in the page admin URL or via the `GET /v2/organizationAcls` API call (see `docs/linkedin-setup.md`) | 3x/week posts |
| `RESEND_API_KEY` | Resend | Free account (3,000 emails/month) → API key | Daily revenue email |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal | REST API app at developer.paypal.com → Client ID + Secret | Revenue proxy |

`GITHUB_TOKEN` for the Reddit-draft and API-expansion-proposal workflows is
automatic (GitHub Actions provides it), no setup needed.

Add each as a GitHub Actions secret (Settings → Secrets and variables →
Actions on the `validate-api` repo) once you have it. Workflows that are
missing their secret will fail loudly (clear error message) rather than
silently doing nothing, so you'll know exactly what's still needed.

## Explicitly not building

- Reddit/Twitter auto-post or auto-reply bots (declined twice now — see chat history for why)
- Twitter/X API integration (also not free)
- ProductHunt repeat-launch automation
- Fully unreviewed auto-deploy of new API endpoints
- Automated login/scraping of the RapidAPI dashboard (would require storing your password)
