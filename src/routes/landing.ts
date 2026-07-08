import { Hono } from "hono";
import { handleSignup } from "../lib/signup.js";

export interface LandingEnv {
  Bindings: {
    EMAIL_SIGNUPS?: KVNamespace;
    RESEND_API_KEY?: string;
  };
}

export const landingRoute = new Hono<LandingEnv>();

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "Validate API",
  description:
    "Validation and utility toolkit API: IBAN, EU VAT, email, disposable-email detection, phone, credit card, postal code, password strength, and UUID generation.",
  url: "https://validate-api.jay-trading.workers.dev",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available, paid tiers on RapidAPI",
  },
  provider: {
    "@type": "Organization",
    name: "Validate API",
  },
};

const PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Validate API — IBAN, VAT, Email, Phone, Postal Code &amp; Password Validation API</title>
<meta name="description" content="A fast, reliable validation API for IBAN, EU VAT, email (incl. disposable-email detection), phone, credit card, postal code, and password strength. Free tier, pay-as-you-grow pricing on RapidAPI." />
<link rel="canonical" href="https://validate-api.jay-trading.workers.dev/" />
<meta property="og:title" content="Validate API — validation &amp; utility toolkit API" />
<meta property="og:description" content="IBAN, VAT, email, disposable-email, phone, credit card, postal code, and password validation in one API." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://validate-api.jay-trading.workers.dev/" />
<meta name="twitter:card" content="summary" />
<script type="application/ld+json">${JSON.stringify(STRUCTURED_DATA)}</script>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 3rem auto; padding: 0 1.5rem; line-height: 1.6; color: #1a1a1a; }
  h1 { font-size: 1.75rem; }
  code { background: #f2f2f2; padding: 0.15em 0.4em; border-radius: 4px; }
  ul { padding-left: 1.25rem; }
  form { margin-top: 2rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
  input[type="email"] { flex: 1; min-width: 220px; padding: 0.6rem 0.8rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; }
  button { padding: 0.6rem 1.2rem; border: none; border-radius: 6px; background: #1a1a1a; color: #fff; font-size: 1rem; cursor: pointer; }
  #signup-message { margin-top: 0.75rem; font-size: 0.9rem; }
  footer { margin-top: 3rem; font-size: 0.85rem; color: #666; }
</style>
</head>
<body>
<h1>Validate API</h1>
<p>A single API for the validation checks every backend ends up needing: IBAN, EU VAT, email (including disposable-email detection), phone number, credit card, postal code format, and password strength — plus UUID/password generation.</p>

<h2>Endpoints</h2>
<ul>
  <li><code>POST /v1/validate/iban</code> — IBAN checksum validation</li>
  <li><code>POST /v1/validate/vat</code> — EU VAT format + VIES existence check</li>
  <li><code>POST /v1/validate/email</code> — syntax + MX record check</li>
  <li><code>POST /v1/validate/disposable-email</code> — flags throwaway/temp-mail domains</li>
  <li><code>POST /v1/validate/phone</code> — international phone number validation</li>
  <li><code>POST /v1/validate/creditcard</code> — Luhn check + card brand detection</li>
  <li><code>POST /v1/validate/postal-code</code> — postal code format validation (50+ countries)</li>
  <li><code>POST /v1/password/strength</code> — entropy-based password strength scoring</li>
  <li><code>GET /v1/generate/uuid</code> — UUID generation</li>
</ul>

<h2>Pricing</h2>
<p>Free tier plus paid tiers, billed and metered through RapidAPI. <a href="https://rapidapi.com/search/validate">See current plans on RapidAPI &rarr;</a></p>

<h2>Get updates</h2>
<form id="signup-form">
  <input type="email" id="signup-email" name="email" placeholder="you@example.com" required />
  <button type="submit">Notify me</button>
</form>
<div id="signup-message"></div>

<footer>
  <p><a href="https://github.com/Jay-Ecommerce/validate-api">Source on GitHub</a></p>
</footer>

<script>
document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const msg = document.getElementById('signup-message');
  msg.textContent = 'Submitting...';
  try {
    const res = await fetch('/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      msg.textContent = data.alreadySubscribed ? "You're already on the list." : "Thanks — you're subscribed.";
    } else {
      msg.textContent = data.error || 'Something went wrong.';
    }
  } catch {
    msg.textContent = 'Network error — please try again.';
  }
});
</script>
</body>
</html>`;

landingRoute.get("/", (c) => c.html(PAGE_HTML));

landingRoute.post("/subscribe", async (c) => {
  let body: { email?: string } | null = null;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "Invalid JSON body" }, 400);
  }
  if (!body?.email || typeof body.email !== "string") {
    return c.json({ ok: false, error: "Field 'email' (string) is required" }, 400);
  }

  const result = await handleSignup(body.email, c.env.EMAIL_SIGNUPS, c.env.RESEND_API_KEY);
  return c.json(result, result.ok ? 200 : 400);
});
