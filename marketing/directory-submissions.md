# API directory submissions

Status of each directory you listed:

## public-apis/public-apis (GitHub)

Real, PR-based, mechanically automatable — but their CI lints entry format
strictly (alphabetical order within category, exact table columns, working
HTTPS link, no duplicate). Ready-to-submit entry below; I can open the actual
PR on request rather than doing it unprompted, since a first PR under your
GitHub identity is worth getting right rather than rushing.

Entry (goes under an appropriate category, likely "### Development" or a new
"Validation" subsection if the category structure allows it):

```
| [Validate](https://rapidapi.com/jonashaemecommerce/api/validate7) | IBAN, VAT, email, phone, credit card, and password validation | `apiKey` | Yes | Unknown |
```

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

## Next step

Say the word and I'll open the actual public-apis PR with the entry above.
