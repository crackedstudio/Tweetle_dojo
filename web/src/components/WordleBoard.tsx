import type { TileData } from '../dojo/models';
import { Tile } from './Tile';

interface WordleBoardProps {
  board: TileData[][];
}

export function WordleBoard({ board }: WordleBoardProps) {
  return (
    <div className="flex flex-col gap-1.5 lg:gap-3 p-3 lg:p-6 rounded-3xl lg:rounded-[3rem] bg-[#0A161A]/80 backdrop-blur-sm border border-white/8 shadow-2xl">
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1.5 lg:gap-3">
          {row.map((tile, colIdx) => (
            <Tile 
              key={`${rowIdx}-${colIdx}`} 
              tile={tile} 
              delay={colIdx * 120} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}
