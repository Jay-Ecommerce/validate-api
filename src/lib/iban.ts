/**
 * IBAN validation per ISO 13616 (mod-97 checksum) with country-specific length table.
 * Pure algorithm — no network calls, no external service required.
 */

const IBAN_LENGTH_BY_COUNTRY: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
  BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23,
  GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26,
  IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20,
  LV: 21, LY: 25, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30,
  NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22,
  SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23,
  TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};

export interface IbanValidationResult {
  valid: boolean;
  formatted: string | null;
  countryCode: string | null;
  checkDigits: string | null;
  bban: string | null;
  errors: string[];
}

function mod97(numericString: string): number {
  let remainder = 0;
  for (const digit of numericString) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

/** Converts each letter A-Z to its numeric value 10-35, per ISO 13616. */
function ibanToNumericString(rearranged: string): string {
  let out = "";
  for (const ch of rearranged) {
    if (ch >= "0" && ch <= "9") {
      out += ch;
    } else {
      out += (ch.charCodeAt(0) - 55).toString();
    }
  }
  return out;
}

export function validateIban(rawInput: string): IbanValidationResult {
  const errors: string[] = [];
  const cleaned = (rawInput ?? "").replace(/\s+/g, "").toUpperCase();

  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { valid: false, formatted: null, countryCode: null, checkDigits: null, bban: null, errors: ["IBAN contains invalid characters"] };
  }

  const countryCode = cleaned.slice(0, 2);
  const checkDigits = cleaned.slice(2, 4);
  const bban = cleaned.slice(4);

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    errors.push("Missing or invalid 2-letter country code");
  }
  if (!/^[0-9]{2}$/.test(checkDigits)) {
    errors.push("Missing or invalid 2-digit check digits");
  }

  const expectedLength = IBAN_LENGTH_BY_COUNTRY[countryCode];
  if (expectedLength === undefined) {
    errors.push(`Unknown or unsupported country code: ${countryCode}`);
  } else if (cleaned.length !== expectedLength) {
    errors.push(`Invalid length for ${countryCode}: expected ${expectedLength}, got ${cleaned.length}`);
  }

  if (errors.length > 0) {
    return { valid: false, formatted: null, countryCode: countryCode || null, checkDigits: checkDigits || null, bban: bban || null, errors };
  }

  const rearranged = bban + countryCode + checkDigits;
  const numeric = ibanToNumericString(rearranged);
  const checksumValid = mod97(numeric) === 1;

  if (!checksumValid) {
    errors.push("Checksum (mod-97) validation failed");
  }

  const formatted = cleaned.match(/.{1,4}/g)?.join(" ") ?? cleaned;

  return {
    valid: checksumValid,
    formatted: checksumValid ? formatted : null,
    countryCode,
    checkDigits,
    bban,
    errors,
  };
}
