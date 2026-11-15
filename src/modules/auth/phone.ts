const NIGERIAN_E164_REGEX = /^\+234[789][01]\d{8}$/;

/**
 * Normalizes Nigerian mobile phone inputs (e.g. "08031234567", "2348031234567",
 * "+234 803 123 4567", or "+234 0803 123 4567") into canonical E.164 "+234XXXXXXXXXX".
 * Returns null when the input is not a valid Nigerian GSM mobile number.
 */
export function normalizeNigerianPhone(rawInput: string): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  // Allow common formatting characters only; reject unexpected letters or punctuation.
  if (!/^[+\d\s().-]+$/.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");
  let candidate: string | null = null;

  if (digits.length === 11 && digits.startsWith("0")) {
    candidate = `+234${digits.slice(1)}`;
  } else if (digits.length === 13 && digits.startsWith("234")) {
    candidate = `+${digits}`;
  } else if (digits.length === 14 && digits.startsWith("2340")) {
    candidate = `+234${digits.slice(4)}`;
  }

  if (!candidate || !NIGERIAN_E164_REGEX.test(candidate)) {
    return null;
  }

  return candidate;
}

export function isValidNigerianPhone(rawInput: string): boolean {
  return normalizeNigerianPhone(rawInput) !== null;
}

/**
 * Formats canonical "+2348031234567" into readable local style "0803 123 4567".
 */
export function formatNigerianPhoneLocal(canonicalE164: string): string {
  const normalized = normalizeNigerianPhone(canonicalE164);
  if (!normalized) {
    return canonicalE164;
  }
  const local = `0${normalized.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

