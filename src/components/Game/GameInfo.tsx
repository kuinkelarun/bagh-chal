import React from 'react';
import { GameState, GamePhase, PlayerType, GameStatus } from '@/core/types';

interface GameInfoProps {
  gameState: GameState;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  const {
    phase,
    currentPlayer,
    goatsRemaining,
    goatsCaptured,
    status,
    turnNumber,
  } = gameState;

  const getPhaseText = () => {
    if (phase === GamePhase.PLACEMENT) {
      return '📍 Placement Phase';
    }
    return '♟️ Movement Phase';
  };

  const getCurrentPlayerText = () => {
    if (status !== GameStatus.IN_PROGRESS) {
      return '';
    }
    return currentPlayer === PlayerType.TIGER ? '🐅 Tiger\'s Turn' : '🐐 Goat\'s Turn';
  };

  const getStatusText = () => {
    switch (status) {
      case GameStatus.TIGER_WIN:
        return '🏆 Tigers Win!';
      case GameStatus.GOAT_WIN:
        return '🏆 Goats Win!';
      case GameStatus.DRAW:
        return '🤝 Game Drawn!';
      default:
        return getCurrentPlayerText();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case GameStatus.TIGER_WIN:
        return 'bg-orange-500 text-white';
      case GameStatus.GOAT_WIN:
        return 'bg-green-500 text-white';
      case GameStatus.DRAW:
        return 'bg-amber-400 text-white';
      default:
        return currentPlayer === PlayerType.TIGER
          ? 'bg-orange-100 text-orange-800'
          : 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-4">
      {/* Game Status */}
      <div
        className={`text-center py-3 px-4 rounded-lg font-bold text-lg transition-colors ${getStatusColor()}`}
      >
        {getStatusText()}
      </div>

      {/* Phase Indicator */}
      <div className="text-center text-gray-700 font-semibold">
        {getPhaseText()}
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tigers Section */}
        <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
          <div className="text-center">
            <div className="text-3xl mb-2">🐅</div>
            <div className="font-bold text-orange-800">Tigers</div>
            <div className="text-sm text-gray-600 mt-2">
              Goats Captured
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {goatsCaptured} / 5
            </div>
          </div>
        </div>

        {/* Goats Section */}
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="text-center">
            <div className="text-3xl mb-2">🐐</div>
            <div className="font-bold text-green-800">Goats</div>
            {phase === GamePhase.PLACEMENT ? (
              <>
                <div className="text-sm text-gray-600 mt-2">
                  Remaining to Place
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {goatsRemaining}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-600 mt-2">
                  On Board
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {20 - goatsCaptured}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Turn Counter */}
      <div className="text-center text-sm text-gray-600">
        Turn: {turnNumber}
      </div>

      {/* Game Rules Reminder */}
      <div className="text-xs text-gray-500 border-t pt-3 mt-3">
        <div className="font-semibold mb-1">Win Conditions:</div>
        <div>🐅 Tigers: Capture 5 goats</div>
        <div>🐐 Goats: Block all tigers</div>
      </div>
    </div>
  );
};

export default GameInfo;
