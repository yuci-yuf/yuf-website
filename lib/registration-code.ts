import crypto from "crypto";

/**
 * Human-friendly, non-sequential registration code, e.g. `YUF26-8F3KQ2`.
 *
 * Non-sequential on purpose: a global sequential counter is a write hot-spot in
 * Firestore under heavy concurrency. Uses a Crockford-style alphabet (no I/L/O/U)
 * to avoid ambiguity when read aloud or typed at the entry desk.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateRegistrationCode(): string {
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return `YUF26-${code}`;
}
