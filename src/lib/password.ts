/**
 * Password strength scoring (pure, local) and breach-check via the HaveIBeenPwned
 * "Pwned Passwords" k-anonymity API (https://haveibeenpwned.com/API/v3#PwnedPasswords).
 *
 * Privacy: only the first 5 characters of the SHA-1 hash are ever sent over the network.
 * The full password and full hash never leave this process. This is the exact usage
 * pattern HIBP designed and documents for third-party integrations — no API key required.
 */

export type StrengthLabel = "very-weak" | "weak" | "fair" | "strong" | "very-strong";

export interface PasswordStrengthResult {
  score: number; // 0-100
  label: StrengthLabel;
  entropyBits: number;
  suggestions: string[];
}

function characterSetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 33;
  return size || 1;
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const suggestions: string[] = [];
  const length = password.length;

  const poolSize = characterSetSize(password);
  const entropyBits = length > 0 ? length * Math.log2(poolSize) : 0;

  if (length < 8) suggestions.push("Use at least 8 characters, ideally 12+");
  if (!/[a-z]/.test(password)) suggestions.push("Add lowercase letters");
  if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters");
  if (!/[0-9]/.test(password)) suggestions.push("Add numbers");
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push("Add symbols");
  if (/^(.)\1+$/.test(password)) suggestions.push("Avoid repeating the same character");
  if (/^(0123456789|abcdefgh|qwerty|password|letmein)/i.test(password)) {
    suggestions.push("Avoid common sequences and dictionary words");
  }

  let score = Math.min(100, Math.round((entropyBits / 80) * 100));
  if (/^(0123456789|abcdefgh|qwerty|password|letmein)/i.test(password)) {
    score = Math.min(score, 10);
  }

  let label: StrengthLabel;
  if (score < 20) label = "very-weak";
  else if (score < 40) label = "weak";
  else if (score < 60) label = "fair";
  else if (score < 80) label = "strong";
  else label = "very-strong";

  return { score, label, entropyBits: Math.round(entropyBits * 10) / 10, suggestions };
}

async function sha1Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export interface BreachCheckResult {
  checked: boolean;
  breached: boolean | null;
  occurrences: number;
  error?: string;
}

const HIBP_RANGE_ENDPOINT = "https://api.pwnedpasswords.com/range/";

export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`${HIBP_RANGE_ENDPOINT}${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return { checked: false, breached: null, occurrences: 0, error: `HIBP responded with HTTP ${response.status}` };
    }

    const body = await response.text();
    for (const line of body.split("\n")) {
      const [suffixCandidate, count] = line.trim().split(":");
      if (suffixCandidate === suffix) {
        return { checked: true, breached: true, occurrences: Number(count ?? 0) };
      }
    }

    return { checked: true, breached: false, occurrences: 0 };
  } catch (err) {
    return { checked: false, breached: null, occurrences: 0, error: err instanceof Error ? err.message : "Unknown error contacting HIBP" };
  }
}
