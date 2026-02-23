import { useCallback } from 'react';
import { useDojo } from '../providers/DojoProvider';
import { decodeHints, feltToString, WINNING_HINT } from '../dojo/models';
import type { TileState, TileData } from '../dojo/models';
import {
  fetchTournaments,
  fetchTournamentAttempts,
  pollNewTournamentAttempt,
  type TournamentNode,
} from '../dojo/apollo';
import {
  proveTournamentGuess,
  type ProveResponse,
} from '../services/proverApi';

export interface TournamentGuessResult {
  clue: number[];
  cluePacked: number;
  tileStates: TileState[];
  isWin: boolean;
  isLoss: boolean;
  attemptNumber: number;
}

export interface TournamentResumedState {
  guesses: TileData[][];
  gameOver: 'won' | 'lost' | null;
  attemptCount: number;
}

export function useTournamentActions() {
  const { client, account, address: playerAddress } = useDojo();

  const listTournaments = useCallback(async (): Promise<TournamentNode[]> => {
    return fetchTournaments(20);
  }, []);

  const joinTournament = useCallback(
    async (tournamentId: number) => {
      if (!client || !account) throw new Error('Dojo not initialized');
      await client.tournament_manager.joinTournament(account, tournamentId);
    },
    [client, account],
  );

  const submitTournamentGuess = useCallback(
    async (
      tournamentId: number,
      guess: string,
      currentAttemptCount: number,
      maxAttempts: number,
    ): Promise<TournamentGuessResult> => {
      if (!client || !account || !playerAddress) throw new Error('Dojo not initialized');

      const proveResult: ProveResponse = await proveTournamentGuess(tournamentId, guess);

      await client.tournament_manager.submitGuess(
        account,
        tournamentId,
        proveResult.calldata,
      );

      await pollNewTournamentAttempt(tournamentId, playerAddress, currentAttemptCount);

      const tileStates = decodeHints(proveResult.cluePacked);
      const attemptNumber = currentAttemptCount + 1;
      const isWin = proveResult.cluePacked === WINNING_HINT;
      const isLoss = attemptNumber >= maxAttempts && !isWin;

      return {
        clue: proveResult.clue,
        cluePacked: proveResult.cluePacked,
        tileStates,
        isWin,
        isLoss,
        attemptNumber,
      };
    },
    [client, account, playerAddress],
  );

  const resumeTournament = useCallback(
    async (tournamentId: number): Promise<TournamentResumedState> => {
      if (!playerAddress) throw new Error('Dojo not initialized');

      const attempts = await fetchTournamentAttempts(tournamentId, playerAddress);

      const guesses: TileData[][] = attempts.map((attempt) => {
        const word = feltToString(attempt.guess_packed).toUpperCase();
        const tileStates = decodeHints(Number(attempt.clue_packed));
        return word.split('').map((letter, i) => ({
          letter,
          state: tileStates[i],
        }));
      });

      const lastAttempt = attempts[attempts.length - 1];
      const won = lastAttempt && Number(lastAttempt.clue_packed) === WINNING_HINT;
      const lost = attempts.length >= 6 && !won;

      return {
        guesses,
        gameOver: won ? 'won' : lost ? 'lost' : null,
        attemptCount: attempts.length,
      };
    },
    [playerAddress],
  );

  return {
    listTournaments,
    joinTournament,
    submitTournamentGuess,
    resumeTournament,
  };
}
