import React, { useEffect } from 'react';
import { PieceType, Position, GameState, Move, PlayerType, GamePhase } from '@/core/types';
import BoardCanvas from './BoardCanvas';

interface FullscreenBoardProps {
  board: PieceType[][];
  onPointClick: (position: Position) => void;
  highlightedPositions: Position[];
  selectedPosition: Position | null;
  lastMove: Move | null;
  gameState: GameState;
  onClose: () => void;
}

export const FullscreenBoard: React.FC<FullscreenBoardProps> = ({
  board,
  onPointClick,
  highlightedPositions,
  selectedPosition,
  lastMove,
  gameState,
  onClose,
}) => {
  // Prevent body scroll when fullscreen and cleanup on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determine current player info
  const isTigerTurn = gameState.currentPlayer === PlayerType.TIGER;
  const isGoatTurn = gameState.currentPlayer === PlayerType.GOAT;
  const isPlacementPhase = gameState.phase === GamePhase.PLACEMENT;

  return (
    <div
      className="fixed inset-0 z-50 fullscreen-overlay-enter"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen board view"
    >
      {/* Premium gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-md" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8 gap-6">

        {/* Top Info Bar - Current Player */}
        <div
          className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-5 w-full border border-white/20"
          style={{ maxWidth: 'min(85vw, 900px)' }}
        >
          <div className="flex items-center justify-between">
            {/* Current Turn Indicator */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-lg transform transition-all ${
                isTigerTurn
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 scale-110'
                  : 'bg-gray-100 scale-100 opacity-60'
              }`}>
                🐅
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {isTigerTurn ? 'Current Player' : 'Waiting'}
                </div>
                <div className={`text-lg font-bold ${isTigerTurn ? 'text-orange-600' : 'text-gray-400'}`}>
                  Tigers
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="hidden md:flex flex-col items-center px-6">
              <div className="text-2xl font-bold text-gray-300">VS</div>
              <div className="text-xs text-gray-400 mt-1">Turn {gameState.turnNumber}</div>
            </div>

            {/* Goat Player */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {isGoatTurn ? 'Current Player' : 'Waiting'}
                </div>
                <div className={`text-lg font-bold ${isGoatTurn ? 'text-green-600' : 'text-gray-400'}`}>
                  Goats
                </div>
              </div>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-lg transform transition-all ${
                isGoatTurn
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-110'
                  : 'bg-gray-100 scale-100 opacity-60'
              }`}>
                🐐
              </div>
            </div>

            {/* Exit Button - Mobile */}
            <button
              onClick={onClose}
              className="md:hidden absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900/80 text-white hover:bg-gray-900 transition-all flex items-center justify-center text-lg font-bold shadow-lg backdrop-blur-sm"
              aria-label="Exit fullscreen"
            >
              ✕
            </button>
          </div>

          {/* Game Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Phase</div>
              <div className="text-sm font-semibold text-gray-700">
                {isPlacementPhase ? '📍 Placement' : '♟️ Movement'}
              </div>
            </div>
            {isGoatTurn && isPlacementPhase && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Goats Left</div>
                <div className="text-sm font-semibold text-green-600">
                  {gameState.goatsToPlace} remaining
                </div>
              </div>
            )}
            {gameState.goatsCaptured > 0 && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Captured</div>
                <div className="text-sm font-semibold text-orange-600">
                  {gameState.goatsCaptured} / 5 goats
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Board container with premium styling */}
        <div
          className="fullscreen-board-enter relative"
          style={{
            width: 'min(80vh, 80vw, 850px)',
            maxWidth: '90vw',
          }}
        >
          {/* Board glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-3xl blur-2xl transform scale-105" />

          {/* Board shadow */}
          <div className="absolute inset-0 bg-white/5 rounded-3xl transform translate-y-2" />

          {/* Actual board */}
          <div className="relative bg-gradient-to-br from-white via-amber-50/50 to-orange-50/50 rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-white/30 backdrop-blur-sm">
            <BoardCanvas
              board={board}
              onPointClick={onPointClick}
              highlightedPositions={highlightedPositions}
              selectedPosition={selectedPosition}
              lastMove={lastMove}
            />
          </div>
        </div>

        {/* Exit Button - Desktop */}
        <button
          onClick={onClose}
          className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 transition-all shadow-lg backdrop-blur-sm border border-white/20 font-semibold"
          aria-label="Exit fullscreen (press ESC or F)"
        >
          <span>Exit Fullscreen</span>
          <span className="text-xs opacity-60">(ESC / F)</span>
        </button>

      </div>
    </div>
  );
};

export default FullscreenBoard;
