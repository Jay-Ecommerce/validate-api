/**
 * Landing-page email signups: stores the address in KV (deduped) and sends a
 * welcome email via Resend. Resend's sandbox mode (no verified sending domain)
 * only delivers to the Resend account's own address, so in production today
 * this will only actually land in an inbox for that one address until a
 * domain is verified at resend.com/domains — everyone else's address still
 * gets stored in KV correctly, just without the welcome email delivering.
 */
import { checkEmailSyntax } from "./email.js";

export interface SignupResult {
  ok: boolean;
  alreadySubscribed: boolean;
  error?: string;
}

export async function handleSignup(
  email: string,
  kv: KVNamespace | undefined,
  resendApiKey: string | undefined,
): Promise<SignupResult> {
  const syntax = checkEmailSyntax(email);
  if (!syntax.syntaxValid) {
    return { ok: false, alreadySubscribed: false, error: "Invalid email address" };
  }
  if (!kv) {
    return { ok: false, alreadySubscribed: false, error: "Signup storage is not configured" };
  }

  const key = email.trim().toLowerCase();
  const existing = await kv.get(key);
  if (existing) {
    return { ok: true, alreadySubscribed: true };
  }

  await kv.put(key, new Date().toISOString());

  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: key,
          subject: "Welcome to Validate API",
          html: `<p>Thanks for signing up for Validate API updates.</p>
<p>Validate API is a validation/utility toolkit (IBAN, VAT, email, phone, credit card, disposable-email detection, postal codes, password strength, UUID generation) available on <a href="https://rapidapi.com/search/validate">RapidAPI</a>.</p>
<p>We'll email you when new endpoints ship.</p>`,
        }),
      });
    } catch {
      // Signup itself already succeeded (stored in KV); a failed welcome email
      // shouldn't fail the signup request.
    }
  }

  return { ok: true, alreadySubscribed: false };
}
