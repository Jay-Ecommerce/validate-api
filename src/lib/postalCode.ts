/**
 * Postal code format validation per country. This checks structure/format
 * only (like the IBAN checksum or VAT format check) — it does not verify
 * the code actually exists or is currently in use by a postal service.
 */

// ISO 3166-1 alpha-2 country code -> format regex. Patterns are the commonly
// published formats for each country's postal/zip code system.
const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
  GB: /^[A-Z]{1,2}\d[A-Z\d]?[ ]?\d[A-Z]{2}$/i,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  IT: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4}[ ]?[A-Z]{2}$/i,
  BE: /^\d{4}$/,
  AT: /^\d{4}$/,
  CH: /^\d{4}$/,
  PT: /^\d{4}-\d{3}$/,
  IE: /^[A-Z]\d{2}[ ]?[A-Z0-9]{4}$/i,
  SE: /^\d{3}[ ]?\d{2}$/,
  NO: /^\d{4}$/,
  DK: /^\d{4}$/,
  FI: /^\d{5}$/,
  PL: /^\d{2}-\d{3}$/,
  CZ: /^\d{3}[ ]?\d{2}$/,
  SK: /^\d{3}[ ]?\d{2}$/,
  HU: /^\d{4}$/,
  RO: /^\d{6}$/,
  BG: /^\d{4}$/,
  GR: /^\d{3}[ ]?\d{2}$/,
  HR: /^\d{5}$/,
  SI: /^\d{4}$/,
  EE: /^\d{5}$/,
  LV: /^LV-\d{4}$/i,
  LT: /^LT-\d{5}$/i,
  LU: /^\d{4}$/,
  MT: /^[A-Z]{3}[ ]?\d{2,4}$/i,
  CY: /^\d{4}$/,
  AU: /^\d{4}$/,
  NZ: /^\d{4}$/,
  JP: /^\d{3}-\d{4}$/,
  KR: /^\d{5}$/,
  CN: /^\d{6}$/,
  IN: /^\d{6}$/,
  SG: /^\d{6}$/,
  MY: /^\d{5}$/,
  TH: /^\d{5}$/,
  ID: /^\d{5}$/,
  PH: /^\d{4}$/,
  VN: /^\d{6}$/,
  BR: /^\d{5}-?\d{3}$/,
  MX: /^\d{5}$/,
  AR: /^[A-Z]?\d{4}[A-Z]{0,3}$/i,
  CL: /^\d{7}$/,
  CO: /^\d{6}$/,
  PE: /^\d{5}$/,
  ZA: /^\d{4}$/,
  EG: /^\d{5}$/,
  NG: /^\d{6}$/,
  KE: /^\d{5}$/,
  MA: /^\d{5}$/,
  IL: /^\d{5,7}$/,
  TR: /^\d{5}$/,
  SA: /^\d{5}(-\d{4})?$/,
  RU: /^\d{6}$/,
  UA: /^\d{5}$/,
};

export interface PostalCodeResult {
  valid: boolean;
  countryCode: string;
  postalCode: string;
  supported: boolean;
  errors: string[];
}

export function validatePostalCode(countryCodeInput: string, postalCodeInput: string): PostalCodeResult {
  const countryCode = (countryCodeInput ?? "").trim().toUpperCase();
  const postalCode = (postalCodeInput ?? "").trim();
  const errors: string[] = [];

  const pattern = POSTAL_CODE_PATTERNS[countryCode];
  if (!pattern) {
    errors.push(`No postal code format known for country '${countryCode}'`);
    return { valid: false, countryCode, postalCode, supported: false, errors };
  }

  if (postalCode.length === 0) {
    errors.push("Postal code is empty");
    return { valid: false, countryCode, postalCode, supported: true, errors };
  }

  const valid = pattern.test(postalCode);
  if (!valid) errors.push(`Postal code does not match the expected format for ${countryCode}`);

  return { valid, countryCode, postalCode, supported: true, errors };
}

export function supportedPostalCountries(): string[] {
  return Object.keys(POSTAL_CODE_PATTERNS).sort();
}
