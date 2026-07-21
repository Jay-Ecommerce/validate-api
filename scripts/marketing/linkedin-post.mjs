// Posts one update per run to the JayEdge LinkedIn Company Page, rotating
// through LINKEDIN_POSTS.
//
// Requires LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_URN as GitHub secrets.
// These come from a one-time manual OAuth flow that only Jay can do (LinkedIn
// requires the Company Page admin to authorize the app — this cannot be
// automated by a script or by Claude on Jay's behalf). See
// docs/linkedin-setup.md for the exact steps to obtain them.
//
// Posts as the organization (urn:li:organization:<id>), not a personal
// profile — this requires the app to have the Community Management API
// product approved and the authenticated member to be an admin of the page.
//
// LinkedIn's standard OAuth access tokens expire after 60 days. This script
// does not refresh them — when posting starts failing with 401, the token
// needs to be regenerated manually and the GitHub secret updated. There is no
// way around this without LinkedIn granting a refresh-token-eligible product,
// which requires their approval and is not guaranteed for a small project.
import { LINKEDIN_POSTS, pick } from "./content-library.mjs";

const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const ORG_URN = process.env.LINKEDIN_ORG_URN; // e.g. "urn:li:organization:12345678"

if (!ACCESS_TOKEN || !ORG_URN) {
  console.error("LINKEDIN_ACCESS_TOKEN or LINKEDIN_ORG_URN is not set — skipping LinkedIn post.");
  process.exit(1);
}

// Offset by day-of-year so the 3x/week schedule doesn't always land on the
// same post (see the cron schedule in linkedin-3x-weekly.yml, which fires 3
// distinct days — this offset spreads pool selection across those firings).
const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
const text = pick(LINKEDIN_POSTS, dayOfYear);

const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  },
  body: JSON.stringify({
    author: ORG_URN,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`LinkedIn API returned ${res.status}: ${body}`);
  if (res.status === 401) {
    console.error("Access token likely expired (60-day lifetime) — regenerate and update the LINKEDIN_ACCESS_TOKEN secret.");
  }
  if (res.status === 403) {
    console.error("Check that the app has Community Management API access and the token's member is an admin of the org page.");
  }
  process.exit(1);
}

console.log("Posted to LinkedIn Company Page successfully.");
