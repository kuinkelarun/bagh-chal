import React from 'react';
import { Move, PlayerType } from '@/core/types';

interface MoveHistoryProps {
  moves: Move[];
  currentPlayer: PlayerType;
  onSelectMove?: (moveIndex: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, currentPlayer, onSelectMove }) => {
  /**
   * Convert move to readable notation
   */
  const moveToNotation = (move: Move, index: number): string => {
    const moveNumber = Math.floor(index / 2) + 1;
    const player = index % 2 === 0 ? '🐐' : '🐅';

    if (move.from === null) {
      // Placement move
      return `${player} → (${move.to.row},${move.to.col})`;
    } else if (move.captured) {
      // Capture move
      return `${player} (${move.from.row},${move.from.col}) ⚔️ (${move.to.row},${move.to.col})`;
    } else {
      // Regular move
      return `${player} (${move.from.row},${move.from.col}) → (${move.to.row},${move.to.col})`;
    }
  };

  if (moves.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-3">Move History</h3>
        <p className="text-sm text-gray-500 text-center py-4">
          No moves yet. Start playing!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">Move History</h3>
        <span className="text-xs text-gray-500">{moves.length} moves</span>
      </div>

      {/* Move list */}
      <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
        {moves.map((move, index) => {
          const isCapture = move.captured !== null;
          const isLastMove = index === moves.length - 1;

          return (
            <div
              key={index}
              onClick={() => onSelectMove?.(index)}
              className={`text-xs p-2 rounded transition-colors ${
                isLastMove
                  ? 'bg-blue-50 border-l-4 border-blue-500 font-semibold'
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${onSelectMove ? 'cursor-pointer' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-mono">
                  #{index + 1}
                </span>
                <span className={`flex-1 ml-2 ${isCapture ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                  {moveToNotation(move, index)}
                </span>
                {isCapture && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    Capture!
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <span>🐐 Goat</span>
          <span>•</span>
          <span>🐅 Tiger</span>
        </div>
        <div className="flex items-center gap-2">
          <span>→ Move</span>
          <span>•</span>
          <span>⚔️ Capture</span>
        </div>
      </div>
    </div>
  );
};

export default MoveHistory;
