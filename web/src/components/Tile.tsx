import type { TileData, TileState } from '../dojo/models';

const TILE_STYLE: Record<TileState, string> = {
  empty: 'bg-tile-empty border-tile-border border-b-4',
  filled: 'bg-tile-empty border-tile-active-border border-2 border-b-6 tile-pop scale-105',
  correct: 'bg-tile-correct border-b-6 border-tile-correct/50 tile-flip',
  present: 'bg-tile-present border-b-6 border-tile-present/50 tile-flip',
  absent: 'bg-tile-absent border-b-6 border-tile-absent/50 tile-flip',
};

export function Tile({ tile, delay = 0 }: { tile: TileData; delay?: number }) {
  const isRevealed = ['correct', 'present', 'absent'].includes(tile.state);
  
  return (
    <div
      className={`
        w-[11vw] h-[11vw] max-w-[64px] max-h-[64px] flex items-center justify-center 
        rounded-xl lg:rounded-[1.25rem] transition-all duration-300 select-none
        ${TILE_STYLE[tile.state]}
      `}
      style={{ 
        animationDelay: isRevealed ? `${delay}ms` : '0ms'
      }}
    >
      {tile.letter && (
        <span 
          className="text-white font-display text-2xl lg:text-3xl drop-shadow-md uppercase"
        >
          {tile.letter}
        </span>
      )}
    </div>
  );
}
