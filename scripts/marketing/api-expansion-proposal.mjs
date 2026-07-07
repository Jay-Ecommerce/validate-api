// Opens a monthly GitHub issue proposing the next endpoint(s) to build, from a
// curated list of adjacent validation/utility checks. Deliberately does not
// write or deploy code — new production endpoints get implemented and
// reviewed like any other change to this repo, not shipped unattended based
// on an automated heuristic. See AUTOMATION_PLAN.md for why.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;

if (!GITHUB_TOKEN || !REPO) {
  console.error("GITHUB_TOKEN or GITHUB_REPOSITORY is not set.");
  process.exit(1);
}

// Ranked by: same "format/checksum validation, no paid upstream dependency"
// shape as the existing endpoints, so they fit the API's identity and stay
// within the free-tier-friendly cost model.
const CANDIDATES = [
  {
    name: "validate/postal-code",
    rationale: "Postal/ZIP code format validation per country (pattern-based, offline, no external calls) — same shape as IBAN/VAT, frequently needed alongside address forms.",
  },
  {
    name: "validate/domain",
    rationale: "Domain name syntax + optional live DNS resolution check, sibling to the existing email MX check, useful standalone for signup/webhook-URL validation.",
  },
  {
    name: "generate/otp",
    rationale: "Time-based one-time password (TOTP) secret + code generation/verification (RFC 6238), offline, complements the existing password generator.",
  },
  {
    name: "validate/color",
    rationale: "Hex/RGB/HSL color format validation and conversion between formats — offline, small, occasionally requested in dev-tool API bundles.",
  },
  {
    name: "validate/json-schema",
    rationale: "Validate a JSON payload against a provided JSON Schema — offline (ajv or similar), broader utility than the validation-specific endpoints, worth scoping carefully since it's a bigger surface area than the others.",
  },
];

const monthLabel = new Date().toISOString().slice(0, 7);
const monthIndex = new Date().getUTCMonth();
const pickCount = 2;
const proposals = [];
for (let i = 0; i < pickCount; i++) {
  proposals.push(CANDIDATES[(monthIndex + i) % CANDIDATES.length]);
}

const body = `Monthly API expansion proposal for ${monthLabel}. These are candidates, not decisions — review and either close this if none fit, or turn one into a real PR.

${proposals.map((p) => `### \`${p.name}\`\n\n${p.rationale}\n`).join("\n")}

Nothing here has been implemented or deployed. New endpoints go through the normal PR/review/CI/deploy pipeline like everything else in this repo.`;

const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: `API expansion proposal — ${monthLabel}`,
    body,
    labels: ["proposal", "api-expansion"],
  }),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`GitHub API returned ${res.status}: ${text}`);
  process.exit(1);
}

const json = await res.json();
console.log(`Opened proposal issue: ${json.html_url}`);
