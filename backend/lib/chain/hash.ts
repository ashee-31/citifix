/**
 * Deterministic canonical hashing for CitiFix records.
 *
 * A complaint's "record hash" (cryptographic fingerprint) is computed from
 * stable complaint data:
 *
 *   complaint number + description + photo hash + location + timestamp
 *
 * The result is stored BOTH in the database AND on the blockchain.
 * Verifying a record means recalculating the hash from current data and
 * comparing it against the anchored hash. Any alteration to the stable
 * fields produces a different hash — tamper evidence.
 *
 * This module is intentionally dependency-light (pure string operations)
 * so it can be unit-tested exhaustively and reused in edge functions,
 * scripts and seeds.
 */

const encoder = new TextEncoder();

/** Compute SHA-256 hex digest for a string. */
export async function sha256Hex(input: string): Promise<string> {
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Canonical JSON serialization: sorted keys, no whitespace, deterministic
 * escaping. Two equivalent objects must produce byte-identical strings.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalJson(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

export interface CanonicalRecordInput {
  complaintNumber: string;
  description: string;
  photoHash: string | null;
  latitude: number;
  longitude: number;
  createdAt: string; // ISO timestamp
  category?: string;
}

/** Normalize numbers to fixed precision so 12.0 and 12 produce same hash. */
function num(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(6);
}

/** Build the canonical string for a complaint record. */
export function canonicalizeRecord(input: CanonicalRecordInput): string {
  return canonicalJson({
    complaintNumber: input.complaintNumber,
    description: input.description.trim().replace(/\s+/g, " "),
    photoHash: input.photoHash ?? "",
    latitude: num(input.latitude),
    longitude: num(input.longitude),
    createdAt: input.createdAt,
    // Status is deliberately excluded: it changes throughout the operational
    // workflow and would make a valid, historical anchor look tampered with.
    // Category is part of the original canonical record and is stable.
    category: input.category ?? "",
  });
}

/** Compute the record hash (SHA-256 of canonical form). */
export async function computeRecordHash(
  input: CanonicalRecordInput,
): Promise<string> {
  return sha256Hex(canonicalizeRecord(input));
}

/**
 * Verify that a record's content still matches its anchored hash.
 * Returns true only when the recalculation is byte-identical.
 */
export async function verifyRecordHash(
  input: CanonicalRecordInput,
  anchoredHash: string,
): Promise<boolean> {
  const current = await computeRecordHash(input);
  return current.toLowerCase() === anchoredHash.toLowerCase();
}

/** Demo-friendly synchronous hash for browser/seed use (not cryptographically anchored). */
export function demoHash(input: string): string {
  // FNV-1a 32-bit, hex-padded — used ONLY for visual demo seeds, never for
  // real anchoring/verification.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
