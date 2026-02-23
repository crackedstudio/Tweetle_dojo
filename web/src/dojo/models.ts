// ── Tile types ──

export type TileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export interface TileData {
  letter: string;
  state: TileState;
}

// ── hint_packed decoder ──
// hint_packed encodes 5 tile states in a u16:
//   hint = s0*256 + s1*64 + s2*16 + s3*4 + s4
// where 0=absent, 1=present, 2=correct

const HINT_DIVISORS = [256, 64, 16, 4, 1];
const HINT_TO_STATE: Record<number, TileState> = {
  0: 'absent',
  1: 'present',
  2: 'correct',
};

export const WINNING_HINT = 682; // 2*256 + 2*64 + 2*16 + 2*4 + 2

export function decodeHints(hintPacked: number): TileState[] {
  return HINT_DIVISORS.map((div) => {
    const val = Math.floor(hintPacked / div) % 4;
    return HINT_TO_STATE[val] ?? 'absent';
  });
}

// ── felt252 <-> string encoding ──

export function stringToFelt(word: string): string {
  let val = BigInt(0);
  for (let i = 0; i < word.length; i++) {
    val = val * BigInt(256) + BigInt(word.charCodeAt(i));
  }
  return '0x' + val.toString(16);
}

export function feltToString(felt: string | bigint): string {
  let n = typeof felt === 'string' ? BigInt(felt) : felt;
  const bytes: number[] = [];
  while (n > 0n) {
    bytes.unshift(Number(n % 256n));
    n = n / 256n;
  }
  return String.fromCharCode(...bytes);
}
