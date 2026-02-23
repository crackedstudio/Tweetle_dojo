import { useEffect, useCallback } from 'react';
import type { TileState } from '../dojo/models';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const KEY_BG: Record<string, string> = {
  correct: 'bg-tile-correct border-tile-correct',
  present: 'bg-tile-present border-tile-present text-bg-primary',
  absent: 'bg-[rgba(12,141,138,0.15)] border-[rgba(12,141,138,0.1)]',
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
    <div className="flex flex-col gap-1 px-1">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1">
          {row.map((key) => {
            const state = keyStates[key];
            const hasState = state && state !== 'empty' && state !== 'filled';
            const isWide = key === 'ENTER' || key === 'BACK';
            const bgClass = hasState ? KEY_BG[state] : 'bg-tile-empty border-tile-border';

            return (
              <button
                key={key}
                onClick={() => {
                  if (key === 'ENTER') onSubmit();
                  else onKeyPress(key);
                }}
                disabled={disabled}
                className={`h-[46px] rounded-lg border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 ${bgClass} ${
                  isWide ? 'w-[60px] text-[10px] font-semibold' : 'w-[36px] text-[15px] font-bold'
                } ${hasState && state !== 'present' ? 'text-text-primary' : ''}`}
              >
                {key === 'BACK' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
