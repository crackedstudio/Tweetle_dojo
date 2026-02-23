import type { TileData, TileState } from '../dojo/models';

const TILE_BG: Record<TileState, string> = {
  empty: 'bg-tile-empty',
  filled: 'bg-tile-empty',
  correct: 'bg-tile-correct',
  present: 'bg-tile-present',
  absent: 'bg-tile-absent',
};

const TILE_BORDER: Record<TileState, string> = {
  empty: 'border-tile-border',
  filled: 'border-tile-active-border border-2',
  correct: 'border-tile-correct',
  present: 'border-tile-present',
  absent: 'border-transparent',
};

export function Tile({ tile }: { tile: TileData }) {
  return (
    <div
      className={`w-[52px] h-[52px] flex items-center justify-center rounded border ${TILE_BG[tile.state]} ${TILE_BORDER[tile.state]} transition-colors`}
    >
      {tile.letter && (
        <span className="text-text-on-tile font-display text-xl">
          {tile.letter}
        </span>
      )}
    </div>
  );
}
