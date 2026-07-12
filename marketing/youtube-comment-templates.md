# YouTube comment templates — for Jay to post manually

Not automated — same reasoning as the Reddit/Show HN/ProductHunt drafts:
a real account, genuinely participating, posting under Jay's own identity.
Candidate videos below were found via web search this session (titles,
channels, and approximate upload dates as returned by search — not
manually opened and watched frame-by-frame, so double-check a video is
still up, still on-topic, and the top comments don't already cover the
same ground before posting).

## Important cautions — read before posting any of these

- **Each comment must be genuinely relevant to the specific video**, not
  blindly copy-pasted from this list onto ten different videos. Watch (or
  at least skim) the actual video first — if it doesn't match what a
  template assumes it covers, adapt the wording or skip it.
- **Repetitive, near-identical comments across many videos get flagged as
  spam by YouTube** (and by viewers, who screenshot-and-call-out obvious
  copy-paste marketing). If you post more than one of these, vary the
  wording meaningfully between them — don't just swap the video's topic
  noun.
- **Lead with the genuine comment, not the plug.** Every template below is
  written so the API mention is a secondary "if useful" aside after a real
  reaction to the video's content — not the point of the comment. If a
  comment doesn't work without the plug, don't post it.
- **Don't comment on every video in a topic area.** Pick the ones where you
  actually have something to add — a gap the video didn't cover, a gotcha
  worth flagging, a genuine question. One good comment beats five
  forgettable ones.
- Comments below use natural language, not markdown — YouTube comments
  don't render markdown, so links are pasted as plain URLs.

---

## IBAN validation videos

**Candidate video:** "Data Validation with Regex: Simple Steps" — covers
using a regex to validate Spanish IBAN numbers.
https://www.youtube.com/watch?v=ojhsLgelVfc

> Nice walkthrough. One thing worth flagging for anyone adapting this to
> other countries: IBAN length isn't the same everywhere (Germany is
> always 22 chars, Netherlands 18, Malta 31), so a regex tuned for Spain
> will happily accept the wrong length for another country's IBAN. Also
> worth adding the mod-97 checksum on top of the shape check — a regex
> alone can't verify it since that needs actual arithmetic over the
> string, not pattern matching. (Built an API that does the checksum +
> per-country length/structure if anyone wants to skip maintaining that
> table themselves — validate-api.jay-trading.workers.dev)

**General-purpose alternate**, for a video explaining the mod-97 algorithm
conceptually (search "IBAN check digit calculation" turns up several
finance-explainer-style videos that cover the math without code):

> Good explanation of the check-digit math. If anyone wants to see it as
> actual code: move the first 4 chars to the end, convert letters to
> numbers (A=10...Z=35), then mod 97 the whole thing and check it equals
> 1. The gotcha most from-scratch implementations hit is that the number
> gets way too big for a normal integer type (30+ digits), so you need
> BigInt or chunked modulo, not a plain `% 97`.

---

## Email validation / disposable email videos

**Candidate video:** "Email Verification on Signup - NodeJS + SendGrid
API" — covers sending a verification email on signup with Node/Express.
https://www.youtube.com/watch?v=Zyc9pZrFoWE

> This covers the "confirm they can receive mail" side well. If you want
> to filter out junk *before* sending the verification email at all
> (saves you burning email sends on addresses that are never going to
> convert), an MX record lookup is nearly free — one DNS call — and a
> disposable-domain check (10minutemail, mailinator, etc.) catches the
> throwaway-but-technically-valid ones. Neither replaces actually sending
> mail, but they're a cheap first filter before you get to this step.

---

## Phone number validation videos

**Candidate video:** "International phone numbers validation using
libphonenumber for PHP"
https://www.youtube.com/watch?v=AaRmo7wcfbw

> Glad this exists for PHP — libphonenumber is really the only correct
> way to do this, regex just can't keep up with how much numbering plans
> vary by country and change over time. Worth calling out for anyone
> watching who's on a different stack: there's a JS port
> (libphonenumber-js) that's much smaller than the full Google library if
> bundle size matters, same underlying metadata.

**Candidate video:** "Validate Phone Number in Python" (Shorts)
https://www.youtube.com/shorts/BOVyTklgZPs

> Worth a follow-up for anyone watching this: "valid" here means
> "matches the country's numbering plan," not "currently assigned to
> someone" — those are different guarantees and it's easy to assume the
> library is doing more than it is. Also, without a default country hint,
> local-format numbers (no + prefix) are genuinely ambiguous — worth
> passing the expected country explicitly if your form is scoped to one.

---

## QR code generation / QR API videos

**Candidate video:** "Create A Simple JavaScript App to Generate QR
Codes" — client-side QR generation with a JS library.
https://www.youtube.com/watch?v=qNiUlml9MDk

> Good intro for client-side generation. One thing worth knowing if
> anyone watching wants this server-side instead (e.g. generating QR
> codes for order confirmations, invoices): error-correction level
> matters more than people think — H (30% recovery) if you're overlaying
> a logo or printing somewhere it might get scuffed, L is fine for a
> clean digital display. Defaulting to max ECC everywhere just makes the
> code visually denser for no benefit.

**Candidate video:** "How to Create a QR Code Generator using HTML CSS
and Javascript"
https://www.youtube.com/watch?v=Dr3dJrBep8k

> Nice step by step. If anyone following along wants SVG output instead
> of a canvas/PNG render — worth it if the QR code ever gets resized,
> since PNG blurs on zoom and SVG doesn't (happens a lot with QR codes,
> someone always screenshots and enlarges). Most client-side libraries
> support an SVG render mode, or there are hosted APIs that return SVG
> directly if you'd rather not manage the rendering step at all (I built
> one — qr-api.jay-trading.workers.dev — mentioning since it's on topic).

---

## Currency conversion / exchange rate API videos

**Candidate video:** "I Build a Currency Converter with FREE API | React
Tutorial"
https://www.youtube.com/watch?v=iDs5Woed47c

> Solid tutorial. One thing worth adding for anyone building this for
> real (not just a demo): cache the rate table client-side for the day
> instead of hitting the API on every keystroke/render — most exchange
> rate sources (including ECB-sourced ones) only update once a business
> day anyway, so refetching constantly just burns your quota for
> identical data.

**Candidate video:** "Build A Currency Converter In React" (Web Dev
Simplified)
https://www.youtube.com/watch?v=XN5elYWiSuw

> Appreciate that this handles the loading/error state properly — a lot
> of currency converter tutorials skip that and just assume the API call
> always succeeds. Worth going one step further for anything real: fail
> loud (show an error) rather than silently falling back to a stale
> cached rate if the upstream source is down — matters more here than in
> most API integrations since it's directly about money.

---

## Notes on selection

Picked videos where a genuinely useful technical addition exists — a gap
the video didn't cover, a common gotcha, or a "here's the harder version
of this problem" note — rather than videos where the only thing to say is
"nice video, check out my API." That's the same bar used for the Stack
Overflow drafts (`stackoverflow-drafts.md`) and matches SO's own guidance
on disclosed self-promotion: lead with real value, mention the product
once, briefly, only if actually relevant.
