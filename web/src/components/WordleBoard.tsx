import type { TileData } from '../dojo/models';
import { Tile } from './Tile';

interface WordleBoardProps {
  board: TileData[][];
}

export function WordleBoard({ board }: WordleBoardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1.5">
          {row.map((tile, colIdx) => (
            <Tile key={`${rowIdx}-${colIdx}`} tile={tile} />
          ))}
        </div>
      ))}
    </div>
  );
}
