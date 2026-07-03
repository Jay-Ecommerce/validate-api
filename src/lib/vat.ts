/**
 * EU VAT number validation.
 *
 * Two layers:
 *  1. `checkVatFormat` — pure regex format check per country, always available, no network.
 *  2. `checkVatExistence` — calls the European Commission's free public VIES REST API
 *     (https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number), which is the
 *     EU's own official service explicitly designed for third-party VAT validation. No API
 *     key, no cost, no ToS restriction on programmatic use.
 */

const VAT_FORMAT_BY_COUNTRY: Record<string, RegExp> = {
  AT: /^U\d{8}$/,
  BE: /^0?\d{9}$/,
  BG: /^\d{9,10}$/,
  CY: /^\d{8}[A-Z]$/,
  CZ: /^\d{8,10}$/,
  DE: /^\d{9}$/,
  DK: /^\d{8}$/,
  EE: /^\d{9}$/,
  EL: /^\d{9}$/,
  ES: /^[A-Z0-9]\d{7}[A-Z0-9]$/,
  FI: /^\d{8}$/,
  FR: /^[A-Z0-9]{2}\d{9}$/,
  HR: /^\d{11}$/,
  HU: /^\d{8}$/,
  IE: /^\d{7}[A-Z]{1,2}$|^\d[A-Z]\d{5}[A-Z]$/,
  IT: /^\d{11}$/,
  LT: /^(\d{9}|\d{12})$/,
  LU: /^\d{8}$/,
  LV: /^\d{11}$/,
  MT: /^\d{8}$/,
  NL: /^\d{9}B\d{2}$/,
  PL: /^\d{10}$/,
  PT: /^\d{9}$/,
  RO: /^\d{2,10}$/,
  SE: /^\d{12}$/,
  SI: /^\d{8}$/,
  SK: /^\d{10}$/,
};

export interface VatFormatResult {
  formatValid: boolean;
  countryCode: string;
  vatNumber: string;
  errors: string[];
}

export function checkVatFormat(countryCodeInput: string, vatNumberInput: string): VatFormatResult {
  const countryCode = (countryCodeInput ?? "").trim().toUpperCase();
  const vatNumber = (vatNumberInput ?? "").replace(/[\s-]/g, "").toUpperCase();
  const errors: string[] = [];

  const pattern = VAT_FORMAT_BY_COUNTRY[countryCode];
  if (!pattern) {
    errors.push(`Unsupported or invalid EU country code: ${countryCode}`);
    return { formatValid: false, countryCode, vatNumber, errors };
  }

  const formatValid = pattern.test(vatNumber);
  if (!formatValid) {
    errors.push("VAT number does not match the expected format for this country");
  }

  return { formatValid, countryCode, vatNumber, errors };
}

export interface VatExistenceResult {
  checked: boolean;
  valid: boolean | null;
  name: string | null;
  address: string | null;
  source: "VIES" | "unavailable";
  error?: string;
}

const VIES_ENDPOINT = "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number";

/**
 * Calls the live VIES service. VIES has known intermittent downtime per member state,
 * so callers must treat `checked: false` as "unknown", not "invalid".
 */
export async function checkVatExistence(countryCode: string, vatNumber: string): Promise<VatExistenceResult> {
  try {
    const response = await fetch(VIES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode, vatNumber }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { checked: false, valid: null, name: null, address: null, source: "unavailable", error: `VIES responded with HTTP ${response.status}` };
    }

    const data = (await response.json()) as { valid?: boolean; name?: string; address?: string };
    return {
      checked: true,
      valid: data.valid ?? null,
      name: data.name && data.name !== "---" ? data.name : null,
      address: data.address && data.address !== "---" ? data.address : null,
      source: "VIES",
    };
  } catch (err) {
    return { checked: false, valid: null, name: null, address: null, source: "unavailable", error: err instanceof Error ? err.message : "Unknown error contacting VIES" };
  }
}
