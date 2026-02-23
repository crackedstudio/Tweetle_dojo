import { DojoProvider, type DojoCall } from '@dojoengine/core';
import { Account, AccountInterface, type BigNumberish } from 'starknet';

export function setupWorld(provider: DojoProvider) {

  // ── actions ──

  const build_actions_startGame_calldata = (): DojoCall => {
    return {
      contractName: 'actions',
      entrypoint: 'start_game',
      calldata: [],
    };
  };

  const actions_startGame = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_startGame_calldata(),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_actions_submitGuess_calldata = (gameId: BigNumberish, guess: BigNumberish): DojoCall => {
    return {
      contractName: 'actions',
      entrypoint: 'submit_guess',
      calldata: [gameId, guess],
    };
  };

  const actions_submitGuess = async (snAccount: Account | AccountInterface, gameId: BigNumberish, guess: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_submitGuess_calldata(gameId, guess),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // ── daily_game ──

  const build_daily_game_getOrCreateDailyGame_calldata = (): DojoCall => {
    return {
      contractName: 'daily_game',
      entrypoint: 'get_or_create_daily_game',
      calldata: [],
    };
  };

  const daily_game_getOrCreateDailyGame = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        build_daily_game_getOrCreateDailyGame_calldata(),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_daily_game_joinDailyGame_calldata = (gameId: BigNumberish): DojoCall => {
    return {
      contractName: 'daily_game',
      entrypoint: 'join_daily_game',
      calldata: [gameId],
    };
  };

  const daily_game_joinDailyGame = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        build_daily_game_joinDailyGame_calldata(gameId),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_daily_game_submitDailyGuess_calldata = (gameId: BigNumberish, guess: BigNumberish): DojoCall => {
    return {
      contractName: 'daily_game',
      entrypoint: 'submit_daily_guess',
      calldata: [gameId, guess],
    };
  };

  const daily_game_submitDailyGuess = async (snAccount: Account | AccountInterface, gameId: BigNumberish, guess: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        build_daily_game_submitDailyGuess_calldata(gameId, guess),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // ── tournament_manager ──

  const build_tournament_manager_joinTournament_calldata = (tournamentId: BigNumberish): DojoCall => {
    return {
      contractName: 'tournament_manager',
      entrypoint: 'join_tournament',
      calldata: [tournamentId],
    };
  };

  const tournament_manager_joinTournament = async (snAccount: Account | AccountInterface, tournamentId: BigNumberish) => {
    try {
      return await provider.execute(
        snAccount,
        build_tournament_manager_joinTournament_calldata(tournamentId),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_tournament_manager_submitGuess_calldata = (tournamentId: BigNumberish, fullProofWithHints: string[]): DojoCall => {
    return {
      contractName: 'tournament_manager',
      entrypoint: 'submit_guess',
      calldata: [tournamentId, fullProofWithHints.length, ...fullProofWithHints],
    };
  };

  const tournament_manager_submitGuess = async (
    snAccount: Account | AccountInterface,
    tournamentId: BigNumberish,
    fullProofWithHints: string[],
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_tournament_manager_submitGuess_calldata(tournamentId, fullProofWithHints),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // ── player_system ──

  const build_player_system_registerPlayer_calldata = (username: BigNumberish, referrer: string): DojoCall => {
    return {
      contractName: 'player_system',
      entrypoint: 'register_player',
      calldata: [username, referrer],
    };
  };

  const player_system_registerPlayer = async (snAccount: Account | AccountInterface, username: BigNumberish, referrer: string) => {
    try {
      return await provider.execute(
        snAccount,
        build_player_system_registerPlayer_calldata(username, referrer),
        'tweetle_dojo',
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    actions: {
      startGame: actions_startGame,
      buildStartGameCalldata: build_actions_startGame_calldata,
      submitGuess: actions_submitGuess,
      buildSubmitGuessCalldata: build_actions_submitGuess_calldata,
    },
    daily_game: {
      getOrCreateDailyGame: daily_game_getOrCreateDailyGame,
      buildGetOrCreateDailyGameCalldata: build_daily_game_getOrCreateDailyGame_calldata,
      joinDailyGame: daily_game_joinDailyGame,
      buildJoinDailyGameCalldata: build_daily_game_joinDailyGame_calldata,
      submitDailyGuess: daily_game_submitDailyGuess,
      buildSubmitDailyGuessCalldata: build_daily_game_submitDailyGuess_calldata,
    },
    player_system: {
      registerPlayer: player_system_registerPlayer,
      buildRegisterPlayerCalldata: build_player_system_registerPlayer_calldata,
    },
    tournament_manager: {
      joinTournament: tournament_manager_joinTournament,
      buildJoinTournamentCalldata: build_tournament_manager_joinTournament_calldata,
      submitGuess: tournament_manager_submitGuess,
      buildSubmitGuessCalldata: build_tournament_manager_submitGuess_calldata,
    },
  };
}
