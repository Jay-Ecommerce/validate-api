# LinkedIn Company Page setup for automated posting

This is a one-time, manual setup only Jay can do — LinkedIn requires the
Company Page admin to authorize the app; it can't be automated by a script or
by Claude. Do this once, then the workflow (`linkedin-3x-weekly.yml`) posts
automatically 3x/week (Mon/Wed/Fri) until the access token expires (60 days),
at which point step 5 needs repeating.

**Important distinction:** posting to a Company Page needs a different
LinkedIn product than posting to a personal profile. "Share on LinkedIn"
(`w_member_social`) only posts as *you*. Organization/Company Page posting
needs the **Community Management API** product, which requires LinkedIn's
review. This is the main thing that can go slower or differently than
expected — LinkedIn's developer portal and product names shift over time, so
if anything below doesn't match what you see, that's expected; look for the
nearest equivalent rather than assuming it's broken.

## 1. Create a LinkedIn App

1. Go to https://www.linkedin.com/developers/apps and click **Create app**.
2. Fill in:
   - **App name**: `JayEdge` (or similar — this is what shows on the OAuth
     consent screen, not necessarily user-facing elsewhere)
   - **LinkedIn Page**: search for and select the **JayEdge** Company Page.
     This is what links the app to the page — you must be an admin of that
     page for it to show up here.
   - **App logo**: upload something (required field, any square image works)
   - **Legal agreement**: check the box
3. Click **Create app**.

## 2. Get the Client ID and Client Secret

1. On the app's page, go to the **Auth** tab.
2. You'll see **Client ID** and **Client Secret** near the top — copy both
   somewhere safe for a moment (not committed anywhere, not pasted in chat).
   These aren't the GitHub secrets we ultimately need (those are the access
   token + org URN, further down) — they're only used transiently to run the
   OAuth flow in step 4.

## 3. Request the Community Management API product

1. Still on the app, go to the **Products** tab.
2. Find **Community Management API** (may also appear as **"Marketing
   Developer Platform"** or similar depending on what LinkedIn is calling it
   when you look — their product naming has shifted over time) and click
   **Request access**.
3. You'll likely be asked to fill in a short form about intended use — "Posting
   automated marketing updates to our own Company Page" is an accurate,
   sufficient answer.
4. This goes to LinkedIn for review. It is **not always instant** — could be
   minutes, could be a few days. There's a real (if small) chance it gets
   rejected or asks for more info for a page this size; if that happens, come
   back and we'll figure out a fallback (e.g. manual posting, or the
   personal-profile flow that was already built and works today).
5. Once approved, the **Auth** tab should show `w_organization_social` (or
   similarly named) among the app's authorized scopes.

## 4. Run the OAuth flow to get an access token

This is the one genuinely manual step — LinkedIn requires you personally to
click "Allow" as the page admin. There's no way for me to do this for you.

1. On the app's **Auth** tab, note the **Redirect URLs** section — add
   `https://www.linkedin.com/developers/tools/oauth/redirect` (LinkedIn's own
   OAuth token tool) as an authorized redirect URL if it's not already listed.
2. Go to https://www.linkedin.com/developers/tools/oauth/token-generator (or
   the equivalent "OAuth Token Tools" page linked from your app's Auth tab —
   naming/location may differ slightly from this).
3. Select your app, select the scope(s) that appeared after step 3 above
   (should include something like `w_organization_social`), and generate a
   token.
4. You'll be prompted to log in / confirm as the page admin — this is the
   authorization step only you can do.
5. Copy the resulting **access token**. This is what becomes the
   `LINKEDIN_ACCESS_TOKEN` GitHub secret. It expires in 60 days — mark a
   reminder to redo this step then, since there's no refresh token for this
   product tier.

## 5. Find the organization URN

The access token alone isn't enough — the post also needs to say *which*
organization it's posting as.

1. With the access token from step 4, run:
   ```bash
   curl -H "Authorization: Bearer <your-access-token>" \
     "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee"
   ```
2. The response includes an `organization` field shaped like
   `urn:li:organization:12345678`. That whole string (including the
   `urn:li:organization:` prefix) is the value for `LINKEDIN_ORG_URN`.
3. Alternatively, the numeric ID is visible in the URL when you're on the
   JayEdge page's admin view (`linkedin.com/company/<numeric-id>/admin/...`).

## 6. Set the GitHub secrets

Once you have both values:

```bash
gh secret set LINKEDIN_ACCESS_TOKEN --repo Jay-Ecommerce/validate-api --body "<token from step 4>"
gh secret set LINKEDIN_ORG_URN --repo Jay-Ecommerce/validate-api --body "urn:li:organization:<id from step 5>"
```

(Or paste them into the repo's Settings → Secrets and variables → Actions in
the GitHub web UI, if you'd rather not put a token in shell history.)

## 7. Verify it end-to-end

```bash
gh workflow run linkedin-3x-weekly.yml --repo Jay-Ecommerce/validate-api
gh run list --repo Jay-Ecommerce/validate-api --workflow=linkedin-3x-weekly.yml --limit 1
```

Check the JayEdge Company Page feed for the post. After that, the Mon/Wed/Fri
schedule takes over automatically — no further manual steps until the token
expires in 60 days.

## What happens if this stalls

If the Community Management API request in step 3 is rejected or takes too
long, the workflow will just keep failing harmlessly (clear "not set" or
403 error in the Actions log, no partial/broken posts) until the secrets
exist — nothing else depends on this working, and the rest of the marketing
automation (Dev.to, revenue reports) is unaffected either way.
