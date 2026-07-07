// Daily revenue summary, emailed via Resend.
//
// IMPORTANT: RapidAPI's own analytics API (GraphQL Platform API) is
// Enterprise-plan only — not available on a Basic/free provider account. It
// is also not something this script logs into the dashboard to scrape,
// because that would require storing Jay's RapidAPI login credentials as a
// GitHub secret for unattended automated login, which is a real security
// liability this project won't take on.
//
// Instead, this tracks incoming PayPal transactions (RapidAPI pays out via
// PayPal) as a revenue proxy. It's not real-time and lags RapidAPI's payout
// schedule, but it's the only source that's both free and doesn't require
// storing a password.
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REPORT_TO = process.env.REPORT_TO_EMAIL || "jonashaemmerle0504@gmail.com";
const REPORT_FROM = process.env.REPORT_FROM_EMAIL || "onboarding@resend.dev";

if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set — cannot send report.");
  process.exit(1);
}

async function getPaypalTransactions() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return { configured: false, transactions: [] };
  }

  const authRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!authRes.ok) throw new Error(`PayPal auth failed: ${authRes.status}`);
  const { access_token } = await authRes.json();

  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    fields: "transaction_info",
  });

  const txRes = await fetch(`https://api-m.paypal.com/v1/reporting/transactions?${params}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!txRes.ok) throw new Error(`PayPal transactions fetch failed: ${txRes.status}`);
  const json = await txRes.json();
  return { configured: true, transactions: json.transaction_details ?? [] };
}

function summarize(transactions) {
  const incoming = transactions.filter((t) => Number(t.transaction_info?.transaction_amount?.value ?? 0) > 0);
  const total = incoming.reduce((sum, t) => sum + Number(t.transaction_info.transaction_amount.value), 0);
  return { count: incoming.length, total: total.toFixed(2) };
}

const { configured, transactions } = await getPaypalTransactions();
const today = new Date().toISOString().slice(0, 10);

let html;
if (!configured) {
  html = `<p>PayPal credentials aren't configured yet, so this is a placeholder report for ${today}.</p>
<p>Once <code>PAYPAL_CLIENT_ID</code> and <code>PAYPAL_CLIENT_SECRET</code> are set as GitHub secrets, this email will show incoming PayPal transactions from the last 24 hours as a revenue proxy.</p>
<p>Note: this tracks PayPal payouts, not RapidAPI's own subscriber/usage analytics — RapidAPI's Analytics API requires an Enterprise plan. Check the RapidAPI Studio dashboard directly for subscriber counts and per-endpoint usage.</p>`;
} else {
  const { count, total } = summarize(transactions);
  html = `<h2>Validate API — revenue report for ${today}</h2>
<p><strong>${count}</strong> incoming PayPal transaction(s) in the last 24 hours, totaling <strong>$${total}</strong>.</p>
<p>This is a PayPal-payout proxy, not RapidAPI's own analytics (which require an Enterprise plan). For subscriber counts and per-endpoint usage, check <a href="https://rapidapi.com/provider/12125802/apis/validate7/analytics">RapidAPI Studio</a> directly.</p>`;
}

const emailRes = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: REPORT_FROM,
    to: REPORT_TO,
    subject: `Validate API revenue report — ${today}`,
    html,
  }),
});

if (!emailRes.ok) {
  const text = await emailRes.text();
  console.error(`Resend API returned ${emailRes.status}: ${text}`);
  process.exit(1);
}

console.log("Revenue report sent.");
