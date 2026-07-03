/**
 * Credit card number format validation: Luhn checksum + brand detection by IIN range.
 * Pure algorithm — does NOT verify the card is real, active, or chargeable, and never
 * contacts a payment network. Intended for client-side-style input validation only.
 */

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "unknown";

const BRAND_PATTERNS: Array<{ brand: CardBrand; pattern: RegExp }> = [
  { brand: "visa", pattern: /^4\d{12}(\d{3})?(\d{3})?$/ },
  { brand: "mastercard", pattern: /^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/ },
  { brand: "amex", pattern: /^3[47]\d{13}$/ },
  { brand: "discover", pattern: /^6(011\d{12}|5\d{14}|4[4-9]\d{13})$/ },
  { brand: "diners", pattern: /^3(0[0-5]\d{11}|[68]\d{12,13})$/ },
  { brand: "jcb", pattern: /^35\d{14}$/ },
  { brand: "unionpay", pattern: /^62\d{14,17}$/ },
];

export interface CreditCardValidationResult {
  valid: boolean;
  brand: CardBrand;
  luhnValid: boolean;
  formatted: string | null;
  errors: string[];
}

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function detectBrand(digits: string): CardBrand {
  for (const { brand, pattern } of BRAND_PATTERNS) {
    if (pattern.test(digits)) return brand;
  }
  return "unknown";
}

export function validateCreditCard(rawInput: string): CreditCardValidationResult {
  const digits = (rawInput ?? "").replace(/[\s-]/g, "");
  const errors: string[] = [];

  if (!/^\d{12,19}$/.test(digits)) {
    return { valid: false, brand: "unknown", luhnValid: false, formatted: null, errors: ["Card number must be 12-19 digits"] };
  }

  const luhnValid = luhnCheck(digits);
  if (!luhnValid) errors.push("Luhn checksum failed");

  const brand = detectBrand(digits);
  if (brand === "unknown") errors.push("Unrecognized card brand / IIN range");

  const valid = luhnValid && brand !== "unknown";
  const formatted = valid ? (digits.match(/.{1,4}/g)?.join(" ") ?? digits) : null;

  return { valid, brand, luhnValid, formatted, errors };
}
