import { useEffect, useCallback } from 'react';
import type { TileState } from '../dojo/models';
import { Delete } from 'lucide-react';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['BACK', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER'],
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
            const bgClass = hasState ? KEY_STYLE[state] : 'bg-bg-surface-light border-tile-border/40 text-text-primary';
            const isBack = key === 'BACK';
            const isEnter = key === 'ENTER';
            const isWide = isEnter || isBack;
            const customBg = isEnter ? 'bg-accent border-puffy-yellow-border text-secondary' : isBack ? 'bg-error border-red-900/40 text-white' : bgClass;

            return (
              <button
                key={key}
                onClick={() => {
                  if (key === 'ENTER') onSubmit();
                  else onKeyPress(key);
                }}
                disabled={disabled}
                className={`
                  h-[50px] lg:h-[64px] rounded-lg lg:rounded-2xl border-b-4 border-r-2 
                  flex items-center justify-center transition-all cursor-pointer 
                  disabled:opacity-50 active:border-b-0 active:border-r-0 
                  active:translate-y-1 active:translate-x-0.5 group 
                  ${customBg} 
                  ${isWide ? 'px-2 lg:px-6 text-[8px] lg:text-[10px] font-heading tracking-widest' : 'flex-1 max-w-[36px] lg:w-12 text-base lg:text-lg font-heading'}
                `}
              >
                {key === 'BACK' ? <Delete className="w-5 h-5" /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
