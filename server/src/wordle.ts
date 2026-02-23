/**
 * Wordle comparison logic — must exactly mirror:
 *   - contracts/src/systems/actions.cairo:159-219 (compare_words)
 *   - circuits/tweetle_wordle/src/main.nr (compute_clue)
 *
 * Clue values: 0=absent, 1=present (wrong position), 2=correct
 * Packed: s0*256 + s1*64 + s2*16 + s3*4 + s4
 */

export function computeClue(solution: number[], guess: number[]): number[] {
  const result = [0, 0, 0, 0, 0];
  const used = [false, false, false, false, false];

  // First pass: exact matches
  for (let i = 0; i < 5; i++) {
    if (guess[i] === solution[i]) {
      result[i] = 2;
      used[i] = true;
    }
  }

  // Second pass: wrong-position matches
  // For each non-exact guess letter, scan solution positions 0-4 in order
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 0) continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guess[i] === solution[j]) {
        result[i] = 1;
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

export function packClue(clue: number[]): number {
  return clue[0] * 256 + clue[1] * 64 + clue[2] * 16 + clue[3] * 4 + clue[4];
}

/** Convert a 5-letter word string to ASCII byte array */
export function wordToBytes(word: string): number[] {
  return Array.from(word).map((c) => c.charCodeAt(0));
}

/** Pack 5 ASCII bytes into a bigint (matches Cairo felt_to_bytes5 encoding) */
export function packWord(bytes: number[]): bigint {
  let packed = 0n;
  for (let i = 0; i < 5; i++) {
    packed = packed * 256n + BigInt(bytes[i]);
  }
  return packed;
}

/** Unpack a felt252 (bigint) back to a 5-letter word string */
export function unpackWord(packed: bigint): string {
  const bytes: number[] = [];
  let val = packed;
  for (let i = 0; i < 5; i++) {
    bytes.unshift(Number(val & 0xffn));
    val >>= 8n;
  }
  return String.fromCharCode(...bytes);
}

export const ALL_CORRECT_CLUE = 682; // 2*256 + 2*64 + 2*16 + 2*4 + 2
