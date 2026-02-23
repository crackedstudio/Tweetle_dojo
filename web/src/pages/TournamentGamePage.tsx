import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentActions } from '../hooks/useTournamentActions';
import { useWallet } from '../providers/WalletProvider';
import type { TileData, TileState } from '../dojo/models';
import { WordleBoard } from '../components/WordleBoard';
import { Keyboard } from '../components/Keyboard';
import { ProvingBanner } from '../components/ProvingBanner';
import { GameOverModal } from '../components/GameOverModal';

const COLS = 5;
const MAX_ATTEMPTS = 6;

function getKeyboardStates(guesses: TileData[][]): Record<string, TileState> {
  const states: Record<string, TileState> = {};
  for (const row of guesses) {
    for (const tile of row) {
      const existing = states[tile.letter];
      if (tile.state === 'correct') {
        states[tile.letter] = 'correct';
      } else if (tile.state === 'present' && existing !== 'correct') {
        states[tile.letter] = 'present';
      } else if (!existing) {
        states[tile.letter] = tile.state;
      }
    }
  }
  return states;
}

export function TournamentGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account } = useWallet();
  const tournamentId = Number(id);
  const { submitTournamentGuess, resumeTournament } = useTournamentActions();

  const [guesses, setGuesses] = useState<TileData[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isProving, setIsProving] = useState(false);
  const [gameOver, setGameOver] = useState<'won' | 'lost' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [winAttempts, setWinAttempts] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentRow = guesses.length;
  const keyStates = getKeyboardStates(guesses);

  useEffect(() => {
    if (!account) {
      setInitializing(false);
      return;
    }
    let cancelled = false;
    async function init() {
      try {
        const state = await resumeTournament(tournamentId);
        if (!cancelled) {
          setGuesses(state.guesses);
          if (state.gameOver) {
            setGameOver(state.gameOver);
            setWinAttempts(state.attemptCount);
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [resumeTournament, tournamentId, account]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver || isProving) return;
      if (key === 'BACK') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < COLS) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, gameOver, isProving],
  );

  const handleSubmit = useCallback(async () => {
    if (currentGuess.length !== COLS || isProving || gameOver) return;
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    setError(null);
    setIsProving(true);
    try {
      const result = await submitTournamentGuess(
        tournamentId,
        currentGuess,
        guesses.length,
        MAX_ATTEMPTS,
      );
      const submittedRow: TileData[] = currentGuess.split('').map((letter, i) => ({
        letter,
        state: result.tileStates[i] || 'absent',
      }));
      setGuesses((prev) => [...prev, submittedRow]);
      setCurrentGuess('');

      if (result.isWin) {
        setGameOver('won');
        setWinAttempts(result.attemptNumber);
        setTimeout(() => setShowModal(true), 400);
      } else if (result.isLoss) {
        setGameOver('lost');
        setTimeout(() => setShowModal(true), 400);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProving(false);
    }
  }, [currentGuess, isProving, gameOver, account, guesses.length, submitTournamentGuess, tournamentId]);

  // Build board
  const board: TileData[][] = [];
  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    if (r < guesses.length) {
      board.push(guesses[r]);
    } else if (r === currentRow) {
      const row: TileData[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          letter: currentGuess[c] || '',
          state: currentGuess[c] ? 'filled' : 'empty',
        });
      }
      board.push(row);
    } else {
      board.push(
        Array.from({ length: COLS }, (): TileData => ({ letter: '', state: 'empty' })),
      );
    }
  }

  if (initializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-text-secondary text-sm">Loading tournament...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-bg-surface px-4 py-3 text-center">
        <h2 className="font-heading text-base text-text-primary">
          Tournament #{tournamentId}
        </h2>
        <p className="text-brand text-xs font-semibold tracking-[2px]">
          ZK-VERIFIED MODE
        </p>
      </div>

      {isProving && <ProvingBanner />}

      {error && (
        <div className="mx-4 mt-2 px-4 py-3 rounded-lg bg-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {/* Board */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {guesses.length === 0 && currentGuess.length === 0 && (
          <p className="text-text-muted text-sm font-semibold tracking-wider mb-3">
            MAKE YOUR FIRST GUESS!
          </p>
        )}
        <WordleBoard board={board} />
      </div>

      {/* Keyboard */}
      <div className="pb-4 max-w-lg mx-auto w-full">
        <Keyboard
          keyStates={keyStates}
          onKeyPress={handleKeyPress}
          onSubmit={handleSubmit}
          disabled={isProving || !!gameOver}
        />
      </div>

      {/* Modal */}
      {gameOver && (
        <GameOverModal
          isOpen={showModal}
          result={gameOver}
          attempts={winAttempts}
          lastRow={guesses[guesses.length - 1]}
          onClose={() => setShowModal(false)}
          onBack={() => navigate('/')}
        />
      )}
    </div>
  );
}
