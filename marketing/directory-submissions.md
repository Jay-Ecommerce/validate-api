# API directory submissions

Status of each directory you listed:

## public-apis/public-apis (GitHub)

**Done (2026-07-08):** opened as PR #6518 — https://github.com/public-apis/public-apis/pull/6518
— added under the existing "Data Validation" category, inserted in the
correct alphabetical position relative to its neighbor. Note: that category
had a pre-existing alphabetical-order violation unrelated to this change
(VATlayer listed before Lob.com) — if their CI flags order, it's likely
that pre-existing issue, not the new entry. Watch the PR for review comments.

## APIs.guru (APIs-guru/openapi-directory)

Also PR-based, but their contribution process expects the OpenAPI spec
reformatted to their exact schema (specific `x-providerName`, `x-logo`,
`x-origin` metadata fields) and passing their own validator script before a
PR will be accepted. `openapi.yaml` in this repo isn't in that shape yet —
needs adaptation, not a blind copy. Flagging as a follow-up task rather than
guessing at their schema and shipping a PR likely to fail their CI.

## APIList.fun

No public submission API found — appears to be a manual web-form submission.
Not automatable; would need to be done by hand if you want to pursue it.

## RapidAPI Collections

Not a separate directory — this is a curation feature inside your existing
RapidAPI provider dashboard for the account already used to list validate-api.
Requires being logged into that dashboard; see the RapidAPI section of the
final report for the exact manual steps.

## Postman API Network

Requires its own free Postman account + publishing a Postman Collection —
account creation, so left for you to do (2026-07-08). Steps: create a
Postman account, import `openapi.yaml`, publish the resulting collection to
the Postman API Network from your workspace settings.

## "Mashape"

Mashape was RapidAPI's old name before a 2017 rebrand — this is the same
marketplace validate-api is already listed on, not a separate directory.
Nothing additional to do here.

## "any.run"

This is a malware-analysis sandbox, not an API directory — likely a mix-up
in the original request. Skipped; let me know if a different site was meant.
