import { useEffect, useCallback } from 'react';
import type { TileState } from '../dojo/models';
import { Delete } from 'lucide-react';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const KEY_STYLE: Record<string, string> = {
  correct: 'bg-tile-correct border-tile-correct/50 text-white',
  present: 'bg-tile-present border-tile-present/50 text-secondary',
  absent: 'bg-tile-absent border-tile-absent/50 text-text-secondary opacity-60',
};

interface KeyboardProps {
  keyStates: Record<string, TileState>;
  onKeyPress: (key: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function Keyboard({ keyStates, onKeyPress, onSubmit, disabled }: KeyboardProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        onSubmit();
      } else if (key === 'BACKSPACE') {
        onKeyPress('BACK');
      } else if (/^[A-Z]$/.test(key)) {
        onKeyPress(key);
      }
    },
    [disabled, onKeyPress, onSubmit],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="flex flex-col gap-2 px-2 max-w-2xl mx-auto select-none">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1.5 lg:gap-2">
          {row.map((key) => {
            const state = keyStates[key];
            const hasState = state && state !== 'empty' && state !== 'filled';
            const isWide = key === 'ENTER' || key === 'BACK';
            const bgClass = hasState ? KEY_STYLE[state] : 'bg-bg-surface-light border-tile-border/40 text-text-primary';

            return (
              <button
                key={key}
                onClick={() => {
                  if (key === 'ENTER') onSubmit();
                  else onKeyPress(key);
                }}
                disabled={disabled}
                className={`
                  h-[56px] lg:h-[64px] rounded-xl lg:rounded-2xl border-b-4 border-r-2 
                  flex items-center justify-center transition-all cursor-pointer 
                  disabled:opacity-50 active:border-b-0 active:border-r-0 
                  active:translate-y-1 active:translate-x-0.5 group 
                  ${bgClass} 
                  ${isWide ? 'px-4 lg:px-6 text-[10px] font-heading tracking-widest' : 'w-10 lg:w-12 text-lg font-heading'}
                `}
              >
                {key === 'BACK' ? <Delete className="w-5 h-5 group-hover:scale-110" /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
