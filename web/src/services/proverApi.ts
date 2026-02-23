import { PROVER_URL } from '../env';

export interface CreateTournamentResponse {
  commitment: string;
  salt: string;
  wordIndex: number;
  solutionPacked: string;
}

export interface ProveResponse {
  calldata: string[];
  clue: number[];
  cluePacked: number;
  guess: string;
}

export interface RevealResponse {
  solution: string;
  solutionIndex: number;
  salt: string;
  solutionPacked: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${PROVER_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Prover API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function createTournament(wordIndex?: number): Promise<CreateTournamentResponse> {
  return apiFetch('/tournament/create', {
    method: 'POST',
    body: JSON.stringify(wordIndex !== undefined ? { wordIndex } : {}),
  });
}

export async function registerTournament(
  id: number,
  salt: string,
  wordIndex: number,
  commitment: string,
): Promise<void> {
  await apiFetch(`/tournament/${id}/register`, {
    method: 'POST',
    body: JSON.stringify({ salt, wordIndex, commitment }),
  });
}

export async function proveTournamentGuess(
  tournamentId: number,
  guess: string,
): Promise<ProveResponse> {
  return apiFetch(`/tournament/${tournamentId}/prove`, {
    method: 'POST',
    body: JSON.stringify({ guess }),
  });
}

export async function revealTournament(tournamentId: number): Promise<RevealResponse> {
  return apiFetch(`/tournament/${tournamentId}/reveal`);
}
