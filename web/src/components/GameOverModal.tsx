import type { TileData, TileState } from '../dojo/models';
import { X } from 'lucide-react';

const TILE_BG: Record<TileState, string> = {
  empty: 'bg-tile-empty',
  filled: 'bg-tile-empty',
  correct: 'bg-tile-correct',
  present: 'bg-tile-present',
  absent: 'bg-tile-absent',
};

interface GameOverModalProps {
  isOpen: boolean;
  result: 'won' | 'lost';
  attempts: number;
  lastRow?: TileData[];
  onClose: () => void;
  onBack: () => void;
  onPlayNext?: () => void;
  playNextLabel?: string;
}

export function GameOverModal({
  isOpen,
  result,
  attempts,
  lastRow,
  onClose,
  onBack,
  onPlayNext,
  playNextLabel,
}: GameOverModalProps) {
  if (!isOpen) return null;

  const pointsEarned = result === 'won'
    ? attempts <= 2 ? 100 : attempts <= 4 ? 75 : 50
    : 0;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-8">
      <div className="w-full max-w-sm bg-bg-primary rounded-2xl py-10 px-6 border border-tile-border relative flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-brand transition-colors cursor-pointer bg-transparent border-none p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative mb-6">
          <div className={`absolute inset-0 blur-2xl rounded-full scale-125 ${result === 'won' ? 'bg-brand/20' : 'bg-error/10'}`} />
          <img 
            src="/mascot.png" 
            alt="Mascot" 
            className={`w-24 h-24 relative z-10 drop-shadow-xl ${result === 'lost' ? 'grayscale opacity-70 sepia-[0.3]' : 'animate-bounce-slow'}`} 
          />
        </div>

        <div className="bg-gradient-to-r from-accent to-[#D4941A] px-8 py-3 rounded-lg mb-5">
          <span className="font-display text-2xl text-text-primary tracking-wider">
            {result === 'won' ? "YOU'RE A PRO!" : 'TRY AGAIN'}
          </span>
        </div>

        {lastRow && (
          <div className="flex gap-2 mb-6">
            {lastRow.map((tile, i) => (
              <div
                key={i}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border-b-4 border-r-2 border-black/20 shadow-lg ${TILE_BG[tile.state]}`}
              >
                <span className="text-white font-display text-lg uppercase drop-shadow-sm">
                  {tile.letter}
                </span>
              </div>
            ))}
          </div>
        )}

        {result === 'won' && pointsEarned > 0 && (
          <p className="text-accent text-xl font-heading mb-1">+{pointsEarned} points</p>
        )}

        <p className="text-text-secondary text-base mb-8 text-center">
          {result === 'won'
            ? `Solved in ${attempts} attempt${attempts !== 1 ? 's' : ''}!`
            : 'Better luck next time!'}
        </p>

        {onPlayNext && (
          <button
            onClick={onPlayNext}
            className="w-full bg-puffy-purple text-secondary py-3.5 rounded-xl font-heading tracking-widest text-sm border-puffy-purple-border button-bubbly cursor-pointer mb-5"
          >
            {playNextLabel?.toUpperCase() || 'PLAY NEXT'}
          </button>
        )}

        <button
          onClick={onBack}
          className={`w-full py-3.5 rounded-xl font-heading tracking-widest text-sm transition-all button-bubbly cursor-pointer ${
            onPlayNext
              ? 'bg-bg-surface-light text-text-secondary border-tile-border/50 hover:text-text-primary'
              : 'bg-puffy-purple text-secondary border-puffy-purple-border'
          }`}
        >
          BACK TO HOME
        </button>
      </div>
    </div>
  );
}
