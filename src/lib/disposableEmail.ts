/**
 * Disposable/temporary email detection: checks the domain against a curated
 * list of known throwaway-email providers. No external API call — this is a
 * static list bundled at build time, since Workers has no filesystem and a
 * remote lookup would add latency and a point of failure to every check.
 */
import { checkEmailSyntax } from "./email.js";

// Curated from widely-known disposable/temp-mail providers. Not exhaustive —
// new disposable domains appear constantly — but covers the large majority
// of throwaway services actually used against public signup forms.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "mailinator2.com",
  "mailinator.net",
  "mailinater.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "10minutemail.com",
  "10minutemail.net",
  "10minemail.com",
  "20minutemail.com",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "tempmail.dev",
  "tempmailaddress.com",
  "throwawaymail.com",
  "throwaway.email",
  "yopmail.com",
  "yopmail.net",
  "yopmail.fr",
  "trashmail.com",
  "trashmail.net",
  "trash-mail.com",
  "dispostable.com",
  "maildrop.cc",
  "getnada.com",
  "mailnesia.com",
  "spamgourmet.com",
  "mohmal.com",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "moakt.com",
  "emailondeck.com",
  "mintemail.com",
  "mytemp.email",
  "burnermail.io",
  "harakirimail.com",
  "mailcatch.com",
  "mailsac.com",
  "inboxkitten.com",
  "tempinbox.com",
  "discard.email",
  "discardmail.com",
  "einrot.com",
  "fleckens.hu",
  "nowmymail.com",
  "spambog.com",
  "spamex.com",
  "anonbox.net",
  "1secmail.com",
  "1secmail.net",
  "1secmail.org",
  "33mail.com",
  "temp-mails.com",
  "emailtemporario.com.br",
  "correotemporal.org",
  "wegwerfmail.de",
  "wegwerfemail.de",
  "trbvm.com",
  "tmail.ws",
  "tmpmail.org",
  "tmpmail.net",
  "tmpeml.com",
  "moment.email",
  "luxusmail.org",
  "no-spam.ws",
  "mailtemp.info",
  "instantemailaddress.com",
  "getairmail.com",
  "airmail.cc",
  "jetable.org",
  "jetable.net",
  "kasmail.com",
  "mailexpire.com",
  "mailforspam.com",
  "meltmail.com",
  "spamfree24.org",
  "spamfree24.com",
  "temporaryemail.net",
  "temporaryemail.us",
  "e4ward.com",
  "emailisvalid.com",
  "boun.cr",
]);

export interface DisposableEmailResult {
  syntaxValid: boolean;
  domain: string | null;
  disposable: boolean | null;
  errors: string[];
}

export function checkDisposableEmail(rawInput: string): DisposableEmailResult {
  const syntax = checkEmailSyntax(rawInput);
  if (!syntax.syntaxValid || !syntax.domain) {
    return { syntaxValid: false, domain: null, disposable: null, errors: syntax.errors };
  }

  const domain = syntax.domain.toLowerCase();
  // Match the domain itself or any subdomain of a known disposable provider
  // (e.g. "abc.mailinator.com" should still flag as disposable).
  const disposable = [...DISPOSABLE_DOMAINS].some((d) => domain === d || domain.endsWith(`.${d}`));

  return { syntaxValid: true, domain, disposable, errors: [] };
}
