import crypto from "crypto";
import type { Transaction } from "firebase-admin/firestore";

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
  // 256 % 32 === 0, so `% 32` maps 8 byte values to each symbol — no modulo bias.
  for (let i = 0; i < 6; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return `YUF26-${code}`;
}

/**
 * Reserve a GUARANTEED-UNIQUE registration code inside an existing transaction.
 *
 * The code is claimed by writing a marker doc whose ID *is* the code in the
 * `registrationCodes` collection. Firestore rejects a `create()` on an existing
 * doc id, so two concurrent orders can never take the same code — this is a hard
 * uniqueness guarantee, not a probabilistic one (the space is ~1B, but check-in
 * and invoice access key off this code, so an actual collision must be
 * impossible, not just unlikely).
 *
 * Regenerates on the rare clash. `tx.get` must be called before any writes in a
 * Firestore transaction, so we read-check each candidate; the create() is the
 * authoritative claim that also closes the read→write race window.
 *
 * @returns the claimed code. Throws if it can't find a free code in `maxTries`
 *          (astronomically unlikely — effectively "the code space is full").
 */
export async function claimUniqueRegistrationCode(
  tx: Transaction,
  db: FirebaseFirestore.Firestore,
  regId: string,
  maxTries = 6,
): Promise<string> {
  const codes = db.collection("registrationCodes");
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const code = generateRegistrationCode();
    const codeRef = codes.doc(code);
    const existing = await tx.get(codeRef);
    if (existing.exists) continue; // taken — regenerate
    // create() (not set()) so a racing transaction that claimed the same id
    // between our read and commit forces a retry of the whole transaction
    // rather than silently overwriting.
    tx.create(codeRef, { regId });
    return code;
  }
  throw new Error("CODE_ALLOCATION_FAILED");
}
