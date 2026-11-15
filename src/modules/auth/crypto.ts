import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

const SCRYPT_PREFIX = "scrypt";
const SALT_BYTES = 16;
const KEY_LEN = 64;
const SCRYPT_OPTIONS: ScryptOptions = {
  N: 16384,
  r: 8,
  p: 1,
};

// Unambiguous Crockford-inspired uppercase alphabet (excludes 0, O, 1, I, L).
const RECOVERY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function deriveKey(
  secret: string,
  saltHex: string,
  options: ScryptOptions = SCRYPT_OPTIONS,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(
      secret.normalize("NFKC"),
      Buffer.from(saltHex, "hex"),
      KEY_LEN,
      options,
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(derivedKey);
      },
    );
  });
}

/**
 * Hashes a user password or recovery code using a per-record random salt and Node scrypt.
 */
export async function hashSecret(secret: string): Promise<string> {
  const saltHex = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = await deriveKey(secret, saltHex);
  return `${SCRYPT_PREFIX}$${saltHex}$${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext secret against a stored scrypt hash in constant time.
 */
export async function verifySecret(
  secret: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== SCRYPT_PREFIX) {
    return false;
  }

  const [, saltHex, hashHex] = parts;
  if (
    !saltHex ||
    !hashHex ||
    !/^[0-9a-f]+$/i.test(saltHex) ||
    !/^[0-9a-f]+$/i.test(hashHex) ||
    saltHex.length !== SALT_BYTES * 2 ||
    hashHex.length !== KEY_LEN * 2
  ) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const candidate = await deriveKey(secret, saltHex);

  if (expected.length !== candidate.length) {
    return false;
  }

  return timingSafeEqual(expected, candidate);
}

function randomAlphabetChars(length: number): string {
  const alphabetLen = RECOVERY_ALPHABET.length;
  const maxUnbiasedByte = Math.floor(256 / alphabetLen) * alphabetLen;
  let result = "";

  while (result.length < length) {
    const chunk = randomBytes(length * 2);
    for (const byte of chunk) {
      if (byte >= maxUnbiasedByte) {
        continue;
      }
      result += RECOVERY_ALPHABET[byte % alphabetLen];
      if (result.length === length) {
        break;
      }
    }
  }

  return result;
}

/**
 * Generates an offline-friendly, human-readable one-time recovery code (TGR-XXXXX-XXXXX).
 */
export function generateRecoveryCode(): string {
  const token = randomAlphabetChars(10);
  return `TGR-${token.slice(0, 5)}-${token.slice(5)}`;
}

/**
 * Normalizes user-entered recovery codes (tolerant of lowercase, missing prefix, spaces, or dashes).
 */
export function normalizeRecoveryCode(rawInput: string): string | null {
  const stripped = rawInput
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const body = stripped.startsWith("TGR") ? stripped.slice(3) : stripped;
  if (body.length !== 10) {
    return null;
  }

  for (const ch of body) {
    if (!RECOVERY_ALPHABET.includes(ch)) {
      return null;
    }
  }

  return `TGR-${body.slice(0, 5)}-${body.slice(5)}`;
}

