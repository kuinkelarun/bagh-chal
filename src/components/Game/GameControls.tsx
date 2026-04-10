import React from 'react';
import { GameStatus } from '@/core/types';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onOpenRules: () => void;
  onToggleDiagonalTest?: () => void;
  canUndo: boolean;
  gameStatus: GameStatus;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onOpenRules,
  onToggleDiagonalTest,
  canUndo,
  gameStatus,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-3">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Game Controls</h3>

      {/* New Game Button */}
      <button
        onClick={onNewGame}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 active:scale-95 shadow-md"
      >
        🔄 New Game
      </button>

      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
          canUndo
            ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        ↩️ Undo Move
      </button>

      {/* Rules Button */}
      <button
        className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95"
        onClick={onOpenRules}
      >
        📖 How to Play
      </button>

      {/* Diagonal Test Button (Debug) */}
      {onToggleDiagonalTest && (
        <button
          className="w-full bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-200 transition-all text-sm"
          onClick={onToggleDiagonalTest}
        >
          🔍 Test Diagonals
        </button>
      )}

      {/* Game Stats */}
      <div className="text-xs text-gray-500 border-t pt-3 mt-3">
        <div className="flex justify-between mb-1">
          <span>Status:</span>
          <span className="font-semibold">
            {gameStatus === GameStatus.IN_PROGRESS
              ? 'In Progress'
              : gameStatus === GameStatus.TIGER_WIN
              ? 'Tigers Won'
              : 'Goats Won'}
          </span>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-gray-400 border-t pt-2 mt-2 space-y-1">
        <div className="font-semibold text-gray-500 mb-1">⌨️ Shortcuts:</div>
        <div className="grid grid-cols-2 gap-1">
          <span>Ctrl+Z</span>
          <span className="text-right">Undo</span>
          <span>Ctrl+N</span>
          <span className="text-right">New Game</span>
          <span>H</span>
          <span className="text-right">Rules</span>
          <span>Esc</span>
          <span className="text-right">Close</span>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
