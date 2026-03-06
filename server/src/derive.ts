import { createHmac } from 'node:crypto';
import { WORD_COUNT, WORDS } from './words.js';
import { wordToBytes } from './wordle.js';
import { computeCommitment, CommitmentOverflowError } from './circuit.js';

const MASTER_SECRET = process.env.MASTER_SECRET;

export function validateMasterSecret(): void {
  if (!MASTER_SECRET) {
    console.error('FATAL: MASTER_SECRET environment variable is required');
    process.exit(1);
  }
}

function hmac(data: string): Buffer {
  return createHmac('sha256', MASTER_SECRET!).update(data).digest();
}

export function deriveWordIndex(tournamentId: number): number {
  const hash = hmac(`word:${tournamentId}`);
  const val = hash.readUInt32BE(0);
  return val % WORD_COUNT;
}

export function deriveSalt(tournamentId: number, nonce: number): string {
  const hash = hmac(`salt:${tournamentId}:${nonce}`);
  // Use first 16 bytes as a 128-bit integer (always fits in felt252)
  const big = BigInt('0x' + hash.subarray(0, 16).toString('hex'));
  return big.toString();
}

export interface DerivedTournament {
  word: string;
  wordIndex: number;
  solution: number[];
  salt: string;
}

export function deriveTournament(tournamentId: number, nonce = 0): DerivedTournament {
  const wordIndex = deriveWordIndex(tournamentId);
  const word = WORDS[wordIndex];
  const solution = wordToBytes(word);
  const salt = deriveSalt(tournamentId, nonce);
  return { word, wordIndex, solution, salt };
}

// Cache valid nonces in memory to avoid recomputing commitments
const nonceCache = new Map<number, { nonce: number; commitment: string }>();

const MAX_NONCE_ATTEMPTS = 20;

/**
 * Find the first nonce whose commitment fits in felt252.
 * Caches the result so subsequent calls for the same tournament are instant.
 */
export async function resolveCommitment(
  tournamentId: number,
): Promise<{ nonce: number; commitment: string; derived: DerivedTournament }> {
  const cached = nonceCache.get(tournamentId);
  if (cached) {
    const derived = deriveTournament(tournamentId, cached.nonce);
    return { nonce: cached.nonce, commitment: cached.commitment, derived };
  }

  for (let nonce = 0; nonce < MAX_NONCE_ATTEMPTS; nonce++) {
    const derived = deriveTournament(tournamentId, nonce);
    try {
      const commitment = await computeCommitment(derived.solution, derived.salt);
      nonceCache.set(tournamentId, { nonce, commitment });
      return { nonce, commitment, derived };
    } catch (err) {
      if (err instanceof CommitmentOverflowError) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed to find valid commitment for tournament ${tournamentId} after ${MAX_NONCE_ATTEMPTS} attempts`);
}
